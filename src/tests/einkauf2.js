srv.listen(8765,async()=>{
  // Seite Einkauf aufgeräumt (Florian 17.11.2026, „Alle 5“): Leiste mit drei Seiten, Chip-Zeile in der Karte, „Oft gekauft“ nur im leeren Feld, Zeilen Haken/Name/✎/✕, Karten klappbar
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('shop/i1',{name:'1 l Milch',at:1,by:'p0'});await put('shop/i2',{name:'Brot',at:2,by:'p0',urg:true});
  await put('shop/i3',{name:'250 g Linsen',at:3,by:'p0',src:'Linsensuppe'});await put('shop/i4',{name:'2 Möhren',at:4,by:'p0',src:'Linsensuppe'});
  await put('shop/i5',{name:'Butter',at:5,by:'p0',done:true,doneAt:Date.now()});
  await put('fav/apfel',{name:'Äpfel',n:5});await put('fav/kaese',{name:'Käse',n:3});
  await A.waitForTimeout(3200);await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);
  // 1. Leiste, keine alte Umschaltzeile, keine Zeile über der Überschrift
  r.pager=await A.$$eval('.pager .pdot',l=>l.map(x=>x.innerText.trim()));r.old=!!(await A.$('.shopsw'))||!!(await A.$('.top .eyebrow'));
  // 2. Chip-Zeile in der Karte, ohne Erklärtext, 🗑 erst beim gewählten Rezept
  r.chips=await A.$$eval('.shopcard .shopfl [data-shopfilter]',l=>l.map(x=>x.innerText.trim()));r.rm0=(await A.$$('[data-shopblockrm]')).length;r.extra=!!(await A.$('.shopextra'));
  // 3. Oft gekauft erst beim Tipp ins leere Feld
  r.fav0=(await A.$$('[data-shopfav]')).length;
  // 4. Zeilen: nur ✎ und ✕, Symbol nur an der Gruppe
  r.rowBtns=(await A.$$eval('.shopcard .shop li',l=>l.every(x=>x.querySelectorAll('button').length===3)))?3:0;r.noCat=!(await A.$('.shop .catbtn'))&&!(await A.$('.shop .srclink'))&&!(await A.$('[data-act=shopcatman]'));
  if(out){await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/einkauf-aufgeraeumt-live.png'})}
  await A.click('#shopinput');await A.waitForTimeout(200);r.fav1=await A.$$eval('#shopsugg [data-shopfav]',l=>l.map(x=>x.innerText.trim()));r.favEdit=!!(await A.$('#shopsugg [data-act=favedit]'));
  if(out)await A.screenshot({path:out+'/einkauf-oft-gekauft.png'});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await A.fill('#shopinput','Mi');await A.waitForTimeout(200);r.fav2=(await A.$$('#shopsugg [data-shopfav]')).length;await A.fill('#shopinput','');await A.waitForTimeout(200);r.fav3=(await A.$$('#shopsugg [data-shopfav]')).length;
  await A.click('.shopcard .setsum h2');await A.waitForTimeout(300);r.fav4=(await A.$$('[data-shopfav]')).length;
  // 5. Klappen: Noch zu kaufen zu und wieder auf (der Tipp eben hat zugeklappt)
  r.fold0=(await A.$$('.shopcard .shop li')).length;await A.click('[data-tfold=shop_open]');await A.waitForTimeout(300);r.fold1=(await A.$$('.shop li:not(.done)')).length;
  r.head=await A.$eval('[data-tfold=shop_open] h2',e=>e.innerText.replace(/\s+/g,' '));
  // Im Wagen zu, Zahl im Kopf, Einkauf eintragen sichtbar
  r.wagen=await A.$eval('[data-tfold=shop_done] h2',e=>e.innerText.replace(/\s+/g,' '));r.done0=(await A.$$('.shop li.done')).length;r.pay=!!(await A.$('[data-geldoffer]'));
  await A.click('[data-tfold=shop_done]');await A.waitForTimeout(300);r.done1=(await A.$$('.shop li.done')).length;r.clear=!!(await A.$('[data-act=shopclear]'));
  // Rezept wählen: Liste gefiltert, 🗑 da; Tipp auf „für … ›“ öffnet das Rezept-Ziel, nicht den Haken
  await A.click('[data-shopfilter="Linsensuppe"]');await A.waitForTimeout(300);r.fl=(await A.$$('.shop li:not(.done)')).length;r.rm1=(await A.$$('[data-shopblockrm]')).length;
  await A.click('.shop .srcgo');await A.waitForTimeout(400);r.notTicked=!db().shop.i3.done&&!db().shop.i4.done;r.left=await A.$eval('#app h1',e=>e.innerText);
  // Kategorie im ✎-Fenster
  await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);if(!(await A.$('[data-shopedit="i1"]'))){await A.click('#tabs [data-tab=woche]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300)}
  await A.click('[data-shopedit="i1"]');await A.waitForSelector('#mbox');r.catF=(await A.$$('#mbox [data-ebk=cat]')).length>3;r.catBtn=await A.$eval('#mbox [data-ebdel="0"]',e=>e.innerText);
  await A.click('#mbox [data-ebk=cat][data-ebv=tk]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);r.cat=db().shop.i1.cat;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pager.join()==='Einkaufsliste,Ausgaben,Weitere Listen'&&!r.old&&r.chips.length===2&&/Heute nötig/.test(r.chips[0])&&/Linsensuppe · 2/.test(r.chips[1])&&r.rm0===0&&!r.extra
    &&r.fav0===0&&r.fav1.length===2&&r.favEdit&&r.fav2===0&&r.fav3===2&&r.fav4===0&&r.rowBtns===3&&r.noCat&&r.fold0===0&&r.fold1===4&&/Noch zu kaufen \(4\)/.test(r.head)
    &&/Im Wagen \(1\)/.test(r.wagen)&&r.done0===0&&r.pay&&r.done1===1&&r.clear&&r.fl===2&&r.rm1===1&&r.notTicked&&r.left!=='Einkaufsliste'&&r.catF&&/Kategorien/.test(r.catBtn)&&r.cat==='tk';
  console.error(ok?'EINKAUF2 OK':'EINKAUF2 FAIL');await b.close();srv.close();process.exit(0)});
