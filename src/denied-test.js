// Checks the page's behaviour when the database rejects access (rules not published).
// Build first with: node src/build-web.js http://localhost:8766
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const srv=http.createServer((req,res)=>{
  if(!req.url.split('?')[0].endsWith('.json')){res.writeHead(200,{'content-type':'text/html'});return res.end(fs.readFileSync(path.join(__dirname,'web/index.html')))}
  res.writeHead(401,{'content-type':'application/json','access-control-allow-origin':'*'});res.end('{"error":"Permission denied"}')});
srv.listen(8766,async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:800}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8766/');await p.click('[data-act=newhouse]');
  await p.waitForSelector('#rulesline',{timeout:8000});
  console.log('errs',errs,'DENIED SCREEN OK');await b.close();process.exit(0)});
