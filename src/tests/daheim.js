srv.listen(8765,async()=>{
  // Wer bleibt daheim? (Florian 19.11.2026): Kita-zu-Termin fragt je Tag und trägt den Hausdienst ein; Knopf unter Bringen und Abholen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-19T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(800);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(600)};
  const ho=(get(['haushalt',key,'config','tasks'])||[]).find(t=>t.owner==='ho').id,tk=(wk,i)=>(get(['haushalt',key,'weeks',wk,'ticks',ho+'__'+i])||null);
  // Kita zu Do 26. und Fr 27.11. (KW 48), Fest ohne Frage
  await put('food/termin/z1',{name:'Kita zu: Teamtag',date:'2026-11-26',to:'2026-11-27',allday:true,tag:'kita',kk:'zu',who:'kid',at:1});await put('food/termin/z2',{name:'Laternenfest',date:'2026-11-25',tag:'kita',kk:'fest',who:'kid',at:1});await A.waitForTimeout(800);
  await nav('woche|wp:3');await A.click('.evlist [data-teredit=z2]');await A.waitForSelector('#terform');r.noFest=!(await A.$('#terform [data-stayter]'));await A.click('#terform [data-act=tercancel]');await A.waitForTimeout(300);
  await A.click('.evlist [data-teredit=z1]');await A.waitForSelector('#terform [data-stayter]');await A.click('#terform [data-stayter]');await A.waitForSelector('#mbox [data-stay]');
  r.days=await A.$$eval('#mbox .stayday>span',l=>l.length);
  await A.click('#mbox [data-stay="2026-11-26|p0|"]');await A.waitForTimeout(400);await A.click('#mbox [data-stay="2026-11-27|p1|vm"]');await A.waitForTimeout(400);await A.screenshot({path:out+'/wer-bleibt-daheim.png'});
  r.d3=tk('2026-W48',3);r.d4=tk('2026-W48',4);r.pressed=await A.$$eval('#mbox [data-stay][aria-pressed=true]',l=>l.map(x=>x.dataset.stay).join(','));
  await A.click('#mbox [data-stay="2026-11-26|clear|"]');await A.waitForTimeout(400);r.d3b=tk('2026-W48',3);await A.click('#mbox [data-stayx]');await A.waitForTimeout(300);r.closed=!(await A.$('#mbox'));
  // Neu speichern bietet die Frage per Toast an
  await A.click('#terform button[type=submit]');await A.waitForTimeout(500);r.toast=await A.$eval('.toast, #toast',e=>e.innerText).catch(()=>'');
  // Kita-Seite: Knopf unter der Tafel, nur ab heute
  await nav('kita|');await A.$eval('[data-stayweek]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-stayweek]');await A.waitForSelector('#mbox [data-stay]');r.wdays=await A.$$eval('#mbox .stayday>span',l=>l.length);
  r.dbg=await A.$$eval('#mbox [data-stay]',l=>l.map(x=>x.dataset.stay).join(' '));await A.click('#mbox [data-stay="2026-11-23|p0|"]').catch(()=>{});await A.waitForTimeout(400);r.fr=tk("2026-W48",0);
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.noFest&&r.days===2&&r.d3&&r.d3.by==='p0'&&!r.d3.half&&r.d4&&r.d4.by==='p1'&&r.d4.half==='vm'&&r.pressed==='2026-11-26|p0|,2026-11-27|p1|vm'&&!r.d3b&&r.closed&&/Wer bleibt daheim/.test(r.toast)&&r.wdays===5&&r.fr&&r.fr.by==='p0'?'DAHEIM OK':'DAHEIM FAIL');
  await b.close();process.exit(0)});
