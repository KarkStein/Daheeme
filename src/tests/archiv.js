// Archiv der Recherchen (Florian 21.11.2026): Rezepte nur in der Rezept-Datenbank über „🗄️ Auch Archiv“, frühere Ausflugstipps unten in „Was ist los“
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2]||'/tmp';
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  const T=new Date(),y=T.getFullYear(),pad=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),add=n=>{const d=new Date(T);d.setDate(d.getDate()+n);return iso(d)};
  const lastYear=n=>{const d=new Date(T);d.setFullYear(y-1);d.setDate(d.getDate()+n);return iso(d)};
  const REZ={updated:add(0),n:3,items:[
    {name:'Warmer Kürbissalat mit Kichererbsen',source:'beispiel.de',link:'https://beispiel.de/kuerbissalat',ing:['600 g Kürbis','200 g Kichererbsen','150 g Joghurt'],min:40,from:['tag'],first:add(-3),last:add(-3)},
    {name:'Kürbis-Risotto',source:'beispiel.de',link:'https://beispiel.de/risotto',ing:['300 g Risottoreis','500 g Kürbis','1 Zwiebel'],min:35,from:['woche'],first:add(-7),last:add(-7)},
    {name:'Linsensuppe',source:'beispiel.de',link:'https://beispiel.de/linsen',ing:['250 g Linsen','2 Möhren'],min:30,from:['tag'],first:add(-5),last:add(-5)},
    {name:'Kürbissuppe',source:'beispiel.de',link:'',ing:['1 Kürbis'],from:['tag'],first:add(-6),last:add(-6)}]};
  const AUS={updated:add(0),n:3,items:[
    {name:'Kinderflohmarkt im Park',where:'stadt',io:'draussen',cat:'flohmarkt',date:add(-10),first:add(-14),last:add(-14)},
    {name:'Lichterfest im Tiergarten',where:'stadt',io:'draussen',cat:'tiere',from:lastYear(3),to:lastYear(5),first:lastYear(-2),last:lastYear(-2)},
    {name:'Sommerfest am See',where:'umland',io:'draussen',cat:'fest',date:lastYear(150),first:lastYear(140),last:lastYear(140)},
    {name:'Laufender Markt',where:'stadt',io:'draussen',cat:'fest',to:add(20),first:add(-2),last:add(-2)}]};
  const TIPS={updated:add(0),items:[{name:'Laufender Markt',where:'stadt',io:'draussen',cat:'fest',to:add(20)}]};
  await A.route(/archiv\/rezepte\.json/,r=>r.fulfill({contentType:'application/json',body:JSON.stringify(REZ)}));
  await A.route(/archiv\/ausfluege\.json/,r=>r.fulfill({contentType:'application/json',body:JSON.stringify(AUS)}));
  await A.route(/ausflugtipps\.json/,r=>r.fulfill({contentType:'application/json',body:JSON.stringify(TIPS)}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await put('food/tagfix',{auto:true});
  await put('food/rec/r1',{name:'Kürbissuppe',ing:'1 Kürbis\n1 Zwiebel',at:1});
  await put('food/rec/r2',{name:'Ofenkürbis mit Feta',ing:'1 Kürbis\n200 g Feta',at:2});
  await A.waitForTimeout(500);const r={};
  await A.click('#tabs [data-tab=essen]');await A.click('[data-food=rezepte]');await A.waitForTimeout(200);
  r.noArchBefore=!(await A.$('.archcard, .archhint, .archchip'));
  await A.click('[data-act=rdbopen]');await A.waitForTimeout(500);
  r.chip0=await A.$eval('.archchip',e=>e.innerText.replace(/\s+/g,' '));r.card0=!(await A.$('.archcard'));
  await A.fill('#rdbq','kürbis');await A.waitForTimeout(400);
  r.own=await A.$$eval('.rdblist li b',l=>l.map(x=>x.textContent));r.hint=await A.$eval('.archhint',e=>e.innerText.replace(/\s+/g,' '));
  await A.screenshot({path:out+'/archiv-rezepte-aus.png'});
  await A.click('.archchip');await A.waitForTimeout(300);
  r.arch=await A.$$eval('.archcard li b',l=>l.map(x=>x.textContent));r.head=await A.$eval('.section-head .num',e=>e.textContent);r.chip1=await A.$eval('.archchip',e=>e.innerText.trim());
  await A.$eval('.archcard',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/archiv-rezepte-an.png'});
  // Kochen aus dem Archiv
  await A.click('.archcard [data-cook]');await A.waitForTimeout(400);r.cookWin=await A.$eval('#mbox',e=>e.innerText.slice(0,200)).catch(()=>'');
  await A.keyboard.press('Escape');await A.waitForTimeout(300);
  // In eure Rezepte holen
  await A.click('.archcard [data-archtake]');await A.waitForSelector('#mbox .mboxcard');await A.waitForTimeout(200);
  await A.click('#mbox .primary');await A.waitForTimeout(800);
  r.taken=Object.values(db().rec||{}).map(x=>x.name).sort();r.archAfter=await A.$$eval('.archcard li b',l=>l.map(x=>x.textContent));
  // Ausflüge: Frühere Tipps
  await nav('ausflug|tt:ideen');await A.waitForTimeout(300);
  if(!(await A.$('[data-act=archaus]'))){await A.click('[data-tfold=atip]');await A.waitForTimeout(400)}
  r.ausRow=await A.$eval('[data-act=archaus]',e=>e.innerText.replace(/\s+/g,' '));
  await A.click('[data-act=archaus]');await A.waitForTimeout(400);
  r.ausAll=await A.$$eval('#archausl li b',l=>l.map(x=>x.textContent.trim()));
  await A.$eval('[data-act=archaus]',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/archiv-ausfluege.png'});
  await A.click('[data-archausf=jz]');await A.waitForTimeout(300);r.ausJz=await A.$$eval('#archausl li b',l=>l.map(x=>x.textContent.trim()));
  await A.click('[data-archausf=""]');await A.waitForTimeout(300);
  await A.fill('#archausq','floh');await A.waitForTimeout(300);r.ausQ=await A.$$eval('#archausl li b',l=>l.map(x=>x.textContent.trim()));r.focus=await A.evaluate(()=>document.activeElement&&document.activeElement.id);
  await A.click('#archausl [data-archmerk]');await A.waitForTimeout(400);r.merk=await A.$eval('#tr-name',e=>e.value).catch(()=>'');
  console.log(JSON.stringify(r,null,1),errs);
  const ok=!errs.length&&r.noArchBefore&&/Auch Archiv 3/.test(r.chip0)&&r.card0&&r.own.length===2&&/2 weitere im Archiv/.test(r.hint)
    &&r.arch.join()==='Kürbis-Risotto,Warmer Kürbissalat mit Kichererbsen'&&/2 \+ 2/.test(r.head)&&/✕/.test(r.chip1)&&/Kürbis-Risotto|Warmer/.test(r.cookWin)
    &&r.taken.length===3&&r.archAfter.length===1&&/Frühere Tipps \(3\)/.test(r.ausRow)&&r.ausAll.length===3&&!r.ausAll.some(x=>/Laufender/.test(x))
    &&r.ausJz.length===2&&r.ausJz.some(x=>/Lichterfest/.test(x))&&!r.ausJz.some(x=>/Sommerfest/.test(x))&&r.ausQ.length===1&&r.focus==='archausq'&&/Kinderflohmarkt/.test(r.merk);
  console.error(ok?'ARCHIV OK':'ARCHIV FAIL');await b.close();srv.close();process.exit(0)});
