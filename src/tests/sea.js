srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.clock.setFixedTime(new Date('2026-11-16T11:00:00+01:00'));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const k=/k=([^&]+)/.exec(A.url())[1];
  for(const [sea,t] of [['winter','11:00'],['summer','11:00'],['autumn','11:00'],['spring','11:00'],['winter','22:00']]){await A.clock.setFixedTime(new Date('2026-11-16T'+t+':00+01:00'));await A.goto('http://localhost:8765/?bild=haus&saison='+sea+'#k='+k);await A.waitForTimeout(700);await (await A.$('.camp')).screenshot({path:out+'/bild-'+sea+(t==='22:00'?'-nacht':'')+'.png'})}
  console.error(errs.length?'SEA FAIL '+errs:'SEA OK');await b.close();srv.close();process.exit(0)});
