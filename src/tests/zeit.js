srv.listen(8765,async()=>{
  // Zeit mitdenken: Sprünge zwischen Woche, Kalender, Wochenplan, Kita-Essen und Kind behalten die gezeigte Woche
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.evaluate(()=>localStorage.removeItem('hq-calview2'));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  const txt=()=>A.$eval('#app',e=>e.innerText);const r={};
  await A.waitForTimeout(400);await nav('woche|');await A.click('[data-wknav="1"]');await A.waitForTimeout(200);r.woche=/KW 48/.test(await txt());
  await nav('essen|ft:plan');r.plan=/Mo 23\.11\./.test(await txt());
  await A.click('[data-food=kita]');await A.waitForTimeout(200);r.kita=/KW 48/.test(await txt());
  await nav('kind|');r.kind=/KW 48/.test(await A.$eval('.kidbh',e=>e.innerText));
  await nav('woche|wp:3');r.cal=await A.$$eval('[data-calday="2026-11-23"]',l=>l.map(x=>x.className+'|'+(x.getAttribute('aria-pressed')||'')).join());
  await nav('woche|wp:0');r.back=/KW 48/.test(await txt());
  await A.click('[data-wknav="0"]');await A.waitForTimeout(200);await nav('essen|ft:plan');r.now=/Mo 16\.11\./.test(await txt());
  await nav('camp|sp:tag');await nav('essen|ft:plan');r.neutral=/Mo 16\.11\./.test(await txt());
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.woche&&r.plan&&r.kita&&r.kind&&/sel|true/.test(r.cal)&&r.back&&r.now&&r.neutral;
  console.error(ok?'ZEIT OK':'ZEIT FAIL');await b.close();srv.close();process.exit(0)});
