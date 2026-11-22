srv.listen(8765,async()=>{
  // Zurück schließt offene Masken (Florian 22.11.2026: „Wenn ich auf zurück gehe, sollen Masken auch schließen.“)
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:400,height:860}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const fire=async(k,v)=>{await A.evaluate(([k,v])=>{const b=document.createElement("button");b.dataset[k]=v;b.id="zy";document.getElementById("app").appendChild(b)},[k,v]);await A.click("#zy");await A.waitForTimeout(400)};
  const back=async()=>{await A.goBack().catch(()=>{});await A.waitForTimeout(500)};
  // Termin-Maske im Kalender
  await nav('essen|');await nav('woche|wp:3');await fire('act','ternew');r.ter=!!(await A.$('#terform'));await back();r.terGone=!(await A.$('#terform'));r.terCal=!!(await A.$('[data-calview]'));
  // Erinnerung (Wichtig)
  await nav('wichtig|');await fire('prionew','frei');r.prio=await A.evaluate(()=>/Neue Erinnerung/i.test(document.getElementById('app').innerText));await back();r.prioGone=!(await A.evaluate(()=>/Tipp: Schreibt/.test(document.getElementById('app').innerText)))&&!!(await A.$('[data-prionew]'));
  // Musik
  await nav('musik|');await fire('act','musnew');r.mus=!!(await A.$('#mu-name'));await back();r.musGone=!(await A.$('#mu-name'));r.musTab=!!(await A.$('.muscard'));
  // Rezept-Maske
  await nav('essen|ft:rezepte');await fire('act','recnew');r.rec=!!(await A.$('[data-act=recsave]'));await back();r.recGone=!(await A.$('[data-act=recsave]'));r.recStill=!!(await A.$('.bookcard'));
  // Nach dem Schließen geht Zurück normal weiter (nicht aus der App)
  await back();r.after=await A.evaluate(()=>location.href.startsWith('http://localhost:8765'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.ter&&r.terGone&&r.terCal&&r.prio&&r.prioGone&&r.mus&&r.musGone&&r.musTab&&r.rec&&r.recGone&&r.recStill&&r.after;
  console.error(ok?'MASKZURUECK OK':'MASKZURUECK FAIL');await b.close();srv.close();process.exit(0)});
