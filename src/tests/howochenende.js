srv.listen(8765,async()=>{
  // Hausdienst nur Mo bis Fr (Florian 21.11.2026: „Am Wochenende raus“): Samstag kein Feld, nichts in „Heute für dich“, Rückblick zählt Sa/So nicht
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-21T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1],wk='2026-W47';const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('weeks/'+wk+'/ticks/essen__5',{by:'p0',at:1});await put('weeks/'+wk+'/ticks/essen__1',{by:'p1',at:1});await A.waitForTimeout(500);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(600);
  r.days=await A.$$eval('#sec-ho .hocol small',l=>l.map(x=>x.innerText).join(''));r.note=await A.$eval('#sec-ho .hochk',e=>e.innerText);r.lab=await A.$eval('#sec-ho .hoinh',e=>e.innerText);
  r.heute=await A.$eval('.wkheute',e=>e.innerText);
  await A.$eval('#sec-ho',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/hausdienst-wochenende.png'});
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:4";b.id="zz2";document.getElementById("app").appendChild(b)});await A.click("#zz2");await A.waitForTimeout(600);
  r.rb=await A.$eval('#app',e=>(e.innerText.match(/Hausdienst:[^\n]*/)||[''])[0]);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.days==='MoDiMiDoFr'&&/Wochenende/.test(r.note)&&/Wochenende/.test(r.lab)&&!/Hausdienst/.test(r.heute)&&/ 0 Tage/.test(r.rb)&&/ 1$/.test(r.rb.trim());
  console.error(ok?'HOWOCHENENDE OK':'HOWOCHENENDE FAIL');await b.close();srv.close();process.exit(0)});
