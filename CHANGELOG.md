# v3.7.3 — 2026-10-17

- Preserve URL punctuation with quoted-field-aware CSV/TSV import. Reject malformed quoting.
- Canonicalize before deduplication: host case, default ports and fragments.
- 77 mock regression checks passed; no new live submissions.

# v3.7.2 — 2026-10-17

- Reject literal and percent-encoded asterisks in input, property/run guards, and background HTTP checks.
- Relabel the mixed skip/error list as Skipped / unsuccessful URLs.
- Preserve fail-closed exact-row confirmation; review uncertain requests in GSC before retrying.
- 39 automated mock regression checks passed; no new live removal requests submitted.

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
