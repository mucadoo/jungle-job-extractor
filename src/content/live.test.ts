import { describe, it, expect } from 'vitest';
import puppeteer from 'puppeteer';
import { extractJobDetails } from './extractor';
import { JSDOM } from 'jsdom';

describe('WTTJ Live Site Integrity', () => {
    it('should still be able to extract data from a live job page', async () => {
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        // Use a known stable company/job URL
        await page.goto('https://www.welcometothejungle.com/en/companies/doctolib/jobs/software-engineer', {
            waitUntil: 'networkidle2',
        });

        const html = await page.content();
        await browser.close();

        const dom = new JSDOM(html);
        const result = extractJobDetails(dom.window.document);

        // We don't check exact strings (those change), 
        // we check that the "structure" still yields data.
        expect(result.title).not.toBeNull();
        expect(result.company).not.toBeNull();
        expect(result.description).not.toBeNull();
        
        // Log the extraction method for visibility in CI
        console.log(`Extraction method used: ${result.extractionMethod}`);
    }, 40000); // 40s timeout for live network
});
