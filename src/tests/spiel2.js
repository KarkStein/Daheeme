srv.listen(8765,async()=>{
  // Sport und Spiel im Gemerkt-Bauplan (Florian 17.11.2026): Filter Art und Wo/Stand, Stand-Leiter am Schild, Karte über 🗺️
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:740},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.clock.setFixedTime(new Date('2026-11-17T09:00:00+01:00'));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  await put('play/s1',{name:'Wasserspielplatz Westpark',sec:'spielplatz',fav:true,at:1});
  await put('play/s2',{name:'Höhle aus Decken',sec:'zuhause',wx:'drinnen',age:'2',at:2});
  await put('play/s3',{name:'Kinderturnen',sec:'sport',when:'Do 16:00',wx:'drinnen',st:'geplant',at:3});
  await put('play/s4',{name:'Spielplatz am Bach',sec:'spielplatz',st:'erledigt',at:4});
  await A.waitForTimeout(400);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const names=()=>A.$$eval('.playcard .mk .mkt b',l=>l.map(x=>x.innerText));
  await nav('spiel|');r.all=await names();r.head=await A.$eval('.playcard h2',e=>e.innerText);
  await A.click('[data-playf=drinnen]');await A.waitForTimeout(200);r.drin=await names();
  await A.click('[data-playf=erledigt]');await A.waitForTimeout(200);r.done=await names();
  await A.click('[data-playf=""]');await A.click('[data-playsec=spielplatz]');await A.waitForTimeout(200);r.sp=await names();r.route=await A.$$eval('.playcard .mk [data-route]',l=>l.length);
  // Schild schaltet weiter: Favorit → Geplant, fav fällt weg
  await A.click('[data-playst=s1]');await A.waitForTimeout(300);r.s1=[db().play.s1.st,db().play.s1.fav||null].join('|');
  // Merken mit Art-Wahl in der Maske
  await A.click('[data-act=playnew]');await A.click('[data-plset=sec][data-v=zuhause]');await A.fill('#pl-name','Kastanien sammeln');await A.click('[data-plset=st][data-v=favorit]');await A.click('[data-act=playsave]');await A.waitForTimeout(400);
  const P=Object.values(db().play).find(x=>x.name==='Kastanien sammeln');r.neu=P&&[P.sec,P.st,P.fav].join('|');
  // Bearbeiten über den Namen zeigt den Stand und die Glocke
  await A.click('[data-playsec=""]');await A.waitForTimeout(200);await A.click('[data-playedit=s3]');await A.waitForTimeout(200);r.editSt=await A.$eval('[data-plset=st][aria-pressed=true]',e=>e.dataset.v);r.bell=!!(await A.$('.tripform [data-prio]'));await A.click('[data-act=playcancel]');
  // Karte nur über 🗺️
  r.mapBefore=!!(await A.$('[data-act=plmapedit]'));await A.click('[data-act=plmapshow]');await A.waitForTimeout(200);r.mapAfter=!!(await A.$('[data-act=plmapedit]'));
  await A.screenshot({path:out+'/spiel2.png',fullPage:true});
  // Sprung mit Art, Sammlung zeigt den Stand
  await nav('spiel|ps:sport');r.ps=await A.$eval('[data-playsec][aria-pressed=true]',e=>e.dataset.playsec);r.psList=await names();
  await nav('projekte|');await A.click('[data-sammf="a|spiel"]');await A.waitForTimeout(200);r.samm=await A.$$eval('.sammcard .mk',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.all.join()==='Wasserspielplatz Westpark,Kinderturnen,Höhle aus Decken'&&/\(3\)/.test(r.head)&&r.drin.join()==='Kinderturnen,Höhle aus Decken'&&r.done.join()==='Spielplatz am Bach'
    &&r.sp.join()==='Wasserspielplatz Westpark'&&r.route===1&&r.s1==='geplant|'&&r.neu==='zuhause|favorit|true'&&r.editSt==='geplant'&&r.bell&&!r.mapBefore&&r.mapAfter
    &&r.ps==='sport'&&r.psList.join()==='Kinderturnen'&&r.samm.some(x=>/Kinderturnen/.test(x)&&/Geplant/.test(x));
  console.error(ok?'SPIEL2 OK':'SPIEL2 FAIL');await b.close();srv.close();process.exit(0)});
