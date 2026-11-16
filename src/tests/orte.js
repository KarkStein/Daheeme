srv.listen(8765,async()=>{
  // Gespeicherte Orte und Arten von Terminen (Florian 16.11.2026): Ort mit Adresse anlegen, Art Kita zieht den Ort Kita, 🚆 nimmt die Adresse, 🎒 im Kalender, eigene Art
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await A.evaluate(()=>{window.__opened=[];window.open=u=>{window.__opened.push(u);return null}});
  // 1) Ort in den Einstellungen anlegen
  await A.click('[data-go=settings]');await A.waitForTimeout(300);await A.click('[data-setsum=ort]');await A.waitForTimeout(200);await A.click('#set-ort [data-placenew]');await A.waitForSelector('#mbox [data-ebf=name]');
  await A.fill('#mbox [data-ebf=name]','Kita');await A.fill('#mbox [data-ebf=addr]','Teststraße 1, Musterstadt');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);
  r.place=Object.values(db().place||{}).map(p=>p.name+'|'+p.addr).join();r.list=await A.$eval('#set-ort',e=>/📍 Kita/.test(e.innerText)&&!/Teststraße/.test(e.innerText));
  // 2) Termin: Art Kita zieht den Ort
  await nav('woche|wp:3');await A.evaluate(()=>{const b=document.createElement("button");b.dataset.act="ternew";b.id="zn";document.getElementById("app").appendChild(b)});await A.click('#zn');await A.waitForTimeout(300);
  await A.fill('#ter-name','Elterngespräch');await A.click('[data-tertag=kita]');await A.waitForTimeout(200);r.autoPlace=await A.$eval('[data-terf=place]',e=>e.value);
  await A.screenshot({path:out+'/termin-art-und-ort.png',fullPage:true});
  await A.click('#terform button[type=submit]');await A.waitForTimeout(500);const T=Object.values(db().termin||{})[0];r.saved=[T.tag,T.place].join();
  // 3) Kalender: 🎒 und 🚆 mit Adresse erst beim Tipp
  await A.click('[data-calview=liste]');await A.waitForTimeout(300);r.icon=await A.$eval('.evlist li[data-who] .ev',e=>e.innerText.includes('🎒'));r.noAddr=await A.$eval('#app',e=>!/Teststraße/.test(e.innerHTML));
  await A.click('.evlist [data-route]');await A.waitForSelector('#mbox [data-routefrom]');r.title=await A.$eval('#mbox h2',e=>e.innerText);await A.click('#mbox [data-routefrom=hier]');await A.waitForTimeout(200);r.url=await A.evaluate(()=>window.__opened[0]||'');
  // 4) Kita-Filter blendet Kita-Termine mit aus
  await A.click('[data-act=calfilt]');await A.waitForTimeout(200);await A.click('[data-caloff=kita]');await A.waitForTimeout(300);r.hidden=await A.$$eval('.evlist .ev',l=>!l.some(x=>/Elterngespräch/.test(x.innerText)));await A.click('[data-caloff=kita]');await A.waitForTimeout(200);
  // 5) Eigene Art
  const id=Object.keys(db().termin)[0];await A.click(`[data-teredit="${id}"]`);await A.waitForTimeout(300);await A.click('[data-catman=ter]');await A.waitForSelector('#mbox [data-catnm]');await A.fill('#mbox [data-catic]','🏊');await A.fill('#mbox [data-catnm]','Schwimmen');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);await A.click('#mbox [data-catx]');await A.waitForTimeout(200);
  r.own=await A.$$eval('[data-tertag]',l=>l.map(x=>x.innerText).join('|'));
  // 6) Vorschlag: Termin ohne Ort mit Art Arzt bekommt 📍, Kita-Termin der Kita-Seite bekommt 🚆
  await A.click('#terform [data-act=tercancel]').catch(()=>{});await A.waitForTimeout(200);
  const t2=new Date();t2.setDate(t2.getDate()+2);const k2=t2.getFullYear()+'-'+String(t2.getMonth()+1).padStart(2,'0')+'-'+String(t2.getDate()).padStart(2,'0');
  await fetch('http://localhost:8765/haushalt/'+key+'/food/termin/a1.json',{method:'PUT',body:JSON.stringify({name:'Kinderarzt U7',date:k2,tag:'arzt',at:1})});
  await fetch('http://localhost:8765/haushalt/'+key+'/food/kita/k1.json',{method:'PUT',body:JSON.stringify({name:'Laternenfest',sec:'termine',date:k2})});await A.waitForTimeout(500);
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  r.kitaRoute=await A.$$eval('.evlist li',l=>l.some(x=>/Laternenfest/.test(x.innerText)&&x.querySelector('[data-route]')));
  await A.click('[data-placeask=a1]');await A.waitForSelector('#mbox [data-plnew]');await A.screenshot({path:out+'/ort-vorschlag.png'});await A.click('#mbox [data-plnew]');await A.waitForSelector('#mbox [data-ebf=name]');
  await A.fill('#mbox [data-ebf=name]','Kinderarzt');await A.fill('#mbox [data-ebf=addr]','Beispielweg 2');await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  r.asked=[db().termin.a1.place,Object.values(db().place).length].join();
  await fetch('http://localhost:8765/haushalt/'+key+'/food/termin/a2.json',{method:'PUT',body:JSON.stringify({name:'Geburtstag Oma',date:k2,tag:'feier',at:2})});await A.waitForTimeout(500);await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  await A.click('[data-placeask=a2]');await A.waitForSelector('#mbox [data-plnew]');await A.click('#mbox [data-plnew]');await A.waitForSelector('#mbox [data-ebf=addr]');
  await A.fill('#mbox [data-ebf=addr]','Gartenweg 5');await A.click('#mbox [data-ebk=keep][data-ebv=einmal]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  r.once=[db().termin.a2.place,Object.values(db().place).length].join();
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.place==='Kita|Teststraße 1, Musterstadt'&&r.list&&r.autoPlace==='Kita'&&r.saved==='kita,Kita'&&r.icon&&r.noAddr&&/Kita/.test(r.title)&&/Teststra/.test(decodeURIComponent(r.url))&&r.hidden&&/🏊 Schwimmen/.test(r.own)&&r.kitaRoute&&r.asked==='Kinderarzt,2'&&r.once==='Gartenweg 5,2';
  console.error(ok?'ORTE OK':'ORTE FAIL');await b.close();srv.close();process.exit(0)});
