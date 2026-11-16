srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T11:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  if(!(await A.$('.camp')))await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(500);
  const el=await A.$('.camp');await el.screenshot({path:out+'/bild-boot.png'});
  await A.goto('http://localhost:8765/?bild=haus'+'#k='+/k=([^&]+)/.exec(A.url())[1]);await A.evaluate(()=>localStorage.setItem('hq-labels','1'));await A.reload();await A.waitForTimeout(800);await (async()=>{if(!(await A.$('.camp')))await A.click('#tabs [data-tab=camp]');})().catch(()=>{});await A.waitForTimeout(400);
  await (await A.$('.camp')).screenshot({path:out+'/bild-boot-labels.png'});
  const r={};r.spots=await A.$$eval('.spot',l=>l.map(x=>x.dataset.go+'/'+(x.getAttribute('aria-label')||'')));console.error(r.spots);const go=async(sel)=>{await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='camp|';b.id='zz';document.getElementById('app').appendChild(b)});await A.click('#zz');await A.waitForTimeout(250);const bb=await (await A.$(sel)).boundingBox();await A.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await A.waitForTimeout(250);return A.$eval('#app h1',e=>e.innerText).catch(()=>'?')};
  r.korb=await go('.spot[data-go=einkauf]');r.rad=await go('.spot[data-go=ausflug]');r.boot=await go('.spot[data-go=reisen]');r.baum=await go('.spot[data-pf=garten]');r.kal=await go('.spot[data-nav="woche|wp:3"]');r.kalpage=await A.$eval('.pdot[aria-pressed=true]',e=>e.innerText).catch(()=>'?');
  // center taps by coordinates of spots
  console.error(JSON.stringify(r),errs);console.error(errs.length?'BOOT FAIL':'BOOT OK');await b.close();srv.close();process.exit(0)});
