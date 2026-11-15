srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const ideas=JSON.parse(fs.readFileSync('/home/user/Daheeme/ideen.json','utf8'));
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/ideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(ideas)}));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];await fetch('http://localhost:8765/haushalt/'+key+'/food/rec/old1.json',{method:'PUT',body:JSON.stringify({name:'Altes Rezept',ing:'1 Zwiebel',at:1})});
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');await A.waitForTimeout(300);
  const first=await A.$eval('#app section.card h2',e=>e.textContent);
  const cats=await A.$$eval('[data-idea]',l=>l.length);
  await A.click('[data-idea="0"]');await A.waitForTimeout(300);await A.click('[data-idea="3"]');await A.waitForTimeout(300);
  const taken=await A.$$eval('button[data-recrm].danger',l=>l.length);
  await A.screenshot({path:out+'/rezepte.png',fullPage:true});
  // Idee über ✓ Entfernen zurücknehmen
  await A.click('button[data-recrm].danger');await A.waitForTimeout(400);const taken2=await A.$$eval('button[data-recrm].danger',l=>l.length);
  // Altes Rezept über ✕ am Kopf entfernen
  const n1=await A.$$eval('[data-rec]',l=>l.length);await A.click('.recbar [data-recrm="old1"]');await A.waitForTimeout(400);const n2=await A.$$eval('[data-rec]',l=>l.length);
  console.log({first,cats,taken,taken2,n1,n2,errs});
  const ok=!errs.length&&/Tagesrezepte/.test(first)&&cats===5&&taken===2&&taken2===1&&n2===n1-1;
  console.log(ok?'IDEA OK':'IDEA FAIL');await b.close();srv.close();process.exit(0)});
