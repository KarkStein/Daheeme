// Prüfskripte: node src/tests/run.js [name …]
// Baut vorher selbst: node src/build-web.js http://localhost:8765
// Jedes Skript in diesem Ordner ist der Teil nach "srv.listen" und wird hinter den Firebase-Ersatz aus mock-test.js gehängt.
// Ergebnis je Skript: letzte Zeile "<NAME> OK" oder "<NAME> FAIL". Bilder landen im Temp-Ordner.
const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');
const dir=__dirname,root=path.join(dir,'..'),mock=fs.readFileSync(path.join(root,'mock-test.js'),'utf8');
const head=mock.slice(0,mock.indexOf('srv.listen')).replace(/^const html=.*$/m,`const html=()=>fs.readFileSync(${JSON.stringify(path.join(root,'web','index.html'))});`);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'daheeme-'));
const want=process.argv.slice(2);
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.js')&&f!=='run.js'&&(!want.length||want.includes(f.replace(/\.js$/,'')))).sort();
let ok=0,bad=[];
for(const f of files){const p=path.join(tmp,f);fs.writeFileSync(p,head+fs.readFileSync(path.join(dir,f),'utf8'));
  const r=spawnSync(process.execPath,[p,tmp],{encoding:'utf8',timeout:120000});const out=((r.stdout||'')+(r.stderr||'')).trim().split('\n');
  const last=out.filter(l=>/ (OK|FAIL)\s*$/.test(l)).pop()||'kein Ergebnis';const good=/ OK\s*$/.test(last)&&!/FAIL/.test(last);
  console.log((good?'✓ ':'✗ ')+f.replace(/\.js$/,'')+'  '+last);if(good)ok++;else bad.push(f)}
console.log(`\n${ok} von ${files.length} OK`+(bad.length?', nicht OK: '+bad.join(', '):''));process.exit(bad.length?1:0);
