srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();await p.clock.setFixedTime(new Date('2026-11-14T12:00:00'));p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const link=A.url();const B=await mk();await B.goto(link.replace('/#','/?bild=haus#'));await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  const shopRowGone=!(await A.$('.todayrow[data-go=einkauf]'));
  // Kita-Termin mit Glocke
  await A.click('.spot[data-go=kita]');await A.click('[data-kitasec=tasche]');await A.fill('#kitainput','Wechselsachen');await A.press('#kitainput','Enter');await A.waitForTimeout(300);
  await A.click('[data-prio^="kita|"]');await A.waitForTimeout(300);const pressed=await A.$eval('[data-prio^="kita|"]',e=>e.getAttribute('aria-pressed'));
  const W=async P=>{await P.evaluate(()=>{const b=document.createElement('button');b.dataset.go='wichtig';document.getElementById('app').appendChild(b);b.click()});await P.waitForTimeout(300)};
  // Idee am Haus mit Glocke
  await A.click('[data-tab=camp]');await A.click('.spot[data-go=amhaus]');await A.click('.tile[data-pfilter=wohnen]');await A.fill('#projinput','Dachrinne reinigen');await A.press('#projinput','Enter');await A.waitForTimeout(300);
  await A.click('[data-prio^="amhaus|"]');await A.waitForTimeout(300);
  // Startseite: freie Notiz und Erinnerung
  await W(A);await A.waitForSelector('#prioinput');await A.fill('#prioinput','Steuer abgeben');await A.press('#prioinput','Enter');await A.waitForTimeout(300);
  const rows=await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText.replace(/\n/g,' | ')));
  // Erinnerung für Dachrinne auf morgen
  const idx=rows.findIndex(r=>/Dachrinne/.test(r));const eds=await A.$$('.prow [data-prioedit].catbtn');await eds[idx].click();await A.fill('#pm-due','2026-11-15');await A.click('[data-act=pmsave]');await A.waitForTimeout(200);await W(A);await A.waitForTimeout(300);
  const later=await A.$$eval('.prow.later .pnm',l=>l.map(x=>x.innerText));
  await A.screenshot({path:out+'/prio-start.png',fullPage:true});
  await B.waitForTimeout(500);await W(B);const brows=await B.$$eval('.prow .pnm',l=>l.map(x=>x.innerText.split('\n')[0]));
  // B hakt Steuer ab
  const bi=brows.findIndex(r=>/Steuer/.test(r));const dn=await B.$$('[data-priodone]');await dn[bi].click();await B.waitForTimeout(400);
  const after=await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText.split('\n')[0]));
  // Tippen auf Kita-Eintrag springt in Kita
  await A.click('.prow .pnm[data-go=kita]');const h1=await A.$eval('h1',e=>e.textContent);
  const key=/k=([^&]+)/.exec(A.url())[1];await fetch('http://localhost:8765/haushalt/'+key+'/food/rec/r1.json',{method:'PUT',body:JSON.stringify({name:'Linsensuppe',ing:'Linsen',at:1})});await A.waitForTimeout(400);
  await A.click('#tabs [data-tab=essen]');await A.click('[data-food=rezepte]');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}await A.click('[data-prio="rezepte|r1"]');await A.waitForTimeout(300);
  await A.click('.bellnav');const wh=await A.$eval('h1',e=>e.textContent);const secs=await A.$$eval('.section-head h2',l=>l.map(x=>x.textContent));
  await A.click('[data-priosort=bereich]');const secs2=await A.$$eval('.section-head h2',l=>l.map(x=>x.textContent));
  await A.screenshot({path:out+'/prio-liste.png',fullPage:true});
  await A.click('[data-tab=camp]');await A.click('.startdash .bcnt[data-go=wichtig]');const wh2=await A.$eval('h1',e=>e.textContent);
  console.log({wh,secs,secs2,wh2,heute:await A.$$eval('.startdash .bcnt',l=>l.map(x=>x.innerText))});
  console.log({shopRowGone,pressed,rows,later,brows,after,h1,errs});
  const ok=!errs.length&&shopRowGone&&pressed==='true'&&rows.length===3&&rows.some(r=>/Wechselsachen/.test(r))&&later.length===1&&brows.length===3&&after.length===2&&!after.some(r=>/Steuer/.test(r))&&h1==='Kita'&&/Wichtig/.test(wh)&&secs.includes('Ohne Datum')&&secs2.length===3&&secs2.some(x=>/Rezepte/.test(x))&&/Wichtig/.test(wh2);
  console.log(ok?'PRIO OK':'PRIO FAIL');await b.close();srv.close();process.exit(0)});
