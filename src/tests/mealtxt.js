srv.listen(8765,async()=>{
  // Freier Text beim Essen auswählen (Florian 16.11.2026): Essen › Heute und Hinweis „Essen für heute aussuchen“
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const P=()=>(get(['haushalt',key,'food','plan','2026-W47'])||{});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('essen|ft:heute');r.form1=!!(await A.$('.fhero .mealtxtform'));await A.fill('.fhero #mealtxt','Pfannkuchen');await A.press('.fhero #mealtxt','Enter');await A.waitForTimeout(400);
  r.d2=(P().d2||{}).text;r.dish=await A.$eval('.fdish',e=>e.innerText).catch(()=>'');
  await A.screenshot({path:out+'/essen-frei.png'});
  // über den Hinweis: erst leeren, dann „Rezept aussuchen“ → Banner mit Feld
  setAt(['haushalt',key,'food','plan','2026-W47','d2'],null);await A.reload();await A.waitForTimeout(800);await nav('essen|ft:heute');
  await A.click('[data-mealfor]');await A.waitForTimeout(300);r.form2=!!(await A.$('.mealfor .mealtxtform'));await A.fill('.mealfor #mealtxt','Reste vom Sonntag');await A.click('.mealfor .mealtxtform button[type=submit]');await A.waitForTimeout(400);
  r.d2b=(P().d2||{}).text;r.back=await A.$eval('.fdish',e=>e.innerText).catch(()=>'');
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.form1&&r.d2==='Pfannkuchen'&&/Pfannkuchen/.test(r.dish)&&r.form2&&r.d2b==='Reste vom Sonntag'&&/Reste/.test(r.back)?'MEALTXT OK':'MEALTXT FAIL');
  await b.close();process.exit(0)});
