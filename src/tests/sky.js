srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];let key=null;
  const shot=async(name,time,code)=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();await A.clock.setFixedTime(new Date(time));A.on('pageerror',e=>errs.push(name+': '+e.message));
    await A.route('**/api.open-meteo.com/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({current:{weather_code:code},daily:{time:['2026-11-14'],temperature_2m_max:[8],precipitation_sum:[2]}})}));
    if(!key){await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');key=/k=([^&]+)/.exec(A.url())[1];
      await fetch('http://localhost:8765/haushalt/'+key+'/food/wxplace.json',{method:'PUT',body:JSON.stringify({name:'Kiel',lat:54.32,lon:10.12})});}
    else{await A.addInitScript(()=>{localStorage.setItem('hq-me','p0')});await A.goto('http://localhost:8765/?bild=haus#k='+key);}
    await A.waitForTimeout(1200);await A.click('.brandbtn').catch(()=>{});await A.waitForTimeout(600);const cam=await A.$('.camp');await cam.screenshot({path:out+'/sky-'+name+'.png'});await c.close()};
  await shot('tag','2026-11-14T12:00:00+01:00',0);
  await shot('abend','2026-11-14T16:25:00+01:00',1);
  await shot('nacht','2026-11-14T22:00:00+01:00',0);
  await shot('vollmond','2026-11-24T22:00:00+01:00',0);
  await shot('regen','2026-11-14T12:00:00+01:00',63);
  await shot('schnee','2026-11-14T12:00:00+01:00',73);
  await shot('nebel','2026-11-14T09:00:00+01:00',45);
  console.log(errs.length?errs:'SKY OK');await b.close();srv.close();process.exit(0)});
