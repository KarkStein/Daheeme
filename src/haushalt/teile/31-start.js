
// Teilen an die App (Florian 15.11.2026): Share Target aus manifest.json (?su=Link&sx=Text&st=Titel) öffnet „Rezept aus Link“ schon ausgefüllt
function shareIn(){let q;try{q=new URLSearchParams(location.search)}catch(_){return}if(!q.has("su")&&!q.has("sx"))return;
  const txt=[q.get("st"),q.get("sx"),q.get("su")].filter(Boolean).join("\n").trim();try{const u=new URL(location.href);["su","sx","st"].forEach(k=>u.searchParams.delete(k));history.replaceState(null,"",u.pathname+u.search+(S.key?"#k="+S.key:location.hash))}catch(_){}
  if(!txt)return;let n=0;const go=()=>{if(!S.config&&n++<20)return setTimeout(go,300);S.tab="essen";S.foodTab="rezepte";S.recDraft={id:null,name:"",ing:"",note:"",link:"",book:S.book||"main",paste:true,pasteText:txt};render();window.scrollTo(0,0);
    const el=document.getElementById("rec-paste");if(el){el.value=txt;const b=document.querySelector('[data-act="recparse"]');if(b)b.click()}};setTimeout(go,300)}

// ---------- Start ----------
function start(store,mode){S.store=store;S.mode=mode;let gotCfg=false,gotWeeks=false;
  const timer=setTimeout(()=>{S.timedOut=true;if(!gotCfg)S.config=S.config||null;render()},10000);
  store.listen((cfg,fromCache)=>{S.config=cfg;if(cfg&&!fromCache&&Array.isArray(cfg.tasks)&&!(cfg.mig&&cfg.mig.saug1))migSaugen(cfg);if(!fromCache){gotCfg=true;S.cfgConfirmed=true}if(gotCfg&&gotWeeks){clearTimeout(timer);S.timedOut=false}render()},
    (w,fromCache)=>{S.weeks=w;if(!fromCache)gotWeeks=true;if(gotCfg&&gotWeeks){clearTimeout(timer);S.timedOut=false}render()},
    err=>{clearTimeout(timer);toast("Verbindung zu den gemeinsamen Daten verloren. Seite neu öffnen.")},
    food=>{S.food=food||{};if(S.tab==="essen"||S.tab==="privat"||S.tab==="post"||S.tab==="settings"||S.tab==="einkauf"||S.tab==="camp"||S.tab==="ausflug"||S.tab==="projekte"||S.tab==="amhaus"||S.tab==="spiel"||S.tab==="kita"||S.tab==="musik"||S.tab==="recherchen"||S.tab==="wichtig"||S.tab==="tag"||S.tab==="listen"||S.tab==="ausgaben"||S.tab==="reisen"||S.tab==="kind")render()});
  try{fetch("wochenideen.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.wideas=j;if(S.tab==="essen")render()}}).catch(()=>{})}catch(_){}
  try{fetch("hausfunde.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.hfunde=j;if(S.tab==="amhaus")render()}}).catch(()=>{})}catch(_){}
  shareIn();
  try{fetch("ferien.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.ferien)){S.ferien=j;render()}}).catch(()=>{})}catch(_){}
  try{fetch("ausflugtipps.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.atipps=j;if(S.tab==="ausflug")render()}}).catch(()=>{})}catch(_){}
  try{fetch("reisefunde.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.rfunde=j;if(S.tab==="ausflug")render()}}).catch(()=>{})}catch(_){}
  try{fetch("ideen.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.ideas=j;if(S.tab==="essen")render()}}).catch(()=>{})}catch(_){}
}
(async()=>{let db=null;try{if(window.claude&&window.claude.use)db=await window.claude.use("db")}catch(e){db=null}
  if(db)start(dbStore(db),"db");else start(localStore(),"local")})();
})();
