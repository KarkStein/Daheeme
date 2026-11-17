srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/rec/r1',{name:'Kürbispfanne',ing:'500 g Hokkaido-Kürbis\n2 EL Olivenöl\n1 TL Salz\nPfeffer\n600 g Salzkartoffeln\n1 TL Senf',at:1});await A.waitForTimeout(400);
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');{const _bt=await A.$('.bookcard .setsum[aria-expanded=false]');if(_bt){await _bt.click();await A.waitForTimeout(150)}}await A.click('[data-rec=r1]');await A.click('[data-recshop]');await A.click('[data-pickmode=alle]');await A.waitForTimeout(600);
  await A.click('#tabs [data-tab=einkauf]');const shop=await A.$$eval('.shop .nm',l=>l.map(x=>x.innerText.split('\n')[0]));
  await A.click('[data-act=pantrytoggle]');await A.fill('#pantryinput','Senf');await A.press('#pantryinput','Enter');await A.waitForTimeout(300);await A.click('[data-pantryrm="Salz"]');await A.waitForTimeout(300);
  const chips=await A.$$eval('[data-pantryrm]',l=>l.map(x=>x.dataset.pantryrm));
  await A.screenshot({path:out+'/vorrat.png',fullPage:true});
  console.log({shop,hasSenf:chips.includes('Senf'),noSalz:!chips.includes('Salz'),errs});
  const ok=!errs.length&&shop.length===3&&shop.some(x=>/Kürbis/.test(x))&&shop.some(x=>/Salzkartoffeln/.test(x))&&shop.some(x=>/Senf/.test(x))&&chips.includes('Senf')&&!chips.includes('Salz');
  console.log(ok?'PANTRY OK':'PANTRY FAIL');await b.close();srv.close();process.exit(0)});
