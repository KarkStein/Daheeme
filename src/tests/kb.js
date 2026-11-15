srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])||{}));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('kita|ks:tasche');
  for(const n of ['Windeln','Feuchttücher','Wechselkleidung']){await A.click(`[data-kitaadd="${n}"]`);await A.waitForTimeout(250)}
  // Wechselkleidung mitgebracht
  const wk=Object.entries(db().food.kita).find(([k,v])=>v.name==='Wechselkleidung')[0];await A.click(`.item[data-kitatick="${wk}"]`);await A.waitForTimeout(300);
  const wi=Object.entries(db().food.kita).find(([k,v])=>v.name==='Windeln')[0];await A.click(`[data-kitashop="${wi}"]`);await A.waitForTimeout(400);
  r.shop=Object.values(db().food.shop||{}).map(x=>x.name+'|'+x.src);
  await A.click('[data-act=kitaremind]');await A.waitForTimeout(400);r.prio=Object.values(db().food.prio||{}).map(x=>x.name+'@'+x.due+' '+x.time);
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/kita-mitbringen.png',fullPage:true});
  r.sections=await A.$$eval('.card h2',l=>l.map(x=>x.innerText));
  await A.click('#tabs [data-tab=woche]').catch(()=>{});await nav('woche|wp:0');r.tl=await A.$$eval('.tasklink',l=>l.map(x=>x.innerText));
  await nav('camp|');await A.waitForTimeout(400);await A.click('.camp',{position:{x:120,y:60}});await A.waitForTimeout(400);r.back=await A.$$eval('.btask b',l=>l.map(x=>x.innerText));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.shop.length===1&&r.shop[0]==='Windeln|Kita: Mitbringen'&&r.prio.length===1&&/Windeln/.test(r.prio[0])&&r.tl.some(x=>/Mitbringen: 2/.test(x))&&r.sections.some(x=>/Liegt in der Kita/.test(x));
  console.error(ok?'KB OK':'KB FAIL');await b.close();srv.close();process.exit(0)});
