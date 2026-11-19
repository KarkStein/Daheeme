// Leuchtturm-Wacht offline: die paar Dateien des Spiels im Zwischenspeicher, im Hintergrund aufgefrischt. Gilt nur für diesen Ordner.
const C='lw-1',F=['./','index.html','kern.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(F)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true}),net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}))});
