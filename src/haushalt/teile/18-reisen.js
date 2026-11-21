// ---------- Ausflüge ----------
const PACK_IDEAS=["Wasser","Brotzeit","Regenjacke","Sonnencreme","Pflaster","Powerbank","Taschenmesser","Mütze","Sitzkissen","Taschentücher"];
function listOf(m){m=m||{};return Object.keys(m).filter(k=>m[k]&&m[k].name).map(k=>Object.assign({id:k},m[k]))}
const trips=()=>listOf(S.food&&S.food.trip),packs=()=>listOf(S.food&&S.food.pack).sort((a,b)=>(a.at||0)-(b.at||0));
const newId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function safeLink(u){u=(u||"").trim();if(/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/i.test(u))u="https://"+u;return /^https?:\/\/\S+$/i.test(u)?u:""}
// Urlaub: erst einmal eine einfache Liste, wird später verfeinert
const urlaube=()=>listOf(S.food&&S.food.urlaub).sort((a,b)=>(a.at||0)-(b.at||0));
// Reisen (Meer im Bild): oberste Ebene = Urlaube als Kacheln; alles andere liegt im jeweiligen Urlaub. Daten in food/urlaub/<id>.
// Urlaube in drei Gruppen (Florian 15.11.2026): Aktuell, Traum, Erledigt; alte Werte geplant/gebucht zählen als aktuell, gewesen als erledigt
// Stand-Leiter (Florian 17.11.2026): Werte bleiben (aktuell, traum, erledigt), angezeigt als 📅 Geplant, 💡 Idee, ✅ Erledigt
const REISE_ST=[["aktuell","📅","Geplant"],["traum","💡","Idee"],["erledigt","✅","Erledigt"]];
const reiseSt=x=>{const v=x&&x.state;return v==="geplant"||v==="gebucht"||v==="aktuell"?"aktuell":v==="gewesen"||v==="erledigt"?"erledigt":"traum"};
const REISE_EMO=["⛵","🏖️","🏔️","🏕️","🏙️","🌲","⛵","🚗","✈️","🚆","🏰","🌍"];
const PIN_KIND=[["unterkunft","🛏️","Unterkunft"],["strand","🏖️","Strand"],["spielplatz","🛝","Spielplatz"],["essen","🍽️","Essen"],["ausflug","🚲","Ausflug"],["sonst","📎","Sonstiges"]];
const PACK_TPL={strand:["Sonnencreme","Sonnenhut","Badesachen","Strandtuch","Sandspielzeug","Schwimmwindeln","Sonnenbrille","Strandmuschel"],winter:["Schneeanzug","Mütze","Handschuhe","Thermounterwäsche","Schlitten","Lippenpflege","Wollsocken"],kind:["Windeln","Feuchttücher","Kuscheltier","Schnuller","Fieberthermometer","Kinderreisebett","Lieblingsbuch","Snacks für die Fahrt","Wechselkleidung"],basis:["Ausweise","Krankenkassenkarten","Ladekabel","Medikamente","Zahnbürsten","Kleidung","Regenjacke"]};
const REISE_PRIO=["Pässe prüfen","Auto checken lassen","Kita abmelden","Packen","Unterkunft bestätigen","Haustür- und Blumen-Plan"];
const reiseSub=(x,k)=>listOf(x&&x[k]);
// Gemeinsame Sammlung (Recherche) für alle Urlaube und Ausflüge: food/fund/<id> {name,kind,st,link,place,note,ref?,addr?,price?,reise?,trip?,at,by}
const FUND_KIND=[["unterkunft","🛏️","Unterkunft"],["anreise","🚆","Anreise"],["erleben","🎡","Erleben"],["strand","🏖️","Strand"],["spielplatz","🛝","Spielplatz"],["essen","🍽️","Essen gehen"],["sonst","📎","Sonstiges"]];
// Stand-Leiter wie überall (Florian 17.11.2026); Wert gebucht = ✅ Erledigt, das passende Wort (gebucht, gekauft) steht klein dabei
const FUND_ST=[["idee","💡","Idee"],["favorit","⭐","Favorit"],["geplant","📅","Geplant"],["gebucht","✅","Erledigt"]];
function kindGuess(name,link){const t=((link||"")+" "+(name||"")).toLowerCase();
  if(/booking\.com|airbnb|fewo|ferienhaus|ferienwohnung|hotel|vrbo|holidu|hometogo|camping|pension|unterkunft|appartement|ferienpark|center ?parcs|landal/.test(t))return "unterkunft";
  if(/bahn\.de|\bdb\b|flixbus|ryanair|lufthansa|eurowings|condor|easyjet|ferry|ferries|fähre|faehre|mietwagen|sixt|europcar|flug|zug|autozug|maut/.test(t))return "anreise";
  if(/strand|beach|plage/.test(t))return "strand";if(/spielplatz|playground/.test(t))return "spielplatz";if(/restaurant|café|cafe|crêpe|creperie|bistro|essen/.test(t))return "essen";
  if(/zoo|museum|park|tour|ticket|aquarium|schwimmbad|therme|wanderung|tripadvisor|getyourguide/.test(t))return "erleben";return ""}
function nameFromLink(u){try{const x=new URL(u),seg=x.pathname.split("/").filter(Boolean).pop()||"";const n=decodeURIComponent(seg).replace(/\.[a-z]+$/i,"").replace(/[-_+]+/g," ").replace(/\b\d{4,}\b/g,"").trim();return n.length>2?n.charAt(0).toUpperCase()+n.slice(1):x.hostname.replace(/^www\./,"")}catch(_){return ""}}
async function fundMigrate(x){S.fundMig=S.fundMig||{};if(S.fundMig[x.id])return;S.fundMig[x.id]=1;const base="food/urlaub/"+x.id+"/";let n=0;
  try{for(const p of reiseSub(x,"pins")){await S.store.setPath("food/fund/"+newId("f"),{name:p.name,kind:p.kind==="ausflug"?"erleben":FUND_KIND.some(c=>c[0]===p.kind)?p.kind:"sonst",st:"idee",link:p.link||null,reise:x.id,at:p.at||Date.now()});n++}
    for(const b of reiseSub(x,"book")){await S.store.setPath("food/fund/"+newId("f"),{name:b.name,kind:kindGuess(b.name,b.link)||"unterkunft",st:"gebucht",ref:b.ref||null,addr:b.addr||null,link:b.link||null,reise:x.id,at:b.at||Date.now()});n++}
    if(n){await S.store.setPath(base+"pins",null);await S.store.setPath(base+"book",null)}}catch(_){S.fundMig[x.id]=0}}
// Sammlung allgemein (Florian 15.11.2026: "Datenbank wie bei Reisen" auch für Am Haus): ein Bereich = Arten, Status, Projekte, Ergebnisdatei.
// Funde liegen alle in food/fund; area fehlt = reise. Projekt-Feld: reise (Urlaub) bzw. proj (Einrichtungsprojekt food/hproj).
const HAUS_KIND=[["moebel","🛋️","Möbel"],["licht","🪔","Licht"],["textil","🧶","Textil"],["deko","🖼️","Deko"],["farbe","🎨","Farbe und Wand"],["pflanze","🪴","Pflanzen und Saat"],["aufbew","🫙","Aufbewahrung"],["werkzeug","🧰","Werkzeug"],["material","🧱","Material"],["handwerk","👷","Handwerk"],["spielzeug","🧸","Spielzeug und Geschenk"],["sonst","📎","Sonstiges"]];
// Gemeinsamer Projekt-Baustein für alle Bereiche von Am Haus (15.11.2026): Projekt hat cat (fehlt = wohnen), Funde teilen sich eine Sammlung.
// Aufräumen und Reparieren gibt es nicht mehr (Florian 17.11.2026); solche Projekte erscheinen unter Einrichtung
const HCAT={wohnen:["Einrichtung","🛋️","z. B. Kinderzimmer"],garten:["Garten","🌱","z. B. Hochbeet"]};
const hprojCat=x=>x&&HCAT[x.cat]?x.cat:"wohnen";
function kindGuessHaus(name,link){const t=((link||"")+" "+(name||"")).toLowerCase();
  if(/tonie|lego|duplo|playmobil|spielzeug|puzzle|kuscheltier|holzeisenbahn|bilderbuch/.test(t))return "spielzeug";
  if(/lampe|leuchte|licht|strahler|led/.test(t))return "licht";if(/teppich|vorhang|gardine|kissen|decke|bettwäsche|textil|stoff/.test(t))return "textil";if(/farbe|tapete|wand|putz|lack/.test(t))return "farbe";if(/pflanze|topf|monstera|ficus|blumen/.test(t))return "pflanze";
  if(/sofa|couch|tisch|stuhl|regal|schrank|bett|kommode|sessel|sideboard|möbel|moebel|ikea|garderobe/.test(t))return "moebel";if(/bild|poster|rahmen|vase|deko|spiegel|kerze/.test(t))return "deko";if(/kiste|box|korb|aufbewahr|ordnungs|sortier/.test(t))return "aufbew";if(/werkzeug|bohr|säge|schrauber|spaten|harke|schere|rasenmäher/.test(t))return "werkzeug";if(/holz|schraube|dübel|silikon|fliese|kabel|erde|dünger|kies|baumarkt|obi|hornbach|bauhaus/.test(t))return "material";if(/saat|samen|zwiebel|setzling|hochbeet|beet|strauch|hecke/.test(t))return "pflanze";if(/handwerk|montage|maler|schreiner|elektriker|installateur|dachdecker|gärtner/.test(t))return "handwerk";return ""}
const FAREA={
  reise:{get kinds(){return catsOf("fund",FUND_KIND)},st:FUND_ST,doneW:"gebucht",key:"reise",projs:()=>urlaube(),emo:"⛵",word:"Urlaub",allP:"Alle Urlaube",none:"Noch ohne Urlaub",noneSel:"keinem Urlaub",open:"reise",guess:kindGuess,rf:"rfunde",title:"🔖 Gemerkt",
    intro:"Alles, was ihr euch für unterwegs merkt: Unterkünfte, Anreise, Erlebnisse, Strände, Spielplätze, Essen gehen. Ein Eintrag kann zu einem Urlaub gehören und erscheint dann dort. Alles steht auch in der 🗃️ Sammlung.",
    rfHint:"Hier landen später Vorschläge fester Recherche-Aufträge (z. B. Übernachtungen für einen Urlaub), so wie die Tagesrezepte. ＋ übernimmt einen Vorschlag in eure Sammlung und ordnet ihn dem Urlaub zu.",linkHint:"Mit Link erkennt die App meist die Art (z. B. Booking, Airbnb, Bahn, Fähre)."},
  haus:{get kinds(){return catsOf("hfund",HAUS_KIND)},st:FUND_ST,doneW:"gekauft",key:"proj",projs:()=>hprojs(),emo:"🛋️",word:"Projekt",allP:"Alle Projekte",none:"Noch ohne Projekt",noneSel:"keinem Projekt",open:"hproj",guess:kindGuessHaus,rf:"hfunde",title:"🔖 Gemerkt",
    intro:"Alles, was ihr euch fürs Haus merkt (Einrichtung und Garten): Möbel, Licht, Pflanzen, Werkzeug, Material, Handwerker und mehr. Ein Eintrag kann zu einem Projekt gehören und erscheint dann dort. Mit Preis rechnet das Projekt sein Budget mit.",
    rfHint:"Hier landen später Vorschläge fester Recherche-Aufträge (z. B. Lampen bis 100 € für ein Projekt). ＋ übernimmt einen Vorschlag in eure Sammlung.",linkHint:"Mit Link erkennt die App oft die Art (z. B. Lampe, Teppich, Regal)."}};
const funde=(ar)=>listOf(S.food&&S.food.fund).filter(f=>(f.area||"reise")===(ar||"reise")).sort((a,b)=>(b.at||0)-(a.at||0));
const fundKind=(k,ar)=>{const K=FAREA[ar||"reise"].kinds;return K.find(c=>c[0]===k)||K.find(c=>c[0]==="sonst")||K[K.length-1]};
const fundStL=(st,ar)=>FAREA[ar||"reise"].st.find(s=>s[0]===st)||FAREA[ar||"reise"].st[0];
const fundFilt=ar=>{S.ff=S.ff||{};return S.ff[ar]||(S.ff[ar]={k:"",p:"",s:""})};
// Eine Zeile der Sammlung; ctx="proj" blendet das Projekt aus
function fundLi(f,ctx,ar){ar=ar||f.area||"reise";const A=FAREA[ar],k=fundKind(f.kind,ar),st=f.st||"idee",S0=fundStL(st,ar),u=safeLink(f.link),pid=f[A.key],r=pid&&A.projs().find(y=>y.id===pid),t=f.trip&&trips().find(y=>y.id===f.trip),maps=mapsQ(f.addr||(f.name+" "+(f.place||(r&&r.place)||"")));
  return `<li class="fund st-${st}"><span class="fk">${k[1]}</span><span class="ev">${u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(f.name)}</a>`:esc(f.name)}<br><span class="freq">${k[2]}${st==="gebucht"?" · "+A.doneW:""}${f.ref?" · Nr. "+esc(f.ref):""}${ctx==="proj"?` · <input class="fprice" data-fundpr="${esc(f.id)}" inputmode="decimal" value="${esc(f.price||"")}" placeholder="Preis" maxlength="10" aria-label="Preis von ${esc(f.name)} in Euro"> €`:f.price?" · "+esc(f.price)+" €":""}${ar==="reise"?` · <a href="${esc(maps)}" target="_blank" rel="noopener">🗺️</a>`+transitA(f.addr||(f.name+" "+(f.place||(r&&r.place)||"")).trim()):""}${ctx!=="proj"&&r?` · <button class="linkbtn" data-${A.open}="${esc(r.id)}">${esc(r.emo||A.emo)} ${esc(r.name)}</button>`:""}${t?` · 🚲 ${esc(t.name)}`:""}${gmShow(f).map(k=>` · <button class="linkbtn" data-nav="${gmPlace(k)[3]}">${gmPlace(k)[1]} ${gmPlace(k)[2]}</button>`).join("")}${fundLinked(f).map(k=>` · <button class="linkbtn" data-nav="${FUND_LINKS[k].nav}">${FUND_LINKS[k].lbl}</button>`).join("")}</span></span>
    <button class="stbadge st-${st}" data-fundst="${esc(f.id)}" data-ar="${ar}" aria-label="Stand von ${esc(f.name)}: ${S0[2]}, antippen schaltet weiter">${S0[1]} ${S0[2]}</button><button class="catbtn" data-fundedit="${esc(f.id)}" aria-label="${esc(f.name)} bearbeiten">✎</button><button class="rm" data-fundrm="${esc(f.id)}" aria-label="${esc(f.name)} entfernen">✕</button></li>`}
function fundForm(id,proj,ar){ar=ar||"reise";const A=FAREA[ar];S.fundNewKind=S.fundNewKind||{};const k=S.fundNewKind[ar]||"";return `<div class="mt2 unl">${A.kinds.map(c=>`<button class="chipbtn neutral" data-fundnk="${c[0]}" data-ar="${ar}" aria-pressed="${k===c[0]}">${c[1]} ${c[2]}</button>`).join("")}${catBtn(ar==="haus"?"hfund":"fund")}</div>
  <form class="addrow fundform" id="${id}" data-ar="${ar}" data-proj="${esc(proj||"")}" novalidate><input class="fn" placeholder="Name oder Link einfügen" maxlength="300" autocomplete="off" aria-label="Name oder Link"><button class="primary" type="submit">+</button></form><div class="freq">${A.linkHint}</div>`}
// Feste Recherche-Aufträge schreiben eine Ergebnisdatei (Wurzel), wie ideen.json bei Rezepten: reisefunde.json bzw. hausfunde.json
// {updated, items:[{name,kind,link,place?,price?,note,source,auftrag?,reise?|proj? (Name oder Id)}]}. Übernehmen legt einen Fund an.
function rfItems(ar){ar=ar||"reise";const j=S[FAREA[ar].rf];if(!j||!Array.isArray(j.items))return [];const have=new Set(funde(ar).map(f=>(f.link||f.name||"").toLowerCase()));return j.items.filter(i=>i&&i.name&&!have.has((safeLink(i.link)||i.name).toLowerCase()))}
function rfProj(i,ar){ar=ar||"reise";const v=i[FAREA[ar].key];if(!v)return null;const U=FAREA[ar].projs();return U.find(u=>u.id===v)||U.find(u=>u.name.toLowerCase()===String(v).toLowerCase())||null}
const rfReise=i=>rfProj(i,"reise");
function rfundCard(fk,fr,ar){ar=ar||"reise";const A=FAREA[ar],J=S[A.rf],L=rfItems(ar).map(i=>[i,J.items.indexOf(i)]).filter(([i])=>(!fk||i.kind===fk)&&(!fr||fr==="-"||(rfProj(i,ar)||{}).id===fr));
  return `<section data-fk="f_rfund|0" class="card rfund"><div class="section-head"><h2>🤖 Aus der Recherche</h2>${J&&J.updated?`<span class="freq">${esc(J.updated)}</span>`:""}</div>
    ${L.length?`<ul class="evlist fundlist">${L.map(([i,ix])=>{const k=fundKind(i.kind,ar),r=rfProj(i,ar),u=safeLink(i.link);return `<li class="fund"><span class="fk">${k[1]}</span><span class="ev">${u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(i.name)}</a>`:esc(i.name)}<br><span class="freq">${k[2]}${i.place?" · "+esc(i.place):""}${i.price?" · "+esc(i.price)+" €":""}${i.auftrag?" · "+esc(i.auftrag):""}${r?" · "+esc(r.emo||A.emo)+" "+esc(r.name):""}</span>${i.note?`<br><span class="freq">${esc(i.note)}</span>`:""}</span><button class="catbtn" data-rftake="${ix}" data-ar="${ar}" aria-label="${esc(i.name)} übernehmen">＋</button></li>`}).join("")}</ul>`
      :`<div class="freq">${A.rfHint}</div>`}</section>`}
function renderSammlung(ar){ar=ar||"reise";const A=FAREA[ar],ff=fundFilt(ar),fk=ff.k,fr=ff.p,fs=ff.s,U=A.projs(),all=funde(ar);
  const L=all.filter(f=>(!fk||f.kind===fk)&&(!fr||(fr==="-"?!f[A.key]:f[A.key]===fr))&&(!fs||(f.st||"idee")===fs));
  const chip=(f,v,on,txt)=>`<button class="chipbtn neutral" data-ff="${f}" data-v="${esc(v)}" data-ar="${ar}" aria-pressed="${on}">${txt}</button>`;
  let h=`<section class="card"><div class="section-head"><h2>${A.title}</h2><span class="freq num">${all.length}</span></div><div class="freq">${A.intro}</div></section>`;
  h+=`<div class="unl">${chip("k","",!fk,"Alle Arten")}${A.kinds.map(c=>chip("k",c[0],fk===c[0],c[1]+" "+c[2])).join("")}${catBtn(ar==="haus"?"hfund":"fund")}</div>
   <div class="unl">${chip("p","",!fr,A.allP)}${U.map(u=>chip("p",u.id,fr===u.id,esc(u.emo||A.emo)+" "+esc(u.name))).join("")}${chip("p","-",fr==="-",A.none)}</div>
   <div class="unl">${chip("s","",!fs,"Jeder Status")}${A.st.map(c=>chip("s",c[0],fs===c[0],c[1]+" "+c[2])).join("")}</div>`;
  h+=`<section data-fk="f_nf_${ar}|1" class="card"><div class="section-head"><h2>＋ Neuer Fund</h2></div>${fundForm(ar==="reise"?"fundform":"hfundform",fr&&fr!=="-"?fr:"",ar)}</section>`;
  h+=rfundCard(fk,fr,ar);
  // Liste klappbar (Florian 19.11.2026: „Gemerkt lässt sich nicht einklappen? Ändern.“)
  h+=L.length?`<section data-fk="f_fl_${ar}|1" class="card"><div class="section-head"><h2>🔖 Gemerkt <span class="freq">(${L.length})</span></h2></div><ul class="evlist fundlist">${L.map(f=>fundLi(f,"",ar)+(U.length?`<li class="fundmeta"><label class="freq">Gehört zu <select data-fundto="${esc(f.id)}" data-ar="${ar}"><option value="">${A.noneSel}</option>${U.map(u=>`<option value="${esc(u.id)}"${f[A.key]===u.id?" selected":""}>${esc(u.emo||A.emo)} ${esc(u.name)}</option>`).join("")}</select></label></li>`:"")).join("")}</ul></section>`
    :`<div class="empty"><h2>${all.length?"Nichts Passendes":"Noch nichts gesammelt"}</h2><div>Fügt oben Links oder Namen ein. Filter oben grenzen ein.</div></div>`;
  const GG=fk||fr||fs?"":gmRows(ar);if(GG)h+=`<section data-fk="f_also|0" class="card"><div class="section-head"><h2>🔖 Auch hier gezeigt</h2></div><ul class="mklist gmlist">${GG}</ul><div class="freq">Gemerktes aus anderen Bereichen, das auch hierher gehört.</div></section>`;
  return h}
const renderRecherche=()=>renderSammlung("reise");
function reiseDays(x){if(!x.from)return null;const t=startOfDay(new Date()),a=startOfDay(new Date(x.from+"T12:00:00")),b=x.to?startOfDay(new Date(x.to+"T12:00:00")):a;const n=Math.round((a-t)/864e5);return t>b?{past:true}:n<=0?{now:true}:{n}}
function reiseWhen(x){const f=d=>{const z=new Date(d+"T12:00:00");return z.getDate()+"."+(z.getMonth()+1)+"."+(String(z.getFullYear()).slice(2))};return x.from?f(x.from)+(x.to&&x.to!==x.from?" bis "+f(x.to):""):""}
// Bahn und MVV (Florian 15.11.2026): Öffi-Verbindung ab zu Hause (Wetter-Ort, sonst München) in Google Maps, darin DB und MVV; Störungen als Links
// Routen-Knopf (Florian 16.11.2026): überall gleich, fragt „Von hier“ (Standort des Handys) oder „Von zu Hause“ (food/pref/home, nur in der Datenbank).
// Ohne Startangabe nimmt Google Maps den Standort. Zuletzt gewählt je Gerät: hq-routefrom.
function transitQ(dest,from){return "https://www.google.com/maps/dir/?api=1&travelmode=transit"+(from?"&origin="+encodeURIComponent(from):"")+"&destination="+encodeURIComponent(dest)}
const homeAddr=()=>String((S.food&&S.food.pref&&S.food.pref.home)||"").trim();
// Route mit Tag und Ankunftszeit (Florian 17.11.2026, „Stufe 1 bauen“): Termine mit Uhrzeit geben Tag, Zeit und Name an den Knopf (ev = {d,t,name}).
const transitA=(dest,cls,ev)=>dest?`<button type="button" class="${cls||"catbtn"} routebtn" data-route="${esc(String(dest).slice(0,200))}"${ev&&/^\d{4}-\d\d-\d\d$/.test(ev.d||"")?` data-rd="${esc(ev.d)}"${/^\d{1,2}:\d\d$/.test(ev.t||"")?` data-rt="${esc(ev.t)}"`:""} data-rn="${esc(String(ev.name||"").slice(0,80))}"`:""} aria-label="Weg dorthin: ${esc(dest)}">🚆</button>`:"";
// Link mit Ankunftszeit (inoffizieller Pfad, von Florian in der Android-App geprüft): !6e1 = Ankunft, !3e3 = Bahn, !7e2 = Ortszeit; Sekunden = gewünschte Ortszeit, gerechnet als wäre sie UTC.
const ROUTE_EARLY=[["0","pünktlich"],["10","10 Min früher"],["20","20 Min früher"],["x","ohne Zeit"]];
function routeArr(d,t,early){const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d||""),h=/^(\d{1,2}):(\d\d)$/.exec(t||"");if(!m||!h)return 0;return Date.UTC(+m[1],+m[2]-1,+m[3],+h[1],+h[2])/1000-(+early||0)*60}
function routeArrTxt(sec){const x=new Date(sec*1000);return WD2[x.getUTCDay()]+" "+x.getUTCDate()+". "+["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sep.","Okt.","Nov.","Dez."][x.getUTCMonth()]+", "+String(x.getUTCHours()).padStart(2,"0")+":"+String(x.getUTCMinutes()).padStart(2,"0")}
function transitArr(dest,from,sec){return "https://www.google.com/maps/dir/"+encodeURIComponent(from)+"/"+encodeURIComponent(dest)+"/data=!4m6!4m5!2m3!6e1!7e2!8j"+sec+"!3e3"}
function routePick(dest,ev){if(document.getElementById("mbox"))return;const shown=dest;dest=placeAddr(dest);S.mboxAt=Date.now();const home=homeAddr();let last="hier",early="10";try{last=localStorage.getItem("hq-routefrom")||"hier";early=localStorage.getItem("hq-routeearly")||"10"}catch(_){}
  if(!ROUTE_EARLY.some(o=>o[0]===early))early="10";
  // Nur Termine mit Uhrzeit, die noch nicht vorbei sind; sonst ohne Zeit. „✏️ Selbst wählen“ (Florian 19.11.2026: „Tag und Uhrzeit eintragen“) geht immer, auch ohne Termin.
  const nowSec=(()=>{const n=new Date();return Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),n.getHours(),n.getMinutes())/1000})();
  const timed=!!(ev&&routeArr(ev.d,ev.t,0)>nowSec);
  // Selbst wählen: das Feld ist die Ankunftszeit ohne weiteren Abzug; bei Terminen vorausgefüllt mit Termin minus Puffer (Florian 19.11.2026: „Default ist die Uhrzeit des Temins mit 10 min davor“), die Chips füllen neu
  const ownFill=()=>{if(!timed)return;if(early==="x")early="10";const x=new Date(routeArr(ev.d,ev.t,early)*1000);oD=x.getUTCFullYear()+"-"+String(x.getUTCMonth()+1).padStart(2,"0")+"-"+String(x.getUTCDate()).padStart(2,"0");oT=String(x.getUTCHours()).padStart(2,"0")+":"+String(x.getUTCMinutes()).padStart(2,"0")};
  let own=false,oD=ev&&ev.d&&ev.d>=ymd(new Date())?ev.d:ymd(new Date()),oT=timed?ev.t:"";
  const arr=()=>{if(early==="x"&&!own)return 0;const e=early==="x"?0:early;if(own){const x=routeArr(oD,oT,0);return x>nowSec?x:0}return timed?routeArr(ev.d,ev.t,e):0};
  // Von hier mit Zeit: derselbe Pfad ohne Start (Maps nimmt den Standort; Florian 19.11.2026 „Von hier geht nicht oder?“, auf dem Handy noch zu prüfen)
  const go=w=>{try{localStorage.setItem("hq-routefrom",w)}catch(_){}mboxClose();const sec=arr();window.open(sec&&(w==="hier"||home)?transitArr(dest,w==="home"?home:"",sec):transitQ(dest,w==="home"?home:""),"_blank","noopener")};
  const O=[["hier","📍","Von hier","Standort des Handys"]].concat(home?[["home","🏠","Von zu Hause","feste Adresse"]]:[]);if(home&&last==="home")O.reverse();
  const el=document.createElement("div");el.id="mbox";
  const arrBox=()=>{const sec=arr();return `<small>${sec?"Ankunft spätestens"+(!own&&+early?`, ${early} Min vor dem Termin`:""):own?"Tag und Uhrzeit wählen":"Ohne Ankunftszeit"}</small><b>${sec?esc(routeArrTxt(sec)):own?"noch keine Zeit":"Maps rechnet ab jetzt"}</b>`};
  const draw=()=>{const sec=arr();el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Weg dorthin"><div class="section-head"><h2>🚆 ${timed?"Weg zu ":""}${esc(String(shown).slice(0,60))}</h2></div>${timed&&ev.name?`<div class="freq">Termin: ${esc(ev.name)}</div>`:""}<div class="routearr">${arrBox()}</div><div class="routeearly">${(own?(timed?ROUTE_EARLY.filter(o=>o[0]!=="x"):[]):timed?ROUTE_EARLY:[["x","ohne Zeit"]]).map(o=>`<button class="chip" data-routeearly="${o[0]}" aria-pressed="${timed?o[0]===early:true}">${o[1]}</button>`).join("")}<button class="chip" data-routeearly="own" aria-pressed="${own}">✏️ Selbst wählen</button></div>${own?`<div class="routeown"><input type="date" id="routed" value="${esc(oD)}" aria-label="Tag"><input type="time" id="routet" value="${esc(oT)}" aria-label="Ankunft spätestens"></div>`:""}<div class="quicklist">${O.map(o=>`<button class="quickbtn" data-routefrom="${o[0]}"${o[0]===last?' aria-pressed="true"':""}><span class="qi">${o[1]}</span><span>${o[2]} <small>(${o[3]})</small></span></button>`).join("")}${home?"":`<div class="freq">Für „Von zu Hause“ die Adresse unter <button class="linkish" data-routeset="1">Einstellungen › Ort und Wetter</button> eintragen. Sie bleibt nur bei euch.</div>`}<div class="freq">${sec?"Maps öffnet mit Bahn und MVV und rechnet rückwärts von der Ankunft, mit dem Fahrplan dieses Tages.":"Öffnet Google Maps mit Bahn und MVV, dort lässt sich auf Auto oder Rad umstellen."}</div></div></div>`};
  draw();document.body.appendChild(el);
  el.addEventListener("input",e=>{if(e.target.id==="routed")oD=e.target.value;else if(e.target.id==="routet")oT=e.target.value;else return;const b=el.querySelector(".routearr");if(b)b.innerHTML=arrBox()});
  el.addEventListener("click",e=>{const c=e.target.closest("[data-routeearly]");if(c){const v=c.dataset.routeearly;if(v==="own"){own=!own;if(own)ownFill();draw();if(!own)return;const t=el.querySelector(oT?"#routed":"#routet");if(t)try{t.focus()}catch(_){}return}if(v==="x")own=false;early=v;if(own)ownFill();try{localStorage.setItem("hq-routeearly",early)}catch(_){}draw();return}const b=e.target.closest("[data-routefrom]");if(b){go(b.dataset.routefrom);return}if(e.target.closest("[data-routeset]")){mboxClose();S.setOpen=Object.assign(S.setOpen||{},{ort:true});goNav("settings|");return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
const STOER=[["S-Bahn München","https://www.s-bahn-muenchen.de/aktuell"],["MVG (U-Bahn, Tram, Bus)","https://www.mvg.de/dienste/betriebsaenderungen.html"]];
const stoerRow=()=>`<div class="freq atipstoer">⚠️ Störungen: ${STOER.map(x=>`<a href="${x[1]}" target="_blank" rel="noopener">${x[0]}</a>`).join(" · ")}</div>`;
function mapsQ(q){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q)}
function renderReisen(){const l=urlaube();if(S.reiseOpen&&l.find(x=>x.id===S.reiseOpen))return renderReise(l.find(x=>x.id===S.reiseOpen));S.reiseOpen=null;return reiseHome()}
// Urlaub-Seite wie ein Am-Haus-Projekt (Florian 19.11.2026, „A: Ganz angleichen“): Kopfblock in Marine (Wann, Wo, 🧠, ❤), ✎ oben rechts öffnet die Eckdaten im Fenster,
// darunter Klapp-Karten Gemerkt, Packliste, Erinnerungen, Ausgaben, Rückblick (erst nach dem Urlaub); Erledigt und Löschen klein ganz unten.
function reiseLong(x){if(!x.from)return "";const a=ymdD(x.from),b=x.to&&x.to!==x.from?ymdD(x.to):null,M=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  if(!b)return a.getDate()+". "+M[a.getMonth()]+" "+a.getFullYear();
  return a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear()?a.getDate()+". bis "+b.getDate()+". "+M[b.getMonth()]+" "+b.getFullYear():a.getDate()+"."+(a.getMonth()+1)+". bis "+b.getDate()+"."+(b.getMonth()+1)+"."+b.getFullYear()}
function reiseEdit(uid,fresh){const x=urlaube().find(y=>y.id===uid);if(!x)return;S.verkNext=["urlaub",uid,x];
  editBox("⛵ Urlaub",[{k:"name",label:"Was",type:"text",val:fresh?"":x.name||"",ph:"z. B. Bretagne"},
    {k:"emo",label:"Symbol",type:"chips",opts:[...new Set(REISE_EMO)].map(e=>[e,e]),val:x.emo||"⛵"},
    {k:"from",label:"Wann: von",type:"date",val:x.from||""},{k:"to",label:"Bis",type:"date",val:x.to||""},
    {k:"care",label:"🧠 Kümmert sich",type:"chips",opts:[["","Noch offen"],["p0",pname("p0")],["p1",pname("p1")],["both","Beide"]],val:x.care||""},
    {k:"place",label:"Wo",type:"text",val:x.place||"",ph:"Ort oder Region"},
    {k:"budget",label:"💶 Budget grob (€)",type:"text",val:x.budget?String(x.budget):"",ph:"z. B. 1500"},
    {k:"note",label:"Notiz",type:"text",val:x.note||""}],
  async V=>{const nm=String(V.name||"").trim().slice(0,80)||x.name||"Neuer Urlaub",dt=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||"")?v:null,base="food/urlaub/"+uid+"/";let f=dt(V.from),t=dt(V.to);if(f&&t&&t<f)t=f;
    await S.store.setPath(base+"name",nm);await S.store.setPath(base+"emo",V.emo||"⛵");await S.store.setPath(base+"from",f);await S.store.setPath(base+"to",t);await S.store.setPath(base+"care",V.care||null);
    await S.store.setPath(base+"place",String(V.place||"").trim().slice(0,80)||null);await S.store.setPath(base+"budget",Math.max(0,Math.min(999999,parseInt(V.budget,10)||0))||null);await S.store.setPath(base+"note",String(V.note||"").trim().slice(0,2000)||null);toast("Gespeichert")})}
function renderReise(x){const st=reiseSt(x),cd=reiseDays(x),hc=x.hearts||{},pins=reiseSub(x,"pins"),bk=reiseSub(x,"book"),pl="u_"+x.id,items=packs().filter(i=>i.list===pl),pr=prios().filter(p=>p.ref===x.id),SL=REISE_ST.find(s=>s[0]===st)||REISE_ST[0];
  const cdT=cd&&cd.n?`noch ${cd.n} ${cd.n===1?"Tag":"Tage"}`:cd&&cd.now?"läuft gerade":cd&&cd.past&&st!=="erledigt"?"schon vorbei":"";
  let h=`<div class="section-head"><div><div class="eyebrow">Reisen · Urlaub</div><h1>${esc(x.emo||"⛵")} ${esc(x.name)}</h1></div><button class="iconbtn" data-act="reiseedit" aria-label="Eckdaten ändern">✎</button></div>`;
  const all=rgItems().filter(i=>i.u===x.id),bkd=all.filter(i=>i.st==="erledigt").length,g=grpByRef("urlaub:"+x.id),gn=g?monies().filter(m=>m.grp===g.id).length:0,open=items.filter(i=>!i.done).length;
  h+=`<div class="campback dash kiddash tripdash udash" aria-label="Urlaub auf einen Blick">${panelHead(SL[1]+" "+SL[2]+(cdT?" · "+cdT:""),x.from?esc(reiseLong(x)):"Noch kein Datum","","")}
    <ul class="bline">${x.place?`<li class="thr"><a class="btl" href="${esc(mapsQ(x.place))}" target="_blank" rel="noopener"><span class="bt">Wo</span><span class="bdot"></span><span class="bn">📍 ${esc(x.place)}</span></a>${transitA(x.place)}</li>`:`<li><button class="btl dim" data-act="reiseedit"><span class="bt">Wo</span><span class="bdot"></span><span class="bn">Ort eintragen ›</span></button></li>`}
    <li class="thr ucare"><span class="btl"><span class="bt">Kümmert</span><span class="bdot"></span><span class="bn"><button type="button" class="carehead${careVal("urlaub",x.id)?"":" open"}" data-care="urlaub|${esc(x.id)}" aria-label="Wer kümmert sich?">🧠 ${careVal("urlaub",x.id)?esc(careTxt(careVal("urlaub",x.id))):"?"}</button></span></span>${["p0","p1"].map(p=>`<button class="uheart" data-reiseheart="${p}" aria-pressed="${!!hc[p]}" aria-label="${esc(pname(p))} möchte hin">${hc[p]?"❤️":"🤍"} ${esc(pname(p))}</button>`).join("")}</li></ul>
    ${x.note?`<div class="kidwear">${esc(x.note)}</div>`:""}
    <div class="bcnts">${panelTile(open,"🧳 offen",'data-ugo="upack"')}${panelTile(bkd,"✅ gebucht",'data-ugo="f_rgu"')}${panelTile(g?gn:"–","💶 Ausgaben",'data-ugo="ugeld"')}</div></div>`;
  if(st==="aktuell"&&cd&&cd.past)h+=`<div class="btnrow"><button class="primary" data-reisest="erledigt">✅ Vorbei: auf Erledigt</button></div>`;
  if(pins.length||bk.length)fundMigrate(x);
  h+=rgCard(x.id);
  const done=items.filter(i=>i.done).length,VL=packLists().filter(l=>!/^[ut]_/.test(l.id)&&packs().some(i=>(i.list||"main")===l.id));
  h+=foldCard("upack",`🧳 Packliste`,items.length?`${items.length}, ${items.length-done} offen`:"",`<div class="unl scrollrow">${[["basis","🎒 Basis"],["strand","🏖️ Strand"],["winter","❄️ Winter"],["kind","🧒 Kleinkind"]].map(t=>`<button class="chipbtn neutral" data-packtpl="${t[0]}">+ ${t[1]}</button>`).join("")}${VL.map(l=>`<button class="chipbtn neutral" data-packcopy="${esc(l.id)}">+ ${esc(emoOf(l,"🎒"))} ${esc(l.name)}</button>`).join("")}</div>
    ${items.length?`<ul class="shop">${items.map(i=>`<li class="${i.done?"done":""}"><button class="tick" data-pack="${esc(i.id)}" aria-pressed="${!!i.done}" aria-label="${esc(i.name)} eingepackt"></button><span class="grow nm">${esc(i.name)}</span><button class="catbtn" data-packshop="${esc(i.id)}" aria-label="${esc(i.name)} auf die Einkaufsliste">🧺</button><button class="rm" data-packedit="${esc(i.id)}" aria-label="${esc(i.name)} ändern">✎</button><button class="rm" data-packrm="${esc(i.id)}" aria-label="${esc(i.name)} entfernen">✕</button></li>`).join("")}</ul>`:`<div class="freq">Oben eine Vorlage antippen oder unten eintragen.</div>`}
    <form class="addrow" id="rpackform" novalidate><input id="rpackinput" placeholder="Noch etwas einpacken" maxlength="60" autocomplete="off"><button class="primary" type="submit">+</button></form>`);
  h+=foldCard("uprio","🔔 Erinnerungen",pr.length||"",`${pr.length?`<ul class="evlist">${pr.map(p=>`<li><span class="t">${p.due?esc(dLabel(p.due)):""}</span><span class="ev">${esc(p.name)}</span></li>`).join("")}</ul>`:""}
    <div class="unl">${REISE_PRIO.map((n,i)=>`<button class="chipbtn neutral" data-reiseprio="${i}">＋ ${esc(n)}</button>`).join("")}</div>`);
  {const sc=splitChips("urlaub:"+x.id);h+=foldCard("ugeld","💶 Ausgaben",g&&gn?gn:"",`<div class="unl">${grpLinkHtml("urlaub:"+x.id,x.name,x.emo||"⛵",x.budget||"")}</div>${sc}${splitAddForm("urlaub:"+x.id)}`)}
  if(st==="erledigt"||(cd&&cd.past)||x.review)h+=foldCard("urev","📝 Rückblick","",`<label class="fld"><span>Wie war es? Was nehmen wir mit?</span><textarea data-rsf="review" rows="3">${esc(x.review||"")}</textarea></label>`,true);
  h+=`<div class="btnrow reiseact">${st==="erledigt"?`<button class="ghost small" data-reisest="aktuell">↩ Zurückholen</button>`:`<button class="ghost small" data-reisest="erledigt">✅ Auf Erledigt</button>`}${st==="traum"?`<button class="ghost small" data-reisest="aktuell">📅 Jetzt planen</button>`:""}<button class="ghost small danger" data-act="reisedel">🗑 Urlaub löschen</button></div>`;
  return h}
function renderUrlaub(){return `<section class="card"><div class="section-head"><h2>⛵ Urlaub</h2></div><div class="freq">Urlaube haben jetzt einen eigenen Bereich: Reisen, im Bild das Meer.</div><div class="mt2 btnrow"><button class="primary" data-go="reisen">Zu Reisen ›</button></div></section>`}
// Bauplan (Florian 17.11.2026): zwei Reiter. Übersicht = Urlaube (Projekte) als Zeile, darunter „🔖 Gemerkt“ (Ausflugsziele und alles für Urlaube in einer Liste),
// dann die Vorschläge (Geht immer, Was ist los) und Ferien. Alte Sprünge tt:ideen und tt:urlaub landen in der Übersicht; tt:recherche zeigt die ausführliche Gemerkt-Seite.
function renderTrips(){if(S.tripTab==="packs"){S.tripTab="urlaub";S.reiseOpen=null;S.tFold=S.tFold||{};S.tFold.upl=true}
  const T=["urlaub","ideen","pack","recherche"].includes(S.tripTab)?S.tripTab:"urlaub";S.tripTab=T;
  // Seiten-Leiste unten: Ausflüge | Reisen (Packlisten seit 19.11.2026 ohne eigene Seite: im Urlaub, am Ausflug, Vorlagen unter Reisen); Gemerkt mit allen Filtern bleibt eine Unterseite von Ausflüge
  const pg=T==="pack"||T==="urlaub"?1:0,pager=navPager("Ausflüge und Reisen",[["Ausflüge","ausflug|tt:ideen",pg===0],["Reisen","ausflug|tt:urlaub",pg===1]]);
  if(S.tripDraft)return navPager("Ausflüge und Reisen",[["Ausflüge","ausflug|tt:ideen",true],["Reisen","ausflug|tt:urlaub",false]])+`<div class="section-head"><div><div class="eyebrow">Ausflüge und Reisen</div><h1>Ausflüge</h1></div></div>`+renderTripIdeas();
  if(T==="urlaub"&&S.reiseOpen&&urlaube().find(x=>x.id===S.reiseOpen))return pager+renderReisen();
  if(T==="pack"){const L=curPack(),ur=L.id.startsWith("u_")&&urlaube().find(u=>"u_"+u.id===L.id);if(ur){S.reiseOpen=ur.id;S.tripTab="urlaub";S.tFold=S.tFold||{};S.tFold.upack=true;return pager+renderReisen()}
    return pager+`<div class="btnrow"><button class="ghost" data-nav="ausflug|tt:packs">‹ Reisen</button></div><div class="section-head"><div><div class="eyebrow">Reisen · Packliste</div><h1>${esc(emoOf(L,"🎒"))} ${esc(L.name)}</h1></div></div>`+renderPack()}
  let h=pager+`<div class="section-head"><div><div class="eyebrow">Ausflüge und Reisen</div><h1>${["Ausflüge","Reisen"][pg]}</h1></div><span class="headbtns">${pg===0&&T!=="recherche"?`<button class="chipbtn neutral" data-tfold="rmap" data-tdef="0" aria-expanded="${tFoldOn("rmap",false)}" aria-label="Alle Ziele auf einer Karte">🗺️</button>`:""}<button class="chipbtn neutral" data-prionew="ausflug" aria-label="Erinnerung anlegen">🔔</button></span></div>`;
  return h+(T==="recherche"?`<div class="btnrow"><button class="ghost" data-trip="ideen">‹ Ausflüge</button></div>`+renderRecherche():T==="urlaub"?reiseHome():tripHome())}
// Urlaub löschen samt Packliste, Erinnerungen und Ausgaben-Zuordnung (Ausgaben selbst bleiben)
async function reiseDel(uid){await splitDropRef("urlaub:"+uid);await prioDropRef([uid]);for(const i of packs().filter(i=>i.list==="u_"+uid))await S.store.setPath("food/pack/"+i.id,null);await S.store.setPath("food/packlist/u_"+uid,null);await S.store.setPath("food/urlaub/"+uid,null);if(S.reiseOpen===uid)S.reiseOpen=null}
// Lange auf einen Urlaub = ✕ Löschen wie überall (Florian 19.11.2026, statt des eigenen Menüs); Rückgängig holt Urlaub, Packliste, Erinnerungen und Ausgaben-Zuordnung zurück
async function reiseDelUndo(uid){const x=urlaube().find(y=>y.id===uid);if(!x)return;const F=S.food||{},cp=o=>JSON.parse(JSON.stringify(o)),K=[["food/urlaub/"+uid,cp((F.urlaub||{})[uid])]];
  if((F.packlist||{})["u_"+uid])K.push(["food/packlist/u_"+uid,cp(F.packlist["u_"+uid])]);
  packs().filter(i=>i.list==="u_"+uid).forEach(i=>K.push(["food/pack/"+i.id,cp((F.pack||{})[i.id])]));
  prios().filter(p=>p.ref===uid).forEach(p=>K.push(["food/prio/"+p.id,cp((F.prio||{})[p.id])]));
  const ref="urlaub:"+uid;[["split",splitFor(ref)],["money",monies().filter(y=>y.ref===ref)],["mgroup",mgroups().filter(y=>y.ref===ref)]].forEach(([n,l])=>l.forEach(y=>K.push(["food/"+n+"/"+y.id+"/ref",ref])));
  try{await reiseDel(uid)}catch(_){toast("Konnte nicht löschen.");return}render();
  toastAct("Urlaub gelöscht","↩ Rückgängig",async()=>{for(const k of K)if(k[1]!=null)await S.store.setPath(k[0],k[1]);toast("Urlaub ist wieder da");render()})}
// Gemerkt für unterwegs: Ausflugsziele (food/trip, „Für hier“) und Gemerktes für Urlaube (food/fund) in einer Liste mit Filtern nach Art, Urlaub und Stand
const tripSt=x=>x.done?"erledigt":x.date?"geplant":x.fav?"favorit":"idee";
function rgItems(){const U=urlaube(),L=[];
  // Ausflugsziele der Art Spielplatz (auch die aus Sport und Spiel umgezogenen) laufen unter der Art 🛝 Spielplatz
  trips().forEach(x=>{const k=tripKinds().find(c=>c[0]===x.kind),sp=x.kind==="spiel";L.push({t:"t",id:x.id,ic:emoOf(x,k?k[1]:"🚲"),name:x.name,art:sp?"spielplatz":"ausflug",artL:(sp?"Spielplatz":"Ausflugsziel"+(k&&k[0]!=="sonst"?" · "+k[2]:""))+(x.maps?" · 🗺️ in Maps":""),u:"hier",st:tripSt(x),date:x.date,place:x.place||x.name,rain:x.wx==="egal",pack:x.pack&&packLists().find(p=>p.id===x.pack),also:gmAlso(x),at:x.at||0})});
  funde("reise").forEach(f=>{const k=fundKind(f.kind,"reise"),u=f.reise&&U.find(y=>y.id===f.reise);L.push({t:"f",id:f.id,ic:k[1],name:f.name,art:k[0],artL:k[2]+(f.st==="gebucht"?" · gebucht":""),u:u?u.id:"hier",uL:u?(u.emo||"⛵")+" "+u.name:"",st:f.st==="gebucht"?"erledigt":f.st||"idee",place:f.addr||f.place||(u?f.name+" "+(u.place||""):""),ref:f.ref||"",also:gmAlso(f),at:f.at||0})});
  return L.sort((a,b)=>(b.at||0)-(a.at||0))}
const refMask=r=>"****"+String(r||"").slice(-2);
// Gemerkt nach dem Bauplan; mit uid nur für diesen Urlaub (eigene Filter S.rgUF über data-rguf, Erledigtes = gebucht bleibt sichtbar, unten)
function rgCard(uid){const inU=!!uid,F=inU?(S.rgUF&&S.rgUF.uid===uid?S.rgUF:(S.rgUF={uid,k:"",s:""})):(S.rgF||(S.rgF={k:"",u:"",s:""})),all=rgItems().filter(x=>inU?x.u===uid:x.u==="hier"),open=all.filter(x=>x.st!=="erledigt");
  const R=all.filter(x=>(!F.k||x.art===F.k)&&(inU||!F.u||x.u===F.u)&&(!F.w||x.rain)&&(F.s==="erledigt"?x.st==="erledigt":F.s?x.st===F.s:inU||x.st!=="erledigt"));if(inU)R.sort((a,b)=>(a.st==="erledigt")-(b.st==="erledigt"));
  const GG=inU||F.k||F.u||F.w?"":gmRows("reise",i=>F.s?i.st===F.s:i.st!=="erledigt");
  const n=F.more?R.length:Math.min(R.length,8),chip=(k,v,lab)=>`<button class="chipbtn neutral" ${inU?"data-rguf":"data-rgf"}="${k}|${v}" aria-pressed="${F[k]===v}">${lab}</button>`;
  const arts=(inU?[]:[["ausflug","🚲","Ausflugsziel"]]).concat(FAREA.reise.kinds).filter(a=>(inU?all:open).some(x=>x.art===a[0])||F.k===a[0]);
  const us=urlaube().filter(u=>open.some(x=>x.u===u.id)||F.u===u.id);
  const badge=x=>{const s=SAMM_ST.find(y=>y[0]===x.st)||SAMM_ST[0],lb=x.st==="geplant"&&x.date?"📅 "+dLabel(x.date):s[1]+" "+s[2];return `<button class="stbadge st-${x.st}" ${x.t==="t"?`data-tripst="${esc(x.id)}"`:`data-fundst="${esc(x.id)}" data-ar="reise"`} aria-label="Stand von ${esc(x.name)}: ${s[2]}, antippen schaltet weiter">${esc(lb)}</button>`};
  return `<section data-fk="${inU?"f_rgu":"f_rg"}|1" class="card rgcard"><div class="aic section-head"><h2>🔖 Gemerkt <span class="freq">(${inU?all.length:open.length})</span></h2><button class="primary" data-act="merken"${inU?` data-u="${esc(uid)}"`:""}>＋ Merken</button></div>
    ${inU?(all.length?`<div class="unl scrollrow">${chip("k","","Alle")}${arts.map(a=>chip("k",a[0],a[1]+" "+a[2])).join("")}${all.some(x=>x.st==="erledigt")||F.s==="erledigt"?chip("s","erledigt","✅ Gebucht"):""}</div>`:""):all.length?`<div class="unl scrollrow"><button class="chipbtn neutral" data-rgf="all|" aria-pressed="${!F.k&&!F.w&&!F.s}">Alle</button>${arts.map(a=>chip("k",a[0],a[1]+" "+a[2])).join("")}${open.some(x=>x.rain)||F.w?chip("w","regen","☔ Bei Regen"):""}${all.some(x=>x.st==="favorit")||F.s==="favorit"?chip("s","favorit","⭐ Favoriten"):""}${all.some(x=>x.st==="geplant")||F.s==="geplant"?chip("s","geplant","📅 Geplant"):""}${all.some(x=>x.st==="erledigt")||F.s==="erledigt"?chip("s","erledigt","✅ Erledigt"):""}</div>`:""}
    ${R.length?`<ul class="mklist">${R.slice(0,n).map(x=>`<li class="mk"><button class="mkb" ${x.t==="t"?`data-tripedit="${esc(x.id)}"`:`data-fundedit="${esc(x.id)}"`} aria-label="${esc(x.name)} ansehen und ändern"><span class="mki">${esc(x.ic)}</span><span class="mkt"><b>${esc(x.name)}</b><span class="freq">${esc(x.artL)}${x.ref?" · Buchung "+esc(refMask(x.ref)):""}${esc(x.also||"")}</span></span></button>${x.pack&&x.st!=="erledigt"?`<button class="catbtn routebtn" data-gopack="${esc(x.pack.id)}" aria-label="Packliste ${esc(x.pack.name)} öffnen">🎒</button>`:""}${x.st!=="erledigt"&&x.place?transitA(x.place):""}${badge(x)}</li>`).join("")}</ul>${R.length>n?`<button class="ghost small" ${inU?"data-rguf":"data-rgf"}="more|1">Alle ${R.length} zeigen</button>`:""}${GG?`<ul class="mklist gmlist">${GG}</ul>`:""}`
      :GG?`<ul class="mklist gmlist">${GG}</ul>`:`<div class="freq">${all.length?"Für diesen Filter ist nichts gemerkt.":inU?"Unterkunft, Anreise, Strände, Spielplätze, Restaurants: mit ＋ Merken anlegen. Alles steht auch in der 🗃️ Sammlung.":"Noch nichts gemerkt. Ausflugsziele, Spielplätze und Cafés für hier kommen mit ＋ Merken dazu."}</div>`}
    ${inU?`<div class="freq"><button class="linkish" data-act="bkopen">＋ Buchung mit Nummer eintragen</button> · <button class="linkish" data-fundopen="${esc(uid)}" data-ar="reise">✨ Vorschläge und alle Filter</button></div>${S.bkOpen===uid?`<form id="bkform" class="bkform" novalidate><input id="bk-name" placeholder="Was (z. B. Ferienhaus, Fähre)" maxlength="80" autocomplete="off"><input id="bk-ref" placeholder="Buchungsnummer" maxlength="60" autocomplete="off"><input id="bk-link" type="url" placeholder="Link" autocomplete="off"><input id="bk-addr" placeholder="Adresse oder Anfahrt" maxlength="160" autocomplete="off"><button class="primary" type="submit">Hinzufügen</button></form>`:""}`
      :`<div class="freq"><button class="linkish" data-act="tripnew">＋ Ausflugsziel mit allen Angaben</button></div>`}</section>`}
// Fenster „🔖 Merken“ (Florian 17.11.2026): Was, Art, Gehört zu, Stand. Ausflugsziel für hier → food/trip, alles andere → food/fund (Daten bleiben, wo sie waren)
function merkenOpen(pre){pre=pre||{};const U=urlaube().filter(u=>reiseSt(u)!=="erledigt");
  editBox("🔖 Merken",[{k:"name",label:"Was (Name oder Link)",type:"text",val:pre.name||""},
    {k:"kind",label:"Art",type:"chips",opts:[["ausflug","🚲 Ausflugsziel"]].concat(FAREA.reise.kinds.map(c=>[c[0],c[1]+" "+c[2]])),val:pre.kind!=null?pre.kind:"ausflug"},
    {k:"u",label:"Gehört zu",type:"chips",opts:[["","🏙️ Für hier"]].concat(U.map(u=>[u.id,(u.emo||"⛵")+" "+u.name])),val:pre.u||""},
    {k:"st",label:"Stand",type:"chips",opts:SAMM_ST.map(s=>[s[0],s[1]+" "+s[2]]),val:"idee"},
    {k:"n",type:"note",label:"Steht danach unter 🔖 Gemerkt, im Urlaub und in der 🗃️ Sammlung. Mit Datum (📅 Geplant) auch im Kalender."}],
  async V=>{const raw=String(V.name||"").trim();if(!raw){toast("Bitte eintragen, was ihr euch merken wollt.");return}const link=safeLink(raw),name=(link?nameFromLink(link):raw).slice(0,80),now=Date.now();
    if((V.kind==="ausflug"||V.kind==="spielplatz")&&!V.u){const id=newId("t"),o={name,at:now,by:S.me||""};if(V.kind==="spielplatz")o.kind="spiel";if(link)o.link=link;if(V.st==="favorit")o.fav=true;if(V.st==="erledigt"){o.done=true;o.doneAt=now}
      await S.store.setPath("food/trip/"+id,o);if(V.st==="geplant")calDayPick(name,nextSat(),async k=>{try{await S.store.setPath("food/trip/"+id+"/date",k);toast("Steht am "+rDate(k)+" im Kalender")}catch(_){toast("Konnte nicht speichern.")}});else toast("🔖 "+name+" gemerkt");return}
    const kind=V.kind==="ausflug"?"erleben":V.kind||kindGuess(raw,link)||"sonst",o={name,kind,st:V.st==="erledigt"?"gebucht":V.st||"idee",at:now,by:S.me||""};if(V.u)o.reise=V.u;if(link)o.link=link;
    await S.store.setPath("food/fund/"+newId("f"),o);toast(fundKind(kind,"reise")[1]+" "+name+" gemerkt")})}
// Angleichen (Florian 19.11.2026, „A: Ganz angleichen“, Bild /mnt/project-files/design/ausfluege-reisen-angleichen.png): Kopfblock in Marine, darunter nur Klapp-Karten
function wkndDays(){const t=startOfDay(new Date()),g=t.getDay();return g===0?[t]:[addDays(t,(6-g+7)%7),addDays(t,(6-g+7)%7+1)]}
function tripHead(){const now=new Date(),today=ymd(now),W=wkndDays(),wk=W.map(ymd),D=(S.wx&&S.wx.days)||{},WI={"":"☀️",wolkig:"⛅",bedeckt:"☁️",nebel:"🌫️",regen:"🌧️",schnee:"🌨️",gewitter:"⛈️"};
  const ttl=W.map(d=>{const w=D[ymd(d)];return WD2[d.getDay()]+(w&&w.t!=null?" "+(WI[wxKind(w.c)]||"⛅")+" "+Math.round(w.t)+"°":" "+d.getDate()+"."+(d.getMonth()+1)+".")}).join(" · ");
  const dl=k=>{const d=ymdD(k);return k===today?"Heute":(d-startOfDay(now))/864e5<8?WD2[d.getDay()]+" "+d.getDate()+".":d.getDate()+"."+(d.getMonth()+1)+"."};
  const all=rgItems().filter(x=>x.u==="hier"),open=all.filter(x=>x.st!=="erledigt"),pl=trips().filter(x=>x.date&&!x.done&&x.date>=today).sort((a,b)=>a.date<b.date?-1:1);
  const tips=atipItems().filter(i=>!i.dauer),last=wk[wk.length-1],inW=i=>{const f=i.date||i.from,t=i.to||f;return f&&f<=last&&t>=wk[0]},tip=tips.filter(inW).sort((a,b)=>(b.top?1:0)-(a.top?1:0))[0];
  const R=pl.slice(0,3).map(x=>`<li><button class="btl" data-tripedit="${esc(x.id)}"><span class="bt">${esc(dl(x.date))}</span><span class="bdot"></span><span class="bn">${esc(emoOf(x,"🚲"))} ${esc(x.name)}</span></button></li>`);
  if(tip)R.push(`<li><button class="btl" data-thgo="atip"><span class="bt">${esc(dl((tip.date||tip.from)>wk[0]?(tip.date||tip.from):wk[0]))}</span><span class="bdot"></span><span class="bn">🗓️ ${esc(tip.name)} <i>(Was ist los)</i></span></button></li>`);
  const F=freiNext(1,45)[0];if(F)R.push(`<li><button class="btl" data-nav="ausflug|tt:urlaub"><span class="bt">${esc(F.k===today?"Heute":"ab "+F.d.getDate()+"."+(F.d.getMonth()+1)+".")}</span><span class="bdot"></span><span class="bn">${F.ic} ${esc(F.name)}</span></button></li>`);
  if(!R.length)R.push(`<li><button class="btl dim" data-act="ausflugnew"><span class="bt"></span><span class="bdot"></span><span class="bn">Noch nichts geplant. Ausflug eintragen ›</span></button></li>`);
  return `<div class="campback dash kiddash tripdash" aria-label="Dieses Wochenende auf einen Blick">${panelHead(W.length===1?"Heute · Sonntag":"Dieses Wochenende",esc(ttl),"","")}<ul class="bline">${R.join("")}</ul>
    <div class="bcnts">${panelTile(open.length,"🔖 Gemerkt",'data-thgo="gem"')}${panelTile(pl.length,"📅 Geplant",'data-thgo="plan"')}${panelTile(tips.length,"🗓️ Was ist los",'data-thgo="atip"')}</div></div>`}
function tripHome(){const mu=(S.food&&S.food.reisemap)||"",emb=mapsEmbed(mu);
  let h=tripHead();
  if(tFoldOn("rmap",false))h+=`<section class="card" id="rmapcard"><div class="section-head"><h2>🗺️ Alle Ziele auf einer Karte</h2><button class="ghost small" data-tfold="rmap" data-tdef="0" aria-label="Karte schließen">✕</button></div>${(m=>m&&mapOk(m)?`<div class="btnrow"><a class="ghost linkbtn" href="${esc(m)}" target="_blank" rel="noopener noreferrer">🛝 Eure Spielplatz-Karte öffnen</a></div>`:"")((S.food&&S.food.playmap)||"")}${emb?`<div class="mapwrap"><iframe src="${esc(emb)}" loading="lazy" title="Karte mit allen Zielen"></iframe></div>`:mu?`<a href="${esc(mu)}" target="_blank" rel="noopener">Karte öffnen</a>`:""}<form class="addrow" id="reisemapform" novalidate><input type="url" id="reisemapinput" value="${esc(mu)}" placeholder="Link zu eurer Karte aus Google Maps" autocomplete="off"><button class="primary" type="submit">OK</button></form></section>`;
  // Ausflug eintragen gut sichtbar (Florian 19.11.2026: „viel zu klein im Verhältnis zum Urlaub“)
  h+=`<button class="primary ausnew" data-act="ausflugnew">🚲 ＋ Ausflug eintragen</button>`+rgCard()+atipCard()+atipFixCards();
  return h}
// Seite Reisen: Kopfblock „Nächster Urlaub“, Urlaube als Liste im Gemerkt-Bauplan (Filter Alle | Geplant | Idee | Erledigt), darunter Klapp-Karten
function reiseNext(){const A=urlaube().filter(x=>reiseSt(x)==="aktuell"&&!(reiseDays(x)||{}).past);return A.filter(x=>x.from).sort((a,b)=>a.from<b.from?-1:1)[0]||A[0]||null}
function reiseHead(){const x=reiseNext();
  if(!x)return `<div class="campback dash kiddash tripdash" aria-label="Nächster Urlaub">${panelHead("Nächster Urlaub","Noch nichts geplant","","")}<ul class="bline"><li><button class="btl dim" data-act="reisenew" data-st="aktuell"><span class="bt"></span><span class="bdot"></span><span class="bn">＋ Urlaub anlegen ›</span></button></li></ul></div>`;
  const cd=reiseDays(x),po=packs().filter(i=>i.list==="u_"+x.id&&!i.done).length,gm=rgItems().filter(i=>i.u===x.id).length,today=ymd(new Date()),pr=prios().filter(p=>(p.ref===x.id||p.ref==="urlaub:"+x.id)&&!p.done),due=pr.filter(p=>p.due&&p.due<=today).length;
  const eye="Nächster Urlaub"+(cd&&cd.now?" · läuft gerade":cd&&cd.n?" · noch "+cd.n+" "+(cd.n===1?"Tag":"Tage"):"");
  const row=(l,v,extra)=>`<li class="thr"><button class="btl" data-reise="${esc(x.id)}"><span class="bt">${l}</span><span class="bdot"></span><span class="bn">${v}</span></button>${extra||""}</li>`;
  return `<div class="campback dash kiddash tripdash" aria-label="Nächster Urlaub">${panelHead(esc(eye),`<button class="thtitle" data-reise="${esc(x.id)}">${esc(x.emo||"⛵")} ${esc(x.name)}</button>`,"","")}<ul class="bline">${row("Wann",x.from?esc(reiseWhen(x)):"noch ohne Datum")}${x.place?row("Wo","📍 "+esc(x.place),transitA(x.place)):""}</ul>
    <div class="bcnts">${panelTile(po,"🧳 offen",`data-reise="${esc(x.id)}" data-uf="upack"`)}${panelTile(gm,"🔖 Gemerkt",`data-reise="${esc(x.id)}"`)}${panelTile(due||pr.length,due?"🔔 fällig":"🔔 offen",`data-reise="${esc(x.id)}" data-uf="uprio"`)}</div></div>`}
function reiseList(){const hearts=x=>Object.values(x.hearts||{}).filter(Boolean).length,O={aktuell:0,traum:1,erledigt:2},f=S.urlF||"";
  const all=urlaube().slice().sort((a,b)=>O[reiseSt(a)]-O[reiseSt(b)]||(reiseSt(a)==="traum"?hearts(b)-hearts(a)||(a.at||0)-(b.at||0):reiseSt(a)==="erledigt"?String(b.from||"").localeCompare(String(a.from||"")):String(a.from||"9").localeCompare(String(b.from||"9")))),R=all.filter(x=>!f||reiseSt(x)===f);
  const chip=(v,lab)=>`<button class="chipbtn neutral" data-urlf="${v}" aria-pressed="${f===v}">${lab}</button>`;
  const sub=x=>{const st=reiseSt(x),cd=reiseDays(x),hc=x.hearts||{},c=careMini("urlaub",x.id);return [x.from?reiseWhen(x)+(st==="aktuell"&&cd&&cd.n?" · in "+cd.n+" T.":st==="aktuell"&&cd&&cd.now?" · läuft gerade":""):"noch ohne Datum",x.place?"📍 "+x.place:"",st==="traum"?(hc.p0?"❤️":"🤍")+(hc.p1?"❤️":"🤍"):"",c].filter(Boolean).join(" · ")};
  return `<section data-fk="f_url|1" class="card rgcard urlcard"><div class="aic section-head"><h2>⛵ Urlaube <span class="freq">(${all.length})</span></h2><button class="ghost small" data-act="reisenew" data-st="aktuell" aria-label="Neuer Urlaub oder Idee">＋ Urlaub</button></div>
    ${all.length?`<div class="unl scrollrow">${chip("","Alle")}${REISE_ST.filter(s=>all.some(x=>reiseSt(x)===s[0])||f===s[0]).map(s=>chip(s[0],s[1]+" "+s[2])).join("")}</div>`:""}
    ${R.length?`<ul class="mklist">${R.map(x=>{const st=reiseSt(x),s=REISE_ST.find(y=>y[0]===st);return `<li class="mk${st==="erledigt"?" mkdone":""}"><button class="mkb" data-reise="${esc(x.id)}" aria-label="${esc(x.name)} öffnen"><span class="mki">${esc(x.emo||"⛵")}</span><span class="mkt"><b>${esc(x.name)}</b><span class="freq">${esc(sub(x))}</span></span></button><button class="stbadge st-${st==="aktuell"?"geplant":st==="traum"?"idee":"erledigt"}" data-urlst="${esc(x.id)}" aria-label="Stand von ${esc(x.name)}: ${s[2]}, antippen schaltet weiter">${s[1]} ${s[2]}</button></li>`}).join("")}</ul>`:`<div class="freq">${all.length?"Für diesen Filter gibt es keinen Urlaub.":"Noch kein Urlaub. Mit ＋ Urlaub anlegen, auch als Idee."}</div>`}</section>`}
function packVorl(){const L=packLists().filter(l=>!/^[ut]_/.test(l.id)),T=packLists().filter(l=>/^t_/.test(l.id)),row=l=>{const it=packs().filter(i=>(i.list||"main")===l.id),o=it.filter(i=>!i.done).length;return `<li class="mk"><button class="mkb" data-gopack="${esc(l.id)}" aria-label="Packliste ${esc(l.name)} öffnen"><span class="mki">${esc(emoOf(l,"🎒"))}</span><span class="mkt"><b>${esc(l.name)}</b><span class="freq">${it.length?it.length+(it.length===1?" Ding":" Dinge")+(o<it.length?", "+o+" offen":""):"noch leer"}</span></span></button><em class="mkgo">›</em></li>`};
  return foldCard("upl","🧳 Packlisten-Vorlagen",L.length,`<ul class="mklist">${L.map(row).join("")}</ul>${T.length?`<div class="mt2 freq">Für Termine</div><ul class="mklist">${T.map(row).join("")}</ul>`:""}${S.packListNew?`<form class="addrow" id="packlistform" novalidate><input type="text" id="packlistinput" placeholder="Zum Beispiel Strand oder Übernachtung" maxlength="40" autocomplete="off" enterkeyhint="done" aria-label="Name der Liste"><button class="primary" type="submit">Anlegen</button></form>`:`<div class="btnrow"><button class="ghost small" data-act="packlistnew">＋ Neue Vorlage</button></div>`}<div class="freq">Eine Vorlage bleibt für jeden Ausflug. Im Urlaub kommt sie mit einem Tipp in dessen Packliste.</div>`)}
function reiseHome(){let h=reiseHead()+reiseList()+packVorl();
  {const F=freiNext(10);if(F.length)h+=foldCard("frei","🏖️ Ferien und Feiertage",F.length,`<ul class="evlist frei">${F.map(x=>`<li><span class="ev">${freiLine(x)}</span></li>`).join("")}</ul>${ferienList().length?"":`<div class="freq">Die Schulferien kommen gleich nach; Feiertage sind schon da.</div>`}`)}
  {const mz=musLinks("auto",3);if(mz)h+=foldCard("rmus","🚗 Musik für die Fahrt","",mz)}
  return h}
const tripKinds=()=>catsOf("trip",TRIP_KIND);
const TRIP_KIND=[["wandern","🥾","Wandern"],["wasser","🏖️","Baden und Strand"],["stadt","🏛️","Stadt und Museum"],["tiere","🐐","Tiere"],["spiel","🛝","Spielplatz"],["rad","🚲","Radtour"],["essen","🍽️","Einkehren"],["sonst","📎","Sonstiges"]];
const TRIP_WX=[["sonne","☀️","Nur bei schönem Wetter"],["egal","🌧️","Geht auch bei Regen"]];
const TRIP_DUR=[["kurz","Ein paar Stunden"],["halb","Halber Tag"],["ganz","Ganzer Tag"],["nacht","Mit Übernachtung"]];
const TRIP_KID=[["wagen","Kinderwagen geht"],["wickeln","Wickeln möglich"],["spiel","Spielplatz da"],["einkehr","Einkehr in der Nähe"]];
const TRIP_COST=[["0","Kostenlos"],["1","€"],["2","€€"],["3","€€€"]];
const TRIP_SEA=[["spring","Frühling"],["summer","Sommer"],["autumn","Herbst"],["winter","Winter"]];
const csv=v=>(v||"").split(",").filter(Boolean);
const lab=(L,k)=>(L.find(x=>x[0]===k)||[])[L[0].length===3?2:1]||"";
function tripTags(x){const k=tripKinds().find(c=>c[0]===x.kind),out=[];if(x.date&&!x.done)out.push("📅 "+dLabel(x.date));if(k)out.push(k[1]+" "+k[2]);if(x.wx==="egal")out.push("🌧️ auch bei Regen");if(x.dur)out.push("⏱️ "+lab(TRIP_DUR,x.dur));if(x.drive)out.push("🚗 "+x.drive+" min");if(x.cost)out.push(lab(TRIP_COST,x.cost));
  csv(x.kid).forEach(c=>out.push("👶 "+lab(TRIP_KID,c)));const se=csv(x.season);if(se.length&&se.length<4)out.push("📅 "+se.map(c=>lab(TRIP_SEA,c)).join(", "));return out}
// Was ist los: Ergebnis der Ausflugs-Recherche (ausflugtipps.json, Florian 15.11.2026)
// {updated, region, items:[{name,where:stadt|umland,io:draussen|drinnen,cat:natur|kultur|markt|tiere,date?|from?,to?,time?,place?,travel?,link?,kid?,price?,note?,kind?}]}
const ATIP_WO=[["stadt","🏙️","In der Stadt"],["umland","🚆","Ausflüge ins Umland"]];
// Feste Orte (Florian 15.11.2026): "Geht immer" (season:"immer") und nach Jahreszeit (season:["winter",…], Schlüssel wie season())
const atipSeas=i=>i.season==="immer"||!i.season?["immer"]:(Array.isArray(i.season)?i.season:[i.season]);
const ATIP_IO=[["draussen","☀️","Draußen"],["drinnen","☔","Drinnen"]];
// Rubriken für ein Kind von 2 bis 3 Jahren (Florian 16.11.2026): dazu Klettern und Hüpfen, Wasser, Fahrzeuge, Musik und Mitmachen
const ATIP_CAT=[["floh","🧺","Flohmärkte"],["fest","🎪","Feste und Märkte"],["spiel","🛝","Spielplätze"],["klettern","🧗","Klettern und Hüpfen"],["wasser","💦","Wasser"],["fahrzeug","🚒","Fahrzeuge"],["kinder","🎭","Kinderprogramm"],["musik","🎶","Musik und Mitmachen"],["kultur","🏛️","Museum und Kultur"],["natur","🌳","Natur und Bewegung"],["tiere","🐐","Tiere"]];
// Merkmale je Tipp (Florian 16.11.2026): kurz = bis 2 Stunden (dur:"kurz"), Kinderwagen (pram), Café oder Wickelplatz (cafe), Alter ab (age).
// Alter: nur aussortieren, was klar erst ab 4 ist (im Zweifel zeigen, das Kind kann schon viel)
const ATIP_FEAT=[["kurz","⏱️","Kurz",i=>i.dur==="kurz"],["wagen","👶","Kinderwagen",i=>!!i.pram],["cafe","☕","Café/Wickeln",i=>!!i.cafe],["alter","🧒","Passt mit 3",i=>!(+i.age>3)]];
// Gerade beliebt: food/pref/kidlikes (Einstellungen › Wir, Vorgabe Klettern, Hüpfen); Treffer über Wortstamm, Rubrik oder like:[…] am Tipp
const ATIP_SYN={kletter:"kletter|boulder|klettergerüst|bewegungslandschaft",hüpf:"hüpf|trampolin|spring|hopse",wasser:"wasser|bad|plansch|schwimm",fahrzeug:"fahrzeug|bagger|baustelle|zug|tram|feuerwehr|flughafen|traktor",tier:"tier|zoo|bauernhof"};
const kidLikes=()=>{const p=S.food&&S.food.pref;const v=p&&p.kidlikes!=null?p.kidlikes:"Klettern, Hüpfen";return String(v).split(/[,;]/).map(x=>x.trim()).filter(Boolean)};
const likeRx=()=>{const L=kidLikes().map(w=>{const k=w.toLowerCase(),st=k.replace(/(en|n|e)$/,"");const syn=Object.keys(ATIP_SYN).find(x=>st.startsWith(x)||x.startsWith(st));return syn?ATIP_SYN[syn]:st.replace(/[.*+?^${}()|[\]\\]/g,"")}).filter(Boolean);return L.length?new RegExp(L.join("|"),"i"):null};
const atipLike=(i,rx)=>!!rx&&(rx.test([i.name,i.note,lab(ATIP_CAT,atipCat(i))].concat(i.like||[]).join(" ")));
// „markt“ gab es doppelt (Florian 16.11.2026): zählt als Feste und Märkte
const atipCat=i=>i.cat==="markt"?"fest":i.cat;
// Passt zum Wetter: Tage der nächsten Woche nach Vorhersage; Einträge mit wx:["schnee"|"wind"|"regen"|"sonne"]
const ATIP_WX=[["schnee","❄️","Schnee","Schlitten fahren, Schneemann"],["wind","🪁","Wind","Drachen steigen"],["regen","🌧️","Regen","Drinnen spielen"],["sonne","☀️","Sonne","Spielplatz, Tierpark"]];
function atipWxDays(){const D=S.wx&&S.wx.days;if(!D)return {};const out={},DN=["So","Mo","Di","Mi","Do","Fr","Sa"];for(let n=0;n<7;n++){const d=addDays(startOfDay(new Date()),n),k=ymd(d),x=D[k];if(!x)continue;const kd=wxKind(x.c);
  const tags=[];if((x.s||0)>0||kd==="schnee")tags.push("schnee");if(windy(x)&&(x.r||0)<1)tags.push("wind");if((x.r||0)>=2||kd==="regen"||kd==="gewitter")tags.push("regen");else if((kd===""||kd==="wolkig")&&(x.t||0)>=6)tags.push("sonne");
  tags.forEach(t=>{(out[t]=out[t]||[]).push(n===0?"heute":n===1?"morgen":DN[d.getDay()])})}return out}
function atipItems(){const j=S.atipps;if(!j||!Array.isArray(j.items))return [];const t=ymd(new Date()),have=new Set(trips().map(x=>(x.name||"").toLowerCase()));
  return j.items.filter(i=>i&&i.name&&((i.to||i.date||"9999")>=t)&&!have.has(String(i.name).toLowerCase()))}
function atipWhen(i){const f=i.date||i.from,t=i.to;const d=x=>{const m=String(x||"").match(/(\d{4})-(\d\d)-(\d\d)/);return m?`${+m[3]}.${+m[2]}.`:""};return f?(t&&t!==f?d(f)+"–"+d(t):d(f))+(i.time?" "+i.time:""):"laufend"}
// Übersicht aufgeräumt (Florian 16.11.2026): Vorgabe Stadt und Umland, nur Draußen, alle Rubriken; Liste erst Stadt, dann Umland,
// Rubriken darin einklappbar (hq-tfold, Schlüssel ac_<wo>_<rubrik>), Rubrik-Chips in einer wischbaren Zeile
const atipWO=()=>S.atipWO||"",atipIOv=()=>S.atipIO==null?"draussen":S.atipIO;
const atipTog=(cur,v,L)=>cur===""?L.find(x=>x[0]!==v)[0]:"";
function atipCard(){const all=atipItems(),z=S.atipZ||"woche",c=S.atipC||"",io=atipIOv(),wo=atipWO(),wx=S.atipWX||"",fr=!!S.atipFree,wd=atipWxDays(),t=ymd(new Date()),end=ymd(addDays(new Date(),z==="woche"?7:31));
  const FS=S.atipF||{},FT=ATIP_FEAT.filter(f=>FS[f[0]]),lk=!!S.atipLk,rx=likeRx();
  const L=all.filter(i=>(!wx||(Array.isArray(i.wx)?i.wx:[i.wx]).includes(wx))&&(!fr||i.free||/^(frei|kostenlos|gratis|0)/i.test(String(i.price||"")))&&(!c||atipCat(i)===c)&&FT.every(f=>f[3](i))&&(!lk||atipLike(i,rx))&&(!io||i.io===io||i.io==="beides"||!i.io)&&(!wo||(i.where||"stadt")===wo)&&((i.date||i.from||t)<=end)).sort((a,b)=>(a.date||a.from||"")<(b.date||b.from||"")?-1:1);
  const chip=(k,v,on,txt)=>`<button class="chipbtn neutral" data-${k}="${v}" aria-pressed="${on}">${txt}</button>`;
  const rain=S.wx&&S.wx.cur!=null&&/regen|gewitter|schnee/.test(wxKind(S.wx.cur));
  // Florian 17.11.2026: auch „Was ist los“ klappbar (Vorgabe offen, Stand je Gerät in hq-tfold)
  const fon=tFoldOn("atip",false),nL=L.filter(i=>!i.dauer).length;
  let h=`<section class="card atip tfold"><button class="setsum" data-tfold="atip" data-tdef="0" aria-expanded="${fon}"><h2>🗓️ Was ist los${nL?` <span class="freq">(${nL})</span>`:""}</h2><i>${fon?"▾":"›"}</i></button>`;
  if(!fon)return h+`</section>`;
  h+=`${S.atipps&&S.atipps.updated?`<div class="freq">Stand ${esc(rDate(S.atipps.updated)||S.atipps.updated)}${S.atipps.region?" · "+esc(S.atipps.region):""}</div>`:""}
  ${(()=>{const F=freiNext(3,31);return F.length?`<div class="freq atipfrei">Frei bald: ${F.map(freiLine).join(" · ")}</div>`:""})()}
  <div class="atipf"><div class="unl scrollrow">${ATIP_WO.map(a=>chip("atipwo",a[0],!wo||wo===a[0],a[1]+" "+(a[0]==="stadt"?"Stadt":"Umland"))).join("")}<i class="atipsep"></i>${ATIP_IO.map(a=>chip("atipio",a[0],!io||io===a[0],a[1]+" "+a[2]+(a[0]==="drinnen"&&rain&&io==="draussen"?" (heute Regen)":""))).join("")}</div>
  <div class="unl scrollrow">${rx?`<button class="chipbtn neutral" data-atiplk="1" aria-pressed="${lk}" title="Einstellungen › Wir">💛 Gerade beliebt: ${esc(kidLikes().join(", "))}</button>`:""}${chip("atipz","woche",z==="woche","Diese Woche")}${chip("atipz","monat",z==="monat","Diesen Monat")}<button class="chipbtn neutral" data-atipfree="1" aria-pressed="${fr}">🆓 Kostenlos</button>${ATIP_FEAT.map(f=>`<button class="chipbtn neutral" data-atipfeat="${f[0]}" aria-pressed="${!!FS[f[0]]}">${f[1]} ${f[2]}</button>`).join("")}${ATIP_WX.filter(a=>wd[a[0]]).map(a=>chip("atipwx",wx===a[0]?"":a[0],wx===a[0],a[1]+" "+a[3]+" · "+wd[a[0]].slice(0,3).join(", "))).join("")}</div>
  <div class="unl scrollrow">${chip("atipc","",!c,"Alle")}${ATIP_CAT.map(a=>chip("atipc",a[0],c===a[0],a[1]+" "+a[2])).join("")}</div></div>`;
  if(!S.atipps||!S.atipps.items||!S.atipps.items.length)return h+`<div class="freq">Hier erscheint, was in München und im Umland los ist (höchstens 1:30 mit Zug oder Auto), kindertauglich: Flohmärkte, Feste, Spielplätze, Kinderprogramm, Museen, Natur, Tiere, dazu Ideen passend zum Wetter. Wochentipps sonntags, Monatsüberblick vor Monatsbeginn.</div></section>`;
  const LD=L.filter(i=>!i.dauer);
  if(!LD.length)h+=`<div class="mt2 freq">Für diese Auswahl gerade keine Termine. Probiert „Diesen Monat“${io?" oder auch „"+(io==="draussen"?"☔ Drinnen":"☀️ Draußen")+"“":""}.</div>`;
  ATIP_WO.filter(w=>!wo||wo===w[0]).forEach(w=>{const G=LD.filter(i=>(i.where||"stadt")===w[0]);if(!G.length)return;
    if(!wo)h+=`<h3 class="atipwh">${w[1]} ${w[0]==="stadt"?"In der Stadt":"Im Umland"} <span class="freq">(${G.length})</span></h3>`;
    const by={};G.forEach(i=>{const k=ATIP_CAT.some(x=>x[0]===atipCat(i))?atipCat(i):"sonst";(by[k]=by[k]||[]).push(i)});
    ATIP_CAT.concat([["sonst","📎","Sonstiges"]]).forEach(a=>{const g=by[a[0]];if(!g)return;const k="ac_"+w[0]+"_"+a[0],on=tFoldOn(k,true);
      h+=`<button class="atipgrp" data-tfold="${k}" data-tdef="1" aria-expanded="${on}"><span>${a[1]} ${a[2]} <span class="freq">(${g.length})</span></span><i>${on?"▾":"›"}</i></button>${on?`<ul class="evlist atipl">${g.map(atipLi).join("")}</ul>`:""}`})});
  return h+archAusRow()+stoerRow()+`</section>`}
// Ausflüge kompakt (Florian 16.11.2026): Gemerkt, Geht immer und Jahreszeit als Klapp-Karten mit Anzahl, Stand je Gerät in hq-tfold; Tipps zeigen nur den Titel, Tipp öffnet den Rest
try{S.tFold=JSON.parse(localStorage.getItem("hq-tfold")||"{}")||{}}catch(_){S.tFold={}}
const tFoldOn=(k,def)=>S.tFold&&k in S.tFold?!!S.tFold[k]:!!def;
// Einklappen in der ganzen App (Florian 17.11.2026, „So bauen wie im Dokument“): Karten tragen die Marke data-fk="<schlüssel>|<vorgabe>".
// foldAll macht beim Zeichnen aus der ersten Überschrift den Klapp-Knopf (.foldh, schaltet wie data-tfold); zugeklappt bleibt nur der Kopf samt Knöpfen rechts.
function foldOne(k,def,html){const on=tFoldOn(k,def),a=html.indexOf("<h2"),b=html.indexOf("</h2>");if(a<0||b<a)return html;
  const pre=html.slice(0,a),h2=html.slice(a,b+5);let rest=html.slice(b+5);
  if(!on){let end=0;if(/<div class="[^"]*section-head"[^>]*>\s*$/.test(pre)){let d=1,m;const rx=/<(\/?)div\b/g;while((m=rx.exec(rest))){d+=m[1]?-1:1;if(!d){end=m.index+6;break}}}rest=rest.slice(0,end)+"</section>"}
  return pre.replace(/class="/,'class="foldc ')+`<button class="foldh" data-tfold="${esc(k)}" data-tdef="${def?1:0}" aria-expanded="${on}">${h2}<i>${on?"▾":"›"}</i></button>`+rest}
function foldAll(html){let i=0;for(;;){i=html.indexOf('<section data-fk="',i);if(i<0)return html;const q=html.indexOf('"',i+18),kd=html.slice(i+18,q).split("|");
  let d=0,e=-1,m;const rx=/<(\/?)section\b/g;rx.lastIndex=i;while((m=rx.exec(html))){d+=m[1]?-1:1;if(!d){e=m.index+10;break}}if(e<0)return html;
  html=html.slice(0,i)+foldOne(kd[0],kd[1]==="1","<section"+html.slice(q+1,e))+html.slice(e);i++}}
function foldCard(k,title,n,body,def,cls){const on=tFoldOn(k,def);return `<section class="card tfold${cls?" "+cls:""}"><button class="setsum" data-tfold="${esc(k)}" data-tdef="${def?1:0}" aria-expanded="${on}"><h2>${title}${n===""||n==null?"":` <span class="freq">(${n})</span>`}</h2><i>${on?"▾":"›"}</i></button>${on?`<div class="tfoldb">${body}</div>`:""}</section>`}
function atipLi(i){const u=safeLink(i.link),ix=S.atipps.items.indexOf(i),on=!!(S.atipOpen&&S.atipOpen[ix]),kc=i.dauer&&ATIP_CAT.find(x=>x[0]===atipCat(i));
  const short=i.dauer?(i.where==="umland"?"Umland":""):atipWhen(i);
  return `<li class="atipli${on?" on":""}"><div class="atiprow"><button class="atipnm" data-atipopen="${ix}" aria-expanded="${on}"><span class="atipt">${kc?kc[1]+" ":""}${i.top?"✨ ":""}${atipLike(i,likeRx())?"💛 ":""}${esc(i.name)}</span>${short?`<span class="freq">${esc(short)}</span>`:""}</button>${transitA(i.place||i.name)}</div>${on?`<div class="atipmore"><span class="freq">${i.top?"✨ Spielplatz der Woche · ":""}${[i.free?"🆓":"",i.where==="stadt"?"🏙️":i.where==="umland"?"🚆":"",i.io==="drinnen"?"☔":i.io==="draussen"?"☀️":"",i.dur==="kurz"?"⏱️ kurz":i.dur==="halb"?"⏱️ halber Tag":"",i.pram?"👶 Kinderwagen":"",i.cafe?"☕ Café/Wickeln":"",+i.age?"ab "+i.age+" J.":"",i.place,i.travel,i.price,i.kid?"🧒 "+(i.kid===true?"kindertauglich":i.kid):""].filter(Boolean).map(esc).join(" · ")}</span>${i.note?`<span class="freq">${esc(i.note)}</span>`:""}<div class="atipbtns">${u?`<a class="ghost small btnlink" href="${esc(u)}" target="_blank" rel="noopener">🔗 Website</a>`:""}<button class="ghost small" data-atipcal="${ix}" aria-label="${esc(i.name)} in den Kalender">📅 Kalender</button><button class="ghost small" data-atiptake="${ix}">🚲 Merken</button></div></div>`:""}</li>`}
// Mit Wetter-Filter oder Rubrik (z. B. vom Wetter-Symbol am Start, Florian 16.11.2026) zeigen auch die festen Orte nur Passendes, sofern es welche gibt
function atipFixCards(){let all=atipItems().filter(i=>i.dauer).sort((a,b)=>((a.where||"stadt")==="stadt"?0:1)-((b.where||"stadt")==="stadt"?0:1));if(!all.length)return "";
  const wx=S.atipWX||"",c=S.atipC||"";if(wx||c){const m=all.filter(i=>(wx&&(Array.isArray(i.wx)?i.wx:[i.wx]).includes(wx))||(c&&atipCat(i)===c));if(m.length)all=m}
  const sea=season(),SN={spring:"🌷 Frühling",summer:"☀️ Sommer",autumn:"🍂 Herbst",winter:"❄️ Winter"};
  return [["immer","✅ Geht immer",all.filter(i=>atipSeas(i).includes("immer"))],[sea,SN[sea]+": passt jetzt",all.filter(i=>atipSeas(i).includes(sea))]].map(([k,t,g])=>g.length?foldCard("fix_"+k,t,g.length,`<ul class="evlist atipl">${g.map(atipLi).join("")}</ul>`,false,"atipfix"):"").join("")}
// In Google Maps speichern (Florian 19.11.2026: „ein Haken in die Liste aufnehmen wäre mega“, „auch in verschiedene“): die App kann nicht selbst in Maps-Listen schreiben; der Knopf öffnet den Ort in Maps, dort „Speichern“ zeigt alle Listen zum Anhaken; der Haken hier merkt nur, dass es erledigt ist (food/trip/<id>/maps)
function mapsQ(q){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q)}
function mapsRow(d){const q=(d.place||d.name||"").trim();if(!q)return "";const x=d.id&&trips().find(y=>y.id===d.id),on=!!(x&&x.maps);
  return `<div class="mapsrow"><button class="ghost" data-mapsopen="${esc(q)}">🗺️ In Google Maps speichern</button>${d.id?`<button class="chipbtn neutral" data-tripmaps="${esc(d.id)}" aria-pressed="${on}">${on?"✓ Ist in Maps-Liste":"○ Ist in Maps-Liste"}</button>`:""}<span class="freq">In Maps auf „Speichern“ tippen und eine oder mehrere Listen anhaken.</span></div>`}
function renderTripIdeas(){const d=S.tripDraft;
  if(d){const one=(f,L)=>`<div class="unl">${L.map(c=>`<button class="chipbtn" data-tset="${f}" data-v="${c[0]}" aria-pressed="${d[f]===c[0]}">${c.length>=3?c[1]+" "+c[2]:c[1]}</button>`).join("")}</div>`;
    const many=(f,L)=>`<div class="unl">${L.map(c=>`<button class="chipbtn" data-ttog="${f}" data-v="${c[0]}" aria-pressed="${csv(d[f]).includes(c[0])}">${c[1]}</button>`).join("")}</div>`;
    const lists=packLists(),moreN=["wx","dur","drive","kid","cost","season","pack"].filter(k=>d[k]).length,more=tFoldOn("f_tripmore",false);
    // Reihenfolge nach dem gemeinsamen Bauplan (Florian 19.11.2026): Was · Wann · Für wen · Wo · Art · Zeigen bei · Link/Notiz · 🔔 · Mehr Angaben · untere Zeile
    return `<section class="card tripform"><h2>${d.id?"Ausflug bearbeiten":"Neue Ausflugsidee"}</h2>
    <label class="fld"><span>Was</span><input type="text" id="tr-name" data-tf="name" value="${esc(d.name)}" maxlength="80" placeholder="Zum Beispiel Wasserfall im Wald" autocomplete="off"></label>${emoFld("data-tf",d.emo,"🏞️")}
    <label class="fld"><span>Wann (optional, steht dann im Kalender)</span><input type="date" id="tr-date" data-tf="date" value="${esc(d.date||"")}"></label>
    <div class="fld"><span>Für wen</span>${one("who",whoOpts().filter(o=>o[0]!=="both").map(o=>[o[0],o[1]]))}</div>
    <div class="fld"><span>Wo</span><input type="text" id="tr-place" data-tf="place" value="${esc(d.place||"")}" maxlength="160" placeholder="Zum Beispiel Bahnhof Starnberg" autocomplete="off">${placeChips(d.place||"")}</div>${mapsRow(d)}
    <div class="fld"><span>Art</span>${one("kind",tripKinds())}<div class="unl">${catBtn("trip")}</div></div>
    ${gmMaskRow("trip",d.id)}
    <label class="fld"><span>Link</span><input type="url" id="tr-link" data-tf="link" value="${esc(d.link)}" placeholder="https://…" autocomplete="off"></label>
    <label class="fld"><span>Notiz</span><textarea id="tr-note" data-tf="note" rows="3" placeholder="Parkplatz, Eintritt, was man nicht vergessen darf">${esc(d.note)}</textarea></label>
    ${d.id?`<div class="fld"><span>🔔 Erinnern</span><div class="unl">${bell("ausflug",{id:d.id})}</div></div>`:""}
    <button type="button" class="ghost small moreb" data-tfold="f_tripmore" aria-expanded="${more}">Mehr Angaben ${more?"▴":"▾"}${moreN?" · "+moreN+" ausgefüllt":""}</button>
    ${more?`<div class="fld"><span>Wetter</span>${one("wx",TRIP_WX)}</div>
    <div class="fld"><span>Wie lange?</span>${one("dur",TRIP_DUR)}</div>
    <label class="fld"><span>Fahrzeit in Minuten</span><input type="number" min="0" max="999" id="tr-drive" data-tf="drive" value="${esc(d.drive)}" placeholder="30" class="w110"></label>
    <div class="fld"><span>Mit Kleinkind</span>${many("kid",TRIP_KID)}</div>
    <div class="fld"><span>Kosten</span>${one("cost",TRIP_COST)}</div>
    <div class="fld"><span>Beste Jahreszeit (nichts gewählt heißt ganzjährig)</span>${many("season",TRIP_SEA)}</div>
    <div class="fld"><span>Welche Packliste?</span><div class="unl">${lists.map(l=>`<button class="chipbtn" data-tset="pack" data-v="${esc(l.id)}" aria-pressed="${d.pack===l.id}">🎒 ${esc(l.name)}</button>`).join("")}</div></div>`:""}
    ${d.id?geldSrcRow("trip:"+d.id,{name:d.name||"",cat:"frei",date:d.date||ymd(new Date())}):""}
    <div class="btnrow"><button class="primary" data-act="tripsave">Speichern</button><button class="ghost" data-act="tripcancel">Abbrechen</button></div>${d.id?maskFoot(verkHtml("trip",d.id,trips().find(x=>x.id===d.id)),`data-move="trip|${esc(d.id)}"`,`data-act="tripdel"`):""}</section>`}
  const mz=musLinks("auto",3);
  const all=trips(),F=S.tripFilter||"",match=x=>!F||(F==="regen"?x.wx==="egal":x.kind===F);
  const open=all.filter(x=>!x.done&&match(x)).sort((a,b)=>(a.at||0)-(b.at||0)),done=all.filter(x=>x.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const card=x=>{const l=safeLink(x.link),tg=tripTags(x),pl=x.pack&&packLists().find(p=>p.id===x.pack);return `<li class="${x.done?"done":""}"><button class="item" data-tripdone="${esc(x.id)}" aria-pressed="${!!x.done}" aria-label="${esc(x.name)}: ${x.done?"doch noch nicht gemacht":"waren wir"}"><span class="box">${x.done?"✓":""}</span><span class="nm">${x.emo?esc(x.emo)+" ":""}${esc(x.name)}${!x.done&&tg.length?`<br><span class="freq">${tg.map(x=>`<span class="nowrap">${esc(x)}</span>`).join(" · ")}</span>`:""}${x.note&&!x.done?`<br><span class="freq">${telNote(x.note)}</span>`:""}${x.done&&x.doneAt?`<br><span class="freq">Gemacht am ${new Date(x.doneAt).toLocaleDateString("de-DE")}</span>`:""}</span></button>${telA(x.note)}${pl&&!x.done?`<button class="catbtn" data-gopack="${esc(pl.id)}" aria-label="Packliste ${esc(pl.name)} öffnen">🎒</button>`:""}${x.adv&&!x.done?`<button class="catbtn" data-advgo="${esc(x.adv)}" aria-label="Zum Adventskalender">🎄</button>`:""}${(sp=>sp&&safeLink(sp.link)?`<a class="catbtn" href="${esc(safeLink(sp.link))}" target="_blank" rel="noopener" aria-label="Ausgaben in Splitwise">💶</a>`:"")(splitFor("trip:"+x.id)[0])}${!x.done?`<button class="catbtn routebtn" data-tripcal="${esc(x.id)}" aria-label="${esc(x.name)} in den Kalender">📅</button>`+transitA(x.place||x.name):""}${l?`<a class="catbtn" href="${esc(l)}" target="_blank" rel="noopener" aria-label="Link öffnen">🗺️</a>`:""}<button class="rm" data-tripedit="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">✎</button></li>`};
  const kinds=tripKinds().filter(k=>all.some(x=>!x.done&&x.kind===k[0]));
  // Gemerkt steht oben (Florian 16.11.2026), kurz mit „Alle zeigen“; darunter die Tipps
  const gm=S.tripAll?open:open.slice(0,3);
  let h=`<div class="btnrow"><button class="primary" data-act="tripnew">+ Neue Ausflugsidee</button></div>`+mz;
  if(open.length)h+=foldCard("gm","🔖 Gemerkt",open.length,`<ul class="shop">${gm.map(card).join("")}</ul>${open.length>3?`<button class="ghost small" data-act="tripall">${S.tripAll?"Weniger zeigen":"Alle "+open.length+" zeigen"}</button>`:""}<div class="freq">📅 trägt ein Ziel in den Kalender, 🚆 zeigt den Weg. Tippt auf ein Ziel, wenn ihr dort wart.</div>`,true);
  h+=atipFixCards()+atipCard();
  if(kinds.length||all.some(x=>!x.done&&x.wx==="egal"))h+=`<div class="unl scrollrow"><button class="chipbtn" data-tfilter="" aria-pressed="${!F}">Alle</button>${all.some(x=>!x.done&&x.wx==="egal")?`<button class="chipbtn" data-tfilter="regen" aria-pressed="${F==="regen"}">🌧️ Bei Regen</button>`:""}${kinds.map(k=>`<button class="chipbtn" data-tfilter="${k[0]}" aria-pressed="${F===k[0]}">${k[1]} ${k[2]}</button>`).join("")}</div>`;
  h+=open.length?""
    :`<div class="empty"><h2>${F?"Nichts Passendes":"Noch keine Ideen"}</h2><div>${F?"Für diesen Filter gibt es noch kein Ziel.":"Legt mit dem Knopf oben eure erste Ausflugsidee an. Ihr seht beide dieselbe Liste."}</div></div>`;
  if(done.length)h+=`<section data-fk="f_tdone|0" class="card"><div class="section-head"><h2>Schon gemacht</h2><span class="freq num">${done.length}</span></div><ul class="shop">${done.map(card).join("")}</ul></section>`;
  return h}
// Tag wählen (Florian 16.11.2026: jedes Ausflugsziel in den Kalender, gemerkt oder nicht). Vorschlag: Datum des Tipps, sonst nächstes Wochenende
function nextSat(){const d=startOfDay(new Date());const n=(6-d.getDay()+7)%7;return ymd(addDays(d,n))}
function calDayPick(title,sugg,cb){if(document.getElementById("mbox"))return;S.mboxAt=Date.now();const t0=startOfDay(new Date()),WD=["So","Mo","Di","Mi","Do","Fr","Sa"],sat=nextSat(),sun=ymd(addDays(ymdD(sat),1));
  const D=[];const add=(k,l)=>{if(k&&k>=ymd(t0)&&!D.some(x=>x[0]===k))D.push([k,l])};add(sugg,"Vorschlag");add(ymd(t0),"Heute");add(ymd(addDays(t0,1)),"Morgen");add(sat,"Samstag");add(sun,"Sonntag");add(ymd(addDays(ymdD(sat),7)),"Samstag danach");
  const el=document.createElement("div");el.id="mbox";el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Tag wählen"><div class="section-head"><h2>📅 ${esc(title)}</h2></div><div class="quicklist">${D.map(x=>{const d=ymdD(x[0]);return `<button class="quickbtn" data-dpk="${x[0]}"><span class="qi">${WD[d.getDay()]}</span><span>${d.getDate()}.${d.getMonth()+1}. <small>(${x[1]})</small></span></button>`}).join("")}<label class="fld"><span>Anderer Tag</span><input type="date" data-dpkin="1" min="${ymd(t0)}"></label></div></div>`;
  document.body.appendChild(el);const done=k=>{mboxClose();cb(k)};
  el.addEventListener("click",e=>{const b=e.target.closest("[data-dpk]");if(b){done(b.dataset.dpk);return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()});
  el.addEventListener("change",e=>{if(e.target.dataset.dpkin&&/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))done(e.target.value)})}
function packLists(){const m=(S.food&&S.food.packlist)||{};const l=Object.keys(m).filter(k=>m[k]&&m[k].name).map(k=>({id:k,name:m[k].name,emo:m[k].emo||"",at:m[k].at||0})).sort((a,b)=>a.at-b.at);return [{id:"main",name:"Tagesausflug",at:0}].concat(l)}
const curPack=()=>{const l=packLists();return l.find(x=>x.id===S.packList)||l[0]};
function renderPack(){const L=curPack(),items=packs().filter(i=>(i.list||"main")===L.id),have=new Set(items.map(i=>i.name.toLowerCase())),sug=PACK_IDEAS.filter(n=>!have.has(n.toLowerCase())),packed=items.filter(i=>i.done).length;
  const li=i=>`<li class="${i.done?"done":""}"><button class="item" data-pack="${esc(i.id)}" aria-pressed="${!!i.done}"><span class="box">${i.done?"✓":""}</span><span class="nm">${esc(i.name)}</span></button><button class="catbtn" data-packshop="${esc(i.id)}" aria-label="${esc(i.name)} auf die Einkaufsliste">🧺</button><button class="catbtn" data-packwear="${esc(i.id)}" aria-pressed="${buys().some(y=>y.ref==="pack:"+i.id&&!y.done)}" aria-label="${esc(i.name)} fehlt: auf Einkauf › Kleidung">👕</button><button class="rm" data-packedit="${esc(i.id)}" aria-label="${esc(i.name)} ändern">✎</button><button class="rm" data-packrm="${esc(i.id)}" aria-label="${esc(i.name)} entfernen">✕</button></li>`;
  let h="";
  {const ur=L.id.startsWith("u_")&&urlaube().find(u=>"u_"+u.id===L.id);h+=`<div class="unl">${[["basis","🎒 Basis"],["strand","🏖️ Strand"],["winter","❄️ Winter"],["kind","🧒 Kleinkind"]].map(t=>`<button class="chipbtn neutral" data-packtpl="${t[0]}" data-pl="${esc(L.id)}">+ ${t[1]}</button>`).join("")}${ur?`<button class="chipbtn neutral" data-reise="${esc(ur.id)}">${esc(ur.emo||"⛵")} Zum Urlaub ›</button>`:""}</div>`}
  h+=`<form class="addrow" id="packform" novalidate><input type="text" id="packinput" placeholder="Was kommt in den Rucksack?" value="${esc(S.packText)}" autocomplete="off" enterkeyhint="done" aria-label="Gegenstand"><button class="primary" type="submit">Hinzufügen</button></form>`;
  h+=suggBlock("pack",have,"data-packadd");
  h+=items.length?`<section class="card"><div class="section-head"><h2>${esc(L.name)}</h2><span class="freq num">${packed} von ${items.length} eingepackt</span></div><ul class="shop">${items.map(li).join("")}</ul>${packed?`<div><button class="ghost" data-act="packreset">Alles wieder auspacken</button></div>`:""}<div class="freq">Die Liste bleibt für den nächsten Ausflug. Beim Packen abhaken, danach wieder auspacken. 🧺 setzt etwas auf die Einkaufsliste, 👕 auf Einkauf › Kleidung.</div></section>`
    :`<div class="empty"><h2>Die Liste „${esc(L.name)}“ ist leer</h2><div>Tippt Vorschläge an oder schreibt eigene Dinge dazu. Die Liste bleibt für jeden Ausflug.</div></div>`;
  if(L.id!=="main")h+=`<div class="btnrow"><button class="ghost" data-act="packlistren">✎ Name und Symbol</button><button class="ghost danger" data-act="packlistdel">Liste „${esc(L.name)}“ löschen</button></div>`;
  return h}
