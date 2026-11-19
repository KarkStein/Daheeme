// Prüft die Spiel-Seite im Browser (Playwright): Übersicht, bauen, eine Welle, Ausbau, Spielstand, ganzes Level im Schnelllauf. Aufruf: node spiel/pruefen/bild.js <Bildordner>
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'..'),out=process.argv[2]||'/tmp';
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f==='/'||f==='/spiel/')f='/spiel/index.html';const p=path.join(dir,f.replace(/^\/spiel\//,''));if(!p.startsWith(dir)||!fs.existsSync(p)){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript':'text/html; charset=utf-8'});r.end(fs.readFileSync(p))});
srv.listen(8791,async()=>{const b=await chromium.launch(),errs=[],r={};
  const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,hasTouch:true}),A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));A.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await A.goto('http://localhost:8791/spiel/?schnell=12');await A.waitForSelector('[data-lvl="0"]');r.lvls=await A.$$eval('[data-lvl]',l=>l.length);r.zu=await A.$$eval('[data-lvl][disabled]',l=>l.length);
  await A.screenshot({path:out+'/spiel-uebersicht.png'});
  await A.click('[data-lvl="0"]');await A.waitForSelector('[data-los]');
  const tap=async id=>{const p=await A.evaluate(id=>{const G=LWUI.G,s=G.plaetze[id],c=document.querySelector('#feld').getBoundingClientRect();return [c.left+s.x/360*c.width,c.top+s.y/540*c.height]},id);await A.mouse.click(p[0],p[1]);await A.waitForTimeout(150)};
  const best=await A.evaluate(()=>LWUI.G.plaetze.slice().sort((a,b)=>b.d-a.d).map(p=>p.id));
  await tap(best[0]);r.opts=await A.$$eval('[data-bau]',l=>l.map(x=>x.dataset.bau).join(','));await A.screenshot({path:out+'/spiel-bauen.png'});
  await A.click('[data-bau=leucht]');await A.waitForTimeout(150);await tap(best[1]);await A.click('[data-bau=horn]');await A.waitForTimeout(150);r.taler=await A.evaluate(()=>LWUI.G.taler);
  await A.click('[data-zu]').catch(()=>{});await A.screenshot({path:out+'/spiel-pause.png'});
  await A.click('[data-los]');await A.waitForTimeout(900);await A.screenshot({path:out+'/spiel-welle.png'});
  // Level im Schnelllauf: in jeder Pause bauen oder ausbauen, was geht
  for(let n=0;n<400;n++){const ph=await A.evaluate(()=>LWUI.G&&LWUI.G.phase);if(ph==='gewonnen'||ph==='verloren')break;
    if(ph==='pause'){await A.evaluate(()=>{const G=LWUI.G;for(let i=0;i<20;i++){const f=G.plaetze.filter(p=>!LW.turmAuf(G,p.id)).sort((a,b)=>b.d-a.d)[0];if(f&&LW.bauen(G,f.id,'leucht'))continue;const u=G.tuerme.find(t=>t.stufe<2&&G.taler>=LW.TOWERS[t.art].kosten[t.stufe+1]);if(u&&LW.ausbauen(G,u.platz))continue;break}});
      if(n===0){r.stand=await A.evaluate(()=>JSON.parse(localStorage.getItem('lw-stand-1')).lauf.welle)}
      await A.click('[data-los]').catch(()=>{})}
    await A.waitForTimeout(250)}
  r.ende=await A.evaluate(()=>LWUI.G.phase);r.welle=await A.evaluate(()=>LWUI.G.welle);await A.screenshot({path:out+'/spiel-geschafft.png'});
  r.done=await A.evaluate(()=>!!JSON.parse(localStorage.getItem('lw-stand-1')).done[0]);r.next=!!(await A.$('[data-weiterlvl="1"]'));
  await A.click('[data-weiterlvl="1"]');await A.waitForSelector('[data-los]');await tap(await A.evaluate(()=>LWUI.G.plaetze[0].id));r.opts2=await A.$$eval('[data-bau]',l=>l.map(x=>x.dataset.bau).join(','));
  // Neu laden: Weiterspielen steht da
  await A.click('[data-bau=kanone]');await A.goto('http://localhost:8791/spiel/');await A.waitForSelector('[data-weiter]');r.weiter=true;await A.click('[data-weiter]');await A.waitForSelector('[data-los]');r.tuerme=await A.evaluate(()=>LWUI.G.tuerme.map(t=>t.art).join(','));
  console.log(JSON.stringify(r),errs);
  console.log(!errs.length&&r.lvls===10&&r.zu===9&&r.opts==='leucht,horn'&&r.taler===20&&r.ende==='gewonnen'&&r.welle===8&&r.done&&r.next&&r.opts2==='leucht,horn,kanone'&&r.weiter&&r.tuerme==='kanone'?'SPIEL OK':'SPIEL FAIL');
  await b.close();srv.close();process.exit(0)});
