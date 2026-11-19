srv.listen(8765,async()=>{
  // Rückblick der Hausarbeit (Florian 19.11.2026: „B, Monatsbild, aber "was blieb oft liegen" und zugeklappte Wochen ermöglichen“, „Alles grundsätzlich zuklappbar machen“)
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const cfg=JSON.parse(JSON.stringify(get(['haushalt',key,'config'])));
  cfg.tasks=cfg.tasks.filter(t=>t.owner==='ho').concat([
    {id:'waeschex',name:'Wäsche',owner:'p1',freq:'week',times:2,pts:2},
    {id:'fensterx',name:'Fenster putzen',owner:'p0',freq:'week',times:1,pts:1},
    {id:'badx',name:'Bad putzen',owner:'p0',freq:'week',times:1,pts:1,subs:['Waschbecken','Dusche']}]);
  setAt(['haushalt',key,'config'],cfg);
  // Wochenschlüssel wie in der App (ISO-Woche)
  const iso=d=>{const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear();const w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return y+'-W'+String(w).padStart(2,'0')};
  const mon=n=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)-7*n);return d};
  for(const n of [1,2,3]){const m=mon(n),at=+m+864e5,wk=iso(m);
    const tk={waeschex__0:{by:'p1',at},waeschex__1:n===1?{by:'p0',at:at+3600e3,own:'p1'}:{by:'p1',at:at+7200e3},badx__0_s0:{by:'p1',at:at+5000,own:'p0'},badx__0_s1:{by:'p0',at:at+6000},badx__0:{by:'p0',at:at+6000}};
    setAt(['haushalt',key,'weeks',wk],{wk,ticks:tk})}
  await A.reload();await A.waitForTimeout(1200);
  await A.click('#tabs [data-tab=woche]');await A.waitForTimeout(300);
  r.pages=await A.$$eval('.pager .pdot',l=>l.map(x=>x.innerText.trim()));
  await A.click('.pager [data-wpage="4"]');await A.waitForTimeout(400);
  // Jahr: alle drei Wochen sicher im Zeitraum
  await A.click('[data-rbmode=jahr]');await A.waitForTimeout(300);
  r.heads=await A.$$eval('#app .foldh h2, #app .setsum h2',l=>l.map(x=>x.innerText.trim()));
  r.sum=await A.$eval('.rbsum',e=>e.innerText.replace(/\s+/g,' '));
  r.took=await A.$$eval('.rbtookc .rblist li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ')));
  r.liegen=await A.$eval('#app',e=>/Fenster putzen/.test([...e.querySelectorAll('.rblist')].map(x=>x.innerText).join(' ')));
  // Wochen zugeklappt, einzeln aufklappbar
  r.wkClosed=await A.$$eval('.rbwkh',l=>l.length&&l.every(x=>x.getAttribute('aria-expanded')==='false'));
  r.wkN=await A.$$eval('.rbwkh',l=>l.length);
  if(out){await A.evaluate(()=>window.scrollTo(0,0));await A.screenshot({path:out+'/rueckblick-oben.png'})}
  const wk1=await A.$$('.rbwkh');await wk1[1].click();await A.waitForTimeout(300);
  r.body=await A.$eval('.rbwkb',e=>e.innerText.replace(/\s+/g,' '));
  r.oneOpen=await A.$$eval('.rbwkh[aria-expanded=true]',l=>l.length);
  if(out){const e=await A.$('.rbwkb');await e.scrollIntoViewIfNeeded();await A.waitForTimeout(200);await A.screenshot({path:out+'/rueckblick-woche.png'})}
  // Karten zuklappbar
  await A.click('.foldh[data-tfold=f_rbtook]');await A.waitForTimeout(300);r.tookFold=!(await A.$('.rbtookc .rblist'));
  // Monat ist Vorgabe, blättern zurück geht
  await A.click('[data-rbmode=monat]');await A.waitForTimeout(200);if(out)await A.screenshot({path:out+'/rueckblick-monat.png'});await A.click('[data-rboff="-1"]');await A.waitForTimeout(200);r.lbl=await A.$eval('.rblbl',e=>e.innerText);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pages.join()==='Tag und Woche,Wer macht was,Rückblick'&&/Zusammen geschafft/.test(r.heads.join())&&/Füreinander/.test(r.heads.join())&&/Was blieb oft liegen/.test(r.heads.join())&&/Vergangene Wochen/.test(r.heads.join())
    &&/von/.test(r.sum)&&r.took.length===4&&r.took.some(x=>/Wäsche/.test(x)&&/für /.test(x))&&r.took.some(x=>/Bad putzen: Waschbecken/.test(x))&&r.liegen&&r.wkClosed&&r.wkN===4
    &&/für /.test(r.body)&&/Offen geblieben: Fenster putzen/.test(r.body)&&r.oneOpen===1&&r.tookFold&&r.lbl.length>2;
  console.error(ok?'RUECKBLICK OK':'RUECKBLICK FAIL');await b.close();srv.close();process.exit(0)});
