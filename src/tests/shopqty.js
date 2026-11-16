srv.listen(8765,async()=>{
  // Mengen in der Einkaufsliste, 🔔 am Eintrag weg (alte 🔔 → ❗), Doppelring lang = Wochenaufgaben (Florian 16.11.2026)
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:360,height:640},timezoneId:'Europe/Berlin',hasTouch:false});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('food/shop/s1',{name:'Brot',done:false,at:1});await put('food/prio/w1',{name:'Brot',from:'einkauf',ref:'s1',at:1});await put('food/prio/w2',{name:'Pfand',from:'einkauf',at:2});await A.waitForTimeout(800);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('einkauf');r.bells=await A.$$eval('.shop .bellbtn',l=>l.length);
  const sh=()=>Object.values(get(['haushalt',key,'food','shop'])||{});
  r.mig=!!sh().find(x=>x.name==='Brot').urg;const pr=get(['haushalt',key,'food','prio'])||{};r.prio=Object.keys(pr).filter(k=>pr[k]).join();
  for(const t of ['Milch 2l','3x Bananen','Eier 10','500 g Mehl'])
    {await A.fill('#shopinput',t);await A.click('#shopform button[type=submit]');await A.waitForTimeout(300)}
  r.names=sh().map(x=>x.name).sort().join('|');r.qty=await A.$$eval('.shop .nm .qty',l=>l.map(x=>x.innerText).sort().join('|'));
  const fv=Object.values(get(['haushalt',key,'food','fav'])||{});r.fav=JSON.parse(JSON.stringify(fv.find(x=>x.name==='Milch')));
  const mid=Object.entries(get(['haushalt',key,'food','shop'])).find(([k,v])=>/Milch/.test(v.name))[0];
  await A.click(`[data-shopedit="${mid}"]`);await A.waitForSelector('#mbox');r.ef=await A.$$eval('#mbox input[type=text]',l=>l.map(x=>x.value));
  await A.fill('#mbox [data-ebf=qty]','1 l');await A.click('#mbox button[type=submit]');await A.waitForTimeout(400);r.edit=sh().find(x=>/Milch/.test(x.name)).name;
  await A.click(`[data-shop="${mid}"]`);await A.waitForTimeout(300);await A.fill('#shopinput','Mil');await A.waitForTimeout(200);r.sugg=await A.$$eval('#shopsugg [data-shopsugg]:not([data-urg])',l=>l.map(x=>x.dataset.shopsugg));
  await A.screenshot({path:process.argv[2]+'/einkauf-mengen.png'});
  await nav('woche|wp:0');const box=await A.$('.campback.dash .bring2');const bb=await box.boundingBox();await A.mouse.move(bb.x+20,bb.y+20);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(400);
  r.long=await A.evaluate(()=>{const s=document.getElementById('sec-week');return s?Math.round(s.getBoundingClientRect().top):null});
  console.error(JSON.stringify(r).slice(0,900),errs);
  const ok=!errs.length&&r.bells===0&&r.mig&&r.prio==='w2'&&r.names==='10 Eier|2 l Milch|3 Bananen|500 g Mehl|Brot'&&r.fav&&r.fav.q==='2 l'&&r.ef[0]==='Milch'&&r.ef[1]==='2 l'&&r.edit==='1 l Milch'&&r.sugg.includes('1 l Milch')&&r.long!=null&&r.long<200;
  console.error(ok?'SHOPQTY OK':'SHOPQTY FAIL');await b.close();srv.close();process.exit(0)});
