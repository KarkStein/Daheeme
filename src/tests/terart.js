srv.listen(8765,async()=>{
  // Florian 16.11.2026: Familywall-Fenster auf kleinem Handy (Titel erreichbar, kein „..“, Abstand vor den Knöpfen) und eigene Termin-Art lange drücken = löschen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const t=new Date();t.setDate(t.getDate()+3);const k=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
  setAt(['haushalt',key,'food','cats','ter','c1'],{ic:'🏊',name:'Schwimmen',at:1});setAt(['haushalt',key,'food','cats','ter','c2'],{ic:'🎻',name:'Geige',at:2});
  setAt(['haushalt',key,'food','termin','t1'],{name:'Schwimmkurs',date:k,time:'15:00',who:'kid',tag:'c1',at:1});
  setAt(['haushalt',key,'food','ext','fw'],{at:1,n:1,items:{f1:{name:'Geburtstagsfeier bei den Nachbarn mit Kuchen',date:k}}});setAt(['haushalt',key,'food','ext','fwx','f1'],{tag:'c1'});
  await A.reload();await A.waitForTimeout(800);
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  await A.click('[data-fwpick=f1]');await A.waitForSelector('#mbox [data-ebk=tag]');
  r.titleTop=await A.$eval('#mbox h2',e=>Math.round(e.getBoundingClientRect().top));r.scrolls=await A.$eval('#mbox .mboxcard',e=>e.scrollHeight>e.clientHeight&&e.getBoundingClientRect().top>=0);
  r.note=await A.$eval('#mbox .editbox>.freq',e=>e.innerText);
  await A.screenshot({path:out+'/familywall-fenster-oben.png'});
  await A.$eval('#mbox .mboxcard',e=>{e.scrollTop=e.scrollHeight});await A.waitForTimeout(100);
  r.gap=await A.evaluate(()=>{const f=[...document.querySelectorAll('#mbox .editbox>.fld')].pop(),bt=document.querySelector('#mbox .editbox>.btnrow');return Math.round(bt.getBoundingClientRect().top-f.getBoundingClientRect().bottom)});
  await A.click('#mbox [data-ebk=remind][data-ebv="1h"]');await A.waitForTimeout(100);r.keepScroll=await A.$eval('#mbox .mboxcard',e=>e.scrollTop>50);
  await A.screenshot({path:out+'/familywall-fenster-unten.png'});
  // lange auf die eigene Art „Schwimmen“ im Familywall-Fenster drücken
  r.hint=await A.$eval('#mbox',e=>/lange drücken = löschen/.test(e.innerText));
  const bb=await A.$eval('#mbox [data-ebk=tag][data-ebv=c1]',e=>{e.scrollIntoView({block:'center'});const q=e.getBoundingClientRect();return {x:q.x+q.width/2,y:q.y+q.height/2}});
  await A.mouse.move(bb.x,bb.y);await A.mouse.down();await A.waitForTimeout(650);await A.mouse.up();await A.waitForTimeout(200);
  r.stillOpen=!!(await A.$('#mbox'));r.pressedAfter=await A.$eval('#mbox [data-ebk=tag][data-ebv=c1]',e=>e.getAttribute('aria-pressed')).catch(()=>'weg');
  r.toast=await A.$eval('#toast',e=>e.innerText);await A.click('#toast .toastbtn');await A.waitForTimeout(400);
  r.chipGone=!(await A.$('#mbox [data-ebk=tag][data-ebv=c1]'));r.keine=await A.$eval('#mbox [data-ebk=tag][data-ebv=""]',e=>e.getAttribute('aria-pressed'));
  {const d=db();r.dbCat=!!((d.cats||{}).ter||{}).c1;r.dbTer=(d.termin.t1||{}).tag||null;r.dbFw=((d.ext.fwx||{}).f1||{}).tag||null}
  await A.click('#mbox [data-ebx]');await A.waitForTimeout(200);
  // Termin-Maske: lange auf „Geige“
  await A.click('[data-act=ternew]');await A.waitForTimeout(300);r.hint2=await A.$eval('#app',e=>/lange drücken = löschen/.test(e.innerText));
  await A.click('[data-tertag=c2]');await A.waitForTimeout(150);
  const b2=await A.$eval('[data-tertag=c2]',e=>{e.scrollIntoView({block:'center'});const q=e.getBoundingClientRect();return {x:q.x+q.width/2,y:q.y+q.height/2}});
  await A.mouse.move(b2.x,b2.y);await A.mouse.down();await A.waitForTimeout(650);await A.mouse.up();await A.waitForTimeout(200);await A.click('#toast .toastbtn');await A.waitForTimeout(400);
  r.chip2Gone=!(await A.$('[data-tertag=c2]'));r.dbCat2=!!((db().cats||{}).ter||{}).c2;r.draftKept=await A.$('#ter-name')!==null;
  r.tabIcon=await A.$eval('#tabs [data-tab=camp] svg',e=>e.innerHTML);
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&r.titleTop>=0&&r.scrolls&&!/\.\./.test(r.note)&&r.gap>=8&&r.keepScroll&&r.hint&&r.stillOpen&&r.pressedAfter==='true'&&/Schwimmen/.test(r.toast)
    &&r.chipGone&&r.keine==='true'&&!r.dbCat&&!r.dbTer&&!r.dbFw&&r.hint2&&r.chip2Gone&&!r.dbCat2&&r.draftKept&&!/M3 20 12 4/.test(r.tabIcon);
  console.log(ok?'TERART OK':'TERART FAIL');
  await b.close();process.exit(0)});
