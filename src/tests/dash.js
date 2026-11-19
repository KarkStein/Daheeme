srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-16T10:20:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  const wx={current:{weather_code:61},hourly:{time:[],temperature_2m:[],precipitation_probability:[],weather_code:[]},daily:{time:[],temperature_2m_max:[],precipitation_sum:[]}};
  for(let i=0;i<16;i++){const d=new Date(2026,10,14+i);const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');wx.daily.time.push(k);wx.daily.temperature_2m_max.push(6);wx.daily.precipitation_sum.push(2);for(let h=0;h<24;h++){wx.hourly.time.push(k+'T'+String(h).padStart(2,'0')+':00');wx.hourly.temperature_2m.push(3+h/4);wx.hourly.precipitation_probability.push(h*3);wx.hourly.weather_code.push(h<15?2:61)}}
  await A.route('https://api.open-meteo.com/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(wx)}));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/kitaplan/2026-W47/d0',{text:'Kürbissuppe mit Brot',at:1});await put('food/plan/2026-W47/d0',{text:'Ofengemüse mit Feta',at:1});await put('food/plan/2026-W47/d1',{text:'Linsen-Dal',at:1});await put('food/termin/t1',{name:'Kinderarzt',date:'2026-11-16',time:'15:30',at:1});await put('food/termin/t2',{name:'Oma kommt',date:'2026-11-18',at:1});await put('food/urlaub/u1',{name:'Bretagne',state:'aktuell',from:'2027-05-20',to:'2027-06-03',at:1});await put('food/wxplace',{name:'München',lat:48.1,lon:11.6});await put('food/shop/s1',{name:'Milch',done:false,at:1});await put('food/prio/p1',{name:'Mittag zu zweit',from:'mittag',due:'2026-11-14',at:1});await put('food/prio/p2',{name:'Müll',from:'woche',due:'2026-11-14',at:2});
  await A.waitForTimeout(600);const r={};
  // Start als Medaille (Florian 19.11.2026): vorne Bild mit Datumsfeld (ohne Ring) und Karte Heute, hinten Dashboard gleich groß
  r.sky=await A.$eval('.medfront .skyhead',e=>e.innerText.replace(/\n/g,' '));r.noRingFront=!(await A.$('.medfront .skyring'));r.today=await A.$eval('.medfront .card.today',e=>e.innerText.replace(/\n/g,' '));
  r.flip0=await A.$eval('.medal',e=>e.classList.contains('flipped'));
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/start-medaille-vorne.png'});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  // Tipp auf eine freie Stelle dreht um
  const box=await (await A.$('.medfront .camp')).boundingBox();await A.mouse.click(box.x+box.width*0.72,box.y+box.height*0.55);await A.waitForTimeout(900);r.flip1=await A.$eval('.medal',e=>e.classList.contains('flipped'));r.ls=await A.evaluate(()=>localStorage.getItem('hq-medal'));
  r.back=await A.$eval('.medback',e=>e.innerText.replace(/\n/g,' '));r.ring=!!(await A.$('.medback .skyring .bring2'));r.line=await A.$$eval('.medback .bline li',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  r.cnt=await A.$$eval('.medback .bcnt span',l=>l.map(x=>x.innerText));r.same=await A.evaluate(()=>{const f=document.querySelector('.medfront').getBoundingClientRect(),b=document.querySelector('.medback').getBoundingClientRect();return Math.abs(f.height-b.height)<2});
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/start-medaille-hinten.png'});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  // Zurück dreht aufs Bild
  await A.goBack();await A.waitForTimeout(800);r.backKey=await A.$eval('.medal',e=>e.classList.contains('flipped'));r.stillStart=!!(await A.$('.medal'));
  // ↻ Bild und freie Stelle hinten
  await A.mouse.click(box.x+box.width*0.72,box.y+box.height*0.55);await A.waitForTimeout(800);await A.click('.medback [data-act=medflip]');await A.waitForTimeout(800);r.btnBack=await A.$eval('.medal',e=>e.classList.contains('flipped'));
  // Nächste Tage
  await A.mouse.click(box.x+box.width*0.72,box.y+box.height*0.55);await A.waitForTimeout(800);await A.click('.medback [data-tfold=st_more]');await A.waitForTimeout(300);r.b3open=await A.$$eval('.medback .bday3',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));await A.click('.medback [data-tfold=st_more]');await A.waitForTimeout(300);
  // Neu laden: zuletzt offene Seite bleibt
  await A.reload();await A.waitForSelector('.medal');await A.waitForTimeout(800);r.reload=await A.$eval('.medal',e=>e.classList.contains('flipped'));
  await A.click('.medback [data-tfold=st_more]');await A.waitForTimeout(300);await A.click('.medback .bcal[data-calopen]');await A.waitForTimeout(400);r.inCal=await A.$$eval('.cal [data-calday]',l=>l.length);
  await A.goBack();await A.waitForTimeout(600);await A.click('.medback [data-tfold=st_more]');await A.waitForTimeout(300);
  r.dotsRed=await A.$$eval('.camp circle[fill="#f25f5c"]',l=>l.length);
  // Zähler Heute dran springt in den Haushalt
  await A.click('.medback .bcnt[data-act=gotasks]');await A.waitForTimeout(500);r.tagH1=await A.$eval('#app h1',e=>e.textContent);r.rows=await A.$$eval('.wkheute .hrow',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));
  await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(400);await A.click('.medback [data-act=medflip]');await A.waitForTimeout(800);
  await A.click('.skyl');await A.waitForTimeout(300);r.hours=await A.$$eval('.wxhours li',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));await A.click('.skyl');await A.waitForTimeout(200);
  // Ohne Scrollen auf 360×640, vorne und hinten
  const c2=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const B=await c2.newPage();await B.clock.setFixedTime(new Date('2026-11-16T19:40:00+01:00'));await B.route('https://api.open-meteo.com/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(wx)}));B.on('pageerror',e=>errs.push(e.message));
  await B.goto(A.url());await B.waitForSelector('.medal');if(await B.$('[data-me=p0]'))await B.click('[data-me=p0]');await B.waitForTimeout(800);const sm=()=>B.evaluate(()=>{const t=document.querySelector('#tabs').getBoundingClientRect().top,d=document.querySelector('.medal').getBoundingClientRect();return {bottom:Math.round(d.bottom),tabs:Math.round(t)}});
  r.small=await sm();await B.screenshot({path:out+'/start-medaille-360-vorne.png'});await B.evaluate(()=>{document.querySelector('.medal').classList.add('flipped')});await B.click('.medfront .camp',{position:{x:250,y:120}}).catch(()=>{});
  await B.evaluate(()=>localStorage.setItem('hq-medal','1'));await B.reload();await B.waitForSelector('.medal.flipped');await B.waitForTimeout(800);r.small2=await sm();r.eve=await B.$$eval('.medback .bline li',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));r.dots=await B.$$eval('.medback .mdots i',l=>l.length);await B.screenshot({path:out+'/start-medaille-360-hinten.png'});await c2.close();
  await A.evaluate(()=>localStorage.setItem('hq-medal',''));
  // Mehrfachtipp
  const seq=async(t,n)=>{for(let i=0;i<n;i++)await A.click('#tabs [data-tab='+t+']');await A.waitForTimeout(150)};
  await seq('woche',3);r.w3=await A.$eval('.pdot[aria-pressed=true]',e=>e.innerText);await A.click('#tabs [data-tab=camp]');await seq('woche',1);r.w1=await A.$eval('.pdot[aria-pressed=true]',e=>e.innerText);
  await A.click('#tabs [data-tab=camp]');await seq('essen',2);r.e3=await A.$eval('[data-food][aria-pressed=true]',e=>e.innerText);
  await seq('camp',2);r.s2=await A.$eval('.pdot[aria-pressed=true]',e=>e.textContent);await A.click('#tabs [data-tab=woche]');await seq('camp',3);r.s3=await A.$eval('#app h1',e=>e.innerText);
  console.error(JSON.stringify(r,null,1),errs);
  const ok=!errs.length&&/heute/i.test(r.sky)&&/16\. November/.test(r.sky)&&/°/.test(r.sky)&&r.noRingFront&&/Offene Aufträge|erledigt/.test(r.today)&&/Ofengemüse/.test(r.today)&&!r.flip0&&r.flip1&&r.ls==='1'&&r.ring&&r.same&&!/Partner|Mittag zu zweit/.test(r.back)&&/Kinderarzt/.test(r.line.join())&&/jetzt/.test(r.line.join())&&r.cnt.length===3&&/Heute dran/.test(r.cnt[0])&&!r.backKey&&r.stillStart&&!r.btnBack&&r.b3open.length===3&&r.reload&&r.inCal>=28&&r.dotsRed===0&&r.tagH1==='Diese Woche'&&r.rows.length>=1&&r.hours.length>=5&&r.small.bottom<=r.small.tabs&&r.small2.bottom<=r.small2.tabs&&/morgen/i.test(r.eve.join())&&/Linsen-Dal/.test(r.eve.join())&&r.w3==='Rückblick'&&r.w1==='Tag und Woche'&&/Rezepte/.test(r.e3)&&/Kalender|November|Dezember/.test(r.s2)&&/Wichtig/.test(r.s3);
  if(!ok)console.error('fails:',Object.keys(r).filter(k=>r[k]===false));console.error(ok?'DASH OK':'DASH FAIL');await b.close();srv.close();process.exit(0)});
