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

    return clone.innerText || clone.textContent;
}

function extractText() {
    const jobDetails = {};

    // Extract company name
    const companyElement = document.querySelector('[data-testid="job-metadata-block"] a.sc-fremEr span.wui-text');
    jobDetails.company = companyElement ? companyElement.textContent.trim() : 'N/A';

    // Extract job title
    const titleElement = document.querySelector('[data-testid="job-metadata-block"] h2');
    jobDetails.title = titleElement ? titleElement.textContent.trim() : 'N/A';

    // Extract contract type, location, salary, start date, remote work, experience, education
    const metadataElements = document.querySelectorAll('[data-testid="job-metadata-block"] .sc-eXsaLi');
    metadataElements.forEach(element => {
        if (element.querySelector('[name="contract"]')) {
            jobDetails.contract = element.textContent.trim();
        } else if (element.querySelector('[name="location"]')) {
            jobDetails.location = element.textContent.replace(/.*location/i, '').trim();
        } else if (element.querySelector('[name="salary"]')) {
            jobDetails.salary = element.textContent.replace(/.*Salaire :/i, '').trim();
        } else if (element.querySelector('[name="clock"]')) {
            jobDetails.startDate = element.textContent.replace(/.*Début :/i, '').trim();
        } else if (element.querySelector('[name="remote"]')) {
            jobDetails.remote = element.textContent.replace(/.*remote :/i, '').trim();
        } else if (element.querySelector('[name="suitcase"]')) {
            jobDetails.experience = element.textContent.replace(/.*Expérience :/i, '').trim();
        } else if (element.querySelector('[name="education_level"]')) {
            jobDetails.education = element.textContent.replace(/.*Éducation :/i, '').trim();
        }
    });

    // Extract skills
    const skillsElements = document.querySelectorAll('[data-testid="job-metadata-block"] .sc-eXsaLi.bLFFgm span');
    jobDetails.skills = Array.from(skillsElements).map(el => el.textContent.trim()).join(', ');

    // Extract job description
    jobDetails.description = extractDesc('[data-testid="job-section-description"]');
    jobDetails.profile = extractDesc('[data-testid="job-section-experience"]');
    jobDetails.process = extractDesc('[data-testid="job-section-process"]');

    return `Title: ${jobDetails.title}
Company: ${jobDetails.company}
Location: ${jobDetails.location}
Contract Type: ${jobDetails.contract}
Salary: ${jobDetails.salary}
Start Date: ${jobDetails.startDate}
Remote: ${jobDetails.remote}
Experience: ${jobDetails.experience}
Education: ${jobDetails.education}
Required Skills: ${jobDetails.skills}

Job Description:
${jobDetails.description}

Candidate Profile:
${jobDetails.profile}

Interview Process:
${jobDetails.process}`;
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

// Execute the functions
const textToCopy = extractText();
copyToClipboard(textToCopy);

alert('Text has been copied to clipboard!');
