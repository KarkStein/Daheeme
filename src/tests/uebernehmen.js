srv.listen(8765,async()=>{
  // Aufgabe des anderen übernehmen (Florian 19.11.2026: „einzelne Aufgaben oder Teilaufgaben einmalig tauschen oder übernehmen (anklicken) … Ich möchte das dokumentiert haben“)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const cfg=JSON.parse(JSON.stringify(get(['haushalt',key,'config'])));
  cfg.tasks=cfg.tasks.filter(t=>t.owner==='ho').concat([
    {id:'waeschex',name:'Wäsche',owner:'p1',freq:'week',times:3,pts:1},
    {id:'badx',name:'Bad putzen',owner:'p1',freq:'week',times:1,pts:1,subs:['Waschbecken','Dusche']},
    {id:'minex',name:'Pflanzen gießen',owner:'p0',freq:'week',times:1,pts:1}]);
  setAt(['haushalt',key,'config'],cfg);await A.reload();await A.waitForTimeout(1200);
  const ticks=()=>{const w=Object.values(JSON.parse(JSON.stringify(get(['haushalt',key,'weeks'])||{})))[0]||{};return w.ticks||{}};
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);
  // Haken an der Aufgabe des anderen: by = ich, own = der andere; der Kreis zeigt meinen Buchstaben statt ✓
  await A.click('.wsl[data-task=waeschex][data-slot="1"]');await A.waitForTimeout(500);
  r.t1=ticks()['waeschex__1'];r.toast=await A.$eval('#toast',e=>e.innerText);
  r.cls=await A.$eval('.wsl[data-task=waeschex][data-slot="1"]',e=>e.className+'|'+e.innerText.trim()+'|'+e.getAttribute('aria-label'));
  r.info=await A.$eval('.wt:has([data-task=waeschex]) .tookinfo',e=>e.innerText);
  // Teilaufgabe übernehmen
  await A.click('.subbtn[data-task=badx][data-sub="0"]');await A.waitForTimeout(500);r.s1=ticks()['badx__0_s0'];r.scls=await A.$eval('.subbtn[data-task=badx][data-sub="0"]',e=>e.className);
  // eigene Aufgabe: kein own
  await A.click('.wsl[data-task=minex]');await A.waitForTimeout(500);r.m1=ticks()['minex__0'];r.mcls=await A.$eval('.wsl[data-task=minex]',e=>e.className+'|'+e.innerText.trim());
  if(out){await A.evaluate(()=>{const t=document.getElementById('toast');if(t)t.style.visibility='hidden'});const el=await A.$('.wsl[data-task=waeschex]');await el.scrollIntoViewIfNeeded();await A.waitForTimeout(300);await A.screenshot({path:out+'/aufgabe-uebernommen.png'})}
  // Die Zuteilung bleibt: Aufgabe gehört weiter p1
  r.owner=get(['haushalt',key,'config']).tasks.find(t=>t.id==='waeschex').owner;
  // wieder wegnehmen
  await A.click('.wsl[data-task=waeschex][data-slot="1"]');await A.waitForTimeout(500);r.off=!ticks()['waeschex__1'];
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.t1&&r.t1.by==='p0'&&r.t1.own==='p1'&&/übernommen/.test(r.toast)&&/took/.test(r.cls)&&/ p0 /.test(' '+r.cls.split('|')[0]+' ')&&!/✓/.test(r.cls.split('|')[1])&&/übernommen von/.test(r.cls)&&/1× übernommen/.test(r.info)
    &&r.s1&&r.s1.own==='p1'&&/took/.test(r.scls)&&r.m1&&r.m1.by==='p0'&&!r.m1.own&&/chk/.test(r.mcls)&&/✓/.test(r.mcls)&&r.owner==='p1'&&r.off;
  console.error(ok?'UEBERNEHMEN OK':'UEBERNEHMEN FAIL');await b.close();srv.close();process.exit(0)});
