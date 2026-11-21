
// ---------- Handy-Benachrichtigungen (Florian 16.11.2026) ----------
// Je Gerät an/aus: food/push/<Gerät> {who,on,sub,at,ua}. Den Versand macht ein Lauf im privaten Sicherungs-Repo (Web Push, VAPID; der geheime Schlüssel steht nur dort als Secret).
// Inhalte (Vorschlag): Morgen-Briefing 7:00, akut nur Fälliges mit 🔔, Neues mit 🔔 vom anderen, „Bitte Termin wählen“/„hat gewählt“, Frist heute.
const PUSH_PUB="BAQ4iz0ADZ-sTdXq3ug3t2zyA5myV8EDRluxepXnefRHxgHYu719jnlnjYCkrnDteKM7JxffVAe4k2_nxJnrLZw";
const pushOk=()=>"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
function pushDev(){let d="";try{d=localStorage.getItem("hq-dev")||""}catch(_){}if(!d){d=newId("d");try{localStorage.setItem("hq-dev",d)}catch(_){}}return d}
function pushReg(){if(!("serviceWorker" in navigator))return Promise.resolve(null);return navigator.serviceWorker.register("sw.js").catch(()=>null)}
const pushMine=()=>((S.food&&S.food.push)||{})[pushDev()]||null;
function pushRow(){if(!pushOk())return `<div class="freq">Dieses Handy oder dieser Browser kann keine Benachrichtigungen. Auf Android geht es in Chrome mit installierter App.</div>`;
  const m=pushMine(),on=!!(m&&m.on&&Notification.permission==="granted");
  return `<div class="freq">Je Handy einzeln. Kommt: Morgen-Briefing und nur Akutes (Fälliges mit 🔔, Neues mit 🔔 vom anderen, „Bitte Termin wählen“).</div>${on?briefSet(m.brief||{}):""}
    <div class="btnrow"><button class="${on?"ghost":"primary"}" data-act="pushtoggle">${on?"🔕 Auf diesem Handy aus":"🔔 Auf diesem Handy einschalten"}</button>${on?`<button class="ghost" data-act="pushtest">Testmeldung</button>`:""}</div>${Notification.permission==="denied"?`<div class="notice">Benachrichtigungen sind für die App gesperrt. Ändern: lange auf das App-Symbol › App-Info › Benachrichtigungen.</div>`:""}`}
// Morgen-Briefing je Handy (Florian 21.11.2026, Variante B): food/push/<Gerät>/brief {t,we,ln:{<zeile>:bool},test}. Rechnet und schickt der Lauf im privaten Repo (scripts/brief.js).
const BRIEF_T=[["06:30","6:30"],["07:00","7:00"],["07:30","7:30"],["off","Aus"]],BRIEF_WE=[["same","wie werktags"],["08:00","8:00"],["off","Aus"]];
const BRIEF_LN=[["wx","☔ Wetter"],["ter","📅 Termine"],["kita","📦 Mitbringen"],["ho","🏠 Hausdienst"],["heute","🧹 Heute für dich"],["prio","🔔 Erinnerungen"],["wahl","🗳️ Bitte wählen"],["muell","🗑️ Müll"],["essen","🍲 Abendessen"],["idee","🚲 Wochenend-Idee"]];
const briefLn=(B,k)=>{const v=B.ln&&B.ln[k];return v==null?k!=="essen":!!v};
function briefSet(B){const t=B.t||"07:00",we=B.we||"08:00",chips=(L,f,v)=>L.map(o=>`<button class="chipbtn neutral" data-brief="${f}|${o[0]}" aria-pressed="${v===o[0]}">${o[1]}</button>`).join("");
  return `<h3 class="mt2">☀️ Morgen-Briefing</h3><div class="freq">Titel mit Tag, Wetter und Zahl der Termine, darunter höchstens 8 kurze Zeilen. Tipp öffnet den Kalender.</div>
    <div class="fld"><span>Werktags</span><div class="unl">${chips(BRIEF_T,"t",t)}</div></div>
    <div class="fld"><span>Wochenende, Feiertage, Urlaub</span><div class="unl">${chips(BRIEF_WE,"we",we)}</div></div>
    <div class="fld"><span>Was drinsteht</span><div class="unl">${BRIEF_LN.map(o=>`<button class="chipbtn neutral" data-brief="ln|${o[0]}" aria-pressed="${briefLn(B,o[0])}">${o[1]}</button>`).join("")}</div></div>
    <div class="btnrow"><button class="ghost" data-act="brieftest">▶️ Jetzt ausprobieren</button></div>`}
async function briefClick(v){const dev=pushDev(),m=pushMine();if(!m)return;const [f,x]=v.split("|"),B=m.brief||{};
  if(f==="ln")await S.store.setPath("food/push/"+dev+"/brief/ln/"+x,!briefLn(B,x));else await S.store.setPath("food/push/"+dev+"/brief/"+f,x);render()}
async function briefTest(){const dev=pushDev();await S.store.setPath("food/push/"+dev+"/brief/test",Date.now());toast("Kommt in den nächsten 15 Minuten aufs Handy.")}
const b64u=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");const r=atob(s+"===".slice((s.length+3)%4));return Uint8Array.from(r,c=>c.charCodeAt(0))};
async function pushToggle(){const dev=pushDev(),m=pushMine();
  if(m&&m.on){try{const r=await pushReg(),s=r&&await r.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(_){}await S.store.setPath("food/push/"+dev+"/on",false);toast("Benachrichtigungen auf diesem Handy aus");render();return}
  if(!S.me){toast("Bitte erst unter Wir wählen, wer du bist.");return}
  const p=await Notification.requestPermission();if(p!=="granted"){toast("Nicht erlaubt. Ohne Erlaubnis keine Meldungen.");render();return}
  const r=await pushReg();if(!r){toast("Konnte den Hintergrund-Teil nicht starten.");return}await navigator.serviceWorker.ready;
  let s=await r.pushManager.getSubscription();if(!s)s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(PUSH_PUB)});
  await S.store.setPath("food/push/"+dev,{who:S.me,on:true,sub:JSON.parse(JSON.stringify(s)),at:Date.now(),ua:(navigator.userAgent.match(/Android[^;)]*|iPhone|Windows|Mac OS X/)||[""])[0]});
  toast("Benachrichtigungen auf diesem Handy an");render()}
async function pushTest(){const r=await pushReg();if(!r)return;await navigator.serviceWorker.ready;r.showNotification("🏕️🧹 Test",{body:"So sieht eine Meldung aus. Das Morgen-Briefing kommt, sobald der Versand läuft.",icon:"icon-192.png"})}
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",e=>{const v=e.data&&e.data.nav;if(v)goNav(v)});
