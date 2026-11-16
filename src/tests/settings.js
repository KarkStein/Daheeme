srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const left=await A.$('.appleft .bellnav');await A.click('[data-go=settings]');const h1=await A.$eval('h1',e=>e.textContent);
  await A.screenshot({path:out+'/einstellungen.png',fullPage:true});
  await A.click('[data-allar]').then(()=>A.click('#allar [data-arnav="bereiche|"]'));const tiles=await A.$$eval('[data-nav]',l=>l.length);await A.screenshot({path:out+'/bereiche.png',fullPage:true});
  await A.click('[data-nav="ausflug|tt:recherche"]');const urlaub=(await A.$eval('h1',e=>e.textContent))==='Reisen und Ausflüge'&&!!(await A.$('#fundform'))?'true':'false';
  await A.click('[data-allar]').then(()=>A.click('#allar [data-arnav="bereiche|"]'));await A.click('[data-nav="woche|wp:1"]');const wp=await A.$$eval('.weekpager [aria-pressed=true], [data-wpage][aria-pressed=true]',l=>l.map(x=>x.innerText)).catch(()=>[]);
  await A.click('[data-go=settings]');await A.click('[data-go=settings] ~ x').catch(()=>{});await A.click('#tabs [data-tab=einkauf]');await A.click('[data-act=pantrytoggle]');await A.fill('#pantryinput','Zimt');await A.press('#pantryinput','Enter');await A.waitForTimeout(300);const zimt=!!(await A.$('[data-pantryrm="Zimt"]'));
  await A.click('.appleft .bellnav');const wh=await A.$eval('h1',e=>e.textContent);
  console.log({left:!!left,h1,tiles,urlaub,wp,zimt,wh,errs});
  const ok=!errs.length&&!!left&&h1==='Einstellungen'&&tiles>=30&&urlaub==='true'&&zimt&&/Wichtig/.test(wh);
  console.log(ok?'SET OK':'SET FAIL');await b.close();srv.close();process.exit(0)});
