srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-12T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/rec/r9',{name:'Linsensuppe',ing:'250 g Linsen',link:'https://example.org/linsen',at:1});
  await put('food/plan/2026-W46/d4',{text:'Linsensuppe',rec:'r9',at:1});
  await put('food/plan/2026-W46/d3',{text:'Kürbisauflauf',ing:'700 g Kürbis',at:1});
  await put('food/shop/s1',{name:'250 g Linsen',done:false,at:1,src:'Linsensuppe'});await put('food/shop/s2',{name:'700 g Kürbis',done:false,at:2,src:'Kürbisauflauf'});
  await put('food/prio/p1',{name:'Linsen einweichen',from:'rezepte',ref:'r9',at:1});
  await A.waitForTimeout(500);
  await A.click('#tabs [data-tab=einkauf]');await A.click('[data-srclink="Linsensuppe"]');await A.waitForTimeout(200);const a1=await A.$eval('section.rec:not(.compact) .nm',e=>e.textContent).catch(()=>null);
  await A.click('#tabs [data-tab=camp]');await A.click('#tabs [data-tab=einkauf]');await A.click('[data-srclink="Kürbisauflauf"]');await A.waitForTimeout(200);const a2=await A.$eval('[data-food=heute]',e=>e.getAttribute('aria-pressed'));const a2b=!!(await A.$('.dishmore'));
  await A.click('[data-food=heute]');await A.click('[data-food=plan]');await A.click('[data-openrec=r9]');const a3=await A.$eval('section.rec:not(.compact) .nm',e=>e.textContent).catch(()=>null);
  await A.click('[data-shopview="Linsensuppe"]');const a4=await A.$eval('.shop .nm',e=>(x=>{const q=x.querySelector('.qty'),t=x.innerText.split('\n');if(q)t[0]=q.innerText+' '+t[0].replace(q.innerText,'').trim();return t.join('\n')})(e).split('\n')[0]);
  await A.click('[data-tab=camp]');await A.evaluate(()=>window.hqMedal&&window.hqMedal(true));await A.waitForTimeout(800);await A.click('.medback .bcnt[data-go=wichtig]');await A.waitForTimeout(300);await A.click('.prow .pnm[data-openrec]');const a5=await A.$eval('section.rec:not(.compact) .nm',e=>e.textContent).catch(()=>null);
  console.log({a1,a2,a2b,a3,a4,a5,errs});
  const ok=!errs.length&&a1==='Linsensuppe'&&a2==='true'&&a2b&&a3==='Linsensuppe'&&a4==='250 g Linsen'&&a5==='Linsensuppe';
  console.log(ok?'LINKS2 OK':'LINKS2 FAIL');await b.close();srv.close();process.exit(0)});
