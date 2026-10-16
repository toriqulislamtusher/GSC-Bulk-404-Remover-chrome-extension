# v3.6.3 - Dialog workflow and popup layout

- Recognizes the two separate GSC dialogs: New Request and Remove URL? confirmation.
- Locates Submit Request inside the confirmation dialog and verifies the dialog contains the exact queued URL before clicking.
- Does not resume blindly if a previous removal dialog is still open; prompts the user to inspect and close it.
- Uses new visible request rows or explicit acknowledgement as evidence of submission, rather than assuming clicking Submit means success.
- Adjusts popup dimensions and layout to keep the URL summary and progress panel visible.

## Limitations
- Google Search Console has no public removals submission API for this extension; UI selectors may change.
- No authenticated live Google Search Console end-to-end test has been performed.
- A click whose result cannot be verified is marked unverified and paused to avoid duplicate requests.
- Install the new folder as an unpacked extension only after exporting history from the old extension. A new extension ID may not share local history.
