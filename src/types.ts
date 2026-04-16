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
    title?: string;
    company?: string;
    location?: string;
    contract?: string;
    salary?: string;
    startDate?: string;
    remote?: string;
    experience?: string;
    education?: string;
    skills?: string;
    description?: string;
    profile?: string;
    process?: string;
}
