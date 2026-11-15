// ---------- Schnellmenü im Startbild: lange auf ein Bildelement drücken (Florian 15.11.2026) ----------
// Eintrag: [Symbol, Text, {nav, fn?, click?, focus?, scroll?}]; ein einziger Eintrag startet sofort.
const QUICK={
  einkauf:["🧺 Einkauf",[["➕","Artikel hinzufügen",{nav:"einkauf",focus:"#shopinput"}],["📋","Offene Posten",{nav:"einkauf",scroll:".shop"}]]],
  essen:["🍲 Essen",[["🔗","Rezept aus Link speichern",{nav:"essen|ft:rezepte",click:'[data-act="recpaste"]'}]]],
  woche:["🧹 Woche",[["🙋","Meine offenen Aufgaben",{nav:"woche|wp:1",fn:()=>{S.wmwWho=S.me||"p0";S.wmwView="zeit"}}],["✅","Aufgabe abhaken",{nav:"woche"}],["🏠","Homeoffice eintragen",{nav:"woche",scroll:".hoslot"}]]],
  kalender:["📅 Kalender",[["➕","Neuer Termin",{nav:"woche|wp:3",click:"[data-act=ternew]"}],["🗓️","Heute und morgen",{nav:"woche|wp:3",fn:()=>{S.calView="liste"}}]]],
  kita:["🎒 Kita",[["📦","Mitbringen für morgen",{nav:"kita|ks:tasche"}],["🍽️","Kita-Essen heute",{nav:"kita|ks:essen",fn:()=>{S.foodWeek=null;S.kitaEdit=false},scroll:".kmday.today"}]]],
  amhaus:["🏠 Am Haus",[["➕","Neues Projekt",{nav:"amhaus|pf:wohnen",click:'[data-act="hprojnew"]'}],["🔧","Reparatur notieren",{nav:"amhaus|pf:haus",focus:"#projinput"}],["📍","Sammlung",{nav:"amhaus|pf:wohnen",click:'[data-act="hsamm"]'}]]]
};
function quickKey(el){if(!el||!el.classList.contains("spot"))return null;if(el.dataset.go==="post")return "post";if(el.dataset.nav==="woche|wp:3")return "kalender";if(el.dataset.pf)return null;const g=el.dataset.go;if(g==="amhaus"&&!/Lampe/.test(el.getAttribute("aria-label")||""))return null;return QUICK[g]?g:null}
function quickRun(a){mboxClose();goNav(a.nav);if(a.fn){a.fn();render()}
  setTimeout(()=>{if(a.click){const el=document.querySelector(a.click);if(el)el.click()}setTimeout(()=>{const f=a.focus&&document.querySelector(a.focus);if(f){f.focus();f.scrollIntoView({block:"center"})}const sc=a.scroll&&document.querySelector(a.scroll);if(sc)sc.scrollIntoView({block:"center"})},60)},30)}
function quickOpen(k){S.mboxAt=Date.now();if(k==="post"){mboxOpen();return}const q=QUICK[k];if(!q||document.getElementById("mbox"))return;if(q[1].length===1){quickRun(q[1][0][2]);return}
  const el=document.createElement("div");el.id="mbox";el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="${esc(q[0])}"><div class="section-head"><h2>${esc(q[0])}</h2></div><div class="quicklist">${q[1].map((x,i)=>`<button class="quickbtn" data-quick="${i}"><span class="qi" aria-hidden="true">${x[0]}</span><span>${esc(x[1])}</span></button>`).join("")}</div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const b=e.target.closest("[data-quick]");if(b){quickRun(q[1][+b.dataset.quick][2]);return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
function pantryCard(){const pl=pantry();return `<section class="card"><button class="rechead" data-act="pantrytoggle" aria-expanded="${!!S.pantryOpen}"><span class="nm">🧂 Immer im Haus</span><span class="freq">${pl.length} Sachen ${S.pantryOpen?"▴":"▾"}</span></button>${S.pantryOpen?`<div class="freq" style="margin:8px 0">Kommt ein Rezept auf die Liste, bleiben diese Zutaten weg. Im Rezept stehen sie weiter.</div><div class="unl">${pl.map(x=>`<button class="chipbtn" data-pantryrm="${esc(x)}" aria-label="${esc(x)} aus dem Vorrat nehmen">${esc(x)} ✕</button>`).join("")}</div><form class="addrow" id="pantryform" style="margin-top:8px" novalidate><input type="text" id="pantryinput" placeholder="z. B. Senf" autocomplete="off" aria-label="Zum Vorrat hinzufügen"><button class="primary" type="submit">+</button></form>`:""}</section>`}
function wxPlaceRow(){const pl=S.food&&S.food.wxplace;return `<div class="freq" style="margin-top:8px">📍 Wetter für: ${pl&&pl.name?`<b>${esc(pl.name)}</b> <button class="linkish" data-act="wxedit">ändern</button>`:`<button class="linkish" data-act="wxedit">Ort eintragen</button>`}</div>${S.tab==="settings"?`<label class="fld" style="margin-top:8px"><span>Wetter-App beim Tipp aufs Wetter (leer = Kachelmannwetter)</span><input type="url" data-wxlink="1" value="${esc((S.food&&S.food.pref&&S.food.pref.wxlink)||"")}" placeholder="https://…" autocomplete="off"></label>`:""}${S.wxEdit?`<form class="addrow" id="wxform" style="margin-top:6px" novalidate><input type="text" id="wxinput" placeholder="z. B. München" autocomplete="off" aria-label="Ort fürs Wetter"><button class="primary" type="submit">Suchen</button></form>`:""}`}
// ---------- Bereiche: alle Kategorien mit Unterbereichen (Symbol oben rechts neben dem Zahnrad) ----------
// Zentrale Bereichsliste (15.11.2026): Bereiche-Übersicht, Kreismenü und Wischen werden daraus gebaut.
// [Symbol, Name, Tab, Kurzname im Kreis (leer = nicht im Kreis), Sprung im Kreis, Unterbereiche()]
// Gliederung (Florian 15.11.2026): Alltag, Essen, Zuhause, Freizeit, Wir, Quer. Die 4 Reiter unten bleiben Abkürzungen.
const AREA_GROUPS=[["essen","🍲","Essen"],["alltag","🗓️","Alltag"],["wir","🫶","Wir"],["zuhause","🏡","Zuhause"],["freizeit","🌊","Freizeit"],["quer","🧩","Quer durch alles"]];
// [Symbol, Name, Tab, Kurzname im Kreis (leer = nicht im Kreis), Sprung im Kreis, Unterbereiche(), Gruppe]
const AREAS=[["🏠","Start","camp","","",()=>[["Tag und Woche","sp:tag"],["Wichtig","sp:wichtig"]],""],["🧹","Woche","woche","Woche","woche|",()=>[["Diese Woche","wp:0"],["Kalender","wp:3"],["Wer macht was","wp:1"]],"alltag"],
  ["🎒","Kita","kita","Kita","kita|",()=>KITA_SECS.map(k=>[k[2]==="Essen"?"Kita-Essen":k[2],"ks:"+k[0]]),"alltag"],
  ["🍲","Essen","essen","Essen","essen|",()=>[["Heute","ft:heute"],["Wochenplan","ft:plan"],["Rezepte","ft:rezepte"]],"essen"],
  ["🧺","Einkauf","einkauf","Einkauf","einkauf|",()=>[["Ausgaben","sp:ausgaben"],["Weitere Listen","bl:"]].concat(BUY_FIX.map(x=>[x[2],"bl:"+x[0]])),"essen"],
  ["🏠","Am Haus","amhaus","Am Haus","amhaus|",()=>PROJ_CATS.filter(c=>["wohnen","ordnung","haus","garten"].includes(c[0])).map(c=>[c[2],"pf:"+c[0]]),"zuhause"],
  ["🧭","Reisen und Ausflüge","ausflug","Reisen","ausflug|tt:urlaub",()=>[["Urlaube","tt:urlaub"],["Ausflüge","tt:ideen"],["Packlisten","tt:pack"],["Sammlung","tt:recherche"]],"freizeit"],
  ["⚽","Sport und Spiel","spiel","Sport","spiel|",()=>PLAY_SECS.map(p=>[p[2],"ps:"+p[0]]),"freizeit"],["🎵","Musik","musik","Musik","musik|",()=>[],"freizeit"],
  ["🫶","Partner","privat","Partner","privat|",()=>[["Mittagessen","pv:lunch"],["Briefe","pv:briefe"],["Kontakte","pv:kontakte"]],"wir"],
  ["🧒","Kind","kind","Kind","kind|",()=>[["Bringen und Abholen","sp:kind"]],"wir"],
  ["💡","Ideen","projekte","Ideen","projekte|",()=>PROJ_CATS.filter(c=>PROJ_GROUPS.projekte&&PROJ_GROUPS.projekte.cats?PROJ_GROUPS.projekte.cats.includes(c[0]):["geschenk","sonst"].includes(c[0])).map(c=>[c[2],"pf:"+c[0]]).concat([["Adventskalender","pf:advent"],["Alle Projekte","pf:alle"]]),"wir"],
  ["🔔","Wichtig","wichtig","Wichtig","wichtig|",()=>[],"quer"],["🤖","Recherchen","recherchen","","",()=>[],"quer"],["⚙️","Einstellungen","settings","","",()=>[],"quer"]];
// Reihenfolge folgt den Gruppen (Florian 15.11.2026: Essen, dann Woche und Kita, dann Wir)
AREAS.sort((x,y)=>(x[6]?AREA_GROUPS.findIndex(g=>g[0]===x[6]):-1)-(y[6]?AREA_GROUPS.findIndex(g=>g[0]===y[6]):-1));
// Zusätze, die keine eigenen Bereiche sind: Kalender (im Kreis direkt nach Woche), Wichtig, Einstellungen
const AREA_TREE=()=>AREAS.map(a=>[a[0],a[1],a[2],a[5](),a[6]]);
function renderAreas(){let h=`<div><div class="eyebrow">Alles auf einen Blick</div><h1>Bereiche</h1></div>`;
  const card=a=>`<section class="card areacard"><button class="dishlink areahead" data-nav="${a[2]}|"><span class="te">${a[0]}</span> ${esc(a[1])} <i>›</i></button>${a[3].length?`<div class="unl" style="margin-top:8px">${a[3].map(x=>`<button class="chipbtn neutral" data-nav="${a[2]}|${x[1]}">${esc(x[0])}</button>`).join("")}</div>`:""}</section>`;
  const T=AREA_TREE();h+=T.filter(a=>!a[4]).map(card).join("");
  AREA_GROUPS.forEach(g=>{const L=T.filter(a=>a[4]===g[0]);if(L.length)h+=`<div class="section-head areagrp"><h2>${g[1]} ${esc(g[2])}</h2></div>`+L.map(card).join("")});
  return h}
// Zeit mitdenken (Florian 15.11.2026): Sprünge aus einer Ansicht mit Woche (Woche, Kalender, Wochenplan, Kita-Essen, Kind) zeigen am Ziel dieselbe Woche
function focusWeek(){const cm=mondayOf(new Date()),wp=S.weekPage|0;
  if(S.tab==="woche"&&wp===0)return mondayOf(S.view||cm);
  if(S.tab==="woche"&&wp===3){if(S.calDay)return mondayOf(ymdD(S.calDay));if(S.calMonth){const t=new Date(),c=S.calMonth;return c.getMonth()===t.getMonth()&&c.getFullYear()===t.getFullYear()?cm:mondayOf(new Date(c.getFullYear(),c.getMonth(),1,12))}return cm}
  if((S.tab==="essen"&&S.foodTab==="plan")||(S.tab==="kita"&&S.kitaSec==="essen"))return planWeek();
  if(S.tab==="kind")return addDays(cm,7*(S.kidWk|0));
  return null}
function focusApply(m){if(!m)return;const cm=mondayOf(new Date()),cur=+m===+cm,n=Math.round((m-cm)/(7*864e5)),wp=S.weekPage|0;
  if(S.tab==="woche"&&wp===0){S.view=n>4?addDays(cm,28):m;S.wkEdit=null}
  if(S.tab==="woche"&&wp===3){if(cur){S.calDay=null;S.calMonth=null}else{S.calDay=ymd(m);S.calMonth=new Date(m.getFullYear(),m.getMonth(),1,12)}}
  if((S.tab==="essen"&&S.foodTab==="plan")||(S.tab==="kita"&&S.kitaSec==="essen"))S.foodWeek=cur?null:m;
  if(S.tab==="kind")S.kidWk=Math.max(-1,Math.min(2,n))}
function goNav(v){const fw=focusWeek(),[tab,sub]=v.split("|"),[k,val]=(sub||"").split(":");S.prev=S.tab;S.tab=tab;S.weekPage=0;if(tab==="essen")S.foodTab="heute";if(tab==="projekte"||tab==="amhaus")S.projFilter="";
  if(k==="wp")S.weekPage=+val||0;if(k==="ft")S.foodTab=val;if(tab==="kita")S.kitaSec=k==="ks"?val:"termine";if(tab==="musik")S.musFilter="";if(tab==="ausflug"||tab==="reisen"){S.reiseOpen=null;S.tripTab=tab==="reisen"?"urlaub":"ideen"}if(k==="tt")S.tripTab=val;if(k==="pf")S.projFilter=val;if(k==="sp")S.tab=val;if(k==="bl"){S.tab="listen";if(val)(S.buyOpen||(S.buyOpen={}))[val]=true;setTimeout(()=>{const el=document.getElementById("buy-"+val);if(el)el.scrollIntoView({block:"start"})},40)}if(k==="ps")S.playSec=val;if(tab==="privat")S.privSec=k==="pv"&&val!=="kontakte"?val:"";focusApply(fw);render();window.scrollTo(0,0);if(k==="pv"&&val==="kontakte")setTimeout(()=>{const el=document.getElementById("kontakte");if(el)el.scrollIntoView({block:"start"})},30)}
// ---------- Einstellungen (Zahnrad oben rechts, Entwurf) ----------
const ALL_AREAS=[["🧹","Woche",{go:"woche"}],["👥","Wer macht was",{go:"woche",wp:1}],["🍲","Essen heute",{go:"essen",ft:"heute"}],["📅","Wochenplan",{go:"essen",ft:"plan"}],["📖","Rezepte und Kochbücher",{go:"essen",ft:"rezepte"}],["🎒","Kita-Essen",{go:"essen",ft:"kita"}],["🧺","Einkauf",{go:"einkauf"}],["🎒","Kita",{go:"kita"}],["🚲","Ausflüge",{go:"ausflug",tt:"ideen"}],["🧳","Packliste",{go:"ausflug",tt:"pack"}],["⛵","Urlaub",{go:"ausflug",tt:"urlaub"}],["💡","Ideen",{go:"projekte"}],["🏠","Am Haus",{go:"amhaus"}],["⚽","Sport und Spiel",{go:"spiel"}],["💞","Privat",{go:"privat"}],["📮","Briefkasten",{go:"post"}],["🔔","Wichtig",{go:"wichtig"}]];
// Rückseite des Startbilds (Medaille/Postkarte, Florian 15.11.2026): kurzer Tipp auf eine freie Stelle dreht das Bild um. Entwurf.
// Oben Tag, Datum, Wetter jetzt und Verlauf bis zum Abend; Mitte der Tag als Zeitstrahl (Kita, Termine, Abendessen); drei Zähler; Blick auf 3 Tage. Rechts oben Platz für ein Foto als Briefmarke.
