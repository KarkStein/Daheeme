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
  r.heute=await A.$$eval('.today .todayrow,.today .priohead,.today li',l=>l.map(x=>x.innerText.replace(/\n/g,' ')).join(' / '));
  const box=await (await A.$('.camp')).boundingBox();await A.mouse.click(box.x+box.width*0.72,box.y+box.height*0.45);await A.waitForTimeout(600);
  r.tagH1=await A.$eval('#app h1',e=>e.textContent);r.dash=await A.$$eval('.campback.dash .bcnt',l=>l.length);r.line=await A.$$eval('.campback.dash .bline li',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));r.rows=await A.$$eval('.tagcard',l=>l.map(c=>[...c.querySelectorAll('.trow')].map(x=>x.innerText.replace(/\n/g,' '))));
  r.folds=await A.$$eval('.tagfold .setsum h2',l=>l.map(x=>x.innerText));r.bodies=await A.$$eval('.tagfold .setbody',l=>l.length);
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/tag-und-woche.png',fullPage:true});
await A.addStyleTag({content:'#tabs{display:flex!important}'});
  await A.click('.campback.dash .bcal');await A.waitForTimeout(400);r.inCal=await A.$$eval('.cal [data-calday]',l=>l.length);await A.goBack();await A.waitForTimeout(500);r.backTag=await A.$eval('#app h1',e=>e.textContent);
  await A.click('#tabs [data-tab=camp]');await A.waitForTimeout(400);r.dotsRed=await A.$$eval('.camp circle[fill="#f25f5c"]',l=>l.length);
  await A.click('.spot[data-act=wxpop]');await A.waitForTimeout(300);r.hours=await A.$$eval('.wxhours li',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));await (await A.$('.wxpanel')).screenshot({path:out+'/wetter-heute.png'});
  // Mehrfachtipp
  const seq=async(t,n)=>{for(let i=0;i<n;i++)await A.click('#tabs [data-tab='+t+']');await A.waitForTimeout(150)};
  await seq('woche',3);r.w3=await A.$eval('.pdot[aria-pressed=true]',e=>e.innerText);await A.click('#tabs [data-tab=camp]');await seq('woche',1);r.w1=await A.$eval('.pdot[aria-pressed=true]',e=>e.innerText);
  await A.click('#tabs [data-tab=camp]');await seq('essen',2);r.e3=await A.$eval('[data-food][aria-pressed=true]',e=>e.innerText);
  await seq('camp',2);r.s2=await A.$eval('.pdot[aria-pressed=true]',e=>e.textContent);await A.click('#tabs [data-tab=woche]');await seq('camp',3);r.s3=await A.$eval('#app h1',e=>e.innerText);
  console.error(JSON.stringify(r,null,1),errs);
  const ok=!errs.length&&!/Partner|Mittag zu zweit/.test(r.heute)&&r.tagH1==='Diese Woche'&&r.dash>=3&&/Kinderarzt/.test(r.line.join())&&/Kita/.test(r.line.join())&&r.rows.length===1&&!r.rows[0].some(x=>/monatlich|jährlich/.test(x))&&r.inCal>=28&&r.backTag==='Diese Woche'&&r.dotsRed===0&&r.hours.length>=5&&r.w3==='Tag und Woche'&&r.w1==='Tag und Woche'&&/Rezepte/.test(r.e3)&&/Kalender|November|Dezember/.test(r.s2)&&/Wichtig/.test(r.s3);
  console.error(ok?'DASH OK':'DASH FAIL');await b.close();srv.close();process.exit(0)});
