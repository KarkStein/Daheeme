srv.listen(8765,async()=>{
  // Rezept aus Link und kopiertem Seitentext (Florian 16.11.2026, Beispiel Emmi Pilzragout): Rezeptkarte erkennen, „Anleitungen“, Notizen und Kommentare
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE',permissions:['clipboard-read','clipboard-write']});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  const page=['Zum Inhalt springen','Emmi kocht einfach','Rezepte','Über mich','Pilzragout – cremig und einfach','Springe zum Rezept','Heute gibt es ein herrliches Pilzragout, das ganz einfach gelingt. Es passt zu Knödeln, Nudeln oder Reis und ist in 30 Minuten fertig.',
    'Zutaten für Pilzragout','Für mein Pilzragout brauchst du Champignons, Zwiebeln, Sahne und frische Petersilie. Mehr nicht.','Champignons','Zwiebel','Sahne',
    'So gelingt das Pilzragout','Die Pilze nicht waschen, sondern nur abbürsten, sonst werden sie wässrig.',
    'Pilzragout','Rezept drucken','Pin','Rezept bewerten','4.85 von 33 Bewertungen','Cremiges Pilzragout mit Champignons, schnell gemacht.','Vorbereitungszeit 10 Minuten','Zubereitungszeit 20 Minuten','Gericht Hauptgericht','Portionen 4 Personen',
    'Equipment','Große Pfanne',
    'Zutaten','▢ 750 g Champignons braun','▢ 1 Zwiebel','▢ 2 EL Butter','▢ 200 ml Sahne','▢ 1 TL Speisestärke','▢ Salz und Pfeffer','▢ ½ Bund Petersilie',
    'Anleitungen','Champignons putzen und in Scheiben schneiden. Zwiebel fein würfeln.','Butter in der Pfanne erhitzen und die Pilze kräftig anbraten.','Sahne angießen, mit Stärke binden, abschmecken.',
    'Notizen','Statt Sahne geht auch Kochsahne.','Nährwerte','Kalorien: 250kcal',
    'Hast Du das Rezept ausprobiert?','Markiere @emmikochteinfach','12 Kommentare','Anna sagt: Super lecker!'].join('\n');
  const tryIt=async txt=>{await nav('essen|ft:rezepte');const cx=await A.$('[data-act=reccancel]');if(cx){await cx.click();await A.waitForTimeout(200)}await A.click('[data-act=recpaste]');await A.waitForTimeout(200);await A.fill('#rec-paste',txt);await A.click('[data-act=recparse]');await A.waitForTimeout(300);
    return {name:await A.$eval('#rec-name',e=>e.value),ing:await A.$eval('#rec-ing',e=>e.value.split('\n').filter(Boolean)),note:await A.$eval('#rec-note',e=>e.value.split('\n').filter(Boolean)),link:await A.$eval('[data-rf=link],#rec-link',e=>e.value).catch(()=>'')}};
  const a=await tryIt('https://emmikochteinfach.de/pilzragout/\n'+page);r.a=a;
  await A.screenshot({path:out+'/rezept-erkannt.png',fullPage:true});
  await A.click('[data-act=reccancel]').catch(()=>{});
  const l=await tryIt('https://emmikochteinfach.de/pilzragout/');r.l=l;
  const w=await tryIt('Linsencurry\nZutaten\n200 g Linsen\n1 Dose Kokosmilch\nZubereitung\n1. Linsen kochen.\n2. Kokosmilch dazu.');r.w=w;
  // „📋 Einfügen“ liest die Zwischenablage und erkennt sofort; Knopf oben auf der Rezepte-Seite
  await nav('essen|ft:rezepte');{const cx=await A.$('[data-act=reccancel]');if(cx){await cx.click();await A.waitForTimeout(200)}}r.top=!!(await A.$('.btnrow [data-act=recpaste]'));await A.click('[data-act=recpaste] >> nth=0');await A.waitForTimeout(200);
  await A.screenshot({path:out+'/rezept-link-maske.png'});
  await A.evaluate(t=>navigator.clipboard.writeText(t),'https://emmikochteinfach.de/pilzragout/\n'+page);await A.click('[data-act=recclip]');await A.waitForTimeout(400);r.clip=[await A.$eval('#rec-name',e=>e.value),(await A.$eval('#rec-ing',e=>e.value)).split('\n').length].join();
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&a.name==='Pilzragout'&&a.ing.length===7&&a.ing[0]==='750 g Champignons braun'&&a.ing.includes('½ Bund Petersilie')&&a.note.length===3&&!a.note.join().includes('Kommentar')&&!a.note.join().includes('Kochsahne')&&/emmikochteinfach/.test(a.link)
    &&l.name==='Pilzragout'&&/emmikochteinfach/.test(l.link)&&w.name==='Linsencurry'&&w.ing.length===2&&w.note.length===2&&r.top&&r.clip==='Pilzragout,7';
  console.log(ok?'RECPARSE OK':'RECPARSE FAIL');await b.close();process.exit(0)});
