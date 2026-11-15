srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);await A.click('[data-wknav="1"]');await A.waitForTimeout(300);
  const r={};
  await A.click('.slot.hoslot[data-slot="0"]');await A.waitForTimeout(400);r.tap=await A.$eval('.slot.hoslot[data-slot="0"]',e=>e.innerText);
  await A.dispatchEvent('.slot.hoslot[data-slot="1"]','contextmenu');await A.waitForTimeout(250);
  const card=await A.$('#mbox .mboxcard');
  await A.screenshot({path:out+'/homeoffice-auswahl.png'});
  r.order=await A.$$eval('#mbox [data-hop]',l=>l.map(x=>x.dataset.hop).join(','));await A.click('#mbox [data-hop="p1|ab"]');await A.waitForTimeout(400);r.p1=await A.$eval('.slot.hoslot[data-slot="1"]',e=>e.innerText);
  await A.dispatchEvent('.slot.hoslot[data-slot="0"]','contextmenu');await A.waitForTimeout(250);await A.click('#mbox [data-hop="clear"]');await A.waitForTimeout(400);r.clear=await A.$eval('.slot.hoslot[data-slot="0"]',e=>e.innerText);
  await A.addStyleTag({content:'#tabs{display:none!important}'});const el=await A.$('.slot.hoslot[data-slot="1"]');await el.scrollIntoViewIfNeeded();const box=await (await el.evaluateHandle(e=>e.closest('.task')||e.parentElement)).asElement().boundingBox();
  await A.screenshot({path:out+'/homeoffice-tage.png',clip:{x:0,y:Math.max(0,box.y-10),width:400,height:box.height+20}});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.tap==='F'&&r.p1.replace(/\s/g,'')==='J1'&&r.order.startsWith('p0,p0|ab,p0|br,p1')&&r.clear==='Mo';
  console.error(ok?'HOP OK':'HOP FAIL');await b.close();srv.close();process.exit(0)});
