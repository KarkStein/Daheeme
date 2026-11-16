// ---------- Wer macht was (Florian 15.11.2026: Übersicht und Wer macht was in einer Seite). Oben Überblick, darunter ausklappbare Abschnitte ----------
const WMW_FL=t=>t.freq==="day"?"täglich":t.freq==="week"?(t.times||1)+"× pro Woche":FREQ_LABEL[t.freq];
const WMW_PER={month:"diesen Monat",half:"dieses Halbjahr",year:"dieses Jahr"};
// Stand einer Aufgabe diese Woche für Person p (bei "Beide" zählt nur die Hälfte von p)
function wmwState(t,p,mon,tk){if(group(t.freq)!=="week"){const pt=periodTick(t,mon);return {c:pt?1:0,n:1}}
  const n=slotsOf(t);let c=0;for(let i=0;i<n;i++){const b=t.id+"__"+i;if(t.owner==="both"?(tk[b+"_"+p]||(tk[b]&&tk[b].by===p)):tk[b])c++}return {c,n}}
function wmwList(who){const mon=mondayOf(new Date()),split=rotSplit(),tk=ticksOf(wkKey(mon)),P=who==="alle"?["p0","p1"]:[who],L=[];
  tasks().forEach(t=>{const o=ownerFor(t,mon,split);const ps=o==="both"?P:P.includes(o)?[o]:who==="alle"&&o==="ho"?["ho"]:[];
    ps.forEach(p=>{const st=p==="ho"?wmwState(t,"p0",mon,tk):wmwState(t,p,mon,tk),done=st.c>=st.n;if(!done&&!periodDue(t,mon))return;L.push({t,p,o,...st,done})})});return L}
function wmwRow(x,showP){const per=WMW_PER[x.t.freq],who=x.p==="ho"?"Hausdienst":pname(x.p);
  return `<li class="wmwrow${x.done?" done":""}">${x.done?`<span class="wmwchk" aria-label="Erledigt">✅</span>`:`<button class="wmwchk" data-wtick="${esc(x.t.id)}" data-who="${x.p}" aria-label="${esc(x.t.name)} abhaken">⬜</button>`}<span class="ev"><b>${esc(x.t.name)}</b>${taskLink(x.t,1)}<span class="freq"> · ${WMW_FL(x.t)}${per?" · "+per:""}${x.o==="rot"?" · im Wechsel":x.o==="both"?" · zu zweit":""}</span></span>${showP?`<span class="wmwp ${x.p}">${esc(who)}</span>`:""}${group(x.t.freq)==="week"&&x.n>1?`<span class="freq num">${x.c}/${x.n}</span>`:""}</li>`}
function renderWmw(){const d=S.draft||(S.draft=JSON.parse(JSON.stringify(S.config)));const me=S.me||"p0",who=S.wmwWho||me,O=S.wmwOpen||(S.wmwOpen={offen:true}),view=S.wmwView||"zeit";
  const mon=mondayOf(new Date()),next=addDays(mon,7),split=rotSplit(),L=wmwList(who),open=L.filter(x=>!x.done),done=L.filter(x=>x.done),showP=who==="alle";
  const sc=weekScore(wkKey(mon)),a0=sc.assigned.p0,a1=sc.assigned.p1,tot=a0+a1||1;
  const sec=(id,title,n,body)=>`<section class="card wmwsec"><button class="setsum" data-wmwsec="${id}" aria-expanded="${!!O[id]}"><h2>${title}${n!=null?` <span class="freq num">${n}</span>`:""}</h2><i>${O[id]?"▾":"›"}</i></button>${O[id]?`<div class="setbody">${body}</div>`:""}</section>`;
  const ul=a=>a.length?`<ul class="wmwlist">${a.map(x=>wmwRow(x,showP)).join("")}</ul>`:`<div class="freq">Nichts.</div>`;
  let h=`<div><div class="eyebrow">KW ${isoWeek(mon).w} · fairer Plan</div><h1>Wer macht was</h1></div>`;
  h+=`<div class="filters" role="group" aria-label="Für wen">${[[me,"Ich"],[me==="p0"?"p1":"p0",pname(me==="p0"?"p1":"p0")],["alle","Alle"]].map(x=>`<button class="chipbtn neutral" data-wmwwho="${x[0]}" aria-pressed="${who===x[0]}">${esc(x[1])}</button>`).join("")}</div>`;
  h+=`<section class="card wmwtop"><div class="wmwnums"><div><b>${open.length}</b><span>offen</span></div><div><b>${done.length}</b><span>erledigt</span></div><div><b>${L.length}</b><span>diese Woche</span></div></div>
    <div class="freq" style="margin-top:8px">Aufwand der Woche</div><div class="wmwbar"><span class="p0" style="width:${(a0/tot*100).toFixed(0)}%"></span><span class="p1" style="width:${(a1/tot*100).toFixed(0)}%"></span></div><div class="wmwleg freq"><span>${esc(pname("p0"))} ${Math.round(a0/tot*100)} %</span><span>${esc(pname("p1"))} ${Math.round(a1/tot*100)} %</span></div></section>`;
  h+=`<div class="filters" role="group" aria-label="Ansicht"><button class="chipbtn neutral" data-wmwview="zeit" aria-pressed="${view==="zeit"}">Nach Stand</button><button class="chipbtn neutral" data-wmwview="rhythmus" aria-pressed="${view==="rhythmus"}">Nach Rhythmus</button><button class="chipbtn neutral" data-act="wmwall">${Object.values(O).filter(Boolean).length>=4?"Alle zuklappen":"Alle aufklappen"}</button></div>`;
  const later=tasks().filter(t=>group(t.freq)!=="week"&&!periodTick(t,mon)&&!periodDue(t,mon)&&(who==="alle"||[who,"both"].includes(ownerFor(t,mon,split)))),laterTxt=later.length?`<div class="freq" style="margin-top:6px">⏳ Erst ab Mitte des Zeitraums: ${later.map(t=>esc(t.name)+" (ab "+fmt(periodMid(t.freq,mon),{day:"numeric",month:"numeric"})+")").join(", ")}</div>`:"";
  if(view==="zeit"){h+=sec("offen","⏳ Offen",open.length,ul(open)+laterTxt+`<div class="btnrow" style="margin-top:6px"><button class="ghost" data-act="toweek">In „Diese Woche“ abhaken</button></div>`)+sec("erledigt","✅ Erledigt",done.length,ul(done))}
  else[["day","Täglich"],["week","Pro Woche"],["month","Monatlich"],["half","Halbjährlich"],["year","Jährlich"]].forEach(f=>{const a=L.filter(x=>x.t.freq===f[0]);if(a.length)h+=sec("f-"+f[0],f[1],a.length,ul(a))});
  // Wer hat welche Aufgaben (früher "Übersicht")
  const isW=t=>group(t.freq)==="week",rot=tasks().filter(t=>t.owner==="rot"),li=a=>a.length?`<ul class="alist">${a.map(t=>`<li><span>${esc(t.name)}</span><span class="freq">${WMW_FL(t)}</span></li>`).join("")}</ul>`:"",blk=(ti,a)=>a.length?`<div style="margin-top:8px"><div class="eyebrow">${ti}</div>${li(a)}</div>`:"";
  (who==="alle"?["p0","p1"]:[who]).forEach(p=>{h+=sec("ver-"+p,"👤 Aufgaben von "+esc(pname(p)),null,
    blk("Im Wechsel, diese Woche (KW "+isoWeek(mon).w+")",rot.filter(t=>isW(t)&&ownerFor(t,mon,split)===p))+blk("Im Wechsel, nächste Woche (KW "+isoWeek(next).w+")",rot.filter(t=>isW(t)&&ownerFor(t,next,split)===p))+blk("Im Wechsel, aktuell",rot.filter(t=>!isW(t)&&ownerFor(t,mon,split)===p))+blk("Immer",tasks().filter(t=>t.owner===p))+blk("Zu zweit",tasks().filter(t=>t.owner==="both"))+(who==="alle"&&p==="p1"?blk("Hausdienst",tasks().filter(t=>t.owner==="ho")):""))});
  // Pakete und Regeln
  const rp={p0:[],p1:[]};rot.forEach(t=>rp[ownerFor(t,mon,split)].push(t));const li2=a=>a.map(t=>`<li>${esc(t.name)} <span class="freq">(${t.freq==="week"?(t.times||1)+"×/Woche":FREQ_LABEL[t.freq]})</span></li>`).join("")||"<li>nichts</li>";
  h+=sec("pakete","🔄 Pakete und Regeln",null,`<div class="freq">Wöchentliche Wechsel-Aufgaben sind in Paket A und Paket B geteilt. In geraden Kalenderwochen hat ${esc(pname("p0"))} Paket A, in ungeraden ${esc(pname("p1"))}. Monatliche Wechsel-Aufgaben: gerader Monat ${esc(pname("p0"))}, ungerader ${esc(pname("p1"))}. Jährliche: gerades Jahr ${esc(pname("p0"))}, ungerades ${esc(pname("p1"))}.</div>
   <div class="rotlist"><div class="r0"><b>${esc(pname("p0"))}</b><ul>${li2(rp.p0)}</ul></div><div class="r1"><b>${esc(pname("p1"))}</b><ul>${li2(rp.p1)}</ul></div></div><div><button class="ghost" data-act="swap">Pakete tauschen</button></div><div class="notice" style="margin-top:8px">Ihr könnt immer gemeinsam abweichen und den Plan anpassen.</div>`);
  // Aufgaben bearbeiten (wie bisher)
  let ed=``;d.tasks.forEach((t,i)=>{const ownOpts=[["p0",d.persons[0]],["p1",d.persons[1]],["rot","Im Wechsel"],["both","Beide"],["ho","Hausdienst"]].map(([v,l])=>`<option value="${v}" ${t.owner===v?"selected":""}>${esc(l)}</option>`).join("");
    const fOpts=Object.keys(FREQ_LABEL).map(v=>`<option value="${v}" ${t.freq===v?"selected":""}>${v==="week"?"x-mal pro Woche":FREQ_LABEL[v]}</option>`).join("");
    ed+=`<div class="editrow" data-i="${i}"><div class="line"><input type="text" id="tn-${esc(t.id)}" data-f="name" value="${esc(t.name)}" aria-label="Aufgabe"><button class="ghost danger" data-del="${i}" aria-label="Löschen">✕</button></div>
      <div class="line"><select id="to-${esc(t.id)}" data-f="owner" aria-label="Wer">${ownOpts}</select><select id="tf-${esc(t.id)}" data-f="freq" aria-label="Rhythmus">${fOpts}</select>
      ${t.freq==="week"?`<label class="sm"><input type="number" min="1" max="14" id="tt-${esc(t.id)}" data-f="times" value="${t.times||1}">× </label>`:""}
      ${t.owner==="rot"&&t.freq!=="month"&&t.freq!=="year"?`<select id="tk-${esc(t.id)}" data-f="pack" aria-label="Paket"><option value="" ${!t.pack?"selected":""}>Paket automatisch</option><option value="A" ${t.pack==="A"?"selected":""}>Paket A</option><option value="B" ${t.pack==="B"?"selected":""}>Paket B</option></select>`:""}
      ${t.owner==="rot"&&group(t.freq)==="week"?`<label class="sm"><input type="number" min="0" max="50" id="tp-${esc(t.id)}" data-f="pts" value="${t.pts||0}"> Aufwand</label>`:""}</div>
      ${t.owner!=="ho"&&t.owner!=="both"&&group(t.freq)==="week"?`<div class="line"><input type="text" id="ts-${esc(t.id)}" data-f="subs" value="${esc((t.subs||[]).join(", "))}" placeholder="Teilbereiche, mit Komma (optional)" aria-label="Teilbereiche"></div>`:""}</div>`});
  h+=sec("edit","✏️ Aufgaben bearbeiten",d.tasks.length,ed+`<div class="line" style="display:flex;gap:8px;flex-wrap:wrap"><button class="ghost" data-act="add">+ Aufgabe</button><button class="primary" data-act="save">Plan speichern</button><button class="ghost" data-act="reset">Änderungen verwerfen</button></div><div class="freq" style="margin-top:6px">Namen ändert ihr in den Einstellungen unter Wir.</div>`);
  return h}
async function wmwTick(id,p){if(!S.me){toast("Wähle zuerst in den Einstellungen, wer du bist.");return}const t=tasks().find(x=>x.id===id);if(!t)return;const mon=mondayOf(new Date()),wk=wkKey(mon),tk=ticksOf(wk);let key=null;
  if(group(t.freq)!=="week"){if(!periodTick(t,mon))key=t.id+"__p"}
  else{const n=slotsOf(t),q=p==="p0"||p==="p1"?p:S.me;for(let i=0;i<n&&!key;i++){const b=t.id+"__"+i;if(t.owner==="both"){if(!tk[b+"_"+q]&&!(tk[b]&&tk[b].by===q))key=b+"_"+q}else if(!tk[b])key=b}}
  if(!key)return;try{await S.store.tick(wk,key,{by:t.owner==="both"&&(p==="p0"||p==="p1")?p:S.me,at:Date.now()});render()}catch(_){toast("Konnte nicht speichern. Bitte nochmal tippen.")}}
// ---------- Recherchen (zentral, Quer durch alles; Entwurf 15.11.2026) ----------
// Ergebnisdateien der festen Aufträge; ihr Feld "updated" ist der letzte Lauf. auftraege.json listet die Aufträge.
const RSRC=[{key:"ideen",file:"ideen.json",get:()=>S.ideas,lab:"📖 Tagesrezepte",nav:"essen|ft:rezepte",n:j=>(j.items||[]).length+(j.emmi||[]).length},
  {key:"woche",file:"wochenideen.json",get:()=>S.wideas,lab:"✨ Wochenrezepte",nav:"essen|ft:rezepte",n:j=>(j.items||[]).length},
  {key:"reise",file:"reisefunde.json",get:()=>S.rfunde,lab:"🧭 Reisen und Ausflüge",nav:"ausflug|tt:recherche",n:j=>(j.items||[]).length},
  {key:"atipp",file:"ausflugtipps.json",get:()=>S.atipps,lab:"🗓️ Was ist los (Ausflüge)",nav:"ausflug|tt:ideen",n:j=>(j.items||[]).length},
  {key:"haus",file:"hausfunde.json",get:()=>S.hfunde,lab:"🏠 Am Haus",nav:"amhaus|",n:j=>(j.items||[]).length}];
const RAREA=[["rezepte","📖","Rezepte"],["reisen","🧭","Reisen und Ausflüge"],["haus","🏠","Am Haus"],["spiel","⚽","Sport und Spiel"],["musik","🎵","Musik"],["kita","🎒","Kita"],["sonst","🔎","Sonstiges"]];
const RRHY=[["taeglich","täglich"],["woechentlich","wöchentlich"],["monatlich","monatlich"],["einmal","einmal"]];
const rArea=k=>RAREA.find(a=>a[0]===k)||RAREA[RAREA.length-1];
const rDate=u=>{const m=String(u||"").match(/(\d{4})-(\d\d)-(\d\d)/);return m?`${+m[3]}.${+m[2]}.`:""};
const rSeen=k=>{const s=S.food&&S.food.rseen&&S.food.rseen[k];return s&&s[S.me||"x"]||""};
// Neu aus der Recherche: Ergebnisdateien, deren Stand dieses Handy (bzw. diese Person) noch nicht als gesehen markiert hat
function rNew(){return RSRC.map(r=>{const j=r.get();return j&&j.updated&&r.n(j)&&rSeen(r.key)!==String(j.updated)?{...r,j}:null}).filter(Boolean)}
async function rMarkSeen(keys){for(const k of keys){const r=RSRC.find(x=>x.key===k),j=r&&r.get();if(j&&j.updated)try{await S.store.setPath("food/rseen/"+k+"/"+(S.me||"x"),String(j.updated))}catch(_){}}render()}
function rInbox(full){const L=rNew();if(!L.length)return full?`<section class="card"><div class="section-head"><h2>🤖 Neu aus der Recherche</h2></div><div class="freq">Alles gesehen. Neues erscheint hier, sobald ein Auftrag gelaufen ist.</div></section>`:"";
  return `<section class="card rinbox"><div class="section-head"><h2>🤖 Neu aus der Recherche</h2><span class="freq num">${L.length}</span></div><ul class="evlist">${L.map(r=>`<li class="rnew"><button class="dishlink" data-rgo="${r.key}"><span class="ev"><b>${r.lab}</b><span class="freq"> · ${r.n(r.j)} Vorschläge vom ${rDate(r.j.updated)}</span></span><i>›</i></button><button class="ghost" data-rseen="${r.key}" aria-label="Gesehen">✓</button></li>`).join("")}</ul><div class="btnrow" style="margin-top:6px"><button class="ghost" data-rseen="${L.map(r=>r.key).join(",")}">Alles gesehen</button></div></section>`}
const rwuensche=()=>listOf(S.food&&S.food.rwunsch).sort((a,b)=>(b.at||0)-(a.at||0));
function rWishText(w){const a=rArea(w.area),r=(RRHY.find(x=>x[0]===w.rhythm)||[0,w.rhythm||"offen"])[1];return `Bitte richte für Daheeme einen Recherche-Auftrag ein (Wunsch ${w.id}).\nBereich: ${a[2]}\nWas: ${w.what||""}\nRhythmus: ${r}${w.note?"\nNotiz: "+w.note:""}${w.task?"\nÄndert den bestehenden Auftrag: "+w.task:""}`}
async function copyText(t){try{await navigator.clipboard.writeText(t);toast("Kopiert. Jetzt Claude schicken.");return}catch(_){}S.copyBox=t;render();toast("Bitte den Text markieren und kopieren.")}
function renderResearch(){if(!S.auftrLoad){S.auftrLoad=1;try{fetch("auftraege.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S.auftr=j;if(S.tab==="recherchen")render()}}).catch(()=>{})}catch(_){}}const A=(S.auftr&&S.auftr.items)||[],W=rwuensche(),d=S.rDraft;
  let h=`<div><div class="eyebrow">Quer durch alles</div><h1>🤖 Recherchen</h1></div><div class="freq" style="margin:-4px 2px 8px">Die Ergebnisse stehen in ihren Bereichen. Hier seht ihr alle festen Aufträge, was neu ist, und könnt Neues wünschen.</div>`;
  if(S.copyBox)h+=`<section class="card"><div class="section-head"><h2>📋 Text für Claude</h2><button class="ghost" data-act="copyclose" aria-label="Schließen">✕</button></div><textarea id="rcopy" rows="7" readonly style="width:100%">${esc(S.copyBox)}</textarea></section>`;
  h+=rInbox(true);
  h+=`<section class="card"><div class="section-head"><h2>⚙️ Feste Aufträge</h2><span class="freq num">${A.length}</span></div>`;
  h+=A.length?`<ul class="evlist rauftr">${A.map(a=>{const ar=rArea(a.area),src=RSRC.find(r=>r.file===a.file),j=src&&src.get(),last=j&&j.updated?rDate(j.updated):"";
    return `<li><div class="ev"><b>${ar[1]} ${esc(a.name||"")}</b><div class="freq">${esc(ar[2])} · ${esc(a.rhythm||"")}${last?` · zuletzt ${last}`:" · noch kein Lauf"}</div>${a.what?`<div class="freq">${esc(a.what)}</div>`:""}<div class="btnrow" style="margin-top:4px">${src?`<button class="ghost" data-nav="${src.nav}">Ergebnisse ›</button>`:""}<button class="ghost" data-rchange="${esc(a.id||"")}">✎ Ändern wünschen</button></div></div></li>`}).join("")}</ul>`:`<div class="freq">Noch keine Liste geladen.</div>`;
  h+=`</section>`;
  if(d)h+=`<section class="card"><div class="section-head"><h2>${d.id?"✎ Wunsch ändern":"＋ Neuer Wunsch"}</h2></div><div class="bkform">
    <label class="fld"><span>Bereich</span><select data-rwf="area">${RAREA.map(a=>`<option value="${a[0]}"${d.area===a[0]?" selected":""}>${a[1]} ${esc(a[2])}</option>`).join("")}</select></label>
    <label class="fld"><span>Was soll gesucht werden?</span><textarea data-rwf="what" rows="3" maxlength="600" placeholder="z. B. Ferienwohnungen an der Ostsee für 4, mit Kleinkind">${esc(d.what||"")}</textarea></label>
    <label class="fld"><span>Wie oft?</span><select data-rwf="rhythm">${RRHY.map(r=>`<option value="${r[0]}"${d.rhythm===r[0]?" selected":""}>${r[1]}</option>`).join("")}</select></label>
    <label class="fld"><span>Notiz</span><input data-rwf="note" value="${esc(d.note||"")}" maxlength="200" autocomplete="off"></label>
    <div class="btnrow"><button class="primary" data-act="rwsave">Speichern</button><button class="ghost" data-act="rwcancel">Abbrechen</button></div></div></section>`;
  h+=`<section class="card"><div class="section-head"><h2>💭 Wünsche</h2>${d?"":`<button class="ghost" data-act="rwnew">＋ Wunsch</button>`}</div>`;
  h+=W.length?`<ul class="evlist rwlist">${W.map(w=>{const done=A.some(a=>a.wish===w.id),ar=rArea(w.area),r=(RRHY.find(x=>x[0]===w.rhythm)||[0,""])[1];
    return `<li><div class="ev"><b>${ar[1]} ${esc(w.what||"")}</b><div class="freq">${done?"✅ eingerichtet":"⏳ offen"}${r?" · "+r:""}${w.note?" · "+esc(w.note):""}</div><div class="btnrow" style="margin-top:4px">${done?"":`<button class="ghost" data-rwcopy="${esc(w.id)}">📋 Text für Claude kopieren</button>`}<button class="ghost" data-rwedit="${esc(w.id)}" aria-label="Ändern">✎</button><button class="ghost" data-rwdel="${esc(w.id)}" aria-label="Löschen">✕</button></div></div></li>`}).join("")}</ul>`:`<div class="freq">Noch keine Wünsche. Legt einen an, kopiert den Text und schickt ihn Claude. Sobald der Auftrag läuft, steht hier „eingerichtet“.</div>`;
  return h+`</section>`}
// ---------- Suche (Lupe in der Kopfzeile, Entwurf 15.11.2026). Partner (Mittagessen, Briefe, Kontakte) bewusst nicht. ----------
const SET_ITEMS=[["glossar","📖","Glossar: Was bedeutet was?","glossar begriffe erklärung erklaerung hilfe symbole gesten bedeutung"],["push","📲","Benachrichtigungen aufs Handy","benachrichtigung mitteilung push handy briefing glocke"],["aussehen","🎨","Hell oder dunkel","dunkel hell nacht modus farbe"],["aussehen","🏷️","Beschriftungen im Bild","beschriftung namen bild"],["aussehen","🖼️","Motiv und Bildstil","motiv bild stadt münchen tram meer aquarell stil realistisch"],
  ["bedienung","👆","Reiter unten blättern weiter","doppeltipp tippen mehrfach"],["bedienung","👆","Wischen","wischen swipe"],["bedienung","👆","Alle Bereiche (lange auf Start)","alle bereiche kacheln kreis ring sternzeichen menü fächer lang drücken"],["essen","🥗","Mehr Vegetarisches","vegetarisch veggie fleisch"],
  ["ort","🌦️","Wetter-Ort","ort wetter stadt"],["wir","🫶","Ich bin","person ich"],["wir","🫶","Namen","name namen"],["wir","🧒","Name des Kindes","kind name tochter sohn"],["wir","📮","Nummer für WhatsApp","handy telefon nummer whatsapp"],["wir","🔗","Einladungs-Link","einladen einladung link teilen schlüssel"],
  ["daten","💾","Sicherung und Wiederherstellen","sicherung backup export daten wiederherstellen"]];
const sNorm=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function searchHits(q){const W=sNorm(q).split(/\s+/).filter(Boolean);if(!W.length)return [];const F=S.food||{},H=[];
  const add=(grp,ic,name,sub,attr,extra)=>{const t=sNorm(name+" "+(sub||"")+" "+(extra||""));if(W.every(w=>t.includes(w)))H.push({grp,ic,name,sub,attr})};
  AREAS.forEach(a=>{if(a[2]==="camp")return;add("Bereiche",a[0],a[1],"",`data-nav="${a[2]}|"`);a[5]().forEach(x=>add("Bereiche",a[0],x[0],a[1],`data-nav="${a[2]}|${x[1]}"`))});
  add("Bereiche","📅","Kalender","Woche",'data-nav="woche|wp:3"');add("Bereiche","⚙️","Einstellungen","",'data-go="settings"');
  SET_ITEMS.forEach(x=>add("Einstellungen",x[1],x[2],"Einstellungen",`data-setgo="${x[0]}"`,x[3]));glosSearch(add);
  recs().forEach(r=>add("Rezepte","📖",r.name,"Rezept",`data-openrec="${esc(r.id)}"`,(r.ing||"")+" "+(r.tags||[]).join(" ")));
  ((S.ideas&&S.ideas.items)||[]).concat((S.ideas&&S.ideas.emmi)||[]).forEach(x=>add("Rezepte","✨",x.name,"Tagesrezept",'data-nav="essen|ft:rezepte"',(x.ing||[]).join(" ")));
  Object.keys(F.plan||{}).forEach(wk=>{if(wk<wkKey(mondayOf(addDays(new Date(),-14))))return;Object.keys(F.plan[wk]||{}).forEach(d=>{const x=F.plan[wk][d];if(x&&x.text)add("Wochenplan","🍲",x.text,wk.replace(/^\d+-W/,"KW ")+" · "+(DAYN[+d.slice(1)]||""),'data-nav="essen|ft:plan"')})});
  listOf(F.shop).filter(x=>!x.done).forEach(x=>add("Einkaufsliste","🧺",x.name,"Einkaufsliste"+(x.src?" · "+x.src:""),'data-go="einkauf"'));
  packs().filter(x=>!x.done).forEach(x=>add("Packlisten","🧳",x.name,"Packliste",'data-nav="ausflug|tt:pack"'));
  kitas().forEach(x=>add("Kita","🎒",x.name,"Kita"+(x.date?" · "+x.date.split("-").reverse().slice(0,2).join("."):""),`data-nav="kita|ks:${esc(x.sec||"termine")}"`,x.note));
  advCals().forEach(c=>{add("Ideen","🎄",c.name,"Adventskalender "+(c.year||""),`data-advgo="${esc(c.id)}"`);Object.values(advDoors(c.id)).forEach(x=>{if(!advHidden(c,x.day))add("Ideen","🎄",x.name,"Adventskalender · Türchen "+x.day,`data-advgo="${esc(c.id)}"`)})});
  termine().forEach(x=>add("Kalender","📅",x.name,(x.date?x.date.split("-").reverse().join("."):"")+(x.time?" "+x.time:""),'data-nav="woche|wp:3"',x.note));
  buyLists().forEach(L=>add("Bereiche",L.emo,L.name,"Weitere Listen",`data-nav="listen|bl:${esc(L.id)}"`));
  buys().forEach(x=>{const L=buyLists().find(l=>l.id===x.list);if(!L||x.done)return;add("Einkauf",L.emo,x.name,"Weitere Listen · "+L.name,`data-nav="listen|bl:${esc(L.id)}"`)});
  // Ausgaben und Gruppen (Florian 16.11.2026, Punkt 6)
  monies().forEach(x=>{const c=geldCat(x.cat);add("Ausgaben",x.kind==="settle"?"🤝":c[1],x.name,eur(x.amt)+" · "+(x.date?x.date.split("-").reverse().join("."):"")+(x.grp?" · "+grpName(x.grp):""),`data-go="ausgaben" data-geldedit="${esc(x.id)}"`,x.note)});
  mgroups().forEach(g=>add("Ausgaben",g.emo||"💶",g.name,"Gruppe in Ausgaben"+(g.closed?" · abgeschlossen":""),`data-go="ausgaben" data-geldgrp="${esc(g.id)}"`));
  fixes().forEach(x=>add("Ausgaben","🔁",x.name,"Feste Zahlung · "+eur(x.amt),`data-go="ausgaben" data-gtab="fest"`,x.note));
  prios().forEach(x=>{if(x.from==="mittag")return;add("Wichtig","🔔",x.name,"Erinnerung"+(x.due?" · "+x.due.split("-").reverse().slice(0,2).join("."):""),'data-go="wichtig"',x.note)});
  listOf(F.idea).forEach(x=>{const c=x.cat==="spiel"?"sonst":x.cat||"sonst",haus=["wohnen","ordnung","haus","garten"].includes(c),pc=projCats().find(p=>p[0]===c);add(haus?"Am Haus":"Ideen",pc?pc[1]:"💡",x.name,pc?pc[2]:"",`data-nav="${haus?"amhaus":"projekte"}|pf:${esc(c)}"`,x.note)});
  hprojs().forEach(x=>add("Am Haus",x.emo||"🏠",x.name,"Projekt",`data-hproj="${esc(x.id)}"`,x.note));
  urlaube().forEach(x=>add("Reisen und Ausflüge",x.emo||"⛵",x.name,"Urlaub"+(x.place?" · "+x.place:""),`data-reise="${esc(x.id)}"`,x.note));
  trips().forEach(x=>add("Reisen und Ausflüge","🚲",x.name,"Ausflug",'data-nav="ausflug|tt:ideen"',x.note));
  listOf(F.fund).forEach(x=>{const h=x.area==="haus";add(h?"Am Haus":"Reisen",h?"🛋️":"📍",x.name,(h?"Sammlung Am Haus":"Sammlung Reisen und Ausflüge")+(x.place?" · "+x.place:""),h?(x.proj?`data-hproj="${esc(x.proj)}"`:'data-nav="amhaus|"'):(x.reise?`data-reise="${esc(x.reise)}"`:'data-nav="ausflug|tt:recherche"'),x.note)});
  plays().forEach(x=>add("Sport und Spiel","⚽",x.name,(playSecs().find(p=>p[0]===x.sec)||[0,0,"Sonstiges"])[2],`data-nav="spiel|ps:${esc(x.sec||"sonst")}"`,x.note));
  musics().forEach(x=>add("Musik","🎵",x.name,"Playlist",'data-nav="musik|"',x.note));
  return H}
function renderSearch(){const q=S.sq||"",H=searchHits(q);
  let h=`<div><div class="eyebrow">Quer durch alles</div><h1>🔍 Suche</h1></div><section class="card"><input id="sq" type="search" value="${esc(q)}" placeholder="Rezept, Termin, Idee, Einstellung …" autocomplete="off" enterkeyhint="search" aria-label="Suchen" style="width:100%"></section>`;
  if(!q.trim())return h+`<div class="freq" style="margin:0 4px">Sucht in Bereichen, Einstellungen, Glossar, Rezepten, Wochenplan, Einkaufsliste, Packlisten, Kita, Kalender, Wichtig, Ideen, Am Haus, Reisen und Ausflüge, Sport und Spiel und Musik. Partner bleibt privat.</div>`;
  if(!H.length)return h+`<div class="empty"><h2>Nichts gefunden</h2><div>Probiert ein anderes Wort.</div></div>`;
  const G=[];H.forEach(x=>{let g=G.find(y=>y[0]===x.grp);if(!g)G.push(g=[x.grp,[]]);g[1].push(x)});
  return h+G.map(g=>`<section class="card"><div class="section-head"><h2>${esc(g[0])}</h2><span class="freq num">${g[1].length}</span></div>${g[1].slice(0,12).map(x=>`<button class="todayrow" ${x.attr}><span>${x.ic}</span><span>${esc(x.name)}${x.sub?`<span class="freq"> · ${esc(x.sub)}</span>`:""}</span><i>›</i></button>`).join("")}${g[1].length>12?`<div class="freq">und ${g[1].length-12} weitere, genauer suchen</div>`:""}</section>`).join("")}
function render(){
  if(S.mode==="loading")return;
  if(S.tab==="reisen"){S.tab="ausflug";S.tripTab="urlaub"} // Reisen und Ausflüge sind ein Bereich
  // Umbau 16.11.2026 (Florian): Start = Haus | Kalender | Wichtig; Woche = Tag und Woche | Wer macht was. Kalender bleibt intern Woche/Seite 3.
  if(S.tab==="tag"){S.tab="woche";S.weekPage=0;S.view=mondayOf(new Date());S.wkEdit=null}
  if(S.tab==="kalender"){S.tab="woche";S.weekPage=3}
  document.querySelectorAll("#tabs button").forEach(b=>{b.setAttribute("aria-selected",(b.dataset.tab===S.tab&&!(S.tab==="woche"&&(S.weekPage|0)===3))||(b.dataset.tab==="camp"&&(S.tab==="wichtig"||(S.tab==="woche"&&(S.weekPage|0)===3)))||(b.dataset.tab==="einkauf"&&(S.tab==="listen"||S.tab==="ausgaben")));if(b.dataset.tab==="ausflug")b.hidden=true;if(b.dataset.tab==="einkauf")b.hidden=false});
  let h="";
  if(S.mode==="local")h+=`<div class="notice">Offline-Modus: Die Daten bleiben nur auf diesem Gerät. Öffnet die App über den claude.ai-Link und meldet euch an, damit ihr beide dieselben Daten seht.</div>`;
  if(S.timedOut&&S.mode==="db")h+=`<div class="notice">Die gemeinsamen Daten sind gerade nicht erreichbar. Angezeigtes kann veraltet sein.</div>`;
  if(!S.config&&!S.cfgConfirmed&&!S.timedOut){app.innerHTML=h+`<div class="empty">Plan wird geladen …</div>`;return}
  if(!S.config){h+=`<div class="empty"><h2>Noch kein Haushaltsplan hinterlegt</h2><div>Legt euren Plan aus der Vorlage an (eure Liste mit Müll, Saugen, Wäsche und Co.). Danach könnt ihr alles unter „Plan“ anpassen.</div><button class="primary" data-act="template">Plan aus Vorlage anlegen</button></div>`;app.innerHTML=h;return}
  h+=`<div class="appbar"><span class="appleft"><button class="iconbtn bellnav" data-go="wichtig" aria-label="Wichtig: alle Erinnerungen">🔔${(n=>n?`<b class="badge">${n}</b>`:"")(bellItems().n)}</button></span><span class="appleft"><button class="iconbtn" data-go="suche" aria-label="Suche"${S.tab==="suche"?' aria-pressed="true"':""}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg></button><button class="iconbtn" data-go="settings" aria-label="Einstellungen"${S.tab==="settings"?' aria-pressed="true"':""}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg></button><button class="iconbtn" data-allar aria-label="Alle Bereiche"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg></button></span></div>`;
  h+=S.tab==="ausgaben"?shopPager(1)+renderGeld():S.tab==="listen"?shopPager(0)+renderBuy():S.tab==="wichtig"&&!S.prioDraft?startPager(2)+renderWichtig():S.tab==="bereiche"?renderAreas():S.tab==="settings"?renderSettings():S.tab==="wichtig"?renderWichtig():S.tab==="woche"?((S.weekPage|0)===3?startPager(1)+renderCal():weekPager()+((S.weekPage|0)===0?(+S.view===+mondayOf(new Date())?renderTag():"")+renderWeek():renderWmw())):S.tab==="camp"?renderCamp():S.tab==="essen"||S.tab==="einkauf"?renderFood():S.tab==="ausflug"?renderTrips():S.tab==="projekte"||S.tab==="amhaus"?renderProjects():S.tab==="spiel"?renderPlay():S.tab==="musik"?renderMusic():S.tab==="recherchen"?renderResearch():S.tab==="suche"?renderSearch():S.tab==="kita"?renderKita():S.tab==="privat"?wirPager(0)+renderPrivat():S.tab==="kind"?wirPager(1)+renderKind():S.tab==="post"?(S.tab="privat",S.privSec="briefe",wirPager(0)+renderPrivat()):S.tab==="reisen"?renderTrips():renderCamp();
  const y=window.scrollY,ae=document.activeElement,fid=ae&&app.contains(ae)&&ae.id?ae.id:null,sel=fid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  h+=renderPick();app.innerHTML=h;window.scrollTo(0,y);syncNav();
  if(fid){const el=document.getElementById(fid);if(el){el.focus({preventScroll:true});if(sel){try{el.setSelectionRange(sel[0],sel[1])}catch(_){}}}}
}

