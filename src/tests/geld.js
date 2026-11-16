srv.listen(8765,async()=>{
  // Geld-Bereich: Rechnen (Cent, Anteile, Stand), Schnell eintragen, Maske, Ausgleichen, Monat und Filter, Gehört zu
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));await A.clock.setFixedTime(new Date('2026-11-16T18:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food','money'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  // Rechnen
  r.calc=await A.evaluate(()=>{const {parseEur,geldShare,geldBal,eur}=window.Geld;return [parseEur('12,50'),parseEur('12.5'),parseEur('1.234,56'),parseEur('7 €'),parseEur('abc'),parseEur('0'),parseEur('3,333'),
    JSON.stringify(geldShare({amt:1001,split:'half'})),JSON.stringify(geldShare({amt:1000,split:'70'})),JSON.stringify(geldShare({amt:999,split:'p1'})),
    geldBal([{amt:1000,by:'p0',split:'half'},{amt:600,by:'p1',split:'p0'},{amt:300,by:'p1',split:'half'}]),
    geldBal([{amt:1000,by:'p0',split:'half'},{amt:500,by:'p1',kind:'settle'}]),eur(123456)].join('|')});
  await put('food/urlaub/u1',{name:'Bretagne',state:'aktuell',emo:'⛵',at:1});await A.waitForTimeout(300);
  await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);r.h1=await A.$eval('#app h1',e=>e.innerText);
  r.quitt=await A.$eval('.geldbig',e=>e.innerText);
  await A.fill('#geldq','23,50 Rewe');await A.press('#geldq','Enter');await A.waitForTimeout(400);
  const q=Object.values(db())[0]||{};r.quick=[q.name,q.amt,q.by,q.split,q.cat,q.date].join();
  r.bal1=await A.$eval('.geldbig',e=>e.innerText);
  // Maske: Judith zahlt Hotel 200 €, 70 % für p0, gehört zum Urlaub
  await A.click('[data-gact=new]');await A.fill('[data-gf=amt]','200');await A.fill('[data-gf=name]','Hotel');await A.click('[data-gby=p1]');await A.click('[data-gsplit=pct]');await A.fill('[data-gf=pct]','70');await A.click('[data-gdate="2026-11-15"]');
  await A.screenshot({path:out+'/geld-maske.png'});
  await A.click('#geldform button[type=submit]');await A.waitForTimeout(400);
  const h=Object.values(db()).find(x=>x.name==='Hotel')||{};r.hotel=[h.amt,h.by,h.split,h.cat,h.ref,h.date].join();
  // Stand: p0 bekommt 11,75 von p1; p1 bekommt 140 von p0 → p0 schuldet 128,25
  r.bal2=await A.$eval('.geldbig',e=>e.innerText);
  await A.screenshot({path:out+'/geld-uebersicht.png',fullPage:true});
  await A.click('[data-gact=settle]');r.settleAmt=await A.$eval('[data-gf=amt]',e=>e.value);r.settleBy=await A.$eval('[data-gby][aria-pressed=true]',e=>e.dataset.gby);
  await A.click('#geldform button[type=submit]');await A.waitForTimeout(400);r.bal3=await A.$eval('.geldbig',e=>e.innerText);
  // Liste, Monat, Filter
  await A.click('[data-gtab=liste]');await A.waitForTimeout(200);r.rows=await A.$$eval('.geldrow',l=>l.length);r.sum=await A.$eval('.btnrow .freq b',e=>e.innerText);
  await A.click('[data-gfcat=urlaub]');await A.waitForTimeout(200);r.rowsCat=await A.$$eval('.geldrow',l=>l.map(x=>x.innerText.split('\n')[1]).join());
  await A.screenshot({path:out+'/geld-liste.png',fullPage:true});
  await A.click('[data-gmon="-1"]');await A.waitForTimeout(200);r.empty=!!(await A.$('.empty'));await A.click('[data-gmon="1"]');await A.click('[data-gfcat=urlaub]');
  // Bearbeiten und löschen
  await A.click('.geldrow [data-geldedit]');await A.fill('[data-gf=amt]','30');await A.click('#geldform button[type=submit]');await A.waitForTimeout(300);
  r.edited=Object.values(db()).map(x=>x.amt).sort((a,b)=>a-b).join();
  const n0=Object.keys(db()).length;await A.click('.geldrow [data-geldedit]');await A.click('[data-gact=del]');await A.click('[data-gact=del]');await A.waitForTimeout(300);r.del=n0-Object.keys(db()).length;
  // Urlaub löschen nimmt nur die Zuordnung weg
  await A.evaluate(()=>window.Geld.dropRef('urlaub:u1'));await A.waitForTimeout(300);r.refGone=Object.values(db()).every(x=>!x.ref);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.calc==='1250|1250|123456|700||||{"p0":501,"p1":500}|{"p0":700,"p1":300}|{"p0":0,"p1":999}|-250|0|1.234,56 €'&&r.h1==='Ausgaben'&&/quitt/.test(r.quitt)
    &&r.quick==='Rewe,2350,p0,half,essen,2026-11-16'&&/Du bekommst 11,75 €/.test(r.bal1)&&r.hotel==='20000,p1,70,urlaub,,2026-11-15'&&/bekommt 128,25 € von dir/.test(r.bal2)
    &&r.settleAmt==='128,25'&&r.settleBy==='p0'&&/quitt/.test(r.bal3)&&r.rows===3&&/223,50/.test(r.sum)&&r.rowsCat.split(',').length===1&&r.empty&&r.del===1&&r.refGone;
  console.error(ok?'GELD OK':'GELD FAIL');await b.close();srv.close();process.exit(0)});
