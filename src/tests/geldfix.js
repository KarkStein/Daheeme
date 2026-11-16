srv.listen(8765,async()=>{
  // Feste Zahlungen: fällige Monate, Buchen mit fester Id (nie doppelt), gelöschter Monat bleibt weg, gemeinsames Konto ändert den Stand nicht
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));await A.clock.setFixedTime(new Date('2026-11-16T18:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=k=>JSON.parse(JSON.stringify(get(['haushalt',key,'food',k])||{}));
  r.due=await A.evaluate(()=>{const {fixDue,fixMonthly}=window.Geld;return [fixDue({start:'2026-09',day:1,rh:'m'},'2026-11-16').join(' '),fixDue({start:'2026-09',day:20,rh:'m'},'2026-11-16').join(' '),fixDue({start:'2026-01',day:31,rh:'q'},'2026-11-16').join(' '),fixDue({start:'2026-09',day:1,rh:'m',end:'2026-10'},'2026-11-16').join(' '),fixMonthly([{amt:1200,rh:'y'},{amt:300,rh:'m'}])].join('|')});
  await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);await A.click('[data-gtab=fest]');
  await A.click('[data-gact=fixnew]');await A.fill('[data-gf=amt]','300');await A.fill('[data-gf=name]','Kita-Beitrag');await A.click('[data-gby=p0]');await A.fill('[data-gf=day]','1');await A.fill('[data-gf=start]','2026-10');
  await A.screenshot({path:out+'/geld-fest-maske.png',fullPage:true});
  await A.click('#geldform button[type=submit]');await A.waitForTimeout(800);
  const F=Object.values(db('fixpay'))[0]||{};r.fix=[F.amt,F.by,F.split,F.cat,F.rh,F.day,F.start].join();
  r.booked=Object.keys(db('money')).sort().join();
  r.bal=await A.evaluate(()=>{const L=Object.values(window.__f||{});return 0});
  // zweite: Strom vom gemeinsamen Konto, 20.
  await A.click('[data-gact=fixnew]');await A.fill('[data-gf=amt]','90');await A.fill('[data-gf=name]','Strom');await A.click('[data-gby=joint]');await A.fill('[data-gf=day]','20');await A.fill('[data-gf=start]','2026-11');await A.click('#geldform button[type=submit]');await A.waitForTimeout(800);
  r.n2=Object.keys(db('money')).length;r.page=await A.$eval('#app',e=>e.innerText.replace(/\s+/g,' '));
  await A.screenshot({path:out+'/geld-fest.png',fullPage:true});
  // Oktober löschen → bleibt weg
  await A.click('[data-gtab=liste]');await A.click('[data-gmon="-1"]');await A.waitForTimeout(200);await A.click('.geldrow [data-geldedit]');await A.click('[data-gact=del]');await A.click('[data-gact=del]');await A.waitForTimeout(800);
  r.afterDel=Object.keys(db('money')).sort().join();r.skip=JSON.stringify(Object.values(db('fixpay')).find(x=>x.name==='Kita-Beitrag').skip);
  await A.click('[data-gtab=uebersicht]');await A.waitForTimeout(200);r.ov=await A.$eval('#app',e=>e.innerText.replace(/\s+/g,' '));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.due==='2026-09 2026-10 2026-11|2026-09 2026-10|2026-01 2026-04 2026-07 2026-10|2026-09 2026-10|400'&&r.fix==='30000,p0,half,kita,m,1,2026-10'
    &&r.booked.split(',').length===2&&/f_.*_202610/.test(r.booked)&&/f_.*_202611/.test(r.booked)&&r.n2===2&&/Kita-Beitrag/.test(r.page)&&/⏳/.test(r.page)&&/390,00 € im Monat/.test(r.page)
    &&r.afterDel.split(',').length===1&&/202611/.test(r.afterDel)&&r.skip==='{"2026-10":true}'&&/Du bekommst 150,00 €/.test(r.ov)&&/Feste Zahlungen/.test(r.ov);
  console.error(ok?'GELDFIX OK':'GELDFIX FAIL');await b.close();srv.close();process.exit(0)});
