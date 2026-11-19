srv.listen(8765,async()=>{
  // Bündelung (Florian 17.11.2026, „A neu“, Sport aufgelöst): Seiten-Leisten Kind | Kita | Spielen, Partner | Geschenke, Alles Gemerkte | Recherchen;
  // Spielplätze ziehen aus Spielen nach Reisen und Ausflüge (food/trip/tpl_<id>, Art spiel), Original bleibt mit moved; Fächer mit je drei Bereichen und Seiten
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:1,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(500);
  const key=/k=([^&]+)/.exec(A.url())[1];
  setAt(['haushalt',key,'food','play'],{pa:{name:'Wasserspielplatz am Park',sec:'spielplatz',wx:'draussen',age:'2',st:'favorit',fav:true,at:1},pb:{name:'Spielplatz am Bach',at:2},pc:{name:'Höhle aus Decken',sec:'zuhause',wx:'drinnen',at:3},pd:{name:'Kinderturnen',sec:'sport',when:'Do 16:00',at:4}});
  await A.reload();await A.waitForTimeout(1500);
  const P=get(['haushalt',key,'food','play']),T=get(['haushalt',key,'food','trip'])||{};
  r.moved=[P.pa.moved,P.pb.moved,P.pc.moved||'',P.pd.moved||''].join(',');r.trip=T.tpl_pa?[T.tpl_pa.kind,T.tpl_pa.fav,/Ab 2/.test(T.tpl_pa.note||'')].join(','):'';r.trips=Object.keys(T).sort().join(',');
  await A.addStyleTag({content:'#toast{display:none!important}'});
  const nav=async x=>{await A.evaluate(x=>{const b=document.createElement("button");b.dataset.nav=x;b.id="zz";document.getElementById("app").appendChild(b)},x);await A.click("#zz");await A.waitForTimeout(450)};
  const pager=()=>A.$$eval('.pager .pdot',l=>l.map(x=>(x.getAttribute('aria-pressed')==='true'?'*':'')+x.innerText).join('|'));
  await nav('spiel|');r.h1=await A.$eval('#app h1',e=>e.innerText);r.pSpiel=await pager();r.spielRows=await A.$$eval('.playcard .mk b',l=>l.map(x=>x.innerText).join('|'));r.spielArts=await A.$$eval('[data-playsec]',l=>l.map(x=>x.dataset.playsec).join(','));
  await nav('kita|');r.pKita=await pager();
  await nav('geschenke|');r.pGesch=await pager();
  await nav('recherchen|');r.pRech=await pager();
  // Wischen über die Leiste: Kind → Kita (Klick auf den Nachbarn wie swipeTo)
  await nav('kind|');r.pKind=await pager();await A.click('.pager .pdot[data-go=kita]');await A.waitForTimeout(400);r.kitaH1=await A.$eval('#app h1',e=>e.innerText);
  // Kind-Seite: Spielplätze springen nach Reisen › Gemerkt mit Filter Spielplatz
  await nav('ausflug|rk:spielplatz');r.rg=await A.$$eval('.rgcard .mk b',l=>l.map(x=>x.innerText).sort().join('|'));r.rgChip=await A.$eval('.rgcard [data-rgf="k|spielplatz"]',e=>e.getAttribute('aria-pressed')).catch(()=>'');
  // Merken: Spielplatz für hier wird ein Ausflugsziel (Art spiel)
  await A.click('.rgcard [data-act=merken]');await A.waitForSelector('#mbox');await A.fill('#mbox input[type=text]','Spielplatz Westpark');await A.click('#mbox [data-ebk=kind][data-ebv=spielplatz]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(600);
  r.newTrip=Object.values(get(['haushalt',key,'food','trip'])||{}).filter(x=>x.name==='Spielplatz Westpark').map(x=>x.kind).join(',');
  // Fächer
  for(const t of ['camp','einkauf']){await A.dispatchEvent(`#tabs [data-tab=${t}]`,'contextmenu');await A.waitForTimeout(400);r['fan_'+t]=await A.$$eval('#fan [data-fannav]',l=>l.map(x=>x.innerText.replace(/\n/g,' ').trim()).join('|'));if(t==='camp')await A.screenshot({path:out+'/buendel-faecher.png'});await A.keyboard.press('Escape');await A.waitForTimeout(250);if(await A.$('#fan'))await A.evaluate(()=>document.getElementById('fan').remove())}
  // Alle Bereiche: Kita und Spielen als Unterpunkte von Kind, nicht groß
  await A.click('[data-allar]');await A.waitForTimeout(400);r.arMain=await A.$$eval('#allar .armain b',l=>l.map(x=>x.innerText).join('|'));r.arKind=await A.$$eval('#allar .armain',l=>{const k=l.find(x=>/Kind/.test(x.innerText));const s=k&&k.nextElementSibling;return s?[...s.querySelectorAll('button')].map(x=>x.innerText).join('|'):''});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.moved==='trip:tpl_pa,trip:tpl_pb,,'&&r.trip==='spiel,true,true'&&r.trips.includes('tpl_pb')&&r.h1==='Spielen'&&r.pSpiel==='Kind|Kita|*Spielen|Minispiele'&&r.spielRows.split('|').sort().join('|')==='Höhle aus Decken|Kinderturnen'&&!r.spielArts.includes('spielplatz')
    &&r.pKita==='Kind|*Kita|Spielen|Minispiele'&&r.pGesch==='Partner|*Geschenke'&&r.pRech==='Alles Gemerkte|*Recherchen'&&r.kitaH1==='Kita'&&r.rg==='Spielplatz am Bach|Wasserspielplatz am Park'&&r.rgChip==='true'&&r.newTrip==='spiel'
    &&r.fan_camp==='🧒 Kind|Kita|Spielen|Minispiele|🫶 Wir|Partner|Geschenke|🛠️ Am Haus'&&/Reisen und Ausflüge\|Packlisten\|🎵 Musik\|🗃️ Sammlung\|Alles Gemerkte\|Recherchen/.test(r.fan_einkauf)&&/Kind/.test(r.arMain)&&!/Kita|Spielen|Geschenke/.test(r.arMain)&&/^Kita\|Spielen/.test(r.arKind);
  console.error(ok?'BUENDEL OK':'BUENDEL FAIL');await b.close();srv.close();process.exit(0)});
