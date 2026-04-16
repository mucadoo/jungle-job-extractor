import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languages = ['fr', 'en', 'es'] as const;

// ←←← ADD MORE COMPANIES HERE (just the slug from the URL)
const companies = [
    'payfit',
    'bodyguard',
    // Example: 'doctolib', 'alan', 'backmarket', etc.
];

const MAX_JOBS_PER_LISTING = 4; // change if you want more/less variety

const snapshotsDir = path.join(__dirname, '../tests/snapshots');

if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`📸 Auto-downloading snapshots for ${companies.length} companies × ${languages.length} languages...\n`);

    for (const company of companies) {
        for (const lang of languages) {
            const listingUrl = `https://www.welcometothejungle.com/${lang}/companies/${company}/jobs`;

            console.log(`🔍 [${lang}] ${company} → listing page...`);

            try {
                await page.goto(listingUrl, { waitUntil: 'networkidle2', timeout: 30000 });

                // Wait for at least one job link to appear
                await page.waitForSelector(`a[href^="/${lang}/companies/${company}/jobs/"]`, { timeout: 10000 });

                // Auto-extract all job URLs (exactly how the site renders them)
                const jobUrls = await page.evaluate(
                    (lang: string, company: string) => {
                        const selector = `a[href^="/${lang}/companies/${company}/jobs/"]`;
                        return Array.from(document.querySelectorAll(selector))
                            .map((a) => (a as HTMLAnchorElement).href) // full absolute URL
                            .filter((url, index, self) => self.indexOf(url) === index); // unique
                    },
                    lang,
                    company
                );

                const limitedUrls = jobUrls.slice(0, MAX_JOBS_PER_LISTING);

                console.log(`   → Found ${jobUrls.length} jobs, downloading ${limitedUrls.length}...`);

                for (const jobUrl of limitedUrls) {
                    const urlObj = new URL(jobUrl);
                    const fullSlug = urlObj.pathname.split('/jobs/')[1] || 'unknown';
                    // Clean filename (remove the _PAYFI_ tracking ID if present)
                    const cleanSlug = fullSlug.split('_PAYFI_')[0];

                    const snapshotName = `${company}-${lang}-${cleanSlug}`;
                    const filePath = path.join(snapshotsDir, `${snapshotName}.html`);

                    await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                    const content = await page.content();

                    fs.writeFileSync(filePath, content);
                    console.log(`   ✅ Saved ${snapshotName}.html`);
                }
            } catch (error: any) {
                console.error(`   ❌ Failed ${company} (${lang}):`, error.message);
            }
        }
    }

    await browser.close();
    console.log('\n🎉 All done! Snapshots saved in:', snapshotsDir);
})();