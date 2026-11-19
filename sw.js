// Hintergrund-Teil für Handy-Benachrichtigungen (Florian 16.11.2026) und Teilen mit Dateien (19.11.2026). Kein Zwischenspeicher für die App selbst.
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'🏕️🧹',{body:d.body||'',tag:d.tag||undefined,icon:'icon-192.png',badge:'icon-192.png',data:{nav:d.nav||''}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const nav=(e.notification.data||{}).nav||'';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{const c=l[0];if(c){c.postMessage({nav});return c.focus()}return self.clients.openWindow('./'+(nav?'?nav='+encodeURIComponent(nav):''))}))});
// Teilen an die App (manifest share_target, POST mit Dateien): Titel, Text, Link und Dateien kurz in den Cache „hq-share“, dann zur App mit ?shared=1
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='POST'||!u.searchParams.has('share'))return;
  e.respondWith((async()=>{try{const fd=await e.request.formData(),c=await caches.open('hq-share'),F=fd.getAll('f').filter(f=>f&&typeof f!=='string'&&f.size);
    for(let i=0;i<F.length;i++)await c.put('f'+i,new Response(F[i],{headers:{'Content-Type':F[i].type||'application/octet-stream'}}));
    await c.put('meta',new Response(JSON.stringify({st:fd.get('st')||'',sx:fd.get('sx')||'',su:fd.get('su')||'',n:F.length,names:F.map(f=>f.name||''),types:F.map(f=>f.type||'')}),{headers:{'Content-Type':'application/json'}}))}catch(_){}
    return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303)})())});
