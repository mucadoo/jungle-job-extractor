import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractTextFromDoc } from './extractor';

describe('Extractor', () => {
    it('should extract title and company from a mock document', () => {
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div data-testid="job-metadata-block">
                    <h2>Software Engineer</h2>
                    <a href="#"><span>Awesome Corp</span></a>
                </div>
            </body>
            </html>
        `;
        const dom = new JSDOM(html);
        const result = extractTextFromDoc(dom.window.document);
        
        expect(result).toContain('Title: Software Engineer');
        expect(result).toContain('Company: Awesome Corp');
    });

    it('should extract from INITIAL_DATA if present', () => {
        const jobData = JSON.stringify({
            queries: [{
                state: {
                    data: {
                        name: "Backend Developer",
                        organization: { name: "Tech Startup" }
                    }
                }
            }]
        });
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <script>window.__INITIAL_DATA__ = "${jobData.replace(/"/g, '\\"')}"</script>
            </body>
            </html>
        `;
        const dom = new JSDOM(html);
        const result = extractTextFromDoc(dom.window.document);
        
        expect(result).toContain('Title: Backend Developer');
        expect(result).toContain('Company: Tech Startup');
    });
});
