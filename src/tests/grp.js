srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  await A.click('[data-go=bereiche]');await A.waitForTimeout(400);
  const r=await A.$$eval('.areagrp h2, .areahead',l=>l.map(x=>x.innerText.replace(/\s*›/,'')));
  await A.screenshot({path:out+'/bereiche-neu.png',fullPage:true});
  console.error(JSON.stringify(r),errs);console.error(errs.length?'GRP FAIL':'GRP OK');await b.close();srv.close();process.exit(0)});
