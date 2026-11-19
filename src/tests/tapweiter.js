srv.listen(8765,async()=>{
  // Reiter unten (Florian 16.11.2026; Essen seit 16.11.2026 zwei Seiten): Tipp auf den eigenen Reiter = eine Unterseite weiter (am Ende wieder vorn); anderer Reiter = erste Seite; Doppeltipp = Seite 2
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const h1=()=>A.$eval('#app h1',e=>e.innerText).catch(()=>'');const where=async()=>{const t=await A.evaluate(()=>{const p=document.querySelector('.pager [aria-current="page"],.pager .pdot[aria-pressed="true"],[data-food][aria-pressed="true"]');return p?p.innerText.replace(/\n/g,' '):''});return (await h1())+' / '+t};
  const tap=async(t,wait=600)=>{await A.click('#tabs [data-tab='+t+']');await A.waitForTimeout(wait)};
  await tap('essen');r.e0=await where();await tap('essen');r.e1=await where();await tap('essen');r.e2=await where();await tap('essen');r.e3=await where();await tap('essen');r.e4=await where();
  await tap('einkauf');r.k0=await where();await tap('einkauf');r.k1=await where();
  await tap('woche');r.w0=await where();await tap('woche');r.w1=await where();await tap('woche');r.w2=await where();await tap('woche');r.w3=await where();
  // Doppeltipp aus einem anderen Reiter: Start -> Kalender
  await tap('camp',100);await tap('camp',600);r.dbl=await where();
  // Doppeltipp, wenn man schon im Reiter ist: landet trotzdem auf Seite 2
  await tap('einkauf');await tap('einkauf',100);await tap('einkauf',600);r.dbl2=await where();
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Essen/.test(r.e0)&&/Heute/.test(r.e0)&&/Rezepte/.test(r.e1)&&r.e2===r.e0&&r.e3===r.e1&&r.k0!==r.k1&&/Ausgaben/.test(r.k1)&&r.w0!==r.w1&&/Rückblick/.test(r.w2)&&r.w3===r.w0&&/Kalender/.test(r.dbl)&&/Ausgaben/.test(r.dbl2);
  console.error(ok?'TAPWEITER OK':'TAPWEITER FAIL');await b.close();srv.close();process.exit(0)});
