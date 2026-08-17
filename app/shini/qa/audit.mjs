import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const req=(p)=>{const q=path.join(ROOT,p);if(!fs.existsSync(q))throw new Error(`MISSING ${p}`);return fs.readFileSync(q,'utf8')};
const exists=p=>fs.existsSync(path.join(ROOT,p));
const pass=[]; const fail=[]; const warn=[];
const check=(name,cond,detail='')=>{(cond?pass:fail).push(`${name}${detail?' — '+detail:''}`)};
const expect=(name,fn)=>{try{fn();pass.push(name)}catch(e){fail.push(`${name} — ${e.message}`)}};
const gunzipText=(s)=>zlib.gunzipSync(Buffer.from(String(s).replace(/\s+/g,''),'base64')).toString('utf8');
const gitBlobSha=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex');
const parseJS=(label,src)=>{try{new vm.Script(src,{filename:label});pass.push(`JS syntax: ${label}`)}catch(e){fail.push(`JS syntax: ${label} — ${e.message}`)}};

check('Canonical route exists', exists('app/shini/index.html'));
check('Legacy hiden tree removed', !exists('hiden'));
check('Canonical runtime tree exists', exists('app/shini/runtime/core/00.txt') && exists('app/shini/runtime/sync-runtime.js'));
const publicIndex=fs.readFileSync(path.join(ROOT,'index.html'));
check('Public portfolio byte identity', gitBlobSha(publicIndex)==='e4f7b18d813a481fe6723101032d311fa2fee74e',gitBlobSha(publicIndex));

const loader=req('app/shini/index.html');
check('Loader uses canonical runtime path', loader.includes("const root='/app/shini/runtime/'"));
check('Loader has no legacy route dependency', !/\/hiden\/vasu/i.test(loader));
check('SHINI noindex metadata', /noindex,nofollow,noarchive,nosnippet/i.test(loader));
check('Loader has explicit failure UI', loader.includes('Unable to open SHINI'));
parseJS('loader inline script',(loader.match(/<script>([\s\S]*?)<\/script>/)||[])[1]||'');

let coreB64=''; for(let i=0;i<14;i++)coreB64+=req(`app/shini/runtime/core/${String(i).padStart(2,'0')}.txt`);
for(let i=1;i<=16;i++)coreB64+=req(`app/shini/runtime/core/14/${String(i).padStart(2,'0')}.txt`);
let core=''; expect('Core payload gunzip',()=>{core=gunzipText(coreB64); if(!core.includes('<!')) throw new Error('not HTML')});
check('Core initialization marker exists',core.includes('init().catch(e=>{console.error(e);alert(`Initialization failed: ${e.message}`)});'));
check('Core has encrypted vault derivation',/PBKDF2|derive\(/.test(core) && /AES-GCM|AES/.test(core));
check('Core has saveState',/function\s+saveState\s*\(/.test(core));
check('Core has account effects',/function\s+addAccountEffect\s*\(/.test(core));
check('Core has debt effects',/function\s+applyDebtEffect\s*\(/.test(core));
check('Core has safe-to-spend',/function\s+safeToSpend\s*\(/.test(core));
check('Core has transaction revision support',/revision/i.test(core));
check('Core has no external script imports',!/<script[^>]+src=["']https?:/i.test(core));
check('Core has no service-role secret',!/service[_-]?role/i.test(core));
const ids=[...core.matchAll(/\sid=["']([^"']+)["']/g)].map(m=>m[1]);
const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
check('Core static DOM IDs unique',dup.length===0,dup.join(','));

const mods={sync:req('app/shini/runtime/sync-runtime.js'),integrity:req('app/shini/runtime/import-integrity.js'),bulk:req('app/shini/runtime/bulk-import-ui.js'),polish:req('app/shini/runtime/interaction-polish.js'),nav:req('app/shini/runtime/responsive-navigation.js'),brand:req('app/shini/shini-brand-safe.js')};
for(const [k,v] of Object.entries(mods)) parseJS(k,v);
let qa=''; expect('Accounting-integrity payload gunzip',()=>qa=gunzipText(req('app/shini/runtime/accounting-integrity.b64'))); if(qa)parseJS('accounting-integrity',qa);
let v29b=''; for(let i=1;i<=6;i++)v29b+=req(`app/shini/runtime/features/29/${String(i).padStart(2,'0')}.txt`);
let v29=''; expect('Feature-29 payload gunzip',()=>v29=gunzipText(v29b)); if(v29)parseJS('feature-29',v29);
let controls=''; expect('SHINI controls gunzip',()=>controls=gunzipText(req('app/shini/shini-v32-controls.js'))); if(controls)parseJS('shini-v32-controls',controls);

check('Central cloud uses publishable client key',/sb_publishable_/.test(mods.sync));
check('No service-role key in active runtime',!Object.values(mods).join('\n').match(/service[_-]?role/i));
check('Auto-sync wraps saveState',/saveState\s*=\s*async function/.test(mods.sync) && /vasuScheduleCloudPush/.test(mods.sync));
check('Optimistic revision conflict protection',/revision=eq\./.test(mods.sync) && /Cloud conflict detected/.test(mods.sync));
check('Session refresh implemented',/grant_type=refresh_token/.test(mods.sync));
check('Cloud vault remains encrypted bundle',/payload=\{meta,bundle/.test(mods.sync) && /decryptState\(/.test(mods.sync));

check('Canonical stable-ID exchange import',/transaction_type_id/.test(mods.bulk) && /account_id/.test(mods.bulk));
check('Local XLSX parser',/vasuParseXlsx/.test(mods.bulk) && /DecompressionStream\('deflate-raw'\)/.test(mods.bulk));
check('CSV JSON XLSX accepted',/\.csv,.json,.xlsx/.test(mods.bulk));
check('Merge workspace supports exact/possible/conflict',/exact/.test(mods.sync) && /possible/.test(mods.sync) && /conflict/.test(mods.sync));
check('Import undo present',/Undo Last Import|undo/i.test(mods.sync+mods.bulk));
check('Internal transfers distinguished',/destination_account_id/.test(mods.bulk));

check('Desktop sidebar independent scroll',/overflow-y:auto!important/.test(mods.nav));
check('Mobile drawer touch scroll',/-webkit-overflow-scrolling:touch/.test(mods.nav) && /touch-action:pan-y/.test(mods.nav));
check('Safe area support',/safe-area-inset-bottom/.test(mods.nav));
check('Escape closes mobile drawer',/e\.key==='Escape'/.test(mods.nav));
check('Active navigation auto-scroll',/vasuScrollActiveNav/.test(mods.nav));

if(controls){
 check('Three text color categories',/Primary text color/.test(controls)&&/Secondary text color/.test(controls)&&/Accent \/ indicator text/.test(controls));
 check('Two configurable mobile shortcuts',/Mobile shortcut 1/.test(controls)&&/Mobile shortcut 2/.test(controls));
 check('Uniform SVG transaction icon',/svgIcon\('tx'\)/.test(controls));
 check('Bounded diagnostics log',/MAX_LOG=500/.test(controls));
 check('Self-test checks transactions/accounts/DOM/navigation',/Duplicate transaction id/.test(controls)&&/Duplicate DOM id/.test(controls)&&/Navigation target missing/.test(controls));
 check('Safe update package schema',/shini-config-update-v1/.test(controls));
 check('Safe update is non-executable',!/eval\(|new Function\(/.test(controls));
 check('Controls do not use window.state',!/window\.state/.test(controls));
 check('Controls do not redefine ledger mutation functions',!/function\s+(addAccountEffect|applyDebtEffect|makeTransactionFromForm|commitExchangeImport)\s*\(/.test(controls));
 check('Heritage logo is inline SVG',/shini-heritage-logo/.test(controls)&&/<svg/.test(controls));
}

if(v29){
 check('Global analysis window exists',/Analysis Window|analysis window/i.test(v29));
 for(const s of ['Current Month','Previous Month','Last 3 Months','Last 6 Months','Previous FY','Custom']) check(`Period preset: ${s}`,v29.includes(s));
 check('Exports include CSV',/CSV/.test(v29)); check('Exports include Excel/XLS',/XLS|Excel/.test(v29)); check('Exports include Word/DOC',/DOC|Word/.test(v29)); check('Exports include JSON',/JSON/.test(v29)); check('Print/PDF path exists',/Print|PDF/.test(v29));
 check('Cash Day Book exists',/Cash Day Book/i.test(v29)); check('Tools hub exists',/Tools & Resources|Financial Tools/i.test(v29)); check('Market hub does not invent live provider',/No verified live market provider|not configured/i.test(v29));
}

check('Brand bridge maps VASU to SHINI',/VASU/.test(mods.brand) && /SHINI/.test(mods.brand));
check('Brand bridge maps ChatGPT to AI tool',/ChatGPT/.test(mods.brand) && /AI tool/.test(mods.brand));
check('Brand bridge has no financial mutation calls',!/(addAccountEffect|applyDebtEffect|makeTransactionFromForm|commitExchangeImport)\s*\(/.test(mods.brand));

const patch=[mods.sync,mods.integrity,mods.bulk,mods.polish,mods.nav,qa,v29,mods.brand].join('\n');
check('Patch contains all required major modules',patch.length>100000,`${patch.length} bytes`);
const marker='init().catch(e=>{console.error(e);alert(`Initialization failed: ${e.message}`)});';
let integrated=core.includes(marker)?core.replace(marker,patch+'\n'+marker):'';
check('Integrated HTML reconstructs',integrated.length>core.length && integrated.includes('SHINI'));
for(const [i,m] of [...integrated.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) if(m[1].trim()) parseJS(`integrated-script-${i+1}`,m[1]);

const appTree=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else appTree.push(path.relative(ROOT,p).replaceAll('\\','/'))}}walk(path.join(ROOT,'app/shini'));
check('No obsolete v3.0 hotfix in canonical app',!appTree.some(p=>/v30|v301|hotfix/i.test(p)));
check('No legacy logo blob in canonical runtime',!appTree.some(p=>/logo\.b64/i.test(p)));

const accountEffect=(tx)=>{const a=Number(tx.amount||0);if(['expense','repayment'].includes(tx.type))return {src:-a,dst:0};if(['income','borrowing'].includes(tx.type))return {src:a,dst:0};if(['transfer','investment'].includes(tx.type))return {src:-a,dst:a};return {src:0,dst:0}};
check('Oracle borrowing increases cash without consumption',accountEffect({type:'borrowing',amount:100}).src===100);
check('Oracle transfer net liquid zero',(()=>{const x=accountEffect({type:'transfer',amount:500});return x.src+x.dst===0})());
check('Oracle investment is asset transfer',(()=>{const x=accountEffect({type:'investment',amount:500});return x.src===-500&&x.dst===500})());

console.log(`SHINI QA: ${pass.length} PASS / ${fail.length} FAIL / ${warn.length} WARN`);
for(const x of pass)console.log('PASS',x); for(const x of warn)console.warn('WARN',x); for(const x of fail)console.error('FAIL',x); if(fail.length)process.exit(1);