if (!window.gscBulkRemoverLoaded) {
  window.gscBulkRemoverLoaded = true;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  }

  function simulateClick(element) {
    if (!element) return;
    const events = ['mousedown', 'mouseup', 'click'];
    events.forEach(eventType => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      });
      element.dispatchEvent(event);
    });
  }

  function findButtonByText(textArray) {
    const candidates = document.querySelectorAll('div[role="button"], button, span[ jsslot ], span.VfPpkd-vQzf8d, span.RveJvd');
    for (let text of textArray) {
      for (let el of candidates) {
        if (el.innerText && el.innerText.trim().toLowerCase() === text.toLowerCase()) {
          const clickable = el.closest('div[role="button"]') || el.closest('button') || el;
          if (isVisible(clickable) && clickable.getAttribute('aria-disabled') !== 'true') {
            return clickable;
          }
        }
      }
    }
    return null;
  }

  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
  }

  async function processQueue() {
    const data = await chrome.storage.local.get(['removalQueue', 'isRunning', 'stepDelay', 'processedCount', 'failedCount']);
    const delay = data.stepDelay || 2000;

    if (!data.isRunning) {
      console.log("GSC Bulk Remover: Paused/Stopped.");
      return;
    }

    if (!data.removalQueue || data.removalQueue.length === 0) {
      await chrome.storage.local.set({ isRunning: false, statusText: 'All URLs successfully processed!' });
      alert("GSC Bulk Remover: All URLs have been processed successfully!");
      return;
    }

    const urls = data.removalQueue;
    const currentUrl = urls[0];
    await chrome.storage.local.set({ statusText: `Submitting: ${currentUrl.substring(0, 25)}...` });

    try {
      const newReqBtn = findButtonByText(['New request', 'নতুন অনুরোধ']);
      if (!newReqBtn) {
        await chrome.storage.local.set({ isRunning: false, statusText: "Error: 'New request' button not found!" });
        return;
      }
      simulateClick(newReqBtn);
      await sleep(delay);

      const allInputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'))
                             .filter(el => isVisible(el) && !el.readOnly && !el.disabled && el.getAttribute('aria-label') !== 'Search');
      
      const urlInput = allInputs[allInputs.length - 1];
      if (!urlInput) {
        await chrome.storage.local.set({ isRunning: false, statusText: "Error: URL input field not found!" });
        return;
      }

      urlInput.focus();
      setNativeValue(urlInput, currentUrl);
      await sleep(1000);

      const nextBtn = findButtonByText(['Next', 'পরবর্তী']);
      if (!nextBtn) {
        await chrome.storage.local.set({ isRunning: false, statusText: "Error: 'Next' button not found!" });
        return;
      }
      simulateClick(nextBtn);
      await sleep(delay);

      await sleep(1000);
      const submitBtn = findButtonByText(['Submit request', 'অনুরোধ জমা দিন']);
      
      let isSuccess = false;
      if (submitBtn) {
        simulateClick(submitBtn);
        await sleep(delay + 1000);
        isSuccess = true;
      } else {
        console.warn("Submit button not available, skipping live/invalid URL...");
        const cancelBtn = findButtonByText(['Cancel', 'Close', 'OK', 'বাতিল করুন', 'বন্ধ করুন', 'Dismiss']);
        if (cancelBtn) {
          simulateClick(cancelBtn);
          await sleep(1500);
        }
      }

      const closeErrorBtn = findButtonByText(['Cancel', 'Close', 'OK', 'Dismiss']);
      if (closeErrorBtn) {
        simulateClick(closeErrorBtn);
        await sleep(1200);
      }

      const latestData = await chrome.storage.local.get(['removalQueue', 'isRunning', 'processedCount', 'failedCount']);
      if (!latestData.isRunning) return;

      const updatedQueue = (latestData.removalQueue || []).slice(1);
      
      let currentProcessed = latestData.processedCount || 0;
      let currentFailed = latestData.failedCount || 0;

      if (isSuccess) {
        currentProcessed++;
      } else {
        currentFailed++;
      }

      await chrome.storage.local.set({ 
        removalQueue: updatedQueue, 
        processedCount: currentProcessed,
        failedCount: currentFailed,
        statusText: isSuccess ? 'URL submitted successfully' : 'URL failed / skipped'
      });

      processQueue();

    } catch (err) {
      console.error("GSC Bulk Remover Error:", err);
      const latestData = await chrome.storage.local.get(['removalQueue', 'isRunning', 'failedCount']);
      if (!latestData.isRunning) return;
      const updatedQueue = (latestData.removalQueue || []).slice(1);
      let currentFailed = (latestData.failedCount || 0) + 1;
      
      await chrome.storage.local.set({ 
        removalQueue: updatedQueue, 
        failedCount: currentFailed,
        statusText: 'Error occurred, URL failed' 
      });
      processQueue();
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_REMOVAL') {
      processQueue();
    }
  });
}