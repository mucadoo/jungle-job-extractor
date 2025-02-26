function isValidUrl(url) {
    const pattern = /^https:\/\/www\.welcometothejungle\.com\/[\w-]+\/companies\/[\w-]+\/jobs\/.*$/;
    return pattern.test(url);
}

function showToast(tabId, message) {
    chrome.tabs.sendMessage(tabId, { type: 'showToast', message: message });
}

chrome.browserAction.onClicked.addListener((tab) => {
    if (isValidUrl(tab.url)) {
        chrome.tabs.sendMessage(tab.id, { type: 'executeScript' });
    } else {
        showToast(tab.id, 'Current page isn\'t a job listing on Welcome To The Jungle.');
    }
});
