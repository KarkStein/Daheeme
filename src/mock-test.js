// Minimal Firebase-RTDB-like mock (REST + SSE) and a two-device sync test.
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
// Einklappen (17.11.2026): Prüfskripte laufen mit aufgeklappten Karten; die Vorgaben prüft tests/einklappen.js (setzt globalThis.FOLD_ASIS)
const FOLD_OPEN=['f_rfix','f_rfund','f_tdone','f_also','f_hpeck','f_kpast','f_kmimp','f_kda','f_kimp','f_sug','f_kontakt','f_gfix','f_gsplit','f_wnod','f_wbulk','f_w8','wk2_ho','wk2_day','wk2_week','wk2_long','wk2_rot','wk2_fix','wk2_gem','f_tripmore'];
{const l0=chromium.launch.bind(chromium);chromium.launch=async o=>{const b=await l0(o),n0=b.newContext.bind(b);b.newContext=async x=>{const c=await n0(x);if(!globalThis.FOLD_ASIS)await c.addInitScript(K=>{try{if(!localStorage.getItem('hq-tfold')){const o={};K.forEach(k=>o[k]=true);localStorage.setItem('hq-tfold',JSON.stringify(o))}}catch(_){}},FOLD_OPEN);return c};return b}}
let tree={};const clients=[];
const get=p=>p.reduce((o,k)=>o==null?null:o[k],tree);
function setAt(p,d){if(!p.length){tree=d||{};return}let o=tree;for(let i=0;i<p.length-1;i++){if(typeof o[p[i]]!=='object'||o[p[i]]===null)o[p[i]]={};o=o[p[i]]}
  if(d===null)delete o[p[p.length-1]];else o[p[p.length-1]]=d}
const html=()=>fs.readFileSync(path.join(__dirname,'web/index.html'));
const srv=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x');
  if(!u.pathname.endsWith('.json')){res.writeHead(200,{'content-type':'text/html'});return res.end(html())}
  const p=u.pathname.slice(1,-5).split('/').filter(Boolean);
  if(p[0]!=='haushalt'){res.writeHead(404);return res.end()} // Ergebnisdateien der Recherche (ideen.json usw.) gibt es hier nicht
  res.setHeader('access-control-allow-origin','*');
  if(req.method==='GET'){res.writeHead(200,{'content-type':'text/event-stream'});
    res.write('event: put\ndata: '+JSON.stringify({path:'/',data:get(p)??null})+'\n\n');clients.push({p,res});return}
  let b='';req.on('data',c=>b+=c);req.on('end',()=>{const d=JSON.parse(b);
    if(req.method==='PUT')setAt(p,d);else Object.keys(d).forEach(k=>setAt(p.concat(k),d[k]));
    clients.forEach(c=>{if(c.p.every((x,i)=>p[i]===x)){const rel='/'+p.slice(c.p.length).join('/');
      c.res.write('event: '+(req.method==='PUT'?'put':'patch')+'\ndata: '+JSON.stringify({path:rel,data:d})+'\n\n')}});
    res.writeHead(200,{'content-type':'application/json'});res.end(b)})});
srv.listen(8765,async()=>{
  const b=await chromium.launch();const errs=[];
  const mk=async()=>{const c=await b.newContext({viewport:{width:400,height:900}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
  const A=await mk();await A.goto('http://localhost:8765/');await A.click('[data-act=newhouse]');
  await A.click('[data-act=template]');await A.waitForSelector('[data-me=p0]');
  const link=A.url();console.log('link',link);
  const B=await mk();await B.goto(link);await B.waitForSelector('[data-me=p1]');
  await A.click('[data-me=p0]');await B.click('[data-me=p1]');await A.click('[data-tab=woche]');await B.click('[data-tab=woche]');
  await A.click('#sec-week [data-act=wkmore]');await B.click('#sec-week [data-act=wkmore]');
  await A.click('[data-task=einkaufen][data-slot="0"]');
  await B.waitForSelector('[data-task=einkaufen][data-slot="0"].on');
  await B.click('[data-task=bad][data-slot="0"]');
  await A.waitForSelector('[data-task=bad][data-slot="0"].on');
  await B.click('[data-task=einkaufen][data-slot="0"]');
  await A.waitForSelector('[data-task=einkaufen][data-slot="0"]:not(.on)');
  await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='woche|wp:1';b.id='zznav';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);await A.click('[data-wmwsec=pakete]');await A.click('[data-act=swap]');await B.waitForTimeout(300);
  await A.click('.appbar [data-go]');await A.click('[data-tab=einkauf]');await B.click('[data-tab=einkauf]');
  await A.fill('#shopinput','Milch');await A.press('#shopinput','Enter');await A.fill('#shopinput','Brot');await A.click('#shopform button[type=submit]');
  await B.waitForSelector(':nth-match(.shop li, 2)');await B.click(':nth-match(.shop li .tick, 1)');
  await A.click('[data-tfold=shop_done]');await A.waitForSelector('.shop li.done');await A.click('[data-act=shopclear]');await B.waitForSelector('.shop li.done',{state:'detached'});
  await A.click('[data-tab=essen]');await B.click('[data-tab=essen]');await A.click('[data-food=rezepte]');await A.click('[data-act=recnew]');await A.fill('#rec-name','Linsensuppe');await A.fill('#rec-ing','250 g Linsen\n1 Zwiebel');await A.fill('#rec-note','Alles kochen.');await A.click('[data-act=recsave]');
  await B.click('[data-food=plan]');await B.click('[data-meal=d0]');await B.click('[data-mealrec]');await B.click('[data-act=mealsave]');
  await A.click('[data-food=heute]');await A.click('[data-food=plan]');await A.waitForSelector('.mealrow .tag');await A.click('[data-meal=d2]');await A.fill('#mealinput','Reste');await A.press('#mealinput','Enter');
  await B.waitForSelector('text=Reste');await B.click('[data-act=mealshop]');await B.click('[data-pickmode=alle]');await A.click('[data-tab=einkauf]');await A.waitForSelector(':nth-match(.shop li, 2)');
  await A.click(':nth-match(.shop [data-shopedit], 1)');await A.click('#mbox [data-ebk=cat][data-ebv=tk]');await A.click('#mbox button[type=submit]');await B.click('[data-tab=einkauf]');await B.waitForSelector('text=Tiefkühl');
  await A.click('[data-tab=camp]');await B.click('[data-tab=camp]');await A.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='privat|pv:lunch';b.id='zznav';document.getElementById('app').appendChild(b);b.click()});await A.waitForTimeout(300);await A.click('[data-act=lunew]');await A.fill('#lu-name','Trattoria');await A.fill('#lu-dishes','Pizza\nPasta');await A.click('[data-act=lusave]');
  await B.evaluate(()=>{const b=document.createElement('button');b.dataset.nav='privat|pv:lunch';b.id='zznav';document.getElementById('app').appendChild(b);b.click()});await B.waitForTimeout(300);await B.click('[data-lunch]');await B.click('button.star:nth-child(4)');await A.waitForSelector('.star.on');
  console.log('shop',JSON.stringify(Object.values(tree.haushalt)[0].food));
  console.log('rotOffset',tree.haushalt[Object.keys(tree.haushalt)[0]].config.rotOffset,'ticks',JSON.stringify(Object.values(tree.haushalt)[0].weeks));
  await A.evaluate(()=>scrollTo(0,9999));await A.screenshot({path:path.join(__dirname,'web-plan.png')});
  const C=await mk();await C.goto('http://localhost:8765/');await C.screenshot({path:path.join(__dirname,'web-setup.png')});
  console.log('errs',errs,'SYNC OK');await b.close();process.exit(0)});
