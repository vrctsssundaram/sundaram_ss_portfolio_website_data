import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const js=fs.readFileSync(new URL('./app-v4211.js',import.meta.url),'utf8');
const cloud=fs.readFileSync(new URL('./ui-cloud.js',import.meta.url),'utf8');
const v427=fs.readFileSync(new URL('./app-v427.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
const release=JSON.parse(fs.readFileSync(new URL('./release.json',import.meta.url),'utf8'));

assert.equal(release.build,'4.2.11');
for(const m of ["VERSION='4.2.11'",'loginInFlight','Repair cached app & reload','recoverVisibleSurface','stabilizeLegacyNotificationButton','loadedAssetVersions','checkReleaseCoherence',"#dashboard",'updateViaCache:\'none\'','Network request timed out']){
  assert.ok(js.includes(m)||cloud.includes(m),`missing v4.2.11 reliability marker: ${m}`);
}
assert.ok(v427.includes('value&&value.textContent!==release'),'legacy About release update must be idempotent');
assert.ok(v427.includes('strong&&strong.textContent!==release'),'legacy About metric update must be idempotent');
assert.ok(cloud.includes('const NETWORK_TIMEOUT_MS=20000'));
assert.ok(cloud.includes('new AbortController()'));
assert.ok(cloud.includes('globalThis.SHINI_RELEASE_BUILD||BUILD'),'future vault saves must identify the actual release');
assert.ok(html.includes('app-v4211.js?v=4.2.11'));
assert.ok(html.includes('autocapitalize="none"'));
assert.ok(sw.includes("shini-v4211-static-1"));
assert.ok(sw.includes('app-v4211.js?v=4.2.11'));
assert.ok(sw.includes("fetch(r,{cache:'no-store'})"));

class FakeClassList{
  constructor(names=[]){this.s=new Set(names)}
  contains(x){return this.s.has(x)} toggle(x,on){if(on===undefined)on=!this.s.has(x);on?this.s.add(x):this.s.delete(x);return on}
  add(x){this.s.add(x)} remove(x){this.s.delete(x)}
}
class FakeElement{
  constructor(){this.dataset={};this.classList=new FakeClassList();this.children=[];this._html='';this.textContent='';this.title='';this.disabled=false;this.type='';this.scope='';}
  querySelector(){return null} querySelectorAll(){return[]} insertAdjacentElement(){return null} insertBefore(){} appendChild(x){this.children.push(x)}
  setAttribute(){} closest(){return null}
  set innerHTML(v){this._html=String(v);nativeHtmlWrites++}
  get innerHTML(){return this._html}
}
let nativeHtmlWrites=0;
let observerCb=null;
let domReadyCb=null;
let priorCalls=0;
let resolvePrior;
const priorDone=new Promise(r=>resolvePrior=r);
const loginBtn=new FakeElement();loginBtn.textContent='Sign in & open SHINI';
const loginUser=new FakeElement();loginUser.value='Sudhan';
const authError=new FakeElement();
const recoveryBtn=new FakeElement();recoveryBtn.id='shiniAuthRecoveryBtn';recoveryBtn.classList.add('hidden');
const boot=new FakeElement();boot.classList.add('hidden');
const authScreen=new FakeElement();
const app=new FakeElement();app.classList.add('hidden');
const pageRoot=new FakeElement();
const nav=new FakeElement();
const notify=new FakeElement();notify.dataset.v41Page='notifications';notify._html='Notifications <span class="v41-badge">2</span>';
const loginForm=new FakeElement();
loginForm.querySelector=s=>s==='button[type="submit"]'?loginBtn:null;
loginForm.onsubmit=async e=>{e?.preventDefault?.();priorCalls++;await priorDone};
nav.querySelector=s=>s==='#nav [data-v41-page="notifications"]'?notify:null;
const byId={loginForm,loginUser,authError,shiniAuthRecoveryBtn:recoveryBtn,boot,authScreen,app,pageRoot,nav};
const scripts=[{src:'https://example.test/app/shini/app-core.js?v=4.2.11'},{src:'https://example.test/app/shini/app-v4211.js?v=4.2.11'}];
const document={
  readyState:'loading',documentElement:new FakeElement(),scripts,visibilityState:'visible',
  getElementById:id=>byId[id]||null,
  querySelector(sel){if(sel==='#nav [data-v41-page="notifications"]')return notify;return null},
  querySelectorAll(sel){return sel==='link[href]'?[{href:'https://example.test/app/shini/styles.css?v=4.2.11'}]:[]},
  createElement:()=>new FakeElement(),
  addEventListener(name,cb){if(name==='DOMContentLoaded')domReadyCb=cb},body:new FakeElement()
};
const listeners={};
const location={pathname:'/app/shini/',search:'',hash:'#about',href:'https://example.test/app/shini/#about',reload(){}};
const ctx={
  console,Date,Math,Number,String,Array,Object,Map,Set,RegExp,Error,Promise,JSON,Intl,URL,Element:FakeElement,
  AbortController,document,location,history:{replaceState(a,b,url){location.hash=url.includes('#')?'#'+url.split('#').at(-1):''}},
  navigator:{serviceWorker:{getRegistrations:async()=>[],register:async()=>({update:async()=>{}})}},
  caches:{keys:async()=>[],delete:async()=>true},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  window:{addEventListener:(n,cb)=>listeners[n]=cb,caches:null},
  MutationObserver:class{constructor(cb){observerCb=cb}observe(){}},
  fetch:async()=>({ok:true,json:async()=>({build:'4.2.11'})}),
  setTimeout:(fn)=>{return 1},clearTimeout(){},
  isUnlocked:()=>false,getState:()=>null,toast(){},globalThis:null
};ctx.globalThis=ctx;ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(js,ctx);
assert.ok(domReadyCb,'v4.2.11 should wait for DOMContentLoaded');
domReadyCb();
const A=ctx.SHINIV4211;assert.equal(A.VERSION,'4.2.11');

// Same notification markup must not repeatedly hit the native setter; a real count change must.
nativeHtmlWrites=0;A.stabilizeLegacyNotificationButton();
notify.innerHTML='Notifications <span class="v41-badge">2</span>';
assert.equal(nativeHtmlWrites,0,'identical legacy notification markup must be a no-op');
notify.innerHTML='Notifications <span class="v41-badge">3</span>';
assert.equal(nativeHtmlWrites,1,'real notification-count change must still update the DOM');

// Login wrapper must be single-flight and normalize username/route before the base login executes.
assert.equal(A.hardenLoginForm(),false,'boot already hardened the login form');
let prevented=0;const ev={preventDefault(){prevented++}};
const p1=loginForm.onsubmit(ev);const p2=loginForm.onsubmit(ev);
assert.equal(priorCalls,1,'double-tap must not launch a second auth/decrypt flow');
assert.equal(loginUser.value,'sudhan','username must be normalized for mobile input');
assert.equal(location.hash,'#dashboard','first authenticated paint must not restore a potentially unstable extension route');
resolvePrior();await Promise.all([p1,p2]);

assert.deepEqual(A.loadedAssetVersions(),['4.2.11'],'all loaded SHINI assets should report one coherent version');
console.log('SHINI v4.2.11 login lifecycle/cache/observer QA PASS');
