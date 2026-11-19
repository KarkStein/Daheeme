srv.listen(8765,async()=>{
  // Eingang (Florian 19.11.2026: „Eingang, ja“): „📥 Später entscheiden“ legt in den Eingang, Karte in der Sammlung, Tipp öffnet „Wohin damit?“, Speichern räumt weg, ✕ löscht
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(600);
  const key=/k=([^&]+)/.exec(A.url())[1];const inbox=()=>Object.values(get(['haushalt',key,'food','inbox'])||{});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(500)};
  const L='https://www.instagram.com/reel/abc123/';
  await A.goto('http://localhost:8765/?su='+encodeURIComponent(L)+'&st='+encodeURIComponent('Bastelidee Laterne'));await A.waitForSelector('#mbox [data-shlater]');await A.waitForTimeout(300);
  await A.screenshot({path:out+'/eingang-spaeter.png'});
  await A.click('#mbox [data-shlater]');await A.waitForTimeout(600);r.n1=inbox().length;r.name=(inbox()[0]||{}).name;r.link=(inbox()[0]||{}).link;
  await A.goto('http://localhost:8765/?sx='+encodeURIComponent('Zweite Sache'));await A.waitForSelector('#mbox [data-shlater]');await A.click('#mbox [data-shlater]');await A.waitForTimeout(600);r.n2=inbox().length;
  await nav('projekte|');r.card=await A.$eval('[data-inbox]',e=>e.closest('section').innerText.replace(/\n/g,' | ')).catch(()=>'');
  await A.screenshot({path:out+'/eingang-sammlung.png'});
  // Tipp öffnet Wohin damit? ohne „Später“, Speichern räumt weg
  await A.click('[data-inbox]:has-text("Bastelidee")');await A.waitForSelector('#mbox [data-shto]');r.noLater=!(await A.$('#mbox [data-shlater]'));r.pref=await A.$eval('#mbox [data-shf=name]',e=>e.value);
  await A.click('#mbox [data-shto=spiel]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(800);
  r.n3=inbox().length;r.play=Object.values(get(['haushalt',key,'food','play'])||{}).some(p=>p.name==='Bastelidee Laterne'&&p.link===L);
  // ✕ löscht mit Rückgängig
  await nav('projekte|');await A.click('[data-inboxrm]');await A.waitForTimeout(600);r.n4=inbox().length;r.gone=!(await A.$('[data-inbox]'));
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.n1===1&&r.name==='Bastelidee Laterne'&&r.link===L&&r.n2===2&&/Noch einsortieren/.test(r.card)&&/Zweite Sache/.test(r.card)&&r.noLater&&r.pref==='Bastelidee Laterne'&&r.n3===1&&r.play&&r.n4===0&&r.gone?'EINGANG OK':'EINGANG FAIL');
  await b.close();process.exit(0)});
