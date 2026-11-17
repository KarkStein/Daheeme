srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const r={};
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);
  r.n=await A.$$eval('.wt .tlink[data-go=einkauf]',l=>l.length);
  await A.addStyleTag({content:'#tabs{display:none!important}'});
  const el=await A.$('.wt .tlink[data-go=einkauf]');await el.scrollIntoViewIfNeeded();await A.waitForTimeout(300);const box=await (await el.evaluateHandle(e=>e.closest('.wt'))).asElement().boundingBox();
  await A.screenshot({path:out+'/einkaufen-link.png',clip:{x:0,y:box.y-10,width:400,height:box.height+20}});
  await el.click();await A.waitForTimeout(400);r.h=await A.$eval('#app h1',e=>e.innerText);
  await A.click('#tabs [data-tab=woche]').catch(()=>{});
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:1";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(300);
  await A.click('[data-wmwwho=alle]');await A.waitForTimeout(200);r.wl=await A.$$eval('.wmwrow .tlink',l=>l.length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.n>=1&&r.h==='Einkauf'&&r.wl>=1;
  console.error(ok?'TL OK':'TL FAIL');await b.close();srv.close();process.exit(0)});
