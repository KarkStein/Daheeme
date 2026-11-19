// Rezepte: Wörterbuch für Tags, Aufräumen mit Rückgängig, Vorschläge beim Tippen, Rezept-Fenster in der Datenbank, Lupe nur Name und Tags (Florian 19.11.2026)
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2]||'/tmp';
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  // Alte Rezepte mit Tags nach der alten Regel: „che“ aus Crème fraîche, Tippfehler, Grundzutaten, Mehrzahl
  await put('food/tagfix',{auto:true});
  await put('food/rec/r1',{name:'Pilzragout mit Knödeln',ing:'500 g Champignons\n4 Semmelknödel\n200 g Crème fraîche\n2 Knoblauchzehen\n1 Zwiebel\nSalz und Pfeffer',tags:['Saison|Herbst','Zutaten|Champignon','Zutaten|Knödel','Zutaten|che','Zutaten|Knoblauch','Zutaten|Zwiebel','Zutaten|Pfeffer'],at:1});
  await put('food/rec/r2',{name:'Nusskuchen',ing:'200 g gemahlene Haselüsse\n250 g Mehl\n3 Eier\n150 g Zucker\n100 g Schokolade',tags:['Art|Süßes','Zutaten|Haselüsse','Zutaten|Mehl','Zutaten|Zucker'],at:2});
  await put('food/rec/r3',{name:'Möhrensuppe',ing:'600 g Möhren\n1 Stück Ingwer\n400 ml Kokosmilch\n1 EL Olivenöl',tags:['Art|Suppe','Zutaten|Möhren','Zutaten|Ingwer','Zutaten|Olivenöl'],at:3});
  await put('food/rec/r4',{name:'Ofengemüse',ing:'2 Möhren\n1 Zucchini\n2 Paprika\n3 Kartoffeln\n1 Aubergine\n1 Süßkartoffel\n200 g Feta\n2 Knoblauchzehen',at:4});
  await A.waitForTimeout(500);const r={};
  await A.click('#tabs [data-tab=essen]');await A.click('[data-food=rezepte]');await A.waitForTimeout(200);await A.click('[data-act=rdbopen]');await A.waitForTimeout(300);
  // Karte „Tags aufräumen“: Vorschläge
  await A.click('[data-tfold=f_tagfix]');await A.waitForTimeout(200);
  r.sugg=await A.$$eval('.tagfixl:not(.done) li',l=>l.map(x=>x.innerText.replace(/\n+/g,' | ')));
  await A.$eval('[data-tfold=f_tagfix]',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/rezepte-tags-aufraeumen.png'});
  await A.$eval('[data-act=tagfixall]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-act=tagfixall]');await A.waitForTimeout(600);
  let d=db();r.t1=d.rec.r1.tags.filter(t=>/^Zutaten/.test(t)).sort().join();r.t2=d.rec.r2.tags.filter(t=>/^Zutaten/.test(t)).join();r.t3=d.rec.r3.tags.filter(t=>/^Zutaten/.test(t)).sort().join();
  r.log=await A.$$eval('.tagfixl.done li',l=>l.length);r.none=await A.$$eval('.tagfixl:not(.done) li',l=>l.length);
  await A.$eval('[data-act=tagfixundo]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-act=tagfixundo]');await A.waitForTimeout(600);r.undo=db().rec.r1.tags.includes('Zutaten|che')&&db().rec.r2.tags.includes('Zutaten|Haselüsse');
  // Einmal automatisch: ohne Marke räumt die App selbst auf (aus den Zutatenzeilen: che wird Crème fraîche)
  await put('food/tagfix',null);await A.waitForTimeout(900);d=db();
  r.auto1=d.rec.r1.tags.filter(t=>/^Zutaten/.test(t)).sort().join();r.auto2=d.rec.r2.tags.filter(t=>/^Zutaten/.test(t)).sort().join();r.autoFlag=!!(d.tagfix&&d.tagfix.auto);r.keep=d.rec.r1.tags.includes('Saison|Herbst');
  // Neues Rezept ohne gespeicherte Tags: höchstens 5, Hauptzutat zuerst, keine Grundzutat
  await nav('essen|ft:rezepte');if(!(await A.$('#rdbq')))await A.click('[data-act=rdbopen]');await A.waitForTimeout(300);await A.evaluate(()=>{const x=document.querySelector('.rdbfilt');x.open=true});
  r.zutChips=await A.$$eval('.rdbfilt [data-rdbt^="Zutaten|"]',l=>l.map(x=>x.dataset.rdbt.split('|')[1]));
  // Vorschläge beim Tippen
  await A.fill('#rdbq','ha');await A.waitForTimeout(300);r.sg=await A.$$eval('#rdbsugg .rdbsg',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));r.focus=await A.evaluate(()=>document.activeElement&&document.activeElement.id);
  await A.screenshot({path:out+'/rezepte-vorschlaege.png'});
  await A.click('#rdbsugg [data-rdbt="Zutaten|Haselnuss"]');await A.waitForTimeout(300);r.sgList=await A.$$eval('.rdblist li b',l=>l.map(x=>x.textContent));r.sgQ=await A.$eval('#rdbq',e=>e.value);await A.click('[data-act=rdbreset]');await A.waitForTimeout(200);
  // Suche: Name und Tags oben, nur Zutaten zugeklappt darunter
  await A.fill('#rdbq','knoblauch');await A.waitForTimeout(300);r.kTop=await A.$$eval('.rdblist li',l=>l.length);r.kIng=await A.$eval('.rdbing .setsum',e=>e.innerText.replace(/\s+/g,' '));
  await A.click('[data-act=rdbing]');await A.waitForTimeout(200);r.kOpen=await A.$$eval('.rdbing .rdblist li b',l=>l.map(x=>x.textContent).sort());
  // Rezept geht als Fenster auf, Zurück schließt nur das Fenster
  await A.click('.rdbing [data-openrec=r1]');await A.waitForSelector('#mbox .recwin');r.win=await A.$eval('#mbox .recwin',e=>e.innerText.replace(/\n+/g,' | '));r.winBtns=await A.$$eval('#mbox .recwinb button, #mbox .recwinb a',l=>l.map(x=>x.textContent.trim()));
  await A.screenshot({path:out+'/rezepte-fenster.png'});
  await A.goBack();await A.waitForTimeout(400);r.closed=!(await A.$('#mbox'));r.stay=await A.$eval('#rdbq',e=>e.value).catch(()=>null);
  await A.click('.rdbing [data-openrec=r1]');await A.waitForSelector('#mbox .recwin');await A.waitForTimeout(700);await A.click('#mbox [data-rw=recedit]');await A.waitForSelector('#rec-name');r.edit=await A.$eval('#rec-name',e=>e.value);
  // Lupe: nur Name und Tags, Zutaten-Treffer als eine Zeile
  await nav('suche|');await A.fill('#sq','knoblauch');await A.waitForTimeout(400);r.lupe=await A.$$eval('#app .todayrow',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')).filter(x=>/Rezept/.test(x)));
  await A.screenshot({path:out+'/rezepte-lupe.png'});
  await A.click('[data-rdbgo]');await A.waitForTimeout(400);r.go=await A.$eval('#rdbq',e=>e.value).catch(()=>null);r.goOpen=await A.$$eval('.rdbing .rdblist li',l=>l.length);
  await A.fill('#rdbq','');await nav('suche|');await A.fill('#sq','pilzragout');await A.waitForTimeout(300);await A.click('[data-openrec=r1]');await A.waitForTimeout(400);r.fromLupe=!(await A.$('#rdbq'))&&!!(await A.$('[data-rec=r1][aria-expanded=true]'));
  console.error(JSON.stringify(r,null,1),errs);
  const ok=!errs.length&&r.sugg.some(x=>/^che .*zu kurz.*weg/.test(x))&&r.sugg.some(x=>/^Haselüsse .*fast wie Haselnuss.*→ Haselnuss/.test(x))&&r.sugg.some(x=>/^Knoblauch .*Grundzutat/.test(x))&&r.sugg.some(x=>/^Möhren .*→ Möhre/.test(x))
    &&r.t1==='Zutaten|Champignon,Zutaten|Knödel'&&r.t2==='Zutaten|Haselnuss'&&r.t3==='Zutaten|Ingwer,Zutaten|Möhre'&&r.log>=6&&r.none===0&&r.undo
    &&r.auto1==='Zutaten|Champignon,Zutaten|Crème fraîche,Zutaten|Knödel'&&r.auto2==='Zutaten|Eier,Zutaten|Haselnuss,Zutaten|Schokolade'&&r.autoFlag&&r.keep
    &&r.zutChips.includes('Kartoffel')&&!r.zutChips.includes('Knoblauch')&&!r.zutChips.includes('che')&&r.zutChips.includes('Crème fraîche')
    &&r.sg.some(x=>/Haselnuss 1/.test(x))&&r.focus==='rdbq'&&r.sgList.join()==='Nusskuchen'&&r.sgQ===''
    &&r.kTop===0&&/Zutaten von 2 Rezepten/.test(r.kIng)&&r.kOpen.join()==='Ofengemüse,Pilzragout mit Knödeln'
    &&/Pilzragout mit Knödeln.*Champignons/.test(r.win)&&r.winBtns.length===3&&/Kochen/.test(r.winBtns[0])&&r.closed&&r.stay==='knoblauch'&&r.edit==='Pilzragout mit Knödeln'
    &&r.lupe.length===1&&/Zutaten von 2 Rezepten/.test(r.lupe[0])&&r.go==='knoblauch'&&r.goOpen===2&&r.fromLupe;
  console.error(ok?'REZTAGS OK':'REZTAGS FAIL');await b.close();srv.close();process.exit(0)});
