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
