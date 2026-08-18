import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const js=fs.readFileSync(new URL('./app-v429.js',import.meta.url),'utf8');
const rt=fs.readFileSync(new URL('./app-v429-runtime.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles-v429.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
const release=JSON.parse(fs.readFileSync(new URL('./release.json',import.meta.url),'utf8'));
for(const m of ["VERSION='4.2.9'",'validateRawImport','Structured import blocked','Rules & Policies','classification rules','contextualExport','softRefresh','Data healthy'])assert.ok(js.includes(m),`missing v4.2.9 marker ${m}`);
for(const m of ['touch-action:manipulation','orientation:landscape','pointer:coarse'])assert.ok(css.includes(m),`missing responsive marker ${m}`);
assert.ok(html.includes('styles-v429.css?v=4.2.9')&&html.includes('app-v429.js?v=4.2.9')&&html.includes('app-v429-runtime.js?v=4.2.9'));
assert.ok(sw.includes("shini-v429-static-1")&&sw.includes('app-v429-runtime.js?v=4.2.9'));
assert.equal(release.build,'4.2.9');

const listeners={};
const node=()=>({dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},querySelector(){return null},querySelectorAll(){return[]},appendChild(){},insertBefore(){},setAttribute(){},closest(){return null}});
const ctx={console,Date,Math,Number,String,Array,Object,Map,Set,RegExp,Error,Promise,JSON,Intl,Blob:class{},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},CSS:{escape:x=>x},FormData:class{},confirm:()=>true,alert:()=>{},prompt:()=>'',location:{hash:'#dashboard'},navigator:{},window:{addEventListener:(k,f)=>listeners[k]=f},document:{documentElement:{},body:{appendChild(){}},addEventListener:(k,f)=>listeners[k]=f,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:node},MutationObserver:class{constructor(){}observe(){}},queueMicrotask:()=>{},setTimeout:()=>0,clearTimeout:()=>{},activeTx:s=>s.transactions||[],filterPeriod:(s)=>s.transactions||[],periodRange:()=>({from:null,to:null}),getState:()=>null,save:async()=>true,requireDeleteCredential:async()=>true,toast:()=>{},canonicalToTx:(s,r)=>({...r,merchant:r.merchant||'',accountId:r.account_id||'',amount:Number(r.amount||0),categoryId:r.category_id||'other',paymentMethodId:r.payment_method_id||'pm_other',date:r.date||'2026-01-01',transactionTypeId:r.transaction_type_id||'txt_expense'}),stageMasterImport:(s,k,rows)=>rows.map((r,i)=>({index:i+1,errors:[],old:null,action:'ADD'})),commitMasterImport:()=>({added:1,updated:0}),globalThis:null};ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(`const IMPORTS={categories:{id:'category_id'},accounts:{id:'account_id'},loans:{id:'loan_id'},recurring:{id:'recurring_id'},goals:{id:'goal_id'},assets:{id:'asset_id'},investments:{id:'investment_id'},insurance:{id:'insurance_id'},documents:{id:'document_id'}};const NAV=[['dashboard','Overview'],['settings','Settings']];`,ctx);
vm.runInContext(js,ctx);vm.runInContext(rt,ctx);
assert.equal(ctx.SHINIV429.VERSION,'4.2.9');
const valid={
 categories:{category_id:'food',name:'Food',budget:'1000'},
 accounts:{account_id:'acc_a',name:'Bank',opening_balance:'100',opening_date:'2026-04-01',reconciliation_balance:'200',reconciliation_date:'2026-04-30'},
 loans:{loan_id:'loan_1',provider:'Lender',principal_amount:'10000',tenure_months:'12',due_day:'5'},
 recurring:{recurring_id:'rec_1',name:'Subscription',amount:'199',cadence:'monthly'},
 goals:{goal_id:'goal_1',name:'Goal',target_amount:'10000',current_amount:'500'},
 assets:{asset_id:'asset_1',name:'Asset',purchase_value:'1000',current_value:'900'},
 investments:{investment_id:'inv_1',name:'Fund',invested_amount:'1000',current_value:'1100'},
 insurance:{insurance_id:'ins_1',name:'Policy',premium_amount:'500',coverage_amount:'100000'},
 documents:{document_id:'doc_1',name:'Certificate',issue_date:'2026-01-01',expiry_date:'2027-01-01'}
};
for(const [k,r] of Object.entries(valid)){const st=ctx.stageMasterImport({},k,[r]);assert.equal(st[0].errors.length,0,`${k} valid sample should stage`)}
const invalid={accounts:{account_id:'a',opening_balance:'100'},loans:{loan_id:'l',principal_amount:'-1',due_day:'40'},recurring:{recurring_id:'r',amount:'0',cadence:'fortnightly'},goals:{goal_id:'g',target_amount:'0'},assets:{asset_id:'a',current_value:'-1'},investments:{investment_id:'i',invested_amount:'bad'},insurance:{insurance_id:'i',coverage_amount:'-1'},documents:{document_id:'d',expiry_date:'31/12/2026'},categories:{category_id:'bad id'}};
for(const [k,r] of Object.entries(invalid)){const st=ctx.stageMasterImport({},k,[r]);assert.ok(st[0].errors.length>0,`${k} invalid sample must be rejected`)}
assert.throws(()=>ctx.commitMasterImport({},'goals',[{errors:['bad'],action:'INVALID'}]),/blocked/i,'structured commit must be atomic');
const s={meta:{v429:{policies:{classificationRulesEnabled:true},rules:[{id:'rule1',active:true,priority:1,merchantContains:'netflix',setCategoryId:'entertainment',renameMerchant:'Netflix'}]}},categories:[{id:'entertainment',active:true}],catalogs:{paymentMethods:[]}};
const tx=ctx.SHINIV429.applyRules(s,{merchant:'NETFLIX.COM',accountId:'acc',amount:199,date:'2026-08-01',transactionTypeId:'txt_expense',categoryId:'other'});assert.equal(tx.categoryId,'entertainment');assert.equal(tx.merchant,'Netflix');assert.equal(tx.amount,199);assert.equal(tx.accountId,'acc');
console.log('SHINI v4.2.9 cross-domain import/rules/navigation QA PASS');
