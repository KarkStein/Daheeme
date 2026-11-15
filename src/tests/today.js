srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-12T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/wochenideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({items:[{name:'Kürbisauflauf mit Kartoffeln',link:'https://example.org/k',ing:['700 g Kürbis'],min:45,wx:'kalt'}]})}));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/plan/2026-W46/d3',{text:'Kürbisauflauf mit Kartoffeln',ing:'700 g Kürbis\n600 g Kartoffeln',link:'https://example.org/k',at:1});
  await put('food/plan/2026-W46/d4',{text:'Serbische Bohnensuppe',ing:'300 g getrocknete weiße Riesenbohnen\n1 Zwiebel',at:1});
  await put('food/kitaplan/2026-W46/d3',{text:'Gemüsepflanzerl mit Püree',bz:'Brot mit Frischkäse',fr:'Müsli',at:1});
  await put('food/kitaplan/2026-W46/d4',{text:'Nudeln mit Tomatensoße',at:1});
  await put('food/shop/s1',{name:'600 g Kartoffeln',done:false,at:1,src:'Kürbisauflauf mit Kartoffeln'});
  await A.waitForTimeout(500);
  await A.click('#tabs [data-tab=essen]');await A.waitForTimeout(300);
  const txt=await A.$eval('#app',e=>e.innerText);
  await A.screenshot({path:out+'/essen-heute.png',fullPage:true});
  await A.click('[data-food=plan]');await A.click('#tabs [data-tab=woche]');await A.click('#tabs [data-tab=essen]');const sel=await A.$eval('[data-food=heute]',e=>e.getAttribute('aria-pressed'));
  console.log({txt:txt.slice(0,900),sel,errs});
  const ok=!errs.length&&/Heute Abend/i.test(txt)&&/Kürbisauflauf mit Kartoffeln/.test(txt)&&/ca\. 45 Min/.test(txt)&&/Noch einkaufen: 600 g Kartoffeln/.test(txt)&&/Mittag\s*Gemüsepflanzerl/.test(txt)&&/Brotzeit\s*Brot mit Frischkäse/.test(txt)&&/Serbische Bohnensuppe/.test(txt)&&/einweichen/.test(txt)&&/Kita mittags: Nudeln/.test(txt)&&sel==='true';
  console.log([/Heute Abend/,/ca\. 45 Min/,/Noch einkaufen: 600 g Kartoffeln/,/Mittag\s*Gemüsepflanzerl/,/Brotzeit\s*Brot mit Frischkäse/,/einweichen/,/Kita mittags: Nudeln/].map(r=>r.test(txt)));console.log(ok?'TODAY OK':'TODAY FAIL');await b.close();srv.close();process.exit(0)});
