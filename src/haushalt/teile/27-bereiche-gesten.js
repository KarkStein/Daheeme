// ---------- Alle Bereiche (Florian 16.11.2026): Tipp oben rechts öffnet alle Bereiche auf einem Bildschirm (lange auf Start öffnet seit 17.11.2026 den Fächer, siehe unten) ----------
// Karte nach Gruppen (Florian 16.11.2026 abends, Vorschlag A gewählt: „zu unübersichtlich, zu viele, vielleicht Farben“, aber alles zeigen): je Gruppe eine Karte in ihrer Farbe (AREA_GROUPS[i][3]),
// Bereiche groß mit Symbol, Unterseiten klein als Text, Quer als Knopf-Reihe unten über beide Spalten. Gespeist aus AREAS (neuer Bereich = eine Zeile dort), Zusätze in AR_EXTRA.
// Oben Angeheftet (lange auf einen Eintrag drücken, je Gerät hq-arfav) oder zuletzt Benutztes (hq-arrec). Tipp daneben, ✕ und Zurück schließen.
const AR_EXTRA={alltag:[[1,["📅","Kalender","woche|wp:3",[]]]],quer:[[0,["🏠","Start","camp|",[]]],[2,["🔍","Suche","suche|",[]]],[99,["❓","Glossar","settings|gl:",[]]]]};
const AR_COLS=[["essen","alltag","zuhause"],["wir","freizeit"]];
// Bereiche mit Seiten (AREA_PAGES): nur die Hauptseite steht groß da, die übrigen Seiten zuerst als Unterpunkte (in Quer bleiben alle als Knopf)
function arGroups(){return AREA_GROUPS.map(g=>{const q=g[0]==="quer",L=AREAS.filter(a=>a[6]===g[0]&&(q||!areaMain(a[2])||areaMain(a[2])===a[2])).map(a=>{const P=!q&&AREA_PAGES[a[2]],sub=a[5]().map(x=>[x[0],a[2]+"|"+x[1]]);return P?[P[0],P[1],a[2]+"|",areaSubPages(a[2]).concat(sub)]:[a[0],a[1],a[2]+"|",sub]});(AR_EXTRA[g[0]]||[]).forEach(([i,e])=>L.splice(i,0,e));return [g,L]})}
// Alle Ziele flach [Symbol, Name, Sprung] für Angeheftet/Zuletzt; Unterseiten mit allgemeinem Namen bekommen den Bereich davor
const arAll=()=>arGroups().flatMap(([g,L])=>L.flatMap(a=>[[a[0],a[1],a[2]]].concat(a[3].map(s=>[a[0],/^(Heute|Termine|Infos|Sonstiges)$/.test(s[0])?a[1]+" · "+s[0]:s[0],s[1]]))));
const arTile=v=>arAll().find(t=>t[2]===v);
function arLs(k){try{const a=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(a)?a.filter(arTile):[]}catch(_){return []}}
function arLsSet(k,a){try{localStorage.setItem(k,JSON.stringify(a))}catch(_){}}
// Welcher Eintrag zeigt gerade? Genaueste zuerst (mit Unterseite), sonst der Bereich
function arCur(){const on=t=>{const [tab,sub]=t[2].split("|"),[k,val]=(sub||"").split(":");
    if(k==="sp")return S.tab===val;if(k==="bl")return S.tab==="listen";if(S.tab!==tab)return false;
    if(k==="ft")return S.foodTab===val;if(k==="wp")return (S.weekPage|0)===(+val||0);if(k==="ks")return S.kitaSec===val;if(k==="tt")return S.tripTab===val;if(k==="pf")return S.projFilter===val;if(k==="gl")return false;
    if(tab==="woche")return !(S.weekPage|0);if(tab==="kita")return S.kitaSec==="termine";if(tab==="essen")return S.foodTab==="heute";if(PROJ_TABS.includes(tab))return !S.projFilter;return true};
  const L=arAll().filter(on),sub=L.find(t=>t[2].split("|")[1]);return sub?sub[2]:L.length?L[0][2]:null}
function arSeen(){const v=arCur();if(!v||S.arLast===v)return;S.arLast=v;const a=arLs("hq-arrec").filter(x=>x!==v);a.unshift(v);arLsSet("hq-arrec",a.slice(0,5))}
function arHtml(){const fav=arLs("hq-arfav"),rec=arLs("hq-arrec"),top=fav.length?fav:rec,cur=arCur(),cls=v=>"arit"+(v===cur?" on":"")+(fav.includes(v)?" fav":"");
  let h=`<div class="arbg"></div><div class="arsheet" role="dialog" aria-label="Alle Bereiche"><div class="arhead"><h2>Alle Bereiche</h2><button class="iconbtn argear" data-arnav="settings|" aria-label="Einstellungen"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg></button><button class="iconbtn" data-arx aria-label="Schließen">✕</button></div>`;
  h+=`<div class="artop"><span class="arlbl">${fav.length?"📌 Angeheftet":"🕘 Zuletzt"}</span>${top.length?top.map(v=>{const t=arTile(v);return `<button class="armpill ${cls(v)}" data-arnav="${v}">${t[0]} ${esc(t[1])}</button>`}).join(""):`<span class="freq">Lange auf einen Eintrag drücken heftet ihn hier an.</span>`}</div>`;
  const G=arGroups(),sec=x=>{if(!x)return "";const [g,L]=x;return `<section class="armg${g[0]==="quer"?" armq":""}" style="--gc:${g[3]||"var(--g-quer)"}"><h3>${g[1]} ${esc(g[2])}</h3>${g[0]==="quer"?`<div class="armqrow">${L.map(a=>`<button class="${cls(a[2])}" data-arnav="${a[2]}">${a[0]} ${esc(a[1])}</button>`).join("")}</div>`:L.map(a=>`<button class="armain ${cls(a[2])}" data-arnav="${a[2]}"><span>${a[0]}</span><b>${esc(a[1])}</b></button>${a[3].length?`<div class="armsubs">${a[3].map(s=>`<button class="${cls(s[1])}" data-arnav="${s[1]}">${esc(s[0])}</button>`).join("")}</div>`:""}`).join("")}</section>`};
  const by=id=>G.find(x=>x[0][0]===id),cols=AR_COLS.map(c=>c.slice());G.forEach(([g])=>{if(g[0]!=="quer"&&!cols.some(c=>c.includes(g[0])))(cols[0].length>cols[1].length?cols[1]:cols[0]).push(g[0])});
  h+=`<div class="armgrid">${cols.map(c=>`<div class="armcol">${c.map(id=>sec(by(id))).join("")}</div>`).join("")}</div>${sec(by("quer"))}</div>`;return h}
function arOpen(byPress){if(document.getElementById("allar"))return;if(byPress)try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}
  // Nach langem Drücken zählt erst ein neuer Tipp (der Finger liegt noch auf dem Reiter)
  S.ar={armed:!byPress,at:byPress?Date.now():0,pin:0};const el=document.createElement("div");el.id="allar";el.innerHTML=arHtml();document.body.appendChild(el);
  el.addEventListener("click",e=>{const a=S.ar;if(!a)return;if(!a.armed||Date.now()-a.at<300||Date.now()-a.pin<600){e.preventDefault();return}
    const t=e.target.closest("[data-arnav]");if(t){const v=t.dataset.arnav;arClose();goNav(v);return}
    if(e.target.closest("[data-arx]")||!e.target.closest(".arsheet"))arClose()});
  el.addEventListener("contextmenu",e=>{e.preventDefault();const t=e.target.closest(".arit");if(t)arPin(t.dataset.arnav)});
  let lt=null;el.addEventListener("touchstart",e=>{const t=e.target.closest(".arit");if(!t||e.touches.length!==1)return;const p=e.touches[0];lt={x:p.clientX,y:p.clientY,timer:setTimeout(()=>{lt=null;arPin(t.dataset.arnav)},500)}},{passive:true});
  el.addEventListener("touchmove",e=>{if(lt){const p=e.touches[0];if(Math.hypot(p.clientX-lt.x,p.clientY-lt.y)>10){clearTimeout(lt.timer);lt=null}}},{passive:true});
  el.addEventListener("touchend",()=>{if(lt){clearTimeout(lt.timer);lt=null}},{passive:true})}
function arPin(v){if(!S.ar)return;S.ar.pin=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}let f=arLs("hq-arfav");const had=f.includes(v);f=had?f.filter(x=>x!==v):f.concat(v).slice(-5);arLsSet("hq-arfav",f);
  const el=document.getElementById("allar");if(el){const sc=el.querySelector(".arsheet").scrollTop;el.innerHTML=arHtml();el.querySelector(".arsheet").scrollTop=sc}toast(had?"Gelöst.":"Angeheftet.")}
function arClose(){S.ar=null;const el=document.getElementById("allar");if(el)el.remove()}
// Der erste Finger-hoch nach dem Öffnen per langem Drücken schaltet die Seite scharf
document.addEventListener("touchend",()=>{if(S.ar&&!S.ar.armed){S.ar.armed=true;S.ar.at=Date.now()}},{passive:true});
document.addEventListener("pointerup",e=>{if(e.pointerType!=="touch"&&S.ar&&!S.ar.armed){S.ar.armed=true;S.ar.at=Date.now()}});
// ---------- Fenster schließen mit Zurück (Florian 16.11.2026): jedes Fenster (#mbox, #allar) legt einen eigenen Verlaufsschritt an ----------
const OVL=["mbox","allar","fan"];const ovlOpen=()=>OVL.some(id=>document.getElementById(id));
function ovlCloseAll(){mboxClose();arClose();fanClose()}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&ovlOpen())ovlCloseAll()});
new MutationObserver(()=>{const open=ovlOpen();
  if(open&&!S.ovl){S.ovl=true;try{if(!(history.state&&history.state.ov))history.pushState({ov:1},"")}catch(_){}}
  else if(!open&&S.ovl){S.ovl=false;setTimeout(()=>{try{if(!ovlOpen()&&history.state&&history.state.ov){navBusy=true;history.back()}}catch(_){}},0)}}).observe(document.body,{childList:true});
// ---------- Fächer (Florian 17.11.2026, „So bauen, Kachel bleibt“): lange auf Start = Familie und Zuhause, lange auf Einkauf = Freizeit und Gemerktes ----------
// Statt Alle Bereiche (die bleibt über die Kachel oben rechts und als Eintrag im Fächer). Einträge aus AREAS (Symbol, Name, Sprung). Nach dem langen Drücken
// kann der Finger auf einen Eintrag gleiten und dort loslassen; sonst bleibt der Fächer offen, Tipp auf einen Eintrag öffnet ihn, Tipp daneben oder Zurück schließt.
// Seit der Bündelung (Florian 17.11.2026, „A neu“): je Seite drei Bereiche, deren weitere Seiten als kleine Knöpfe daneben (FAN_SUB, sonst aus AREA_PAGES)
const FAN={camp:["Familie und Zuhause",["kind","privat","amhaus"]],einkauf:["Freizeit und Gemerktes",["ausflug","musik","projekte"]]};
const FAN_SUB={ausflug:[["Packlisten","ausflug|tt:packs"]]};
const fanItems=k=>FAN[k][1].map(t=>AREAS.find(a=>a[2]===t)).filter(Boolean).map(a=>{const P=AREA_PAGES[a[2]];return P?[P[0],P[1],a[2]+"|",areaSubPages(a[2])]:[a[0],a[1],a[4]||a[2]+"|",FAN_SUB[a[2]]||[]]});
function fanHtml(k){const tb=document.getElementById("tabs").getBoundingClientRect(),bt=document.querySelector(`#tabs [data-tab="${k}"]:not([hidden])`),r=bt?bt.getBoundingClientRect():null,cur=arCur();
  return `<div class="fanbg"></div>${r?`<div class="fanring" style="left:${Math.round(r.left+r.width/2-30)}px;top:${Math.round(r.top+4)}px"></div>`:""}<div class="fanlist" role="menu" aria-label="${esc(FAN[k][0])}" style="bottom:${Math.max(16,Math.round(innerHeight-tb.top+14))}px">${fanItems(k).map(t=>`<div class="fanrow"><button class="fanit${t[2]===cur?" on":""}" role="menuitem" data-fannav="${esc(t[2])}"><span>${t[0]}</span><b>${esc(t[1])}</b></button>${t[3].map(s=>`<button class="fansub${s[1]===cur?" on":""}" role="menuitem" data-fannav="${esc(s[1])}">${esc(s[0])}</button>`).join("")}</div>`).join("")}<button class="fanall" data-fanall>Alle Bereiche ›</button><div class="fanttl">${esc(FAN[k][0])}</div></div>`}
function fanOpen(k,byPress){if(document.getElementById("fan")||!FAN[k])return;if(byPress)try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}
  S.fan={k,armed:!byPress,at:byPress?Date.now():0};const el=document.createElement("div");el.id="fan";el.className=k==="einkauf"?"r":"l";el.innerHTML=fanHtml(k);document.body.appendChild(el);
  el.addEventListener("click",e=>{const f=S.fan;if(!f)return;if(!f.armed||Date.now()-f.at<300){e.preventDefault();return}
    const t=e.target.closest("[data-fannav]");if(t){fanGo(t.dataset.fannav);return}
    if(e.target.closest("[data-fanall]")){fanClose();arOpen();return}
    fanClose()})}
function fanGo(v){fanClose();goNav(v)}
function fanClose(){S.fan=null;const el=document.getElementById("fan");if(el)el.remove()}
const fanHit=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest("#fan [data-fannav],#fan [data-fanall]"):null};
document.addEventListener("touchmove",e=>{const f=S.fan;if(!f||f.armed)return;const p=e.touches[0],h=p&&fanHit(p.clientX,p.clientY);document.querySelectorAll("#fan .fanhot").forEach(x=>{if(x!==h)x.classList.remove("fanhot")});if(h)h.classList.add("fanhot")},{passive:true});
document.addEventListener("touchend",e=>{const f=S.fan;if(!f||f.armed)return;const p=e.changedTouches[0],h=p&&fanHit(p.clientX,p.clientY);
  if(h){if(h.dataset.fannav)fanGo(h.dataset.fannav);else{fanClose();arOpen()}return}f.armed=true;f.at=Date.now()},{passive:true});
document.addEventListener("pointerup",e=>{if(e.pointerType!=="touch"&&S.fan&&!S.fan.armed){S.fan.armed=true;S.fan.at=Date.now()}});
{let lp=null;const tabs=document.getElementById("tabs");
 const startBtn=t=>t&&t.closest&&t.closest('#tabs [data-tab="camp"],#tabs [data-tab="einkauf"]');
 const press=b=>{S.fanEat=Date.now();fanOpen(b.dataset.tab,true)};
 tabs.addEventListener("touchstart",e=>{const b=startBtn(e.target);if(!b||!S.gest.ring||e.touches.length!==1)return;const p=e.touches[0];lp={x:p.clientX,y:p.clientY,timer:setTimeout(()=>{lp=null;press(b)},450)}},{passive:true});
 document.addEventListener("touchmove",e=>{if(lp){const p=e.touches[0];if(Math.hypot(p.clientX-lp.x,p.clientY-lp.y)>12){clearTimeout(lp.timer);lp=null}}},{passive:true});
 const end=()=>{if(lp){clearTimeout(lp.timer);lp=null}};document.addEventListener("touchend",end,{passive:true});document.addEventListener("touchcancel",end,{passive:true});
 tabs.addEventListener("contextmenu",e=>{const b=startBtn(e.target);if(!b)return;e.preventDefault();if(S.gest.ring&&!S.ar&&!S.fan)press(b)});
 tabs.addEventListener("click",e=>{const b=startBtn(e.target);if(b&&S.fan&&S.fan.k===b.dataset.tab&&S.fanEat&&Date.now()-S.fanEat<1500){S.fanEat=0;e.stopImmediatePropagation();e.preventDefault()}},true)}
document.getElementById("tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(!b)return;const t=b.dataset.tab,now=Date.now();if(t==="einkauf"&&S.tab!=="einkauf")S.shopFilter="";
  if(TAP_SEQ[t]){const lt=S.lastTap,n=S.gest.tap&&lt&&lt.t===t&&lt.on===S.tab&&now-lt.at<450?lt.n+1:0;const q=TAP_SEQ[t],cur=tapCur(t),idx=n?n:S.gest.tap&&cur>=0?cur+1:0;if(S.tab!==t||n||idx)S.prev=S.tab;q[idx%q.length]();S.lastTap={t,at:now,n,on:S.tab};S.draft=null;render();window.scrollTo(0,0);return}
  if(t==="essen"&&S.tab!=="essen")S.foodTab="heute";S.tab=t;S.draft=null;render();window.scrollTo(0,0)});

// Doppelring im Dashboard: lange drücken = Wochenaufgaben (Florian 16.11.2026)
(()=>{let t=null,fired=false;const clear=()=>{clearTimeout(t);t=null};
  app.addEventListener("pointerdown",e=>{const b=e.target.closest(".bring2[data-act=gotasks]");if(!b)return;fired=false;clear();t=setTimeout(()=>{fired=true;t=null;setTimeout(()=>{fired=false},900);try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}goTasks("week")},500)});
  ["pointerup","pointercancel","pointerleave"].forEach(k=>app.addEventListener(k,clear));
  app.addEventListener("click",e=>{if(fired&&e.target.closest(".bring2")){fired=false;e.stopPropagation();e.preventDefault()}},true);
  app.addEventListener("contextmenu",e=>{if(e.target.closest(".bring2"))e.preventDefault()})})();
// Kalender: lange auf einen Tag drücken = neuer Termin an diesem Tag (Florian 15.11.2026); kurzer Tipp öffnet den Tag
(()=>{let t=null,fired=false,x0=0,y0=0;const clear=()=>{clearTimeout(t);t=null};
  app.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-calday]");if(!b)return;fired=false;x0=e.clientX;y0=e.clientY;clear();
    t=setTimeout(()=>{fired=true;t=null;setTimeout(()=>{fired=false},900);try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}S.calDay=b.dataset.calday;S.terDraft={id:null,name:"",date:b.dataset.calday,time:"",who:"both",rep:"",note:""};render();window.scrollTo(0,0);const el=document.getElementById("ter-name");if(el)el.focus()},500)});
  app.addEventListener("pointermove",e=>{if(t&&Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0)>12)clear()});
  ["pointerup","pointercancel"].forEach(k=>app.addEventListener(k,clear));
  app.addEventListener("click",e=>{if(fired){fired=false;e.stopPropagation();e.preventDefault()}},true);
  app.addEventListener("contextmenu",e=>{if(e.target.closest("[data-calday]"))e.preventDefault()})})();
// Lange drücken zum Löschen (Florian 18.11.2026: „Im Kalender möchte ich mit lang Klicken Termine löschen können“, „Lang drücken nur löschen vorschlagen, mit x bestätigen“, „einfach x ist sauberer“):
// lange (500 ms) auf eine Kalender-Zeile zeigt rechts den Knopf .lpx „✕ Löschen“, ein Tipp darauf löscht (mit „↩ Rückgängig“ im Toast), ein Tipp woandershin nimmt ihn wieder weg.
// Geht bei eigenen Terminen, Kita-Terminen, Erinnerungen und Gesundheit; Familywall-Termine lassen sich nur ausblenden („✕ Ausblenden“). Kein Menü, kein Wischen.
async function delUndo(path,msg){const keep=path.split("/").reduce((o,k)=>o&&o[k],S);if(keep==null)return;const c=JSON.parse(JSON.stringify(keep));await S.store.setPath(path,null);render();toastAct(msg,"↩ Rückgängig",async()=>{await S.store.setPath(path,c);render()})}
async function setUndo(path,val,msg){const old=path.split("/").reduce((o,k)=>o&&o[k],S);if(old==null)return;await S.store.setPath(path,val);render();toastAct(msg,"↩ Rückgängig",async()=>{await S.store.setPath(path,old);render()})}
function calFire(attr){const w=document.createElement("span");w.innerHTML="<button "+attr+" hidden></button>";const b=w.firstChild;app.appendChild(b);b.click();b.remove()}
async function terDelUndo(id){const x=(S.food&&S.food.termin||{})[id];if(!x)return;const keep=JSON.parse(JSON.stringify(x)),P=prios().filter(p=>p.ref&&[id,"ter:"+id].includes(p.ref)).map(p=>[p.id,JSON.parse(JSON.stringify((S.food.prio||{})[p.id]))]);
  await S.store.setPath("food/termin/"+id,null);await prioDropRef([id,"ter:"+id]);if(S.terDraft&&S.terDraft.id===id)S.terDraft=null;render();
  toastAct("Termin gelöscht","↩ Rückgängig",async()=>{await S.store.setPath("food/termin/"+id,keep);for(const p of P)await S.store.setPath("food/prio/"+p[0],p[1]);toast("Termin ist wieder da");render()})}
const calLpKind=b=>b.dataset.lpter?["ter",b.dataset.lpter]:b.dataset.teredit?["ter",b.dataset.teredit]:b.dataset.fwpick?["fw",b.dataset.fwpick]:b.dataset.caled?b.dataset.caled.split("|"):null;
async function calLpDel(kind,id){
  if(kind==="ter"){if(linkDel(id))return;return terDelUndo(id)}
  if(kind==="ask")return delUndo("food/ask/"+id,"Wunsch gelöscht");
  if(kind==="fw"){const fw=S.food&&S.food.ext&&S.food.ext.fw,x=fw&&fw.items&&fw.items[id];if(!x)return;const k=fwHideKey(x.name);await S.store.setPath("food/ext/fwhide/"+k,{name:String(x.name).slice(0,80),at:Date.now()});render();
    toastAct("Ausgeblendet. Löschen geht nur in Familywall.","↩ Rückgängig",async()=>{await S.store.setPath("food/ext/fwhide/"+k,null);render()});return}
  if(kind==="kita")return delUndo("food/kita/"+id,"Kita-Termin gelöscht");
  // Einträge aus anderen Bereichen (Florian 18.11.2026: „alle Termine im Kalender … einheitlich“): gelöscht wird, was den Eintrag in den Kalender bringt
  if(kind==="food"){const d=ymdD(id);calFire('data-planrm="d'+((d.getDay()+6)%7)+'" data-pday="'+esc(id)+'"');return}
  if(kind==="reise"||kind==="urlaub")return reiseDelUndo(id);
  // Ausflug und Kurs fragen (Florian 19.11.2026: „Ja, wäre gut“): nur den Tag wegnehmen oder ganz löschen
  if(kind==="ctrip"){const x=(S.food&&S.food.trip||{})[id];if(!x)return;lpAsk("🚲 "+(x.name||"Ausflug"),"Was soll weg?",[["📅 Nur den Tag wegnehmen, das Ziel bleibt gemerkt",()=>setUndo("food/trip/"+id+"/date",null,"Aus dem Kalender genommen. Das Ziel bleibt gemerkt.")],["🗑 Ausflug ganz löschen",()=>calLpDel("trip",id)]]);return}
  if(kind==="cplay"){const x=(S.food&&S.food.play||{})[id];if(!x)return;lpAsk("🤸 "+(x.name||"Kurs"),"Was soll weg?",[["📅 Nur aus dem Kalender nehmen, der Kurs bleibt unter Spielen",()=>setUndo("food/play/"+id+"/when",null,"Kurs steht nicht mehr im Kalender. Er bleibt unter Spielen.")],["🗑 Kurs ganz löschen",()=>calLpDel("play",id)]]);return}
  if(kind==="advent")return delUndo("food/adoor/"+id,"Türchen geleert");
  if(kind==="hstep")return hstepDel(id);
  if(kind==="chstep"){const x=(S.food&&S.food.hstep||{})[id];if(!x)return;lpAsk("✅ "+(x.name||"Schritt"),"Was soll weg?",[["📅 Nur den Tag wegnehmen, der Schritt bleibt im Projekt",()=>setUndo("food/hstep/"+id+"/date",null,"Aus dem Kalender genommen. Der Schritt bleibt im Projekt.")],["🗑 Schritt ganz löschen",()=>hstepDel(id)]]);return}
  if(kind==="prio")return delUndo("food/prio/"+id,"Erinnerung gelöscht");
  if(kind==="kidmed")return delUndo("food/kid/med/"+id,"Eintrag gelöscht");
  if(kind==="buy")return delUndo("food/buy/"+id,"Eintrag gelöscht");
  if(kind==="pack"){await buyDropRef("pack:"+id);return delUndo("food/pack/"+id,"Eintrag gelöscht")}
  if(kind==="play")return delUndo("food/play/"+id,"Gelöscht");
  if(kind==="music")return delUndo("food/music/"+id,"Gelöscht");
  if(kind==="idea")return delUndo("food/idea/"+id,"Gelöscht");
  if(kind==="fund"){fundRmAsk(id);return}
  if(kind==="trip"){await splitDropRef("trip:"+id);await prioDropRef([id]);const AD=(S.food&&S.food.adoor)||{};for(const k of Object.keys(AD))if(AD[k]&&AD[k].trip===id)await S.store.setPath("food/adoor/"+k+"/trip",null);return delUndo("food/trip/"+id,"Gelöscht")}
  if(kind==="rec"){const r=recs().find(x=>x.id===id);if(!r)return;const c=JSON.parse(JSON.stringify((S.food.rec||{})[id]));await recDrop(r);render();toastAct("Rezept entfernt","↩ Rückgängig",async()=>{await S.store.setPath("food/rec/"+id,c);render()})}}
function lpAsk(title,note,opts){if(document.getElementById("mbox"))return;S.mboxAt=Date.now();const el=document.createElement("div");el.id="mbox";
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="${esc(title)}"><div class="section-head"><h2>${esc(title)}</h2></div><div class="freq">${esc(note)}</div><div class="chlist">${opts.map((o,i)=>`<button type="button" class="chipbtn neutral" data-la="${i}">${esc(o[0])}</button>`).join("")}</div><div class="btnrow"><button class="ghost" type="button" data-la="x">Abbrechen</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const b=e.target.closest("[data-la]");if(!b){if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose();return}mboxClose();const o=opts[+b.dataset.la];if(o)Promise.resolve(o[1]()).catch(()=>toast("Konnte nicht speichern."))})}
// Dasselbe an allen Listen-Zeilen (Florian 18.11.2026: „Alle“): die Art einer Zeile ergibt sich aus ihren vorhandenen Knöpfen (LP_ROWS), neue Liste = eine Zeile dort.
const LP_ROWS=[["[data-hsedit]","hstep","hsedit"],["[data-need]","need","need"],["[data-priodone]","prio","priodone"],["[data-buyrm]","buy","buyrm"],["[data-packrm]","pack","packrm"],["[data-recrm]","rec","recrm"],["[data-kitarm]","kita","kitarm"],["[data-kitaedit]","kita","kitaedit"],["[data-fundrm]","fund","fundrm"],["[data-fundedit]","fund","fundedit"],["[data-tripedit]","trip","tripedit"],["[data-playedit]","play","playedit"],["[data-musedit]","music","musedit"],["[data-projedit]","idea","projedit"],["[data-kidmed]","kidmed","kidmed"],["[data-urlst]","urlaub","urlst"],["[data-cwopen]","ask","cwopen"]];
function lpRowOf(t){if(!t||!t.closest||t.closest("input,textarea,select,.evlist,.gmg,#mbox"))return null;const R=t.closest("li,.prow,.recbar");if(!R||!app.contains(R))return null;
  for(const d of LP_ROWS){const n=R.querySelector(d[0]);if(n&&n.closest("li,.prow,.recbar")===R&&n.dataset[d[2]])return {R,k:[d[1],n.dataset[d[2]]]}}return null}
// Einfacher Tipp auf einen Termin aus einem anderen Bereich öffnet gleich das Bearbeiten dort (Florian 18.11.2026: „mit einem einfachen Klick bearbeiten“)
const CAL_ED={kita:["Kita","✎ Bearbeiten"],prio:["Wichtig","✎ Bearbeiten"],kidmed:["Kind › Gesundheit","✎ Bearbeiten"],food:["Essen › Wochenplan","📂 Im Wochenplan öffnen"],reise:["Urlaub","📂 Urlaub öffnen"],ctrip:["Ausflüge","📂 Bei den Ausflügen öffnen"],cplay:["Spielen","📂 Bei Spielen öffnen"],advent:["Adventskalender","📂 Adventskalender öffnen"]};
// Einfacher Tipp auf einen Eintrag aus einem anderen Bereich (Florian 18.11.2026: „Das Springen zu anderen Bereichen muss anders gelöst werden“): kleines Fenster calInfo, der Weg in den Bereich ist ein eigener Knopf
function calInfo(ed,day){const k=ed.split("|"),kind=k[0],id=k.slice(1).join("|"),x=(S._calEd||{})[ed+"@"+day]||(S._calEd||{})[ed],C=CAL_ED[kind];if(!x||!C||document.getElementById("mbox"))return;S.mboxAt=Date.now();const el=document.createElement("div");el.id="mbox";
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="${esc(x.name)}"><div class="section-head"><h2>${x.icon?esc(x.icon)+" ":""}${esc(x.name)}</h2></div><div class="freq">${esc(dLabel(x.d))}${x.t?" · "+esc(x.t):""} · gehört zu ${esc(C[0])}</div>${x.fw?`<div class="freq">🔗 Steht auch in Familywall, hier nur einmal gezeigt.</div>`:""}${kind==="cplay"?`<div class="freq">Die Uhrzeit kommt aus „Wann“ beim Kurs und gilt für alle Termine.</div><div class="routeown"><input type="time" id="citime" value="${esc(x.t||"")}" aria-label="Uhrzeit des Kurses"><button type="button" class="chipbtn" data-ci="time">🕒 Speichern</button></div>`:""}<div class="chlist">${x.fw?`<button type="button" class="chipbtn neutral" data-ci="split">↔ Doch getrennt zeigen</button>`:""}<button type="button" class="chipbtn neutral" data-ci="go">${esc(C[1])} ›</button></div><div class="freq">Löschen: lange auf den Eintrag drücken.</div><div class="btnrow"><button class="ghost" type="button" data-ci="x">Schließen</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{const b=e.target.closest("[data-ci]");if(!b){if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose();return}if(b.dataset.ci==="time"){const v=(el.querySelector("#citime")||{}).value||"",p=plays().find(y=>y.id===id);mboxClose();if(!p)return;const rx=/(\d{1,2})(?:[:.](\d{2}))?\s*uhr|(\d{1,2})[:.](\d{2})/i,w=String(p.when||"");const nw=(rx.test(w)?w.replace(rx,v?v+" Uhr":""):v?w+" "+v+" Uhr":w).replace(/\s+/g," ").trim();S.store.setPath("food/play/"+id+"/when",nw);toast(v?"🕒 "+p.name+" jetzt um "+v:"🕒 Uhrzeit entfernt");return}
    if(b.dataset.ci==="split"){mboxClose();S.store.setPath("food/ext/fwsplit/"+x.fw,1);toast("↔ Wieder getrennt gezeigt");return}
    mboxClose();if(b.dataset.ci!=="go")return;if(["kita","prio","kidmed"].includes(kind))calEdOpen(kind,id);else calFire(x.go)})}
function calEdOpen(kind,id){
  if(kind==="kidmed"){kidMedEdit(id);return}
  if(kind==="kita"){const x=kitas().find(y=>y.id===id);goNav("kita|ks:termine");if(x){S.kitaDraft={id:x.id,sec:x.sec||"termine",name:x.name||"",date:x.date||"",kind:x.kind||"",note:x.note||""};render();window.scrollTo(0,0)}return}
  if(kind==="prio"){goNav("wichtig|");const n=document.querySelector(`#app [data-prioedit="${CSS.escape(id)}"]`);if(n)n.click()}}
(()=>{const SEL=".evlist .ev[data-teredit],.evlist .ev[data-fwpick],.evlist .ev[data-caled],.evlist .ev[data-lpter]";let t=null,x0=0,y0=0,fired=0;const clr=()=>{clearTimeout(t);t=null};
  const disarm=()=>{document.querySelectorAll("#app .lparm").forEach(li=>{li.classList.remove("lparm");const x=li.querySelector(".lpx");if(x)x.remove()})};
  const arm=(b,row)=>{const li=row?row.R:b.closest("li"),k=row?row.k:calLpKind(b);if(!li||!k)return;disarm();li.classList.add("lparm");const x=document.createElement("button");x.type="button";x.className="lpx";x.dataset.lpx=k.join("|");x.textContent=k[0]==="fw"?"✕ Ausblenden":k[0]==="need"?"⏭ Später":"✕ Löschen";if(k[0]==="need")x.classList.add("lplater");li.appendChild(x)};
  app.addEventListener("pointerdown",e=>{const b=e.target.closest&&e.target.closest(SEL),row=b?null:lpRowOf(e.target);if(!b&&!row)return;x0=e.clientX;y0=e.clientY;clr();t=setTimeout(()=>{t=null;fired=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}arm(b,row)},500)});
  app.addEventListener("pointermove",e=>{if(t&&Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0)>12)clr()});
  ["pointerup","pointercancel"].forEach(n=>app.addEventListener(n,clr));
  document.addEventListener("click",e=>{const T=e.target.closest?e.target:null;if(!T)return;
    if(fired&&Date.now()-fired<900&&T.closest("#app .lparm")&&!T.closest(".lpx")){fired=0;e.stopPropagation();e.preventDefault();return}
    const x=T.closest(".lpx");if(x){e.stopPropagation();e.preventDefault();const k=x.dataset.lpx.split("|");disarm();if(k[0]==="need"){needLater(k[1]).catch(()=>toast("Konnte nicht speichern."));return}calLpDel(k[0],k.slice(1).join("|")).catch(()=>toast("Konnte nicht speichern."));return}
    if(document.querySelector("#app .lparm")){const inRow=T.closest(".lparm");disarm();if(inRow){e.stopPropagation();e.preventDefault()}return}
    const c=T.closest("#app .ev[data-caled]");if(c){e.stopPropagation();e.preventDefault();const k=c.dataset.caled.split("|");calInfo(c.dataset.caled,c.dataset.cald)}},true);
  app.addEventListener("contextmenu",e=>{if(e.target.closest&&(e.target.closest(SEL)||lpRowOf(e.target)))e.preventDefault()})})();
