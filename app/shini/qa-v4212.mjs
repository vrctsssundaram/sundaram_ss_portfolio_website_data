import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const js=fs.readFileSync(new URL('./app-v4212.js',import.meta.url),'utf8');
const v427=fs.readFileSync(new URL('./app-v427.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
const release=JSON.parse(fs.readFileSync(new URL('./release.json',import.meta.url),'utf8'));
assert.equal(release.build,'4.2.12');
for(const m of ["VERSION='4.2.12'",'normalizeLoginAndRoute','stabilizeLegacyNotificationNav','Repair cached SHINI & reload','assetVersions','checkCoherence',"updateViaCache:'none'",'#dashboard','visibilitySafety'])assert.ok(js.includes(m),`missing v4.2.12 marker ${m}`);
assert.ok(v427.includes('value&&value.textContent!==release'),'legacy About card must avoid same-value DOM writes');
assert.ok(v427.includes('strong&&strong.textContent!==release'),'legacy About metric must avoid same-value DOM writes');
assert.ok(html.includes('app-v4212.js?v=4.2.12'));
assert.ok(html.includes('autocapitalize="none"')&&html.includes('autocorrect="off"')&&html.includes('aria-live="polite"'));
assert.ok(sw.includes("shini-v4212-static-1")&&sw.includes('app-v4212.js?v=4.2.12'));
assert.ok(sw.includes("fetch(r,{cache:'no-store'})"),'service worker must prefer fresh deployment assets');

let nativeWrites=0;
class CL{constructor(a=[]){this.s=new Set(a)}add(x){this.s.add(x)}remove(x){this.s.delete(x)}contains(x){return this.s.has(x)}toggle(x,on){on?this.s.add(x):this.s.delete(x)}}
class E{
 constructor(){this.dataset={};this.classList=new CL();this._html='';this.value='';this.children=[];this.src='';this.href='';}
 set innerHTML(v){this._html=String(v);nativeWrites++}get innerHTML(){return this._html}
 querySelector(){return null}querySelectorAll(){return[]}setAttribute(){}insertAdjacentElement(){}closest(){return null}
}
const notify=new E();notify._html='Notifications <span class="v41-badge">2</span>';
const form=new E();let priorCalls=0;form.onsubmit=()=>{priorCalls++};
const loginUser=new E();loginUser.value=' Sudhan ';
const loginPass=new E();
const authError=new E();
const byId={loginForm:form,loginUser,loginPass,authError};
const scripts=[{src:'https://example.test/app/shini/app-core.js?v=4.2.12'},{src:'https://example.test/app/shini/app-v4212.js?v=4.2.12'}];
let domReady=null;
const document={readyState:'loading',documentElement:new E(),scripts,visibilityState:'visible',
 getElementById:id=>byId[id]||null,querySelector:s=>s==='#nav [data-v41-page="notifications"]'?notify:null,
 querySelectorAll:s=>s==='link[href]'?[{href:'https://example.test/app/shini/styles.css?v=4.2.12'}]:[],
 createElement:()=>new E(),addEventListener:(n,cb)=>{if(n==='DOMContentLoaded')domReady=cb}};
const location={pathname:'/app/shini/',search:'',hash:'#about',href:'https://example.test/app/shini/#about',reload(){}};
const sessionStore=new Map;
const ctx={console,Date,Math,Number,String,Array,Object,Map,Set,RegExp,Error,Promise,JSON,URL,Element:E,document,location,
 history:{replaceState(a,b,u){location.hash='#'+u.split('#').at(-1)}},navigator:{},window:null,
 sessionStorage:{getItem:k=>sessionStore.get(k)||null,setItem:(k,v)=>sessionStore.set(k,v),removeItem:k=>sessionStore.delete(k)},
 caches:{keys:async()=>[],delete:async()=>true},fetch:async()=>({ok:true,json:async()=>({build:'4.2.12'})}),
 MutationObserver:class{constructor(){}observe(){}},setTimeout:()=>0,queueMicrotask:()=>{},isUnlocked:()=>false,globalThis:null};ctx.globalThis=ctx;ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(js,ctx);
const A=ctx.SHINIV4212;assert.equal(A.VERSION,'4.2.12');

assert.equal(A.normalizeLoginAndRoute(),true);form.onsubmit({preventDefault(){}});
assert.equal(priorCalls,1);assert.equal(loginUser.value,'sudhan');assert.equal(location.hash,'#dashboard');

nativeWrites=0;assert.equal(A.stabilizeLegacyNotificationNav(),true);
notify.innerHTML='Notifications <span class="v41-badge">2</span>';
assert.equal(nativeWrites,0,'same notification badge markup must not create another mutation');
notify.innerHTML='Notifications <span class="v41-badge">3</span>';
assert.equal(nativeWrites,1,'real badge changes must still render');
assert.deepEqual(A.assetVersions(),['4.2.12']);
console.log('SHINI v4.2.12 observer/cache/first-paint QA PASS');
