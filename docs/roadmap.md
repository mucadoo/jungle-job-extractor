# Roadmap

Open items collected from outside feedback, checked against the current code before being added
here — anything already handled is left out rather than listed as done.

## Open

- [ ] **Test on Firefox / Edge.** No `browser_specific_settings`/Gecko config, no Firefox or Edge
      mentions anywhere in the repo — the extension has only ever been built and loaded as an
      unpacked Chrome (Manifest V3) extension per the README's "Loading into Chrome" instructions.
      Manifest V3 is broadly supported on both Firefox (109+) and Edge (Chromium-based, so likely
      close to drop-in), but neither has been verified.
- [ ] **Publish to Chrome Extension Store.** `manifest.json` is still at `"version": "1.0"` with no
      Chrome Web Store listing link anywhere in the README, and CI (`.github/workflows/ci-cd.yml`)
      only packages a `.zip` GitHub Release on a version tag — no store-submission step. Not
      published yet.

## Already done

- [x] ~~Add multi-language support.~~ Already implemented — `src/content/extractor.ts` detects the
      page's language (`getPageLanguage`, `AppLanguage = 'en' | 'fr' | 'es'`) and formats the
      copied clipboard text and UI notifications (`src/content/content.ts`) through a full
      English/French/Spanish `i18n` table.
