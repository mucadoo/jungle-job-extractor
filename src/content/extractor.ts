import { JobDetails } from '../types';

export type AppLanguage = 'en' | 'fr' | 'es';

export const i18n = {
    en: {
        title: "Title",
        company: "Company",
        location: "Location",
        contractType: "Contract Type",
        salary: "Salary",
        datePosted: "Date Posted",
        experience: "Experience",
        education: "Education",
        url: "URL",
        description: "Job Description",
        profile: "Desired Profile",
        hiringProcess: "Interview Process"
    },
    fr: {
        title: "Titre",
        company: "Entreprise",
        location: "Lieu",
        contractType: "Type de contrat",
        salary: "Salaire",
        datePosted: "Date de publication",
        experience: "Expérience",
        education: "Éducation",
        url: "URL",
        description: "Description du poste",
        profile: "Profil recherché",
        hiringProcess: "Déroulement des entretiens"
    },
    es: {
        title: "Título",
        company: "Empresa",
        location: "Ubicación",
        contractType: "Tipo de contrato",
        salary: "Salario",
        datePosted: "Fecha de publicación",
        experience: "Experiencia",
        education: "Educación",
        url: "URL",
        description: "Descripción del puesto",
        profile: "Perfil deseado",
        hiringProcess: "Proceso de selección"
    }
};

interface SchemaJobPosting {
    '@type'?: string;
    title?: string;
    hiringOrganization?: { name?: string };
    description?: string;
    datePosted?: string;
    employmentType?: string;
    jobLocation?: any;
    url?: string;
}

/**
 * Detects the language of the current WTTJ page.
 */
export function getPageLanguage(doc: Document): AppLanguage {
    const htmlLang = doc.documentElement.lang?.toLowerCase() || '';
    if (htmlLang.startsWith('fr')) return 'fr';
    if (htmlLang.startsWith('es')) return 'es';
    if (htmlLang.startsWith('en')) return 'en';

    // Fallback: check og:url
    const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
    if (ogUrl.includes('/fr/')) return 'fr';
    if (ogUrl.includes('/es/')) return 'es';

    return 'en'; // default
}

/**
 * Strips HTML tags from a string and cleans up whitespace.
 * Uses DOMParser for safer HTML parsing and robust whitespace normalization.
 */
function stripHtmlAndClean(html: string | null | undefined): string | null {
    if (!html) return null;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Prevent text merging for block elements (e.g., <div>A</div><div>B</div> -> A\nB instead of AB)
    const blockElements =['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'ul'];
    blockElements.forEach(tag => {
        doc.querySelectorAll(tag).forEach(el => {
            el.insertAdjacentText('afterend', '\n');
        });
    });

    doc.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    doc.querySelectorAll('li').forEach(li => {
        li.prepend('- ');
        li.insertAdjacentText('afterend', '\n');
    });
    
    let text = doc.body.textContent || '';
    
    // Normalize whitespace: collapse multiple spaces/tabs into a single space
    text = text.replace(/[ \t\f\v]+/g, ' ');
    // Collapse multiple newlines into a max of two newlines
    text = text.replace(/\n\s*\n/g, '\n\n');
    
    return text.trim() || null;
}

/**
 * Extracts job details from a Welcome to the Jungle HTML document.
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

    // --- 1. Attempt to parse JSON-LD Schema ---
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');

    jsonLdScripts.forEach(el => {
        try {
            const scriptContent = el.textContent;
            if (!scriptContent) return;

            const data = JSON.parse(scriptContent);
            let schemas: SchemaJobPosting[] = [];
            
            if (data['@graph']) {
                schemas = data['@graph'] as SchemaJobPosting[];
            } else if (Array.isArray(data)) {
                schemas = data as SchemaJobPosting[];
            } else {
                schemas =[data as SchemaJobPosting];
            }
            
            const jobPosting = schemas.find(schema => schema['@type'] === 'JobPosting');

            if (jobPosting) {
                jobDetails.title = jobPosting.title || null;
                jobDetails.company = jobPosting.hiringOrganization?.name || null;
                jobDetails.description = jobPosting.description || null;
                jobDetails.contractType = jobPosting.employmentType || null;
                jobDetails.url = jobPosting.url || null;

                if (jobPosting.datePosted) {
                    try {
                        const date = new Date(jobPosting.datePosted);
                        jobDetails.datePosted = date.toISOString().split('T')[0]; // Formats to YYYY-MM-DD
                    } catch {
                        jobDetails.datePosted = jobPosting.datePosted || null;
                    }
                }

                if (jobPosting.jobLocation) {
                    const loc = Array.isArray(jobPosting.jobLocation) ? jobPosting.jobLocation[0] : jobPosting.jobLocation;
                    jobDetails.location = loc?.address?.addressLocality 
                                       || loc?.address?.addressRegion 
                                       || (typeof loc?.name === 'string' ? loc.name : null);
                }
            }
        } catch (error) {
            console.error("Error parsing JSON-LD:", error);
        }
    });

    // --- 2. Advanced Fallbacks & Supplemental Data Extraction ---
    if (!jobDetails.title) jobDetails.title = doc.querySelector('h1')?.textContent?.trim() || null;
    if (!jobDetails.company) {
        const metaTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        if (metaTitle && metaTitle.includes(' - ')) {
            jobDetails.company = metaTitle.split(' - ').pop()?.trim() || null;
        }
    }

    const extractSectionContent = (testId: string) => stripHtmlAndClean(doc.querySelector(`[data-testid="${testId}"]`)?.innerHTML);

    jobDetails.description = extractSectionContent('job-section-description') || jobDetails.description;
    jobDetails.profile = extractSectionContent('job-section-profile');
    jobDetails.hiringProcess = extractSectionContent('job-section-process');

    // --- 3. Extract Metadata from Info Badges ---
    doc.querySelectorAll('[data-testid="job-header-info"] ul li').forEach(el => {
        const text = el.textContent?.trim() || '';
        const lowerText = text.toLowerCase();

        if (lowerText.includes('€') || lowerText.includes('$') || lowerText.includes('£') || lowerText.includes('salary')) {
            jobDetails.salary = text;
        }
        if (lowerText.includes('remote') || lowerText.includes('télétravail')) {
            jobDetails.location = jobDetails.location ? `${jobDetails.location} (${text})` : text;
        }
        if (lowerText.includes('expér') || lowerText.includes('year') || lowerText.includes('ans')) {
            if (/\d/.test(text) || lowerText.includes('junior') || lowerText.includes('senior')) jobDetails.experience = text;
        }
        if (lowerText.includes('bac') || lowerText.includes('master') || lowerText.includes('degree') || lowerText.includes('diplôme')) {
            jobDetails.education = text;
        }
    });

    if (!jobDetails.url) {
        jobDetails.url = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || null;
    }

    jobDetails.description = stripHtmlAndClean(jobDetails.description);
    jobDetails.profile = stripHtmlAndClean(jobDetails.profile);
    jobDetails.hiringProcess = stripHtmlAndClean(jobDetails.hiringProcess);

    return jobDetails;
}

/**
 * Formats the extracted JobDetails into a localized human-readable string.
 */
export function formatJobDetails(details: JobDetails, lang: AppLanguage = 'en'): string {
    const t = i18n[lang];
    const sections: string[] =[];

    if (details.title) sections.push(`${t.title}: ${details.title}`);
    if (details.company) sections.push(`${t.company}: ${details.company}`);
    if (details.location) sections.push(`${t.location}: ${details.location}`);
    if (details.contractType) sections.push(`${t.contractType}: ${details.contractType}`);
    if (details.salary) sections.push(`${t.salary}: ${details.salary}`);
    if (details.datePosted) sections.push(`${t.datePosted}: ${details.datePosted}`);
    if (details.experience) sections.push(`${t.experience}: ${details.experience}`);
    if (details.education) sections.push(`${t.education}: ${details.education}`);
    if (details.url) sections.push(`${t.url}: ${details.url}`);
    
    if (details.description) sections.push(`\n${t.description}:\n${details.description}`);
    if (details.profile) sections.push(`\n${t.profile}:\n${details.profile}`);
    if (details.hiringProcess) sections.push(`\n${t.hiringProcess}:\n${details.hiringProcess}`);

    return sections.join('\n').trim();
}

/**
 * Main function to extract and format job details from the current document.
 */
export function extractTextFromDoc(doc: Document): string {
    const details = extractJobDetails(doc);
    const lang = getPageLanguage(doc);
    return formatJobDetails(details, lang);
}
