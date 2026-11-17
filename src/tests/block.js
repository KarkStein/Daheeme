srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const link=A.url();
  const put=async(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/rec/r1',{name:'Kürbis-Pasta',ing:'Kürbis\nNudeln\nSahne',at:1});
  await put('food/rec/r2',{name:'Gulasch',ing:'Rindfleisch\nZwiebeln\nPaprika',at:2});
  await put('food/shop/x1',{name:'Milch',done:false,at:0});
  const B=await mk();await B.goto(link);await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}
  // Rezepte aufklappen: Knopf data-recshop suchen
  const openRec=async n=>{const el=await A.$(`text=${n}`);await el.click();await A.waitForTimeout(200)};
  await openRec('Kürbis-Pasta');await A.click('[data-recshop=r1]');await A.click('[data-pickmode=alle]');await A.waitForTimeout(300);
  await openRec('Gulasch');await A.click('[data-recshop=r2]').catch(async()=>{});await A.click('[data-pickmode=alle]').catch(()=>{});await A.waitForTimeout(300);
  await B.click('[data-tab=einkauf]');await B.waitForSelector('text=für Kürbis-Pasta');
  const n1=await B.$$eval('ul.shop li',l=>l.length);
  await B.screenshot({path:out+'/liste.png',fullPage:true});
  await B.click(`[data-shopfilter="Kürbis-Pasta"]`);await B.waitForTimeout(300);await B.click(`[data-shopblockrm="Kürbis-Pasta"]`);await B.waitForTimeout(500);
  const names=await B.$$eval('ul.shop .nm',l=>l.map(x=>x.textContent));
  console.log('vorher',n1,'nachher',names);
  const ok=!names.some(n=>/Kürbis|Nudeln|Sahne/.test(n))&&names.some(n=>/Milch/.test(n))&&names.some(n=>/Rindfleisch/.test(n));
  console.log('errs',errs);console.log(ok&&!errs.length?'BLOCK OK':'BLOCK FAIL');await b.close();srv.close();process.exit(0)});
