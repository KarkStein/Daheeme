srv.listen(8765,async()=>{
  // Personen im Kalender: Woche zuerst, Heute-Streifen, Familywall-Zuordnung (Teilnehmer, Hand, Regel), Personenfilter lässt „Alle“ sichtbar, lange drücken = neuer Termin
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin',hasTouch:false});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/ext/fw',{at:1,n:3,people:{ha:'Person A'},items:{f1:{name:'Yoga',date:'2026-11-16',time:'18:00',a:['ha']},f2:{name:'Schwimmkurs Kind',date:'2026-11-17',time:'16:00'},f3:{name:'Elternabend',date:'2026-11-18'}}});
  await put('food/termin/t1',{name:'Familienessen',date:'2026-11-16',time:'12:00',who:'both',at:1});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await A.waitForTimeout(500);await nav('woche|wp:3');const r={};
  r.view=await A.$eval('[data-calview][aria-pressed=true]',e=>e.innerText);await A.click('[data-calview=monat]');await A.waitForTimeout(200);r.strip=!(await A.$('.caltoday'))&&(await A.evaluate(()=>{const c=document.querySelector('.cal');return c.getBoundingClientRect().bottom<innerHeight}));await A.click('[data-calview=liste]');await A.waitForTimeout(200);
  await A.click('[data-act=calfilt]');await A.click('[data-fwmap=ha][data-v=p1]');await A.waitForTimeout(400);
  r.map=JSON.stringify(get(['haushalt',key,'food','ext','fwmap']));
  await A.click('[data-fwpick=f2]');await A.waitForTimeout(200);await A.click('#mbox [data-ebm=who][data-ebv=kid]');await A.fill('#mbox [data-ebf=kw]','kurs');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);
  r.ov=JSON.stringify(get(['haushalt',key,'food','ext','fwwho']));r.kw=Object.values(get(['haushalt',key,'food','ext','fwkw'])||{}).map(x=>x.kw+':'+x.who).join();
  await A.click('[data-calwho=kid]');await A.waitForTimeout(200);const wk=(await A.$$eval('.evlist li',l=>l.map(x=>x.innerText))).join(' ');
  r.kidView={yoga:/Yoga/.test(wk),schwimm:/Schwimmkurs/.test(wk),essen:/Familienessen/.test(wk),eltern:/Elternabend/.test(wk)};
  await A.click('[data-calwho=""]');await A.waitForTimeout(200);
  await A.click('[data-calview=monat]');await A.waitForTimeout(200);const day=await A.$('.cal [data-calday="2026-11-19"]');await day.scrollIntoViewIfNeeded();const bx=await day.boundingBox();await A.mouse.move(bx.x+10,bx.y+10);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(300);
  r.draft=await A.$eval('[data-terf=date]',e=>e.value).catch(()=>'');r.dbg=await A.$eval('#app',e=>e.innerText.slice(0,200));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.view==='Liste'&&r.strip&&r.map==='{"ha":"p1"}'&&r.ov==='{"f2":"kid"}'&&r.kw==='kurs:kid'&&!r.kidView.yoga&&r.kidView.schwimm&&r.kidView.essen&&r.kidView.eltern&&r.draft==='2026-11-19';
  console.error(ok?'PERS OK':'PERS FAIL');await b.close();srv.close();process.exit(0)});
