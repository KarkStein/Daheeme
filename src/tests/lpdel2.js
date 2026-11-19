srv.listen(8765,async()=>{
  // Lange drücken zum Löschen an allen Listen-Zeilen (Florian 18.11.2026: „Alle“): Erinnerungen, Gemerktes, Weitere Listen, Packliste, Rezepte, Kita
  const b=await chromium.launch();const errs=[];const r={};const out=process.argv[2];
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,timezoneId:'Europe/Berlin'});const A=await c.newPage();A.setDefaultTimeout(8000);A.on('pageerror',e=>errs.push(e.message));
  await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');await A.click('[data-me=p0]');await A.waitForTimeout(300);
  const key=/k=([^&]+)/.exec(A.url())[1];const db=()=>JSON.parse(JSON.stringify(get(['haushalt',key,'food'])||{}));
  const put=(p,v)=>fetch('http://localhost:8765/haushalt/'+key+'/food/'+p+'.json',{method:'PUT',body:JSON.stringify(v)});
  const day=n=>{const d=new Date(Date.now()+n*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  await put('prio/p1',{name:'Pass abholen',from:'frei',due:day(0),at:1});
  await put('buy/b1',{name:'Regenhose',list:'kleidung',at:2});
  await put('packlist/l1',{name:'Wochenende',at:3});await put('pack/k1',{name:'Zahnbürste',list:'l1',at:4});
  await put('rec/r1',{name:'Linsensuppe',ing:'250 g Linsen',at:5});
  await put('kita/k2',{name:'Wechselhose',sec:'tasche',at:6});await put('kita/k3',{name:'Laternenfest',sec:'termine',date:day(5),at:7});
  await put('play/s1',{name:'Kneten',sec:'zuhause',at:8});await put('music/m1',{name:'Lied vom Regen',art:'lied',at:9});
  await put('trip/t1',{name:'Wildpark',at:10});await put('idea/i1',{name:'Bilderbuch',cat:'geschenk',at:11});
  await A.waitForTimeout(3200);
  const nav=async v=>{await A.evaluate(v=>{const o=document.getElementById("zz");if(o)o.remove();const b=document.createElement("button");b.dataset.nav=v;b.id="zz";document.getElementById("app").appendChild(b)},v);await A.click("#zz");await A.waitForTimeout(400)};
  const lp=async sel=>{const e=await A.$(sel);if(!e)return false;await e.evaluate(x=>x.scrollIntoView({block:'center'}));const q=await e.boundingBox();await A.mouse.move(q.x+Math.min(40,q.width/2),q.y+q.height/2);await A.mouse.down();await A.waitForTimeout(650);await A.mouse.up();await A.waitForTimeout(300);return true};
  const del=async(name,page,sel,gone,pre)=>{await nav(page);if(pre){const p=await A.$(pre);if(p){await p.click();await A.waitForTimeout(300)}}const f=await lp(sel);const x=await A.$('#app .lpx');if(!f||!x){r[name]='kein ✕';return}if(out&&name==='buy')await A.screenshot({path:out+'/lang-druecken-liste.png'});await x.click();await A.waitForTimeout(500);r[name]=gone()?'ok':'noch da'};
  await del('prio','wichtig|','.prow .pnm',()=>!(db().prio||{}).p1);
  // Rückgängig holt die Erinnerung zurück
  await A.click('#toast .toastbtn');await A.waitForTimeout(500);r.undo=!!(db().prio||{}).p1;
  // Tipp daneben bricht ab und löst nichts aus
  await lp('.prow .pnm');await A.click('h1');await A.waitForTimeout(300);r.cancel=!(await A.$('#app .lpx'))&&!!(db().prio||{}).p1;
  await nav('listen|bl:kleidung');const sum=await A.$('[data-buysum=kleidung][aria-expanded=false]');if(sum)await sum.click();await A.waitForTimeout(300);
  await del('buy','listen|bl:kleidung','[data-buydone=b1]',()=>!(db().buy||{}).b1);
  await del('pack','ausflug|tt:pack','[data-pack=k1]',()=>!(db().pack||{}).k1,'[data-packlist=l1]');
  await del('rec','essen|ft:rezepte','.recbar:has([data-recrm=r1])',()=>!(db().rec||{}).r1,'[data-act=bookstog]');
  await del('kitabag','kita|ks:tasche','[data-kitatick=k2]',()=>!(db().kita||{}).k2);
  await del('kitater','kita|','.evlist li:has([data-teredit="k_k3"]) [data-teredit]',()=>!(db().termin||{}).k_k3);
  await del('play','spiel|','[data-playedit=s1]',()=>!(db().play||{}).s1);
  await del('music','musik|','li.mk:has([data-musedit=m1]) .mkb',()=>!(db().music||{}).m1);
  await del('trip','ausflug|','[data-tripedit=t1]',()=>!(db().trip||{}).t1);
  await del('idea','geschenke|','li:has([data-projedit=i1]) .item',()=>!(db().idea||{}).i1);
  console.error(JSON.stringify(r),errs);
  const ok=!errs.length&&['prio','buy','pack','rec','kitabag','kitater','play','music','trip','idea'].every(k=>r[k]==='ok')&&r.undo&&r.cancel;
  console.error(ok?'LPDEL2 OK':'LPDEL2 FAIL');await b.close();srv.close();process.exit(0)});
