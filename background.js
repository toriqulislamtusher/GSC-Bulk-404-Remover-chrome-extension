chrome.action.onClicked.addListener((tab) => {
  if (!tab.url || !tab.url.includes("search.google.com/search-console")) {
    alert("অনুগ্রহ করে আগে Google Search Console-এর Removals পেজে যান, তারপর এক্সটেনশন আইকনে ক্লিক করুন!");
    return;
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: initGscRemoverPanel
  });
});

function initGscRemoverPanel() {
  if (document.getElementById('gsc-remover-panel')) {
    document.getElementById('gsc-remover-panel').remove();
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'gsc-remover-panel';
  panel.style.cssText = 'position:fixed;top:70px;right:25px;width:340px;background:#fff;border:2px solid #1a73e8;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,0.25);z-index:999999;font-family:Arial,sans-serif;padding:15px;';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <strong style="color:#1a73e8;font-size:15px;">🚀 GSC Bulk CSV Remover</strong>
      <button id="gsc-close" style="background:none;border:none;font-size:16px;cursor:pointer;color:#555;">✖</button>
    </div>
    <div style="background:#e8f0fe;border:1px dashed #1a73e8;padding:10px;text-align:center;border-radius:6px;margin-bottom:10px;">
      <label for="gsc-csv" style="color:#1a73e8;font-weight:bold;font-size:12px;cursor:pointer;display:block;">📁 CSV অথবা TXT ফাইল আপলোড করুন</label>
      <input type="file" id="gsc-csv" accept=".csv,.txt" style="display:none;">
      <div id="gsc-fname" style="font-size:11px;color:#555;margin-top:4px;">কোনো ফাইল সিলেক্ট করা হয়নি</div>
    </div>
    <textarea id="gsc-urls" placeholder="অথবা এখানে প্রতি লাইনে একটি করে 404 URL পেস্ট করুন..." style="width:100%;height:110px;box-sizing:border-box;padding:8px;font-size:11px;border:1px solid #ccc;border-radius:4px;margin-bottom:8px;font-family:monospace;"></textarea>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:12px;">
      <span>Step Delay (ms):</span>
      <input type="number" id="gsc-delay" value="2000" step="500" style="width:70px;padding:4px;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div style="display:flex;gap:8px;">
      <button id="gsc-start" style="flex:1;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:4px;font-weight:bold;cursor:pointer;">Start</button>
      <button id="gsc-stop" style="flex:1;padding:9px;background:#d93025;color:#fff;border:none;border-radius:4px;font-weight:bold;cursor:pointer;">Stop</button>
    </div>
    <div style="margin-top:10px;padding:8px;background:#f8f9fa;border-radius:4px;font-size:12px;border:1px solid #eee;">
      <div id="gsc-status" style="font-weight:bold;color:#1a73e8;word-break:break-all;">স্ট্যাটাস: প্রস্তুত</div>
      <div id="gsc-rem" style="color:#555;margin-top:4px;">বাকি আছে: 0 টি URL</div>
    </div>
  `;
  document.body.appendChild(panel);

  let isRunning = false;
  let queue = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  document.getElementById('gsc-close').onclick = () => { isRunning = false; panel.remove(); };

  document.getElementById('gsc-csv').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('gsc-fname').innerText = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const urls = [];
      ev.target.result.split(/\r?\n/).forEach(line => {
        line.split(/[,;\t]/).forEach(col => {
          const c = col.replace(/^["']|["']$/g, '').trim();
          if (c.startsWith('http://') || c.startsWith('https://')) urls.push(c);
        });
      });
      const unique = [...new Set(urls)];
      document.getElementById('gsc-urls').value = unique.join('\n');
      document.getElementById('gsc-rem').innerText = `বাকি আছে: ${unique.length} টি URL`;
      document.getElementById('gsc-status').innerText = `স্ট্যাটাস: CSV থেকে ${unique.length} টি URL লোড হয়েছে!`;
    };
    reader.readAsText(file);
  };

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  }

  function simClick(el) {
    if (!el) return;
    ['mousedown', 'mouseup', 'click'].forEach(t => el.dispatchEvent(new MouseEvent(t, { view: window, bubbles: true, cancelable: true, buttons: 1 })));
  }

  function findBtn(arr) {
    const els = document.querySelectorAll('div[role="button"], button, span[jsslot], span.VfPpkd-vQzf8d, span.RveJvd');
    for (let txt of arr) {
      for (let el of els) {
        if (el.innerText && el.innerText.trim().toLowerCase() === txt.toLowerCase()) {
          const btn = el.closest('div[role="button"]') || el.closest('button') || el;
          if (isVisible(btn) && btn.getAttribute('aria-disabled') !== 'true') return btn;
        }
      }
    }
    return null;
  }

  function setVal(el, val) {
    const setter = Object.getOwnPropertyDescriptor(el, 'value')?.set;
    const protoSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
    if (setter && setter !== protoSetter) protoSetter.call(el, val);
    else if (setter) setter.call(el, val);
    else el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function run() {
    const delay = parseInt(document.getElementById('gsc-delay').value, 10) || 2000;
    while (isRunning && queue.length > 0) {
      const url = queue[0];
      document.getElementById('gsc-status').innerText = `সাবমিট হচ্ছে: ${url.substring(0, 28)}...`;
      document.getElementById('gsc-rem').innerText = `বাকি আছে: ${queue.length} টি URL`;

      const newBtn = findBtn(['New request', 'নতুন অনুরোধ']);
      if (!newBtn) { document.getElementById('gsc-status').innerText = "স্ট্যাটাস: 'New request' বাটন পাওয়া যায়নি!"; isRunning = false; break; }
      simClick(newBtn);
      await sleep(delay);

      const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])')).filter(el => isVisible(el) && !el.readOnly && !el.disabled && el.getAttribute('aria-label') !== 'Search' && el.id !== 'gsc-delay');
      const input = inputs[inputs.length - 1];
      if (!input) { document.getElementById('gsc-status').innerText = "স্ট্যাটাস: URL ইনপুট বক্স পাওয়া যায়নি!"; isRunning = false; break; }
      input.focus();
      setVal(input, url);
      await sleep(1000);

      const nextBtn = findBtn(['Next', 'পরবর্তী']);
      if (!nextBtn) { document.getElementById('gsc-status').innerText = "স্ট্যাটাস: 'Next' বাটন পাওয়া যায়নি!"; isRunning = false; break; }
      simClick(nextBtn);
      await sleep(delay);

      const subBtn = findBtn(['Submit request', 'অনুরোধ জমা দিন']);
      if (subBtn) {
        simClick(subBtn);
        await sleep(delay + 1000);
      } else {
        const canBtn = findBtn(['Cancel', 'Close', 'OK', 'বাতিল করুন']);
        if (canBtn) { simClick(canBtn); await sleep(1500); }
      }

      const errBtn = findBtn(['Cancel', 'Close', 'OK', 'Dismiss']);
      if (errBtn) { simClick(errBtn); await sleep(1200); }

      queue.shift();
      document.getElementById('gsc-urls').value = queue.join('\n');
      document.getElementById('gsc-rem').innerText = `বাকি আছে: ${queue.length} টি URL`;
    }
    if (queue.length === 0 && isRunning) {
      isRunning = false;
      document.getElementById('gsc-status').innerText = 'স্ট্যাটাস: সবগুলো URL সাবমিট সম্পন্ন হয়েছে!';
      alert('সবগুলো 404 URL সফলভাবে রিমুভ রিকোয়েস্ট দেওয়া হয়েছে!');
    }
  }

  document.getElementById('gsc-start').onclick = () => {
    queue = document.getElementById('gsc-urls').value.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
    if (queue.length === 0) { document.getElementById('gsc-status').innerText = 'স্ট্যাটাস: আগে CSV ফাইল আপলোড করুন!'; return; }
    if (!isRunning) { isRunning = true; run(); }
  };

  document.getElementById('gsc-stop').onclick = () => {
    isRunning = false;
    document.getElementById('gsc-status').innerText = 'স্ট্যাটাস: বন্ধ করা হয়েছে।';
  };
}