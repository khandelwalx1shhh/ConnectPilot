/**
 * scrollEngine.js
 * ──────────────────────────────────────────────────────
 * Handles automatic scrolling with human-like behavior.
 */

const ScrollEngine = {
    /**
     * Scrolls the page down by a random increment.
     * Modifies the scroll position rather than instantly jumping.
     */
    async step() {
        return new Promise(resolve => {
            // Get current scroll position
            const currentScroll = window.scrollY;

            // Calculate a random scroll distance between 300 and 700 pixels
            const scrollDistance = window.DelayManager.random(300, 700);

            // Destination position
            const targetScroll = currentScroll + scrollDistance;

            // Scroll smoothly
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });

            // Wait for the scroll animation to complete, plus a human pause
            setTimeout(() => {
                resolve(window.scrollY);
            }, window.DelayManager.random(1000, 2000));
        });
    },

    /**
     * Checks if we have reached the absolute bottom of the page.
     */
    isAtBottom() {
        return (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
    },

    /**
     * Scroll until we hit the bottom, OR until we find a set number of Connect buttons.
     * But we don't necessarily have to loop infinitely here. The main automation loop will call this.
     */
    async autoScroll(durationLimit = 15000) {
        const startTime = Date.now();
        let lastScroll = window.scrollY;

        while (Date.now() - startTime < durationLimit && !this.isAtBottom()) {
            await this.step();

            // Check if scroll actually moved (prevent getting stuck)
            if (Math.abs(window.scrollY - lastScroll) < 10) {
                break; // Stuck or at bottom
            }
            lastScroll = window.scrollY;

            // Rest like a human
            await window.DelayManager.waitScrollPause();
        }
    }
};

if (typeof window !== 'undefined') {
    window.ScrollEngine = ScrollEngine;
}
