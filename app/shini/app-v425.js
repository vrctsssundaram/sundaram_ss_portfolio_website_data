// SHINI v4.2.5 import-integrity and clean-reset layer.
(()=>{'use strict';
const VERSION='4.2.5';
const q=(s,r=document)=>r?.querySelector(s);
const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
function bankSourceKey(t){
  const text=`${t?.externalId||''} ${t?.note||''}`;
  const account=t?.accountId||'';
  const pats=[
    [/\bAPB7513-(PH\d{12,}|\d{12,}|CHBATCH[0-9A-Z-]+)\b/i,'APB'],
    [/UPI\/P2[AM]\/(\d{9,15})/i,'UPI'],
    [/IMPS\/P2A\/(\d{9,15})/i,'IMPS'],
    [/NBSM\/(\d+)/i,'NBSM'],
    [/NEFT\/([A-Z0-9]+)/i,'NEFT'],
    [/\bRRN\s*(\d{10,15})/i,'RRN']
  ];
  for(const [re,kind] of pats){const m=text.match(re);if(m)return`${account}|${kind}|${m[1].toUpperCase()}`}
  return'';
}
function hardenedStageCanonical(s,rows){
  const active=activeTx(s),seenExternal=new Map(),seenSource=new Map();
  const byExternal=new Map(),byFingerprint=new Map(),bySource=new Map();
  for(const x of active){
    if(x.externalId)byExternal.set(String(x.externalId),x);
    if(x.fingerprint)byFingerprint.set(String(x.fingerprint),x);
    const k=x.bankSourceKey||bankSourceKey(x);if(k)bySource.set(k,x);
  }
  return rows.map((r,i)=>{try{
    const tx=canonicalToTx(s,r),sourceKey=bankSourceKey(tx);if(sourceKey)tx.bankSourceKey=sourceKey;
    const exact=byExternal.get(String(tx.externalId||''))||byFingerprint.get(String(tx.fingerprint||''))||sourceKey&&bySource.get(sourceKey)||null;
    const batchExact=seenExternal.get(String(tx.externalId||''))||sourceKey&&seenSource.get(sourceKey)||null;
    const possible=exact||batchExact?null:active.find(x=>x.date===tx.date&&Number(x.amount)===tx.amount&&x.accountId===tx.accountId&&semantic(s,x)===semantic(s,tx)&&norm(x.merchant)===norm(tx.merchant))||null;
    const status=exact?'exact':batchExact?'batch_exact':possible?'possible':'new';
    let action=status==='new'?'ADD':'SKIP';
    if(String(r.import_action||'').toUpperCase()==='SKIP')action='SKIP';
    if(tx.externalId)seenExternal.set(String(tx.externalId),tx);if(sourceKey)seenSource.set(sourceKey,tx);
    return{index:i+1,row:r,tx,status,match:exact||possible||null,batchMatch:batchExact||null,action};
  }catch(e){return{index:i+1,row:r,error:e.message,status:'invalid',action:'SKIP'}}});
}
if(typeof stageCanonical==='function'){stageCanonical=hardenedStageCanonical;globalThis.stageCanonical=hardenedStageCanonical}
if(typeof commitStage==='function'&&!commitStage.__v425){const prior=commitStage,wrapped=function(s,stage){for(const x of stage||[])if(['exact','batch_exact','possible'].includes(x.status)&&x.action==='ADD')x.action='SKIP';return prior(s,stage)};wrapped.__v425=true;commitStage=wrapped;globalThis.commitStage=wrapped}

function resetPanel(){
  const root=document.getElementById('pageRoot'),title=document.getElementById('pageTitle')?.textContent.trim();
  if(!root||title!=='Data & Sync'||q('#v425ResetPanel',root))return;
  const p=document.createElement('article');p.className='panel';p.id='v425ResetPanel';p.style.marginTop='14px';
  p.innerHTML='<div class="panel-head"><div><h2>Clean financial-data reset</h2><p>Clear financial records and balances while preserving your login, settings, master definitions/categories, account identities and deletion credential. Use before a controlled statement re-import.</p></div></div><div class="v42-danger-note">This clears transactions, recurring commitments, loans, goals, assets, investments, insurance, documents/renewals, notification/import history and deleted-transaction tombstones. Account balances are reset to zero.</div><div class="button-row"><button class="danger" id="v425ResetFinancialData">Reset financial data</button></div>';
  root.appendChild(p);q('#v425ResetFinancialData',p).onclick=resetFinancialData;
}
async function resetFinancialData(){
  const s=typeof getState==='function'?getState():null;if(!s)return;
  if(typeof requireDeleteCredential!=='function'||!await requireDeleteCredential(s,'Reset all SHINI financial records and balances while preserving master definitions and account identities?'))return;
  const phrase=prompt('Type RESET FINANCIAL DATA to continue:');if(phrase!=='RESET FINANCIAL DATA'){try{toast('Reset cancelled: confirmation phrase did not match')}catch{}return}
  const counts={};for(const k of['transactions','recurring','debts','goals','assets','investments','insurance','documents']){counts[k]=Array.isArray(s[k])?s[k].length:0;s[k]=[]}
  for(const k of['revisions','snapshots','decisions','checkins'])if(Array.isArray(s[k]))s[k]=[];
  if(s.creditProfile&&Array.isArray(s.creditProfile.history))s.creditProfile.history=[];
  for(const a of s.accounts||[]){a.balance=0;a.updatedAt=new Date().toISOString();if(Array.isArray(a.manualFields))a.manualFields=a.manualFields.filter(x=>x!=='balance')}
  s.meta=s.meta||{};const v=s.meta.v42=s.meta.v42||{},deleteAuth=v.deleteAuth||null, schema=v.schema||2;
  s.meta.lastImportAt='';s.meta.v42={schema,deleteAuth,tombstones:{transactions:{}},notificationState:{},importLog:[],audit:[]};
  try{auditEvent(s,'reset','financial_data','all',{counts,version:VERSION})}catch{}
  try{await save();try{toast('Financial data reset completed. Accounts are at zero; initialize opening balances before importing transactions.')}catch{};setTimeout(()=>location.reload(),700)}catch(e){try{toast('Reset could not synchronize: '+e.message)}catch{}}
}
const obs=new MutationObserver(()=>resetPanel());obs.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',()=>setTimeout(resetPanel,0));setTimeout(resetPanel,300);
globalThis.SHINIV425={VERSION,bankSourceKey,hardenedStageCanonical,resetFinancialData};
})();
