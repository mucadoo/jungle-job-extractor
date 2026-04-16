/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { mapToJobDetails } from './extractor';
import * as fixtures from './fixtures';

describe('Job Extractor - Advanced Fixture Tests', () => {
    let dom: JSDOM;

    beforeAll(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        global.Node = dom.window.Node;
    });

    it('should extract English job details from JSON', () => {
        const result = mapToJobDetails(fixtures.mockJobDataEnglish, null, dom.window.document);
        expect(result.title).toBe("Native English Linguist");
        expect(result.company).toBe("Bodyguard");
        expect(result.location).toBe("Nice");
    });

    it('should extract French job details from JSON', () => {
        const result = mapToJobDetails(fixtures.mockJobDataFrench, null, dom.window.document);
        expect(result.title).toBe("Customer Relationship Manager");
        expect(result.salary).toBe("45000 €");
        expect(result.remote).toBe("2 jours par semaine");
    });

    it('should handle Internships (Practicas) from JSON', () => {
        const result = mapToJobDetails(fixtures.mockJobDataInternship, null, dom.window.document);
        expect(result.title).toBe("Product Builder Intern");
        expect(result.contract).toBe("Stage / Practicas");
    });

    it('should handle Spontaneous Applications with minimal data', () => {
        const result = mapToJobDetails(fixtures.mockJobDataSpontaneous, null, dom.window.document);
        expect(result.title).toBe("Candidature Spontanée");
        expect(result.description).toBeUndefined();
    });

    it('should extract from English HTML Metadata (Fallback)', () => {
        const testDom = new JSDOM(`<!DOCTYPE html><html><body>${fixtures.mockMetadataHTMLEnglish}</body></html>`);
        const metadataBlock = testDom.window.document.querySelector('[data-testid="job-metadata-block"]');
        
        const result = mapToJobDetails(null, metadataBlock, testDom.window.document);
        
        expect(result.title).toBe("Sales Development Representative");
        expect(result.location).toBe("Barcelona");
        expect(result.salary).toBe("30k - 40k EUR");
        expect(result.startDate).toBe("ASAP");
    });

    it('should extract from French HTML Metadata (Fallback)', () => {
        const testDom = new JSDOM(`<!DOCTYPE html><html><body>${fixtures.mockMetadataHTMLFrench}</body></html>`);
        const metadataBlock = testDom.window.document.querySelector('[data-testid="job-metadata-block"]');
        
        const result = mapToJobDetails(null, metadataBlock, testDom.window.document);
        
        expect(result.title).toBe("Chargé de Clientèle");
        expect(result.location).toBe("Paris");
        expect(result.salary).toBe("40 000 € par an");
        expect(result.experience).toBe("> 2 ans");
    });
});
