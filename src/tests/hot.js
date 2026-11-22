srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);
  const r={};
  r.first=await A.$eval('#app .task .task-title',e=>e.innerText);
  r.firstSec=await A.$eval('#app .section',e=>e.id);
  r.hoCount=await A.$$eval('.slot.hoslot',l=>l.length);
  r.dupe=await A.$$eval('.slot.hoslot',l=>l.filter(x=>!x.closest('#sec-ho')).length);
  await A.click('.slot.hoslot[data-slot="0"]');await A.waitForTimeout(300);await A.click('#mbox [data-hop="p0"]');await A.waitForTimeout(400);r.tap=await A.$eval('.slot.hoslot[data-slot="0"]',e=>e.innerText);
  await A.screenshot({path:out+'/woche-ho-erste.png'});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.firstSec==='sec-day'&&!!(await A.$('#sec-day #sec-ho'))&&r.hoCount===5&&r.dupe===0&&r.tap==='F';
  console.error(ok?'HOT OK':'HOT FAIL');await b.close();srv.close();process.exit(0)});
