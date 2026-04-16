import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jobUrls = [
    {
        name: 'payfit-pm-fr',
        url: 'https://www.welcometothejungle.com/fr/companies/payfit/jobs/product-manager_paris'
    },
    {
        name: 'payfit-pm-en',
        url: 'https://www.welcometothejungle.com/en/companies/payfit/jobs/product-manager_paris'
    }
];

const snapshotsDir = path.join(__dirname, '../tests/snapshots');

if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    for (const job of jobUrls) {
        console.log(`Downloading snapshot for: ${job.name}...`);
        try {
            await page.goto(job.url, { waitUntil: 'networkidle2' });
            const content = await page.content();
            fs.writeFileSync(path.join(snapshotsDir, `${job.name}.html`), content);
            console.log(`Saved ${job.name}.html`);
        } catch (error: any) {
            console.error(`Failed to download ${job.name}:`, error.message);
        }
    }

    await browser.close();
    console.log('Done.');
})();
