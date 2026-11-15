srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/prio/a',{name:'Müll rausstellen',from:'frei',due:'2026-11-16',at:1});await put('food/prio/b',{name:'Geschenk abholen',from:'frei',due:'2026-11-17',at:2});await put('food/prio/c',{name:'Steuer',from:'frei',due:'2026-11-20',at:3});await A.waitForTimeout(400);
  const flip=async()=>{const bx=await (await A.$('.camp')).boundingBox();await A.mouse.click(bx.x+bx.width*0.72,bx.y+bx.height*0.45);await A.waitForTimeout(700)};
  const flipped=()=>A.evaluate(()=>!!document.querySelector('.flipin.flipped'));
  await flip();r.prio=await A.$$eval('.bprio b',l=>l.map(x=>x.innerText));
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/rueckseite-erinnerungen.png',fullPage:true});
  await A.click('.campback .bcal');await A.waitForTimeout(500);r.inCal=await A.$$eval('.cal [data-calday]',l=>l.length);
  await A.goBack();await A.waitForTimeout(600);r.back1=await flipped();
  await A.click('.campback .bcnt[data-go=einkauf]');await A.waitForTimeout(400);await A.click('.brand');await A.waitForTimeout(500);r.back2=await flipped();
  await A.click('.campback .bchk');await A.waitForTimeout(400);r.left=Object.keys(get(['haushalt',key,'food','prio'])||{}).length;
  await A.reload();await A.waitForTimeout(800);r.reload=await flipped();
  await flip();r.pic=!(await flipped());
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.prio.length===2&&r.prio.every(x=>!/Steuer/.test(x))&&r.inCal>=28&&r.back1&&r.back2&&r.left===2&&r.reload&&r.pic;
  console.error(ok?'BR OK':'BR FAIL');await b.close();srv.close();process.exit(0)});
