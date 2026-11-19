// ---------- Bereich Kind neu (Florian 17.11.2026, „A mit Größen und Gesundheit“, Bild /mnt/project-files/design/kind-seite-neu.png) ----------
// Seite 1 (Tab kind): oben „Heute“ im Marine-Look (panelHead, panelTile), darunter Klapp-Karten (foldCard): Gerade beliebt, Besorgen, Unternehmen, Größen, Gesundheit.
// Seite 2 (Kita): Bringen und Abholen als Wochen-Tafel ganz oben (kidBoard). Seite 3 (Spielen) bleibt.
// Daten nur in der Datenbank: food/kid/size {cl,sh,hat,at}, food/kid/med/<id> {name,kind,date?,time?,note?,done?,moved?,at,by} (offene mit Tag sind seit 19.11.2026 Termine m_<id> mit tag arzt, mk), food/kid/doc {name,tel}, food/kid/birth "JJJJ-MM-TT"; Adresse des Kinderarztes als gespeicherter Ort food/place/kdoc.
const kidData=()=>(S.food&&S.food.kid)||{};
const kidMedsAll=()=>listOf(kidData().med);
const kidMeds=()=>kidMedsAll().filter(x=>!x.moved);
// Arzt-Termine des Kindes leben im Kalender (Florian 19.11.2026, wie Kita): Termin mit Art Arzt, who kid, mk = Art aus KID_MED
const kidArzt=()=>termine().filter(t=>t.tag==="arzt"&&t.date&&whoL(t.who).includes("kid"));
// Einmalig: Gesundheit-Einträge mit Tag, noch offen, ziehen als Termin um; feste Id m_<id>, das Original bleibt mit moved liegen
async function migKidMed(){const M=kidData().med;if(S.migMed||!M)return;S.migMed=1;const raw=Object.assign({},M);
  for(const id of Object.keys(raw)){const x=raw[id];if(!x||x.moved||x.done||!/^\d{4}-\d\d-\d\d$/.test(x.date||""))continue;const tid="m_"+id,dp=kidDocPlace();
    try{if(!(S.food.termin&&S.food.termin[tid]))await S.store.setPath("food/termin/"+tid,{name:x.name||"Arzt",date:x.date,time:x.time||null,tag:"arzt",who:"kid",mk:x.kind||"vorsorge",note:x.note||null,place:dp&&dp.name||null,at:x.at||Date.now(),by:x.by||""});await S.store.setPath("food/kid/med/"+id+"/moved","ter:"+tid)}catch(_){S.migMed=0;return}}S.migMed=0}
const KID_MED=[["vorsorge","🩺","Vorsorge"],["impf","💉","Impfung"],["sonst","📎","Sonstiges"]];
const kidMedIc=x=>(KID_MED.find(k=>k[0]===x.kind)||KID_MED[0])[1];
const kidDoc=()=>kidData().doc||{};
const kidDocPlace=()=>((S.food&&S.food.place)||{}).kdoc||null;
const kidSize=()=>kidData().size||{};
const KID_MON=["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sep.","Okt.","Nov.","Dez."];
// Alter in Monaten aus food/kid/birth; ohne Geburtstag null
function kidAgeM(at){const b=kidData().birth;if(!b||!/^\d{4}-\d\d-\d\d$/.test(b))return null;const d=at||new Date(),y=+b.slice(0,4),m=+b.slice(5,7)-1,t=+b.slice(8,10);let n=(d.getFullYear()-y)*12+d.getMonth()-m;if(d.getDate()<t)n--;return n<0?null:n}
const kidAgeTxt=()=>{const n=kidAgeM();if(n==null)return "";const y=Math.floor(n/12),m=n%12;return y?(y+(y===1?" Jahr":" Jahre")+(m?", "+m+(m===1?" Monat":" Monate"):"")):m+(m===1?" Monat":" Monate")};
// Vorsorge-Untersuchungen (Monate von/bis): Vorschlag für die nächste, die noch nicht eingetragen ist
const KID_U=[["U6",10,12],["U7",21,24],["U7a",34,36],["U8",46,48],["U9",60,64]];
function kidNextU(){const n=kidAgeM();if(n==null)return null;const b=kidData().birth,have=kidMeds().concat(kidArzt()).map(x=>String(x.name||"").toLowerCase());
  const u=KID_U.find(x=>x[2]>=n&&!have.some(h=>new RegExp("(^|[^a-z0-9])"+x[0].toLowerCase()+"($|[^a-z0-9])").test(h)));if(!u)return null;
  const at=k=>{const d=new Date(+b.slice(0,4),+b.slice(5,7)-1+k,1,12);return KID_MON[d.getMonth()]+" "+d.getFullYear()};return {name:u[0],from:at(u[1]),to:at(u[2])}}
// Wetter-Hinweis zur Kleidung (aus wxToday, höchstens einer)
function kidWear(w){if(!w)return "";const p=w.pre?"Morgen: ":"",h=w.hint||"";
  if(/Schnee/.test(h))return "🧤 "+p+h+": Schneeanzug, Handschuhe und Mütze";
  if(/Regen|Gewitter/.test(h))return "🧥 "+p+h+": Matschhose und Gummistiefel mitgeben";
  if(h==="Frost"||w.lo<=3)return "🧣 "+p+"Kalt ("+w.rng+"): Mütze, Handschuhe und warme Jacke";
  if(h==="heiß"||w.hi>=25)return "🧢 "+p+"Warm ("+w.rng+"): Sonnenhut und Sonnencreme";
  if(/windig|Sturm/.test(h))return "🧥 "+p+"Windig: Mütze und winddichte Jacke";return ""}
const kidGen=nm=>nm==="Kind"?"Der Tag":nm+(/[sßxz]$/i.test(nm)?"’":"s")+" Tag";
// Besorgen: offene Einträge fürs Kind je Liste (wie bisher)
function kidBuyCnt(l){return buys().filter(x=>!x.done&&x.for==="kid"&&x.list===l).length+(l==="geschenke"?buyLinked("geschenke").filter(x=>x.kid).length:0)}
// Block „Heute“
function kidToday(){const now=new Date(),today=ymd(now),di=(now.getDay()+6)%7,cm=mondayOf(now),nm=kidName(),w=wxToday();
  const DN=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"],T=[];
  if(di<5){const x=bhDay(cm,di);
    if(x.off)T.push({t:"",ic:x.off==="zu"?"🚪":x.off==="frei"?"🎉":"⛵",n:x.off==="zu"?"Kita zu":x.off==="frei"?feiertag(x.k):"Urlaub",nav:"kita|"});
    else{const km=kitaMeals(cm)["d"+di]||{};T.push({t:"08:00",ic:"🚸",n:pname(x.br.p)+" bringt",nav:"kita|",who:x.br.p});
      T.push({t:"12:00",ic:"🍽️",n:km.text||"Kein Kita-Essen eingetragen",nav:"kita|ks:essen",dim:!km.text});
      T.push({t:"16:00",ic:"🚸",n:pname(x.ab.p)+" holt",nav:"kita|",who:x.ab.p})}}
  else T.push({t:"",ic:"🏡",n:"Wochenende, keine Kita",nav:"ausflug|tt:ideen"});
  calEvents(today,today).filter(e=>e.src!=="prio"&&e.src!=="frei"&&whoL(e.who).includes("kid")).forEach(e=>T.push({t:e.t||"",ic:e.icon||"📅",n:e.name+(e.te?" (bis "+e.te+")":""),nav:e.nav||"woche|wp:3"}));
  const rows=T.filter(x=>!x.t).concat(T.filter(x=>x.t).sort((a,b)=>a.t<b.t?-1:1));
  const row=x=>`<li><button class="btl${x.dim?" dim":""}" data-nav="${esc(x.nav)}"><span class="bt">${esc(x.t)}</span><span class="bdot"></span><span class="bn">${x.ic} ${esc(x.n)}</span>${x.who?pDot(x.who):""}</button></li>`;
  const kb=kitaBring(),nx=kitaTer().filter(x=>x.date>=today).sort((a,b)=>a.date<b.date?-1:1)[0],bn=kidBuyCnt("kleidung")+kidBuyCnt("geschenke"),wear=kidWear(w);
  const nxd=nx?(d=>nx.date===today?"Heute":(d-startOfDay(now))/864e5<7?WD2[d.getDay()]:d.getDate()+"."+(d.getMonth()+1)+".")(ymdD(nx.date)):"–";
  const sub=[kidAgeTxt(),w?(w.pre?w.pre+": ":"")+w.emo+" "+w.rng+(w.hint?" "+w.hint:""):""].filter(Boolean).map(esc).join(" · ");
  return `<div class="campback dash kiddash" aria-label="${esc(kidGen(nm))} auf einen Blick">${panelHead("Heute · "+DN[di],esc(kidGen(nm)),sub,"")}
    <ul class="bline">${rows.map(row).join("")}</ul>${wear?`<div class="kidwear">${esc(wear)}</div>`:""}
    <div class="bcnts">${panelTile(kb.length,"📦 Mitbringen",'data-nav="kita|ks:tasche"'+(kb.length?` aria-label="Mitbringen: ${esc(kb.map(x=>x.name).join(", "))}"`:""))}${panelTile(nxd,"📅 "+esc(nx?nx.name:"Kita-Termin"),'data-nav="kita|ks:termine"')}${panelTile(bn,"🛍️ Besorgen",'data-nav="kind|kf:kid_buy"')}</div></div>`}
function renderKind(){const nm=kidName(),today=ymd(new Date());
  const row=(ic,t,sub,attr)=>`<div class="trow"><span class="tic">${ic}</span><button class="ttx" ${attr}><span>${t}${sub?`<i>${sub}</i>`:""}</span><em>›</em></button></div>`;
  let h=`<div><div class="eyebrow">Familie</div><h1>${esc(nm)}</h1></div>`;
  if(nm==="Kind")h+=`<div class="freq">Den Namen tragt ihr unter <button class="linkbtn" data-go="settings">Einstellungen › Wir</button> ein. Er bleibt nur bei euch.</div>`;
  h+=kidToday();
  // 💛 Gerade beliebt
  const L=kidLikes(),ML=musics().filter(m=>m.like&&musKid(m)),rx=likeRx(),AT=((S.atipps&&S.atipps.items)||[]).filter(i=>atipLike(i,rx)).length;
  h+=foldCard("kid_like","💛 Gerade beliebt","",`<div class="unl kidlikes">${L.map(x=>`<button class="chipbtn" data-kidlikes="1" aria-label="${esc(x)}: Gerade beliebt ändern">${esc(x)}</button>`).join("")}<button class="chipbtn neutral" data-kidlikes="1" aria-label="Gerade beliebt ändern">${L.length?"✎":"＋ Eintragen"}</button></div><div class="tagcard">`
    +ML.slice(0,4).map(m=>row((MUS_ART.find(a=>a[0]===m.art)||MUS_ART[0])[1],esc(m.name),"💛 "+esc(lab(MUS_ART,m.art||"playlist")),`data-nav="musik|mf:like"`)).join("")
    +row("🚲",AT?AT+(AT===1?" Ausflug passt":" Ausflüge passen")+" dazu":"Ausflüge, die dazu passen","Was ist los · 💛",'data-kidatip="1"')
    +(ML.length?"":row("🎵","Kinderlieder und Hörspiele","mit 💛 markieren, dann stehen sie hier",'data-nav="musik|ma:lied"'))+`</div>`,true,"kidcard");
  // 🔖 Gemerkt fürs Kind: alles mit „Für wen: Kind“ oder „Zeigen bei Kind“, egal wo es abgelegt ist
  const GK=gmKid().filter(i=>i.st!=="erledigt");
  h+=foldCard("kid_gm","🔖 Gemerkt fürs Kind",GK.length||"",GK.length?`<ul class="mklist gmlist">${GK.slice(0,12).map(i=>gmRow(i,"kind")).join("")}</ul>${GK.length>12?`<button class="linkish" data-go="projekte">Alle ${GK.length} in der Sammlung ›</button>`:""}`:`<div class="freq">Noch nichts. Bei jedem gemerkten Eintrag könnt ihr „Für wen: ${esc(nm)}“ oder „Zeigen bei 🧒 Kind“ wählen, dann steht er hier.</div>`,GK.length>0,"kidcard");
  // 🛍️ Besorgen
  const ck=kidBuyCnt("kleidung"),cg=kidBuyCnt("geschenke"),bs=[ck?ck+" Kleidung":"",cg?cg+(cg===1?" Geschenk":" Geschenke"):""].filter(Boolean).join(", ");
  h+=foldCard("kid_buy","🛍️ Besorgen",bs,`<div class="tagcard">`+row("👕","Kleidung",ck?ck+" offen":"",'data-nav="listen|bl:kleidung"')+row("🎁","Geschenke und Spielsachen",cg?cg+" offen":"",'data-nav="listen|bl:geschenke"')+row("🎄","Adventskalender","",'data-nav="geschenke|pf:advent"')+row("🎧","Hörspiele und Tonies","",'data-nav="musik|ma:hoer"')+`</div>`,false,"kidcard");
  // 🚲 Unternehmen
  h+=foldCard("kid_do","🚲 Unternehmen","",`<div class="tagcard">`+row("🚲","Ausflüge mit Kleinkind","",'data-nav="ausflug|tt:ideen"')+row("🛝","Spielplätze","",'data-nav="ausflug|rk:spielplatz"')+row("⚽","Spielen","Spielideen, Sport und Kurse",'data-go="spiel"')+row("🎵","Kinderlieder und Hörspiele","",'data-nav="musik|ma:lied"')+`</div>`,false,"kidcard");
  // 📏 Größen
  const z=kidSize(),zd=z.at?new Date(z.at):null,zt=(l,v)=>`<button class="kidsz" data-kidsize="1"><small>${l}</small><b>${v?esc(v):"–"}</b></button>`;
  h+=foldCard("kid_size","📏 Größen",[z.cl,z.sh].filter(Boolean).join(" · "),`<div class="kidszs">${zt("Kleidung",z.cl)}${zt("Schuhe",z.sh)}${zt("Mütze",z.hat)}${zt("Stand",zd?KID_MON[zd.getMonth()]+" "+zd.getFullYear():"")}</div><div class="btnrow"><button class="ghost" data-kidsize="1">✎ Größen ändern</button><button class="ghost" data-nav="listen|bl:kleidung">👕 Kleidung besorgen ›</button></div>`,false,"kidcard");
  // 🩺 Gesundheit
  const M=kidMeds(),open=M.filter(x=>!x.done).sort((a,b)=>(a.date||"9")<(b.date||"9")?-1:1),done=M.filter(x=>x.done).sort((a,b)=>(a.date||"")<(b.date||"")?1:-1),nu=kidNextU(),doc=kidDoc(),dp=kidDocPlace();
  const isMed=e=>e.tag==="arzt"&&whoL(e.who).includes("kid")&&(e.src==="own"||e.src==="ext"),mup=calEvents(today,ymd(addDays(new Date(),400))).filter(isMed),mpast=calEvents(ymd(addDays(new Date(),-400)),ymd(addDays(new Date(),-1))).filter(isMed).reverse(),nxm=mup[0];
  const mli=x=>`<li class="mk${x.done?" done":""}"><span class="tic">${kidMedIc(x)}</span><button class="mkn" data-kidmed="${esc(x.id)}"><span>${esc(x.name)}</span><i>${[x.date?dLabel(x.date)+(x.time?" · "+x.time:""):"ohne Termin",x.note?telPlain(x.note):""].filter(Boolean).map(esc).join(" · ")}</i></button>${x.done?`<span class="stbadge st-erledigt">✅</span>`:bell("kind",x)}</li>`;
  h+=foldCard("kid_med","🩺 Gesundheit",nxm?nxm.name+" am "+dLabel(nxm.d):nu?nu.name+" ab "+nu.from:"",
    `<div class="section-head kidmedh"><span class="freq">Vorsorge, Impfungen, Arzt. Termine sind normale Termine im Kalender.</span><button class="chipbtn" data-kidmed="">＋ Eintrag</button></div>`
    +(mup.length?`<ul class="evlist kidmedter">${mup.slice(0,12).map(e=>evRow(e,true)).join("")}</ul>`:"")
    +(open.length?`<div class="freq">Noch ohne Tag</div><ul class="shop kidmeds">${open.map(mli).join("")}</ul>`:"")
    +(nu?`<div class="kidsugg"><span>✨ Vorschlag: <b>${esc(nu.name)}</b> zwischen ${esc(nu.from)} und ${esc(nu.to)}</span><button class="chipbtn neutral" data-kidmedu="${esc(nu.name)}">＋ Eintragen</button></div>`:"")
    +(mpast.length||done.length?`<details class="kiddone"><summary>✅ Vorbei und erledigt (${mpast.length+done.length})</summary>${mpast.length?`<ul class="evlist kidmedter">${mpast.slice(0,12).map(e=>evRow(e,true)).join("")}</ul>`:""}${done.length?`<ul class="shop kidmeds">${done.map(mli).join("")}</ul>`:""}</details>`:"")
    +`<div class="tagcard kiddoc"><div class="trow"><span class="tic">👩‍⚕️</span><button class="ttx" data-kiddoc="1"><span>${doc.name?esc(doc.name):"Kinderarzt eintragen"}<i>${doc.name||doc.tel?"Kinderarzt"+(doc.tel?" · 📞 "+telMask(doc.tel):""):"Name, Telefon, Adresse"}</i></span><em>✎</em></button>${doc.tel&&waNum(doc.tel)?`<a class="catbtn routebtn" href="tel:+${waNum(doc.tel)}" aria-label="Kinderarzt anrufen">📞</a>`:""}${dp&&dp.addr?transitA(dp.name):""}</div>`
    +`<div class="trow"><span class="tic">🎂</span><button class="ttx" data-kidbirth="1"><span>${kidData().birth?esc(kidData().birth.split("-").reverse().join(".")):"Geburtstag eintragen"}<i>${kidData().birth?esc(kidAgeTxt()):"für das Alter oben und den Vorsorge-Vorschlag"}</i></span><em>✎</em></button></div></div>`,false,"kidcard");
  return h}
// Wochen-Tafel Bringen und Abholen (oben auf der Seite Kita)
function kidBoard(){const cm=mondayOf(new Date()),off=S.kidWk|0,mon=addDays(cm,7*off),{w}=isoWeek(mon),wk=wkKey(mon),today=ymd(new Date()),DN=["Mo","Di","Mi","Do","Fr"];
  const two=pname("p0").charAt(0).toLowerCase()===pname("p1").charAt(0).toLowerCase(),ini=p=>pname(p).slice(0,two?2:1);
  const cell=(x,i,f)=>{const y=x[f];return `<button class="kidwho" style="background:${PCOL[y.p]}" data-kidset="${wk}|${i}|${f}" aria-label="${f==="br"?"Bringt":"Holt"} am ${DN[i]}: ${esc(pname(y.p))}, tippen zum Auswählen">${esc(ini(y.p))}</button>`};
  const cols=[0,1,2,3,4].map(i=>{const x=bhDay(mon,i);return `<li class="kidrow${x.k===today?" today":""}${x.off?" off":""}"><span class="kidday"><b>${DN[i]}</b><small>${x.d.getDate()}.${x.d.getMonth()+1}.</small></span>${x.off?`<span class="kidoff" title="${esc(x.off==="frei"?feiertag(x.k):x.off==="zu"?"Kita zu":"Urlaub")}">${x.off==="zu"?"🚪<small>zu</small>":x.off==="frei"?"🎉<small>frei</small>":"⛵<small>Urlaub</small>"}</span>`:cell(x,i,"br")+cell(x,i,"ab")}</li>`}).join("");
  const hand=Object.keys((kidData().bh||{})[wk]||{}).length;
  return `<section class="card kidbh"><div class="section-head"><h2>🚸 Bringen und Abholen</h2><span class="weeknav"><button class="iconbtn" data-kidwk="${off-1}" aria-label="Vorige Woche"${off<=-1?" disabled":""}>‹</button><span class="wkdate" style="margin:0">KW ${w}</span><button class="iconbtn" data-kidwk="${off+1}" aria-label="Nächste Woche"${off>=2?" disabled":""}>›</button></span></div>
    <div class="kidbd"><div class="kidlab"><span></span><span>bringt</span><span>holt</span></div><ul class="kidlist">${cols}</ul></div>
    <div class="kidleg"><span><i style="background:${PCOL.p0}"></i>${esc(pname("p0"))}</span><span><i style="background:${PCOL.p1}"></i>${esc(pname("p1"))}</span><span class="freq">Tipp auf ein Feld: Person, 📌 jede Woche, 🔑 Hausdienst</span></div>
    <div class="btnrow kidbtns"><button class="ghost" data-kidrule="${off}">📌 Als feste Woche</button>${hand?`<button class="ghost" data-kidreset="${off}">↺ Zurücknehmen</button>`:""}<button class="ghost" data-nav="woche|wp:0">🔑 Hausdienst ›</button></div></section>`}
// Fenster: Größen, Gesundheit, Kinderarzt, Geburtstag, Gerade beliebt
function kidSizeEdit(){const z=kidSize();editBox("📏 Größen",[{k:"cl",label:"Kleidung",val:z.cl||"",max:12,ph:"z. B. 98"},{k:"sh",label:"Schuhe",val:z.sh||"",max:12,ph:"z. B. 25"},{k:"hat",label:"Mütze",val:z.hat||"",max:12,ph:"z. B. 50"},{type:"note",label:"Der Stand (Monat) wird beim Speichern auf heute gesetzt."}],
  async V=>{const c=k=>String(V[k]||"").trim().slice(0,12)||null,v={cl:c("cl"),sh:c("sh"),hat:c("hat")};await S.store.setPath("food/kid/size",v.cl||v.sh||v.hat?Object.assign(v,{at:Date.now()}):null);toast("Größen gespeichert")},
  z.at?async()=>{await S.store.setPath("food/kid/size",null);toast("Größen gelöscht")}:null)}
function kidMedEdit(id,pre){const x=id?kidMeds().find(m=>m.id===id):null,v=x||pre||{};
  editBox(x?"🩺 Eintrag ändern":"🩺 Neuer Eintrag",[{k:"name",label:"Was?",val:v.name||"",ph:"z. B. U7a, Impfung, Zahnarzt"},{k:"kind",label:"Art",type:"chips",val:v.kind||"vorsorge",opts:KID_MED.map(k=>[k[0],k[1]+" "+k[2]])},{k:"date",label:"Wann? (steht dann im Kalender)",type:"date",val:v.date||""},{k:"time",label:"Uhrzeit",type:"time",val:v.time||""},{k:"note",label:"Notiz",val:v.note||"",max:160,ph:"z. B. Impfpass und gelbes Heft mitnehmen"},{k:"done",label:"Stand",type:"chips",val:v.done?"1":"",opts:[["","Offen"],["1","✅ Erledigt"]]}],
    async V=>{const name=String(V.name||"").trim().slice(0,80);if(!name){toast("Bitte eintragen, was es ist.");return}const nid=x?x.id:newId("km");
      if(/^\d{4}-\d\d-\d\d$/.test(V.date)&&!V.done){const dp=kidDocPlace();await S.store.setPath("food/termin/m_"+nid,{name,date:V.date,time:/^\d\d:\d\d$/.test(V.time)?V.time:null,tag:"arzt",who:"kid",mk:V.kind||"vorsorge",note:String(V.note||"").trim().slice(0,160)||null,place:dp&&dp.name||null,at:(x&&x.at)||Date.now(),by:(x&&x.by)||S.me||""});if(x)await S.store.setPath("food/kid/med/"+nid,null);toast("Gespeichert, steht im Kalender");return}
      await S.store.setPath("food/kid/med/"+nid,{name,kind:V.kind||"vorsorge",date:/^\d{4}-\d\d-\d\d$/.test(V.date)?V.date:null,time:/^\d\d:\d\d$/.test(V.time)?V.time:null,note:String(V.note||"").trim().slice(0,160)||null,done:V.done?true:null,at:(x&&x.at)||Date.now(),by:(x&&x.by)||S.me||""});
      if(V.done)await prioDropRef([nid]);toast(V.date&&!V.done?"Gespeichert, steht im Kalender":"Gespeichert")},
    x?async()=>{await S.store.setPath("food/kid/med/"+x.id,null);await prioDropRef([x.id]);toast("Eintrag gelöscht")}:null)}
function kidDocEdit(){const d=kidDoc(),p=kidDocPlace();
  editBox("👩‍⚕️ Kinderarzt",[{k:"name",label:"Name der Praxis",val:d.name||"",max:40},{k:"tel",label:"Telefon"+(d.tel?" (jetzt "+telMask(d.tel)+", neu eintippen ersetzt)":""),type:"tel",val:"",max:30,ph:d.tel?"":"z. B. 089 1234567"},{k:"addr",label:"Adresse (für 🚆, bleibt nur in eurer Datenbank)",val:(p&&p.addr)||"",max:160}],
    async V=>{const name=String(V.name||"").trim().slice(0,40),tel=String(V.tel||"").trim().slice(0,30)||d.tel||null,addr=String(V.addr||"").trim().slice(0,160);
      await S.store.setPath("food/kid/doc",name||tel?{name:name||null,tel}:null);await S.store.setPath("food/place/kdoc",addr?{name:name||"Kinderarzt",addr,at:(p&&p.at)||Date.now(),by:S.me||""}:null);toast("Gespeichert")},
    d.name||d.tel||p?[["Löschen",async()=>{await S.store.setPath("food/kid/doc",null);await S.store.setPath("food/place/kdoc",null);toast("Kinderarzt gelöscht")},true]].concat(d.tel?[["Nur Nummer löschen",async()=>{await S.store.setPath("food/kid/doc/tel",null);toast("Nummer gelöscht")}]]:[]):null)}
function kidBirthEdit(){const b=kidData().birth||"";editBox("🎂 Geburtstag",[{k:"b",label:"Geburtstag (bleibt nur in eurer Datenbank)",type:"date",val:b}],
  async V=>{await S.store.setPath("food/kid/birth",/^\d{4}-\d\d-\d\d$/.test(V.b)?V.b:null);toast("Gespeichert")},b?async()=>{await S.store.setPath("food/kid/birth",null);toast("Geburtstag gelöscht")}:null)}
function kidLikesEdit(){editBox("💛 Gerade beliebt",[{k:"l",label:"Was mag "+(kidName()==="Kind"?"euer Kind":kidName())+" gerade? (mit Komma)",val:kidLikes().join(", "),ph:"z. B. Klettern, Bagger"},{type:"note",label:"Danach richten sich die 💛 bei Ausflüge › Was ist los."}],
  async V=>{await S.store.setPath("food/pref/kidlikes",String(V.l||"").trim().slice(0,80));toast("Gespeichert")})}
// Klicks der Kind-Seite (aus 28-klicks.js)
function kidClick(b){const d=b.dataset;
  if(d.kidsize){kidSizeEdit();return true}
  if(d.kidmed!=null){kidMedEdit(d.kidmed);return true}
  if(d.kidmedu){kidMedEdit("",{name:d.kidmedu,kind:"vorsorge"});return true}
  if(d.kiddoc){kidDocEdit();return true}
  if(d.kidbirth){kidBirthEdit();return true}
  if(d.kidlikes){kidLikesEdit();return true}
  if(d.kidatip){goNav("ausflug|tt:ideen");S.atipLk=true;(S.tFold=S.tFold||{}).atip=true;render();setTimeout(()=>{const el=document.querySelector('[data-tfold="atip"]');if(el)el.scrollIntoView({block:"start"})},40);return true}
  return false}
