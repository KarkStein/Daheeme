// Renders src/icon.svg to the PNG icons the page and manifest reference.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const svg=fs.readFileSync(path.join(__dirname,'icon.svg'),'utf8');const b=await chromium.launch();
for(const n of [180,192,512]){const p=await b.newPage({viewport:{width:n,height:n}});
  await p.setContent('<body style="margin:0">'+svg.replace('<svg ','<svg width="'+n+'" height="'+n+'" ')+'</body>');
  await p.screenshot({path:path.join(__dirname,'..','icon-'+n+'.png')});await p.close()}
await b.close();console.log('icons written')})();
