// background.js

// Proper listener for chrome.tabs.onUpdated event
const onUpdatedListener = (tabId, changeInfo, tab) => {
    // Check if the tab is completely loaded before proceeding
    if (changeInfo.status === 'complete') {
        // Fallback to timeout for cleanup
        const timeout = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(onUpdatedListener);
            console.log('Listener cleanup executed');
        }, 5000); // Cleanup after 5 seconds

        // Messaging with error handling
        chrome.tabs.sendMessage(tabId, {action: 'someAction'}, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
            } else {
                console.log('Message sent successfully:', response);
            }
        });
    }
};

// Registering the listener
chrome.tabs.onUpdated.addListener(onUpdatedListener);

// Handle cleanup on unload
window.addEventListener('unload', () => {
    chrome.tabs.onUpdated.removeListener(onUpdatedListener);
});
