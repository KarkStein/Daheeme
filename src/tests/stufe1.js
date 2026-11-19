srv.listen(8765,async()=>{
  // Stufe 1 (Florian 17.11.2026): Kochbücher klappbar, „Was ist los“ klappbar, Wischen auf Filterzeilen, Merken-Fenster, Geschenke unter Wir, Sammlung
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:1,timezoneId:'Europe/Berlin',hasTouch:true});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.clock.setFixedTime(new Date('2026-11-17T09:00:00+01:00'));
  await A.route('**/ausflugtipps.json',q=>q.fulfill({contentType:'application/json',body:JSON.stringify({updated:'2026-11-15',region:'München',items:[{name:'Laternenumzug im Park',run:'woche',where:'stadt',io:'draussen',cat:'feste',date:'2026-11-19'},{name:'Martinsfeuer',run:'woche',where:'stadt',io:'draussen',cat:'natur',date:'2026-11-20'}]})}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('book/b1',{name:'Suppen',at:1});await put('book/b2',{name:'Backen',at:2});
  await put('rec/r1',{name:'Linsensuppe',ing:'250 g rote Linsen',book:'b1',at:1});await put('rec/r2',{name:'Pfannkuchen',ing:'2 Eier',at:2});
  await put('urlaub/u1',{name:'Bretagne Sommer',state:'aktuell',emo:'⛵',at:1});
  await A.waitForTimeout(500);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  // Kochbücher: zu = vier Kacheln, keine Rezepte; auf = alle Kochbücher und Rezepte
  await nav('essen|ft:rezepte');
  r.zuTiles=await A.$$eval('.bookcard .tile',l=>l.map(x=>x.innerText.split('\n').filter(Boolean)[1]||x.innerText));r.zuRec=await A.$$eval('[data-rec]',l=>l.length);
  await A.click('.bookcard [data-act=bookstog]');await A.waitForTimeout(200);
  r.aufBooks=await A.$$eval('.bookcard [data-book]',l=>l.length);r.aufRec=await A.$$eval('[data-rec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  await A.click('.bookcard [data-book=b1]');await A.waitForTimeout(200);r.b1Rec=await A.$$eval('[data-rec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  await A.click('.bookcard [data-book=b1]');await A.waitForTimeout(200);r.zuAgain=await A.$$eval('[data-rec]',l=>l.length);
  // Was ist los: klappbar
  await nav('ausflug|');r.atipOpen=!!(await A.$('.atip .atipf'));r.atipN=await A.$eval('.atip [data-tfold=atip] h2',e=>e.innerText);
  await A.click('.atip [data-tfold=atip]');await A.waitForTimeout(200);r.atipClosed=!(await A.$('.atip .atipf'))&&!!(await A.$('.atip [data-tfold=atip]'));
  await A.click('.atip [data-tfold=atip]');await A.waitForTimeout(200);r.atipBack=!!(await A.$('.atip .atipf'));
  // Wischen: auf einer Filterzeile bleibt man im Bereich, woanders wechselt es weiter
  const swipe=(sel,back)=>A.evaluate(([sel,back])=>{const el=document.querySelector(sel);const R=el.getBoundingClientRect(),y=R.top+R.height/2;
    const mk=(x)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});const x0=back?80:300,x1=back?300:80;el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[mk(x0)],changedTouches:[mk(x0)]}));
    el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[mk(x1)]}))},[sel,!!back]);
  const h1=()=>A.$eval('#app h1',e=>e.innerText);
  r.rowScrolls=await A.$eval('.atip .unl.scrollrow',e=>e.scrollWidth>e.clientWidth);
  await swipe('.atip .unl.scrollrow .chipbtn');await A.waitForTimeout(300);r.afterRow=await h1();
  await swipe('#app h1');await A.waitForTimeout(400);r.afterH1=await h1();r.afterTab=await A.$eval('.uwtabs [aria-pressed=true]',e=>e.innerText);
  // Seiten im Reiter (Florian 17.11.2026): Essen Seite 1 → Rezepte, dort weiter nichts, zurück wieder Seite 1
  await nav('essen|');const pg=()=>A.$eval('.pager [aria-pressed=true]',e=>e.innerText);r.e0=await pg();await swipe('#app h1');await A.waitForTimeout(300);r.e1=await pg();
  await swipe('#app h1');await A.waitForTimeout(300);r.e2=await pg();r.eH1=await h1();await swipe('#app h1',true);await A.waitForTimeout(300);r.e3=await pg();
  // Merken-Fenster: Ausflugsziel für hier → food/trip; Unterkunft im Urlaub → food/fund
  await nav('ausflug|');await A.click('[data-act=merken]');await A.waitForTimeout(200);r.merkenKinds=await A.$$eval('#mbox [data-ebk=kind]',l=>l.length);
  await A.fill('#mbox input[type=text]','Wildpark Poing');await A.click('#mbox [data-ebk=st][data-ebv=favorit]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);
  await A.click('[data-act=merken]');await A.waitForTimeout(200);await A.fill('#mbox input[type=text]','Ferienhaus am Strand');await A.click('#mbox [data-ebk=kind][data-ebv=unterkunft]');await A.click('#mbox [data-ebk=u][data-ebv=u1]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);
  const D=db();r.trip=Object.values(D.trip||{}).map(x=>x.name+(x.fav?':fav':''));r.fund=Object.values(D.fund||{}).map(x=>x.kind+':'+x.st+':'+(x.reise||'')+':'+x.name);
  r.gemerkt=await A.$$eval('.rgcard .mk .mkt b',l=>l.map(x=>x.innerText));
  // Geschenke unter Wir, Sammlung mit allem Gemerkten
  await nav('geschenke|');r.gH1=await h1();r.gPager=await A.$$eval('.pager .pdot',l=>l.map(x=>x.innerText.trim()));r.gAdv=!!(await A.$('[data-pfilter=advent]'));
  await nav('projekte|');r.sH1=await h1();r.samm=await A.$$eval('.sammcard .mk b',l=>l.map(x=>x.innerText));
  await nav('amhaus|');r.haus=await A.$$eval('.tile .tn',l=>l.map(x=>x.innerText));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.zuTiles.length===4&&r.zuRec===0&&r.aufBooks===3&&r.aufRec.includes('Pfannkuchen')&&r.b1Rec.join()==='Linsensuppe'&&r.zuAgain===0
    &&r.atipOpen&&/Was ist los \(2\)/.test(r.atipN)&&r.atipClosed&&r.atipBack
    &&r.rowScrolls&&r.afterRow==='Ausflüge und Reisen'&&r.afterH1==='Ausflüge und Reisen'&&/Packlisten/.test(r.afterTab)&&/Heute/.test(r.e0)&&r.e1==='Rezepte'&&r.e2==='Rezepte'&&r.eH1==='Essen'&&/Heute/.test(r.e3)
    &&r.merkenKinds>=8&&r.trip.includes('Wildpark Poing:fav')&&r.fund.includes('unterkunft:idee:u1:Ferienhaus am Strand')&&r.gemerkt.includes('Wildpark Poing')&&r.gemerkt.includes('Ferienhaus am Strand')
    &&r.gH1==='Geschenke'&&r.gPager.join()==='Partner,Geschenke'&&r.gAdv&&r.sH1==='Sammlung'&&r.samm.includes('Ferienhaus am Strand')&&r.haus.join()==='Einrichtung,Garten,Gemerkt';
  console.error(ok?'STUFE1 OK':'STUFE1 FAIL');await b.close();srv.close();process.exit(0)});
