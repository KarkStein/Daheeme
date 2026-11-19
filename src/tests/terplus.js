srv.listen(8765,async()=>{
  // Gemeinsame Felder und Anlegen aus dem Termin (Florian 19.11.2026): gleiche Feldnamen, untere Zeile, Ausflug mit „Mehr Angaben“, ＋ Packliste/Einkauf/Erinnerung, Feier mit „🎁 Geschenk dazu“
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-19T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.addInitScript(()=>{try{localStorage.setItem('hq-tfold','{}')}catch(_){}});
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(800);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});const F=()=>get(['haushalt',key,'food'])||{};
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(600)};
  await put('food/termin/f1',{name:'Geburtstag Oma',date:'2026-12-05',time:'15:00',tag:'feier',at:1});await put('food/termin/a1',{name:'Zahnarzt',date:'2026-11-25',time:'09:00',tag:'arzt',at:1});
  await put('food/trip/t1',{name:'Wildpark',kind:'tier',wx:'sonne',at:1,done:false});await A.waitForTimeout(800);
  // Termin Feier
  await nav('woche|wp:3');await A.click('.evlist [data-teredit=f1]');await A.waitForSelector('#terform');
  r.labels=await A.$$eval('#terform .fld>span',l=>l.map(x=>x.textContent.trim()));
  r.plus=await A.$$eval('#terform .terplus [data-terplus]',l=>l.map(x=>x.dataset.terplus.split('|')[0]).join(','));r.foot=await A.$eval('#terform .maskfoot .mfrow',e=>e.innerText.trim());
  r.footLast=await A.$eval('#terform',e=>e.lastElementChild.className);
  await A.$eval('#terform .maskfoot',e=>e.scrollIntoView({block:'center'}));await A.waitForTimeout(200);await A.screenshot({path:out+'/termin-dazu-anlegen.png'});
  await A.click('[data-terplus="gift|f1"]');await A.waitForSelector('#mbox [data-ebf=name]');await A.fill('#mbox [data-ebf=name]','Bildband');await A.screenshot({path:out+'/termin-geschenk.png'});await A.click('#mbox button[type=submit]');await A.waitForTimeout(700);
  r.idea=Object.values(F().idea||{}).find(i=>i.ref==='ter:f1');r.prio=Object.values(F().prio||{}).find(p=>p.ref==='ter:f1');
  // Einkauf
  await A.click('[data-terplus="shop|f1"]');await A.waitForSelector('#mbox [data-ebf=items]');await A.fill('#mbox [data-ebf=items]','Kuchen, Kerzen');await A.click('#mbox button[type=submit]');await A.waitForTimeout(700);
  r.shop=Object.values(F().shop||{}).filter(s=>s.src==='Geburtstag Oma').map(s=>s.name).sort().join(',');
  r.verk=await A.$eval('#terform .verk:not(.terplus)',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'');
  // Arzt: kein Geschenk; Erinnerung öffnet die Maske, ref bleibt
  await A.click('#terform [data-act=tercancel]');await A.waitForTimeout(300);await A.click('.evlist [data-teredit=a1]');await A.waitForSelector('#terform');r.noGift=!(await A.$('[data-terplus^="gift"]'));
  await A.click('[data-terplus="prio|a1"]');await A.waitForSelector('#pm-name');r.pmName=await A.$eval('#pm-name',e=>e.value);r.pmDue=await A.$eval('#pm-due',e=>e.value);r.pmLab=await A.$eval('label:has(#pm-name) span',e=>e.textContent);
  await A.click('[data-act=pmsave]');await A.waitForTimeout(600);r.prio2=Object.values(F().prio||{}).find(p=>p.ref==='ter:a1');
  // Packliste
  await nav('woche|wp:3');await A.click('.evlist [data-teredit=a1]');await A.waitForSelector('#terform');await A.click('[data-terplus="pack|a1"]');await A.waitForTimeout(700);r.pack=(F().packlist||{}).t_a1;r.packH=await A.$eval('#app',e=>/Zahnarzt/.test(e.innerText));
  // Ausflug-Maske: Reihenfolge, Mehr Angaben
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.tripedit="t1";b.id="zt";document.getElementById("app").appendChild(b)});await A.click('#zt');await A.waitForSelector('#tr-name');
  r.trip=await A.$$eval('.tripform .fld>span',l=>l.map(x=>x.textContent.trim().split(' (')[0]));r.more=await A.$eval('.tripform .moreb',e=>e.innerText);
  await A.click('.tripform [data-tset=who][data-v=kid]');await A.waitForTimeout(200);await A.screenshot({path:out+'/ausflug-maske.png',fullPage:true});
  await A.click('.tripform .moreb');await A.waitForTimeout(300);r.trip2=await A.$$eval('.tripform .fld>span',l=>l.map(x=>x.textContent.trim().split(' (')[0]));
  await A.click('[data-act=tripsave]');await A.waitForTimeout(600);r.who=((F().trip||{}).t1||{}).who;r.wx=((F().trip||{}).t1||{}).wx;
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&r.labels.includes('Was')&&r.labels.includes('Wo')&&r.labels.includes('Für wen')&&r.labels.includes('🔔 Erinnern')&&r.plus==='gift,pack,shop,prio'&&/Löschen/.test(r.foot)&&r.footLast==='maskfoot'&&r.idea&&r.idea.name==='Bildband'&&r.idea.cat==='geschenk'&&r.prio&&r.prio.due==='2026-11-28'&&r.shop==='Kerzen,Kuchen'&&/Bildband/.test(r.verk)&&/Einkaufsliste/.test(r.verk)&&r.noGift&&r.pmName==='Zahnarzt'&&r.pmDue==='2026-11-24'&&r.pmLab==='Was'&&r.prio2&&r.pack&&r.packH&&r.trip.slice(0,6).join(',')==='Was,Symbol,Wann,Für wen,Wo,Art'&&!r.trip.includes('Wetter')&&/1 ausgefüllt/.test(r.more)&&r.trip2.includes('Wetter')&&r.who==='kid'&&r.wx==='sonne';
  console.log(ok?'TERPLUS OK':'TERPLUS FAIL');
  await b.close();process.exit(0)});
