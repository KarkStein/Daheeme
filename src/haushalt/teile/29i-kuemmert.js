// ---------- 🧠 Kümmert sich (Florian 19.11.2026: „top. machen“, Variante „Dezent ‚🧠 ?‘ zeigen“; Bild /mnt/project-files/design/kuemmert-sich.png) ----------
// Feld care = "p0" | "p1" | "both" | leer an: eigenen Terminen (food/termin), Familywall-Zusätzen (food/ext/fwx), Urlaub, Am-Haus-Projekt, Adventskalender.
// Kalender und Projektlisten zeigen rechts „🧠 F“ in Personenfarbe; leer bei Kind-Terminen und Projekten ein dezentes „🧠 ?“. Tipp fragt kurz und speichert sofort.
// 🔔 und Handy-Erinnerungen gehen nur an die Person, die sich kümmert (leer = wie bisher). Rückblick zählt „🧠 Gekümmert“, ohne Punkte.
const CARE_PATH={ter:"food/termin/",fw:"food/ext/fwx/",urlaub:"food/urlaub/",hproj:"food/hproj/",advent:"food/advent/"};
function careVal(kind,id){const F=S.food||{},o=kind==="fw"?((F.ext||{}).fwx||{})[id]:(F[kind==="ter"?"termin":kind]||{})[id];return o&&o.care||""}
const careOpts=()=>[["p0",pname("p0")],["p1",pname("p1")],["both","Beide"],["","Noch offen"]];
const careMe=c=>!c||!S.me||c==="both"||c===S.me;
function careTxt(c){return c==="both"?pname("p0")+" und "+pname("p1"):c?pname(c):""}
// Kleines Schild: gesetzt = Anfangsbuchstabe(n) in Personenfarbe; leer nur, wenn ask (Kind-Termin, Projekt)
function careBadge(kind,id,ask){const c=careVal(kind,id);if(!c&&!ask)return "";
  const dots=c?(c==="both"?["p0","p1"]:[c]).map(p=>`<span class="kz" style="background:${PCOL[p]}">${esc(pInit(p))}</span>`).join(""):"?";
  return `<button type="button" class="carebtn${c?"":" open"}" data-care="${kind}|${esc(id)}" aria-label="${c?"Kümmert sich: "+esc(careTxt(c))+". Tippen ändert":"Wer kümmert sich? Noch offen. Tippen wählt"}">🧠 ${dots}</button>`}
// Kalender-Zeile: eigener Termin oder Familywall; „?“ nur, wenn das Kind dabei ist
function careEv(e){if(e.tent)return "";if(e.src==="own"&&e.id)return careBadge("ter",e.id,whoL(e.who).includes("kid"));if(e.src==="ext"&&e.fw)return careBadge("fw",e.fw,whoL(e.who).includes("kid"));return ""}
function careOfEv(e){return e.src==="own"&&e.id?careVal("ter",e.id):e.src==="ext"&&e.fw?careVal("fw",e.fw):""}
// Kopf eines Projekts: „🧠 Name kümmert sich“
function careHead(kind,id){const c=careVal(kind,id);return `<button type="button" class="carehead${c?"":" open"}" data-care="${kind}|${esc(id)}">🧠 ${c?esc(careTxt(c))+(c==="both"?" kümmern sich":" kümmert sich"):"Wer kümmert sich?"}</button>`}
// Tipp: kurz fragen, sofort speichern
function careAsk(kind,id){if(!CARE_PATH[kind])return;const me=S.me||"p0",ot=me==="p0"?"p1":"p0",c=careVal(kind,id);S.mboxAt=Date.now();mboxClose();
  const L=[[me,"Ich ("+pname(me)+")"],[ot,pname(ot)],["both","Beide"],["","Noch offen"]];
  const box=document.createElement("div");box.id="mbox";box.innerHTML=`<div class="mboxcard" role="dialog" aria-label="Wer kümmert sich?"><h3>🧠 Wer kümmert sich?</h3><div class="unl">${L.map(o=>`<button type="button" class="chipbtn neutral" data-carev="${o[0]}" aria-pressed="${c===o[0]}">${esc(o[1])}</button>`).join("")}</div><div class="freq">Erinnerungen gehen dann nur an diese Person.</div><div class="btnrow"><button class="ghost" type="button" data-carex="1">Schließen</button></div></div>`;
  box.addEventListener("click",async e=>{if(e.target.closest("[data-carex]")){mboxClose();return}const b=e.target.closest("[data-carev]");if(!b){if(e.target===box)mboxClose();return}const v=b.dataset.carev;mboxClose();
    try{if(kind==="fw"){const X=Object.assign({},((S.food.ext||{}).fwx||{})[id]||{});X.care=v||null;await S.store.setPath(CARE_PATH.fw+id,X.tag||X.place||X.remind||X.care?X:null)}else await S.store.setPath(CARE_PATH[kind]+id+"/care",v||null);
      toast(v?"🧠 "+careTxt(v):"🧠 Noch offen");render()}catch(_){toast("Konnte nicht speichern.")}});
  document.body.appendChild(box)}
function careClick(b){if(!b.dataset.care)return false;const [k,...r]=b.dataset.care.split("|");careAsk(k,r.join("|"));return true}
// Rückblick: wer hat sich in diesem Zeitraum um Termine gekümmert (Tag im Zeitraum)
function careCount(a,z){const N={p0:0,p1:0},add=c=>{if(c==="both"){N.p0++;N.p1++}else if(N[c]!=null)N[c]++};
  listOf((S.food||{}).termin).forEach(t=>{if(t.care&&t.date>=a&&t.date<=z)add(t.care)});
  const fw=((S.food||{}).ext||{}).fw,X=((S.food||{}).ext||{}).fwx||{};if(fw&&fw.items)Object.keys(X).forEach(k=>{const it=fw.items[k];if(it&&X[k]&&X[k].care&&it.date>=a&&it.date<=z)add(X[k].care)});
  return N}
function careRbRow(a,z){const N=careCount(a,z);if(!N.p0&&!N.p1)return "";return `<div class="freq rbcare">🧠 Gekümmert · ${esc(pInit("p0"))} ${N.p0} · ${esc(pInit("p1"))} ${N.p1}</div>`}
// Kurzform in Kacheln (kein eigener Knopf): „🧠 F“
function careMini(kind,id){const c=careVal(kind,id);return c?"🧠 "+(c==="both"?pInit("p0")+"+"+pInit("p1"):pInit(c)):""}
