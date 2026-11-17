srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/urlaub/u1',{name:'Bretagne',state:'aktuell',emo:'⛵',at:1});await A.waitForTimeout(300);
  await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);r.h1=await A.$eval('#app h1',e=>e.innerText);r.pager=await A.$$eval('.pdot',l=>l.map(x=>x.innerText));
  await A.fill('#splitinput','https://www.splitwise.com/groups/bretagne-2027');await A.press('#splitinput','Enter');await A.waitForTimeout(300);
  r.names=Object.values(db().split||{}).map(x=>x.name);
  await A.selectOption('[data-splitref]','urlaub:u1');await A.waitForTimeout(400);r.ref=Object.values(db().split)[0].ref;
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/ausgaben.png',fullPage:true});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await A.click('.splitref [data-reise=u1]');await A.waitForTimeout(400);await A.click('[data-tfold=ugeld]');await A.waitForTimeout(200);r.inUrlaub=await A.$$eval('a.chipbtn',l=>l.filter(x=>/Bretagne 2027|bretagne/i.test(x.innerText)).length);
  await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);await A.click('.shopsw [data-go=listen]');await A.waitForTimeout(400);r.h3=await A.$eval('#app h1',e=>e.innerText);
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='bereiche';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);r.areas=await A.$eval('#app',e=>/Ausgaben/.test(e.innerText)&&/Weitere Listen/.test(e.innerText)&&/Tag und Woche/.test(e.innerText));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.h1==='Ausgaben'&&r.pager.join()==='Listen,Ausgaben'&&r.names[0]==='bretagne 2027'&&r.ref==='urlaub:u1'&&r.inUrlaub>0&&r.h3==='Weitere Listen'&&r.areas;
  console.error(ok?'SPLIT OK':'SPLIT FAIL');await b.close();srv.close();process.exit(0)});
