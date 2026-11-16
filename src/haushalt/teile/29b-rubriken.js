
// ---------- Eigene Rubriken und Symbole (Florian 16.11.2026, „Alle ja“) ----------
// Wie bei Musik: eigene Rubriken bei Sport und Spiel (Abschnitte), Arten von Ausflügen, Arten in der Sammlung (Reisen und Am Haus) und Ideen-Kacheln.
// Gespeichert in food/cats/<key>/<id> {ic,name,at}. Löschen setzt Einträge dieser Rubrik auf die Vorgabe (fb) zurück.
const CAT_DEFS={
  play:{lbl:"Rubrik bei Sport und Spiel",path:"play",field:"sec",fb:"sonst",ph:"z. B. Basteln",ic:"🎈"},
  trip:{lbl:"Art von Ausflug",path:"trip",field:"kind",fb:null,ph:"z. B. Burgen",ic:"🏰"},
  fund:{lbl:"Art in der Sammlung (Reisen)",path:"fund",field:"kind",fb:"sonst",ph:"z. B. Souvenirs",ic:"🧭"},
  hfund:{lbl:"Art in der Sammlung (Am Haus)",path:"fund",field:"kind",fb:"sonst",ph:"z. B. Bad",ic:"🛁"},
  idea:{lbl:"Kachel bei Ideen",path:"idea",field:"cat",fb:"sonst",ph:"z. B. Hochzeit",ic:"✨"}};
function ownCats(key){return listOf(S.food&&S.food.cats&&S.food.cats[key]).sort((a,b)=>(a.at||0)-(b.at||0)).map(x=>[x.id,x.ic||CAT_DEFS[key].ic,x.name,true])}
const catsOf=(key,base)=>base.concat(ownCats(key));
const catBtn=(key,cls)=>`<button type="button" class="${cls||"chipbtn neutral"}" data-catman="${key}" aria-label="Eigene ${esc(CAT_DEFS[key].lbl)} anlegen oder löschen">＋ Eigene</button>`;
function catManage(key){const D=CAT_DEFS[key];if(!D||document.getElementById("mbox"))return;S.mboxAt=Date.now();const el=document.createElement("div");el.id="mbox";
  const draw=()=>{const L=ownCats(key);el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Eigene Rubriken"><div class="section-head"><h2>🏷️ ${esc(D.lbl)}</h2></div>
    ${L.length?`<ul class="shop">${L.map(c=>`<li><span class="nm">${esc(c[1])} ${esc(c[2])}</span><button type="button" class="ghost small danger" data-catrm="${esc(c[0])}">✕ Löschen</button></li>`).join("")}</ul><div class="freq">Löschen nimmt die Rubrik weg; Einträge darin bleiben erhalten und rutschen nach ${D.fb?"„Sonstiges“":"„ohne Art“"}.</div>`:`<div class="freq">Noch keine eigenen. Die festen bleiben immer.</div>`}
    <form class="addrow" data-catform novalidate style="margin-top:var(--sp2)"><input data-catic maxlength="8" placeholder="${esc(D.ic)}" aria-label="Symbol" style="width:60px;flex:0 0 60px" autocomplete="off"><input data-catnm maxlength="30" placeholder="${esc(D.ph)}" aria-label="Name" autocomplete="off"><button class="primary" type="submit">＋</button></form>
    <div class="btnrow"><button class="ghost" type="button" data-catx>Fertig</button></div></div>`};
  draw();document.body.appendChild(el);
  el.addEventListener("submit",async e=>{e.preventDefault();const ic=(el.querySelector("[data-catic]").value||"").trim().slice(0,8)||D.ic,nm=(el.querySelector("[data-catnm]").value||"").trim().slice(0,30);
    if(!nm){toast("Bitte einen Namen eintragen.");return}try{await S.store.setPath("food/cats/"+key+"/"+newId("c"),{ic,name:nm,at:Date.now(),by:S.me||""});toast("Angelegt: "+nm);draw();render()}catch(_){toast("Konnte nicht speichern.")}});
  el.addEventListener("click",async e=>{const r=e.target.closest("[data-catrm]");
    if(r){if(r.dataset.sure!=="1"){r.dataset.sure="1";r.textContent="Wirklich löschen?";return}const id=r.dataset.catrm,m=(S.food&&S.food[D.path])||{};
      try{for(const k of Object.keys(m))if(m[k]&&m[k][D.field]===id)await S.store.setPath("food/"+D.path+"/"+k+"/"+D.field,D.fb);await S.store.setPath("food/cats/"+key+"/"+id,null);catGone(key,id);toast("Gelöscht");draw();render()}catch(_){toast("Konnte nicht speichern.")}return}
    if(e.target.closest("[data-catx]")){mboxClose();return}
    if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
// offene Ansicht auf eine gelöschte Rubrik zurücksetzen
function catGone(key,id){if(key==="play"&&S.playSec===id)S.playSec="sonst";if(key==="idea"&&S.projFilter===id)S.projFilter="";if(key==="trip"&&S.tripFilter===id)S.tripFilter="";if(S.tripDraft&&S.tripDraft.kind===id)S.tripDraft.kind="";if(S.playDraft&&S.playDraft.sec===id)S.playDraft.sec="sonst";if(S.projDraft&&S.projDraft.cat===id)S.projDraft.cat="sonst"}
// Eigenes Symbol (emo) an Ausflügen, Spielideen, Geschenk-Ideen, Adventskalendern und Packlisten: ein kurzes Feld in der Maske
const emoFld=(attr,val,ph)=>`<label class="fld emofld"><span>Symbol (optional)</span><input type="text" ${attr}="emo" value="${esc(val||"")}" maxlength="8" placeholder="${esc(ph||"😀")}" autocomplete="off" aria-label="Eigenes Symbol"></label>`;
const emoOf=(x,def)=>String(x&&x.emo||"").trim()||def||"";
const emoClean=v=>String(v||"").trim().slice(0,8)||null;
