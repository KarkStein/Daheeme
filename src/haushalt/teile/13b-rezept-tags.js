// ---------- Rezepte: ein Wörterbuch für Tags, Suche und Vorschläge (Florian 19.11.2026, „A: Alles zusammen“, Entwurf /mnt/project-files/design/rezepte-woerterbuch.png) ----------
// Zutaten-Tags entstehen nur noch aus Wörtern des Wörterbuchs (TAG_DICT, Einkaufs-Grundliste SHOP_BASE, Einkaufs-Gedächtnis food/fav, Hauptzutaten HAUPT_KW, eigene Tags).
// Grundzutaten (food/pref/tagbasic, sonst TAG_BASIC) werden nie ein Tag; höchstens 5 je Rezept, Hauptzutaten zuerst; Einzahl und Mehrzahl sind ein Tag (tagStem);
// ein Buchstabe daneben wird korrigiert (tagNear); Unbekanntes und Wörter unter 4 Buchstaben werden kein Tag.
const TAG_DICT="Crème fraîche,Saure Sahne,Rote Bete,Passierte Tomaten,Gehackte Tomaten,Getrocknete Tomaten,Frühlingszwiebel,Blätterteig,Hefeteig,Mürbeteig,Kidneybohnen,"+
  "Champignon,Pilz,Pfifferling,Steinpilz,Knödel,Sahne,Schmand,Quark,Joghurt,Milch,Käse,Feta,Mozzarella,Parmesan,Gouda,Bergkäse,Frischkäse,Mascarpone,Ricotta,Halloumi,Eier,Tofu,"+
  "Haselnuss,Walnuss,Mandel,Cashew,Erdnuss,Pinienkern,Sesam,Kokosmilch,Haferflocken,Grieß,Polenta,Couscous,Bulgur,Quinoa,Hirse,Dinkel,Reis,Risottoreis,Nudeln,Spaghetti,Penne,Lasagneplatten,Gnocchi,Spätzle,Tortellini,Maultaschen,Tortilla,Wraps,Brot,Toast,Brötchen,Semmelbrösel,"+
  "Kartoffel,Süßkartoffel,Möhre,Karotte,Tomate,Gurke,Paprika,Zucchini,Aubergine,Brokkoli,Blumenkohl,Kürbis,Hokkaido,Lauch,Porree,Sellerie,Pastinake,Kohlrabi,Wirsing,Weißkohl,Rotkohl,Spitzkohl,Rosenkohl,Grünkohl,Sauerkraut,Spinat,Mangold,Rucola,Salat,Feldsalat,Fenchel,Spargel,Erbse,Mais,Bohne,Linse,Kichererbse,Radieschen,Rettich,Bärlauch,Ingwer,Chili,Avocado,Olive,Kapern,"+
  "Apfel,Birne,Banane,Zitrone,Limette,Orange,Erdbeere,Himbeere,Heidelbeere,Beere,Kirsche,Zwetschge,Pflaume,Aprikose,Pfirsich,Mango,Ananas,Rhabarber,Rosine,Dattel,"+
  "Hähnchen,Hähnchenbrust,Pute,Rind,Rindfleisch,Schwein,Schweinefleisch,Hackfleisch,Speck,Schinken,Wurst,Würstchen,Salami,Lachs,Forelle,Thunfisch,Kabeljau,Seelachs,Garnele,Fischstäbchen,"+
  "Tomatenmark,Sojasauce,Pesto,Curry,Currypaste,Kokos,Honig,Ahornsirup,Schokolade,Kakao,Vanille,Zimt,Hefe,Backpulver,Tahin,Hummus,Erdnussbutter,Kürbiskerne,Sonnenblumenkerne";
const TAG_BASIC="Salz, Pfeffer, Öl, Olivenöl, Rapsöl, Sonnenblumenöl, Wasser, Zucker, Mehl, Butter, Margarine, Knoblauch, Zwiebel, Brühe, Gemüsebrühe, Essig, Senf, Paprikapulver, Petersilie, Schnittlauch, Basilikum, Kräuter, Muskat, Lorbeer, Thymian, Oregano, Speisestärke";
const TAG_STOP=/^(und|oder|mit|ohne|frisch|frische|frischer|frisches|gehackt|gehackte|gerieben|geriebener|klein|kleine|gross|grosse|groß|große|etwas|prise|zum|zur|für|nach|bio|ca|evtl|tk|reif|reife|weich|weiche|fein|grob|ganz|ganze|halb|halbe|dose|dosen|glas|bund|pck|packung|becher|stück|scheibe|scheiben|zehe|zehen|stange|stangen|blatt|blätter|zweig|zweige|esslöffel|teelöffel|liter|gramm|braten|anbraten|bestreuen|servieren|geschmack|belieben|bedarf)$/;
const tagStem=w=>{w=deAcc(String(w||"").toLowerCase()).replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss");if(w.length>4)w=w.replace(/([^s])s$/,"$1").replace(/(en|er|e|n)$/,"");return w};
const tagWords=t=>deAcc(String(t||"").toLowerCase()).split(/[^a-zäöüß]+/).filter(Boolean);
const tagKey=t=>tagWords(t).map(tagStem).join(" ");
const tagBasicTxt=()=>{const v=S.food&&S.food.pref&&S.food.pref.tagbasic;return typeof v==="string"&&v.trim()?v:TAG_BASIC};
let TAGC=null;
// Wörterbuch: Schlüssel (Wortstämme) → Anzeigename; das zuerst genannte Wort gewinnt (TAG_DICT hat die schönen Einzahl-Formen)
function tagDict(){const fav=(S.food&&S.food.fav)||null,ex=(S.food&&S.food.rectag)||null,bt=tagBasicTxt();if(TAGC&&TAGC.fav===fav&&TAGC.ex===ex&&TAGC.bt===bt)return TAGC;
  const D=new Map(),add=n=>{n=String(n||"").trim();if(n.length<2||n.length>40)return;const k=tagKey(n);if(k&&!D.has(k))D.set(k,n.charAt(0).toUpperCase()+n.slice(1))};
  TAG_DICT.split(",").forEach(add);SHOP_BASE.forEach(add);HAUPT_KW.forEach(h=>add(h[0]));
  if(fav)Object.keys(fav).forEach(k=>{const f=fav[k];if(f&&f.name&&(f.n||0)>0)add(qtySplit(f.name).rest||f.name)});
  recTagExtra().forEach(x=>add(x.name));
  const B=new Set(bt.split(/[,;\n]/).map(tagKey).filter(Boolean)),multi=[...D.keys()].filter(k=>k.includes(" ")),one=[...D.keys()].filter(k=>!k.includes(" "));
  return TAGC={fav,ex,bt,D,B,multi,one}}
const tagLev1=(a,b)=>{if(a===b)return true;const la=a.length,lb=b.length;if(Math.abs(la-lb)>1)return false;let i=0;while(i<la&&i<lb&&a[i]===b[i])i++;
  return la===lb?a.slice(i+1)===b.slice(i+1):la>lb?a.slice(i+1)===b.slice(i):a.slice(i)===b.slice(i+1)};
function tagNear(st){if(st.length<5)return "";const C=tagDict();for(const k of C.one)if(k.length>=5&&k[0]===st[0]&&!C.B.has(k)&&tagLev1(k,st))return C.D.get(k);return ""}
// Ein Tag-Name gegen das Wörterbuch: {to: richtiger Name oder "" = kein Tag, why}
function tagFix(name){const C=tagDict(),k=tagKey(name),lab=String(name||"").trim();if(!k)return {to:"",why:"leer"};
  if(C.B.has(k))return {to:"",why:"Grundzutat"};
  if(C.D.has(k)){const to=C.D.get(k);return {to,why:to===lab?"":"wie "+to}}
  if(lab.replace(/[^A-Za-zÄÖÜäöüß]/g,"").length<4)return {to:"",why:"zu kurz"};
  const n=tagNear(k);if(n)return {to:n,why:"fast wie "+n};
  return {to:"",why:"nicht im Wörterbuch"}}
// Zutatenzeilen → höchstens 5 Tags, Hauptzutaten zuerst
function tagZut(lines){const C=tagDict(),out=[];
  (lines||[]).forEach(l=>{const q=parseQty(l),txt=String(q.rest||l).replace(/\([^)]*\)/g," ").replace(/,.*$/,""),W=tagWords(txt).filter(w=>!TAG_STOP.test(w)),St=W.map(tagStem);if(!W.length)return;let hit="";
    for(let n=3;n>=2&&!hit;n--)for(let i=0;i+n<=St.length&&!hit;i++){const k=St.slice(i,i+n).join(" ");if(C.B.has(k))return;if(C.D.has(k))hit=C.D.get(k)}
    for(let i=St.length-1;i>=0&&!hit;i--){const k=St[i];if(C.B.has(k)||isPantry(W[i]))continue;if(C.D.has(k)){hit=C.D.get(k);break}
      if(k.length>=7){const s=C.one.filter(d=>d.length>=5&&k.endsWith(d)&&!C.B.has(d)).sort((a,b)=>b.length-a.length)[0];if(s){hit=C.D.get(s);break}}}
    if(!hit){const i=St.length-1,k=St[i];if(W[i].length>=5&&!C.B.has(k)&&!isPantry(W[i]))hit=tagNear(k)}
    if(hit&&!C.B.has(tagKey(hit))&&!out.includes(hit))out.push(hit)});
  const hp=n=>hauptOf(n.toLowerCase()).length?0:1;return out.map((n,i)=>[n,i]).sort((a,b)=>hp(a[0])-hp(b[0])||a[1]-b[1]).map(x=>x[0]).slice(0,5)}
// ---------- Tags aufräumen ----------
const tagFixState=()=>(S.food&&S.food.tagfix)||{};
const recTagArr=r=>Array.isArray(r.tags)?r.tags:r.tags&&typeof r.tags==="object"?Object.values(r.tags):null;
// Verdächtige Zutaten-Tags in den gespeicherten Rezepten: [{tag,lab,n,to,why}]
function tagSuggs(){const cnt={};recs().forEach(r=>(recTagArr(r)||[]).forEach(t=>{if(String(t).startsWith("Zutaten|"))cnt[t]=(cnt[t]||0)+1}));
  return Object.keys(cnt).map(t=>{const lab=tagLab(t),f=tagFix(lab);return {tag:t,lab,n:cnt[t],to:f.to,why:f.why}}).filter(x=>x.to!==x.lab).sort((a,b)=>b.n-a.n||a.lab.localeCompare(b.lab,"de"))}
// Änderungen schreiben: ch = [[rezept, neue Tag-Liste]], log = [{from,to,n}]; der Stand davor bleibt je Rezept in food/tagfix/old (der älteste gewinnt), für ↩ Rückgängig
async function tagWrite(ch,log,auto){const st=tagFixState(),old=Object.assign({},st.old||{});
  for(const [r,T] of ch){if(!(r.id in old))old[r.id]=(recTagArr(r)||[]).slice();await S.store.setPath("food/rec/"+r.id+"/tags",T);
    if(Array.isArray(r.tagsOwn)){const own=r.tagsOwn.filter(t=>!String(t).startsWith("Zutaten|")||T.includes(t));if(own.length!==r.tagsOwn.length)await S.store.setPath("food/rec/"+r.id+"/tagsOwn",own.length?own:null)}}
  const L=(Array.isArray(st.log)?st.log:[]).concat(log).slice(-60);
  await S.store.setPath("food/tagfix",{auto:true,at:Date.now(),old:Object.keys(old).length?old:null,log:L.length?L:null})}
async function tagApply(list){const ch=[],log=[];const M=new Map(list.map(x=>[x.tag,x]));
  recs().forEach(r=>{const T=recTagArr(r);if(!T||!T.some(t=>M.has(t)))return;const N=[];T.forEach(t=>{const x=M.get(t),v=x?(x.to?"Zutaten|"+x.to:""):t;if(v&&!N.includes(v))N.push(v)});ch.push([r,N])});
  list.forEach(x=>log.push({from:x.lab,to:x.to||"",n:x.n}));if(ch.length)await tagWrite(ch,log)}
// Einmal automatisch (food/tagfix/auto): Zutaten-Tags aller gespeicherten Rezepte nach den neuen Regeln; von Hand gesetzte (tagsOwn) bleiben
let tagMigBusy=false;
async function migTags(){if(tagMigBusy||!S.food||!S.food.rec||tagFixState().auto||!S.store)return;tagMigBusy=true;
  try{const ch=[],agg={};
    recs().forEach(r=>{const T=recTagArr(r);if(!T)return;const own=(Array.isArray(r.tagsOwn)?r.tagsOwn:[]).filter(t=>String(t).startsWith("Zutaten|")),off=Array.isArray(r.tagsOff)?r.tagsOff:[];
      const Z=tagZut(recIng(r)).map(z=>"Zutaten|"+z).filter(t=>!off.includes(t));own.forEach(t=>{if(T.includes(t)&&!Z.includes(t))Z.push(t)});
      const oldZ=T.filter(t=>String(t).startsWith("Zutaten|")),N=T.filter(t=>!String(t).startsWith("Zutaten|")).concat(Z);
      if(oldZ.length===Z.length&&oldZ.every(t=>Z.includes(t)))return;ch.push([r,N]);
      oldZ.filter(t=>!Z.includes(t)).forEach(t=>{const lab=tagLab(t),f=tagFix(lab),to=f.to&&Z.includes("Zutaten|"+f.to)?f.to:"",k=lab+"|"+to;(agg[k]=agg[k]||{from:lab,to,n:0}).n++})});
    if(ch.length)await tagWrite(ch,Object.values(agg).sort((a,b)=>b.n-a.n).slice(0,40),true);else await S.store.setPath("food/tagfix/auto",true)}catch(_){}tagMigBusy=false}
async function tagUndo(){const st=tagFixState(),old=st.old||{};for(const id of Object.keys(old)){if(S.food.rec&&S.food.rec[id])await S.store.setPath("food/rec/"+id+"/tags",old[id])}
  await S.store.setPath("food/tagfix",{auto:true,at:Date.now(),undone:true})}
function tagFixCard(){const G=tagSuggs(),st=tagFixState(),L=Array.isArray(st.log)?st.log:[],nOld=Object.keys(st.old||{}).length;
  let b=G.length?`<ul class="tagfixl">${G.slice(0,30).map(x=>`<li><span class="tfn"><b>${esc(x.lab)}</b><span class="freq">${x.n} ${x.n===1?"Rezept":"Rezepte"} · ${esc(x.why)}</span></span><button class="${x.to?"primary":"ghost"} small" data-tagfix="${esc(x.tag)}">${x.to?"→ "+esc(x.to):"🗑 überall weg"}</button></li>`).join("")}</ul>${G.length>30?`<div class="freq">und ${G.length-30} weitere</div>`:""}<div class="btnrow"><button class="primary" data-act="tagfixall">✓ Alle ${G.length} Vorschläge übernehmen</button></div>`
    :`<div class="freq">Alle Zutaten-Tags passen zum Wörterbuch.</div>`;
  if(L.length)b+=`<div class="taggrp"><span class="freq">Zuletzt aufgeräumt${nOld?" · "+nOld+" "+(nOld===1?"Rezept":"Rezepte")+" geändert":""}</span><ul class="tagfixl done">${L.slice(-12).reverse().map(x=>`<li><span class="tfn"><b>${esc(x.from)}</b><span class="freq">${x.n} ${x.n===1?"Rezept":"Rezepte"}</span></span><span class="freq">${x.to?"→ "+esc(x.to):"entfernt"}</span></li>`).join("")}</ul>${nOld?`<div class="btnrow"><button class="ghost small" data-act="tagfixundo">↩ Rückgängig</button></div>`:""}</div>`;
  else if(st.undone)b+=`<div class="freq">Das Aufräumen wurde zurückgenommen.</div>`;
  b+=`<div class="taggrp"><span class="freq">Grundzutaten werden nie ein Tag (mit Komma getrennt)</span><textarea id="tagbasic" rows="3">${esc(tagBasicTxt())}</textarea><div class="btnrow"><button class="ghost small" data-act="tagbasicsave">Liste speichern</button>${tagBasicTxt()!==TAG_BASIC?`<button class="ghost small" data-act="tagbasicreset">↺ Vorgabe</button>`:""}</div></div>`;
  return foldCard("f_tagfix","🧹 Tags aufräumen",G.length||"",b,false)}
async function tagClick(b){
  if(b.dataset.tagfix){const x=tagSuggs().find(y=>y.tag===b.dataset.tagfix);if(!x)return true;try{await tagApply([x]);toast(x.to?x.lab+" ist jetzt "+x.to:x.lab+" entfernt")}catch(_){toast("Konnte nicht speichern.")}render();return true}
  if(b.dataset.act==="tagfixall"){const G=tagSuggs();try{await tagApply(G);toast(G.length+" Vorschläge übernommen")}catch(_){toast("Konnte nicht speichern.")}render();return true}
  if(b.dataset.act==="tagfixundo"){try{await tagUndo();toast("Tags sind wieder wie vorher")}catch(_){toast("Konnte nicht speichern.")}render();return true}
  if(b.dataset.act==="tagbasicsave"||b.dataset.act==="tagbasicreset"){const el=document.getElementById("tagbasic"),v=b.dataset.act==="tagbasicreset"?"":String(el&&el.value||"").trim().slice(0,1500);try{await S.store.setPath("food/pref/tagbasic",v&&v!==TAG_BASIC?v:null);toast("Grundzutaten gespeichert")}catch(_){toast("Konnte nicht speichern.")}render();return true}
  if(b.dataset.act==="rdbing"){S.rdbIng=!S.rdbIng;render();return true}
  if(b.dataset.rdbgo!=null){S.tab="essen";S.foodTab="rezepte";S.recDraft=null;S.recDb=true;S.rdbQ=b.dataset.rdbgo;S.rdbSel=[];S.rdbIng=true;render();window.scrollTo(0,0);return true}
  return false}
// ---------- Vorschläge beim Tippen in der Datenbank-Suche (wie shopSugg): Tags mit Anzahl und Rezeptnamen ----------
function rdbSuggHtml(q,cnt){q=sNorm(q).trim();if(q.length<2)return "";const sel=S.rdbSel||[],GI={Zutaten:"🥕",Eigene:"✏️"};REC_TAGS.forEach(g=>GI[g[0]]=g[1]);
  const T=Object.keys(cnt).filter(t=>!sel.includes(t)&&!t.startsWith("Quelle|")).map(t=>[t,sNorm(tagLab(t))]).filter(x=>x[1].includes(q)).sort((a,b)=>(a[1].startsWith(q)?0:1)-(b[1].startsWith(q)?0:1)||cnt[b[0]]-cnt[a[0]]).slice(0,4);
  const R=recs().map(r=>[r,sNorm(r.name)]).filter(x=>x[1].includes(q)).sort((a,b)=>(a[1].startsWith(q)?0:1)-(b[1].startsWith(q)?0:1)||a[1].localeCompare(b[1])).slice(0,3);
  return T.map(x=>`<button type="button" class="chipbtn rdbsg" data-rdbt="${esc(x[0])}" data-rdbsug="1">${GI[x[0].split("|")[0]]||"🏷️"} ${esc(tagLab(x[0]))} <span class="freq">${cnt[x[0]]}</span></button>`).join("")+R.map(x=>`<button type="button" class="chipbtn neutral rdbsg" data-openrec="${esc(x[0].id)}">📖 ${esc(x[0].name)}</button>`).join("")}
// ---------- Rezept als Fenster über der Datenbank: Zurück schließt nur das Fenster, Suche und Filter bleiben ----------
function recWin(id){const r=recs().find(x=>x.id===id);if(!r)return;mboxClose();S.mboxAt=Date.now();const ing=withQty(r.name,recIng(r)),link=safeLink(r.link),b=books().find(k=>k.id===recBook(r)),onList=!!shopBlocks()[r.name];let host="";if(link){try{host=new URL(link).hostname.replace(/^www\./,"")}catch(_){}}
  const T=recTags(r).filter(t=>!t.startsWith("Quelle|")).slice(0,8).map(tagLab);
  const el=document.createElement("div");el.id="mbox";
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard recwin" role="dialog" aria-label="Rezept ${esc(r.name)}"><div class="section-head"><h2>${esc(r.name)}</h2><button type="button" class="ghost small" data-rw="x" aria-label="Schließen">✕</button></div>
    <div class="freq">📚 ${esc(b?b.name:"Unsere Rezepte")}${host?" · 🔗 "+esc(host):""}${T.length?" · "+esc(T.join(" · ")):""}</div>
    ${ing.length?`<ul class="ing">${ing.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<div class="mt2 freq">Noch keine Zutaten eingetragen.</div>`}${r.note?`<div class="recnote">${esc(r.note)}</div>`:""}
    <div class="btnrow recwinb"><button type="button" class="primary" data-rw="cook" data-rwv="rec|${esc(r.id)}">🍲 Kochen</button>${ing.length?`<button type="button" class="ghost" data-rw="${onList?"shopview":"recshop"}" data-rwv="${esc(onList?r.name:r.id)}">🧺 ${onList?"Auf der Liste":"Zutaten"}</button>`:""}${link?`<a class="ghost btnlink" href="${esc(link)}" target="_blank" rel="noopener noreferrer">🔗 Original</a>`:""}<button type="button" class="ghost" data-rw="recedit" data-rwv="${esc(r.id)}">✎ Bearbeiten</button>${books().length>1?`<button type="button" class="ghost" data-rw="recbookmv" data-rwv="${esc(r.id)}">📚 Anderes Kochbuch</button>`:""}</div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const k=e.target.closest("[data-rw]");if(k){const a=k.dataset.rw;mboxClose();if(a!=="x")calFire("data-"+a+'="'+esc(k.dataset.rwv||"")+'"');return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
