// Urlaub: lange drücken in der Urlaube-Zeile = Menü (Erledigt, Löschen mit Nachfrage); Knöpfe in der Ansicht stehen vor Gemerkt (Florian 17.11.2026)
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const c=await b.newContext({viewport:{width:360,height:740}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=async(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  await put('food/urlaub/u1',{name:'Bretagne',state:'aktuell',at:1});await put('food/urlaub/u2',{name:'Gardasee',state:'traum',at:2});
  await put('food/packlist/u_u2',{name:'Gardasee',at:1});await put('food/pack/p1',{name:'Sonnencreme',list:'u_u2',at:1});
  await A.waitForTimeout(500);
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const hold=async sel=>{const bx=await A.$eval(sel,e=>{e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});await A.mouse.move(bx.x,bx.y);await A.mouse.down();await A.waitForTimeout(700);await A.mouse.up();await A.waitForTimeout(300)};
  const r={};
  await nav('ausflug|tt:urlaub');await A.waitForSelector('.ut[data-reise=u1]');
  await hold('.ut[data-reise=u1]');r.menu=!!(await A.$('#mbox [data-rm=del]'));r.notOpened=await A.evaluate(()=>!document.querySelector('.reiseact'));
  await A.click('#mbox [data-rm=erledigt]');await A.waitForTimeout(400);r.done=db().urlaub.u1.state;
  await hold('.ut[data-reise=u2]');await A.click('#mbox [data-rm=del]');await A.waitForTimeout(200);r.ask=await A.$eval('#mbox [data-rm=del]',e=>e.textContent);r.still=!!db().urlaub.u2;
  await A.click('#mbox [data-rm=del]');await A.waitForTimeout(500);const d=db();r.gone=!d.urlaub||!d.urlaub.u2;r.packGone=!d.pack||!d.pack.p1;
  // Ansicht: Knöpfe vor Gemerkt
  await put('food/urlaub/u3',{name:'Ostsee',state:'aktuell',at:3});await A.waitForTimeout(400);await nav('ausflug|tt:urlaub');await A.click('.ut[data-reise=u3]');await A.waitForSelector('.reiseact');
  r.order=await A.evaluate(()=>{const a=document.querySelector('.reiseact'),g=[...document.querySelectorAll('h2')].find(h=>/Gemerkt/.test(h.textContent));return !!(a&&g&&(a.compareDocumentPosition(g)&Node.DOCUMENT_POSITION_FOLLOWING))});
  await A.click('.reiseact [data-act=reisedel]');await A.click('.reiseact [data-act=reisedel]');await A.waitForTimeout(500);r.del3=!(db().urlaub||{}).u3;
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&r.menu&&r.notOpened&&r.done==='erledigt'&&r.ask==='Wirklich löschen?'&&r.still&&r.gone&&r.packGone&&r.order&&r.del3;
  console.error(ok?'REISEMENU OK':'REISEMENU FAIL');await b.close();srv.close();process.exit(0)});
