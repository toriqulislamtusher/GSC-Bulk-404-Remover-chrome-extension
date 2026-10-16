# v3.7.3

Fix CSV URL truncation at commas/semicolons and canonical duplicate variants. Paste one URL per line. Multi-column CSV requires a header, or a quoted first cell; quote delimiter-containing fields. Headerless unquoted URL lines retain their full punctuation. Malformed quoting is rejected. Prior safety guards and history remain. 77 mock checks passed; v3.7.3 was not live-submission tested.
