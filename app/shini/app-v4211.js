// SHINI v4.2.11 authentication single-flight + browser lifecycle recovery.
(()=>{'use strict';
const VERSION='4.2.11';
globalThis.SHINI_RELEASE_BUILD=VERSION;
const $=id=>document.getElementById(id);
let authFlight=null,vaultFlight=null,patched=false;

function authVisible(){const a=$('authScreen');return !!a&&!a.classList.contains('hidden')}
function setStatus(text){const e=$('authError');if(e&&authVisible())e.textContent=text||''}
function setLoginBusy(busy){
  const f=$('loginForm'),btn=f?.querySelector('button[type="submit"]'),u=$('loginUser'),p=$('loginPass');
  if(f)f.dataset.loginBusy=busy?'1':'0';
  if(btn){btn.disabled=!!busy;btn.textContent=busy?'Opening SHINI…':'Sign in & open SHINI'}
  if(u)u.readOnly=!!busy;if(p)p.readOnly=!!busy;
}
function showAuth(message=''){
  $('boot')?.classList.add('hidden');$('app')?.classList.add('hidden');$('authScreen')?.classList.remove('hidden');
  const u=$('loginUser');if(u&&!u.value){try{u.value=typeof getLogin==='function'?getLogin():''}catch{}}
  if(message)setStatus(message);
}
function showApp(){
  $('boot')?.classList.add('hidden');$('authScreen')?.classList.add('hidden');$('app')?.classList.remove('hidden');
}
function currentUnlocked(){try{return typeof isUnlocked==='function'&&isUnlocked()}catch{return false}}
function visibleRootCount(){return['boot','authScreen','app'].reduce((n,id)=>{const x=$(id);return n+(x&&!x.classList.contains('hidden')?1:0)},0)}
function safeRouteRefresh(){
  const nav=$('nav');if(!nav||typeof nav.onclick!=='function')return false;
  const route=(location.hash||'#dashboard').slice(1)||'dashboard';
  const buttons=[...nav.querySelectorAll('[data-page]')];const target=buttons.find(x=>x.dataset.page===route)||buttons.find(x=>x.dataset.page==='dashboard');
  if(!target)return false;
  try{nav.onclick({target});return true}catch(e){console.error('SHINI route recovery failed',e);return false}
}
function recoverView(reason='lifecycle'){
  try{
    if(currentUnlocked()){
      showApp();
      const root=$('pageRoot');
      if(!root?.children?.length)safeRouteRefresh();
      return 'app';
    }
    showAuth();return 'auth';
  }catch(e){console.error('SHINI view recovery failed',reason,e);showAuth('SHINI could not restore the previous view. Please sign in again.');return 'auth'}
}
function preventWhiteScreen(context='runtime'){
  if(visibleRootCount()>0)return;
  console.warn('SHINI recovered from an all-hidden view',context);
  recoverView(context);
}

// Network/auth single-flight: one tap = one authentication and one vault decryption.
function patchCloudFlights(){
  try{
    if(typeof auth==='function'&&!auth.__v4211){
      const prior=auth;
      const wrapped=async function(login,password,action='login'){
        if(action==='login'&&authFlight)return authFlight;
        const run=(async()=>{setStatus('Authenticating credentials…');const x=await prior(login,password,action);setStatus('Credentials verified. Loading encrypted vault…');return x})();
        if(action!=='login')return run;
        authFlight=run;try{return await run}finally{authFlight=null}
      };wrapped.__v4211=true;auth=wrapped;globalThis.auth=wrapped;
    }
    if(typeof openVault==='function'&&!openVault.__v4211){
      const prior=openVault;
      const wrapped=async function(password){
        if(vaultFlight)return vaultFlight;
        const run=(async()=>{setStatus('Downloading and decrypting central vault…');const x=await prior(password);setStatus('Vault decrypted. Opening interface…');return x})();
        vaultFlight=run;try{return await run}finally{vaultFlight=null}
      };wrapped.__v4211=true;openVault=wrapped;globalThis.openVault=wrapped;
    }
  }catch(e){console.error('SHINI cloud single-flight patch failed',e)}
}

// Wrap the canonical private login controller rather than reimplementing financial UI rendering.
function patchLoginForm(){
  const form=$('loginForm');if(!form||form.dataset.v4211==='1'||typeof form.onsubmit!=='function')return false;
  const original=form.onsubmit;form.dataset.v4211='1';
  form.onsubmit=async function(e){
    e?.preventDefault?.();
    if(form.dataset.loginBusy==='1')return false;
    setLoginBusy(true);setStatus('Authenticating credentials…');
    try{
      await original.call(form,e||{preventDefault(){}});
      const msg=String($('authError')?.textContent||'').trim();
      if(msg){
        // The base controller catches its own errors. Make any render/decrypt error visible rather than leaving a blank app.
        showAuth(msg);return false;
      }
      if(currentUnlocked()){
        showApp();preventWhiteScreen('post-login');
      }else{
        showAuth('SHINI could not complete the encrypted-vault open. Please try again.');
      }
    }catch(err){
      console.error('SHINI login controller failure',err);
      showAuth(String(err?.message||'Unable to open SHINI. Please try again.'));
    }finally{setLoginBusy(false)}
    return false;
  };
  return true;
}

function patchRuntime(){patchCloudFlights();if(patchLoginForm())patched=true;preventWhiteScreen('patch')}

function runtimeFault(message,error){
  console.error(message,error||'');
  preventWhiteScreen(message);
  if(!currentUnlocked()&&authVisible()){
    const el=$('authError');if(el&&!el.textContent)el.textContent='SHINI encountered a browser/runtime error. Reload the page and sign in again.';
  }
}

window.addEventListener('pageshow',e=>{setTimeout(()=>{recoverView(e.persisted?'bfcache-pageshow':'pageshow');patchRuntime()},0)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(()=>{recoverView('visibility-resume');patchRuntime()},0)});
window.addEventListener('error',e=>runtimeFault('Uncaught browser error',e.error||e.message));
window.addEventListener('unhandledrejection',e=>runtimeFault('Unhandled browser promise rejection',e.reason));
window.addEventListener('shini:synced',()=>preventWhiteScreen('sync'));

// app-ui registers its DOMContentLoaded handler before this script. Queue once afterwards so its canonical handlers exist.
document.addEventListener('DOMContentLoaded',()=>queueMicrotask(patchRuntime),{once:true});
setTimeout(patchRuntime,200);setTimeout(patchRuntime,900);setTimeout(()=>preventWhiteScreen('startup-watchdog'),1800);

globalThis.SHINIV4211={VERSION,recoverView,preventWhiteScreen,patchRuntime};
})();
