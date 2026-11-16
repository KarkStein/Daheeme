
// ---------- Gespeicherte Orte und Arten von Terminen (Florian 16.11.2026) ----------
// Orte: food/place/<id> {name,addr,at}. Adressen nur in der Datenbank. Im Ort-Feld als Chips wählbar; 🚆 löst den Namen erst beim Tipp
// in die Adresse auf (routePick → placeAddr), die Adresse steht also nie im Bild. Gilt überall, wo ein Ort steht.
const places=()=>listOf(S.food&&S.food.place).sort((a,b)=>a.name.localeCompare(b.name,"de"));
const placeFind=n=>{const k=String(n||"").trim().toLowerCase();return k?places().find(p=>p.name.trim().toLowerCase()===k)||null:null};
const placeAddr=n=>{const p=placeFind(n);return p&&p.addr?p.addr:n};
function placeEdit(id,pre,done){const x=id?places().find(p=>p.id===id):null;
  editBox(x?"Ort ändern":"Ort speichern",[{k:"name",label:"Name (z. B. Kita, Kinderarzt)",type:"text",val:x?x.name:pre||""},{k:"addr",label:"Adresse (bleibt nur in eurer Datenbank)",type:"text",val:x?x.addr||"":""}],
    async V=>{const name=String(V.name||"").trim().slice(0,40),addr=String(V.addr||"").trim().slice(0,160);if(!name){toast("Bitte einen Namen eintragen.");return}
      await S.store.setPath("food/place/"+(x?x.id:newId("o")),{name,addr:addr||null,at:(x&&x.at)||Date.now(),by:S.me||""});{const D=S.tripDraft||S.terDraft;if(done)await done(name);else if(D&&(!x||D.place===x.name))D.place=name}toast("Ort gespeichert");render()},
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
function terTagHtml(d){return `<div class="fld"><span>Art</span><div class="unl">${[["","Keine"]].concat(terTags().map(t=>[t[0],t[1]+" "+t[2]])).map(o=>`<button type="button" class="chipbtn neutral" data-tertag="${esc(o[0])}" aria-pressed="${(d.tag||"")===o[0]}">${esc(o[1])}</button>`).join("")}${catBtn("ter")}</div>${ownCats("ter").length?`<div class="freq">Eigene Art lange drücken = löschen.</div>`:""}</div>`}
// Vorschlag bei Terminen ohne Ort (Florian 16.11.2026): Arten, bei denen ein Ort Sinn hat, oder ein gespeicherter Ort steckt im Namen → 📍 in der Zeile
const PLACE_TAGS=["kita","arzt","feier","familie","sport"];
const placeGuess=n=>{const t=String(n||"").toLowerCase();return places().find(p=>p.name.length>2&&t.includes(p.name.toLowerCase()))||null};
const placeHint=e=>e.id&&!e.tent&&(PLACE_TAGS.includes(e.tag)||(e.tag&&!TER_TAGS.some(t=>t[0]===e.tag))||placeGuess(e.name))?`<button class="catbtn placehint" data-placeask="${esc(e.id)}" aria-label="Ort eintragen" style="background:none;border:none">📍</button>`:"";
function placeAsk(id){const x=termine().find(y=>y.id===id);if(!x||document.getElementById("mbox"))return;S.mboxAt=Date.now();const g=placeGuess(x.name)||(x.tag==="kita"?placeFind("Kita"):null),L=places().filter(p=>!g||p.id!==g.id);
  const set=async name=>{mboxClose();try{await S.store.setPath("food/termin/"+id+"/place",name);toast("Ort: "+name)}catch(_){toast("Konnte nicht speichern.")}render()};
  const el=document.createElement("div");el.id="mbox";el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Ort eintragen"><div class="section-head"><h2>📍 Wo ist ${esc(x.name)}?</h2></div>
    <div class="unl" style="margin:var(--sp2) 0">${(g?[g]:[]).concat(L).map((p,i)=>`<button type="button" class="chipbtn neutral" data-plpick="${esc(p.name)}"${!i&&g?' aria-pressed="true"':""}>📍 ${esc(p.name)}</button>`).join("")}<button type="button" class="chipbtn neutral" data-plnew>＋ Neuer Ort</button></div>
    <div class="freq">Neuer Ort: nur für diesen Termin oder als fester Ort (Einstellungen › Ort und Wetter).</div><div class="btnrow"><button class="ghost" type="button" data-plx>Schließen</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const p=e.target.closest("[data-plpick]");if(p){set(p.dataset.plpick);return}
    if(e.target.closest("[data-plnew]")){mboxClose();placeNewFor(x,set);return}
    if(e.target.closest("[data-plx]")){mboxClose();return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
// Neuer Ort aus dem Vorschlag (Florian 16.11.2026): Adresse eintragen, dann nur für diesen Termin oder als fester Ort speichern
function placeNewFor(x,set){editBox("Ort eintragen",[{k:"addr",label:"Adresse",type:"text",val:""},{k:"keep",label:"Speichern",type:"chips",opts:[["fest","📌 Als festen Ort speichern"],["einmal","Nur für diesen Termin"]],val:"fest"},{k:"name",label:"Name für den festen Ort (z. B. Kinderarzt)",type:"text",val:""}],
  async V=>{const addr=String(V.addr||"").trim().slice(0,160),name=String(V.name||"").trim().slice(0,40);if(!addr&&!name){toast("Bitte eine Adresse eintragen.");return}
    if(V.keep==="einmal"||!name){await set(addr||name);if(V.keep!=="einmal")toast("Ohne Namen nur für diesen Termin gespeichert.");return}
    await S.store.setPath("food/place/"+newId("o"),{name,addr:addr||null,at:Date.now(),by:S.me||""});await set(name)})}
// Familywall-Termine mit Kita, Kinderhaus, Krippe oder Kindergarten im Titel gelten als Art Kita, solange keine andere Art gewählt ist
const KITA_RX=/\b(kita|kinderhaus|kinderkrippe|krippe|kindergarten)/i;
