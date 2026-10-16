const sites=document.getElementById('sites');
const status=document.getElementById('status');
const button=document.getElementById('grant');
let origins=[];
(async()=>{
  const d=await chrome.storage.local.get('pendingPermissionOrigins');
  origins=Array.isArray(d.pendingPermissionOrigins)?d.pendingPermissionOrigins:[];
  sites.textContent=origins.length?origins.join('\n'):'No URLs selected. Return to the extension and upload a list.';
  sites.style.whiteSpace='pre-wrap';
  button.disabled=!origins.length;
  if(origins.length && await chrome.permissions.contains({origins})) { status.textContent='Access already granted. You may return to Search Console.'; button.disabled=true; }
})();
button.addEventListener('click',async()=>{
  if(!origins.length)return;
  button.disabled=true;
  try {
    const granted=await chrome.permissions.request({origins});
    status.textContent=granted?'Access granted. Return to Search Console and press Start.':'Access denied. No URLs were submitted.';
    if(!granted)button.disabled=false;
  }catch(e){status.textContent='Permission request failed: '+e.message;button.disabled=false;}
});
