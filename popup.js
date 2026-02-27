/**
 * popup.js
 * ──────────────────────────────────────────────────────
 * Binds UI inputs, communicates with background to control execution.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const elKeyword = document.getElementById('keywordInput');
    const elLimit = document.getElementById('connectLimit');
    const elSpeed = document.getElementById('speedMode');
    const elStartBtn = document.getElementById('startBtn');
    const elStopBtn = document.getElementById('stopBtn');

    const elSentCount = document.getElementById('sentCount');
    const elTargetCount = document.getElementById('targetCount');
    const elDailyCount = document.getElementById('dailyCount');

    const elProgressBar = document.getElementById('progressBar');
    const elProgressLabel = document.getElementById('progressLabel');
    const elStatusBadge = document.getElementById('statusBadge');

    const elActionIcon = document.getElementById('actionIcon');
    const elActionText = document.getElementById('actionText');
    const elActivityLog = document.getElementById('activityLog');
    const elClearLogBtn = document.getElementById('clearLogBtn');

    const elConfigPanel = document.getElementById('configPanel');

    // Load state and populate UI
    const { botState, botConfig, botStats } = await chrome.storage.local.get(['botState', 'botConfig', 'botStats']);

    if (botConfig) {
        if (botConfig.keyword) elKeyword.value = botConfig.keyword;
        if (botConfig.connectLimit) elLimit.value = botConfig.connectLimit;
        if (botConfig.speedMode) elSpeed.value = botConfig.speedMode;
    }

    // Set visual mode dot
    updateSpeedInfo(elSpeed.value);
    elSpeed.addEventListener('change', (e) => updateSpeedInfo(e.target.value));

    // Initialize UI stats
    updateUIStats(botState || 'IDLE', botStats || { sentCount: 0, dailyCount: 0 }, botConfig || { connectLimit: 20 });

    // START BUTTON
    elStartBtn.addEventListener('click', () => {
        const keyword = elKeyword.value.trim();
        const limit = parseInt(elLimit.value, 10);
        const speed = elSpeed.value;

        if (!keyword) {
            alert("Please enter a search keyword.");
            return;
        }
        if (isNaN(limit) || limit < 1) {
            alert("Please enter a valid connection limit.");
            return;
        }

        const config = { keyword, connectLimit: limit, speedMode: speed };

        // Update local config instantly for UX
        chrome.storage.local.set({ botConfig: config });

        chrome.runtime.sendMessage({
            type: "START_BOT",
            config: config
        });

        logMessage(`Starting bot for "${keyword}". Target: ${limit}.`, 'system');
        updateActionDisplay("navigating", "Navigating to LinkedIn Search...");
        elStartBtn.disabled = true;
        elStopBtn.disabled = false;
        elLimit.disabled = true;
        elSpeed.disabled = true;
        elKeyword.disabled = true;
    });

    // STOP BUTTON
    elStopBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: "STOP_BOT" });
        logMessage("User requested to stop.", "system");
    });

    // CLEAR LOG
    elClearLogBtn.addEventListener('click', () => {
        elActivityLog.innerHTML = "";
    });

    // MESSAGE LISTENER
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === "STATUS_UPDATE") {
            updateUIStats(msg.payload.state, msg.payload.stats, msg.payload.config);
        }
        else if (msg.type === "LOG_MESSAGE") {
            logMessage(msg.payload.msg, msg.payload.type, msg.payload.time);
        }
        else if (msg.type === "ACTION_UPDATE") {
            updateActionDisplay(msg.payload.toLowerCase(), msg.payload);
        }
    });

    // UI Helpers
    function updateSpeedInfo(mode) {
        const dot = document.querySelector('.speed-dot');
        dot.className = `speed-dot ${mode}`;
        const txts = {
            safe: 'Safe mode: 40–80s between requests',
            normal: 'Normal mode: 25–50s between requests',
            fast: 'Fast mode: 15–30s between requests',
            ultrafast: 'Ultra Fast mode: 3–10s between requests'
        };
        document.getElementById('speedInfoText').innerText = txts[mode];
    }

    function updateUIStats(state, stats, config) {
        elSentCount.innerText = stats.sentCount || 0;
        elDailyCount.innerText = stats.dailyCount || 0;
        elTargetCount.innerText = config.connectLimit || "—";

        let cLimit = parseInt(config.connectLimit, 10) || 1;
        let sCount = parseInt(stats.sentCount, 10) || 0;
        let perc = Math.min(Math.floor((sCount / cLimit) * 100), 100);

        elProgressBar.style.width = `${perc}%`;
        elProgressLabel.innerText = `${perc}%`;

        elStatusBadge.innerText = state;
        elStatusBadge.className = `status-badge ${state.toLowerCase()}`;

        if (state === 'RUNNING') {
            elStartBtn.disabled = true;
            elStopBtn.disabled = false;
            elKeyword.disabled = true;
            elLimit.disabled = true;
            elSpeed.disabled = true;
        } else {
            elStartBtn.disabled = false;
            elStopBtn.disabled = true;
            elKeyword.disabled = false;
            elLimit.disabled = false;
            elSpeed.disabled = false;
            updateActionDisplay("idle", "Ready to start");
        }
    }

    function updateActionDisplay(actionKey, label) {
        elActionText.innerText = label;
        if (actionKey.includes("wait") || actionKey.includes("delay") || actionKey.includes("paus")) {
            elActionIcon.innerText = "⏳";
        } else if (actionKey.includes("scroll") || actionKey.includes("load")) {
            elActionIcon.innerText = "🔄";
        } else if (actionKey.includes("send") || actionKey.includes("connect")) {
            elActionIcon.innerText = "▶️";
        } else if (actionKey.includes("navigat")) {
            elActionIcon.innerText = "🧭";
        } else {
            elActionIcon.innerText = "💤";
        }
    }

    function logMessage(text, type = 'info', timeStr) {
        if (!timeStr) {
            timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric' });
        }
        const html = `
      <div class="log-entry ${type}">
        <span class="log-time">${timeStr}</span>
        <span class="log-msg">${text}</span>
      </div>
    `;
        elActivityLog.insertAdjacentHTML('beforeend', html);
        // Auto scroll bottom
        elActivityLog.scrollTop = elActivityLog.scrollHeight;
    }
});
