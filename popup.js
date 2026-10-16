function isGscRemovalsPage(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return u.protocol === 'https:' && u.hostname === 'search.google.com' &&
      /^\/(?:u\/\d+\/)?search-console\/removals\/?$/.test(u.pathname);
  } catch { return false; }
}
'use strict';
const $ = id => document.getElementById(id);
let editing = false;
function validUrl(value) {
  try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !!u.hostname; }
  catch { return false; }
}
function parseUrls(text) {
  // Supports one URL per line, or simple CSV/TSV containing a URL column.
  const candidates = text.split(/\r?\n/).flatMap(line => line.split(/[,;\t]/))
    .map(s => s.trim().replace(/^['"]|['"]$/g, '').trim()).filter(Boolean);
  const urls = [...new Set(candidates.filter(validUrl))];
  return {urls, ignored: candidates.length - urls.length};
}
async function render() {
  const d = await chrome.storage.local.get(['removalQueue','isRunning','statusText','stepDelay','submitLimit','processedCount','failedCount','currentUrl','failedUrls']);
  const queue = d.removalQueue || [];
  if (!editing && document.activeElement !== $('urls') && queue.length && !$('urls').value.trim()) $('urls').value = queue.join('\n');
  if (d.stepDelay && document.activeElement !== $('delay')) $('delay').value = d.stepDelay;
  if (d.submitLimit && document.activeElement !== $('limit')) $('limit').value = d.submitLimit;
  $('submittedCount').textContent = d.processedCount || 0;
  $('failedCount').textContent = d.failedCount || 0;
  $('remainingCount').textContent = queue.length;
  $('currentUrl').textContent = d.currentUrl ? `Current: ${d.currentUrl}` : '';
  $('status').textContent = d.statusText || 'Ready';
  await renderReport();
  $('failedUrls').textContent = (d.failedUrls || []).length ? `Failed URLs:\n${d.failedUrls.join('\n')}` : '';
  $('startBtn').disabled = !!d.isRunning;
}
document.addEventListener('DOMContentLoaded', render);
chrome.storage.onChanged.addListener(render);
$('urls').addEventListener('input', () => { editing = true; const {urls, ignored} = parseUrls($('urls').value); $('validation').textContent = `${urls.length} unique valid URLs; ${ignored} ignored/duplicate entries.`; });
$('csvFile').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  if (!/\.(csv|txt)$/i.test(file.name)) { $('status').textContent = 'Choose a .csv or .txt file.'; return; }
  if (file.size > 2 * 1024 * 1024) { $('status').textContent = 'File too large (maximum 2 MB).'; return; }
  const {urls, ignored} = parseUrls(await file.text());
  $('urls').value = urls.join('\n'); editing = true;
  $('fileName').textContent = file.name;
  $('validation').textContent = `${urls.length} unique valid URLs; ${ignored} ignored/duplicate entries.`;
  $('status').textContent = `${urls.length} URLs loaded. Review before starting.`;
});
$('clearTextBtn').addEventListener('click', () => { $('urls').value = ''; $('csvFile').value = ''; $('fileName').textContent = 'No file selected'; $('validation').textContent = 'URL list cleared.'; editing = true; });
$('setupAccessBtn').addEventListener('click', async () => {
  const {urls} = parseUrls($('urls').value);
  if (!urls.length) { $('status').textContent = 'Upload or paste URLs first.'; return; }
  const origins=[...new Set(urls.map(u => `${new URL(u).origin}/*`))];
  await chrome.storage.local.set({pendingPermissionOrigins:origins});
  await chrome.tabs.create({url:chrome.runtime.getURL('access.html')});
});
$('startBtn').addEventListener('click', async () => {
  const {urls} = parseUrls($('urls').value);
  const limit = Number($('limit').value), delay = Number($('delay').value);
  if (!urls.length) { $('status').textContent = 'Add valid URLs first.'; return; }
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000 || !Number.isInteger(delay) || delay < 1500 || delay > 30000) { $('status').textContent = 'Use limit 1–1000 and delay 1500–30000 ms.'; return; }
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab?.id || !isGscRemovalsPage(tab.url || '')) { $('status').textContent = 'Open the Google Search Console Removals page first.'; return; }
  // Request optional origin access only when needed; Chrome may close an action popup for its own permission UI.
  const history = (await chrome.storage.local.get('submissionHistory')).submissionHistory || [];
  const blocked = new Set(history.filter(x => ['confirmed','unverified'].includes(x.status)).map(x => x.url));
  const selected = urls.slice(0,limit).filter(url => !blocked.has(url));
  if (!selected.length) { $('status').textContent = 'All selected URLs were already confirmed or unverified. Review Reports before retrying.'; return; }
  if (selected.length < Math.min(urls.length,limit)) $('status').textContent = 'Previously confirmed/unverified URLs excluded. Review Reports.';
  const origins = [...new Set(selected.map(value => `${new URL(value).origin}/*`))];
  // Never trigger Chrome's permission dialog from the action popup: it closes the popup.
  let granted = false;
  try { granted = await chrome.permissions.contains({origins}); }
  catch(e) { $('status').textContent = `Access check failed: ${e.message}`; return; }
  if (!granted) {
    await chrome.storage.local.set({pendingPermissionOrigins:origins});
    $('status').textContent = 'Website access needed. Click Set up access, grant permission in the new tab, then return and press Start.';
    return;
  }
  // The safety notice is permanently visible in the popup. Avoid window.confirm(), which can close the extension popup.
  const previous = await chrome.storage.local.get(['isRunning']);
  if (previous.isRunning) { $('status').textContent = 'Already running.'; return; }
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await chrome.storage.local.set({removalQueue:selected,processedCount:0,failedCount:0,failedUrls:[],currentUrl:'',isRunning:true,stepDelay:delay,submitLimit:limit,statusText:'Starting…',runId});
  try {
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
    const result=await chrome.tabs.sendMessage(tab.id,{action:'START_REMOVAL',runId});
    if(!result?.started) await chrome.storage.local.set({isRunning:false,statusText:result?.reason||'Could not start content script.'});
  } catch(err) { await chrome.storage.local.set({isRunning:false,statusText:`Unable to start: ${err.message}`}); }
  await render();
});
$('stopBtn').addEventListener('click', async () => {
  // Stop storage state first, then notify the active page for fast cancellation.
  await chrome.storage.local.set({isRunning:false,statusText:'Stopped by user. A request already submitted to Google cannot be undone.'});
  try {
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(tab?.id && isGscRemovalsPage(tab.url||''))
      await chrome.tabs.sendMessage(tab.id,{action:'STOP_REMOVAL'});
  } catch(_) { /* A closed or reloaded tab has no active worker to stop. */ }
  await render();
});
$('clearBtn').addEventListener('click', async () => {
  const d = await chrome.storage.local.get('isRunning');
  if (d.isRunning) { $('status').textContent = 'Stop the process before resetting.'; return; }
  if (!confirm('Clear the queue and all counters?')) return;
  $('urls').value = ''; $('csvFile').value = ''; $('fileName').textContent = 'No file selected'; editing = true;
  await chrome.storage.local.set({removalQueue:[],processedCount:0,failedCount:0,failedUrls:[],currentUrl:'',statusText:'Reset complete.'});
  await render();
});

// Report view and exports: no network requests; records remain in chrome.storage.local.
const statusNames = {confirmed:'Confirmed',skipped:'Skipped',failed:'Failed',unverified:'Unverified',pending:'Pending'};
let reportRows = [];
function showTab(report) {
  $('workPanel').classList.toggle('hidden', report);
  $('reportPanel').classList.toggle('hidden', !report);
  $('workTab').classList.toggle('selected', !report);
  $('reportTab').classList.toggle('selected', report);
  if(report) renderReport();
}
$('workTab').addEventListener('click',()=>showTab(false));
$('reportTab').addEventListener('click',()=>showTab(true));
$('refreshReport').addEventListener('click',renderReport);
$('reportFilter').addEventListener('change',renderReport);
async function renderReport() {
  const d=await chrome.storage.local.get(['submissionHistory','removalQueue','runId']);
  const history=d.submissionHistory||[];
  const pending=(d.removalQueue||[]).filter(url=>!history.some(row=>row.url===url && row.runId===d.runId)).map(url=>({url,status:'pending',reason:'Awaiting processing',timestamp:null}));
  reportRows=[...history,...pending];
  for (const status of Object.keys(statusNames)) {
    const id='report'+status.charAt(0).toUpperCase()+status.slice(1);
    $(id).textContent=reportRows.filter(r=>r.status===status).length;
  }
  const filter=$('reportFilter').value;
  const shown=reportRows.filter(r=>filter==='all'||r.status===filter).slice().reverse();
  const root=$('reportList');root.replaceChildren();
  if(!shown.length){const p=document.createElement('p');p.className='small';p.textContent='No matching URLs yet.';root.append(p);}
  for(const r of shown.slice(0,500)){
    const div=document.createElement('div');div.className='report-item';
    const title=document.createElement('strong');title.textContent=statusNames[r.status]||r.status;
    const url=document.createElement('div');url.className='url';url.textContent=r.url;
    const reason=document.createElement('small');reason.textContent=[r.reason||'',r.httpStatus?`HTTP ${r.httpStatus}`:'',r.timestamp?new Date(r.timestamp).toLocaleString():''].filter(Boolean).join(' · ');
    div.append(title,url,reason);root.append(div);
  }
  $('reportMessage').textContent=shown.length>500?`Showing first 500 of ${shown.length}. Export to see all.`:`${shown.length} matching records. History stays on this browser until extension data is cleared.`;
}
function csvEscape(value){return '"'+String(value??'').replace(/"/g,'""')+'"';}
function downloadReport(format){
  const rows=reportRows.filter(r=>$('reportFilter').value==='all'||r.status===$('reportFilter').value);
  if(!rows.length){$('reportMessage').textContent='Nothing to export.';return;}
  const cols=['timestamp','url','status','httpStatus','reason','runId'];
  const body=format==='csv'?[cols.join(','),...rows.map(r=>cols.map(k=>csvEscape(r[k])).join(','))].join('\r\n'):
    rows.map(r=>[r.status.toUpperCase(),r.url,r.httpStatus?`HTTP ${r.httpStatus}`:'',r.reason||'',r.timestamp||''].join(' | ')).join('\n');
  const blob=new Blob([body],{type:format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`gsc-removal-report-${new Date().toISOString().slice(0,10)}.${format}`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('exportCsv').addEventListener('click',()=>downloadReport('csv'));
$('exportTxt').addEventListener('click',()=>downloadReport('txt'));
