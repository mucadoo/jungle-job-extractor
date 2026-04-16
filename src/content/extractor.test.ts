/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractJobDetails, formatJobDetails, getPageLanguage } from './extractor';
import * as fixtures from './fixtures';

describe('Job Extractor - Advanced Fixture Tests', () => {
    let dom: JSDOM;

    beforeAll(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        global.Node = dom.window.Node;
        global.document = dom.window.document;
        global.DOMParser = dom.window.DOMParser;
    });

    it('should format job details in French based on HTML language tag', () => {
        const testDom = new JSDOM(`<!DOCTYPE html><html lang="fr-FR"><body></body></html>`);
        const details = {
            title: "Développeur Front-End",
            company: "Tech Co",
            location: null,
            contractType: null,
            salary: "50k - 60k",
            datePosted: null,
            description: "Créer des interfaces incroyables.",
            profile: null,
            education: null,
            experience: null,
            hiringProcess: null,
            url: null
        };
        
        const lang = getPageLanguage(testDom.window.document);
        const result = formatJobDetails(details, lang);
        
        expect(lang).toBe('fr');
        expect(result).toContain("Titre: Développeur Front-End");
        expect(result).toContain("Entreprise: Tech Co");
        expect(result).toContain("Salaire: 50k - 60k");
        expect(result).toContain("Description du poste:\nCréer des interfaces incroyables.");
    });

    it('should format job details in Spanish based on URL meta tag', () => {
        const testDom = new JSDOM(`<!DOCTYPE html><html><head><meta property="og:url" content="https://www.welcometothejungle.com/es/companies/x/jobs/y"></head><body></body></html>`);
        const details = {
            title: "Ingeniero de Software",
            company: "Tech Co",
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
        
        const lang = getPageLanguage(testDom.window.document);
        const result = formatJobDetails(details, lang);
        
        expect(lang).toBe('es');
        expect(result).toContain("Título: Ingeniero de Software");
        expect(result).toContain("Empresa: Tech Co");
    });

    it('should extract job details from JSON-LD with @graph', () => {
        const testDom = new JSDOM(fixtures.mockJsonLdWithGraph);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Software Engineer");
        expect(result.company).toBe("Tech Co");
        expect(result.location).toBe("Paris");
        expect(result.datePosted).toBe("2024-03-20");
        expect(result.contractType).toBe("FULL_TIME");
        expect(result.description).toBe("Develop great software.");
    });

    it('should extract from metadata badges when JSON-LD is missing', () => {
        const testDom = new JSDOM(fixtures.mockMetadataHTML);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Senior Product Designer");
        expect(result.company).toBe("Creative Studio");
        expect(result.salary).toBe("55k - 70k €");
        expect(result.location).toContain("Télétravail ponctuel");
        expect(result.experience).toBe("Expérience : > 5 ans");
        expect(result.education).toBe("Bac +5 / Master");
        expect(result.description).toBe("Join our creative team.");
    });

    it('should handle minimal job listings', () => {
        const testDom = new JSDOM(fixtures.mockMinimalHTML);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Candidature Spontanée");
        expect(result.company).toBe("Bodyguard");
        expect(result.location).toBeNull();
    });
});
