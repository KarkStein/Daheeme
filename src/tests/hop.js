srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);await A.click('[data-wknav="1"]');await A.waitForTimeout(300);
  const r={};
  // Tipp öffnet die Auswahl (Florian 22.11.2026), lange drücken löscht mit Rückgängig
  await A.click('.slot.hoslot[data-slot="0"]');await A.waitForTimeout(400);await A.click('#mbox [data-hop="p0"]');await A.waitForTimeout(400);r.tap=await A.$eval('.slot.hoslot[data-slot="0"]',e=>e.innerText);
  await A.click('.slot.hoslot[data-slot="1"]');await A.waitForTimeout(250);
  const card=await A.$('#mbox .mboxcard');
  await A.screenshot({path:out+'/hausdienst-auswahl.png'});
  r.order=await A.$$eval('#mbox [data-hop]',l=>l.map(x=>x.dataset.hop).join(','));await A.click('#mbox [data-hop="p1"]');await A.waitForTimeout(400);r.p1=await A.$eval('.slot.hoslot[data-slot="1"]',e=>e.innerText);
  await A.click('.slot.hoslot[data-slot="2"]');await A.waitForTimeout(250);await A.click('#mbox [data-hop="p0|vm"]');await A.waitForTimeout(400);r.half=(await A.$eval('.slot.hoslot[data-slot="2"]',e=>e.innerText)).replace(/\s/g,'');
  await A.click('.slot.hoslot[data-slot="0"]');await A.waitForTimeout(250);await A.click('#mbox [data-hop="clear"]');await A.waitForTimeout(400);r.clear=await A.$eval('.slot.hoslot[data-slot="0"]',e=>e.innerText);
  await A.dispatchEvent('.slot.hoslot[data-slot="3"]','contextmenu');await A.waitForTimeout(250);r.emptyArm=await A.$$eval('#app .hox',l=>l.length);
  await A.dispatchEvent('.slot.hoslot[data-slot="1"]','contextmenu');await A.waitForTimeout(250);r.mboxAfterLp=!!(await A.$('#mbox'));r.arm=await A.$$eval('#app .hox',l=>l.map(x=>x.innerText).join());
  await A.waitForTimeout(800);await A.click('#app .hox');await A.waitForTimeout(500);r.del=await A.$eval('.slot.hoslot[data-slot="1"]',e=>e.innerText);
  await A.click('#toast .toastbtn');await A.waitForTimeout(500);r.undo=(await A.$eval('.slot.hoslot[data-slot="1"]',e=>e.innerText)).replace(/\s/g,'');
  await A.dispatchEvent('.slot.hoslot[data-slot="1"]','contextmenu');await A.waitForTimeout(900);await A.click('h1');await A.waitForTimeout(300);r.disarm=await A.$$eval('#app .hox',l=>l.length);
  await A.addStyleTag({content:'#tabs{display:none!important}'});const el=await A.$('.slot.hoslot[data-slot="1"]');await el.scrollIntoViewIfNeeded();const box=await (await el.evaluateHandle(e=>e.closest('.task')||e.parentElement)).asElement().boundingBox();
  await A.screenshot({path:out+'/hausdienst-tage.png',clip:{x:0,y:Math.max(0,box.y-10),width:400,height:box.height+20}});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.tap==='F'&&r.p1.replace(/\s/g,'')==='J'&&r.order==='p0,p1,p0|vm,p1|vm'&&r.half==='F/J'&&r.clear==='＋'&&r.emptyArm===0&&!r.mboxAfterLp&&/Löschen/.test(r.arm)&&r.del==='＋'&&r.undo==='J'&&r.disarm===0;
  console.error(ok?'HOP OK':'HOP FAIL');await b.close();srv.close();process.exit(0)});
