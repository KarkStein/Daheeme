srv.listen(8765,async()=>{
  // Einkaufsliste: Kategorien und Symbole bearbeiten (Florian 16.11.2026): Symbol, Name, Reihenfolge, löschen und zurückholen, eigene anlegen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  setAt(['haushalt',key,'food','shop','i1'],{name:'Milch',done:false,at:1});setAt(['haushalt',key,'food','shop','i2'],{name:'Äpfel',done:false,at:2});setAt(['haushalt',key,'food','shop','i3'],{name:'Tiefkühlpizza',done:false,at:3});
  await A.reload();await A.waitForTimeout(800);
  await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);
  const heads=()=>A.$$eval('.shopgrp',l=>l.map(x=>x.textContent.replace(/\s+/g,' ').trim()));r.h0=await heads();
  await A.click('[data-act=shopcatman]');await A.waitForSelector('#mbox .sclist');
  await A.fill('#mbox [data-scic=obst]','🍎');await A.press('#mbox [data-scic=obst]','Tab');await A.waitForTimeout(200);
  await A.fill('#mbox [data-scnm=kuehl]','Kühlschrank');await A.press('#mbox [data-scnm=kuehl]','Tab');await A.waitForTimeout(200);
  await A.click('#mbox [data-scmv=tk][data-d="-1"]');await A.waitForTimeout(300);r.order=await A.$$eval('#mbox [data-scnm]',l=>l.map(x=>x.dataset.scnm));
  await A.fill('#mbox [data-scnewic]','🌿');await A.fill('#mbox [data-scnewnm]','Bio-Laden');await A.click('#mbox [data-scform] button[type=submit]');await A.waitForTimeout(300);
  await A.screenshot({path:out+'/einkauf-kategorien.png'});
  await A.click('#mbox [data-scrm=tk]');await A.click('#mbox [data-scrm=tk]');await A.waitForTimeout(400);r.back=await A.$$eval('#mbox [data-scback]',l=>l.map(x=>x.dataset.scback));
  {const d=db();r.db={obst:(d.shopcat.obst||{}).ic,kuehl:(d.shopcat.kuehl||{}).name,tk:(d.shopcat.tk||{}).hide,own:Object.values(d.shopcat).filter(x=>x.own).map(x=>x.ic+x.name)}}
  await A.click('#mbox [data-scx]');await A.waitForTimeout(300);r.h1=await heads();
  // Milch in die eigene Kategorie
  const own=Object.keys(db().shopcat).find(k=>db().shopcat[k].own);
  await A.click('[data-shopcat="i1"]');await A.waitForTimeout(200);r.pick=await A.$$eval('.catpick [data-setcat]',l=>l.map(x=>x.dataset.setcat));
  await A.click(`.catpick [data-setcat="${own}"]`);await A.waitForTimeout(300);r.h2=await heads();r.milch=(db().shop.i1||{}).cat===own;
  // Tiefkühl zurückholen
  await A.click('[data-act=shopcatman]');await A.waitForSelector('#mbox .sclist');await A.click('#mbox [data-scback=tk]');await A.waitForTimeout(300);await A.click('#mbox [data-scx]');await A.waitForTimeout(300);r.h3=await heads();
  await A.screenshot({path:out+'/einkauf-kategorien-liste.png'});
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&r.h0.some(x=>/Tiefkühl/.test(x))&&r.order.indexOf('tk')<r.order.indexOf('fleisch')&&r.db.obst==='🍎'&&r.db.kuehl==='Kühlschrank'&&r.db.tk===true&&r.db.own.includes('🌿Bio-Laden')&&r.back.includes('tk')
    &&r.h1.some(x=>/🍎 ?Obst/.test(x))&&r.h1.some(x=>/Kühlschrank/.test(x))&&!r.h1.some(x=>/Tiefkühl/.test(x))&&r.h1.some(x=>/Sonstiges/.test(x))
    &&r.pick.includes(own)&&!r.pick.includes('tk')&&r.milch&&r.h2.some(x=>/Bio-Laden/.test(x))&&r.h3.some(x=>/Tiefkühl/.test(x));
  console.log(ok?'SHOPKAT OK':'SHOPKAT FAIL');
  await b.close();process.exit(0)});
