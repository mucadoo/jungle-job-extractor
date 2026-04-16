import { extractTextFromDoc } from './extractor';

// --- UI Logic ---
let toastTimeout: ReturnType<typeof setTimeout>;

function showToast(message: string): void {
    let toast = document.querySelector('.jje-toast') as HTMLElement;
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'jje-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy text using navigator.clipboard: ', err);
        // Fallback for older environments or permissions issues
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy'); // Deprecated, but useful as a fallback
        document.body.removeChild(textarea);
    }
}

// --- Message Listener ---
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => { // Made async
    if (request.type === 'executeScript') {
        const text = extractTextFromDoc(document);
        if (text) {
            await copyToClipboard(text); // Await the async function
            showToast('The job listing text has been copied to your clipboard!');
        } else {
            showToast('Error: Could not extract job data.');
        }
    } else if (request.type === 'showToast') {
        showToast(request.message);
    }
});
