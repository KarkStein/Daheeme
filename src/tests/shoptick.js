// Einkaufsliste: nur der Haken hakt ab, ein Tipp auf den Namen nicht (Florian 17.11.2026)
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:640}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify({food:get(['haushalt',key,'food'])||{}}));await A.click('[data-tab=einkauf]');await A.fill('#shopinput','Milch');await A.press('#shopinput','Enter');await A.waitForSelector('.shop li .nm');
  const r={};const id=()=>Object.keys(db().food.shop)[0];
  await A.click('.shop li .nm');await A.waitForTimeout(400);r.name=!!db().food.shop[id()].done;
  await A.click('.shop li .tick');await A.waitForTimeout(400);r.tick=!!db().food.shop[id()].done;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.name===false&&r.tick===true;
  console.error(ok?'SHOPTICK OK':'SHOPTICK FAIL');await b.close();srv.close();process.exit(0)});
