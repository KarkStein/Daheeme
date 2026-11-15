srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();await p.clock.setFixedTime(new Date('2026-11-14T12:00:00'));p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const link=A.url();const B=await mk();await B.goto(link.replace('/#','/?bild=haus#'));await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  const tabs=await A.$$eval('#tabs button',l=>l.filter(x=>!x.hidden).map(x=>x.dataset.tab));console.log('tabs',tabs);
  // Packliste: neue Liste "Strand"
  await A.click('.spot[data-go=ausflug]');await A.click('[data-trip=pack]');
  for(const n of ['Wasser','Brotzeit']){await A.click(`[data-packadd="${n}"]`);await A.waitForTimeout(150)}
  await A.click('[data-act=packlistnew]');await A.fill('#packlistinput','Strand');await A.press('#packlistinput','Enter');await A.waitForTimeout(300);
  for(const n of ['Sonnencreme','Mütze']){await A.click(`[data-packadd="${n}"]`);await A.waitForTimeout(150)}
  await A.fill('#packinput','Sandspielzeug');await A.press('#packinput','Enter');await A.waitForTimeout(300);
  await A.click('[data-pack]');await A.waitForTimeout(300);
  await A.screenshot({path:out+'/pack.png',fullPage:true});
  // Ideen-Maske
  await A.click('[data-trip=ideen]');await A.click('[data-act=tripnew]');
  await A.fill('#tr-name','Strand von Kerlouan');await A.click('[data-tset=kind][data-v=wasser]');await A.click('[data-tset=dur][data-v=ganz]');
  await A.fill('#tr-drive','40');await A.click('[data-ttog=kid][data-v=wagen]');await A.click('[data-ttog=kid][data-v=einkehr]');await A.click('[data-tset=cost][data-v="0"]');
  await A.click('[data-ttog=season][data-v=summer]');
  const strand=await A.$$eval('[data-tset=pack]',l=>l.map(x=>x.textContent));await A.click('[data-tset=pack]:nth-of-type(2)');
  await A.fill('#tr-note','Parkplatz direkt am Strand. Ebbe-Zeiten vorher nachsehen.');
  await A.screenshot({path:out+'/maske.png',fullPage:true});
  await A.click('[data-act=tripsave]');await A.waitForTimeout(400);
  await A.click('[data-act=tripnew]');await A.fill('#tr-name','Aquarium Brest');await A.click('[data-tset=kind][data-v=tiere]');await A.click('[data-tset=wx][data-v=egal]');await A.click('[data-tset=dur][data-v=halb]');await A.click('[data-tset=cost][data-v="2"]');await A.click('[data-act=tripsave]');await A.waitForTimeout(400);
  await B.click('.brandbtn');await B.click('.spot[data-go=ausflug]');await B.waitForSelector('text=Aquarium Brest');await B.waitForSelector('text=Strand von Kerlouan');
  await B.click('[data-tfilter=regen]');const shown=await B.$$eval('ul.shop .nm',l=>l.map(x=>x.textContent));console.log('regen',shown);
  await B.click('[data-tfilter=""]');await B.waitForTimeout(200);
  await B.screenshot({path:out+'/ideen.png',fullPage:true});
  await B.click('[data-gopack]');const pl=await B.$eval('[data-packlist][aria-pressed=true]',e=>e.textContent);console.log('gopack',pl);
  // Essen-Reiter mit Einkauf
  await A.click('[data-tab=essen]');await A.click('#tabs [data-tab=einkauf]');const sel=await A.$eval('#tabs [aria-selected=true]',e=>e.dataset.tab);console.log('einkauf markiert',sel);
  await A.screenshot({path:out+'/einkauf.png'});
  console.log('pack strand',strand);
  const ok=!errs.length&&tabs.join()==='camp,woche,essen,einkauf'&&shown.length===1&&/Aquarium/.test(shown[0])&&/Strand/.test(pl)&&sel==='einkauf';
  console.log('errs',errs);console.log(ok?'TRIP OK':'TRIP FAIL');await b.close();srv.close();process.exit(0)});
