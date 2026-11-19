srv.listen(8765,async()=>{
  // 🫧 Nach Bedarf (Florian 19.11.2026: „A, fest wählbar je Aufgabe“): Liste angelegt, Füllbalken, Heute für dich bei der Person, die dran ist, Abhaken, Übernehmen, Später, Rückblick
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-19T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(800);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(500)};
  const r={};for(let i=0;i<20&&!r.n;i++){await A.waitForTimeout(300);const T=(get(['haushalt',key,'config','tasks'])||[]);r.n=T.filter(t=>t.freq==='need').length;r.names=T.map(t=>t.name)}
  const T=get(['haushalt',key,'config','tasks'])||[],by=n=>T.find(t=>t.name===n)||{};
  r.dup=r.names.length!==new Set(r.names).size;r.kaffee=by('Kaffeemaschine entkalken').owner;r.matr=by('Matratze wenden').owner;r.bett=by('Bett abziehen').every;r.saugen=by('Saugen (nach Bedarf)').freq;
  const now=Date.parse('2026-11-19T10:00:00+01:00'),D=864e5;
  await put('food/need/n_bett/x1',{at:now-22*D,by:'p1'});await put('food/need/n_handtuch/x1',{at:now-15*D,by:'p0'});await put('food/need/n_kocher/x1',{at:now-80*D,by:'p1'});
  await nav('woche|wp:0');await A.waitForTimeout(400);
  r.heute=await A.$eval('.wkheute .hlist',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'');
  await A.click('.wkheute .hrow:has-text("Bett abziehen") [data-need]');await A.waitForTimeout(600);
  r.tick=Object.values(get(['haushalt',key,'food','need','n_bett'])||{}).filter(v=>v.by==='p0');r.done=await A.$eval('.wkheute .hrow:has-text("Bett abziehen")',e=>e.className).catch(()=>'');
  // Abschnitt aufklappen
  await A.click('#sec-need [data-tfold]');await A.waitForTimeout(300);await A.waitForTimeout(100);r.rows=await A.$$eval('#sec-need .needrow, #sec-week .needrow',l=>l.length);r.sec=await A.$eval('#sec-week .needdue',e=>e.innerText.replace(/\n/g,' | ').slice(0,500)).catch(()=>'');r.rest=await A.$eval('#sec-need',e=>e.innerText.replace(/\n/g,' | ').slice(0,200));r.gp=!(get(['haushalt',key,'config','tasks'])||[]).some(t=>/Großputz/.test(t.name))&&!!get(['haushalt',key,'food','termin','gp_a'])&&!!get(['haushalt',key,'food','termin','gp_b']);r.conv=(get(['haushalt',key,'config','tasks'])||[]).filter(t=>['month','half','year'].includes(t.freq)).length;r.center=(get(['haushalt',key,'config','tasks'])||[]).some(t=>/center/i.test(t.name));
  r.bald=await A.$eval('#sec-need .needrow:has-text("Wasserkocher")',e=>e.innerHTML).catch(()=>'');
  await A.setViewportSize({width:360,height:1500});await A.$eval('#sec-day',e=>e.scrollIntoView());await A.waitForTimeout(300);await A.screenshot({path:out+'/drei-bereiche.png'});await A.setViewportSize({width:360,height:640});
  // Übernehmen: Handtücher sind bei p1 dran, p0 hakt ab
  await A.click('#sec-week .needrow:has-text("Handtücher") [data-need]');await A.waitForTimeout(600);r.own=Object.values(get(['haushalt',key,'food','need','n_handtuch'])||{}).find(v=>v.by==='p0'&&v.at>now-D);
  // Später: lange drücken
  const row=await A.$('#sec-need .needrow:has-text("Wasserkocher") .needl');await row.evaluate(x=>x.scrollIntoView({block:'center'}));const bb=await row.boundingBox();await A.mouse.move(bb.x+20,bb.y+8);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(200);
  r.lpx=await A.$eval('#sec-need .lpx',e=>e.textContent).catch(()=>'');await A.screenshot({path:out+'/nachbedarf-spaeter.png'});
  if(r.lpx)await A.click('#sec-need .lpx');await A.waitForTimeout(500);r.later=get(['haushalt',key,'food','needp','n_kocher']);
  // Rückblick zeigt die Haken
  await nav('woche|wp:4');r.rb=await A.$eval('#app',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'');
  // Bearbeiten: Rhythmus „etwa alle“
  await nav('woche|wp:1');r.edit=await A.evaluate(()=>{const s=document.querySelector('[data-f=every]');return s?s.options.length:0});
  console.log(JSON.stringify(Object.assign({},r,{names:r.names.length,rb:/Handtücher/.test(r.rb),bald:/bald/.test(r.bald)})),errs);
  console.log(!errs.length&&r.n>=18&&!r.dup&&r.kaffee==='p1'&&r.matr==='p0'&&r.bett===21&&r.saugen==='week'&&/Bett abziehen/.test(r.heute)&&!/Handtücher/.test(r.heute)&&r.tick.length===1&&!r.tick[0].own&&/hdone/.test(r.done)&&r.rows>=18&&/voll/.test(r.sec)&&/Handtücher/.test(r.sec)&&!/Handtücher/.test(r.rest)&&r.conv===0&&r.gp&&!r.center&&/bald/.test(r.bald)&&r.own&&r.own.own==='p1'&&/Später/.test(r.lpx)&&r.later&&r.later.until>now+6*D&&/Handtücher/.test(r.rb)?'NACHBEDARF OK':'NACHBEDARF FAIL');
  await b.close();process.exit(0)});
