// Existing code

try {
    chrome.runtime.sendMessage(message, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
        } else {
            console.log('Response:', response);
        }
    });
} catch (e) {
    console.error('Failed to send message:', e);
}

try {
    const data = await chrome.storage.sync.get(['key']);
    console.log('Data retrieved from storage:', data);
} catch (e) {
    console.error('Error accessing storage:', e);
}