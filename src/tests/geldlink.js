srv.listen(8765,async()=>{
  // Geld verknüpft (Florian 16.11.2026, Punkte 1–12): Einkauf eintragen, Preis beim Gekauft-Haken, Budget am Projekt, 💶 an Ausflug, Suche, Rückgängig, Sparschwein
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const money=()=>Object.values(JSON.parse(JSON.stringify(get(['haushalt',key,'food','money'])||{})));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  // 1) Einkaufsliste: Knopf erst nach einem Haken, fragt nur den Betrag, verschwindet danach
  await A.click('#tabs [data-tab=einkauf]');await A.fill('#shopinput','Milch');await A.press('#shopinput','Enter');await A.waitForTimeout(300);
  r.btn0=!!(await A.$('[data-geldoffer]'));await A.click('.shop [data-shop]');await A.waitForTimeout(400);r.btn1=!!(await A.$('[data-geldoffer]'));
  await A.click('[data-geldoffer]');await A.waitForTimeout(300);r.formName=await A.$eval('[data-gf=name]',e=>e.value);await A.fill('[data-gf=amt]','12,30');await A.click('#geldform button[type=submit]');await A.waitForTimeout(500);
  r.back=await A.$eval('#app h1',e=>e.innerText);r.btn2=!!(await A.$('[data-geldoffer]'));const m1=money().find(x=>x.ref==='shop')||{};r.shop=[m1.name,m1.amt,m1.cat,m1.by,/Milch/.test(m1.note||'')].join();
  // 2) Weitere Listen: Gekauft-Haken bietet den Preis an
  await put('food/buy/k1',{name:'Matschhose',list:'kleidung',at:1});await A.waitForTimeout(300);await A.click('.pager [data-go=listen]');await A.waitForTimeout(300);await A.click('[data-buysum=kleidung]');await A.waitForTimeout(200);
  await A.click('[data-buydone=k1]');await A.waitForTimeout(500);r.toast=await A.$eval('#toast',e=>e.innerText);await A.click('#toast .toastbtn');await A.waitForTimeout(300);
  r.buyForm=[await A.$eval('[data-gf=name]',e=>e.value),await A.$eval('[data-gcat][aria-pressed=true]',e=>e.dataset.gcat).catch(()=>'')].join();await A.fill('[data-gf=amt]','25');await A.click('#geldform button[type=submit]');await A.waitForTimeout(500);
  const m2=money().find(x=>x.ref==='buy:k1')||{};r.buy=[m2.amt,m2.cat].join();r.back2=await A.$eval('#app h1',e=>e.innerText);
  // 3) Projekt-Budget: Ausgabe zum Fund zählt statt seines Preises, dazu Ausgaben am Projekt
  await put('food/hproj/h1',{name:'Hochbeet',emo:'🌱',cat:'garten',state:'aktuell',budget:'100',at:1});await put('food/fund/f1',{name:'Erde',kind:'material',st:'gebucht',price:'30',area:'haus',proj:'h1',at:1});await put('food/fund/f2',{name:'Bretter',kind:'material',st:'gebucht',price:'40',area:'haus',proj:'h1',at:2});
  await put('food/money/x1',{name:'Erde',amt:2500,by:'p0',split:'half',cat:'wohnen',ref:'fund:f1',date:'2026-11-10',at:1});await put('food/money/x2',{name:'Schrauben',amt:500,by:'p1',split:'half',cat:'wohnen',ref:'hproj:h1',date:'2026-11-11',at:2});await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.hproj="h1";b.id="zh";document.getElementById("app").appendChild(b)});await nav('amhaus|pf:garten');await A.evaluate(()=>{const b=document.createElement("button");b.dataset.hproj="h1";b.id="zh";document.getElementById("app").appendChild(b)});await A.click('#zh');await A.waitForTimeout(300);
  r.budget=await A.$$eval('.card',l=>{const c=l.find(x=>/Budget/.test(x.innerText));return c?c.innerText.replace(/\n/g,' '):''});
  // 4) Ausflug: 💶 im geöffneten Ausflug
  await put('food/trip/t1',{name:'Tierpark',at:1});await A.waitForTimeout(300);await nav('ausflug|tt:ideen');await A.evaluate(()=>{const b=document.querySelector('[data-tripedit="t1"],[data-tripopen="t1"]');if(b)b.click()});await A.waitForTimeout(300);r.trip=!!(await A.$('.geldsrc [data-geldoffer]'));
  // 6) Suche
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='suche';document.getElementById('app').appendChild(b);b.click()});await A.fill('#sq','Schrauben');await A.waitForTimeout(400);r.search=await A.$$eval('#app [data-geldedit]',l=>l.length);
  // 11) Löschen mit Rückgängig
  await A.click('#app [data-geldedit]');await A.waitForTimeout(400);r.editH=await A.$eval('.geldform h2',e=>e.innerText).catch(()=>'');await A.click('[data-gact=del]');await A.waitForTimeout(300);if(await A.$('[data-gact=del]'))await A.click('[data-gact=del]');await A.waitForTimeout(400);
  r.gone=!money().some(x=>x.name==='Schrauben');const tb=await A.$('#toast .toastbtn');if(tb)await tb.click();await A.waitForTimeout(500);r.undo=money().some(x=>x.name==='Schrauben');
  // 8) Vorschläge beim Tippen und 10) lang drücken
  await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);await A.click('[data-gact=new]');await A.fill('[data-gf=name]','Matsch');await A.waitForTimeout(300);
  r.sugg=await A.$$eval('#geldsugg [data-geldsugg]',l=>l.map(x=>x.innerText).join('|'));if(r.sugg){await A.click('#geldsugg [data-geldsugg]');await A.waitForTimeout(200);r.suggCat=await A.$eval('[data-gcat][aria-pressed=true]',e=>e.dataset.gcat).catch(()=>'')}
  await A.click('[data-gact=cancel]');await A.waitForTimeout(300);await A.click('[data-gtab=liste]');await A.waitForTimeout(300);
  const row=await A.$('.geldrow [data-geldedit]');const bb=await row.boundingBox();await A.mouse.move(bb.x+20,bb.y+10);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(300);
  r.menu=await A.$eval('#mbox',e=>e.innerText.replace(/\n/g,' ')).catch(()=>'');await A.keyboard.press('Escape');await A.waitForTimeout(200);
  // 12) Sparschwein im Bild
  await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(500);r.pig=!!(await A.$('.camp .pig'));await A.addStyleTag({content:'#tabs{display:none!important}'});await (await A.$('.camp')).screenshot({path:out+'/sparschwein.png'});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await A.click('.spot[data-go=ausgaben]');await A.waitForTimeout(400);r.pigGo=await A.$eval('#app h1',e=>e.innerText);
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&!r.btn0&&r.btn1&&r.formName==='Einkauf'&&r.back==='Einkaufsliste'&&!r.btn2&&r.shop==='Einkauf,1230,essen,p0,true'&&/Preis/.test(r.toast)&&r.buyForm==='Matschhose,kleid'&&r.buy==='2500,kleid'&&r.back2==='Weitere Listen'
    &&/70 € ausgegeben von 100 €/.test(r.budget.replace(/ /g,' '))&&r.trip&&r.search>0&&r.gone&&r.undo&&r.pig&&r.pigGo==='Ausgaben'&&/Matschhose/.test(r.sugg)&&r.suggCat==='kleid'&&/Nochmal/.test(r.menu);
  console.log(ok?'GELDLINK OK':'GELDLINK FAIL');await b.close();process.exit(0)});
