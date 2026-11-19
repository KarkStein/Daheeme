// ---------- Einkaufsliste: Kategorien und Symbole bearbeiten (Florian 16.11.2026) ----------
// food/shopcat/<id> überschreibt die festen CATS ({ic?,name?,ord?,hide?}); eigene Kategorien {ic,name,ord,own:true,at}.
// „Sonstiges“ bleibt immer (Auffang, nur umbenennen). Gelöschte feste lassen sich zurückholen. Einträge einer gelöschten Kategorie werden neu einsortiert.
function shopCats(){const O=(S.food&&S.food.shopcat)||{},L=[];
  CATS.forEach((c,i)=>{const o=O[c[0]]||{};if(o.hide&&c[0]!=="sonst")return;L.push([c[0],String(o.ic||c[1]),String(o.name||c[2]),c[3],o.ord!=null?+o.ord:(CAT_ORD[c[0]]!=null?CAT_ORD[c[0]]:i*10)])});
  Object.keys(O).forEach(k=>{const o=O[k];if(!o||!o.own||CATS.some(c=>c[0]===k))return;L.push([k,String(o.ic||"🏷️"),String(o.name||"Eigene"),[],o.ord!=null?+o.ord:75])});
  return L.sort((a,b)=>a[4]-b[4]||String(a[0]).localeCompare(String(b[0])))}
const shopCatOk=id=>!!id&&shopCats().some(c=>c[0]===id);
const shopCatOf=id=>shopCats().find(c=>c[0]===id)||shopCats().find(c=>c[0]==="sonst");
function shopCatManage(){if(document.getElementById("mbox"))return;S.mboxAt=Date.now();const el=document.createElement("div");el.id="mbox";
  const hidden=()=>{const O=(S.food&&S.food.shopcat)||{};return CATS.filter(c=>c[0]!=="sonst"&&O[c[0]]&&O[c[0]].hide)};
  const draw=()=>{const sc=(el.querySelector(".mboxcard")||{}).scrollTop||0,L=shopCats(),H=hidden();
    el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Kategorien der Einkaufsliste"><div class="section-head"><h2>🏷️ Kategorien</h2></div>
    <div class="freq">Symbol und Name direkt ändern. Pfeile ändern die Reihenfolge auf der Liste.</div>
    <ul class="shop sclist">${L.map((c,i)=>`<li><input class="scic" data-scic="${esc(c[0])}" value="${esc(c[1])}" maxlength="8" aria-label="Symbol von ${esc(c[2])}" autocomplete="off"><input class="scnm" data-scnm="${esc(c[0])}" value="${esc(c[2])}" maxlength="30" aria-label="Name" autocomplete="off">
      <button type="button" class="iconbtn" data-scmv="${esc(c[0])}" data-d="-1" aria-label="${esc(c[2])} nach oben"${i?"":" disabled"}>↑</button><button type="button" class="iconbtn" data-scmv="${esc(c[0])}" data-d="1" aria-label="${esc(c[2])} nach unten"${i<L.length-1?"":" disabled"}>↓</button>${c[0]==="sonst"?`<span class="scsp"></span>`:`<button type="button" class="iconbtn danger" data-scrm="${esc(c[0])}" aria-label="${esc(c[2])} löschen">✕</button>`}</li>`).join("")}</ul>
    ${H.length?`<div class="freq">Gelöscht: ${H.map(c=>`<button type="button" class="chipbtn neutral" data-scback="${esc(c[0])}">↺ ${esc(c[1])} ${esc(c[2])}</button>`).join(" ")}</div>`:""}
    <form class="mt2 addrow" data-scform novalidate><input data-scnewic maxlength="8" placeholder="🏷️" aria-label="Symbol" class="w60" autocomplete="off"><input data-scnewnm maxlength="30" placeholder="Neue Kategorie, z. B. Bio-Laden" aria-label="Name" autocomplete="off"><button class="primary" type="submit">＋</button></form>
    <div class="btnrow"><button class="ghost" type="button" data-scx>Fertig</button></div></div>`;if(sc){const c=el.querySelector(".mboxcard");if(c)c.scrollTop=sc}};
  draw();el._draw=draw;document.body.appendChild(el);
  const put=async(id,k,v)=>{try{await S.store.setPath("food/shopcat/"+id+"/"+k,v);render()}catch(_){toast("Konnte nicht speichern.")}};
  el.addEventListener("change",async e=>{const t=e.target,id=t.dataset.scic||t.dataset.scnm;if(!id)return;const v=String(t.value||"").trim();
    if(t.dataset.scic){await put(id,"ic",v.slice(0,8)||null)}else{if(!v){toast("Bitte einen Namen eintragen.");draw();return}await put(id,"name",v.slice(0,30))}});
  el.addEventListener("submit",async e=>{e.preventDefault();const ic=(el.querySelector("[data-scnewic]").value||"").trim().slice(0,8)||"🏷️",nm=(el.querySelector("[data-scnewnm]").value||"").trim().slice(0,30);
    if(!nm){toast("Bitte einen Namen eintragen.");return}if(shopCats().some(c=>c[2].toLowerCase()===nm.toLowerCase())){toast("Die Kategorie gibt es schon.");return}
    const L=shopCats().filter(c=>c[0]!=="sonst"),ord=(L.length?Math.max(...L.map(c=>c[4])):0)+1;
    try{await S.store.setPath("food/shopcat/"+newId("k"),{ic,name:nm,own:true,ord,at:Date.now(),by:S.me||""});toast("Angelegt: "+nm);draw();render()}catch(_){toast("Konnte nicht speichern.")}});
  el.addEventListener("click",async e=>{
    const mv=e.target.closest("[data-scmv]");if(mv){const L=shopCats(),i=L.findIndex(c=>c[0]===mv.dataset.scmv),j=i+(+mv.dataset.d);if(i<0||j<0||j>=L.length)return;
      // Reihenfolge fest durchnummerieren, dann tauschen (alte gleiche Werte stören so nicht)
      const N=L.map(c=>c[0]);[N[i],N[j]]=[N[j],N[i]];try{for(let k=0;k<N.length;k++){const c=L.find(x=>x[0]===N[k]);if(c[4]!==k*10)await S.store.setPath("food/shopcat/"+N[k]+"/ord",k*10)}}catch(_){toast("Konnte nicht speichern.")}draw();render();return}
    const rm=e.target.closest("[data-scrm]");if(rm){const id=rm.dataset.scrm,c=shopCatOf(id);if(rm.dataset.sure!=="1"){rm.dataset.sure="1";rm.textContent="Löschen?";rm.classList.add("sure");return}
      const own=!CATS.some(x=>x[0]===id),F=S.food||{};let n=0;
      try{for(const k of Object.keys(F.shop||{}))if(F.shop[k]&&F.shop[k].cat===id){await S.store.setPath("food/shop/"+k+"/cat",null);n++}
        for(const k of Object.keys(F.fav||{}))if(F.fav[k]&&F.fav[k].cat===id)await S.store.setPath("food/fav/"+k+"/cat",null);
        if(own)await S.store.setPath("food/shopcat/"+id,null);else await S.store.setPath("food/shopcat/"+id+"/hide",true);
        toast("„"+c[2]+"“ gelöscht"+(n?". "+n+(n===1?" Eintrag wurde":" Einträge wurden")+" neu einsortiert.":"."))}catch(_){toast("Konnte nicht speichern.")}draw();render();return}
    const bk=e.target.closest("[data-scback]");if(bk){try{await S.store.setPath("food/shopcat/"+bk.dataset.scback+"/hide",null);toast("Wieder da")}catch(_){toast("Konnte nicht speichern.")}draw();render();return}
    if(e.target.closest("[data-scx]")){mboxClose();return}
    if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
