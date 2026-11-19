srv.listen(8765,async()=>{
  // Glossar (Florian 16.11.2026): Einstellungen › 📖 Glossar, gespeist aus AREAS, PIC_SPOTS, QUICK, TAB_PAGES; Filter ohne Neuzeichnen; Suche (Lupe) öffnet das Glossar mit dem Wort
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:740},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const vis=sel=>A.$$eval(sel,l=>l.filter(x=>x.offsetParent!==null).length);
  // Schnellzugriff öffnet das Glossar, alle Abschnitte zu
  await A.click('[data-go=settings]');await A.waitForTimeout(300);await A.click('.setquick [data-setgo=glossar]');await A.waitForTimeout(300);
  const r={};r.secs=await A.$$eval('.glossec',l=>l.map(x=>x.dataset.gs).join(','))==='bild,bereiche,begriffe,symbole,gesten';r.closed=await vis('.glosrow')===0;
  // Im Bild: alle Dinge des Motivs, Schnellmenü steht dabei, Sprung funktioniert
  await A.click('[data-glossec=bild]');await A.waitForTimeout(200);
  const bild=await A.$$eval('[data-gs=bild] .glosrow',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));
  r.bild=bild.length===16+3&&bild.some(t=>/Leuchtturm/.test(t))&&!bild.some(t=>/Kirchtürme.*Öffnet/.test(t));
  r.quick=bild.some(t=>/Korb.*Lange drücken: Artikel hinzufügen/.test(t));
  // Bereiche aus der Bereichsliste, mit Kurz erklärt und Bild-Ding
  await A.click('[data-glossec=bereiche]');await A.waitForTimeout(200);
  const ber=await A.$$eval('[data-gs=bereiche] .glosrow',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));
  r.bereiche=ber.length===17&&ber.some(t=>/Haushalt.*Hausarbeit.*Reiter unten.*Im Bild: Besen/.test(t));
  // Filter beim Tippen: Fokus bleibt, nur Treffer sichtbar
  await A.fill('#glosq','hausdienst');await A.waitForTimeout(200);
  r.focus=await A.evaluate(()=>document.activeElement&&document.activeElement.id==='glosq');
  const hits=await A.$$eval('.glosrow',l=>l.filter(x=>x.offsetParent!==null).map(x=>x.querySelector('b').innerText));r.filter=hits.includes('Hausdienst')&&hits.length<12;
  await A.fill('#glosq','xyzxyz');await A.waitForTimeout(200);r.none=await vis('.glosnone')===1;
  await A.fill('#glosq','');await A.waitForTimeout(200);r.clear=await A.$eval('#glosq',x=>x.value)===''&&await vis('.glosrow')>10;
  // Gesten: Doppeltipp aus TAB_PAGES
  await A.click('[data-glossec=gesten]');await A.waitForTimeout(200);
  r.gesten=await A.$$eval('[data-gs=gesten] .glosrow',l=>l.some(x=>/Doppeltipp/.test(x.innerText)&&/Essen › Rezepte/.test(x.innerText)));
  if(process.argv[2]){await A.click('[data-glossec=gesten]');await A.waitForTimeout(150);await A.evaluate(()=>document.getElementById('set-glossar').scrollIntoView());await A.screenshot({path:process.argv[2]+'/glossar.png'})}
  // Sprung aus dem Glossar: Wochenplan
  await A.fill('#glosq','wochenplan');await A.waitForTimeout(200);await A.click('.glosrow:not([hidden])[data-nav="essen|ft:plan"]');await A.waitForTimeout(300);
  r.jump=await A.evaluate(()=>!!document.querySelector('.pager [data-food=heute][aria-pressed=true]'));
  // Lupe findet Begriff und öffnet das Glossar gefiltert
  await A.click('[data-go=suche]');await A.fill('#sq','leuchtturm');await A.waitForTimeout(300);
  const sh=await A.$('[data-setgo=glossar][data-glosq]');r.search=!!sh;if(sh){await sh.click();await A.waitForTimeout(300);r.searchOpen=await A.$eval('#glosq',x=>x.value)==='Leuchtturm'&&(await A.$$eval('.glosrow',l=>l.filter(x=>x.offsetParent!==null).length))>=1}
  console.error(JSON.stringify(r),errs);
  console.error(!errs.length&&Object.values(r).every(Boolean)?'GLOSSAR OK':'GLOSSAR FAIL');await b.close();srv.close();process.exit(0)});
