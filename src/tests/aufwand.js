srv.listen(8765,async()=>{
  // Aufwand auch bei fest zugeteilten Aufgaben (Florian 17.11.2026): Feld in „Aufgaben bearbeiten“, wird gezeigt, ändert nichts an den Paketen der Wechsel-Aufgaben
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const r={};const cfg=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'config'])));
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(200);await A.click('[data-wpage="1"]');await A.waitForTimeout(300);
  await A.click('[data-wmwsec=pakete]');await A.waitForTimeout(200);r.pak0=await A.$eval('.rotlist',e=>e.innerText);
  await A.click('[data-wmwsec=edit]');await A.waitForTimeout(200);
  r.fix=!!(await A.$('#tp-balkon'));r.both=!!(await A.$('#tp-mittag'));r.month=!!(await A.$('#tp-flaechen-0'));r.rot=!!(await A.$('#tp-bad'));r.ho=!!(await A.$('#tp-essen'));r.rotMonth=!!(await A.$('#tp-zimmer-drueben'));
  await A.fill('#tp-balkon','9');await A.dispatchEvent('#tp-balkon','change');await A.fill('#tp-buecherregal','30');await A.dispatchEvent('#tp-buecherregal','change');
  if(out){await A.$eval('#tp-balkon',e=>e.scrollIntoView({block:'center'}));await A.screenshot({path:out+'/aufwand.png'})}
  await A.click('[data-act=save]');await A.waitForTimeout(500);
  const T=cfg().tasks;r.pts=[T.find(t=>t.id==='balkon').pts,T.find(t=>t.id==='buecherregal').pts].join('|');
  r.pak1=await A.$eval('.rotlist',e=>e.innerText);
  await A.click('[data-wmwsec=ver-p0]');await A.waitForTimeout(200);r.list=await A.$eval('.wmwsec:has([data-wmwsec=ver-p0])',e=>e.innerText.replace(/\s+/g,' '));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.fix&&r.both&&r.month&&r.rot&&!r.ho&&r.rotMonth&&r.pts==='9|30'&&r.pak0===r.pak1&&r.pak0.length>20&&/Balkon 1× pro Woche · Aufwand 9/.test(r.list);
  console.error(ok?'AUFWAND OK':'AUFWAND FAIL');await b.close();srv.close();process.exit(0)});
