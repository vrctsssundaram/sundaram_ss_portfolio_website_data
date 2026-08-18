import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const js=fs.readFileSync(new URL('./app-v425.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
const release=JSON.parse(fs.readFileSync(new URL('./release.json',import.meta.url),'utf8'));
for(const marker of ['hardenedStageCanonical','batch_exact','bankSourceKey','RESET FINANCIAL DATA','Reset financial data','tombstones:{transactions:{}}','nonOperatingInflow'])assert.ok(js.includes(marker),`missing v4.2.5 marker: ${marker}`);
assert.ok(html.includes('app-v425.js?v='),'v4.2.5 runtime layer is not wired by the current release');
assert.ok(sw.includes('app-v425.js?v='),'current service worker no longer includes the v4.2.5 runtime layer');
assert.ok(Number(String(release.build).split('.').at(-1))>=5,'release must not regress below v4.2.5');

const priorCommits=[];
const ctx={
 console,Date,Math,Number,String,Array,Object,Map,Set,RegExp,Error,Promise,setTimeout:()=>0,
 document:{getElementById:()=>null,documentElement:{}},window:{addEventListener:()=>{}},location:{reload:()=>{}},prompt:()=>'',
 MutationObserver:class{constructor(){} observe(){}},
 activeTx:s=>s.transactions||[],semantic:(s,t)=>t.type||'expense',
 metrics:(s,tx)=>({income:(tx||[]).filter(t=>t.type==='income').reduce((z,t)=>z+Number(t.amount||0),0),net:(tx||[]).filter(t=>t.type==='income').reduce((z,t)=>z+Number(t.amount||0),0)}),
 canonicalToTx:(s,r)=>({id:r.record_id,externalId:r.record_id,date:r.date,amount:Number(r.amount),accountId:r.account_id,merchant:r.merchant,transactionTypeId:r.transaction_type_id,type:r.type||'expense',note:r.note||'',fingerprint:`exchange:${r.record_id}`} ),
 stageCanonical:()=>[],commitStage:(s,stage)=>{priorCommits.push(stage.map(x=>x.action));return{added:stage.filter(x=>x.action==='ADD'||x.action==='KEEP_BOTH').length,replaced:0}},
 getState:()=>null,globalThis:null
};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const A=ctx.SHINIV425;assert.equal(A.VERSION,'4.2.5');
const old={id:'legacy-id',externalId:'AX8880-01042026-001',date:'2026-04-01',amount:10,accountId:'acc_primary',merchant:'Sri Ram Xerox',transactionTypeId:'txt_expense',type:'expense',note:'Original: UPI/P2M/645765945633/Sri Ram Xerox /UPI/AXIS BANK'};
let staged=A.hardenedStageCanonical({transactions:[old]},[{record_id:'AX8880-UPI-645765945633',date:'2026-04-01',amount:'10.00',account_id:'acc_primary',merchant:'Sri Ram Xerox',transaction_type_id:'txt_expense',type:'expense',note:'Original: UPI/P2M/645765945633/Sri Ram Xerox /UPI/AXIS BANK',import_action:'ADD'}]);
assert.equal(staged[0].status,'exact','bank reference must match across statement batches even when record_id format changed');
assert.equal(staged[0].action,'SKIP','CSV ADD must never override an exact duplicate');
const duplicateRows=[{record_id:'AX8880-UPI-111111111111',date:'2026-08-18',amount:'25',account_id:'acc_primary',merchant:'Cafe',transaction_type_id:'txt_expense',type:'expense',note:'Original: UPI/P2M/111111111111/Cafe',import_action:'ADD'},{record_id:'AX8880-UPI-111111111111',date:'2026-08-18',amount:'25',account_id:'acc_primary',merchant:'Cafe',transaction_type_id:'txt_expense',type:'expense',note:'Original: UPI/P2M/111111111111/Cafe',import_action:'ADD'}];
staged=A.hardenedStageCanonical({transactions:[]},duplicateRows);
assert.equal(staged[0].status,'new');assert.equal(staged[0].action,'ADD');assert.equal(staged[1].status,'batch_exact');assert.equal(staged[1].action,'SKIP','duplicate inside one CSV must be suppressed');
staged[1].action='ADD';ctx.commitStage({transactions:[]},staged);assert.equal(staged[1].action,'SKIP','commit must re-enforce duplicate safety');
staged[1].action='KEEP_BOTH';ctx.commitStage({transactions:[]},staged);assert.equal(staged[1].action,'KEEP_BOTH','KEEP_BOTH remains the explicit escape hatch for a legitimate same-value transaction');
const m=ctx.metrics({},[{type:'income',amount:100,reimbursable:false},{type:'income',amount:25,reimbursable:true}]);
assert.equal(m.grossInflow,125);assert.equal(m.nonOperatingInflow,25);assert.equal(m.income,100);assert.equal(m.net,100);
console.log('SHINI v4.2.5 idempotent import/reset/metrics QA PASS');
