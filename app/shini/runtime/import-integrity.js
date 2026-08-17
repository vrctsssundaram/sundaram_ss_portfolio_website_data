// VASU v2.4 import accounting / conflict hotfix.
handleExchangeImport=async function(e){
  const f=e.target.files?.[0];if(!f)return;
  try{
    let records=[];
    if(f.name.toLowerCase().endsWith('.json')){const x=JSON.parse(await f.text());records=Array.isArray(x)?x:(x.transactions||x.records||[])}
    else {const rows=parseCSV((await f.text()).replace(/^\uFEFF/,''));if(rows.length<2)throw new Error('No data rows.');const h=rows[0].map(x=>String(x).trim().toLowerCase());records=rows.slice(1).filter(r=>r.some(x=>String(x).trim())).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])))}
    const prepared=[],errors=[],warnings=[];
    for(let i=0;i<records.length;i++){
      const r=records[i],date=parseDateLoose(r.date);if(!date){errors.push(`Row ${i+2}: invalid date`);continue}
      const amount=parseMoney(r.amount);if(!(amount>0)){errors.push(`Row ${i+2}: invalid amount`);continue}
      const typeId=resolveExchangeId('transactionTypes',r.transaction_type_id,r.type_semantic||r.type),type=catalogSemantic('transactionTypes',typeId,r.type_semantic||r.type||'expense');if(!typeId){errors.push(`Row ${i+2}: unknown transaction type`);continue}
      const accountId=resolveAccountExchange(r.account_id||r.account);if(!accountId){errors.push(`Row ${i+2}: unknown source account ${r.account_id||r.account||''}`);continue}
      const toAccountId=resolveAccountExchange(r.destination_account_id||r.destination_account);if(type==='transfer'&&!toAccountId){errors.push(`Row ${i+2}: transfer needs destination account`);continue}
      if(type==='transfer'&&toAccountId===accountId){errors.push(`Row ${i+2}: source and destination accounts cannot be the same`);continue}
      const categoryId=resolveCategoryExchange(r.category_id||r.category);if(categoryId==='other'&&String(r.category_id||r.category||'').toLowerCase()!=='other')warnings.push(`Row ${i+2}: category mapped to Other`);
      const scopeId=resolveExchangeId('scopes',r.scope_id,r.scope_semantic||r.scope)||'scope_self',natureId=resolveExchangeId('natures',r.nature_id,r.nature_semantic||r.nature)||'nat_imported',paymentMethodId=resolveExchangeId('paymentMethods',r.payment_method_id,r.payment_method)||'pm_other',incomeSourceId=resolveExchangeId('incomeSources',r.income_source_id,r.income_source)||'',unitId=resolveExchangeId('units',r.unit_id,r.unit)||'',debtId=debtIdFromLabel(r.debt_id||r.debt||''),externalId=String(r.record_id||r.external_id||'').trim(),fingerprint=externalId?`exchange:${externalId}`:`exchange:${date}|${accountId}|${amount}|${r.merchant||''}|${type}`;
      prepared.push({id:id('stage'),externalId,date,time:r.time||'',transactionTypeId:typeId,type,incomeSourceId,incomeSource:catalogSemantic('incomeSources',incomeSourceId,''),amount,categoryId,accountId,toAccountId,debtId,principalComponent:parseMoney(r.principal_component),interestComponent:parseMoney(r.interest_component),scopeId,scope:catalogSemantic('scopes',scopeId,'self'),merchant:r.merchant||r.description||'',natureId,nature:catalogSemantic('natures',natureId,'imported'),paymentMethodId,paymentMethod:catalogLabel('paymentMethods',paymentMethodId,'Other'),quantity:parseMoney(r.quantity),unitId,unit:catalogItem('units',unitId)?.symbol||'',km:parseMoney(r.km),value:Number(r.value||0),note:r.note||`Imported from ${f.name}`,reimbursable:String(r.reimbursable||'').toLowerCase()==='true',fingerprint,archived:false,balanceImpactApplied:false,debtImpactApplied:false,createdAt:nowISO(),updatedAt:nowISO()});
    }
    vasuShowMergeWorkspace(f.name,prepared,errors,warnings);
  }catch(err){$('importStatus').textContent=`Exchange import failed: ${err.message}`;toast('Exchange import failed.')}
  e.target.value='';
};

vasuCommitMerge=async function(){
  const box=$('exchangePreview'),selected=(box._vasuDraft||[]).filter(d=>d.action!=='SKIP');if(!selected.length)return;
  const batch=id('batch'),insertedIds=[],replaced=[];
  for(const d of selected){
    const t={...d.tx,importBatchId:batch,updatedAt:nowISO()};
    if(d.action==='REPLACE'&&d.matchId){
      const old=state.transactions.find(x=>x.id===d.matchId);if(!old)continue;
      const before=cloneForRevision(old),created=old.createdAt;
      if(!old.archived){addAccountEffect(old,-1);if(typeof applyDebtEffect==='function')applyDebtEffect(old,-1)}
      Object.assign(old,t,{id:old.id,createdAt:created,archived:false,archivedAt:null,balanceImpactApplied:false,debtImpactApplied:false});
      addAccountEffect(old,1);if(typeof applyDebtEffect==='function')applyDebtEffect(old,1);
      replaced.push({id:old.id,before});recordRevision('transaction',old.id,'import_replace',before,cloneForRevision(old),`Batch ${batch}`);
    }else{
      if(d.action==='KEEP_BOTH')t.fingerprint=`${t.fingerprint}:keep:${Date.now()}:${Math.random().toString(36).slice(2,6)}`;
      t.id=id('imp');state.transactions.push(t);addAccountEffect(t,1);if(typeof applyDebtEffect==='function')applyDebtEffect(t,1);insertedIds.push(t.id);recordRevision('transaction',t.id,'import_create',null,cloneForRevision(t),`Batch ${batch}`);
    }
  }
  state.meta.importedRows=(state.meta.importedRows||0)+selected.length;state.meta.lastImportAt=nowISO();state.meta.lastImportBatch={id:batch,insertedIds,replaced,source:box._filename,at:nowISO()};state.meta.lastImportBatchId=batch;
  recordRevision('transaction',`batch:${batch}`,'bulk_merge',null,{insertedIds,replacedIds:replaced.map(x=>x.id),source:box._filename},`${insertedIds.length} inserted · ${replaced.length} replaced`);recordAudit('exchange_merge',`${selected.length} rows committed from ${box._filename}`);
  await saveState();box.classList.add('hidden');box.innerHTML='';renderAll();toast(`${selected.length} rows merged as one revisioned batch.`);
};

undoLastImport=function(){
  const b=state.meta.lastImportBatch;
  if(b){
    if(!confirm(`Undo the last merge batch? ${b.insertedIds?.length||0} inserted rows will be archived and ${b.replaced?.length||0} replaced rows restored.`))return;
    for(const idv of (b.insertedIds||[])){const t=state.transactions.find(x=>x.id===idv);if(t&&!t.archived){const before=cloneForRevision(t);addAccountEffect(t,-1);if(typeof applyDebtEffect==='function')applyDebtEffect(t,-1);t.archived=true;t.archivedAt=nowISO();recordRevision('transaction',t.id,'archive',before,cloneForRevision(t),'Undo merge batch')}}
    for(const r of (b.replaced||[])){const t=state.transactions.find(x=>x.id===r.id);if(t){const before=cloneForRevision(t);if(!t.archived){addAccountEffect(t,-1);if(typeof applyDebtEffect==='function')applyDebtEffect(t,-1)}Object.assign(t,r.before);if(!t.archived){addAccountEffect(t,1);if(typeof applyDebtEffect==='function')applyDebtEffect(t,1)}recordRevision('transaction',t.id,'restore',before,cloneForRevision(t),'Undo merge replacement')}}
    state.meta.lastImportBatch=null;state.meta.lastImportBatchId=null;recordAudit('import_undone',`Batch ${b.id} reversed`);saveState().then(()=>{renderAll();toast('Last import batch reversed; history retained.')});return;
  }
  const batch=state.meta.lastImportBatchId;if(!batch){toast('No import batch is available to undo.');return}
  const rows=state.transactions.filter(t=>t.importBatchId===batch&&!t.archived);if(!confirm(`Archive and reverse ${rows.length} transactions from the last import batch?`))return;
  rows.forEach(t=>{const before=cloneForRevision(t);addAccountEffect(t,-1);if(typeof applyDebtEffect==='function')applyDebtEffect(t,-1);t.archived=true;t.archivedAt=nowISO();recordRevision('transaction',t.id,'archive',before,cloneForRevision(t),'Undo import batch')});state.meta.lastImportBatchId=null;saveState().then(()=>{renderAll();toast(`${rows.length} imported transactions reversed and archived.`)});
};
