srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])||{}));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('geschenke|');r.tile=await A.$eval('[data-pfilter=advent]',e=>e.innerText.replace(/\n/g,' '));
  await A.click('[data-pfilter=advent]');await A.waitForTimeout(300);
  await A.click('[data-advnew="kid|selbst"]');await A.waitForTimeout(500);
  r.prio=Object.values(db().food.prio||{}).map(x=>x.name+'@'+x.due);
  await A.click('[data-act=advfill]');await A.waitForTimeout(2500);
  r.doors=Object.keys(db().food.adoor||{}).length;
  const D=Object.values(db().food.adoor||{});r.d6=D.find(x=>x.day===6);r.d5=D.find(x=>x.day===5);
  await A.click('.advdoor[data-advdoor="6"]');await A.waitForTimeout(300);
  await A.addStyleTag({content:'#tabs{display:none!important}'});
  await A.screenshot({path:out+'/advent-raster.png',fullPage:true});
  await A.click('[data-advshop="6"]');await A.waitForTimeout(300);r.pick=await A.$eval('.pick h2',e=>e.innerText);
  await A.click('[data-pickmode=nur]');await A.waitForTimeout(200);await A.click('[data-pickline="0|0"]');await A.click('[data-pickline="0|1"]');await A.click('[data-act=pickok]');await A.waitForTimeout(500);
  r.shop=Object.values(db().food.shop||{}).map(x=>x.name+'|'+x.src);
  await A.click('[data-advshopsee="6"]');await A.waitForTimeout(300);r.inShop=await A.$eval('#app h1',e=>e.innerText);
  // srclink back
  const sl=await A.$('[data-srclink^="Adventskalender"]');r.srclink=!!sl;if(sl){await sl.click();await A.waitForTimeout(300);r.back=await A.$eval('.advdoor.sel',e=>e.dataset.advdoor).catch(()=>null)}
  // aktiv door -> trip
  const ad=Object.values(db().food.adoor).find(x=>/markt|spazier|schlitten|kino|besuch|tierpark|lichter/i.test(x.name));r.ad=ad&&ad.day;
  await A.click(`.advdoor[data-advdoor="${ad.day}"]`).catch(()=>{});await A.waitForTimeout(300);
  if(!(await A.$(`[data-advtrip="${ad.day}"]`))){await A.click(`.advdoor[data-advdoor="${ad.day}"]`);await A.waitForTimeout(300)}
  await A.screenshot({path:out+'/advent-tuerchen.png',fullPage:true});
  await A.click(`[data-advtrip="${ad.day}"]`);await A.waitForTimeout(500);
  r.trip=Object.values(db().food.trip||{}).map(x=>x.name+'@'+x.date+'#'+(x.adv?'adv':''));
  r.cal=await A.evaluate(()=>0);
  await nav('suche|');await A.fill('#sq','Nikolaus');await A.waitForTimeout(400);r.search=await A.$$eval('#app button',l=>l.filter(x=>x.dataset.advgo).length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.doors===24&&r.d6&&/Nikolaus/.test(r.d6.name)&&/Nüsse/.test(r.d6.need||'')&&r.pick==='Auf die Einkaufsliste'&&r.shop.length===2&&r.shop.every(x=>x.endsWith('Türchen 6'))&&r.inShop==='Einkauf'&&r.trip.length===1&&r.trip[0].includes('-12-')&&r.prio.length===1&&r.search>0;
  console.error(ok?'ADV OK':'ADV FAIL');await b.close();srv.close();process.exit(0)});
