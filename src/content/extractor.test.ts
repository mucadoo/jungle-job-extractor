/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractJobDetails } from './extractor';
import * as fixtures from './fixtures';

describe('Job Extractor - Advanced Fixture Tests', () => {
    let dom: JSDOM;

    beforeAll(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        global.Node = dom.window.Node;
        global.document = dom.window.document;
        global.DOMParser = dom.window.DOMParser;
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
        expect(result.description).toBe("Job Description Join our creative team.");
    });

    it('should handle minimal job listings', () => {
        const testDom = new JSDOM(fixtures.mockMinimalHTML);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Candidature Spontanée");
        expect(result.company).toBe("Bodyguard");
        expect(result.location).toBeNull();
    });

    it('should extract specific job sections correctly', () => {
        const testDom = new JSDOM(fixtures.mockMetadataHTML);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.description).toContain("Join our creative team.");
        expect(result.profile).toContain("You have 5 years of experience.");
    });
});
