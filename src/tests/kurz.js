srv.listen(8765,async()=>{
  // Bedienung (Florian 19.11.2026): Zahnrad steht in „Alle Bereiche“ statt in der Kopfzeile, Abkürzungen am App-Symbol (?ab=…), kein Wischen vom Bildschirmrand
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(600);
  const key=/k=([^&]+)/.exec(A.url())[1];const h1=()=>A.$eval('h1',e=>e.innerText).catch(()=>'');
  r.noGear=!(await A.$('.appbar [data-go=settings]'));r.icons=await A.$$eval('.appbar .iconbtn',l=>l.length);
  await A.click('.appbar [data-allar]');await A.waitForSelector('#allar .argear');await A.waitForTimeout(400);await A.screenshot({path:out+'/zahnrad-alle-bereiche.png'});
  await A.click('#allar .argear');await A.waitForTimeout(500);r.set=await h1();r.closed=!(await A.$('#allar'));
  // Abkürzungen
  const ab=async v=>{await A.goto('http://localhost:8765/?ab='+v+'#k='+key);await A.waitForTimeout(1600)};
  await ab('einkauf');r.ek=await h1();r.url=!/ab=/.test(A.url());
  await ab('kalender');r.cal=!!(await A.$('.calbars, .evlist, [data-calview]'));r.calTab=await A.$eval('.pager [aria-pressed=true]',e=>e.innerText).catch(()=>'');
  await ab('termin');r.ter=!!(await A.$('#terform'));
  await ab('heute');r.heute=!!(await A.$('.wkheute'));
  await ab('quatsch');r.bad=await A.$eval('#tabs [aria-current], #tabs [aria-pressed=true], #tabs .on',e=>e.innerText).catch(()=>'x');
  const M=JSON.parse(require('fs').readFileSync(require('path').resolve('manifest.json'),'utf8'));r.sc=(M.shortcuts||[]).map(s=>s.url).join(',');
  // Wischen: vom Rand nichts, aus der Mitte blättert
  await A.goto('http://localhost:8765/#k='+key);await A.waitForTimeout(1200);await A.click('#tabs [data-tab=essen]');await A.waitForTimeout(400);
  const pg=()=>A.$eval('.pager [aria-pressed=true]',e=>e.innerText);
  const swipe=(x0,x1)=>A.evaluate(([x0,x1])=>{const el=document.querySelector('#app h1');const R=el.getBoundingClientRect(),y=R.top+R.height/2;const mk=x=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
    el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[mk(x0)],changedTouches:[mk(x0)]}));el.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,touches:[mk(x1)],changedTouches:[mk(x1)]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[mk(x1)]}))},[x0,x1]);
  r.p0=await pg();await swipe(352,120);await A.waitForTimeout(400);r.pEdge=await pg();await swipe(300,80);await A.waitForTimeout(400);r.pMid=await pg();await swipe(8,240);await A.waitForTimeout(400);r.pEdge2=await pg();await swipe(80,300);await A.waitForTimeout(400);r.pBack=await pg();
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.noGear&&r.icons===4&&/Einstellungen/.test(r.set)&&r.closed&&/Einkauf/.test(r.ek)&&r.url&&r.cal&&/Kalender/.test(r.calTab)&&r.ter&&r.heute&&/ab=termin/.test(r.sc)&&/ab=heute/.test(r.sc)&&r.pEdge===r.p0&&r.pMid!==r.p0&&r.pEdge2===r.pMid&&r.pBack===r.p0?'KURZ OK':'KURZ FAIL');
  await b.close();process.exit(0)});
