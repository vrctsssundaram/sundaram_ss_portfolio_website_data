// SHINI safe presentation bridge. No ledger/account/debt calculations.
(()=>{
 const FULL='Surplus, Holdings, Indebtedness, Net Worth & Impairment';
 const replace=()=>{
   document.title='SHINI — '+FULL;
   document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{let v=el.getAttribute('placeholder')||'';if(/VASU|ChatGPT/i.test(v))el.setAttribute('placeholder',v.replace(/VASU/gi,'SHINI').replace(/ChatGPT/gi,'AI tool'))});
   document.querySelectorAll('[title],[aria-label]').forEach(el=>{for(const k of ['title','aria-label']){let v=el.getAttribute(k)||'';if(/VASU|Value\s*&?\s*Asset Stewardship Utility|ChatGPT/i.test(v))el.setAttribute(k,v.replace(/Value\s*&?\s*Asset Stewardship Utility/gi,FULL).replace(/VASU/gi,'SHINI').replace(/ChatGPT/gi,'AI tool'))}});
   document.querySelectorAll('h1,h2,h3,h4,.sidebar-brand,.lock-card,.auth-card,.panel-head,.toolbar').forEach(root=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode())a.push(w.currentNode);a.forEach(n=>{let v=n.nodeValue||'';if(/VASU|Value\s*&?\s*Asset Stewardship Utility|ChatGPT/i.test(v))n.nodeValue=v.replace(/Value\s*&?\s*Asset Stewardship Utility/gi,FULL).replace(/\bVASU\b/g,'SHINI').replace(/ChatGPT/gi,'AI tool')})});
 };
 const wrap=n=>{const f=window[n];if(typeof f!=='function'||f.__shiniBrand)return;const g=function(...a){const r=f.apply(this,a);requestAnimationFrame(replace);return r};g.__shiniBrand=true;window[n]=g};
 ['showApp','showPage','renderAll','renderPageModule','openModal','showLock'].forEach(wrap);requestAnimationFrame(replace);document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(replace),{once:true});
 (async()=>{try{const r=await fetch('/app/shini/shini-v32-controls.js',{cache:'no-store'});if(!r.ok)throw new Error('SHINI controls unavailable '+r.status);const t=(await r.text()).replace(/\s+/g,''),b=Uint8Array.from(atob(t),c=>c.charCodeAt(0));const js=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text();(0,eval)(js)}catch(e){console.error('SHINI controls load failed',e)}})();
 window.SHINI_REFRESH_BRAND=replace;
})();