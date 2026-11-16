srv.listen(8765,async()=>{
  // Vorschläge beim Tippen in der Einkaufsliste (Florian 16.11.2026): Gedächtnis vor Grundliste, ❗ direkt am Vorschlag
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:360,height:640},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('food/fav/fx1',{name:'Mandelmus',n:5});await put('food/shop/s1',{name:'Milch',done:false,at:1});await A.waitForTimeout(500);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('einkauf');await A.click('#shopinput');await A.keyboard.type('Ma');await A.waitForTimeout(200);
  r.s=await A.$$eval('#shopsugg [data-shopsugg]:not([data-urg])',l=>l.map(x=>x.dataset.shopsugg));r.foc=await A.evaluate(()=>document.activeElement.id);
  await A.screenshot({path:process.argv[2]+'/einkauf-vorschlaege.png'});
  await A.click('#shopsugg [data-shopsugg="Mandelmus"][data-urg]');await A.waitForTimeout(400);
  await A.fill('#shopinput','');await A.keyboard.type('Mil');await A.waitForTimeout(200);r.noMilch=await A.$$eval('#shopsugg [data-shopsugg]',l=>!l.some(x=>x.dataset.shopsugg==='Milch'));
  await A.click('#shopsugg [data-shopsugg]:not([data-urg])');await A.waitForTimeout(400);
  const sh=Object.values(get(['haushalt',key,'food','shop'])||{});r.mm=sh.find(x=>x.name==='Mandelmus');r.n=sh.length;r.val=await A.$eval('#shopinput',e=>e.value);
  console.error(JSON.stringify(r).slice(0,600),errs);
  const ok=!errs.length&&r.s[0]==='Mandelmus'&&r.s.includes('Mango')&&r.foc==='shopinput'&&r.mm&&r.mm.urg&&r.noMilch&&r.n===3&&r.val==='';
  console.error(ok?'SHOPSUGG OK':'SHOPSUGG FAIL');await b.close();srv.close();process.exit(0)});
