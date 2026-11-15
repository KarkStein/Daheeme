srv.listen(8765,async()=>{
  // Verknüpfungen (Florian 15.11.2026): Löschen nimmt Erinnerungen, Packlisten und Zuordnungen mit; Links ohne https; Sprünge landen auf der ersten Seite
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const F=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await put('food/rec/r1',{name:'Testsuppe',ing:'1 Lauch',at:1});await put('food/prio/w1',{name:'Suppe kochen',from:'rezepte',ref:'r1',at:1});
  await put('food/urlaub/u1',{name:'Testurlaub',at:1});await put('food/packlist/u_u1',{name:'Testurlaub'});await put('food/pack/k1',{name:'Sonnencreme',list:'u_u1',at:1});await put('food/prio/w2',{name:'Pässe',from:'reise',ref:'u1',at:1});
  await put('food/split/s1',{name:'Gruppe',link:'splitwise.com/groups/9',ref:'urlaub:u1',at:1});await A.waitForTimeout(500);
  // Rezept über Bearbeiten löschen
  await nav('essen|ft:rezepte');await A.click('[data-rec=r1]');await A.click('[data-recedit=r1]');await A.click('[data-act=recdel]');await A.click('[data-act=recdel]');await A.waitForTimeout(500);
  r.rec=!!(F().rec||{}).r1;r.prio1=!!(F().prio||{}).w1;
  // Splitwise-Link ohne https
  await nav('ausgaben|');r.split=await A.$$eval('a.splitmain',l=>l.map(a=>a.href));
  // Urlaub aus der Liste löschen
  await nav('ausflug|tt:urlaub');const rm=await A.$('[data-urlaubrm=u1]');if(rm){await rm.click();await A.waitForTimeout(500)}else{await A.evaluate(()=>{const x=document.querySelector("[data-reise=u1]");if(x)x.click()});await A.waitForTimeout(300);await A.evaluate(()=>document.querySelector('[data-act=reisedel]').click());await A.waitForTimeout(200);await A.evaluate(()=>document.querySelector('[data-act=reisedel]').click());await A.waitForTimeout(500)}
  const f=F();r.urlaub=!!(f.urlaub||{}).u1;r.pack=!!(f.pack||{}).k1;r.prio2=!!(f.prio||{}).w2;r.ref=((f.split||{}).s1||{}).ref||null;
  // Kita und Musik landen auf der ersten Seite
  await nav('kita|ks:infos');await nav('kita|');r.kita=await A.$eval('[aria-pressed=true],[aria-selected=true]',e=>e.innerText).catch(()=>'');
  // Termin mehrtägig, Glocke bleibt beim Bearbeiten
  await put('food/termin/t1',{name:'Oma zu Besuch',date:'2026-11-20',to:'2026-11-22',remind:true,at:1});await A.waitForTimeout(400);
  await nav('woche|wp:3');await A.click('[data-calview=liste]').catch(()=>{});await A.waitForTimeout(300);r.multi=await A.$$eval('[data-teredit=t1]',l=>l.length);
  await A.click('[data-teredit=t1] >> nth=0');await A.waitForTimeout(300);r.del=!!(await A.$('#terform [data-terrm=t1]'));await A.click('#terform [type=submit]');await A.waitForTimeout(400);r.remind=!!((F().termin||{}).t1||{}).remind;r.to=((F().termin||{}).t1||{}).to;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&!r.rec&&!r.prio1&&r.split[0]==='https://splitwise.com/groups/9'&&!r.urlaub&&!r.pack&&!r.prio2&&!r.ref&&/Termine/.test(r.kita)&&r.multi>=3&&r.del&&r.remind&&r.to==='2026-11-22';
  console.error(ok?'VERKN OK':'VERKN FAIL');await b.close();srv.close();process.exit(0)});
