srv.listen(8765,async()=>{
  // Filter „❗ Heute nötig“ lässt sich wieder abschalten (Chip mit ✕), Reiter Einkauf zeigt immer die ganze Liste, leerer Filter fällt weg
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:360,height:640},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('food/shop/s1',{name:'Brot',urg:true,done:false,at:1});await put('food/shop/s2',{name:'Milch',done:false,at:2});await A.waitForTimeout(600);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const txt=()=>A.$eval('#app',e=>e.innerText);
  await nav('camp|');await A.click('.startdash .bcnt[data-shopview]');await A.waitForTimeout(400);r.f1=!/Milch/.test(await txt());r.chip=await A.$eval(`[data-shopfilter="__heute"]`,e=>e.innerText);
  await A.screenshot({path:process.argv[2]+'/einkauf-filter.png'});
  await A.click(`[data-shopfilter="__heute"]`);await A.waitForTimeout(300);r.off=/Milch/.test(await txt());
  await A.click(`[data-shopfilter="__heute"]`);await A.waitForTimeout(300);await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);r.tab=/Milch/.test(await txt());
  await A.click(`[data-shopfilter="__heute"]`);await A.waitForTimeout(300);await A.click('[data-shop="s1"]');await A.waitForTimeout(500);r.empty=/Milch/.test(await txt());
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.f1&&/✕/.test(r.chip)&&r.off&&r.tab&&r.empty;
  console.error(ok?'EINFILTER OK':'EINFILTER FAIL');await b.close();srv.close();process.exit(0)});
