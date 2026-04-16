import { JobData, JobDetails } from '../types';

// --- Extractor Logic ---
function replaceLineBreaks(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim() + ' ' || '';
    }
    let text = '';
    node.childNodes.forEach(child => {
        if (child.nodeName === 'LI') text += "-";
        text += replaceLineBreaks(child);
    });
    return text;
}

function extractDesc(selector: string): string {
    const element = document.querySelector(selector);
    if (!element) return '';
    const clone = element.cloneNode(true) as HTMLElement;
    const firstH4 = clone.querySelector('h4');
    if (firstH4) firstH4.remove();
    const voirPlusButton = clone.querySelector('[data-testid="view-more-btn"]');
    if (voirPlusButton) voirPlusButton.remove();
    return replaceLineBreaks(clone).trim();
}

function extractText(): string {
    const scripts = document.getElementsByTagName("script");
    const metadataBlock = document.querySelector('[data-testid="job-metadata-block"]');
    let jobData: JobData | null = null;

    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.textContent?.includes("window.__INITIAL_DATA__")) {
            const match = script.textContent.match(/window\.__INITIAL_DATA__\s*=\s*"((?:\\.|[^"\\])*)"[\r\n]/);
            if (match) {
                try {
                    jobData = JSON.parse(JSON.parse(`"${match[1]}"`)).queries[0].state.data;
                } catch (e) {
                    console.error("Failed to parse INITIAL_DATA", e);
                }
                break;
            }
        }
    }

    const jobDetails: JobDetails = {
        title: jobData?.name || metadataBlock?.querySelector('h2')?.textContent?.trim(),
        company: jobData?.organization?.name || metadataBlock?.querySelector('a span')?.textContent?.trim(),
        location: (metadataBlock?.querySelector('i[name="location"]')?.parentElement?.textContent?.replace(/.*location/i, '').trim()) || jobData?.office?.city,
        contract: (metadataBlock?.querySelector('i[name="contract"]')?.parentElement?.textContent?.trim()) || jobData?.contract_type,
        salary: (metadataBlock?.querySelector('i[name="salary"]')?.parentElement?.textContent?.replace(/.*Salaire :/i, '').trim()) || (jobData?.salary_min ? `${jobData.salary_min} ${jobData.salary_currency || ''}` : undefined),
        startDate: (metadataBlock?.querySelector('i[name="clock"]')?.parentElement?.textContent?.replace(/.*Début :/i, '').trim()) || jobData?.start_date,
        remote: (metadataBlock?.querySelector('i[name="remote"]')?.parentElement?.textContent?.replace(/.*remote :/i, '').trim()) || jobData?.remote,
        experience: (metadataBlock?.querySelector('i[name="suitcase"]')?.parentElement?.textContent?.replace(/.*Expérience :/i, '').trim()) || jobData?.experience_level,
        education: (metadataBlock?.querySelector('i[name="education_level"]')?.parentElement?.textContent?.replace(/.*Éducation :/i, '').trim()) || jobData?.education_level,
        skills: jobData?.tools?.length 
            ? jobData.tools.map(tool => tool.name).join(', ') 
            : Array.from(metadataBlock?.querySelectorAll('div[variant="default"][length] span') || []).map(el => el.textContent?.trim()).join(', '),
        description: extractDesc('[data-testid="job-section-description"]') || jobData?.description,
        profile: extractDesc('[data-testid="job-section-experience"]') || jobData?.profile,
        process: extractDesc('[data-testid="job-section-process"]') || jobData?.recruitment_process
    };

    let res = '';
    if (jobDetails.title) res += `Title: ${jobDetails.title}\n`;
    if (jobDetails.company) res += `Company: ${jobDetails.company}\n`;
    if (jobDetails.location) res += `Location: ${jobDetails.location}\n`;
    if (jobDetails.contract) res += `Contract Type: ${jobDetails.contract}\n`;
    if (jobDetails.salary) res += `Salary: ${jobDetails.salary}\n`;
    if (jobDetails.startDate) res += `Start Date: ${jobDetails.startDate}\n`;
    if (jobDetails.remote) res += `Remote: ${jobDetails.remote}\n`;
    if (jobDetails.experience) res += `Experience: ${jobDetails.experience}\n`;
    if (jobDetails.education) res += `Education: ${jobDetails.education}\n`;
    if (jobDetails.skills) res += `Required Skills: ${jobDetails.skills}\n`;
    if (jobDetails.description) res += `\nJob Description:\n${jobDetails.description}\n`;
    if (jobDetails.profile) res += `\nDesired Profile:\n${jobDetails.profile}\n`;
    if (jobDetails.process) res += `\nInterview Process:\n${jobDetails.process}\n`;
    return res.trim();
}

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
        const text = extractText();
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
