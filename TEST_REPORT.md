# GSC Bulk Remover v3.6.0 - Test report

Automated tests run against popup JavaScript with mocked Chrome APIs (not a live Google account):
- Initial popup state: PASS
- URL parsing and duplicate input filtering: PASS
- Mixed batch: prior confirmed URL excluded, new URL queued: PASS
- Stop state: PASS
- Reset preserves history: PASS
- All confirmed duplicates produce clear explanation: PASS
- Wrong Search Console property rejected: PASS
- Orphaned processing state recovered: PASS
- Reports tab initialization: PASS
- JavaScript syntax checks: PASS (popup, content, background)
- Manifest/ZIP/icon validation: PASS

Limitations: Chromium browser navigation was blocked by environment policy, so browser end-to-end test could not run. Chrome permission prompts, live HTTP checks, GSC UI interaction, submission confirmation and popup reopen are NOT independently verified. Do not call this version bug-free or publish without controlled live testing.
