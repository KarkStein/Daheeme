srv.listen(8765,async()=>{
  // Motiv und Bildstil: Standard Haus am Meer, umschalten unter Einstellungen › Aussehen, Stadt hat dieselben Sprünge
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  const scene=()=>A.evaluate(()=>{const s=document.querySelector('.camp svg');return {lab:s.getAttribute('aria-label'),aq:!!s.querySelector('[filter="url(#sAq)"]'),pat:!!s.querySelector('#pGran'),spots:[...document.querySelectorAll('.camp .spot')].map(x=>x.dataset.go||x.dataset.nav||x.dataset.act).sort().join(',')}});
  await nav('camp|');const s0=await scene();
  await A.click('[data-go=settings]');await A.waitForTimeout(300);if(!await A.$('[data-motiv-set]'))await A.click('[data-setsum=aussehen]');await A.click('[data-motiv-set=stadt]');await nav('camp|');const s1=await scene();
  await A.click('[data-go=settings]');await A.waitForTimeout(300);if(!await A.$('[data-motiv-set]'))await A.click('[data-setsum=aussehen]');await A.click('[data-stil-set=aquarell]');await nav('camp|');const s2=await scene();
  await A.click('[data-go=settings]');await A.waitForTimeout(300);if(!await A.$('[data-motiv-set]'))await A.click('[data-setsum=aussehen]');await A.click('[data-motiv-set=meer]');await A.click('[data-stil-set=fein]');await nav('camp|');const s3=await scene();
  await A.click('.camp .spot[data-go=reisen]');await A.waitForTimeout(300);const reisen=await A.evaluate(()=>document.body.innerText.includes('Urlaube'));
  const r={def:s0.lab.includes('am Meer')&&!s0.aq&&!s0.pat,stadt:s1.lab.includes('Stadt'),same:s0.spots.replace(/ausgaben,/,'')===s1.spots,aq:s2.aq,fein:s3.pat&&s3.lab.includes('am Meer'),reisen};
  console.error(JSON.stringify(r),s0.spots,s1.spots,errs);
  console.error(!errs.length&&Object.values(r).every(Boolean)?'MOTIV OK':'MOTIV FAIL');await b.close();srv.close();process.exit(0)});
