srv.listen(8765,async()=>{
  // Müllkalender AWM (Florian 21.11.2026): eigene Quelle je Tonne, nicht löschbar
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  await put('ext/muell',{at:1,n:3,items:[{date:day(1),type:'papier'},{date:day(3),type:'rest'},{date:day(3),type:'bio',moved:true}]});
  await A.waitForTimeout(2500);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('woche|wp:3');await A.click('[data-calview=liste]');await A.waitForTimeout(300);
  const rows=()=>A.$$eval('.evlist .ev',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  r.r1=(await rows()).filter(x=>/Restmüll|Biotonne|Papiertonne/.test(x));
  r.tag=await A.$$eval('.evlist .ev',l=>l.filter(x=>/Papiertonne/.test(x.innerText)).map(x=>x.tagName+'|'+(x.dataset.caled||'')+(x.dataset.teredit||'')));
  if(out){await A.evaluate(()=>{const e=[...document.querySelectorAll('.evlist .ev')].find(x=>/Papiertonne/.test(x.innerText));e&&e.scrollIntoView({block:'center'})});await A.screenshot({path:out+'/muell-kalender.png'})}
  await A.click('[data-act=calfilt]');await A.waitForTimeout(300);r.chips=await A.$$eval('[data-caloff^=m_]',l=>l.map(x=>x.innerText));
  if(out)await A.screenshot({path:out+'/muell-filter.png'});
  await A.click('[data-caloff=m_papier]');await A.waitForTimeout(300);r.r2=(await rows()).filter(x=>/Restmüll|Biotonne|Papiertonne/.test(x));
  await A.click('[data-caloff=m_papier]');await A.waitForTimeout(200);await A.click('[data-act=calfilt]').catch(()=>{});
  await A.click('[data-calview=monat]');await A.waitForTimeout(300);if(out)await A.screenshot({path:out+'/muell-monat.png'});
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.r1.length===3&&r.r1.some(x=>/Papiertonne/.test(x))&&r.tag.length&&r.tag.every(t=>t==='SPAN|')&&r.chips.length===3&&r.r2.length===2&&!r.r2.some(x=>/Papier/.test(x));
  console.error(ok?'MUELL OK':'MUELL FAIL');await b.close();srv.close();process.exit(0)});
