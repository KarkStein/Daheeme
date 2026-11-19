srv.listen(8765,async()=>{
  // Urlaub pausiert den Alltag (Florian 19.11.2026): Heute für dich leer, Füllbalken stehen still, Rückblick zählt Urlaubstage nicht als liegen geblieben
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-19T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(900);
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(600)};
  const now=Date.parse('2026-11-19T10:00:00+01:00'),D=864e5;
  // Bett abziehen (alle 21 Tage) zuletzt vor 22 Tagen: voll. Vorwoche KW 46 mit einem Haken, damit sie im Rückblick steht.
  await put('food/need/n_bett/x1',{at:now-22*D,by:'p1'});const T=get(['haushalt',key,'config','tasks'])||[],day=T.find(t=>t.freq==='day'&&t.owner!=='ho'),wkT=T.find(t=>t.freq==='week'&&t.owner!=='ho');
  await put('weeks/2026-W46/ticks/'+day.id+'__0',{by:'p0',at:now-10*D});await A.waitForTimeout(800);
  await nav('woche|wp:0');r.h0=await A.$eval('.wkheute',e=>e.innerText.replace(/\n/g,' | '));r.n0=await A.$$eval('.wkheute .hrow',l=>l.length);
  await nav('woche|wp:4');await A.click('[data-rbmode=woche]');await A.click('[data-rboff="-1"]');await A.waitForTimeout(400);r.rb0=await A.$eval('.rbsum .rbtop',e=>e.innerText.replace(/\n/g,' '));
  // Urlaub 9. bis 20.11.: deckt KW 46 ganz und heute ab
  await put('food/urlaub/u1',{name:'Ostsee',state:'aktuell',from:'2026-11-09',to:'2026-11-20',at:1});await A.waitForTimeout(900);
  r.rb1=await A.$eval('.rbsum .rbtop',e=>e.innerText.replace(/\n/g,' '));r.wkline=await A.$eval('.rbwkh',e=>e.innerText.replace(/\n/g,' ')).catch(()=>'');await A.screenshot({path:out+'/urlaub-rueckblick.png'});
  await nav('woche|wp:0');r.h1=await A.$eval('.wkheute',e=>e.innerText.replace(/\n/g,' | '));r.n1=await A.$$eval('.wkheute .hrow',l=>l.length);await A.screenshot({path:out+'/urlaub-haushalt-ruht.png'});
  await A.click('#sec-need [data-tfold]');await A.waitForTimeout(300);r.bett=await A.$eval('.needrow:has-text("Bett abziehen")',e=>e.closest('section').id+'|'+e.innerText.replace(/\n/g,' ')).catch(()=>'');
  // Idee-Urlaub pausiert nicht
  await put('food/urlaub/u1/state','traum');await A.waitForTimeout(800);r.n2=await A.$$eval('.wkheute .hrow',l=>l.length);
  console.log(JSON.stringify(r),errs);
  const num=s=>(/(\d+(?:,\d)?) von (\d+(?:,\d)?)/.exec(s)||[]).slice(1).map(x=>parseFloat(x.replace(',','.')));
  const a=num(r.rb0),z=num(r.rb1);
  console.log(!errs.length&&r.n0>0&&/Bett abziehen/.test(r.h0)&&r.n1===0&&/Urlaub: Haushalt und Nach Bedarf ruhen/.test(r.h1)&&a[1]>1&&z[0]===a[0]&&z[1]===z[0]&&!/Liegen geblieben/.test(r.rb1)&&/Urlaub/.test(r.wkline)&&/sec-need/.test(r.bett)&&r.n2===r.n0?'URLAUBPAUSE OK':'URLAUBPAUSE FAIL');
  await b.close();process.exit(0)});
