# Privacy policy — GSC Bulk CSV Remover v3.7.0

## Local data

The extension processes URL lists entered or uploaded by the user in the browser. It uses `chrome.storage.local` for draft URLs and uploaded filenames, preferences, the processing queue, progress, batch metadata, and submission history. History contains URLs, outcomes, reasons, HTTP statuses, batch IDs, and timestamps.

Records remain local to the extension installation in the Chrome profile; the extension does not sync them across devices, profiles, or separately installed extension IDs. Reports are generated locally and can be exported as CSV/TXT. URLs and reports may contain sensitive paths or query parameters. Exported files remain wherever the user saves them.

**Clear URLs** clears the input draft. **Reset** clears the current batch and draft but preserves history; neither is a complete data-erasure control. The popup has no history-deletion control. Use Chrome's extension removal controls to remove stored extension data and delete exported reports separately. Clearing local data does not cancel requests already submitted to Google.

## Permissions and network requests

Version 3.7.0 declares `activeTab`, `scripting`, and `storage`, with required host permissions for `https://search.google.com/*`, `http://*/*`, and `https://*/*`. Broad website access supports HTTP checks on URLs in the user's list. This is not optional per-origin access in the normal workflow; Chrome site-access restrictions can prevent processing.

Before each removal submission, the background script sends an HTTP GET to the destination URL with `credentials: omit`, `redirect: manual`, `cache: no-store`, and a 12-second timeout. The destination receives the requested URL (including query parameters sent in the HTTP request) and ordinary network information such as the user's IP address. Cookies and other request credentials are omitted for these checks. Only explicit 404/410 responses are eligible for submission.

The extension interacts with the active Google Search Console page to submit user-initiated removal requests through the user's signed-in session. Google receives those URLs and handles requests through its own service. The extension does not request account passwords.

The current code contains no developer-operated data collection endpoint, analytics, or telemetry. It does not upload URL lists or reports to the developer. Destination websites and Google still receive the requests described above.

## Questions

Use the project's [GitHub Issues page](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/issues). Do not post sensitive URLs, exported reports, or account information in public issues. Review this policy when updating to a version with different features or data transfers.
