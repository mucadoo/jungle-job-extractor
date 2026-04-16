import { extractTextFromDoc } from './extractor';

// --- UI Logic ---
function showToast(message: string): void {
    let toast = document.querySelector('.jje-toast') as HTMLElement;
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'jje-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyToClipboard(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// --- Message Listener ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'executeScript') {
        const text = extractTextFromDoc(document);
        if (text) {
            copyToClipboard(text);
            showToast('The job listing text has been copied to your clipboard!');
        } else {
            showToast('Error: Could not extract job data.');
        }
    } else if (request.type === 'showToast') {
        showToast(request.message);
    }
});
