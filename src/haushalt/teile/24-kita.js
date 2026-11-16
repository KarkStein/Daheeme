const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dLabel=s=>{const d=new Date(s+"T12:00:00");return isNaN(d)?s:d.toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"numeric"})};
function kitaNext(days){const today=ymd(new Date()),lim=ymd(addDays(new Date(),days));return kitas().filter(x=>x.sec==="termine"&&x.date&&x.date>=today&&x.date<=lim).sort((a,b)=>a.date<b.date?-1:1)[0]}
function renderKitaMeals(){let h="";const mon=planWeek(),km=kitaMeals(mon),isCur=+mon===+mondayOf(new Date()),dm=x=>x.getDate()+"."+(x.getMonth()+1)+".";
    h+=`<div class="section-head" style="align-items:center"><div><h2>KW ${isoWeek(mon).w}</h2><div class="freq">${dm(mon)} bis ${dm(addDays(mon,4))}</div></div><div class="weeknav"><button class="iconbtn" data-fnav="-1" aria-label="Vorige Woche">‹</button>${isCur?"":`<button class="ghost" data-fnav="0">Heute</button>`}<button class="iconbtn" data-fnav="1" aria-label="Nächste Woche">›</button></div></div>`;
    const KM=[["fr","🥣","Frühstück"],["text","🍽️","Mittag"],["bz","🥨","Brotzeit"]],todayI=isCur?(new Date().getDay()+6)%7:-1,any=[0,1,2,3,4].some(i=>{const x=km["d"+i]||{};return x.text||x.fr||x.bz||x.na});
    if(S.kitaEdit){h+=`<section class="card tripform"><h2>✏️ Kita-Essen bearbeiten</h2>${DAYN.slice(0,5).map((dn,i)=>{const x=km["d"+i]||{},f=(k,id,l,ph)=>`<label class="fld"><span>${l}</span><input type="text" id="${id}${i}" value="${esc(x[k]||"")}" maxlength="120" placeholder="${ph}" autocomplete="off"></label>`;
        return `<div class="kmedit"><h3>${dn} ${dm(addDays(mon,i))}</h3>${f("fr","ke-fr","🥣 Frühstück","")}${f("text","ke-d","🍽️ Mittag","Was gibt es in der Kita?")}${f("na","ke-na","🍮 Nachspeise","")}${f("bz","ke-bz","🥨 Brotzeit","")}</div>`}).join("")}
      <div class="btnrow"><button class="primary" data-act="kitamealsave">Speichern</button><button class="ghost" data-act="kitamealedit">Abbrechen</button></div></section>`}
    else if(any){h+=`<div class="kmweek">${DAYN.slice(0,5).map((dn,i)=>{const x=km["d"+i]||{},past=isCur&&i<todayI||+mon<+mondayOf(new Date());
        const row=([k,e,l])=>`<div class="kmrow"><span class="kmic" aria-hidden="true">${e}</span><div><div class="kml">${l}${k==="text"&&x.text?` <span class="kmlink" title="Erscheint auch im Wochenplan">↔ Wochenplan</span>`:""}</div><div class="kmv">${x[k]?esc(x[k]):`<span class="freq">–</span>`}${k==="text"&&x.na?`<div class="kmna">🍮 ${esc(x.na)}</div>`:""}</div></div></div>`;
        return `<section class="card kmday${i===todayI?" today":""}${past?" past":""}"><div class="kmhead"><b>${dn}</b><span class="freq">${dm(addDays(mon,i))}</span>${i===todayI?`<span class="kmtoday">Heute</span>`:""}</div><div class="kmgrid">${KM.map(row).join("")}</div></section>`}).join("")}</div>
      <div class="btnrow"><button class="ghost" data-act="kitamealedit">✏️ Bearbeiten</button></div><div class="freq">Das Mittagessen erscheint auch im Wochenplan, damit ihr abends nicht dasselbe kocht.</div>`}
    else h+=`<div class="empty"><h2>Noch kein Kita-Essen für diese Woche</h2><div>Speiseplan unten einfügen oder <button class="ghost" data-act="kitamealedit">✏️ von Hand eintragen</button></div></div>`;
    h+=`<section class="card"><h2>Speiseplan einfügen</h2><div class="freq">Den Plan aus der Kita-App kopieren und hier einfügen. Die App erkennt Woche, Tage, Frühstück, Mittag, Nachspeise und Brotzeit und lässt die Kürzel in Klammern weg.</div><textarea id="kitaplantext" rows="4" placeholder="Speiseplan 16.11. - 20.11. …" aria-label="Speiseplan einfügen"></textarea><div class="btnrow"><button class="primary" data-act="kitaplanimport">Übernehmen</button></div></section>`;
    return h}
function renderKita(){const d=S.kitaDraft,sec=KITA_SECS.find(s=>s[0]===S.kitaSec)||KITA_SECS[0];
  let h=`<div><div class="eyebrow">Mit dem Rucksack</div><h1>Kita</h1></div>${bellRow("kita")}<div class="unl">${KITA_SECS.map(s=>`<button class="chipbtn" data-kitasec="${s[0]}" aria-pressed="${s[0]===sec[0]}">${s[1]} ${s[2]}</button>`).join("")}</div>`;
  if(d)return h+`<section class="card tripform"><h2>${d.id?"Bearbeiten":sec[0]==="termine"?"Neuer Termin":"Neue Info"}</h2>
    <label class="fld"><span>${sec[0]==="termine"?"Was?":"Titel"}</span><input type="text" id="ki-name" data-kf="name" value="${esc(d.name)}" maxlength="80" placeholder="${sec[0]==="termine"?"Zum Beispiel Laternenfest":"Zum Beispiel Abholberechtigte"}" autocomplete="off"></label>
    ${sec[0]==="termine"?`<label class="fld"><span>Wann?</span><input type="date" id="ki-date" data-kf="date" value="${esc(d.date)}"></label><div class="fld"><span>Art</span><div class="unl">${[["fest","🎉 Fest"],["zu","🚪 Kita zu"],["eltern","👥 Elternabend"],["mit","📦 Etwas mitbringen"]].map(c=>`<button class="chipbtn" data-kset="kind" data-v="${c[0]}" aria-pressed="${d.kind===c[0]}">${c[1]}</button>`).join("")}</div></div>`:""}
    <label class="fld"><span>Notiz</span><textarea id="ki-note" data-kf="note" rows="${sec[0]==="infos"?6:3}" placeholder="${sec[0]==="termine"?"Uhrzeit, was mitbringen":"Telefonnummern, Namen der Erzieherinnen, Regeln"}">${esc(d.note)}</textarea></label>
    <div class="btnrow"><button class="primary" data-act="kitasave">Speichern</button><button class="ghost" data-act="kitacancel">Abbrechen</button>${d.id?`<button class="ghost danger" data-act="kitadel">Löschen</button>`:""}</div></section>`;
  const all=kitas().filter(x=>(x.sec||"termine")===sec[0]);
  if(sec[0]==="termine"){const today=ymd(new Date()),up=all.filter(x=>!x.date||x.date>=today).sort((a,b)=>(a.date||"9")<(b.date||"9")?-1:1),past=all.filter(x=>x.date&&x.date<today).sort((a,b)=>a.date<b.date?1:-1);
    const KI={fest:"🎉",zu:"🚪",eltern:"👥",mit:"📦"};
    const li=x=>`<li><button class="item" data-kitaedit="${esc(x.id)}"><span class="box" style="border:none;font-size:1.1rem">${KI[x.kind]||"📅"}</span><span class="nm">${esc(x.name)}<br><span class="freq">${x.date?esc(dLabel(x.date)):"ohne Datum"}${x.note?" · "+telNote(x.note):""}</span></span></button>${telA(x.note)}${bell("kita",x)}</li>`;
    h+=`<div class="btnrow"><button class="primary" data-act="kitanew">+ Neuer Termin</button><button class="ghost" data-act="kitaimp">📋 Termine einfügen</button></div>`;
    if(S.kitaImp)h+=kitaImpCard();
    h+=up.length?`<section class="card"><div class="section-head"><h2>Kommt noch</h2><span class="freq num">${up.length}</span></div><ul class="shop">${up.map(li).join("")}</ul><div class="freq">Termine in den nächsten 7 Tagen stehen auch auf der Startseite unter „Heute“.</div></section>`
      :`<div class="empty"><h2>Keine Termine</h2><div>Tragt Feste, Schließtage und Elternabende ein. Ihr seht beide dieselbe Liste.</div></div>`;
    // Kita-Termine aus dem Kalender (Florian 16.11.2026): eigene Termine mit Art Kita und Familywall-Termine (Art Kita oder Kita/Kinderhaus im Titel)
    {const ce=calEvents(today,ymd(addDays(new Date(),120))).filter(e=>e.tag==="kita"&&(e.src==="own"||e.src==="ext"));
     if(ce.length)h+=`<section class="card"><div class="section-head"><h2>📅 Aus dem Kalender</h2><span class="freq num">${ce.length}</span></div><ul class="evlist">${ce.map(e=>evRow(e,true)).join("")}</ul><div class="freq">Termine mit der Art Kita, auch aus Familywall. Ändern im Termin.</div></section>`}
    if(past.length)h+=`<section class="card"><div class="section-head"><h2>Vorbei</h2><span class="freq num">${past.length}</span></div><ul class="shop">${past.slice(0,10).map(li).join("")}</ul></section>`;
    return h}
  if(sec[0]==="essen")return h+renderKitaMeals();
  if(sec[0]==="tasche"){const items=all.sort((a,b)=>(a.at||0)-(b.at||0)),have=new Set(items.map(i=>i.name.toLowerCase())),bring=items.filter(i=>!i.done),da=items.filter(i=>i.done),mt=kitaMitTermine();
    const pr=prios().find(x=>x.ref==="kitabag");
    const liB=i=>`<li><button class="item" data-kitatick="${esc(i.id)}" aria-pressed="false" aria-label="${esc(i.name)} mitgebracht"><span class="box"></span><span class="nm">${esc(i.name)}${onShop(i.name)?`<br><span class="freq">🧺 steht auf der Einkaufsliste</span>`:""}</span></button>${onShop(i.name)?`<button class="catbtn" data-nav="einkauf|" aria-label="Zur Einkaufsliste">🧺</button>`:`<button class="catbtn" data-kitashop="${esc(i.id)}" aria-label="${esc(i.name)} auf die Einkaufsliste">🛒</button>`}${bell("kita",i)}<button class="rm" data-kitarm="${esc(i.id)}" aria-label="${esc(i.name)} entfernen">✕</button></li>`;
    const liD=i=>`<li><button class="item" data-kitatick="${esc(i.id)}" aria-pressed="true" aria-label="${esc(i.name)} wird knapp, wieder mitbringen"><span class="box">✓</span><span class="nm">${esc(i.name)}</span></button><button class="ghost small" data-kitatick="${esc(i.id)}">⚠️ Wird knapp</button></li>`;
    h+=`<form class="addrow" id="kitaform" novalidate><input type="text" id="kitainput" placeholder="Was muss mit in die Kita?" value="${esc(S.kitaText)}" autocomplete="off" enterkeyhint="done" aria-label="Gegenstand"><button class="primary" type="submit">Hinzufügen</button></form>`;
    h+=`<section class="card"><div class="section-head"><h2>📦 Mitbringen</h2><span class="freq num">${bring.length+mt.length}</span></div>`;
    if(mt.length)h+=`<ul class="shop">${mt.map(x=>`<li><button class="item" data-kitaedit="${esc(x.id)}"><span class="box" style="border:none">📅</span><span class="nm">${esc(x.name)}${x.note?" · "+telNote(x.note):""}<br><span class="freq">für ${esc(dLabel(x.date))}</span></span></button></li>`).join("")}</ul>`;
    h+=bring.length?`<ul class="shop">${bring.map(liB).join("")}</ul><div class="btnrow"><button class="ghost" data-act="kitashopall">🛒 Auf die Einkaufsliste</button><button class="ghost" data-act="kitaremind">${pr?"⏰ Erinnerung steht ("+esc(dLabel(pr.due))+")":"⏰ Morgen früh erinnern"}</button></div><div class="freq">Kästchen heißt mitgebracht. Dann wandert es nach unten zu „Liegt in der Kita“.</div>`
      :mt.length?"":`<div class="freq">Nichts mitzubringen. Tippt unten Vorschläge an oder schreibt oben etwas dazu.</div>`;
    h+=`</section>`;
    h+=suggBlock("kita",new Set(bring.map(i=>i.name.toLowerCase())),"data-kitaadd");
    if(da.length)h+=`<section class="card"><div class="section-head"><h2>✅ Liegt in der Kita</h2><span class="freq num">${da.length}</span></div><ul class="shop">${da.map(liD).join("")}</ul><div class="freq">Wird etwas knapp, tippt „⚠️ Wird knapp“. Dann steht es wieder bei Mitbringen.</div></section>`;
    return h}
  const li=x=>`<section class="card"><div class="section-head"><h2>${esc(x.name)}</h2><span style="display:flex;gap:4px;align-items:center">${bell("kita",x)}<button class="ghost" data-kitaedit="${esc(x.id)}">Bearbeiten</button></span></div>${x.note?`<div style="white-space:pre-wrap">${telNote(x.note,true)}</div>`:""}</section>`;
  h+=`<div class="btnrow"><button class="primary" data-act="kitanew">+ Neue Info</button></div>`;
  h+=all.length?all.sort((a,b)=>(a.name||"").localeCompare(b.name||"","de")).map(li).join(""):`<div class="empty"><h2>Noch keine Infos</h2><div>Zum Beispiel Telefonnummer der Gruppe, Namen der Erzieherinnen, wer abholen darf.</div></div>`;
  return h}

// Termine einfügen (Florian 15.11.2026, Kigaroo exportiert nur einzelne Termine): Text aus PDF/Nachricht oder Termin-Datei (.ics) → Vorschau → übernehmen
function kitaKindGuess(t){t=String(t||"");return /elternabend|elterngespr|\bEA\b/i.test(t)?"eltern":/geschlossen|schließtag|kita zu|kinderhaus zu|brückentag/i.test(t)?"zu":/mitbring|spielzeugtag|mitnehmen/i.test(t)?"mit":/fest|feier|party|fasching|markt|show|ausflug|basteln/i.test(t)?"fest":""}
function icsUnfold(t){return String(t).replace(/\r?\n[ \t]/g,"")}
function parseKitaTermine(text){const out=[],t=String(text||"");
  if(/BEGIN:VEVENT/i.test(t)){icsUnfold(t).split(/BEGIN:VEVENT/i).slice(1).forEach(b=>{const g=k=>{const m=b.match(new RegExp("^"+k+"[^:\\n]*:(.*)$","mi"));return m?m[1].trim().replace(/\\,/g,",").replace(/\\n/gi," ").replace(/\\;/g,";"):""};
      const ds=g("DTSTART"),de=g("DTEND"),name=g("SUMMARY").slice(0,80);const m=ds.match(/(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d))?/);if(!m||!name)return;
      const date=m[1]+"-"+m[2]+"-"+m[3],tm=m[4]?m[4]+":"+m[5]:"",loc=g("LOCATION");let to="";const e=de.match(/(\d{4})(\d\d)(\d\d)(T)?/);
      if(e){let k=e[1]+"-"+e[2]+"-"+e[3];if(!e[4])k=ymd(addDays(ymdD(k),-1));if(k>date)to=k}
      if(to){for(let d=ymdD(date);ymd(d)<=to&&out.length<200;d=addDays(d,1))out.push({date:ymd(d),name,kind:kitaKindGuess(name),note:[tm&&ymd(d)===date?tm+" Uhr":"",loc].filter(Boolean).join(" · ")})}
      else out.push({date,name,kind:kitaKindGuess(name),note:[tm?tm+" Uhr":"",loc].filter(Boolean).join(" · ")})});return out}
  const now=new Date(),yr=(d,m)=>{let y=now.getFullYear();if(ymd(new Date(y,m-1,d,12))<ymd(addDays(now,-60)))y++;return y};
  t.split(/\r?\n/).forEach(l=>{const m=l.match(/(\d{1,2})\.\s?(\d{1,2})\.(\d{2,4})?(?:\s*(?:-|–|bis)\s*(\d{1,2})\.\s?(\d{1,2})\.(\d{2,4})?)?/);if(!m)return;
    let name=l.replace(m[0],"").replace(/^[\s,:;–-]+|[\s,:;–-]+$/g,"").replace(/^(mo|di|mi|do|fr|sa|so)\.?,?\s+/i,"").trim().slice(0,80);if(!name)return;
    const Y=x=>x?(x.length===2?2000+ +x:+x):0,d1=+m[1],m1=+m[2],y1=Y(m[3])||yr(d1,m1),date=ymd(new Date(y1,m1-1,d1,12));if(!/^\d{4}-\d\d-\d\d$/.test(date)||m1>12||d1>31)return;
    const tm=(l.match(/(\d{1,2})[:.](\d{2})\s*uhr/i)||[]),note=tm[0]?tm[1]+":"+tm[2]+" Uhr":"";
    name=name.replace(/,?\s*(um\s*)?\d{1,2}[:.]\d{2}\s*uhr/i,"").trim()||name;
    if(m[4]){let to=ymd(new Date(Y(m[6])||y1,+m[5]-1,+m[4],12));if(to<date)to=ymd(new Date(y1+1,+m[5]-1,+m[4],12));for(let d=ymdD(date);ymd(d)<=to&&out.length<200;d=addDays(d,1))if(d.getDay()%6)out.push({date:ymd(d),name,kind:kitaKindGuess(name),note})}
    else out.push({date,name,kind:kitaKindGuess(name),note})});return out}
function kitaImpCard(){const I=S.kitaImp,KI={fest:"🎉",zu:"🚪",eltern:"👥",mit:"📦"};
  if(!I.list)return `<section class="card"><div class="section-head"><h2>📋 Termine einfügen</h2></div><div class="freq">Text aus dem Kita-Kalender, einer PDF oder Nachricht einfügen (je Zeile ein Termin mit Datum, z. B. „12.11. St.-Martin-Fest“) oder eine Termin-Datei (.ics) aus Kigaroo wählen.</div>
    <label class="fld"><textarea id="kimp-text" rows="5" placeholder="12.11. St.-Martin-Fest&#10;28.12.–5.1. Kita geschlossen">${esc(I.text||"")}</textarea></label><label class="fld"><span>Oder Termin-Datei</span><input type="file" id="kimp-file" accept=".ics,text/calendar"></label>
    <div class="btnrow"><button class="primary" data-act="kimpparse">Erkennen</button><button class="ghost" data-act="kimpcancel">Abbrechen</button></div></section>`;
  const n=I.list.filter(x=>x.on).length;
  return `<section class="card"><div class="section-head"><h2>📋 ${I.list.length} erkannt</h2><span class="freq">${n} ausgewählt</span></div>${I.list.length?`<ul class="shop">${I.list.map((x,i)=>`<li class="${x.on?"":"done"}"><button class="item" data-kimptog="${i}" aria-pressed="${x.on}"><span class="box">${x.on?"✓":""}</span><span class="nm">${KI[x.kind]||"📅"} ${esc(x.name)}<br><span class="freq">${esc(dLabel(x.date))}${x.note?" · "+telNote(x.note):""}${x.dup?" · steht schon drin":""}</span></span></button></li>`).join("")}</ul>`:`<div class="freq">Kein Termin mit Datum gefunden.</div>`}
    <div class="btnrow">${n?`<button class="primary" data-act="kimpsave">${n} übernehmen</button>`:""}<button class="ghost" data-act="kimpback">Zurück</button><button class="ghost" data-act="kimpcancel">Abbrechen</button></div></section>`}
