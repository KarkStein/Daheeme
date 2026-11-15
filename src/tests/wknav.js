srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const r={};
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);
  r.h0=await A.$eval('#app h1',e=>e.innerText);
  await A.screenshot({path:out+'/woche-navi.png',clip:{x:0,y:0,width:400,height:420}});
  await A.click('[data-wknav="-1"]');await A.waitForTimeout(300);
  r.h1=await A.$eval('#app h1',e=>e.innerText);r.tab=await A.$eval('#app h1',e=>!!e);
  r.ro=await A.$eval('.wkro',e=>e.innerText);
  const tb=await A.$('[data-task]');if(tb){await tb.click();await A.waitForTimeout(300)}
  r.toast=await A.$eval('body',e=>/Archiv: erst/.test(e.innerText));
  await A.screenshot({path:out+'/woche-archiv.png',clip:{x:0,y:0,width:400,height:520}});
  await A.click('[data-act=wkedit]');await A.waitForTimeout(200);r.ro2=await A.$eval('.wkro',e=>e.innerText);
  await A.click('[data-wknav="0"]');await A.waitForTimeout(200);r.h2=await A.$eval('#app h1',e=>e.innerText);
  await A.click('[data-wknav="1"]');await A.waitForTimeout(200);r.h3=await A.$eval('#app h1',e=>e.innerText);
  await A.click('[data-wknav="0"]');await A.waitForTimeout(200);
  const pages=[];for(const i of [3,1,0]){await A.click('[data-wpage="'+i+'"]');await A.waitForTimeout(300);pages.push(await A.$eval('#app',e=>(e.querySelector('h1,h2')||e).innerText.slice(0,40)))}r.pages=pages;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.h0==='Diese Woche'&&r.h1==='Rückblick'&&/Archiv/.test(r.ro)&&/Nachtragen ist an/.test(r.ro2)&&r.h2==='Diese Woche'&&r.h3==='Vorschau'&&/2026/.test(pages[0])&&/Wer macht was/.test(pages[1])&&pages[2]==='Diese Woche';
  console.error(ok?'WKNAV OK':'WKNAV FAIL');await b.close();srv.close();process.exit(0)});
