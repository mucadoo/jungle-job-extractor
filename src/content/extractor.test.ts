/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractTextFromDoc } from './extractor';
import fs from 'fs';
import path from 'path';

describe('Extractor Snapshots', () => {
    const snapshotsDir = path.join(__dirname, '../../tests/snapshots');

    if (!fs.existsSync(snapshotsDir)) {
        it('should remind the user to download snapshots', () => {
            console.warn(`Snapshots directory not found at ${snapshotsDir}. Run 'npm run download-snapshots' first.`);
        });
        return;
    }

    const files = fs.readdirSync(snapshotsDir).filter(file => file.endsWith('.html'));

    if (files.length === 0) {
        it('should have snapshots to test', () => {
            console.warn('No .html snapshots found. Run \'npm run download-snapshots\' first.');
        });
    }

    files.forEach(file => {
        it(`should successfully extract data from ${file}`, () => {
            const html = fs.readFileSync(path.join(snapshotsDir, file), 'utf8');
            const dom = new JSDOM(html);
            
            // Set global Node for the test environment
            global.Node = dom.window.Node;

            const result = extractTextFromDoc(dom.window.document);
            
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
            expect(result, `Snapshot ${file} is missing Title`).toContain('Title:');
            expect(result, `Snapshot ${file} is missing Company`).toContain('Company:');
        });
    });
});
