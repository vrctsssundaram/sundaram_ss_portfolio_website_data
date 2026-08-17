// SHINI scoped static-cache service worker. Cross-origin/API responses are never cached.
const CACHE='shini-static-v33';
const SCOPE='/app/shini/';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll([SCOPE,SCOPE+'shini-brand-safe.js',SCOPE+'shini-controls.js']).catch(()=>{})))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shini-static-')&&k!==CACHE).map(k=>caches.delete(k))))]))});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin||!u.pathname.startsWith(SCOPE))return;event.respondWith((async()=>{try{const res=await fetch(r);if(res&&res.ok&&res.type==='basic'){const c=await caches.open(CACHE);c.put(r,res.clone()).catch(()=>{})}return res}catch(e){const cached=await caches.match(r);if(cached)return cached;throw e}})())});