// ---------- Privat: Themen zu zweit ----------
const briefe=()=>listOf(S.food&&S.food.brief).sort((a,b)=>(a.at||0)-(b.at||0));
// ---------- Wir › Kind (Florian 15.11.2026): Seite 2 von Wir; Name nur aus der Datenbank (food/pref/kidname) ----------
// Bringen und Abholen je Tag: Hand-Änderung (food/kid/bh/<wk>/d<i> {br?,ab?}) vor Homeoffice (Aufgabe owner "ho": ganzer Tag = beides, "2 von 2" = bringt, "1 von 2" = holt ab) vor fester Woche (food/kid/rule)
const kidName=()=>((S.food&&S.food.pref&&S.food.pref.kidname)||"").trim()||"Kind";
// Seiten-Leisten seit der Bündelung (17.11.2026) aus AREA_PAGES (15-bereiche.js): Wir = Partner | Geschenke, Kind = Kind | Kita | Spielen
const wirPager=p=>areaPager(["privat","geschenke"][p]||"privat");
const KID_RULE={br:["p0","p1","p0","p1","p0"],ab:["p1","p0","p1","p0","p1"]};
const kidRule=()=>{const r=S.food&&S.food.kid&&S.food.kid.rule;return {br:(r&&r.br)||KID_RULE.br,ab:(r&&r.ab)||KID_RULE.ab}};
const kitaZu=d=>kitas().find(x=>x.sec==="termine"&&x.kind==="zu"&&x.date===d)||null;
function bhDay(mon,i){const wk=wkKey(mon),d=addDays(mon,i),k=ymd(d),ov=(((S.food&&S.food.kid&&S.food.kid.bh)||{})[wk]||{})["d"+i]||{},hoT=tasks().find(t=>t.owner==="ho"),ho=hoT?ticksOf(wk)[hoT.id+"__"+i]:null,hp=ho&&(ho.by==="p0"||ho.by==="p1")?ho.by:null,rl=kidRule();
  const off=kitaZu(k)?"zu":feiertag(k)?"frei":inUrlaub(d)?"urlaub":"";
  // Florian 16.11.2026: Wer den Hausdienst hat (Aufgabe owner "ho" in der Woche), bringt und holt NICHT; das macht der andere.
  // Geteilter Tag (Florian 16.11.2026, half:"vm"): by hat vormittags Hausdienst, der andere nachmittags; also bringt der andere, by holt.
  // Alte halbe Tage (part br/ab): diese Person bringt bzw. holt, der andere das andere.
  const ot=q=>q==="p0"?"p1":"p0",hw=f=>!hp?null:ho.half==="vm"?(f==="br"?ot(hp):hp):!ho.part?ot(hp):ho.part===f?hp:ot(hp);
  const pick=f=>{const base=hp?{p:hw(f),src:"ho"}:{p:rl[f][i]||"p0",src:"regel"};return ov[f]&&ov[f]!==base.p?{p:ov[f],src:"hand",base}:Object.assign({base},base)};
  return {i,k,d,off,ho,hoT,br:pick("br"),ab:pick("ab")}}
// Auswahl je Feld (Florian 15.11.2026: jedes Feld direkt wählen, mit Optionen): Person nur diese Woche, 📌 jede Woche, wie geplant, Homeoffice des Tages
function kidPick(wk,i,f){S.mboxAt=Date.now();if(document.getElementById("mbox"))return;const mon=addDays(mondayOf(new Date()),7*(S.kidWk|0));if(wkKey(mon)!==wk)return;const x=bhDay(mon,i),y=x[f],DN=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag"],P=S.me==="p1"?["p1","p0"]:["p0","p1"],rl=kidRule();
  const srcTxt=b=>b.src==="ho"?"🔑 Hausdienst":"feste Woche";
  const hoOn=(p,half)=>x.ho&&x.ho.by===p&&!x.ho.part&&(x.ho.half||"")===half?' aria-pressed="true"':"";
  const el=document.createElement("div");el.id="mbox";el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Bringen und Abholen"><div class="section-head"><h2>🚸 ${DN[i]} ${x.d.getDate()}.${x.d.getMonth()+1}.: wer ${f==="br"?"bringt":"holt ab"}?</h2></div><div class="quicklist"><div class="freq kidhoh" style="margin-top:0">Nur diese Woche oder 📌 jede Woche:</div>
    ${P.map(p=>`<div class="kidopt"><button class="quickbtn" data-kp="${p}"${y.p===p?' aria-pressed="true"':""}><span class="qi">${esc(pname(p).charAt(0))}</span><span>${esc(pname(p))}${p===y.base.p?` <small>(geplant: ${srcTxt(y.base)})</small>`:""}</span></button><button class="quickbtn kidall" data-kp="${p}|rule"${rl[f][i]===p?' aria-pressed="true"':""} aria-label="${esc(pname(p))} jeden ${DN[i]}">📌 jeden ${DN[i].slice(0,2)}</button></div>`).join("")}
    ${y.src==="hand"?`<button class="quickbtn" data-kp="reset"><span class="qi">↺</span><span>Wie geplant: ${esc(pname(y.base.p))} (${srcTxt(y.base)})</span></button>`:""}
    ${x.hoT?`<div class="freq kidhoh">🔑 Hausdienst an diesem Tag (steht auch in der Woche; diese Person bringt und holt nicht):</div>${hoOpts(P).map(o=>`<button class="quickbtn" data-kh="${o[0]}"${hoOn(...o[0].split("|").concat([""]).slice(0,2))}><span class="qi">${o[1]}</span><span>${o[2]}</span></button>`).join("")}${x.ho?`<button class="quickbtn" data-kh="clear"><span class="qi">✕</span><span>Kein Hausdienst</span></button>`:""}`:""}
    </div></div>`;
  document.body.appendChild(el);
  const ovp="food/kid/bh/"+wk+"/d"+i;
  el.addEventListener("click",async e=>{const kp=e.target.closest("[data-kp]"),kh=e.target.closest("[data-kh]");
    if(kp){mboxClose();const [p,m]=kp.dataset.kp.split("|");try{
      if(p==="reset")await S.store.setPath(ovp+"/"+f,null);
      else if(m==="rule"){const r={br:rl.br.slice(),ab:rl.ab.slice()};r[f][i]=p;await S.store.setPath("food/kid/rule",r);await S.store.setPath(ovp+"/"+f,null);toast(pname(p)+" "+(f==="br"?"bringt":"holt")+" jetzt jeden "+DN[i])}
      else{await S.store.setPath(ovp+"/"+f,p===y.base.p?null:p);await kidHoSync(wk,i)}}catch(_){toast("Konnte nicht speichern.")}return}
    if(kh){mboxClose();const [p,half]=kh.dataset.kh.split("|");try{await S.store.tick(wk,x.hoT.id+"__"+i,p==="clear"?null:Object.assign({by:p,at:Date.now()},half?{half}:{}));await S.store.setPath(ovp,null)}catch(_){toast("Konnte nicht speichern.")}return}
    if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
// Bringen/Holen von Hand geändert (Florian 16.11.2026): bringt und holt dieselbe Person, bekommt der andere den Hausdienst (Eintrag in der Woche), die Hand-Änderung fällt weg.
// Bringt der eine und holt der andere, wird es ein geteilter Hausdienst (vormittags hat ihn, wer nicht bringt; nachmittags, wer nicht holt). So laufen Woche und Kind nie auseinander.
async function kidHoSync(wk,i){const mon=addDays(mondayOf(new Date()),7*(S.kidWk|0));if(wkKey(mon)!==wk)return;const x=bhDay(mon,i);if(!x.hoT||x.off)return;
  const br=x.br.p,ab=x.ab.p,ot=q=>q==="p0"?"p1":"p0",key=x.hoT.id+"__"+i;
  if(br!==ab){if(x.ho&&x.ho.by===ab&&x.ho.half==="vm"&&!x.ho.part)return;if(!x.ho&&x.br.src!=="hand"&&x.ab.src!=="hand")return;
    await S.store.tick(wk,key,{by:ab,half:"vm",at:Date.now()});await S.store.setPath("food/kid/bh/"+wk+"/d"+i,null);toast("🔑 Hausdienst geteilt: vormittags "+pname(ab)+", nachmittags "+pname(br));return}
  if(x.ho&&x.ho.by===ot(br)&&!x.ho.part&&!x.ho.half)return;
  // Ohne Hausdienst und ohne Hand-Änderung: nichts anlegen
  if(!x.ho&&x.br.src!=="hand"&&x.ab.src!=="hand")return;
  await S.store.tick(wk,key,{by:ot(br),at:Date.now()});await S.store.setPath("food/kid/bh/"+wk+"/d"+i,null);toast("🔑 Hausdienst: "+pname(ot(br)))}
// Homeoffice geändert (Woche): Hand-Änderungen bei Bringen und Abholen an diesem Tag fallen weg, das Homeoffice ist die neuere Angabe
async function hoKidSync(wk,key){const hoT=tasks().find(t=>t.owner==="ho");if(!hoT||!key.startsWith(hoT.id+"__"))return;const i=+key.slice(hoT.id.length+2);if(!(i>=0&&i<5))return;
  if(((((S.food&&S.food.kid&&S.food.kid.bh)||{})[wk])||{})["d"+i])try{await S.store.setPath("food/kid/bh/"+wk+"/d"+i,null)}catch(_){}}
const bringTasks=()=>tasks().filter(t=>/^bringen/i.test(t.name)&&t.freq==="week");
function bringDone(wk,i){const tk=ticksOf(wk);for(const t of bringTasks())for(let j=0;j<slotsOf(t);j++){const v=tk[t.id+"__"+j];if(v&&v.day===i)return {key:t.id+"__"+j,v}}return null}
function kidBhRows(mon,cur){const today=ymd(new Date()),wk=wkKey(mon);return [0,1,2,3,4].map(i=>{const x=bhDay(mon,i),isT=x.k===today,DN=["Mo","Di","Mi","Do","Fr"];
  const who=f=>{const y=x[f];return `<button class="chipbtn neutral kidwho" data-kidset="${wk}|${i}|${f}" aria-label="${f==="br"?"Bringt":"Holt"} am ${DN[i]}: ${esc(pname(y.p))}, tippen zum Auswählen">${esc(pname(y.p))}</button>`};
  const dn=cur&&x.k<=today&&!x.off?bringDone(wk,i):null;
  return `<li class="kidrow${isT?" today":""}${x.off?" off":""}"><span class="kidday"><b>${DN[i]}</b><small>${x.d.getDate()}.${x.d.getMonth()+1}.</small></span>${x.off?`<span class="freq">${x.off==="zu"?"🚪 Kita zu":x.off==="frei"?"🎉 "+esc(feiertag(x.k)):"⛵ Urlaub"}</span>`:`<span class="kidcol"><small>bringt</small>${who("br")}</span><span class="kidcol"><small>holt</small>${who("ab")}</span>`}</li>`}).join("")}
function renderKind(){const now=new Date(),cm=mondayOf(now),off=S.kidWk|0,mon=addDays(cm,7*off),{w}=isoWeek(mon),today=ymd(now),di=(now.getDay()+6)%7,nm=kidName();
  let h=`<div><div class="eyebrow">Familie</div><h1>${esc(nm)}</h1></div>`;
  if(nm==="Kind")h+=`<div class="freq">Den Namen tragt ihr unter <button class="linkbtn" data-go="settings">Einstellungen › Wir</button> ein. Er bleibt nur bei euch.</div>`;
  h+=`<section class="card kidbh"><div class="section-head"><h2>🚸 Bringen und Abholen</h2><span class="weeknav"><button class="iconbtn" data-kidwk="${off-1}" aria-label="Vorige Woche"${off<=-1?" disabled":""}>‹</button><span class="wkdate" style="margin:0">KW ${w}</span><button class="iconbtn" data-kidwk="${off+1}" aria-label="Nächste Woche"${off>=2?" disabled":""}>›</button></span></div>
    <ul class="kidlist">${kidBhRows(mon,off===0)}</ul>
    <div class="freq">Tippen auf eine Person öffnet die Auswahl: nur diese Woche, 📌 jede Woche, wie geplant oder Hausdienst. Wer in der Woche 🔑 Hausdienst hat, bringt und holt nicht, das macht der andere. Änderst du hier, zieht die Woche mit.</div>
    <div class="btnrow"><button class="ghost" data-kidrule="${off}">📌 Als feste Woche speichern</button>${Object.keys((((S.food&&S.food.kid&&S.food.kid.bh)||{})[wkKey(mon)])||{}).length?`<button class="ghost" data-kidreset="${off}">↺ Änderungen dieser Woche zurücknehmen</button>`:""}<button class="ghost" data-nav="woche|wp:0">🔑 Hausdienst ›</button></div></section>`;
  // Kita kurz
  const km=di<5?(kitaMeals(cm)["d"+di]||{}):{},kb=kitaBring(),nx=kitas().filter(x=>x.sec==="termine"&&x.date&&x.date>=today).sort((a,b)=>a.date<b.date?-1:1)[0];
  const row=(ic,t,sub,attr)=>`<div class="trow"><span class="tic">${ic}</span><button class="ttx" ${attr}><span>${t}${sub?`<i>${sub}</i>`:""}</span><em>›</em></button></div>`;
  h+=`<section class="card tagcard"><div class="section-head"><h2>🎒 Kita</h2></div>`
    +row("🍽️",km.text?esc(km.text):"Kein Kita-Essen eingetragen","Mittag heute",'data-nav="kita|ks:essen"')
    +row("📦",kb.length?kb.length+" Sachen mitbringen":"Nichts mitzubringen",kb.slice(0,3).map(x=>esc(x.name)).join(", "),'data-nav="kita|ks:tasche"')
    +row("📅",nx?esc(nx.name):"Kein Kita-Termin",nx?esc(dLabel(nx.date)):"",'data-nav="kita|ks:termine"')+`</section>`;
  // Verknüpft
  const kids=buys().filter(x=>!x.done&&x.for==="kid"),cnt=l=>kids.filter(x=>x.list===l).length+(l==="geschenke"?buyLinked("geschenke").filter(x=>x.kid).length:0);
  h+=`<section class="card tagcard"><div class="section-head"><h2>🧒 Für ${esc(nm)}</h2></div>`
    +row("👕","Kleidung",cnt("kleidung")?cnt("kleidung")+" offen":"",'data-nav="listen|bl:kleidung"')
    +row("🎁","Geschenke und Spielsachen",cnt("geschenke")?cnt("geschenke")+" offen":"",'data-nav="listen|bl:geschenke"')
    +row("🎄","Adventskalender","",'data-nav="geschenke|pf:advent"')
    +row("🚲","Ausflüge mit Kleinkind","",'data-nav="ausflug|tt:ideen"')
    +row("⚽","Spielen","",'data-go="spiel"')
    +row("🛝","Spielplätze","",'data-nav="ausflug|rk:spielplatz"')
    +row("🎵","Kinderlieder und Hörspiele","",'data-nav="musik|ma:lied"')+musLikedRow()+`</section>`;
  return h}
function renderPrivat(){const sec=S.privSec==="briefe"?"briefe":"lunch";
  let h=`<div><div class="eyebrow">Nur ihr zwei</div><h1>Partner</h1></div><div class="unl privtabs" style="margin:4px 0 12px">${[["lunch","🍽️ Mittagessen"],["briefe","✉️ Briefe"+(briefe().length?" ("+briefe().length+")":"")]].map(x=>`<button class="chipbtn${sec===x[0]?"":" neutral"}" data-priv="${x[0]}" aria-pressed="${sec===x[0]}">${x[1]}</button>`).join("")}</div>`;
  h+=sec==="briefe"?briefCard():`<div class="section-head"><h2>🍽️ Mittagessen</h2></div>`+renderLunch();
  return h+contactCard()}
// ---------- Briefkasten: WhatsApp zum anderen und Briefe ----------
function waNum(n){let d=String(n||"").replace(/[^\d+]/g,"");if(d.startsWith("+"))d=d.slice(1);else if(d.startsWith("00"))d=d.slice(2);else if(d.startsWith("0"))d="49"+d.slice(1);return d.length>=8?d:""}
// Kontakt: nur der andere (food/contact/p0|p1); Nummern nur in der Datenbank
// Handynummern werden nie im Klartext gezeigt (Florian 15.11.2026): nur ••• und die letzten 3 Ziffern; neu eintippen ersetzt, 🗑 löscht
const telMask=v=>{const d=String(v||"").replace(/\D/g,"");return d?"••• ••• "+d.slice(-3):""};
// Nummern in Notizen (Florian 16.11.2026, 📞 Anrufen): immer versternt anzeigen; telA = ein Tipp wählt die erste Nummer, telNote(t,true) macht jede Nummer im Text antippbar
const TEL_RX=/(?:\+|00)?\d[\d \-\/()]{6,}\d/g;
const telNums=t=>(String(t||"").match(TEL_RX)||[]).filter(m=>{const d=m.replace(/\D/g,"");return d.length>=8&&d.length<=15&&!/^\d{4}\s*[-–]\s*\d{4}$/.test(m.trim())});
function telNote(t,link){const s=String(t||""),N=telNums(s);if(!N.length)return esc(s);let out="",k=0;N.forEach(m=>{const i=s.indexOf(m,k);out+=esc(s.slice(k,i))+(link?`<a class="tellink" href="tel:+${waNum(m)}">📞 ${telMask(m)}</a>`:`📞 ${telMask(m)}`);k=i+m.length});return out+esc(s.slice(k))}
const telA=t=>{const n=telNums(t)[0];return n?`<a class="catbtn routebtn" href="tel:+${waNum(n)}" aria-label="Anrufen">📞</a>`:""};
function telField(p,raw,name){const m=telMask(raw);return `<div class="telrow"><input type="tel" data-contact="${esc(p)}" value="" placeholder="${m?esc(m)+"  (neu eintippen ersetzt)":"Handynummer, z. B. 0170 1234567"}" autocomplete="off" aria-label="Handynummer${name?" von "+esc(name):""}">${m?`<button class="rm" data-contactdel="${esc(p)}" aria-label="Nummer löschen">🗑</button>`:""}</div>`}
function otherP(){return (S.me||"p0")==="p0"?"p1":"p0"}
function contactList(){const per=(S.config&&S.config.persons)||[],ot=otherP(),ct=(S.food&&S.food.contact)||{};
  const l=[{id:"",name:per[ot==="p0"?0:1]||"Partner",raw:ct[ot]||"",num:waNum(ct[ot]),main:true}];
  return l} // Kontakte zu anderen Personen plant Florian später an anderer Stelle
const callBtns=c=>c.num?`<div class="callrow"><a class="primary wabtn" href="https://wa.me/${c.num}" target="_blank" rel="noopener">💬 WhatsApp</a><a class="primary wabtn telbtn" href="tel:+${c.num}">📞 Anrufen</a></div>`:"";
function briefCard(){const l=briefe();return `<section class="card"><div class="section-head"><h2>✉️ Briefe</h2></div>
  <form class="addrow" id="briefform" novalidate><input type="text" id="briefinput" placeholder="📜🪶" maxlength="80" autocomplete="off" aria-label="Brief"><button class="primary" type="submit">+</button></form>
  ${l.length?`<ul class="shop">${l.map(x=>`<li><span class="nm" style="flex:1;padding:10px 0">${esc(x.name)}</span><button class="rm" data-briefrm="${esc(x.id)}" aria-label="${esc(x.name)} entfernen">✕</button></li>`).join("")}</ul>`:`<div class="empty"><div>Noch nichts eingetragen.</div></div>`}</section>`}
function contactCard(){const l=contactList();
  return `<section class="card postcard" id="kontakte"><div class="section-head"><h2>📇 Kontakt</h2></div><div class="freq">Ein Tipp auf den Briefkasten im Bild öffnet WhatsApp an ${esc(l[0].name)}. Lange drücken zeigt Anrufen und Briefe. Die Nummern liegen nur in euren gemeinsamen Daten.</div>
  ${l.map(c=>`<div class="contact"><div class="contacthead"><b>${esc(c.name)}</b>${c.main?"":`<button class="rm" data-contactrm="${esc(c.id)}" aria-label="${esc(c.name)} entfernen">✕</button>`}</div>${callBtns(c)}${telField(c.main?otherP():"",c.raw,c.name)}</div>`).join("")}</section>`}
// Briefkasten im Bild: kurzer Tipp = WhatsApp an den anderen, lange drücken = Auswahl (mehrere Kontakte, Briefe)
function mboxTap(){if(Date.now()-(S.mboxAt||0)<700)return;const c=contactList()[0];if(c.num){const a=document.createElement("a");a.href="https://wa.me/"+c.num;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();return}mboxAsk(c)}
// Ohne Nummer: kurze Frage direkt am Briefkasten statt stummem Sprung (Florian 15.11.2026)
function mboxAsk(c){if(document.getElementById("mbox"))return;S.mboxAt=Date.now();const el=document.createElement("div");el.id="mbox";
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard" role="dialog" aria-label="Nummer fehlt"><div class="section-head"><h2>📮 Nummer von ${esc(c.name)} fehlt</h2></div><div class="freq">Einmal eintragen, dann öffnet der Briefkasten direkt WhatsApp. Die Nummer liegt nur in euren gemeinsamen Daten und wird nie ganz angezeigt.</div>
    <form id="mboxnum" class="addrow" style="margin-top:8px" novalidate><input type="tel" id="mboxtel" placeholder="z. B. 0170 1234567" autocomplete="off" aria-label="Handynummer von ${esc(c.name)}"><button class="primary" type="submit">💬 Speichern und schreiben</button></form>
    <div class="mboxc"><button class="chipbtn neutral" data-mboxx="1">Abbrechen</button></div></div>`;
  document.body.appendChild(el);setTimeout(()=>{const i=document.getElementById("mboxtel");if(i)i.focus()},50);
  el.addEventListener("submit",async e=>{e.preventDefault();const v=(document.getElementById("mboxtel").value||"").trim(),n=waNum(v);if(!n){toast("Bitte eine Handynummer eintragen.");return}
    try{await S.store.setPath("food/contact/"+otherP(),v.slice(0,30));mboxClose();const a=document.createElement("a");a.href="https://wa.me/"+n;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}catch(_){toast("Konnte nicht speichern.")}});
  el.addEventListener("click",e=>{if(e.target.closest("[data-mboxx]")){mboxClose();return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
function mboxOpen(){S.mboxAt=Date.now();if(document.getElementById("mbox"))return;const l=contactList(),nb=briefe().length;const el=document.createElement("div");el.id="mbox";
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard" role="dialog" aria-label="Briefkasten"><div class="section-head"><h2>📮 Briefkasten</h2></div>${l.map(c=>c.num?`<div class="mboxc"><span>${esc(c.name)}</span><a class="chipbtn" href="https://wa.me/${c.num}" target="_blank" rel="noopener">💬 WhatsApp</a><a class="chipbtn" href="tel:+${c.num}">📞 Anrufen</a></div>`:"").join("")}<div class="mboxc"><button class="chipbtn neutral" data-mbox="privat|pv:briefe">✉️ Briefe${nb?" ("+nb+")":""}</button><button class="chipbtn neutral" data-mbox="privat|pv:kontakte">📇 Kontakt</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const b=e.target.closest("[data-mbox]");if(b){mboxClose();goNav(b.dataset.mbox);return}if(e.target.closest("a")){setTimeout(mboxClose,50);return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
function homeOpen(){if(!S.homeOpen){try{S.homeOpen=JSON.parse(localStorage.getItem("hq-homeopen")||"{}")||{}}catch(_){S.homeOpen={}}}return S.homeOpen}
// Hausdienst (früher Homeoffice): lange auf einen Tag drücken = Auswahl, wer (Florian 15.11./16.11.2026, ohne halbe Tage)
function hoCanEdit(){const cm=mondayOf(new Date());if(+S.view<+cm&&S.wkEdit!==wkKey(S.view)){toast("Archiv: erst „✏️ Nachtragen“ antippen.");return false}return true}
// Vier Möglichkeiten (Florian 16.11.2026): ganzer Tag je Person, geteilt vormittags/nachmittags in beide Richtungen. Wert "p|vm" = p vormittags.
function hoOpts(P){const o=q=>q==="p0"?"p1":"p0",n=q=>esc(pname(q)),c=q=>esc(pname(q).charAt(0));
  return P.map(p=>[p,c(p),`${n(p)} hat Hausdienst <small>(${n(o(p))} bringt und holt)</small>`]).concat(P.map(p=>[p+"|vm",c(p)+"/"+c(o(p)),`Vormittags ${n(p)}, nachmittags ${n(o(p))} <small>(${n(o(p))} bringt, ${n(p)} holt)</small>`]))}
function hoPick(btn){if(!hoCanEdit())return;S.mboxAt=Date.now();if(document.getElementById("mbox"))return;const t=tasks().find(x=>x.id===btn.dataset.task);if(!t)return;const wk=wkKey(S.view),key=t.id+"__"+btn.dataset.slot,cur=ticksOf(wk)[key];
  const set=async v=>{mboxClose();try{await S.store.tick(wk,key,v);await hoKidSync(wk,key)}catch(_){toast("Konnte nicht speichern. Bitte nochmal tippen.")}};
  const el=document.createElement("div");el.id="mbox";el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Hausdienst"><div class="section-head"><h2>🔑 ${esc(DAYS[+btn.dataset.slot]||"")}: wer hat Hausdienst?</h2></div><div class="quicklist">
    ${hoOpts(S.me==="p1"?["p1","p0"]:["p0","p1"]).map(o=>{const [p,h]=o[0].split("|");return `<button class="quickbtn" data-hop="${o[0]}"${cur&&cur.by===p&&!cur.part&&(cur.half||"")===(h||"")?' aria-pressed="true"':""}><span class="qi">${o[1]}</span><span>${o[2]}</span></button>`}).join("")}
    ${cur?`<button class="quickbtn" data-hop="clear"><span class="qi">✕</span><span>Leeren</span></button>`:""}</div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const b=e.target.closest("[data-hop]");if(b){const [p,half]=b.dataset.hop.split("|");set(p==="clear"?null:Object.assign({by:p,at:Date.now()},half?{half}:{}));return}if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
function mboxClose(){const el=document.getElementById("mbox");if(el)el.remove()}
