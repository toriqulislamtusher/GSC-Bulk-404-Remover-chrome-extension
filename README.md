# GSC Bulk CSV Remover

**Free Chrome extension for bulk URL removal requests in Google Search Console.**

Import a CSV or TXT file, or paste URLs, to simplify repetitive temporary removal submissions. Built for SEO professionals, website owners, and webmasters managing their Search Console properties.

**Price: Free. No purchase or subscription is required to use this extension.** You need a Google account with access to the relevant Search Console property.

[Installation](#installation) · [Usage](#how-to-use) · [Privacy Policy](PRIVACY.md) · [Support](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/issues)

> Independent project by Toriqul Islam Tusher. Not affiliated with, endorsed by, or sponsored by Google.

## Features

- Bulk temporary URL removal submissions through the Google Search Console interface.
- CSV and TXT import, plus manual URL entry.
- Adjustable submission limit and delay between actions.
- Progress tracking and Start/Stop controls.
- Local browser storage for workflow settings and URL queues.

## Installation

### Chrome Web Store

The Chrome Web Store installation link is not available in this repository yet. Until it is added, use the free manual installation below.

### Free manual installation

1. On this repository page, click **Code → Download ZIP**.
2. Extract the ZIP. Do not select the ZIP itself during installation.
3. In Chrome, open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted folder containing `manifest.json`.
7. Pin **GSC Bulk CSV Remover** from Chrome's Extensions menu for easy access.

Keep the extracted folder on your computer while using the extension.

## How to use

1. Sign in to [Google Search Console](https://search.google.com/search-console).
2. Select a property you own or are authorized to manage.
3. Open **Indexing → Removals**.
4. Open the extension and paste URLs or import your CSV/TXT file.
5. Review the URL list carefully. Exclude URLs that should remain visible in search.
6. Configure the limit and delay. Start with a small test batch.
7. Click **Start** and monitor progress. Use **Stop** to interrupt the workflow.
8. Verify the request status directly in Search Console before retrying any URLs.

## Important: temporary removal

This extension helps submit removal requests. It does not delete website pages, guarantee permanent removal from Google Search, improve rankings, or submit URLs for indexing.

For permanent removal, address the underlying page and indexing settings using the appropriate method for your website. Review [Google's official Removals tool documentation](https://support.google.com/webmasters/answer/9689846) before submitting requests.

Only use authorized properties. The extension does not bypass Google's permissions, limits, or review process. Automated actions may fail because of interface changes, permissions, or restrictions.

## Privacy

Read the [Privacy Policy](PRIVACY.md) for data-handling information. Removal requests are submitted to Google through your signed-in Search Console session.

## Troubleshooting

- **Nothing happens:** check that you are on the correct property's Removals page.
- **Requests fail:** stop the workflow and check the page for errors, restrictions, or missing permissions.
- **Some URLs were not processed:** check Search Console before retrying to avoid duplicate requests.
- **The workflow breaks after an interface change:** report the steps to reproduce it through the support link below.

Redact private domains, URL lists, account details, and sensitive screenshots when reporting problems.

## Frequently asked questions

### Is it free?

Yes. No purchase or subscription is required to use this extension.

### Can I remove URLs from any website?

No. You must have the required permissions for the selected Search Console property.

### Is this an official Google extension?

No. This is an independent project.

### Does this permanently remove URLs?

No. It assists with temporary removal requests. Review Google's documentation for the appropriate permanent removal method.

## Support

[Open a GitHub issue](https://github.com/toriqulislamtusher/GSC-Bulk-Remover-chrome-extension/issues) for bug reports, installation questions, or feature suggestions.

Developed by [Toriqul Islam Tusher](https://github.com/toriqulislamtusher).
