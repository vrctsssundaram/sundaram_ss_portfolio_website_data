// SHINI v3.1 — minimal branding/accessibility layer over the last known-good VASU v2.9 runtime.
// No ledger, account, debt, calculation, sync, import, export or state-mutation logic.
(()=>{
  const FULL='Surplus, Holdings, Indebtedness, Net Worth & Impairment';
  const DESC='Private Financial Intelligence & Stewardship Console';
  const replaceText=root=>{
    if(!root)return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|OPTION)$/i.test(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
    const a=[];while(w.nextNode())a.push(w.currentNode);
    for(const n of a){let v=n.nodeValue||'';if(/VASU|Value\s*&?\s*Asset Stewardship Utility|ChatGPT/i.test(v)){v=v.replace(/Value\s*&?\s*Asset Stewardship Utility/gi,FULL).replace(/\bVASU\b/g,'SHINI').replace(/ChatGPT/gi,'AI tool');n.nodeValue=v}}
    root.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(el=>{for(const k of ['title','aria-label','placeholder']){let v=el.getAttribute(k);if(v&&/VASU|Value\s*&?\s*Asset Stewardship Utility|ChatGPT/i.test(v))el.setAttribute(k,v.replace(/Value\s*&?\s*Asset Stewardship Utility/gi,FULL).replace(/VASU/gi,'SHINI').replace(/ChatGPT/gi,'AI tool'))}})
  };
  const styles=()=>{if(document.getElementById('shiniV31Styles'))return;const s=document.createElement('style');s.id='shiniV31Styles';s.textContent=`
    .sidebar{display:flex!important;flex-direction:column!important;height:100dvh!important;max-height:100dvh!important;overflow:hidden!important}
    .sidebar #nav{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;scrollbar-color:#A67C3D transparent!important}
    .sidebar #nav::-webkit-scrollbar{width:7px}.sidebar #nav::-webkit-scrollbar-thumb{background:#A67C3D;border-radius:999px}
    .shini-wordmark{display:grid;gap:1px;min-width:0}.shini-wordmark strong{letter-spacing:.13em}.shini-wordmark small{font-size:8px;line-height:1.28;color:#A8B0B8}.shini-wordmark em{font-style:normal;font-size:8px;color:#C9A84C}
    .shini-mark{width:32px;height:42px;display:grid;place-items:center;position:relative;flex:0 0 auto;border:1px solid rgba(201,168,76,.35);border-radius:10px;background:#101D2A;color:#C9A84C;font:700 22px Georgia,serif}.shini-mark:after{content:'▂▅▇';position:absolute;bottom:3px;font:7px system-ui;letter-spacing:1px;color:#C9A84C}
    @media(max-width:820px){.sidebar #nav{display:grid!important;grid-template-columns:1fr!important;align-content:start!important;overflow-y:auto!important;overflow-x:hidden!important;max-height:none!important;min-height:0!important;touch-action:pan-y!important}.sidebar{height:100dvh!important;max-height:100dvh!important}.sidebar-footer,.sidebar-brand{flex:0 0 auto!important}}
  `;document.head.appendChild(s)};
  const brand=()=>{
    styles();document.title='SHINI — '+FULL;
    const sb=document.querySelector('.sidebar-brand');if(sb){const old=sb.querySelector('.brand-mark,.shini-mark');if(old&&!old.classList.contains('shini-mark'))old.remove();if(!sb.querySelector('.shini-mark'))sb.insertAdjacentHTML('afterbegin','<span class="shini-mark" aria-hidden="true">S</span>');let copy=sb.querySelector('.brand-text,.shini-wordmark');if(copy){copy.classList.add('shini-wordmark');copy.innerHTML='<strong>SHINI</strong><small>'+FULL+'</small><em>'+DESC+'</em>'}}
    const logo=document.querySelector('.vasu-logo');if(logo){logo.style.display='none';if(!logo.parentElement.querySelector('.shini-mark'))logo.insertAdjacentHTML('beforebegin','<span class="shini-mark" aria-hidden="true">S</span>')}
    replaceText(document.body);
    document.querySelectorAll('[aria-label="SHINI section navigation"],[aria-label="SHINI sections"]').forEach(x=>x.setAttribute('aria-label',x.getAttribute('aria-label')));
  };
  const wrap=(name)=>{const f=window[name];if(typeof f!=='function'||f.__shini31)return;const g=function(...args){const r=f.apply(this,args);requestAnimationFrame(brand);return r};g.__shini31=true;window[name]=g};
  ['showApp','showPage','renderAll','renderPageModule','openModal','showLock'].forEach(wrap);
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(brand),{once:true});
  requestAnimationFrame(brand);
  window.SHINI_V31_BRAND_REFRESH=brand;
})();