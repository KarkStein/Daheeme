
// Teilen an die App (Florian 15./16.11.2026): Share Target aus manifest.json (?su=Link&sx=Text&st=Titel, unverändert) öffnet „Wohin damit?“ (29a-teilen.js)
// Seit 19.11.2026 auch Dateien (PDF, .ics, Fotos): manifest teilt per POST, sw.js legt alles in den Cache „hq-share“ und leitet auf ?shared=1 um
async function shareFiles(){let st="",sx="",su="",F=[];try{const c=await caches.open("hq-share"),m=await c.match("meta");if(m){const M=await m.json();st=M.st||"";sx=M.sx||"";su=M.su||"";
    for(let i=0;i<(M.n|0);i++){const r=await c.match("f"+i);if(r){const b=await r.blob();F.push(new File([b],M.names[i]||"Datei",{type:b.type||M.types[i]||""}))}}}await caches.delete("hq-share")}catch(_){}
  return {st,sx,su,F}}
function shareIn(){let q;try{q=new URLSearchParams(location.search)}catch(_){return}
  if(q.has("shared")){try{const u=new URL(location.href);u.searchParams.delete("shared");history.replaceState(null,"",u.pathname+u.search+(S.key?"#k="+S.key:location.hash))}catch(_){}
    shareFiles().then(R=>{if(!R.st&&!R.sx&&!R.su&&!R.F.length)return;let n=0;const go=()=>{if((!S.config||!S.food)&&n++<20)return setTimeout(go,300);shareOpen(R.st.trim(),R.sx.trim(),R.su.trim(),R.F)};setTimeout(go,300)});return}
  if(!q.has("su")&&!q.has("sx"))return;
  const st=(q.get("st")||"").trim(),sx=(q.get("sx")||"").trim(),su=(q.get("su")||"").trim();try{const u=new URL(location.href);["su","sx","st"].forEach(k=>u.searchParams.delete(k));history.replaceState(null,"",u.pathname+u.search+(S.key?"#k="+S.key:location.hash))}catch(_){}
  if(!st&&!sx&&!su)return;let n=0;const go=()=>{if((!S.config||!S.food)&&n++<20)return setTimeout(go,300);shareOpen(st,sx,su)};setTimeout(go,300)}

// ---------- Start ----------
function start(store,mode){S.store=store;S.mode=mode;let gotCfg=false,gotWeeks=false;
  const timer=setTimeout(()=>{S.timedOut=true;if(!gotCfg)S.config=S.config||null;render()},10000);
  store.listen((cfg,fromCache)=>{S.config=cfg;if(cfg&&!fromCache&&Array.isArray(cfg.tasks)&&!(cfg.mig&&cfg.mig.saug1))migSaugen(cfg);else if(cfg&&!fromCache&&Array.isArray(cfg.tasks)&&!(cfg.mig&&cfg.mig.bring1))migBring(cfg);else if(cfg&&!fromCache&&Array.isArray(cfg.tasks)&&!(cfg.mig&&cfg.mig.need1))migNeed(cfg);if(!fromCache){gotCfg=true;S.cfgConfirmed=true}if(gotCfg&&gotWeeks){clearTimeout(timer);S.timedOut=false}render()},
    (w,fromCache)=>{S.weeks=w;if(!fromCache){gotWeeks=true;setTimeout(migDayFuture,1500)}if(gotCfg&&gotWeeks){clearTimeout(timer);S.timedOut=false}render()},
    err=>{clearTimeout(timer);toast("Verbindung zu den gemeinsamen Daten verloren. Seite neu öffnen.")},
    food=>{S.food=food||{};migSpiel();migShopBell();migPlayTrip();migKitaTer();migKidMed();linkTerSync();migGmCopies();geldFixBook();render()});// Florian 16.11.2026: früher nur bestimmte Bereiche, dadurch fehlten nach dem Neuladen auf Woche/Kalender/Suche Essen, Kita und Termine
  try{fetch("wochenideen.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.wideas=j;if(S.tab==="essen")render()}}).catch(()=>{})}catch(_){}
  try{fetch("hausfunde.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.hfunde=j;if(S.tab==="amhaus")render()}}).catch(()=>{})}catch(_){}
  shareIn();if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
  try{fetch("ferien.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.ferien)){S.ferien=j;render()}}).catch(()=>{})}catch(_){}
  try{fetch("ausflugtipps.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.atipps=j;if(S.tab==="ausflug")render()}}).catch(()=>{})}catch(_){}
  try{fetch("reisefunde.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.rfunde=j;if(S.tab==="ausflug")render()}}).catch(()=>{})}catch(_){}
  try{fetch("ideen.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.ideas=j;if(S.tab==="essen")render()}}).catch(()=>{})}catch(_){}
}
(async()=>{let db=null;try{if(window.claude&&window.claude.use)db=await window.claude.use("db")}catch(e){db=null}
  if(db)start(dbStore(db),"db");else start(localStore(),"local")})();
})();
