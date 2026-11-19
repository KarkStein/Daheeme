srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();await p.clock.setFixedTime(new Date('2026-11-14T12:00:00'));p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const link=A.url();const B=await mk();await B.goto(link.replace('/#','/?bild=haus#'));await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  // Leuchtturm: nur Geschenke und Sonstiges
  await A.click('.spot[data-go=projekte]');await A.waitForSelector('.tiles');const lt=await A.$$eval('.tile',l=>l.filter(x=>x.dataset.pfilter).map(x=>x.dataset.pfilter));
  await A.fill('#projinput','Fotobuch fürs Wohnzimmer');await A.press('#projinput','Enter');await A.waitForTimeout(200);
  await A.screenshot({path:out+'/leuchtturm.png',fullPage:true});
  // Werkzeugkoffer
  await A.click('[data-tab=camp]');await A.click('.spot[data-go=amhaus]');await A.waitForSelector('.tiles');const ht=await A.$$eval('.tile',l=>l.filter(x=>x.dataset.pfilter).map(x=>x.dataset.pfilter));
  const quick=!!(await A.$('#projinput'));
  await A.click('.tile[data-pfilter=garten]');await A.fill('#projinput','Beet umgraben');await A.press('#projinput','Enter');await A.waitForTimeout(200);
  await A.click('[data-pfilter=""]');await A.waitForTimeout(200);await A.screenshot({path:out+'/amhaus.png',fullPage:true});
  // Lampe springt direkt zu Einrichtung
  await A.click('[data-tab=camp]');await A.click('.spot[data-go=amhaus]');await A.waitForSelector('.tiles');await A.click('.tile[data-pfilter=wohnen]');const h2=await A.$eval('h2',e=>e.textContent);
  await A.fill('#projinput','Lampe im Flur tauschen');await A.press('#projinput','Enter');await A.waitForTimeout(200);
  await B.click('.spot[data-go=amhaus]');await B.waitForSelector('.tiles');const cnt=await B.$$eval('.tile .tc',l=>l.map(x=>x.textContent));
  await B.goBack();await B.waitForTimeout(200);
  // Spielplätze (seit der Bündelung 17.11.2026 unter Ausflüge und Reisen): die alte Spielplatz-Karte steht als Link in „Alle Ziele auf einer Karte“, neue Spielplätze kommen über ＋ Merken
  await B.evaluate(()=>{const k=/k=([^&]+)/.exec(location.href)[1];return fetch('/haushalt/'+k+'/food/playmap.json',{method:'PUT',body:JSON.stringify('https://www.google.com/maps/d/viewer?mid=1AbCdEfGhIjKlMnOpQ')})});await B.waitForTimeout(400);
  await B.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="ausflug|rk:spielplatz";b.id="zz";document.getElementById("app").appendChild(b)});await B.click("#zz");await B.waitForTimeout(400);
  await B.click('[data-tfold=rmap]');await B.waitForTimeout(200);const ifr=!!(await B.$('a[href*="maps/d/viewer"]'));
  await B.click('.rgcard [data-act=merken]');await B.waitForSelector('#mbox');await B.fill('#mbox input[type=text]','Spielplatz am Hafen');await B.click('#mbox [data-ebk=kind][data-ebv=spielplatz]');await B.click('#mbox button[type=submit]');await B.waitForTimeout(500);
  const mapHref=await B.$$eval('.rgcard .mk',l=>{const x=l.find(y=>/Spielplatz am Hafen/.test(y.innerText));return x&&x.querySelector('[data-route]')?'route':''});
  await B.screenshot({path:out+'/spielplatz-karte.png',fullPage:true});
  console.log({lt,ht,quick,h2,cnt,ifr,mapHref,errs});
  const ok=!errs.length&&lt.join()==='sonst,alle'&&ht.join()==='wohnen,garten'&&!quick&&/Einrichtung/.test(h2)&&cnt[0]==='1 offen'&&cnt[1]==='1 offen'&&ifr&&mapHref==='route';
  console.log(ok?'PROJ OK':'PROJ FAIL');await b.close();srv.close();process.exit(0)});
