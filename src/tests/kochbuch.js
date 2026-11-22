srv.listen(8765,async()=>{
  // Rezepte in ein anderes Kochbuch schieben (Florian 22.11.2026: „Rezepte in Unsere Rezepte … kann ich wieder nicht verschieben“, „Wenn ich in ein Kochbuch geh, müssen die Rezepte eingeklappt sein“)
  const b=await chromium.launch();const errs=[];const r={};
  const c=await b.newContext({viewport:{width:400,height:860}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const bookOf=id=>((get(['haushalt',key,'food','rec',id])||{}).book)||'main';const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const fire=async(k,v)=>{await A.evaluate(([k,v])=>{const b=document.createElement("button");b.dataset[k]=v;b.id="zy";document.getElementById("app").appendChild(b)},[k,v]);await A.click("#zy");await A.waitForTimeout(400)};
  await put('food/rec/r1',{name:'Testsuppe',ing:'1 Lauch',at:1});await put('food/rec/r2',{name:'Testcurry',ing:'1 Reis',at:2});await put('food/rec/r3',{name:'Testauflauf',ing:'1 Nudeln',at:3});await put('food/book/b1',{name:'Asiatisch',at:5});await A.waitForTimeout(500);
  const openList=async()=>{await nav('essen|ft:rezepte');const t=await A.$('.bookcard .setsum[aria-expanded=false]');if(t){await t.click();await A.waitForTimeout(200)}};
  // 1. Im Kochbuch: Rezept aufklappen, „📚 Anderes Kochbuch“
  await openList();await A.click('[data-rec=r1]');await A.waitForTimeout(300);await A.click('[data-recbookmv=r1]');await A.waitForTimeout(300);
  await A.click('#mbox [data-ebk=book][data-ebv=b1]');await A.click('#mbox button.primary');await A.waitForTimeout(500);r.m1=bookOf('r1');
  await A.click('.toast button, #toast button').catch(()=>{});await A.waitForTimeout(400);r.open1=await A.$$eval('[data-rec][aria-expanded=true]',l=>l.length);
  // 2. Rezept-Datenbank: Fenster hat „📚 Anderes Kochbuch“
  await openList();await fire('act','rdbopen');await A.click('.rdblist [data-openrec=r2]');await A.waitForTimeout(400);r.win=!!(await A.$('.recwin [data-rw=recbookmv]'));
  if(r.win){await A.click('.recwin [data-rw=recbookmv]');await A.waitForTimeout(400);await A.click('#mbox [data-ebk=book][data-ebv=b1]');await A.click('#mbox button.primary');await A.waitForTimeout(500)}r.m2=bookOf('r2');
  // 3. Bearbeiten › Kochbuch: danach steht das Rezept eingeklappt im neuen Kochbuch
  await fire('act','rdbclose');await openList();if(!(await A.$('[data-rec=r3]'))){await A.click('.bookcard [data-book=main]');await A.waitForTimeout(300)}if(!(await A.$('[data-rec=r3]'))){await A.click('.bookcard [data-book=main]');await A.waitForTimeout(300)}await A.click('[data-rec=r3]');await A.waitForTimeout(300);await A.click('[data-recedit=r3]');await A.waitForTimeout(300);await A.click('[data-recbook=b1]');await A.waitForTimeout(200);await A.click('[data-act=recsave]');await A.waitForTimeout(500);
  r.m3=bookOf('r3');r.open3=await A.$$eval('[data-rec][aria-expanded=true]',l=>l.length);
  // 4. Wieder zu den Rezepten: nichts aufgeklappt
  await A.click('[data-rec=r3]');await A.waitForTimeout(200);await nav('essen|ft:heute');await openList();r.open4=await A.$$eval('[data-rec][aria-expanded=true]',l=>l.length);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.m1==='b1'&&r.open1===0&&r.win&&r.m2==='b1'&&r.m3==='b1'&&r.open3===0&&r.open4===0;
  console.error(ok?'KOCHBUCH OK':'KOCHBUCH FAIL');await b.close();srv.close();process.exit(0)});
