function isValidUrl(url: string | undefined): boolean {
    if (!url) return false;
    const pattern = /^https:\/\/www\.welcometothejungle\.com\/[\w-]+\/companies\/[\w-]+\/jobs\/.*$/;
    return pattern.test(url);
}

chrome.action.onClicked.addListener((tab) => {
    if (isValidUrl(tab.url)) {
        if (tab.id !== undefined) {
            chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
        }
    } else if (tab.id !== undefined) {
        // Send a message to the content script to show a toast instead of using alert()
        chrome.tabs.sendMessage(tab.id, { 
            type: 'showToast', 
            message: 'Current page isn\'t a job listing on Welcome To The Jungle.' 
        }).catch(() => {
            // If the content script is not loaded (e.g. on a non-WTTJ page), we can't show the toast.
            // In a real scenario, you might want to inject the content script here.
            console.warn("Content script not loaded on this page.");
        });
    }
});
