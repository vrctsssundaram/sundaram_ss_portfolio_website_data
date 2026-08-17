// VASU v2.6 — identity, navigation, responsiveness and interaction polish.
// Presentation/navigation only: no accounting formulas or ledger semantics are changed here.

const VASU_BRAND_EXPANSION='Value & Asset Stewardship Utility';
let vasuIdentityPersisting=false;
let vasuHistoryMute=false;

function vasuUsername(){
  try{
    const direct=typeof vasuCloudLogin==='function'?String(vasuCloudLogin()||'').trim():'';
    if(direct)return direct;
    const session=typeof vasuCloudSession==='function'?vasuCloudSession():null;
    return String(session?.user?.user_metadata?.username||session?.user?.user_metadata?.login||'').trim();
  }catch{return ''}
}
function vasuPersonalLabel(){const u=vasuUsername();return u?`${u} — Personal`:'Personal'}
function vasuReplaceVisibleText(root,from,to){
  if(!root||!from||from===to)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
  while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{if(n.nodeValue?.includes(from))n.nodeValue=n.nodeValue.split(from).join(to)});
}
function vasuApplyIdentity({persist=false}={}){
  document.title=`VASU — ${VASU_BRAND_EXPANSION}`;
  const label=vasuPersonalLabel();
  const side=document.getElementById('profileNameSide');if(side)side.textContent=label;
  const brandStrong=document.querySelector('.sidebar-brand strong');if(brandStrong)brandStrong.textContent='VASU';
  const lockTitle=document.querySelector('.lock-card h1');if(lockTitle)lockTitle.textContent='VASU';
  const lockSub=document.getElementById('lockSubtitle');if(lockSub&&!/legacy local vault/i.test(lockSub.textContent||''))lockSub.textContent=VASU_BRAND_EXPANSION;
  document.querySelectorAll('.sidebar-brand,.lock-card,.topbar').forEach(root=>{
    vasuReplaceVisibleText(root,'Value Asset Stewardship Utility',VASU_BRAND_EXPANSION);
    vasuReplaceVisibleText(root,'Sundaram — Personal',label);
    vasuReplaceVisibleText(root,'Sundaram - Personal',label);
  });
  if(persist&&vasuUsername()&&state?.settings&&state.settings.profileName!==label&&!vasuIdentityPersisting){
    state.settings.profileName=label;vasuIdentityPersisting=true;
    Promise.resolve(saveState()).catch(()=>{}).finally(()=>{vasuIdentityPersisting=false});
  }
}

function vasuInjectPolishStyles(){
  if(document.getElementById('vasuPolishStyles'))return;
  const s=document.createElement('style');s.id='vasuPolishStyles';s.textContent=`
    html,body{max-width:100%;overflow-x:hidden;scroll-behavior:smooth}
    body{background:#0B1C2E}
    .main,.page,.panel,.toolbar,.filters,.grid-2,.grid-3,.kpi-grid,.summary-strip{min-width:0}
    .main{padding-inline:clamp(14px,2vw,34px)}
    .panel,.kpi,.account-card,.lock-card,.modal-card{border-color:#2A3F55!important}
    .panel,.kpi,.account-card{transition:transform .18s ease,border-color .18s ease,background-color .18s ease,box-shadow .18s ease}
    .topbar{box-shadow:0 10px 28px rgba(4,14,24,.14)}
    button,.nav-item,.file-button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    button:focus-visible,.nav-item:focus-visible,.file-button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:2px solid rgba(212,184,106,.72)!important;outline-offset:2px;box-shadow:0 0 0 4px rgba(212,184,106,.10)!important}
    .primary{box-shadow:0 4px 14px rgba(201,168,76,.12)}
    .primary,.secondary,.ghost,.danger,.nav-item{transition:transform .14s ease,background-color .14s ease,border-color .14s ease,color .14s ease,box-shadow .14s ease}
    .primary:active,.secondary:active,.ghost:active,.danger:active,.nav-item:active{transform:scale(.985)}
    .page.active{animation:vasuPageIn .22s cubic-bezier(.2,.72,.24,1) both}
    .modal:not(.hidden) .modal-card{animation:vasuModalIn .18s cubic-bezier(.2,.72,.24,1) both}
    .toast:not(.hidden){animation:vasuToastIn .18s ease-out both}
    @keyframes vasuPageIn{from{opacity:.35;transform:translateY(5px)}to{opacity:1;transform:none}}
    @keyframes vasuModalIn{from{opacity:.25;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}
    @keyframes vasuToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .table-wrap{max-width:100%;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;-webkit-overflow-scrolling:touch;border-radius:12px}
    .data-table{max-width:none}.data-table th{position:sticky;top:0;z-index:3;background:#121C29}
    .data-table td,.data-table th{white-space:nowrap}.data-table td:nth-child(5),.data-table td:last-child{white-space:normal}
    canvas{max-width:100%}
    .toolbar{flex-wrap:wrap}.filters{min-width:0;flex-wrap:wrap}.filters>*{min-width:0}
    .top-actions{flex-wrap:wrap;justify-content:flex-end}
    .nav-item.active{box-shadow:inset 3px 0 0 #C9A84C}
    .vasu-shortcut-hint{font-size:10px;color:#6B7A88;border:1px solid #2A3F55;border-radius:7px;padding:4px 7px;background:#162A3D;white-space:nowrap}
    .vasu-skip-link{position:fixed;left:12px;top:8px;transform:translateY(-150%);z-index:10000;background:#C9A84C;color:#0B1C2E;padding:8px 11px;border-radius:8px;font-weight:700;transition:transform .15s ease}
    .vasu-skip-link:focus{transform:none}
    .sidebar nav{overscroll-behavior:contain}
    @media (hover:hover) and (pointer:fine){
      .panel:hover,.account-card:hover{border-color:#38536d!important;box-shadow:0 10px 30px rgba(4,14,24,.10)}
      .kpi:hover{border-color:#38536d!important;transform:translateY(-1px)}
      .primary:hover,.secondary:hover,.ghost:hover,.danger:hover{transform:translateY(-1px)}
    }
    @media (pointer:coarse){
      button,.nav-item,.file-button{min-height:44px}
      input,select,textarea{min-height:44px;font-size:16px}
      .mini-btn{min-height:38px;min-width:38px}
      .data-table td,.data-table th{padding:11px 10px}
    }
    @media(max-width:1100px){.topbar{gap:10px}.top-actions{max-width:56%}}
    @media(max-width:820px){
      body{padding-bottom:env(safe-area-inset-bottom)}
      .main{padding-inline:12px;padding-bottom:calc(84px + env(safe-area-inset-bottom))}
      .sidebar{height:calc(66px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain}
      .sidebar::-webkit-scrollbar{display:none}.sidebar nav{scroll-snap-type:x proximity;gap:5px}.nav-item{scroll-snap-align:center;min-height:48px;border:1px solid transparent}
      .nav-item.active{box-shadow:inset 0 -3px 0 #C9A84C;background:#1F3549}
      .topbar{height:auto;min-height:74px;padding:10px 0;align-items:center}.top-actions{max-width:58%;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.top-actions::-webkit-scrollbar{display:none}
      .topbar h1{font-size:20px}.page{padding-top:14px}.panel{border-radius:15px;padding:14px}.kpi{min-height:112px}
      .modal{padding:0;align-items:end}.modal-card{width:100%;max-width:none;max-height:92dvh;border-radius:20px 20px 0 0;padding:16px;padding-bottom:calc(16px + env(safe-area-inset-bottom))}
      .table-wrap{margin-inline:-2px;padding-bottom:4px}.data-table{min-width:760px}
      .vasu-shortcut-hint{display:none}
    }
    @media(max-width:520px){
      .main{padding-inline:10px}.topbar{min-height:68px}.topbar h1{font-size:19px}.top-actions{max-width:46%}
      .panel{padding:12px}.kpi strong{font-size:26px}.summary-strip>div{padding:10px}.micro-grid{gap:7px}
      .button-row>*{flex:1 1 auto}.toolbar>.primary{width:100%}
    }
    @media(min-width:1600px){
      body{font-size:15px}.main{max-width:2200px;padding-inline:clamp(30px,2.4vw,52px)}.panel{padding:19px}.kpi{padding:19px}.topbar{height:100px}.topbar h1{font-size:27px}
    }
    @media(min-width:2500px){body{font-size:16px}.main{max-width:2600px}.panel{border-radius:20px}.kpi strong{font-size:32px}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
  `;document.head.appendChild(s);
}

function vasuActivePage(){return document.querySelector('.page.active')?.id?.replace(/^page-/,'')||'dashboard'}
function vasuScrollActiveNav(){
  const active=document.querySelector('.nav-item.active');if(!active)return;
  if(window.matchMedia('(max-width:820px)').matches)requestAnimationFrame(()=>active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}));
}
function vasuSetupHistory(){
  if(window.__vasuHistoryReady)return;window.__vasuHistoryReady=true;
  const initial=vasuActivePage();history.replaceState({...history.state,vasuPage:initial},'',location.href);sessionStorage.setItem('vasu_last_page',initial);
  window.addEventListener('popstate',e=>{
    const p=e.state?.vasuPage||'dashboard';vasuHistoryMute=true;try{showPage(p)}finally{vasuHistoryMute=false}sessionStorage.setItem('vasu_last_page',p);vasuScrollActiveNav();
  });
}
function vasuRestoreLastPage(){
  const p=sessionStorage.getItem('vasu_last_page');if(p&&document.getElementById(`page-${p}`)&&p!==vasuActivePage()){vasuHistoryMute=true;try{showPage(p)}finally{vasuHistoryMute=false}}
}

function vasuAddAccessibility(){
  if(!document.getElementById('vasuSkipLink')){const a=document.createElement('a');a.id='vasuSkipLink';a.className='vasu-skip-link';a.href='#page-dashboard';a.textContent='Skip to main content';a.onclick=e=>{e.preventDefault();const page=document.querySelector('.page.active');page?.setAttribute('tabindex','-1');page?.focus({preventScroll:false})};document.body.prepend(a)}
  document.querySelectorAll('.nav-item').forEach(b=>{b.setAttribute('type','button');b.setAttribute('aria-current',b.classList.contains('active')?'page':'false')});
  document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type')&&!b.closest('form'))b.setAttribute('type','button')});
}
function vasuEnhanceActiveNav(){document.querySelectorAll('.nav-item').forEach(b=>b.setAttribute('aria-current',b.classList.contains('active')?'page':'false'));vasuScrollActiveNav()}

function vasuSetupKeyboard(){
  if(window.__vasuKeyboardReady)return;window.__vasuKeyboardReady=true;
  document.addEventListener('keydown',e=>{
    const tag=e.target?.tagName?.toLowerCase(),editing=['input','textarea','select'].includes(tag)||e.target?.isContentEditable;
    if(e.key==='Escape'&&!document.getElementById('modal')?.classList.contains('hidden')){e.preventDefault();if(typeof closeModal==='function')closeModal();return}
    if(editing)return;
    if((e.ctrlKey||e.metaKey)&&e.shiftKey){
      const key=e.key.toLowerCase(),map={d:'dashboard',t:'transactions',b:'bulk',a:'analytics'};
      if(map[key]){e.preventDefault();showPage(map[key]);return}
      if(key==='n'){e.preventDefault();document.getElementById('quickAddBtn')?.click();return}
    }
  });
}
function vasuAddShortcutHint(){
  const actions=document.querySelector('.top-actions');if(!actions||document.getElementById('vasuShortcutHint'))return;
  const hint=document.createElement('span');hint.id='vasuShortcutHint';hint.className='vasu-shortcut-hint';hint.textContent='Ctrl/⌘ + Shift + N · New';actions.prepend(hint);
}

function vasuPolish(){vasuInjectPolishStyles();vasuApplyIdentity({persist:true});vasuAddAccessibility();vasuSetupHistory();vasuSetupKeyboard();vasuAddShortcutHint();vasuEnhanceActiveNav()}

const vasuV26PrevShowPage=showPage;
showPage=function(p){
  vasuV26PrevShowPage(p);vasuApplyIdentity();vasuAddAccessibility();vasuEnhanceActiveNav();
  if(!vasuHistoryMute){const current=history.state?.vasuPage;if(current!==p)history.pushState({...history.state,vasuPage:p},'',location.href);sessionStorage.setItem('vasu_last_page',p)}
};
const vasuV26PrevShowApp=showApp;
showApp=function(){vasuV26PrevShowApp();vasuPolish();setTimeout(vasuRestoreLastPage,0)};
const vasuV26PrevCentralOpen=vasuCentralOpen;
vasuCentralOpen=async function(register){const r=await vasuV26PrevCentralOpen(register);vasuApplyIdentity({persist:true});return r};
const vasuV26PrevMigrate=vasuMigrateCurrentVault;
vasuMigrateCurrentVault=async function(){const r=await vasuV26PrevMigrate();vasuApplyIdentity({persist:true});return r};
