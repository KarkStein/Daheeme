srv.listen(8765,async()=>{
  // Wetter-Symbol (Florian 16.11.2026): höchstens ein Symbol in der Grußzeile, nur wenn es passt; Tipp führt zu passenden Ausflügen
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const run=async(day,sd,shot)=>{const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);
    const n=new Date();await A.clock.setFixedTime(new Date(n.getFullYear(),n.getMonth(),n.getDate(),9,10));A.on('pageerror',e=>errs.push(e.message));
    const wx={current:{weather_code:2},hourly:{time:[],temperature_2m:[],precipitation_probability:[],weather_code:[],snow_depth:[]},daily:{time:[],temperature_2m_max:[],temperature_2m_min:[],precipitation_sum:[],weather_code:[],wind_speed_10m_max:[],snowfall_sum:[],sunshine_duration:[]}};
    for(let i=-6;i<8;i++){const d=new Date(n.getFullYear(),n.getMonth(),n.getDate()+i);const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const D=i===0?day:{t:9,w:10,r:0,c:2,s:0,sun:3};
      wx.daily.time.push(k);wx.daily.temperature_2m_max.push(D.t);wx.daily.temperature_2m_min.push(D.t-5);wx.daily.precipitation_sum.push(D.r);wx.daily.weather_code.push(D.c);wx.daily.wind_speed_10m_max.push(D.w);wx.daily.snowfall_sum.push(D.s);wx.daily.sunshine_duration.push(D.sun*3600);
      for(let h=0;h<24;h++){wx.hourly.time.push(k+'T'+String(h).padStart(2,'0')+':00');wx.hourly.temperature_2m.push(D.t-3);wx.hourly.precipitation_probability.push(5);wx.hourly.weather_code.push(D.c);wx.hourly.snow_depth.push(i===0?sd:0)}}
    await A.route('https://api.open-meteo.com/**',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify(wx)}));
    const J={updated:'x',items:[{name:'Drachenwiese Test',dauer:true,season:'immer',where:'stadt',cat:'natur',wx:['wind']},{name:'Rodelhang Test',dauer:true,season:'immer',where:'stadt',cat:'natur',wx:['schnee']}]};
    await A.route('**/ausflugtipps.json',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify(J)}));
    await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
    const key=/k=([^&]+)/.exec(A.url())[1];await fetch('http://localhost:8765/haushalt/'+key+'/food/wxplace.json',{method:'PUT',body:JSON.stringify({name:'Teststadt',lat:48.1,lon:11.6,gid:1})});await A.waitForTimeout(1200);
    const res={sym:await A.$eval('.starthead',e=>e.innerText.replace(/\n/g,' ')).catch(()=>''),btn:await A.$$eval('[data-wxfun]',l=>l.map(x=>x.dataset.wxfun).join())};
    if(shot)await (await A.$('.starthead')).screenshot({path:out+'/'+shot});
    if(res.btn){await A.click('.wxhead');await A.waitForTimeout(300);res.panel=await A.$eval('.wxpanel',e=>e.innerText.replace(/\n/g,' ')).catch(()=>'');
      await A.click('.starthead [data-wxfun]');await A.waitForTimeout(600);res.app=await A.$eval('#app',e=>e.innerText.replace(/\n/g,' '))}
    await c.close();return res};
  r.wind=await run({t:9,w:35,r:0,c:2,s:0,sun:5},0,'wetter-drachen.png');
  r.snow=await run({t:-2,w:10,r:0,c:3,s:0,sun:2},0.12);
  r.none=await run({t:9,w:10,r:0,c:2,s:0,sun:3},0);
  console.error(JSON.stringify(r).slice(0,1500),errs);
  const ok=!errs.length&&r.wind.btn==='drachen'&&/🪁/.test(r.wind.sym)&&/Drachen steigen/.test(r.wind.panel)&&/Drachenwiese Test/.test(r.wind.app)&&!/Rodelhang Test/.test(r.wind.app)&&r.snow.btn==='schlitten'&&/Rodelhang Test/.test(r.snow.app)&&r.none.btn==='';
  console.error(ok?'WXFUN OK':'WXFUN FAIL');await b.close();srv.close();process.exit(0)});
