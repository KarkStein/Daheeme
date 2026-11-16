srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/rec/r1',{name:'Kürbisauflauf',ing:'700 g Hokkaido-Kürbis\n600 g festkochende Kartoffeln\n2 Knoblauchzehen\n1 TL Olivenöl\n250 ml Sahne',at:1});
  await put('food/rec/r2',{name:'Wirsingauflauf',ing:'1 kg festkochende Kartoffeln\n1 Knoblauchzehe\n200 ml Sahne\n1 kg Wirsing',at:2});
  await A.waitForTimeout(400);
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');
  // r1: alles
  await A.click('[data-rec=r1]');await A.click('[data-recshop=r1]');await A.waitForSelector('.pickwrap');await A.click('[data-pickmode=alle]');await A.waitForTimeout(400);
  // r2: alles bis auf Wirsing
  await A.click('[data-rec=r2]');await A.click('[data-recshop=r2]');await A.click('[data-pickmode=ohne]');
  await A.screenshot({path:out+'/auswahl.png'});
  const lines=await A.$$eval('[data-pickline]',l=>l.map(x=>x.innerText));const wi=lines.findIndex(x=>/Wirsing/.test(x));await A.click(`[data-pickline="0|${wi}"]`);await A.click('[data-act=pickok]');await A.waitForTimeout(400);
  await A.click('#tabs [data-tab=einkauf]');await A.waitForTimeout(300);
  const shop=await A.$$eval('.shop .nm',l=>l.map(x=>(x=>{const q=x.querySelector('.qty'),t=x.innerText.split('\n');if(q)t[0]=q.innerText+' '+t[0].replace(q.innerText,'').trim();return t.join('\n')})(x).replace(/\n/g,' | ')));
  await A.screenshot({path:out+'/summe.png',fullPage:true});
  await A.click('[data-shopfilter="Wirsingauflauf"]');await A.waitForTimeout(200);const filt=await A.$$eval('.shop .nm',l=>l.map(x=>(x=>{const q=x.querySelector('.qty'),t=x.innerText.split('\n');if(q)t[0]=q.innerText+' '+t[0].replace(q.innerText,'').trim();return t.join('\n')})(x).split('\n')[0]));
  await A.click('[data-shopfilter=""]');
  // Block entfernen zieht nur Anteil ab
  await A.click('[data-shopblockrm="Wirsingauflauf"]');await A.waitForTimeout(400);const after=await A.$$eval('.shop .nm',l=>l.map(x=>(x=>{const q=x.querySelector('.qty'),t=x.innerText.split('\n');if(q)t[0]=q.innerText+' '+t[0].replace(q.innerText,'').trim();return t.join('\n')})(x).split('\n')[0]));
  // Nur das: nur Sahne von r2
  await A.click('[data-tab=essen]');await A.click('[data-food=rezepte]');await A.click('[data-rec=r2]').catch(()=>{});await A.click('[data-recshop=r2]');await A.click('[data-pickmode=nur]');const l2=await A.$$eval('[data-pickline]',l=>l.map(x=>x.innerText));await A.click(`[data-pickline="0|${l2.findIndex(x=>/Sahne/.test(x))}"]`);await A.click('[data-act=pickok]');await A.waitForTimeout(400);
  await A.click('#tabs [data-tab=einkauf]');const fin=await A.$$eval('.shop .nm',l=>l.map(x=>(x=>{const q=x.querySelector('.qty'),t=x.innerText.split('\n');if(q)t[0]=q.innerText+' '+t[0].replace(q.innerText,'').trim();return t.join('\n')})(x).split('\n')[0]));
  console.log({shop,filt,after,fin,errs});
  const ok=!errs.length&&shop.some(x=>/^1,6 kg festkochende Kartoffeln \| zusammen für .*Kürbisauflauf/.test(x))&&shop.some(x=>/^3 Knoblauchzehe/.test(x))&&shop.some(x=>/^450 ml Sahne/.test(x))&&!shop.some(x=>/Wirsing \|/.test(x)||/1 kg Wirsing/.test(x))&&!shop.some(x=>/Olivenöl/.test(x))
    &&filt.length===3&&after.includes('600 g festkochende Kartoffeln')&&fin.includes('450 ml Sahne')&&!fin.some(x=>/1,6 kg/.test(x));
  console.log(ok?'SUM OK':'SUM FAIL');await b.close();srv.close();process.exit(0)});
