/**
 * automationController.js
 * ──────────────────────────────────────────────────────
 * Coordinates the states and acts as the central brain of the content script logic.
 */

// Define Bot States
const BotState = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    STOPPED: 'STOPPED',
    LIMIT_REACHED: 'LIMIT_REACHED'
};

const AutomationController = {
    state: BotState.IDLE,
    config: {
        keyword: '',
        connectLimit: 20,
        speedMode: 'normal'
    },
    stats: {
        sentCount: 0,
        dailyCount: 0
    },

    async init() {
        // Load state from storage
        const data = await chrome.storage.local.get(['botState', 'botConfig', 'botStats']);
        if (data.botState) this.state = data.botState;
        if (data.botConfig) this.config = Object.assign(this.config, data.botConfig);
        if (data.botStats) this.stats = Object.assign(this.stats, data.botStats);
    },

    async updateState(newState) {
        this.state = newState;
        await chrome.storage.local.set({ botState: this.state });
        this.notifyUI();
    },

    async incrementSent() {
        this.stats.sentCount++;
        this.stats.dailyCount++;
        await chrome.storage.local.set({ botStats: this.stats });
        this.notifyUI();
    },

    notifyUI() {
        chrome.runtime.sendMessage({
            type: 'STATUS_UPDATE',
            payload: {
                state: this.state,
                stats: this.stats,
                config: this.config
            }
        });
    },

    log(message, type = 'info') {
        console.log(`[ConnectPilot] ${message}`);
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" });
        chrome.runtime.sendMessage({
            type: 'LOG_MESSAGE',
            payload: { msg: message, type, time }
        });
    },

    isRunning() {
        return this.state === BotState.RUNNING;
    },

    checkLimitReached() {
        if (this.stats.sentCount >= this.config.connectLimit) {
            this.updateState(BotState.LIMIT_REACHED);
            this.log(`Target connection limit (${this.config.connectLimit}) reached. Stopping.`, 'success');
            return true;
        }
        return false;
    }
};

if (typeof window !== 'undefined') {
    window.BotState = BotState;
    window.AutomationController = AutomationController;
}
