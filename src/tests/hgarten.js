srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/hproj/old',{name:'Wohnzimmer',emo:'🛋️',state:'aktuell',at:1});await A.waitForTimeout(300);const r={};
  await A.click('[data-go=bereiche]');await A.waitForTimeout(300);r.groups=await A.$$eval('.areagrp h2',l=>l.map(x=>x.innerText));await A.screenshot({path:out+'/bereiche-gruppen.png',fullPage:true});
  await A.click('[data-nav="amhaus|pf:garten"]');await A.waitForTimeout(300);r.gTiles=await A.$$eval('[data-hproj]',l=>l.length);
  await A.click('[data-act=hprojnew]');await A.waitForTimeout(400);await A.fill('[data-hpf=name]','Hochbeet');await A.press('[data-hpf=name]','Tab');await A.waitForTimeout(300);
  await A.fill('#hpfundform .fn','Bio-Erde 40 l');await A.press('#hpfundform .fn','Enter');await A.waitForTimeout(300);
  r.back=await A.$eval('[data-act=hprojback]',e=>e.innerText);await A.screenshot({path:out+'/garten-projekt.png',fullPage:true});
  await A.click('[data-act=hprojback]');await A.waitForTimeout(300);r.gTiles2=await A.$$eval('[data-hproj]',l=>l.map(x=>x.innerText.split('\n')[1]));
  await A.click('[data-go=bereiche]');await A.waitForTimeout(200);await A.click('[data-nav="amhaus|pf:wohnen"]');await A.waitForTimeout(300);r.wTiles=await A.$$eval('[data-hproj]',l=>l.map(x=>x.innerText.split('\n')[1]));
  const db=JSON.parse(JSON.stringify(get(['haushalt',key,'food'])));r.p=Object.values(db.hproj).map(x=>x.name+':'+(x.cat||'-'));r.f=Object.values(db.fund||{}).map(f=>f.kind+':'+f.name);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.groups.length===6&&r.gTiles===0&&/Garten/.test(r.back)&&r.gTiles2.includes('Hochbeet')&&r.wTiles.includes('Wohnzimmer')&&!r.wTiles.includes('Hochbeet')&&r.p.includes('Hochbeet:garten')&&r.f.includes('material:Bio-Erde 40 l');
  console.error(ok?'HG OK':'HG FAIL');await b.close();srv.close();process.exit(0)});
