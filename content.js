'use strict';
// GSC UI is not a public API. This script deliberately stops on ambiguous results.
if (!globalThis.__gscBulkRemoverV34) {
  globalThis.__gscBulkRemoverV34 = true;
  let stopRequested = false;
  let currentRunId = null;
  // Synchronous cancellation flag: avoids a queued DOM click after Stop is pressed.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.isRunning?.newValue === false ||
        (changes.runId && currentRunId && changes.runId.newValue !== currentRunId)) stopRequested = true;
  });
  const sleep = async ms => {
    const end = Date.now() + ms;
    while (Date.now() < end && !stopRequested) {
      await new Promise(resolve => setTimeout(resolve, Math.min(100, end - Date.now())));
    }
  };
  const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const labels = {
    newRequest: ['New request','নতুন অনুরোধ'],
    next: ['Next','পরবর্তী'],
    submit: ['Submit request','অনুরোধ জমা দিন'],
    cancel: ['Cancel','Close','বাতিল করুন','বন্ধ করুন']
  };
  function button(words) {
    return [...document.querySelectorAll('button,[role="button"]')].find(el =>
      visible(el) && el.getAttribute('aria-disabled') !== 'true' && !el.disabled &&
      words.some(w => norm(el.innerText || el.getAttribute('aria-label')) === norm(w)));
  }
  async function findButton(words, timeout=7000) {
    const until=Date.now()+timeout;
    do { if(stopRequested) return null; const b=button(words); if(b) return b; await sleep(100); } while(Date.now()<until && !stopRequested);
    return null;
  }
  async function active(runId) {
    const d=await chrome.storage.local.get(['isRunning','runId']);
    return !stopRequested && d.isRunning===true && d.runId===runId;
  }
  async function pause(runId, message) {
    if (!(await active(runId))) return;
    await chrome.storage.local.set({isRunning:false,paused:true,statusText:message});
  }
  // Google uses two different dialogs: "New Request" then "Remove URL?".
  // Never search only the first dialog for the final Submit button.
  function dialogs() {
    return [...new Set(document.querySelectorAll('[role="dialog"],[aria-modal="true"],.mat-mdc-dialog-container,.mat-dialog-container,.cdk-overlay-pane'))]
      .filter(visible).filter(el => !el.parentElement?.closest('[role="dialog"], [aria-modal="true"]'));
  }
  function requestDialog() {
    return dialogs().find(el => /new request|temporarily remove url|নতুন অনুরোধ/i.test(el.innerText || '') &&
      !!el.querySelector('input')) || null;
  }
  function confirmDialog(url) {
    return dialogs().find(el => /remove url\?|submit request|অনুরোধ জমা/i.test(el.innerText || '') &&
      (el.innerText || '').includes(url)) || null;
  }
  function matchingButton(root, words) {
    if (!root) return null;
    return [...root.querySelectorAll('button,[role="button"]')].find(el =>
      visible(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true' &&
      words.some(w => norm(el.innerText || el.textContent || el.getAttribute('aria-label')) === norm(w)));
  }
  async function inputUrl(url) {
    const until = Date.now() + 12000;
    while (Date.now() < until && !stopRequested) {
      const dialog = requestDialog();
      if (dialog) {
        const inputs = [...dialog.querySelectorAll('input[type="text"],input[type="url"],input:not([type])')]
          .filter(el => visible(el) && !el.disabled && !el.readOnly);
        const field = inputs.find(el => /enter url|url|ইউআরএল/i.test([el.placeholder,el.getAttribute('aria-label')].filter(Boolean).join(' '))) || (inputs.length === 1 ? inputs[0] : null);
        if (field) {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
          field.focus(); setter.call(field,url);
          field.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:url}));
          field.dispatchEvent(new Event('change',{bubbles:true}));
          await sleep(300);
          if (field.value === url) return true;
        }
      }
      await sleep(150);
    }
    return false;
  }
  async function findDialogButton(words, timeout=8000) {
    const until=Date.now()+timeout;
    while(Date.now()<until && !stopRequested) {
      const match=matchingButton(requestDialog(),words);
      if(match) return match;
      await sleep(150);
    }
    return null;
  }
  async function findConfirmationSubmit(url, timeout=12000) {
    const until=Date.now()+timeout;
    while(Date.now()<until && !stopRequested) {
      const dialog=confirmDialog(url);
      if(dialog) {
        const match=matchingButton(dialog,labels.submit);
        if(match) return match;
      }
      await sleep(150);
    }
    return null;
  }
  function anyOpenRemovalDialog() {
    return dialogs().some(el => /new request|remove url\?|temporarily remove url/i.test(el.innerText || ''));
  }
  function visibleRequestRows(url) {
    return [...document.querySelectorAll('tr,[role="row"]')]
      .filter(el => visible(el) && (el.innerText || '').includes(url) &&
        /processing request|temporarily remove url|removal approved|request/i.test(el.innerText || ''));
  }
  function hasConfirmation(url, beforeText, beforeRows) {
    const text=document.body.innerText || '';
    // A new visible GSC table row is stronger evidence than a button click.
    const newRow=visibleRequestRows(url).length > beforeRows;
    // A success toast may be present when the table has not refreshed yet.
    const success=/request (was |has been )?submitted|removal request submitted|request successfully submitted|অনুরোধ.*জমা/i.test(text);
    const acknowledgement=success && text !== beforeText && !confirmDialog(url);
    return newRow || acknowledgement;
  }
  function duplicateDialog() {
    // Only accept Google's explicit duplicate-request dialog; never treat a generic error as a duplicate.
    const nodes=[...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')].filter(visible);
    return nodes.find(el => /duplicate request/i.test(el.innerText || '') &&
      /only one active request per url permitted/i.test(el.innerText || '')) || null;
  }
  function closeDuplicateDialog(dialog) {
    const controls=[...dialog.querySelectorAll('button,[role="button"]')];
    const close=controls.find(el=>visible(el) && /^(close|ok|বন্ধ করুন)$/i.test((el.innerText||el.getAttribute('aria-label')||'').trim()));
    if(close) { close.click(); return true; }
    return false;
  }
  async function record(runId,url,status,reason,httpStatus=null) {
    const d=await chrome.storage.local.get(['submissionHistory']);
    const rows=d.submissionHistory||[];
    // Replace the record for this URL within this run instead of double-counting it.
    const index=rows.findIndex(r=>r.runId===runId&&r.url===url);
    const row={runId,url,status,reason,httpStatus,timestamp:new Date().toISOString()};
    if(index>=0) rows[index]=row; else rows.push(row);
    await chrome.storage.local.set({submissionHistory:rows});
  }
  let processing=false;
  async function run(runId) {
    if(processing) return;
    processing=true;
    currentRunId=runId;
    stopRequested=false;
    try {
      while(await active(runId)) {
        const d=await chrome.storage.local.get(['removalQueue','stepDelay','processedCount','failedCount','failedUrls']);
        const queue=d.removalQueue||[];
        if(!queue.length) { await chrome.storage.local.set({isRunning:false,paused:false,currentUrl:'',statusText:'Queue complete. Review the confirmed count.'}); break; }
        const url=queue[0], delay=Math.max(1500,Math.min(30000,Number(d.stepDelay)||2500));
        if(!(await active(runId))) break;
        await chrome.storage.local.set({currentUrl:url,statusText:'Checking HTTP status before submission…'});
        // Check immediately before each request. No submission on redirects or uncertainty.
        let check;
        try { check = await chrome.runtime.sendMessage({action:'CHECK_URL_SAFETY',url}); }
        catch(e) { check={eligible:false,status:'unknown',reason:e.message}; }
        if (!(await active(runId))) break;
        if (!check?.eligible) {
          const latest=await chrome.storage.local.get(['removalQueue','failedCount','failedUrls']);
          if(latest.removalQueue?.[0]!==url) { await pause(runId,'Paused: Queue changed during safety check.'); break; }
          await record(runId,url,'skipped',check?.reason||'HTTP safety check rejected URL',check?.status||'unknown');
          await chrome.storage.local.set({removalQueue:latest.removalQueue.slice(1),
            failedUrls:[...(latest.failedUrls||[]),`${url} — SKIPPED (${check?.status||'unknown'}: ${check?.reason||'unverified'})`],
            statusText:`Skipped unsafe URL (${check?.status||'unknown'}).`,currentUrl:''});
          continue;
        }
        if(!(await active(runId))) break;
        await chrome.storage.local.set({statusText:'HTTP 404/410 verified. Opening new request…'});
        if (anyOpenRemovalDialog()) { await pause(runId,'Paused: An existing GSC removal dialog is open. Cancel or finish it manually, then verify GSC history before restarting.'); break; }
        const open=await findButton(labels.newRequest);
        if(!(await active(runId))) break;
        if(!open) { await record(runId,url,'failed','New request button not found',check.status); await pause(runId,'Paused: New request button not found. Check GSC language/page.'); break; }
        if(!(await active(runId))) break;
        open.click(); await sleep(delay);
        if(!(await active(runId))) break;
        if(!(await active(runId))) break;
        if(!(await inputUrl(url))) { await record(runId,url,'failed','URL input field missing',check.status); await pause(runId,'Paused: New Request URL field not ready. Queue preserved; check GSC dialog.'); break; }
        await sleep(500);
        const next=await findDialogButton(labels.next,6500);
        if(!(await active(runId))) break;
        if(!next) { await record(runId,url,'failed','Next button missing or URL rejected',check.status); await pause(runId,'Paused: Next button missing or URL rejected. Queue preserved.'); break; }
        if(!(await active(runId))) break;
        next.click(); await sleep(delay);
        const submit=await findConfirmationSubmit(url,12000);
        if(!(await active(runId))) break;
        if(!submit) { await record(runId,url,'failed','Submit button unavailable',check.status); await pause(runId,'Paused: Confirmation dialog or matching Submit Request button unavailable. Verify the displayed URL; queue preserved.'); break; }
        if(!(await active(runId))) break;
        const before=document.body.innerText || '';
        const beforeRows=visibleRequestRows(url).length;
        // Record uncertain outcome immediately: a click can submit even if the tab closes.
        if(!(await active(runId))) break;
        await record(runId,url,'unverified','Submit about to be clicked; outcome needs verification',check.status);
        if(!(await active(runId))) break;
        submit.click();
        await sleep(delay+1000);
        if(!(await active(runId))) break;
        // A known duplicate is not a new submission. Close it and continue safely.
        const duplicate=duplicateDialog();
        if(duplicate) {
          if(!closeDuplicateDialog(duplicate)) {
            await record(runId,url,'unverified','Duplicate request detected, but dialog could not be closed safely',check.status);
            await pause(runId,'Paused: Duplicate request dialog could not be closed. Close it manually before restarting.');
            break;
          }
          const latest=await chrome.storage.local.get(['removalQueue','failedCount','failedUrls']);
          if(latest.removalQueue?.[0]!==url) {
            await pause(runId,'Paused: Queue changed while handling duplicate request.');
            break;
          }
          await record(runId,url,'duplicate','Already has an active GSC removal request (duplicate)',check.status);
          await chrome.storage.local.set({
            removalQueue:latest.removalQueue.slice(1),
            failedUrls:[...(latest.failedUrls||[]),`${url} — DUPLICATE (active GSC request)`],
            currentUrl:'',
            statusText:'Skipped existing active request; moving to next URL.'
          });
          await sleep(600);
          continue;
        }
        // If the page doesn't provide clear confirmation, never count a click as success.
        if(!hasConfirmation(url,before,beforeRows)) {
          await record(runId,url,'unverified','Submit clicked but GSC confirmation not detected; check manually',check.status);
          await pause(runId,`Paused: Could not verify submission of ${url}. Check Search Console manually before resuming to avoid duplicate requests.`);
          break;
        }
        if(!(await active(runId))) break;
        const latest=await chrome.storage.local.get(['removalQueue','processedCount']);
        // Only remove the exact URL that this run just handled.
        if(latest.removalQueue?.[0]!==url) { await pause(runId,'Paused: Queue changed during processing.'); break; }
        await record(runId,url,'confirmed','GSC visible submission acknowledgement',check.status);
        await chrome.storage.local.set({removalQueue:latest.removalQueue.slice(1),processedCount:(latest.processedCount||0)+1,currentUrl:'',statusText:'Request confirmed by visible page feedback.'});
        await sleep(600);
      }
    } catch(err) {
      console.error('GSC Bulk Remover:',err);
      await pause(runId,`Paused on unexpected error: ${err.message}`);
    } finally { processing=false; currentRunId=null; }
  }
  chrome.runtime.onMessage.addListener((message,_sender,sendResponse)=>{
    if(message?.action==='START_REMOVAL' && typeof message.runId==='string') {
      if(processing) { sendResponse({started:false,reason:'Previous run is still winding down. Wait a moment and retry.'}); return; }
      run(message.runId); sendResponse({started:true});
    } else if(message?.action==='CAN_RESUME') {
      sendResponse({safe:!processing&&!anyOpenRemovalDialog(),reason:anyOpenRemovalDialog()?'Close and review the open GSC removal dialog first':'A previous run is still active'});
    } else if(message?.action==='GET_RUN_STATUS') {
      sendResponse({processing,runId:currentRunId});
    } else if(message?.action==='STOP_REMOVAL') {
      stopRequested=true;
      sendResponse({stopped:true});
    }
  });
}
