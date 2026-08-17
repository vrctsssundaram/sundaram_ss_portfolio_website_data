import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const pass=[];const fail=[];const check=(name,ok,detail='')=>{(ok?pass:fail).push(`${name}${detail?' — '+detail:''}`)};

function inspectPngHeader(b){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  if(b.length<33||!b.subarray(0,8).equals(sig))throw new Error('bad PNG signature');
  if(b.toString('ascii',12,16)!=='IHDR')throw new Error('missing IHDR');
  const width=b.readUInt32BE(16),height=b.readUInt32BE(20),bitDepth=b[24],colorType=b[25];
  if(!width||!height)throw new Error('invalid dimensions');
  return {width,height,bitDepth,colorType,bytes:b.length};
}

const index=read('app/shini/index.html');
const brand=read('app/shini/shini-brand-safe.js');
const sw=read('app/shini/sw.js');

check('Master SHINI logo asset exists',exists('app/shini/assets/shini-logo.png'));
if(exists('app/shini/assets/shini-logo.png')){
  const b=fs.readFileSync(path.join(root,'app/shini/assets/shini-logo.png'));
  try{const png=inspectPngHeader(b);check('Master logo PNG header and dimensions valid',png.width>=100&&png.height>=140,`${png.width}x${png.height}, ${png.bytes} bytes, depth ${png.bitDepth}, type ${png.colorType}`)}catch(e){check('Master logo PNG header and dimensions valid',false,e.message)}
}
check('Boot screen uses master SHINI logo',/assets\/shini-logo\.png\?v=34/.test(index));
check('Boot screen has no letter-only S mark',!/<div class="mark">S<\/div>/.test(index));
check('Brand bridge uses master SHINI logo',/assets\/shini-logo\.png\?v=34/.test(brand));
check('Brand bridge removes prior rendered logo classes',/brand-mark/.test(brand)&&/shini31-mark/.test(brand)&&/vasu-logo/.test(brand)&&/shini-heritage-logo/.test(brand)&&/\.remove\(\)/.test(brand));
check('Brand bridge self-heals late dynamic VASU labels',/MutationObserver/.test(brand)&&/characterData/.test(brand));
check('Brand bridge translates VASU case-insensitively',/\\bVASU\\b\/gi/.test(brand));
check('Brand bridge protects transaction/user content',/transactionsTable/.test(brand)&&/data-user-content/.test(brand));
check('Brand bridge refreshes central account UI',/vasuInjectCentralUI/.test(brand)&&/vasuUpdateCloudUI/.test(brand));
check('Brand bridge refreshes login UI',/showLock/.test(brand));
check('Presentation assets are cache-busted',/shini-brand-safe\.js\?v=34/.test(index)&&/shini-controls\.js\?v=34/.test(brand));
check('Service worker cache version bumped',/shini-static-v34/.test(sw));
check('Service worker precaches master logo',/assets\/shini-logo\.png\?v=34/.test(sw));
check('Service worker deletes earlier SHINI static caches',/caches\.delete/.test(sw)&&/shini-static-/.test(sw));
check('Legacy hidden logo files absent',!exists('hiden')&&!exists('app/shini/runtime/logo.b64'));

console.log(`SHINI branding QA: ${pass.length} PASS / ${fail.length} FAIL`);
for(const x of pass)console.log('PASS',x);
for(const x of fail)console.error('FAIL',x);
if(fail.length)process.exit(1);
