/**
 * content.js
 * ──────────────────────────────────────────────────────
 * Main DOM extraction and automation loops for LinkedIn.
 * Runs in the context of the LinkedIn page.
 */

class ConnectionEngine {
    constructor() {
        this.buttonsQueue = [];
        this.processedUrls = new Set();
    }

    /**
     * Main automation loop.
     */
    async start() {
        window.AutomationController.log("Bot started. Scanning profiles...", "info");

        let emptyRetries = 0;

        while (window.AutomationController.isRunning()) {
            // 1. Check limit
            if (window.AutomationController.checkLimitReached()) {
                chrome.runtime.sendMessage({ type: "STOP_BOT" });
                break;
            }

            window.AutomationController.log("Scanning page for connection buttons...", "info");

            // 2. Scan visible buttons
            this.scanForButtons();

            if (this.buttonsQueue.length === 0) {
                // Scroll if no buttons found
                window.AutomationController.log("No valid Connect buttons found. Scrolling down...", "info");
                chrome.runtime.sendMessage({ type: "ACTION_UPDATE", payload: "Scrolling to load profiles" });
                await window.ScrollEngine.autoScroll(5000);

                // Wait a bit for React/LinkedIn to render
                await window.DelayManager.wait(2000);

                this.scanForButtons();

                // If still no buttons, handle retry or pagination
                if (this.buttonsQueue.length === 0) {
                    emptyRetries++;
                    if (emptyRetries >= 2) {
                        // Attempt pagination
                        const nextBtn = document.querySelector('button[aria-label="Next"]');
                        if (nextBtn && !nextBtn.disabled) {
                            window.AutomationController.log("Exhausted current page. Moving to next page...", "info");
                            chrome.runtime.sendMessage({ type: "ACTION_UPDATE", payload: "Navigating to next page" });
                            nextBtn.click();
                            emptyRetries = 0; // reset
                            await window.DelayManager.wait(5000); // Wait for next page to load
                            continue;
                        } else {
                            window.AutomationController.log("No more profiles or 'Next' disabled. Stopping bot.", "error");
                            chrome.runtime.sendMessage({ type: "STOP_BOT" });
                            break;
                        }
                    } else {
                        window.AutomationController.log("Still loading / No connect buttons found. Retrying...", "warning");
                        await window.DelayManager.wait(3000);
                        continue;
                    }
                } else {
                    emptyRetries = 0; // Reset as we found buttons
                }
            }

            // 3. We have buttons, process the first one safely
            const btnObj = this.buttonsQueue.shift();
            const success = await this.sendConnection(btnObj);

            if (!window.AutomationController.isRunning()) break;

            if (success) {
                // Successfully clicked, now wait human delay
                const mode = window.AutomationController.config.speedMode;
                const msg = `Sent. Waiting ${window.DelayManager.getModeRange(mode)} for next request...`;
                window.AutomationController.log(msg, "success");
                chrome.runtime.sendMessage({ type: "ACTION_UPDATE", payload: "Waiting..." });

                await window.DelayManager.waitForMode(mode);
            } else {
                // Failed or already pending/connected. Just wait jitter and continue
                await window.DelayManager.waitJitter();
            }
        }
    }

    /**
     * Scans DOM for connect buttons and queues them.
     */
    scanForButtons() {
        // LinkedIn often changes selectors. aria-label starting with Connect is robust
        // We search for elements with aria-label containing "Connect" or text "Connect".
        const potentialButtons = document.querySelectorAll('button[aria-label^="Invite"], button[aria-label*="Connect"]');

        // Fallback simple search
        const allButtons = Array.from(document.querySelectorAll('button')).filter(b =>
            b.innerText.trim() === 'Connect'
        );

        const merged = Array.from(new Set([...potentialButtons, ...allButtons]));

        let added = 0;
        for (const btn of merged) {
            // Avoid invisible buttons
            if (btn.offsetWidth === 0 || btn.offsetHeight === 0) continue;

            // Ensure button isn't disabled
            if (btn.disabled) continue;

            // Extract raw element identifier (closest link ancestor for uniqueness)
            const container = btn.closest('li, .reusable-search__result-container');
            const link = container ? container.querySelector('a.app-aware-link') : null;
            const profileUrl = link ? link.href : btn.getAttribute('aria-label');

            if (this.processedUrls.has(profileUrl)) continue; // skip already processed

            this.buttonsQueue.push({ btn, profileUrl });
            this.processedUrls.add(profileUrl);
            added++;
        }

        if (added > 0) {
            window.AutomationController.log(`Discovered ${added} new connect handles.`, "info");
        }
    }

    /**
     * Handles clicking the connect button and confirming modal.
     */
    async sendConnection(btnObj) {
        if (!btnObj.btn || !document.body.contains(btnObj.btn)) {
            return false; // Element detached
        }

        chrome.runtime.sendMessage({ type: "ACTION_UPDATE", payload: "Sending Connection Request" });

        // Simulate hover/focus
        btnObj.btn.focus();
        await window.DelayManager.wait(300);

        // Click Connect
        btnObj.btn.click();
        await window.DelayManager.waitModalDelay();

        // Look for confirmation modal (Send without note, or simple Send)
        // Often there is a "Send without a note" or "Send" button in a dialog
        const modBtn1 = document.querySelector('button[aria-label="Send now"]'); // Sometimes it's this
        const modBtn2 = document.querySelector('button[aria-label="Send without a note"]');
        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const txt = b.innerText.trim();
            return (txt === 'Send' || txt === 'Send now' || txt === 'Send without a note') && !b.disabled;
        });

        const finalBtn = modBtn1 || modBtn2 || sendBtn;

        // Optional: detect Email requirement modal, then abort
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        if (emailInput && document.querySelector('.artdeco-modal')) {
            window.AutomationController.log("Email required to connect. Skipping profile.", "warning");
            const closeBtn = document.querySelector('button[aria-label="Dismiss"]');
            if (closeBtn) closeBtn.click();
            await window.DelayManager.waitModalDelay();
            return false;
        }

        if (finalBtn) {
            finalBtn.click();
            await window.DelayManager.waitModalDelay();

            // Update stats
            await window.AutomationController.incrementSent();
            return true;
        } else {
            // Note: sometimes it's direct connect without modal (rare now). Or the button opened a dropdown.
            // E.g., if it was a "Pending" button incorrectly grabbed.
            window.AutomationController.log("No confirmation modal detected, or direct connect occurred.", "warning");
        }

        return false;
    }
}

// ----------------------------------------------------
// Listener for messages from Background/Popup
// ----------------------------------------------------
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "START_AUTOMATION") {
        await window.AutomationController.init();
        await window.AutomationController.updateState(window.BotState.RUNNING);

        // Start Engine
        const engine = new ConnectionEngine();
        engine.start();
    }

    if (request.type === "STOP_AUTOMATION") {
        await window.AutomationController.init();
        await window.AutomationController.updateState(window.BotState.STOPPED);
        chrome.runtime.sendMessage({ type: "ACTION_UPDATE", payload: "Stopped" });
        window.AutomationController.log("Bot force stopped by user.", "warning");
    }

    // Necessary to indicate async response optionally
    sendResponse({ received: true });
});
