async function updateUI() {
  const data = await chrome.storage.local.get(['removalQueue', 'isRunning', 'statusText', 'stepDelay', 'submitLimit', 'processedCount', 'failedCount', 'currentUrl']);
  const queue = data.removalQueue || [];
  
  if (queue.length > 0 && document.getElementById('urls').value.trim() === '') {
    document.getElementById('urls').value = queue.join('\n');
  }
  if (data.stepDelay) document.getElementById('delay').value = data.stepDelay;
  if (data.submitLimit) document.getElementById('limit').value = data.submitLimit;
  
  const processed = data.processedCount || 0;
  const failed = data.failedCount || 0;
  const remaining = queue.length;

  document.getElementById('submittedCount').innerText = processed;
  document.getElementById('failedCount').innerText = failed;
  document.getElementById('remainingCount').innerText = remaining;
  document.getElementById('currentUrlBox').value = data.currentUrl || '';

  if (data.statusText) {
    document.getElementById('status').innerText = `Status: ${data.statusText}`;
  }
}

document.addEventListener('DOMContentLoaded', updateUI);

chrome.storage.onChanged.addListener(() => {
  updateUI();
});

document.getElementById('csvFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('fileName').innerText = file.name;
  const reader = new FileReader();
  reader.onload = async function(ev) {
    const urls = [];
    ev.target.result.split(/\r?\n/).forEach(line => {
      line.split(/[,;\t]/).forEach(col => {
        const c = col.replace(/^["']|["']$/g, '').trim();
        if (c.startsWith('http://') || c.startsWith('https://')) urls.push(c);
      });
    });
    const unique = [...new Set(urls)];
    document.getElementById('urls').value = unique.join('\n');
    
    await chrome.storage.local.set({ 
      removalQueue: unique, 
      processedCount: 0,
      failedCount: 0,
      currentUrl: '',
      statusText: `${unique.length} URLs loaded successfully!` 
    });
    updateUI();
  };
  reader.readAsText(file);
});

// Clear only the URLs text box and queue
document.getElementById('clearTextBtn').addEventListener('click', async () => {
  document.getElementById('urls').value = '';
  document.getElementById('csvFile').value = '';
  document.getElementById('fileName').innerText = 'No file selected';
  await chrome.storage.local.set({ 
    removalQueue: [], 
    currentUrl: '', 
    statusText: 'URL list cleared.' 
  });
  updateUI();
});

document.getElementById('startBtn').addEventListener('click', async () => {
  let rawUrls = document.getElementById('urls').value.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
  const delay = parseInt(document.getElementById('delay').value, 10) || 2000;
  const limitInput = parseInt(document.getElementById('limit').value, 10);

  if (rawUrls.length === 0) {
    document.getElementById('status').innerText = 'Status: Please upload CSV or paste URLs!';
    return;
  }

  if (!isNaN(limitInput) && limitInput > 0) {
    rawUrls = rawUrls.slice(0, limitInput);
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    document.getElementById('status').innerText = 'Status: Active tab not found!';
    return;
  }

  await chrome.storage.local.set({ 
    removalQueue: rawUrls, 
    processedCount: 0,
    failedCount: 0,
    currentUrl: '',
    isRunning: true, 
    stepDelay: delay, 
    submitLimit: limitInput, 
    statusText: 'Process starting...' 
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    chrome.tabs.sendMessage(tab.id, { action: 'START_REMOVAL' });
  });
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ isRunning: false, statusText: 'Process stopped.' });
  updateUI();
});

document.getElementById('clearBtn').addEventListener('click', async () => {
  document.getElementById('urls').value = '';
  document.getElementById('csvFile').value = '';
  document.getElementById('fileName').innerText = 'No file selected';
  await chrome.storage.local.set({ removalQueue: [], processedCount: 0, failedCount: 0, currentUrl: '', isRunning: false, statusText: 'Cleared successfully.' });
  updateUI();
});