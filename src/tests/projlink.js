srv.listen(8765,async()=>{
  // Projekt-Funde (Florian 16.11.2026): ✎ bearbeitet, ✕ fragt (nur aus dem Projekt / ganz löschen), Zeigen bei Geschenke und zurück (seit 17.11.2026 ohne Kopie, Feld show),
  // Vorschlag nach dem Anlegen, eigenes Symbol, Spielsachen gehen in Geschenke auf
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await put('food/hproj/h1',{name:'Kinderzimmer',emo:'🧸',cat:'wohnen',state:'aktuell',at:1});
  await put('food/fund/f1',{name:'Zelt aufgebaut lassen',kind:'sonst',st:'idee',area:'haus',proj:'h1',at:1});
  await put('food/buy/b1',{name:'Holzeisenbahn',list:'spiel',done:false,at:1});await A.waitForTimeout(500);
  await nav('amhaus|pf:wohnen');await A.click('[data-hproj=h1]');await A.waitForTimeout(300);
  // neuer Fund mit Link: Art Spielzeug erkannt, Vorschlag Geschenke per Toast
  await A.fill('#hpfundform .fn','https://www.example.com/tonies/toniebox-2-meeresgruen');await A.press('#hpfundform .fn','Enter');await A.waitForTimeout(500);
  r.toast=await A.$eval('#toast',e=>e.innerText);await A.click('#toast .toastbtn');await A.waitForTimeout(600);
  let F=Object.entries(db().fund||{}).map(([id,x])=>Object.assign({id},x)).find(x=>/oniebox/i.test(x.name));r.kind=F&&F.kind;r.gift=F&&F.show;
  // ✎ am Zelt: Name ändern, Art, Preis, auch bei Geschenke für Kind
  await A.click('[data-fundedit=f1]');await A.waitForTimeout(200);await A.fill('#mbox [data-ebf=name]','Zelt im Garten');await A.click('#mbox [data-ebk=kind][data-ebv=spielzeug]');await A.fill('#mbox [data-ebf=price]','49,90');
  await A.click('#mbox [data-ebm=links][data-ebv=geschenke]');await A.click('#mbox [data-ebk=who][data-ebv=kid]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(700);
  const f1=db().fund.f1;r.edit=[f1.name,f1.kind,f1.price].join('/');r.gift1=[f1.who,f1.show].join('/');r.noCopy=!Object.values(db().idea||{}).some(x=>/Zelt|oniebox/i.test(x.name));
  // Geschenke-Seite zeigt beide, mit Hinweis aufs Projekt
  await nav('projekte|pf:geschenk');r.gpage=await A.$eval('#app',e=>e.innerText);
  // Abwählen nimmt die Geschenk-Idee wieder weg
  await nav('amhaus|pf:wohnen');if(await A.$('[data-hproj=h1]'))await A.click('[data-hproj=h1]');await A.waitForTimeout(300);await A.click('[data-fundedit=f1]');await A.waitForTimeout(200);await A.click('#mbox [data-ebm=links][data-ebv=geschenke]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);
  r.unlinked=!db().fund.f1.show;
  // ✕: nur aus dem Projekt nehmen, Eintrag bleibt in der Sammlung
  await A.click('[data-fundrm=f1]');await A.waitForTimeout(200);r.ask=await A.$eval('#mbox',e=>e.innerText);await A.click('#mbox [data-ebdel="0"]');await A.waitForTimeout(500);
  r.kept=!!db().fund.f1&&!db().fund.f1.proj;
  // ✕ an der Toniebox: ganz löschen nimmt auch die Geschenk-Idee mit (mit Rückfrage)
  await A.click(`[data-fundrm=${F.id}]`);await A.waitForTimeout(200);await A.click('#mbox [data-ebdel="1"]');await A.waitForTimeout(100);r.sure=await A.$eval('#mbox [data-ebdel="1"]',e=>e.innerText);await A.click('#mbox [data-ebdel="1"]');await A.waitForTimeout(600);
  r.gone=!db().fund[F.id];
  // eigenes Symbol
  await A.fill('[data-hpf=emo]','🦖');await A.press('[data-hpf=emo]','Tab');await A.waitForTimeout(400);r.emo=db().hproj.h1.emo;
  // Spielsachen: alte Einträge stehen jetzt bei Geschenke, für das Kind
  const b1=db().buy.b1;r.mig=[b1.list,b1.for].join('/');await nav('listen|bl:geschenke');r.lists=await A.$$eval('.buylist h2',l=>l.map(x=>x.innerText).join('|'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Geschenke/.test(r.toast)&&r.kind==='spielzeug'&&/geschenke/.test(r.gift||'')&&r.edit==='Zelt im Garten/spielzeug/49,90'&&r.gift1==='kid/geschenke'&&r.noCopy&&/Zelt im Garten/.test(r.gpage)&&/Kinderzimmer/.test(r.gpage)&&r.unlinked&&/Nur aus dem Projekt nehmen/.test(r.ask)&&r.kept&&/Wirklich/.test(r.sure)&&r.gone&&r.emo==='🦖'&&r.mig==='geschenke/kid'&&!/Spielsachen/.test(r.lists);
  console.error(ok?'PROJLINK OK':'PROJLINK FAIL');await b.close();srv.close();process.exit(0)});
