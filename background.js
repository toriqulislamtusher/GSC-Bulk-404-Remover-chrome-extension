'use strict';
// Fail closed: no 2xx, 3xx, network failures, opaque redirects, or unknown responses can pass.
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.action !== 'CHECK_URL_SAFETY') return;
  (async () => {
    try {
      const url = new URL(message.url);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw Error('Invalid URL');
      if (/\*|%2a/i.test(url.href)) throw Error('Wildcard URLs are unsupported; provide individual URLs');
      const origin = `${url.origin}/*`;
      if (!(await chrome.permissions.contains({origins:[origin]}))) throw Error('Website access not granted');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      let response;
      try { response = await fetch(url.href, {method:'GET',redirect:'manual',cache:'no-store',credentials:'omit',signal:controller.signal}); }
      finally { clearTimeout(timer); }
      const status = response.status;
      const eligible = response.type !== 'opaqueredirect' && (status === 404 || status === 410);
      respond({eligible, status:response.type === 'opaqueredirect' ? 'redirect (opaque)' : status,
        reason: eligible ? 'HTTP 404/410 verified' : 'Live, redirected, blocked, or unverified URL'});
    } catch(e) { respond({eligible:false,status:'unknown',reason:e.message || 'Network error'}); }
  })();
  return true;
});
