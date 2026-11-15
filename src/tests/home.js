srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:400,height:860}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const res=[];
  for(const go of ['woche','essen','einkauf','ausflug','projekte','spiel']){await A.click('.spot[data-go='+go+']');await A.waitForTimeout(150);
    if(go==='ausflug'){await A.click('[data-act=tripnew]')}
    await A.click('[data-tab=camp]');await A.waitForTimeout(150);res.push(go+':'+(await A.$('.camp svg')?'ok':'NO'))}
  await A.click('[data-tab=woche]');await A.click('[data-tab=camp]');res.push('tab:'+(await A.$('.camp svg')?'ok':'NO'));
  console.log(res.join(' '),errs);console.log(!errs.length&&!res.join().includes('NO')?'HOME OK':'HOME FAIL');await b.close();srv.close();process.exit(0)});
