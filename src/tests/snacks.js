srv.listen(8765,async()=>{
  // Einkaufsliste: Gruppe Snacks und neue Vorgabe-Reihenfolge (Florian 19.11.2026: „Drogerie vor Snacks“); eigene Reihenfolge bleibt
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const N=['Äpfel','Brot','Nudeln','Wasser','Geschenkpapier','Joghurt','Lachs','Tiefkühlpizza','Klopapier','Chips','Kekse','Schokolade','Gummibärchen','Hafermilch'];
  N.forEach((n,i)=>setAt(['haushalt',key,'food','shop','i'+i],{name:n,done:false,at:i+1}));
  await A.reload();await A.waitForTimeout(800);await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);
  const heads=()=>A.$$eval('.shopgrp',l=>l.map(x=>x.textContent.replace(/\s+/g,' ').trim()));
  r.h0=await heads();r.snack=await A.evaluate(()=>{const g=[...document.querySelectorAll('.shopgrp')].find(x=>/Snacks/.test(x.textContent));let t=[],n=g&&g.nextElementSibling;while(n&&!n.classList.contains('shopgrp')){t.push(n.textContent);n=n.nextElementSibling}return t.join('|')});
  // eigene Reihenfolge: Drogerie ganz nach oben
  setAt(['haushalt',key,'food','shopcat','drogerie'],{ord:-5});await A.reload();await A.waitForTimeout(900);r.h1=await heads();
  const want=['Obst','Brot','Vorrat','Getränke','Sonstiges','Kühl','Fleisch','Tiefkühl','Drogerie','Snacks'];
  const pos=r.h0.map(h=>want.findIndex(w=>h.includes(w)));
  const ok=!errs.length&&pos.length===10&&pos.every((p,i)=>p===i)&&/Chips/.test(r.snack)&&/Kekse/.test(r.snack)&&/Schokolade/.test(r.snack)&&/Gummi/.test(r.snack)&&!/Hafermilch/.test(r.snack)&&/Drogerie/.test(r.h1[0]);
  console.log(JSON.stringify({errs,r}));console.log(ok?'SNACKS OK':'SNACKS FAIL');await b.close();srv.close();process.exit(ok?0:1)});
