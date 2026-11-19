srv.listen(8765,async()=>{
  // Florian 16.11.2026: „Tag und Woche“ neu laden darf nichts verlieren (Beispiel Abendessen von heute im Dashboard)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  setAt(['haushalt',key,'food','plan','2026-W47','d2'],{text:'Pfannkuchen',at:1});setAt(['haushalt',key,'food','kitaplan','2026-W47','d2'],{text:'Nudeln mit Tomatensoße'});
  await A.reload();await A.waitForTimeout(800);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('camp|');const txt=()=>A.$eval('#app',e=>e.innerText);
  r.before=/Pfannkuchen/.test(await txt());r.kitaBefore=/Nudeln mit Tomaten/.test(await txt());
  const snap=async()=>{const t=await txt();return {essen:/Pfannkuchen/.test(t),kita:/Nudeln mit Tomaten/.test(t),len:t.length}};
  r.s0=await snap();
  await A.reload();r.s1=await snap();await A.waitForTimeout(150);r.s2=await snap();await A.waitForTimeout(1500);r.s3=await snap();
  await A.screenshot({path:out+'/tag-neu-geladen.png',fullPage:true});
  // Kalender (Start › Kalender) ebenso
  setAt(['haushalt',key,'food','termin','t1'],{name:'Zahnarztbesuch',date:'2026-11-18',time:'18:00',who:'p0',at:1});await nav('woche|wp:3');await A.click('[data-calview=liste]').catch(()=>{});await A.waitForTimeout(300);
  r.cal0=/Zahnarztbesuch/.test(await txt());await A.reload();await A.waitForTimeout(1200);r.cal1=/Zahnarztbesuch/.test(await txt());
  r.tab=await A.evaluate(()=>document.querySelector('#tabs [aria-selected=true]')&&document.querySelector('#tabs [aria-selected=true]').dataset.tab);
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&r.before&&r.s3.essen&&r.s3.kita&&r.cal1;
  console.log(ok?'RELOADTAG OK':'RELOADTAG FAIL');
  await b.close();process.exit(0)});
