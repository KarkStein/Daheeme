// ---------- Rendering ----------
const app=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function ownerChip(o,isRot){const cls=o==="p0"||o==="p1"?o:o;const lbl=o==="p0"||o==="p1"?pname(o):OWNER_LABEL[o];
  return `<span class="owner ${cls}">${isRot?"↻ ":""}${esc(lbl)}</span>`}
function meChooser(){return `<div class="me"><span>Ich bin</span>
  <button class="chipbtn p0" data-me="p0" aria-pressed="${S.me==="p0"}">${esc(pname("p0"))}</button>
  <button class="chipbtn p1" data-me="p1" aria-pressed="${S.me==="p1"}">${esc(pname("p1"))}</button></div>`}
// Wochenring im Dashboard (Florian 15.11.2026, ersetzt den Fotoplatz): Stand der Wechsel-Aufgaben dieser Woche
function rotCount(mon){const split=rotSplit(),tk=ticksOf(wkKey(mon));let d=0,n=0;
  tasks().forEach(t=>{if(group(t.freq)!=="week"||t.owner!=="rot")return;const k=slotsOf(t);for(let i=0;i<k;i++){d+=tk[t.id+"__"+i]?1:0;n++}});return [d,n]}
// Ein Bauplan für beide Kopfblöcke (Tag und Woche, Diese Woche; Florian 15.11.2026): Kopf (Zeile, Titel, Unterzeile, Ring rechts), Inhalt, Zähler-Kacheln, Fuß
function panelRing(d,n,lbl,attr){const r=22,c=2*Math.PI*r,p=n?Math.min(1,d/n):0;
  return `<button class="bring" ${attr}><svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="${r}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="6"/><circle cx="27" cy="27" r="${r}" fill="none" stroke="var(--lemon)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-p)).toFixed(1)}" transform="rotate(-90 27 27)"/></svg><span class="num">${d}/${n}</span><small>${lbl}</small></button>`}
const panelTile=(n,lab,attr)=>`<button class="bcnt" ${attr||""}><b class="num">${n}</b><span>${lab}</span></button>`;
function panelHead(eye,title,sub,right){return `<div class="brim"></div><div class="btop"><div class="bhead"><div class="bday">${eye}</div><div class="bdate">${title}</div>${sub?`<div class="bsub">${sub}</div>`:""}</div>${right||""}</div>`}
function bweekRing(){const [d,n]=rotCount(mondayOf(new Date()));if(!n)return "";return panelRing(d,n,"Woche",`data-go="woche" aria-label="Wochenstand: ${d} von ${n} Wechsel-Aufgaben erledigt"`)}
function ring(p){const r=36,c=2*Math.PI*r;const off=c*(1-Math.min(1,p));
  return `<svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${r}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="8"/><circle cx="42" cy="42" r="${r}" fill="none" stroke="var(--lemon)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`}

function scopeSwitch(extra){return `<div class="filters" role="group" aria-label="Ansicht"><button class="chipbtn neutral" data-filter="alle" aria-pressed="${S.filter==="alle"}">Alle</button><button class="chipbtn neutral" data-filter="meine" aria-pressed="${S.filter==="meine"}">Mein Bereich</button>${extra||""}</div>${S.filter==="meine"&&!S.me?`<div class="notice">Wähle oben aus, wer du bist, damit „Mein Bereich“ funktioniert.</div>`:""}`}
const WEEK_PAGES=["Diese Woche","Wer macht was","Wer macht was","Kalender"],WEEK_ORDER=[0,3,1];
function weekPager(){const p=(S.weekPage|0)===2?1:S.weekPage|0,o=WEEK_ORDER.indexOf(p);return `<div class="pager" role="group" aria-label="Seiten in Woche"><div class="pdots">${WEEK_ORDER.map(i=>`<button class="pdot" data-wpage="${i}" aria-pressed="${i===p}" aria-label="${WEEK_PAGES[i]}"><b>${i===0?"Woche":WEEK_PAGES[i]}</b></button>`).join("")}</div></div>`}
function setWeekPage(n){n=((n%4)+4)%4;if(n===2)n=1;if(n===(S.weekPage|0))return;if((S.weekPage|0)===1)S.draft=null;S.weekPage=n;render();window.scrollTo(0,0)}
// Kalender (Woche › Kalender): sammelt Termine aus allen Quellen. Weitere Quellen (z. B. ein echter Kalender) kommen als Funktion in CAL_SRC dazu.
const termine=()=>listOf(S.food&&S.food.termin);
try{S.calOff=JSON.parse(localStorage.getItem("hq-caloff")||"[]")}catch(_){}
const CAL_COL={own:"var(--ink)",kita:"#c7442f",prio:"#e0a030",ext:"#3f6fa8",food:"#8aa38b",reise:"#2f8fa3",trip:"#6a9a3a",play:"#8a5cc2",advent:"#2e7d4f",frei:"#b8862b"};
// Filter-Chips im Kalender: Quelle -> [Symbol, Name]
const CAL_LBL=[["own","📅","Termine"],["kita","🎒","Kita"],["prio","🔔","Erinnerungen"],["food","🍲","Essen"],["reise","⛵","Urlaub"],["trip","🚲","Ausflüge"],["play","⚽","Sport"],["advent","🎄","Advent"],["ext","👪","Familywall"],["frei","🎉","Ferien und Feiertage"]];
const WD_RX=[["so","sonntag"],["mo","montag"],["di","dienstag"],["mi","mittwoch"],["do","donnerstag"],["fr","freitag"],["sa","samstag"]];
function whenDays(t){t=" "+String(t||"").toLowerCase()+" ";const out=[];WD_RX.forEach((w,i)=>{if(new RegExp("[\\s,(/]("+w[1]+"s?|"+w[0]+"\\.?)(?=[\\s,/)]|$)").test(t))out.push(i)});return out}
function whenTime(t){const m=String(t||"").match(/(\d{1,2})(?:[:.](\d{2}))?\s*uhr|(\d{1,2})[:.](\d{2})/i);if(!m)return "";const h=+(m[1]||m[3]),mi=+(m[2]||m[4]||0);return h<24&&mi<60?String(h).padStart(2,"0")+":"+String(mi).padStart(2,"0"):""}
function inUrlaub(d){const k=typeof d==="string"?d:ymd(d);return urlaube().find(u=>reiseSt(u)!=="traum"&&u.from&&k>=u.from&&k<=(u.to||u.from))||null}
function ymdD(x){return new Date(x+"T12:00:00")}
// Ferien und Feiertage Bayern (Florian 15.11.2026): Feiertage gerechnet, Schulferien aus ferien.json (monatlich per Lauf von openholidaysapi.org)
function easterSun(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da,12)}
const FT_FIX=[["01-01","Neujahr"],["01-06","Heilige Drei Könige"],["05-01","Tag der Arbeit"],["08-15","Mariä Himmelfahrt"],["10-03","Tag der Deutschen Einheit"],["11-01","Allerheiligen"],["12-25","1. Weihnachtstag"],["12-26","2. Weihnachtstag"]],FT_EAST=[[-2,"Karfreitag"],[1,"Ostermontag"],[39,"Christi Himmelfahrt"],[50,"Pfingstmontag"],[60,"Fronleichnam"]],_ftc={};
function feiertage(y){if(_ftc[y])return _ftc[y];const o={},e=easterSun(y);FT_FIX.forEach(f=>{o[y+"-"+f[0]]=f[1]});FT_EAST.forEach(f=>{o[ymd(addDays(e,f[0]))]=f[1]});return _ftc[y]=o}
function feiertag(d){const k=typeof d==="string"?d:ymd(d);return feiertage(+k.slice(0,4))[k]||""}
function ferienList(){return ((S.ferien&&S.ferien.ferien)||[]).filter(f=>f&&f.from&&f.to)}
function ferienAt(d){const k=typeof d==="string"?d:ymd(d);return ferienList().find(f=>k>=f.from&&k<=f.to)||null}
// Freie Tage ab heute (Feiertage und Ferienbeginn), für Urlaube und Ausflüge
function freiNext(n,days){const out=[],t=new Date();for(let i=0;i<(days||400)&&out.length<n;i++){const d=addDays(t,i),k=ymd(d),ft=feiertag(k),fe=ferienList().find(f=>f.from===k);if(fe)out.push({k,d,name:fe.name,ic:"🏖️",to:fe.to});if(ft)out.push({k,d,name:ft,ic:"🎉",bridge:d.getDay()===4?"Fr":d.getDay()===2?"Mo":""})}return out}
const WD2=["So","Mo","Di","Mi","Do","Fr","Sa"];
function freiLine(x){return x.ic==="🏖️"?`🏖️ ${esc(x.name)} ${rDate(x.k)}–${rDate(x.to)}`:`🎉 ${WD2[x.d.getDay()]} ${rDate(x.k)} ${esc(x.name)}${x.bridge?` · Brückentag ${x.bridge}`:""}`}
const CAL_SRC=[
  (a,z)=>{const out=[];termine().forEach(x=>{if(!x.date)return;if(!x.rep){if(x.to&&x.to>x.date){let d=ymdD(x.date),n=0;while(ymd(d)<=x.to&&n<60){const k=ymd(d);if(k>=a&&k<=z)out.push({d:k,t:k===x.date?x.time||"":"",name:x.name+(n?" (Tag "+(n+1)+")":""),icon:"📅",src:"own",id:x.id,who:x.who||"",note:x.note||"",remind:x.remind||false});d=addDays(d,1);n++}return}if(x.date>=a&&x.date<=z)out.push({d:x.date,t:x.time||"",name:x.name,icon:"📅",src:"own",id:x.id,who:x.who||"",note:x.note||"",remind:x.remind||false});return}
    let d=ymdD(x.date);const end=ymdD(z);let n=0;while(d<=end&&n<800){const k=ymd(d);if(k>=a)out.push({d:k,t:x.time||"",name:x.name,icon:x.rep==="y"?"🎂":"🔁",src:"own",id:x.id,who:x.who||"",note:x.note||"",remind:x.remind||false});d=x.rep==="w"?addDays(d,7):x.rep==="m"?new Date(d.getFullYear(),d.getMonth()+1,d.getDate(),12):new Date(d.getFullYear()+1,d.getMonth(),d.getDate(),12);n++}});return out},
  (a,z)=>kitas().filter(x=>x.sec==="termine"&&x.date&&x.date>=a&&x.date<=z).map(x=>({d:x.date,t:"",name:"Kita: "+x.name,icon:"🎒",src:"kita",who:"kid",nav:"kita|ks:termine"})),
  (a,z)=>prios().filter(x=>x.due&&x.due>=a&&x.due<=z).map(x=>({d:x.due,t:x.time||"",name:x.name,icon:"🔔",src:"prio",from:x.from,nav:"wichtig|"})),
  (a,z)=>{const out=[];for(let d=ymdD(a);ymd(d)<=z;d=addDays(d,1)){const m=mealInfo(planDays(mondayOf(d))["d"+((d.getDay()+6)%7)]);if(m)out.push({d:ymd(d),t:"",name:m.name,icon:"🍲",src:"food",nav:"essen|ft:plan"})}return out},
  (a,z)=>{const out=[];urlaube().forEach(u=>{if(reiseSt(u)==="traum"||!u.from)return;const to=u.to||u.from;if(to<a||u.from>z)return;for(let d=ymdD(u.from>a?u.from:a);ymd(d)<=(to<z?to:z);d=addDays(d,1)){const k=ymd(d);out.push({d:k,t:"",name:"Urlaub: "+u.name+(k===u.from?" (Start)":k===to?" (letzter Tag)":""),icon:u.emo||"⛵",src:"reise",attr:'data-reise="'+esc(u.id)+'"'})}});return out},
  (a,z)=>trips().filter(x=>x.date&&!x.done&&x.date>=a&&x.date<=z).map(x=>{const pl=x.pack&&packLists().find(p=>p.id===x.pack);return {d:x.date,t:"",name:"Ausflug: "+x.name,icon:"🚲",src:"trip",note:pl?"🎒 Packliste: "+pl.name:"",nav:pl?"ausflug|tt:pack":"ausflug|tt:ideen",pack:pl?pl.id:""}}),
  (a,z)=>{const out=[];plays().filter(x=>x.sec==="sport"&&x.when).forEach(x=>{const wd=whenDays(x.when);if(!wd.length)return;const t=whenTime(x.when);for(let d=ymdD(a);ymd(d)<=z;d=addDays(d,1)){if(wd.includes(d.getDay())&&!inUrlaub(d))out.push({d:ymd(d),t,name:x.name,icon:"⚽",src:"play",who:"kid",nav:"spiel|ps:sport"})}});return out},
  (a,z)=>{const out=[];advCals().forEach(c=>{Object.values(advDoors(c.id)).forEach(x=>{if(x.kind!=="aktiv"||advHidden(c,x.day))return;const k=(c.year||advYear())+"-12-"+String(x.day).padStart(2,"0");if(k>=a&&k<=z)out.push({d:k,t:"",name:x.name+" (Türchen "+x.day+")",icon:"🎄",src:"advent",who:c.for==="kid"?"kid":"",attr:'data-advgo="'+esc(c.id)+'"'})})});return out},
  // Familywall (Florian 15.11.2026): nur lesend, stündlich vom Lauf im privaten Sicherungs-Repo nach food/ext/fw geschrieben; gleiche Termine wie in der App nur einmal
  (a,z)=>{const fw=S.food&&S.food.ext&&S.food.ext.fw;if(!fw||!fw.items)return [];const own=new Set(termine().map(x=>(x.name||"").trim().toLowerCase()+"|"+x.date)),out=[];
    const nrm=t=>String(t||"").toLowerCase().replace(/[^a-zäöüß]/g,"");
    Object.keys(fw.items).forEach(id=>{const x=fw.items[id];if(!x||!x.date||!x.name||own.has(x.name.trim().toLowerCase()+"|"+x.date))return;const ft=nrm(feiertag(x.date));if(ft&&!x.time&&(nrm(x.name).includes(ft)||ft.includes(nrm(x.name))))return;const to=x.to&&x.to>x.date?x.to:x.date;if(to<a||x.date>z)return;let d=ymdD(x.date),n=0;
      while(ymd(d)<=to&&n<60){const k=ymd(d);if(k>=a&&k<=z)out.push({d:k,t:k===x.date?x.time||"":"",name:x.name+(n?" (Tag "+(n+1)+")":""),icon:"👪",src:"ext",note:"Aus Familywall"+(x.end?", bis "+x.end:"")+(x.place?" · "+x.place:"")+". Ändern geht in Familywall."});d=addDays(d,1);n++}});return out},
  (a,z)=>{const out=[];for(let d=ymdD(a);ymd(d)<=z;d=addDays(d,1)){const k=ymd(d),ft=feiertag(k);if(ft)out.push({d:k,t:"",name:ft,icon:"🎉",src:"frei",note:"Feiertag in Bayern. Die Kita hat zu."})}
    ferienList().forEach(f=>{if(f.from>=a&&f.from<=z)out.push({d:f.from,t:"",name:f.name+" beginnen",icon:"🏖️",src:"frei",note:"Schulferien Bayern bis "+rDate(f.to)+"."});if(f.to!==f.from&&f.to>=a&&f.to<=z)out.push({d:f.to,t:"",name:"Letzter Tag "+f.name,icon:"🏖️",src:"frei"})});return out}];
// Was der Kalender zeigt (Filter nach Bereich und Person). dayStress und Rückseite nutzen calEvents ungefiltert.
function calShown(a,z){const off=S.calOff||[],w=S.calWho||"";return calEvents(a,z).filter(e=>!off.includes(CAL_LBL.some(l=>l[0]===e.src)?e.src:"own")&&(!w||!e.who||e.who==="both"||e.who===w))}
function calEvents(a,z){const out=[];CAL_SRC.forEach(f=>{try{out.push(...f(a,z))}catch(_){}});return out.sort((x,y)=>(x.d+(x.t||"99")+(x.src==="food"?"1":"0"))<(y.d+(y.t||"99")+(y.src==="food"?"1":"0"))?-1:1)}
function evRow(e,showDay){const who=e.who==="kid"?" · Kind":e.who&&e.who!=="both"?" · "+esc(pname(e.who)):"";const day=showDay?`<span class="t">${esc(dLabel(e.d))}</span>`:`<span class="t">${esc(e.t||"")}</span>`;
  const body=`<span>${e.icon} ${esc(e.name)}${showDay&&e.t?` <span class="freq">${esc(e.t)}</span>`:""}${who?`<span class="freq">${who}</span>`:""}${e.note?`<br><span class="freq">${esc(e.note)}</span>`:""}</span>`;
  const gift=e.icon==="🎂"?`<button class="catbtn" data-nav="projekte|pf:geschenk" aria-label="Geschenkideen ansehen" style="background:none;border:none">🎁</button>`:"";
  return `<li>${day}${e.src==="own"?`<button class="ev" data-teredit="${esc(e.id)}">${body}</button>${gift}<button class="catbtn" data-terbell="${esc(e.id)}" aria-pressed="${!!e.remind}" aria-label="${esc(e.name)}: ${e.remind?"nicht mehr erinnern":"erinnern"}" style="background:none;border:none;${e.remind?"":"opacity:.35"}">🔔</button><button class="catbtn" data-terrm="${esc(e.id)}" aria-label="${esc(e.name)} löschen" style="background:none;border:none;opacity:.6">✕</button>`:e.attr?`<button class="ev" ${e.attr}>${body}</button><i class="freq">›</i>`:e.pack?`<button class="ev" data-gopack="${esc(e.pack)}">${body}</button><i class="freq">›</i>`:e.nav?`<button class="ev" data-nav="${esc(e.nav)}">${body}</button><i class="freq">›</i>`:`<span class="ev">${body}</span>`}</li>`}
function renderTerForm(){const d=S.terDraft,pn=k=>esc(pname(k));
  return `<section class="card"><div class="section-head"><h2>${d.id?"Termin ändern":"Neuer Termin"}</h2></div><form id="terform" novalidate>
    <label class="fld"><span>Was</span><input id="ter-name" data-terf="name" value="${esc(d.name)}" maxlength="80" placeholder="z. B. Zahnarzt" autocomplete="off"></label>
    <div style="display:flex;gap:8px"><label class="fld" style="flex:1"><span>Tag</span><input type="date" data-terf="date" value="${esc(d.date)}"></label><label class="fld" style="flex:1"><span>Uhrzeit</span><input type="time" data-terf="time" value="${esc(d.time)}"></label></div>
    ${d.rep?"":`<label class="fld"><span>Bis (nur bei mehreren Tagen)</span><input type="date" data-terf="to" value="${esc(d.to||"")}" min="${esc(d.date)}"></label>`}
    <div class="fld"><span>Für wen</span><div class="unl">${[["both","Alle"],["p0",pn("p0")],["p1",pn("p1")],["kid","Kind"]].map(o=>`<button type="button" class="chipbtn neutral" data-terwho="${o[0]}" aria-pressed="${(d.who||"both")===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <div class="fld"><span>Wiederholen</span><div class="unl">${[["","Nein"],["w","Jede Woche"],["m","Jeden Monat"],["y","Jedes Jahr"]].map(o=>`<button type="button" class="chipbtn neutral" data-terrep="${o[0]}" aria-pressed="${(d.rep||"")===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <div class="fld"><span>🔔 Erinnern (zählt an der Glocke)</span><div class="unl">${[["","Nein"],["tag","Am Tag"],["1d","1 Tag vorher"],["1h","1 Stunde vorher"]].map(o=>`<button type="button" class="chipbtn neutral" data-terrem="${o[0]}" aria-pressed="${(d.remind===true?"tag":d.remind||"")===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <label class="fld"><span>Notiz</span><input data-terf="note" value="${esc(d.note)}" maxlength="200" autocomplete="off"></label>
    <div class="btnrow"><button class="primary" type="submit">Speichern</button><button class="ghost" type="button" data-act="tercancel">Abbrechen</button>${d.id?`<button class="ghost danger" type="button" data-terrm="${esc(d.id)}">Löschen</button>`:""}</div></form></section>`}
function calFilters(){const off=S.calOff||[],w=S.calWho||"",pn=k=>esc(pname(k));
  return `<div class="unl calf">${CAL_LBL.map(l=>`<button class="chipbtn neutral" data-caloff="${l[0]}" aria-pressed="${!off.includes(l[0])}"><i class="cdot" style="background:${CAL_COL[l[0]]}"></i>${l[1]} ${l[2]}</button>`).join("")}</div>
  <div class="unl calf">${[["","Alle"],["p0",pn("p0")],["p1",pn("p1")],["kid","Kind"]].map(o=>`<button class="chipbtn neutral" data-calwho="${o[0]}" aria-pressed="${w===o[0]}">${o[1]}</button>`).join("")}</div>`}
function calDayCard(k,MN){const sd=ymdD(k),dl=calShown(k,k),u=inUrlaub(k);
  return `<section class="card"><div class="section-head"><h2>${esc(DAYN[(sd.getDay()+6)%7])}, ${sd.getDate()}. ${MN[sd.getMonth()]}</h2><button class="primary" data-act="ternew">＋ Termin</button></div>${dl.length?`<ul class="evlist">${dl.map(e=>evRow(e,false)).join("")}</ul>`:`<div class="freq">Nichts eingetragen.</div>`}${u?`<div class="freq" style="margin-top:6px">⛵ Urlaub: Wochenvorschlag lässt den Tag frei, Kita und Kurse sind ausgeblendet.</div>`:""}</section>`}
function renderCal(){if(S.terDraft)return renderTerForm();const today=ymd(new Date()),m0=S.calMonth||new Date(new Date().getFullYear(),new Date().getMonth(),1,12),sel=S.calDay||today,v=S.calView||"monat";
  const MN=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  let h=`<section class="card"><form id="calquick" class="addrow" novalidate><input id="calq" placeholder="Schnell: Do 15 Uhr Kinderarzt" maxlength="120" autocomplete="off" aria-label="Termin schnell eintragen"><button class="primary" type="submit">＋</button></form>
    <div class="freq" style="margin-top:4px">Versteht heute, morgen, Wochentage, 24.12., 9:30, "jede Woche", "Geburtstag".</div></section>`;
  h+=`<div class="unl" style="margin:0 0 8px">${[["monat","Monat"],["woche","Woche"],["liste","Liste"]].map(o=>`<button class="chipbtn neutral" data-calview="${o[0]}" aria-pressed="${v===o[0]}">${o[1]}</button>`).join("")}<button class="chipbtn neutral" data-act="calfilt" aria-pressed="${!!S.calFiltOpen}">Filter${(S.calOff||[]).length||S.calWho?" •":""}</button></div>`;
  if(S.calFiltOpen)h+=`<section class="card">${calFilters()}</section>`;
  if(v==="woche"){const mon=mondayOf(ymdD(sel)),{w}=isoWeek(mon);
    h+=`<section class="card"><div class="section-head" style="align-items:center"><h2>KW ${w}</h2><div class="weeknav"><button class="iconbtn" data-calw="-7" aria-label="Vorige Woche">‹</button>${+mon!==+mondayOf(new Date())?`<button class="ghost" data-calw="0">Heute</button>`:""}<button class="iconbtn" data-calw="7" aria-label="Nächste Woche">›</button></div></div>`;
    for(let i=0;i<7;i++){const d=addDays(mon,i),k=ymd(d),l=calShown(k,k);h+=`<div class="calwd${k===today?" today":""}"><button class="calwh" data-calday="${k}" data-calview="monat"><b>${DAYS[i]}</b> ${d.getDate()}.${d.getMonth()+1}.</button>${l.length?`<ul class="evlist">${l.map(e=>evRow(e,false)).join("")}</ul>`:`<div class="freq">frei</div>`}</div>`}
    return h+`</section>`}
  if(v==="liste"){const l=calShown(today,ymd(addDays(new Date(),60))),by={};l.forEach(e=>{(by[e.d]=by[e.d]||[]).push(e)});const ks=Object.keys(by).sort();
    h+=ks.length?ks.map(k=>{const d=ymdD(k);return `<section class="card"><div class="section-head"><h2>${esc(dLabel(k))}</h2><span class="freq">${d.getDate()}. ${MN[d.getMonth()]}</span></div><ul class="evlist">${by[k].map(e=>evRow(e,false)).join("")}</ul></section>`}).join(""):`<div class="empty"><h2>Nichts in den nächsten 60 Tagen</h2><div>Mit Filtern sieht man vielleicht zu wenig.</div></div>`;
    return h}
  const first=mondayOf(m0),last=addDays(mondayOf(new Date(m0.getFullYear(),m0.getMonth()+1,0,12)),6),ev=calShown(ymd(first),ymd(last)),by={};ev.forEach(e=>{(by[e.d]=by[e.d]||[]).push(e)});
  h+=`<section class="card"><div class="section-head" style="align-items:center"><h2>${MN[m0.getMonth()]} ${m0.getFullYear()}</h2><div class="weeknav"><button class="iconbtn" data-calm="-1" aria-label="Voriger Monat">‹</button>${m0.getMonth()!==new Date().getMonth()||m0.getFullYear()!==new Date().getFullYear()?`<button class="ghost" data-calm="0">Heute</button>`:""}<button class="iconbtn" data-calm="1" aria-label="Nächster Monat">›</button></div></div>
    <div class="cal">${["Mo","Di","Mi","Do","Fr","Sa","So"].map(x=>`<span class="cw">${x}</span>`).join("")}`;
  for(let d=first;d<=last;d=addDays(d,1)){const k=ymd(d),l=(by[k]||[]),srcs=[...new Set(l.map(e=>e.src).filter(x=>x!=="food"&&x!=="reise"))],u=l.some(e=>e.src==="reise");
    h+=`<button data-calday="${k}" class="${d.getMonth()!==m0.getMonth()?"out ":""}${k===today?"today ":""}${u?"urlaub":""}" aria-pressed="${k===sel}" aria-label="${d.getDate()}. ${MN[d.getMonth()]}${u?", Urlaub":""}${l.length?", "+l.length+" Einträge":""}"><span>${d.getDate()}</span><span class="dots">${srcs.slice(0,4).map(x=>`<i data-s="${x}" style="background:${CAL_COL[x]||CAL_COL.ext}"></i>`).join("")}</span></button>`}
  h+=`</div><div class="freq" style="margin-top:8px">${CAL_LBL.filter(x=>x[0]!=="food").map(x=>`<span style="white-space:nowrap"><i class="cdot" style="background:${CAL_COL[x[0]]}"></i>${x[2]}</span>`).join(" &nbsp; ")}</div></section>`;
  h+=calDayCard(sel,MN);
  const up=calShown(today,ymd(addDays(new Date(),21))).filter(e=>e.src!=="food"&&e.src!=="reise"&&e.d!==sel).slice(0,12);
  if(up.length)h+=`<section class="card"><div class="section-head"><h2>Demnächst</h2></div><ul class="evlist">${up.map(e=>evRow(e,true)).join("")}</ul></section>`;
  h+=`<div class="freq" style="text-align:center">Ein Handy-Kalender kann später hier andocken.</div>`;
  return h}
function renderWeek(){
  const mon=S.view,wk=wkKey(mon),cur=mondayOf(new Date()),isCur=+mon===+cur;
  const today=isCur?(new Date().getDay()+6)%7:(mon<cur?7:-1);
  const sc=weekScore(wk),split=rotSplit(),tk=ticksOf(wk);
  const {w}=isoWeek(mon);
  let h=`<div class="top"><div><h1>${isCur?"Diese Woche":(mon<cur?"Rückblick":"Vorschau")}</h1><div class="wkdate">KW ${w} · ${fmt(mon,{day:"numeric",month:"short"})} – ${fmt(addDays(mon,6),{day:"numeric",month:"short"})}</div></div>
   <div class="weeknav"><button class="iconbtn" data-prionew="woche" aria-label="Erinnerung anlegen">🔔</button><button class="iconbtn" data-wknav="-1" aria-label="Vorige Woche">‹</button>${isCur?"":`<button class="ghost" data-wknav="0">Heute</button>`}<button class="iconbtn" data-wknav="1" aria-label="Nächste Woche" ${+mon>=+addDays(cur,28)?"disabled":""}>›</button></div></div>`;
  if(!isCur)h+=`<div class="wkro">${mon<cur?(S.wkEdit===wk?`✏️ Nachtragen ist an. <button class="ghost" data-act="wkedit">Fertig</button>`:`📦 Archiv: diese Woche ist nur zum Ansehen. <button class="ghost" data-act="wkedit">✏️ Nachtragen</button>`):`🔭 Vorschau: Homeoffice kannst du schon eintragen, abhaken geht erst in der Woche selbst.`}</div>`;
  const hoTop=true;
  h+=meChooser();
  const cnt={all:[0,0],p0:[0,0],p1:[0,0]};
  tasks().forEach(t=>{if(group(t.freq)!=="week"||t.owner!=="rot")return;const o=ownerFor(t,mon,split);const n=slotsOf(t);
    for(let i=0;i<n;i++){const d=tk[t.id+"__"+i]?1:0;cnt.all[0]+=d;cnt.all[1]++;if(o==="p0"||o==="p1"){cnt[o][0]+=d;cnt[o][1]++}}});
  const pct=cnt.all[1]?cnt.all[0]/cnt.all[1]:0;
  const mine=S.filter==="meine"&&S.me;
  if(mine){const m={rot:[0,0],fix:[0,0]};
    tasks().forEach(t=>{if(group(t.freq)!=="week")return;const k=t.owner==="rot"?(ownerFor(t,mon,split)===S.me?"rot":null):(t.owner===S.me?"fix":null);if(!k)return;
      const n=slotsOf(t);for(let i=0;i<n;i++){m[k][0]+=tk[t.id+"__"+i]?1:0;m[k][1]++}});
    const d=m.rot[0]+m.fix[0],n=m.rot[1]+m.fix[1];
    h+=`<section class="campback dash wkpanel" aria-label="Mein Wochenstand">${panelHead("Mein Stand · KW "+w,n-d>0?`Noch ${n-d} offen`:"Alles erledigt",esc(pname(S.me))+", Wechsel und feste Aufgaben",panelRing(d,n,"gesamt",'data-jump="rot" aria-label="Gebündelt anzeigen"'))}
    <div class="bcnts" style="grid-template-columns:repeat(2,1fr)">${panelTile(m.rot[0]+"/"+m.rot[1],"im Wechsel ›",'data-jump="rot"')}${panelTile(m.fix[0]+"/"+m.fix[1],"feste Aufgaben ›",'data-jump="fix"')}</div></section>`;
    if(n&&d>=n)h+=`<div class="celebrate">Du hast alle deine Aufgaben für diese Woche erledigt.</div>`;
  }else{
  const fx=[0,0];tasks().forEach(t=>{if(group(t.freq)!=="week"||t.owner==="rot")return;const n=slotsOf(t);for(let i=0;i<n;i++){fx[0]+=tk[t.id+"__"+i]?1:0;fx[1]++}});const op=cnt.all[1]-cnt.all[0];
  h+=`<section class="campback dash wkpanel" aria-label="Wochenstand">${panelHead("Wochenstand · KW "+w,op>0?`Noch ${op} offen`:"Alles erledigt","Wechsel-Aufgaben "+(isCur?"dieser Woche":mon<cur?"dieser Woche (Rückblick)":"(Vorschau)"),panelRing(cnt.all[0],cnt.all[1],"im Wechsel",'data-jump="rot" aria-label="Wechsel-Aufgaben gebündelt anzeigen"'))}
    <div class="bcnts">${panelTile(cnt.p0[0]+"/"+cnt.p0[1],esc(pname("p0"))+" ›",'data-jump="rot"')}${panelTile(cnt.p1[0]+"/"+cnt.p1[1],esc(pname("p1"))+" ›",'data-jump="rot"')}${panelTile(fx[0]+"/"+fx[1],"feste Aufgaben ›",'data-jump="fix"')}</div></section>`;
  if(cnt.all[1]&&cnt.all[0]>=cnt.all[1])h+=`<div class="celebrate">Alle Wechsel-Aufgaben dieser Woche sind erledigt.</div>`;}
  h+=scopeSwitch(`<button class="chipbtn neutral" data-act="hidedone" aria-pressed="${S.hideDone}">Erledigte ausblenden</button><button class="chipbtn neutral" data-act="groupby" aria-pressed="${S.groupBy==="art"}">Fest und Wechsel bündeln</button>`);

  const FO={day:0,week:1,month:2,half:3,year:4};
  const card=t=>{const f=t.freq,o=ownerFor(t,mon,split),isRot=t.owner==="rot";let html,doneAll,pct;
    if(f==="day"||f==="week"){const n=slotsOf(t),isHO=t.owner==="ho",isBoth=t.owner==="both";let c=0,slots="";
      for(let i=0;i<n;i++){const k=t.id+"__"+i;const cls=["slot"];let lbl=f==="day"?DAYS[i]:"",aria="",on=false;
        if(isBoth){const leg=tk[k],a=tk[k+"_p0"]||(leg&&leg.by==="p0"?leg:null),b=tk[k+"_p1"]||(leg&&leg.by==="p1"?leg:null);
          c+=(a?0.5:0)+(b?0.5:0);cls.push("split");if(a)cls.push("h0");if(b)cls.push("h1");if(a&&b)lbl="✓";on=!!(a&&b);
          aria=(a?" "+esc(pname("p0"))+" erledigt":"")+(b?" "+esc(pname("p1"))+" erledigt":"")}
        else{const v=tk[k];if(v){c++;on=true;cls.push("on",isHO?(v.by==="x"?"x":v.by):"chk");lbl=isHO?`<span>${esc(v.by==="x"?(v.lbl||"X").slice(0,2):pname(v.by).charAt(0))}${v.part?`<sup>${v.part==="ab"?1:2}</sup>`:""}</span>`:"✓";aria=" erledigt von "+esc(v.by==="x"?(v.lbl||"X"):pname(v.by))+(v.part==="ab"?", holt nachmittags ab":v.part==="br"?", bringt morgens":"")}}
        if(f==="day"){if(i===today)cls.push("today");if(i>today)cls.push("future");if(isHO)cls.push("hoslot")}
        if(hasSubs(t)&&!isBoth&&!isHO){slots+=`<div class="subgrp${on?" all":""}" role="group" aria-label="${esc(t.name)} ${f==="day"?DAYS[i]:(i+1)+". Mal"}">${n>1?`<span class="subn">${f==="day"?DAYS[i]:(i+1)+"."}</span>`:""}${t.subs.map((sn,j)=>{const sv=tk[k+"_s"+j];return `<button class="subbtn${sv?" on":""}" data-task="${esc(t.id)}" data-slot="${i}" data-sub="${j}" aria-pressed="${!!sv}" aria-label="${esc(sn)}${sv?" erledigt von "+esc(pname(sv.by)):""}">${sv?"✓ ":""}${esc(sn)}</button>`}).join("")}</div>`;continue}
        slots+=`<button class="${cls.join(" ")}" data-task="${esc(t.id)}" data-slot="${i}" ${isBoth?'data-split="1"':""} ${f==="day"&&i>today&&!isHO?"disabled":""} aria-pressed="${on}" aria-label="${esc(t.name)} ${f==="day"?DAYS[i]:(i+1)+". Mal"}${aria}">${lbl}</button>`}
      doneAll=c>=n;pct=n?c/n:0;const cs=(c%1?String(c).replace(".",","):c);
      html=`<article class="task${doneAll?" done":""}"><div class="task-top"><div><div class="task-title">${esc(t.name)}</div><div class="meta">${ownerChip(o,isRot)}<span class="freq">${f==="day"?"täglich":n+"× pro Woche"} · ${cs}/${n}</span></div></div></div><div class="slots">${slots}</div>${taskLink(t)}${isBoth?`<div class="freq">Jeder hakt seine Hälfte ab: links ${esc(pname("p0"))}, rechts ${esc(pname("p1"))}.</div>`:""}</article>`;
    }else{const pt=periodTick(t,mon);doneAll=!!pt;pct=doneAll?1:0;if(!pt&&!periodDue(t,mon))return {t,o,html:"",done:false,later:periodMid(f,mon),pct:0,times:1};
      const lbl=pt?`✓ Erledigt von ${esc(pname(pt.v.by))} am ${fmt(new Date(pt.v.at),{day:"numeric",month:"short"})}`:"○ Als erledigt markieren";
      html=`<article class="task${doneAll?" done":""}"><div class="task-top"><div><div class="task-title">${esc(t.name)}</div><div class="meta">${ownerChip(o,isRot)}<span class="freq">${FREQ_LABEL[f]}</span></div></div></div><div><button class="bigcheck${pt?" on chk":""}" data-task="${esc(t.id)}" data-slot="p" aria-pressed="${doneAll}">${lbl}</button></div>${taskLink(t)}</article>`}
    return {t,o,html,done:doneAll,pct,times:slotsOf(t)}};
  const vis=x=>!(S.filter==="meine"&&S.me&&!(x.o===S.me||x.o==="both"||x.o==="ho"))&&!(S.hideDone&&x.done);
  const order=(a,b)=>FO[a.t.freq]-FO[b.t.freq]||b.times-a.times||a.pct-b.pct;
  const secs=S.groupBy==="art"
    ?[["rot","Wechsel-Aufgaben",t=>t.owner==="rot"],["fix","Feste Aufgaben",t=>t.owner==="p0"||t.owner==="p1"],["gem","Gemeinsam und Homeoffice",t=>t.owner==="both"||t.owner==="ho"]]
    :[["day","Täglich",t=>t.freq==="day"],["week","Diese Woche",t=>t.freq==="week"],["month","Diesen Monat",t=>t.freq==="month"],["half","Dieses Halbjahr",t=>t.freq==="half"],["year","Dieses Jahr",t=>t.freq==="year"]];
  if(hoTop){const ho=tasks().filter(t=>t.owner==="ho").map(card);
    h+=(ho.length?`<section class="section hotop" id="sec-ho" aria-label="Homeoffice"><div class="section-head"><h2>🏠 Homeoffice</h2><span class="freq">wer an dem Tag zu Hause ist</span></div>${ho.map(x=>x.html).join("")}</section>`:"")}
  secs.forEach(([id,title,fn0])=>{const fn=hoTop?t=>t.owner!=="ho"&&fn0(t):fn0;const xs=tasks().filter(fn).map(card).filter(vis).sort(order);if(!xs.length)return;
    const lt=xs.filter(x=>x.later),op=xs.filter(x=>!x.done&&!x.later),dn=xs.filter(x=>x.done);if(!op.length&&!dn.length&&!lt.length)return;
    h+=`<section class="section" id="sec-${id}"><div class="section-head"><h2>${title}</h2>${!hoTop&&(id==="day"||id==="gem")?`<span class="freq">„Homeoffice“ = wer an dem Tag zu Hause ist</span>`:""}</div>${op.map(x=>x.html).join("")}${dn.length?`<div class="donesep">Erledigt</div>`+dn.map(x=>x.html).join(""):""}${lt.length?`<div class="laterline freq">⏳ Erst ab Mitte des Zeitraums: ${lt.map(x=>esc(x.t.name)+" (ab "+fmt(x.later,{day:"numeric",month:"numeric"})+")").join(", ")}</div>`:""}</section>`});
  return h}

function renderScore(){
  const tot=allTime(),xp=tot.p0+tot.p1,lv=levelFor(xp),st=streak();
  const cur=mondayOf(new Date());const weeks=[];for(let i=7;i>=0;i--){const m=addDays(cur,-7*i);weeks.push({m,s:weekScore(wkKey(m))})}
  const max=Math.max(10,...weeks.map(x=>x.s.pts.p0+x.s.pts.p1));
  let best=0;Object.keys(S.weeks).forEach(k=>{const s=weekScore(k);best=Math.max(best,s.pts.p0+s.pts.p1)});
  let h=`<div><div class="eyebrow">Euer Zuhause</div><h1>Punkte & Level</h1></div>`;
  h+=`<section class="card"><div class="level"><div class="badge num">${lv.n+1}</div><div style="min-width:0;flex:1"><div class="eyebrow">Haus-Level</div><h2>${LEVELS[lv.n]}</h2>
     <div class="xpbar" style="margin-top:8px"><i style="width:${lv.n>=LEVELS.length-1?100:Math.round(lv.cur/lv.span*100)}%"></i></div>
     <div class="freq num" style="margin-top:4px">${lv.n>=LEVELS.length-1?"Höchstes Level erreicht":`${lv.cur} / ${lv.span} XP bis „${LEVELS[lv.n+1]}“`}</div></div></div>
     <div class="notice">Alle Punkte von euch beiden zählen zusammen. Ihr levelt euer Zuhause gemeinsam, nicht gegeneinander.</div></section>`;
  h+=`<div class="stats"><div class="stat"><span class="freq">${esc(pname("p0"))}, gesamt</span><b class="num" style="color:var(--p0)">${tot.p0}</b></div><div class="stat"><span class="freq">${esc(pname("p1"))}, gesamt</span><b class="num" style="color:var(--p1)">${tot.p1}</b></div>
      <div class="stat"><span class="freq">Wochen-Serie</span><b class="num">🔥 ${st}</b></div><div class="stat"><span class="freq">Beste Woche</span><b class="num">${best} P.</b></div></div>`;
  h+=`<section class="card"><div class="section-head"><h2>Letzte 8 Wochen</h2><div class="legend"><span><i style="background:var(--p0)"></i>${esc(pname("p0"))}</span><span><i style="background:var(--p1)"></i>${esc(pname("p1"))}</span></div></div>
     <div class="chart" role="img" aria-label="Punkte pro Woche">${weeks.map(x=>`<div class="bar" title="${x.s.pts.p0} / ${x.s.pts.p1}"><i class="b1" style="height:${x.s.pts.p1/max*100}%"></i><i class="b0" style="height:${x.s.pts.p0/max*100}%"></i></div>`).join("")}</div>
     <div class="chart-x num">${weeks.map(x=>`<span>${x.s.pct>=GOAL?"★":""}KW${isoWeek(x.m).w}</span>`).join("")}</div>
     <div class="freq">★ = Wochenziel (${Math.round(GOAL*100)} %) erreicht</div></section>`;
  return h}

