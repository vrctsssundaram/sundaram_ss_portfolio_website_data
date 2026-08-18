// SHINI v4.2.7 bulk-import lifecycle and rebuild guidance.
(()=>{'use strict';
const VERSION='4.2.7';
const q=(s,r=document)=>r?.querySelector(s);
function decorateBulk(){
  const root=document.getElementById('pageRoot'),title=document.getElementById('pageTitle')?.textContent.trim();
  if(!root||title!=='Bulk Import')return;
  try{if(typeof enhanceBulk==='function')enhanceBulk()}catch{}
  const structured=q('.v42-bulk',root);
  if(structured&&root.firstElementChild!==structured)root.insertBefore(structured,root.firstElementChild);
  if(!q('#v427ImportGuide',root)){
    const guide=document.createElement('article');guide.id='v427ImportGuide';guide.className='panel';guide.style.marginBottom='14px';
    guide.innerHTML='<div class="panel-head"><div><h2>Clean rebuild import order</h2><p>These are three different schemas. Import them through their matching controls; do not put category/account CSVs into the transaction statement picker.</p></div></div><div class="v42-info-grid"><div><strong>1 · Categories</strong><p>Use <b>Categories / classification definitions → Stage CSV</b>.</p></div><div><strong>2 · Account reconciliation anchors</strong><p>Use <b>Accounts / cards → Stage CSV</b>. This establishes opening and expected checkpoint balances.</p></div><div><strong>3 · Transactions</strong><p>Use <b>AI-assisted statement workflow → Choose SHINI CSV</b> only for the canonical transaction file.</p></div></div><div class="v42-danger-note">A Category Definitions CSV or Account Reconciliation Anchors CSV is not a transaction statement. Loading either into the transaction picker will correctly fail schema validation.</div>';
    root.insertBefore(guide,root.firstElementChild);
  }
  for(const h of root.querySelectorAll('h2')){
    if(/Bulk Import\s*\/\s*AI-assisted statement workflow/i.test(h.textContent||'')&&!h.dataset.v427){
      h.dataset.v427='1';h.textContent='Transactions only · AI-assisted statement workflow';
      const p=h.closest('.panel')?.querySelector('.panel-head p');if(p)p.textContent='Canonical SHINI transaction CSV only. Categories, account anchors, loans and other master data use the structured import cards above.';
    }
  }
  if(structured){
    const mark=(kind,label)=>{const inp=q(`[data-v42-import="${kind}"]`,structured),card=inp?.closest('.v42-import-card');if(card&&!q('.v427-step',card)){const b=document.createElement('div');b.className='eyebrow v427-step';b.textContent=label;card.insertBefore(b,card.firstChild)}};
    mark('categories','STEP 1 · REBUILD PREREQUISITE');mark('accounts','STEP 2 · RECONCILIATION ANCHOR');
  }
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorateBulk()})}
const obs=new MutationObserver(schedule);obs.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="bulk"],[data-dock="bulk"]')){setTimeout(decorateBulk,0);setTimeout(decorateBulk,80)}},true);
window.addEventListener('hashchange',()=>setTimeout(decorateBulk,0));
setTimeout(decorateBulk,250);setTimeout(decorateBulk,900);
globalThis.SHINIV427={VERSION,decorateBulk};
})();
