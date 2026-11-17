srv.listen(8765,async()=>{
  // Fächer (Florian 17.11.2026): lange auf Start = Familie und Zuhause, lange auf Einkauf = Freizeit und Gemerktes; Gleiten und Loslassen öffnet, Kachel oben rechts bleibt
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},hasTouch:true,isMobile:true,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const touch=(type,x,y)=>A.evaluate(([type,x,y])=>{const el=document.elementFromPoint(x,y)||document.body;const t=new Touch({identifier:1,target:el,clientX:x,clientY:y});const ev=new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[t],changedTouches:[t]});(window.__tgt=window.__tgt&&type!=='touchstart'?window.__tgt:el).dispatchEvent(ev)},[type,x,y]);
  const has=()=>A.$('#fan').then(x=>!!x),h1=()=>A.$eval('#app h1',e=>e.innerText);
  const mid=async sel=>{const bb=await (await A.$(sel)).boundingBox();return [bb.x+bb.width/2,bb.y+bb.height/2]};
  // 1) lange auf Einkauf: Fächer rechts, bleibt nach dem Loslassen offen, Tipp auf Musik öffnet Musik
  let [x,y]=await mid('#tabs [data-tab=einkauf]:not([hidden])');
  await touch('touchstart',x,y);await A.waitForTimeout(600);r.open=await has();await touch('touchend',x,y);await A.waitForTimeout(400);r.stays=await has();
  r.side=await A.$eval('#fan',e=>e.className);r.right=await A.$$eval('#fan [data-fannav]',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));r.noAllar=!(await A.$('#allar'));
  const lb=await (await A.$('#fan .fanlist')).boundingBox(),tb=await (await A.$('#tabs')).boundingBox();r.fits=lb.y>=0&&lb.y+lb.height<=tb.y;
  await A.screenshot({path:out+'/facher-rechts.png'});
  await A.tap('#fan [data-fannav="musik|"]');await A.waitForTimeout(400);r.musik=await h1();r.closed=!(await has());
  // 2) lange auf Start, Finger auf „Kind“ gleiten lassen und loslassen
  [x,y]=await mid('#tabs [data-tab=camp]:not([hidden])');
  await touch('touchstart',x,y);await A.waitForTimeout(600);r.left=await A.$$eval('#fan [data-fannav]',l=>l.map(x=>x.dataset.fannav));r.lcls=await A.$eval('#fan',e=>e.className);
  const [kx,ky]=await mid('#fan [data-fannav="kind|"]');await touch('touchmove',kx,ky);r.hot=await A.$eval('#fan [data-fannav="kind|"]',e=>e.classList.contains('fanhot'));await touch('touchend',kx,ky);await A.waitForTimeout(400);
  r.kind=await A.$eval('#app .eyebrow',e=>e.innerText);r.closed2=!(await has());r.tab=await h1();
  // 3) Zurück schließt nur den Fächer; „Alle Bereiche ›“ öffnet die große Übersicht
  [x,y]=await mid('#tabs [data-tab=camp]:not([hidden])');await touch('touchstart',x,y);await A.waitForTimeout(600);await touch('touchend',x,y);await A.waitForTimeout(400);
  await A.goBack().catch(()=>{});await A.waitForTimeout(400);r.backClose=!(await has());r.backTab=await h1();
  [x,y]=await mid('#tabs [data-tab=einkauf]:not([hidden])');await touch('touchstart',x,y);await A.waitForTimeout(600);await touch('touchend',x,y);await A.waitForTimeout(400);
  await A.tap('#fan [data-fanall]');await A.waitForTimeout(300);r.allar=!!(await A.$('#allar'))&&!(await has());await A.mouse.click(180,8);await A.waitForTimeout(300);
  // 4) Kachel oben rechts geht weiter, kurzer Tipp auf Einkauf bleibt normal
  await A.tap('[data-allar]');await A.waitForTimeout(300);r.tile=!!(await A.$('#allar'));await A.mouse.click(180,8);await A.waitForTimeout(300);
  await A.tap('#tabs [data-tab=einkauf]:not([hidden])');await A.waitForTimeout(400);r.shortTap=await h1();r.noFan=!(await has());
  // 5) Schalter aus: kein Fächer
  await A.evaluate(()=>localStorage.setItem('hq-gest',JSON.stringify({ring:false})));await A.reload();await A.waitForTimeout(800);[x,y]=await mid('#tabs [data-tab=camp]:not([hidden])');await touch('touchstart',x,y);await A.waitForTimeout(600);await touch('touchend',x,y);await A.waitForTimeout(300);r.off=!(await has());
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.open&&r.stays&&r.side==='r'&&r.right.join('|')==='🧭 Reisen und Ausflüge|Packlisten|🎵 Musik|🗃️ Sammlung|Alles Gemerkte|Recherchen'&&r.noAllar&&r.fits&&/Musik/.test(r.musik)&&r.closed
    &&r.left.join()==='kind|,kita|,spiel|,privat|,privat|,geschenke|,amhaus|'&&r.lcls==='l'&&r.hot&&r.tab==='Kind'&&r.kind==='FAMILIE'&&r.closed2&&r.backClose&&r.backTab==='Kind'&&r.allar&&r.tile&&/Einkaufsliste|Einkauf/.test(r.shortTap)&&r.noFan&&r.off;
  console.error(ok?'FACHER OK':'FACHER FAIL');await b.close();srv.close();process.exit(0)});
