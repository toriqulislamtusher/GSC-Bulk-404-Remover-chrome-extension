# GSC Bulk CSV Remover v3.7.1

A free Chrome Manifest V3 extension for submitting **temporary** Google Search Console URL removal requests from CSV/TXT files or pasted URLs. It automates the visible GSC interface; it does not use an official removal API.

## Download and install

1. Download [GSC_Bulk_Remover_v3_7_1.zip](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/releases/download/v3.7.1/GSC_Bulk_Remover_v3_7_1.zip) from the [v3.7.1 release](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/releases/tag/v3.7.1).
2. Extract the ZIP. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the extracted folder containing `manifest.json` (select the inner folder if necessary). Confirm the displayed version is **3.7.1**.
4. Review Chrome's website-access permissions. HTTP/HTTPS access is required for safety checks; restricted access prevents Start from proceeding.

## Use

1. Sign in to Search Console and open the intended property's **Removals** page. Only use properties and URLs you are authorized to manage.
2. Open the extension, upload a `.csv`/`.txt` file or paste one URL per line. Review the **New**, **Submitted**, and **Review** analysis, URL list, and selected property.
3. Set **Advanced settings**: submission limit 1–1000 (default 100), delay 1500–30000 ms (default 2500). The limit selects the first valid unique entries before local-history exclusions; it is not a guaranteed count of new submissions.
4. Click **Start**. Processing begins without a separate confirmation prompt. Before starting, the extension checks URL membership against the property's `resource_id` (domain/subdomains or URL prefix) and checks website access.
5. Monitor progress and review **Reports** and Search Console. **Confirmed** means visible GSC feedback was detected, not independent server-side verification or proof of disappearance from search.

## v3.7.1 features

- Persistent URL draft and uploaded filename, scrollable popup, and three-column URL analysis.
- Local-history exclusions for previously confirmed URLs and recorded active duplicates. Unverified prior requests require review and are not automatically retried.
- Separate active-duplicate classification when GSC displays its explicit duplicate-request dialog; this is not a complete scan of existing GSC requests.
- Batch timestamp, progress and percentage, plus Confirmed/Skipped/Failed/Remaining counters.
- Reports for current batch, all history, or a previous batch, with status filters and CSV/TXT export of the selected report.
- **Stop** preserves the queue. **Resume** requires the original GSC Removals tab, a responding content script, no detected open removal dialog, and no unverified queued request in that batch.
- **Reset** clears the current batch and draft after stopping, while preserving submission history. It does not cancel requests already sent to Google.

## Safety and limitations

- Immediately before each submission, the extension sends an HTTP GET with `redirect: manual`, `credentials: omit`, `cache: no-store`, and a 12-second timeout. Only explicit **404/410** responses are eligible. Live responses, redirects (including opaque redirects), blocked/unknown responses, and network errors are skipped without submission.
- This 404/410 policy is mandatory in this build, not a Google requirement. Browser responses may differ from Googlebot and vary with time, IP, user agent, or authentication. Verify the URLs yourself.
- Property matching checks the page URL and URL list; it does not independently verify ownership or permissions with Google. Review the intended property and removal scope yourself.
- Removals are temporary and do not delete website content. Permanent removal requires appropriate action on source content and indexing controls.
- Missing visible submission confirmation produces an unverified record and pauses processing. Check GSC manually before retrying. Stop cannot undo an already submitted request; review open dialogs before resuming.
- History is local and is not a complete GSC record. It does not sync across devices, Chrome profiles, or separately installed extension IDs. After manually checking GSC, use **I checked GSC — allow retry** on a history record to permit retry without erasing the record. Do not allow retry for a request that is still active. Resume is guarded, not guaranteed after tab reload, suspension, or browser interruption.
- Google interface or language changes may break automation. The code handles English and some Bengali labels, not every language. Do not bypass Google's controls or submit excessive requests.
- Input parsing supports simple comma-, semicolon-, or tab-separated fields and one URL per line; it is not a full quoted/multiline CSV parser.
- See [v3.7.1 validation](TEST_REPORT_3.7.1.md) for automated and Chrome local-harness test coverage. A user-started live Chrome batch completed with 9/9 Confirmed, 0 Failed, and 0 Remaining; all nine URLs appeared in GSC as Processing request. Other live safety scenarios remain untested. Test cautiously on a property you control.

## Permissions and privacy

The manifest declares `activeTab`, `scripting`, and `storage`, plus host access to `https://search.google.com/*`, `http://*/*`, and `https://*/*`. Chrome may show a broad website-access warning. The normal v3.7.1 flow checks required access at Start; it does not request optional per-domain access in a separate setup tab.

Draft URLs, filenames, settings, queue, progress, and history are stored in `chrome.storage.local`. History includes URLs, outcomes, reasons, HTTP statuses, batch IDs, and timestamps. Reports are generated locally and may contain sensitive URLs; exported files remain wherever you save them. Reset does not erase history.

Safety checks contact destination websites, which receive requested URLs and normal network metadata such as your IP address; request credentials are omitted. Google receives removal requests through your signed-in GSC session. The current code has no developer-operated upload endpoint, analytics, or telemetry and does not request passwords. See [PRIVACY.md](PRIVACY.md).

## More information

- [v3.7.1 release notes](RELEASE_NOTES_3.7.1.md)
- [Changelog](CHANGELOG.md)
- [Report an issue](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/issues): remove sensitive URLs and account information before posting.

## v3.7.1 fixes

- Revalidate the original property at Resume and before processing actions; legacy batches without a saved property must be restarted after review.
- Require a new exact-URL GSC request row for confirmation; generic success text is insufficient. If no matching row appears within eight seconds, pause as unverified.
- Derive Failed count from batch records and retain Pending report entries while stopped.
- Scope new history records by property and allow explicit manual retry review while preserving history. Legacy history without a property remains conservative across properties.
