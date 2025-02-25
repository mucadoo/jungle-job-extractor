document.getElementById('extractButton').addEventListener('click', () => {
    chrome.tabs.executeScript({
        file: 'contentScript.js'
    });
});
