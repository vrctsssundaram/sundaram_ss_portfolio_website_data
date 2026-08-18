import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const js=fs.readFileSync(new URL('./app-v4211.js',import.meta.url),'utf8');
const cloud=fs.readFileSync(new URL('./ui-cloud.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
const release=JSON.parse(fs.readFileSync(new URL('./release.json',import.meta.url),'utf8'));
assert.equal(release.build,'4.2.11');
for(const m of ["VERSION='4.2.11'",'authFlight','vaultFlight','loginBusy','pageshow','visibilitychange','preventWhiteScreen','Unhandled browser promise rejection'])assert.ok(js.includes(m),`missing v4.2.11 marker ${m}`);
for(const m of ['fetchTimed','AbortController','Authentication service is temporarily unavailable','Encrypted vault download','globalThis.SHINI_RELEASE_BUILD||BUILD'])assert.ok(cloud.includes(m),`missing hardened cloud marker ${m}`);
assert.ok(html.includes('app-v4211.js?v=4.2.11'));
assert.ok(sw.includes("shini-v4211-static-1")&&sw.includes('app-v4211.js?v=4.2.11'));

const listeners={};
class CL{constructor(hidden=false){this.s=new Set(hidden?['hidden']:[])}add(x){this.s.add(x)}remove(x){this.s.delete(x)}contains(x){return this.s.has(x)}toggle(x,on){on?this.s.add(x):this.s.delete(x)}}
const elements={
 boot:{classList:new CL(false)},authScreen:{classList:new CL(false)},app:{classList:new CL(true)},authError:{textContent:'',classList:new CL()},
 loginUser:{value:'sudhan',readOnly:false},loginPass:{value:'password123',readOnly:false},pageRoot:{children:[]},nav:{onclick:null,querySelectorAll:()=>[]}
};
const submit={disabled:false,textContent:'Sign in & open SHINI'};
const form={dataset:{},querySelector:s=>s==='button[type="submit"]'?submit:null,onsubmit:null};elements.loginForm=form;
let authCalls=0,vaultCalls=0,unlocked=false,originalCalls=0;
const ctx={console,Date,Math,Number,String,Array,Object,Map,Set,RegExp,Error,Promise,JSON,location:{hash:'#dashboard'},
 document:{visibilityState:'visible',getElementById:id=>elements[id]||null,addEventListener:(k,f)=>{listeners[`d:${k}`]=f}},
 window:{addEventListener:(k,f)=>{listeners[`w:${k}`]=f}},setTimeout:()=>0,queueMicrotask:f=>f(),
 getLogin:()=> 'sudhan',isUnlocked:()=>unlocked,
 auth:async()=>{authCalls++;await Promise.resolve();return{}},openVault:async()=>{vaultCalls++;unlocked=true;await Promise.resolve();return{}},globalThis:null};ctx.globalThis=ctx;
form.onsubmit=async e=>{originalCalls++;e?.preventDefault?.();await ctx.auth('sudhan','password123','login');await ctx.openVault('password123');elements.authScreen.classList.add('hidden');elements.app.classList.remove('hidden');elements.authError.textContent=''};
vm.createContext(ctx);vm.runInContext(js,ctx);
listeners['d:DOMContentLoaded']?.();
assert.equal(form.dataset.v4211,'1','login controller should be wrapped');
const ev={preventDefault(){}};
await Promise.all([form.onsubmit(ev),form.onsubmit(ev)]);
assert.equal(originalCalls,1,'rapid duplicate submit must invoke canonical controller only once');
assert.equal(authCalls,1,'rapid duplicate submit must create one auth request');
assert.equal(vaultCalls,1,'rapid duplicate submit must open vault once');
assert.equal(elements.app.classList.contains('hidden'),false,'successful login must leave app visible');
assert.equal(elements.authScreen.classList.contains('hidden'),true,'successful login must hide auth screen');

// A locked/bfcache page with all roots hidden must recover to a visible login instead of white screen.
unlocked=false;for(const id of ['boot','authScreen','app'])elements[id].classList.add('hidden');ctx.SHINIV4211.preventWhiteScreen('test-locked');
assert.equal(elements.authScreen.classList.contains('hidden'),false,'locked all-hidden state must recover to auth screen');
// An unlocked all-hidden state must recover the app shell.
unlocked=true;for(const id of ['boot','authScreen','app'])elements[id].classList.add('hidden');ctx.SHINIV4211.preventWhiteScreen('test-unlocked');
assert.equal(elements.app.classList.contains('hidden'),false,'unlocked all-hidden state must recover app shell');
console.log('SHINI v4.2.11 single-flight login/lifecycle recovery QA PASS');
