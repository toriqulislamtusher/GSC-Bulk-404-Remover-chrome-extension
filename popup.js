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
let currentPageUrl = '';
chrome.tabs.query({active:true,currentWindow:true}).then(([tab])=>{currentPageUrl=tab?.url||'';updatePreview();}).catch(()=>{});
let currentReportScope = 'batch';
let selectedBatchId = ''; 
let batchPreview = {newUrls:[],confirmed:[],unverified:[]};
const TERMINAL = ['confirmed','duplicate','skipped','failed','unverified'];
function normalizedHistory(rows, url) { return rows.filter(r => isSameUrl(r.url,url)).sort((a,b)=>String(b.timestamp||'').localeCompare(String(a.timestamp||''))); }
function classifyHistory(rows,url) {
  const property=GscSafety.property(currentPageUrl);
  const relevant=normalizedHistory(rows,url).filter(r=>!r.propertyKey || r.propertyKey===property);
  const reviewed=relevant.reduce((latest,r)=>Math.max(latest,Date.parse(r.retryAllowedAt)||0),0);
  const match=relevant.filter(r=>(Date.parse(r.timestamp)||0)>reviewed || (!reviewed && !r.timestamp));
  if(match.some(r=>r.status==='unverified')) return 'review';
  if(match.some(r=>r.status==='confirmed'||r.status==='duplicate')) return 'already';
  return 'new';
}
function progressState(rows,runId,queue,isRunning) {
  const current=rows.filter(r=>r.runId===runId);
  const done=new Set(current.filter(r=>TERMINAL.includes(r.status)).map(r=>canonical(r.url)));
  return {current,pending:queue.filter(u=>!done.has(canonical(u)))};
}

function canonical(url) { try { const u=new URL(url); u.hash=''; return u.href; } catch { return url; } }
function isSameUrl(a,b) { return canonical(a)===canonical(b); }
async function updatePreview() {
  const {urls}=parseUrls($('urls').value);
  const d=await chrome.storage.local.get('submissionHistory');
  const rows=d.submissionHistory||[];
  const confirmed=urls.filter(u=>classifyHistory(rows,u)==='already');
  const unverified=urls.filter(u=>classifyHistory(rows,u)==='review');
  const newUrls=urls.filter(u=>!confirmed.includes(u)&&!unverified.includes(u));
  batchPreview={newUrls,confirmed,unverified};
  $('preview').innerHTML='';
  for(const [label,count] of [['New',newUrls.length],['Submitted',confirmed.length],['Review',unverified.length]]) {
    const card=document.createElement('span');card.className='analysis-metric';
    const value=document.createElement('b');value.textContent=count;
    const name=document.createElement('small');name.textContent=label;
    card.append(value,name);$('preview').append(card);
  }
  $('preview').hidden=!urls.length;
  $('emptyPreview').hidden=!!urls.length;
  $('preview').classList.toggle('warning',unverified.length>0);
  const d2=await chrome.storage.local.get('isRunning');
  $('startBtn').textContent=d2.isRunning?'Running…':newUrls.length?`Start (${newUrls.length} new)`:'Start';
  $('duplicateInfo').textContent=confirmed.length?`Already submitted: ${confirmed.slice(0,3).join(' · ')}${confirmed.length>3?' …':''}`:'';
  $('unverifiedInfo').textContent=unverified.length?`${unverified.length} unverified prior request(s) require checking in GSC. They will not be resubmitted automatically.`:'';
}

function validUrl(value) {
  try { return GscSafety.concrete(value); }
  catch { return false; }
}
function parseUrls(text) {
  // URL-list mode preserves punctuation. CSV mode requires a header or quoted first cell.
  // Never guess that punctuation inside a complete URL is a column separator.
  text=String(text).replace(/^\uFEFF/,'');
  const lines=text.split(/\r?\n/).filter(line=>line.trim());
  if(!lines.length) return {urls:[],ignored:0};
  const first=lines[0].trim();
  const delimited=!/^https?:\/\//i.test(first);
  let candidates=[];
  if(!delimited) candidates=lines.map(line=>line.trim());
  else {
    const separators=[',',';','\t'];
    const counts=separators.map(separator=>{
      let quoted=false,n=0;
      for(let i=0;i<first.length;i++) {
        if(first[i]==='"') { if(quoted && first[i+1]==='"') i++; else quoted=!quoted; }
        else if(!quoted && first[i]===separator) n++;
      }
      return n;
    });
    const separator=separators[counts.indexOf(Math.max(...counts))];
    let cell='',quoted=false,closed=false,atStart=true;
    const finish=()=>{candidates.push(cell.trim());cell='';closed=false;atStart=true;};
    for(let i=0;i<text.length;i++) {
      const ch=text[i];
      if(quoted) {
        if(ch==='"') { if(text[i+1]==='"'){cell+='"';i++;} else {quoted=false;closed=true;} }
        else cell+=ch;
      } else if(ch===separator || ch==='\n' || ch==='\r') {
        finish();if(ch==='\r' && text[i+1]==='\n') i++;
      } else if(ch==='"' && atStart) {quoted=true;atStart=false;}
      else if(closed && !/\s/.test(ch)) return {urls:[],ignored:lines.length,error:'Malformed CSV: unexpected text after a quoted field.'};
      else {cell+=ch;if(!/\s/.test(ch)) atStart=false;}
    }
    if(quoted) return {urls:[],ignored:lines.length,error:'Malformed CSV: close every quoted field.'};
    finish();
  }
  candidates=candidates.filter(Boolean);
  const urls=[...new Set(candidates.filter(value=>!/[\r\n\t]/.test(value) && validUrl(value)).map(canonical))];
  return {urls,ignored:candidates.length-urls.length};
}
async function render() {
  const d = await chrome.storage.local.get(['removalQueue','isRunning','statusText','stepDelay','submitLimit','processedCount','failedCount','currentUrl','failedUrls','submissionHistory','runId','batchSkips','batchTotal','batchStartedAt','paused']);
  const queue = d.removalQueue || [];
  if (!editing && document.activeElement !== $('urls') && !$('urls').value.trim()) { const draft=await chrome.storage.local.get(['draftUrls','draftFilename']); $('urls').value=draft.draftUrls||queue.join('\n'); if(draft.draftFilename) $('fileName').textContent=draft.draftFilename; }
  if (d.stepDelay && document.activeElement !== $('delay')) $('delay').value = d.stepDelay;
  if (d.submitLimit && document.activeElement !== $('limit')) $('limit').value = d.submitLimit;
  $('submittedCount').textContent = d.processedCount || 0;
  $('failedCount').textContent = (d.submissionHistory||[]).filter(r=>r.runId===d.runId && r.status==='failed').length;
  $('remainingCount').textContent = queue.length;
  const records=(d.submissionHistory||[]).filter(r=>d.runId && r.runId===d.runId);
  const skipped=(d.batchSkips||[]).length+records.filter(r=>['skipped','duplicate'].includes(r.status)).length;
  const total=d.batchTotal||0, finished=Math.min(total,Math.max(0,total-queue.length));
  $('progressLabel').textContent=total?`${finished} of ${total} processed`:'No active batch';
  $('progressPercent').textContent=total?`${Math.round(finished/total*100)}%`:'0%';
  $('progressBar').style.width=total?`${Math.round(finished/total*100)}%`:'0%';
  $('skippedCount').textContent=skipped;
  $('batchState').textContent=d.isRunning?'Processing':d.paused?'Paused':queue.length?'Stopped':total?'Completed':'Ready';
  $('currentUrl').textContent = d.currentUrl ? `Current: ${d.currentUrl}` : '';
  $('status').textContent = d.statusText || 'Ready';
  await renderReport();
  await updatePreview();
  $('failedUrls').textContent = (d.failedUrls || []).length ? `Skipped / unsuccessful URLs:\n${d.failedUrls.join('\n')}` : '';
  // Allow Start to recover an orphaned session after tab reload.
  $('startBtn').disabled = false;
  $('stopBtn').disabled = !d.isRunning;
  $('resumeBtn').disabled = !!d.isRunning || !queue.length;
}
document.addEventListener('DOMContentLoaded', render);
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local' && Object.keys(changes).some(k=>['removalQueue','isRunning','statusText','processedCount','failedCount','submissionHistory','batchSkips','runId','paused','batchTotal'].includes(k))) render();});
$('urls').addEventListener('input', () => { editing = true; chrome.storage.local.set({draftUrls:$('urls').value,draftFilename:''}); const {urls, ignored, error} = parseUrls($('urls').value); $('validation').textContent = error || `${urls.length} unique valid URLs; ${ignored} ignored/duplicate entries.`; updatePreview(); });
$('csvFile').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  if (!/\.(csv|txt)$/i.test(file.name)) { $('status').textContent = 'Choose a .csv or .txt file.'; return; }
  if (file.size > 2 * 1024 * 1024) { $('status').textContent = 'File too large (maximum 2 MB).'; return; }
  const {urls, ignored, error} = parseUrls(await file.text());
  if(error) { $('status').textContent=error; return; }
  $('urls').value = urls.join('\n'); editing = true;
  $('fileName').textContent = file.name;
  $('validation').textContent = `${urls.length} unique valid URLs; ${ignored} ignored/duplicate entries.`;
  $('status').textContent = `${urls.length} URLs loaded. Review before starting.`;
  await chrome.storage.local.set({draftUrls:urls.join('\n'),draftFilename:file.name});
  await updatePreview();
});
$('clearTextBtn').addEventListener('click', () => { chrome.storage.local.set({draftUrls:'',draftFilename:''}); $('urls').value = ''; $('csvFile').value = ''; $('fileName').textContent = 'No file selected'; $('validation').textContent = 'URL list cleared.'; editing = true; updatePreview(); });
$('startBtn').addEventListener('click', async () => {
  const {urls} = parseUrls($('urls').value);
  const limit = Number($('limit').value), delay = Number($('delay').value);
  if (!urls.length) { $('status').textContent = 'Add valid URLs first.'; return; }
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000 || !Number.isInteger(delay) || delay < 1500 || delay > 30000) { $('status').textContent = 'Use limit 1–1000 and delay 1500–30000 ms.'; return; }
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab?.id || !isGscRemovalsPage(tab.url || '')) { $('status').textContent = 'Open the Google Search Console Removals page first.'; return; }
  const selected = urls.slice(0, limit);
  const previousRun = await chrome.storage.local.get(['isRunning','runTabId']);
  if (previousRun.isRunning) {
    let live = false;
    try { const oldTabId = previousRun.runTabId || tab.id; const reply = await chrome.tabs.sendMessage(oldTabId,{action:'GET_RUN_STATUS'}); live = !!reply?.processing; } catch (_) {}
    if (live) { $('status').textContent='A batch is already processing. Press Stop before starting another.'; return; }
    await chrome.storage.local.set({isRunning:false,statusText:'Previous session was interrupted. Check GSC for any unverified requests.'});
  }
  // A URL-prefix property can only receive requests for URLs inside that property.
  // Domain properties allow subdomains; verify before any action.
  currentPageUrl = tab.url;
  const property = GscSafety.property(tab.url);
  if (!property) { $('status').textContent = 'Cannot verify the selected GSC property. Open its Removals page again.'; return; }
  if (!selected.every(url=>GscSafety.belongs(property,url))) { $('status').textContent = 'URL list does not match the selected GSC property. No requests started.'; return; }
  // Required host permissions are approved on installation/update, not per website.
  // If Chrome site-access controls withhold them, fail closed before starting.
  const origins = [...new Set(selected.map(value => `${new URL(value).origin}/*`))];
  let granted = false;
  try { granted = await chrome.permissions.contains({origins}); }
  catch(e) { $('status').textContent = `Website access check failed: ${e.message}`; return; }
  if (!granted) {
    $('status').textContent = 'Website access is restricted in Chrome. Open Extension Details → Site access → On all sites, then try Start again.';
    return;
  }
  const old = await chrome.storage.local.get(['submissionHistory']);
  const history = old.submissionHistory || [];
  // Confirmed requests can be skipped. Unverified requests must be checked manually:
  // submitting them again risks an unintended duplicate removal request.
  const alreadyConfirmed = selected.filter(url => classifyHistory(history,url)==='already');
  const uncertain = selected.filter(url => classifyHistory(history,url)==='review');
  const ready = selected.filter(url => !alreadyConfirmed.includes(url) && !uncertain.includes(url));
  const skippedRows=[...alreadyConfirmed.map(url=>({url,status:'already',reason:'Previously confirmed in local history; no new request sent',timestamp:new Date().toISOString()})),...uncertain.map(url=>({url,status:'review',reason:'Prior request unverified; review in GSC before retrying',timestamp:new Date().toISOString()}))];
  if (!ready.length) {
    await chrome.storage.local.set({batchSkips:skippedRows,removalQueue:[],processedCount:0,failedCount:0,failedUrls:[],isRunning:false,statusText:alreadyConfirmed.length===selected.length?`All ${selected.length} URL(s) already submitted. No new requests sent.`:`No new safe-to-retry URLs: ${alreadyConfirmed.length} already submitted, ${uncertain.length} require review.`,runId:`batch-${Date.now()}`,runTabId:null,batchTotal:selected.length,paused:false,batchStartedAt:new Date().toISOString()});
    await render(); return;
  }

  // The safety notice is permanently visible in the popup. Avoid window.confirm(), which can close the extension popup.
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await chrome.storage.local.set({removalQueue:ready,processedCount:0,failedCount:0,failedUrls:[],currentUrl:'',isRunning:true,stepDelay:delay,submitLimit:limit,statusText:`Starting ${ready.length} new URL(s). ${alreadyConfirmed.length} already submitted; ${uncertain.length} require review.`,batchSkips:skippedRows,runId,runTabId:tab.id,runProperty:property,batchTotal:selected.length,batchStartedAt:new Date().toISOString(),paused:false});
  try {
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['safety.js','content.js']});
    const result=await chrome.tabs.sendMessage(tab.id,{action:'START_REMOVAL',runId});
    if(!result?.started) await chrome.storage.local.set({isRunning:false,statusText:result?.reason||'Could not start content script.'});
  } catch(err) { await chrome.storage.local.set({isRunning:false,statusText:`Unable to start: ${err.message}`}); }
  await render();
});
$('stopBtn').addEventListener('click', async () => {
  // Stop storage state first, then notify the active page for fast cancellation.
  await chrome.storage.local.set({isRunning:false,paused:true,statusText:'Stopped safely. Check any open GSC dialog before resuming.'});
  try {
    const d=await chrome.storage.local.get('runTabId');
    if(d.runTabId) await chrome.tabs.sendMessage(d.runTabId,{action:'STOP_REMOVAL'});
  } catch(_) { /* A closed or reloaded tab has no active worker to stop. */ }
  await render();
});
$('clearBtn').addEventListener('click', async () => {
  const d = await chrome.storage.local.get('isRunning');
  if (d.isRunning) { $('status').textContent = 'Stop the process before resetting.'; return; }
  // Reset affects only the queue and counters, never the stored history.
  $('urls').value = ''; $('csvFile').value = ''; $('fileName').textContent = 'No file selected'; editing = true;
  await chrome.storage.local.set({removalQueue:[],processedCount:0,failedCount:0,failedUrls:[],batchSkips:[],currentUrl:'',statusText:'Batch reset. Submission history was kept.',runId:null,runTabId:null,runProperty:null,batchTotal:0,paused:false,draftUrls:'',draftFilename:''});
  await render();
});

$('resumeBtn').addEventListener('click',async()=>{
  const d=await chrome.storage.local.get(['isRunning','runId','runTabId','runProperty','removalQueue','submissionHistory']);
  if(d.isRunning || !d.runId || !(d.removalQueue||[]).length) { $('status').textContent='No paused batch to resume.'; return; }
  const uncertain=(d.submissionHistory||[]).some(r=>r.runId===d.runId && r.status==='unverified' && !r.retryAllowedAt && d.removalQueue.some(u=>isSameUrl(u,r.url)));
  if(uncertain) { $('status').textContent='Resume blocked: a request has an unverified outcome. Check GSC and resolve it manually first.'; return; }
  try {
    const tab=await chrome.tabs.get(d.runTabId);
    if(!isGscRemovalsPage(tab.url||'')) throw Error('Original GSC Removals tab is no longer available');
    if(!d.runProperty || GscSafety.property(tab.url)!==d.runProperty || !d.removalQueue.every(url=>GscSafety.belongs(d.runProperty,url))) throw Error('Selected property changed or batch property is unknown. Return to the original property or start a new reviewed batch.');
    const reply=await chrome.tabs.sendMessage(d.runTabId,{action:'CAN_RESUME'});
    if(!reply?.safe) throw Error(reply?.reason||'An open GSC dialog must be reviewed and closed first');
    await chrome.storage.local.set({isRunning:true,paused:false,statusText:'Resuming preserved batch…'});
    const result=await chrome.tabs.sendMessage(d.runTabId,{action:'START_REMOVAL',runId:d.runId});
    if(!result?.started) throw Error(result?.reason||'Content script did not start');
  } catch(e) { await chrome.storage.local.set({isRunning:false,paused:true,statusText:`Resume unavailable: ${e.message}`}); }
  await render();
});
// Report view and exports: no network requests; records remain in chrome.storage.local.
const statusNames = {confirmed:'Confirmed',already:'Already submitted',review:'Needs review',duplicate:'Active duplicate',skipped:'Skipped',failed:'Failed',unverified:'Unverified',pending:'Pending'};
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
$('reportScope').addEventListener('change',e=>{currentReportScope=e.target.value;renderReport();});
$('batchSelector').addEventListener('change',e=>{selectedBatchId=e.target.value;renderReport();});
async function renderReport() {
  const d=await chrome.storage.local.get(['submissionHistory','removalQueue','runId','isRunning','batchSkips','batchStartedAt']);
  const history=d.submissionHistory||[];
  const pending=progressState(history,d.runId,d.removalQueue||[],d.isRunning).pending.map(url=>({url,status:'pending',reason:'Awaiting processing',timestamp:null}));
  const savedRuns=[...new Set(history.map(r=>r.runId).filter(Boolean))].filter(id=>id!==d.runId).reverse();
  const selector=$('batchSelector');selector.classList.toggle('hidden',currentReportScope!=='previous');
  if(currentReportScope==='previous') {
    if(!savedRuns.includes(selectedBatchId)) selectedBatchId=savedRuns[0]||'';
    selector.replaceChildren();
    for(const id of savedRuns){const option=document.createElement('option');option.value=id;const first=history.find(r=>r.runId===id);option.textContent=`${first?.timestamp?new Date(first.timestamp).toLocaleDateString():'Batch'} · ${id.slice(0,18)}`;selector.append(option);}
    selector.value=selectedBatchId;
  }
  reportRows=currentReportScope==='batch'?[...history.filter(r=>d.runId && r.runId===d.runId),...(d.batchSkips||[]),...pending]:currentReportScope==='previous'?history.filter(r=>r.runId===selectedBatchId):[...history,...(d.batchSkips||[]),...pending];
  $('reportAlready').textContent=reportRows.filter(r=>r.status==='already').length;
  $('reportReview').textContent=reportRows.filter(r=>r.status==='review').length;
  $('reportDuplicate').textContent=reportRows.filter(r=>r.status==='duplicate').length;
  for (const status of ['confirmed','skipped','failed','unverified','pending']) {
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
    div.append(title,url,reason);
    if(['unverified','confirmed','duplicate'].includes(r.status) && !r.retryAllowedAt) {
      const review=document.createElement('button'); review.className='neutral';
      review.textContent='I checked GSC — allow retry'; review.disabled=!!d.isRunning;
      review.addEventListener('click',async()=>{
        const latest=await chrome.storage.local.get(['isRunning','submissionHistory']);
        if(latest.isRunning) { $('reportMessage').textContent='Stop the batch before reviewing history.'; return; }
        const rows=latest.submissionHistory||[];
        const target=rows.find(row=>row.runId===r.runId && row.url===r.url && row.timestamp===r.timestamp && row.status===r.status);
        if(!target) return;
        target.retryAllowedAt=new Date().toISOString();
        await chrome.storage.local.set({submissionHistory:rows});
        await renderReport(); await updatePreview();
      });
      div.append(review);
    }
    root.append(div);
  }
  $('batchDate').textContent=currentReportScope==='batch'?(d.batchStartedAt?`Started ${new Date(d.batchStartedAt).toLocaleString()}`:'No batch selected'):`${new Set(history.map(r=>r.runId).filter(Boolean)).size} saved batches`;
  $('reportMessage').textContent=shown.length>500?`Showing first 500 of ${shown.length}. Export to see all.`:`${shown.length} matching records · ${currentReportScope==='batch'?'Current batch':currentReportScope==='previous'?'Previous batch':'All history'}. Reset does not erase history.`;
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
