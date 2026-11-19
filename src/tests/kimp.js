srv.listen(8765,async()=>{
  // Kita: Termine einfügen (Text und .ics) → Vorschau → übernehmen; Kita zu wirkt auf Bringen
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  await A.waitForTimeout(500);await nav('kita|ks:termine');await A.click('[data-act=kitaimp]');
  await A.fill('#kimp-text','Mi, 18.11. Laternenfest 17:00 Uhr\n19.11.–20.11. Kita geschlossen');
  await A.setInputFiles('#kimp-file',{name:'t.ics',mimeType:'text/calendar',buffer:Buffer.from('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;TZID=Europe/Berlin:20261203T193000\r\nSUMMARY:Elternabend\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n')});
  await A.click('[data-act=kimpparse]');await A.waitForTimeout(300);const pre=await A.$eval('#app',e=>e.innerText);
  await A.click('[data-act=kimpsave]');await A.waitForTimeout(600);
  const db=JSON.stringify(get(['haushalt',key,'food','termin'])||{});
  await nav('kita|');const kid=await A.$eval('.kidbh',e=>e.innerText);
  const r={pre:/4 erkannt/.test(pre),saved:(db.match(/"tag":"kita"/g)||[]).length,ea:/"time":"19:30"/.test(db),zu:(kid.match(/🚪/g)||[]).length};
  console.error(JSON.stringify(r),errs);
  console.error(!errs.length&&r.pre&&r.saved===4&&r.ea&&r.zu===2?'KIMP OK':'KIMP FAIL');await b.close();srv.close();process.exit(0)});
