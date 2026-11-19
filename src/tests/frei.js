srv.listen(8765,async()=>{
  // Ferien und Feiertage Bayern: Feiertage gerechnet (Kalender 🎉, Kind-Tag frei), Ferien aus ferien.json (Urlaube, Ausflüge)
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-12-21T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/ferien.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({ferien:[{name:'Weihnachtsferien',from:'2026-12-24',to:'2027-01-08'}]})}));await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await A.waitForTimeout(500);
  await nav('kita|');const kid=await A.$eval('#app',e=>e.innerText);
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);const cal=await A.$eval('#app',e=>e.innerText);
  await nav('ausflug|tt:urlaub');if(await A.$('[data-tfold=frei][aria-expanded=false]')){await A.click('[data-tfold=frei]');await A.waitForTimeout(200)}const rei=await A.$eval('#app',e=>e.innerHTML);
  await nav('ausflug|tt:ideen');const aus=await A.$eval('#app',e=>e.innerText);
  
  const r={kid:/🎉\s*frei/.test(kid),cal:/1\. Weihnachtstag/.test(cal)&&/Weihnachtsferien beginnen/.test(cal),rei:/Ferien und Feiertage/.test(rei)&&/Weihnachtsferien/.test(rei),aus:/Frei bald/.test(aus)};
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.kid&&r.cal&&r.rei&&r.aus;
  console.error(ok?'FREI OK':'FREI FAIL');await b.close();srv.close();process.exit(0)});
