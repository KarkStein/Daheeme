srv.listen(8765,async()=>{
  // Termine mit mehreren Möglichkeiten (Florian 16.11.2026): anlegen, gestrichelt im Kalender, Glocke, wählen, Hinweis, abstimmen, „Passt keiner“, später ändern
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const p=await c.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');const link=A.url();await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const B=await mk();await B.goto(link);await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');await B.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(link)[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async(P,v)=>{await P.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await P.click("#zz");await P.waitForTimeout(400)};
  const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const badge=P=>P.$eval('.bellnav .badge',e=>+e.innerText).catch(()=>0);
  // 1) Anlegen mit zwei weiteren Möglichkeiten; Vorgabe: der andere wählt
  await nav(A,'woche|wp:3');await A.evaluate(()=>{const b=document.createElement("button");b.dataset.act="ternew";b.id="zn";document.getElementById("app").appendChild(b)});await A.click('#zn');await A.waitForTimeout(300);
  await A.fill('#ter-name','Kita-Gespräch');await A.fill('[data-terf=date]',day(5));await A.fill('[data-terf=time]','08:30');
  await A.click('[data-act=teraltadd]');await A.fill('[data-teralt="0"][data-k=date]',day(6));await A.click('[data-act=teraltadd]');await A.fill('[data-teralt="1"][data-k=date]',day(8));await A.fill('[data-teralt="1"][data-k=time]','14:00');
  r.askDef=await A.$eval('[data-terask][aria-pressed=true]',e=>e.dataset.terask);await A.fill('[data-terf=askdue]',day(3));
  await A.screenshot({path:out+'/termin-moeglichkeiten-anlegen.png',fullPage:true});
  await A.click('#terform button[type=submit]');await A.waitForTimeout(500);
  const id=Object.keys(db().termin||{})[0];let T=db().termin[id];r.saved=[(T.alt||[]).length,T.ask&&T.ask.who,T.ask&&T.ask.from,T.ask&&T.ask.due===day(3)].join();
  // 2) Kalender: drei gestrichelte Einträge
  await A.click('[data-calview=liste]');await A.waitForTimeout(300);r.tent=await A.$$eval('.evlist li.tent',l=>l.length);r.tentTxt=await A.$eval('.evlist li.tent',e=>e.innerText).catch(()=>'');
  await A.screenshot({path:out+'/termin-moeglichkeiten-kalender.png'});
  r.bellA=await badge(A);
  // 3) B: Glocke zählt, Wichtig zeigt „Bitte wählen“, wählt Möglichkeit 3
  await B.waitForTimeout(400);await nav(B,'start|');r.bellB=await badge(B);await nav(B,'wichtig|');r.card=await B.$eval('#app',e=>/Bitte wählen/.test(e.innerText)&&/Bitte Termin wählen: 3 Möglichkeiten/.test(e.innerText));
  await B.click(`[data-chopen="termin|${id}"]`);await B.waitForSelector('#mbox [data-chpick]');await B.screenshot({path:out+'/termin-moeglichkeiten-waehlen.png'});
  await B.click('#mbox [data-chpick="2"]');await B.waitForTimeout(500);T=db().termin[id];r.pick=[T.date===day(8),T.time,!T.ask,T.told&&T.told.by,(T.alt||[]).map(o=>o.date).join('|')===day(5)+'|'+day(6)].join();
  // 4) A bekommt den Hinweis, „Gesehen“ nimmt ihn weg
  await A.waitForTimeout(400);await nav(A,'wichtig|');r.bellA2=await badge(A);r.told=await A.$eval('#app',e=>/hat .*gewählt/.test(e.innerText));
  await A.click(`[data-chseen="termin|${id}"]`);await A.waitForTimeout(400);r.seen=db().termin[id].told.seen.p0===true;r.bellA3=await badge(A);
  // 5) Später ändern: im Termin „Andere Möglichkeit nehmen“
  await nav(A,'woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(200);await A.click(`[data-teredit="${id}"]`);await A.waitForTimeout(300);await A.click(`#terform [data-chopen="termin|${id}"]`);await A.waitForSelector('#mbox [data-chpick]');await A.click('#mbox [data-chpick="1"]');await A.waitForTimeout(500);
  T=db().termin[id];r.change=T.date===day(5)&&(T.alt||[]).length===2;
  // 6) Beide stimmen ab
  await put('food/termin/v1',{name:'Abstimmung',date:day(10),alt:[{date:day(11)}],ask:{who:'both',from:'p0',at:1},at:1});await A.waitForTimeout(400);
  await nav(A,'wichtig|');await A.click('[data-chopen="termin|v1"]');await A.waitForSelector('#mbox [data-chpick]');await A.click('#mbox [data-chpick="1"]');await A.waitForTimeout(400);r.vote1=JSON.stringify(db().termin.v1.ask.votes);
  await B.waitForTimeout(300);await nav(B,'wichtig|');await B.click('[data-chopen="termin|v1"]');await B.waitForSelector('#mbox [data-chpick]');await B.click('#mbox [data-chpick="1"]');await B.waitForTimeout(400);T=db().termin.v1;r.vote2=[T.date===day(11),!T.ask].join();
  // 7) Passt keiner: zurück an den, der gefragt hat
  await put('food/termin/n1',{name:'Zahnarzt',date:day(12),alt:[{date:day(13)}],ask:{who:'p1',from:'p0',at:1},at:1});await B.waitForTimeout(400);
  await nav(B,'wichtig|');await B.click('[data-chopen="termin|n1"]');await B.waitForSelector('#mbox [data-chback]');await B.click('#mbox [data-chback]');await B.waitForTimeout(400);T=db().termin.n1;r.back=[T.ask.who,T.ask.back&&T.ask.back.by].join();
  // 8) Wahl aufheben: mit gemerktem Stand (v1, beide stimmten ab) und bei einer älteren Wahl ohne Stand (Termin aus 5)
  await nav(A,'woche|wp:3');await A.click('[data-calview=liste]',{timeout:1500}).catch(()=>{});await A.waitForTimeout(200);await A.click('[data-teredit="v1"]');await A.waitForTimeout(300);await A.click('#terform [data-chopen="termin|v1"]');await A.waitForSelector('#mbox [data-chundo]');await A.click('#mbox [data-chundo]');await A.waitForTimeout(500);
  T=db().termin.v1;r.undo1=[T.date===day(10),(T.alt||[]).length,T.ask&&T.ask.who,!T.told,!T.was].join();
  await nav(A,'woche|wp:3');await A.click('[data-calview=liste]',{timeout:1500}).catch(()=>{});await A.waitForTimeout(200);await A.click(`[data-teredit="${id}"]`);await A.waitForTimeout(300);await A.click(`#terform [data-chopen="termin|${id}"]`);await A.waitForSelector('#mbox [data-chundo]');await A.click('#mbox [data-chundo]');await A.waitForTimeout(500);
  T=db().termin[id];r.undo2=[(T.alt||[]).length,T.ask&&T.ask.who,!T.told].join();r.tent2=await A.$$eval(`li.tent [data-chopen="termin|${id}"]`,l=>l.length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.askDef==='p1'&&r.saved==='2,p1,p0,true'&&r.tent===3&&/\? Kita-Gespräch \(1 von 3\)/.test(r.tentTxt)&&r.bellA===0&&r.bellB>=1&&r.card&&r.pick==='true,14:00,true,p1,true'&&r.bellA2>=1&&r.told&&r.seen&&r.bellA3===0&&r.change&&r.vote1==='{"p0":1}'&&r.vote2==='true,true'&&r.back==='p0,p1'&&r.undo1==='true,1,both,true,true'&&r.undo2==='2,p0,true';
  console.error(ok?'AUSWAHL OK':'AUSWAHL FAIL');await b.close();srv.close();process.exit(0)});
