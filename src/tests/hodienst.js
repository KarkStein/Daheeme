srv.listen(8765,async()=>{
  // Hausdienst (Florian 17.11.2026): Einteilen und Abhaken sind zwei Felder. Abhaken täglich bei der Person, die heute den Dienst hat; geteilt = zwei Felder.
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:360,height:740},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1],wk='2026-W47';const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});const tick=k=>get(['haushalt',key,'weeks',wk,'ticks',k])||null;
  await A.evaluate(()=>{const b=document.createElement("button");b.dataset.nav="woche|wp:0";b.id="zz";document.getElementById("app").appendChild(b)});await A.click("#zz");await A.waitForTimeout(500);
  const chk=()=>A.$$eval('#sec-ho .hochk [data-hodone]',l=>l.map(x=>x.closest('.wt').innerText.replace(/\n/g,' ')+'|'+x.getAttribute('aria-pressed')));
  r.none=await A.$eval('#sec-ho .hochk',e=>e.innerText);r.days=await A.$$eval('#sec-ho .hocol small',l=>l.map(x=>x.innerText).join(''));
  // Einteilen: kurzer Tipp auf Mittwoch trägt mich ein, ohne Haken
  await A.click('#sec-ho .slot.hoslot[data-slot="2"]');await A.waitForTimeout(600);r.set=tick('essen__2');r.one=await chk();
  // Abhaken: eigenes Feld
  await A.click('#sec-ho .hochk [data-hodone]');await A.waitForTimeout(600);r.ok=tick('essen__2');r.oneDone=await chk();
  await A.$eval('#sec-ho',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/hausdienst-neu.png'});
  // geteilt: zwei Felder, das des anderen lässt sich auch abhaken
  await put('weeks/'+wk+'/ticks/essen__2',{by:'p1',half:'vm',at:1});await A.waitForTimeout(600);r.two=await chk();
  await A.click('#sec-ho .hochk [data-hodone$="|p0"]');await A.waitForTimeout(600);r.ok2=tick('essen__2');r.twoDone=await chk();
  await A.$eval('#sec-ho',e=>e.scrollIntoView({block:'start'}));await A.screenshot({path:out+'/hausdienst-geteilt.png'});
  // jemand anderes (Oma): kein Feld zum Abhaken
  await put('weeks/'+wk+'/ticks/essen__2',{by:'x',lbl:'Oma',at:1});await A.waitForTimeout(600);r.x=await chk();
  // Einteilung für künftige Tage bleibt nach dem Neuladen stehen (das Aufräumen täglicher Haken fasst den Hausdienst nicht an)
  await put('weeks/'+wk+'/ticks/essen__4',{by:'p1',at:Date.parse('2026-11-18T09:00:00+01:00')});await A.reload();await A.waitForTimeout(3000);r.future=tick('essen__4');
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&/niemand eingeteilt/.test(r.none)&&r.days==='MoDiMiDoFrSaSo'&&r.set&&r.set.by==='p0'&&!r.set.ok&&r.one.length===1&&/\|false$/.test(r.one[0])&&/heute/.test(r.one[0])&&r.ok.ok&&r.ok.ok.p0>0&&r.ok.by==='p0'&&/\|true$/.test(r.oneDone[0])
    &&r.two.length===2&&/vormittags/.test(r.two[0])&&/nachmittags/.test(r.two[1])&&r.ok2.ok&&r.ok2.ok.p0>0&&!r.ok2.ok.p1&&/\|false$/.test(r.twoDone[0])&&/\|true$/.test(r.twoDone[1])&&r.x.length===0&&r.future&&r.future.by==='p1';
  console.error(ok?'HODIENST OK':'HODIENST FAIL');await b.close();srv.close();process.exit(0)});
