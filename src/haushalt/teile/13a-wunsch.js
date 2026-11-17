// ---------- Wunsch-Suche bei Rezepte (Florian 16.11.2026) ----------
// Vier freiwillige Felder: Worauf habt ihr Lust, Mit, Ohne, Ähnlich wie. Stufe 1 durchsucht eigene Rezepte und Ideen (weekPool),
// Stufe 2 öffnet eine fertige Google-Suche (auf Wunsch nur auf euren Quellen aus quellen.txt) oder kopiert einen Prompt für einen KI-Assistenten,
// dazu „Als Recherche-Wunsch speichern“ (food/rwunsch). Keine KI direkt in der App; Treffer aus dem Netz kommen über „Rezept aus Link“ dazu.
const WISH_SYN={pilz:["champignon","pfifferling","steinpilz","kräuterseitling","shiitake"],nudel:["pasta","spaghetti","penne","fusilli","tagliatelle","lasagne","maccheroni","rigatoni","farfalle","gnocchi"],
  kartoffel:["erdäpfel","kartoffeln"],hähnchen:["huhn","hühnchen","hühner","chicken","geflügel"],käse:["parmesan","mozzarella","feta","gouda","cheddar","bergkäse","emmentaler","ricotta","halloumi"],
  tomate:["passata","tomatenmark","tomaten"],fisch:["lachs","kabeljau","seelachs","thunfisch","forelle","dorsch","garnele"],
  fleisch:["rind","schwein","hack","hackfleisch","hähnchen","huhn","speck","schinken","wurst","pute","lamm","salami","chorizo","kassler"],
  hack:["hackfleisch","faschiertes"],linse:["linsen"],kichererbse:["kichererbsen"],reis:["risotto"],ei:["eier"],sahne:["schmand","crème fraîche","creme fraiche"],
  kürbis:["hokkaido","butternut"],paprika:["paprikaschote"],zucchini:["zucchino"],spinat:["blattspinat"]};
const WISH_BASIC=/^(salz|pfeffer|öl|olivenöl|wasser|zucker|mehl|butter|knoblauch|zwiebel|brühe|gemüsebrühe|essig|senf|paprikapulver|petersilie|schnittlauch)$/;
const wishNorm=t=>String(t||"").toLowerCase();
const wishStem=w=>{w=wishNorm(w).trim();return w.length>5?w.replace(/(en|n|e|s)$/,""):w};
function wishTerms(t){return wishNorm(t).split(/[,;/]|\s+und\s+|\s+oder\s+|\s+/).map(x=>x.trim()).filter(x=>x.length>=2&&!/^(mit|ohne|und|oder|was|etwas|bitte|gerne|lust|auf|ein|eine|einen|der|die|das)$/.test(x))}
function wishHas(txt,term){const s=wishStem(term);if(s.length<2)return false;if(txt.includes(s))return true;const syn=WISH_SYN[s]||WISH_SYN[term]||Object.entries(WISH_SYN).find(([k])=>s.startsWith(k)||k.startsWith(s))?.[1]||[];return syn.some(w=>txt.includes(w))}
const wishIngKeys=x=>new Set((x.ing||[]).map(l=>ingKey(String(l)).split(" ").filter(w=>w.length>2&&!/^(g|kg|ml|el|tl|stück|prise|bund|dose|becher|packung|pck|zehe|zehen|scheibe|scheiben|frisch|frische|gehackt|klein|groß|große|etwas|ca)$/.test(w)).pop()).filter(w=>w&&!WISH_BASIC.test(w)));
function wishTxt(x){const r=x.rec&&recs().find(y=>y.id===x.rec);return wishNorm(x.name+" "+(x.ing||[]).join(" ")+" "+(x.note||"")+" "+(r?recTags(r).map(tagLab).join(" "):"")+" "+(Array.isArray(x.tags)?x.tags.join(" "):""))}
const wishOrig=(src,t)=>String(src||"").split(/[,;/]|\s+/).map(x=>x.trim()).find(x=>x.toLowerCase()===t)||t;
function wishHits(w){const P=weekPool(),mit=wishTerms(w.mit),ohne=wishTerms(w.ohne),lust=wishTerms(w.lust),like=w.wie?P.find(x=>x.name.toLowerCase()===wishNorm(w.wie).trim()):null,lk=like?wishIngKeys(like):null;
  if(!mit.length&&!ohne.length&&!lust.length&&!like)return [];
  const out=[];P.forEach(x=>{if(like&&x.name===like.name)return;const t=wishTxt(x),ingT=wishNorm(x.name+" "+(x.ing||[]).join(" "));
    if(ohne.some(o=>o==="fleisch"?!x.veg:wishHas(ingT,o)))return;
    let sc=0;const why=[];const m=mit.filter(o=>wishHas(ingT,o));if(mit.length&&!m.length)return;sc+=m.length*3;if(m.length)why.push("mit "+m.map(o=>wishOrig(w.mit,o)).join(", "));
    const l=lust.filter(o=>o==="schnell"?x.min<=30:/^veg/.test(o)?x.veg:wishHas(t,o));if(lust.length&&!l.length&&!mit.length&&!like)return;sc+=l.length*2;if(l.length)why.push(l.map(o=>wishOrig(w.lust,o)).join(", "));
    if(lk&&lk.size){const k=wishIngKeys(x);let n=0;k.forEach(z=>{if(lk.has(z))n++});const hs=(like.haupt||[]).some(h=>(x.haupt||[]).includes(h));if(!n&&!hs&&!mit.length&&!lust.length)return;sc+=n*2+(hs?2:0)+(like.sauce&&like.sauce===x.sauce?1:0);if(n)why.push(n+" gleiche Zutat"+(n>1?"en":""))}
    if(!mit.length&&!lust.length&&!lk)sc=1;if(sc>0)out.push({x,sc,why:why.join(" · ")})});
  return out.sort((a,b)=>b.sc-a.sc||(a.x.src==="rezept"?-1:1)).slice(0,8)}
// Quellen für die Suche im Netz: Webseiten aus quellen.txt (dieselbe Datei wie für die Recherche)
const WISH_SRC0=["emmikochteinfach.de","kptncook.com","chefkoch.de","lecker.de","eatsmarter.de","kuechengoetter.de"];
function wishSources(){if(!S.wishSrcLoad){S.wishSrcLoad=1;try{fetch("quellen.txt",{cache:"no-store"}).then(r=>r.ok?r.text():"").then(t=>{const h=String(t).split(/\n/).filter(l=>/^https?:\/\//.test(l.trim())).map(l=>{try{return new URL(l.trim()).hostname.replace(/^www\./,"")}catch(_){return ""}}).filter(Boolean);if(h.length)S.wishSrc=[...new Set(h)]}).catch(()=>{})}catch(_){}}return S.wishSrc||WISH_SRC0}
function wishLike(w){const P=weekPool();return w.wie?P.find(x=>x.name.toLowerCase()===wishNorm(w.wie).trim()):null}
function wishQuery(w,own){const like=wishLike(w),lk=like?[...wishIngKeys(like)].slice(0,4):[];
  const q=["Rezept",String(w.lust||"").trim(),wishTerms(w.mit).join(" "),like?lk.join(" "):"",wishTerms(w.ohne).map(o=>"-"+o).join(" ")].filter(Boolean).join(" ");
  return q+(own?" ("+wishSources().map(h=>"site:"+h).join(" OR ")+")":"")}
function wishPrompt(w){const like=wishLike(w);return ["Schlag mir bitte 5 Rezepte vor. Wir kochen für 4 Personen, darunter ein Kleinkind (nichts Rohes, nicht scharf).",
  w.lust?"Worauf wir Lust haben: "+String(w.lust).trim():"",w.mit?"Mit diesen Zutaten: "+String(w.mit).trim():"",w.ohne?"Ohne: "+String(w.ohne).trim():"",
  w.wie?"Ähnlich wie: "+String(w.wie).trim()+(like&&like.ing&&like.ing.length?" (Zutaten: "+like.ing.slice(0,10).join(", ")+")":""):"",
  "Bitte zu jedem Vorschlag einen Link zur Rezeptseite, am liebsten von: "+wishSources().join(", ")+"."].filter(Boolean).join("\n")}
function wishSummary(w){return [w.lust&&"Lust auf "+String(w.lust).trim(),w.mit&&"mit "+String(w.mit).trim(),w.ohne&&"ohne "+String(w.ohne).trim(),w.wie&&"ähnlich wie "+String(w.wie).trim()].filter(Boolean).join(", ")}
function renderWish(){const w=S.wish||(S.wish={lust:"",mit:"",ohne:"",wie:"",own:true}),P=weekPool(),any=w.lust||w.mit||w.ohne||w.wie;wishSources();
  const fld=(k,lab,ph,list)=>`<label class="fld"><span>${lab}</span><input data-wish="${k}" value="${esc(w[k]||"")}" placeholder="${ph}" autocomplete="off"${list?` list="wishrecs"`:""}></label>`;
  let h=`<section class="card wishcard"><div class="section-head"><h2>🔎 Wunsch-Suche</h2><button class="iconbtn" data-act="wishx" aria-label="Wunsch-Suche schließen">✕</button></div>
    <div class="freq">Alles freiwillig und kombinierbar. Erst suchen eure Rezepte und Ideen, darunter geht es ins Netz.</div>
    ${fld("lust","Worauf habt ihr Lust?","z. B. cremig, schnell, Ofen, Suppe")}${fld("mit","Mit diesen Zutaten","z. B. Pilze, Sahne")}${fld("ohne","Ohne","z. B. Fleisch, Koriander")}${fld("wie","Ähnlich wie","Rezept aus eurer Sammlung",true)}
    <datalist id="wishrecs">${P.map(x=>`<option value="${esc(x.name)}"></option>`).join("")}</datalist><div id="wishres">${wishResHtml(w)}</div>`;
  h+=`<div class="wishweb"><div class="freq">Im Netz weitersuchen<span class="wishhint"${any?" hidden":""}> (erst oben etwas eintragen)</span>:</div><div class="unl"><button class="chipbtn neutral" data-act="wishown" aria-pressed="${!!w.own}">${w.own?"✓ ":""}Nur eure Quellen</button></div>
    <div class="btnrow"><button class="primary" data-act="wishweb"${any?"":" disabled"}>🌐 Im Netz suchen</button><button class="ghost" data-act="wishprompt"${any?"":" disabled"}>📋 Als Prompt kopieren</button><button class="ghost" data-act="wishsave"${any?"":" disabled"}>🤖 Als Recherche-Wunsch</button></div>
    <div class="freq">Gefundenes Rezept speichern: auf der Seite alles kopieren, dann oben „🔗 Rezept aus Link oder Seite“.</div>${S.wishCopy?`<textarea class="wishcopy" rows="5" readonly>${esc(S.wishCopy)}</textarea>`:""}</div></section>`;
  return h}
function wishResHtml(w){const any=w.lust||w.mit||w.ohne||w.wie;if(!any)return "";const L=wishHits(w);
  if(!L.length)return `<div class="freq wishnone">Bei euch nichts Passendes. Unten im Netz weitersuchen.</div>`;
  return `<ul class="evlist wishlist">${L.map(({x,why})=>{const own=x.src==="rezept"&&x.rec,ref=own?"rec|"+x.rec:"pool|"+x.name;
    return `<li><span class="t">${own?"📖":"✨"}</span><span class="n">${own?`<button class="linkbtn" data-openrec="${esc(x.rec)}">${esc(x.name)}</button>`:esc(x.name)}${why?`<small>${esc(why)}</small>`:""}</span><span class="wishbtns">${!own&&safeLink(x.link)?`<a class="iconbtn" href="${esc(x.link)}" target="_blank" rel="noopener" aria-label="Rezept öffnen">🔗</a>`:""}<button class="iconbtn" data-cook="${esc(ref)}" aria-label="${esc(x.name)} kochen">🍲</button></span></li>`}).join("")}</ul>`}
