srv.listen(8765,async()=>{
  // Wunsch-Suche bei Rezepte (Florian 16.11.2026): Lust, Mit, Ohne, Ähnlich wie; eigene Treffer, Google-Suche, Prompt, Recherche-Wunsch
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://localhost:8765'});
  const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));
  await A.route('**/ideen.json*',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify({items:[{name:'Pilzrisotto',cat:'vegetarisch',ing:['300 g Risottoreis','250 g Champignons','50 g Parmesan'],link:'https://example.org/pilzrisotto',veg:true}]})}));
  await A.route('**/wochenideen.json*',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify({items:[]})}));
  await A.route('**/quellen.txt*',rt=>rt.fulfill({contentType:'text/plain',body:'# Quellen\nhttps://www.emmikochteinfach.de/\nhttps://www.kptncook.com/\n'}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  setAt(['haushalt',key,'food','rec','r1'],{name:'Pilzragout',ing:'500 g Champignons\n200 ml Sahne\n1 Zwiebel\n2 EL Petersilie',at:1});
  setAt(['haushalt',key,'food','rec','r2'],{name:'Gulasch',ing:'800 g Rindfleisch\n3 Zwiebeln\n2 EL Paprikapulver',at:2});
  setAt(['haushalt',key,'food','rec','r3'],{name:'Rahmschwammerl mit Knödel',ing:'400 g Pfifferlinge\n150 ml Sahne\n4 Semmelknödel',at:3});
  await A.reload();await A.waitForTimeout(800);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('essen|ft:rezepte');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}await A.click('[data-act=wishopen]');await A.waitForTimeout(300);
  r.pool=await A.evaluate(()=>['Gulasch','Pilzragout'].map(n=>document.body.innerText.includes(n)));r.card=!!(await A.$('.wishcard'));r.disabled=await A.$eval('[data-act=wishweb]',e=>e.disabled);
  // Mit Pilze, ohne Fleisch → Pilzragout, Rahmschwammerl (Synonym Pfifferling), Pilzrisotto (Idee); kein Gulasch
  await A.type('[data-wish=mit]','Pilze');await A.type('[data-wish=ohne]','Fleisch');await A.waitForTimeout(200);
  r.focus=await A.evaluate(()=>document.activeElement&&document.activeElement.dataset.wish);
  r.hits1=await A.$$eval('.wishlist li .n',L=>L.map(e=>e.childNodes[0].textContent.trim()));r.enabled=!(await A.$eval('[data-act=wishweb]',e=>e.disabled));
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.locator('.wishcard').screenshot({path:out+'/wunsch-suche.png'});await A.evaluate(()=>{const t=[...document.querySelectorAll('style')].pop();t.remove()});
  // Google-Suche: window.open abfangen
  await A.evaluate(()=>{window.__open=[];window.open=(u)=>{window.__open.push(u);return null}});
  await A.click('[data-act=wishweb]');r.url1=await A.evaluate(()=>decodeURIComponent(window.__open[0]||''));
  await A.click('[data-act=wishown]');await A.waitForTimeout(200);await A.evaluate(()=>{window.open=(u)=>{window.__open.push(u);return null}});await A.click('[data-act=wishweb]');r.url2=await A.evaluate(()=>decodeURIComponent(window.__open[1]||''));
  // Prompt kopieren
  await A.click('[data-act=wishprompt]');await A.waitForTimeout(200);r.clip=await A.evaluate(()=>navigator.clipboard.readText()).catch(()=>'');
  // Ähnlich wie Gulasch, ohne Fleisch-Feld leer → nichts Fleischiges außer Gulasch selbst
  await A.fill('[data-wish=mit]','');await A.fill('[data-wish=ohne]','');await A.fill('[data-wish=wie]','Pilzragout');await A.waitForTimeout(200);
  r.hits2=await A.$$eval('.wishlist li .n',L=>L.map(e=>e.childNodes[0].textContent.trim()));
  // Recherche-Wunsch speichern
  await A.click('[data-act=wishsave]');await A.waitForTimeout(400);const W=get(['haushalt',key,'food','rwunsch'])||{};r.wish=Object.values(W).map(x=>x.what+'|'+x.area+'|'+x.state);
  // Kochen aus der Idee (pool|…)
  await A.fill('[data-wish=wie]','');await A.fill('[data-wish=lust]','Risotto');await A.waitForTimeout(200);r.hits3=await A.$$eval('.wishlist li .n',L=>L.map(e=>e.childNodes[0].textContent.trim()));
  await A.click('.wishlist [data-cook^="pool|"]');await A.waitForTimeout(300);r.cookbox=await A.$eval('#mbox',e=>e.innerText).catch(()=>'');
  // Schließen
  await A.keyboard.press('Escape');await A.waitForTimeout(300);await A.click('[data-act=wishx]');await A.waitForTimeout(200);r.closed=!(await A.$('.wishcard'));
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&r.card&&r.disabled&&r.enabled&&r.focus==='ohne'&&r.hits1.includes('Pilzragout')&&r.hits1.includes('Rahmschwammerl mit Knödel')&&r.hits1.includes('Pilzrisotto')&&!r.hits1.includes('Gulasch')
    &&/^https:\/\/www\.google\.com\/search\?q=Rezept/.test(r.url1)&&/site:emmikochteinfach\.de OR site:kptncook\.com/.test(r.url1)&&/-fleisch/.test(r.url1)&&!/site:/.test(r.url2)
    &&/Pilze/.test(r.clip)&&/Fleisch/.test(r.clip)&&/emmikochteinfach/.test(r.clip)
    &&r.hits2.includes('Rahmschwammerl mit Knödel')&&!r.hits2.includes('Pilzragout')&&!r.hits2.includes('Gulasch')
    &&r.wish.some(x=>/ähnlich wie Pilzragout\|rezepte\|offen/.test(x))&&r.hits3[0]==='Pilzrisotto'&&/Pilzrisotto/.test(r.cookbox)&&r.closed;
  console.log(ok?'WUNSCH OK':'WUNSCH FAIL');
  await b.close();process.exit(0)});
