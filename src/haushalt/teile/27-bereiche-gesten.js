// ---------- Alle Bereiche (Florian 16.11.2026): Tipp oben rechts oder lange auf Start öffnet alle Bereiche auf einem Bildschirm ----------
// Karte nach Gruppen (Florian 16.11.2026 abends, Vorschlag A gewählt: „zu unübersichtlich, zu viele, vielleicht Farben“, aber alles zeigen): je Gruppe eine Karte in ihrer Farbe (AREA_GROUPS[i][3]),
// Bereiche groß mit Symbol, Unterseiten klein als Text, Quer als Knopf-Reihe unten über beide Spalten. Gespeist aus AREAS (neuer Bereich = eine Zeile dort), Zusätze in AR_EXTRA.
// Oben Angeheftet (lange auf einen Eintrag drücken, je Gerät hq-arfav) oder zuletzt Benutztes (hq-arrec). Tipp daneben, ✕ und Zurück schließen.
const AR_EXTRA={alltag:[[1,["📅","Kalender","woche|wp:3",[]]]],quer:[[0,["🏠","Start","camp|",[]]],[2,["🔍","Suche","suche|",[]]],[99,["📖","Glossar","settings|gl:",[]]]]};
const AR_COLS=[["essen","alltag","zuhause"],["wir","freizeit"]];
function arGroups(){return AREA_GROUPS.map(g=>{const L=AREAS.filter(a=>a[6]===g[0]).map(a=>[a[0],a[1],a[2]+"|",a[5]().map(x=>[x[0],a[2]+"|"+x[1]])]);(AR_EXTRA[g[0]]||[]).forEach(([i,e])=>L.splice(i,0,e));return [g,L]})}
// Alle Ziele flach [Symbol, Name, Sprung] für Angeheftet/Zuletzt; Unterseiten mit allgemeinem Namen bekommen den Bereich davor
const arAll=()=>arGroups().flatMap(([g,L])=>L.flatMap(a=>[[a[0],a[1],a[2]]].concat(a[3].map(s=>[a[0],/^(Heute|Termine|Infos|Sonstiges)$/.test(s[0])?a[1]+" · "+s[0]:s[0],s[1]]))));
const arTile=v=>arAll().find(t=>t[2]===v);
function arLs(k){try{const a=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(a)?a.filter(arTile):[]}catch(_){return []}}
function arLsSet(k,a){try{localStorage.setItem(k,JSON.stringify(a))}catch(_){}}
// Welcher Eintrag zeigt gerade? Genaueste zuerst (mit Unterseite), sonst der Bereich
function arCur(){const on=t=>{const [tab,sub]=t[2].split("|"),[k,val]=(sub||"").split(":");
    if(k==="sp")return S.tab===val;if(k==="bl")return S.tab==="listen";if(S.tab!==tab)return false;
    if(k==="ft")return S.foodTab===val;if(k==="wp")return (S.weekPage|0)===(+val||0);if(k==="ks")return S.kitaSec===val;if(k==="tt")return S.tripTab===val;if(k==="pf")return S.projFilter===val;if(k==="gl")return false;
    if(tab==="woche")return !(S.weekPage|0);if(tab==="kita")return S.kitaSec==="termine";if(tab==="essen")return S.foodTab==="heute";if(tab==="projekte"||tab==="amhaus")return !S.projFilter;return true};
  const L=arAll().filter(on),sub=L.find(t=>t[2].split("|")[1]);return sub?sub[2]:L.length?L[0][2]:null}
function arSeen(){const v=arCur();if(!v||S.arLast===v)return;S.arLast=v;const a=arLs("hq-arrec").filter(x=>x!==v);a.unshift(v);arLsSet("hq-arrec",a.slice(0,5))}
function arHtml(){const fav=arLs("hq-arfav"),rec=arLs("hq-arrec"),top=fav.length?fav:rec,cur=arCur(),cls=v=>"arit"+(v===cur?" on":"")+(fav.includes(v)?" fav":"");
  let h=`<div class="arbg"></div><div class="arsheet" role="dialog" aria-label="Alle Bereiche"><div class="arhead"><h2>Alle Bereiche</h2><button class="iconbtn" data-arx aria-label="Schließen">✕</button></div>`;
  h+=`<div class="artop"><span class="arlbl">${fav.length?"📌 Angeheftet":"🕘 Zuletzt"}</span>${top.length?top.map(v=>{const t=arTile(v);return `<button class="armpill ${cls(v)}" data-arnav="${v}">${t[0]} ${esc(t[1])}</button>`}).join(""):`<span class="freq">Lange auf einen Eintrag drücken heftet ihn hier an.</span>`}</div>`;
  const G=arGroups(),sec=x=>{if(!x)return "";const [g,L]=x;return `<section class="armg${g[0]==="quer"?" armq":""}" style="--gc:${g[3]||"#6b6f78"}"><h3>${g[1]} ${esc(g[2])}</h3>${g[0]==="quer"?`<div class="armqrow">${L.map(a=>`<button class="${cls(a[2])}" data-arnav="${a[2]}">${a[0]} ${esc(a[1])}</button>`).join("")}</div>`:L.map(a=>`<button class="armain ${cls(a[2])}" data-arnav="${a[2]}"><span>${a[0]}</span><b>${esc(a[1])}</b></button>${a[3].length?`<div class="armsubs">${a[3].map(s=>`<button class="${cls(s[1])}" data-arnav="${s[1]}">${esc(s[0])}</button>`).join("")}</div>`:""}`).join("")}</section>`};
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
const OVL=["mbox","allar"];const ovlOpen=()=>OVL.some(id=>document.getElementById(id));
function ovlCloseAll(){mboxClose();arClose()}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&ovlOpen())ovlCloseAll()});
new MutationObserver(()=>{const open=ovlOpen();
  if(open&&!S.ovl){S.ovl=true;try{if(!(history.state&&history.state.ov))history.pushState({ov:1},"")}catch(_){}}
  else if(!open&&S.ovl){S.ovl=false;setTimeout(()=>{try{if(!ovlOpen()&&history.state&&history.state.ov){navBusy=true;history.back()}}catch(_){}},0)}}).observe(document.body,{childList:true});
{let lp=null;const tabs=document.getElementById("tabs");
 const startBtn=t=>t&&t.closest&&t.closest('#tabs [data-tab="camp"]');
 tabs.addEventListener("touchstart",e=>{const b=startBtn(e.target);if(!b||!S.gest.ring||e.touches.length!==1)return;const p=e.touches[0];lp={x:p.clientX,y:p.clientY,timer:setTimeout(()=>{lp=null;S.fanEat=Date.now();arOpen(true)},450)}},{passive:true});
 document.addEventListener("touchmove",e=>{if(lp){const p=e.touches[0];if(Math.hypot(p.clientX-lp.x,p.clientY-lp.y)>12){clearTimeout(lp.timer);lp=null}}},{passive:true});
 const end=()=>{if(lp){clearTimeout(lp.timer);lp=null}};document.addEventListener("touchend",end,{passive:true});document.addEventListener("touchcancel",end,{passive:true});
 tabs.addEventListener("contextmenu",e=>{const b=startBtn(e.target);if(!b)return;e.preventDefault();if(S.gest.ring&&!S.ar){S.fanEat=Date.now();arOpen(true)}});
 tabs.addEventListener("click",e=>{if(S.fanEat&&Date.now()-S.fanEat<1500&&startBtn(e.target)){S.fanEat=0;e.stopImmediatePropagation();e.preventDefault()}},true)}
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
