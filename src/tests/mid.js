srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const run=async(day,shot)=>{
    const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
    await A.clock.setFixedTime(new Date(day+'T09:00:00+01:00'));
    await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
    const o={};
    await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(400);
    // Woche kompakt (17.11.2026): Monat ist eine Klapp-Karte, erst aufklappen
    const mf=await A.$('[data-tfold=wk_month][aria-expanded=false]');if(mf){await mf.click();await A.waitForTimeout(300)}
    o.titles=await A.$$eval('.wt .wtn b',l=>l.map(x=>x.innerText).filter(x=>/Flächen|Zimmer drüben/.test(x)));
    o.later=await A.$$eval('.laterline',l=>l.map(x=>x.innerText).join(' | '));
    await A.click('[data-tab=camp]');await A.waitForTimeout(400);
    await A.click('.camp',{position:{x:120,y:60}});await A.waitForTimeout(400);
    if(await A.$('[data-tagsum=auf]'))await A.click('[data-tagsum=auf]');await A.waitForTimeout(200);o.back=await A.$$eval('.tagcard .trow',l=>l.map(x=>x.innerText));
    if(shot){await A.addStyleTag({content:'#tabs{display:none!important}'});await A.waitForTimeout(800);await A.screenshot({path:out+'/'+shot});
}
    await c.close();return o};
  r.a=await run('2026-11-10');r.b=await run('2026-11-20','dashboard-aufgaben.png');
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.a.titles.length===0&&/Flächen/.test(r.a.later)&&r.b.titles.length>0;
  console.error(ok?'MID OK':'MID FAIL');await b.close();srv.close();process.exit(0)});
