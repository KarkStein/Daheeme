srv.listen(8765,async()=>{
  // Teilen (Florian 16.11.2026): Wohin damit? Instagram ohne Vorwahl, Beschreibung mit Liste aufteilen, jeder Eintrag mit Link; Verschieben nach
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('food/hproj/h1',{name:'Kinderzimmer',emo:'🧸',cat:'wohnen',state:'aktuell',at:1});await A.waitForTimeout(300);
  const L='https://www.instagram.com/reel/abc123/';
  await A.goto('http://localhost:8765/?su='+encodeURIComponent(L));await A.waitForSelector('#mbox [data-shto]');await A.waitForTimeout(300);
  r.pre=await A.$$eval('#mbox [data-shto][aria-pressed=true]',l=>l.length);r.targets=await A.$$eval('#mbox [data-shto]',l=>l.map(x=>x.dataset.shto));
  r.disabled=await A.$eval('#mbox button[type=submit]',x=>x.disabled);
  await A.fill('#mbox [data-shf=name]','Spielideen für Regentage');await A.click('#mbox [data-shnote]');
  await A.fill('#mbox [data-shf=note]','5 Ideen für drinnen 👇\n1. Deckenburg bauen\n2. Wäscheklammer-Spiel\n3. Zaubersand kneten\n#kinder #spielideen');
  await A.click('#mbox [data-shto=spiel]');await A.waitForTimeout(200);
  r.note=await A.$eval('#mbox [data-shf=note]',x=>x.value.length>0);
  await A.click('#mbox [data-shsplit]');await A.waitForTimeout(200);r.items=await A.$$eval('#mbox [data-shit]',l=>l.map(x=>x.innerText));
  await A.click('#mbox [data-shit="1"]');await A.waitForTimeout(100);
  await A.screenshot({path:out+'/teilen-wohin.png'});
  await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);
  const P=Object.values(db().play||{});r.play=P.map(x=>[x.name,x.sec,x.link].join('|')).sort();r.tab=await A.$eval('#app h1',e=>e.innerText);
  // Einzelner Eintrag in ein Am-Haus-Projekt
  await A.goto('http://localhost:8765/?st='+encodeURIComponent('Hochbett Kiefer')+'&su='+encodeURIComponent('https://example.com/hochbett'));await A.waitForSelector('#mbox [data-shto]');await A.waitForTimeout(300);
  await A.click('#mbox [data-shto="proj:h1"]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);
  const F=Object.entries(db().fund||{});r.fund=F.map(([k,x])=>[x.name,x.area,x.proj,x.link].join('|'));r.hp=await A.$eval('#app',e=>/Hochbett/.test(e.innerText));
  // Verschieben: Fund aus dem Projekt nach Weitere Listen › Geschenke
  const fid=F[0]&&F[0][0];await A.click(`[data-fundedit="${fid}"]`);await A.waitForTimeout(300);
  for(const x of await A.$$('#mbox [data-ebdel]'))if(/Verschieben/.test(await x.innerText())){await x.click();break}
  await A.waitForTimeout(300);r.moveOpts=await A.$$eval('#mbox [data-ebk=to]',l=>l.map(x=>x.dataset.ebv));
  await A.click('#mbox [data-ebv="liste:geschenke"]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);
  r.moved=Object.values(db().buy||{}).map(x=>[x.name,x.list,x.link].join('|'));r.fundGone=!Object.keys(db().fund||{}).length;
  // Verschieben aus einem Formular (Ausflug -> Spielidee)
  await put('food/trip/t1',{name:'Indoorspielplatz',link:'https://example.com/indoor',note:'mit Rutsche',at:1});await A.waitForTimeout(300);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('ausflug|tt:ideen');await A.click('[data-tripedit=t1]');await A.waitForTimeout(300);await A.click('[data-move="trip|t1"]');await A.waitForTimeout(300);
  await A.click('#mbox [data-ebv=spiel]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);
  r.trip=!(db().trip||{}).t1;r.play2=Object.values(db().play||{}).some(x=>x.name==='Indoorspielplatz'&&x.note==='mit Rutsche');
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pre===0&&r.disabled&&r.targets.includes('proj:h1')&&r.targets.includes('liste:geschenke')&&r.items.length===3&&r.play.length===2&&r.play.every(x=>x.endsWith('|zuhause|'+L))&&!r.play.some(x=>/Wäsche/.test(x))&&/Spiel/.test(r.tab)
    &&r.fund.length===1&&r.fund[0]==='Hochbett Kiefer|haus|h1|https://example.com/hochbett'&&r.hp&&!r.moveOpts.includes('proj:h1')&&r.moved[0]==='Hochbett Kiefer|geschenke|https://example.com/hochbett'&&r.fundGone&&r.trip&&r.play2;
  console.error(ok?'SHAREWOHIN OK':'SHAREWOHIN FAIL');await b.close();srv.close();process.exit(0)});
