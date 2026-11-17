srv.listen(8765,async()=>{
  // Wer macht was (Florian 17.11.2026): tägliche Aufgaben zählen nur heute, ⬜ hakt heute ab; falsch gesetzte künftige Tage werden weggeräumt
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:640},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(500)};
  const key=/k=([^&]+)/.exec(A.url())[1],wk='2026-W47',T=()=>Object.keys(get(['haushalt',key,'weeks',wk,'ticks'])||{}).filter(k=>/^schlafzimmer/.test(k)).sort().join();
  const row=()=>A.$eval('.wmwrow:has(b:text-is("Schlafzimmer aufräumen"))',e=>e.className).catch(()=>'');
  await nav("woche|wp:1");r.open=await A.$eval('[data-wmwsec=offen]',e=>e.getAttribute('aria-expanded'));
  await A.click('.wmwrow:has(b:text-is("Schlafzimmer aufräumen")) [data-wtick]');await A.waitForTimeout(500);r.mo=T();r.moRow=await row();
  // alte, falsche Haken (am Montag gesetzt für Di und Mi)
  const at=+new Date('2026-11-16T10:00:00+01:00');setAt(['haushalt',key,'weeks',wk,'ticks','schlafzimmer__1_p0'],{by:'p0',at});setAt(['haushalt',key,'weeks',wk,'ticks','schlafzimmer__2_p0'],{by:'p0',at});
  await A.clock.setFixedTime(new Date('2026-11-17T10:00:00+01:00'));await A.reload();await A.waitForTimeout(2500);r.clean=T();
  await nav("woche|wp:1");r.diRow=await row();await A.click('.wmwrow:has(b:text-is("Schlafzimmer aufräumen")) [data-wtick]');await A.waitForTimeout(500);r.di=T();
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.open==='true'&&r.mo==='schlafzimmer__0_p0'&&r.moRow===''&&r.clean==='schlafzimmer__0_p0'&&!/done/.test(r.diRow)&&r.di==='schlafzimmer__0_p0,schlafzimmer__1_p0'?'WMWTAG OK':'WMWTAG FAIL');
  await b.close();process.exit(0)});
