// Look „Bretagne“: Bilder der vier Vergleichs-Seiten (Einkaufsliste, Haushalt, Kalender, Am-Haus-Projekt) und Stichproben der festen Regeln
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=async(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(500)};
  const fire=async at=>{await A.evaluate(at=>{const w=document.createElement("span");w.innerHTML="<button "+at+" id='zf'></button>";document.getElementById("app").appendChild(w.firstChild)},at);await A.click("#zf");await A.waitForTimeout(500)};
  const pre=process.env.LOOK_PRE||'look';
  const shot=n=>A.screenshot({path:(process.argv[2]||'/tmp')+'/'+pre+'-'+n+'.png'});
  const D=new Date(),iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),day=n=>iso(new Date(D.getFullYear(),D.getMonth(),D.getDate()+n));
  await put('food/shop/s1',{name:'2 l Milch',cat:'kuehl',at:1});await put('food/shop/s2',{name:'Bananen',cat:'obst',urg:true,at:2});await put('food/shop/s3',{name:'Brot',cat:'brot',at:3});
  await put('food/shop/s4',{name:'Zwiebeln',cat:'obst',src:'Linsensuppe',at:4});await put('food/shop/s5',{name:'Butter',cat:'kuehl',done:true,at:5});
  await put('food/termin/t1',{name:'Zahnarzt',date:day(0),time:'15:00',who:'p0',tag:'arzt',place:'Praxis',at:1});
  await put('food/termin/t2',{name:'Laternenfest',date:day(1),time:'16:30',who:'kid',tag:'kita',kk:'fest',at:2});
  await put('food/termin/t3',{name:'Oma kommt',date:day(3),allday:true,who:'both',tag:'familie',at:3});
  await put('food/hproj/h1',{name:'Zimmertausch',emo:'🛏️',cat:'wohnen',room:'Schlafzimmer',state:'aktuell',budget:500,at:1});
  await put('food/fund/f1',{name:'Kinderbett 70×140',area:'haus',proj:'h1',kind:'moebel',st:'favorit',price:'120',at:2});
  await put('food/hstep/x1',{proj:'h1',name:'Ausmessen',sec:'vor',ord:0,done:true,at:1});await put('food/hstep/x2',{proj:'h1',name:'Farbe und Folie',sec:'bes',ord:0,buy:true,at:2});await put('food/hstep/x3',{proj:'h1',name:'Wände streichen',sec:'mach',ord:0,who:'p0',at:3});
  await A.waitForTimeout(700);
  const r={};
  await fire('data-go="einkauf"');await A.waitForTimeout(400);await shot('einkauf');
  await nav('woche|wp:0');await A.evaluate(()=>window.scrollTo(0,0));await shot('haushalt');
  await nav('woche|wp:3');await A.evaluate(()=>window.scrollTo(0,0));await shot('kalender');
  await nav('amhaus|');await fire('data-hproj="h1"');await A.waitForSelector('.hscard');await A.evaluate(()=>window.scrollTo(0,0));await shot('amhaus');
  // Stichproben: Karten ohne Schatten, Knöpfe rund, Karten mit 12 px
  r.card=await A.$$eval('.card',l=>l.every(e=>{const s=getComputedStyle(e);return s.boxShadow==='none'&&s.borderTopLeftRadius==='12px'}));
  r.btn=await A.$$eval('#app button.primary, #app button.ghost',l=>l.every(e=>parseFloat(getComputedStyle(e).borderTopLeftRadius)>=20));
  r.errs=errs;
  // feste Regeln im Quelltext (Farben, Rundungen, Schatten, Schriftgrößen, feste Stile): src/look-check.js
  r.regeln=require(require('path').resolve('src/look-check.js'))();
  const ok=process.env.LOOK_PRE?true:(r.card&&r.btn&&!errs.length&&!r.regeln.length);
  console.log(JSON.stringify(r));console.log(ok?'LOOK OK':'LOOK FEHLER');await b.close();srv.close();process.exit(ok?0:1);
});
