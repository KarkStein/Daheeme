// Kita-Speiseplan einfügen: Spanne mit Datum vor dem Wochentag („23-27.11 Montag“, Florian 21.11.2026)
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:400,height:860}});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];
  const txt='23-27.11 Montag\nFrühstück: Haferflocken mit Milch\n\nMittag: Chili sin Carne\n\nBrotzeit: Leberkässemmel\n\nDienstag\nFrühstück: Rühreier\nMittag: Spaghetti Nachspeise: Obst\nBrotzeit: Beerenquark\nFreitag\nMittag: Pfannkuchen\nBrotzeit: Tomate Mozzarella';
  await A.click('[data-tab=essen]');await A.click('[data-food=kita]');await A.fill('#kitaplantext',txt);await A.click('[data-act=kitaplanimport]');await A.waitForTimeout(600);
  const y=new Date().getFullYear(),P=get(['haushalt',key,'food','kitaplan'])||{},wk=Object.keys(P)[0],W=P[wk]||{};
  console.log(wk,JSON.stringify(W),errs);
  const ok=!errs.length&&W.d0&&W.d0.text==='Chili sin Carne'&&W.d0.fr==='Haferflocken mit Milch'&&W.d1&&W.d1.na==='Obst'&&W.d4&&W.d4.bz==='Tomate Mozzarella'&&/W48$/.test(wk);
  console.error(ok?'KITAPLAN OK':'KITAPLAN FAIL');await b.close();srv.close();process.exit(0)});
