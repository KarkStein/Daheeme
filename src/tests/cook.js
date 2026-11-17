srv.listen(8765,async()=>{
  // Essen auswählen: aus "noch kein Essen" zu den Rezepten, Auswahl landet im Wochenplan bei heute; sonst Tag wählen
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  setAt(['haushalt',key,'food','rec','r1'],{name:'Linsencurry',ing:'200 g Linsen\n1 Dose Kokosmilch',at:1});setAt(['haushalt',key,'food','rec','r2'],{name:'Ofengemüse',ing:'1 kg Gemüse',at:2});
  await A.reload();await A.waitForTimeout(800);
  // Start: Kurzfassung "noch kein Essen geplant"
  await A.click('.todayrow[data-mealfor]');await A.waitForTimeout(300);r.banner=!!(await A.$('.mealfor'));
  await A.click('[data-cook="rec|r1"] >> nth=0');await A.waitForTimeout(300);await A.click('#mbox [data-cday="0"]');await A.waitForTimeout(500);
  const P=()=>((db().food||{}).plan||{})['2026-W47']||{};r.d2=(P().d2||{}).text+'|'+(P().d2||{}).rec;r.h1=await A.$eval('.fdish',e=>e.innerText).catch(()=>'?');r.toast=await A.$eval('#toast',e=>e.innerText).catch(()=>'');
  await A.screenshot({path:out+'/essen-heute-gewaehlt.png'});
  // ohne Hinweis: Tag wählen (Morgen)
  await nav('essen|ft:rezepte');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}r.nobanner=!(await A.$('.mealfor'));await A.click('[data-cook="rec|r2"] >> nth=0');await A.waitForTimeout(300);r.days=await A.$$eval('#mbox [data-cday]',l=>l.length);
  await A.screenshot({path:out+'/essen-tag-waehlen.png'});
  await A.click('#mbox [data-cday="1"]');await A.waitForTimeout(400);r.d3=(P().d3||{}).text;
  // Dashboard-Hinweis nach Leeren
  await put('food/plan/2026-W47/d2',null);await A.waitForTimeout(500);await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(900);r.mf=await A.$$eval('[data-mealfor]',l=>l.map(x=>x.className));await A.click('.todayrow[data-mealfor]');await A.waitForTimeout(300);r.banner2=!!(await A.$('.mealfor'));
  await A.click('[data-cook="rec|r2"] >> nth=0');await A.waitForTimeout(300);await A.click('#mbox [data-cday="0"]');await A.waitForTimeout(400);r.d2b=(P().d2||{}).text;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.banner&&r.d2==='Linsencurry|r1'&&/Linsencurry/.test(r.h1)&&r.nobanner&&r.days===7&&r.d3==='Ofengemüse'&&r.banner2&&r.d2b==='Ofengemüse';
  console.error(ok?'COOK OK':'COOK FAIL');await b.close();srv.close();process.exit(0)});
