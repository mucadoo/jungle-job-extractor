function isValidUrl(url: string | undefined): boolean {
    if (!url) return false;
    const pattern = /^https:\/\/www\.welcometothejungle\.com\/[\w-]+\/companies\/[\w-]+\/jobs\/.*$/;
    return pattern.test(url);
}

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id === undefined) return;

    if (isValidUrl(tab.url)) {
        try {
            // Attempt to send the message
            await chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
        } catch (error) {
            // If it fails, the content script likely isn't injected due to SPA navigation.
            // Let's inject it dynamically.
            try {
                await chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['src/content/style.css']
                });
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/content.js']
                });
                // Retry sending the message
                await chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
            } catch (injectError) {
                console.error("Failed to inject content scripts:", injectError);
            }
        }
    } else {
        // Content script isn't loaded here. Execute a minimal script for feedback.
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                alert("This extension only works on Welcome To The Jungle job listings.");
            }
        }).catch(err => console.error("Scripting error:", err));
    }
});
