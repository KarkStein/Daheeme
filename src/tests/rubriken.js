srv.listen(8765,async()=>{
  // Eigene Rubriken und Symbole (Florian 16.11.2026, „Alle ja“): Spiel, Ausflug-Arten, Sammlung, Ideen-Kacheln; Symbol an Ausflug, Spielidee, Geschenk-Idee, Adventskalender, Packliste; 🚆 beim Mittagessen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const addCat=async(ic,nm)=>{await A.waitForSelector('#mbox [data-catnm]');await A.fill('#mbox [data-catic]',ic);await A.fill('#mbox [data-catnm]',nm);await A.click('#mbox button[type=submit]');await A.waitForTimeout(400)};
  const close=async()=>{await A.click('#mbox [data-catx]');await A.waitForTimeout(200)};
  // 1) Spiel: eigene Rubrik als Abschnitt
  await nav('spiel|');await A.click('[data-catman=play]');await addCat('🎨','Basteln');await A.screenshot({path:out+'/rubrik-anlegen.png'});await close();
  const pid=Object.keys((db().cats||{}).play||{})[0];r.playChip=await A.$$eval('[data-playsec]',l=>l.map(x=>x.innerText).join('|'));
  await A.click(`[data-playsec="${pid}"]`);await A.waitForTimeout(200);await A.click('[data-act=playnew]');await A.fill('#pl-name','Fingerfarben');await A.fill('[data-plf=emo]','🖐️');await A.click('[data-act=playsave]');await A.waitForTimeout(400);
  const P=Object.values(db().play||{}).find(x=>x.name==='Fingerfarben');r.play=P&&[P.sec===pid,P.emo].join();r.playList=await A.$eval('#app',e=>/🖐️ Fingerfarben/.test(e.innerText));
  // 2) Ausflug: eigene Art + Symbol
  await nav('ausflug|tt:ideen');await A.click('[data-act=tripnew]');await A.waitForTimeout(200);await A.click('[data-catman=trip]');await addCat('🏰','Burgen');await close();
  const tid=Object.keys((db().cats||{}).trip||{})[0];await A.fill('#tr-name','Burg Test');await A.fill('[data-tf=emo]','🏰');await A.click(`[data-tset][data-v="${tid}"], [data-v="${tid}"]`);await A.click('[data-act=tripsave]');await A.waitForTimeout(400);
  const T=Object.values(db().trip||{}).find(x=>x.name==='Burg Test');r.trip=T&&[T.kind===tid,T.emo].join();r.tripTag=await A.$eval('#app',e=>/🏰 Burgen/.test(e.innerText)&&/🏰 Burg Test/.test(e.innerText));
  // 3) Sammlung Reisen: eigene Art erscheint im Filter
  await nav('ausflug|tt:recherche');await A.click('[data-catman=fund]');await addCat('🧭','Souvenirs');await close();r.fund=await A.$eval('#app',e=>/Souvenirs/.test(e.innerText));
  // 4) Ideen: eigene Kachel, Geschenk-Idee mit Symbol
  await nav('projekte|');await A.click('[data-catman=idea]');await addCat('💍','Hochzeit');await close();r.tile=await A.$eval('#app',e=>/Hochzeit/.test(e.innerText));
  const iid=Object.keys((db().cats||{}).idea||{})[0];await A.click(`[data-pfilter="${iid}"]`);await A.waitForTimeout(300);r.tileOpen=await A.$eval('#app h2',e=>e.innerText);
  // Löschen setzt Einträge zurück
  await put('food/idea/i1',{name:'Ringe',cat:iid,at:1});await A.waitForTimeout(300);
  await A.click('[data-pfilter=""]').catch(()=>{});await A.waitForTimeout(200);await A.click('[data-catman=idea]');await A.waitForSelector('#mbox [data-catrm]');await A.click('#mbox [data-catrm]');await A.click('#mbox [data-catrm]');await A.waitForTimeout(500);await close();
  r.ideaBack=(db().idea||{}).i1&&db().idea.i1.cat;r.tileGone=await A.$eval('#app',e=>!/Hochzeit/.test(e.innerText));
  await put('food/idea/g1',{name:'Buch',cat:'geschenk',state:'idee',at:1});await A.waitForTimeout(300);
  await nav('projekte|pf:geschenk');await A.click('[data-projedit=g1]');await A.waitForTimeout(200);await A.fill('[data-pf=emo]','📚');await A.click('[data-act=projsave]');await A.waitForTimeout(400);r.gift=db().idea.g1.emo;
  // 5) Packliste: Name und Symbol
  await put('food/packlist/l2',{name:'Sommer',at:2});await A.waitForTimeout(300);await nav('ausflug|tt:pack');await A.click('[data-packlist=l2]');await A.waitForTimeout(200);await A.click('[data-act=packlistren]');await A.waitForSelector('#mbox [data-ebf=emo]');await A.fill('#mbox [data-ebf=emo]','☀️');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);
  r.pack=db().packlist.l2.emo;r.packChip=await A.$eval('[data-packlist=l2]',e=>e.innerText);
  // 6) Adventskalender: Name und Symbol
  await nav('projekte|pf:advent');await A.click('[data-advnew]');await A.waitForTimeout(400);await A.click('[data-advren]');await A.waitForSelector('#mbox [data-ebf=emo]');await A.fill('#mbox [data-ebf=emo]','⭐');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);
  r.adv=Object.values(db().advent||{}).map(x=>x.emo).join();r.advHead=await A.$eval('#app',e=>/⭐ Adventskalender/.test(e.innerText));
  // 7) Mittagessen: 🚆
  await put('food/lunch/x1',{name:'Pizzeria Test',at:1});await A.waitForTimeout(300);await nav('privat|');r.lunch=await A.$$eval('[data-route]',l=>l.map(x=>x.dataset.route));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Basteln/.test(r.playChip)&&r.play==='true,🖐️'&&r.playList&&r.trip==='true,🏰'&&r.tripTag&&r.fund&&r.tile&&/Hochzeit/.test(r.tileOpen)&&r.ideaBack==='sonst'&&r.tileGone&&r.gift==='📚'&&r.pack==='☀️'&&/☀️ Sommer/.test(r.packChip)&&r.adv==='⭐'&&r.advHead&&r.lunch.includes('Pizzeria Test');
  console.error(ok?'RUBRIKEN OK':'RUBRIKEN FAIL');await b.close();srv.close();process.exit(0)});
