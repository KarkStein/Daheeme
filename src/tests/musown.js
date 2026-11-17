srv.listen(8765,async()=>{
  // Musik (Florian 16.11.2026): eigenes Emoji an Playlists, eigene Rubriken anlegen und löschen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await put('food/music/m1',{name:'Sonntag',link:'https://open.spotify.com/playlist/abc',occ:'kochen',at:1});await A.waitForTimeout(300);
  await nav('musik|');await A.click('[data-musedit=m1]');await A.waitForTimeout(200);
  await A.fill('[data-muf=emo]','🎸');
  await A.fill('[data-musnewic]','📻');await A.fill('[data-musnewnm]','Hörspiele');await A.click('[data-act=musoccadd]');await A.waitForTimeout(400);
  const oid=Object.keys(db().musocc||{})[0];r.occ=db().musocc&&db().musocc[oid];r.draftOn=await A.$eval(`[data-musocc="${oid}"]`,x=>x.getAttribute('aria-pressed'));
  await A.screenshot({path:out+'/musik-rubrik.png',fullPage:true});
  await A.click('[data-act=mussave]');await A.waitForTimeout(400);const m=db().music.m1;r.m=[m.emo,m.occ].join('|');
  r.tile=await A.$eval('.muscard .mk .mki',x=>x.innerText);r.filter=await A.$$eval('[data-musfilter]',l=>l.map(x=>x.innerText));
  // Rubrik löschen nimmt sie auch aus der Playlist
  await A.click('[data-musedit=m1]');await A.waitForTimeout(200);await A.click(`[data-musoccrm="${oid}"]`);await A.click(`[data-musoccrm="${oid}"]`);await A.waitForTimeout(500);
  r.gone=!(db().musocc||{})[oid]&&db().music.m1.occ==='kochen';
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.occ&&r.occ.name==='Hörspiele'&&r.occ.ic==='📻'&&r.draftOn==='true'&&r.m==='🎸|kochen,'+oid&&r.tile==='🎸'&&r.filter.some(x=>/Hörspiele/.test(x))&&r.gone;
  console.error(ok?'MUSOWN OK':'MUSOWN FAIL');await b.close();srv.close();process.exit(0)});
