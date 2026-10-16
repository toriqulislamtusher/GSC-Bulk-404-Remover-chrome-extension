'use strict';
// Shared, idempotent guards for popup and injected content script.
globalThis.GscSafety = Object.freeze({
  concrete(raw) {
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol) && !!url.hostname &&
        !url.username && !url.password && !/\*|%2a/i.test(url.href);
    } catch { return false; }
  },
  property(raw) {
    try {
      const page = new URL(raw);
      if (page.protocol !== 'https:' || page.hostname !== 'search.google.com' ||
          !/^\/(?:u\/\d+\/)?search-console\/removals\/?$/.test(page.pathname)) return null;
      const value = page.searchParams.get('resource_id');
      if (!value) return null;
      if (value.startsWith('sc-domain:')) {
        const domain = value.slice(10).toLowerCase();
        if (!domain || !/^[a-z0-9.-]+$/.test(domain)) return null;
        return 'sc-domain:' + domain;
      }
      const prefix = new URL(value);
      if (!['http:', 'https:'].includes(prefix.protocol) || prefix.username || prefix.password) return null;
      return prefix.href;
    } catch { return null; }
  },
  belongs(property, raw) {
    try {
      const url = new URL(raw);
      if (!this.concrete(raw) || !property) return false;
      if (property.startsWith('sc-domain:')) {
        const domain = property.slice(10);
        return url.hostname === domain || url.hostname.endsWith('.' + domain);
      }
      const prefix = new URL(property);
      return url.origin === prefix.origin && url.href.startsWith(prefix.href);
    } catch { return false; }
  }
});
