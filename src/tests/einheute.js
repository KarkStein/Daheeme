srv.listen(8765,async()=>{
  // Dashboard „Einkauf heute“ (Florian 16.11.2026): nur offene Einträge fürs heutige Abendessen, Tipp filtert die Einkaufsliste
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const w=await A.evaluate(()=>{const d=new Date();d.setHours(12);const di=(d.getDay()+6)%7;const t=new Date(d);t.setDate(t.getDate()+3-di);const y=t.getFullYear();const f=new Date(y,0,4);const n=1+Math.round(((t-f)/864e5-3+((f.getDay()+6)%7))/7);return {wk:y+'-W'+String(n).padStart(2,'0'),di}});
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('food/plan/'+w.wk+'/d'+w.di,{text:'Testsuppe',ing:'Karotten\nLauch'});await put('food/shop/s1',{name:'Karotten',src:'Testsuppe',done:false,at:1});await put('food/shop/s2',{name:'Milch',done:false,at:2});await put('food/shop/s3',{name:'Lauch',src:'Testsuppe',done:true,at:3});await A.waitForTimeout(600);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('camp|sp:tag');r.tile=await A.$$eval('.campback.dash .bcnt',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  await A.click('.campback.dash .bcnt[data-shopview]');await A.waitForTimeout(400);r.list=await A.$eval('#app',e=>e.innerText);
  console.error(JSON.stringify(r).slice(0,600),errs);
  const ok=!errs.length&&r.tile.some(t=>/^1 Einkauf heute/.test(t))&&/Karotten/.test(r.list)&&!/Milch/.test(r.list);
  console.error(ok?'EINHEUTE OK':'EINHEUTE FAIL');await b.close();srv.close();process.exit(0)});
