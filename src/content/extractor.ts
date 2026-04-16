import { JobDetails } from '../types';

/**
 * Strips HTML tags from a string and cleans up whitespace.
 * @param html The HTML string to clean.
 * @returns Cleaned plain text.
 */
function stripHtmlAndClean(html: string | null | undefined): string | null {
    if (!html) return null;
    // Create a temporary div to parse HTML and get text content
    const div = document.createElement('div');
    div.innerHTML = html;
    // Replace <br> with newlines for better readability
    div.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    // Replace <li> with - for list formatting
    div.querySelectorAll('li').forEach(li => li.prepend('- '));
    // Get text content, then clean up multiple spaces and newlines
    return div.textContent?.replace(/\s\s+/g, ' ').trim() || null;
}

/**
 * Extracts job details from a Welcome to the Jungle HTML document.
 * Strategy:
 * 1. Look for Schema.org JSON-LD (most reliable).
 * 2. Fallback to specific WTTJ data-testids (job-section-description, job-section-profile, etc).
 * 3. Fallback to semantic list items and icons for metadata (salary, remote, experience).
 * @param doc The HTML Document object of the job page.
 * @returns JobDetails object containing the extracted fields.
 */
export function extractJobDetails(doc: Document): JobDetails {
    const jobDetails: JobDetails = {
        title: null,
        company: null,
        location: null,
        contractType: null,
        salary: null,
        datePosted: null,
        description: null,
        profile: null,
        education: null,
        experience: null,
        hiringProcess: null,
        url: null
    };

    // --- 1. Attempt to parse JSON-LD Schema (Highly reliable for core info) ---
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');

    jsonLdScripts.forEach(el => {
        try {
            const scriptContent = el.textContent;
            if (!scriptContent) return;

            const data = JSON.parse(scriptContent);
            const schemas = Array.isArray(data) ? data : [data];
            const jobPosting = schemas.find(schema => schema['@type'] === 'JobPosting');

            if (jobPosting) {
                jobDetails.title = jobPosting.title || null;
                jobDetails.company = jobPosting.hiringOrganization?.name || null;
                jobDetails.description = jobPosting.description || null;
                jobDetails.datePosted = jobPosting.datePosted || null;
                jobDetails.contractType = jobPosting.employmentType || null;

                if (jobPosting.jobLocation) {
                    const loc = Array.isArray(jobPosting.jobLocation)
                        ? jobPosting.jobLocation[0]
                        : jobPosting.jobLocation;

                    jobDetails.location = loc?.address?.addressLocality
                                       || loc?.address?.addressRegion
                                       || null;
                }
                jobDetails.url = jobPosting.url || null;
            }
        } catch (error) {
            console.error("Error parsing JSON-LD:", error);
            // Proceed to fallbacks
        }
    });

    // --- 2. Advanced Fallbacks & Supplemental Data Extraction ---

    // Title & Company fallback
    if (!jobDetails.title) jobDetails.title = doc.querySelector('h1')?.textContent?.trim() || null;
    if (!jobDetails.company) {
        const metaTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        if (metaTitle && metaTitle.includes(' - ')) {
            const parts = metaTitle.split(' - ');
            jobDetails.company = parts.pop()?.trim() || null;
        }
    }

    // WTTJ Specific Sections (using data-testids)
    const extractSectionContent = (testId: string) => {
        const element = doc.querySelector(`[data-testid="${testId}"]`);
        return stripHtmlAndClean(element?.innerHTML);
    };

    jobDetails.description = extractSectionContent('job-section-description') || jobDetails.description;
    jobDetails.profile = extractSectionContent('job-section-profile');
    jobDetails.hiringProcess = extractSectionContent('job-section-process');

    // --- 3. Extract Metadata from Info Badges (Salary, Remote, Exp, Edu) ---
    // WTTJ uses <ul> with <li> for the top-level info badges, often within a data-testid="job-header-info"
    doc.querySelectorAll('[data-testid="job-header-info"] ul li').forEach(el => {
        const text = el.textContent?.trim() || '';
        const lowerText = text.toLowerCase();

        // Salary Detection
        if (lowerText.includes('€') || lowerText.includes('$') || lowerText.includes('£') || lowerText.includes('salary')) {
            jobDetails.salary = text;
        }

        // Remote Detection (update location if remote is found)
        if (lowerText.includes('remote') || lowerText.includes('télétravail')) {
            jobDetails.location = jobDetails.location ? `${jobDetails.location} (${text})` : text;
        }

        // Experience Detection (e.g. "> 2 years", "Intermediate")
        if (lowerText.includes('expér') || lowerText.includes('year') || lowerText.includes('ans')) {
            // Ensure we aren't picking up random text by checking if it contains numbers or specific exp keywords
            if (/\d/.test(text) || lowerText.includes('junior') || lowerText.includes('senior')) {
                jobDetails.experience = text;
            }
        }

        // Education Detection
        if (lowerText.includes('bac') || lowerText.includes('master') || lowerText.includes('degree') || lowerText.includes('diplôme')) {
            jobDetails.education = text;
        }
    });

    // URL fallback
    if (!jobDetails.url) {
        jobDetails.url = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || null;
    }

    // Final cleanup: ensure description is plain text
    jobDetails.description = stripHtmlAndClean(jobDetails.description);
    jobDetails.profile = stripHtmlAndClean(jobDetails.profile);
    jobDetails.hiringProcess = stripHtmlAndClean(jobDetails.hiringProcess);


    return jobDetails;
}

/**
 * Formats the extracted JobDetails into a human-readable string.
 * @param details The JobDetails object.
 * @returns A formatted string of job details.
 */
export function formatJobDetails(details: JobDetails): string {
    let res = '';
    if (details.title) res += `Title: ${details.title}\n`;
    if (details.company) res += `Company: ${details.company}\n`;
    if (details.location) res += `Location: ${details.location}\n`;
    if (details.contractType) res += `Contract Type: ${details.contractType}\n`;
    if (details.salary) res += `Salary: ${details.salary}\n`;
    if (details.datePosted) res += `Date Posted: ${details.datePosted}\n`;
    if (details.experience) res += `Experience: ${details.experience}\n`;
    if (details.education) res += `Education: ${details.education}\n`;
    if (details.url) res += `URL: ${details.url}\n`;
    if (details.description) res += `\nJob Description:\n${details.description}\n`;
    if (details.profile) res += `\nDesired Profile:\n${details.profile}\n`;
    if (details.hiringProcess) res += `\nInterview Process:\n${details.hiringProcess}\n`;
    return res.trim();
}

/**
 * Main function to extract and format job details from the current document.
 * @param doc The HTML Document object.
 * @returns A formatted string of job details.
 */
export function extractTextFromDoc(doc: Document): string {
    const details = extractJobDetails(doc);
    return formatJobDetails(details);
}
