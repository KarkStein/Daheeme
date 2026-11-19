srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const r={};r.cards=await A.$$eval('[data-homesum]',l=>l.length);r.h2=await A.$$eval('#app h2',l=>l.map(x=>x.innerText).filter(t=>/Als Nächstes|Ausstattung/.test(t)).length);r.today=await A.$$eval('.startdash .bcnt',l=>l.length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.cards===0&&r.h2===0&&r.today===3;
  console.error(ok?'HF OK':'HF FAIL');await b.close();srv.close();process.exit(0)});
