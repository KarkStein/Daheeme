srv.listen(8765,async()=>{
  // Einklappen in der ganzen App (Florian 17.11.2026, „So bauen wie im Dokument“): Karten mit Klapp-Kopf, Vorgaben offen/zu, Stand je Gerät, Sprung klappt auf
  globalThis.FOLD_ASIS=1;
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  await put('play/s1',{name:'Kneten',sec:'zuhause',at:1});await put('music/m1',{name:'Lied vom Regen',art:'lied',at:2});
  await put('kita/k1',{name:'Laternenfest',sec:'termine',date:day(5),at:3});await put('kita/k2',{name:'Sommerfest',sec:'termine',date:day(-30),at:4});
  await put('kita/k3',{name:'Wechselhose',sec:'tasche',at:5});await put('kita/k4',{name:'Hausschuhe',sec:'tasche',done:true,at:6});
  await put('prio/p1',{name:'Pass verlängern',from:'frei',due:day(9),at:7});await put('prio/p2',{name:'Keller sortieren',from:'frei',at:8});
  await put('money/a1',{name:'Bäcker',amt:450,date:day(0),by:'p0',split:'half',cat:'essen',at:9});await put('split/x1',{name:'Hütte',link:'https://example.org/g'});
  await put('idea/i1',{name:'Bilderbuch',cat:'geschenk',at:10});await put('trip/t1',{name:'Wildpark',done:true,at:11});
  await A.waitForTimeout(3200);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const st=()=>A.$$eval('#app .foldh',l=>l.map(x=>x.dataset.tfold+(x.getAttribute('aria-expanded')==='true'?'+':'-')));
  const all={};const see=async v=>{await nav(v);(await st()).forEach(x=>all[x.slice(0,-1)]=x.slice(-1))};
  await see('projekte|');await see('recherchen|');await see('spiel|');await see('musik|');await see('ausflug|');await see('geschenke|');
  await see('kita|');r.kita=await st();await see('kita|ks:tasche');r.bag=await st();await see('kita|ks:essen');
  await see('privat|');r.partner=await st();await see('ausgaben|');r.geld=await st();await see('wichtig|');r.wichtig=await st();await see('woche|wp:1');await see('essen|ft:plan');
  r.all=Object.keys(all).sort().map(k=>k+all[k]).join(' ');
  // Zugeklappt bleibt nur der Kopf; Tipp klappt auf, Stand bleibt nach dem Neuladen
  await nav('wichtig|');r.nod0=/Keller sortieren/.test(await A.$eval('#app',e=>e.innerText));if(out)await A.screenshot({path:out+'/einklappen-wichtig.png',fullPage:true});
  await A.click('[data-tfold=f_wnod]');await A.waitForTimeout(300);r.nod1=/Keller sortieren/.test(await A.$eval('#app',e=>e.innerText));
  await A.click('[data-tfold=f_wlater]');await A.waitForTimeout(300);r.later=/Pass verlängern/.test(await A.$eval('#app',e=>e.innerText));
  await A.reload();await A.waitForTimeout(900);r.keep=(await st()).filter(x=>/f_wnod|f_wlater/.test(x)).sort().join();
  // Knopf rechts im Kopf bleibt auch zugeklappt da (＋ Merken)
  await nav('spiel|');await A.click('[data-tfold=f_play]');await A.waitForTimeout(300);r.playClosed=!(await A.$('.playcard .mk'))&&!!(await A.$('.playcard [data-act=playnew]'));if(out)await A.screenshot({path:out+'/einklappen-spielen.png'});
  // Sprung von woanders klappt das Ziel wieder auf
  await nav('camp|');await nav('spiel|ps:zuhause');r.jump=!!(await A.$('.playcard .mk'));
  await nav('camp|');await nav('privat|pv:kontakte');r.kontakt=(await st()).includes('f_kontakt+');
  console.error(JSON.stringify(r),errs);
  const want='f_glast+ f_gopen+ f_gsplit- f_kbag+ f_kda- f_kmimp- f_kontakt- f_kpast- f_kup+ f_lunch+ f_mus+ f_play+ f_rfix- f_rg+ f_rwish+ f_samm+ f_sug- f_wbulk- f_wlater+ f_wnod-'.split(' ').sort().join(' ');
  const ok=!errs.length&&r.all===want&&!r.nod0&&r.nod1&&!r.later&&r.keep==='f_wlater-,f_wnod+'&&r.playClosed&&r.jump&&r.kontakt;
  if(!ok)console.error('soll',want);
  console.error(ok?'EINKLAPPEN OK':'EINKLAPPEN FAIL');await b.close();srv.close();process.exit(0)});
