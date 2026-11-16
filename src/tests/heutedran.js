srv.listen(8765,async()=>{
  // Woche › Tag und Woche (Florian 16.11.2026): Dashboard oben, darunter „🧹 Heute dran“ nur mit Aufgaben, abhakbar, ohne Scrollen sichtbar
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(500);
  const r=await A.evaluate(()=>{const c=document.querySelector('.heutedran'),d=document.querySelector('.campback.dash');return {order:!!(d&&c&&(d.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING)),top:c?Math.round(c.getBoundingClientRect().top):9999,txt:c?c.innerText.replace(/\n/g,' | '):'',n:c?c.querySelectorAll('[data-task]').length:0,old:/Heute zu tun/.test(document.getElementById('app').innerText)}});
  let ticked=false;if(r.n){const before=await A.$$eval('.heutedran .tdone',l=>l.length);await A.click('.heutedran .trow:not(.tdone) [data-task]');await A.waitForTimeout(600);ticked=(await A.$$eval('.heutedran .tdone',l=>l.length))>before}
  // Hausdienst als Aufgabe (Florian 16.11.2026): nur bei der zuständigen Person, geteilt bei beiden, ohne Zuständigen nichts
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});const wk='2026-W47';
  const hoRow=async()=>{await A.waitForTimeout(500);return A.$eval('.heutedran [data-hodone]',e=>e.closest('.trow').innerText.replace(/\n/g,' ')).catch(()=>'')};
  await put('weeks/'+wk+'/ticks/essen__0',{by:'p0',at:1});r.ho0=await hoRow();await A.$eval('.heutedran',e=>e.scrollIntoView({block:'start'}));await A.waitForTimeout(200);await A.screenshot({path:out+'/heutedran-hausdienst.png'});
  const todo=async()=>{await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(400);const t=await A.$eval('.todayrow[data-act=gotasks]',e=>e.innerText).catch(()=>'');await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);return t};
  if(r.ho0){await A.click('.heutedran [data-hodone]');await A.waitForTimeout(500);r.hoDone=JSON.stringify((get(['haushalt',key,'weeks',wk,'ticks','essen__0'])||{}).ok||{});r.hoCls=await A.$eval('.heutedran [data-hodone]',e=>e.closest('.trow').className)}
  await put('weeks/'+wk+'/ticks/essen__0',{by:'p1',at:1});r.ho1=await hoRow();
  await put('weeks/'+wk+'/ticks/essen__0',{by:'p1',half:'vm',at:1});r.hoVm=await hoRow();r.todoOpen=await todo();
  await put('weeks/'+wk+'/ticks/essen__0',{by:'x',lbl:'Oma',at:1});r.hoX=await hoRow();
  await A.screenshot({path:out+'/heutedran.png'});
  console.log(JSON.stringify(r),ticked,errs);
  console.log(!errs.length&&r.order&&r.top<560&&r.n>0&&ticked&&!r.old&&/Hausdienst/.test(r.ho0)&&/p0/.test(r.hoDone)&&/tdone/.test(r.hoCls)&&!r.ho1&&/nachmittags/.test(r.hoVm)&&/Offene/.test(r.todoOpen)&&!r.hoX?'HEUTEDRAN OK':'HEUTEDRAN FAIL');
  await b.close();process.exit(0)});
