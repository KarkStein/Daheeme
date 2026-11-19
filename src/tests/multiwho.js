srv.listen(8765,async()=>{
  // Für wen mit mehreren Personen (Termin und Familywall), geteilter Streifen, Filter je Person; 📍 noch mal antippen nimmt den Ort weg
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/ext/fw',{at:1,n:1,items:{f1:{name:'Turnen',date:'2026-11-17',time:'16:00'}}});
  await put('food/place/o1',{name:'Praxis',addr:'Teststraße 1'});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await A.waitForTimeout(500);await nav('woche|wp:3');const r={};
  await A.click('[data-act=ternew]');await A.fill('#ter-name','Arzt');await A.fill('[data-terf=time]','09:00');
  await A.click('[data-terwho=kid]');await A.click('[data-terwho=p0]');r.pressed=await A.$$eval('[data-terwho][aria-pressed=true]',l=>l.map(x=>x.dataset.terwho).join());
  await A.click('[data-placeset=Praxis]');r.pl1=await A.$eval('[data-placeset=Praxis]',e=>e.getAttribute('aria-pressed'));await A.click('[data-placeset=Praxis]');r.pl2=await A.$eval('[data-placeset=Praxis]',e=>e.getAttribute('aria-pressed'));
  await A.click('#terform button[type=submit]');await A.waitForTimeout(400);
  const T=Object.values(get(['haushalt',key,'food','termin'])||{}).filter(x=>!/^Großputz/.test(x.name))[0]||{};r.who=T.who;r.place=T.place||'';
  const li=await A.$('.evlist li[data-who="p0,kid"]');r.kz=li?await li.$$eval('.kz',l=>l.length):0;r.stripe=li?await li.evaluate(e=>getComputedStyle(e,'::before').backgroundImage):'';
  await A.click('[data-fwpick=f1]');await A.waitForTimeout(200);await A.click('#mbox [data-ebm=who][data-ebv=p1]');await A.click('#mbox [data-ebm=who][data-ebv=kid]');r.fwp=await A.$$eval('#mbox [data-ebm=who][aria-pressed=true]',l=>l.map(x=>x.dataset.ebv).join());
  await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);r.fw=(get(['haushalt',key,'food','ext','fwwho'])||{}).f1;
  const txt=async()=>(await A.$$eval('.evlist li',l=>l.map(x=>x.innerText))).join(' ');
  await A.click('[data-calwho=kid]');await A.waitForTimeout(200);const k=await txt();await A.click('[data-calwho=p1]');await A.waitForTimeout(200);const p1=await txt();await A.click('[data-calwho=p0]');await A.waitForTimeout(200);const p0=await txt();
  r.f={kA:/Arzt/.test(k),kT:/Turnen/.test(k),p1A:/Arzt/.test(p1),p1T:/Turnen/.test(p1),p0A:/Arzt/.test(p0),p0T:/Turnen/.test(p0)};
  await A.click('[data-teredit]');await A.waitForTimeout(200);await A.click('[data-terwho=both]');r.alle=await A.$$eval('[data-terwho][aria-pressed=true]',l=>l.map(x=>x.dataset.terwho).join());
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pressed==='p0,kid'&&r.pl1==='true'&&r.pl2==='false'&&r.who==='p0,kid'&&!r.place&&r.kz===2&&/gradient/.test(r.stripe)&&r.fwp==='p1,kid'&&r.fw==='p1,kid'&&r.f.kA&&r.f.kT&&!r.f.p1A&&r.f.p1T&&r.f.p0A&&!r.f.p0T&&r.alle==='both';
  console.error(ok?'MULTIWHO OK':'MULTIWHO FAIL');await b.close();srv.close();process.exit(0)});
