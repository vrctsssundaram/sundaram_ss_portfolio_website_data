// SHINI v4.2.8 structured-import event hardening + persistent refresh/lock controls.
(()=>{'use strict';
const VERSION='4.2.8';
const q=(s,r=document)=>r?.querySelector(s);
globalThis.SHINI_RELEASE_BUILD=VERSION;

function currentState(){try{return typeof v42State==='function'&&typeof ensure==='function'?ensure(v42State()):typeof getState==='function'?getState():null}catch{return null}}
function stageBox(kind){return q(`[data-v42-stage="${kind}"]`,document.getElementById('pageRoot'))}
function renderStage(kind,st,fileName=''){
  const box=stageBox(kind);if(!box)return;
  const bad=st.filter(x=>x.errors?.length),adds=st.filter(x=>x.action==='ADD').length,updates=st.filter(x=>x.action==='UPDATE').length;
  box.innerHTML=`<div class="tiny muted">${fileName?`Selected: <strong>${fileName}</strong><br>`:''}</div><strong>${st.length} rows staged</strong> · ${bad.length} invalid · ${adds} add · ${updates} update${bad.length?`<div class="error">${bad.slice(0,6).map(x=>`Row ${x.index}: ${x.errors.join(', ')}`).join('<br>')}</div>`:''}<div class="button-row"><button class="primary" data-v42-commit="${kind}" ${bad.length?'disabled':''}>${bad.length?'Fix invalid rows before commit':'Commit staged batch'}</button></div>`;
}
async function stageFile(inp){
  const kind=inp.dataset.v42Import,file=inp.files?.[0],box=stageBox(kind);if(!kind||!file)return;
  if(box)box.innerHTML=`<div class="tiny muted">Selected: <strong>${file.name}</strong></div><strong>Reading and validating…</strong>`;
  try{
    const s=currentState();if(!s)throw new Error('SHINI vault is not ready');
    const text=await file.text(),rows=csvParse(text),st=stageMasterImport(s,kind,rows);
    staged.set(kind,st);renderStage(kind,st,file.name);
    try{toast(st.some(x=>x.errors?.length)?`${file.name}: validation needs attention`:`${file.name}: staged successfully`)}catch{}
  }catch(err){if(box)box.innerHTML=`<div class="error">Could not stage ${file.name}: ${String(err?.message||err)}</div>`;try{toast('Structured CSV could not be staged')}catch{}}
}
async function commitKind(kind){
  const s=currentState(),st=staged.get(kind);if(!s||!st)return;
  if(st.some(x=>x.errors?.length)){try{toast('Fix every invalid row before commit')}catch{};return}
  const r=commitMasterImport(s,kind,st);staged.delete(kind);
  try{await v42Save()}catch{return void toast('Commit could not synchronize')}
  try{toast(`${r.added} added, ${r.updated} updated and synchronized`)}catch{}
  try{refresh()}catch{location.reload()}
}

document.addEventListener('change',e=>{const inp=e.target.closest?.('[data-v42-import]');if(!inp)return;e.stopPropagation();stageFile(inp)},true);
document.addEventListener('click',e=>{
  const template=e.target.closest?.('[data-v42-template]');if(template){e.preventDefault();e.stopPropagation();const k=template.dataset.v42Template;try{download(`SHINI_${k}_Template.csv`,templateSample(k))}catch{toast('Template could not be generated')}return}
  const commit=e.target.closest?.('[data-v42-commit]');if(commit){e.preventDefault();e.stopPropagation();commitKind(commit.dataset.v42Commit);return}
},true);

function addTopControls(){
  const actions=q('.top-actions');if(!actions)return;
  if(!q('#shiniRefreshBtn',actions)){
    const b=document.createElement('button');b.id='shiniRefreshBtn';b.className='secondary';b.type='button';b.textContent='↻ Refresh';b.title='Reload SHINI and re-read the current vault. Your signed-in session is kept.';
    b.onclick=()=>{const d=document.getElementById('modal');if(d?.open&&!confirm('Refresh SHINI? Unsaved edits in the open form will be discarded.'))return;b.disabled=true;b.textContent='Refreshing…';location.reload()};
    const exportBtn=q('#exportBtn',actions);actions.insertBefore(b,exportBtn||actions.lastChild);
  }
  if(!q('#shiniTopLockBtn',actions)){
    const b=document.createElement('button');b.id='shiniTopLockBtn';b.className='icon-btn';b.type='button';b.textContent='🔒';b.title='Lock SHINI and require credentials again';b.setAttribute('aria-label','Lock SHINI');b.onclick=()=>q('#lockBtn')?.click();
    const menu=q('#menuBtn',actions);actions.insertBefore(b,menu||null);
  }
}
function updateAbout(){
  if(document.getElementById('pageTitle')?.textContent.trim()!=='About')return;
  const target=globalThis.SHINI_RELEASE_BUILD||VERSION;
  for(const card of document.querySelectorAll('.kpi-card')){if(q('.label',card)?.textContent.trim()==='SHINI release'){const v=q('.value',card);if(v&&v.textContent!==target)v.textContent=target}}
  for(const row of document.querySelectorAll('.metric-row')){if(row.querySelector('span')?.textContent.trim()==='Release'){const v=row.querySelector('strong');if(v&&v.textContent!==target)v.textContent=target}}
}
let pending=false;function decorate(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;addTopControls();updateAbout()})}
const obs=new MutationObserver(decorate);obs.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>setTimeout(decorate,0));setTimeout(decorate,150);setTimeout(decorate,700);
globalThis.SHINIV428={VERSION,stageFile,commitKind,addTopControls};
})();