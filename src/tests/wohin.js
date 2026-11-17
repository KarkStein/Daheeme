srv.listen(8765,async()=>{
  // Rezept speichern mit „Wohin?“ (Florian 16.11.2026): Übernehmen und 📖＋ fragen nach Kochbuch und Tags, beides vorgewählt
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const I=(name,cat,ing)=>({name,cat,source:'test.de',link:'https://example.org/'+encodeURIComponent(name),ing,note:'Notiz'});
  const ideas={updated:'2026-11-14',items:[I('Kürbissuppe mit Ingwer','saisonal',['1 Hokkaido-Kürbis','1 Stück Ingwer','400 ml Kokosmilch']),I('Linsen-Dal','gesund',['250 g rote Linsen','1 Zwiebel','400 ml Kokosmilch'])]};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/ideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(ideas)}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])||{}));
  await A.evaluate(k=>fetch('/haushalt/'+k+'/food/book/bsup.json',{method:'PUT',body:JSON.stringify({name:'Suppen',at:1})}),key);await A.waitForTimeout(300);
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}await A.waitForTimeout(300);await A.click('[data-act=ideastog]');await A.waitForTimeout(200);
  // 1) Tagesrezept übernehmen: Kochbuch „Suppen“ vorgewählt (Name), Tags vorgewählt, einen abwählen
  await A.click('li.tiprow:has-text("Kürbissuppe") [data-idea]');await A.waitForTimeout(300);
  const r={};r.box=!!(await A.$('#mbox [data-ebk=book]'));r.pre=await A.$eval('#mbox [data-ebk=book][data-ebv=bsup]',x=>x.getAttribute('aria-pressed'))==='true';
  r.tags=await A.$$eval('#mbox [data-ebm=tags]',l=>l.length)>=2&&await A.$$eval('#mbox [data-ebm=tags][aria-pressed=true]',l=>l.length)===await A.$$eval('#mbox [data-ebm=tags]',l=>l.length);
  if(out)await A.screenshot({path:out+'/rezept-wohin.png'});
  const off=await A.$eval('#mbox [data-ebm=tags]',x=>x.dataset.ebv);await A.click('#mbox [data-ebm=tags]');await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  let d=db(),rs=Object.values((d.food||{}).rec||{});const k1=rs.find(x=>/Kürbissuppe/.test(x.name));
  r.saved=!!k1&&k1.book==='bsup'&&Array.isArray(k1.tags)&&!k1.tags.includes(off)&&(k1.tagsOff||[]).includes(off);
  r.toast=await A.$eval('#toast',x=>/Suppen/.test(x.innerText));
  // 2) Neues Kochbuch direkt im Fenster
  await A.click('li.tiprow:has-text("Linsen-Dal") [data-idea]');await A.waitForTimeout(300);await A.fill('#mbox [data-ebf=nbook]','Eintöpfe');await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  d=db();const bk=Object.entries(d.food.book||{}).find(([k,v])=>v&&v.name==='Eintöpfe');const k2=Object.values(d.food.rec).find(x=>x.name==='Linsen-Dal');r.newbook=!!bk&&!!k2&&k2.book===bk[0];
  // 3) Abbrechen speichert nichts; 📖＋ im Wochenplan verknüpft den Tag mit dem neuen Rezept
  await A.click('[data-food=heute]');await A.click('[data-food=plan]');await A.waitForTimeout(200);await A.click('[data-meal=d1]');await A.fill('#mealinput','Spaghetti Bolognese');await A.click('[data-act=mealsave]');await A.waitForTimeout(400);
  const n0=Object.keys(db().food.rec).length;await A.click('[data-planrec=d1]');await A.waitForTimeout(300);await A.click('#mbox [data-ebx]');await A.waitForTimeout(300);r.cancel=Object.keys(db().food.rec).length===n0;
  await A.click('[data-planrec=d1]');await A.waitForTimeout(300);await A.click('#mbox button[type=submit]');await A.waitForTimeout(500);
  d=db();const wk=Object.keys(d.food.plan||{}).find(w=>d.food.plan[w].d1&&/Bolognese/.test(d.food.plan[w].d1.text||''));const rid=wk&&d.food.plan[wk].d1.rec;r.plan=!!rid&&!!d.food.rec[rid]&&d.food.rec[rid].name==='Spaghetti Bolognese';
  console.error(JSON.stringify(r),errs);
  console.error(!errs.length&&Object.values(r).every(Boolean)?'WOHIN OK':'WOHIN FAIL');await b.close();srv.close();process.exit(0)});
