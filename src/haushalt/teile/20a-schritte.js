// ---------- Am Haus: Schritte im Projekt (Florian 19.11.2026: „B: Schritte in Abschnitten“, Entwurf /mnt/project-files/design/amhaus-todos.png) ----------
// food/hstep/<id> {proj,name,sec:vor|bes|mach|ein,ord,who?:p0|p1|both,date?,buy?,done?,doneAt?,doneBy?,at,by}
// Ohne Tag bleibt der Schritt im Projekt. Mit Tag wird er ein Termin (food/termin/s_<id>, ref hstep:<id>, siehe 29h) und steht am Tag in „Heute für dich“.
// 🛒 = steht bei Weitere Listen › Baumarkt (buyLinked), Haken dort hakt den Schritt ab und bietet den Betrag an (ref hstep:<id>, zählt im Projekt-Budget).
// Gemerkte Funde des Projekts auf Favorit oder Geplant stehen ohne Kopie unter Besorgen. Haushalts-Aufgaben bleiben draußen.
const HSTEP_SEC=[["vor","Vorbereiten"],["bes","Besorgen"],["mach","Machen"],["ein","Einrichten"]];
const HSTEP_TPL=[["vor","Beide Zimmer ausmessen"],["vor","Überlegen, was wohin kommt"],["bes","Farbe, Folie und Kreppband besorgen",1],["mach","Zimmer ausräumen"],["mach","Sauber machen"],["mach","Streichen"],["mach","Möbel umziehen"],["ein","Spielsachen zusammensuchen"],["ein","Einräumen und einrichten"]];
const hstepSecI=s=>{const i=HSTEP_SEC.findIndex(x=>x[0]===s);return i<0?2:i};
const hstepsAll=()=>listOf(S.food&&S.food.hstep).filter(x=>x&&x.name&&x.proj);
function hsteps(pid){return hstepsAll().filter(x=>x.proj===pid).sort((a,b)=>hstepSecI(a.sec)-hstepSecI(b.sec)||(a.ord||0)-(b.ord||0)||(a.at||0)-(b.at||0))}
function hstepNext(pid,n){return hsteps(pid).filter(x=>!x.done).slice(0,n||2)}
function hstepCount(pid){const L=hsteps(pid);return [L.filter(x=>x.done).length,L.length]}
const hstepFunde=pid=>funde("haus").filter(f=>f.proj===pid&&(f.st==="favorit"||f.st==="geplant"));
const hstepDay=d=>{const t=ymd(new Date());return d===t?"Heute":d===ymd(addDays(new Date(),1))?"Morgen":dLabel(d)};
const hstepSub=x=>(HSTEP_SEC[hstepSecI(x.sec)]||[])[1]+(x.buy?" · 🛒 Baumarkt":"");
function hstepRow(x){return `<li class="hsrow${x.done?" done":""}"><button class="tick hstick" data-hstick="${esc(x.id)}" aria-pressed="${!!x.done}" aria-label="${esc(x.name)} ${x.done?"doch nicht erledigt":"abhaken"}">${x.done?"✓":""}</button><button class="hsname" data-hsedit="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">${esc(x.name)}</button>${x.buy&&!x.done?`<button class="chipbtn neutral buyref" data-nav="listen|bl:baumarkt" aria-label="Steht bei Weitere Listen, Baumarkt">🛒 Baumarkt</button>`:""}${x.who?pDot(x.who==="both"?"p0,p1":x.who):""}${x.date&&!x.done?`<span class="hsday">${esc(hstepDay(x.date))}</span>`:""}</li>`}
function hstepFundRow(f){const st=f.st==="geplant"?["geplant","📅 Geplant"]:["favorit","⭐ Favorit"];return `<li class="hsrow gmg"><button class="tick hstick" data-fundbought="${esc(f.id)}" aria-pressed="false" aria-label="${esc(f.name)} gekauft">${""}</button><button class="hsname" data-fundedit="${esc(f.id)}" aria-label="${esc(f.name)} bearbeiten">${esc(f.name)}<i>aus 🔖 Gemerkt${f.price?" · "+esc(f.price)+" €":""}</i></button><span class="stbadge st-${st[0]}">${st[1]}</span></li>`}
// Marine-Block „Als Nächstes“ plus Klapp-Karte „✅ Schritte“
function hstepCard(x){const L=hsteps(x.id),N=L.filter(s=>!s.done).slice(0,2),[d,n]=hstepCount(x.id),FB=hstepFunde(x.id);let h="";
  if(N.length)h+=`<div class="campback dash kiddash tripdash hsdash" aria-label="Als Nächstes">${panelHead("Als Nächstes",d+" von "+n+" Schritten erledigt","","")}<ul class="hsnext">${N.map(s=>`<li class="thr"><button class="tick hstick" data-hstick="${esc(s.id)}" aria-pressed="false" aria-label="${esc(s.name)} abhaken"></button><button class="btl" data-hsedit="${esc(s.id)}"><b>${esc(s.name)}</b><span>${esc(hstepSub(s))}</span></button>${s.who?pDot(s.who==="both"?"p0,p1":s.who):""}${s.date?`<span class="hsday">${esc(hstepDay(s.date))}</span>`:""}</li>`).join("")}</ul></div>`;
  let b="";HSTEP_SEC.forEach((sc,i)=>{const R=L.filter(s=>hstepSecI(s.sec)===i),F=i===1?FB:[],dn=R.filter(s=>s.done).length,tot=R.length+F.length;if(!tot)return;
    const k="hs_"+sc[0],on=tFoldOn(k,dn<tot);
    b+=`<div class="hssec"><button class="hssech" data-tfold="${k}" data-tdef="${dn<tot?1:0}" aria-expanded="${on}"><span>${i+1} ${sc[1]}</span><i>${dn} von ${tot}${dn===tot?" ✓":""} ${on?"▾":"›"}</i></button>${on?`<ul class="hslist">${R.map(hstepRow).join("")}${F.map(hstepFundRow).join("")}</ul>`:""}</div>`});
  if(!L.length&&!FB.length)b+=`<div class="freq">Noch keine Schritte. Schreibt auf, was zu tun ist, oder nehmt die Vorlage. Tipp auf einen Schritt = Bearbeiten, lange drücken = ✕ Löschen.</div>`;
  b+=`<div class="btnrow hsadd"><button class="ghost" data-act="hsnew">＋ Schritt</button><button class="ghost" data-act="hstpl">📋 Vorlage Zimmer umziehen</button></div>`;
  return h+foldCard("hp_steps","✅ Schritte",n?d+" von "+n:"",b,true,"hscard")}
// Fenster zum Anlegen und Bearbeiten
function hstepEdit(pid,id,pre){const x=id?(S.food.hstep||{})[id]:null;if(id&&!x)return;const o=x||pre||{},same=sec=>hsteps(pid).filter(s=>hstepSecI(s.sec)===hstepSecI(sec)&&s.id!==id);
  const pos=x?same(x.sec).filter(s=>(s.ord||0)<(x.ord||0)||((s.ord||0)===(x.ord||0)&&(s.at||0)<(x.at||0))).length+1:"";
  if(id)S.verkNext=["hstep",id,x];
  editBox(id?"✅ Schritt":"✅ Neuer Schritt",[{k:"name",label:"Was",val:o.name||"",ph:"z. B. Gästezimmer ausräumen"},{k:"sec",label:"Abschnitt",type:"chips",val:o.sec||"mach",opts:HSTEP_SEC.map((s,i)=>[s[0],(i+1)+" "+s[1]])},{k:"pos",label:"Reihenfolge (Platz im Abschnitt, leer = ans Ende)",val:pos,max:3,ph:"z. B. 1"},{k:"who",label:"Für wen",type:"chips",val:o.who||"",opts:[["","Offen"],["p0",pname("p0")],["p1",pname("p1")],["both","Beide"]]},{k:"date",label:"Wann (freiwillig, dann steht er im Kalender)",type:"date",val:o.date||""},{k:"buy",label:"Besorgen",type:"chips",val:o.buy?"1":"",opts:[["","Nein"],["1","🛒 Auf die Liste Baumarkt"]]}],
    async V=>{const name=String(V.name||"").trim().slice(0,80);if(!name){toast("Bitte eintragen, was zu tun ist.");return}const sid=id||newId("hs"),sec=HSTEP_SEC.some(s=>s[0]===V.sec)?V.sec:"mach";
      const R=same(sec),p=parseInt(V.pos,10),at=isFinite(p)&&p>=1?Math.min(p-1,R.length):R.length,v=Object.assign({},x||{},{proj:pid,name,sec,who:V.who||null,date:/^\d{4}-\d\d-\d\d$/.test(V.date)?V.date:null,buy:V.buy?true:null});
      if(!x){v.at=Date.now();v.by=S.me||""}R.splice(at,0,{id:sid});
      for(let i=0;i<R.length;i++){if(R[i].id===sid)v.ord=i;else if((R[i].ord||0)!==i||R[i].ord==null)await S.store.setPath("food/hstep/"+R[i].id+"/ord",i)}
      Object.keys(v).forEach(k=>{if(v[k]==null)delete v[k]});await S.store.setPath("food/hstep/"+sid,v);if(typeof linkTerSync==="function")linkTerSync();render()},
    id?async()=>{await hstepDel(id)}:null)}
async function hstepDel(id){const x=(S.food.hstep||{})[id];if(!x)return;await delUndo("food/hstep/"+id,"Schritt gelöscht")}
async function hstepTick(id,fromBuy){const x=(S.food.hstep||{})[id];if(!x)return;const on=!x.done;
  await S.store.setPath("food/hstep/"+id+"/done",on?true:null);await S.store.setPath("food/hstep/"+id+"/doneAt",on?Date.now():null);await S.store.setPath("food/hstep/"+id+"/doneBy",on?(S.me||""):null);render();
  if(on&&x.buy){const hp=hprojs().find(p=>p.id===x.proj);geldBought({name:x.name,cat:"wohnen",ref:"hstep:"+id,grp:"",note:hp?hp.name:""})}}
async function hstepTpl(pid){const L=hsteps(pid),have=new Set(L.map(s=>s.name)),cnt={};L.forEach(s=>{cnt[s.sec]=Math.max(cnt[s.sec]||0,(s.ord||0)+1)});let n=0,t=Date.now();
  for(const r of HSTEP_TPL){if(have.has(r[1]))continue;const v={proj:pid,name:r[1],sec:r[0],ord:cnt[r[0]]||0,at:t+n,by:S.me||""};if(r[2])v.buy=true;cnt[r[0]]=(cnt[r[0]]||0)+1;await S.store.setPath("food/hstep/"+newId("hs")+n,v);n++}
  toast(n?n+" Schritte aus der Vorlage. Alles lässt sich ändern oder löschen.":"Die Schritte der Vorlage stehen schon da.");render()}
async function hstepClick(b){const d=b.dataset;
  if(d.hstick){try{await hstepTick(d.hstick)}catch(_){toast("Konnte nicht speichern.")}return true}
  if(d.hsedit){const x=(S.food.hstep||{})[d.hsedit];if(x)hstepEdit(x.proj,d.hsedit);return true}
  if(d.act==="hsnew"&&S.hprojOpen){hstepEdit(S.hprojOpen,null);return true}
  if(d.act==="hstpl"&&S.hprojOpen){try{await hstepTpl(S.hprojOpen)}catch(_){toast("Konnte nicht speichern.")}return true}
  return false}
// Am Haus › Übersicht: je laufendem Projekt eine Zeile
function hstepOverview(){const P=hprojs().filter(p=>p.state!=="erledigt"&&p.state!=="pause").map(p=>[p,hstepNext(p.id,1)[0],hstepCount(p.id)]).filter(r=>r[1]);if(!P.length)return "";
  return `<section data-fk="f_hsnext|1" class="card"><div class="section-head"><h2>✅ Als Nächstes</h2></div><ul class="evlist hsover">${P.map(r=>`<li><button class="item" data-hproj="${esc(r[0].id)}"><span class="nm">${esc(r[0].emo||"🛋️")} ${esc(r[0].name)}<br><span class="freq">Als Nächstes: ${esc(r[1].name)}${r[1].who?" · "+esc(r[1].who==="both"?"Beide":pname(r[1].who)):""}${r[1].date?" · "+esc(hstepDay(r[1].date)):""} · ${r[2][0]} von ${r[2][1]}</span></span></button></li>`).join("")}</ul></section>`}
// „Heute für dich“: Schritte mit Tag heute bei der Person (ohne Person: bei beiden)
function hstepHeute(){const t=ymd(new Date()),t0=+startOfDay(new Date());return hstepsAll().filter(x=>x.date===t&&(!S.me||!x.who||x.who==="both"||x.who===S.me)&&(!x.done||(x.doneAt||0)>=t0)).map(x=>{const hp=hprojs().find(p=>p.id===x.proj);return hp?{hs:1,t:{id:x.id,name:x.name},done:!!x.done,sub:(hp.emo||"🛠️")+" "+hp.name}:null}).filter(Boolean)}
// Projekt gelöscht: Schritte gehen mit
async function hstepDropProj(pid){for(const s of hsteps(pid))await S.store.setPath("food/hstep/"+s.id,null)}
