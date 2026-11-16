
// ---------- Gespeicherte Orte und Arten von Terminen (Florian 16.11.2026) ----------
// Orte: food/place/<id> {name,addr,at}. Adressen nur in der Datenbank. Im Ort-Feld als Chips wählbar; 🚆 löst den Namen erst beim Tipp
// in die Adresse auf (routePick → placeAddr), die Adresse steht also nie im Bild. Gilt überall, wo ein Ort steht.
const places=()=>listOf(S.food&&S.food.place).sort((a,b)=>a.name.localeCompare(b.name,"de"));
const placeFind=n=>{const k=String(n||"").trim().toLowerCase();return k?places().find(p=>p.name.trim().toLowerCase()===k)||null:null};
const placeAddr=n=>{const p=placeFind(n);return p&&p.addr?p.addr:n};
function placeEdit(id,pre){const x=id?places().find(p=>p.id===id):null;
  editBox(x?"Ort ändern":"Ort speichern",[{k:"name",label:"Name (z. B. Kita, Kinderarzt)",type:"text",val:x?x.name:pre||""},{k:"addr",label:"Adresse (bleibt nur in eurer Datenbank)",type:"text",val:x?x.addr||"":""}],
    async V=>{const name=String(V.name||"").trim().slice(0,40),addr=String(V.addr||"").trim().slice(0,160);if(!name){toast("Bitte einen Namen eintragen.");return}
      await S.store.setPath("food/place/"+(x?x.id:newId("o")),{name,addr:addr||null,at:(x&&x.at)||Date.now(),by:S.me||""});if(S.terDraft&&(!x||S.terDraft.place===x.name))S.terDraft.place=name;toast("Ort gespeichert");render()},
    x?async()=>{await S.store.setPath("food/place/"+x.id,null);toast("Ort gelöscht");render()}:null)}
// Chips unter einem Ort-Feld: gespeicherte Orte, „＋ als Ort speichern“
function placeChips(cur){const L=places(),f=placeFind(cur);
  return `<div class="unl placechips">${L.map(p=>`<button type="button" class="chipbtn neutral" data-placeset="${esc(p.name)}" aria-pressed="${!!f&&f.id===p.id}">📍 ${esc(p.name)}${p.addr?"":" ⚠️"}</button>`).join("")}${cur&&!f?`<button type="button" class="chipbtn neutral" data-placenew="${esc(cur)}">＋ „${esc(String(cur).slice(0,24))}“ als Ort speichern</button>`:!L.length?`<button type="button" class="chipbtn neutral" data-placenew="">＋ Ort speichern</button>`:""}</div>`}
// Einstellungen › Ort und Wetter: Liste der Orte
function placeList(){const L=places();
  return `<div class="freq" style="margin-top:var(--sp3)"><b>📍 Gespeicherte Orte</b> · stehen im Termin zur Auswahl, 🚆 nimmt die Adresse.</div>${L.length?`<ul class="shop">${L.map(p=>`<li><span class="nm">📍 ${esc(p.name)}${p.addr?"":` <span class="freq">(ohne Adresse)</span>`}</span><button type="button" class="ghost small" data-placeedit="${esc(p.id)}">✎</button></li>`).join("")}</ul>`:""}<div class="btnrow"><button type="button" class="ghost small" data-placenew="">＋ Ort</button></div>`}
// Arten von Terminen: Symbol im Kalender statt 📅; Kita-Termine laufen beim Bereich Kita mit (Filter); eigene Arten über „＋ Eigene“
const TER_TAGS=[["kita","🎒","Kita"],["arzt","🩺","Arzt"],["familie","👪","Familie"],["feier","🎉","Feier"],["sport","⚽","Sport"],["arbeit","💼","Arbeit"]];
const terTags=()=>catsOf("ter",TER_TAGS);
const terTag=x=>x&&x.tag?terTags().find(t=>t[0]===x.tag)||null:null;
const terIcon=x=>{const t=terTag(x);return t?t[1]:"📅"};
function terTagHtml(d){return `<div class="fld"><span>Art</span><div class="unl">${[["","Keine"]].concat(terTags().map(t=>[t[0],t[1]+" "+t[2]])).map(o=>`<button type="button" class="chipbtn neutral" data-tertag="${esc(o[0])}" aria-pressed="${(d.tag||"")===o[0]}">${esc(o[1])}</button>`).join("")}${catBtn("ter")}</div></div>`}
