srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  const y=new Date().getFullYear();
  await put('food/advent/a1',{name:'Kalender',for:'kid',kind:'selbst',year:y,at:1});
  await put('food/adoor/a1_3',{cal:'a1',day:3,name:'Holzauto',kind:'klein',st:'idee',need:'Holzauto\nBatterien',at:1});
  await put('food/adoor/a1_6',{cal:'a1',day:6,name:'Nikolaus',kind:'suess',st:'idee',need:'Nüsse\nMandarinen',at:1});
  await put('food/adoor/a1_8',{cal:'a1',day:8,name:'Knete',kind:'suess',st:'idee',need:'Knete',at:1});
  await put('food/shop/s1',{name:'Knete',done:false,at:1,src:'Adventskalender: Türchen 8'});await A.waitForTimeout(400);
  await nav('projekte|pf:advent');await A.click('.advdoor[data-advdoor="3"]');await A.waitForTimeout(300);
  r.noShopBtn=!(await A.$('[data-advshop]'));r.spielBtn=!!(await A.$('.advedit [data-nav="listen|bl:geschenke"]'));
  await A.click('.advdoor[data-advdoor="3"]');await A.click('.advdoor[data-advdoor="6"]');await A.waitForTimeout(300);r.shopBtn6=!!(await A.$('[data-advshop="6"]'));
  // Was fehlt: nur Türchen 6 und 8, nicht 3
  await A.click('[data-act=advshopall]');await A.waitForTimeout(300);const pk=await A.$eval('.pickwrap',e=>e.innerText);r.pickHas3=/Türchen 3/.test(pk);r.pickHas6=/Türchen 6/.test(pk);
  await A.click('.pickwrap [data-act=pickclose]');await A.waitForTimeout(200);
  // Türchen 8 auf Kleinigkeit umstellen: Einkaufsliste wird geleert
  await nav('projekte|pf:advent');await A.click('.advdoor[data-advdoor="8"]');await A.waitForTimeout(300);await A.click('[data-advkind=klein]');await A.waitForTimeout(500);
  r.shop8=Object.values(db().shop||{}).filter(x=>x.src==='Adventskalender: Türchen 8').length;
  await nav('einkauf|bl:geschenke');await A.waitForTimeout(300);r.spiel=await A.$eval('#buy-geschenke',e=>e.innerText.replace(/\n/g,' '));
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/advent-spielsachen.png',fullPage:true});
  // Türchen leeren, dann anbieten, Einkaufsliste mit zu leeren
  await put('food/shop/s6',{name:'Nüsse',done:false,at:2,src:'Adventskalender: Türchen 6'});await A.waitForTimeout(300);
  await nav('projekte|pf:advent');await A.click('.advdoor[data-advdoor="6"]');await A.waitForTimeout(300);await A.click('[data-advclear="6"]');await A.waitForTimeout(500);
  r.door6=!!db().adoor.a1_6;r.toast=await A.$eval('#toast',e=>e.innerText);await A.click('#toast .toastbtn');await A.waitForTimeout(500);
  r.shop6=Object.values(db().shop||{}).filter(x=>x.src==='Adventskalender: Türchen 6').length;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.noShopBtn&&r.spielBtn&&r.shopBtn6&&!r.pickHas3&&r.pickHas6&&!r.door6&&/Auch entfernen/.test(r.toast)&&r.shop6===0&&r.shop8===0&&/Holzauto/.test(r.spiel)&&/Batterien/.test(r.spiel)&&/Knete/.test(r.spiel);
  console.error(ok?'ADVSPIEL OK':'ADVSPIEL FAIL');await b.close();srv.close();process.exit(0)});
