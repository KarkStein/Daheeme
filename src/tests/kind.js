srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2];const r={};
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);await A.clock.setFixedTime(new Date('2026-11-18T10:00:00+01:00'));A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key])||{}));const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const wk='2026-W47';
  // Name des Kindes in den Einstellungen
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.go='settings';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);
  const sum=await A.$('[data-setsum=wir]');if(sum)await sum.click();await A.waitForTimeout(200);
  await A.fill('[data-kidname]','Testkind');await A.press('[data-kidname]','Tab');await A.waitForTimeout(400);r.name=(db().food.pref||{}).kidname;
  // Hausdienst (Florian 16.11.2026): wer ihn hat, bringt und holt nicht. Di ganzer Tag p1, Do alter halber Tag p0 "ab", Fr Kita zu
  await put('weeks/'+wk+'/ticks/essen__1',{by:'p1',at:1});await put('weeks/'+wk+'/ticks/essen__3',{by:'p0',at:1,part:'ab'});
  await put('food/kita/z1',{name:'Kita zu',sec:'termine',kind:'zu',date:'2026-11-20',at:1});await A.waitForTimeout(400);
  await nav('kind|');r.pager=await A.$eval('.pager',e=>e.innerText.replace(/\n/g,' '));r.h1=await A.$eval('#app h1',e=>e.innerText);r.noBh=!(await A.$('.kidbh'));await nav('kita|');r.board=!!(await A.$('.kidbh'));
  const cells=async i=>A.$$eval('.kidrow:nth-child('+(i+1)+') .kidwho',l=>l.map(x=>x.innerText.trim()));const P=await A.evaluate(()=>0);
  r.rows=await A.$$eval('.kidrow',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));r.tue=await cells(1);r.thu=await cells(3);r.mon0=await cells(0);
  const ticks=()=>((db().weeks[wk]||{}).ticks||{}),bh=()=>((((db().food.kid||{}).bh||{})[wk])||{});
  const kp=async(fld,sel)=>{await A.click('[data-kidset="'+wk+'|'+fld+'"]');await A.waitForTimeout(300);await A.click('#mbox '+sel);await A.waitForTimeout(500)};
  // Mo: beide Felder auf p1 -> p0 bekommt den Hausdienst, keine Hand-Änderung
  await kp('0|br','[data-kp="p1"]');r.mo=await cells(0);r.ho0=(ticks().essen__0||{}).by;r.ov0=JSON.stringify(bh().d0||null);
  // Mo: einer bringt, der andere holt -> geteilter Hausdienst (vormittags hat ihn, wer holt)
  await kp('0|br','[data-kp="p0"]');r.split=await cells(0);r.ho0b=ticks().essen__0||null;r.ov0b=JSON.stringify(bh().d0||null);
  // Hausdienst aus der Auswahl: p1 hat Dienst -> p0 bringt und holt
  await kp('0|ab','[data-kh="p1"]');r.kh=await cells(0);r.ho0c=(ticks().essen__0||{}).by;r.ov0c=JSON.stringify(bh().d0||null);
  // geteilt aus der Auswahl: p0 vormittags -> p1 bringt, p0 holt
  await kp('0|br','[data-kh="p0|vm"]');r.kv=await cells(0);r.kvt=ticks().essen__0||{};
  // jede Woche
  await kp('2|ab','[data-kp="p0|rule"]');r.rule1=JSON.stringify((db().food.kid||{}).rule);
  r.noTick=!(await A.$('[data-kidbrought]'));r.noIcon=!/[✋🏠]/.test((await A.$$eval('.kidwho',l=>l.map(x=>x.innerText).join(''))));
  await A.addStyleTag({content:'#tabs{display:none!important}'});await A.screenshot({path:out+'/wir-kind.png',fullPage:true});await A.addStyleTag({content:'#tabs{display:flex!important}'});
  // feste Woche
  await A.click('[data-kidrule="0"]');await A.waitForTimeout(400);r.rule=JSON.stringify((db().food.kid||{}).rule);
  // Dashboard
  await nav('camp|');r.dash=await A.$eval('.medback .bline',e=>e.innerText.replace(/\n/g,' '));
  // Schaukel im Bild
  await A.clock.setFixedTime(new Date('2026-11-18T10:05:00+01:00'));await nav('camp|');await A.click('.spot[data-go=kind]');await A.waitForTimeout(400);r.swing=await A.$eval('#app h1',e=>e.innerText);
  await nav('camp|');await A.waitForTimeout(600);await (await A.$('.camp')).screenshot({path:out+'/haus-schaukel.png'});
  // Seite Kind neu (Florian 17.11.2026): Heute-Block, Klapp-Karten, Größen, Gesundheit
  await put('food/kitaplan/'+wk+'/d2',{text:'Nudeln mit Tomatensoße'});await put('food/kita/t1',{name:'Laterne',sec:'tasche',at:1});await put('food/kita/f1',{name:'Laternenfest',sec:'termine',kind:'fest',date:'2026-11-19',at:1});
  await put('food/termin/tk',{name:'Kinderturnen',date:'2026-11-18',time:'17:00',who:'kid',at:1});await put('food/buy/b1',{name:'Matschhose',list:'kleidung',for:'kid',at:1});await put('food/kid/birth','2024-02-10');await A.waitForTimeout(500);
  await nav('kind|');r.today=await A.$eval('.kiddash',e=>e.innerText.replace(/\n/g,' '));r.tiles=await A.$$eval('.kiddash .bcnt',l=>l.map(x=>x.innerText.replace(/\n/g,' ')));r.folds=await A.$$eval('.kidcard [data-tfold]',l=>l.map(x=>x.dataset.tfold+':'+x.getAttribute('aria-expanded')));
  await A.click('[data-tfold=kid_size]');await A.click('.kidsz');await A.fill('#mbox [data-ebf=cl]','98');await A.fill('#mbox [data-ebf=sh]','25');await A.click('#mbox [type=submit]');await A.waitForTimeout(500);r.size=(db().food.kid||{}).size||{};r.sizeTxt=await A.$eval('.kidszs',e=>e.innerText.replace(/\n/g,' '));
  await A.click('[data-tfold=kid_med]');await A.waitForTimeout(200);r.sugg=await A.$eval('.kidsugg',e=>e.innerText.replace(/\n/g,' '));
  await A.click('[data-kidmedu]');await A.fill('#mbox [data-ebf=date]','2026-12-03');await A.fill('#mbox [data-ebf=time]','09:30');await A.click('#mbox [type=submit]');await A.waitForTimeout(500);
  const meds=()=>Object.values(db().food.termin||{}).filter(t=>t.tag==='arzt'&&t.who==='kid');r.medrow=await A.$eval('.kidmedter',e=>e.innerText).catch(()=>'');r.med=meds()[0]||{};r.noSugg=!(await A.$('.kidsugg'))||!/U7a/.test(await A.$eval('.kidsugg',e=>e.innerText));
  await A.click('[data-kiddoc]');await A.fill('#mbox [data-ebf=name]','Praxis Test');await A.fill('#mbox [data-ebf=tel]','089 5550123');await A.fill('#mbox [data-ebf=addr]','Teststr. 1, Musterstadt');await A.click('#mbox [type=submit]');await A.waitForTimeout(500);
  r.docTxt=await A.$eval('.kiddoc',e=>e.innerText.replace(/\n/g,' '));r.docDb=(db().food.kid||{}).doc||{};r.docPlace=((db().food.place||{}).kdoc||{}).addr;r.noAddr=!/Teststr/.test(await A.$eval('#app',e=>e.innerHTML));
  await A.screenshot({path:out+'/kind-neu.png',fullPage:true});
  await A.click('.kiddash [data-nav="kind|kf:kid_buy"]');await A.waitForTimeout(300);r.buyOpen=await A.$eval('[data-tfold=kid_buy]',e=>e.getAttribute('aria-expanded'));
  await nav('woche|wp:3');await A.waitForTimeout(300);r.cal=/U7a/.test(await A.$eval('#app',e=>e.innerText));
  await nav('kita|');await A.screenshot({path:out+'/kita-tafel.png',fullPage:true});
  // Partner hat den Umschalter
  await nav('privat|');r.ppager=!!(await A.$('.pager [data-go=kind]'));
  console.error(JSON.stringify(r),errs);
  const n0=r.mon0[0],F=r.tue[0],J=r.thu[0];
  const ok2=/bringt/.test(r.today)&&/holt/.test(r.today)&&/Nudeln/.test(r.today)&&/Kinderturnen/.test(r.today)&&/2 Jahre, 9 Monate/.test(r.today)&&r.tiles.length===3&&/^1 .*Mitbringen/.test(r.tiles[0])&&/Laternenfest/.test(r.tiles[1])&&/^1 .*Besorgen/.test(r.tiles[2])&&r.folds.length===6&&r.folds[0]==='kid_like:true'&&r.size.cl==='98'&&r.size.at>0&&/98/.test(r.sizeTxt)&&/U7a/.test(r.sugg)&&r.med.name==='U7a'&&r.med.date==='2026-12-03'&&r.med.time==='09:30'&&r.med.mk==='vorsorge'&&/U7a/.test(r.medrow)&&r.noSugg&&/Praxis Test/.test(r.docTxt)&&/••• ••• 123/.test(r.docTxt)&&!/5550123/.test(r.docTxt)&&r.docDb.tel==='089 5550123'&&r.docPlace&&r.noAddr&&r.buyOpen==='true'&&r.cal;
  const ok=ok2&&!errs.length&&r.name==='Testkind'&&/Kita/.test(r.pager)&&/Spielen/.test(r.pager)&&/Testkind/.test(r.pager)&&r.h1==='Testkind'&&r.rows.length===5&&r.tue[0]===r.tue[1]&&r.thu[0]!==r.thu[1]&&/zu/.test(r.rows[4])&&r.noBh&&r.board
    &&r.mo[0]===r.mo[1]&&r.ho0==='p0'&&r.ov0==='null'&&r.split[0]!==r.split[1]&&r.ho0b&&r.ho0b.by==='p1'&&r.ho0b.half==='vm'&&r.ov0b==='null'&&r.kh[0]===r.kh[1]&&r.kh[0]!==r.mo[0]&&r.ho0c==='p1'&&r.ov0c==='null'&&/"ab":\["p1","p0","p0"/.test(r.rule1)&&r.noTick&&r.noIcon&&/"br"/.test(r.rule)&&/bringt/.test(r.dash)&&/holt ab/.test(r.dash)&&r.swing==='Testkind'&&!r.ppager&&r.kvt.by==='p0'&&r.kvt.half==='vm'&&r.kv[0]!==r.kv[1]&&r.kv[1]===F;
  console.error(ok?'KIND OK':'KIND FAIL');await b.close();srv.close();process.exit(0)});
