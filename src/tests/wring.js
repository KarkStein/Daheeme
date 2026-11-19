srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('camp|');r.ring=await A.$eval('.medback .skyring .bring',e=>e.innerText.replace(/\n/g,' ')).catch(()=>null);
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/dashboard-wochenring.png'});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await nav('camp|');await A.evaluate(()=>window.hqMedal&&window.hqMedal(true));await A.waitForTimeout(800);await A.click('.medback .bmore');await A.waitForTimeout(200);await A.evaluate(()=>window.hqMedal&&window.hqMedal(true));await A.waitForTimeout(800);await A.click('.medback .bcal[data-calopen=monat]');await A.waitForTimeout(300);r.mon=await A.$eval('[data-calview=monat]',e=>e.getAttribute('aria-pressed'));
  await nav('camp|');await A.evaluate(()=>window.hqMedal&&window.hqMedal(true));await A.waitForTimeout(800);await A.click('.medback .skyring .bring');await A.waitForTimeout(300);r.week=await A.$eval('#app h1',e=>e.innerText);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/\d+\/\d+/.test(r.ring||'')&&r.mon==='true'&&/Woche/.test(r.week);
  console.error(ok?'WRING OK':'WRING FAIL');await b.close();srv.close();process.exit(0)});
