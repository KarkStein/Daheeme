srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/wochenideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({items:[{name:'Kürbissuppe',link:'https://example.org/k',ing:['Kürbis','Zwiebel'],min:30,wx:'kalt',haupt:'Gemüse',art:'suppe'}]})}));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  await A.click('[data-tab=essen]');await A.click('[data-food=plan]');await A.click('[data-act=suggest]');await A.waitForTimeout(200);
  const k=await A.$eval('[data-sugok]',e=>e.dataset.sugok);
  await A.click('[data-sugrec]');await A.waitForTimeout(300);await A.click('#mbox button[type=submit]');await A.waitForTimeout(300);await A.click('[data-sugok]');await A.click('#mbox [data-sugto=plan]');await A.waitForTimeout(400);
  const recRow=await A.$$eval('ul.meals .dish',l=>l.map(x=>x.innerText).filter(x=>/Kürbissuppe/.test(x)));
  await A.click('[data-act=mealshop]');await A.click('[data-pickmode=alle]');await A.waitForTimeout(500);
  await A.click('[data-food=heute]');await A.click('[data-food=plan]').catch(()=>{});
  await A.click(`[data-planrm=${k}]`);await A.waitForTimeout(500);
  const plan=await A.$$eval('ul.meals .dish',l=>l.map(x=>x.innerText).filter(x=>/Kürbissuppe/.test(x)));
  await A.click('#tabs [data-tab=einkauf]');const shop=await A.$$eval('.shop .nm',l=>l.map(x=>x.innerText));
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');await A.click('[data-rec]');await A.click('[data-recrm]');await A.waitForTimeout(400);const recs=await A.$$eval('[data-rec]',l=>l.length);
  console.log({recRow,plan,shop,recs,errs});
  const ok=!errs.length&&recRow.length===1&&/Rezept/.test(recRow[0])&&plan.length===0&&!shop.some(x=>/Kürbis/.test(x))&&recs===0;
  console.log(ok?'RM OK':'RM FAIL');await b.close();srv.close();process.exit(0)});
