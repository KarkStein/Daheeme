srv.listen(8765,async()=>{
  // Route mit Tag und Ankunftszeit (Florian 17.11.2026, „Stufe 1 bauen“; „ohne Uhrzeit aber Tag im Termin bleibt es wie es ist“)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{window.__open=[];window.open=(u)=>{window.__open.push(u);return null}});
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const D=day(4),P=D.split('-').map(Number),sec=Date.UTC(P[0],P[1]-1,P[2],14,30)/1000;
  await put('pref/home','Beispielweg 2, Testdorf');
  await put('termin/t1',{name:'Kindergeburtstag',date:D,time:'14:30',place:'Musterstraße 1, Musterstadt',at:1});
  await put('termin/t2',{name:'Flohmarkt',date:day(5),place:'Marktplatz, Musterstadt',at:2});
  await A.waitForTimeout(3200);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  // Rechnung: Sa 21.11.2026 14:30 = 1795271400
  r.calc=Date.UTC(2026,10,21,14,30)/1000;
  // Termin mit Uhrzeit: Fenster mit Ankunft, Vorgabe 10 Min früher
  await A.click('[data-route^="Musterstraße"]');await A.waitForSelector('#mbox');r.txt=await A.$eval('#mbox',e=>e.innerText.replace(/\s+/g,' '));
  r.chips=await A.$$eval('#mbox [data-routeearly]',l=>l.map(x=>x.innerText.trim()+(x.getAttribute('aria-pressed')==='true'?'*':'')));
  if(out)await A.screenshot({path:out+'/route-ankunft-live.png'});
  await A.click('#mbox [data-routefrom=home]');await A.waitForTimeout(200);
  // Von hier: offizieller Link ohne Zeit
  await A.click('[data-route^="Musterstraße"]');await A.waitForSelector('#mbox');await A.click('#mbox [data-routefrom=hier]');await A.waitForTimeout(200);
  // pünktlich, Wahl bleibt
  await A.click('[data-route^="Musterstraße"]');await A.waitForSelector('#mbox');await A.click('#mbox [data-routeearly="0"]');await A.waitForTimeout(200);r.txt0=await A.$eval('#mbox .routearr',e=>e.innerText.replace(/\s+/g,' '));
  await A.click('#mbox [data-routefrom=home]');await A.waitForTimeout(200);
  await A.click('[data-route^="Musterstraße"]');await A.waitForSelector('#mbox');r.keep=await A.$eval('#mbox [data-routeearly][aria-pressed=true]',x=>x.dataset.routeearly);
  // ohne Zeit: wie bisher
  await A.click('#mbox [data-routeearly="x"]');await A.waitForTimeout(200);await A.click('#mbox [data-routefrom=home]');await A.waitForTimeout(200);
  // Termin mit Tag, ohne Uhrzeit: Fenster wie bisher
  await A.click('[data-route^="Marktplatz"]');await A.waitForSelector('#mbox');r.plain=await A.$eval('#mbox',e=>e.innerText.replace(/\s+/g,' '));r.pchips=await A.$$eval('#mbox [data-routeearly]',l=>l.map(x=>x.innerText.trim()+(x.getAttribute('aria-pressed')==='true'?'*':'')));await A.click('#mbox [data-routefrom=home]');await A.waitForTimeout(200);
  // Selbst wählen (Florian 19.11.2026: „Tag und Uhrzeit eintragen“), auch ohne Uhrzeit am Termin
  await A.click('[data-route^="Marktplatz"]');await A.waitForSelector('#mbox');await A.click('#mbox [data-routeearly=own]');await A.waitForTimeout(200);
  r.ownD=await A.$eval('#routed',e=>e.value);await A.fill('#routet','11:05');await A.waitForTimeout(100);r.ownTxt=await A.$eval('#mbox .routearr',e=>e.innerText.replace(/\s+/g,' '));
  if(out)await A.screenshot({path:out+'/route-selbst-waehlen.png'});
  await A.click('#mbox [data-routefrom=hier]');await A.waitForTimeout(200);
  r.open=await A.evaluate(()=>window.__open);
  console.error(JSON.stringify(r),errs);
  const path=s=>'https://www.google.com/maps/dir/'+encodeURIComponent('Beispielweg 2, Testdorf')+'/'+encodeURIComponent('Musterstraße 1, Musterstadt')+'/data=!4m6!4m5!2m3!6e1!7e2!8j'+s+'!3e3';
  const hier=(s,d)=>'https://www.google.com/maps/dir//'+encodeURIComponent(d||'Musterstraße 1, Musterstadt')+'/data=!4m6!4m5!2m3!6e1!7e2!8j'+s+'!3e3';
  const ok=!errs.length&&r.calc===1795271400&&/Weg zu Musterstraße/.test(r.txt)&&/Termin: Kindergeburtstag/.test(r.txt)&&/Ankunft spätestens .*, 14:20/.test(r.txt)&&r.chips.join()==='pünktlich,10 Min früher*,20 Min früher,ohne Zeit,✏️ Selbst wählen'
    &&r.open.length===6&&r.open[0]===path(sec-600)&&r.open[1]===hier(sec-600)&&/, 14:30/.test(r.txt0)&&r.open[2]===path(sec)&&r.keep==='0'
    &&/api=1/.test(r.open[3])&&/origin=Beispielweg/.test(r.open[3])&&/Ohne Ankunftszeit/.test(r.plain)&&r.pchips.join()==='ohne Zeit*,✏️ Selbst wählen'&&r.ownD===day(5)&&/Ankunft spätestens .*, 11:05/.test(r.ownTxt)&&r.open[5]===hier(Date.UTC(...day(5).split('-').map((x,i)=>i===1?x-1:+x),11,5)/1000,'Marktplatz, Musterstadt')&&/api=1/.test(r.open[4])&&/destination=Marktplatz/.test(r.open[4]);
  console.error(ok?'ROUTE2 OK':'ROUTE2 FAIL');await b.close();srv.close();process.exit(0)});
