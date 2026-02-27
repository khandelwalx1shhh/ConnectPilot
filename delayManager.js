/**
 * delayManager.js
 * ──────────────────────────────────────────────────────
 * Manages all timing/delay logic for human-like behavior.
 * Provides randomized delays per speed mode.
 */

const DelayManager = {
  // Delay ranges in milliseconds per speed mode
  MODES: {
    safe: { min: 40000, max: 80000 },   // 40–80 seconds
    normal: { min: 25000, max: 50000 },   // 25–50 seconds
    fast: { min: 15000, max: 30000 },   // 15–30 seconds
    ultrafast: { min: 3000, max: 10000 }  // 3–10 seconds
  },

  // Short jitter between micro-actions (ms)
  JITTER: { min: 500, max: 2500 },

  // Scroll pause between each scroll step (ms)
  SCROLL_PAUSE: { min: 3000, max: 7000 },

  // Delay before clicking confirm on modal (ms)
  MODAL_DELAY: { min: 800, max: 2000 },

  /**
   * Returns a random integer between min and max (inclusive).
   */
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Returns a Promise that resolves after a random delay for the given mode.
   */
  waitForMode(mode) {
    const range = this.MODES[mode] || this.MODES.normal;
    const delay = this.random(range.min, range.max);
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Returns a short jitter delay Promise.
   */
  waitJitter() {
    const delay = this.random(this.JITTER.min, this.JITTER.max);
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Returns a scroll pause delay Promise.
   */
  waitScrollPause() {
    const delay = this.random(this.SCROLL_PAUSE.min, this.SCROLL_PAUSE.max);
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Returns a modal interaction delay Promise.
   */
  waitModalDelay() {
    const delay = this.random(this.MODAL_DELAY.min, this.MODAL_DELAY.max);
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Fixed wait utility (ms).
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Returns human-readable description of mode delay range.
   */
  getModeDescription(mode) {
    const descriptions = {
      safe: '🛡️ Safe mode: 40–80s between requests',
      normal: '⚡ Normal mode: 25–50s between requests',
      fast: '🚀 Fast mode: 15–30s between requests',
      ultrafast: '⚡⚡ Ultra Fast mode: 3–10s between requests'
    };
    return descriptions[mode] || descriptions.normal;
  },

  /**
   * Returns the delay range in seconds as a string.
   */
  getModeRange(mode) {
    const ranges = {
      safe: '40–80s',
      normal: '25–50s',
      fast: '15–30s',
      ultrafast: '3–10s'
    };
    return ranges[mode] || ranges.normal;
  }
};

// Export for use in content.js (IIFE-scoped via window)
if (typeof window !== 'undefined') {
  window.DelayManager = DelayManager;
}
