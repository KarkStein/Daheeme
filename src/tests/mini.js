srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/rec/r1',{name:'Kürbissuppe',ing:'500 g Hokkaido-Kürbis\n2 Zwiebeln\n400 ml Kokosmilch',at:1});
  await put('food/plan/2026-W46/d5',{text:'Kürbissuppe',rec:'r1',at:1});
  await put('food/shop/s1',{name:'500 g Hokkaido-Kürbis',done:false,at:1,src:'Kürbissuppe'});await put('food/shop/s2',{name:'2 Zwiebeln',done:false,at:2});await put('food/shop/s3',{name:'Milch',done:false,at:3});await put('food/shop/s4',{name:'400 ml Kokosmilch',done:true,at:4,src:'Kürbissuppe'});
  await A.waitForTimeout(600);const t=await A.$eval('.minialarm',e=>e.innerText).catch(()=>null);
  await A.screenshot({path:out+'/minialarm.png'});
  await A.click('.minialarm');const h1=await A.$eval('h1',e=>e.textContent);
  await put('food/shop/s1/done',true);await put('food/shop/s2/done',true);await A.click('[data-tab=camp]');await A.waitForTimeout(400);const gone=!(await A.$('.minialarm'));
  console.log({t,h1,gone,errs});
  const ok=!errs.length&&/Kürbis/.test(t||'')&&/Zwiebeln/.test(t)&&!/Milch|Kokos/.test(t)&&/Einkauf/.test(h1)&&gone;
  console.log(ok?'MINI OK':'MINI FAIL');await b.close();srv.close();process.exit(0)});
