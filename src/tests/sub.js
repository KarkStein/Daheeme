srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  // simulate old plan: strip subs + old names, remove migration flag
  const cfg=JSON.parse(JSON.stringify(get(['haushalt',key,'config'])||get(['haushalt',key]).config));
  cfg.tasks.forEach(t=>{if(t.id==='saugen')t.name='Saugen (Wohnbereich)';if(t.id==='treppe'){t.name='Treppe saugen/wischen (Roboter starten, leeren)';delete t.subs}});delete cfg.mig;
  setAt(['haushalt',key,'config'],cfg);
  await A.reload();await A.waitForTimeout(1200);
  const r={};const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])));
  const c2=db().config;r.names=c2.tasks.filter(t=>t.id==='saugen'||t.id==='treppe').map(t=>t.name+(t.subs?'['+t.subs.join('|')+']':''));
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);
  // Woche kompakt (17.11.2026): erst 6 Zeilen, „Noch … weitere zeigen“
  const more=await A.$('#sec-week [data-act=wkmore]');if(more){await more.click();await A.waitForTimeout(300)}
  r.subs=await A.$$eval('.subbtn',l=>l.map(x=>x.innerText));
  for(const j of [0,1]){await A.click(`.subbtn[data-task=treppe][data-sub="${j}"]`);await A.waitForTimeout(350)}
  const w1=Object.values(db().weeks||{})[0]||{};r.mid=Object.keys(w1.ticks||{});
  await A.click('.subbtn[data-task=treppe][data-sub="2"]');await A.waitForTimeout(400);
  const w2=Object.values(db().weeks||{})[0]||{};r.full=Object.keys(w2.ticks||{});
  await A.addStyleTag({content:'#tabs{display:none!important}'});const el=await A.$('.subbtn[data-task=treppe]');await el.scrollIntoViewIfNeeded();await A.waitForTimeout(300);const box=await (await el.evaluateHandle(e=>e.closest('.wt,.task'))).asElement().boundingBox();

  await A.waitForTimeout(1500);await A.screenshot({timeout:20000,path:out+'/saugen-komplett.png',clip:{x:0,y:box.y-10,width:400,height:box.height+20}});
  await A.click('.subbtn[data-task=treppe][data-sub="1"]');await A.waitForTimeout(400);
  const w3=Object.values(db().weeks||{})[0]||{};r.back=Object.keys(w3.ticks||{});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.names.includes('Saugen (nach Bedarf)')&&r.names.includes('Saugen komplett[Treppe|🤖|Oben]')&&r.subs.length===3&&!r.mid.includes('treppe__0')&&r.full.includes('treppe__0')&&!r.back.includes('treppe__0');
  console.error(ok?'SUB OK':'SUB FAIL');await b.close();srv.close();process.exit(0)});
