import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const pass=[];const fail=[];const check=(name,ok,detail='')=>{(ok?pass:fail).push(`${name}${detail?' — '+detail:''}`)};

function inspectPng(b){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  if(!b.subarray(0,8).equals(sig))throw new Error('bad PNG signature');
  let p=8,width=0,height=0,bitDepth=0,colorType=-1,iend=false;const idat=[];
  while(p+12<=b.length){
    const len=b.readUInt32BE(p),type=b.toString('ascii',p+4,p+8),start=p+8,end=start+len;
    if(end+4>b.length)throw new Error(`truncated ${type} chunk`);
    if(type==='IHDR'){if(len!==13)throw new Error('invalid IHDR');width=b.readUInt32BE(start);height=b.readUInt32BE(start+4);bitDepth=b[start+8];colorType=b[start+9]}
    if(type==='IDAT')idat.push(b.subarray(start,end));
    if(type==='IEND'){iend=true;break}
    p=end+4;
  }
  if(!width||!height||!iend||!idat.length)throw new Error('missing required PNG chunks');
  const channels={0:1,2:3,3:1,4:2,6:4}[colorType];if(!channels)throw new Error(`unsupported color type ${colorType}`);
  const raw=zlib.inflateSync(Buffer.concat(idat));
  const rowBytes=Math.ceil(width*channels*bitDepth/8),expected=height*(rowBytes+1);
  if(raw.length!==expected)throw new Error(`scanline length ${raw.length} != ${expected}`);
  return {width,height,bitDepth,colorType,bytes:b.length};
}

const index=read('app/shini/index.html');
const brand=read('app/shini/shini-brand-safe.js');
const sw=read('app/shini/sw.js');

check('Master SHINI logo asset exists',exists('app/shini/assets/shini-logo.png'));
if(exists('app/shini/assets/shini-logo.png')){
  const b=fs.readFileSync(path.join(root,'app/shini/assets/shini-logo.png'));
  try{const png=inspectPng(b);check('Master logo PNG structure and pixels valid',png.width>=100&&png.height>=140,`${png.width}x${png.height}, ${png.bytes} bytes, depth ${png.bitDepth}, type ${png.colorType}`)}catch(e){check('Master logo PNG structure and pixels valid',false,e.message)}
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
