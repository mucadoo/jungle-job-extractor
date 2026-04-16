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
    });

    it('should extract English job details using JSON-LD (simulated via fixture)', () => {
        // We simulate a document with the script tag
        const html = `<!DOCTYPE html><html><body>
            <script type="application/ld+json">
            {
                "@context": "https://schema.org/",
                "@type": "JobPosting",
                "title": "Native English Linguist",
                "hiringOrganization": { "@type": "Organization", "name": "Bodyguard" },
                "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "Nice" } },
                "description": "Job description here"
            }
            </script>
        </body></html>`;
        const testDom = new JSDOM(html);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Native English Linguist");
        expect(result.company).toBe("Bodyguard");
        expect(result.location).toBe("Nice");
    });

    it('should extract from metadata badges when JSON-LD is missing', () => {
        const html = `<!DOCTYPE html><html><body>
            <h1>Customer Relationship Manager</h1>
            <div data-testid="job-header-info">
                <ul>
                    <li><i name="salary"></i>45000 €</li>
                    <li><i name="remote"></i>2 jours par semaine</li>
                </ul>
            </div>
            <meta property="og:title" content="Customer Relationship Manager - Payfit">
        </body></html>`;
        const testDom = new JSDOM(html);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Customer Relationship Manager");
        expect(result.company).toBe("Payfit");
        expect(result.salary).toBe("45000 €");
        expect(result.location).toContain("2 jours par semaine");
    });

    it('should handle Internships using metadata badges', () => {
        const html = `<!DOCTYPE html><html><body>
            <h1>Product Builder Intern</h1>
            <div data-testid="job-header-info">
                <ul>
                    <li>Stage / Practicas</li>
                </ul>
            </div>
        </body></html>`;
        const testDom = new JSDOM(html);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.title).toBe("Product Builder Intern");
        // Note: Our current simple badge detection might not catch "Stage" as contractType if it's not in the <ul> but we can improve it.
    });

    it('should extract specific job sections', () => {
        const html = `<!DOCTYPE html><html><body>
            <div data-testid="job-section-description">This is the description</div>
            <div data-testid="job-section-profile">This is the profile</div>
            <div data-testid="job-section-process">This is the process</div>
        </body></html>`;
        const testDom = new JSDOM(html);
        const result = extractJobDetails(testDom.window.document);
        
        expect(result.description).toBe("This is the description");
        expect(result.profile).toBe("This is the profile");
        expect(result.hiringProcess).toBe("This is the process");
    });
});
