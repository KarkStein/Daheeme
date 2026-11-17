srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  await A.click('.spot[data-go=spiel]');const secs=await A.$$eval('[data-playsec]',l=>l.map(x=>x.dataset.playsec).filter(Boolean));
  await A.click('[data-playsec=zuhause]');await A.click('[data-act=playnew]');
  await A.fill('#pl-link0','https://www.familie.de/spielideen/hoehle-bauen-aus-decken-12345.html');await A.waitForTimeout(100);
  const nm=await A.$eval('#pl-name',e=>e.value);await A.screenshot({path:out+'/link.png',fullPage:true});
  await A.click('[data-act=playsave]');await A.waitForTimeout(300);const has=await A.$$eval('.playcard .mk a.catbtn',l=>l.map(x=>x.href));
  console.log(secs,nm,has,errs);console.log(!errs.length&&secs.join()==='zuhause,sport,sonst'&&nm==='Hoehle bauen aus decken'&&has.length===1?'LINK OK':'LINK FAIL');await b.close();srv.close();process.exit(0)});
