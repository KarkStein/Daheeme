srv.listen(8765,async()=>{
  // Morgen-Briefing je Handy (Florian 21.11.2026, Variante B): Uhrzeit, Wochenende, Zeilen, Jetzt ausprobieren
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin',permissions:['notifications']});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.addInitScript(()=>{try{Object.defineProperty(Notification,'permission',{get:()=>'granted'})}catch(_){}});await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  await A.evaluate(()=>localStorage.setItem('hq-dev','dtest'));
  await fetch('http://localhost:8765/haushalt/'+key+'/food/push/dtest.json',{method:'PUT',body:JSON.stringify({who:'p0',on:true,sub:{endpoint:'x'},at:1})});await A.waitForTimeout(1500);
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='settings';document.getElementById('app').appendChild(b);b.click()}).catch(()=>{});await A.waitForTimeout(300);await A.click('[data-setsum=push]');await A.waitForTimeout(300);
  r.card=await A.$eval('#set-push',e=>e.innerText.slice(0,200)).catch(()=>'');r.perm=await A.evaluate(()=>Notification.permission);r.dev=await A.evaluate(()=>localStorage.getItem('hq-dev'));console.error(JSON.stringify(r));
  r.chips=await A.$$eval('[data-brief]',l=>l.length);r.essen=await A.$eval('[data-brief="ln|essen"]',e=>e.getAttribute('aria-pressed'));
  await A.$eval('[data-brief="t|07:00"]',e=>e.scrollIntoView({block:'center'}));if(out)await A.screenshot({path:out+'/briefing-einstellung.png'});
  await A.click('[data-brief="t|06:30"]');await A.waitForTimeout(400);await A.click('[data-brief="ln|essen"]');await A.waitForTimeout(400);await A.click('[data-brief="ln|wx"]');await A.waitForTimeout(400);
  await A.click('[data-act=brieftest]');await A.waitForTimeout(500);
  r.B=get(['haushalt',key,'food','push','dtest','brief']);r.on=await A.$eval('[data-brief="t|06:30"]',e=>e.getAttribute('aria-pressed'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.chips===17&&r.essen==='false'&&r.B&&r.B.t==='06:30'&&r.B.ln.essen===true&&r.B.ln.wx===false&&r.B.test>0&&r.on==='true';
  console.error(ok?'BRIEFSET OK':'BRIEFSET FAIL');await b.close();srv.close();process.exit(0)});
