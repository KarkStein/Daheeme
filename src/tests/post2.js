srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);const reqs=[];c.on('request',r=>reqs.push(r.url()));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];
  await A.click('.spot[data-go=post]');await A.waitForTimeout(300);await A.fill('#mboxtel','0170 7654321');
  const [pop]=await Promise.all([c.waitForEvent('page',{timeout:5000}).catch(()=>null),A.click('#mboxnum button[type=submit]')]);const u=pop?pop.url():null;if(pop)await pop.close();
  await A.waitForTimeout(400);const db=JSON.parse(JSON.stringify(get(['haushalt',key,'food'])));
  const [pop2]=await Promise.all([c.waitForEvent('page',{timeout:5000}).catch(()=>null),A.click('.spot[data-go=post]')]);const u2=pop2?pop2.url():null;
  console.error(u,u2,db.contact,errs);const ok=!errs.length&&reqs.filter(x=>/wa\.me\/491707654321/.test(x)).length>=2&&db.contact&&db.contact.p1;
  console.error(ok?'POST2 OK':'POST2 FAIL');await b.close();srv.close();process.exit(0)});
