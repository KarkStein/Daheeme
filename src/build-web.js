// Builds web/index.html (standalone, Firebase REST sync) from the artifact source.
const fs=require('fs'),path=require('path');
const dir=__dirname;
const T=path.join(dir,'haushalt/teile');let s=fs.readdirSync(T).filter(f=>/^\d\d[a-z]?-/.test(f)).sort().map(f=>fs.readFileSync(path.join(T,f),'utf8')).join('');
const syncUrl=(process.argv[2]||'').replace(/\/+$/,'');
function rep(a,b){if(!s.includes(a))throw new Error('missing: '+a.slice(0,60));s=s.replace(a,b)}

rep('<meta name="claude:viewport-fit-sides" content="cover">','');
rep(':root{\n  --bg:',':root{padding-top:env(safe-area-inset-top,0px);\n  --bg:');

const fb=`
const SYNC_URL=${JSON.stringify(syncUrl)};
function fbStore(base){
  let tree={},cbs=null,opened=false;
  const setAt=(p,data)=>{const parts=p.split("/").filter(Boolean);
    if(!parts.length){tree=(data&&typeof data==="object")?data:{};return}
    let o=tree;for(let i=0;i<parts.length-1;i++){if(typeof o[parts[i]]!=="object"||o[parts[i]]===null)o[parts[i]]={};o=o[parts[i]]}
    const last=parts[parts.length-1];if(data===null||data===undefined)delete o[last];else o[last]=data};
  const emit=()=>{if(!cbs)return;const c=tree.config||null;if(c&&c.tasks&&!Array.isArray(c.tasks))c.tasks=Object.values(c.tasks);
    cbs[0](c?JSON.parse(JSON.stringify(c)):null,!opened);cbs[1](JSON.parse(JSON.stringify(tree.weeks||{})),!opened);if(cbs[3])cbs[3](JSON.parse(JSON.stringify(tree.food||{})))};
  const send=async(method,p,body)=>{const r=await fetch(base+p+".json",{method,body:JSON.stringify(body)});if(!r.ok)throw {code:r.status===401||r.status===403?"invalid_argument":"unavailable"}};
  return {
    listen(a,b,onErr,d){cbs=[a,b,onErr,d];const es=new EventSource(base+".json");
      es.addEventListener("put",e=>{const d=JSON.parse(e.data);opened=true;setAt(d.path,d.data);S.timedOut=false;emit()});
      es.addEventListener("patch",e=>{const d=JSON.parse(e.data);Object.keys(d.data||{}).forEach(k=>setAt(d.path+"/"+k,d.data[k]));emit()});
      es.addEventListener("cancel",()=>onErr({code:"revoked"}));
      es.onerror=()=>{if(opened){S.timedOut=true;render();return}
        fetch(base+"/probe.json").then(r=>{S.dbError=(r.status===401||r.status===403)?"rules":(r.ok?null:"offline")},()=>{S.dbError="offline"}).then(()=>{if(S.dbError==="rules")es.close();render()})};es.onopen=()=>{if(S.timedOut){S.timedOut=false;render()}}},
    async tick(wk,key,val){const prev=(tree.weeks&&tree.weeks[wk]&&tree.weeks[wk].ticks||{})[key];
      setAt("weeks/"+wk+"/ticks/"+key,val);emit();
      try{await send("PATCH","/weeks/"+wk+"/ticks",{[key]:val})}catch(e){setAt("weeks/"+wk+"/ticks/"+key,prev===undefined?null:prev);emit();throw e}},
    saveConfig(cfg){return send("PUT","/config",cfg)},
    async setPath(p,val){let prev=tree;p.split("/").forEach(k=>{prev=prev==null?undefined:prev[k]});prev=prev===undefined?null:JSON.parse(JSON.stringify(prev));
      setAt(p,val);emit();try{await send("PUT","/"+p,val)}catch(e){setAt(p,prev);emit();throw e}}
  }
}
function houseKey(){let k=null;const m=location.hash.match(/k=([A-Za-z0-9_-]{12,64})/);if(m)k=m[1];
  try{if(k)localStorage.setItem("hq-key",k);else k=localStorage.getItem("hq-key")}catch(e){}
  if(k&&!m){try{history.replaceState(null,"","#k="+k)}catch(e){}}return k}
function newKey(){const a=new Uint8Array(18);crypto.getRandomValues(a);return Array.from(a,x=>"abcdefghijkmnopqrstuvwxyz23456789"[x%32]).join("")}
function inviteLink(){return location.href.split("#")[0]+"#k="+S.key}
function renderSetup(){return \`<div><div class="eyebrow">Willkommen</div><h1>🏕️🧹</h1></div>
  <section class="card"><h2>Neuen Haushalt starten</h2><div>Du bekommst einen geheimen Link. Wer den Link hat, sieht und bearbeitet denselben Plan. Ein Konto braucht niemand.</div><div><button class="primary" data-act="newhouse">Haushalt starten</button></div></section>
  <section class="card"><h2>Schon eingeladen?</h2><div>Öffne den Link, den du bekommen hast, oder füge ihn hier ein.</div><div class="line" style="display:flex;gap:8px;flex-wrap:wrap"><input type="text" id="joinlink" placeholder="Link einfügen" style="flex:1 1 200px;min-width:0"><button class="ghost" data-act="join">Beitreten</button></div></section>\`}
`;
rep('function localStore(){',fb+'function localStore(){');

rep('const S={','const S={key:null,');
rep(`if(S.mode==="local")h+=\`<div class="notice">Offline-Modus: Die Daten bleiben nur auf diesem Gerät. Öffnet die App über den claude.ai-Link und meldet euch an, damit ihr beide dieselben Daten seht.</div>\`;`,
    `if(S.mode==="setup"){app.innerHTML=renderSetup();return}
  if(S.mode==="web"&&S.dbError==="rules"&&!S.cfgConfirmed){app.innerHTML=\`<section class="card"><h2>Die Datenbank lehnt den Zugriff ab</h2><div>In Firebase sind die Regeln noch nicht veröffentlicht. Öffne dort „Realtime Database“, Reiter „Regeln“, ersetze den gesamten Text durch die folgende Zeile und tippe auf „Veröffentlichen“.</div><input type="text" readonly id="rulesline" value='{"rules":{"haushalt":{"$key":{".read":true,".write":true}}}}'><div><button class="primary" data-act="reload">Erneut versuchen</button></div></section>\`;return}
  if(S.mode==="web"&&S.dbError==="offline"&&!S.cfgConfirmed){app.innerHTML=\`<section class="card"><h2>Keine Verbindung zur Datenbank</h2><div>Entweder fehlt gerade das Internet, oder die Regeln in Firebase sind noch nicht veröffentlicht. Für den zweiten Fall: Öffne in Firebase „Realtime Database“, Reiter „Regeln“, ersetze den gesamten Text durch die folgende Zeile und tippe auf „Veröffentlichen“.</div><input type="text" readonly id="rulesline" value='{"rules":{"haushalt":{"$key":{".read":true,".write":true}}}}'><div><button class="primary" data-act="reload">Erneut versuchen</button></div></section>\`;return}
  if(S.mode==="local")h+=\`<div class="notice">Der Abgleich ist noch nicht eingerichtet. Die Daten bleiben vorerst nur auf diesem Gerät.</div>\`;`);
rep('if(S.timedOut&&S.mode==="db")','if(S.timedOut&&S.mode==="web")');
rep('  const act=b.dataset.act;',`  const act=b.dataset.act;
  if(act==="reload"){location.reload();return}
  if(act==="newhouse"){enter(newKey());return}
  if(act==="join"){const m=(document.getElementById("joinlink").value||"").match(/k=([A-Za-z0-9_-]{12,64})/);if(m)enter(m[1]);else toast("Das ist kein gültiger Einladungs-Link.");return}
  if(act==="copy"){const el=document.getElementById("invite");try{await navigator.clipboard.writeText(el.value);toast("Link kopiert")}catch(_){el.focus();el.select();toast("Link markiert, jetzt kopieren")}return}`);
rep(`(async()=>{let db=null;try{if(window.claude&&window.claude.use)db=await window.claude.use("db")}catch(e){db=null}
  if(db)start(dbStore(db),"db");else start(localStore(),"local")})();`,
`function enter(k){S.key=k;try{localStorage.setItem("hq-key",k);history.replaceState(null,"","#k="+k)}catch(e){}
  start(fbStore(SYNC_URL+"/haushalt/"+k),"web");render()}
if(!SYNC_URL)start(localStore(),"local");else{const k=houseKey();if(k)enter(k);else{S.mode="setup";render()}}
window.addEventListener("hashchange",()=>{const m=location.hash.match(/k=([A-Za-z0-9_-]{12,64})/);if(m&&m[1]!==S.key)location.reload()});`);
rep('toast(e&&e.code==="invalid_argument"?"Speichern nicht erlaubt: Du brauchst Bearbeitungsrechte.":"Konnte nicht speichern. Bitte nochmal tippen.")','toast(e&&e.code==="invalid_argument"?"Speichern wurde abgelehnt. Bitte den Einladungs-Link prüfen.":"Keine Verbindung. Bitte nochmal tippen, sobald du online bist.")');
rep('toast("Speichern nicht möglich. Du brauchst Bearbeitungsrechte.")','toast("Speichern nicht möglich. Bitte Verbindung prüfen.")');

const icon="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1f4a40"/><path d="M18 33l9 9 19-21" fill="none" stroke="#f4b860" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>');
const head=`<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#1f4a40">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="🏕️🧹">
<meta name="application-name" content="🏕️🧹">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="manifest" href="manifest.json">
<style>html{color-scheme:light}body{margin:0;font-size:14px}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
`;
fs.mkdirSync(path.join(dir,'web'),{recursive:true});
fs.writeFileSync(path.join(dir,'web/index.html'),head+s+'\n</body></html>\n');
console.log('built, sync url:',syncUrl||'(none)');
