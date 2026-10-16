# v3.7.1 — 2026-10-17

Property guards, exact-URL confirmation, corrected counters/Pending reports, and explicit retry review. See RELEASE_NOTES_3.7.1.md and TEST_REPORT_3.7.1.md.

# v3.5.9 changes

- Preview new, previously confirmed and unverified URLs before Start.
- Previously confirmed URLs are not submitted again; show explicit all-duplicate message.
- Unverified URLs are excluded and flagged for manual review; new URLs in same batch can continue.
- Current batch and All history report scopes.
- Separate already submitted and needs review counts in batch report.
- Reset clears current batch, not historical submissions.
- CSV/TXT export respects report scope and status filters.

Important: this extension automates a changing Google Search Console UI. Use a test property before production use.
