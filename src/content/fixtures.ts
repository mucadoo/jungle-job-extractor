import { JobData } from '../types';

/**
 * REPRESENTATIVE TEST CASES DISTILLED FROM SNAPSHOTS
 * These fixtures represent real-world variations observed in Welcome to the Jungle job pages.
 */

// 1. Standard Full Job (English / International)
export const mockJobDataEnglish: JobData = {
    name: "Native English Linguist",
    organization: { name: "Bodyguard" },
    contract_type: "Permanent (CDI)",
    office: { city: "Nice" },
    salary_min: 35000,
    salary_currency: "EUR",
    start_date: "ASAP",
    remote: "Partial",
    experience_level: "2+ years",
    education_level: "Master's Degree",
    tools: [{ name: "Translation" }, { name: "Localization" }],
    description: "Help us protect people online.",
    profile: "English is your mother tongue.",
    recruitment_process: "1. Phone screen\n2. Technical test"
};

// 2. French Market Specifics (Salary in French, Specific labels)
export const mockJobDataFrench: JobData = {
    name: "Customer Relationship Manager",
    organization: { name: "PayFit" },
    contract_type: "CDI",
    office: { city: "Paris" },
    salary_min: 45000,
    salary_currency: "€",
    start_date: "Janvier 2024",
    remote: "2 jours par semaine",
    experience_level: "Junior",
    tools: [{ name: "Salesforce" }, { name: "Zendesk" }],
    description: "Accompagnez nos clients."
};

// 3. Internship / Practicas (Spanish label influence)
export const mockJobDataInternship: JobData = {
    name: "Product Builder Intern",
    organization: { name: "PayFit" },
    contract_type: "Stage / Practicas",
    office: { city: "Barcelona" },
    start_date: "Immediate",
    tools: [{ name: "No-code" }, { name: "Bubble" }]
};

// 4. Spontaneous Application (Candidatures Spontanées) - Often missing description/salary
export const mockJobDataSpontaneous: JobData = {
    name: "Candidature Spontanée",
    organization: { name: "Bodyguard" },
    contract_type: "Various",
    office: { city: "Remote" }
};

// 5. Raw HTML Snippets for testing the DOM-based fallback (Scraper)
export const mockMetadataHTMLEnglish = `
    <div data-testid="job-metadata-block">
        <h2>Sales Development Representative</h2>
        <a href="#"><span>Tech Corp</span></a>
        <div><i name="location"></i>Location: Barcelona</div>
        <div><i name="contract"></i>Permanent Contract</div>
        <div><i name="salary"></i>Salary: 30k - 40k EUR</div>
        <div><i name="clock"></i>Start: ASAP</div>
        <div><i name="remote"></i>Remote: Partial</div>
        <div variant="default" length="1"><span>Sales</span></div>
    </div>
    <div data-testid="job-section-description"><h4>The Role</h4><p>Sell amazing products.</p></div>
`;

export const mockMetadataHTMLFrench = `
    <div data-testid="job-metadata-block">
        <h2>Chargé de Clientèle</h2>
        <a href="#"><span>Société Géniale</span></a>
        <div><i name="location"></i>Lieu: Paris</div>
        <div><i name="contract"></i>CDI</div>
        <div><i name="salary"></i>Salaire : 40 000 € par an</div>
        <div><i name="clock"></i>Début : Dès que possible</div>
        <div><i name="suitcase"></i>Expérience : > 2 ans</div>
    </div>
    <div data-testid="job-section-description"><h4>Description du poste</h4><p>Rejoignez-nous !</p></div>
`;
