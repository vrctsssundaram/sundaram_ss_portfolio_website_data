// SHINI v4.2.9 browser-global compatibility patch.
(()=>{'use strict';
// Top-level const bindings from earlier classic scripts are global lexical bindings, not
// guaranteed window/globalThis properties. Register the page through the lexical NAV binding.
try{if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(x=>x[0]==='policies')){const i=NAV.findIndex(x=>x[0]==='settings');NAV.splice(i<0?NAV.length:i,0,['policies','Rules & Policies'])}}catch{}

// v4.2.9's first validation layer cannot read a top-level const IMPORTS through globalThis on
// all browsers. Correct category-ID lookup while retaining strict stable-ID validation.
if(typeof stageMasterImport==='function'&&!stageMasterImport.__v429runtime){const prior=stageMasterImport,wrapped=function(s,kind,rows){const out=prior(s,kind,rows);if(kind==='categories')for(let i=0;i<out.length;i++){const id=String(rows?.[i]?.category_id||'').trim();out[i].errors=(out[i].errors||[]).filter(x=>x!=='missing stable ID');if(!id)out[i].errors.unshift('missing stable ID');else if(!/^[A-Za-z0-9._:-]{2,96}$/.test(id))out[i].errors.push('stable ID contains unsupported characters');out[i].errors=[...new Set(out[i].errors)];out[i].action=out[i].errors.length?'INVALID':out[i].old?'UPDATE':'ADD'}return out};wrapped.__v429runtime=true;stageMasterImport=wrapped;globalThis.stageMasterImport=wrapped}

function safeNavTo(route){const nav=document.getElementById('nav');if(!nav||typeof nav.onclick!=='function')return false;const b=[...nav.querySelectorAll('[data-page]')].find(x=>x.dataset.page===route);if(!b)return false;nav.onclick({target:b});return true}
function softRefresh(){const d=document.getElementById('modal');if(d?.open&&!confirm('Refresh the SHINI interface? Unsaved edits in the open form will be discarded.'))return;try{if(d?.open)d.close()}catch{}const route=(location.hash||'#dashboard').slice(1)||'dashboard';safeNavTo(route);try{toast('SHINI interface refreshed from the active decrypted vault.')}catch{}}
function patch(){const b=document.getElementById('shiniRefreshBtn');if(b){b.onclick=softRefresh;b.title='Re-render SHINI from the active decrypted vault without signing out.'}}
const obs=new MutationObserver(()=>queueMicrotask(patch));obs.observe(document.documentElement,{subtree:true,childList:true});setTimeout(patch,200);setTimeout(patch,800);
globalThis.SHINIV429_RUNTIME={safeNavTo,softRefresh};
})();
