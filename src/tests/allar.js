srv.listen(8765,async()=>{
  // Alle Bereiche (Florian 16.11.2026): lange auf Start oder Tipp oben rechts; Tipp daneben, ✕ und Zurück schließen; Anheften; Zurück schließt auch Schnellmenüs
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const touch=(type,x,y)=>A.evaluate(([type,x,y])=>{const el=document.elementFromPoint(x,y)||document.body;const t=new Touch({identifier:1,target:el,clientX:x,clientY:y});const ev=new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[t],changedTouches:[t]});(window.__tgt=window.__tgt&&type!=='touchstart'?window.__tgt:el).dispatchEvent(ev)},[type,x,y]);
  const has=()=>A.$('#allar').then(x=>!!x);
  await A.tap('#tabs [data-tab=essen]');await A.waitForTimeout(300);
  const sb=await (await A.$('#tabs [data-tab=camp]:not([hidden])')).boundingBox();const ox=sb.x+sb.width/2,oy=sb.y+sb.height/2;
  // 1) lange auf Start: Seite geht auf, bleibt nach dem Loslassen offen, Tipp daneben schließt
  await touch('touchstart',ox,oy);await A.waitForTimeout(600);r.open=await has();await touch('touchend',ox,oy);await A.waitForTimeout(400);r.stays=await has();
  r.groups=await A.$$eval('#allar .armg h3',l=>l.map(x=>x.innerText));r.tiles=await A.$$eval('#allar .armain',l=>l.length);r.subs=await A.$$eval('#allar .armsubs [data-arnav]',l=>l.length);r.col=await A.$eval('#allar .armg',e=>getComputedStyle(e).getPropertyValue('--gc').trim());r.noFoot=!(await A.$('#allar .arfoot'));
  const sh=await (await A.$('#allar .arsheet')).boundingBox();r.fits=sh.y>=0;r.scroll=await A.$eval('#allar .arsheet',e=>e.scrollHeight-e.clientHeight);
  await A.screenshot({path:out+'/alle-bereiche.png'});
  await A.mouse.click(195,8);await A.waitForTimeout(300);r.outside=!(await has());r.stillEssen=await A.$eval('#app h1',e=>e.innerText);
  // 2) Zurück schließt nur die Seite, nicht den Bereich
  await A.tap('[data-allar]');await A.waitForTimeout(300);r.top=await has();await A.goBack().catch(()=>{});await A.waitForTimeout(400);r.backClose=!(await has());r.backStay=await A.$eval('#app h1',e=>e.innerText);
  // 3) Kachel springt; Zurück danach führt zur vorherigen Seite
  await A.tap('[data-allar]');await A.waitForTimeout(300);await A.tap('#allar [data-arnav="musik|"]');await A.waitForTimeout(400);r.musik=await A.$eval('#app h1',e=>e.innerText);r.closed=!(await has());
  await A.goBack();await A.waitForTimeout(400);r.backTo=await A.$eval('#app h1',e=>e.innerText);
  // 4) Anheften per langem Drücken; oben "Angeheftet"
  await A.tap('[data-allar]');await A.waitForTimeout(400);await A.dispatchEvent('#allar [data-arnav="kita|"]','contextmenu');await A.waitForTimeout(700);r.pinLbl=await A.$eval('#allar .arlbl',e=>e.innerText);r.pinFirst=await A.$eval('#allar .artop [data-arnav]',e=>e.dataset.arnav);r.pinMark=await A.$eval('#allar .armain[data-arnav="kita|"]',e=>e.classList.contains('fav'));await A.tap('#allar [data-arx]');await A.waitForTimeout(300);r.x=!(await has());
  // 5) Schnellmenü im Bild: Zurück schließt es
  await A.tap('#tabs [data-tab=camp]');await A.waitForTimeout(400);await A.dispatchEvent('.spot[data-go=woche]','contextmenu');await A.waitForTimeout(300);r.qopen=!!(await A.$('#mbox'));await A.goBack().catch(()=>{});await A.waitForTimeout(400);r.qback=!(await A.$('#mbox'));r.qcamp=!!(await A.$('.camp'));
  // 6) Schnellmenü per Tipp daneben: kein toter Schritt im Verlauf
  await A.dispatchEvent('.spot[data-go=woche]','contextmenu');await A.waitForTimeout(800);await A.mouse.click(195,8);await A.waitForTimeout(400);r.qout=!(await A.$('#mbox'));
  r.afterQ=await A.evaluate(()=>JSON.stringify(history.state));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.open&&r.stays&&r.groups.length===6&&r.tiles>=12&&r.subs>=25&&r.col&&r.noFoot&&r.pinMark&&r.fits&&r.outside&&/Essen/.test(r.stillEssen)&&r.top&&r.backClose&&/Essen/.test(r.backStay)&&/Musik/.test(r.musik)&&r.closed&&/Essen/.test(r.backTo)&&/angeheftet/i.test(r.pinLbl)&&r.pinFirst==='kita|'&&r.x&&r.qopen&&r.qback&&r.qcamp&&r.qout&&/camp/.test(r.afterQ)&&!/ov/.test(r.afterQ);
  console.error(ok?'ALLAR OK':'ALLAR FAIL');await b.close();srv.close();process.exit(0)});
