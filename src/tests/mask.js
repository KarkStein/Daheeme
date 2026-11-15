srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();await p.clock.setFixedTime(new Date('2026-11-14T12:00:00'));p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const link=A.url();const B=await mk();await B.goto(link.replace('/#','/?bild=haus#'));await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  // Kita: Glocke oben öffnet Maske mit Bereich Kita
  await A.click('.spot[data-go=kita]');await A.click('[data-prionew=kita]');const area=await A.$eval('[data-pmarea][aria-pressed=true]',e=>e.dataset.pmarea);
  await A.click('[data-pmtpl="Beitrag zahlen"]');await A.fill('#pm-name','Beitrag zahlen am Freitag um 8:30');const hint=await A.$eval('#pm-hint',e=>e.textContent);
  await A.click('[data-pmrep=m]');await A.screenshot({path:out+'/maske.png',fullPage:true});
  await A.click('[data-act=pmsave]');await A.waitForTimeout(300);const backTab=await A.$eval('h1',e=>e.textContent);
  // Essen: Glocke, Bereich erkannt aus freiem Text auf Startseite-Liste
  await A.click('.bellnav');await A.click('[data-prionew=frei]');await A.fill('#pm-name','übermorgen Kinderarzt anrufen um 9');await A.click('[data-act=pmsave]');await A.waitForTimeout(300);
  await A.click('[data-prionew=frei]');await A.fill('#pm-name','Fleisch für Gulasch auftauen morgen');await A.click('[data-act=pmsave]');await A.waitForTimeout(300);
  // Einlesen
  await A.click('[data-prionew=frei]');await A.fill('#pm-bulk','- Morgen Wechselkleidung in die Kita\n- 24.12. Geschenk für Oma besorgen\nDachrinne reinigen');await A.click('[data-act=pmbulk]');await A.waitForTimeout(500);
  await B.waitForTimeout(400);
  const all=await B.evaluate(()=>0);
  await A.click('[data-priosort=bereich]');await A.screenshot({path:out+'/maske-liste.png',fullPage:true});
  const secs=await A.$$eval('.section-head h2',l=>l.map(x=>x.textContent));
  const rows=await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText.replace(/\n/g,' | ')));
  // Wiederholung: Abhaken schiebt weiter
  await A.click('[data-priosort=datum]');const idx=(await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText))).findIndex(r=>/Beitrag/.test(r));const dn=await A.$$('[data-priodone]');await dn[idx].click();await A.waitForTimeout(400);
  const beitrag=(await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText.replace(/\n/g,' | ')))).find(r=>/Beitrag/.test(r));
  // Bearbeiten über ⏰
  const i2=(await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText))).findIndex(r=>/Kinderarzt/.test(r));const eds=await A.$$('.prow [data-prioedit].catbtn');await eds[i2].click();const editName=await A.$eval('#pm-name',e=>e.value);const editTime=await A.$eval('#pm-time',e=>e.value);
  console.log({area,hint,backTab,secs,rows,beitrag,editName,editTime,errs});
  const ok=!errs.length&&area==='kita'&&/Fr\., 20\.11\. um 08:30/.test(hint)&&backTab==='Kita'&&rows.length===6&&rows.some(r=>/^🎒 Beitrag zahlen \|.*20\.11\..*08:30.*jeden Monat/.test(r))&&rows.some(r=>/^🍲 Fleisch für Gulasch auftauen/.test(r))&&rows.some(r=>/^🎒 Wechselkleidung/.test(r))&&rows.some(r=>/^💡 Geschenk für Oma besorgen.*24\.12/.test(r))&&rows.some(r=>/^🏠 Dachrinne/.test(r))&&/20\.12\./.test(beitrag||'')&&editName==='Kinderarzt anrufen'&&editTime==='09:00';
  console.log(ok?'MASK OK':'MASK FAIL');await b.close();srv.close();process.exit(0)});
