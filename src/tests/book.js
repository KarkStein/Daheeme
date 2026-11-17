srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/ideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({items:[]})}));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/rec/r1',{name:'Linsensuppe',ing:'250 g Linsen',at:1});await A.waitForTimeout(300);
  await A.click('#tabs [data-tab=essen]');await A.click('[data-food=rezepte]');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}
  await A.click('[data-act=booknew]');await A.fill('#bookinput','Omas Küche');await A.press('#bookinput','Enter');await A.waitForTimeout(400);
  const head=await A.$$eval('.section-head h2',l=>l.map(x=>x.textContent));
  await A.click('[data-act=recpaste]');
  const txt=`Omas Rindsrouladen
https://example.org/rouladen
Für 4 Portionen
Zutaten
• 4 Rinderrouladen
• 2 Gewürzgurken
• 100 g Speck
• 2 EL Senf
• Salz und Pfeffer
Zubereitung
1. Rouladen flach klopfen und mit Senf bestreichen.
2. Mit Speck und Gurke belegen, aufrollen und anbraten.
3. Zwei Stunden schmoren lassen.`;
  await A.fill('#rec-paste',txt);await A.click('[data-act=recparse]');await A.waitForTimeout(200);
  const f={name:await A.inputValue('#rec-name'),ing:await A.inputValue('#rec-ing'),note:await A.inputValue('#rec-note'),link:await A.inputValue('#rec-link')};
  await A.screenshot({path:out+'/kochbuch-einfuegen.png',fullPage:true});
  await A.click('[data-act=recsave]');await A.waitForTimeout(400);
  const inBook=await A.$$eval('[data-rec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  await A.screenshot({path:out+'/kochbuch.png',fullPage:true});
  await A.click('[data-book=main]');const inMain=await A.$$eval('[data-rec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  // Ohne Überschriften
  await A.click('[data-act=recpaste]');await A.fill('#rec-paste','Schnelle Nudeln\n400 g Spaghetti\n1 Dose Tomaten\nNudeln kochen, Soße erhitzen, mischen.');await A.click('[data-act=recparse]');
  const g={name:await A.inputValue('#rec-name'),ing:await A.inputValue('#rec-ing'),note:await A.inputValue('#rec-note')};await A.click('[data-act=reccancel]');
  // Buch löschen
  const bid=await A.$$eval('[data-book]',l=>l.map(x=>x.dataset.book).find(x=>x!=='main'));await A.click(`[data-book="${bid}"]`);await A.click('[data-act=bookdel]');await A.waitForTimeout(400);const after=await A.$$eval('[data-rec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  console.log({head,f,inBook,inMain,g,after,errs});
  const ok=!errs.length&&head.some(x=>/Omas Küche/.test(x))&&f.name==='Omas Rindsrouladen'&&f.ing.split('\n').length===5&&/^4 Rinderrouladen/.test(f.ing)&&/flach klopfen/.test(f.note)&&!/Portionen/.test(f.ing+f.note)&&f.link==='https://example.org/rouladen'
    &&inBook.length===1&&/Rindsrouladen/.test(inBook[0])&&inMain.length===1&&/Linsensuppe/.test(inMain[0])&&g.name==='Schnelle Nudeln'&&g.ing.split('\n').length===2&&/kochen/.test(g.note)&&after.length===2;
  console.log(ok?'BOOK OK':'BOOK FAIL');await b.close();srv.close();process.exit(0)});
