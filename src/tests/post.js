srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();await A.clock.setFixedTime(new Date('2026-11-14T12:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/?bild=haus');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  // ohne Nummer: Tipp führt zu Partner › Kontakte
  await A.click('.spot[data-go=post]');await A.waitForTimeout(300);const ask=!!(await A.$('#mboxtel'));await A.screenshot({path:out+'/briefkasten-nummer.png'});await A.click('[data-mboxx]');await A.waitForTimeout(200);
  await A.evaluate(()=>{const b=document.querySelector('[data-nav="privat|pv:kontakte"],[data-go=privat]');});await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="bereiche|";document.getElementById("app").appendChild(b);b.click()});await A.waitForTimeout(200);await A.click('[data-nav="privat|pv:kontakte"]');await A.waitForTimeout(300);const h1=await A.$eval('h1',e=>e.textContent);const kont=!!(await A.$('#kontakte'));
  await A.fill('[data-contact=p1]','0170 1234567');await A.dispatchEvent('[data-contact=p1]','change');await A.waitForTimeout(400);
  const addf=!!(await A.$('#contactaddform'));
  const cards=await A.$$eval('#kontakte .contact b',l=>l.map(x=>x.textContent));const was=await A.$$eval('#kontakte .wabtn',l=>l.map(x=>x.href));
  await A.screenshot({path:out+'/partner-kontakte.png',fullPage:true});const mask=await A.$eval('[data-contact=p1]',e=>e.value+'|'+e.placeholder);const plain=await A.evaluate(()=>document.getElementById('app').innerHTML.includes('1234567')&&!document.getElementById('app').innerHTML.replace(/wa\.me\/\d+|tel:\+\d+/g,'').includes('1234567')?'links-only':document.getElementById('app').innerHTML.replace(/wa\.me\/\d+|tel:\+\d+/g,'').includes('1234567')?'LEAK':'none');console.error('MASK',mask,plain);
  // kurzer Tipp: WhatsApp
  await A.clock.setFixedTime(new Date('2026-11-14T12:00:05+01:00'));await A.click('[data-tab=camp]');await A.waitForTimeout(300);
  const [pop]=await Promise.all([c.waitForEvent('page',{timeout:5000}).catch(()=>null),A.click('.spot[data-go=post]')]);const popUrl=pop?pop.url():null;if(pop)await pop.close();
  const stay=await A.$('.camp')!==null;
  // langes Drücken: Auswahl
  await A.waitForTimeout(800);await A.dispatchEvent('.spot[data-go=post]','contextmenu');await A.waitForTimeout(200);
  const menu=await A.$$eval('#mbox a',l=>l.map(x=>x.getAttribute('href')));await A.screenshot({path:out+'/briefkasten-auswahl.png'});
  await A.waitForTimeout(700);await A.click('#mbox [data-mbox="privat|pv:briefe"]');await A.waitForTimeout(300);
  const h1b=await A.$eval('h1',e=>e.textContent);const onBrief=!!(await A.$('#briefform'));
  await A.fill('#briefinput','Liebe Grüße');await A.press('#briefinput','Enter');await A.waitForTimeout(300);await A.screenshot({path:out+'/partner-briefe.png',fullPage:true});
  const tree=await (async()=>{await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="bereiche|";document.getElementById("app").appendChild(b);b.click()}).catch(()=>{});return A.$$eval('[data-nav^="privat"]',l=>l.map(x=>x.dataset.nav))})();
  console.log({h1,kont,cards,was,popUrl,stay,menu,h1b,onBrief,tree,errs});
  console.error(JSON.stringify({ask,mask,plain,h1,kont,addf,cards,was,popUrl,stay,menu,h1b,onBrief}));const ok=!errs.length&&ask&&/^\|••• ••• 567/.test(mask)&&plain!=='LEAK'&&h1==='Partner'&&kont&&!addf&&cards.length===1&&was.length===2&&!!popUrl&&stay&&menu.length===2&&menu[0]==='https://wa.me/491701234567'&&h1b==='Partner'&&onBrief;
  console.log(ok?'POST OK':'POST FAIL');await b.close();srv.close();process.exit(0)});
