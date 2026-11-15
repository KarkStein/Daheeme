srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];await fetch('http://localhost:8765/haushalt/'+key+'/food/termin/t1.json',{method:'PUT',body:JSON.stringify({name:'Zahnarzt',date:'2026-11-16',time:'15:00',at:1})});await A.waitForTimeout(300);
  const r={};const flip=async()=>{const bx=await (await A.$('.camp')).boundingBox();await A.mouse.click(bx.x+bx.width*0.72,bx.y+bx.height*0.45);await A.waitForTimeout(700)};
  const st=()=>A.evaluate(()=>({flip:!!document.querySelector('.flipin.flipped'),h1:(document.querySelector('#app h1')||{}).innerText||''}));
  await flip();r.f1=await st();await A.screenshot({path:out+'/rueckseite-handy.png',fullPage:true});
  await A.click('.campback .btl');await A.waitForTimeout(700);r.afterTl=await st();
  await flip();await A.click('.campback .bday3');await A.waitForTimeout(700);r.afterDay=await st();
  await flip();await A.click('.campback .bflip');await A.waitForTimeout(700);r.afterBtn=await st();
  await flip();await A.click('.campback .bcal');await A.waitForTimeout(500);r.cal=await A.$$eval('.cal [data-calday]',l=>l.length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.f1.flip&&!r.afterTl.flip&&!r.afterDay.flip&&!r.afterBtn.flip&&r.cal>=28;
  console.error(ok?'FLIP OK':'FLIP FAIL');await b.close();srv.close();process.exit(0)});
