srv.listen(8765,async()=>{
  // Musik-Ausbau (Florian 17.11.2026): Kinderlieder mit Text und 💛, Hörspiele/Tonies mit Stand → Geschenke, Songs als Favorit
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:740},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.clock.setFixedTime(new Date('2026-11-17T09:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const add=async t=>{await A.fill('#musin',t);await A.press('#musin','Enter');await A.waitForTimeout(400)};
  const idOf=n=>Object.entries(db().music||{}).find(([k,m])=>m.name===n)[0];
  await nav('musik|');
  await add('Tonie: Raupe Nimmersatt https://tonies.com/de-de/tonies/raupe-nimmersatt/');
  await add('Weißt du, wie viel Sternlein stehen, Schlaflied https://www.youtube.com/watch?v=abc');
  await add('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC');
  await add('Kinderlieder https://www.youtube.com/playlist?list=PLx');
  const M=db().music;r.arts=Object.values(M).map(m=>m.name+'|'+(m.art||'playlist')+'|'+(m.occ||'')).sort();
  const tn=idOf('Tonie: Raupe Nimmersatt'),ld=idOf('Weißt du, wie viel Sternlein stehen, Schlaflied'),sg=idOf('Spotify-Song');
  // Song als Favorit, Lied 💛 und mit Text, Tonie über die Stand-Leiter auf Geplant
  await A.click(`[data-musfav="${sg}"]`);await A.waitForTimeout(300);
  await A.click(`[data-muslike="${ld}"]`);await A.waitForTimeout(300);
  await A.click(`[data-musst="${tn}"]`);await A.waitForTimeout(300);await A.click(`[data-musst="${tn}"]`);await A.waitForTimeout(300);
  r.st1=db().music[tn].st;r.fav=db().music[sg].fav;r.like=db().music[ld].like;r.songLk=!!(await A.$(`[data-muslike="${sg}"]`));
  await A.click(`[data-musedit="${ld}"]`);await A.waitForTimeout(200);r.lkOn=await A.$eval('[data-muslk]',x=>x.getAttribute('aria-pressed'));
  await A.fill('[data-muf=txt]','Weißt du, wie viel Sternlein stehen\nan dem blauen Himmelszelt?');await A.click('[data-act=mussave]');await A.waitForTimeout(400);
  r.txt=(db().music[ld].txt||'').split('\n').length;r.likeKept=db().music[ld].like;
  await A.click(`[data-mustxt="${ld}"]`);await A.waitForTimeout(200);r.txtShown=await A.$eval('.mustxt',x=>x.innerText.split('\n')[0]);
  await A.screenshot({path:out+'/musik2.png',fullPage:true});
  // Filter nach Art
  await A.click('[data-musartf=hoer]');await A.waitForTimeout(200);r.hoerList=await A.$$eval('.muscard .mk .mkt b',l=>l.map(x=>x.innerText));
  await A.click('[data-musfilter=like]');await A.waitForTimeout(200);r.likeEmpty=await A.$$eval('.muscard .mk',l=>l.length);
  // Geschenke: Kachel und Liste, Abhaken = Haben wir
  await nav('geschenke|');r.gTile=await A.$eval('[data-nav="musik|ma:hoer"] .tc',x=>x.innerText);
  await nav('listen|bl:geschenke');r.buy=await A.$$eval('#buy-geschenke .nm',l=>l.map(x=>x.innerText.split('\n')[0]));
  await A.click(`[data-musbought="${tn}"]`);await A.waitForTimeout(400);r.st2=db().music[tn].st;r.geldToast=await A.$eval("#toast",x=>x.innerText);await A.addStyleTag({content:"#toast{display:none!important}"});
  // Kind-Seite zeigt 💛, Sprung mit Art-Filter
  await nav('kind|');r.kind=await A.$$eval('.kidcard .trow',l=>l.map(x=>x.innerText));
  await nav('musik|ma:lied');r.af=await A.$eval('[data-musartf][aria-pressed=true]',x=>x.dataset.musartf);
  await nav('projekte|');r.samm=await A.$$eval('.sammcard .mk',l=>l.map(x=>x.innerText.replace(/\n/g,' ')).filter(x=>/Sternlein/.test(x)));await A.click('[data-sammf="s|erledigt"]');await A.waitForTimeout(200);r.sammDone=await A.$$eval('.sammcard .mk',l=>l.map(x=>x.innerText.replace(/\n/g,' ')).filter(x=>/Raupe/.test(x)));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.arts.includes('Tonie: Raupe Nimmersatt|hoer|')&&r.arts.includes('Weißt du, wie viel Sternlein stehen, Schlaflied|lied|nacht')&&r.arts.includes('Spotify-Song|song|')&&r.arts.includes('Kinderlieder|playlist|kinder')
    &&r.st1==='geplant'&&r.fav===true&&r.like===true&&!r.songLk&&r.lkOn==='true'&&r.txt===2&&r.likeKept===true&&/Sternlein/.test(r.txtShown)
    &&r.hoerList.join()==='Tonie: Raupe Nimmersatt'&&r.likeEmpty===0&&r.gTile==='1 geplant'&&r.buy.includes('🎧 Tonie: Raupe Nimmersatt')&&r.st2==='erledigt'&&/Preis/.test(r.geldToast)
    &&r.kind.some(x=>/💛/.test(x)&&/Sternlein/.test(x))&&r.af==='lied'&&r.samm.length===1&&/🐣/.test(r.samm[0])&&/💛/.test(r.samm[0])&&r.sammDone.length===1&&/🎧/.test(r.sammDone[0]);
  console.error(ok?'MUSIK2 OK':'MUSIK2 FAIL');await b.close();srv.close();process.exit(0)});
