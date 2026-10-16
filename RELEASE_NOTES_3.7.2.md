# v3.7.2

Reject unsupported wildcard URLs, including %2A, before HTTP eligibility checks or submission. Existing stored wildcard queues cannot resume through the property guard. Rename the mixed skip/error list to avoid implying skipped URLs failed.

Temporary removal requests only. Confirmation requires a new exact matching visible GSC row and can conservatively miss a submitted request; review in GSC before retry. Existing history is retained. No requests were cancelled or resubmitted during this update.
