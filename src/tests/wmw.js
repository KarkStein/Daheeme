srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const r={};
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(200);r.pager=await A.$$eval('.pdot',l=>l.map(x=>x.innerText));
  await A.click('[data-wpage="1"]');await A.waitForTimeout(300);r.h1=await A.$eval('#app h1',e=>e.innerText);
  r.secs=await A.$$eval('[data-wmwsec]',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));r.nums=await A.$eval('.wmwnums',e=>e.innerText.replace(/\n/g,' '));
  await A.click('[data-wtick]');await A.waitForTimeout(400);r.nums2=await A.$eval('.wmwnums',e=>e.innerText.replace(/\n/g,' '));
  await A.screenshot({path:out+'/wmw.png',fullPage:true});
  await A.click('[data-wmwwho=alle]');await A.waitForTimeout(200);r.alle=await A.$$eval('[data-wmwsec]',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  await A.click('[data-act=wmwall]');await A.waitForTimeout(200);r.opened=await A.$$eval('.wmwsec .setbody',l=>l.length);
  await A.click('[data-wmwview=rhythmus]');await A.waitForTimeout(200);r.rh=await A.$$eval('[data-wmwsec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  await A.click('[data-wmwview=zeit]');const ed=await A.$('[data-wmwsec=edit][aria-expanded=false]');if(ed)await ed.click();await A.click('[data-act=add]');await A.waitForTimeout(200);
  const last=await A.$$('.editrow[data-i] input[data-f=name]');await last[last.length-1].fill('Testaufgabe');await A.click('[data-act=save]');await A.waitForTimeout(400);
  const db=JSON.parse(JSON.stringify(get(['haushalt',key])));r.saved=(db.config.tasks||[]).some(t=>t.name==='Testaufgabe');const w=Object.values(db.weeks||{})[0];r.ticks=w&&w.ticks?Object.keys(w.ticks).length:0;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pager.length===3&&/Wer macht was/.test(r.h1)&&r.secs.length>=4&&r.ticks===1&&r.saved&&r.opened>=4&&r.rh.length>=2;
  console.error(ok?'WMW OK':'WMW FAIL');await b.close();srv.close();process.exit(0)});
