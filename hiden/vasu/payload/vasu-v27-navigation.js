// VASU v2.7 — responsive navigation architecture and independent sidebar scrolling.
// Navigation/presentation only. No financial, ledger, sync or import semantics are changed.

function vasuV27IsMobile(){return window.matchMedia('(max-width:820px)').matches}
function vasuV27DrawerOpen(){return document.querySelector('.sidebar')?.classList.contains('vasu-nav-open')||false}

function vasuV27InjectStyles(){
  if(document.getElementById('vasuV27NavStyles'))return;
  const s=document.createElement('style');s.id='vasuV27NavStyles';s.textContent=`
    .sidebar{display:flex;flex-direction:column;overflow:hidden!important;height:100dvh;max-height:100dvh}
    .sidebar-brand{flex:0 0 auto}
    .sidebar #nav{flex:1 1 auto;min-height:0;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;padding-right:5px;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:#A67C3D transparent}
    .sidebar #nav::-webkit-scrollbar{width:7px}.sidebar #nav::-webkit-scrollbar-track{background:transparent}.sidebar #nav::-webkit-scrollbar-thumb{background:#A67C3D;border-radius:999px;border:2px solid #0E1117}.sidebar #nav::-webkit-scrollbar-thumb:hover{background:#C9A84C}
    .sidebar-footer{flex:0 0 auto;margin-top:10px}
    #vasuMobileDock,#vasuNavBackdrop,#vasuNavCloseBtn{display:none}

    @media(max-width:820px){
      body{padding-bottom:calc(74px + env(safe-area-inset-bottom))!important}
      body.vasu-nav-open{overflow:hidden!important;touch-action:none}
      .main{margin-left:0!important;padding-bottom:calc(92px + env(safe-area-inset-bottom))!important}
      .sidebar{display:flex!important;position:fixed!important;inset:0 auto 0 0!important;width:min(88vw,360px)!important;height:100dvh!important;max-height:100dvh!important;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom))!important;background:#0E1117!important;border-top:0!important;border-right:1px solid #2A3F55!important;overflow:hidden!important;transform:translate3d(-104%,0,0);transition:transform .24s cubic-bezier(.2,.72,.24,1);z-index:1003!important;box-shadow:18px 0 48px rgba(2,10,18,.35)}
      .sidebar.vasu-nav-open{transform:translate3d(0,0,0)}
      .sidebar-brand{display:flex!important;position:relative;align-items:center;flex:0 0 auto;padding:4px 44px 14px 4px!important;border-bottom:1px solid rgba(42,63,85,.72);margin-bottom:8px}
      .sidebar-brand strong{font-size:15px}.sidebar-brand span{font-size:11px}
      #vasuNavCloseBtn{display:grid;place-items:center;position:absolute;right:2px;top:3px;width:40px;height:40px;min-height:40px;border:1px solid #2A3F55;border-radius:11px;background:#162A3D;color:#F2EDE4;font-size:22px;line-height:1}
      .sidebar #nav{display:grid!important;grid-auto-flow:row!important;grid-template-columns:1fr!important;align-content:start!important;width:100%!important;max-width:100%!important;flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scroll-snap-type:none!important;gap:4px!important;padding:4px 5px 10px 0!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:#A67C3D transparent}
      .sidebar #nav::-webkit-scrollbar{width:6px}.sidebar #nav::-webkit-scrollbar-thumb{background:#A67C3D;border-radius:999px;border:1px solid #0E1117}
      .sidebar .nav-item{display:flex!important;align-items:center!important;width:100%!important;min-width:0!important;min-height:46px!important;padding:11px 12px!important;text-align:left!important;white-space:normal!important;line-height:1.25!important;border:1px solid transparent!important;border-radius:11px!important;scroll-snap-align:none!important}
      .sidebar .nav-item.active{background:#1F3549!important;border-color:rgba(201,168,76,.28)!important;box-shadow:inset 3px 0 0 #C9A84C!important;color:#F2EDE4!important}
      .sidebar-footer{display:grid!important;flex:0 0 auto;margin-top:8px!important;padding-top:8px;border-top:1px solid rgba(42,63,85,.72)}
      .privacy-pill{display:block!important}.sidebar-footer .wide{min-height:44px}
      #vasuNavBackdrop{display:block;position:fixed;inset:0;background:rgba(4,12,21,.62);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .22s ease;z-index:1002}
      body.vasu-nav-open #vasuNavBackdrop{opacity:1;pointer-events:auto}
      #vasuMobileDock{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));height:60px;padding:5px;gap:4px;background:rgba(14,17,23,.96);border:1px solid #2A3F55;border-radius:17px;box-shadow:0 14px 36px rgba(2,10,18,.32);backdrop-filter:blur(14px);z-index:1001}
      .vasu-mobile-nav-btn{display:grid;place-items:center;align-content:center;gap:2px;min-width:0;min-height:48px;padding:5px 3px;border:1px solid transparent;border-radius:12px;background:transparent;color:#A8B0B8;font-size:9px;font-weight:650;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
      .vasu-mobile-nav-btn .vasu-mobile-icon{font-size:16px;line-height:1;color:#C9A84C}
      .vasu-mobile-nav-btn.active{background:#1F3549;color:#F2EDE4;border-color:rgba(201,168,76,.30)}
      .vasu-mobile-nav-btn:active{transform:scale(.97)}
    }
    @media(max-width:390px){#vasuMobileDock{left:6px;right:6px}.vasu-mobile-nav-btn{font-size:8.5px}.vasu-mobile-nav-btn .vasu-mobile-icon{font-size:15px}}
    @media(max-width:820px) and (max-height:520px){.sidebar{width:min(72vw,340px)!important}.sidebar-brand{padding-bottom:9px!important;margin-bottom:4px}.sidebar .nav-item{min-height:42px!important;padding:9px 11px!important}.sidebar-footer{margin-top:4px!important;padding-top:5px}#vasuMobileDock{height:54px}.vasu-mobile-nav-btn{min-height:42px}}
    @media(prefers-reduced-motion:reduce){.sidebar,#vasuNavBackdrop{transition-duration:.001ms!important}}
  `;document.head.appendChild(s);
}

function vasuV27UpdateDock(page){
  const active=page||document.querySelector('.page.active')?.id?.replace(/^page-/,'')||'dashboard';
  document.querySelectorAll('#vasuMobileDock [data-vasu-page]').forEach(b=>{const on=b.dataset.vasuPage===active;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
}
function vasuV27OpenDrawer(){
  if(!vasuV27IsMobile())return;const sidebar=document.querySelector('.sidebar'),menu=document.getElementById('vasuMobileMenu');if(!sidebar)return;
  sidebar.classList.add('vasu-nav-open');document.body.classList.add('vasu-nav-open');sidebar.setAttribute('aria-hidden','false');if(menu)menu.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>{vasuScrollActiveNav();(sidebar.querySelector('.nav-item.active')||sidebar.querySelector('.nav-item'))?.focus({preventScroll:true})});
}
function vasuV27CloseDrawer({restoreFocus=false}={}){
  const sidebar=document.querySelector('.sidebar'),menu=document.getElementById('vasuMobileMenu');sidebar?.classList.remove('vasu-nav-open');document.body.classList.remove('vasu-nav-open');if(vasuV27IsMobile())sidebar?.setAttribute('aria-hidden','true');else sidebar?.removeAttribute('aria-hidden');if(menu)menu.setAttribute('aria-expanded','false');if(restoreFocus)menu?.focus({preventScroll:true});
}
function vasuV27EnsureNavigation(){
  vasuV27InjectStyles();const sidebar=document.querySelector('.sidebar'),nav=document.getElementById('nav');if(!sidebar||!nav)return;
  sidebar.setAttribute('aria-label','VASU section navigation');nav.setAttribute('aria-label','VASU sections');
  const brand=sidebar.querySelector('.sidebar-brand');if(brand&&!document.getElementById('vasuNavCloseBtn')){const close=document.createElement('button');close.id='vasuNavCloseBtn';close.type='button';close.setAttribute('aria-label','Close navigation');close.textContent='×';brand.appendChild(close)}
  if(!document.getElementById('vasuNavBackdrop')){const backdrop=document.createElement('div');backdrop.id='vasuNavBackdrop';backdrop.setAttribute('aria-hidden','true');document.body.appendChild(backdrop)}
  if(!document.getElementById('vasuMobileDock')){const dock=document.createElement('nav');dock.id='vasuMobileDock';dock.setAttribute('aria-label','Mobile primary navigation');dock.innerHTML=`<button type="button" class="vasu-mobile-nav-btn" data-vasu-page="dashboard"><span class="vasu-mobile-icon">⌂</span><span>Overview</span></button><button type="button" class="vasu-mobile-nav-btn" data-vasu-page="transactions"><span class="vasu-mobile-icon">↕</span><span>Transactions</span></button><button type="button" class="vasu-mobile-nav-btn" data-vasu-page="bulk"><span class="vasu-mobile-icon">⇧</span><span>Bulk Import</span></button><button type="button" class="vasu-mobile-nav-btn" id="vasuMobileMenu" aria-controls="nav" aria-expanded="false"><span class="vasu-mobile-icon">☰</span><span>All Sections</span></button>`;document.body.appendChild(dock)}
  vasuV27UpdateDock();if(vasuV27IsMobile()&&!vasuV27DrawerOpen())sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');
  if(!window.__vasuV27Events){window.__vasuV27Events=true;
    document.addEventListener('click',e=>{const pageBtn=e.target.closest('#vasuMobileDock [data-vasu-page]');if(pageBtn){const p=pageBtn.dataset.vasuPage;if(document.getElementById(`page-${p}`))showPage(p);else if(p==='bulk'&&document.getElementById('page-data'))showPage('data');return}if(e.target.closest('#vasuMobileMenu')){vasuV27DrawerOpen()?vasuV27CloseDrawer({restoreFocus:true}):vasuV27OpenDrawer();return}if(e.target.closest('#vasuNavCloseBtn')||e.target.closest('#vasuNavBackdrop')){vasuV27CloseDrawer({restoreFocus:true});return}if(e.target.closest('.sidebar .nav-item')&&vasuV27IsMobile())vasuV27CloseDrawer()});
    document.addEventListener('keydown',e=>{const modal=document.getElementById('modal');const modalOpen=modal&&!modal.classList.contains('hidden');if(e.key==='Escape'&&vasuV27DrawerOpen()&&!modalOpen){e.preventDefault();vasuV27CloseDrawer({restoreFocus:true})}});
    window.addEventListener('resize',()=>{if(!vasuV27IsMobile())vasuV27CloseDrawer();else if(!vasuV27DrawerOpen())document.querySelector('.sidebar')?.setAttribute('aria-hidden','true');vasuV27UpdateDock()},{passive:true});
    let startX=null,startY=null,startedOpen=false;document.addEventListener('touchstart',e=>{if(!vasuV27IsMobile()||e.touches.length!==1)return;const t=e.touches[0];startedOpen=vasuV27DrawerOpen();if(startedOpen||t.clientX<=22){startX=t.clientX;startY=t.clientY}else{startX=startY=null}},{passive:true});
    document.addEventListener('touchend',e=>{if(startX==null||!vasuV27IsMobile())return;const t=e.changedTouches?.[0];if(!t){startX=startY=null;return}const dx=t.clientX-startX,dy=t.clientY-startY;startX=startY=null;if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.25)return;if(startedOpen&&dx<0)vasuV27CloseDrawer();else if(!startedOpen&&dx>0)vasuV27OpenDrawer()},{passive:true});
  }
}

vasuScrollActiveNav=function(){const nav=document.getElementById('nav'),active=nav?.querySelector('.nav-item.active');if(!nav||!active)return;const top=active.offsetTop,bottom=top+active.offsetHeight,viewTop=nav.scrollTop,viewBottom=viewTop+nav.clientHeight;if(top<viewTop+6)nav.scrollTo({top:Math.max(0,top-8),behavior:'smooth'});else if(bottom>viewBottom-6)nav.scrollTo({top:Math.max(0,bottom-nav.clientHeight+8),behavior:'smooth'})};

const vasuV27PrevShowPage=showPage;showPage=function(p){vasuV27PrevShowPage(p);vasuV27EnsureNavigation();vasuV27UpdateDock(p);requestAnimationFrame(vasuScrollActiveNav)};
const vasuV27PrevShowApp=showApp;showApp=function(){vasuV27PrevShowApp();vasuV27EnsureNavigation();requestAnimationFrame(vasuScrollActiveNav)};
