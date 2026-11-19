srv.listen(8765,async()=>{
  // 🧠 Kümmert sich (Florian 19.11.2026: „top. machen“, „Dezent ‚🧠 ?‘ zeigen“): Kind-Termine mit „🧠 ?“, Tipp wählt, Termin-Maske, Glocke nur für die Person, Projekte, Rückblick
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-19T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(800);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(600)};
  await put('food/termin/k1',{name:'Kinderarzt U7',date:'2026-11-20',time:'09:00',who:'kid',tag:'arzt',at:1});
  await put('food/termin/k2',{name:'Zahnarzt Erwachsene',date:'2026-11-20',time:'11:00',at:1});
  await put('food/termin/k3',{name:'Laternenfest',date:'2026-11-19',time:'17:00',who:'kid',remind:true,care:'p1',at:1});
  await put('food/urlaub/u1',{name:'Ostsee',st:'aktuell',at:1});await A.waitForTimeout(800);
  const r={};
  await nav('woche|wp:3');
  r.q=await A.$eval('.evlist li:has([data-teredit=k1]) .carebtn',e=>e.className+'|'+e.innerText).catch(()=>'');r.noAdult=!(await A.$('.evlist li:has([data-teredit=k2]) .carebtn'));
  r.k3=await A.$eval('.evlist li:has([data-teredit=k3]) .carebtn',e=>e.innerText).catch(()=>'');
  r.bell=await A.$eval('.bellnav',e=>e.innerText).catch(()=>'');
  await A.screenshot({path:out+'/kuemmert-kalender.png'});
  await A.click('.evlist li:has([data-teredit=k1]) .carebtn');await A.waitForTimeout(300);await A.screenshot({path:out+'/kuemmert-frage.png'});
  await A.click('#mbox [data-carev=p0]');await A.waitForTimeout(600);r.care1=get(['haushalt',key,'food','termin','k1','care']);
  // Maske: auf Judith stellen
  await A.click('.evlist [data-teredit=k1]');await A.waitForTimeout(400);r.mask=await A.$$eval('[data-tercare]',l=>l.map(x=>x.dataset.tercare+':'+x.getAttribute('aria-pressed')).join(','));
  await A.click('[data-tercare=p1]');await A.waitForTimeout(200);await A.click('#terform button[type=submit]');await A.waitForTimeout(600);r.care2=get(['haushalt',key,'food','termin','k1','care']);
  // Glocke: Laternenfest hat 🔔, aber Judith kümmert sich → zählt bei Florian nicht
  await put('food/termin/k3/care',null);await A.waitForTimeout(600);r.bell2=await A.$eval('.bellnav',e=>e.innerText).catch(()=>'');
  // Urlaub
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.reise="u1";b.id="zr";document.getElementById("app").appendChild(b)});await A.click('#zr');await A.waitForTimeout(500);
  r.uhead=await A.$eval('.carehead',e=>e.className+'|'+e.innerText).catch(()=>'');await A.click('.carehead');await A.waitForTimeout(300);await A.click('#mbox [data-carev=both]');await A.waitForTimeout(500);r.ucare=get(['haushalt',key,'food','urlaub','u1','care']);r.uhead2=await A.$eval('.carehead',e=>e.innerText).catch(()=>'');
  await A.screenshot({path:out+'/kuemmert-urlaub.png'});
  // Rückblick
  await nav('woche|wp:4');r.rb=await A.$eval('.rbcare',e=>e.innerText).catch(()=>'');
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&/open/.test(r.q)&&/\?/.test(r.q)&&r.noAdult&&/J/.test(r.k3)&&r.care1==='p0'&&/p1:false/.test(r.mask)&&/p0:true/.test(r.mask)&&r.care2==='p1'&&!/\d/.test(r.bell)&&/\d/.test(r.bell2)&&/open/.test(r.uhead)&&r.ucare==='both'&&/kümmern sich/.test(r.uhead2)&&/Gekümmert/.test(r.rb)?'KUEMMERT OK':'KUEMMERT FAIL');
  await b.close();process.exit(0)});
