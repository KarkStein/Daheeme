srv.listen(8765,async()=>{
  // Aufgabe nur diese Woche jemand anderem geben (Florian 22.11.2026): Tipp auf die Person unter dem Namen
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-22T17:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1],wk='2026-W47';
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(600);const mo=await A.$("[data-act=wkmore]");if(mo){await mo.scrollIntoViewIfNeeded();await mo.click();await A.waitForTimeout(400)}r.ids=await A.$$eval("[data-wkown]",l=>l.map(x=>x.dataset.wkown).join());
  const who=()=>A.$eval('[data-wkown="plastik"]',e=>e.closest('.wtm').innerText.replace(/\s+/g,' ').trim());
  r.before=await who();const plan=/Florian/.test(r.before)?'p0':'p1',other=plan==='p0'?'p1':'p0';
  await A.$eval('[data-wkown="plastik"]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-wkown="plastik"]');await A.waitForTimeout(400);
  r.opts=await A.$$eval('#mbox [data-wko]',l=>l.map(x=>x.dataset.wko).join());await A.screenshot({path:out+'/aufgabe-person-fenster.png'});
  await A.click(`#mbox [data-wko="${other}"]`);await A.waitForTimeout(600);r.db=get(['haushalt',key,'food','wkown',wk,'plastik']);r.after=await who();
  await A.$eval('[data-wkown="plastik"]',e=>e.scrollIntoView({block:'center'}));await A.screenshot({path:out+'/aufgabe-person-getauscht.png'});
  // abhaken durch die neue Person zählt nicht als übernommen
  await A.click('[data-wkown="plastik"]');await A.waitForTimeout(400);await A.click(`#mbox [data-wko="${plan}"]`);await A.waitForTimeout(600);r.back=get(['haushalt',key,'food','wkown',wk,'plastik'])||null;r.back2=await who();
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/↻/.test(r.before)&&r.opts==='p0,p1,edit'&&r.db===other&&/nur diese Woche/.test(r.after)&&!/↻/.test(r.after)&&r.back===null&&r.back2===r.before;
  console.error(ok?'WKOWN OK':'WKOWN FAIL');await b.close();srv.close();process.exit(0)});
