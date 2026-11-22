srv.listen(8765,async()=>{
  // Nach Bedarf (Florian 22.11.2026): wird der Balken bis Sonntag voll, steht die Aufgabe schon bei „Diese Woche“ („voll bis Mi“), aber noch nicht in „Heute für dich“
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-23T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(800);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  for(let i=0;i<20&&!(get(['haushalt',key,'config','tasks'])||[]).some(t=>t.freq==='need');i++)await A.waitForTimeout(300);
  const now=Date.parse('2026-11-23T10:00:00+01:00'),D=864e5;
  // Bett alle 21 Tage: zuletzt vor 19 Tagen = voll am Mittwoch; Wasserkocher alle 91: zuletzt vor 30 Tagen = später
  await put('food/need/n_bett/x1',{at:now-19*D,by:'p1'});await put('food/need/n_kocher/x1',{at:now-30*D,by:'p1'});await A.waitForTimeout(500);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(600);
  const r={};r.week=await A.$eval('#sec-week .needdue',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'');await A.click('#sec-need [data-tfold]').catch(()=>{});await A.waitForTimeout(300);r.rest=await A.$eval('#sec-need',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'');
  r.heute=await A.$eval('.wkheute',e=>e.innerText).catch(()=>'');
  await A.$eval('#sec-week .needdue',e=>e.scrollIntoView({block:'center'})).catch(()=>{});await A.screenshot({path:out+'/nachbedarf-diese-woche.png'});
  console.error(JSON.stringify(r).slice(0,900),errs);
  const ok=!errs.length&&/Bett abziehen/.test(r.week)&&/voll bis Mi/.test(r.week)&&!/Wasserkocher/.test(r.week)&&/Wasserkocher/.test(r.rest)&&!/Bett abziehen/.test(r.rest)&&!/Bett abziehen/.test(r.heute);
  console.error(ok?'NEEDWOCHE OK':'NEEDWOCHE FAIL');await b.close();srv.close();process.exit(0)});
