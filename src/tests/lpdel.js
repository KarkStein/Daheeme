srv.listen(8765,async()=>{
  // Lange drücken im Kalender (Florian 18.11.2026: „nur löschen vorschlagen, mit x bestätigen“, „einfach x ist sauberer“; „mit einem einfachen Klick bearbeiten“)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  await put('termin/t1',{name:'Zahnarzt',date:day(2),time:'09:00',remind:true,at:1});await put('termin/t2',{name:'Friseur',date:day(3),at:2});
  await put('prio/p1',{name:'An Zahnarzt denken',from:'frei',ref:'t1',at:3});await put('prio/p2',{name:'Pass abholen',from:'frei',due:day(3),at:4});
  await put('kita/k1',{name:'Laternenfest',sec:'termine',date:day(2),at:5});
  await put('ext/fw',{at:1,n:1,items:{f1:{name:'Chorprobe',date:day(3),time:'19:00'}}});
  await A.waitForTimeout(3200);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const lp=async sel=>{const e=await A.$(sel);await e.scrollIntoViewIfNeeded();const q=await e.boundingBox();await A.mouse.move(q.x+30,q.y+q.height/2);await A.mouse.down();await A.waitForTimeout(650);await A.mouse.up();await A.waitForTimeout(300)};
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  // lange drücken: nur „✕ Löschen“ an der Zeile, kein Fenster, keine Maske
  await lp('.ev[data-teredit=t1]');r.x=await A.$$eval('#app .lpx',l=>l.map(x=>x.innerText.trim()));r.noMask=!(await A.$('#terform'))&&!(await A.$('#mbox'));
  if(out)await A.screenshot({path:out+'/lang-druecken-termin.png'});
  // Tipp daneben nimmt das ✕ wieder weg, nichts gelöscht
  await A.click('.calwsep');await A.waitForTimeout(300);r.off=!(await A.$('#app .lpx'))&&!!db().termin.t1;
  await lp('.ev[data-teredit=t1]');await A.click('#app .lpx');await A.waitForTimeout(500);r.gone=!db().termin.t1&&!(db().prio||{}).p1;r.toast=await A.$eval('#toast',e=>e.innerText);
  await A.click('#toast .toastbtn');await A.waitForTimeout(500);r.back=!!db().termin.t1&&db().termin.t1.time==='09:00'&&db().termin.t1.remind===true&&!!(db().prio||{}).p1;
  // kurzer Tipp öffnet weiter das Bearbeiten
  await A.click('.ev[data-teredit=t2]');await A.waitForTimeout(300);r.tap=!!(await A.$('#terform'));await A.click('[data-act=tercancel]');await A.waitForTimeout(300);
  // Familywall: ausblenden statt löschen, mit Rückgängig
  await lp('.ev[data-fwpick]');r.fwx=await A.$eval('#app .lpx',x=>x.innerText.trim());await A.click('#app .lpx');await A.waitForTimeout(500);
  r.hid=Object.keys((db().ext||{}).fwhide||{}).length===1&&!(await A.$('.ev[data-fwpick]'));r.fwtoast=await A.$eval('#toast',e=>e.innerText);
  await A.click('#toast .toastbtn');await A.waitForTimeout(500);r.unhid=!Object.keys((db().ext||{}).fwhide||{}).length&&!!(await A.$('.ev[data-fwpick]'));
  // Erinnerung im Kalender: lange drücken löscht, Rückgängig holt sie zurück
  await lp('.ev[data-caled="prio|p2"]');await A.click('#app .lpx');await A.waitForTimeout(500);r.pgone=!(db().prio||{}).p2;await A.click('#toast .toastbtn');await A.waitForTimeout(500);r.pback=!!(db().prio||{}).p2;
  // kurzer Tipp auf den Kita-Termin öffnet gleich das Bearbeiten in der Kita
  await A.click('.ev[data-caled="kita|k1"]');await A.waitForTimeout(500);r.kita=await A.evaluate(()=>[...document.querySelectorAll('#app input')].some(i=>i.value==='Laternenfest'));
  await nav('woche|wp:3');await A.click('.ev[data-caled="prio|p2"]');await A.waitForTimeout(500);r.prio=await A.evaluate(()=>[...document.querySelectorAll('#app input')].some(i=>i.value==='Pass abholen'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.x.join()==='✕ Löschen'&&r.noMask&&r.off&&r.gone&&/Rückgängig/.test(r.toast)&&r.back&&r.tap&&r.fwx==='✕ Ausblenden'&&r.hid&&/nur in Familywall/.test(r.fwtoast)&&r.unhid&&r.pgone&&r.pback&&r.kita&&r.prio;
  console.error(ok?'LPDEL OK':'LPDEL FAIL');await b.close();srv.close();process.exit(0)});
