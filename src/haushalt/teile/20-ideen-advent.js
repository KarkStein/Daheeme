// ---------- Ideen und Projekte (Leuchtturm) ----------
// Am Haus nur noch Einrichtung und Garten (Florian 17.11.2026); alte Werte ordnung/haus zählen als Einrichtung (HCAT_OLD)
const PROJ_CATS=[["geschenk","🎁","Geschenke"],["sonst","📎","Sonstiges"],["wohnen","🛋️","Einrichtung"],["garten","🌱","Garten"]];
const projCats=()=>catsOf("idea",PROJ_CATS);
// Begriffe (Florian 17.11.2026): Leuchtturm = Sammlung (alles Gemerkte), Geschenke = eigener Bereich in Wir (Tab geschenke, mit Adventskalender)
const PROJ_GROUPS={projekte:{get cats(){return ["sonst"].concat(ownCats("idea").map(c=>c[0]))},eye:"Am Leuchtturm",title:"Sammlung",quick:"sonst"},amhaus:{cats:["wohnen","garten"],eye:"An der Lampe",title:"Am Haus",quick:""},geschenke:{cats:["geschenk"],eye:"Wir",title:"Geschenke",quick:"geschenk"}};
const PROJ_TABS=["projekte","amhaus","geschenke"];
// Eigene Listen bei Geschenke (Florian 28.11.2026: „wie kann ich eine neue Liste anlegen? Bsp. Selbstgemachte Geschenke“, gewählt „A: Liste als Kachel“):
// food/cats/gift/<id> {ic,name}; Geschenk-Ideen tragen glist=<id>. Kachel = data-pfilter="gl:<id>", lange drücken = löschen (29b), die Ideen bleiben bei Geschenke.
const giftLists=()=>ownCats("gift");
const giftList=x=>x&&x.glist?giftLists().find(c=>c[0]===x.glist)||null:null;
function giftListEdit(id){const c=id?giftLists().find(x=>x[0]===id):null;
  editBox(c?"Liste ändern":"🎁 Neue Liste",[{k:"name",label:"Name",type:"text",val:c?c[2]:"",ph:"z. B. Selbstgemacht"},{k:"emo",label:"Symbol (ein Emoji)",type:"text",val:c?c[1]:"🎁"}],async V=>{const n=String(V.name||"").trim().slice(0,30);if(!n){toast("Bitte einen Namen eintragen.");return}const ic=emoClean(V.emo)||"🎁";
    if(c)await S.store.setPath("food/cats/gift/"+id,Object.assign({},((S.food.cats||{}).gift||{})[id],{name:n,ic}));else{const nid=newId("c");await S.store.setPath("food/cats/gift/"+nid,{ic,name:n,at:Date.now(),by:S.me||""});S.projFilter="gl:"+nid}
    toast("Gespeichert");render()},c?async()=>{await catDel("gift",id);toast("„"+c[2]+"“ gelöscht. Die Ideen bleiben bei Geschenke.");render()}:null)}
const projBack=()=>"‹ "+projGroup().title;
const HCAT_OLD={ordnung:"wohnen",haus:"wohnen"};
const projCat=x=>{const c=HCAT_OLD[x.cat]||x.cat||"sonst";return c==="spiel"||!projCats().some(p=>p[0]===c)?"sonst":c};
const projGroup=()=>PROJ_GROUPS[S.tab]||PROJ_GROUPS.projekte;
// Stand-Leiter (Florian 17.11.2026): 💡 Idee · ⭐ Favorit · 📅 Geplant (alter Wert dran zählt als Geplant), erledigt = Kästchen
const PROJ_STATE=[["idee","💡 Idee"],["favorit","⭐ Favorit"],["geplant","📅 Geplant"]];
const pjSt=s=>s==="dran"?"geplant":s||"idee";
const projs=()=>listOf(S.food&&S.food.idea);
// Einrichtungsprojekte (Am Haus › Einrichtung, Florian 15.11.2026): food/hproj/<id> {name,emo,room,state:aktuell|erledigt,budget,note,at,by}; Funde in food/fund mit area "haus" und proj
// Stand eines Projekts (Florian 15.11.2026): aktuell = läuft (alter Wert), erledigt = abgeschlossen
const HP_ST=[["idee","💡","Idee"],["geplant","📅","Geplant"],["aktuell","▶️","Läuft"],["pause","⏸️","Pausiert"],["erledigt","✅","Erledigt"]];
const hpSt=x=>HP_ST.find(s=>s[0]===(x&&x.state))||HP_ST[2];
const hprojs=()=>listOf(S.food&&S.food.hproj).sort((a,b)=>(a.at||0)-(b.at||0));
const HPROJ_EMO=["🛋️","🛏️","🍳","🛁","🧸","💻","🚪","🪴","🧺","🏡","🫙","🪚","🌱","🌳","🥕","🎪","⛺","🎁","🎨","🪑","🪔","🧰","🚲","🛝","🏊","🐔","🐝","🔥","🪵","🧹","👶","🎄","📚","🎵","🧱","🚿"];
const euro=n=>Math.round(n).toLocaleString("de-DE")+" €";
const priceOf=f=>{const v=parseFloat(String(f.price||"").replace(/\./g,"").replace(",","."));return isFinite(v)?v:0};
function hprojTiles(cat){cat=cat||"wohnen";const L=hprojs().filter(x=>hprojCat(x)===cat),A=L.filter(x=>x.state!=="erledigt"),E=L.filter(x=>x.state==="erledigt");
  const tile=x=>{const F=funde("haus").filter(f=>f.proj===x.id),open=F.filter(f=>f.st!=="gebucht").length;return `<button class="tile reisetile" data-hproj="${esc(x.id)}"><span class="te">${esc(x.emo||"🛋️")}</span><span class="tn">${esc(x.name)}</span>${x.room?`<span class="tc">🚪 ${esc(x.room)}</span>`:""}${careMini("hproj",x.id)?`<span class="tc">${careMini("hproj",x.id)}</span>`:""}${hstepCount(x.id)[1]?`<span class="tc">✅ ${hstepCount(x.id)[0]} von ${hstepCount(x.id)[1]} Schritten</span>`:""}<span class="tc">${hpSt(x)[1]} ${hpSt(x)[2]} · ${F.length?F.length+" Funde"+(open?", "+open+" offen":""):"noch leer"}</span>${x.budget?`<span class="tc">💶 ${euro(+x.budget)}</span>`:""}</button>`};
  return `<section data-fk="f_hproj|1" class="card"><div class="section-head"><h2>🧩 Projekte</h2><button class="ghost" data-act="hsamm">🔖 Gemerkt (${funde("haus").length})</button></div><div class="tiles">${A.map(tile).join("")}<button class="tile add" data-act="hprojnew"><span class="te">＋</span><span class="tn">Neues Projekt</span><span class="tc">${HCAT[cat][2]}</span></button></div>
    ${E.length?`<details class="reisedone"><summary class="section-head"><h2>✅ Erledigt</h2><span class="freq num">${E.length} ▾</span></summary><div class="tiles">${E.map(tile).join("")}</div></details>`:""}<div class="freq">Ein Projekt hat Budget, Funde und Stand. Stand ändern oder löschen: Projekt öffnen, ganz oben.</div></section>`}
function renderHProj(x){const F=funde("haus").filter(f=>f.proj===x.id),fo=F.filter(f=>f.st!=="gebucht"),fb=F.filter(f=>f.st==="gebucht"),mL=geldFor(["hproj:"+x.id].concat(F.map(f=>"fund:"+f.id),hsteps(x.id).map(s=>"hstep:"+s.id))),mR=new Set(mL.map(m=>m.ref)),sb=fb.filter(f=>!mR.has("fund:"+f.id)).reduce((a,f)=>a+priceOf(f),0)+geldSum(mL)/100,sp=fo.filter(f=>f.st==="favorit").reduce((a,f)=>a+priceOf(f),0),bud=+x.budget||0;
  const fld=(k,lab,type,ph)=>`<label class="fld"><span>${lab}</span><input ${type?`type="${type}"`:""} data-hpf="${k}" value="${esc(x[k]||"")}" placeholder="${ph||""}" autocomplete="off"></label>`;
  let h=`<div class="btnrow"><button class="ghost" data-act="hprojback">‹ ${HCAT[hprojCat(x)][0]}</button></div><div><div class="eyebrow">${esc(x.emo||"🛋️")} Projekt${x.room?" · "+esc(x.room):""}</div><h1>${esc(x.name)}</h1>${careHead("hproj",x.id)}</div>`;
  h+=hstepCard(x);
  h+=`<section class="card"><div class="section-head"><h2>📌 Stand</h2></div><div class="unl">${HP_ST.map(s=>`<button class="chipbtn" data-hpst="${s[0]}" aria-pressed="${hpSt(x)[0]===s[0]}">${s[1]} ${s[2]}</button>`).join("")}</div><div class="mt2 btnrow"><button class="ghost danger" data-act="hprojdel">🗑 Projekt löschen</button></div></section>`;
  h+=`<section data-fk="f_hpgm|1" class="card"><div class="section-head"><h2>🔖 Gemerkt fürs Projekt</h2><button class="ghost" data-fundopen="${esc(x.id)}" data-ar="haus">🔖 Alles Gemerkte</button></div><div class="freq">Alles, was ihr hier merkt, steht auch unter Am Haus › 🔖 Gemerkt und in der 🗃️ Sammlung. ✎ ändert einen Eintrag und zeigt ihn auf Wunsch auch bei Geschenke, Einkaufsliste oder Wichtig.</div>${F.some(f=>f.kind==="werkzeug"||f.kind==="material")?`<div class="btnrow"><button class="ghost" data-nav="listen|bl:baumarkt">🧰 Werkzeug und Material: Einkauf › Baumarkt</button></div>`:""}${fo.length?`<ul class="evlist fundlist">${fo.map(f=>fundLi(f,"proj","haus")).join("")}</ul>`:`<div class="freq">Link aus einem Shop oder einfach ein Name. Das Schild rechts zeigt den Stand: 💡 Idee, ⭐ Favorit, 📅 Geplant, ✅ Erledigt (gekauft).</div>`}${fundForm("hpfundform",x.id,"haus")}</section>`;
  if(fb.length)h+=`<section class="card"><div class="section-head"><h2>✅ Erledigt <span class="freq">gekauft</span></h2><span class="freq num">${euro(sb)}</span></div><ul class="evlist fundlist">${fb.map(f=>fundLi(f,"proj","haus")).join("")}</ul></section>`;
  h+=`<section data-fk="f_hpbud|1" class="card"><div class="section-head"><h2>💶 Budget</h2></div><div class="freq">${bud?`${euro(sb)} ausgegeben von ${euro(bud)}`:`${euro(sb)} ausgegeben`}${sp?` · ⭐ Favoriten ${euro(sp)}`:""}</div>${bud?`<div class="bar"><span style="width:${Math.min(100,sb/bud*100).toFixed(0)}%"></span></div>`:""}<div class="freq">Rechnet mit eingetragenen Ausgaben und den Preisen gekaufter Funde ohne Ausgabe (⭐ = Favorit, noch nicht gekauft).</div>${geldSrcRow("hproj:"+x.id,{name:x.name,cat:"wohnen",grp:""})}${splitChips("hproj:"+x.id)}${splitFor("hproj:"+x.id).length?"":splitAddForm("hproj:"+x.id)}</section>`;
  h+=`<section data-fk="f_hpeck|0" class="card"><div class="section-head"><h2>✏️ Eckdaten</h2></div>${fld("name","Name")}${fld("room","Raum","","z. B. Wohnzimmer")}${fld("budget","💶 Budget (€)","number","z. B. 800")}
    <div class="fld"><span>Symbol</span><div class="unl">${HPROJ_EMO.map(e=>`<button class="chipbtn neutral" data-hpemo="${e}" aria-pressed="${(x.emo||"🛋️")===e}">${e}</button>`).join("")}</div></div>
    <label class="fld"><span>Oder eigenes Symbol (jedes Emoji von der Tastatur)</span><input data-hpf="emo" value="${esc(HPROJ_EMO.includes(x.emo)?"":x.emo||"")}" placeholder="z. B. 🦖" maxlength="8" autocomplete="off" class="mw8"></label>
    <label class="fld"><span>Notiz</span><textarea data-hpf="note" rows="3" placeholder="Maße, Farben, Ideen">${esc(x.note||"")}</textarea></label></section>`;
  return h}
// Überblick aller laufenden Projekte am Leuchtturm (Florian 15.11.2026, Variante A): Projekte bleiben im Bereich, hier nur Übersicht und Sprung
function projAll(){const L=[];
  hprojs().filter(x=>x.state!=="erledigt").forEach(x=>{const c=hprojCat(x),F=funde("haus").filter(f=>f.proj===x.id),bought=F.filter(f=>f.st==="gebucht").reduce((a,f)=>a+priceOf(f),0);L.push({emo:x.emo||HCAT[c][1],name:x.name,area:"Am Haus · "+HCAT[c][0],info:hpSt(x)[2]+" · "+(F.length?F.length+" Funde":"noch leer")+(x.budget?" · "+euro(bought)+" von "+euro(+x.budget):""),attr:`data-hproj="${esc(x.id)}"`,care:["hproj",x.id],at:x.at||0})});
  urlaube().filter(u=>reiseSt(u)==="aktuell").forEach(u=>{const nd=u.from?reiseDays(u):null;L.push({emo:u.emo||"⛵",name:u.name,area:"Reisen · Urlaub",info:u.from?(nd&&nd.n>0?"in "+nd.n+" Tagen":dLabel(u.from)):"noch ohne Datum",attr:`data-reise="${esc(u.id)}"`,care:["urlaub",u.id],at:u.at||0})});
  advCals().filter(c=>c.year===advYear()).forEach(c=>{const D=Object.values(advDoors(c.id));L.push({emo:"🎄",name:c.name,area:"Geschenke · Adventskalender",info:D.length+" von 24 gefüllt · "+D.filter(x=>x.st!=="idee").length+" besorgt",attr:`data-advgo="${esc(c.id)}"`,care:["advent",c.id],at:c.at||0})});
  return L}
function projOverview(){const L=projAll();
  const neu=[["🛋️","Einrichtung","amhaus|pf:wohnen"],["🌱","Garten","amhaus|pf:garten"],["⛵","Urlaub","ausflug|tt:urlaub"],["🎄","Advent","geschenke|pf:advent"]];
  return `<div class="btnrow"><button class="ghost" data-pfilter="">${projBack()}</button></div><section class="card"><div class="section-head"><h2>🧩 Alle Projekte</h2><span class="freq num">${L.length}</span></div>
    ${L.length?`<ul class="evlist">${L.map(x=>`<li><button class="ev" ${x.attr}><span>${x.emo} <b>${esc(x.name)}</b><br><span class="freq">${esc(x.area)} · ${esc(x.info)}</span></span></button>${x.care?careBadge(x.care[0],x.care[1],true):""}<i class="freq">›</i></li>`).join("")}</ul>`:`<div class="freq">Noch keine laufenden Projekte.</div>`}
    <div class="mt2 mb1 freq">Neues Projekt in …</div><div class="unl">${neu.map(n=>`<button class="chipbtn neutral" data-nav="${n[2]}">${n[0]} ${n[1]}</button>`).join("")}</div>
    <div class="mt2 freq">Jedes Projekt lebt in seinem Bereich, hier seht ihr alle auf einen Blick. Stand ändern oder löschen geht im Projekt selbst.</div></section>`}
function projAllTile(){const L=projAll();return `<button class="tile" data-pfilter="alle"><span class="te">🧩</span><span class="tn">Alle Projekte</span><span class="tc">${L.length?L.length+" laufen":"noch keins"}</span></button>`}
// Sammlung am Leuchtturm (Florian 17.11.2026): alles Gemerkte aus allen Bereichen auf einen Blick, mit Filtern nach Bereich und Stand.
// Nur Ansicht: die Einträge bleiben in ihren Bereichen (food/fund, food/idea, food/trip, food/play, food/music, food/rec). Neue Datenart = eine Zeile in sammAll.
const SAMM_AREAS=[["reise","🧭","Ausflüge und Reisen"],["haus","🛠️","Am Haus"],["geschenke","🎁","Geschenke"],["spiel","⚽","Spielen"],["musik","🎵","Musik"],["sonst","📎","Sonstiges"],["rezepte","📖","Rezepte"]];
const SAMM_ST=[["idee","💡","Idee"],["favorit","⭐","Favorit"],["geplant","📅","Geplant"],["erledigt","✅","Erledigt"]];
function sammAll(){const L=[],add=(ar,o)=>L.push(Object.assign({ar,at:0},o)),fst=s=>s==="gebucht"?"erledigt":s||"idee";
  funde("reise").forEach(f=>{const k=fundKind(f.kind,"reise"),u=f.reise&&urlaube().find(y=>y.id===f.reise);add("reise",{ic:k[1],name:f.name,sub:k[2]+(u?" · "+(u.emo||"⛵")+" "+u.name:"")+(f.st==="gebucht"?" · gebucht":""),st:fst(f.st),attr:u?`data-reise="${esc(u.id)}"`:`data-nav="ausflug|tt:recherche"`,at:f.at})});
  trips().forEach(x=>{const k=tripKinds().find(c=>c[0]===x.kind);add("reise",{ic:emoOf(x,k?k[1]:"🚲"),name:x.name,sub:"Ausflugsziel"+(x.date&&!x.done?" · "+dLabel(x.date):""),st:tripSt(x),attr:`data-nav="ausflug|tt:ideen"`,at:x.at})});
  funde("haus").forEach(f=>{const k=fundKind(f.kind,"haus"),p=f.proj&&hprojs().find(y=>y.id===f.proj);add("haus",{ic:k[1],name:f.name,sub:k[2]+(p?" · "+(p.emo||"🛋️")+" "+p.name:"")+(f.st==="gebucht"?" · gekauft":""),st:fst(f.st),attr:p?`data-hproj="${esc(p.id)}"`:`data-nav="amhaus|hs:wohnen"`,at:f.at})});
  projs().forEach(x=>{const c=projCat(x),pc=projCats().find(p=>p[0]===c)||PROJ_CATS[1],ar=c==="geschenk"?"geschenke":HCAT[c]?"haus":"sonst";
    add(ar,{ic:x.emo||pc[1],name:x.name,sub:ar==="geschenke"?(giftFor(x)||"Geschenk"):ar==="haus"?pc[2]+" · ohne Projekt":pc[2],st:x.done?"erledigt":pjSt(x.state),attr:ar==="geschenke"?`data-nav="geschenke|"`:`data-nav="${ar==="haus"?"amhaus":"projekte"}|pf:${esc(c)}"`,at:x.at})});
  plays().forEach(x=>{const s=playSecs().find(p=>p[0]===playSecOf(x))||playSecs()[0];add("spiel",{ic:x.emo||s[1],name:x.name,sub:s[2],st:playSt(x),attr:`data-nav="spiel|ps:${esc(s[0])}"`,at:x.at})});
  musics().forEach(x=>{const a=musArt(x);add("musik",{ic:x.emo||a[1],name:x.name,sub:a[2]+(x.like?" · 💛 gerade beliebt":""),st:a[0]==="hoer"?(x.st||"idee"):x.fav?"favorit":"idee",attr:`data-nav="musik|ma:${a[0]}"`,at:x.at})});
  return L.sort((a,b)=>(b.at||0)-(a.at||0))}
function sammHtml(){const F=S.sammF||(S.sammF={a:"",s:""}),L=sammAll();
  const R=F.a==="rezepte"?recs().slice().sort((a,b)=>(a.name||"").localeCompare(b.name||"","de")).map(r=>({ar:"rezepte",ic:"📖",name:r.name,sub:"Rezept",st:"",attr:`data-openrec="${esc(r.id)}"`})):L.filter(x=>(!F.a||x.ar===F.a)&&(F.s?x.st===F.s:x.st!=="erledigt"));
  const cnt=a=>a==="rezepte"?recs().length:L.filter(x=>x.ar===a&&x.st!=="erledigt").length,n=F.more?R.length:Math.min(R.length,30);
  const chip=(k,v,lab,on)=>`<button class="chipbtn neutral" data-sammf="${k}|${v}" aria-pressed="${!!on}">${lab}</button>`;
  const stL=s=>SAMM_ST.find(x=>x[0]===s);
  return `<section data-fk="f_samm|1" class="card sammcard"><div class="section-head"><h2>🔖 Alles Gemerkte</h2><span class="freq num">${L.filter(x=>x.st!=="erledigt").length}</span></div>
    <div class="unl scrollrow">${chip("a","","Alle",!F.a)}${SAMM_AREAS.filter(a=>cnt(a[0])).map(a=>chip("a",a[0],a[1]+" "+a[2],F.a===a[0])).join("")}</div>
    ${F.a==="rezepte"?"":`<div class="unl scrollrow">${chip("s","","Offen",!F.s)}${SAMM_ST.map(s=>chip("s",s[0],s[1]+" "+s[2],F.s===s[0])).join("")}</div>`}
    ${R.length?`<ul class="mklist">${R.slice(0,n).map(x=>{const st=stL(x.st),ar=SAMM_AREAS.find(a=>a[0]===x.ar);return `<li class="mk"><button class="mkb" ${x.attr}><span class="mki">${esc(x.ic)}</span><span class="mkt"><b>${esc(x.name)}</b><span class="freq">${F.a?"":ar[1]+" "}${esc(x.sub||"")}</span></span>${st?`<span class="stbadge st-${st[0]}">${st[1]} ${st[2]}</span>`:""}</button></li>`}).join("")}</ul>${R.length>n?`<button class="ghost" data-sammf="more|1">Alle ${R.length} zeigen</button>`:""}`:`<div class="freq">Hier ist nichts${F.s?" mit diesem Stand":""}.</div>`}
    <div class="freq">Alles, was ihr euch in einem Bereich merkt, steht auch hier. Ein Tipp öffnet den Eintrag in seinem Bereich.</div></section>`}
function renderProjects(){const d=S.projDraft;
  if(S.tab==="projekte"&&(S.projFilter==="geschenk"||S.projFilter==="advent"))S.tab="geschenke";if(S.tab==="amhaus"&&HCAT_OLD[S.projFilter])S.projFilter="wohnen";
  // Am Haus: Seiten-Leiste unten Übersicht | Einrichtung | Garten | Gemerkt (Florian 19.11.2026: „Am Haus auch entsprechend anpassen“)
  const hpg=S.tab==="amhaus"?navPager("Am Haus",[["Übersicht","amhaus|",!HCAT[S.projFilter]],["Einrichtung","amhaus|pf:wohnen",S.projFilter==="wohnen"&&!S.hsamm],["Garten","amhaus|pf:garten",S.projFilter==="garten"&&!S.hsamm],["Gemerkt","amhaus|hs:wohnen",!!S.hsamm]]):"";
  const G=projGroup();let h=`${hpg}${S.tab==="geschenke"||S.tab==="projekte"?areaPager(S.tab):""}<div><div class="eyebrow">${G.eye}</div><h1>${G.title}</h1></div>${bellRow(S.tab)}`;
  if(d){const one=(f,L)=>`<div class="unl">${L.map(c=>`<button class="chipbtn" data-pset="${f}" data-v="${c[0]}" aria-pressed="${(f==="state"?pjSt(d[f]):d[f])===c[0]}">${c.length>=3?c[1]+" "+c[2]:c[1]}</button>`).join("")}</div>`;
    return h+`<section class="card tripform"><h2>${d.id?"Bearbeiten":"Neue Idee"}</h2>
    <label class="fld"><span>Was</span><input type="text" id="pj-name" data-pf="name" value="${esc(d.name)}" maxlength="80" placeholder="Zum Beispiel Regal für den Flur" autocomplete="off"></label>${d.cat==="geschenk"?emoFld("data-pf",d.emo,"🎁"):""}
    <div class="fld"><span>Bereich</span>${one("cat",projCats().filter(c=>G.cats.includes(c[0])))}</div>
    <div class="fld"><span>Stand</span>${one("state",PROJ_STATE)}</div>
    ${d.cat==="geschenk"?`<div class="fld"><span>Für wen</span>${one("who",whoOpts().filter(o=>o[0]!=="both").map(o=>[o[0],o[1]]))}</div><label class="fld"><span>Oder für jemand anderen, und zu welchem Anlass?</span><input type="text" id="pj-for" data-pf="for" value="${esc(d.for)}" maxlength="60" placeholder="Zum Beispiel Oma, Weihnachten" autocomplete="off"></label>${giftLists().length?`<div class="fld"><span>Liste</span>${one("glist",[["","Keine"]].concat(giftLists()))}</div>`:""}`:""}
    <label class="fld"><span>Link</span><input type="url" id="pj-link" data-pf="link" value="${esc(d.link)}" placeholder="https://…" autocomplete="off"></label>
    <label class="fld"><span>Notiz</span><textarea id="pj-note" data-pf="note" rows="4" placeholder="Maße, Preis, nächste Schritte">${esc(d.note)}</textarea></label>
    ${gmMaskRow("idea",d.id)}
    <div class="btnrow"><button class="primary" data-act="projsave">Speichern</button><button class="ghost" data-act="projcancel">Abbrechen</button></div>${d.id?maskFoot(verkHtml("idea",d.id,projs().find(x=>x.id===d.id)),`data-move="idea|${esc(d.id)}"`,`data-act="projdel"`):""}</section>`}
  const all=projs();let F=S.projFilter||"",GL=null;if(S.tab==="geschenke"&&F!=="advent"){if(F.startsWith("gl:")){GL=giftLists().find(c=>c[0]===F.slice(3))||null;if(!GL)S.projFilter=""}F="geschenk"}
  if(F==="advent")return h+renderAdvent();
  if(F==="alle")return h+projOverview();
  if(S.tab==="amhaus"&&HCAT[F]){const hp=S.hprojOpen&&hprojs().find(x=>x.id===S.hprojOpen);if(hp)return h+renderHProj(hp);S.hprojOpen=null;if(S.hsamm)return h+renderSammlung("haus")}
  if(!F){const cnt=k=>all.filter(x=>!x.done&&projCat(x)===k).length;
    if(G.quick)h+=inboxCard();
    if(G.quick)h+=`<form class="addrow" id="projform" novalidate><input type="text" id="projinput" placeholder="Schnell notieren, sortieren später" value="${esc(S.projText)}" autocomplete="off" enterkeyhint="done" aria-label="Neue Idee"><button class="primary" type="submit">Merken</button></form>`;
    const hpN=k=>S.tab==="amhaus"?hprojs().filter(p=>hprojCat(p)===k&&p.state!=="erledigt").length:0,tcTxt=k=>{const n=cnt(k),p=hpN(k),a=[];if(p)a.push(p+(p===1?" Projekt":" Projekte"));if(n)a.push(n+" offen");return a.join(" · ")||"leer"};
    h+=`<div class="tiles">${projCats().filter(k=>G.cats.includes(k[0])).map(k=>`<button class="tile" data-pfilter="${k[0]}"><span class="te">${k[1]}</span><span class="tn">${k[2]}</span><span class="tc">${tcTxt(k[0])}</span></button>`).join("")}${S.tab==="amhaus"?(()=>{const n=funde("haus").length;return `<button class="tile" data-nav="amhaus|hs:wohnen"><span class="te">🔖</span><span class="tn">Gemerkt</span><span class="tc">${n?n+" Dinge":"leer"}</span></button>`})():""}${S.tab==="projekte"?projAllTile()+`<button class="tile add" data-catman="idea" aria-label="Eigene Kachel anlegen oder löschen"><span class="te">＋</span><span class="tn">Eigene Kachel</span><span class="tc">anlegen, löschen</span></button>`:""}</div>`;
    if(S.tab==="amhaus")h+=hstepOverview();
    const dn=all.filter(x=>x.done&&G.cats.includes(projCat(x))).length;if(dn)h+=`<div class="txc freq">${dn} erledigt. Ihr findet sie in den Kacheln.</div>`;
    if(S.tab==="projekte")h+=sammHtml();
    return h}
  const cat=projCats().find(k=>k[0]===F)||PROJ_CATS[1],inCat=x=>projCat(x)===F&&(!GL||x.glist===GL[0]),open=all.filter(x=>!x.done&&inCat(x)),done=all.filter(x=>x.done&&inCat(x)).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const ord=x=>{const i=PROJ_STATE.findIndex(s=>s[0]===pjSt(x.state));return i<0?0:-i};open.sort((a,b)=>ord(a)-ord(b)||(a.at||0)-(b.at||0));
  const card=x=>{const l=safeLink(x.link),st=PROJ_STATE.find(s=>s[0]===pjSt(x.state))||PROJ_STATE[0];
    return `<li class="${x.done?"done":""}"><button class="item" data-projdone="${esc(x.id)}" aria-pressed="${!!x.done}" aria-label="${esc(x.name)}: ${x.done?"doch nicht erledigt":"erledigt"}"><span class="box">${x.done?"✓":""}</span><span class="nm">${x.emo?esc(x.emo)+" ":""}${esc(x.name)}${(gs=>gs?`<br><span class="freq">${esc(gs)}</span>`:"")([giftFor(x),!GL&&giftList(x)?giftList(x)[1]+" "+giftList(x)[2]:""].filter(Boolean).join(" · "))}${gmShow(x).length?`<br><span class="freq">${esc(gmAlso(x).slice(3))}</span>`:""}${x.note&&!x.done?`<br><span class="freq">${telNote(x.note)}</span>`:""}</span></button>${telA(x.note)}${x.done?"":`<button class="stbadge st-${st[0]}" data-projstate="${esc(x.id)}" aria-label="Stand: ${st[1]}, antippen zum Weiterschalten">${st[1]}</button>`}${l?`<a class="catbtn" href="${esc(l)}" target="_blank" rel="noopener" aria-label="Link öffnen">🔗</a>`:""}${x.done?"":bell(S.tab,x)}${!x.done&&HCAT[projCat(x)]?`<button class="catbtn" data-proj2hp="${esc(x.id)}" aria-label="${esc(x.name)} zum Projekt machen">🧩</button>`:""}<button class="rm" data-projedit="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">✎</button></li>`};
  h+=S.tab==="geschenke"&&GL?`<div class="btnrow"><button class="ghost" data-pfilter="">‹ Geschenke</button></div><div class="aic section-head"><h2 class="m0">${esc(GL[1])} ${esc(GL[2])}</h2><button class="catbtn" data-glistedit="${esc(GL[0])}" aria-label="Name und Symbol ändern">✎</button></div>`:S.tab==="geschenke"?`<div class="tiles">${advTile()}<button class="tile" data-nav="listen|bl:geschenke"><span class="te">🛍️</span><span class="tn">Zum Kaufen</span><span class="tc">Einkauf › Geschenke</span></button>${(()=>{const H=musics().filter(m=>m.art==="hoer"),g=H.filter(m=>m.st==="geplant").length;return `<button class="tile" data-nav="musik|ma:hoer"><span class="te">🎧</span><span class="tn">Hörspiele und Tonies</span><span class="tc">${g?g+" geplant":H.length?H.length+" bei Musik":"bei Musik"}</span></button>`})()}${giftLists().map(c=>{const n=all.filter(x=>!x.done&&x.glist===c[0]&&projCat(x)==="geschenk").length;return `<button class="tile" data-pfilter="gl:${esc(c[0])}"><span class="te">${esc(c[1])}</span><span class="tn">${esc(c[2])}</span><span class="tc">${n?n+" offen":"leer"}</span></button>`}).join("")}<button class="tile add" data-act="glistnew" aria-label="Eigene Liste anlegen"><span class="te">＋</span><span class="tn">Neue Liste</span><span class="tc">z. B. Selbstgemacht</span></button></div><div class="freq">Steht ein Geschenk, Hörspiel oder Tonie auf 📅 Geplant, erscheint es zum Kaufen bei Einkauf › Weitere Listen › Geschenke.</div>`:`<div class="btnrow"><button class="ghost" data-pfilter="">${projBack()}</button></div><h2 class="m0">${cat[1]} ${esc(cat[2])}</h2>`;
  const hp=S.tab==="amhaus"&&HCAT[F];
  if(hp){h+=hprojTiles(F);
    h+=`<section data-fk="f_hlose|1" class="card"><div class="section-head"><h2>🔖 Lose gemerkt</h2><span class="freq num">${open.length||""}</span></div><form class="addrow" id="projform" novalidate><input type="text" id="projinput" placeholder="Kurz notieren, sortieren später" value="${esc(S.projText)}" autocomplete="off" enterkeyhint="done" aria-label="Merken bei ${esc(cat[2])}"><button class="primary" type="submit">Merken</button></form>
      ${open.length?`<ul class="shop">${open.map(card).join("")}</ul><div class="freq">Schild rechts: 💡 Idee, ⭐ Favorit, 📅 Geplant. Kästchen: ✅ erledigt. 🧩 macht ein Projekt daraus.</div>`:`<div class="freq">Was kein ganzes Projekt ist, hier kurz merken.</div>`}</section>`;
    if(done.length)h+=`<details class="card reisedone"><summary class="section-head"><h2>✅ Erledigt</h2><span class="freq num">${done.length} ▾</span></summary><ul class="shop">${done.map(card).join("")}</ul></details>`;
    return h}
  h+=`<form class="addrow" id="projform" novalidate><input type="text" id="projinput" placeholder="Neu bei ${esc(GL?GL[2]:cat[2])}" value="${esc(S.projText)}" autocomplete="off" enterkeyhint="done" aria-label="Neue Idee bei ${esc(cat[2])}"><button class="primary" type="submit">Merken</button></form>`;
  const GG=S.tab==="geschenke"&&!GL?gmGuests("geschenke").filter(i=>i.st!=="erledigt"):[];
  h+=open.length||GG.length?`<section data-fk="f_gopen|1" class="card"><div class="section-head"><h2>Offen</h2><span class="freq num">${open.length+GG.length}</span></div>${open.length?`<ul class="shop">${open.map(card).join("")}</ul>`:""}${GG.length?`<ul class="mklist gmlist">${GG.map(i=>gmRow(i,"geschenke")).join("")}</ul>`:""}<div class="freq">Das Schild rechts schaltet weiter: 💡 Idee, ⭐ Favorit, 📅 Geplant. Das Kästchen links heißt ✅ erledigt.${S.tab==="amhaus"?" 🧩 macht aus einer Idee ein Projekt.":""}</div></section>`
    :`<div class="empty"><h2>Hier ist noch nichts</h2><div>Tippt oben ein, was euch einfällt. Es landet direkt bei ${esc(cat[2])}.</div></div>`;
  if(done.length)h+=`<section class="card"><div class="section-head"><h2>✅ Erledigt</h2><span class="freq num">${done.length}</span></div><ul class="shop">${done.map(card).join("")}</ul></section>`;
  return h}
// ---------- Adventskalender (Ideen › 🎄, Florian 15.11.2026) ----------
// food/advent/<id> {name,for:kid|p0|p1,kind:selbst|gekauft,year,budget?,at,by}; food/adoor/<cal>_<tag> {cal,day,name,kind,st:idee|besorgt|eingepackt,price?,at,by}
const ADV_KIND=[["klein","🧸","Kleinigkeit"],["suess","🍫","Süßes"],["aktiv","🎨","Zusammen machen"],["buch","📖","Buch oder Geschichte"]];
const ADV_ST=[["idee","Idee","💡"],["besorgt","Besorgt","🛍️"],["eingepackt","Erledigt","✅"]];
const ADV_IDEAS=["Plätzchen backen","Lichterspaziergang","Weihnachtsmarkt","Schneemann basteln","Sticker","Knete","Pixi-Buch","Badekreide","Kleine Taschenlampe","Seifenblasen","Mandarine und Nüsse","Schokotaler","Weihnachtsgeschichte vorlesen","Sterne ausschneiden","Puzzle","Malstifte","Haarspange","Tannenbaum schmücken","Lebkuchen verzieren","Kinderpunsch und Kerze","Schlitten fahren oder Winterspaziergang","Kinderkino oder Puppentheater","Glitzer-Tattoos","Kleines Kuscheltier","Weihnachtslieder singen","Fingerpuppe","Holzfigur für die Krippe","Bratapfel machen","Wunschzettel malen","Tierpark-Besuch","Fensterbilder malen","Mini-Bilderbuch"];
const advOut=n=>/markt|spazier|schlitten|kino|theater|besuch|tierpark|zoo|ausflug|eislauf|lichter/i.test(String(n||""));
const ADV_NEED={nikolaus:"Nüsse\nMandarinen\nSchokonikolaus\nLebkuchen","plätzchen":"Mehl\nButter\nZucker\nEier\nAusstechformen","lebkuchen verzier":"Lebkuchen\nZuckerschrift\nStreusel","punsch":"Kinderpunsch\nTeelicht"};
const advNeedDef=n=>{n=String(n||"").toLowerCase();const k=Object.keys(ADV_NEED).find(k=>n.includes(k));return k?ADV_NEED[k]:""};
const advNeed=x=>String(x&&x.need||"").split(/\n/).map(l=>l.trim()).filter(Boolean);
const advSrc=d=>"Adventskalender: Türchen "+d;
const advCals=()=>listOf(S.food&&S.food.advent).sort((a,b)=>(b.year||0)-(a.year||0)||(a.at||0)-(b.at||0));
const advYear=()=>new Date().getFullYear();
const advKind=n=>{n=String(n||"").toLowerCase();return /backen|spazier|markt|bastel|tierpark|singen|malen|theater|bratapfel|schneemann|ausschneid|schmück|verzier|schlitten|kino|besuch|singen|gutschein|punsch|ausflug/.test(n)?"aktiv":/buch|pixi|geschichte|vorlesen/.test(n)?"buch":/schoko|lebkuchen|bonbon|keks|süß|nüss|nuss|mandarine|marzipan/.test(n)?"suess":"klein"};
function advDoors(cal){const raw=(S.food&&S.food.adoor)||{},o={};Object.keys(raw).forEach(k=>{const v=raw[k];if(v&&v.cal===cal&&v.day)o[v.day]=Object.assign({id:k},v)});return o}
const advForLbl=c=>c.for==="kid"?"Kind":pname(c.for);
// Füreinander: wer beschenkt wird, sieht ungeöffnete Türchen nicht
function advHidden(c,day){if(!c||c.for==="kid"||c.for!==S.me)return false;const n=new Date();return !(n.getFullYear()>(c.year||0)||(n.getMonth()===11&&n.getDate()>=day&&n.getFullYear()===(c.year||0)))}
function advToday(c){const n=new Date();return c&&n.getFullYear()===(c.year||0)&&n.getMonth()===11&&n.getDate()<=24?n.getDate():0}
function advCur(){const L=advCals(),y=advYear();let c=S.advCal&&L.find(x=>x.id===S.advCal);if(!c)c=L.find(x=>x.year===y&&x.for===(S.me==="p0"?"p1":S.me==="p1"?"p0":"kid"))||L.find(x=>x.year===y&&x.for==="kid")||L.find(x=>x.year===y);return c||null}
async function advSet(cal,day,patch){const k=cal.id+"_"+day,cur=advDoors(cal.id)[day]||{};const v=Object.assign({cal:cal.id,day},cur,patch,{at:Date.now(),by:S.me||""});delete v.id;if(!v.name&&patch.name==null)v.name=cur.name||"";
  if(patch.name!=null&&!patch.kind&&!cur.kind)v.kind=advKind(patch.name);if(patch.name&&!cur.name&&v.need==null){const nd=advNeedDef(patch.name);if(nd)v.need=nd}if(!v.st)v.st=cal.kind==="gekauft"?"eingepackt":"idee";
  try{await S.store.setPath("food/adoor/"+k,v.name?v:null)}catch(_){toast("Konnte nicht speichern.")}}
async function advNew(forWho,kind){const id=newId("a"),y=advYear();const name=kind==="gekauft"?"Gekaufter Kalender":forWho==="kid"?"Adventskalender":"Für "+pname(forWho);
  try{await S.store.setPath("food/advent/"+id,{name,for:forWho,kind,year:y,at:Date.now(),by:S.me||""});
    const due=y+"-11-30";if(kind!=="gekauft"&&ymd(new Date())<due)await S.store.setPath("food/prio/"+newId("p"),{name:"Adventskalender fertig einpacken",from:"projekte",ref:"advent:"+id,due,at:Date.now(),by:S.me||""});
    S.advCal=id;S.advDoor=null;render()}catch(_){toast("Konnte nicht speichern.")}}
// Verteilen: Wochenenden bekommen "Zusammen machen", 6. Nikolaus, 24. etwas Besonderes, Süßes sparsam
async function advFill(cal){const D=advDoors(cal.id),used=new Set(Object.values(D).map(x=>x.name.toLowerCase()));let pool=suggList("advent",ADV_IDEAS).map(x=>x.name).filter(n=>!used.has(n.toLowerCase()));
  const take=f=>{const i=pool.findIndex(n=>f(advKind(n)));if(i<0)return pool.length?pool.shift():null;return pool.splice(i,1)[0]};let n=0,sweet=0;
  for(let d=1;d<=24;d++){if(D[d])continue;let name;const wd=new Date(cal.year||advYear(),11,d).getDay();
    if(d===6)name="Nikolaus: Stiefel mit Mandarine und Nüssen";else if(d===24)name=take(k=>k==="buch")||take(()=>1);
    else if(cal.for==="kid"&&(wd===0||wd===6))name=take(k=>k==="aktiv");else{name=take(k=>k==="suess"?sweet<Math.floor(d/4)+1:k!=="aktiv");if(name&&advKind(name)==="suess")sweet++}
    if(!name)break;await advSet(cal,d,{name,kind:advKind(name)});n++}
  toast(n?n+" Türchen gefüllt":"Keine freien Türchen oder keine Ideen mehr");render()}
// Inhaltsverzeichnis (gekaufter Kalender) oder Liste: "3: Schoko", "Tür 3 Schoko", "3. Schoko" oder einfach Zeilen der Reihe nach
function advParse(txt){return String(txt||"").split(/\n/).map(l=>l.replace(/^[\s•*\-–]+/,"").trim()).filter(Boolean).map(l=>{const m=l.match(/^(?:t(?:ü|ue)r(?:chen)?|tag|nr\.?)?\s*(\d{1,2})\s*[:.)\-–]?\s+(.+)$/i);return m&&+m[1]>=1&&+m[1]<=24?{day:+m[1],name:m[2].trim().slice(0,80)}:{day:0,name:l.slice(0,80)}}).filter(x=>x.name&&!/^(inhalt|inhaltsverzeichnis|adventskalender)\b/i.test(x.name))}
async function advImport(cal,lines){const D=advDoors(cal.id),taken=new Set(Object.keys(D).map(Number));let n=0;
  for(const x of lines.map(l=>advParse(l)[0]).filter(Boolean)){let d=x.day;if(!d){d=1;while(taken.has(d)&&d<=24)d++}if(d>24)break;taken.add(d);await advSet(cal,d,{name:x.name,kind:advKind(x.name),st:"idee"});n++}
  toast(n+" Türchen übernommen");render()}
function advPick(cal,txt){const L=advParse(txt);if(!L.length){toast("Keine Zeilen gefunden.");return}S.advPaste=null;S.shopPick={to:{cal:cal.id},blocks:[{src:cal.name,lines:L.map(x=>x.day?x.day+": "+x.name:x.name)}],mode:"",sel:{}};render()}
// Verlinkungen eines Türchens: Kalender, Ausflug, Rezept, Erinnerung
function advLinks(c,x){const L=[],k=x.kind||advKind(x.name),day=(c.year||advYear())+"-12-"+String(x.day).padStart(2,"0");
  if(k==="aktiv")L.push(`<button class="ghost" data-nav="woche|wp:3">📅 Steht am ${x.day}.12. im Kalender ›</button>`);
  const tr=x.trip&&trips().find(t=>t.id===x.trip);if(tr)L.push(`<button class="ghost" data-nav="ausflug|tt:ideen">🚲 Ausflug: ${esc(tr.name)} ›</button>`);else if(advOut(x.name))L.push(`<button class="ghost" data-advtrip="${x.day}">🚲 Als Ausflug anlegen</button>`);
  const w=(String(x.name).toLowerCase().match(/plätzchen|kekse|lebkuchen|stollen|punsch|waffeln|bratapfel|zimtsterne|vanillekipferl|muffins|kuchen/)||[])[0];
  if(w){const r=recs().find(y=>y.name.toLowerCase().includes(w));L.push(r?`<button class="ghost" data-openrec="${esc(r.id)}">📖 ${esc(r.name)} ›</button>`:`<button class="ghost" data-advrec="${esc(w)}">📖 Rezept für ${esc(w)} suchen</button>`)}
  L.push(`<button class="ghost" data-advprio="${x.day}">🔔 Erinnern</button>`);
  return `<div class="unl advlinks">${L.join("")}</div>`}
function advTile(){const c=advCur(),D=c?advDoors(c.id):{},n=Object.keys(D).length,t=advToday(c);return `<button class="tile" data-pfilter="advent"><span class="te">🎄</span><span class="tn">Adventskalender</span><span class="tc">${!c?"noch keiner":t&&!advHidden(c,t)&&D[t]?"Heute "+t+": "+esc(D[t].name):n+" von 24 gefüllt"}</span></button>`}
function renderAdvent(){const L=advCals(),y=advYear(),cur=L.filter(x=>x.year===y),old=L.filter(x=>x.year!==y),c=advCur(),oth=S.me==="p1"?"p0":"p1";
  let h=`<div class="btnrow"><button class="ghost" data-pfilter="">‹ Geschenke</button></div><h2 class="m0">🎄 Adventskalender ${y}</h2><div class="btnrow"><button class="ghost" data-nav="listen|bl:geschenke">🛍️ Einkauf › Geschenke</button></div>`;
  if(cur.length>1)h+=`<div class="filters" role="group" aria-label="Kalender">${cur.map(x=>`<button class="chipbtn neutral" data-advcal="${esc(x.id)}" aria-pressed="${c&&c.id===x.id}">${esc(emoOf(x,x.kind==="gekauft"?"🛍️":x.for==="kid"?"🧒":"🎁"))} ${esc(x.name)}</button>`).join("")}</div>`;
  const newRow=`<div class="unl"><button class="chipbtn" data-advnew="kid|selbst">🧒 Kalender fürs Kind anlegen</button></div>`;
  if(!c)return h+`<section class="card"><div class="mb2 freq">Noch kein Kalender für dieses Jahr. 24 Türchen, die ihr beide gemeinsam füllt.</div>${newRow}</section>`;
  const D=advDoors(c.id),vals=Object.values(D),t=advToday(c),buy=c.kind==="gekauft",mine=c.for===S.me&&c.for!=="kid";
  const cnt=k=>vals.filter(x=>x.st===k).length,aL=geldFor(["advent:"+c.id].concat(vals.map(x=>"adoor:"+c.id+"_"+x.day))),aR=new Set(aL.map(m=>m.ref)),spent=vals.filter(x=>!aR.has("adoor:"+c.id+"_"+x.day)).reduce((a,x)=>a+priceOf(x),0)+geldSum(aL)/100,bud=+c.budget||0;
  h+=`<section class="card"><div class="section-head"><h2>${esc(emoOf(c,buy?"🛍️":c.for==="kid"?"🧒":"🎁"))} ${esc(c.name)}</h2><span class="freq">für ${esc(advForLbl(c))}</span>${mine?"":`<button class="ghost small" data-advren="${esc(c.id)}" aria-label="Name und Symbol ändern">✎</button>`}</div>${mine?"":careHead("advent",c.id)}`;
  if(!mine)h+=`<div class="freq">${vals.length} von 24 gefüllt${buy?"":` · ${cnt("besorgt")+cnt("eingepackt")} besorgt · ${cnt("eingepackt")} eingepackt`}${spent?` · ${euro(spent)}${bud?" von "+euro(bud):""}`:""}</div>${bud?`<div class="bar"><span style="width:${Math.min(100,spent/bud*100).toFixed(0)}%"></span></div>`:""}${geldSrcRow("advent:"+c.id,{name:c.name,cat:"geschenk",grp:""})}`;
  else h+=`<div class="freq">Den füllt ${esc(pname(c.by||oth))} für dich. Jedes Türchen zeigt sich an seinem Tag.</div>`;
  h+=`<div class="advgrid">${Array.from({length:24},(_,i)=>{const d=i+1,x=D[d],hid=advHidden(c,d),st=x&&ADV_ST.find(s=>s[0]===x.st);
    return `<button class="advdoor${x?" full":""}${d===t?" today":""}${S.advDoor===d?" sel":""}${x&&x.st==="eingepackt"&&!buy?" packed":""}" data-advdoor="${d}" aria-label="Türchen ${d}${x&&!hid?": "+esc(x.name):""}"><b>${d}</b><span>${hid?(x?"🎁":""):x?esc(x.name):""}</span>${x&&!hid&&!buy&&st?`<i>${st[0]==="idee"?"○":st[2]}</i>`:""}</button>`}).join("")}</div>`;
  const sd=S.advDoor,x=sd&&D[sd];
  if(sd&&!mine){const k=x&&x.kind||"klein";h+=`<div class="advedit"><div class="section-head"><h2>Türchen ${sd}</h2><button class="ghost small" data-advdoor="${sd}">✕</button></div>
    <input type="text" data-advname="${sd}" value="${esc(x?x.name:"")}" maxlength="80" placeholder="Was kommt hinein?" autocomplete="off" aria-label="Inhalt Türchen ${sd}">
    ${x?`<div class="unl">${ADV_KIND.map(a=>`<button class="chipbtn neutral" data-advkind="${a[0]}" aria-pressed="${k===a[0]}">${a[1]} ${a[2]}</button>`).join("")}</div>
    ${buy?"":`<div class="unl">${ADV_ST.map(s=>`<button class="chipbtn neutral" data-advst="${s[0]}" aria-pressed="${x.st===s[0]}">${s[2]} ${s[1]}</button>`).join("")}</div>`}
    <label class="fld"><span>${k==="klein"?"🧸 Dafür besorgen (steht bei Einkauf › Geschenke)":"🛒 Dafür einkaufen (eine Zeile pro Sache)"}</span><textarea data-advneed="${sd}" rows="3" placeholder="${k==="klein"?"z. B. Holzauto&#10;Batterien":"z. B. Nüsse&#10;Mandarinen"}">${esc(x.need||"")}</textarea></label>
    <div class="advrow"><label class="fld"><span>💶 Preis</span><input data-advprice="${sd}" value="${esc(x.price||"")}" inputmode="decimal" placeholder="z. B. 3,50"></label>
    ${k==="klein"?((x.st||"idee")==="idee"?`<button class="ghost" data-nav="listen|bl:geschenke">🎁 Steht bei Geschenke ›</button>`:""):advNeed(x).length?`<button class="ghost" data-advshop="${sd}">🛒 Auf die Einkaufsliste</button>`:""}${shopItems().some(i=>i.src===advSrc(sd)&&!i.done)?`<button class="ghost" data-advshopsee="${sd}">🧺 Auf der Liste ansehen</button>`:""}</div>
    ${advLinks(c,x)}
    <div class="btnrow"><button class="ghost danger" data-advclear="${sd}">Türchen leeren</button></div>`:""}</div>`}
  if(!mine){h+=`<div class="mt3 btnrow">${buy?"":`<button class="ghost" data-act="advfill">🎲 Freie Türchen füllen</button>`}<button class="ghost" data-act="advpaste">📋 ${buy?"Inhaltsverzeichnis einfügen":"Liste einfügen"}</button>${buy?"":`<button class="ghost" data-act="advshopall">🛒 Was fehlt</button>`}</div>`;
    if(S.advPaste!=null)h+=`<div class="advpaste"><textarea id="advtext" rows="6" placeholder="${buy?"Inhaltsverzeichnis vom Kalender abtippen oder einfügen, eine Zeile pro Türchen, z. B.\n1: Schokoladenstern\n2: Sticker":"Eine Idee pro Zeile, gern mit Nummer: 5: Knete"}">${esc(S.advPaste)}</textarea><div class="btnrow"><button class="primary" data-act="advpasteok">Weiter</button><button class="ghost" data-act="advpastecancel">Abbrechen</button></div><div class="freq">Danach fragt die App wie bei Rezepten: Alles, Alles bis auf … oder Nur das ….</div></div>`}
  h+=`</section>`;
  if(!mine&&!buy){const have=new Set(vals.map(v=>v.name.toLowerCase()));h+=`<section class="card">${suggBlock("advent",have,"data-advsugg")}<div class="mt2 freq">Tippen setzt die Idee ins gewählte Türchen, sonst ins nächste freie.</div></section>`}
  h+=`<section class="card"><div class="section-head"><h2>✏️ Eckdaten</h2></div><label class="fld"><span>Name</span><input data-advcf="name" value="${esc(c.name)}" maxlength="60"></label>${buy?"":`<label class="fld"><span>💶 Budget (€)</span><input type="number" data-advcf="budget" value="${esc(c.budget||"")}" placeholder="z. B. 60"></label>`}
    <div class="mt2 btnrow"><button class="ghost danger" data-act="advdel">Kalender löschen</button></div></section>`;
  if(old.length)h+=`<details class="reisedone"><summary class="section-head"><h2>🗄️ Vorjahre</h2><span class="freq num">${old.length} ▾</span></summary><div class="unl">${old.map(o=>`<button class="chipbtn neutral" data-advcal="${esc(o.id)}">${o.year}: ${esc(o.name)}</button>`).join("")}</div><div class="freq">Ideen aus früheren Jahren stehen weiter in den Vorschlägen.</div></details>`;
  return h}
function advBack(){const n=new Date();if(n.getMonth()!==11||n.getDate()>24)return "";const d=n.getDate(),L=advCals().filter(c=>c.year===n.getFullYear());if(!L.length)return "";
  return `<div class="btasks">${L.map(c=>{const D=advDoors(c.id),x=D[d],m=d<24&&D[d+1],hid=advHidden(c,d);return `<button class="btask" data-advgo="${esc(c.id)}"><span>🎄</span><b>${hid?"Türchen "+d+" wartet auf dich":x?"Türchen "+d+": "+esc(x.name):"Türchen "+d+" ist noch leer"}</b><small>${c.for==="kid"?"Kind":esc(pname(c.for))}${m&&!advHidden(c,d+1)&&n.getHours()>=16?" · morgen: "+esc(m.name):""}</small></button>`}).join("")}</div>`}
// ---------- Funde bearbeiten, entfernen, verknüpfen (Florian 16.11.2026) ----------
// Ein Fund (food/fund) kann zusätzlich an anderer Stelle stehen. Verknüpfung in f.links {<ziel>: <id dort>}; Ziele hier austauschbar.
// einkauf = Einkaufsliste, wichtig = Erinnerung (dort entsteht wirklich ein eigener Eintrag). Geschenke, Spielen, Musik, Kind: seit 17.11.2026 keine Kopie mehr, sondern das Feld show (29f-gemerkt.js).
const FUND_LINKS={
  einkauf:{lbl:"🧺 Einkaufsliste",nav:"einkauf|",has:id=>!!shopItems().find(x=>x.id===id&&!x.done),
    make:async f=>{const id="i"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);await S.store.setPath("food/shop/"+id,{name:f.name.slice(0,80),done:false,at:Date.now(),by:S.me||"",src:"Projekt: "+fundProjName(f)});return id},
    sync:async(id,f)=>S.store.setPath("food/shop/"+id+"/name",f.name.slice(0,80)),
    drop:async id=>S.store.setPath("food/shop/"+id,null)},
  wichtig:{lbl:"🔔 Wichtig",nav:"wichtig|",has:id=>!!prios().find(x=>x.id===id),
    make:async f=>{const id=newId("w");await S.store.setPath("food/prio/"+id,{name:f.name.slice(0,80),from:f.area==="haus"?"amhaus":"reisen",ref:f.proj?"hproj:"+f.proj:f.reise?"urlaub:"+f.reise:null,at:Date.now(),by:S.me||""});return id},
    sync:async(id,f)=>S.store.setPath("food/prio/"+id+"/name",f.name.slice(0,80)),
    drop:async id=>S.store.setPath("food/prio/"+id,null)}};
function fundProjName(f){const ar=f.area||"reise",A=FAREA[ar],p=f[A.key]&&A.projs().find(y=>y.id===f[A.key]);return p?p.name:A.title.replace(/^\S+\s/,"")}
const fundLinked=f=>Object.keys(FUND_LINKS).filter(k=>f.links&&f.links[k]&&FUND_LINKS[k].has(f.links[k]));
// Vorschlag, wohin ein Fund passt (Florian: vorschlagen, aber selbst auswählen)
function fundSugg(f){const t=((f.name||"")+" "+(f.link||"")).toLowerCase(),out=[];
  if(/drogerie|dm\b|rossmann|lebensmittel|reiniger|putzmittel/.test(t))out.push("einkauf");
  return out.filter(k=>!fundLinked(f).includes(k))}
async function fundSetLinks(f,want,o){const L=Object.assign({},f.links||{});
  for(const k of Object.keys(FUND_LINKS)){const on=fundLinked(f).includes(k),w=want.includes(k);
    if(w&&!on)L[k]=await FUND_LINKS[k].make(f,o||{});else if(!w&&on){await FUND_LINKS[k].drop(L[k]);delete L[k]}else if(w&&on)await FUND_LINKS[k].sync(L[k],f)}
  await S.store.setPath("food/fund/"+f.id+"/links",Object.keys(L).length?L:null)}
async function fundDropAll(f){for(const k of fundLinked(f))await FUND_LINKS[k].drop(f.links[k]);await S.store.setPath("food/fund/"+f.id,null)}
function fundEdit(id){const f=listOf(S.food&&S.food.fund).find(y=>y.id===id);if(!f)return;const ar=f.area||"reise",A=FAREA[ar],sg=fundSugg(f).concat(gmSugg(gmItem("fund",f))),lk=fundLinked(f).concat(gmShow(f));
  S.verkNext=["fund",id,f];editBox(f.name,[{k:"name",label:"Was",type:"text",val:f.name},{k:"link",label:"Link",type:"url",val:f.link||""},
    {k:"kind",label:"Art",type:"chips",opts:A.kinds.map(c=>[c[0],c[1]+" "+c[2]]),val:f.kind||"sonst"},
    {k:"st",label:"Stand",type:"chips",opts:A.st.map(s=>[s[0],s[1]+" "+s[2]]),val:f.st||"idee"},
    {k:"price",label:"Preis in €",type:"text",val:f.price||""}].concat(ar==="reise"?[{k:"ref",label:"Buchungsnummer (nur in euren Daten, in Listen versternt)",type:"text",val:f.ref||""},{k:"addr",label:"Wo",type:"text",val:f.addr||""}]:[]).concat([
    {k:"proj",label:"Gehört zu",type:"chips",opts:[["",A.none]].concat(A.projs().filter(p=>ar==="reise"||p.state!=="erledigt"||p.id===f[A.key]).map(p=>[p.id,(p.emo||A.emo)+" "+p.name])),val:f[A.key]||""},
    {k:"who",label:"Für wen",type:"chips",opts:[["","Offen"]].concat(whoOpts().filter(o=>o[0]!=="both")),val:f.who||""},
    {k:"links",label:"Zeigen bei",type:"multi",opts:GM_PLACES.filter(p=>p[0]!==ar).map(p=>[p[0],(sg.includes(p[0])?"✨ ":"")+p[1]+" "+p[2]]).concat(Object.keys(FUND_LINKS).map(k=>[k,(sg.includes(k)?"✨ ":"")+FUND_LINKS[k].lbl])),val:lk,hint:(sg.length?"✨ = passt vermutlich. ":"")+"Der Eintrag bleibt einer und steht auch dort, mit demselben Stand. Einkaufsliste und Wichtig legen dort einen eigenen Eintrag an. Abwählen nimmt ihn wieder weg."},
    {k:"note",label:"Notiz",type:"text",val:f.note||"",max:500}]),
    async V=>{const name=String(V.name||"").trim().slice(0,120)||f.name,link=safeLink(V.link)||null,n=Object.assign({},f,{name,link});
      const up={name,link,who:V.who||null,note:String(V.note||"").trim().slice(0,500)||null,kind:V.kind||"sonst",st:V.st||"idee",price:String(V.price||"").replace(/[^0-9,.]/g,"").slice(0,10)||null};up[A.key]=V.proj||null;if(ar==="reise"){up.ref=String(V.ref||"").trim().slice(0,60)||null;up.addr=String(V.addr||"").trim().slice(0,160)||null}
      for(const k of Object.keys(up))await S.store.setPath("food/fund/"+f.id+"/"+k,up[k]);
      const W=V.links||[];await gmSetShow("fund",f.id,W.filter(k=>gmPlace(k)));await fundSetLinks(n,W.filter(k=>FUND_LINKS[k]));toast("Gespeichert")},
    (f.area==="haus"?[["↪ Verschieben",()=>moveOpen("fund",f.id)]]:[]).concat(fundDelOpts(f)))}
function fundDelOpts(f){const A=FAREA[f.area||"reise"],o=[];
  if(f[A.key])o.push(["Nur aus dem "+A.word+" nehmen",async()=>{await S.store.setPath("food/fund/"+f.id+"/"+A.key,null);toast("Steht weiter in der Sammlung")},false]);
  o.push([fundLinked(f).length?"Ganz löschen, auch dort":"Ganz löschen",async()=>{await fundDropAll(f);toast("Gelöscht")},true]);return o}
function fundRmAsk(id){const f=listOf(S.food&&S.food.fund).find(y=>y.id===id);if(!f)return;const lk=fundLinked(f);
  editBox(f.name,[{k:"x",type:"note",label:(f[FAREA[f.area||"reise"].key]?"Nur aus dem "+FAREA[f.area||"reise"].word+" nehmen: der Eintrag bleibt in der Sammlung. ":"")+"Ganz löschen: weg aus Sammlung"+(lk.length?" und bei "+lk.map(k=>FUND_LINKS[k].lbl).join(", "):"")+"."}],async()=>{},fundDelOpts(f))}
