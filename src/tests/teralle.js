srv.listen(8765,async()=>{
  // Termine alle N Wochen (Florian 21.11.2026: „im Kalender mit alle 2 Wochen“, frei wählbarer Rhythmus)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  await fetch('http://localhost:8765/haushalt/'+key+'/food/termin/gk.json',{method:'PUT',body:JSON.stringify({name:'Kiste raus',date:day(1),rep:'w',every:2,allday:true,who:'both',at:1})});
  await A.waitForTimeout(1500);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  r.days=await A.$$eval('.evlist .ev[data-teredit="gk"]',l=>l.length);
  r.cards=await A.$$eval('.card',l=>l.filter(x=>/Kiste raus/.test(x.innerText)).map(x=>x.querySelector('h3,h2')?x.querySelector('h3,h2').innerText:'').slice(0,3));
  await A.click('.evlist .ev[data-teredit="gk"] >> nth=0');await A.waitForSelector('#terform');
  r.every=await A.$$eval('[data-terevery]',l=>l.map(x=>x.innerText+':'+x.getAttribute('aria-pressed')));
  await A.$eval('[data-terevery="3"]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-terevery="3"]');await A.waitForTimeout(200);
  if(out)await A.screenshot({path:out+'/termin-alle-n-wochen.png'});
  await A.click('#terform button[type=submit]');await A.waitForTimeout(800);
  r.saved=get(['haushalt',key,'food','termin','gk']);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.days>=4&&r.days<=5&&r.every.length===6&&r.every[1]==='Alle 2 Wochen:true'&&r.saved&&r.saved.every===3&&r.saved.rep==='w';
  console.error(ok?'TERALLE OK':'TERALLE FAIL');await b.close();srv.close();process.exit(0)});
