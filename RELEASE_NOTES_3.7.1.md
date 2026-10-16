# GSC Bulk CSV Remover v3.7.1

- Revalidate original GSC property on Resume and throughout processing.
- Confirm submissions only from new exact-URL GSC request rows; pause on uncertainty.
- Correct Failed counters and stopped-queue Pending reports.
- Scope new history by property and add explicit manual retry review without deleting history.
- Remove unused permission-setup files and superseded release/test/UI notes from main. Historical versions remain in Git history and the v3.7.0 release.

Validation: 34 automated checks passed; Chrome local-harness UI tested; a user-started live batch was observed at 9/9 Confirmed, zero Failed/Remaining, with nine matching GSC Processing request rows. Google removal completion is not verified. Live safety edge cases and export download completion remain unverified. See TEST_REPORT_3.7.1.md.
