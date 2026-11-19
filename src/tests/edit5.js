srv.listen(8765,async()=>{
  // Vorschläge 1-5 (Florian 15.11.2026): Weitere Listen und Ausgaben bearbeiten, Termin-Glocke vorher, + Termin im Dashboard, Glocke führt zur einen Maske
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const F=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await put('food/buy/b1',{name:'Mütze',list:'kleidung',done:false,at:1});await put('food/split/s1',{name:'Grupe',link:'',at:1});
  await put('food/termin/t1',{name:'Zahnarzt',date:'2026-11-19',time:'09:00',remind:'1d',at:1});await put('food/termin/t2',{name:'Friseur',date:'2026-11-20',time:'09:00',remind:'1h',at:1});await A.waitForTimeout(500);
  // 1 Weitere Listen
  await nav('einkauf|bl:kleidung');await A.click('[data-buyedit=b1]');await A.fill('#mbox [data-ebf=name]','Wintermütze');await A.click('#mbox [data-ebk=for][data-ebv=kid]');await A.click('#mbox [data-ebk=list][data-ebv=geschenke]');await A.click('#mbox [type=submit]');await A.waitForTimeout(400);
  const bb=(F().buy||{}).b1||{};r.buy=bb.name+'|'+bb.for+'|'+bb.list;
  // 2 Ausgaben
  await nav('ausgaben|');await A.click('[data-splitedit=s1]');await A.fill('#mbox [data-ebf=name]','Gruppe Urlaub');await A.fill('#mbox [data-ebf=link]','splitwise.com/groups/5');await A.click('#mbox [type=submit]');await A.waitForTimeout(400);
  const sp=(F().split||{}).s1||{};r.split=sp.name+'|'+sp.link;
  // 3 Glocke: 1 Tag vorher zählt (morgen 14 Uhr), 1 Stunde vorher übermorgen nicht
  await nav('wichtig|');r.bellT=await A.$$eval('.evlist [data-teredit]',l=>l.map(x=>x.innerText.split('\n')[0]));
  // 4 + Termin im Dashboard
  await nav('camp|');await A.evaluate(()=>window.hqMedal&&window.hqMedal(true));await A.waitForTimeout(800);await A.click('.medback .bmore');await A.waitForTimeout(300);await A.click('[data-act=ternewgo]');await A.waitForTimeout(300);r.terform=!!(await A.$('#terform'));r.rem=await A.$$eval('#terform [data-terrem]',l=>l.length);
  await A.fill('#ter-name','Elternabend');await A.click('#terform [data-terrem="1h"]');await A.click('#terform [type=submit]');await A.waitForTimeout(400);r.newrem=Object.values(F().termin||{}).filter(x=>x.name==='Elternabend').map(x=>x.remind).join();
  // 5 Glocke an einem Eintrag: Toast führt zur einen Maske
  await put('food/rec/r1',{name:'Testsuppe',ing:'',at:1});await A.waitForTimeout(300);await nav('essen|ft:rezepte');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}await A.click('.bellbtn[data-prio="rezepte|r1"]');await A.waitForTimeout(300);r.toast=await A.$eval('#toast',e=>e.innerText);
  await A.click('#toast .toastbtn');await A.waitForTimeout(300);r.mask=await A.$eval('#app h1, #app h2',e=>e.innerText).catch(()=>'');r.maskname=await A.$eval('#app input',e=>e.value).catch(()=>'');
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.buy==='Wintermütze|kid|geschenke'&&r.split==='Gruppe Urlaub|https://splitwise.com/groups/5'&&r.bellT.some(t=>/Zahnarzt/.test(t))&&!r.bellT.some(t=>/Friseur/.test(t))&&r.terform&&r.rem===4&&r.newrem==='1h'&&/Wichtig/.test(r.toast)&&/Testsuppe/.test(r.maskname);
  console.error(ok?'EDIT5 OK':'EDIT5 FAIL');await b.close();srv.close();process.exit(0)});
