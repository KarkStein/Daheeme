srv.listen(8765,async()=>{
  // Haushalt (Florian 19.11.2026, „2: Heute im Wochenkopf“): kein Dashboard, „Heute für dich“ in der Kopf-Karte, abhakbar; Wochen-Aufgaben nach Florians Regel
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  globalThis.FOLD_ASIS=1;const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(500);
  const r=await A.evaluate(()=>{const c=document.querySelector('.wkheute');return {order:!document.querySelector('.campback.dash:not(.wkheute)')&&!document.querySelector('.heutedran'),top:c&&c.querySelector('.hhead')?Math.round(c.querySelector('.hhead').getBoundingClientRect().top):9999,app:document.getElementById('app').innerText.slice(0,300),txt:c?c.innerText.replace(/\n/g,' | '):'',n:c?c.querySelectorAll('[data-task]').length:0,old:/Heute zu tun/.test(document.getElementById('app').innerText),folds:[...document.querySelectorAll('.wkfold>[data-tfold]')].map(x=>x.getAttribute('aria-expanded'))}});
  let ticked=false;if(r.n){const before=await A.$$eval('.wkheute .hdone',l=>l.length);await A.click('.wkheute .hrow:not(.hdone) [data-task]');await A.waitForTimeout(600);ticked=(await A.$$eval('.wkheute .hdone',l=>l.length))>before}
  // Hausdienst als Aufgabe (Florian 16.11.2026): nur bei der zuständigen Person, geteilt bei beiden, ohne Zuständigen nichts
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});const wk='2026-W47';
  const hoRow=async()=>{await A.waitForTimeout(500);return A.$eval('.wkheute [data-hodone]',e=>e.closest('.hrow').innerText.replace(/\n/g,' ')).catch(()=>'')};
  await put('weeks/'+wk+'/ticks/essen__0',{by:'p0',at:1});r.ho0=await hoRow();await A.waitForTimeout(200);await A.screenshot({path:out+'/heutedran-hausdienst.png'});
  const todo=async()=>{await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(400);const t=await A.$eval('.startdash .bcnt[data-act=gotasks]',e=>e.innerText).catch(()=>'');await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);return t};
  if(r.ho0){await A.click('.wkheute [data-hodone]');await A.waitForTimeout(500);r.hoDone=JSON.stringify((get(['haushalt',key,'weeks',wk,'ticks','essen__0'])||{}).ok||{});r.hoCls=await A.$eval('.wkheute [data-hodone]',e=>e.closest('.hrow').className)}
  await put('weeks/'+wk+'/ticks/essen__0',{by:'p1',at:1});r.ho1=await hoRow();
  await put('weeks/'+wk+'/ticks/essen__0',{by:'p1',half:'vm',at:1});r.hoVm=await hoRow();r.todoOpen=await todo();
  await put('weeks/'+wk+'/ticks/essen__0',{by:'x',lbl:'Oma',at:1});r.hoX=await hoRow();
  await A.screenshot({path:out+'/heutedran.png'});
  // Donnerstag: 1× pro Woche ist ab heute dabei, 2× mit „1 von 2 fällig“
  await A.clock.setFixedTime(new Date('2026-11-19T10:00:00+01:00'));await A.reload();await A.waitForSelector('.wkheute');await A.waitForTimeout(500);r.thu=await A.$eval('.wkheute .hlist',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'');
  await A.screenshot({path:out+'/haushalt-heute-donnerstag.png'});
  // Mehrfach wöchentlich: nach dem Haken bleibt ＋1 für die nächste Runde
  await A.click('.wkheute .hrow:has-text("von 3 fällig") .hchk');await A.waitForTimeout(600);r.more1=await A.$eval('.wkheute .hrow.hdone:has(.hmore)',e=>e.innerText.replace(/\n/g,' ')).catch(()=>'');
  await A.click('.wkheute .hrow.hdone .hmore');await A.waitForTimeout(600);r.more2=await A.$eval('.wkheute .hrow.hdone:has(.hmore)',e=>e.innerText.replace(/\n/g,' ')).catch(()=>'');
  await A.screenshot({path:out+'/haushalt-heute-plus1.png'});
  console.log(JSON.stringify(r),ticked,errs);
  const mon=r.txt.split(/heute für/i)[1]||'';
  console.log(!errs.length&&r.order&&r.top<400&&r.n>0&&ticked&&!r.old&&r.folds.every(x=>x==='false')&&!/fällig|diese Woche/.test(mon)&&/täglich/.test(mon)&&/Hausdienst/.test(r.ho0)&&/p0/.test(r.hoDone)&&/hdone/.test(r.hoCls)&&!r.ho1&&/nachmittags/.test(r.hoVm)&&/Heute dran/.test(r.todoOpen)&&!r.hoX&&/von 2 fällig/.test(r.thu)&&/diese Woche/.test(r.thu)&&/1 von 3/.test(r.more1)&&/2 von 3/.test(r.more2)?'HEUTEDRAN OK':'HEUTEDRAN FAIL');
  await b.close();process.exit(0)});
