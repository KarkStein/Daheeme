srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const txt=fs.readFileSync('/tmp/claude-0/-home-user/9de8020e-755f-53dc-b88e-88848c95a226/scratchpad/kitaplan.txt','utf8');
  const I=(name,min,wx,haupt,art,veg)=>({name,source:'test.de',link:'https://example.org/'+encodeURIComponent(name),ing:['Zwiebel','Salz',name.split(' ')[0]],min,wx,haupt,art,veg,note:''});
  const pool={updated:'2026-11-14',week:'2026-W47',items:[
    I('Spaghetti mit Tomatensoße',20,'egal','Nudeln','pfanne',true),I('Kürbissuppe',40,'kalt','Gemüse','suppe',true),I('Linseneintopf',50,'kalt','Hülsenfrüchte','eintopf',true),
    I('Ofengemüse mit Feta',35,'kalt','Gemüse','ofen',true),I('Hähnchen-Reis-Pfanne',25,'egal','Geflügel','pfanne',false),I('Rührei mit Brot',10,'egal','Eier','pfanne',true),
    I('Kartoffel-Lauch-Auflauf',55,'kalt','Kartoffeln','ofen',true),I('Couscous-Salat',20,'warm','Getreide','salat',true),I('Lachs mit Reis',30,'egal','Fisch','pfanne',false),
    I('Gnocchi-Pfanne mit Spinat',20,'egal','Kartoffeln','pfanne',true),I('Rindergulasch',120,'kalt','Fleisch','eintopf',false),I('Quinoa-Bowl',25,'warm','Getreide','salat',true)]};
  const wx={daily:{time:[],temperature_2m_max:[],precipitation_sum:[]}};for(let i=0;i<16;i++){const d=new Date(2026,10,14+i);wx.daily.time.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));wx.daily.temperature_2m_max.push(4+i%3);wx.daily.precipitation_sum.push(i%2?6:0)}
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const p=await c.newPage();await p.clock.setFixedTime(new Date('2026-11-14T20:00:00'));p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/wochenideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(pool)}));
    await p.route('https://geocoding-api.open-meteo.com/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({results:[{name:'München',latitude:48.137,longitude:11.575}]})}));
    await p.route('https://api.open-meteo.com/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(wx)}));return p};
  const A=await mk();await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const link=A.url();const B=await mk();await B.goto(link.replace('/#','/?bild=haus#'));await B.waitForSelector('[data-me=p1]');await B.click('[data-me=p1]');
  await A.click('[data-tab=essen]');await A.click('[data-food=kita]');await A.fill('#kitaplantext',txt);await A.click('[data-act=kitaplanimport]');await A.waitForTimeout(500);
  await A.click('#tabs [data-tab=essen]');await A.click('[data-food=plan]');await A.waitForTimeout(200);const kwA=await A.$eval('.section-head h2',e=>e.textContent);console.log(kwA);
  await A.click('[data-act=wxedit]');await A.fill('#wxinput','München');await A.press('#wxinput','Enter');await A.waitForTimeout(600);
  await A.click('[data-stress=d0]');await A.waitForTimeout(300);
  await A.click('[data-act=suggest]');await A.waitForTimeout(200);
  const rows=await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText.replace(/\n/g,' | ')));
  await A.screenshot({path:out+'/vorschlag.png',fullPage:true});
  const byDay=d=>rows.find(r=>r.startsWith(d))||'';
  const P=Object.fromEntries(pool.items.map(x=>[x.name,x]));const nm=r=>Object.keys(P).find(n=>r.includes(n));
  const mo=P[nm(byDay('Mo'))],di=P[nm(byDay('Di'))],mi=P[nm(byDay('Mi'))],dO=P[nm(byDay('Do'))],fr=P[nm(byDay('Fr'))];
  const checks={n:rows.length,moFast:mo&&mo.min<=30,diNoPasta:di&&di.haupt!=='Nudeln',miNoSoup:mi&&mi.art!=='suppe',doNoChicken:dO&&dO.haupt!=='Geflügel',frNoKart:fr&&fr.haupt!=='Kartoffeln',wxShown:/°/.test(rows.join())};
  // ein Tag neu würfeln
  const before=byDay('Sa');await A.click('[data-sugre=d5]');await A.waitForTimeout(100);const rows2=await A.$$eval('.prow .pnm',l=>l.map(x=>x.innerText));const after=rows2.find(r=>r.startsWith('Sa'))||'';
  await A.click('[data-act=sugall]');await A.click('#mbox [data-sugto=plan]');await A.waitForTimeout(800);
  await B.click('[data-tab=essen]');await B.click('[data-food=plan]');await B.click('[data-fnav="1"]');await B.waitForTimeout(400);
  const bplan=await B.$$eval('ul.meals .dish',l=>l.map(x=>x.innerText.split('\n')[0]));const stressB=await B.$eval('[data-stress=d0]',e=>e.getAttribute('aria-pressed'));
  await B.click('[data-act=mealshop]');await B.click('[data-pickmode=alle]');await B.waitForTimeout(800);await B.click('[data-food=heute]').catch(()=>{});await B.click('[data-food=plan]').catch(()=>{});
  const shop=await B.evaluate(()=>0);
  await B.screenshot({path:out+'/plan-b.png',fullPage:true});
  console.log({rows,checks,before,after,bplan,stressB,errs});
  const ok=!errs.length&&checks.n===7&&checks.moFast&&checks.diNoPasta&&checks.miNoSoup&&checks.doNoChicken&&checks.frNoKart&&checks.wxShown&&before!==after&&bplan.filter(x=>!/Gericht eintragen/.test(x)).length===7&&stressB==='true';
  console.log(ok?'SUGG OK':'SUGG FAIL');await b.close();srv.close();process.exit(0)});
