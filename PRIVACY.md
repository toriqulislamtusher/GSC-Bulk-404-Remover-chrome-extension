# Privacy policy — GSC Bulk CSV Remover

The extension processes URL lists entered or uploaded by the user in the browser. It stores the processing queue, progress, and preferences locally using `chrome.storage.local`. It interacts with the active Google Search Console page to submit user-initiated removal requests. It does not intentionally transmit URL lists to the developer or any third-party analytics service. Google receives removal requests submitted through its own Search Console interface. The extension does not request account passwords.

For questions, use the project's GitHub Issues page. Review this policy if future versions introduce new features or data transfers.

Version 3.3 asks for optional website access to the URL origins you choose, solely to check their HTTP response before submitting removal requests. These checks send HTTP GET requests to the destination websites. No remote server controlled by the extension developer receives your URL list.
