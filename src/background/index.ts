function isValidUrl(url: string | undefined): boolean {
    if (!url) return false;
    const pattern = /^https:\/\/www\.welcometothejungle\.com\/[\w-]+\/companies\/[\w-]+\/jobs\/.*$/;
    return pattern.test(url);
}

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id === undefined) return;

    if (isValidUrl(tab.url)) {
        try {
            // Attempt to trigger the content script
            await chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
        } catch (error) {
            // If the content script is missing (due to SPA navigation routing), inject it manually
            try {
                await chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files:['src/content/style.css']
                });
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/content.js'] // Vite path mapping
                });
                // Try again after injection
                await chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
            } catch (injectError) {
                console.error("Failed to inject content scripts:", injectError);
            }
        }
    } else {
        // Fallback alert using injection when not on a WTTJ page (content script isn't available)
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                alert("This extension only works on Welcome To The Jungle job listings.");
            }
        }).catch(err => console.error("Scripting error:", err));
    }
});
