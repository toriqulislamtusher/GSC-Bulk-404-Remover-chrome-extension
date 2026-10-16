# GSC Bulk Remover v3.7.0 validation

Passed:
- `node --check` for popup.js, content.js and background.js
- Manifest JSON parsing, icon presence, required popup element checks
- ZIP CRC integrity
- Static checks for guarded resume, GSC duplicate classification, historical batch filtering, progress and safety gating

Not completed:
- Chromium visual UI test (browser environment blocked navigation)
- Authenticated Google Search Console submission or tab-switching E2E test

This is a release candidate, not a guarantee of zero bugs.
