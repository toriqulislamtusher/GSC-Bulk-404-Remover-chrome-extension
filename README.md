# GSC Bulk CSV Remover — Google Search Console Bulk URL Removal Chrome Extension

**Version 3.7.2 · Maintained by [toriqulislamtusher](https://github.com/toriqulislamtusher) · Guide checked: October 17, 2026**

GSC Bulk CSV Remover is a free **Google Search Console bulk URL removal Chrome extension** for website owners and SEO teams managing URLs they are authorized to remove. Import a CSV/TXT file or paste a URL list to submit temporary removal requests for URLs that pass the extension’s HTTP 404/410 check. It automates the visible Search Console interface; it does not use an official removal API.

This independent project is not an official Google product. The guide was prepared with AI assistance and checked against the v3.7.2 source and the test evidence below.

## Start here: download → extract → install → use

You need **Google Chrome on a computer** and a Google account with permission to use **Removals** for your website in Google Search Console. This guide covers manual installation from GitHub. A Chrome Web Store installation link is not available in this README.

> **Before starting:** this tool sends temporary removal requests to Google. It does not delete website files. Review every URL and test with 1–3 URLs on a property you manage first. Only URLs returning HTTP **404 or 410** can pass this build’s safety check.

Wildcard patterns (`*` or encoded `%2A`) are unsupported and rejected. Supply individual URLs. A skipped URL is not a failed submission. A confirmed GSC request may still be processing. If a prior request is marked Review, check its exact URL in GSC; do not allow retry when the request already exists.

### 1. Download the extension

**[Download GSC Bulk Remover v3.7.2 ZIP](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/releases/download/v3.7.2/GSC_Bulk_Remover_v3_7_2.zip)**

Alternatively, open the [v3.7.2 release page](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/releases/tag/v3.7.2), expand **Assets**, and choose **GSC_Bulk_Remover_v3_7_2.zip**. Use that named extension ZIP for this guide; GitHub also lists automatic source-code archives.

### 2. Extract the ZIP into a folder you will keep

1. Find the downloaded ZIP, usually in **Downloads**.
2. On Windows, right-click it → **Extract All…** → choose a permanent folder → **Extract**. On macOS, double-click the ZIP to extract it, then move the extracted folder somewhere you will keep it.
3. Open the extracted folder and check that you can see **manifest.json**, **popup.html**, **popup.js**, and the **icons** folder. If these files are inside another folder, open that inner folder.

**Keep this extracted folder after installation.** Chrome loads the extension from it. Do not select the ZIP itself, move the folder, or delete it while using the extension.

### 3. Install in Chrome

1. Open Chrome, type **chrome://extensions** in the address bar, and press **Enter**.
2. Turn on **Developer mode** in the upper-right corner.
3. Click **Load unpacked** in the upper-left area.
4. Select the extracted folder that directly contains **manifest.json**, then confirm the folder selection.
5. Check that **GSC Bulk CSV Remover** appears, is enabled, and shows version **3.7.2**.
6. Click Chrome’s **Extensions** puzzle icon beside the address bar, then pin **GSC Bulk CSV Remover** so you can open it easily.

Chrome may show a broad website-access warning because this build checks HTTP/HTTPS URLs. Review the [permissions and privacy information](#permissions-and-privacy) before using it. Managed work or school browsers may prevent Developer mode or manual extension installation; ask your administrator if these controls are unavailable.

### 4. Open the correct website in Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and sign in.
2. Choose the website/property that owns the URLs you want to remove.
3. In the left menu, open **Indexing → Removals**.
4. Keep that tab open and stay on the same property while the batch runs. Close any existing removal dialog before starting.
5. Click the pinned **GSC Bulk CSV Remover** icon.

### 5. Add URLs and start a small batch

Paste full URLs, one per line, or click **Upload CSV / TXT** and choose a file. Uploaded files must be no larger than **2 MB**. A plain TXT file with one URL per line is the simplest format:

```text
https://your-website.com/old-page-1/
https://your-website.com/old-page-2/
```

Replace these example URLs with your own. URLs must begin with **http://** or **https://** and belong to the selected Search Console property.

Review the URL analysis before starting:

| Label | What it means |
| --- | --- |
| **New** | No blocking local history was found. This does not yet mean its HTTP check passed. |
| **Submitted** | Local history records a confirmed request or active duplicate. It will be excluded from new requests. |
| **Review** | A previous request has an uncertain outcome. Check it in GSC before allowing any retry. |

1. Expand **Advanced settings**. For your first test, set **Submission limit** to **1–3** and leave **Delay** at **2500 ms**.
2. Check the selected property and URL list again.
3. Click **Start**. **There is no second confirmation prompt:** processing starts immediately.
4. The extension checks each URL’s HTTP status before attempting a request. Live pages, redirects, blocked responses, and network errors are skipped.
5. Leave Chrome and the original GSC tab open. Avoid switching properties, reloading the tab, or manually using GSC’s request dialogs while the batch runs. You can reopen the popup to inspect progress.

Available limits: **1–1000** entries (default **100**); delay: **1500–30000 ms** (default **2500**). The limit selects the first valid unique entries before history exclusions; it is not a guaranteed number of new submissions.

### 6. Check results and save a report

- When the queue finishes, the popup shows **Completed** and **Remaining 0**. Check the outcome counts and the **Reports** tab.
- **Confirmed** means a new matching request row was detected in GSC. Google may still show **Processing request**; this does not prove removal from search is complete.
- **Skipped** URLs were not newly submitted by the extension. Read their reasons in Reports.
- **Failed** or **Unverified** entries need attention. Inspect GSC before retrying; a request may already have reached Google.
- In **Reports**, choose **Current batch**, **All history**, or **Previous batch**, select a status filter if needed, then click **Export CSV** or **Export TXT**. Keep reports private if they contain sensitive URLs.

### Stop, Resume, Reset, and retry

- **Stop:** stops further processing and keeps the remaining queue. It cannot undo a request already sent.
- **Resume:** continues the saved queue only when the original GSC tab/property is available, no removal dialog is open, and no unresolved unverified queued request blocks it.
- **Reset:** use after stopping to clear the current batch and input draft. It keeps historical submission records and does not cancel requests in GSC.
- **I checked GSC — allow retry:** available on eligible history records in Reports. Use only after manually checking GSC and deciding a retry is appropriate. It preserves the historical record and allows retry; it does not submit a request by itself. Do not use it for a request that is still active.

## Common installation and usage problems

| What you see | What to do |
| --- | --- |
| “Manifest file is missing or unreadable” / “Could not load manifest” | Extract the ZIP first. Select the folder directly containing manifest.json, not its parent folder or the ZIP. |
| No Load unpacked button | Turn on Developer mode on chrome://extensions. If your organization blocks it, contact your administrator. |
| Extension icon is missing | Open Chrome’s Extensions menu, check the extension is enabled, and pin it. |
| “Open the Google Search Console Removals page first” | Open the correct property’s Removals page, make that tab active, and reopen the extension. |
| URLs do not match the selected property | Choose the right GSC property and check the URLs’ protocol, host, and path. Do not submit URLs you do not manage. |
| Website access is restricted | Open chrome://extensions → GSC Bulk CSV Remover → Details → Site access. This build’s Start message asks for On all sites; review the broad access described below before granting it. |
| URLs are skipped | Read the HTTP status/reason in Reports. Only verified 404/410 responses qualify; a redirect or a visually similar “not found” page is insufficient. |
| Processing pauses or Resume is unavailable | Check GSC for an already-sent request and any open dialog. Return to the original tab/property. Review unverified outcomes before retrying. |
| Everything says Submitted or Review | Inspect local history in Reports and GSC. Reset does not erase history or make those URLs automatically eligible again. |

## Updating an existing manual installation

1. Stop any active batch and **export reports/history before updating**.
2. Download and extract the new release into a temporary folder.
3. Copy the new version’s files into the **same folder already loaded in Chrome**, replacing the matching files. Keep the original folder path.
4. Open **chrome://extensions**, find the extension, and click its **Reload** control. Check the displayed version.
5. Reload the GSC page before starting a fresh reviewed batch. Old batches without saved property information cannot Resume in v3.7.2.

Avoid removing/reinstalling the extension or loading a second copy from a different folder unless you intend to use a separate installation. Local history may not transfer to another extension ID, Chrome profile, or device. A CSV/TXT report is a backup for your reference; this version has no history-import feature.

## v3.7.2 features

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
- See [v3.7.2 validation](TEST_REPORT_3.7.2.md) for automated mock test coverage; earlier v3.7.1 browser observations are described separately. A user-started live Chrome batch completed with 9/9 Confirmed, 0 Failed, and 0 Remaining; all nine URLs appeared in GSC as Processing request. Other live safety scenarios remain untested. Test cautiously on a property you control.

## Permissions and privacy

The manifest declares `activeTab`, `scripting`, and `storage`, plus host access to `https://search.google.com/*`, `http://*/*`, and `https://*/*`. Chrome may show a broad website-access warning. The normal v3.7.2 flow checks required access at Start; it does not request optional per-domain access in a separate setup tab.

Draft URLs, filenames, settings, queue, progress, and history are stored in `chrome.storage.local`. History includes URLs, outcomes, reasons, HTTP statuses, batch IDs, and timestamps. Reports are generated locally and may contain sensitive URLs; exported files remain wherever you save them. Reset does not erase history.

Safety checks contact destination websites, which receive requested URLs and normal network metadata such as your IP address; request credentials are omitted. Google receives removal requests through your signed-in GSC session. The current code has no developer-operated upload endpoint, analytics, or telemetry and does not request passwords. See [PRIVACY.md](PRIVACY.md).

## Maintainer, testing, and support

- **Project maintainer:** [toriqulislamtusher](https://github.com/toriqulislamtusher). Review the [source code and change history](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/commits/main/) before granting website access.
- **Observed experience:** in one user-started Chrome v3.7.1 batch, the popup reached **9/9 Confirmed, 0 Failed, 0 Remaining**. The same nine URLs appeared in GSC as **Processing request**. This is one observed batch, not proof that every property or Google interface variant works.
- **Automated checks:** 39 isolated regression checks passed for URL/property guards, status gating, history handling, counters, and confirmation logic. See the [test report and its remaining limitations](TEST_REPORT_3.7.2.md).
- **Privacy and support:** read [PRIVACY.md](PRIVACY.md) and [report reproducible issues](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/issues). Include the extension version and error text; redact private URLs and account details.
- **Official reference:** Google’s [Removals tool documentation](https://support.google.com/webmasters/answer/9689846?hl=en) explains temporary removal and the steps needed for permanent removal. Google controls request processing and search results.

## Frequently asked questions

### How do I bulk-submit URL removal requests in Google Search Console?

Install the Chrome extension, open the correct GSC property’s Removals page, and import a CSV/TXT file or paste full URLs. Review the list and start a small batch first. This extension processes the requests through GSC’s visible interface and only attempts URLs with verified HTTP 404/410 responses.

### Can I permanently remove URLs from Google with this extension?

No. It submits temporary removal requests; it does not delete website content or guarantee permanent deindexing. Follow Google’s official removal guidance and address the source content and indexing controls for a permanent outcome.

### Can I use this CSV URL removal tool for live pages or redirects?

This build skips live responses, redirects, and responses it cannot verify. Its 404/410-only restriction is an extension safety policy, not a general Google requirement. Check the reason in Reports if a URL is skipped.

### Does using the extension improve Google rankings?

The extension submits removal requests; it does not improve rankings, guarantee indexing changes, or guarantee approval. Use it to manage authorized temporary removals, not as a ranking promise.

## More information

- [v3.7.2 release notes](RELEASE_NOTES_3.7.2.md)
- [Changelog](CHANGELOG.md)
- [Report an issue](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/issues): remove sensitive URLs and account information before posting.

## v3.7.2 fixes

- Revalidate the original property at Resume and before processing actions; legacy batches without a saved property must be restarted after review.
- Require a new exact-URL GSC request row for confirmation; generic success text is insufficient. If no matching row appears within eight seconds, pause as unverified.
- Derive Failed count from batch records and retain Pending report entries while stopped.
- Scope new history records by property and allow explicit manual retry review while preserving history. Legacy history without a property remains conservative across properties.

## v3.7.2 validation

39 automated VM/mock regression checks passed against the shipping source, plus JavaScript syntax checks. This is not a new live submission test or a guarantee of compatibility with every GSC interface. The earlier observed v3.7.1 batch completed 169 entries: 110 confirmed, 49 skipped, 9 previously submitted, 1 prior request requiring review. That prior URL was subsequently visible in GSC.
