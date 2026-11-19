srv.listen(8765,async()=>{
  // Handy-Benachrichtigungen (Florian 16.11.2026, im Aufbau): Karte in den Einstellungen, Schalter je Gerät
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='settings';document.getElementById('app').appendChild(b);b.click()}).catch(()=>{});await A.waitForTimeout(300);await A.click('[data-setsum=push]');await A.waitForTimeout(300);
  r.card=await A.$eval('#set-push',e=>e.innerText).catch(()=>'');r.btn=!!(await A.$('[data-act=pushtoggle]'));
  await A.$eval('#set-push',e=>e.scrollIntoView()).catch(()=>{});await A.screenshot({path:out+'/benachrichtigungen-einstellung.png'});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Morgen-Briefing/.test(r.card)&&r.btn;
  console.error(ok?'PUSH OK':'PUSH FAIL');await b.close();srv.close();process.exit(0)});
