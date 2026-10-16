## v3.4 Report & History

- Reports tab: confirmed, skipped, failed, unverified and pending URLs with reasons.
- Export filtered reports as CSV or TXT. History persists in local Chrome storage.
- Previously confirmed or unverified URLs are excluded from new runs until the user reviews their records.
- Confirmation is based on visible GSC UI feedback, not an official API acknowledgement.
- All HTTP safety checks remain fail-closed; 404/410-only mode is not a guarantee of Googlebot equivalence.
- Reports are local to this Chrome profile and may contain sensitive URLs.
- Existing 404/red-arrow/trash-bin icons preserved.

# GSC Bulk CSV Remover v3.2.0

A free, locally running Chrome Manifest V3 extension that helps submit temporary Google Search Console URL removal requests from CSV/TXT or pasted URL lists.

## Important
- Search Console removals are **temporary**, not permanent deletions. Remove or block the content appropriately if permanent removal is required.
- Only use on properties and URLs you are authorized to manage.
- **Review the selected Search Console property and URL list before starting.** This extension does not verify property ownership or URL membership automatically.
- Google can change Search Console's interface. If submission cannot be confirmed, the extension **pauses** rather than claiming success. Check the request in Search Console before restarting; avoid duplicate requests.
- Do not submit excessive requests or use the extension to bypass Google's controls.

## Install locally
1. Extract the ZIP.
2. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3. Select the extracted `GSC_Bulk_Remover_v3_2` folder (the folder containing `manifest.json`).
4. Open your property's Search Console **Removals** page.
5. Upload a `.csv` or `.txt`, or paste one URL per line; review the list.
6. Choose a limit and delay, then click **Start** and confirm.

## Notes
- The CSV parser handles simple comma/semicolon/tab-separated URL fields, not fully quoted multiline CSV records.
- The extension does not call a Google Search Console removal API; it interacts with the visible interface, which may vary by language and change over time.
- A confirmed counter requires visible page feedback; it is not a server-side verification.
- The extension stores its queue and counters in local Chrome extension storage.
- To publish an update, test on a property you control, increment the manifest version, and submit a new ZIP through Chrome Web Store Developer Dashboard.

## Changelog
### 3.2.0
- Safer submission confirmation and pause-on-uncertainty behavior.
- Fixed inline HTML event handler incompatible with MV3 extension CSP.
- Improved URL validation, duplicates, limits, and stop/reset safeguards.
- Refreshed UI and clearer temporary-removal warning.

## v3.3 safety mode
- Website access is requested at install/update time for HTTP safety checks; no separate access tab is used.
- Immediately before each submission, the extension fetches the URL with `redirect: manual` and `credentials: omit`. Only explicit 404/410 responses are eligible. 2xx, 3xx, opaque redirects, network errors, blocked or unknown statuses are skipped.
- Skipped URLs are counted under Failed and listed with their reason; they are **not** submitted.
- IMPORTANT: browser requests may differ from Googlebot responses; a 404/410 can be transient or vary by user-agent, IP, or authentication. Verify the URLs yourself before using this tool.
- HTTP 404/410 is an optional conservative policy, **not** a Google Search Console requirement. A temporary removal is not permanent deletion.
- This extension uses UI automation, which may break when Search Console changes. Test in a controlled property before publishing.

### Website permissions (v3.5.6)
This edition requires HTTP/HTTPS host access at install/update time to verify submitted URL statuses without per-domain prompts. Chrome may display a broad website-access warning. Users can restrict access in Chrome, in which case Start fails closed. This permission may require additional Chrome Web Store review and justification.
