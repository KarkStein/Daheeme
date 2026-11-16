// Hintergrund-Teil für Handy-Benachrichtigungen (Florian 16.11.2026). Kein Zwischenspeicher, nur Meldungen.
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'🏕️🧹',{body:d.body||'',tag:d.tag||undefined,icon:'icon-192.png',badge:'icon-192.png',data:{nav:d.nav||''}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const nav=(e.notification.data||{}).nav||'';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{const c=l[0];if(c){c.postMessage({nav});return c.focus()}return self.clients.openWindow('./'+(nav?'?nav='+encodeURIComponent(nav):''))}))});
