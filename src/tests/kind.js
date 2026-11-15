srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const wk='2026-W47';
  // Name des Kindes in den Einstellungen
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='settings';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);
  const sum=await A.$('[data-setsum=wir]');if(sum)await sum.click();await A.waitForTimeout(200);
  await A.fill('[data-kidname]','Testkind');await A.press('[data-kidname]','Tab');await A.waitForTimeout(400);r.name=(db().food.pref||{}).kidname;
  // Homeoffice Dienstag ganzer Tag p1, Donnerstag "1 von 2" p0, Freitag Kita zu
  await put('weeks/'+wk+'/ticks/essen__1',{by:'p1',at:1});await put('weeks/'+wk+'/ticks/essen__3',{by:'p0',at:1,part:'ab'});
  await put('food/kita/z1',{name:'Kita zu',sec:'termine',kind:'zu',date:'2026-11-20',at:1});await A.waitForTimeout(400);
  await nav('kind|');r.pager=await A.$eval('.pager',e=>e.innerText.replace(/\n/g,' '));r.h1=await A.$eval('#app h1',e=>e.innerText);
  const rows=async()=>A.$$eval('.kidrow',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));r.rows=await rows();
  // Montag bringt tauschen
  await A.click('[data-kidset="'+wk+'|0|br"]');await A.waitForTimeout(400);r.mo=(await rows())[0];r.ov=JSON.stringify(((db().food.kid||{}).bh||{})[wk]);
  // Heute (Mi) gebracht
  await A.click('[data-kidbrought="2"]');await A.waitForTimeout(400);const tk=(db().weeks[wk]||{}).ticks||{};r.tick=Object.entries(tk).filter(([k,v])=>/^bringen/.test(k)).map(([k,v])=>k+':'+v.by+':'+v.day);
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/wir-kind.png',fullPage:true});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await A.click('[data-kidbrought="2"]');await A.waitForTimeout(400);r.untick=Object.keys((db().weeks[wk]||{}).ticks||{}).filter(k=>/^bringen/.test(k)).length;
  // feste Woche
  await A.click('[data-kidrule="0"]');await A.waitForTimeout(400);r.rule=JSON.stringify((db().food.kid||{}).rule);
  // Dashboard
  await nav('camp|sp:tag');r.dash=await A.$eval('.campback.dash .bline',e=>e.innerText.replace(/\n/g,' '));
  // Schaukel im Bild
  await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(500);await A.click('.spot[data-go=kind]');await A.waitForTimeout(400);r.swing=await A.$eval('#app h1',e=>e.innerText);
  await nav('camp|');await A.waitForTimeout(600);await (await A.$('.camp')).screenshot({path:out+'/haus-schaukel.png'});
  // Partner hat den Umschalter
  await nav('privat|');r.ppager=!!(await A.$('.pager [data-go=kind]'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.name==='Testkind'&&/Partner/.test(r.pager)&&/Testkind/.test(r.pager)&&r.h1==='Testkind'&&r.rows.length===5&&/🏠/.test(r.rows[1])&&/Kita zu/.test(r.rows[4])&&/✋/.test(r.mo)&&/"br"/.test(r.ov)&&r.tick.length===1&&/:2$/.test(r.tick[0])&&r.untick===0&&/"br"/.test(r.rule)&&/bringt/.test(r.dash)&&/holt ab/.test(r.dash)&&r.swing==='Testkind'&&r.ppager;
  console.error(ok?'KIND OK':'KIND FAIL');await b.close();srv.close();process.exit(0)});
