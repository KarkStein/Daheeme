srv.listen(8765,async()=>{
  // Ausflüge: neue Rubriken, Merkmal-Filter und Gerade beliebt (Florian 16.11.2026)
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  const d=n=>{const x=new Date(Date.now()+n*864e5);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const J={updated:d(0),items:[{name:'Trampolin Aktionstag',where:'stadt',cat:'klettern',io:'draussen',date:d(2),dur:'kurz',age:5},{name:'Bagger schauen',where:'stadt',cat:'fahrzeug',io:'draussen',date:d(3),pram:true},{name:'Krabbelkonzert',where:'umland',cat:'musik',io:'beides',date:d(4),cafe:true,dur:'kurz'}]};
  await A.route('**/ausflugtipps.json',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify(J)}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const T=()=>A.$eval('.atip',e=>e.innerText);
  await nav('ausflug|tt:ideen');r.all=await T();
  await A.click('[data-atiplk]');await A.waitForTimeout(200);r.like=await T();await A.click('[data-atiplk]');
  await A.click('[data-atipfeat=alter]');await A.waitForTimeout(200);r.alter=await T();await A.click('[data-atipfeat=alter]');
  await A.click('[data-atipfeat=kurz]');await A.waitForTimeout(200);r.kurz=await T();await A.click('[data-atipfeat=kurz]');
  await A.click('[data-atipfeat=wagen]');await A.waitForTimeout(200);r.wagen=await T();await A.click('[data-atipfeat=wagen]');
  await A.click('[data-atipc=fahrzeug]');await A.waitForTimeout(200);r.cat=await T();await A.click('[data-atipc=""]');
  // eigene Vorliebe
  await fetch('http://localhost:8765/haushalt/'+key+'/food/pref/kidlikes.json',{method:'PUT',body:JSON.stringify('Bagger')});await A.waitForTimeout(500);await nav('ausflug|tt:ideen');
  await A.click('[data-atiplk]');await A.waitForTimeout(200);r.like2=await T();
  console.error(JSON.stringify(r).slice(0,1500),errs);
  const has=(t,w)=>t.includes(w);
  const ok=!errs.length&&['Trampolin','Bagger','Krabbel','🧗 Klettern und Hüpfen','🚒 Fahrzeuge','🎶 Musik und Mitmachen','💛 Trampolin','💛 Gerade beliebt: Klettern, Hüpfen'].every(w=>has(r.all,w))
    &&has(r.like,'Trampolin')&&!has(r.like,'Krabbel')&&!has(r.alter,'Trampolin')&&has(r.alter,'Bagger')&&has(r.kurz,'Krabbel')&&!has(r.kurz,'Bagger')&&has(r.wagen,'Bagger')&&!has(r.wagen,'Trampolin')
    &&has(r.cat,'Bagger')&&!has(r.cat,'Krabbel')&&has(r.like2,'Bagger')&&!has(r.like2,'Trampolin')&&has(r.like2,'Gerade beliebt: Bagger');
  console.error(ok?'ATIP2 OK':'ATIP2 FAIL');await b.close();srv.close();process.exit(0)});
