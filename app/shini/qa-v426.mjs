import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const js=fs.readFileSync(new URL('./app-v426.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
for(const m of ['atomic','reconcileAnchoredAccounts','ledgerBalance','reconciliationExpectedBalance','Backup & clear financial data','About','Categories / classification definitions'])assert.ok(js.includes(m),`missing marker ${m}`);
assert.ok(html.includes('app-v426.js?v=4.2.6')&&html.includes('v=4.2.6'),'v4.2.6 not wired');
assert.ok(sw.includes("shini-v426-static-1")&&sw.includes('app-v426.js?v=4.2.6'),'v4.2.6 cache not wired');
const listeners={};
const ctx={
 console,Date,Math,Number,String,Array,Object,Map,Set,RegExp,Error,Promise,JSON,Intl,Blob:class{},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},
 navigator:{onLine:true,serviceWorker:{}},window:{addEventListener:(k,f)=>listeners[k]=f,Notification:{permission:'default'}},Notification:{permission:'default'},crypto:{subtle:{}},
 document:{getElementById:()=>null,documentElement:{},addEventListener:(k,f)=>listeners[k]=f,createElement:()=>({style:{},appendChild(){},click(){},remove(){}}),body:{appendChild(){}}},
 MutationObserver:class{constructor(){} observe(){}},queueMicrotask:()=>{},setTimeout:()=>0,prompt:()=>'',location:{reload:()=>{}},
 NAV:[['dashboard','Overview'],['settings','Settings']],IMPORTS:{accounts:{fields:[]}},
 importedRecord:(kind,r)=>kind==='accounts'?{id:r.account_id,name:r.name,balance:Number(r.balance||0),accountTypeId:'atype_bank',active:true}:{},
 getState:()=>null,getRevision:()=>1,getLogin:()=>'',save:async()=>true,activeTx:s=>s.transactions||[],
 semantic:(s,t)=>t.type||({txt_expense:'expense',txt_income:'income',txt_transfer:'transfer',txt_borrowing:'borrowing',txt_repayment:'repayment'}[t.transactionTypeId]||'expense'),
 money:(s,v)=>`₹${Number(v).toFixed(2)}`,globalThis:null
};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const A=ctx.SHINIV426;assert.equal(A.VERSION,'4.2.6');assert.ok(ctx.NAV.some(x=>x[0]==='about'),'About nav must be registered');assert.ok(ctx.IMPORTS.categories,'category structured import must exist');
const s={accounts:[{id:'a',name:'Bank A',openingBalance:100,openingDate:'2026-04-01',reconciliationExpectedBalance:80,reconciliationDate:'2026-04-03',balance:-999}],transactions:[
 {id:'1',date:'2026-04-01',transactionTypeId:'txt_income',type:'income',accountId:'a',amount:50},
 {id:'2',date:'2026-04-02',transactionTypeId:'txt_expense',type:'expense',accountId:'a',amount:20},
 {id:'3',date:'2026-04-03',transactionTypeId:'txt_expense',type:'expense',accountId:'a',amount:50}
],categories:[]};
assert.equal(A.ledgerBalance(s,s.accounts[0]),80);const r=A.reconcileAnchoredAccounts(s);assert.equal(s.accounts[0].balance,80,'mutable drift must be overwritten by deterministic ledger balance');assert.equal(r[0].delta,0,'checkpoint must reconcile');
s.transactions.push({id:'4',date:'2026-04-03',transactionTypeId:'txt_expense',type:'expense',accountId:'a',amount:1});const bad=A.integrityReport(s);assert.ok(bad.issues.some(x=>x.includes('reconciliation mismatch')),'reconciliation delta must become a blocking finding');
const imported=ctx.importedRecord('accounts',{account_id:'a2',name:'Bank B',balance:'223.59',opening_balance:'223.59',opening_date:'2026-04-01',reconciliation_balance:'24074.37',reconciliation_date:'2026-08-17'});assert.equal(imported.openingBalance,223.59);assert.equal(imported.reconciliationExpectedBalance,24074.37);assert.equal(imported.balanceMode,'ledger');
console.log('SHINI v4.2.6 deterministic ledger reconciliation QA PASS');
