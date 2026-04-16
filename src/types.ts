export interface JobData {
    name?: string;
    organization?: {
        name: string;
    };
    contract_type?: string;
    office?: {
        city: string;
    };
    salary_min?: number;
    salary_currency?: string;
    start_date?: string;
    remote?: string;
    experience_level?: string;
    education_level?: string;
    tools?: Array<{ name: string }>;
    description?: string;
    profile?: string;
    recruitment_process?: string;
}

export interface JobDetails {
    title?: string | null;
    company?: string | null;
    location?: string | null;
    contractType?: string | null;
    salary?: string | null;
    datePosted?: string | null;
    description?: string | null;
    profile?: string | null;
    education?: string | null;
    experience?: string | null;
    hiringProcess?: string | null;
    url?: string | null;
    // Keep these for backward compatibility if needed by the UI
    contract?: string | null;
    startDate?: string | null;
    remote?: string | null;
    skills?: string | null;
}
