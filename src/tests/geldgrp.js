srv.listen(8765,async()=>{
  // Gruppen: aus dem Urlaub anlegen (Budget übernommen), eigener Stand, getrennt vom Haushalt, Ausgleichen, Abschließen, Löschen schiebt in den Haushalt
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));await A.clock.setFixedTime(new Date('2026-11-16T18:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=k=>JSON.parse(JSON.stringify(get(['haushalt',key,'food',k])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/urlaub/u1',{name:'Bretagne',state:'aktuell',emo:'⛵',budget:800,at:1});
  await put('food/money/h1',{name:'Rewe',amt:4000,date:'2026-11-10',by:'p0',split:'half',cat:'essen',at:1});await A.waitForTimeout(300);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await nav('ausflug|tt:urlaub');await A.click('[data-reise=u1]');await A.waitForTimeout(300);await A.click('[data-tfold=ugeld]');await A.waitForTimeout(200);
  await A.click('[data-gact=grpnew][data-ref="urlaub:u1"]');await A.waitForTimeout(200);r.pre=await A.$eval('#mbox [data-ebf=budget]',e=>e.value);await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  const G=Object.entries(db('mgroup'))[0]||[];const gid=G[0];r.grp=[G[1]&&G[1].name,G[1]&&G[1].budget,G[1]&&G[1].ref].join();r.h1=await A.$eval('#app h1',e=>e.innerText);
  r.sel=await A.$eval('[data-geldgrp][aria-pressed=true]',e=>e.innerText);
  // Judith zahlt 120 € Crêpes (schnell, ich bin p0 → p0 zahlt) und Hotel per Maske p1
  await A.fill('#geldq','60 Crêpes');await A.press('#geldq','Enter');await A.waitForTimeout(300);
  await A.click('[data-gact=new]');r.defBy=await A.$eval('[data-gby][aria-pressed=true]',e=>e.dataset.gby);r.defGrp=await A.$eval('[data-ggrp][aria-pressed=true]',e=>e.dataset.ggrp);
  await A.fill('[data-gf=amt]','400');await A.fill('[data-gf=name]','Hotel');await A.click('[data-gby=p1]');await A.click('#geldform button[type=submit]');await A.waitForTimeout(400);
  r.gbal=await A.$eval('.geldbig',e=>e.innerText);r.bud=await A.$eval('.geldbud .freq',e=>e.innerText);
  await A.screenshot({path:out+'/geld-gruppe.png',fullPage:true});
  await A.click('[data-geldgrp=""]');await A.waitForTimeout(200);r.hbal=await A.$eval('.geldbig',e=>e.innerText);r.all=await A.$eval('.geldbal',e=>e.innerText);
  await A.click('[data-geldgrp="'+gid+'"]');await A.click('[data-gact=settle]');await A.click('#geldform button[type=submit]');await A.waitForTimeout(400);
  const st=Object.values(db('money')).find(x=>x.kind==='settle')||{};r.settle=[st.amt,st.by,st.grp===gid].join();
  await A.click('[data-gact=grpclose]');await A.waitForTimeout(400);r.closed=!!db('mgroup')[gid].closed;r.after=await A.$eval('[data-geldgrp][aria-pressed=true]',e=>e.innerText);
  r.hbal2=await A.$eval('.geldbig',e=>e.innerText);
  // Urlaub zeigt die Gruppe
  await nav('ausflug|tt:urlaub');await A.click('[data-reise=u1]');await A.waitForTimeout(300);r.inU=await A.$eval('[data-geldgrp]',e=>e.innerText);
  await A.click('[data-geldgrp]');await A.waitForTimeout(300);r.jump=await A.$eval('[data-geldgrp][aria-pressed=true]',e=>e.innerText).catch(()=>'');
  // löschen
  await A.click('[data-gact=grpedit]');await A.waitForTimeout(200);await A.click('#mbox [data-ebdel="0"]');await A.click('#mbox [data-ebdel="0"]').catch(()=>{});await A.waitForTimeout(500);
  r.del=Object.keys(db('mgroup')).length===0&&Object.values(db('money')).every(x=>!x.grp);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pre==='800'&&r.grp==='Bretagne,80000,urlaub:u1'&&r.h1==='Ausgaben'&&/Bretagne/.test(r.sel)&&r.defBy==='p0'&&r.defGrp===gid&&/Judith bekommt 170,00 € von dir/.test(r.gbal)&&/460,00 € von 800,00 €/.test(r.bud)
    &&/Du bekommst 20,00 €/.test(r.hbal)&&/Über alle Gruppen: Judith bekommt 150,00 €/.test(r.all)&&r.settle==='17000,p0,true'&&r.closed&&/Haushalt/.test(r.after)&&!/Über alle/.test(r.hbal2)&&/460,00 €/.test(r.inU)&&/🗄️/.test(r.inU)&&/Bretagne/.test(r.jump)&&r.del;
  console.error(ok?'GELDGRP OK':'GELDGRP FAIL');await b.close();srv.close();process.exit(0)});
