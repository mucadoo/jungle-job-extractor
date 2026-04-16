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
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (msg: string) => {
                alert(msg);
            },
            args: ['Current page isn\'t a job listing on Welcome To The Jungle.']
        }).catch(err => console.error("Could not execute script", err));
    }
});
