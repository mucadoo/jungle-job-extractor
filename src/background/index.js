function isValidUrl(url) {
    const pattern = /^https:\/\/www\.welcometothejungle\.com\/[\w-]+\/companies\/[\w-]+\/jobs\/.*$/;
    return pattern.test(url);
}

function showToast(tabId, message) {
    chrome.tabs.sendMessage(tabId, { type: 'showToast', message: message });
}

chrome.action.onClicked.addListener((tab) => {
    if (isValidUrl(tab.url)) {
        chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
    } else {
        // Note: For showToast to work, content script must be injected.
        // On a non-matching page, it might not be.
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (msg) => {
                alert(msg);
            },
            args: ['Current page isn\'t a job listing on Welcome To The Jungle.']
        }).catch(err => console.error("Could not execute script", err));
    }
});
