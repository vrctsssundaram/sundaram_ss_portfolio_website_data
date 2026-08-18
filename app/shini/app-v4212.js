// SHINI v4.2.12 final login/observer/cache-coherence hardening.
(()=>{'use strict';
const VERSION='4.2.12';
globalThis.SHINI_RELEASE_BUILD=VERSION;
const q=(s,r=document)=>r?.querySelector(s);
let coherenceReloaded=false;

function normalizeLoginAndRoute(){
  const f=document.getElementById('loginForm');if(!f||f.dataset.v4212||typeof f.onsubmit!=='function')return false;
  const prior=f.onsubmit;f.dataset.v4212='1';
  f.onsubmit=function(e){
    const u=document.getElementById('loginUser');if(u&&!String(u.value||'').includes('@'))u.value=String(u.value||'').trim().toLowerCase();
    // First authenticated paint is always the stable dashboard. The user can navigate anywhere immediately afterwards.
    try{history.replaceState(null,'',`${location.pathname}${location.search}#dashboard`)}catch{try{location.hash='dashboard'}catch{}}
    return prior.call(f,e);
  };
  return true;
}

// v4.1's legacy notification-nav enhancer assigns identical innerHTML from inside a document
// MutationObserver. Make repeated same-value assignments a no-op on only that one button so
// real badge-count changes still render but observer self-churn cannot continue indefinitely.
function stabilizeLegacyNotificationNav(){
  const b=q('#nav [data-v41-page="notifications"]');if(!b||b.dataset.v4212Stable)return false;
  const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!d?.get||!d?.set)return false;
  try{
    let last=d.get.call(b);
    Object.defineProperty(b,'innerHTML',{configurable:true,get(){return d.get.call(this)},set(v){const next=String(v);if(next===last&&d.get.call(this)===next)return;last=next;d.set.call(this,next)}});
    b.dataset.v4212Stable='1';return true;
  }catch{return false}
}

function ensureRecoveryButton(){
  const err=document.getElementById('authError');if(!err||document.getElementById('shiniCacheRepairBtn'))return;
  const b=document.createElement('button');b.id='shiniCacheRepairBtn';b.type='button';b.className='ghost full hidden';b.textContent='Repair cached SHINI & reload';
  b.title='Clears only SHINI service-worker caches. It does not delete your cloud vault, transactions, definitions or account.';
  b.onclick=async()=>{b.disabled=true;b.textContent='Repairing SHINI cache…';await repairCache(true)};
  err.insertAdjacentElement('afterend',b);
}
function showRecovery(message=''){
  const e=document.getElementById('authError'),b=document.getElementById('shiniCacheRepairBtn');if(message&&e)e.textContent=message;if(b)b.classList.remove('hidden');
}
async function repairCache(reload=true){
  try{
    if('serviceWorker'in navigator){for(const r of await navigator.serviceWorker.getRegistrations())if(String(r.scope||'').includes('/app/shini/'))await r.unregister()}
    if('caches'in window){for(const k of await caches.keys())if(String(k).startsWith('shini-'))await caches.delete(k)}
  }catch(e){console.warn('SHINI cache repair',e)}
  if(reload)location.reload();
}
async function refreshServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  try{const r=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await r.update()}catch(e){console.warn('SHINI service-worker update',e)}
}

function assetVersions(){
  const versions=new Set;for(const el of [...document.scripts,...document.querySelectorAll('link[href]')]){const src=el.src||el.href||'';if(!src.includes('/app/shini/'))continue;try{const v=new URL(src,location.href).searchParams.get('v');if(v)versions.add(v)}catch{}}
  return [...versions];
}
async function checkCoherence(){
  const versions=assetVersions();if(versions.length>1){showRecovery(`Mixed SHINI assets detected (${versions.join(', ')}). Repair the cached app before signing in.`);return false}
  try{
    const r=await fetch(`./release.json?coherence=${Date.now()}`,{cache:'no-store'});if(!r.ok)return true;const live=String((await r.json())?.build||'');
    if(live&&live!==VERSION){
      if(!coherenceReloaded&&!sessionStorage.getItem('shini_v4212_coherence_retry')){coherenceReloaded=true;sessionStorage.setItem('shini_v4212_coherence_retry','1');await repairCache(false);await refreshServiceWorker();location.reload();return false}
      showRecovery(`SHINI deployment is not coherent yet (page ${VERSION}, server ${live}). Repair cached SHINI and reload.`);return false
    }
    sessionStorage.removeItem('shini_v4212_coherence_retry');return true
  }catch{return true}
}

function visibilitySafety(){
  try{globalThis.SHINIV4211?.preventWhiteScreen?.('v4.2.12 lifecycle');const unlocked=typeof isUnlocked==='function'&&isUnlocked(),root=document.getElementById('pageRoot');if(unlocked&&root&&!root.children.length){const nav=document.getElementById('nav'),b=[...(nav?.querySelectorAll('[data-page]')||[])].find(x=>x.dataset.page==='dashboard');if(nav&&b&&typeof nav.onclick==='function')nav.onclick({target:b})}}catch(e){console.error('SHINI lifecycle safety',e);showRecovery('SHINI could not restore the interface. Your cloud vault remains intact; repair the cached app and retry.')}
}

function hardenInputs(){for(const id of['loginUser','loginPass']){const x=document.getElementById(id);if(x){x.setAttribute('autocapitalize','none');x.setAttribute('spellcheck','false');x.setAttribute('autocorrect','off')}}}
function patch(){hardenInputs();normalizeLoginAndRoute();stabilizeLegacyNotificationNav();ensureRecoveryButton();visibilitySafety()}
function schedulePatch(){setTimeout(patch,0)}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{queueMicrotask(patch);refreshServiceWorker();checkCoherence()},{once:true});else{patch();refreshServiceWorker();checkCoherence()}
const obs=new MutationObserver(()=>{stabilizeLegacyNotificationNav();normalizeLoginAndRoute();ensureRecoveryButton()});obs.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',()=>{schedulePatch();checkCoherence()});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedulePatch()});
setTimeout(patch,300);setTimeout(patch,1200);setTimeout(visibilitySafety,3000);

globalThis.SHINIV4212={VERSION,normalizeLoginAndRoute,stabilizeLegacyNotificationNav,repairCache,assetVersions,checkCoherence,visibilitySafety};
})();
