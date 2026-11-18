// Doppelring im Dashboard (Florian 18.11.2026): außen alle meine Wochen-Aufgaben der Woche (Wechsel bei mir, feste, gemeinsame), innen nur heute
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:400,height:860}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];await A.waitForTimeout(500);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const lab=async()=>{await nav('start|');await nav('woche|wp:0');return A.$eval('.bring2',e=>e.getAttribute('aria-label'))};
  const r={};r.before=await lab();
  // feste Aufgabe von p0 (balkon, 1x pro Woche) abhaken: äußerer Ring zählt sie mit
  const d=new Date(),mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));
  const wk=await A.evaluate(()=>{const d=new Date();const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear();const w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return y+'-W'+String(w).padStart(2,'0')});
  await fetch('http://localhost:8765/haushalt/'+key+'/weeks/'+wk+'/ticks/balkon__0.json',{method:'PUT',body:JSON.stringify({by:'p0',at:Date.now()})});await A.waitForTimeout(500);
  r.after=await lab();
  const num=s=>{const m=/Woche (\d+) von (\d+)/.exec(s||'');return m?[+m[1],+m[2]]:null};
  const a=num(r.before),z=num(r.after);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&a&&z&&a[0]===0&&z[0]===1&&a[1]===z[1]&&a[1]>1&&/Wochen-Aufgaben/.test(r.after);
  console.error(ok?'WOCHENRING OK':'WOCHENRING FAIL');await b.close();srv.close();process.exit(0)});
