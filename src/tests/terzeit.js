srv.listen(8765,async()=>{
  // Termin mit Zeitrahmen (von/bis), ganztägig, Möglichkeiten mit bis
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:640},timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T08:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await A.waitForTimeout(500);await nav('woche|wp:3');const r={};
  await A.click('[data-act=ternew]');await A.fill('#ter-name','Kinderarzt');await A.fill('[data-terf=date]','2026-11-16');await A.fill('[data-terf=time]','09:00');await A.fill('[data-terf=tend]','10:30');
  r.fit=await A.evaluate(()=>{const w=document.querySelector('.terwhen');return w.scrollWidth<=w.clientWidth+1});
  await A.screenshot({path:process.argv[2]+'/terzeit.png'});
  await A.click('[data-act=teraltadd]');await A.fill('[data-teralt="0"][data-k=date]','2026-11-18');await A.fill('[data-teralt="0"][data-k=time]','14:00');await A.fill('[data-teralt="0"][data-k=tend]','15:00');await A.click('[data-terask=""]');
  await A.click('#terform button[type=submit]');await A.waitForTimeout(400);
  const T=Object.values(get(['haushalt',key,'food','termin'])||{});const t1=T.find(x=>x.name==='Kinderarzt')||{};r.t1=[t1.time,t1.tend,(t1.alt||[])[0]&&t1.alt[0].tend].join();
  r.li=(await A.$$eval('.evlist li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')))).join('|');
  await A.click('[data-act=ternew]');await A.fill('#ter-name','Ausflug');await A.fill('[data-terf=date]','2026-11-17');await A.fill('[data-terf=time]','09:00');await A.click('[data-act=terallday]');r.hidden=!(await A.$('[data-terf=time]'));
  await A.click('#terform button[type=submit]');await A.waitForTimeout(400);
  const t2=Object.values(get(['haushalt',key,'food','termin'])||{}).find(x=>x.name==='Ausflug')||{};r.t2=[t2.allday,t2.time||''].join();
  r.li2=(await A.$$eval('.evlist li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')))).join('|');
  await nav('woche|wp:0');r.dash=await A.$eval('#app',e=>e.innerText.includes('bis 10:30'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.fit&&r.t1==='09:00,10:30,15:00'&&/09:00 bis 10:30/.test(r.li)&&r.hidden&&r.t2==='true,'&&/ganztägig/.test(r.li2)&&r.dash;
  console.error(ok?'TERZEIT OK':'TERZEIT FAIL');await b.close();srv.close();process.exit(0)});
