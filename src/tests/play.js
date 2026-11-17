srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();await p.clock.setFixedTime(new Date('2026-11-14T12:00:00'));p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const link=A.url();const B=await mk();await B.goto(link.replace('/#','/?bild=haus#'));await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  await A.click('.spot[data-go=spiel]');await A.waitForSelector('[data-act=playnew]');
  await A.click('[data-act=playnew]');await A.fill('#pl-name','Wasserspielplatz im Stadtpark');await A.click('[data-plset=age][data-v="1"]');await A.fill('#pl-link','https://maps.app.goo.gl/x');await A.fill('#pl-note','Sandkasten mit Pumpe, Schatten am Nachmittag');await A.click('[data-act=playsave]');await A.waitForTimeout(300);
  await A.click('[data-act=playnew]');await A.fill('#pl-name','Spielplatz am Hafen');await A.click('[data-act=playsave]');await A.waitForTimeout(300);
  await A.click('[data-playst]');await A.waitForTimeout(300);
  await A.click('[data-playsec=zuhause]');await A.click('[data-act=playnew]');await A.fill('#pl-name','Höhle aus Decken bauen');await A.click('[data-plset=wx][data-v=drinnen]');await A.click('[data-plset=age][data-v="2"]');await A.fill('#pl-mat','Decken, Wäscheklammern, Taschenlampe');
  await A.screenshot({path:out+'/maske.png',fullPage:true});
  await A.click('[data-act=playsave]');await A.waitForTimeout(300);
  await B.click('.spot[data-go=spiel]');await B.waitForSelector('text=Wasserspielplatz im Stadtpark');
  await B.screenshot({path:out+'/liste.png',fullPage:true});
  await B.click('[data-playsec=zuhause]');await B.waitForSelector('text=Höhle aus Decken bauen');
  await B.goBack();await B.waitForTimeout(300);const s1=await B.$eval('[data-playsec][aria-pressed=true]',e=>e.dataset.playsec);
  await B.goBack();await B.waitForTimeout(300);const tab=await B.$eval('#tabs [aria-selected=true]',e=>e.dataset.tab);
  console.log('back',s1,tab,'errs',errs);console.log(!errs.length&&s1===''&&tab==='camp'?'PLAY OK':'PLAY FAIL');await b.close();srv.close();process.exit(0)});
