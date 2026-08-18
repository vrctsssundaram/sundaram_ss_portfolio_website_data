// SHINI v4.2.11 login lifecycle, observer-quiescence and PWA recovery layer.
(()=>{'use strict';
const VERSION='4.2.11';
globalThis.SHINI_RELEASE_BUILD=VERSION;
const q=(s,r=document)=>r?.querySelector(s);
let loginInFlight=false;

function unlocked(){try{return typeof isUnlocked==='function'?isUnlocked():!!(typeof getState==='function'&&getState())}catch{return false}}
function setAuthMessage(msg){const e=document.getElementById('authError');if(e)e.textContent=msg||''}
function showRecovery(show=true){const b=document.getElementById('shiniAuthRecoveryBtn');if(b)b.classList.toggle('hidden',!show)}

// v4.1 repeatedly assigns identical notification markup from inside its document observer.
// Stabilise only that legacy button: same-value innerHTML writes become no-ops, while a real
// notification-count change still updates normally. This stops continuous post-login DOM churn.
function stabilizeLegacyNotificationButton(){
  const nb=q('#nav [data-v41-page="notifications"]');
  if(!nb||nb.dataset.v4211Stable)return false;
  const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!d?.get||!d?.set)return false;
  try{
    let last=d.get.call(nb);
    Object.defineProperty(nb,'innerHTML',{configurable:true,get(){return d.get.call(this)},set(v){const next=String(v);if(next===last&&d.get.call(this)===next)return;last=next;d.set.call(this,next)}});
    nb.dataset.v4211Stable='1';return true;
  }catch{return false}
}

function ensureAuthRecoveryButton(){
  const err=document.getElementById('authError');if(!err||document.getElementById('shiniAuthRecoveryBtn'))return;
  const b=document.createElement('button');b.id='shiniAuthRecoveryBtn';b.type='button';b.className='ghost full hidden';b.textContent='Repair cached app & reload';
  b.title='Clears only SHINI service-worker caches and reloads the app. Your cloud vault and financial data are not deleted.';
  b.onclick=async()=>{b.disabled=true;b.textContent='Repairing app cache…';try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)if(r.scope.includes('/app/shini/'))await r.unregister()}if('caches'in window){for(const k of await caches.keys())if(k.startsWith('shini-'))await caches.delete(k)}}catch{}location.reload()};
  err.insertAdjacentElement('afterend',b);
}

function recoverVisibleSurface(){
  const boot=document.getElementById('boot'),auth=document.getElementById('authScreen'),app=document.getElementById('app');if(!boot||!auth||!app)return;
  const bootHidden=boot.classList.contains('hidden'),authHidden=auth.classList.contains('hidden'),appHidden=app.classList.contains('hidden');
  if(!bootHidden)return;
  if(unlocked()){
    if(appHidden)app.classList.remove('hidden');
    if(!authHidden)auth.classList.add('hidden');
    const root=document.getElementById('pageRoot');if(root&&!root.children.length){const nav=document.getElementById('nav'),b=q('[data-page="dashboard"]',nav);if(nav&&b&&typeof nav.onclick==='function')try{nav.onclick({target:b})}catch{}}
  }else if(authHidden&&appHidden){auth.classList.remove('hidden')}
}

function hardenLoginForm(){
  const form=document.getElementById('loginForm');if(!form||form.dataset.v4211||typeof form.onsubmit!=='function')return false;
  const prior=form.onsubmit;form.dataset.v4211='1';
  form.onsubmit=async function(e){
    if(loginInFlight){e?.preventDefault?.();setAuthMessage('Sign-in is already in progress…');return}
    loginInFlight=true;const btn=q('button[type="submit"]',form),old=btn?.textContent||'Sign in & open SHINI',user=document.getElementById('loginUser');
    if(user&&!user.value.includes('@'))user.value=user.value.trim().toLowerCase();
    // A restored #about/#notifications route must never be able to block first paint after unlock.
    try{history.replaceState(null,'',`${location.pathname}${location.search}#dashboard`)}catch{location.hash='dashboard'}
    if(btn){btn.disabled=true;btn.textContent='Opening SHINI…'}setAuthMessage('Authenticating account and opening encrypted vault…');showRecovery(false);
    let timedOut=false;const watchdog=setTimeout(()=>{timedOut=true;if(!unlocked()){setAuthMessage('SHINI is taking unusually long to open. Check the connection or repair the cached app and retry.');showRecovery(true)}},30000);
    try{await prior.call(form,e);recoverVisibleSurface();if(unlocked()){setAuthMessage('');showRecovery(false)}}finally{clearTimeout(watchdog);loginInFlight=false;if(btn){btn.disabled=false;btn.textContent=old}if(timedOut&&!unlocked())showRecovery(true)}
  };
  return true;
}

async function refreshServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  try{const r=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await r.update()}catch(e){console.warn('SHINI service-worker refresh',e)}
}

function loadedAssetVersions(){const out=new Set;for(const el of [...document.scripts,...document.querySelectorAll('link[href]')]){const src=el.src||el.href||'';if(!src.includes('/app/shini/'))continue;try{const v=new URL(src,location.href).searchParams.get('v');if(v)out.add(v)}catch{}}return [...out]}
async function checkReleaseCoherence(){
  const local=VERSION,versions=loadedAssetVersions();
  if(versions.length>1){setAuthMessage(`Mixed SHINI asset versions detected (${versions.join(', ')}). Repair the cached app before signing in.`);showRecovery(true);return false}
  try{
    const r=await fetch(`./release.json?health=${Date.now()}`,{cache:'no-store'});if(!r.ok)return true;const x=await r.json();const live=String(x?.build||'');
    if(live&&live!==local){const k='shini_v4211_coherence_reload';if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');try{if('caches'in window){for(const n of await caches.keys())if(n.startsWith('shini-'))await caches.delete(n)}await refreshServiceWorker()}catch{}location.reload();return false}setAuthMessage(`SHINI deployment is mixed: page ${local}, server ${live}. Repair the cached app and reload.`);showRecovery(true);return false}
    sessionStorage.removeItem('shini_v4211_coherence_reload');return true
  }catch{return true}
}

function reportRuntimeFailure(value){
  console.error('SHINI runtime failure',value);recoverVisibleSurface();
  const boot=document.getElementById('boot'),auth=document.getElementById('authScreen'),app=document.getElementById('app'),noSurface=boot?.classList.contains('hidden')&&auth?.classList.contains('hidden')&&app?.classList.contains('hidden');
  if(loginInFlight||noSurface){setAuthMessage('SHINI encountered a runtime error while opening. Your cloud vault was not deleted. Repair the cached app and retry.');showRecovery(true)}
}

function boot(){
  ensureAuthRecoveryButton();hardenLoginForm();stabilizeLegacyNotificationButton();refreshServiceWorker();checkReleaseCoherence();
  const obs=new MutationObserver(()=>{stabilizeLegacyNotificationButton();hardenLoginForm();recoverVisibleSurface()});obs.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('pageshow',()=>{recoverVisibleSurface();stabilizeLegacyNotificationButton();checkReleaseCoherence()});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(recoverVisibleSurface,0)});
  window.addEventListener('error',e=>reportRuntimeFailure(e.error||e.message));window.addEventListener('unhandledrejection',e=>reportRuntimeFailure(e.reason));
  setTimeout(recoverVisibleSurface,1200);setTimeout(recoverVisibleSurface,3500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
globalThis.SHINIV4211={VERSION,hardenLoginForm,stabilizeLegacyNotificationButton,recoverVisibleSurface,loadedAssetVersions,checkReleaseCoherence};
})();
