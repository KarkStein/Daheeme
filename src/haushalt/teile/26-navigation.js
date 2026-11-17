// ---------- Zurück-Taste ----------
const NAV=[];let navBusy=false;
function navKey(){return S.tab+"|"+(S.tab==="essen"?S.foodTab:S.tab==="ausflug"?S.tripTab:S.tab==="spiel"?S.playSec:S.tab==="kita"?S.kitaSec:S.tab==="privat"?(S.privSec||""):PROJ_TABS.includes(S.tab)?S.projFilter:S.tab==="woche"&&S.weekPage?String(S.weekPage):"")+"|"+((S.recDraft||S.planEdit||S.lunchDraft||S.lunchMapEdit||S.tripDraft||S.projDraft||S.playDraft||S.kitaDraft)?"d":"")}
function applyNav(k){const p=k.split("|");S.tab=p[0];if(PROJ_TABS.includes(S.tab))S.projFilter=p[1]||"";else if(p[1]){if(S.tab==="ausflug")S.tripTab=p[1];else if(S.tab==="spiel")S.playSec=p[1];else if(S.tab==="kita")S.kitaSec=p[1];else if(S.tab==="privat")S.privSec=p[1];else if(S.tab==="woche")S.weekPage=+p[1]||0;else S.foodTab=p[1]}if(S.tab==="woche"&&!p[1])S.weekPage=0;if(S.tab==="spiel")S.playSec=p[1]||""}
// Neu laden (am Handy herunterziehen): im selben Bereich bleiben. history.state überlebt das Neuladen, sessionStorage als Rückfall.
function restoreNav(){try{S.flip=sessionStorage.getItem("hq-flip")==="1"}catch(_){}let st=null;try{st=history.state}catch(_){}let k=st&&typeof st.k==="string"?st.k:"";if(!k){try{k=sessionStorage.getItem("hq-nav")||""}catch(_){}}
  const t=k.split("|")[0];if(!t||t==="plan"||t==="alle")return false;applyNav(k);
  const i=st&&typeof st.k==="string"&&st.i>0?st.i:0;for(let j=0;j<i;j++)NAV.push("");const nk=navKey();NAV.push(nk);try{history.replaceState({i,k:nk},"")}catch(_){}return true}
function syncNav(){if(!S.config)return;arSeen();if(!NAV.length&&!S.navRestored){S.navRestored=true;if(restoreNav()){render();window.scrollTo(0,0);return}}const k=navKey();try{sessionStorage.setItem("hq-nav",k);sessionStorage.setItem("hq-flip",S.flip?"1":"")}catch(_){}try{
  if(!NAV.length){NAV.push(k);history.replaceState({i:0,k},"");return}
  // Abgleich mit dem echten Verlauf (16.11.2026, nicht während ein eigenes Zurück unterwegs ist): ein Zurück aus einem Fenster kann nach dem Neuzeichnen ankommen; ohne Abgleich führte ein späteres Zurück aus der App heraus
  {const hs=history.state;if(!navBusy&&hs&&!hs.ov&&typeof hs.i==="number"&&typeof hs.k==="string"&&NAV.length!==hs.i+1){NAV.length=hs.i+1;for(let j=0;j<hs.i;j++)if(NAV[j]==null)NAV[j]="";NAV[hs.i]=hs.k}}
  if(NAV[NAV.length-1]===k)return;
  // Ein Fenster wurde mit einem Sprung geschlossen: dessen Verlaufsschritt wird zur neuen Seite
  if(history.state&&history.state.ov&&!ovlOpen()){NAV.push(k);history.replaceState({i:NAV.length-1,k},"");return}
  if(NAV.length>1&&NAV[NAV.length-2]===k&&history.state&&history.state.i===NAV.length-1){NAV.pop();navBusy=true;history.back();return}
  NAV.push(k);history.pushState({i:NAV.length-1,k},"")}catch(_){}}
window.addEventListener("popstate",e=>{const st=e.state;
  // Offenes Fenster: Zurück schließt nur das Fenster (Florian 16.11.2026)
  if(ovlOpen()){S.ovl=false;navBusy=false;ovlCloseAll();return}
  if(st&&st.ov){history.back();return}
  if(navBusy){navBusy=false;return}if(!st||typeof st.k!=="string")return;
  applyNav(st.k);S.tripDraft=null;S.projDraft=null;S.playDraft=null;S.kitaDraft=null;S.recDraft=S.planEdit=S.lunchDraft=null;S.lunchMapEdit=false;S.draft=null;
  NAV.length=Math.min(NAV.length,st.i);NAV[st.i]=navKey();render();window.scrollTo(0,0)});
// ---------- Events ----------
// Wischen links/rechts (Florian 17.11.2026, „Seiten im Reiter“): blättert nur die Seiten der Leiste oben (.pager: Start, Woche, Essen, Einkauf, Wir;
// sonst die Reiter-Zeile .tabrow, z. B. Reisen Übersicht | Packlisten). Kein Sprung in andere Bereiche, kein Umlauf. Der Wechsel läuft über den Knopf selbst (gleicher Weg wie ein Tipp).
function swipeTo(dir){if(document.getElementById("mbox")||document.getElementById("allar")||document.getElementById("fan"))return;
  const bar=app.querySelector(".pager .pdots")||app.querySelector(".tabrow");if(!bar)return;
  const L=[...bar.querySelectorAll("button[aria-pressed]")],i=L.findIndex(x=>x.getAttribute("aria-pressed")==="true");if(i<0)return;const nx=L[i+dir];if(!nx)return;
  nx.click();window.scrollTo(0,0);app.classList.remove("swl","swr");void app.offsetWidth;app.classList.add(dir>0?"swl":"swr")}
// Florian 17.11.2026: Zeilen, die seitlich scrollen (Filter-Chips, Urlaube, Kacheln), behalten das Wischen für sich; nie Bereichswechsel von dort
const hScrollIn=t=>{for(let el=t;el&&el!==app&&el.nodeType===1;el=el.parentElement){if(el.scrollWidth>el.clientWidth+2){const o=getComputedStyle(el).overflowX;if(o==="auto"||o==="scroll")return true}}return false};
{let sx=null,sy=0,st=0;app.addEventListener("touchstart",e=>{const t=e.target;if(e.touches.length!==1||t.closest("input,textarea,select,iframe,.pickwrap,.mapwrap")||hScrollIn(t)){sx=null;return}sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
 app.addEventListener("touchend",e=>{if(sx==null)return;if(S.ring){sx=null;return}const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;sx=null;if(S.gest.swipe&&Date.now()-st<700&&Math.abs(dx)>70&&Math.abs(dy)<Math.abs(dx)*0.5)swipeTo(dx<0?1:-1)},{passive:true})}
{let lp=null;
 // Kreis im Bild abgeschaltet (Florian 15.11.2026): langes Drücken auf den Reiter Start öffnet Alle Bereiche (arOpen)
 app.addEventListener("touchmove",e=>{if(lp){const p=e.touches[0];if(Math.hypot(p.clientX-lp.x,p.clientY-lp.y)>10){clearTimeout(lp.timer);lp=null}}},{passive:false});
 const end=()=>{if(lp){clearTimeout(lp.timer);lp=null}};app.addEventListener("touchend",end,{passive:true});app.addEventListener("touchcancel",end,{passive:true});
 app.addEventListener("contextmenu",e=>{const ho=e.target.closest&&e.target.closest(".slot.hoslot");if(ho){e.preventDefault();hoPick(ho);return}});
 {let ht=null;app.addEventListener("touchstart",e=>{const t=e.touches.length===1&&e.target.closest&&e.target.closest(".slot.hoslot");if(!t)return;const p=e.touches[0];ht={x:p.clientX,y:p.clientY,timer:setTimeout(()=>{ht=null;hoPick(t)},450)}},{passive:true});
  app.addEventListener("touchmove",e=>{if(ht){const p=e.touches[0];if(Math.hypot(p.clientX-ht.x,p.clientY-ht.y)>10){clearTimeout(ht.timer);ht=null}}},{passive:true});
  const he=()=>{if(ht){clearTimeout(ht.timer);ht=null}if(document.getElementById("mbox"))S.mboxAt=Date.now()};app.addEventListener("touchend",he,{passive:true});app.addEventListener("touchcancel",he,{passive:true})}
 app.addEventListener("contextmenu",e=>{if(e.target.closest(".camp"))e.preventDefault();const k=quickKey(e.target.closest(".spot"));if(k)quickOpen(k)})
 {let mt=null;app.addEventListener("touchstart",e=>{const k=e.touches.length===1&&e.target.closest&&quickKey(e.target.closest(".spot"));if(!k)return;const p=e.touches[0];mt={x:p.clientX,y:p.clientY,timer:setTimeout(()=>{mt=null;quickOpen(k)},450)}},{passive:true});
  app.addEventListener("touchmove",e=>{if(mt){const p=e.touches[0];if(Math.hypot(p.clientX-mt.x,p.clientY-mt.y)>10){clearTimeout(mt.timer);mt=null}}},{passive:true});
  const me=()=>{if(mt){clearTimeout(mt.timer);mt=null}if(document.getElementById("mbox"))S.mboxAt=Date.now()};app.addEventListener("touchend",me,{passive:true});app.addEventListener("touchcancel",me,{passive:true})}
 // Kurzer Tipp auf eine freie Stelle im Bild: Dashboard auf/zu
 // Tipp in den Hintergrund der Karte Heute dreht das Bild auf die Rückseite (Florian 15.11.2026)
 app.addEventListener("click",e=>{if(S.tab!=="camp")return;const c=e.target.closest(".card.today");if(!c||e.target.closest("button,a,input,form"))return;S.prev=S.tab;S.tab="tag";render();window.scrollTo(0,0)});
 app.addEventListener("click",e=>{if(S.tab!=="camp"||S.ring)return;const c=e.target.closest(".camp,.campback");if(!c||e.target.closest(".spot,.bcnt,.bcal,.btask,a"))return;if(Date.now()-(S.ringAt||0)<600)return;S.prev=S.tab;S.tab="tag";render();window.scrollTo(0,0)})}
// Doppeltipp auf einen der 4 Reiter springt auf seine zweite Seite (nur im Entwurf)
try{S.labels=localStorage.getItem("hq-labels")==="1"}catch(_){}
S.gest={tap:true,swipe:true,ring:true};try{const g=JSON.parse(localStorage.getItem("hq-gest")||"{}");Object.assign(S.gest,g)}catch(_){}
try{S.theme=localStorage.getItem("hq-theme")||"";if(S.theme)document.documentElement.dataset.theme=S.theme}catch(_){}
// Reiter unten (Florian 16.11.2026): Tipp auf einen anderen Reiter = erste Seite; Tipp auf den Reiter, in dem man ist = eine Unterseite weiter (nach der letzten wieder die erste).
// Schnell mehrfach (unter 450 ms): Doppeltipp = Seite 2, Dreifachtipp = Seite 3, gezählt ab der ersten Seite (TAP_SEQ, aktuelle Seite erkennt TAP_AT)
const TAP_SEQ={camp:[()=>{S.tab="camp"},()=>{S.tab="woche";S.weekPage=3},()=>{S.tab="wichtig"}],woche:[0,1].map(p=>()=>{S.tab="woche";S.weekPage=p}),essen:["heute","rezepte"].map(f=>()=>{S.tab="essen";S.foodTab=f}),einkauf:[()=>{S.tab="einkauf"},()=>{S.tab="ausgaben"},()=>{S.tab="listen"}]};
const TAP_AT={camp:[()=>S.tab==="camp",()=>S.tab==="woche"&&S.weekPage===3,()=>S.tab==="wichtig"],woche:[0,1].map(p=>()=>S.tab==="woche"&&(S.weekPage|0)===p),essen:[()=>S.tab==="essen"&&S.foodTab!=="rezepte",()=>S.tab==="essen"&&S.foodTab==="rezepte"],einkauf:[()=>S.tab==="einkauf",()=>S.tab==="ausgaben",()=>S.tab==="listen"]};
const tapCur=t=>(TAP_AT[t]||[]).findIndex(f=>f());
