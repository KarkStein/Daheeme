// Am Haus: Schritte im Projekt (Florian 19.11.2026: „B: Schritte in Abschnitten“): Karte mit Abschnitten, Als Nächstes, Vorlage, Baumarkt, Funde, Kalender, Heute für dich, Suche
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:740}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=async(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const fire=async at=>{await A.evaluate(at=>{const w=document.createElement("span");w.innerHTML="<button "+at+" id='zf'></button>";document.getElementById("app").appendChild(w.firstChild)},at);await A.click("#zf");await A.waitForTimeout(500)};
  const hold=async sel=>{const bx=await A.$eval(sel,e=>{e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});await A.mouse.move(bx.x,bx.y);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(300)};
  const hideToast=()=>A.evaluate(()=>{const t=document.getElementById('toast');if(t)t.hidden=true});
  const shot=n=>A.screenshot({path:(process.argv[2]||'/tmp')+'/'+n+'.png'});
  const D=new Date(),today=D.getFullYear()+"-"+String(D.getMonth()+1).padStart(2,"0")+"-"+String(D.getDate()).padStart(2,"0");
  const r={};
  await put('food/hproj/h1',{name:'Zimmertausch',emo:'🛏️',cat:'wohnen',room:'Schlafzimmer',state:'aktuell',budget:500,at:1});
  await put('food/fund/f1',{name:'Kinderbett 70×140',area:'haus',proj:'h1',kind:'moebel',st:'favorit',price:'120',at:2});await A.waitForTimeout(500);
  await nav('amhaus|');await fire('data-hproj="h1"');await A.waitForSelector('.hscard');
  // leer: Hinweis, Fund steht schon unter Besorgen, Budget steht unter Gemerkt
  r.fundRow=await A.$$eval('.hslist .gmg .hsname',l=>l.map(x=>x.textContent));
  r.order=await A.evaluate(()=>{const H=[...document.querySelectorAll('h2')].map(h=>h.textContent);const i=k=>H.findIndex(t=>t.includes(k));return i('Schritte')<i('Stand')&&i('Stand')<i('Gemerkt')&&i('Gemerkt')<i('Budget')});
  // Vorlage
  await A.click('[data-act=hstpl]');await A.waitForTimeout(900);await hideToast();
  let S0=Object.values(db().hstep||{});r.tpl=S0.length;r.tplBuy=S0.filter(s=>s.buy).map(s=>s.sec);r.secs=await A.$$eval('.hssech span',l=>l.map(x=>x.textContent));r.cnt=await A.$$eval('.hssech i',l=>l.map(x=>x.textContent.trim()));
  await A.click('[data-act=hstpl]');await A.waitForTimeout(600);await hideToast();r.tplOnce=Object.keys(db().hstep).length===r.tpl;
  r.next=await A.$$eval('.hsdash .btl b',l=>l.map(x=>x.textContent));
  // neuer Schritt mit Person, Tag heute, Platz 1 in Machen
  await A.click('[data-act=hsnew]');await A.waitForSelector('#mbox');r.labels=await A.$$eval('#mbox label>span, #mbox .fld>span',l=>l.map(x=>x.textContent));
  await A.fill('#mbox [data-ebf=name]','Gästezimmer ausräumen');await A.fill('#mbox [data-ebf=pos]','1');await A.click('#mbox [data-ebk=who][data-ebv=p0]');await A.fill('#mbox [data-ebf=date]',today);await A.click('#mbox button.primary');await A.waitForTimeout(900);
  let d=db();const nid=Object.keys(d.hstep).find(k=>d.hstep[k].name==='Gästezimmer ausräumen');r.newOrd=d.hstep[nid].ord;r.newSec=d.hstep[nid].sec;r.ords=Object.values(d.hstep).filter(s=>s.sec==='mach').map(s=>s.ord).sort().join('');
  r.ter=d.termin&&d.termin['s_'+nid]?[d.termin['s_'+nid].name,d.termin['s_'+nid].date===today,d.termin['s_'+nid].who,d.termin['s_'+nid].ref==='hstep:'+nid]:null;
  r.rowDay=await A.$eval('.hslist [data-hsedit="'+nid+'"]',e=>e.parentNode.innerText.replace(/\n+/g,' | '));
  await A.$eval('h1',e=>e.scrollIntoView({block:'start'}));await A.evaluate(()=>window.scrollBy(0,-60));await shot('schritte-projekt');await A.$eval('.hscard',e=>e.scrollIntoView({block:'start'}));await A.evaluate(()=>window.scrollBy(0,-70));await shot('schritte-projekt2');
  // Tipp = Bearbeiten, „Verknüpft mit“ zeigt den Termin
  await A.click('.hslist [data-hsedit="'+nid+'"]');await A.waitForSelector('#mbox');r.editVal=await A.$eval('#mbox [data-ebf=name]',e=>e.value);r.verk=await A.$eval('#mbox',e=>/verknüpft/i.test(e.innerText));await shot('schritte-bearbeiten');await A.click('#mbox [data-ebx]');await A.waitForTimeout(300);
  // Heute für dich
  await nav('woche|wp:0');await A.waitForTimeout(400);r.heute=await A.$$eval('.wkheute .hrow',l=>l.map(x=>x.innerText.replace(/\n+/g,' ')).filter(t=>/Gästezimmer/.test(t)));
  await A.$eval('.wkheute [data-hstick="'+nid+'"]',e=>e.scrollIntoView({block:'center'}));await shot('schritte-heute');
  await A.click('.wkheute [data-hstick="'+nid+'"]');await A.waitForTimeout(700);d=db();r.heuteDone=!!d.hstep[nid].done;r.terGone=!(d.termin&&d.termin['s_'+nid]);r.heuteStays=!!(await A.$('.wkheute .hdone [data-hstick="'+nid+'"]'));
  await A.click('.wkheute [data-hstick="'+nid+'"]');await A.waitForTimeout(700);r.undone=!db().hstep[nid].done;
  // Kalender: Termin da, lang drücken fragt
  await nav('woche|wp:3');await A.waitForTimeout(500);r.cal=await A.evaluate(()=>[...document.querySelectorAll('.evlist .ev, .evlist li')].some(x=>/Gästezimmer ausräumen/.test(x.textContent)));
  // Baumarkt: Schritt mit 🛒 steht dort, Haken hakt den Schritt ab und bietet den Betrag an
  const bid=Object.keys(d.hstep).find(k=>d.hstep[k].buy);
  await nav('listen|bl:baumarkt');await A.waitForTimeout(500);r.bau=await A.evaluate(()=>{const s=document.querySelector('#buy-baumarkt');return s?/Farbe, Folie/.test(s.innerText)&&/Zimmertausch/.test(s.innerText):false});
  await A.$eval('#buy-baumarkt',e=>e.scrollIntoView({block:'start'}));await shot('schritte-baumarkt');
  await A.click('#buy-baumarkt [data-hstick="'+bid+'"]');await A.waitForTimeout(700);r.bauDone=!!db().hstep[bid].done;r.toast=await A.$eval('#toast',e=>e.hidden?'':e.innerText.replace(/\n+/g,' '));
  await A.click('#toast button');await A.waitForTimeout(600);r.geld=await A.evaluate(()=>/Farbe, Folie/.test((document.querySelector('#app input[value*="Farbe"]')||{}).value||''));
  // Übersicht und Kachel
  await nav('amhaus|');await A.waitForTimeout(400);r.over=await A.$eval('.hsover',e=>e.innerText.replace(/\n+/g,' | '));await shot('schritte-uebersicht');
  await nav('amhaus|pf:wohnen');await A.waitForTimeout(400);r.tile=await A.$eval('[data-hproj=h1]',e=>e.innerText.replace(/\n+/g,' | '));
  // lang = ✕ Löschen mit Rückgängig
  await fire('data-hproj="h1"');await A.waitForSelector('.hscard');const n0=Object.keys(db().hstep).length;
  await hold('.hslist [data-hsedit="'+nid+'"]');r.lpx=!!(await A.$('.lpx'));r.noBox=!(await A.$('#mbox'));await A.click('.lpx');await A.waitForTimeout(600);r.del=Object.keys(db().hstep).length===n0-1;
  await A.click('#toast button');await A.waitForTimeout(600);r.undo=Object.keys(db().hstep).length===n0;
  // Abschnitt zuklappen
  await A.click('[data-tfold=hs_vor]');await A.waitForTimeout(300);r.fold=await A.$eval('[data-tfold=hs_vor]',e=>e.getAttribute('aria-expanded'));
  // Suche findet Schritte
  await fire('data-go="suche"');await A.fill('#app input[type=search], #app input[type=text]','Streichen');await A.waitForTimeout(500);r.such=await A.evaluate(()=>/Schritt im Projekt Zimmertausch/.test(document.getElementById('app').innerText));
  // Projekt löschen nimmt die Schritte mit
  await put('food/hproj/h2',{name:'Balkon',cat:'garten',state:'aktuell',at:5});await put('food/hstep/x1',{proj:'h2',name:'Kästen bepflanzen',sec:'mach',ord:0,at:1});await A.waitForTimeout(400);
  await nav('amhaus|');await fire('data-hproj="h2"');await A.waitForSelector('[data-act=hprojdel]');await A.click('[data-act=hprojdel]');await A.click('[data-act=hprojdel]');await A.waitForTimeout(700);r.dropped=!db().hstep.x1;
  console.log(JSON.stringify(r,null,1));
  const ok=r.fundRow.length===1&&r.order&&r.tpl===9&&r.tplBuy.join()==='bes'&&r.secs.length===4&&r.tplOnce&&r.next.length===2&&r.labels[0]==='Was'&&r.newOrd===0&&r.newSec==='mach'&&r.ords==='01234'&&r.ter&&r.ter[0]==='Gästezimmer ausräumen'&&r.ter[1]&&r.ter[2]==='p0'&&r.ter[3]&&/Heute/.test(r.rowDay)&&r.editVal==='Gästezimmer ausräumen'&&r.verk&&r.heute.length===1&&r.heuteDone&&r.terGone&&r.heuteStays&&r.undone&&r.cal&&r.bau&&r.bauDone&&/Preis/.test(r.toast)&&r.geld&&/Als Nächstes/.test(r.over)&&/von 10 Schritten/.test(r.tile)&&r.lpx&&r.noBox&&r.del&&r.undo&&r.fold==='false'&&r.such&&r.dropped&&!errs.length;
  console.log('errs',errs,ok?'SCHRITTE OK':'SCHRITTE FAIL');await b.close();srv.close();process.exit(ok?0:1)});
