srv.listen(8765,async()=>{
  // Rezept von einem Kochbuch ins andere (Florian 16.11.2026): über Bearbeiten › Kochbuch und über „📚 Anderes Kochbuch“, hin und zurück
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin',locale:'de-DE'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));
  await A.route('**/ideen.json*',rt=>rt.fulfill({contentType:'application/json',body:JSON.stringify({items:[]})}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const bookOf=id=>(get(['haushalt',key,'food','rec',id])||{}).book||'main';
  setAt(['haushalt',key,'food','book','b1'],{name:'Omas Küche',at:1});setAt(['haushalt',key,'food','book','b2'],{name:'Sommer',at:2});
  setAt(['haushalt',key,'food','rec','r1'],{name:'Linsensuppe',ing:'250 g Linsen',note:'Kochen.',at:1});setAt(['haushalt',key,'food','rec','r2'],{name:'Dampfnudeln',ing:'500 g Mehl',at:2,book:'b1'});
  await A.reload();await A.waitForTimeout(800);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(300)};
  const shown=()=>A.$$eval('[data-rec]',l=>l.map(x=>x.innerText.split('\n')[0]));
  await nav('essen|ft:rezepte');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}
  // 1) Bearbeiten › Kochbuch: Linsensuppe von Unsere Rezepte nach Omas Küche
  await A.click('[data-rec=r1]');await A.waitForTimeout(150);await A.click('[data-recedit=r1]');await A.waitForTimeout(200);
  await A.click('[data-recbook=b1]');await A.waitForTimeout(150);r.pressed=await A.$eval('[data-recbook=b1]',e=>e.getAttribute('aria-pressed'));
  await A.click('[data-act=recsave]');await A.waitForTimeout(400);r.e1=bookOf('r1');r.e1shown=await shown();
  await A.click('[data-book=main]');await A.waitForTimeout(200);r.e1main=await shown();
  // 2) zurück über Bearbeiten nach Unsere Rezepte
  await A.click('[data-book=b1]');await A.waitForTimeout(200);await A.click('[data-rec=r1]').catch(()=>{});await A.waitForTimeout(150);
  if(!(await A.$('[data-recedit=r1]')))await A.click('[data-rec=r1]');await A.click('[data-recedit=r1]');await A.waitForTimeout(200);await A.click('[data-recbook=main]');await A.click('[data-act=recsave]');await A.waitForTimeout(400);r.e2=bookOf('r1');
  // 3) Knopf „📚 Anderes Kochbuch“: Dampfnudeln von Omas Küche nach Sommer
  await A.click('[data-book=b1]');await A.waitForTimeout(200);await A.click('[data-rec=r2]');await A.waitForTimeout(150);await A.click('[data-recbookmv=r2]');await A.waitForTimeout(200);
  r.opts=await A.$$eval('#mbox [data-ebk=book]',l=>l.map(x=>x.innerText));await A.screenshot({path:out+'/kochbuch-verschieben.png'});
  await A.click('#mbox [data-ebk=book][data-ebv=b2]');await A.click('#mbox [type=submit]');await A.waitForTimeout(400);r.e3=bookOf('r2');r.e3left=await shown();
  await A.click('#toast .toastbtn');await A.waitForTimeout(300);r.e3new=await shown();
  // 4) ↪ Verschieben im Bearbeiten-Formular bietet die Kochbücher an
  if(!(await A.$('[data-recedit=r2]')))await A.click('[data-rec=r2]');await A.click('[data-recedit=r2]');await A.waitForTimeout(200);await A.click('[data-move="rec|r2"]');await A.waitForTimeout(200);
  r.mvopts=await A.$$eval('#mbox [data-ebk=to]',l=>l.map(x=>x.dataset.ebv));await A.click('#mbox [data-ebv="book:b1"]');await A.click('#mbox [type=submit]');await A.waitForTimeout(400);
  r.e4=bookOf('r2');r.e4n=Object.keys(get(['haushalt',key,'food','rec'])||{}).length;r.e4draft=!!(await A.$('#rec-name'));
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&r.pressed==='true'&&r.e1==='b1'&&r.e1shown.includes('Linsensuppe')&&!r.e1main.includes('Linsensuppe')&&r.e2==='main'
    &&r.opts.length===2&&r.opts.some(x=>/Sommer/.test(x))&&!r.opts.some(x=>/Omas/.test(x))&&r.e3==='b2'&&!r.e3left.includes('Dampfnudeln')&&r.e3new.includes('Dampfnudeln')&&r.mvopts[0]==='book:main'&&r.mvopts.includes('book:b1')&&!r.mvopts.includes('book:b2')&&r.e4==='b1'&&r.e4n===2&&!r.e4draft;
  console.log(ok?'RECBOOK OK':'RECBOOK FAIL');
  await b.close();process.exit(0)});
