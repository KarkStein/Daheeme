srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);{const n=new Date();await A.clock.setFixedTime(new Date(n.getFullYear(),n.getMonth(),n.getDate(),10,20))}A.on('pageerror',e=>errs.push(e.message));
  const wx={current:{weather_code:2},hourly:{time:[],temperature_2m:[],precipitation_probability:[],weather_code:[]},daily:{time:[],temperature_2m_max:[],precipitation_sum:[],weather_code:[],wind_speed_10m_max:[],snowfall_sum:[]}};
  for(let i=-1;i<8;i++){const d=new Date(Date.now()+i*864e5);const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');wx.daily.time.push(k);wx.daily.temperature_2m_max.push(5);wx.daily.precipitation_sum.push(0);wx.daily.weather_code.push(i===2?73:1);wx.daily.wind_speed_10m_max.push(i===3?35:10);wx.daily.snowfall_sum.push(i===2?3:0);for(let h=0;h<24;h++){wx.hourly.time.push(k+'T'+String(h).padStart(2,'0')+':00');wx.hourly.temperature_2m.push(4);wx.hourly.precipitation_probability.push(10);wx.hourly.weather_code.push(1)}}
  await A.route('https://api.open-meteo.com/**',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify(wx)}));
  await A.route('https://geocoding-api.open-meteo.com/**',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify({results:[{id:1234567,name:'Teststadt',latitude:48.1,longitude:11.6}]})}));
  await A.route('**/ausflugtipps.json',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify({updated:'x',items:[{name:'Rodelhügel',cat:'natur',dauer:true,wx:['schnee']},{name:'Drachenwiese',cat:'natur',wx:['wind'],date:wx.daily.time[3]}]})}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await put('food/wxplace',{name:'Teststadt',lat:48.1,lon:11.6});await A.waitForTimeout(500);
  await nav('camp|sp:tag');await A.waitForTimeout(800);r.gid=(db().wxplace||{}).gid;await nav('camp|sp:tag');
  r.dash=await A.$$eval('.campback.dash a.wxlink',l=>l.map(a=>a.href));
  await nav('camp|');await A.click('.skyl');await A.waitForTimeout(400);await (await A.$('.wxpanel')).screenshot({path:out+'/wetter-link.png'});r.panel=await A.$$eval('.wxpanel a.wxlink',l=>l.map(a=>a.href));await A.waitForTimeout(500);r.gid=(db().wxplace||{}).gid;
  await put('food/pref/wxlink','https://wetter.example/ort');await A.waitForTimeout(400);r.own=await A.$$eval('.wxpanel a.wxlink',l=>l.map(a=>a.href));
  await nav('ausflug|tt:ideen');r.atip=await A.$eval('.atip',e=>e.innerText.replace(/\n/g,' '));await A.click('[data-atipwx=schnee]');await A.waitForTimeout(200);await A.click('[data-tfold^=fix_]');await A.waitForTimeout(200);r.snow=await A.$$eval('#app .card',l=>l.map(e=>e.innerText.replace(/\n/g,' ')).join(' '));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.gid===1234567&&r.panel.length>=2&&r.panel.every(h=>/^https:\/\/kachelmannwetter\.com\/de\/wetter\/1234567-teststadt$/.test(h))&&r.own.every(h=>h==='https://wetter.example/ort')&&/Schlitten/.test(r.atip)&&/Drachen/.test(r.atip)&&/Rodelhügel/.test(r.snow)&&!/Drachenwiese/.test(r.snow);
  console.error(ok?'WXLINK OK':'WXLINK FAIL');await b.close();srv.close();process.exit(0)});
