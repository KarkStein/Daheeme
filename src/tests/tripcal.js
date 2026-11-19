srv.listen(8765,async()=>{
  // Ausflüge (Florian 16.11.2026): Gemerkt oben, 📅 an jedem Ziel trägt es in den Kalender (gemerkt oder Tipp)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  const d=n=>{const x=new Date(Date.now()+n*864e5);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const J={updated:d(0),region:'Testregion',items:[{name:'Flohmarkt am Platz',where:'stadt',cat:'markt',io:'draussen',date:d(2),time:'9:30',place:'Altstadt',link:'https://example.com/floh'}]};
  await A.route('**/ausflugtipps.json',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify(J)}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));const put=(pa,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  for(let i=1;i<=5;i++)await put('food/trip/t'+i,{name:'Ziel '+i,kind:'wandern',at:i});await A.waitForTimeout(400);
  await nav('ausflug|tt:ideen');
  r.order=await A.$$eval('#app .card h2',l=>l.map(x=>x.innerText));r.shown=await A.$$eval('.rgcard .mk',l=>l.length);r.all=await A.$$eval('.rgcard [data-tripst]',l=>l.length);
  await A.screenshot({path:out+'/ausfluege-gemerkt.png'});
  // gemerktes Ziel: Tag wählen -> Datum am Ausflug
  await A.click('[data-tripst=t2]');await A.waitForTimeout(300);await A.click('[data-tripst=t2]');await A.waitForTimeout(300);r.opts=await A.$$eval('#mbox [data-dpk]',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));await A.screenshot({path:out+'/ausfluege-tag.png'});
  await A.click('#mbox [data-dpk]');await A.waitForTimeout(400);r.tdate=db().trip.t2.date;
  // Tipp ohne Merken: Termin mit Ort, Link, Uhrzeit
  await A.click('.atip [data-atipopen]');await A.waitForTimeout(200);await A.click('[data-atipcal="0"]');await A.waitForTimeout(300);r.sugg=await A.$eval('#mbox [data-dpk]',x=>x.dataset.dpk);await A.click('#mbox [data-dpk]');await A.waitForTimeout(400);
  const T=Object.values(db().termin||{}).filter(x=>!x.ref);r.link=((db().termin||{}).a_t2||{}).ref||'';r.ter=T.filter(x=>!/^Großputz/.test(x.name)).map(x=>[x.name,x.date,x.time,x.place,x.link].join('|'));
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);r.row=await A.$$eval('.evlist li',l=>l.filter(x=>/Flohmarkt/.test(x.innerText)).map(x=>[!!x.querySelector('[data-route]'),!!x.querySelector('a[href*="example.com"]')].join()));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.link==='trip:t2'&&/Gemerkt/.test(r.order[0])&&r.shown===5&&r.all===5&&r.opts.length>=3&&/^\d{4}-\d\d-\d\d$/.test(r.tdate||'')&&r.sugg===d(2)&&r.ter.length===1&&r.ter[0]===['Flohmarkt am Platz',d(2),'09:30','Altstadt','https://example.com/floh'].join('|')&&r.row[0]==='true,true';
  console.error(ok?'TRIPCAL OK':'TRIPCAL FAIL');await b.close();srv.close();process.exit(0)});
