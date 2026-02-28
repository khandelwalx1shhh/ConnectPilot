// Function to sanitize HTML input
function sanitizeHTML(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Log message function with XSS mitigation
function logMessage(message) {
    const safeMessage = sanitizeHTML(message);
    const logContainer = document.getElementById('log'); // Assuming there is a log element in the DOM
    // Use textContent to avoid XSS
    const newLogItem = document.createElement('div');
    newLogItem.textContent = safeMessage;
    logContainer.appendChild(newLogItem);
}