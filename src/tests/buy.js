srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const y=new Date().getFullYear();
  await put('food/idea/g1',{name:'Buch für Oma',cat:'geschenk',state:'geplant',for:'Oma',at:1});await put('food/idea/g2',{name:'Schal',cat:'geschenk',state:'idee',at:2});
  await put('food/advent/a1',{name:'Kalender',for:'kid',kind:'selbst',year:y,at:1});await put('food/adoor/a1_5',{cal:'a1',day:5,name:'Knete',kind:'klein',st:'idee',at:1});
  await put('food/hproj/h1',{name:'Hochbeet',emo:'🌱',cat:'garten',state:'aktuell',at:1});await put('food/fund/f1',{name:'Bio-Erde 40 l',kind:'material',st:'idee',area:'haus',proj:'h1',at:1});
  await put('food/pack/k1',{name:'Regenjacke',done:false,at:1});await A.waitForTimeout(400);
  await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(400);r.h1=await A.$eval('#app h1',e=>e.innerText);
  r.counts=await A.$$eval('.buylist .setsum',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  await A.click('[data-buysum=kleidung]');await A.click('[data-buyfor="kleidung|kid"]');await A.fill('.buyform[data-bl=kleidung] input','Matschhose Gr. 98');await A.press('.buyform[data-bl=kleidung] input','Enter');await A.waitForTimeout(300);
  r.kl=Object.values(db().buy||{}).map(x=>x.name+'|'+x.list+'|'+(x.for||''));
  for(const l of ['geschenke','baumarkt'])await A.click(`[data-buysum=${l}]`);await A.waitForTimeout(200);
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/weitere-listen.png',fullPage:true});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  r.lists=await A.$$eval('.buylist .shop',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  await A.click('[data-projdone=g1]');await A.click('[data-advbought="a1|5"]');await A.click('[data-fundbought=f1]');await A.waitForTimeout(500);
  const D=db();r.g1=D.idea.g1.done;r.door=D.adoor.a1_5.st;r.fund=D.fund.f1.st;
  // Packliste 👕
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='ausflug|tt:pack';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);
  await A.click('[data-packwear=k1]');await A.waitForTimeout(300);r.wear=Object.values(db().buy||{}).filter(x=>x.ref==='pack:k1').length;await A.click('[data-packwear=k1]');await A.waitForTimeout(300);r.wearOff=Object.values(db().buy||{}).filter(x=>x.ref==='pack:k1').length;await A.click('[data-packwear=k1]');await A.waitForTimeout(300);
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='einkauf|bl:kleidung';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);
  await A.click('[data-buypack]');await A.waitForTimeout(300);r.packBack=await A.$$eval('[data-packwear]',l=>l.length);
  // Eigene Liste
  await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);await A.click('[data-act=buylistnew]');await A.fill('#buylistinput','Fahrrad');await A.press('#buylistinput','Enter');await A.waitForTimeout(300);
  r.own=Object.values(db().buylist||{}).map(x=>x.name);
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='ausflug|tt:pack';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);await A.click('[data-packrm=k1]');await A.waitForTimeout(400);r.cascade=Object.values(db().buy||{}).filter(x=>x.ref==='pack:k1').length;
  // Geschenke-Link zurück
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='projekte|pf:geschenk';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);r.giftLink=!!(await A.$('[data-nav="listen|bl:geschenke"]'));
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='suche';document.getElementById('app').appendChild(b);b.click()});await A.fill('#sq','Matschhose');await A.waitForTimeout(400);r.search=await A.$$eval('#app [data-nav="listen|bl:kleidung"]',l=>l.length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.h1==='Weitere Listen'&&r.kl.includes('Matschhose Gr. 98|kleidung|kid')&&r.lists.some(x=>/Buch für Oma/.test(x))&&!r.lists.some(x=>/Schal/.test(x))&&r.lists.some(x=>/Knete/.test(x))&&r.lists.some(x=>/Bio-Erde/.test(x))&&r.g1===true&&r.door==='besorgt'&&r.fund==='gebucht'&&r.wear===1&&r.packBack>0&&r.wearOff===0&&r.own.includes('Fahrrad')&&r.cascade===0&&r.giftLink&&r.search>0;
  console.error(ok?'BUY OK':'BUY FAIL');await b.close();srv.close();process.exit(0)});
