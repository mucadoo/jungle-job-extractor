// Replace line breaks with spaces
function replaceLineBreaks(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.trim() + ' ';
    }
    let text = '';
    node.childNodes.forEach(child => {
        if (child.nodeName === 'LI') {
            text += "-";
        }
        text += replaceLineBreaks(child);
    });
    return text;
}

// Function to extract text while excluding "Voir plus" buttons and the first <h4>
function extractDesc(selector) {
    const element = document.querySelector(selector);
    if (!element) return '';

    // Clone the element to avoid modifying the original DOM
    const clone = element.cloneNode(true);

    // Remove the first <h4> (section title)
    const firstH4 = clone.querySelector('h4');
    if (firstH4) firstH4.remove();

    // Remove "Voir plus" button if it exists
    const voirPlusButton = clone.querySelector('[data-testid="view-more-btn"]');
    if (voirPlusButton) voirPlusButton.remove();

    return replaceLineBreaks(clone).trim();
}

function extractText() {

    // Get all script tags
    const scripts = document.getElementsByTagName("script");
    // Get the metadata block container
    const metadataBlock = document.querySelector('[data-testid="job-metadata-block"]');

    let extractedData = null;

    for (let script of scripts) {
        if (script.textContent.includes("window.__INITIAL_DATA__")) {
            // Extract the JSON string
            const match = script.textContent.match(/window\.__INITIAL_DATA__\s*=\s*"((?:\\.|[^"\\])*)"[\r\n]/);
            if (match) {
                jobData = JSON.parse(JSON.parse(`"${match[1]}"`)).queries[0].state.data;
                break;
            }
        }
    }

    const jobDetails = {};

    // Company name
    jobDetails.company = jobData?.organization?.name ||  metadataBlock.querySelector('a span').textContent.trim();

    // Job title
    jobDetails.title = jobData?.name || metadataBlock.querySelector('h2').textContent.trim();

    // Contract type
    jobDetails.contract = metadataBlock.querySelector('i[name="contract"]')?.parentElement.textContent.trim() || jobData?.contract_type;

    // Location
    jobDetails.location = metadataBlock.querySelector('i[name="location"]')?.parentElement.textContent.replace(/.*location/i, '').trim() || jobData?.office?.city;

    // Salary
    jobDetails.salary = metadataBlock.querySelector('i[name="salary"]')?.parentElement.textContent.replace(/.*Salaire :/i, '').trim() || `${jobData.salary_min} ${jobData.salary_currency || ''}`;

    // Start date
    jobDetails.startDate = jobData?.start_date || metadataBlock.querySelector('i[name="clock"]')?.parentElement.textContent.replace(/.*Début :/i, '').trim();

    // Remote work
    jobDetails.remote = metadataBlock.querySelector('i[name="remote"]')?.parentElement.textContent.replace(/.*remote :/i, '').trim() || jobData?.remote;

    // Experience
    jobDetails.experience = metadataBlock.querySelector('i[name="suitcase"]')?.parentElement.textContent.replace(/.*Expérience :/i, '').trim() || jobData?.experience_level;

    // Education
    jobDetails.education = metadataBlock.querySelector('i[name="education_level"]')?.parentElement.textContent.replace(/.*Éducation :/i, '').trim() || jobData?.education_level;

    // Extract skills by selecting elements that have a 'length' attribute,
    // which appears to be used on the skill items.
    jobDetails.skills = jobData?.tools?.length
        ? jobData.tools.map(tool => tool.name).join(', ')
        : Array.from(metadataBlock.querySelectorAll('div[variant="default"][length] span'))
            .map(el => el.textContent.trim())
            .join(', ');

    // Job description
    jobDetails.description = extractDesc('[data-testid="job-section-description"]') || jobData?.description;

    // Profile
    jobDetails.profile = extractDesc('[data-testid="job-section-experience"]') || jobData?.profile;

    // Recruitment process
    jobDetails.process = extractDesc('[data-testid="job-section-process"]') || jobData?.recruitment_process;

    // Construct the job details string
    let jobDetailsString = '';
    jobDetailsString += `Title: ${jobDetails.title}\n`;
    jobDetailsString += `Company: ${jobDetails.company}\n`;
    if (jobDetails.location) jobDetailsString += `Location: ${jobDetails.location}\n`;
    if (jobDetails.contract) jobDetailsString += `Contract Type: ${jobDetails.contract}\n`;
    if (jobDetails.salary) jobDetailsString += `Salary: ${jobDetails.salary}\n`;
    if (jobDetails.startDate) jobDetailsString += `Start Date: ${jobDetails.startDate}\n`;
    if (jobDetails.remote) jobDetailsString += `Remote: ${jobDetails.remote}\n`;
    if (jobDetails.experience) jobDetailsString += `Experience: ${jobDetails.experience}\n`;
    if (jobDetails.education) jobDetailsString += `Education: ${jobDetails.education}\n`;
    if (jobDetails.skills) jobDetailsString += `Required Skills: ${jobDetails.skills}\n`;
    if (jobDetails.description) jobDetailsString += `\nJob Description:\n${jobDetails.description}\n`;
    if (jobDetails.profile) jobDetailsString += `\nDesired Profile:\n${jobDetails.profile}\n`;
    if (jobDetails.process) jobDetailsString += `\nInterview Process:\n${jobDetails.process}\n`;

    return jobDetailsString.trim();
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// Function to show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        document.body.removeChild(toast);
    }, 3000);
}

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'executeScript') {
        const textToCopy = extractText();
        copyToClipboard(textToCopy);
        showToast('The job listing text has been copied to your clipboard!');
    } else if (request.type === 'showToast') {
        showToast(request.message);
    }
});