# GSC Bulk Remover v3.7.0 — Release Candidate

## Improvements
- Persistent CSV draft, clearer 3-column URL analysis and responsive popup sections.
- Separate active-GSC duplicate classification and report filter.
- Current batch progress and percentage, 4-category summary, timestamp and preserved local history.
- Guarded Resume: requires original GSC tab, no open removal dialog, and no unverified queued request.
- Stop retains queue. Reset clears the current batch, not historical submissions.

## Important limits
- GSC UI automation is unofficial and may break when Google changes dialogs or localizes buttons.
- Browser tab suspension and service-worker lifecycle may interrupt automation; resume is guarded, not guaranteed.
- Only HTTP 404/410 responses are eligible; redirects/opaque/network errors are skipped.
- Local history does not sync across separately installed extension IDs or devices.
- This build has not been tested by submitting real requests in a signed-in GSC account.
