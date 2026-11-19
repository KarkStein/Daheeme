srv.listen(8765,async()=>{
  // Demnächst ab dem gewählten Tag (Florian 19.11.2026: „Ich klicke am 10.11 auf den 6.1. dann soll demnächst auch ab da Anzeigen“)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  await put('termin/t1',{name:'Bald',date:day(3),at:1});
  await put('termin/t2',{name:'Später A',date:day(50),at:2});
  await put('termin/t3',{name:'Später B',date:day(55),at:3});
  await A.waitForTimeout(3000);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  await nav('woche|wp:3');await A.click('[data-calview=monat]');await A.waitForTimeout(300);
  const up=()=>A.$eval('.calup',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>'');
  r.u0=await up();
  // zum Monat des Tages +48 blättern und auf ihn tippen
  const D=day(48),[y,m]=D.split('-').map(Number);for(let i=0;i<4;i++){const t=await A.$eval('.cal [data-calday]:not(.out)',e=>e.dataset.calday);if(t.slice(0,7)===D.slice(0,7))break;await A.click('[data-calm="1"]');await A.waitForTimeout(200)}
  await A.click(`.cal [data-calday="${D}"]`);await A.waitForTimeout(300);r.u1=await up();
  if(out){const e=await A.$('.calup');await e.scrollIntoViewIfNeeded();await A.waitForTimeout(200);await A.screenshot({path:out+'/kalender-demnaechst-ab-tag.png'})}
  await A.click('.calup [data-calday]');await A.waitForTimeout(300);r.u2=await up();r.mon=await A.$eval('.cal [data-calday].today',()=>1).catch(()=>0);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/^Demnächst [^a]/.test(r.u0)&&/Bald/.test(r.u0)&&!/Später/.test(r.u0)&&/^Demnächst ab \d+\. \S+ ↺ Ab heute/.test(r.u1)&&/Später A/.test(r.u1)&&/Später B/.test(r.u1)&&!/Bald/.test(r.u1)&&/^Demnächst [^a]/.test(r.u2)&&/Bald/.test(r.u2)&&r.mon===1;
  console.error(ok?'CALUP OK':'CALUP FAIL');await b.close();srv.close();process.exit(0)});
