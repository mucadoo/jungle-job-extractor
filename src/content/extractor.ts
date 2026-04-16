import { JobData, JobDetails } from '../types';

export function replaceLineBreaks(node: Node): string {
    const TEXT_NODE = typeof Node !== 'undefined' ? Node.TEXT_NODE : 3;
    if (node.nodeType === TEXT_NODE) {
        return node.textContent?.trim() + ' ' || '';
    }
    let text = '';
    node.childNodes.forEach(child => {
        if (child.nodeName === 'LI') text += "-";
        text += replaceLineBreaks(child);
    });
    return text;
}

export function extractDesc(root: ParentNode, selector: string): string {
    const element = root.querySelector(selector);
    if (!element) return '';
    const clone = element.cloneNode(true) as HTMLElement;
    const firstH4 = clone.querySelector('h4');
    if (firstH4) firstH4.remove();
    const voirPlusButton = clone.querySelector('[data-testid="view-more-btn"]');
    if (voirPlusButton) voirPlusButton.remove();
    return replaceLineBreaks(clone).trim();
}

/**
 * The core mapping logic. 
 * This is what we test against mock data.
 */
export function mapToJobDetails(jobData: JobData | null, metadataBlock: Element | null, doc: ParentNode): JobDetails {
    const getMetadataValue = (iconName: string, regexToRemove?: RegExp) => {
        const icon = metadataBlock?.querySelector(`i[name="${iconName}"]`);
        let text = icon?.parentElement?.textContent?.trim() || '';
        if (regexToRemove) text = text.replace(regexToRemove, '').trim();
        return text || undefined;
    };

    const details: JobDetails = {
        title: jobData?.name || metadataBlock?.querySelector('h2')?.textContent?.trim(),
        company: jobData?.organization?.name || metadataBlock?.querySelector('a span')?.textContent?.trim(),
        location: getMetadataValue('location', /.*location/i) || jobData?.office?.city,
        contract: getMetadataValue('contract') || jobData?.contract_type,
        salary: getMetadataValue('salary', /.*(Salaire|Salary)\s*:/i) || (jobData?.salary_min ? `${jobData.salary_min} ${jobData.salary_currency || ''}` : undefined),
        startDate: getMetadataValue('clock', /.*(Début|Start)\s*:/i) || jobData?.start_date,
        remote: getMetadataValue('remote', /.*remote\s*:/i) || jobData?.remote,
        experience: getMetadataValue('suitcase', /.*(Expérience|Experience)\s*:/i) || jobData?.experience_level,
        education: getMetadataValue('education_level', /.*(Éducation|Education)\s*:/i) || jobData?.education_level,
        skills: jobData?.tools?.length 
            ? jobData.tools.map(tool => tool.name).join(', ') 
            : Array.from(metadataBlock?.querySelectorAll('div[variant="default"][length] span') || []).map(el => el.textContent?.trim()).join(', '),
        description: extractDesc(doc, '[data-testid="job-section-description"]') || jobData?.description,
        profile: extractDesc(doc, '[data-testid="job-section-experience"]') || jobData?.profile,
        process: extractDesc(doc, '[data-testid="job-section-process"]') || jobData?.recruitment_process
    };

    return details;
}

export function formatJobDetails(details: JobDetails): string {
    let res = '';
    if (details.title) res += `Title: ${details.title}\n`;
    if (details.company) res += `Company: ${details.company}\n`;
    if (details.location) res += `Location: ${details.location}\n`;
    if (details.contract) res += `Contract Type: ${details.contract}\n`;
    if (details.salary) res += `Salary: ${details.salary}\n`;
    if (details.startDate) res += `Start Date: ${details.startDate}\n`;
    if (details.remote) res += `Remote: ${details.remote}\n`;
    if (details.experience) res += `Experience: ${details.experience}\n`;
    if (details.education) res += `Education: ${details.education}\n`;
    if (details.skills) res += `Required Skills: ${details.skills}\n`;
    if (details.description) res += `\nJob Description:\n${details.description}\n`;
    if (details.profile) res += `\nDesired Profile:\n${details.profile}\n`;
    if (details.process) res += `\nInterview Process:\n${details.process}\n`;
    return res.trim();
}

export function extractTextFromDoc(doc: Document): string {
    const scripts = doc.getElementsByTagName("script");
    const metadataBlock = doc.querySelector('[data-testid="job-metadata-block"]');
    let jobData: JobData | null = null;

    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.textContent?.includes("window.__INITIAL_DATA__")) {
            const match = script.textContent.match(/window\.__INITIAL_DATA__\s*=\s*"((?:\\.|[^"\\])*)"[\r\n]/);
            if (match) {
                try {
                    jobData = JSON.parse(JSON.parse(`"${match[1]}"`)).queries[0].state.data;
                } catch (e) { console.error("Failed to parse INITIAL_DATA", e); }
                break;
            }
        }
    }

    const details = mapToJobDetails(jobData, metadataBlock, doc);
    return formatJobDetails(details);
}
