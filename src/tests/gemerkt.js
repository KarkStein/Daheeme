srv.listen(8765,async()=>{
  // Gemerktes vernetzen (Florian 17.11.2026: „Einmal ablegen? Überall finden“): Feld show, Gäste-Zeilen, ein Fenster, alte Kopien werden zusammengeführt
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:740},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  // Alter Zustand: Fund im Am-Haus-Projekt mit Kopie bei Geschenke (für das Kind, Favorit)
  await put('hproj/h1',{name:'Kinderzimmer',emo:'🛋️',cat:'wohnen',state:'aktuell',at:1});
  await put('idea/p1',{name:'Hörbox',cat:'geschenk',state:'favorit',who:'kid',for:'Weihnachten',ref:'fund:f1',at:2});
  await put('fund/f1',{name:'Hörbox',area:'haus',kind:'aufbew',st:'idee',proj:'h1',links:{geschenk:'p1'},at:2});
  await put('play/s1',{name:'Kneten',sec:'zuhause',at:3});
  await put('music/m1',{name:'Tonie Raupe',art:'hoer',st:'idee',at:4});
  await A.waitForTimeout(900);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  // 1. Kopie ist weg, der Fund trägt alles
  const f=()=>db().fund.f1;r.mig=[!(db().idea||{}).p1,f().show,f().who,f().st,f().note,!(f().links||{}).geschenk].join('|');
  // 2. Geschenke zeigt den Fund als eine Zeile
  await nav('geschenke|');r.gesch=await A.$$eval('.gmg',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));
  // 3. Fenster von dort: Spielen und Hörspiele dazu wählen
  await A.click('.gmg [data-gmedit]');await A.waitForSelector('#mbox');r.box=await A.$$eval('#mbox [data-ebm=links]',l=>l.map(x=>x.innerText+(x.getAttribute('aria-pressed')==='true'?'*':'')));
  await A.click('#mbox [data-ebm=links][data-ebv=spiel]');await A.click('#mbox [data-ebm=links][data-ebv=hoer]');if(out)await A.screenshot({path:out+'/gm-fenster.png'});await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);r.show=f().show;
  // 4. Spielen, Musik, Kind, Sammlung
  await nav('spiel|');r.spiel=await A.$$eval('.playcard .mk .mkt b',l=>l.map(x=>x.innerText));r.spHead=await A.$eval('.playcard h2',e=>e.innerText);
  if(out)await A.screenshot({path:out+'/gm-spielen.png'});
  // Schild schaltet den einen Stand: Favorit → Geplant
  await A.click('.playcard .gmg [data-gmst]');await A.waitForTimeout(400);r.st=f().st;
  await nav('musik|ma:hoer');r.mus=await A.$$eval('.muscard .mk .mkt b',l=>l.map(x=>x.innerText));
  await nav('kind|kf:kid_gm');r.kind=await A.$$eval('.kidcard .gmg .mkt b',l=>l.map(x=>x.innerText));if(out)await A.screenshot({path:out+'/gm-kind.png'});
  await nav('listen|bl:geschenke');r.buy=await A.$$eval('[data-gmdone]',l=>l.length);
  await nav('projekte|');r.samm=(await A.$$eval('.sammcard .mk b',l=>l.map(x=>x.innerText))).filter(x=>x==='Hörbox').length;
  // 5. Spielidee in der großen Maske auch bei Kind zeigen; in Kind steht sie, das Fenster dort ändert den Namen
  await nav('spiel|');await A.click('[data-playedit=s1]');await A.click('[data-gmshow="play|s1|kind"]');await A.waitForTimeout(400);r.ps=db().play.s1.show;r.draft=!!(await A.$('#pl-name'));
  await A.click('[data-act=playcancel]');await nav('kind|kf:kid_gm');r.kind2=await A.$$eval('.kidcard .gmg .mkt b',l=>l.map(x=>x.innerText));
  await A.click('[data-gmedit="play|s1"]');await A.waitForSelector('#mbox');await A.fill('#mbox [data-ebf=name]','Kneten am Tisch');await A.click('#mbox [data-ebk=who][data-ebv=kid]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  r.s1=[db().play.s1.name,db().play.s1.who,db().play.s1.show].join('|');
  // 6. Abwählen nimmt es dort weg; neuer Eintrag mit Vorschlag
  await nav('geschenke|');await A.click('.gmg [data-gmedit]');await A.click('#mbox [data-ebm=links][data-ebv=geschenke]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);r.off=[f().show,(await A.$$('.gmg')).length].join('|');
  await nav('musik|');await A.fill('#musin','Tonie Bobo');await A.click('#musform button[type=submit]');await A.waitForTimeout(500);r.toast=await A.$eval('#toast',e=>e.innerText);
  const tb=await A.$('#toast .toastbtn');if(tb){await tb.click();await A.waitForTimeout(500)}const nm=Object.values(db().music).find(x=>x.name==='Tonie Bobo');r.neu=nm&&nm.show;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.mig==='true|geschenke|kid|favorit|Weihnachten|true'&&r.gesch.length===1&&/Hörbox/.test(r.gesch[0])&&/Kinderzimmer/.test(r.gesch[0])&&/Favorit/.test(r.gesch[0])
    &&r.box.some(x=>/Geschenke\*/.test(x))&&r.box.some(x=>/Spielen$/.test(x))&&r.show==='geschenke,spiel,hoer'&&r.spiel.join()==='Kneten,Hörbox'&&/\(2\)/.test(r.spHead)&&r.st==='geplant'
    &&r.mus.join()==='Tonie Raupe,Hörbox'&&r.kind.join()==='Hörbox'&&r.buy===1&&r.samm===1&&r.ps==='kind'&&r.draft&&r.kind2.includes('Kneten')&&r.s1==='Kneten am Tisch|kid|kind'
    &&r.off==='spiel,hoer|0'&&/Auch zeigen bei/.test(r.toast)&&/geschenke/.test(r.neu||'')&&/kind/.test(r.neu||'');
  console.error(ok?'GEMERKT OK':'GEMERKT FAIL');await b.close();srv.close();process.exit(0)});
