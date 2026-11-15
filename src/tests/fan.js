srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const r={};
  const touch=(type,x,y)=>A.evaluate(([type,x,y])=>{const el=document.elementFromPoint(x,y)||document.body;const t=new Touch({identifier:1,target:el,clientX:x,clientY:y});const ev=new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[t],changedTouches:[t]});(window.__tgt=window.__tgt&&type!=='touchstart'?window.__tgt:el).dispatchEvent(ev)},[type,x,y]);
  await A.waitForSelector('#tabs [data-tab=camp]',{state:'visible'});const sb=await (await A.$('#tabs [data-tab=camp]:not([hidden])')).boundingBox();console.error('sb',sb);const ox=sb.x+sb.width/2,oy=sb.y+sb.height/2;
  await A.click('#tabs [data-tab=essen]');await A.waitForTimeout(300);
  // 1) gedrückt halten, ziehen zu Gruppe, weiter zu Bereich, loslassen
  await touch('touchstart',ox,oy);await A.waitForTimeout(650);r.open=await A.$$eval('#fan .fang',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  const pos=sel=>A.$eval(sel,e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});
  let [gx,gy]=await pos('#fan [data-fg="4"]');await touch('touchmove',gx,gy);await A.waitForTimeout(100);r.items=await A.$$eval('#fan .fanit',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  await A.screenshot({path:out+'/faecher.png'});
  let [ix,iy]=await pos('#fan [data-fi="2"]');await touch('touchmove',(gx+ix)/2,(gy+iy)/2);await touch('touchmove',ix,iy);await A.waitForTimeout(80);r.on=await A.$eval('#fan .fanit.on',e=>e.innerText).catch(()=>null);
  await touch('touchend',ix,iy);await A.waitForTimeout(300);r.h1=await A.$eval('#app h1',e=>e.innerText);r.gone=!(await A.$('#fan'));
  // 2) halten ohne ziehen: bleibt offen, dann tippen
  await A.evaluate(()=>window.__tgt=null);await touch('touchstart',ox,oy);await A.waitForTimeout(650);await touch('touchend',ox,oy);await A.waitForTimeout(100);r.sticky=!!(await A.$('#fan'));
  await A.click('#fan [data-fg="0"]');await A.click('#fan [data-fi="1"]');await A.waitForTimeout(300);r.h1b=await A.$eval('#app h1',e=>e.innerText);
  // 3) normaler Tipp auf Start geht zur Startseite
  await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(300);r.camp=!!(await A.$('.camp'));r.tab3=await A.$eval('#app',e=>e.innerText.slice(0,80));console.error(JSON.stringify(r));
  // 4) langes Drücken im Bild öffnet nichts mehr
  const box=await (await A.$('.camp')).boundingBox();await A.evaluate(()=>window.__tgt=null);await touch('touchstart',box.x+box.width*.72,box.y+box.height*.45);await A.waitForTimeout(650);r.noring=!(await A.$('#ring'))&&!(await A.$('#fan'));await touch('touchend',box.x+box.width*.72,box.y+box.height*.45);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.open.length===6&&/Freizeit/.test(r.open[4])&&r.items.length===3&&/Musik/.test(r.on)&&/Musik/.test(r.h1)&&r.gone&&r.sticky&&/Einkauf/.test(r.h1b)&&r.camp&&r.noring;
  console.error(ok?'FAN OK':'FAN FAIL');await b.close();srv.close();process.exit(0)});
