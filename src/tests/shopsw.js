srv.listen(8765,async()=>{
  // Einkauf (Florian 16.11.2026): zwei Seiten; Weitere Listen hängt per Umschalter an der ersten, Reiter öffnet immer die Einkaufsliste
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);r.h1=await A.$eval('#app h1',e=>e.innerText);r.sw=await A.$$eval('.shopsw [data-go]',l=>l.map(x=>x.getAttribute('aria-pressed')));
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/einkauf-umschalter.png'});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await A.click('.shopsw [data-go=listen]');await A.waitForTimeout(300);r.h2=await A.$eval('#app h1',e=>e.innerText);r.dot=await A.$eval('.pdot[aria-pressed=true]',e=>e.innerText);r.tabSel=await A.$eval('#tabs [data-tab=einkauf]',e=>e.getAttribute('aria-selected'));
  await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);r.h3=await A.$eval('#app h1',e=>e.innerText);
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);r.h4=await A.$eval('#app h1',e=>e.innerText);
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.h1==='Einkauf'&&r.sw.join()==='true,false'&&r.h2==='Weitere Listen'&&r.dot==='Listen'&&r.tabSel==='true'&&r.h3==='Ausgaben'&&r.h4==='Einkauf'?'SHOPSW OK':'SHOPSW FAIL');
  await b.close();process.exit(0)});
