import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const parts=['app-v42-core.js','app-v42-ledger.js','app-v42-crud.js','app-v42-imports.js','app-v42-platform.js'];
const src=parts.map(p=>fs.readFileSync(new URL('./'+p,import.meta.url),'utf8')).join('\n');
const ctx={console,crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Map,Set,Math,Number,String,Boolean,Array,Object,RegExp,Error,Promise,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);const A=ctx.SHINIV42;
let seed=0x5eeda11;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};const pick=a=>a[Math.floor(rnd()*a.length)];
const base=()=>({settings:{currency:'INR',lowBalanceFloor:1000},catalogs:{transactionTypes:[{id:'txt_expense',label:'Expense',semantic:'expense',active:true,system:true},{id:'txt_income',label:'Income',semantic:'income',active:true,system:true},{id:'txt_repayment',label:'Repayment',semantic:'repayment',active:true,system:true}],incomeSources:[{id:'inc_other',label:'Other',semantic:'other',active:true,system:true}],paymentMethods:[{id:'pm_other',label:'Other',semantic:'other',active:true,system:true}],scopes:[{id:'scope_self',label:'Self',semantic:'self',active:true,system:true}],natures:[{id:'nat_other',label:'Other',semantic:'other',active:true,system:true}],units:[{id:'unit_item',label:'Item',semantic:'item',active:true,system:true}],accountTypes:[{id:'atype_bank',label:'Bank',semantic:'bank',active:true,system:true}]},categories:[{id:'c1',name:'C1',active:true,system:false},{id:'c2',name:'C2',active:true,system:false}],accounts:[{id:'a1',name:'A1',accountTypeId:'atype_bank',balance:1000,active:true},{id:'a2',name:'A2',accountTypeId:'atype_bank',balance:100,active:true}],transactions:[],recurring:[],debts:[],goals:[],assets:[],investments:[],insurance:[],documents:[],meta:{}});
let checks=0;
for(let n=0;n<250;n++){
  const s=base();A.ensure(s);
  for(let i=0;i<20;i++)s.transactions.push({id:`t${n}_${i}`,externalId:`e${n}_${i}`,date:'2026-08-01',transactionTypeId:pick(['txt_expense','txt_income']),categoryId:pick(['c1','c2']),accountId:pick(['a1','a2']),scopeId:'scope_self',natureId:'nat_other',paymentMethodId:'pm_other',amount:1+Math.floor(rnd()*1000),merchant:'M'+i,manualFields:[]});
  for(let i=0;i<5;i++)s.recurring.push({id:`r${n}_${i}`,name:'R'+i,amount:100,categoryId:pick(['c1','c2']),accountId:pick(['a1','a2']),active:true,manualFields:[]});
  for(let i=0;i<3;i++)s.goals.push({id:`g${n}_${i}`,name:'G'+i,target:1000,categoryId:pick(['c1','c2']),accountId:pick(['a1','a2']),active:true,manualFields:[]});
  const before=A.definitionRefs(s,'categories','c1').length;if(before){A.remapDefinition(s,'categories','c1','c2');if(A.definitionRefs(s,'categories','c1').length!==0)throw Error('category remap left references')}checks++;
  A.remapAccount(s,'a1','a2');if(A.accountRefs(s,'a1').length!==0)throw Error('account remap left references');checks++;
  const existing={id:`x${n}`,name:'Manual '+n,target:10,manualFields:['name']},incoming={id:`x${n}`,name:'Import '+n,target:20},m=A.mergeImported(existing,incoming);if(m.name!==existing.name||m.target!==20)throw Error('manual merge invariant failed');checks++;
  const ids=[...new Set(s.transactions.map(t=>t.id))];if(ids.length!==s.transactions.length)throw Error('duplicate tx IDs in generated state');checks++;
  const audit=A.auditV42(s);if(audit.fail.length)throw Error('audit failure '+audit.fail.join(';'));checks++;
}
for(const kind of ['goals','assets','investments','insurance','documents','recurring','loans']){
  const s=base();A.ensure(s);let row;
  if(kind==='goals')row={goal_id:'g1',name:'Goal',target_amount:'1000',account_id:'a1'};
  if(kind==='assets')row={asset_id:'as1',name:'Asset',current_value:'500',account_id:'a1'};
  if(kind==='investments')row={investment_id:'i1',name:'Fund',current_value:'700',account_id:'a1'};
  if(kind==='insurance')row={insurance_id:'p1',name:'Policy',premium_amount:'100',payment_account_id:'a1'};
  if(kind==='documents')row={document_id:'d1',name:'Licence',expiry_date:'2027-01-01'};
  if(kind==='recurring')row={recurring_id:'r1',name:'Subscription',amount:'99',account_id:'a1',category_id:'c1'};
  if(kind==='loans')row={loan_id:'l1',provider:'Lender',principal_amount:'10000',payment_account_id:'a1'};
  let st=A.stageMasterImport(s,kind,[row]);if(st[0].errors.length)throw Error(kind+' valid import rejected');A.commitMasterImport(s,kind,st);st=A.stageMasterImport(s,kind,[row]);if(st[0].action!=='UPDATE')throw Error(kind+' stable ID did not upsert');checks+=2;
}
console.log(`SHINI v4.2 property/state tests: ${checks} invariant checks PASS`);
