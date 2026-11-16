srv.listen(8765,async()=>{
  // Familywall: Termine aus food/ext/fw erscheinen nur lesend im Kalender (👪), gleiche wie eigene nur einmal, mehrtägige je Tag
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/termin/t1',{name:'Zahnarzt',date:'2026-11-17',time:'09:00',at:1});
  await put('food/ext/fw',{at:1,n:3,items:{f1:{name:'Zahnarzt',date:'2026-11-17',time:'09:00'},f2:{name:'Elternabend',date:'2026-11-18',time:'19:30',end:'21:00',place:'Kita'},f3:{name:'Oma zu Besuch',date:'2026-11-20',to:'2026-11-22'}}});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await A.waitForTimeout(500);await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  const t=await A.$eval('#app',e=>e.innerText);const r={zahn:(t.match(/Zahnarzt/g)||[]).length,eltern:/👪\s*Elternabend/.test(t)||/Elternabend/.test(t),note:!/Aus Familywall/.test(t)&&!/👪/.test(t.replace(/👪 Familywall/g,'')),oma:(t.match(/Oma zu Besuch/g)||[]).length,chip:/Familywall/.test(await A.$eval('#app',e=>e.innerHTML))};
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.zahn===1&&r.eltern&&r.note&&r.oma===3;
  console.error(ok?'FW OK':'FW FAIL');await b.close();srv.close();process.exit(0)});
