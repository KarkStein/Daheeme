// Wochenvorschlag auf einen anderen Tag legen (Florian 21.11.2026: „ein für Sonntag vorgeschlagenes Rezept auch für Montag einsetzen“)
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2]||'/tmp';
  const I=n=>({name:n,source:'beispiel.de',link:'https://beispiel.de/'+encodeURIComponent(n),ing:['1 Zwiebel',n],min:25,wx:'egal'});
  const pool={updated:'2026-11-21',week:'2026-W48',items:['Kürbissuppe','Linseneintopf','Ofengemüse','Gnocchi-Pfanne','Quinoa-Bowl','Couscous-Salat','Rührei mit Brot','Lachs mit Reis'].map(I)};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.route('**/wochenideen.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(pool)}));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  await A.click('#tabs [data-tab=essen]');await A.click('[data-food=plan]');await A.waitForTimeout(300);
  await A.$eval('[data-act=suggest]',e=>e.scrollIntoView({block:'center'}));await A.click('[data-act=suggest]');await A.waitForTimeout(300);
  const ks=await A.$$eval('[data-sugok]',l=>l.map(x=>x.dataset.sugok));const k=ks[ks.length-1];const r={ks};
  r.name=await A.$eval(`[data-sugok=${k}]`,e=>e.closest('.prow').querySelector('.pnm').innerText.split('\n')[0].replace(/^\S+\s/,''));
  await A.$eval(`[data-sugok=${k}]`,e=>e.scrollIntoView({block:'center'}));await A.click(`[data-sugok=${k}]`);await A.waitForSelector('#mbox [data-sugday]');
  r.chips=await A.$$eval('#mbox [data-sugday]',l=>l.map(x=>x.dataset.sugday+':'+x.getAttribute('aria-pressed')));
  const all=r.chips.map(x=>x.split(':')[0]),other=all[all.length-1];r.other=other;r.n=all.length;
  await A.click(`#mbox [data-sugday="${other}"]`);await A.waitForTimeout(150);r.sel=await A.$$eval('#mbox [data-sugday][aria-pressed=true]',l=>l.map(x=>x.dataset.sugday));
  await A.screenshot({path:out+'/vorschlag-anderer-tag.png'});
  await A.click('#mbox [data-sugto=plan]');await A.waitForTimeout(800);
  const pl=db().plan||{},[wk,dd]=other.split('|');r.at=Object.keys(pl).flatMap(w=>Object.keys(pl[w]).map(d=>w+'|'+d));r.txt=pl[wk]&&pl[wk][dd]&&pl[wk][dd].text;
  r.rest=await A.$$eval('[data-sugok]',l=>l.map(x=>x.dataset.sugok));
  console.log(JSON.stringify(r),errs);
  const ok=!errs.length&&ks.length>=2&&r.n===8&&r.chips.some(x=>x.endsWith('|'+k+':true'))&&r.sel.join()===other&&r.at.join()===other&&r.txt===r.name&&!r.rest.includes(k);
  console.error(ok?'SUGTAG OK':'SUGTAG FAIL');await b.close();srv.close();process.exit(0)});
