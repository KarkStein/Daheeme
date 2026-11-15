srv.listen(8765,async()=>{
  // Teilen an die App: ?su=Link&st=Titel öffnet Rezept aus Link, ausgefüllt; der Schlüssel kommt aus dem Speicher
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];
  await A.goto('http://localhost:8765/?st='+encodeURIComponent('Linsensuppe mit Kokos')+'&su='+encodeURIComponent('https://example.com/rezept/linsensuppe'));await A.waitForTimeout(1500);
  const v=await A.$$eval('input,textarea',l=>l.map(e=>e.value).join(' | '));const url=A.url();
  const r={key:url.includes('#k='+key),clean:!url.includes('su='),link:v.includes('https://example.com/rezept/linsensuppe'),name:/Linsensuppe/.test(v)};
  console.error(JSON.stringify(r),errs);
  console.error(!errs.length&&r.key&&r.clean&&r.link?'SHARE OK':'SHARE FAIL');await b.close();srv.close();process.exit(0)});
