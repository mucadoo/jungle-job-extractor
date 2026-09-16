# Roadmap

Open items collected from outside feedback, checked against the current code before being added
here — anything already handled is left out rather than listed as done.

## Open

Nothing here right now — the two items originally captured (cross-browser testing on Firefox/Edge,
and publishing to the Chrome Web Store) are QA/store-submission actions rather than code changes,
so they moved back to Light Brain as personal/ops tasks instead. (Manifest V3 is broadly supported
on both browsers already, per the README's "Loading into Chrome" instructions — worth noting if
either comes up again: Firefox 109+ and Edge, Chromium-based, likely close to drop-in.)

## Already done

- [x] ~~Add multi-language support.~~ Already implemented — `src/content/extractor.ts` detects the
      page's language (`getPageLanguage`, `AppLanguage = 'en' | 'fr' | 'es'`) and formats the
      copied clipboard text and UI notifications (`src/content/content.ts`) through a full
      English/French/Spanish `i18n` table.
