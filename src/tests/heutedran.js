srv.listen(8765,async()=>{
  // Woche › Tag und Woche (Florian 16.11.2026): Dashboard oben, darunter „🧹 Heute dran“ nur mit Aufgaben, abhakbar, ohne Scrollen sichtbar
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(500);
  const r=await A.evaluate(()=>{const c=document.querySelector('.heutedran'),d=document.querySelector('.campback.dash');return {order:!!(d&&c&&(d.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING)),top:c?Math.round(c.getBoundingClientRect().top):9999,txt:c?c.innerText.replace(/\n/g,' | '):'',n:c?c.querySelectorAll('[data-task]').length:0,old:/Heute zu tun/.test(document.getElementById('app').innerText)}});
  let ticked=false;if(r.n){const before=await A.$$eval('.heutedran .tdone',l=>l.length);await A.click('.heutedran .trow:not(.tdone) [data-task]');await A.waitForTimeout(600);ticked=(await A.$$eval('.heutedran .tdone',l=>l.length))>before}
  await A.screenshot({path:out+'/heutedran.png'});
  console.log(JSON.stringify(r),ticked,errs);
  console.log(!errs.length&&r.order&&r.top<560&&r.n>0&&ticked&&!r.old?'HEUTEDRAN OK':'HEUTEDRAN FAIL');
  await b.close();process.exit(0)});
