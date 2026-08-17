// VASU v2.5 — dedicated Bulk Import / ChatGPT exchange workspace.
// Local-only XLSX parsing: no uploaded finance file leaves the browser.

const VASU_BULK_ACCEPT='.csv,.json,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/json';

function vasuBulkStyle(){
  if(document.getElementById('vasuBulkStyle')) return;
  const s=document.createElement('style');
  s.id='vasuBulkStyle';
  s.textContent=`
    .vasu-bulk-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:14px;margin-bottom:14px}
    .vasu-dropzone{border:1px dashed #A67C3D;background:linear-gradient(180deg,rgba(201,168,76,.07),rgba(22,42,61,.22));border-radius:16px;padding:26px 18px;text-align:center;transition:.18s ease;outline:none}
    .vasu-dropzone:hover,.vasu-dropzone.dragover,.vasu-dropzone:focus{border-color:#C9A84C;box-shadow:0 0 0 3px rgba(212,184,106,.12);background:linear-gradient(180deg,rgba(201,168,76,.11),rgba(22,42,61,.32))}
    .vasu-dropzone strong{display:block;font-size:16px;color:#F2EDE4;margin-bottom:6px}
    .vasu-dropzone p{margin:0 auto 14px;max-width:560px;color:#A8B0B8;font-size:12px;line-height:1.55}
    .vasu-file-types{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:12px 0 0}
    .vasu-file-types span{display:inline-flex;padding:4px 8px;border:1px solid #2A3F55;border-radius:999px;color:#A8B0B8;font-size:10px;background:#162A3D}
    .vasu-bulk-steps{display:grid;gap:9px}
    .vasu-bulk-step{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start;padding:10px;border:1px solid #2A3F55;border-radius:12px;background:#162A3D}
    .vasu-bulk-step b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#1F3549;color:#C9A84C;border:1px solid rgba(201,168,76,.35)}
    .vasu-bulk-step strong{display:block;font-size:12px;color:#F2EDE4}.vasu-bulk-step span{display:block;font-size:10px;color:#A8B0B8;margin-top:3px;line-height:1.45}
    .vasu-bulk-actions{display:flex;gap:8px;flex-wrap:wrap}
    .vasu-bulk-status{margin-top:12px;padding:10px 12px;border:1px solid #2A3F55;border-radius:10px;background:#162A3D;color:#A8B0B8;font-size:11px;line-height:1.5}
    .vasu-bulk-status.good{border-color:rgba(74,124,111,.7);color:#d8ebe5}.vasu-bulk-status.bad{border-color:rgba(184,122,92,.75);color:#efd5c9}
    #page-bulk .exchange-summary{grid-template-columns:repeat(4,minmax(110px,1fr))}
    #page-bulk .data-table input,#page-bulk .data-table select{min-width:120px}
    #page-bulk .data-table td:first-child{min-width:150px}
    .vasu-privacy-note{display:flex;gap:9px;align-items:flex-start;margin-top:10px;color:#A8B0B8;font-size:10px;line-height:1.5}
    .vasu-privacy-dot{width:8px;height:8px;margin-top:4px;border-radius:50%;background:#4A7C6F;box-shadow:0 0 0 3px rgba(74,124,111,.12);flex:0 0 auto}
    @media(max-width:900px){.vasu-bulk-hero{grid-template-columns:1fr}.vasu-dropzone{padding:20px 12px}}
    @media(max-width:520px){.vasu-bulk-actions>*{width:100%}.vasu-dropzone{border-radius:12px}.vasu-bulk-step{grid-template-columns:24px 1fr}.vasu-bulk-step b{width:24px;height:24px}}
  `;
  document.head.appendChild(s);
}

function vasuBulkTemplateCsv(){
  const headers=typeof aiExchangeColumns==='function'?aiExchangeColumns():[
    'record_id','date','time','transaction_type_id','type_semantic','income_source_id','category_id','account_id','destination_account_id','scope_id','nature_id','payment_method_id','merchant','amount','quantity','unit_id','km','value','debt_id','principal_component','interest_component','reimbursable','note'
  ];
  downloadBlob('\uFEFF'+headers.join(',')+'\n',`VASU_ChatGPT_Bulk_Import_Template_${today()}.csv`,'text/csv;charset=utf-8');
}

function vasuBulkReviewPack(){
  const active=x=>x?.active!==false;
  const pack={
    vasu_exchange_version:'2.5',
    generated_at:nowISO(),
    purpose:'Give this JSON plus bank statements to ChatGPT. ChatGPT should return rows using the exact IDs below and the canonical VASU CSV columns.',
    canonical_columns:typeof aiExchangeColumns==='function'?aiExchangeColumns():[],
    rules:[
      'Do not invent master IDs. Use only IDs present in this review pack unless the user explicitly asks to create new master data.',
      'Own-account movements are transfers, not expenses or income.',
      'Borrowed money is borrowing, not income.',
      'Debt payments use repayment and may include principal_component and interest_component when known.',
      'Set reimbursable=true only when the amount is expected to be recovered and should be excluded from personal P&L.',
      'Use a stable record_id when the bank statement provides one; otherwise leave record_id blank and VASU will fingerprint the transaction.'
    ],
    transaction_types:(catalog('transactionTypes')||[]).filter(active).map(x=>({id:x.id,label:x.label,semantic:x.semantic})),
    income_sources:(catalog('incomeSources')||[]).filter(active).map(x=>({id:x.id,label:x.label,semantic:x.semantic})),
    scopes:(catalog('scopes')||[]).filter(active).map(x=>({id:x.id,label:x.label,semantic:x.semantic})),
    expense_natures:(catalog('natures')||[]).filter(active).map(x=>({id:x.id,label:x.label,semantic:x.semantic})),
    payment_methods:(catalog('paymentMethods')||[]).filter(active).map(x=>({id:x.id,label:x.label,semantic:x.semantic})),
    units:(catalog('units')||[]).filter(active).map(x=>({id:x.id,label:x.label,symbol:x.symbol||'',semantic:x.semantic||''})),
    categories:(state.categories||[]).filter(active).map(x=>({id:x.id,name:x.name,group:x.group,essential:!!x.essential,character:x.character})),
    accounts:(state.accounts||[]).filter(active).map(x=>({id:x.id,name:x.name,type:x.type,scope:x.scope})),
    debts:(state.debts||[]).filter(x=>x.active!==false).map(x=>({id:x.id,name:x.name,emi:Number(x.emi||0)}))
  };
  downloadBlob(JSON.stringify(pack,null,2),`VASU_ChatGPT_Review_Pack_${today()}.json`,'application/json');
}

function vasuBulkFullJson(){
  const payload={vasu_export_version:'2.5',exported_at:nowISO(),state};
  downloadBlob(JSON.stringify(payload,null,2),`VASU_complete_database_${today()}.json`,'application/json');
}

function vasuColumnIndexFromRef(ref){
  const m=String(ref||'').match(/^([A-Z]+)\d+$/i);if(!m)return 0;
  let n=0;for(const ch of m[1].toUpperCase())n=n*26+(ch.charCodeAt(0)-64);return Math.max(0,n-1);
}
function vasuExcelDate(serial){
  const n=Number(serial);if(!Number.isFinite(n)||n<=0)return serial;
  const d=new Date(Date.UTC(1899,11,30)+Math.floor(n)*86400000);
  return d.toISOString().slice(0,10);
}
function vasuExcelTime(serial){
  const n=Number(serial);if(!Number.isFinite(n))return serial;
  const fraction=((n%1)+1)%1,total=Math.round(fraction*86400)%86400;
  return `${String(Math.floor(total/3600)).padStart(2,'0')}:${String(Math.floor((total%3600)/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

async function vasuUnzipXlsx(arrayBuffer){
  const bytes=new Uint8Array(arrayBuffer),view=new DataView(arrayBuffer),td=new TextDecoder('utf-8');
  let eocd=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-66000);i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw new Error('Invalid XLSX/ZIP file: end-of-directory record not found.');
  const entriesCount=view.getUint16(eocd+10,true),centralOffset=view.getUint32(eocd+16,true),entries=new Map();let p=centralOffset;
  for(let i=0;i<entriesCount;i++){
    if(view.getUint32(p,true)!==0x02014b50)throw new Error('Invalid XLSX central directory.');
    const method=view.getUint16(p+10,true),compressedSize=view.getUint32(p+20,true),uncompressedSize=view.getUint32(p+24,true),nameLen=view.getUint16(p+28,true),extraLen=view.getUint16(p+30,true),commentLen=view.getUint16(p+32,true),localOffset=view.getUint32(p+42,true),name=td.decode(bytes.slice(p+46,p+46+nameLen));
    entries.set(name,{method,compressedSize,uncompressedSize,localOffset});p+=46+nameLen+extraLen+commentLen;
  }
  async function text(name){
    const e=entries.get(name);if(!e)return null;const o=e.localOffset;
    if(view.getUint32(o,true)!==0x04034b50)throw new Error(`Invalid XLSX local header for ${name}.`);
    const nameLen=view.getUint16(o+26,true),extraLen=view.getUint16(o+28,true),start=o+30+nameLen+extraLen,compressed=bytes.slice(start,start+e.compressedSize);let out;
    if(e.method===0)out=compressed;
    else if(e.method===8){if(!('DecompressionStream' in window))throw new Error('This browser cannot decompress XLSX files. Use CSV instead.');const ds=new DecompressionStream('deflate-raw');out=new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(ds)).arrayBuffer())}
    else throw new Error(`Unsupported XLSX compression method ${e.method}.`);
    return td.decode(out);
  }
  return {entries,text};
}

async function vasuParseXlsx(file){
  const zip=await vasuUnzipXlsx(await file.arrayBuffer()),parser=new DOMParser();
  const sharedXml=await zip.text('xl/sharedStrings.xml'),shared=[];
  if(sharedXml){const doc=parser.parseFromString(sharedXml,'application/xml');for(const si of [...doc.getElementsByTagName('si')])shared.push([...si.getElementsByTagName('t')].map(t=>t.textContent||'').join(''))}
  const sheetName=zip.entries.has('xl/worksheets/sheet1.xml')?'xl/worksheets/sheet1.xml':[...zip.entries.keys()].filter(n=>/^xl\/worksheets\/sheet\d+\.xml$/i.test(n)).sort()[0];
  if(!sheetName)throw new Error('No worksheet found in XLSX file.');
  const xml=await zip.text(sheetName),doc=parser.parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror'))throw new Error('Could not parse XLSX worksheet XML.');
  const rows=[];
  for(const row of [...doc.getElementsByTagName('row')]){
    const arr=[];
    for(const c of [...row.getElementsByTagName('c')]){
      const idx=vasuColumnIndexFromRef(c.getAttribute('r')),type=c.getAttribute('t')||'',v=c.getElementsByTagName('v')[0]?.textContent??'';let value=v;
      if(type==='s')value=shared[Number(v)]??'';
      else if(type==='inlineStr')value=[...c.getElementsByTagName('t')].map(t=>t.textContent||'').join('');
      else if(type==='b')value=v==='1'?'true':'false';
      arr[idx]=value;
    }
    rows.push(arr.map(x=>x??''));
  }
  if(!rows.length)throw new Error('The XLSX worksheet is empty.');
  const headers=rows[0].map(x=>String(x).trim().toLowerCase());
  const normalized=[rows[0]];
  for(const row of rows.slice(1)){
    const out=[...row];
    headers.forEach((h,i)=>{
      const raw=out[i];
      if(h==='date'&&raw!==''&&!/^\d{4}-\d{2}-\d{2}$/.test(String(raw)))out[i]=vasuExcelDate(raw);
      if(h==='time'&&raw!==''&&/^\d*\.?\d+$/.test(String(raw)))out[i]=vasuExcelTime(raw);
    });
    normalized.push(out);
  }
  return normalized;
}

async function vasuBulkImportFile(file,inputEl=null){
  const status=document.getElementById('vasuBulkStatus');
  if(status){status.className='vasu-bulk-status';status.textContent=`Reading ${file.name}…`}
  try{
    const ext=(file.name.split('.').pop()||'').toLowerCase();let eventFile=file;
    if(ext==='xlsx'){
      const rows=await vasuParseXlsx(file),csv=rows.map(r=>r.map(csvEscape).join(',')).join('\n');
      eventFile=new File([csv],file.name.replace(/\.xlsx$/i,'.csv'),{type:'text/csv'});
    }
    if(!['csv','json','xlsx'].includes(ext))throw new Error('Use a VASU CSV, JSON or XLSX file.');
    const fake={target:{files:[eventFile],value:''}};
    await handleExchangeImport(fake);
    showPage('bulk');
    if(status){status.className='vasu-bulk-status good';status.textContent=`${file.name} staged successfully. Review every row below before merging.`}
  }catch(e){
    if(status){status.className='vasu-bulk-status bad';status.textContent=`Import failed: ${e.message}`}
    toast(`Bulk import failed: ${e.message}`);
  }finally{if(inputEl)inputEl.value=''}
}

function vasuInjectBulkUI(){
  vasuBulkStyle();
  const main=document.querySelector('.main'),nav=document.getElementById('nav');if(!main||!nav)return;
  if(!document.getElementById('vasuBulkNav')){
    const b=document.createElement('button');b.id='vasuBulkNav';b.className='nav-item';b.dataset.page='bulk';b.textContent='Bulk Import';
    const dataBtn=nav.querySelector('[data-page="data"]');dataBtn?nav.insertBefore(b,dataBtn):nav.appendChild(b);
  }
  let page=document.getElementById('page-bulk');
  if(!page){
    page=document.createElement('section');page.id='page-bulk';page.className='page';
    page.innerHTML=`
      <div class="vasu-bulk-hero">
        <article class="panel" style="margin-top:0">
          <div class="panel-head"><div><h2>Bulk Import / ChatGPT Upload</h2><p>Statement → ChatGPT → VASU review → revisioned merge</p></div><span class="status">CSV · XLSX · JSON</span></div>
          <div id="vasuDropzone" class="vasu-dropzone" tabindex="0" role="button" aria-label="Upload VASU transaction file">
            <strong>Drop your VASU file here</strong>
            <p>Upload the completed template returned by ChatGPT. Nothing is committed immediately: VASU first stages the rows, detects duplicates/conflicts and gives you editable dropdowns.</p>
            <button id="vasuChooseBulkFile" class="primary" type="button">Choose spreadsheet / CSV</button>
            <input id="vasuBulkFile" type="file" accept="${VASU_BULK_ACCEPT}" hidden>
            <div class="vasu-file-types"><span>VASU CSV</span><span>Excel .xlsx</span><span>VASU JSON</span></div>
          </div>
          <div id="vasuBulkStatus" class="vasu-bulk-status">No file staged. The database remains unchanged until you explicitly press Merge.</div>
          <div class="vasu-privacy-note"><span class="vasu-privacy-dot"></span><span>CSV/XLSX parsing and conflict review happen inside this browser. The resulting committed encrypted vault then synchronizes through your central VASU account.</span></div>
        </article>
        <article class="panel" style="margin-top:0">
          <div class="panel-head"><div><h2>Recommended workflow</h2><p>Designed for weekly/monthly statement entry</p></div></div>
          <div class="vasu-bulk-steps">
            <div class="vasu-bulk-step"><b>1</b><div><strong>Download template + Review Pack</strong><span>The Review Pack gives ChatGPT your live IDs for accounts, categories, payment methods, scopes and other master data.</span></div></div>
            <div class="vasu-bulk-step"><b>2</b><div><strong>Give bank statements to ChatGPT</strong><span>Ask ChatGPT to classify and fill the VASU template. Review the returned CSV/XLSX in Excel if you wish.</span></div></div>
            <div class="vasu-bulk-step"><b>3</b><div><strong>Upload and resolve conflicts</strong><span>Use ADD / SKIP / REPLACE / KEEP_BOTH and correct mappings using dropdowns before committing.</span></div></div>
            <div class="vasu-bulk-step"><b>4</b><div><strong>Merge as one reversible revision</strong><span>The batch syncs centrally and can be undone without destroying the historical audit trail.</span></div></div>
          </div>
        </article>
      </div>
      <article class="panel">
        <div class="panel-head"><div><h2>Exchange tools</h2><p>Prepare files for ChatGPT, audit the database or reverse the latest import</p></div></div>
        <div class="vasu-bulk-actions">
          <button id="vasuDownloadTemplate" class="secondary">Download CSV Template</button>
          <button id="vasuDownloadReviewPack" class="secondary">Download ChatGPT Review Pack</button>
          <button id="vasuExportDbCsv" class="secondary">Export Complete DB CSV</button>
          <button id="vasuExportDbJson" class="secondary">Export Complete DB JSON</button>
          <button id="vasuUndoBulk" class="ghost">Undo Last Import Batch</button>
        </div>
      </article>
      <div id="vasuBulkPreviewSlot"></div>`;
    main.appendChild(page);
  }
  let preview=document.getElementById('exchangePreview');
  if(!preview){preview=document.createElement('div');preview.id='exchangePreview';preview.className='hidden'}
  const slot=document.getElementById('vasuBulkPreviewSlot');if(slot&&preview.parentElement!==slot)slot.appendChild(preview);
  const file=document.getElementById('vasuBulkFile'),drop=document.getElementById('vasuDropzone');
  document.getElementById('vasuChooseBulkFile').onclick=()=>file.click();
  file.onchange=e=>{const f=e.target.files?.[0];if(f)vasuBulkImportFile(f,file)};
  drop.onclick=e=>{if(!e.target.closest('button'))file.click()};
  drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();file.click()}};
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragover')}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragover')}));
  drop.ondrop=e=>{const f=e.dataTransfer?.files?.[0];if(f)vasuBulkImportFile(f,file)};
  document.getElementById('vasuDownloadTemplate').onclick=vasuBulkTemplateCsv;
  document.getElementById('vasuDownloadReviewPack').onclick=vasuBulkReviewPack;
  document.getElementById('vasuExportDbCsv').onclick=()=>typeof vasuExportFullCsv==='function'?vasuExportFullCsv():toast('CSV export is unavailable.');
  document.getElementById('vasuExportDbJson').onclick=vasuBulkFullJson;
  document.getElementById('vasuUndoBulk').onclick=()=>undoLastImport();
}

const vasuV25PrevInject=vasuInjectCentralUI;
vasuInjectCentralUI=function(){vasuV25PrevInject();vasuInjectBulkUI()};
const vasuV25PrevShowPage=showPage;
showPage=function(p){vasuV25PrevShowPage(p);if(p==='bulk'){const t=document.getElementById('pageTitle'),s=document.getElementById('pageSubtitle');if(t)t.textContent='Bulk Import';if(s)s.textContent='ChatGPT-assisted statement ingestion with conflict review and revision history';vasuInjectBulkUI()}};
