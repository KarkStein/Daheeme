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
    <button class="stbadge st-${st}" data-fundst="${esc(f.id)}" data-ar="${ar}" aria-label="Stand von ${esc(f.name)}: ${S0[2]}, antippen schaltet weiter">${S0[1]} ${S0[2]}</button><button class="catbtn" data-fundedit="${esc(f.id)}" aria-label="${esc(f.name)} bearbeiten" style="background:none;border:none">✎</button><button class="rm" data-fundrm="${esc(f.id)}" aria-label="${esc(f.name)} entfernen">✕</button></li>`}
function fundForm(id,proj,ar){ar=ar||"reise";const A=FAREA[ar];S.fundNewKind=S.fundNewKind||{};const k=S.fundNewKind[ar]||"";return `<div class="unl" style="margin-top:6px">${A.kinds.map(c=>`<button class="chipbtn neutral" data-fundnk="${c[0]}" data-ar="${ar}" aria-pressed="${k===c[0]}">${c[1]} ${c[2]}</button>`).join("")}${catBtn(ar==="haus"?"hfund":"fund")}</div>
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
function renderReisen(){const l=urlaube();if(S.reiseOpen&&l.find(x=>x.id===S.reiseOpen))return renderReise(l.find(x=>x.id===S.reiseOpen));S.reiseOpen=null;
  const hearts=x=>Object.values(x.hearts||{}).filter(Boolean).length;
  const tile=x=>{const st=reiseSt(x),cd=reiseDays(x),hc=x.hearts||{},nf=funde().filter(f=>f.reise===x.id).length;return `<button class="tile reisetile st-${st}" data-reise="${esc(x.id)}"><span class="te">${esc(x.emo||"⛵")}</span><span class="tn">${esc(x.name)}</span>${x.place?`<span class="tc">📍 ${esc(x.place)}</span>`:""}${x.from?`<span class="tc">${esc(reiseWhen(x))}</span>`:""}${st==="aktuell"&&cd&&cd.n?`<span class="tc">⏳ noch ${cd.n} ${cd.n===1?"Tag":"Tage"}</span>`:cd&&cd.now&&st!=="erledigt"?`<span class="tc">▶️ läuft gerade</span>`:""}${nf?`<span class="tc">🔖 ${nf} gemerkt</span>`:""}${st==="traum"?`<span class="tc">${hc.p0?"❤️":"🤍"}${hc.p1?"❤️":"🤍"}</span>`:""}</button>`};
  const grp=(k,sort)=>l.filter(x=>reiseSt(x)===k).sort(sort);
  const A=grp("aktuell",(a,b)=>String(a.from||"9").localeCompare(String(b.from||"9"))),T=grp("traum",(a,b)=>hearts(b)-hearts(a)||(a.at||0)-(b.at||0)),E=grp("erledigt",(a,b)=>String(b.from||"").localeCompare(String(a.from||"")));
  const add=(st,t,c)=>`<button class="tile add" data-act="reisenew" data-st="${st}"><span class="te">＋</span><span class="tn">${t}</span><span class="tc">${c}</span></button>`;
  let h=`<div class="section-head"><h2>📅 Geplant</h2><span class="freq num">${A.length}</span></div><div class="tiles">${A.map(tile).join("")}${add("aktuell","Neuer Urlaub","geplant oder gebucht")}</div>
    ${E.length?`<details class="reisedone"><summary class="section-head"><h2>✅ Erledigt</h2><span class="freq num">${E.length} ▾</span></summary><div class="tiles">${E.map(tile).join("")}</div></details>`:""}
    ${(()=>{const F=freiNext(10);return F.length?`<details class="reisedone"><summary class="section-head"><h2>🏖️ Ferien und Feiertage</h2><span class="freq num">Bayern ▾</span></summary><ul class="evlist frei">${F.map(x=>`<li><span class="ev">${freiLine(x)}</span></li>`).join("")}</ul>${ferienList().length?"":`<div class="freq">Die Schulferien kommen gleich nach; Feiertage sind schon da.</div>`}</details>`:""})()}
    <details class="reisedone"><summary class="section-head"><h2>💡 Ideen</h2><span class="freq num">${T.length} ▾</span></summary><div class="tiles">${T.map(tile).join("")}${add("traum","Neue Idee","❤️ von beiden zählt")}</div></details>`;
  const mu=(S.food&&S.food.reisemap)||"",emb=mapsEmbed(mu);
  h+=`<details class="card reisemap"${S.reiseMapOpen?" open":""}><summary>🗺️ Alle Ziele auf einer Karte</summary>${emb?`<div class="mapwrap"><iframe src="${esc(emb)}" loading="lazy" title="Karte mit allen Zielen"></iframe></div>`:mu?`<a href="${esc(mu)}" target="_blank" rel="noopener">Karte öffnen</a>`:""}
    <div class="freq">Legt in Google Maps unter „Meine Karten“ eine Karte an und fügt den Link hier ein, dann erscheint sie hier.</div><form class="addrow" id="reisemapform" novalidate><input type="url" id="reisemapinput" value="${esc(mu)}" placeholder="Link zur Karte" autocomplete="off"><button class="primary" type="submit">OK</button></form></details>`;
  return h}
// Urlaub-Seite kompakt (Florian 17.11.2026, „Alle drei nacheinander“, Bild /mnt/project-files/design/kompakt-urlaub.png): Kopf mit Datum, Countdown, Ort und ✎,
// darunter „🔖 Gemerkt“ nach dem Bauplan (rgCard(uid), Buchungen = Gemerktes auf ✅ mit versternter Nummer), dann Klapp-Karten (Packliste, Erinnerungen, Ausgaben, Musik, Rückblick).
function renderReise(x){const st=reiseSt(x),cd=reiseDays(x),hc=x.hearts||{},pins=reiseSub(x,"pins"),bk=reiseSub(x,"book"),pl="u_"+x.id,items=packs().filter(i=>i.list===pl),pr=prios().filter(p=>p.ref===x.id),SL=REISE_ST.find(s=>s[0]===st)||REISE_ST[0];
  const fld=(k,lab,type,ph)=>`<label class="fld"><span>${lab}</span><input ${type?`type="${type}"`:""} data-rsf="${k}" value="${esc(x[k]||"")}" placeholder="${ph||""}" autocomplete="off"></label>`;
  const ek="ueck_"+x.id,eDef=!x.from&&!x.place,eOn=tFoldOn(ek,eDef),when=reiseWhen(x),cdT=cd&&cd.n?`⏳ noch ${cd.n} ${cd.n===1?"Tag":"Tage"}`:cd&&cd.now?"▶️ Läuft gerade":cd&&cd.past?"Schon vorbei":"";
  let h=`<div class="btnrow"><button class="ghost" data-act="reiseback">‹ Übersicht</button></div><div><div class="eyebrow">${esc(x.emo||"⛵")} Urlaub · ${SL[1]} ${SL[2]}</div><h1>${esc(x.name)}</h1>${careHead("urlaub",x.id)}</div>`;
  h+=`<section class="card ureise"><div class="section-head" style="align-items:flex-start"><div style="min-width:0"><b>📅 ${when?esc(when):"Noch kein Datum"}</b><div class="freq">${[cdT,x.place?`<a href="${esc(mapsQ(x.place))}" target="_blank" rel="noopener">📍 ${esc(x.place)}</a>${transitA(x.place)}`:""].filter(Boolean).join(" · ")}</div></div><button class="iconbtn" data-tfold="${esc(ek)}" data-tdef="${eDef?1:0}" aria-expanded="${eOn}" aria-label="Eckdaten ${eOn?"zuklappen":"ändern"}">${eOn?"✕":"✎"}</button></div>
    ${st==="aktuell"&&cd&&cd.past?`<div class="btnrow"><button class="primary" data-reisest="erledigt">✅ Vorbei: auf Erledigt</button></div>`:""}
    <div class="unl" style="margin-top:var(--sp2)">${["p0","p1"].map(p=>`<button class="chipbtn neutral" data-reiseheart="${p}" aria-pressed="${!!hc[p]}">${hc[p]?"❤️":"🤍"} ${esc(pname(p))}</button>`).join("")}</div>
    ${eOn?`<div class="ueck"><h3>✏️ Eckdaten</h3>${fld("name","Name")}${fld("place","Ort oder Region","","z. B. Bretagne")}
    <div style="display:flex;gap:var(--sp2)"><div style="flex:1;min-width:0">${fld("from","Von","date")}</div><div style="flex:1;min-width:0">${fld("to","Bis","date")}</div></div>
    <div class="fld"><span>Symbol</span><div class="unl">${REISE_EMO.map(e=>`<button class="chipbtn neutral" data-reiseemo="${e}" aria-pressed="${(x.emo||"⛵")===e}">${e}</button>`).join("")}</div></div>
    ${fld("budget","💶 Budget grob (€)","number","z. B. 1500")}<label class="fld"><span>Notiz</span><textarea data-rsf="note" rows="2">${esc(x.note||"")}</textarea></label><div class="freq">Wird beim Verlassen eines Feldes gespeichert.</div></div>`:x.note?`<div class="freq" style="margin-top:var(--sp2)">${esc(x.note)}</div>`:""}</section>`;
  if(pins.length||bk.length)fundMigrate(x);
  // Erledigt und Löschen vor Gemerkt (Florian 17.11.2026: „Das da unten ist unlogisch“)
  h+=`<div class="btnrow reiseact">${st==="erledigt"?`<button class="ghost small" data-reisest="aktuell">↩ Zurückholen</button>`:`<button class="ghost small" data-reisest="erledigt">✅ Auf Erledigt</button>`}${st==="traum"?`<button class="ghost small" data-reisest="aktuell">📅 Jetzt planen</button>`:""}<button class="ghost small danger" data-act="reisedel">🗑 Urlaub löschen</button></div>`;
  h+=rgCard(x.id);
  const done=items.filter(i=>i.done).length;
  h+=foldCard("upack",`🧳 Packliste`,items.length?`${items.length}, ${items.length-done} offen`:"",`<div class="unl">${[["basis","🎒 Basis"],["strand","🏖️ Strand"],["winter","❄️ Winter"],["kind","🧒 Kleinkind"]].map(t=>`<button class="chipbtn neutral" data-packtpl="${t[0]}">+ ${t[1]}</button>`).join("")}</div>
    ${items.length?`<ul class="shop">${items.map(i=>`<li class="${i.done?"done":""}"><button class="tick" data-pack="${esc(i.id)}" aria-pressed="${!!i.done}" aria-label="${esc(i.name)} eingepackt"></button><span class="nm" style="flex:1">${esc(i.name)}</span><button class="catbtn" data-packshop="${esc(i.id)}" aria-label="${esc(i.name)} auf die Einkaufsliste" style="background:none;border:none">🧺</button><button class="rm" data-packedit="${esc(i.id)}" aria-label="${esc(i.name)} ändern">✎</button><button class="rm" data-packrm="${esc(i.id)}" aria-label="${esc(i.name)} entfernen">✕</button></li>`).join("")}</ul>`:`<div class="freq">Wählt oben Vorlagen. 🧺 setzt Fehlendes auf die Einkaufsliste.</div>`}
    <form class="addrow" id="rpackform" novalidate><input id="rpackinput" placeholder="Noch etwas einpacken" maxlength="60" autocomplete="off"><button class="primary" type="submit">+</button></form><div class="btnrow"><button class="ghost" data-gopack="${esc(pl)}">Alle Packlisten ›</button></div>`);
  h+=foldCard("uprio","🔔 Erinnerungen",pr.length||"",`${pr.length?`<ul class="evlist">${pr.map(p=>`<li><span class="t">${p.due?esc(dLabel(p.due)):""}</span><span class="ev">${esc(p.name)}</span></li>`).join("")}</ul>`:""}
    <div class="unl">${REISE_PRIO.map((n,i)=>`<button class="chipbtn neutral" data-reiseprio="${i}">＋ ${esc(n)}</button>`).join("")}</div><div class="freq">Mit Tag und Uhrzeit in der Maske, sie erscheinen unter Wichtig.</div>`);
  {const sc=splitChips("urlaub:"+x.id);h+=foldCard("ugeld","💶 Ausgaben","",`<div class="unl">${grpLinkHtml("urlaub:"+x.id,x.name,x.emo||"⛵",x.budget||"")}</div>${sc}${splitAddForm("urlaub:"+x.id)}`)}
  {const mz=musLinks("auto",3);if(mz)h+=foldCard("umus","🚗 Musik für die Fahrt","",mz)}
  h+=foldCard("urev","📝 Rückblick","",`<label class="fld"><span>${st==="erledigt"?"Wie war es? Was nehmen wir mit?":"Füllt ihr nach dem Urlaub aus."}</span><textarea data-rsf="review" rows="3">${esc(x.review||"")}</textarea></label>`,st==="erledigt"||!!x.review);
  return h}
function renderUrlaub(){return `<section class="card"><div class="section-head"><h2>⛵ Urlaub</h2></div><div class="freq">Urlaube haben jetzt einen eigenen Bereich: Reisen, im Bild das Meer.</div><div class="btnrow" style="margin-top:8px"><button class="primary" data-go="reisen">Zu Reisen ›</button></div></section>`}
// Bauplan (Florian 17.11.2026): zwei Reiter. Übersicht = Urlaube (Projekte) als Zeile, darunter „🔖 Gemerkt“ (Ausflugsziele und alles für Urlaube in einer Liste),
// dann die Vorschläge (Geht immer, Was ist los) und Ferien. Alte Sprünge tt:ideen und tt:urlaub landen in der Übersicht; tt:recherche zeigt die ausführliche Gemerkt-Seite.
function renderTrips(){const T=["urlaub","ideen","pack","recherche"].includes(S.tripTab)?S.tripTab:"urlaub";S.tripTab=T;
  if(T==="urlaub"&&S.reiseOpen&&urlaube().find(x=>x.id===S.reiseOpen))return renderReisen();
  const tab=T==="pack"?"pack":"urlaub";
  let h=`<div><div class="eyebrow">Gemeinsam unterwegs</div><h1>Ausflüge und Reisen</h1></div>
   <div class="tabrow"><div class="filters uwtabs" role="group" aria-label="Bereich">${[["urlaub","🧭 Übersicht"],["pack","🧳 Packlisten"]].map(t=>`<button class="chipbtn neutral" data-trip="${t[0]}" aria-pressed="${tab===t[0]}">${t[1]}</button>`).join("")}</div><button class="chipbtn neutral" data-prionew="ausflug" aria-label="Erinnerung anlegen">🔔</button></div>`;
  if(S.tripDraft)return h+renderTripIdeas();
  return h+(T==="pack"?renderPack():T==="recherche"?`<div class="btnrow"><button class="ghost" data-trip="urlaub">‹ Übersicht</button></div>`+renderRecherche():tripHome())}
// Urlaube als eine Zeile kleiner Kacheln (Geplant zuerst, dann Ideen), Erledigte zugeklappt unten
function reiseRow(){const l=urlaube(),hearts=x=>Object.values(x.hearts||{}).filter(Boolean).length;
  const A=l.filter(x=>reiseSt(x)==="aktuell").sort((a,b)=>String(a.from||"9").localeCompare(String(b.from||"9"))),T=l.filter(x=>reiseSt(x)==="traum").sort((a,b)=>hearts(b)-hearts(a)||(a.at||0)-(b.at||0));
  const sub=x=>{const st=reiseSt(x),cd=reiseDays(x),hc=x.hearts||{};return st==="traum"?`💡 Idee ${hc.p0?"❤️":"🤍"}${hc.p1?"❤️":"🤍"}`:(careMini("urlaub",x.id)?careMini("urlaub",x.id)+" · ":"")+(cd&&cd.now?"▶️ läuft gerade":x.from?"📅 "+reiseWhen(x)+(cd&&cd.n?" · in "+cd.n+" T.":""):"📅 Geplant, ohne Datum")};
  return `<div class="section-head" style="margin-top:var(--sp3)"><h2>🧩 Urlaube</h2><span class="freq num">${A.length+T.length}</span></div><div class="urow">${A.concat(T).map(x=>`<button class="ut st-${reiseSt(x)}" data-reise="${esc(x.id)}"><span class="te">${esc(x.emo||"⛵")}</span><span><b>${esc(x.name)}</b><span class="freq">${sub(x)}</span></span></button>`).join("")}<button class="ut add" data-act="reisenew" data-st="aktuell" aria-label="Neuer Urlaub oder Idee">＋ Urlaub</button></div>`}
// Urlaub löschen samt Packliste, Erinnerungen und Ausgaben-Zuordnung (Ausgaben selbst bleiben)
async function reiseDel(uid){await splitDropRef("urlaub:"+uid);await prioDropRef([uid]);for(const i of packs().filter(i=>i.list==="u_"+uid))await S.store.setPath("food/pack/"+i.id,null);await S.store.setPath("food/packlist/u_"+uid,null);await S.store.setPath("food/urlaub/"+uid,null);if(S.reiseOpen===uid)S.reiseOpen=null}
// Lange auf einen Urlaub in der Urlaube-Zeile: Öffnen, Erledigt/Zurückholen, Löschen mit Nachfrage (Florian 17.11.2026)
function reiseMenu(uid){const x=urlaube().find(y=>y.id===uid);if(!x||document.getElementById("mbox"))return;const st=reiseSt(x);S.mboxAt=Date.now();
  const el=document.createElement("div");el.id="mbox";
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Urlaub"><div class="section-head"><h2>${esc(x.emo||"⛵")} ${esc(x.name)}</h2></div><div class="chlist">
    <button type="button" class="chipbtn neutral" data-rm="open">📂 Öffnen</button>
    ${st==="erledigt"?`<button type="button" class="chipbtn neutral" data-rm="aktuell">↩ Zurückholen</button>`:`<button type="button" class="chipbtn neutral" data-rm="erledigt">✅ Auf Erledigt</button>`}
    ${st==="traum"?`<button type="button" class="chipbtn neutral" data-rm="planen">📅 Jetzt planen</button>`:""}
    <button type="button" class="chipbtn neutral danger" data-rm="del">🗑 Urlaub löschen</button></div>
    <div class="btnrow"><button class="ghost" type="button" data-rm="x">Schließen</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",async e=>{const b=e.target.closest("[data-rm]");
    if(!b){if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose();return}
    const a=b.dataset.rm;if(a==="x"){mboxClose();return}
    if(a==="open"){mboxClose();S.reiseOpen=uid;S.tab="ausflug";S.tripTab="urlaub";render();window.scrollTo(0,0);return}
    if(a==="del"&&b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}
    mboxClose();try{if(a==="del"){await reiseDel(uid);toast("Urlaub gelöscht")}else{const v=a==="planen"?"aktuell":a;await S.store.setPath("food/urlaub/"+uid+"/state",v);toast(v==="erledigt"?"Steht jetzt unter ✅ Erledigt":"Steht jetzt unter 📅 Geplant")}}catch(_){toast("Konnte nicht speichern.")}render()})}
(()=>{let t=null,x0=0,y0=0,fired=0;const clr=()=>{clearTimeout(t);t=null};
  app.addEventListener("pointerdown",e=>{const b=e.target.closest&&e.target.closest(".ut[data-reise]");if(!b)return;x0=e.clientX;y0=e.clientY;clr();t=setTimeout(()=>{t=null;fired=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}reiseMenu(b.dataset.reise)},500)});
  app.addEventListener("pointermove",e=>{if(t&&Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0)>12)clr()});
  ["pointerup","pointercancel"].forEach(n=>app.addEventListener(n,clr));
  app.addEventListener("click",e=>{if(fired&&Date.now()-fired<900&&e.target.closest&&e.target.closest(".ut[data-reise]")){fired=0;e.stopPropagation();e.preventDefault()}},true);
  app.addEventListener("contextmenu",e=>{if(e.target.closest&&e.target.closest(".ut[data-reise]"))e.preventDefault()})})();
// Gemerkt für unterwegs: Ausflugsziele (food/trip, „Für hier“) und Gemerktes für Urlaube (food/fund) in einer Liste mit Filtern nach Art, Urlaub und Stand
const tripSt=x=>x.done?"erledigt":x.date?"geplant":x.fav?"favorit":"idee";
function rgItems(){const U=urlaube(),L=[];
  // Ausflugsziele der Art Spielplatz (auch die aus Sport und Spiel umgezogenen) laufen unter der Art 🛝 Spielplatz
  trips().forEach(x=>{const k=tripKinds().find(c=>c[0]===x.kind),sp=x.kind==="spiel";L.push({t:"t",id:x.id,ic:emoOf(x,k?k[1]:"🚲"),name:x.name,art:sp?"spielplatz":"ausflug",artL:sp?"Spielplatz":"Ausflugsziel"+(k&&k[0]!=="sonst"?" · "+k[2]:""),u:"hier",st:tripSt(x),date:x.date,place:x.place||x.name,rain:x.wx==="egal",pack:x.pack&&packLists().find(p=>p.id===x.pack),also:gmAlso(x),at:x.at||0})});
  funde("reise").forEach(f=>{const k=fundKind(f.kind,"reise"),u=f.reise&&U.find(y=>y.id===f.reise);L.push({t:"f",id:f.id,ic:k[1],name:f.name,art:k[0],artL:k[2]+(f.st==="gebucht"?" · gebucht":""),u:u?u.id:"hier",uL:u?(u.emo||"⛵")+" "+u.name:"",st:f.st==="gebucht"?"erledigt":f.st||"idee",place:f.addr||f.place||(u?f.name+" "+(u.place||""):""),ref:f.ref||"",also:gmAlso(f),at:f.at||0})});
  return L.sort((a,b)=>(b.at||0)-(a.at||0))}
const refMask=r=>"****"+String(r||"").slice(-2);
// Gemerkt nach dem Bauplan; mit uid nur für diesen Urlaub (eigene Filter S.rgUF über data-rguf, Erledigtes = gebucht bleibt sichtbar, unten)
function rgCard(uid){const inU=!!uid,F=inU?(S.rgUF&&S.rgUF.uid===uid?S.rgUF:(S.rgUF={uid,k:"",s:""})):(S.rgF||(S.rgF={k:"",u:"",s:""})),all=rgItems().filter(x=>!inU||x.u===uid),open=all.filter(x=>x.st!=="erledigt");
  const R=all.filter(x=>(!F.k||x.art===F.k)&&(inU||!F.u||x.u===F.u)&&(!F.w||x.rain)&&(F.s==="erledigt"?x.st==="erledigt":F.s?x.st===F.s:inU||x.st!=="erledigt"));if(inU)R.sort((a,b)=>(a.st==="erledigt")-(b.st==="erledigt"));
  const GG=inU||F.k||F.u||F.w?"":gmRows("reise",i=>F.s?i.st===F.s:i.st!=="erledigt");
  const n=F.more?R.length:Math.min(R.length,8),chip=(k,v,lab)=>`<button class="chipbtn neutral" ${inU?"data-rguf":"data-rgf"}="${k}|${v}" aria-pressed="${F[k]===v}">${lab}</button>`;
  const arts=(inU?[]:[["ausflug","🚲","Ausflugsziel"]]).concat(FAREA.reise.kinds).filter(a=>(inU?all:open).some(x=>x.art===a[0])||F.k===a[0]);
  const us=urlaube().filter(u=>open.some(x=>x.u===u.id)||F.u===u.id);
  const badge=x=>{const s=SAMM_ST.find(y=>y[0]===x.st)||SAMM_ST[0],lb=x.st==="geplant"&&x.date?"📅 "+dLabel(x.date):s[1]+" "+s[2];return `<button class="stbadge st-${x.st}" ${x.t==="t"?`data-tripst="${esc(x.id)}"`:`data-fundst="${esc(x.id)}" data-ar="reise"`} aria-label="Stand von ${esc(x.name)}: ${s[2]}, antippen schaltet weiter">${esc(lb)}</button>`};
  return `<section data-fk="${inU?"f_rgu":"f_rg"}|1" class="card rgcard"><div class="section-head" style="align-items:center"><h2>🔖 Gemerkt <span class="freq">(${inU?all.length:open.length})</span></h2><button class="primary" data-act="merken"${inU?` data-u="${esc(uid)}"`:""}>＋ Merken</button></div>
    ${inU?(all.length?`<div class="unl scrollrow">${chip("k","","Alle")}${arts.map(a=>chip("k",a[0],a[1]+" "+a[2])).join("")}${all.some(x=>x.st==="erledigt")||F.s==="erledigt"?chip("s","erledigt","✅ Gebucht"):""}</div>`:""):all.length?`<div class="unl scrollrow">${chip("k","","Alle")}${arts.map(a=>chip("k",a[0],a[1]+" "+a[2])).join("")}</div>
    <div class="unl scrollrow">${chip("u","","Alle")}${chip("u","hier","🏙️ Für hier")}${us.map(u=>chip("u",u.id,(u.emo||"⛵")+" "+u.name)).join("")}${open.some(x=>x.rain)||F.w?chip("w","regen","☔ Bei Regen"):""}${chip("s","favorit","⭐ Nur Favoriten")}${chip("s","erledigt","✅ Erledigt")}</div>`:""}
    ${R.length?`<ul class="mklist">${R.slice(0,n).map(x=>`<li class="mk"><button class="mkb" ${x.t==="t"?`data-tripedit="${esc(x.id)}"`:`data-fundedit="${esc(x.id)}"`} aria-label="${esc(x.name)} ansehen und ändern"><span class="mki">${esc(x.ic)}</span><span class="mkt"><b>${esc(x.name)}</b><span class="freq">${esc(x.artL)}${inU?"":x.uL?" · "+esc(x.uL):x.u==="hier"?" · für hier":""}${x.ref?" · Buchung "+esc(refMask(x.ref)):""}${esc(x.also||"")}</span></span></button>${x.pack&&x.st!=="erledigt"?`<button class="catbtn routebtn" data-gopack="${esc(x.pack.id)}" aria-label="Packliste ${esc(x.pack.name)} öffnen">🎒</button>`:""}${x.st!=="erledigt"&&x.place?transitA(x.place):""}${badge(x)}</li>`).join("")}</ul>${R.length>n?`<button class="ghost small" ${inU?"data-rguf":"data-rgf"}="more|1">Alle ${R.length} zeigen</button>`:""}${GG?`<ul class="mklist gmlist">${GG}</ul>`:""}`
      :GG?`<ul class="mklist gmlist">${GG}</ul>`:`<div class="freq">${all.length?"Für diesen Filter ist nichts gemerkt.":inU?"Unterkunft, Anreise, Strände, Spielplätze, Restaurants: mit ＋ Merken anlegen. Alles steht auch in der 🗃️ Sammlung.":"Merkt euch hier Ausflugsziele, Unterkünfte, Spielplätze oder Restaurants, für hier oder für einen Urlaub."}</div>`}
    ${inU?`<div class="freq">Ein Tipp auf den Namen ändert den Eintrag, auch Buchungsnummer und Adresse. Das Schild schaltet den Stand weiter, gebucht ist ✅ Erledigt. <button class="linkish" data-act="bkopen">＋ Buchung mit Nummer eintragen</button> · <button class="linkish" data-fundopen="${esc(uid)}" data-ar="reise">✨ Vorschläge und alle Filter</button></div>${S.bkOpen===uid?`<form id="bkform" class="bkform" novalidate><input id="bk-name" placeholder="Was (z. B. Ferienhaus, Fähre)" maxlength="80" autocomplete="off"><input id="bk-ref" placeholder="Buchungsnummer" maxlength="60" autocomplete="off"><input id="bk-link" type="url" placeholder="Link" autocomplete="off"><input id="bk-addr" placeholder="Adresse oder Anfahrt" maxlength="160" autocomplete="off"><button class="primary" type="submit">Hinzufügen</button></form>`:""}`
      :`<div class="freq">Ein Tipp auf den Namen ändert den Eintrag, das Schild rechts schaltet den Stand weiter: 💡 Idee, ⭐ Favorit, 📅 Geplant, ✅ Erledigt. <button class="linkish" data-act="tripnew">Ausflugsziel mit allen Angaben</button></div>`}</section>`}
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
function tripHome(){const mu=(S.food&&S.food.reisemap)||"",emb=mapsEmbed(mu),E=urlaube().filter(x=>reiseSt(x)==="erledigt").sort((a,b)=>String(b.from||"").localeCompare(String(a.from||"")));
  // Ausflug eintragen gut sichtbar, neuer Urlaub nur klein in der Urlaube-Zeile (Florian 19.11.2026: „viel zu klein im Verhältnis zum Urlaub … einen neuen anlegen ist zu präsent“)
  let h=reiseRow()+`<button class="primary ausnew" data-act="ausflugnew">🚲 ＋ Ausflug eintragen</button>`+rgCard()+atipFixCards()+atipCard();
  {const F=freiNext(10);if(F.length)h+=foldCard("frei","🏖️ Ferien und Feiertage",F.length,`<ul class="evlist frei">${F.map(x=>`<li><span class="ev">${freiLine(x)}</span></li>`).join("")}</ul>${ferienList().length?"":`<div class="freq">Die Schulferien kommen gleich nach; Feiertage sind schon da.</div>`}`)}
  if(E.length)h+=foldCard("uerl","✅ Erledigte Urlaube",E.length,`<div class="urow">${E.map(x=>`<button class="ut st-erledigt" data-reise="${esc(x.id)}"><span class="te">${esc(x.emo||"⛵")}</span><span><b>${esc(x.name)}</b><span class="freq">${x.from?esc(reiseWhen(x)):"✅ Erledigt"}</span></span></button>`).join("")}</div>`);
  h+=foldCard("rmap","🗺️ Alle Ziele auf einer Karte","",`${(m=>m&&mapOk(m)?`<div class="btnrow"><a class="ghost linkbtn" href="${esc(m)}" target="_blank" rel="noopener noreferrer">🛝 Eure Spielplatz-Karte öffnen</a></div>`:"")((S.food&&S.food.playmap)||"")}${emb?`<div class="mapwrap"><iframe src="${esc(emb)}" loading="lazy" title="Karte mit allen Zielen"></iframe></div>`:mu?`<a href="${esc(mu)}" target="_blank" rel="noopener">Karte öffnen</a>`:""}<div class="freq">Legt in Google Maps unter „Meine Karten“ eine Karte an und fügt den Link hier ein, dann erscheint sie hier.</div><form class="addrow" id="reisemapform" novalidate><input type="url" id="reisemapinput" value="${esc(mu)}" placeholder="Link zur Karte" autocomplete="off"><button class="primary" type="submit">OK</button></form>`);
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
  const fon=tFoldOn("atip",true),nL=L.filter(i=>!i.dauer).length;
  let h=`<section class="card atip tfold"><button class="setsum" data-tfold="atip" data-tdef="1" aria-expanded="${fon}"><h2>🗓️ Was ist los${nL?` <span class="freq">(${nL})</span>`:""}</h2><i>${fon?"▾":"›"}</i></button>`;
  if(!fon)return h+`</section>`;
  h+=`${S.atipps&&S.atipps.updated?`<div class="freq">Stand ${esc(rDate(S.atipps.updated)||S.atipps.updated)}${S.atipps.region?" · "+esc(S.atipps.region):""}</div>`:""}
  ${(()=>{const F=freiNext(3,31);return F.length?`<div class="freq atipfrei">Frei bald: ${F.map(freiLine).join(" · ")}</div>`:""})()}
  <div class="atipf"><div class="unl scrollrow">${ATIP_WO.map(a=>chip("atipwo",a[0],!wo||wo===a[0],a[1]+" "+(a[0]==="stadt"?"Stadt":"Umland"))).join("")}<i class="atipsep"></i>${ATIP_IO.map(a=>chip("atipio",a[0],!io||io===a[0],a[1]+" "+a[2]+(a[0]==="drinnen"&&rain&&io==="draussen"?" (heute Regen)":""))).join("")}</div>
  <div class="unl scrollrow">${rx?`<button class="chipbtn neutral" data-atiplk="1" aria-pressed="${lk}" title="Einstellungen › Wir">💛 Gerade beliebt: ${esc(kidLikes().join(", "))}</button>`:""}${chip("atipz","woche",z==="woche","Diese Woche")}${chip("atipz","monat",z==="monat","Diesen Monat")}<button class="chipbtn neutral" data-atipfree="1" aria-pressed="${fr}">🆓 Kostenlos</button>${ATIP_FEAT.map(f=>`<button class="chipbtn neutral" data-atipfeat="${f[0]}" aria-pressed="${!!FS[f[0]]}">${f[1]} ${f[2]}</button>`).join("")}${ATIP_WX.filter(a=>wd[a[0]]).map(a=>chip("atipwx",wx===a[0]?"":a[0],wx===a[0],a[1]+" "+a[3]+" · "+wd[a[0]].slice(0,3).join(", "))).join("")}</div>
  <div class="unl scrollrow">${chip("atipc","",!c,"Alle")}${ATIP_CAT.map(a=>chip("atipc",a[0],c===a[0],a[1]+" "+a[2])).join("")}</div></div>`;
  if(!S.atipps||!S.atipps.items||!S.atipps.items.length)return h+`<div class="freq">Hier erscheint, was in München und im Umland los ist (höchstens 1:30 mit Zug oder Auto), kindertauglich: Flohmärkte, Feste, Spielplätze, Kinderprogramm, Museen, Natur, Tiere, dazu Ideen passend zum Wetter. Wochentipps sonntags, Monatsüberblick vor Monatsbeginn.</div></section>`;
  const LD=L.filter(i=>!i.dauer);
  if(!LD.length)h+=`<div class="freq" style="margin-top:var(--sp2)">Für diese Auswahl gerade keine Termine. Probiert „Diesen Monat“${io?" oder auch „"+(io==="draussen"?"☔ Drinnen":"☀️ Draußen")+"“":""}.</div>`;
  ATIP_WO.filter(w=>!wo||wo===w[0]).forEach(w=>{const G=LD.filter(i=>(i.where||"stadt")===w[0]);if(!G.length)return;
    if(!wo)h+=`<h3 class="atipwh">${w[1]} ${w[0]==="stadt"?"In der Stadt":"Im Umland"} <span class="freq">(${G.length})</span></h3>`;
    const by={};G.forEach(i=>{const k=ATIP_CAT.some(x=>x[0]===atipCat(i))?atipCat(i):"sonst";(by[k]=by[k]||[]).push(i)});
    ATIP_CAT.concat([["sonst","📎","Sonstiges"]]).forEach(a=>{const g=by[a[0]];if(!g)return;const k="ac_"+w[0]+"_"+a[0],on=tFoldOn(k,true);
      h+=`<button class="atipgrp" data-tfold="${k}" data-tdef="1" aria-expanded="${on}"><span>${a[1]} ${a[2]} <span class="freq">(${g.length})</span></span><i>${on?"▾":"›"}</i></button>${on?`<ul class="evlist atipl">${g.map(atipLi).join("")}</ul>`:""}`})});
  return h+stoerRow()+`</section>`}
// Ausflüge kompakt (Florian 16.11.2026): Gemerkt, Geht immer und Jahreszeit als Klapp-Karten mit Anzahl, Stand je Gerät in hq-tfold; Tipps zeigen nur den Titel, Tipp öffnet den Rest
try{S.tFold=JSON.parse(localStorage.getItem("hq-tfold")||"{}")||{}}catch(_){S.tFold={}}
const tFoldOn=(k,def)=>S.tFold&&k in S.tFold?!!S.tFold[k]:!!def;
// Einklappen in der ganzen App (Florian 17.11.2026, „So bauen wie im Dokument“): Karten tragen die Marke data-fk="<schlüssel>|<vorgabe>".
// foldAll macht beim Zeichnen aus der ersten Überschrift den Klapp-Knopf (.foldh, schaltet wie data-tfold); zugeklappt bleibt nur der Kopf samt Knöpfen rechts.
function foldOne(k,def,html){const on=tFoldOn(k,def),a=html.indexOf("<h2"),b=html.indexOf("</h2>");if(a<0||b<a)return html;
  const pre=html.slice(0,a),h2=html.slice(a,b+5);let rest=html.slice(b+5);
  if(!on){let end=0;if(/<div class="section-head"[^>]*>\s*$/.test(pre)){let d=1,m;const rx=/<(\/?)div\b/g;while((m=rx.exec(rest))){d+=m[1]?-1:1;if(!d){end=m.index+6;break}}}rest=rest.slice(0,end)+"</section>"}
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
function renderTripIdeas(){const d=S.tripDraft;
  if(d){const one=(f,L)=>`<div class="unl">${L.map(c=>`<button class="chipbtn" data-tset="${f}" data-v="${c[0]}" aria-pressed="${d[f]===c[0]}">${c.length>=3?c[1]+" "+c[2]:c[1]}</button>`).join("")}</div>`;
    const many=(f,L)=>`<div class="unl">${L.map(c=>`<button class="chipbtn" data-ttog="${f}" data-v="${c[0]}" aria-pressed="${csv(d[f]).includes(c[0])}">${c[1]}</button>`).join("")}</div>`;
    const lists=packLists(),moreN=["wx","dur","drive","kid","cost","season","pack"].filter(k=>d[k]).length,more=tFoldOn("f_tripmore",false);
    // Reihenfolge nach dem gemeinsamen Bauplan (Florian 19.11.2026): Was · Wann · Für wen · Wo · Art · Zeigen bei · Link/Notiz · 🔔 · Mehr Angaben · untere Zeile
    return `<section class="card tripform"><h2>${d.id?"Ausflug bearbeiten":"Neue Ausflugsidee"}</h2>
    <label class="fld"><span>Was</span><input type="text" id="tr-name" data-tf="name" value="${esc(d.name)}" maxlength="80" placeholder="Zum Beispiel Wasserfall im Wald" autocomplete="off"></label>${emoFld("data-tf",d.emo,"🏞️")}
    <label class="fld"><span>Wann (optional, steht dann im Kalender)</span><input type="date" id="tr-date" data-tf="date" value="${esc(d.date||"")}"></label>
    <div class="fld"><span>Für wen</span>${one("who",whoOpts().filter(o=>o[0]!=="both").map(o=>[o[0],o[1]]))}</div>
    <div class="fld"><span>Wo</span><input type="text" id="tr-place" data-tf="place" value="${esc(d.place||"")}" maxlength="160" placeholder="Zum Beispiel Bahnhof Starnberg" autocomplete="off">${placeChips(d.place||"")}</div>
    <div class="fld"><span>Art</span>${one("kind",tripKinds())}<div class="unl">${catBtn("trip")}</div></div>
    ${gmMaskRow("trip",d.id)}
    <label class="fld"><span>Link</span><input type="url" id="tr-link" data-tf="link" value="${esc(d.link)}" placeholder="https://…" autocomplete="off"></label>
    <label class="fld"><span>Notiz</span><textarea id="tr-note" data-tf="note" rows="3" placeholder="Parkplatz, Eintritt, was man nicht vergessen darf">${esc(d.note)}</textarea></label>
    ${d.id?`<div class="fld"><span>🔔 Erinnern</span><div class="unl">${bell("ausflug",{id:d.id})}</div></div>`:""}
    <button type="button" class="ghost small moreb" data-tfold="f_tripmore" aria-expanded="${more}">Mehr Angaben ${more?"▴":"▾"}${moreN?" · "+moreN+" ausgefüllt":""}</button>
    ${more?`<div class="fld"><span>Wetter</span>${one("wx",TRIP_WX)}</div>
    <div class="fld"><span>Wie lange?</span>${one("dur",TRIP_DUR)}</div>
    <label class="fld"><span>Fahrzeit in Minuten</span><input type="number" min="0" max="999" id="tr-drive" data-tf="drive" value="${esc(d.drive)}" placeholder="30" style="width:110px"></label>
    <div class="fld"><span>Mit Kleinkind</span>${many("kid",TRIP_KID)}</div>
    <div class="fld"><span>Kosten</span>${one("cost",TRIP_COST)}</div>
    <div class="fld"><span>Beste Jahreszeit (nichts gewählt heißt ganzjährig)</span>${many("season",TRIP_SEA)}</div>
    <div class="fld"><span>Welche Packliste?</span><div class="unl">${lists.map(l=>`<button class="chipbtn" data-tset="pack" data-v="${esc(l.id)}" aria-pressed="${d.pack===l.id}">🎒 ${esc(l.name)}</button>`).join("")}</div></div>`:""}
    ${d.id?geldSrcRow("trip:"+d.id,{name:d.name||"",cat:"frei",date:d.date||ymd(new Date())}):""}
    <div class="btnrow"><button class="primary" data-act="tripsave">Speichern</button><button class="ghost" data-act="tripcancel">Abbrechen</button></div>${d.id?maskFoot(verkHtml("trip",d.id,trips().find(x=>x.id===d.id)),`data-move="trip|${esc(d.id)}"`,`data-act="tripdel"`):""}</section>`}
  const mz=musLinks("auto",3);
  const all=trips(),F=S.tripFilter||"",match=x=>!F||(F==="regen"?x.wx==="egal":x.kind===F);
  const open=all.filter(x=>!x.done&&match(x)).sort((a,b)=>(a.at||0)-(b.at||0)),done=all.filter(x=>x.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const card=x=>{const l=safeLink(x.link),tg=tripTags(x),pl=x.pack&&packLists().find(p=>p.id===x.pack);return `<li class="${x.done?"done":""}"><button class="item" data-tripdone="${esc(x.id)}" aria-pressed="${!!x.done}" aria-label="${esc(x.name)}: ${x.done?"doch noch nicht gemacht":"waren wir"}"><span class="box">${x.done?"✓":""}</span><span class="nm">${x.emo?esc(x.emo)+" ":""}${esc(x.name)}${!x.done&&tg.length?`<br><span class="freq">${tg.map(x=>`<span style="white-space:nowrap">${esc(x)}</span>`).join(" · ")}</span>`:""}${x.note&&!x.done?`<br><span class="freq">${telNote(x.note)}</span>`:""}${x.done&&x.doneAt?`<br><span class="freq">Gemacht am ${new Date(x.doneAt).toLocaleDateString("de-DE")}</span>`:""}</span></button>${telA(x.note)}${pl&&!x.done?`<button class="catbtn" data-gopack="${esc(pl.id)}" aria-label="Packliste ${esc(pl.name)} öffnen">🎒</button>`:""}${x.adv&&!x.done?`<button class="catbtn" data-advgo="${esc(x.adv)}" aria-label="Zum Adventskalender">🎄</button>`:""}${(sp=>sp&&safeLink(sp.link)?`<a class="catbtn" href="${esc(safeLink(sp.link))}" target="_blank" rel="noopener" aria-label="Ausgaben in Splitwise">💶</a>`:"")(splitFor("trip:"+x.id)[0])}${!x.done?`<button class="catbtn routebtn" data-tripcal="${esc(x.id)}" aria-label="${esc(x.name)} in den Kalender">📅</button>`+transitA(x.place||x.name):""}${l?`<a class="catbtn" href="${esc(l)}" target="_blank" rel="noopener" aria-label="Link öffnen">🗺️</a>`:""}<button class="rm" data-tripedit="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">✎</button></li>`};
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
  const li=i=>`<li class="${i.done?"done":""}"><button class="item" data-pack="${esc(i.id)}" aria-pressed="${!!i.done}"><span class="box">${i.done?"✓":""}</span><span class="nm">${esc(i.name)}</span></button><button class="catbtn" data-packshop="${esc(i.id)}" aria-label="${esc(i.name)} auf die Einkaufsliste" style="background:none;border:none">🧺</button><button class="catbtn" data-packwear="${esc(i.id)}" aria-pressed="${buys().some(y=>y.ref==="pack:"+i.id&&!y.done)}" aria-label="${esc(i.name)} fehlt: auf Einkauf › Kleidung" style="background:none;border:none;${buys().some(y=>y.ref==="pack:"+i.id&&!y.done)?"":"opacity:.45"}">👕</button><button class="rm" data-packedit="${esc(i.id)}" aria-label="${esc(i.name)} ändern">✎</button><button class="rm" data-packrm="${esc(i.id)}" aria-label="${esc(i.name)} entfernen">✕</button></li>`;
  let h=`<div class="unl">${packLists().map(l=>`<button class="chipbtn" data-packlist="${esc(l.id)}" aria-pressed="${l.id===L.id}">${esc(emoOf(l,"🎒"))} ${esc(l.name)}</button>`).join("")}<button class="chipbtn" data-act="packlistnew">+ Neue Liste</button></div>`;
  {const ur=L.id.startsWith("u_")&&urlaube().find(u=>"u_"+u.id===L.id);h+=`<div class="unl">${[["basis","🎒 Basis"],["strand","🏖️ Strand"],["winter","❄️ Winter"],["kind","🧒 Kleinkind"]].map(t=>`<button class="chipbtn neutral" data-packtpl="${t[0]}" data-pl="${esc(L.id)}">+ ${t[1]}</button>`).join("")}${ur?`<button class="chipbtn neutral" data-reise="${esc(ur.id)}">${esc(ur.emo||"⛵")} Zum Urlaub ›</button>`:""}</div>`}
  if(S.packListNew)h+=`<form class="addrow" id="packlistform" novalidate><input type="text" id="packlistinput" placeholder="Zum Beispiel Strand oder Übernachtung" maxlength="40" autocomplete="off" enterkeyhint="done" aria-label="Name der Liste"><button class="primary" type="submit">Anlegen</button></form>`;
  h+=`<form class="addrow" id="packform" novalidate><input type="text" id="packinput" placeholder="Was kommt in den Rucksack?" value="${esc(S.packText)}" autocomplete="off" enterkeyhint="done" aria-label="Gegenstand"><button class="primary" type="submit">Hinzufügen</button></form>`;
  h+=suggBlock("pack",have,"data-packadd");
  h+=items.length?`<section class="card"><div class="section-head"><h2>${esc(L.name)}</h2><span class="freq num">${packed} von ${items.length} eingepackt</span></div><ul class="shop">${items.map(li).join("")}</ul>${packed?`<div><button class="ghost" data-act="packreset">Alles wieder auspacken</button></div>`:""}<div class="freq">Die Liste bleibt für den nächsten Ausflug. Beim Packen abhaken, danach wieder auspacken. 🧺 setzt etwas auf die Einkaufsliste, 👕 auf Einkauf › Kleidung.</div></section>`
    :`<div class="empty"><h2>Die Liste „${esc(L.name)}“ ist leer</h2><div>Tippt Vorschläge an oder schreibt eigene Dinge dazu. Die Liste bleibt für jeden Ausflug.</div></div>`;
  if(L.id!=="main")h+=`<div class="btnrow"><button class="ghost" data-act="packlistren">✎ Name und Symbol</button><button class="ghost danger" data-act="packlistdel">Liste „${esc(L.name)}“ löschen</button></div>`;
  return h}
