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
// Doppelring oben rechts (Florian 16.11.2026): außen die Woche (Wechsel-Aufgaben, Zitronengelb), innen heute (tasksToday, weiß); ohne Zusatz-Beschriftung (Florian). Tipp springt zu den offenen Aufgaben
// Seit 19.11.2026 ist innen „Heute für dich“ (heuteList), dieselbe Liste wie im Wochenkopf und am Zähler „Heute dran“
// Seit 19.11.2026 nachmittags: innen nur, was wirklich heute fällig ist (heuteFix), außen die Woche plus fällige Nach-Bedarf-Aufgaben
function bweekRing(){let [d,n]=weekMine();const HL=heuteList(),F=heuteFix(HL),N=HL.filter(x=>x.need),A={total:F.length,open:F.filter(x=>!x.done).length},dt=A.total-A.open;n+=N.length;d+=N.filter(x=>x.done).length;if(!n&&!A.total)return "";
  const arc=(r,w,dd,nn,col,tr)=>{const c=2*Math.PI*r,p=nn?Math.min(1,dd/nn):0;return `<circle cx="27" cy="27" r="${r}" fill="none" stroke="${tr}" stroke-width="${w}"/><circle cx="27" cy="27" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-p)).toFixed(1)}" transform="rotate(-90 27 27)"/>`};
  return `<button class="bring bring2" data-act="gotasks" aria-label="Heute ${dt} von ${A.total} Aufgaben erledigt, Woche ${d} von ${n} ${S.me?"Wochen-Aufgaben":"Wechsel-Aufgaben"}"><svg viewBox="0 0 54 54" aria-hidden="true">${arc(24,5,d,n,"var(--lemon)","rgba(255,255,255,.2)")}${arc(16,5,dt,A.total,"#fff","rgba(255,255,255,.14)")}</svg><span class="num">${dt}/${A.total}</span><small>heute</small></button>`}
function ring(p){const r=36,c=2*Math.PI*r;const off=c*(1-Math.min(1,p));
  return `<svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${r}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="8"/><circle cx="42" cy="42" r="${r}" fill="none" stroke="var(--lemon)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>`}

function scopeSwitch(extra){return `<div class="filters" role="group" aria-label="Ansicht"><button class="chipbtn neutral" data-filter="alle" aria-pressed="${S.filter==="alle"}">Alle</button><button class="chipbtn neutral" data-filter="meine" aria-pressed="${S.filter==="meine"}">Mein Bereich</button>${extra||""}</div>${S.filter==="meine"&&!S.me?`<div class="notice">Wähle oben aus, wer du bist, damit „Mein Bereich“ funktioniert.</div>`:""}`}
const WEEK_PAGES=["Tag und Woche","Wer macht was","Wer macht was","Kalender","Rückblick"],WEEK_ORDER=[0,1,4];
function weekPager(){const p=(S.weekPage|0)===2?1:S.weekPage|0,o=WEEK_ORDER.indexOf(p);return `<div class="pager" role="group" aria-label="Seiten in Haushalt"><div class="pdots">${WEEK_ORDER.map(i=>`<button class="pdot" data-wpage="${i}" aria-pressed="${i===p}" aria-label="${WEEK_PAGES[i]}"><b>${WEEK_PAGES[i]}</b></button>`).join("")}</div></div>`}
function setWeekPage(n){n=n===4?4:((n%4)+4)%4;if(n===2)n=1;if(n===(S.weekPage|0))return;if((S.weekPage|0)===1)S.draft=null;S.weekPage=n;render();window.scrollTo(0,0)}
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
// Personen (Florian 15.11.2026): ein Merkmal über alle Bereiche; im Kalender trägt nur die Person eine Farbe, der Bereich ist das Symbol
const PCOL={p0:"#2e7d6b",p1:"#b8862b",kid:"#8a5cc2",both:"#7a8594"};
// Mehrere Personen (Florian 16.11.2026): who = "p0,kid" (Komma, feste Reihenfolge); leer oder "both" = Alle
const WHO_ORD=["p0","p1","kid"];
const whoL=w=>!w||w==="both"?[]:String(w).split(",").filter(x=>WHO_ORD.includes(x)).sort((a,b)=>WHO_ORD.indexOf(a)-WHO_ORD.indexOf(b));
function whoHas(w,p){const l=whoL(w);return !l.length||l.includes(p)}
function whoToggle(w,p){if(p==="both"||!p)return "both";const l=whoL(w),i=l.indexOf(p);if(i<0)l.push(p);else l.splice(i,1);return l.length?WHO_ORD.filter(x=>l.includes(x)).join(","):"both"}
function whoLabel1(w){return w==="kid"?kidName():w==="p0"||w==="p1"?pname(w):"Alle"}
function whoLabel(w){const l=whoL(w);return l.length?l.map(whoLabel1).join(" und "):"Alle"}
function whoOpts(){return [["both","Alle"],["p0",pname("p0")],["p1",pname("p1")],["kid",kidName()]]}
// Person als Kürzel im Farbkreis (Florian 16.11.2026: „Farben dick vorne“, überall gleich); Termine bekommen dazu links einen Streifen (CSS li[data-who])
const pInit=w=>w==="kid"?kidName().charAt(0):w==="p0"||w==="p1"?pname(w).charAt(0):"Alle";
const pDot=w=>whoL(w).map(x=>`<span class="kz" style="background:${PCOL[x]}" aria-hidden="true">${esc(pInit(x))}</span>`).join("");
// Streifen links: bei mehreren Personen geteilt
const whoStripe=w=>{const l=whoL(w);if(l.length<2)return "";const n=l.length;return ` style="--wb:linear-gradient(${l.map((x,i)=>`${PCOL[x]} ${Math.round(i*100/n)}% ${Math.round((i+1)*100/n)}%`).join(",")})"`};
// Familywall: wem gehört ein Termin? Hand-Zuordnung > Wort im Titel > Teilnehmer/Ersteller (einmal zugeordnet) > Alle
// Familywall-Termin in der App ausblenden (Florian 16.11.2026): alle mit demselben Titel, auch Wiederholungen; food/ext/fwhide/<key> {name}. Zurückholen unter Kalender › Bereiche.
function fwHideKey(n){const s=String(n||"").toLowerCase().replace(/[^a-z0-9äöüß]/g,"");let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return "h"+h.toString(36)}
function fwWho(id,x){const E=(S.food&&S.food.ext)||{},ov=(E.fwwho||{})[id];if(ov)return ov;const nm=String(x.name||"").toLowerCase();
  const kw=Object.values(E.fwkw||{}).find(r=>r&&r.kw&&nm.includes(String(r.kw).toLowerCase()));if(kw)return kw.who;
  const M=E.fwmap||{},ws=[...new Set((x.a||[]).map(h=>M[h]).filter(Boolean))];return ws.length===1?ws[0]:ws.length?"both":""}
function freiLine(x){return x.ic==="🏖️"?`🏖️ ${esc(x.name)} ${x.to===x.k?WD2[x.d.getDay()]+" "+rDate(x.k)+" (schulfrei)":rDate(x.k)+"–"+rDate(x.to)}`:`🎉 ${WD2[x.d.getDay()]} ${rDate(x.k)} ${esc(x.name)}${x.bridge?` · Brückentag ${x.bridge}`:""}`}
const terPlace=x=>x.place||(x.tag==="kita"&&placeFind("Kita")?placeFind("Kita").name:"");
const CAL_SRC=[
  (a,z)=>{const out=[];termine().forEach(x=>{if(!x.date||linkHide(x))return;if(x.ask&&altOf(x).length&&!x.rep){choiceEvents(x,a,z,out);return}if(!x.rep){if(x.to&&x.to>x.date){let d=ymdD(x.date),n=0;while(ymd(d)<=x.to&&n<60){const k=ymd(d);if(k>=a&&k<=z)out.push({d:k,t:k===x.date?x.time||"":"",te:k===x.to?x.tend||"":"",ad:!!x.allday,name:x.name+(n?" (Tag "+(n+1)+")":""),icon:terIcon(x),src:"own",tag:x.tag||"",id:x.id,who:x.who||"",note:x.note||"",place:terPlace(x),link:x.link||"",link:x.link||"",remind:x.remind||false});d=addDays(d,1);n++}return}if(x.date>=a&&x.date<=z)out.push({d:x.date,t:x.time||"",te:x.tend||"",ad:!!x.allday,name:x.name,icon:terIcon(x),src:"own",tag:x.tag||"",id:x.id,who:x.who||"",note:x.note||"",place:terPlace(x),link:x.link||"",link:x.link||"",remind:x.remind||false});return}
    let d=ymdD(x.date);const end=ymdD(z);let n=0;while(d<=end&&n<800){const k=ymd(d);if(k>=a)out.push({d:k,t:x.time||"",te:x.tend||"",ad:!!x.allday,name:x.name,icon:x.rep==="y"?"🎂":x.tag?terIcon(x):"🔁",src:"own",tag:x.tag||"",id:x.id,who:x.who||"",note:x.note||"",place:x.place||"",link:x.link||"",link:x.link||"",remind:x.remind||false});d=x.rep==="w"?addDays(d,7):x.rep==="m"?new Date(d.getFullYear(),d.getMonth()+1,d.getDate(),12):new Date(d.getFullYear()+1,d.getMonth(),d.getDate(),12);n++}});return out},
  (a,z)=>kitas().filter(x=>x.sec==="termine"&&x.date&&x.date>=a&&x.date<=z).map(x=>({d:x.date,t:"",name:"Kita: "+x.name,icon:"🎒",src:"kita",who:"kid",ed:"kita|"+x.id,nav:"kita|ks:termine",place:(placeFind("Kita")||{}).name||""})),
  (a,z)=>kidMeds().filter(x=>x.date&&!x.done&&x.date>=a&&x.date<=z).map(x=>({d:x.date,t:x.time||"",name:x.name,icon:kidMedIc(x),src:"kidmed",tag:"arzt",who:"kid",ed:"kidmed|"+x.id,nav:"kind|kf:kid_med",note:x.note||"",place:kidDoc().addr?kidDoc().name||"Kinderarzt":""})),
  (a,z)=>prios().filter(x=>x.due&&x.due>=a&&x.due<=z).map(x=>({d:x.due,t:x.time||"",name:x.name,icon:"🔔",src:"prio",from:x.from,who:x.who||"",ed:"prio|"+x.id,nav:"wichtig|"})),
  (a,z)=>{const out=[];for(let d=ymdD(a);ymd(d)<=z;d=addDays(d,1)){const m=mealInfo(planDays(mondayOf(d))["d"+((d.getDay()+6)%7)]);if(m)out.push({d:ymd(d),t:"",name:m.name,icon:"🍲",src:"food",ed:"food|"+ymd(d),nav:"essen|ft:plan"})}return out},
  (a,z)=>{const out=[];urlaube().forEach(u=>{if(reiseSt(u)==="traum"||!u.from)return;const to=u.to||u.from;if(to<a||u.from>z)return;for(let d=ymdD(u.from>a?u.from:a);ymd(d)<=(to<z?to:z);d=addDays(d,1)){const k=ymd(d);out.push({d:k,t:"",name:"Urlaub: "+u.name+(k===u.from?" (Start)":k===to?" (letzter Tag)":""),icon:u.emo||"⛵",src:"reise",ed:"reise|"+u.id,attr:'data-reise="'+esc(u.id)+'"'})}});return out},
  // Familywall (Florian 15.11.2026): nur lesend, stündlich vom Lauf im privaten Sicherungs-Repo nach food/ext/fw geschrieben; gleiche Termine wie in der App nur einmal
  (a,z)=>{const fw=S.food&&S.food.ext&&S.food.ext.fw;if(!fw||!fw.items)return [];const own=new Set(termine().map(x=>(x.name||"").trim().toLowerCase()+"|"+x.date)),out=[];
    const nrm=t=>String(t||"").toLowerCase().replace(/[^a-zäöüß]/g,"");
    const hid=(S.food.ext&&S.food.ext.fwhide)||{},E2=S.food.ext||{};
    Object.keys(fw.items).forEach(id=>{const x=fw.items[id];if(!x||!x.date||!x.name||hid[fwHideKey(x.name)]||own.has(x.name.trim().toLowerCase()+"|"+x.date))return;const ft=nrm(feiertag(x.date));if(ft&&!x.time&&(nrm(x.name).includes(ft)||ft.includes(nrm(x.name))))return;const to=x.to&&x.to>x.date?x.to:x.date;if(to<a||x.date>z)return;let d=ymdD(x.date),n=0;const X0=(E2.fwx||{})[id]||{},X=X0.tag||!KITA_RX.test(x.name)?X0:Object.assign({},X0,{tag:"kita"});
      while(ymd(d)<=to&&n<60){const k=ymd(d);if(k>=a&&k<=z)out.push({d:k,t:k===x.date?x.time||"":"",te:k===x.to?x.tend||"":"",ad:!!x.allday,name:x.name+(n?" (Tag "+(n+1)+")":""),icon:X.tag?terIcon(X):"",tag:X.tag||"",remind:X.remind||false,src:"ext",who:fwWho(id,x),fw:id,place:X.place||x.place||(X.tag==="kita"&&placeFind("Kita")?placeFind("Kita").name:""),note:"Aus Familywall"+(x.end?", bis "+x.end:"")+(x.place?" · "+x.place:"")+". Ändern geht in Familywall."});d=addDays(d,1);n++}});return out},
  (a,z)=>{const out=[];for(let d=ymdD(a);ymd(d)<=z;d=addDays(d,1)){const k=ymd(d),ft=feiertag(k);if(ft)out.push({d:k,t:"",name:ft,icon:"🎉",src:"frei",note:"Feiertag in Bayern. Die Kita hat zu."})}
    ferienList().forEach(f=>{if(f.from>=a&&f.from<=z)out.push({d:f.from,t:"",name:f.from===f.to?f.name+" (schulfrei)":f.name+" beginnen",icon:"🏖️",src:"frei",note:"Schulferien Bayern bis "+rDate(f.to)+"."});if(f.to!==f.from&&f.to>=a&&f.to<=z)out.push({d:f.to,t:"",name:"Letzter Tag "+f.name,icon:"🏖️",src:"frei"})});return out}];
// Was der Kalender zeigt (Filter nach Bereich und Person). dayStress und Rückseite nutzen calEvents ungefiltert.
function calShown(a,z){const off=S.calOff||[],w=S.calWho||"";return calEvents(a,z).filter(e=>!off.includes(e.tag==="kita"?"kita":CAL_LBL.some(l=>l[0]===e.src)?e.src:"own")&&(!w||whoHas(e.who,w)))}
// Doppelte aus Kita und Familywall (Florian 19.11.2026: „elegante Idee wie ich die doppelten Termine aus kita und familywall beseitigen kann“): gleicher Tag und ähnlicher Titel = eine Zeile.
// Der Kita-Termin bleibt, bekommt Uhrzeit und Ort aus Familywall; „↔ Doch getrennt zeigen“ im Fenster merkt food/ext/fwsplit/<id>.
const DUP_STOP=new Set(["kita","heute","termin","termine","alle","eltern","kinder","gruppe","fuer","uhr","und","mit","beim","bitte"]);
function dupToks(t){return String(t||"").toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").split(/[^a-z0-9]+/).filter(w=>w.length>=4&&!DUP_STOP.has(w))}
function dupSame(a,b){const A=[...new Set(dupToks(a))],B=[...new Set(dupToks(b))];if(!A.length||!B.length)return false;const hit=w=>B.some(v=>v===w||(w.length>=5&&v.length>=5&&(v.startsWith(w)||w.startsWith(v)||v.slice(0,6)===w.slice(0,6))));return A.filter(hit).length/Math.min(A.length,B.length)>=0.5}
function calDedup(out){const kit=out.filter(e=>e.src==="kita"||e.src==="own"&&e.tag==="kita");if(!kit.length)return out;const split=(S.food&&S.food.ext&&S.food.ext.fwsplit)||{};
  return out.filter(e=>{if(e.src!=="ext"||split[e.fw])return true;const k=kit.find(x=>x.d===e.d&&dupSame(x.name.replace(/^Kita: /,""),e.name));if(!k)return true;if(!k.t&&e.t){k.t=e.t;k.te=e.te||""}if(e.place&&!k.place)k.place=e.place;if(!k.fwdup){k.fwdup=e.fw;if(k.id)(S._fwdup=S._fwdup||{})[k.id]=e.fw}return false})}
function calEvents(a,z){let out=[];CAL_SRC.forEach(f=>{try{out.push(...f(a,z))}catch(_){}});try{out=calDedup(out)}catch(_){}return out.sort((x,y)=>(x.d+(x.t||"99")+(x.src==="food"?"1":"0"))<(y.d+(y.t||"99")+(y.src==="food"?"1":"0"))?-1:1)}
function evRow(e,showDay){if(e.ed){(S._calEd=S._calEd||{})[e.ed+"@"+e.d]=S._calEd[e.ed]={fw:e.fwdup||"",name:e.name,icon:e.icon||"",d:e.d,t:e.t||"",src:e.src,go:e.attr||(e.pack?'data-gopack="'+esc(e.pack)+'"':'data-nav="'+esc(e.nav||"")+'"')}}const who="";const day=showDay?`<span class="t">${esc(dLabel(e.d))}</span>`:`<span class="t">${esc(e.t||"")}${e.te?`<small>bis ${esc(e.te)}</small>`:e.ad&&!e.t?`<small>ganztägig</small>`:""}</span>`;
  const body=`<span>${pDot(e.who)}${e.icon?e.icon+" ":""}${esc(e.name)}${showDay&&(e.t||e.te)?` <span class="freq">${esc(e.t||"")}${e.te?" bis "+esc(e.te):""}</span>`:showDay&&e.ad?` <span class="freq">ganztägig</span>`:""}${who?`<span class="freq">${who}</span>`:""}${e.note&&e.src!=="ext"?`<br><span class="freq">${telNote(e.note)}</span>`:""}</span>`;
  const gift=e.icon==="🎂"?`<button class="catbtn" data-nav="geschenke|" aria-label="Geschenkideen ansehen" style="background:none;border:none">🎁</button>`:"";
  return `<li data-who="${esc(e.who||"both")}"${whoStripe(e.who)}${e.tent?' class="tent"':""} aria-label="${esc(whoLabel(e.who||"both"))}${e.tent?", noch offen":""}">${day}${e.tent?`<button class="ev" data-chopen="termin|${esc(e.id)}" data-lpter="${esc(e.id)}">${body}</button>${e.place?transitA(e.place,0,e):`<i class="freq">🗳️</i>`}`:e.src==="own"?`<button class="ev" data-teredit="${esc(e.id)}">${body}</button>${careEv(e)}${gift}${e.link&&safeLink(e.link)?`<a class="catbtn routebtn" href="${esc(safeLink(e.link))}" target="_blank" rel="noopener" aria-label="Webseite">🔗</a>`:""}${e.place?transitA(e.place,0,e):placeHint(e)}${telA(e.note)}<button class="catbtn" data-terbell="${esc(e.id)}" aria-pressed="${!!e.remind}" aria-label="${esc(e.name)}: ${e.remind?"nicht mehr erinnern":"erinnern"}" style="background:none;border:none;${e.remind?"":"opacity:.35"}">🔔</button><button class="catbtn" data-terrm="${esc(e.id)}" aria-label="${esc(e.name)} löschen" style="background:none;border:none;opacity:.6">✕</button>`:e.attr?`<button class="ev" ${e.ed?`data-caled="${esc(e.ed)}" data-cald="${esc(e.d)}"`:e.attr}>${body}</button><i class="freq">›</i>`:e.fw?`<button class="ev" data-fwpick="${esc(e.fw)}">${body}</button>${careEv(e)}${e.place?transitA(e.place,0,e):`<i class="freq">›</i>`}`:e.pack?`<button class="ev" ${e.ed?`data-caled="${esc(e.ed)}" data-cald="${esc(e.d)}"`:`data-gopack="${esc(e.pack)}"`}>${body}</button><i class="freq">›</i>`:e.nav?`<button class="ev" ${e.ed?`data-caled="${esc(e.ed)}" data-cald="${esc(e.d)}"`:`data-nav="${esc(e.nav)}"`}>${body}</button>${e.place?transitA(e.place,0,e):`<i class="freq">›</i>`}`:`<span class="ev">${body}</span>`}</li>`}
function terDraftOf(x){return {id:x.id,name:x.name||"",date:x.date||"",to:x.to||"",time:x.time||"",tend:x.tend||"",allday:!!x.allday,who:x.who||"both",rep:x.rep||"",note:x.note||"",place:x.place||"",link:x.link||"",remind:x.remind||null,care:x.care||"",tag:x.tag||"",kk:x.kk||"",mk:x.mk||"",alt:altOf(x).map(o=>({date:o.date,time:o.time||"",tend:o.tend||""})),ask:x.ask&&altOf(x).length?x.ask.who||"":"",askdue:x.ask&&x.ask.due||""}}
// Mehrere Möglichkeiten (29c-auswahl.js): weitere Tage/Zeiten, wer auswählt (auch man selbst oder beide), Frist
function terAltHtml(d){const alt=d.alt||[],pn=k=>esc(pname(k));if(d.rep)return "";
  return `${alt.map((o,j)=>`<div class="teralt"><label class="fld" style="flex:1"><span>Möglichkeit ${j+2}</span><input type="date" data-teralt="${j}" data-k="date" value="${esc(o.date||"")}"></label>${d.allday?"":`<label class="fld" style="flex:1"><span>Von</span><input type="time" data-teralt="${j}" data-k="time" value="${esc(o.time||"")}"></label><label class="fld" style="flex:1"><span>Bis</span><input type="time" data-teralt="${j}" data-k="tend" value="${esc(o.tend||"")}"></label>`}<button type="button" class="catbtn" data-teraltrm="${j}" aria-label="Möglichkeit ${j+2} entfernen" style="background:none;border:none">✕</button></div>`).join("")}
    ${d.id&&alt.length&&!d.ask&&termine().some(y=>y.id===d.id&&!y.ask)?`<div class="btnrow" style="margin-top:0"><button type="button" class="ghost small" data-chopen="termin|${esc(d.id)}">🗳️ Andere Möglichkeit nehmen oder Wahl aufheben</button></div>`:""}
    ${alt.length<4?`<div class="btnrow" style="margin-top:0"><button type="button" class="ghost small" data-act="teraltadd">＋ Weitere Möglichkeit</button></div>`:""}
    ${alt.length?`<div class="fld"><span>🗳️ Wer wählt aus</span><div class="unl">${[["p0",pn("p0")+(S.me==="p0"?" (ich)":"")],["p1",pn("p1")+(S.me==="p1"?" (ich)":"")],["both","Beide stimmen ab"],["","Steht fest (Möglichkeit 1)"]].map(o=>`<button type="button" class="chipbtn neutral" data-terask="${o[0]}" aria-pressed="${(d.ask||"")===o[0]}">${o[1]}</button>`).join("")}</div></div>
    ${d.ask?`<label class="fld"><span>Frist (optional)</span><input type="date" data-terf="askdue" value="${esc(d.askdue||"")}"></label>`:""}`:""}`}
function renderTerForm(){const d=S.terDraft,pn=k=>esc(pname(k)),many=(d.alt||[]).length;
  return `<section class="card"><div class="section-head"><h2>${d.id?"Termin ändern":"Neuer Termin"}</h2></div><form id="terform" novalidate>
    <label class="fld"><span>Was</span><input id="ter-name" data-terf="name" value="${esc(d.name)}" maxlength="80" placeholder="z. B. Zahnarzt" autocomplete="off"></label>
    <label class="fld"><span>${many?"Möglichkeit 1":"Tag"}</span><input type="date" data-terf="date" value="${esc(d.date)}"></label>
    <div class="terwhen">${d.allday?"":`<label class="fld" style="flex:1"><span>Von</span><input type="time" data-terf="time" value="${esc(d.time)}"></label><label class="fld" style="flex:1"><span>Bis (optional)</span><input type="time" data-terf="tend" value="${esc(d.tend||"")}"></label>`}<button type="button" class="chipbtn neutral" data-act="terallday" aria-pressed="${!!d.allday}">☀️ Ganztägig</button></div>
    ${terAltHtml(d)}
    ${d.rep||many?"":`<label class="fld"><span>Letzter Tag (nur bei mehreren Tagen)</span><input type="date" data-terf="to" value="${esc(d.to||"")}" min="${esc(d.date)}"></label>`}
    ${terTagHtml(d)}
    ${d.tag==="arzt"&&whoL(d.who).includes("kid")?`<div class="fld"><span>Art beim Kind</span><div class="unl">${KID_MED.map(c=>`<button type="button" class="chipbtn neutral" data-termk="${c[0]}" aria-pressed="${(d.mk||"")===c[0]}">${c[1]} ${c[2]}</button>`).join("")}</div><div class="freq">Steht auch unter Kind › Gesundheit.</div></div>`:""}${d.tag==="kita"?`<div class="fld"><span>Kita-Art</span><div class="unl">${KITA_KK.map(c=>`<button type="button" class="chipbtn neutral" data-terkk="${c[0]}" aria-pressed="${d.kk===c[0]}">${c[1]}</button>`).join("")}</div>${d.kk==="mit"?`<div class="freq">Steht die Woche davor unter Kita › Mitbringen.</div>`:d.kk==="zu"?`<div class="freq">An dem Tag wird niemand zum Bringen und Holen eingeteilt.</div>`:""}</div>`:""}
    ${d.id&&(S._fwdup||{})[d.id]?`<div class="freq">🔗 Steht auch in Familywall, im Kalender nur einmal gezeigt. <button type="button" class="linkish" data-fwsplit="${esc(S._fwdup[d.id])}">↔ Doch getrennt zeigen</button></div>`:""}
    <div class="fld"><span>Für wen</span><div class="unl">${[["both","Alle"],["p0",pn("p0")],["p1",pn("p1")],["kid","Kind"]].map(o=>`<button type="button" class="chipbtn neutral" data-terwho="${o[0]}" aria-pressed="${o[0]==="both"?!whoL(d.who).length:whoL(d.who).includes(o[0])}">${o[1]}</button>`).join("")}</div><div class="freq">Mehrere gehen, z. B. Kind und ${pn(S.me||"p0")}.</div></div>
    <div class="fld"><span>🧠 Kümmert sich</span><div class="unl">${careOpts().map(o=>`<button type="button" class="chipbtn neutral" data-tercare="${o[0]}" aria-pressed="${(d.care||"")===o[0]}">${esc(o[1])}</button>`).join("")}</div><div class="freq">🔔 und Handy-Erinnerung gehen dann nur an diese Person.</div></div>
    <div class="fld"><span>Wiederholen</span><div class="unl">${[["","Nein"],["w","Jede Woche"],["m","Jeden Monat"],["y","Jedes Jahr"]].map(o=>`<button type="button" class="chipbtn neutral" data-terrep="${o[0]}" aria-pressed="${(d.rep||"")===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <div class="fld"><span>🔔 Erinnern</span><div class="unl">${[["","Nein"],["tag","Am Tag"],["1d","1 Tag vorher"],["1h","1 Stunde vorher"]].map(o=>`<button type="button" class="chipbtn neutral" data-terrem="${o[0]}" aria-pressed="${(d.remind===true?"tag":d.remind||"")===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <label class="fld"><span>Wo</span><input data-terf="place" value="${esc(d.place||"")}" maxlength="120" placeholder="z. B. Kita oder Adresse" autocomplete="off"></label>${placeChips(d.place||"")}
    <label class="fld"><span>Notiz</span><input data-terf="note" value="${esc(d.note)}" maxlength="200" autocomplete="off"></label>
    ${d.id?geldSrcRow("ter:"+d.id,{name:d.name||"",cat:(c=>c==="sonst"?"frei":c)(geldGuess(d.name||"")),date:d.date||ymd(new Date())}):""}
    <div class="btnrow"><button class="primary" type="submit">Speichern</button><button class="ghost" type="button" data-act="tercancel">Abbrechen</button></div>${d.id?maskFoot(terPlusRow(listOf(S.food.termin).find(x=>x.id===d.id))+verkHtml("ter",d.id,listOf(S.food.termin).find(x=>x.id===d.id)),"",`data-terrm="${esc(d.id)}"`):""}</form></section>`}
function calWhoRow(){const w=S.calWho||"",me=S.me,oth=me==="p0"?"p1":me==="p1"?"p0":"";const o=[["","Alle"]].concat(me?[[me,"Ich"],[oth,pname(oth)]]:[["p0",pname("p0")],["p1",pname("p1")]]).concat([["kid",kidName()]]);
  return `<div class="unl calwho" role="group" aria-label="Für wen">${o.map(x=>`<button class="chipbtn neutral" data-calwho="${x[0]}" aria-pressed="${w===x[0]}">${x[0]?pDot(x[0]):""}${esc(x[1])}</button>`).join("")}</div>`}
function calFilters(){const off=S.calOff||[],E=(S.food&&S.food.ext)||{},P=(E.fw&&E.fw.people)||{},M=E.fwmap||{},K=E.fwkw||{};
  let h=`<div class="section-head"><h2>Bereiche</h2><span><button class="ghost small" data-caloffall="1">Alle</button><button class="ghost small" data-caloffall="0">Keine</button></span></div>
  <div class="unl calf">${CAL_LBL.map(l=>`<button class="chipbtn neutral" data-caloff="${l[0]}" aria-pressed="${!off.includes(l[0])}">${l[1]} ${l[2]}</button>`).join("")}</div>`;
  if(Object.keys(P).length)h+=`<div class="section-head" style="margin-top:var(--sp3)"><h2>👪 Familywall: wer ist wer</h2></div><div class="freq">Familywall schreibt zu jedem Termin, wer ihn angelegt hat oder dabei ist. Leider nur mit dem Namen aus Familywall. Tippe hier einmal an, wer das bei euch ist. Danach steht bei allen Terminen dieser Person automatisch der richtige Name, und der Filter „Für wen“ oben wirkt auch für Familywall.</div>${Object.keys(P).map(hh=>{const ex=Object.values((E.fw&&E.fw.items)||{}).filter(x=>(x.a||[]).includes(hh)).slice(0,2).map(x=>x.name);return `<div class="fld"><span>„${esc(P[hh])}“ in Familywall${ex.length?`<br><span class="freq">z. B. ${ex.map(esc).join(", ")}</span>`:""}<br><span class="freq">Das ist bei uns:</span></span><div class="unl">${whoOpts().map(o=>`<button class="chipbtn neutral" data-fwmap="${hh}" data-v="${o[0]}" aria-pressed="${(M[hh]||"")===o[0]}">${pDot(o[0])}${esc(o[1])}</button>`).join("")}</div></div>`}).join("")}`;
  const kl=Object.keys(K).filter(k=>K[k]&&K[k].kw);if(kl.length)h+=`<div class="freq" style="margin-top:var(--sp2)">Regeln: ${kl.map(k=>`<span style="white-space:nowrap">„${esc(K[k].kw)}“ → ${esc(whoLabel(K[k].who))} <button class="ghost small" data-fwkwrm="${k}" aria-label="Regel löschen">✕</button></span>`).join(" ")}</div>`;
  const H=E.fwhide||{},hk=Object.keys(H).filter(k=>H[k]);if(hk.length)h+=`<div class="section-head" style="margin-top:var(--sp3)"><h2>🙈 Ausgeblendet</h2></div><div class="freq">Diese Familywall-Termine zeigt die App nicht (in Familywall bleiben sie).</div><div class="unl" style="margin-top:var(--sp1)">${hk.map(k=>`<button class="chipbtn neutral" data-fwunhide="${k}" aria-label="${esc(H[k].name||"")} wieder zeigen">${esc(H[k].name||"?")} ↺</button>`).join("")}</div>`;
  return h}
// Heute-Streifen (Florian 15.11.2026): oben im Kalender ohne Klick und Scrollen, Termine und To-dos von heute
function calTodayStrip(){const now=new Date(),k=ymd(now),ev=calShown(k,k).filter(e=>e.src!=="prio"),td=todoRows(true);
  return `<section class="card caltoday"><div class="section-head"><h2>Heute</h2><span class="freq">${WD2[now.getDay()]} ${now.getDate()}.${now.getMonth()+1}.${feiertag(k)?" · 🎉 "+esc(feiertag(k)):""}</span></div>${ev.length?`<ul class="evlist">${ev.map(e=>evRow(e,false)).join("")}</ul>`:`<div class="freq">Keine Termine.</div>`}${td?`<div class="tagcard">${td}</div>`:""}</section>`}
function calDayCard(k,MN){const sd=ymdD(k),dl=calShown(k,k),u=inUrlaub(k);
  return `<section class="card"><div class="section-head"><h2>${esc(DAYN[(sd.getDay()+6)%7])}, ${sd.getDate()}. ${MN[sd.getMonth()]}</h2><button class="primary" data-act="ternew">＋ Termin</button></div>${dl.length?`<ul class="evlist">${dl.map(e=>evRow(e,false)).join("")}</ul>`:`<div class="freq">Nichts eingetragen.</div>`}${u?`<div class="freq" style="margin-top:6px">⛵ Urlaub: Wochenvorschlag lässt den Tag frei, Kita und Kurse sind ausgeblendet.</div>`:""}</section>`}
function renderCal(){if(S.terDraft)return renderTerForm();const today=ymd(new Date()),m0=S.calMonth||new Date(new Date().getFullYear(),new Date().getMonth(),1,12),sel=S.calDay||today,v=S.calView||(()=>{try{return localStorage.getItem("hq-calview2")}catch(_){return ""}})()||"liste";
  const MN=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  // Kalender = Planen (Florian 16.11.2026): Monat ganz auf den ersten Bildschirm, Heute steht im Dashboard
  const offN=(S.calOff||[]).length;let h=`<div class="calbars"><div class="calbar calviews"><div class="unl">${[["liste","Liste"],["monat","Monat"]].map(o=>`<button class="chipbtn neutral" data-calview="${o[0]}" aria-pressed="${v===o[0]}">${o[1]}</button>`).join("")}</div><button class="chipbtn" data-act="ternew">＋ Termin</button></div><div class="calbar calwhobar">${calWhoRow()}<button class="chipbtn neutral calfiltbtn" data-act="calfilt" aria-pressed="${!!S.calFiltOpen}" aria-label="Bereiche filtern${offN?", "+(CAL_LBL.length-offN)+" von "+CAL_LBL.length+" an":""}">⚙︎${offN?'<i class="dot"></i>':""}</button></div></div>`;
  if(S.calFiltOpen)h+=`<section class="card">${calFilters()}</section>`;
  // Liste (Florian 16.11.2026: Symbiose aus Woche und Liste): ab heute 60 Tage, kleine Wochen-Trenner, leere Tage nur in den nächsten 14 Tagen als schmale Zeile (Tipp = neuer Termin)
  if(v==="liste"||v==="woche"){const l=calShown(today,ymd(addDays(new Date(),60))),by={};l.forEach(e=>{(by[e.d]=by[e.d]||[]).push(e)});let lastW="",out="";
    for(let n=0;n<=60;n++){const d=addDays(new Date(),n),k=ymd(d),ev=by[k];if(!ev&&n>13)continue;const mon=mondayOf(d),{w}=isoWeek(mon);
      if(w+"|"+ymd(mon)!==lastW){lastW=w+"|"+ymd(mon);const su=addDays(mon,6);const fc=S.calScroll&&ymd(mon)===S.calScroll;if(fc){S.calScroll=null;setTimeout(()=>{const el=document.getElementById("calfocus");if(el)el.scrollIntoView({block:"start"})},0)}out+=`<div class="calwsep"${fc?' id="calfocus"':""}>KW ${w} · ${mon.getDate()}.${mon.getMonth()!==su.getMonth()?" "+MN[mon.getMonth()].slice(0,3)+".":""} bis ${su.getDate()}. ${MN[su.getMonth()].slice(0,3)}.</div>`}
      const fe=ferienAt(k),ft=feiertag(k),note=ft?`🎉 ${esc(typeof ft==="string"?ft:"Feiertag")}`:fe?`🏖️ ${esc(fe.name)}`:"";
      if(!ev){out+=`<button class="calfree${ft?" ft":fe?" fe":""}" data-calnew="${k}" aria-label="${esc(dLabel(k))} frei, Termin anlegen"><b>${DAYS[(d.getDay()+6)%7]} ${d.getDate()}.</b> · frei${note?` · <span>${note}</span>`:""}<i>＋</i></button>`;continue}
      out+=`<section class="card"><div class="section-head"><h2>${esc(dLabel(k))}</h2><span class="freq">${d.getDate()}. ${MN[d.getMonth()]}${fe&&!ft?" · 🏖️ "+esc(fe.name):""}</span></div><ul class="evlist">${ev.map(e=>evRow(e,false)).join("")}</ul></section>`}
    h+=out||`<div class="empty"><h2>Nichts in den nächsten 60 Tagen</h2><div>Mit Filtern sieht man vielleicht zu wenig.</div></div>`;
    return h}
  const first=mondayOf(m0),last=addDays(mondayOf(new Date(m0.getFullYear(),m0.getMonth()+1,0,12)),6),ev=calShown(ymd(first),ymd(last)),by={};ev.forEach(e=>{(by[e.d]=by[e.d]||[]).push(e)});
  h+=`<section class="card"><div class="section-head" style="align-items:center"><h2>${MN[m0.getMonth()]} ${m0.getFullYear()}</h2><div class="weeknav"><button class="iconbtn" data-calm="-1" aria-label="Voriger Monat">‹</button>${m0.getMonth()!==new Date().getMonth()||m0.getFullYear()!==new Date().getFullYear()?`<button class="ghost" data-calm="0">Heute</button>`:""}<button class="iconbtn" data-calm="1" aria-label="Nächster Monat">›</button></div></div>
    <div class="cal">${["Mo","Di","Mi","Do","Fr","Sa","So"].map(x=>`<span class="cw">${x}</span>`).join("")}`;
  for(let d=first;d<=last;d=addDays(d,1)){const k=ymd(d),l=(by[k]||[]),ws=[...new Set(l.filter(e=>e.src!=="food"&&e.src!=="reise"&&e.src!=="frei").flatMap(e=>whoL(e.who).length?whoL(e.who):["both"]))].sort((a,b)=>["p0","p1","kid","both"].indexOf(a)-["p0","p1","kid","both"].indexOf(b)),u=l.some(e=>e.src==="reise");
    h+=`<button data-calday="${k}" class="${d.getMonth()!==m0.getMonth()?"out ":""}${k===today?"today ":""}${u?"urlaub ":""}${feiertag(k)?"ft ":ferienAt(k)?"fe":""}" aria-pressed="${k===sel}" aria-label="${d.getDate()}. ${MN[d.getMonth()]}${u?", Urlaub":""}${l.length?", "+l.length+" Einträge":""}"><span>${d.getDate()}</span><span class="dots">${ws.slice(0,4).map(x=>l.filter(e=>(e.who||"both")===x).every(e=>e.tent)?`<i class="tent" style="border-color:${PCOL[x]}"></i>`:`<i style="background:${PCOL[x]}"></i>`).join("")}</span></button>`}
  h+=`</div></section>`;
  h+=calDayCard(sel,MN);
  // Demnächst geht mit dem gewählten Tag mit (Florian 19.11.2026: „Ich klicke am 10.11 auf den 6.1. dann soll demnächst auch ab da Anzeigen“); früher als heute zählt als heute
  const upF=sel&&sel>today?sel:today,upD=ymdD(upF),up=calShown(upF,ymd(addDays(upD,21))).filter(e=>e.src!=="food"&&e.src!=="reise"&&e.d!==sel).slice(0,12);
  const upT=upF===today?"Demnächst":`Demnächst ab ${upD.getDate()}. ${MN[upD.getMonth()].slice(0,3)}.`,upBack=upF===today?"":`<button class="ghost" data-calday="${today}" data-calview="1">↺ Ab heute</button>`;
  if(up.length||upBack)h+=`<section class="card calup"><div class="section-head"><h2>${upT}</h2>${upBack}</div>${up.length?`<ul class="evlist">${up.map(e=>evRow(e,true)).join("")}</ul>`:`<div class="freq">In den drei Wochen danach steht nichts.</div>`}</section>`;
  h+=`<div class="freq" style="text-align:center">Ein Handy-Kalender kann später hier andocken.</div>`;
  return h}
// Woche kompakt (Florian 17.11.2026, „Alle drei nacheinander“, Bild /mnt/project-files/design/woche-kompakt-live.png): Wochenstand als schlichte Karte,
// Abschnitte als Klapp-Karten (Stand je Gerät in hq-tfold, Schlüssel wk_<id>), Aufgaben als Zeilen mit Kreisen. Täglich zeigt nur den Kreis von heute,
// Tipp auf den Namen klappt die ganze Aufgabe mit allen Tagen auf (S.wtOpen). „Diese Woche“ zeigt erst 6 Zeilen (S.wkMore).
function wkFold(id,title,n,body,def){const k="wk2_"+id,on=tFoldOn(k,def);return `<section class="card tfold wkfold section" id="sec-${id}"><button class="setsum" data-tfold="${k}" data-tdef="${def?1:0}" aria-expanded="${on}"><h2>${title}${n?` <span class="freq">(${n})</span>`:""}</h2><i>${on?"▾":"›"}</i></button>${on?`<div class="tfoldb">${body}</div>`:""}</section>`}
const wkWho=(o,isRot)=>`<span class="owner wtw ${o==="p0"||o==="p1"?o:""}">${isRot?"↻ ":""}${esc(o==="p0"||o==="p1"?pname(o):OWNER_LABEL[o]||"")}</span>`;
function renderWeek(){
  const mon=S.view,wk=wkKey(mon),cur=mondayOf(new Date()),isCur=+mon===+cur;
  const today=isCur?(new Date().getDay()+6)%7:(mon<cur?7:-1);
  const split=rotSplit(),tk=ticksOf(wk);
  const {w}=isoWeek(mon);
  // Laufende Woche: Titel und KW stehen in der Kopf-Karte, oben bleibt nur die Leiste zum Blättern
  let h=`<div class="top${isCur?" wktop":""}"><div>${isCur?`<h1 class="sr">Diese Woche</h1>`:`<h1>${mon<cur?"Rückblick":"Vorschau"}</h1>`}<div class="wkdate">KW ${w} · ${fmt(mon,{day:"numeric",month:"short"})} – ${fmt(addDays(mon,6),{day:"numeric",month:"short"})}</div></div>
   <div class="weeknav"><button class="iconbtn" data-prionew="woche" aria-label="Erinnerung anlegen">🔔</button><button class="iconbtn" data-wknav="-1" aria-label="Vorige Woche">‹</button>${isCur?"":`<button class="ghost" data-wknav="0">Heute</button>`}<button class="iconbtn" data-wknav="1" aria-label="Nächste Woche" ${+mon>=+addDays(cur,28)?"disabled":""}>›</button></div></div>`;
  if(!isCur)h+=`<div class="wkro">${mon<cur?(S.wkEdit===wk?`✏️ Nachtragen ist an. <button class="ghost" data-act="wkedit">Fertig</button>`:`🗄️ Archiv: diese Woche ist nur zum Ansehen. <button class="ghost" data-act="wkedit">✏️ Nachtragen</button>`):`🔭 Vorschau: Hausdienst kannst du schon eintragen, abhaken geht erst in der Woche selbst.`}</div>`;
  if(!S.me)h+=meChooser();
  const cnt={all:[0,0],p0:[0,0],p1:[0,0]};
  tasks().forEach(t=>{if(group(t.freq)!=="week"||t.owner!=="rot")return;const o=ownerFor(t,mon,split);const n=slotsOf(t);
    for(let i=0;i<n;i++){const d=tk[t.id+"__"+i]?1:0;cnt.all[0]+=d;cnt.all[1]++;if(o==="p0"||o==="p1"){cnt[o][0]+=d;cnt[o][1]++}}});
  const mine=S.filter==="meine"&&S.me;
  // Wochenstand (nur Wechsel-Aufgaben; bei „Mein Bereich“ meine Wechsel- und festen Aufgaben)
  let sd,sn,sub;
  if(mine){const m={rot:[0,0],fix:[0,0]};
    tasks().forEach(t=>{if(group(t.freq)!=="week")return;const k=t.owner==="rot"?(ownerFor(t,mon,split)===S.me?"rot":null):(t.owner===S.me?"fix":null);if(!k)return;
      const n=slotsOf(t);for(let i=0;i<n;i++){m[k][0]+=tk[t.id+"__"+i]?1:0;m[k][1]++}});
    sd=m.rot[0]+m.fix[0];sn=m.rot[1]+m.fix[1];sub=`Mein Stand · im Wechsel ${m.rot[0]}/${m.rot[1]} · fest ${m.fix[0]}/${m.fix[1]}`}
  else{sd=cnt.all[0];sn=cnt.all[1];sub=`Wochenstand${isCur?"":mon<cur?" (Rückblick)":" (Vorschau)"} · ${esc(pname("p0"))} ${cnt.p0[0]}/${cnt.p0[1]} · ${esc(pname("p1"))} ${cnt.p1[0]}/${cnt.p1[1]}`}
  // Laufende Woche (Florian 19.11.2026, „2: Heute im Wochenkopf“): Kopf-Karte in Marine mit „Heute für dich“, direkt abhakbar; dieselben Haken wie in den Abschnitten
  const HL=isCur?heuteList():[],hOpen=heuteFix(HL).filter(x=>!x.done).length;
  h+=isCur?`<section class="campback dash wkpanel wkstand wkheute" aria-label="Wochenstand und heute">${panelHead(`Diese Woche · KW ${w}`,`${sn-sd>0?`Noch ${sn-sd} offen`:"Alles erledigt"}, ${hOpen} heute`,esc(sub),bweekRing())}`:`<section class="card wkstand" aria-label="Wochenstand"><div class="wkhead"><div><b>${sn-sd>0?`Noch ${sn-sd} offen`:"Alles erledigt"}</b><div class="freq">${sub}</div></div><span class="num wkn">${sd}/${sn}</span></div>`;
  h+=`<div class="unl scrollrow wkf" role="group" aria-label="Ansicht"><button class="chipbtn neutral" data-filter="alle" aria-pressed="${S.filter==="alle"}">Alle</button><button class="chipbtn neutral" data-filter="meine" aria-pressed="${S.filter==="meine"}">Mein Bereich</button><button class="chipbtn neutral" data-act="hidedone" aria-pressed="${S.hideDone}">Erledigte ausblenden</button><button class="chipbtn neutral" data-act="groupby" aria-pressed="${S.groupBy==="art"}">Fest und Wechsel bündeln</button></div>
    ${S.filter==="meine"&&!S.me?`<div class="notice">Wähle oben aus, wer du bist, damit „Mein Bereich“ funktioniert.</div>`:""}${isCur?`<div class="hhead">Heute für ${S.me?"dich":"euch"}</div>${HL.length?`<ul class="hlist">${heuteRows(HL)}</ul>`:`<div class="hnone">${inUrlaub(new Date())?"⛵ Urlaub: Haushalt und Nach Bedarf ruhen heute.":"Heute ist nichts dran."}</div>`}`:""}</section>`;
  if(sn&&sd>=sn)h+=`<div class="celebrate">${mine?"Du hast alle deine Aufgaben für diese Woche erledigt.":"Alle Wechsel-Aufgaben dieser Woche sind erledigt."}</div>`;

  const FO={day:0,week:1,month:2,half:3,year:4};
  const card=t=>{const f=t.freq,o=ownerFor(t,mon,split),isRot=t.owner==="rot";let html,doneAll,pct;const sl=[];let c=0,n=1,pb="",pinfo="";const TK={},isTk=v=>!!v&&(o==="p0"||o==="p1")&&(v.by==="p0"||v.by==="p1")&&v.by!==o,tkTxt=()=>Object.keys(TK).map(p=>`↔ ${esc(pname(p))} hat ${TK[p]}× übernommen`).join(" · ");
    if(f==="day"||f==="week"){n=slotsOf(t);const isHO=t.owner==="ho",isBoth=t.owner==="both";let slots="";
      for(let i=0;i<n;i++){const k=t.id+"__"+i;const cls=["slot"];let lbl=f==="day"?DAYS[i]:"",aria="",on=false,tl="";
        if(isBoth){const leg=tk[k],a=tk[k+"_p0"]||(leg&&leg.by==="p0"?leg:null),b=tk[k+"_p1"]||(leg&&leg.by==="p1"?leg:null);
          c+=(a?0.5:0)+(b?0.5:0);cls.push("split");if(a)cls.push("h0");if(b)cls.push("h1");if(a&&b)lbl="✓";on=!!(a&&b);
          aria=(a?" "+esc(pname("p0"))+" erledigt":"")+(b?" "+esc(pname("p1"))+" erledigt":"")}
        else{const v=tk[k];if(!isHO&&!hasSubs(t)&&isTk(v)){c++;on=true;TK[v.by]=(TK[v.by]||0)+1;cls.push("on",v.by,"took");tl=lbl=`<span>${esc(pname(v.by).charAt(0))}</span>`;aria=" übernommen von "+esc(pname(v.by))}else if(v){c++;on=true;cls.push("on",isHO?(v.by==="x"?"x":v.by):"chk");lbl=isHO?(v.half==="vm"?`<span class="hohalf">${esc(pname(v.by).charAt(0))}/${esc(pname(v.by==="p0"?"p1":"p0").charAt(0))}</span>`:`<span>${esc(v.by==="x"?(v.lbl||"X").slice(0,2):pname(v.by).charAt(0))}${v.part?`<sup>${v.part==="ab"?1:2}</sup>`:""}</span>`):"✓";aria=" erledigt von "+esc(v.by==="x"?(v.lbl||"X"):pname(v.by))+(v.half==="vm"?" vormittags, "+esc(pname(v.by==="p0"?"p1":"p0"))+" nachmittags":v.part==="ab"?", holt nachmittags ab":v.part==="br"?", bringt morgens":"")}}
        if(f==="day"){if(i===today)cls.push("today");if(i>today)cls.push("future");if(isHO)cls.push("hoslot")}
        if(hasSubs(t)&&!isBoth&&!isHO){const g=`<div class="subgrp${on?" all":""}" role="group" aria-label="${esc(t.name)} ${f==="day"?DAYS[i]:(i+1)+". Mal"}">${n>1?`<span class="subn">${f==="day"?DAYS[i]:(i+1)+"."}</span>`:""}${t.subs.map((sn,j)=>{const sv=tk[k+"_s"+j],st=isTk(sv);if(st)TK[sv.by]=(TK[sv.by]||0)+1;return `<button class="subbtn${sv?" on":""}${st?" took "+sv.by:""}" data-task="${esc(t.id)}" data-slot="${i}" data-sub="${j}" aria-pressed="${!!sv}" aria-label="${esc(sn)}${sv?(st?" übernommen von ":" erledigt von ")+esc(pname(sv.by)):""}">${sv?"✓ ":""}${esc(sn)}${st?` <b class="tookb">${esc(pname(sv.by).charAt(0))}</b>`:""}</button>`}).join("")}</div>`;slots+=g;sl.push(g);continue}
        const btn=(extra,l)=>`<button class="${cls.join(" ")}${extra}" data-task="${esc(t.id)}" data-slot="${i}" ${isBoth?'data-split="1"':""} ${f==="day"&&i>today&&!isHO?"disabled":""} aria-pressed="${on}" aria-label="${esc(t.name)} ${f==="day"?DAYS[i]:(i+1)+". Mal"}${aria}">${l}</button>`;
        slots+=isHO?`<span class="hocol${i===today?" today":""}"><small>${DAYS[i]}</small>${btn("",on?lbl:"＋")}</span>`:btn("",lbl);sl.push(btn(" wsl",on?(isHO?lbl:tl||"✓"):""))}
      doneAll=c>=n;pct=n?c/n:0;const cs=(c%1?String(c).replace(".",","):c);
      html=`<article class="task${doneAll?" done":""}"><div class="task-top"><div><div class="task-title">${esc(t.name)}</div><div class="meta">${ownerChip(o,isRot)}<span class="freq">${f==="day"?"täglich":n+"× pro Woche"} · ${cs}/${n}</span></div>${tkTxt()?`<div class="freq tookinfo">${tkTxt()}</div>`:""}</div></div><div class="slots">${slots}</div>${taskLink(t)}${isBoth?`<div class="freq">Jeder hakt seine Hälfte ab: links ${esc(pname("p0"))}, rechts ${esc(pname("p1"))}.</div>`:""}</article>`;
    }else{const pt=periodTick(t,mon);doneAll=!!pt;const ptk=pt&&isTk(pt.v);pct=doneAll?1:0;if(!pt&&!periodDue(t,mon))return {t,o,html:"",done:false,later:periodMid(f,mon),pct:0,times:1,sl,c:0,n:1};
      const lbl=pt?`✓ ${ptk?"Übernommen":"Erledigt"} von ${esc(pname(pt.v.by))} am ${fmt(new Date(pt.v.at),{day:"numeric",month:"short"})}`:"○ Als erledigt markieren";
      pb=`<button class="slot wsl${pt?" on chk":""}" data-task="${esc(t.id)}" data-slot="p" aria-pressed="${doneAll}" aria-label="${esc(t.name)}${pt?" erledigt":" als erledigt markieren"}">${pt?"✓":""}</button>`;
      pinfo=pt?`${ptk?"↔ ":""}${esc(pname(pt.v.by))}, ${fmt(new Date(pt.v.at),{day:"numeric",month:"short"})}`:"";
      html=`<article class="task${doneAll?" done":""}"><div class="task-top"><div><div class="task-title">${esc(t.name)}</div><div class="meta">${ownerChip(o,isRot)}<span class="freq">${FREQ_LABEL[f]}</span></div></div></div><div><button class="bigcheck${pt?" on chk":""}" data-task="${esc(t.id)}" data-slot="p" aria-pressed="${doneAll}">${lbl}</button></div>${taskLink(t)}</article>`}
    return {t,o,isRot,html,done:doneAll,pct,times:slotsOf(t),sl,c,n,pb,pinfo,took:tkTxt(),subs:hasSubs(t)&&t.owner!=="both"&&t.owner!=="ho"}};
  // Eine Zeile: Name (Tipp klappt die ganze Aufgabe auf), wer, Kreise
  const row=x=>{const t=x.t,op=S.wtOpen===t.id,f=t.freq;let circ="",info="";
    if(f==="day"){if(today>=0&&today<7)circ=x.sl[today]||"";else circ=`<span class="freq num">${x.c%1?String(x.c).replace(".",","):x.c}/7</span>`}
    else if(f==="week"){if(!x.subs)circ=x.sl.join("")}
    else{circ=x.pb;info=x.pinfo}
    const subs=x.subs&&!op?`<div class="wtsubs">${x.sl.join("")}</div>`:"";
    return `<div class="wt${x.done?" done":""}${op?" open":""}"><div class="wtl"><button class="wtn" data-wtopen="${esc(t.id)}" aria-expanded="${op}"><b>${esc(t.name)}</b></button><div class="wtm">${wkWho(x.o,x.isRot)}${info?`<span class="freq">${info}</span>`:""}${taskLink(t,true)}</div>${x.took&&!op?`<div class="freq tookinfo">${x.took}</div>`:""}${subs}</div>${op?"":`<span class="wtc">${circ}</span>`}</div>${op?`<div class="wtx">${x.html}<button class="linkish" data-wtopen="${esc(t.id)}">Zuklappen</button></div>`:""}`};
  const vis=x=>!(S.filter==="meine"&&S.me&&!(x.o===S.me||x.o==="both"||x.o==="ho"))&&!(S.hideDone&&x.done);
  const order=(a,b)=>FO[a.t.freq]-FO[b.t.freq]||b.times-a.times||a.pct-b.pct;
  const secs=S.groupBy==="art"
    ?[["rot","↻ Wechsel-Aufgaben",t=>t.owner==="rot",0],["fix","📌 Feste Aufgaben",t=>t.owner==="p0"||t.owner==="p1",0],["gem","🤝 Gemeinsam",t=>t.owner==="both",0]]
    :[["day",isCur?"☀️ Heute":"☀️ Täglich",t=>t.freq==="day",0],["week","📅 Diese Woche",t=>t.freq==="week",0],["long","🗓️ Monat, Halbjahr, Jahr",t=>t.freq==="month"||t.freq==="half"||t.freq==="year",0]];
  // Drei Bereiche (Florian 19.11.2026): Heute (Hausdienst und Tägliches von heute), Diese Woche (Wöchentliches, Tägliches der Woche, volle Nach-Bedarf-Aufgaben), Nach Bedarf: noch nicht dran
  const three=S.groupBy!=="art";let hoIn="";
  // Hausdienst immer als erster Abschnitt (Florian 15.11.2026), Filter blenden ihn nicht aus
  const ho=tasks().filter(t=>t.owner==="ho").map(card);
  if(ho.length){const hv=today>=0&&today<7?tk[ho[0].t.id+"__"+today]:null,hn=n=>esc(pname(n).charAt(0));
    const lab=!(today>=0&&today<7)?ho[0].c+" Tage eingetragen":!hv?"heute niemand":hv.by==="x"?"heute "+esc(hv.lbl||"jemand"):hv.half==="vm"?`heute ${hn(hv.by)} vorm. · ${hn(hv.by==="p0"?"p1":"p0")} nachm.`:"heute "+esc(pname(hv.by));
    const hoB=`${isCur?hoChkRows(ho[0].t,hv,today):""}<div class="hoein"><b>Einteilen</b><span class="freq">Wer hat wann den Dienst? Daraus folgt, wer bringt und holt.</span></div>${ho.map(x=>x.html.replace('<article class="task','<article class="task hotask')).join("")}<div class="freq hohint">Kurz tippen trägt dich ein, lange drücken: andere Person oder geteilt. <button class="linkish" data-nav="kita|">🚸 Bringen und Abholen ›</button></div>`;
    if(three)hoIn=`<div id="sec-ho" class="hoin"><div class="hoinh"><b>🔑 Hausdienst</b> <span class="freq">${lab}</span></div>${hoB}</div>`;else h+=wkFold("ho","🔑 Hausdienst",lab,hoB,0)}
  const dayX=[];
  secs.forEach(([id,title,fn0,def])=>{const fn=t=>t.owner!=="ho"&&fn0(t);const xs=tasks().filter(fn).map(card).filter(vis).sort(order);if(id==="day")dayX.push(...xs);
    const pre=three&&id==="day"?hoIn:"",post=three&&id==="week"&&isCur?needDueHtml()+(dayX.length?`<div class="wkdaily freq">☀️ Täglich in dieser Woche: ${dayX.map(x=>esc(x.t.name)+" "+(x.c%1?String(x.c).replace(".",","):x.c)+"/7").join(" · ")}</div>`:""):"";
    if(!xs.length&&!pre&&!post)return;
    const lt=xs.filter(x=>x.later),op=xs.filter(x=>!x.done&&!x.later),dn=xs.filter(x=>x.done);if(!op.length&&!dn.length&&!lt.length&&!pre&&!post)return;
    const lim=id==="week"&&!S.wkMore?6:99,all=op.concat(dn),shown=all.slice(0,lim),rest=all.length-shown.length;
    const so=shown.filter(x=>!x.done),sdn=shown.filter(x=>x.done);
    // Jeder Haken zählt (Florian 18.11.2026: „3 von 9 statt 0 von 3“)
    const hk=v=>v%1?String(v).replace(".",","):v,cur0=op.concat(dn),hD=cur0.reduce((a,x)=>a+(x.t.freq==="day"||x.t.freq==="week"?x.c:x.done?1:0),0),hN=cur0.reduce((a,x)=>a+x.n,0),
      tD=cur0.filter(x=>x.sl[today]&&/aria-pressed="true"/.test(x.sl[today])).length;
    const nlab=!xs.length?"":op.length+dn.length?(id==="day"&&isCur?`heute ${tD} von ${cur0.length} erledigt`:`${hk(hD)} von ${hN} erledigt`)+(lt.length?`, ${lt.length} erst ab Mitte`:""):`${lt.length}, erst ab Mitte`;
    const body=`${so.map(row).join("")}${sdn.length?`<div class="donesep">Erledigt</div>`+sdn.map(row).join(""):""}${rest>0?`<button class="linkish" data-act="wkmore">Noch ${rest} weitere zeigen</button>`:""}${lt.length?`<div class="laterline freq">⏳ Erst ab Mitte des Zeitraums: ${lt.map(x=>esc(x.t.name)+" (ab "+fmt(x.later,{day:"numeric",month:"numeric"})+")").join(", ")}</div>`:""}`;
    h+=wkFold(id,title,nlab||(pre?"Hausdienst":""),pre+body+post,def)});
  if(isCur)h+=needSection(three);
  h+=`<div class="freq wkhint">Kreise antippen hakt ab. Tipp auf den Namen zeigt alle Tage. Abschnitte bleiben auf diesem Handy auf oder zu.</div>`;
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
  h+=`<section data-fk="f_w8|0" class="card"><div class="section-head"><h2>Letzte 8 Wochen</h2><div class="legend"><span><i style="background:var(--p0)"></i>${esc(pname("p0"))}</span><span><i style="background:var(--p1)"></i>${esc(pname("p1"))}</span></div></div>
     <div class="chart" role="img" aria-label="Punkte pro Woche">${weeks.map(x=>`<div class="bar" title="${x.s.pts.p0} / ${x.s.pts.p1}"><i class="b1" style="height:${x.s.pts.p1/max*100}%"></i><i class="b0" style="height:${x.s.pts.p0/max*100}%"></i></div>`).join("")}</div>
     <div class="chart-x num">${weeks.map(x=>`<span>${x.s.pct>=GOAL?"★":""}KW${isoWeek(x.m).w}</span>`).join("")}</div>
     <div class="freq">★ = Wochenziel (${Math.round(GOAL*100)} %) erreicht</div></section>`;
  return h}

