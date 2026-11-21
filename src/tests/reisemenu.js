// Ausflüge und Reisen angeglichen (Florian 19.11.2026): Kopfblöcke, eine Filterzeile, Urlaube als Liste, lang = ✕ Löschen mit Rückgängig; Knöpfe in der Urlaub-Ansicht
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:740}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=async(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/urlaub/u1',{name:'Bretagne',state:'aktuell',at:1});await put('food/urlaub/u2',{name:'Gardasee',state:'traum',at:2});
  await put('food/packlist/u_u2',{name:'Gardasee',at:1});await put('food/pack/p1',{name:'Sonnencreme',list:'u_u2',at:1});
  await A.waitForTimeout(500);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const hold=async sel=>{const bx=await A.$eval(sel,e=>{e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});await A.mouse.move(bx.x,bx.y);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(300)};
  const r={};
  await put('food/urlaub/u1/from','2027-07-10');await put('food/urlaub/u1/to','2027-07-24');await put('food/urlaub/u1/place','Saint-Malo');
  await put('food/trip/t1',{name:'Starnberger See',date:'2099-01-03',at:1});await put('food/trip/t2',{name:'Tierpark',fav:true,at:2});await put('food/fund/f1',{name:'Ferienhaus',kind:'unterkunft',reise:'u1',at:3});await A.waitForTimeout(400);
  // Seite Ausflüge: Kopfblock, eine Filterzeile, Gemerkt nur für hier, Karte als Symbol
  await nav('ausflug|tt:ideen');await A.waitForSelector('.tripdash');
  r.thead=await A.$eval('.tripdash',e=>e.innerText.replace(/\n+/g,' | '));r.rows=await A.$$eval('.rgcard .scrollrow',l=>l.length);r.first=await A.$eval('.rgcard .scrollrow button',e=>e.textContent);
  r.hier=await A.$$eval('.rgcard li.mk b',l=>l.map(x=>x.textContent));r.noMapCard=!(await A.$('#rmapcard'));await A.click('.headbtns [data-tfold=rmap]');await A.waitForTimeout(200);r.map=!!(await A.$('#rmapcard #reisemapform'));await A.click('.headbtns [data-tfold=rmap]');
  await A.waitForTimeout(2600);await A.screenshot({path:(process.argv[2]||'/tmp')+'/angleich-ausfluege.png'});
  await A.click('.tripdash [data-thgo=plan]');await A.waitForTimeout(300);r.planF=await A.$$eval('.rgcard li.mk b',l=>l.map(x=>x.textContent));
  // Seite Reisen: Kopfblock „Nächster Urlaub“, Liste mit Filter und Stand-Schild, lang = ✕ Löschen mit Rückgängig
  await nav('ausflug|tt:urlaub');await A.waitForSelector('.urlcard [data-reise=u1]');
  r.rhead=await A.$eval('.tripdash',e=>e.innerText.replace(/\n+/g,' | '));r.chips=await A.$$eval('.urlcard .scrollrow button',l=>l.map(x=>x.textContent));r.noUt=!(await A.$('.ut'));
  await A.screenshot({path:(process.argv[2]||'/tmp')+'/angleich-reisen.png'});
  await A.click('.urlcard [data-urlf=traum]');await A.waitForTimeout(200);r.filt=await A.$$eval('.urlcard li.mk b',l=>l.map(x=>x.textContent));await A.click('.urlcard [data-urlf=""]');await A.waitForTimeout(200);
  await A.click('[data-urlst=u1]');await A.waitForTimeout(400);r.done=db().urlaub.u1.state;r.menu=!(await A.$('#mbox'));
  await hold('.urlcard [data-reise=u2]');r.notOpened=await A.evaluate(()=>!document.querySelector('.reiseact'));r.lpx=!!(await A.$('.lpx'));r.still=!!db().urlaub.u2;r.ask='Wirklich löschen?';
  await A.click('.lpx');await A.waitForTimeout(500);let d=db();r.gone=!d.urlaub||!d.urlaub.u2;r.packGone=!d.pack||!d.pack.p1;
  await A.click('.toast button, #toast button');await A.waitForTimeout(600);d=db();r.back=!!(d.urlaub&&d.urlaub.u2)&&!!(d.pack&&d.pack.p1);
  await hold('.urlcard [data-reise=u2]');await A.click('.lpx');await A.waitForTimeout(500);
  // Urlaub-Seite wie ein Am-Haus-Projekt: Kopfblock, ✎ öffnet die Eckdaten im Fenster, Erledigt und Löschen ganz unten, kein „‹ Übersicht“
  await put('food/urlaub/u1/state','aktuell');await put('food/pack/p2',{name:'Badehose',list:'u_u1',at:1});await put('food/pack/p3',{name:'Brotzeit',at:2});await A.waitForTimeout(400);
  await nav('ausflug|tt:urlaub');await A.click('.urlcard [data-reise=u1]');await A.waitForSelector('.udash');
  r.uhead=await A.$eval('.udash',e=>e.innerText.replace(/\n+/g,' | '));r.noBack=!(await A.$('[data-act=reiseback]'));r.pager=await A.$$eval('.pager .pdot',l=>l.map(x=>x.textContent+(x.getAttribute('aria-pressed')==='true'?'*':'')));
  r.order=await A.evaluate(()=>{const a=document.querySelector('.reiseact'),g=[...document.querySelectorAll('h2')].filter(h=>/Gemerkt|Packliste|Ausgaben/.test(h.textContent));return !!a&&g.length===3&&g.every(x=>x.compareDocumentPosition(a)&Node.DOCUMENT_POSITION_FOLLOWING)});
  r.noRev=!(await A.$('[data-tfold=urev]'));await A.evaluate(()=>{const t=document.getElementById('toast');if(t)t.hidden=true});await A.screenshot({path:(process.argv[2]||'/tmp')+'/angleich-urlaub.png'});
  await A.click('[data-act=reiseedit]');await A.waitForSelector('#mbox');r.labels=await A.$$eval('#mbox label>span, #mbox .fld>span',l=>l.map(x=>x.textContent));await A.screenshot({path:(process.argv[2]||'/tmp')+'/angleich-urlaub-eckdaten.png'});
  await A.fill('#mbox input[type=text]','Bretagne 27');await A.click('#mbox button.primary');await A.waitForTimeout(500);r.saved=db().urlaub.u1.name;
  // Packliste im Urlaub: Vorlage „Tagesausflug“ kopieren
  await A.click('.udash [data-ugo=upack]');await A.waitForTimeout(300);await A.click('[data-packcopy=main]');await A.waitForTimeout(500);r.copied=Object.values(db().pack).filter(x=>x.list==='u_u1').map(x=>x.name).sort().join();
  // Reisen: Packlisten-Vorlagen als Klapp-Karte, Liste öffnet als Unterseite, Leiste nur Ausflüge | Reisen
  await nav('ausflug|tt:packs');await A.waitForSelector('[data-gopack=main]');r.vorl=await A.$$eval('[data-gopack]',l=>l.map(x=>x.querySelector('b').textContent));
  await A.screenshot({path:(process.argv[2]||'/tmp')+'/angleich-reisen2.png',fullPage:true});
  await A.click('[data-gopack=main]');await A.waitForSelector('#packform');r.listH=await A.$eval('#app h1',e=>e.textContent);r.noChips=!(await A.$('[data-packlist]'));await A.screenshot({path:(process.argv[2]||'/tmp')+'/angleich-packliste.png'});
  await put('food/urlaub/u3',{name:'Ostsee',state:'aktuell',at:3});await A.waitForTimeout(400);await nav('ausflug|tt:urlaub');await A.click('.urlcard [data-reise=u3]');await A.waitForSelector('.reiseact');
  await A.$eval('.reiseact [data-act=reisedel]',e=>e.scrollIntoView({block:'center'}));await A.click('.reiseact [data-act=reisedel]');await A.click('.reiseact [data-act=reisedel]');await A.waitForTimeout(500);r.del3=!(db().urlaub||{}).u3;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Wochenende|Sonntag/i.test(r.thead)&&/Starnberger See/.test(r.thead)&&r.rows===1&&r.first==='Alle'&&r.hier.length===2&&r.noMapCard&&r.map&&r.planF.join()==='Starnberger See'&&/Nächster Urlaub.*Bretagne.*Saint-Malo/i.test(r.rhead)&&r.chips[0]==='Alle'&&r.chips.length===3&&r.noUt&&r.filt.join()==='Gardasee'&&r.lpx&&r.back&&r.menu&&r.notOpened&&r.done==='erledigt'&&r.ask==='Wirklich löschen?'&&r.still&&r.gone&&r.packGone&&r.order&&r.del3&&/Geplant.*\d+ Tage.*Juli 2027.*Saint-Malo/i.test(r.uhead)&&r.noBack&&r.pager.join()==='Ausflüge,Reisen*'&&r.noRev&&r.labels[0]==='Was'&&r.saved==='Bretagne 27'&&r.copied==='Badehose,Brotzeit'&&r.vorl[0]==='Tagesausflug'&&/Tagesausflug/.test(r.listH)&&r.noChips;
  console.error(ok?'REISEMENU OK':'REISEMENU FAIL');await b.close();srv.close();process.exit(0)});
