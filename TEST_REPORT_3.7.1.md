# v3.7.1 test report — 2026-10-17

Status: 34 automated checks passed; local Chrome harness tested; one manually started live batch observed to completion.

## Changes

- safety.js shares property parsing and URL-membership rules between popup and content script.
- Start saves the selected property. Resume rejects property changes and old batches with no saved property. Each processing guard rechecks the property and queued URL membership.
- Submission confirmation requires a new exact-URL request row with the confirmation dialog closed. Generic page success text no longer counts. Polls for up to eight seconds, then pauses as unverified.
- Failed count is derived from current-batch failure records.
- Stopped queued entries remain in Pending reports.
- New history records include property scope. Explicit manual GSC review can allow retry while preserving historical outcomes. Old unscoped history remains conservative.
- Version bumped to 3.7.1. Original ZIP and published v3.7.0 release/tag are unchanged. This report accompanies the v3.7.1 source update.

## Automated verification

34 isolated checks passed, including domain/prefix boundary checks, credential rejection, Start property persistence, Stop queue retention, stopped Pending visibility, changed-property Resume rejection, original-property Resume, Failed count, property-scoped history, explicit manual retry, Reset preservation, restricted permission handling, HTTP status gating, opaque redirect/network failure rejection, active-run property drift, exact-URL confirmation, and old-row rejection. Four shipping JavaScript files passed syntax checks.

## Chrome local harness

The unchanged shipping popup HTML/JS and safety.js ran in Chrome using a separate localhost harness that simulates Chrome APIs. No GSC requests were possible in this harness. Verified:

- Mixed valid/invalid/duplicate input: two unique valid entries and two ignored entries.
- Initial analysis: one New and one Review.
- Start then Stop: one queue entry retained, one Review exclusion.
- Pending report still contains the queued URL after Stop.
- Manual review changes analysis to two New, zero Review without deleting history.
- Resume/Stop actions and Pending filter were exercised.
- Browser console contained no warnings/errors when inspected.
- CSV export was clicked, but download completion could not be confirmed because the browser tool timed out. Export download is not counted as passed.

## Outstanding verification

The user loaded v3.7.1 and manually started a nine-URL batch. The actual extension reached Completed, 100%, Confirmed 9, Skipped 0, Failed 0, Remaining 0. All nine URLs appeared in the signed-in GSC table as Temporarily remove URL / Processing request on Oct 17, 2026. The assistant observed without initiating requests. This validates the observed normal submission flow, not Google removal completion. Installed file hashes were not independently compared. Live Stop/Resume, property switching, rejection cases, permission changes, and lifecycle interruption tests remain incomplete.

The package contains no harness or mocked Chrome APIs. Start with small, controlled batches; untested live safety scenarios remain as described above.
