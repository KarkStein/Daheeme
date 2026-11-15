srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const r={};r.closed=await A.$$eval('[data-homesum]',l=>l.map(x=>x.getAttribute('aria-expanded')+':'+x.innerText.replace(/\n/g,' ')));
  const sec=await A.$('[data-homesum=next]');await sec.scrollIntoViewIfNeeded();const bb=await sec.boundingBox();
  await A.waitForTimeout(2800);await A.addStyleTag({content:'#tabs{position:static!important}'});await A.screenshot({path:out+'/start-eingeklappt.png',fullPage:true});
  await A.click('[data-homesum=aus]');await A.waitForTimeout(200);r.open=await A.$$eval('[data-homesum]',l=>l.map(x=>x.getAttribute('aria-expanded')));
  await A.reload();await A.waitForTimeout(800);r.after=await A.$$eval('[data-homesum]',l=>l.map(x=>x.getAttribute('aria-expanded')));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.closed.length===2&&r.closed.every(x=>x.startsWith('false'))&&r.open[1]==='true'&&r.after[1]==='true';
  console.error(ok?'HF OK':'HF FAIL');await b.close();srv.close();process.exit(0)});
