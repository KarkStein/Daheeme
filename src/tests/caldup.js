srv.listen(8765,async()=>{
  // Doppelte Kita/Familywall (Florian 19.11.2026) und Kurs-Uhrzeit aus dem Kalender ändern
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const D=day(5),wd=new Date(Date.now()+2*864e5).getDay(),WD=['So','Mo','Di','Mi','Do','Fr','Sa'][wd];
  await put('kita/k1',{name:'Laternenfest',sec:'termine',date:D,at:1});
  await put('ext/fw',{at:1,n:2,items:{a1:{name:'Kita Laternenfest mit Umzug',date:D,time:'17:00'},a2:{name:'Zahnarzt',date:D,time:'09:00'}}});
  await put('play/p1',{name:'Turnen',sec:'sport',when:WD+' 16:00',at:1});
  await A.waitForTimeout(3000);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  const rows=()=>A.$$eval('.evlist .ev',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  r.r1=(await rows()).filter(x=>/Laternen|Zahnarzt/.test(x));
  r.mig=get(['haushalt',key,'food','termin','k_k1']);r.moved=get(['haushalt',key,'food','kita','k1','moved']);r.row17=await A.$eval('.evlist .ev[data-teredit="k_k1"]',e=>e.closest('li').innerText.replace(/\s+/g,' '));
  await A.click('.evlist .ev[data-teredit="k_k1"]');await A.waitForSelector('#terform');r.info=await A.$eval('#app',e=>e.innerText.replace(/\s+/g,' '));
  if(out)await A.screenshot({path:out+'/kalender-doppelt-zusammen.png'});
  await A.click('[data-fwsplit]');await A.waitForTimeout(600);await A.click('[data-act=tercancel]');await A.waitForTimeout(400);r.r2=(await rows()).filter(x=>/Laternen/.test(x));r.split=get(['haushalt',key,'food','ext','fwsplit','a1']);
  // Kurs: Uhrzeit ändern
  await A.click('.evlist .ev[data-teredit^="c_p1"] >> nth=0');await A.waitForSelector('#terform');r.ct=await A.$eval('[data-terf=time]',e=>e.value);r.verk=await A.$eval('#terform .verk',e=>e.innerText).catch(()=>'');
  await A.fill('[data-terf=time]','17:15');if(out)await A.screenshot({path:out+'/kalender-kurs-uhrzeit.png'});await A.click('#terform button[type=submit]');await A.waitForTimeout(900);
  r.when=get(['haushalt',key,'food','play','p1','when']);r.terc=JSON.stringify(Object.entries(get(['haushalt',key,'food','termin'])||{}).filter(e=>/^c_/.test(e[0])));r.r3=(await rows()).filter(x=>/Turnen/.test(x))[0];
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.r1.length===2&&r.mig&&r.mig.tag==='kita'&&r.mig.who==='kid'&&r.moved==='ter:k_k1'&&r.r1.some(x=>/^🎒 Laternenfest|Laternenfest/.test(x))&&/17:00/.test(r.row17)&&/Kita-Art/.test(r.info)&&r.r1.some(x=>/Zahnarzt/.test(x))&&/auch in Familywall/i.test(r.info)&&/Doch getrennt/.test(r.info)
    &&r.r2.length===2&&r.split===1&&r.ct==='16:00'&&/Turnen/.test(r.verk)&&r.when===WD+' 17:15 Uhr'&&/Turnen/.test(r.r3||'');
  console.error(ok?'CALDUP OK':'CALDUP FAIL');await b.close();srv.close();process.exit(0)});
