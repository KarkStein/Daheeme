srv.listen(8765,async()=>{
  // Grußzeile mit Wetter (Florian 16.11.2026): Gruß nach Tageszeit, Wetter für den Rest des Tages, ab 19 Uhr morgen; Tipp öffnet das Wetter
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const run=async(hour,vw,shot)=>{const c=await b.newContext({viewport:{width:vw,height:800},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);
    const n=new Date();await A.clock.setFixedTime(new Date(n.getFullYear(),n.getMonth(),n.getDate(),hour,10));A.on('pageerror',e=>errs.push(e.message));
    const wx={current:{weather_code:2},hourly:{time:[],temperature_2m:[],precipitation_probability:[],weather_code:[]},daily:{time:[],temperature_2m_max:[],precipitation_sum:[],weather_code:[],wind_speed_10m_max:[],snowfall_sum:[]}};
    for(let i=-1;i<8;i++){const d=new Date(n.getFullYear(),n.getMonth(),n.getDate()+i);const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');wx.daily.time.push(k);wx.daily.temperature_2m_max.push(9);wx.daily.precipitation_sum.push(0);wx.daily.weather_code.push(i===1?71:2);wx.daily.wind_speed_10m_max.push(10);wx.daily.snowfall_sum.push(0);
      for(let h=0;h<24;h++){wx.hourly.time.push(k+'T'+String(h).padStart(2,'0')+':00');wx.hourly.temperature_2m.push(i===1?-1+h/6:3+h/4);wx.hourly.precipitation_probability.push(i===0&&h>=15?80:5);wx.hourly.weather_code.push(i===0&&h>=15?61:i===1&&h>=10?71:2)}}
    await A.route('https://api.open-meteo.com/**',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify(wx)}));
    await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
    const key=/k=([^&]+)/.exec(A.url())[1];await fetch('http://localhost:8765/haushalt/'+key+'/food/wxplace.json',{method:'PUT',body:JSON.stringify({name:'Teststadt',lat:48.1,lon:11.6,gid:1})});await A.waitForTimeout(1200);
    const t=await A.$eval('.starthead',e=>e.innerText.replace(/\n/g,' ')).catch(()=>'');const lines=await A.$eval('.starthead',e=>Math.round(e.getBoundingClientRect().height)).catch(()=>0);
    if(shot)await A.screenshot({path:out+'/'+shot});
    let pop=false;if(await A.$('.wxhead')){await A.click('.wxhead');await A.waitForTimeout(300);pop=!!(await A.$('.wxpanel'))}
    await c.close();return {t,lines,pop}};
  r.morning=await run(8,390,'gruss-wetter-morgen.png');r.even=await run(20,390,'gruss-wetter-abend.png');r.small=await run(8,360);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Guten Morgen/.test(r.morning.t)&&/Regen ab 15 Uhr/.test(r.morning.t)&&/°/.test(r.morning.t)&&r.morning.pop&&r.morning.lines<60&&/Guten Abend/.test(r.even.t)&&/Morgen:/.test(r.even.t)&&/Schnee ab 10 Uhr/.test(r.even.t)&&r.small.lines<60&&/Guten Morgen/.test(r.small.t);
  console.error(ok?'GREETWX OK':'GREETWX FAIL');await b.close();srv.close();process.exit(0)});
