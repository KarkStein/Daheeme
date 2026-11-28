// Briefkasten „An Claude“ (Florian 28.11.2026, „Ja, so bauen“): Wunsch abschicken mit „Gerade hier“, Antwort von Claude lesen, antworten, erledigt, lange drücken = löschen
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];const out=process.argv[2]||'/tmp';
  const c=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(pa,d)=>fetch('http://localhost:8765/haushalt/'+key+'/'+pa+'.json',{method:'PUT',body:JSON.stringify(d)});
  const nav=async v=>{await A.evaluate(v=>{const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const r={};
  await nav('geschenke|');await nav('claude|');
  r.pager=await A.$$eval('.pager .pdot',l=>l.map(x=>x.textContent.trim()));
  r.here=await A.$eval('[data-act=cwhere]',e=>e.textContent).catch(()=>'');
  await A.click('[data-cwkind=fehler]');await A.fill('#cwtext','Termin springt zurück\nNach dem Speichern steht wieder der alte Tag.');
  await A.click('[data-act=cwlinkon]');await A.fill('#cwlink','beispiel.de/x');
  await A.click('[data-act=cwsend]');await A.waitForTimeout(600);
  const asks=()=>Object.entries(db().ask||{});const [id,w]=asks()[0]||[];
  r.saved={kind:w&&w.kind,title:w&&w.title,page:w&&w.page,st:w&&w.st,wait:!!(w&&w.wait),msgs:w?Object.keys(w.msgs).length:0,link:w&&Object.values(w.msgs)[0].link};
  r.open=await A.$$eval('#app .mklist li',l=>l.map(x=>x.innerText.replace(/\s+/g,' ').trim()));
  await A.screenshot({path:out+'/an-claude-liste.png'});
  // so schreibt der Lauf im privaten Repo: abgeholt, dann Antwort
  const now=Date.now();await put('food/ask/'+id+'/wait',null);await put('food/ask/'+id+'/st','rueckfrage');
  await put('food/ask/'+id+'/msgs/c1',{by:'claude',t:'Danke! Welcher Termin war es, ein eigener oder einer aus Familywall?',at:now+1000,nav:'woche|wp:3'});await A.waitForTimeout(600);
  r.unread=await A.$eval('#app .mklist li',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>'');
  await A.click('[data-cwopen]');await A.waitForTimeout(400);
  r.bubbles=await A.$$eval('.cwmsg',l=>l.map(x=>(x.classList.contains('me')?'me:':'cl:')+x.innerText.slice(0,20)));
  r.seen=!!((db().ask[id].seen||{}).p0>now);
  await A.fill('#cwre','Ein eigener, Zahnarzt am Montag.');await A.screenshot({path:out+'/an-claude-verlauf.png'});
  await A.click('[data-cwreply]');await A.waitForTimeout(500);
  r.reply={msgs:Object.keys(db().ask[id].msgs).length,st:db().ask[id].st,wait:!!db().ask[id].wait};
  await nav('camp|');await nav('claude|cw:'+id);r.jump=!!(await A.$('[data-cwreply]'));
  // Zurück schließt den Verlauf
  await A.goBack();await A.waitForTimeout(500);r.backList=!!(await A.$('[data-act=cwsend]'));
  await A.click('[data-cwopen]');await A.waitForTimeout(300);await A.click('[data-cwst$="|erledigt"]');await A.waitForTimeout(500);
  r.done={st:db().ask[id].st,list:!!(await A.$('[data-act=cwsend]'))};
  // lange drücken auf die Zeile (unter Erledigt, dafür aufklappen) = ✕ Löschen
  const fh=await A.$$('.foldh');for(const h of fh){const t=await h.innerText();if(/Erledigt/.test(t)&&(await h.getAttribute('aria-expanded'))==='false')await h.click()}
  await A.waitForTimeout(300);const e=await A.$('[data-cwopen]');await e.evaluate(x=>x.scrollIntoView({block:'center'}));const q=await e.boundingBox();
  await A.mouse.move(q.x+40,q.y+q.height/2);await A.mouse.down();await A.waitForTimeout(650);await A.mouse.up();await A.waitForTimeout(200);
  await A.click('.lpx');await A.waitForTimeout(500);r.deleted=!asks().length;
  // Alle Bereiche › Quer hat den Eintrag
  await A.click('[data-allar]');await A.waitForTimeout(300);r.ar=!!(await A.$('#allar [data-arnav="claude|"]'));
  console.log(JSON.stringify(r,null,1),errs);
  const ok=!errs.length&&r.pager.join()==='Alles Gemerkte,Recherchen,An Claude'&&/Gerade hier: Geschenke/.test(r.here)&&r.saved.kind==='fehler'&&r.saved.title==='Termin springt zurück'&&r.saved.page==='Geschenke'
    &&r.saved.st==='neu'&&r.saved.wait&&r.saved.msgs===1&&r.saved.link==='https://beispiel.de/x'&&/geschickt/.test(r.open[0]||'')&&/neue Antwort/.test(r.unread)&&/Rückfrage/.test(r.unread)
    &&r.bubbles.length===2&&r.bubbles[0].startsWith('me:')&&r.bubbles[1].startsWith('cl:')&&r.seen&&r.reply.msgs===3&&r.reply.st==='neu'&&r.reply.wait&&r.backList&&r.done.st==='erledigt'&&r.done.list&&r.deleted&&r.ar&&r.jump;
  console.error(ok?'CLAUDE OK':'CLAUDE FAIL');await b.close();srv.close();process.exit(0)});
