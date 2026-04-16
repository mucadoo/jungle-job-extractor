import { extractTextFromDoc, getPageLanguage, AppLanguage } from './extractor';

const toastMessages = {
    en: {
        success: 'Job listing text copied to clipboard!',
        errorCopy: 'Error: Failed to copy text. Check browser permissions.',
        errorExtract: 'Error: Could not extract job data.'
    },
    fr: {
        success: 'Texte de l\'offre copié dans le presse-papiers !',
        errorCopy: 'Erreur : Échec de la copie. Vérifiez les permissions du navigateur.',
        errorExtract: 'Erreur : Impossible d\'extraire les données de l\'offre.'
    },
    es: {
        success: '¡Texto de la oferta copiado al portapapeles!',
        errorCopy: 'Error: Fallo al copiar el texto. Verifica los permisos del navegador.',
        errorExtract: 'Error: No se pudieron extraer los datos de la oferta.'
    }
};

let toastTimeout: ReturnType<typeof setTimeout>;
let shadowRoot: ShadowRoot | null = null;

function getShadowRoot(): ShadowRoot {
    if (shadowRoot) return shadowRoot;

    const host = document.createElement('div');
    host.id = 'jje-extension-host';
    document.body.appendChild(host);
    shadowRoot = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
        .jje-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 2147483647;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 80vw;
        }
        .jje-toast.show {
            opacity: 1;
            visibility: visible;
        }
    `;
    shadowRoot.appendChild(style);
    return shadowRoot;
}

function showToast(message: string): void {
    const root = getShadowRoot();
    let toast = root.querySelector('.jje-toast') as HTMLElement;
    
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'jje-toast';
        root.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add('show');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast?.classList.remove('show'), 3000);
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Modern clipboard API failed:', err);
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (fallbackErr) {
            console.error('Fallback copy failed:', fallbackErr);
            return false;
        }
    }
}

// --- Message Listener ---
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const lang: AppLanguage = getPageLanguage(document);
    const msgs = toastMessages[lang];

    if (request.type === 'executeScript') {
        const text = extractTextFromDoc(document);
        if (text) {
            const success = await copyToClipboard(text);
            if (success) {
                showToast(msgs.success);
            } else {
                showToast(msgs.errorCopy);
            }
        } else {
            showToast(msgs.errorExtract);
        }
    } else if (request.type === 'showToast') {
        showToast(request.message);
    }
});
