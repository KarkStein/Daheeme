srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];await fetch('http://localhost:8765/haushalt/'+key+'/food/lunch/l1.json',{method:'PUT',body:JSON.stringify({name:'Trattoria am Markt',dishes:'Pizza',at:1})});await A.waitForTimeout(300);
  await A.click('[data-go=privat]');const h1=await A.$eval('h1',e=>e.textContent);const has=await A.$$eval('[data-lunch]',l=>l.length);
  await A.screenshot({path:out+'/privat.png',fullPage:true});
  await A.click('#tabs [data-tab=essen]');const chips=await A.$$eval('[data-food]',l=>l.map(x=>x.innerText));
  const br=1;console.log({h1,has,chips,br,errs});
  const ok=br===1&&!errs.length&&h1==='Partner'&&has===1&&chips.includes('Wochenplan')&&!chips.some(x=>/Mittagessen|Essensplan/.test(x));
  console.log(ok?'PRIVAT OK':'PRIVAT FAIL');await b.close();srv.close();process.exit(0)});
