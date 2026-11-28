// Eigene Listen bei Geschenke (Florian 28.11.2026, „A: Liste als Kachel“): anlegen, darin merken, im Bearbeiten umhängen, lange drücken = löschen (Ideen bleiben)
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2]||'/tmp';
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await put('food/idea/g1',{name:'Laufrad',cat:'geschenk',who:'kid',state:'dran',at:1});
  await A.waitForTimeout(400);const r={};
  await nav('geschenke|');
  await A.$eval('[data-act=glistnew]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-act=glistnew]');await A.waitForSelector('#mbox [data-ebf=name]');
  await A.fill('#mbox [data-ebf=name]','Selbstgemacht');await A.fill('#mbox [data-ebf=emo]','✂️');await A.click('#mbox .primary');await A.waitForTimeout(600);
  const lists=()=>Object.entries((db().cats||{}).gift||{});r.lists=lists().map(x=>x[1].name);
  r.inList=await A.$eval('#app h2.m0',e=>e.textContent).catch(()=>'');
  await A.fill('#projinput','Fotobuch');await A.press('#projinput','Enter');await A.waitForTimeout(500);
  const ideas=()=>Object.values(db().idea||{});const fb=()=>ideas().find(x=>x.name==='Fotobuch')||{};
  r.fb={cat:fb().cat,glist:!!fb().glist};r.listItems=await A.$$eval('#app ul.shop li .nm',l=>l.map(x=>x.textContent.trim()));
  await A.screenshot({path:out+'/geschenke-liste-innen.png'});
  await A.click('[data-pfilter=""]');await A.waitForTimeout(400);
  r.tile=await A.$eval('[data-pfilter^="gl:"]',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>'');
  r.mainSub=await A.$$eval('#app ul.shop li .nm',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  await A.$eval('.tiles',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/geschenke-listen-kacheln.png'});
  // Laufrad in die Liste hängen über Bearbeiten
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.projedit='g1';b.id='zz2';document.getElementById('app').appendChild(b)});await A.click('#zz2');await A.waitForTimeout(400);
  const gid=lists()[0][0];await A.click(`[data-pset=glist][data-v="${gid}"]`);await A.click('[data-act=projsave]');await A.waitForTimeout(500);
  r.laufrad=(db().idea.g1||{}).glist===gid;
  // lange drücken auf die Kachel = löschen
  const e=await A.$('[data-pfilter^="gl:"]');await e.evaluate(x=>x.scrollIntoView({block:'center'}));const q=await e.boundingBox();await A.mouse.move(q.x+30,q.y+q.height/2);await A.mouse.down();await A.waitForTimeout(650);await A.mouse.up();await A.waitForTimeout(300);
  r.toast=await A.$eval('#toast',e=>e.innerText).catch(()=>'');await A.click('#toast .toastbtn');await A.waitForTimeout(700);
  r.after={lists:lists().length,ideas:ideas().length,glist:ideas().filter(x=>x.glist).length,tile:!!(await A.$('[data-pfilter^="gl:"]'))};
  console.log(JSON.stringify(r,null,1),errs);
  const ok=!errs.length&&r.lists.join()==='Selbstgemacht'&&/Selbstgemacht/.test(r.inList)&&r.fb.cat==='geschenk'&&r.fb.glist&&r.listItems.length===1&&/Selbstgemacht.*1 offen/.test(r.tile)
    &&r.mainSub.some(x=>/Fotobuch.*Selbstgemacht/.test(x))&&r.laufrad&&/Ideen darin bleiben/.test(r.toast)&&r.after.lists===0&&r.after.ideas===2&&r.after.glist===0&&!r.after.tile;
  console.error(ok?'GESCHLISTE OK':'GESCHLISTE FAIL');await b.close();srv.close();process.exit(0)});
