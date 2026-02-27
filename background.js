/**
 * background.js
 * ──────────────────────────────────────────────────────
 * Service Worker.
 * Handles Cross-script communication and Navigation logic.
 */

chrome.runtime.onInstalled.addListener(() => {
    // Initialize default state
    chrome.storage.local.set({
        botState: 'IDLE',
        botConfig: {
            keyword: '',
            connectLimit: 20,
            speedMode: 'normal'
        },
        botStats: {
            sentCount: 0,
            dailyCount: 0
        }
    });
    console.log("ConnectPilot Installed and Initialized.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'START_BOT') {
        handleStartBot(request.config);
    } else if (request.type === 'STOP_BOT') {
        handleStopBot();
    }
    return true; // async response if needed
});

async function handleStartBot(config) {
    // Save config
    await chrome.storage.local.set({
        botConfig: config,
        botState: 'RUNNING',
        botStats: { sentCount: 0, dailyCount: config.dailyCount || 0 } // reset session sent
    });

    // Construct search URL
    // We navigate to people search with the keyword
    const keywordEncoded = encodeURIComponent(config.keyword.trim());
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${keywordEncoded}&origin=CLUSTER_EXPANSION`;

    // Find active tab, or create new one
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;

    const currentTab = tabs[0];
    let waitTabId = currentTab.id;

    // If current tab is not LinkedIn search for keyword, navigate
    if (!currentTab.url.includes('linkedin.com') || !currentTab.url.includes(keywordEncoded)) {
        chrome.tabs.update(currentTab.id, { url: searchUrl });

        // Wait for page to load completely before sending message
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
            if (tabId === waitTabId && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                setTimeout(() => triggerContentScript(waitTabId), 2000); // give SPA time
            }
        });
    } else {
        // Already on the right page, just trigger instantly
        triggerContentScript(waitTabId);
    }
}

function handleStopBot() {
    chrome.storage.local.set({ botState: 'STOPPED' });

    // Inform active tab content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_AUTOMATION' });
        }
    });
}

function triggerContentScript(tabId) {
    chrome.tabs.sendMessage(tabId, { type: 'START_AUTOMATION' });
}
