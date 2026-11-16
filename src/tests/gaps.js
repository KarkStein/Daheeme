srv.listen(8765,async()=>{
  // Lücken (Florian 16.11.2026): Einkaufsliste, Packliste, Packlisten-Name und eigene Weitere Listen lassen sich bearbeiten
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const box=async(vals)=>{await A.waitForSelector('#mbox');for(const [k,v] of Object.entries(vals))await A.fill(`#mbox [data-ebf=${k}]`,v);await A.click('#mbox button[type=submit]');await A.waitForTimeout(400)};
  await put('food/shop/s1',{name:'Milch',done:false,at:1});await put('food/pack/p1',{name:'Mütze',list:'main',at:1});await put('food/packlist/l2',{name:'Sommer',at:2});await put('food/buylist/b1',{name:'Bastel',emo:'📝',at:1});await A.waitForTimeout(400);
  await nav('einkauf|');await A.click('[data-shopedit=s1]');await box({name:'Milch 2 l'});r.shop=db().shop.s1.name;
  await nav('ausflug|tt:pack');await A.click('[data-packedit=p1]');await box({name:'Wollmütze'});r.pack=db().pack.p1.name;
  await A.click('[data-packlist=l2]');await A.waitForTimeout(200);await A.click('[data-act=packlistren]');await box({name:'Sommerurlaub'});r.pl=db().packlist.l2.name;
  await nav('einkauf|bl:b1');await A.click('[data-buylistedit=b1]');await box({name:'Basteln',emo:'✂️'});r.bl=[db().buylist.b1.name,db().buylist.b1.emo].join('|');
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.shop==='Milch 2 l'&&r.pack==='Wollmütze'&&r.pl==='Sommerurlaub'&&r.bl==='Basteln|✂️';
  console.error(ok?'GAPS OK':'GAPS FAIL');await b.close();srv.close();process.exit(0)});
