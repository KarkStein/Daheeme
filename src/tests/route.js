srv.listen(8765,async()=>{
  // Routen-Knopf (Florian 16.11.2026): überall gleich, Von hier / Von zu Hause; Ort an Terminen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  await A.evaluate(()=>{window.__open=[];window.open=(u)=>{window.__open.push(u);return null}});
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  // Termin mit Ort
  await nav('woche|wp:3');await A.click('[data-act=ternew]');await A.fill('#ter-name','Kinderarzt');await A.fill('[data-terf=place]','Musterstraße 1, Musterstadt');await A.click('#terform button[type=submit]');await A.waitForTimeout(500);
  r.saved=Object.values(db().termin||{}).map(x=>x.place).join();
  await A.click('[data-calview=liste]');await A.waitForTimeout(300);r.btn=await A.$$eval('.evlist [data-route]',l=>l.map(x=>x.dataset.route));
  await A.click('.evlist [data-route]');await A.waitForTimeout(300);r.opts1=await A.$$eval('#mbox [data-routefrom]',l=>l.map(x=>x.dataset.routefrom));r.hint=/Einstellungen/.test(await A.$eval('#mbox',e=>e.innerText));
  await A.click('#mbox [data-routefrom=hier]');await A.waitForTimeout(200);
  // Adresse zu Hause eintragen
  await A.click('[data-allar]').catch(()=>{});await A.waitForTimeout(200);await A.click('#allar [data-arnav="settings|"]');await A.waitForTimeout(300);
  const sum=await A.$('[data-setsum=ort]');if(sum)await sum.click();await A.waitForTimeout(200);await A.fill('[data-homeaddr]','Beispielweg 2, Testdorf');await A.press('[data-homeaddr]','Tab');await A.waitForTimeout(400);r.home=(db().pref||{}).home;
  await nav('woche|wp:3');await A.waitForTimeout(300);await A.click('.evlist [data-route]');await A.waitForTimeout(300);r.opts2=await A.$$eval('#mbox [data-routefrom]',l=>l.map(x=>x.dataset.routefrom));
  await A.screenshot({path:out+'/route-auswahl.png'});
  await A.click('#mbox [data-routefrom=home]');await A.waitForTimeout(200);
  r.open=await A.evaluate(()=>window.__open);
  // zuletzt gewählt steht oben
  await A.click('.evlist [data-route]');await A.waitForTimeout(300);r.first=await A.$eval('#mbox [data-routefrom]',x=>x.dataset.routefrom);
  // 📞 bei Nummern in Notizen: versternt, ein Tipp wählt
  await A.keyboard.press('Escape');await A.waitForTimeout(300);r.esc=!(await A.$('#mbox'));
  await fetch('http://localhost:8765/haushalt/'+key+'/food/kita/i1.json',{method:'PUT',body:JSON.stringify({name:'Kontakt Kita',sec:'infos',note:'Gruppe 089 1234567, Leitung',at:1})});await A.waitForTimeout(400);
  await nav('kita|ks:infos');r.kita=await A.$eval('#app',e=>e.innerText);r.tel=await A.$$eval('a[href^="tel:"]',l=>l.map(x=>x.getAttribute('href')));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Musterstraße/.test(r.saved)&&r.btn.length===1&&r.opts1.join()==='hier'&&r.hint&&r.home==='Beispielweg 2, Testdorf'&&r.opts2.length===2&&r.open.length===2&&!/origin=/.test(r.open[0])&&/origin=Beispielweg/.test(r.open[1])&&/destination=Musterstra/.test(r.open[1])&&r.first==='home'&&r.esc&&!/1234567/.test(r.kita)&&/••• ••• 567/.test(r.kita)&&r.tel.includes('tel:+49891234567');
  console.error(ok?'ROUTE OK':'ROUTE FAIL');await b.close();srv.close();process.exit(0)});
