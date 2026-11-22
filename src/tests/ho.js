srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);await A.click('[data-wknav="1"]');await A.waitForTimeout(300);
  await A.click('.slot.hoslot[data-slot="2"]');await A.waitForTimeout(400);await A.click('#mbox [data-hop="p0"]');await A.waitForTimeout(400);
  const rot=await A.$('.slot:not(.hoslot):not([disabled])[data-task]');if(rot)await rot.click();await A.waitForTimeout(300);
  const el=await A.$('.slot.hoslot[data-slot="2"]');await el.scrollIntoViewIfNeeded();
  const box=await (await el.evaluateHandle(e=>e.closest('.task')||e.parentElement)).asElement().boundingBox();
  await A.screenshot({path:out+'/woche-homeoffice.png',clip:{x:0,y:Math.max(0,box.y-60),width:400,height:Math.min(360,box.height+120)}});
  const db=JSON.parse(JSON.stringify(get(['haushalt',key])));const ws=db.weeks||{};const n=Object.values(ws).reduce((a,w)=>a+Object.keys(w.ticks||{}).length,0);
  console.error(n,Object.keys(ws),errs);console.error(!errs.length&&n===1?'HO OK':'HO FAIL');await b.close();srv.close();process.exit(0)});
