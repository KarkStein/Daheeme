srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="kita|ks:essen";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(300);
  const r={};r.empty=await A.$eval('#app',e=>/Noch kein Kita-Essen/.test(e.innerText));
  await A.click('.empty [data-act=kitamealedit]');await A.waitForTimeout(200);
  const V=[["Haferbrei mit Apfel","Kürbissuppe mit Brot","Joghurt","Vollkornbrot mit Frischkäse"],["Müsli","Nudeln mit Tomatensoße","Birne","Laugenbrezel"],["Brot mit Butter","Gemüsereis mit Hähnchen","Pudding","Gurke und Karotte"],["Obstteller","Kartoffelauflauf","","Knäckebrot"],["Brötchen mit Marmelade","Fischstäbchen mit Kartoffelbrei","Apfelmus","Reiswaffeln"]];
  for(let i=0;i<5;i++){await A.fill('#ke-fr'+i,V[i][0]);await A.fill('#ke-d'+i,V[i][1]);await A.fill('#ke-na'+i,V[i][2]);await A.fill('#ke-bz'+i,V[i][3])}
  await A.click('[data-act=kitamealsave]');await A.waitForTimeout(1500);
  r.days=await A.$$eval('.kmday',l=>l.length);r.rows=await A.$$eval('.kmrow',l=>l.length);r.d0=await A.$eval('.kmday',e=>e.innerText.replace(/\n/g,' | '));
  const el=await A.$('.kmweek');await el.scrollIntoViewIfNeeded();const bb=await el.boundingBox();
  await A.screenshot({path:out+'/kita-essen.png',fullPage:true});
  console.error(JSON.stringify(r),errs);console.error(!errs.length&&r.empty&&r.days===5&&r.rows===15&&/Kürbissuppe/.test(r.d0)&&/Joghurt/.test(r.d0)&&/Haferbrei/.test(r.d0)?'KM OK':'KM FAIL');await b.close();srv.close();process.exit(0)});
