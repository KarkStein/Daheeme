srv.listen(8765,async()=>{
  // Start › „Offene Aufträge“ (Florian 16.11.2026): springt nicht nach oben zu Heute zu tun, sondern an den Anfang der Aufgaben in Tag und Woche
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>window.hqMedal&&window.hqMedal(true));await A.waitForTimeout(800);await A.click('.medback .bcnt[data-act=gotasks]');await A.waitForTimeout(600);
  r.h1=await A.$eval('#app h1',e=>e.innerText).catch(()=>'');r.y=await A.evaluate(()=>scrollY);
  r.top=await A.$eval('.wkheute',e=>Math.round(e.getBoundingClientRect().top));r.flash=await A.$$eval('.hlflash',l=>l.length);
  await A.screenshot({path:out+'/offene-aufgaben-sprung.png'});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.h1==='Diese Woche'&&r.y<50&&r.top>=0&&r.top<300&&r.flash===1;
  console.error(ok?'GOTASKS OK':'GOTASKS FAIL');await b.close();srv.close();process.exit(0)});
