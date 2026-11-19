srv.listen(8765,async()=>{
  // Familywall-Termine (Florian 16.11.2026): Tipp öffnet Fenster mit Für wen, Art, Ort und Erinnern; Titel/Zeit bleiben bei Familywall
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const t=new Date();t.setDate(t.getDate()+3);const k=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
  await put('food/place/o1',{name:'Praxis',addr:'Beispielweg 1',at:1});await put('food/ext/fw',{at:1,n:1,items:{f1:{name:'Zahnarzt Kontrolle',date:k,time:'09:00'}}});await A.waitForTimeout(400);
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  await A.click('[data-fwpick=f1]');await A.waitForSelector('#mbox [data-ebk=tag]');
  await A.click('#mbox [data-ebk=tag][data-ebv=arzt]');await A.click('#mbox [data-ebk=pl][data-ebv=Praxis]');await A.click('#mbox [data-ebk=remind][data-ebv="1d"]');
  await A.screenshot({path:out+'/familywall-termin.png'});await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  {const f=(db().ext.fwx||{}).f1||{};r.db=[f.tag,f.place,f.remind].join();}
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  r.row=await A.$$eval('.evlist li',l=>{const x=l.find(x=>/Zahnarzt/.test(x.innerText));return x?[x.innerText.includes('🩺'),!!x.querySelector('[data-route]')].join():''});
  // Kita: Familywall-Termin mit Kinderhaus im Titel erscheint bei Kita › Termine
  await put('food/ext/fw/items/f2',{name:'Kinderhaus schließt um 12:00 Uhr',date:k});await A.waitForTimeout(400);await nav('kita|ks:termine');
  r.kita=await A.$eval('#app',e=>/Kommt noch/.test(e.innerText)&&/Kinderhaus schließt/.test(e.innerText));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.db==='arzt,Praxis,1d'&&r.row==='true,true'&&r.kita;
  console.error(ok?'FWX OK':'FWX FAIL');await b.close();srv.close();process.exit(0)});
