// SHINI v4.2.6 deterministic ledger reconciliation, strict import and About/status layer.
(()=>{'use strict';
const VERSION='4.2.6',REL='4.2.6';
const q=(s,r=document)=>r?.querySelector(s),qa=(s,r=document)=>[...(r?.querySelectorAll(s)||[])];
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=(s,v)=>{try{return money(s,v)}catch{return `₹${n(v).toLocaleString('en-IN',{maximumFractionDigits:2})}`}};

globalThis.SHINI_RELEASE_BUILD=REL;
if(Array.isArray(NAV)&&!NAV.some(x=>x[0]==='about')){const i=Math.max(0,NAV.findIndex(x=>x[0]==='settings'));NAV.splice(i<0?NAV.length:i,0,['about','About'])}

if(typeof IMPORTS==='object'){
  IMPORTS.categories={label:'Categories / classification definitions',id:'category_id',target:'categories',fields:['category_id','name','group','budget','essential','character','budget_class','active']};
  const af=IMPORTS.accounts?.fields||[];for(const f of['opening_balance','opening_date','reconciliation_balance','reconciliation_date'])if(!af.includes(f))af.push(f);
}
if(typeof importedRecord==='function'&&!importedRecord.__v426){
  const prior=importedRecord,wrapped=function(kind,r){
    if(kind==='categories')return{id:String(r.category_id||'').trim(),name:String(r.name||r.category_id||'').trim(),group:String(r.group||'Custom'),budget:n(r.budget),essential:/^(1|true|yes|y)$/i.test(String(r.essential||'')),character:String(r.character||'variable'),budgetClass:String(r.budget_class||'want'),active:r.active===''?true:/^(1|true|yes|y)$/i.test(String(r.active)),system:false,imported:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),manualFields:[],provenance:{source:'csv',lastImportAt:new Date().toISOString()}};
    const x=prior(kind,r);
    if(kind==='accounts'&&x){
      const openingRaw=r.opening_balance!==undefined&&r.opening_balance!==''?r.opening_balance:(/opening balance/i.test(String(r.note||''))?r.balance:'');
      const noteDate=String(r.note||'').match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1]||'';
      if(openingRaw!==''){x.openingBalance=n(openingRaw);x.openingDate=String(r.opening_date||noteDate||'').trim();x.balance=x.openingBalance;x.balanceMode='ledger';}
      if(r.reconciliation_balance!==undefined&&r.reconciliation_balance!=='')x.reconciliationExpectedBalance=n(r.reconciliation_balance);
      if(r.reconciliation_date)x.reconciliationDate=String(r.reconciliation_date);
    }
    return x;
  };wrapped.__v426=true;importedRecord=wrapped;globalThis.importedRecord=wrapped;
}

function txDeltaForAccount(s,t,accountId){
  if(!t||t.archived||t.balanceImpactApplied===false)return 0;
  const amt=n(t.amount),type=semantic(s,t);let d=0;
  if(t.accountId===accountId){if(['transfer','investment','repayment','expense'].includes(type))d-=amt;else if(['income','borrowing'].includes(type))d+=amt}
  if(t.toAccountId===accountId&&['transfer','investment','repayment'].includes(type))d+=amt;
  return d;
}
function ledgerBalance(s,a,toDate=''){
  if(a?.openingBalance===undefined||a?.openingBalance===null||a?.openingBalance==='')return null;
  let v=n(a.openingBalance);const from=a.openingDate||'';
  for(const t of s.transactions||[]){if(t.archived||t.balanceImpactApplied===false)continue;if(from&&t.date&&t.date<from)continue;if(toDate&&t.date&&t.date>toDate)continue;v+=txDeltaForAccount(s,t,a.id)}return Math.round((v+Number.EPSILON)*100)/100;
}
function reconcileAnchoredAccounts(s){
  if(!s)return[];const out=[];
  for(const a of s.accounts||[]){const derived=ledgerBalance(s,a);if(derived===null)continue;const before=n(a.balance);a.balance=derived;a.balanceMode='ledger';const expected=a.reconciliationExpectedBalance!==undefined&&a.reconciliationExpectedBalance!==''?n(a.reconciliationExpectedBalance):null;const checkpoint=expected===null?null:ledgerBalance(s,a,a.reconciliationDate||'');const delta=expected===null?null:Math.round((checkpoint-expected)*100)/100;out.push({id:a.id,name:a.name,before,derived,expected,checkpoint,delta,opening:n(a.openingBalance),openingDate:a.openingDate||'',reconciliationDate:a.reconciliationDate||''})}
  return out;
}
function integrityReport(s){
  const issues=[],warn=[],ids=new Set(),ext=new Set(),bankKeys=new Set();
  for(const t of s.transactions||[]){
    if(!t.id)issues.push('Transaction without ID');else if(ids.has(t.id))issues.push(`Duplicate transaction ID ${t.id}`);ids.add(t.id);
    if(!(n(t.amount)>0))issues.push(`Invalid amount ${t.id||'(unknown)'}`);
    if(t.accountId&&!s.accounts.some(a=>a.id===t.accountId))issues.push(`Missing source account ${t.id}`);
    if(t.toAccountId&&!s.accounts.some(a=>a.id===t.toAccountId))issues.push(`Missing destination account ${t.id}`);
    if(t.categoryId&&!s.categories.some(c=>c.id===t.categoryId))issues.push(`Missing category ${t.categoryId} · ${t.id}`);
    if(t.externalId){if(ext.has(t.externalId))issues.push(`Duplicate external ID ${t.externalId}`);ext.add(t.externalId)}
    try{const k=globalThis.SHINIV425?.bankSourceKey?.(t)||t.bankSourceKey||'';if(k){if(bankKeys.has(k))issues.push(`Duplicate bank source reference ${k}`);bankKeys.add(k)}}catch{}
  }
  const rec=reconcileAnchoredAccounts(s);for(const r of rec){if(r.delta!==null&&Math.abs(r.delta)>.005)issues.push(`${r.name}: reconciliation mismatch ${r.delta>0?'+':''}${cash(s,r.delta)}`);if(r.derived<-.005)issues.push(`${r.name}: derived bank balance is negative (${cash(s,r.derived)})`);if(r.expected===null)warn.push(`${r.name}: no closing reconciliation checkpoint configured`)}
  return{issues,warn,reconciliations:rec};
}

if(typeof save==='function'&&!save.__v426){const prior=save,wrapped=async function(opt){const s=typeof getState==='function'?getState():null;if(s)reconcileAnchoredAccounts(s);return prior(opt)};wrapped.__v426=true;save=wrapped;globalThis.save=wrapped}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('#commitImport');if(!b)return;
  const host=document.getElementById('bulkStage'),text=String(host?.textContent||'').toLowerCase();
  if(text.includes('invalid')){e.preventDefault();e.stopImmediatePropagation();try{toast('Import blocked: resolve every invalid row/definition first. Bank statement batches are atomic.')}catch{}return}
},true);

function downloadJson(name,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function backupAndClear(){
  const s=typeof getState==='function'?getState():null;if(!s)return;
  if(typeof requireDeleteCredential!=='function'||!await requireDeleteCredential(s,'Export a readable backup, then clear all financial records and reset account balances?'))return;
  const phrase=prompt('Type BACKUP AND CLEAR to continue:');if(phrase!=='BACKUP AND CLEAR'){try{toast('Clear cancelled')}catch{}return}
  downloadJson(`SHINI_backup_before_clear_${new Date().toISOString().slice(0,10)}.json`,{product:'SHINI',release:globalThis.SHINI_RELEASE_BUILD||REL,revision:typeof getRevision==='function'?getRevision():null,exportedAt:new Date().toISOString(),state:s});
  const keep={settings:s.settings,catalogs:s.catalogs,categories:s.categories,accounts:s.accounts.map(a=>({...a,balance:0,openingBalance:'',openingDate:'',reconciliationExpectedBalance:'',reconciliationDate:'',balanceMode:''})),metaDeleteAuth:s.meta?.v42?.deleteAuth||null,createdAt:s.createdAt};
  for(const k of['transactions','recurring','debts','goals','assets','investments','insurance','documents','revisions','snapshots','decisions','checkins'])s[k]=[];
  if(s.creditProfile)s.creditProfile.history=[];s.settings=keep.settings;s.catalogs=keep.catalogs;s.categories=keep.categories;s.accounts=keep.accounts;s.createdAt=keep.createdAt;s.updatedAt=new Date().toISOString();s.meta={v42:{schema:2,deleteAuth:keep.metaDeleteAuth,tombstones:{transactions:{}},notificationState:{},importLog:[],audit:[]},lastImportAt:''};
  try{auditEvent(s,'backup_clear','financial_data','all',{release:globalThis.SHINI_RELEASE_BUILD||REL})}catch{}
  await save({force:true});try{toast('Backup downloaded and financial data cleared.')}catch{}setTimeout(()=>location.reload(),700);
}

function aboutHtml(s){
  const rep=integrityReport(s),tx=s.transactions||[],dates=tx.map(t=>t.date).filter(Boolean).sort(),login=typeof getLogin==='function'?getLogin():'',rev=typeof getRevision==='function'?getRevision():'—';
  const status=rep.issues.length?'Attention required':'Healthy',release=globalThis.SHINI_RELEASE_BUILD||REL;
  return `<div class="grid kpi"><article class="card kpi-card"><div class="label">SHINI release</div><div class="value">${esc(release)}</div><div class="sub">Base schema runtime ${typeof BUILD!=='undefined'?BUILD:'—'}</div></article><article class="card kpi-card"><div class="label">Vault revision</div><div class="value">${esc(rev)}</div><div class="sub">Central encrypted vault</div></article><article class="card kpi-card"><div class="label">Integrity status</div><div class="value">${esc(status)}</div><div class="sub">${rep.issues.length} blocking finding(s)</div></article><article class="card kpi-card"><div class="label">Transactions</div><div class="value">${tx.length}</div><div class="sub">${dates.length?`${dates[0]} → ${dates.at(-1)}`:'No ledger data'}</div></article></div>
  <div class="grid two" style="margin-top:14px"><article class="panel"><div class="panel-head"><div><h2>About you</h2><p>Private profile information stored in this encrypted SHINI vault.</p></div></div><div class="metric-list"><div class="metric-row"><span>Profile</span><strong>${esc(s.settings?.profileName||'Personal')}</strong></div><div class="metric-row"><span>SHINI login</span><strong>${esc(login||'—')}</strong></div><div class="metric-row"><span>Currency</span><strong>${esc(s.settings?.currency||'INR')}</strong></div><div class="metric-row"><span>Vault created</span><strong>${esc(s.createdAt||'—')}</strong></div><div class="metric-row"><span>Last modified</span><strong>${esc(s.updatedAt||'—')}</strong></div></div></article>
  <article class="panel"><div class="panel-head"><div><h2>System status</h2><p>Deployment, browser and synchronization context.</p></div></div><div class="metric-list"><div class="metric-row"><span>Product</span><strong>SHINI</strong></div><div class="metric-row"><span>Release</span><strong>${esc(release)}</strong></div><div class="metric-row"><span>Route</span><strong>/app/shini/</strong></div><div class="metric-row"><span>Online</span><strong>${navigator.onLine?'Yes':'No'}</strong></div><div class="metric-row"><span>Service worker</span><strong>${'serviceWorker'in navigator?'Supported':'Unavailable'}</strong></div><div class="metric-row"><span>Web Crypto</span><strong>${crypto?.subtle?'Supported':'Unavailable'}</strong></div><div class="metric-row"><span>Notifications</span><strong>${'Notification'in window?Notification.permission:'Unavailable'}</strong></div></div></article></div>
  <article class="panel" style="margin-top:14px"><div class="panel-head"><div><h2>Account reconciliation</h2><p>Anchored balances are derived from opening balance + ledger, not trusted as mutable counters.</p></div></div>${rep.reconciliations.length?`<div class="table-wrap"><table><thead><tr><th>Account</th><th>Opening</th><th>Derived current</th><th>Expected checkpoint</th><th>Delta</th></tr></thead><tbody>${rep.reconciliations.map(r=>`<tr><td>${esc(r.name||r.id)}</td><td>${cash(s,r.opening)}${r.openingDate?` · ${esc(r.openingDate)}`:''}</td><td>${cash(s,r.derived)}</td><td>${r.expected===null?'—':cash(s,r.expected)}${r.reconciliationDate?` · ${esc(r.reconciliationDate)}`:''}</td><td class="${r.delta!==null&&Math.abs(r.delta)>.005?'negative':'positive'}">${r.delta===null?'—':cash(s,r.delta)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No ledger-reconciliation anchors configured yet.</div>'}</article>
  <article class="panel" style="margin-top:14px"><div class="panel-head"><div><h2>Integrity findings</h2><p>Blocking mismatches are never hidden or clamped to zero.</p></div></div>${rep.issues.length?`<div class="metric-list">${rep.issues.slice(0,100).map(x=>`<div class="metric-row"><span class="negative">${esc(x)}</span></div>`).join('')}</div>`:'<div class="empty positive">No blocking ledger/reference findings.</div>'}${rep.warn.length?`<div class="metric-list">${rep.warn.map(x=>`<div class="metric-row"><span>${esc(x)}</span></div>`).join('')}</div>`:''}</article>`;
}
function enhance(){
  const s=typeof getState==='function'?getState():null,root=document.getElementById('pageRoot'),title=document.getElementById('pageTitle')?.textContent.trim();if(!s||!root)return;
  if(title==='About'&&!q('#v426About',root)){root.innerHTML=`<div id="v426About">${aboutHtml(s)}</div>`}
  if(title==='Data & Sync'&&!q('#v426BackupClear',root)){
    const p=document.createElement('article');p.id='v426BackupClear';p.className='panel';p.style.marginTop='14px';p.innerHTML='<div class="panel-head"><div><h2>Backup & clear financial data</h2><p>Download a readable JSON backup, then clear all financial records and reset balances while preserving your login, master definitions/categories, account identities and deletion credential.</p></div></div><div class="button-row"><button class="danger" id="v426BackupClearBtn">Backup & clear financial data</button></div><p class="tiny muted">This does not delete your Supabase authentication account or the encrypted-vault container itself; it clears the financial contents safely so SHINI can still open.</p>';root.appendChild(p);q('#v426BackupClearBtn',p).onclick=backupAndClear;
  }
}
let enhancePending=false;function scheduleEnhance(){if(enhancePending)return;enhancePending=true;const run=()=>{enhancePending=false;enhance()};if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0)}
const observeRoot=document.getElementById('pageRoot')||document.documentElement;const obs=new MutationObserver(scheduleEnhance);obs.observe(observeRoot,{subtree:true,childList:true});window.addEventListener('hashchange',()=>setTimeout(enhance,0));setTimeout(enhance,400);
globalThis.SHINIV426={VERSION,REL,ledgerBalance,reconcileAnchoredAccounts,integrityReport,backupAndClear};
})();
