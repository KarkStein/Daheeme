srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});const badge=()=>A.$eval('.bellnav .badge',e=>+e.innerText).catch(()=>0);
  await put('food/prio/a',{name:'Alt',from:'frei',due:'2026-11-14',at:1});await put('food/prio/b',{name:'Morgen früh',from:'frei',due:'2026-11-17',time:'08:00',at:2});await put('food/prio/c',{name:'Morgen abend',from:'frei',due:'2026-11-17',time:'19:00',at:3});await put('food/prio/d',{name:'Später',from:'frei',due:'2026-11-20',at:4});
  await put('food/termin/t1',{name:'Kinderarzt',date:'2026-11-16',time:'15:30',at:1});await A.waitForTimeout(500);
  r.b1=await badge();
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='woche|wp:3';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);
  await A.click('[data-terbell=t1]');await A.waitForTimeout(400);r.b2=await badge();
  await A.click('.bellnav');await A.waitForTimeout(300);r.secs=await A.$$eval('.section-head h2',l=>l.map(x=>x.innerText));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.b1===2&&r.b2===3&&r.secs.some(x=>/Termine mit Glocke/.test(x));
  console.error(ok?'BELL OK':'BELL FAIL');await b.close();srv.close();process.exit(0)});
