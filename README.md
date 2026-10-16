# GSC Bulk CSV Remover

**A free Chrome extension for managing bulk temporary URL removal requests in Google Search Console.**

GSC Bulk CSV Remover helps SEO professionals, website owners, and webmasters simplify repetitive URL removal tasks through an easy-to-use Chrome extension.

Instead of manually submitting URLs one at a time, users can prepare a list of URLs and automate the submission workflow directly within Google Search Console.

> **Disclaimer:** This is an independent extension and is not affiliated with, endorsed by, or sponsored by Google.

## Key Features

- **Bulk URL Submission:** Process multiple URL removal requests in one workflow.
- **CSV & TXT Import:** Upload a list of URLs from CSV or TXT files.
- **Manual URL Entry:** Paste URLs directly into the extension.
- **Custom Submission Limit:** Control the number of URLs processed.
- **Adjustable Step Delay:** Configure delays between automated actions.
- **Progress Tracking:** Monitor processing counts and workflow status.
- **Start & Stop Controls:** Manage the submission process from the extension popup.
- **Local Browser Storage:** Store workflow settings and URL queues locally.

## How It Works

1. Install the GSC Bulk CSV Remover extension in Google Chrome.
2. Sign in to [Google Search Console](https://search.google.com/search-console).
3. Select a website property you are authorized to manage.
4. Navigate to **Indexing → Removals**.
5. Open the extension popup.
6. Paste your URLs or import a CSV/TXT file.
7. Configure the submission limit and step delay.
8. Click **Start** to begin processing removal requests.
9. Monitor the progress and review the requests in Google Search Console.

**Important:** Only submit removal requests for websites and properties you own or are authorized to manage.

## Installation

### Chrome Web Store

The extension has been submitted to the Chrome Web Store and is currently awaiting review.

Once approved, the official installation link will be added here.

### Manual Installation (Developer Mode)

1. Download or clone this GitHub repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. The extension will appear in your Chrome extensions list.

## Project Structure

```text
GSC-Bulk-Remover-chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
└── background.js
```

The exact files included may vary by release.

## Permissions

The extension uses Chrome permissions to support its core functionality:

| Permission | Purpose |
|---|---|
| `activeTab` | Access the active browser tab when the user starts the workflow |
| `scripting` | Execute packaged scripts within the relevant page |
| `storage` | Save workflow settings and processing information locally |
| Google Search Console host access | Interact with the Search Console URL removal interface |

Permissions are intended to support the extension's stated functionality.

## Privacy & Data Handling

GSC Bulk CSV Remover is designed to process user-provided URLs through Google Search Console.

Workflow information, including URL queues and settings, is stored locally in Chrome.

The extension does not require a separate user account or operate a developer-controlled server for storing submitted URL lists.

For additional information, read the [Privacy Policy](PRIVACY.md).

## Important Information About URL Removals

Google Search Console's Removals tool is intended for temporary removal requests.

**Submitting a removal request does not guarantee permanent removal of a URL from Google's index.**

For permanent removal, website owners may need to remove or update the content, return an appropriate HTTP status code, or apply other indexing controls in accordance with Google's guidelines.

Always verify the status of submitted requests directly in Google Search Console.

## Responsible Use

- Use the extension only with authorized Search Console properties.
- Review URL lists carefully before starting bulk submissions.
- Avoid submitting requests for URLs that should remain visible in search results.
- Understand that automated submissions may fail due to interface changes, account permissions, or Google-imposed restrictions.
- Follow Google's applicable terms and policies.

## Support & Bug Reports

Found a bug or have a feature suggestion?

[Open a GitHub Issue](https://github.com/toriqulislamtusher/G
