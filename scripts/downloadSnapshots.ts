import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languages = ['fr', 'en', 'es'] as const;

// Updated reliable companies (verified to exist with active job pages)
const companies = [
    'payfit',
    'doctolib',
    'backmarket',
    'swile',
    'blablacar',
    'mirakl',
    'edf',
    'ey',
    'voltalis',
    'quadient',
    'spendesk',
    'wandercraft',
    'kleep',
    'descours-cabaud',
    'pernod-ricard',
];

const MAX_CONCURRENCY = 5;   // Stable value — increase to 6-8 if your connection is strong
const MAX_RETRIES = 2;
const snapshotsDir = path.join(__dirname, '../tests/snapshots');

// --- Start of modification: Clean snapshots directory ---
if (fs.existsSync(snapshotsDir)) {
    console.log(`🧹 Cleaning old snapshots in ${snapshotsDir}...`);
    fs.rmSync(snapshotsDir, { recursive: true, force: true });
}
fs.mkdirSync(snapshotsDir, { recursive: true });
// --- End of modification ---

async function scrollToLoadJobs(page: puppeteer.Page) {
    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
        await new Promise(r => setTimeout(r, 700));
    }
}

async function processJob(company: string, lang: string, browser: puppeteer.Browser): Promise<void> {
    let page: puppeteer.Page | null = null;
    let attempts = 0;

    while (attempts <= MAX_RETRIES) {
        try {
            page = await browser.newPage();
            await page.setDefaultNavigationTimeout(45000);

            const listingUrl = `https://www.welcometothejungle.com/${lang}/companies/${company}/jobs`;
            console.log(`🔍 [${lang.toUpperCase()}] ${company} (attempt ${attempts + 1})`);

            await page.goto(listingUrl, { waitUntil: 'networkidle2' });

            await scrollToLoadJobs(page);

            // Very flexible selector for job links
            const jobUrls = await page.evaluate(
                (lang: string, company: string) => {
                    const links = Array.from(document.querySelectorAll('a[href]'));
                    return links
                        .map(a => (a as HTMLAnchorElement).href)
                        .filter(url =>
                            url.includes(`/${lang}/companies/${company}/jobs/`) &&
                            !url.includes('/jobs?') // avoid filters
                        )
                        .filter((url, i, self) => self.indexOf(url) === i);
                },
                lang,
                company
            );

            if (jobUrls.length === 0) {
                console.log(`   ⚠️  No jobs found for ${company} (${lang})`);
                return;
            }

            // Pick random job for variety
            const randomUrl = jobUrls[Math.floor(Math.random() * jobUrls.length)];
            const urlObj = new URL(randomUrl);
            // Construct filename from the URL path (e.g., /fr/companies/payfit/jobs/abc -> fr-companies-payfit-jobs-abc)
            const snapshotName = urlObj.pathname
                .replace(/^\//, '')          // Remove leading slash
                .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric characters with hyphens
                .replace(/-+/g, '-')         // Collapse multiple hyphens
                .replace(/-$/, '')           // Remove trailing hyphen
                || 'index';

            const filePath = path.join(snapshotsDir, `${snapshotName}.html`);

            await page.goto(randomUrl, { waitUntil: 'networkidle2' });

            // --- Robust extraction for Scraper compatibility ---
            const minimalContent = await page.evaluate(() => {
                const headSelectors = [
                    'script[type="application/ld+json"]',
                    'meta[property="og:title"]',
                    'meta[property="og:url"]',
                    'meta[property="og:description"]',
                ];

                const bodySelectors = [
                    'h1',
                    // Main content sections
                    '[data-testid="job-section-description"]',
                    '[data-testid="job-section-profile"]',
                    '[data-testid="job-section-process"]',
                    // Metadata containers (Scraper looks for <li> inside these)
                    '[data-testid="job-header-info"]',
                    '.sc-bXCLTC', // Common class for the metadata wrapper if testid fails
                    'header ul',   // General fallback for the header info list
                    'time',        // Date posted is often in a <time> tag
                ];

                let headHtml = '';
                headSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        headHtml += el.outerHTML + '\n';
                    });
                });

                let bodyHtml = '';
                bodySelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        bodyHtml += el.outerHTML + '\n';
                    });
                });

                return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job Snapshot: ${document.title}</title>
    ${headHtml}
</head>
<body>
    ${bodyHtml}
</body>
</html>`;
            });

            fs.writeFileSync(filePath, minimalContent);
            console.log(`   ✅ Saved minimal snapshot ${snapshotName}.html`);
            return; // Success

        } catch (error: any) {
            attempts++;
            console.log(`   ⚠️  Retry ${attempts}/${MAX_RETRIES} for ${company} (${lang}) — ${error.message.substring(0, 80)}...`);
            if (attempts > MAX_RETRIES) {
                console.error(`   ❌ Failed ${company} (${lang}) after ${MAX_RETRIES + 1} attempts`);
            } else {
                await new Promise(r => setTimeout(r, 2000));
            }
        } finally {
            if (page) await page.close().catch(() => {});
        }
    }
}

(async () => {
    console.log(`🚀 Starting robust parallel download...`);
    console.log(`   Companies: ${companies.length} × ${languages.length} languages`);
    console.log(`   Concurrency: ${MAX_CONCURRENCY} | Retries: ${MAX_RETRIES}\n`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-http2']
    });

    const tasks: Promise<void>[] = [];
    for (const company of companies) {
        for (const lang of languages) {
            tasks.push(processJob(company, lang, browser));
        }
    }

    // Controlled concurrency
    for (let i = 0; i < tasks.length; i += MAX_CONCURRENCY) {
        const batch = tasks.slice(i, i + MAX_CONCURRENCY);
        await Promise.allSettled(batch);
        if (i + MAX_CONCURRENCY < tasks.length) {
            await new Promise(r => setTimeout(r, 600)); // Be gentle on the server
        }
    }

    await browser.close();
    console.log(`\n🎉 Finished! Check your snapshots folder: ${snapshotsDir}`);
})();