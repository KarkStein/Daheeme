srv.listen(8765,async()=>{
  // Minispiele (Florian 19.11.2026: „2, 4, 5“): Aufräum-Flut, Flaschenpost für zwei, Garten der Woche
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const txt=s=>A.$eval(s,e=>e.innerText.replace(/\s+/g,' ')).catch(()=>'');
  // Seite unter Kind
  await nav('minis|');r.pager=await txt('.pager');r.tiles=await A.$$eval('.minitile',l=>l.length);
  // Garten: einen Haken setzen
  r.g0=/Jeder Haken/.test(await txt('.minis'));
  await nav('woche|');await A.click('#app [data-task][data-slot] >> nth=0');await A.waitForTimeout(600);
  await nav('minis|');await A.click('[data-mini=garten]');await A.waitForTimeout(300);r.g1=await txt('.gardenn');
  if(out){await A.screenshot({path:out+'/minispiele-garten.png'})}
  await nav('camp|');r.gsvg=await A.$$eval('.medfront .garden path',l=>l.length);
  // Flaschenpost
  await nav('minis|');await A.click('[data-mini=flasche]');await A.waitForTimeout(300);r.f0=await txt('.flst');
  await A.fill('#flaschein','Der Sonnenuntergang');await A.click('[data-act=flaschesave]');await A.waitForTimeout(600);r.f1=await txt('.flasche');
  const d=new Date(),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  await put('food/flasche/'+k+'/p1',{t:'Das Lachen beim Frühstück',at:Date.now()});await A.waitForTimeout(2500);r.f2=await txt('.flasche');
  if(out){await A.screenshot({path:out+'/minispiele-flasche.png'})}
  await nav('privat|pv:briefe');r.arch=await txt('.flarch');
  // Aufräum-Flut ist wieder weg (Florian 19.11.2026)
  await nav('minis|');r.noFlut=!(await A.$('[data-mini=flut]'));
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/Minispiele/.test(r.pager)&&r.tiles===3&&r.noFlut&&r.g0&&/^1 Pflanze/.test(r.g1)&&r.gsvg>=1
    &&/⏳/.test(r.f0)&&/Deine Antwort/.test(r.f1)&&/⏳/.test(r.f1)&&/Sonnenuntergang/.test(r.f2)&&/Frühstück/.test(r.f2)&&/Sonnenuntergang/.test(r.arch);
  console.error(ok?'MINISPIELE OK':'MINISPIELE FAIL');await b.close();srv.close();process.exit(0)});
