// ---------- Minispiele (Florian 19.11.2026: „2, 4, 5“, Entwurf /mnt/project-files/design/minispiele-ideen.png) ----------
// Seite „Minispiele“ unter Kind (Tab minis, nach Spielen): Aufräum-Flut, Flaschenpost für zwei, Garten der Woche. Keine Punkte, kein Gegeneinander.

// 🌱 Garten der Woche: jeder Haken der Woche (beide zusammen) pflanzt etwas. Nur gerechnet aus weeks/<wk>/ticks, nichts gespeichert.
// Hausdienst-Einträge sind Einteilungen, keine Haken; dort zählt nur das Abhaken (ok).
function gardenPlants(mon){mon=mon||mondayOf(new Date());const tk=ticksOf(wkKey(mon)),ho=(tasks().find(t=>t.owner==="ho")||{}).id,L=[];
  Object.keys(tk).forEach(k=>{const v=tk[k];if(!v)return;if(ho&&k.startsWith(ho+"__")){Object.keys(v.ok||{}).forEach(p=>L.push({at:+v.ok[p]||v.at||0}));return}L.push({at:v.at||0})});
  return L.sort((a,b)=>a.at-b.at)}
const GARDEN_FLOWERS=["🌷","🌻","🌼","🌸","🌺","💐"];
// Heute gepflanztes ist noch ein Keimling, älteres blüht; sonntags blüht alles
function gardenGrid(mon){const L=gardenPlants(mon),t0=+startOfDay(new Date()),sun=new Date().getDay()===0;
  return L.map((p,i)=>!sun&&p.at>=t0&&+mondayOf(new Date())===+(mon||mondayOf(new Date()))?"🌱":GARDEN_FLOWERS[(i*7+3)%GARDEN_FLOWERS.length])}
// Kleine Blumen im Startbild am Haus (vorne am Weg und an der Hauswand), höchstens 18
const GARDEN_POS=[[132,236],[140,240],[226,236],[234,240],[150,252],[160,255],[172,251],[184,256],[196,252],[208,255],[220,251],[128,250],[242,252],[146,244],[230,246],[138,258],[248,246],[204,246]];
function gardenSvg(n){const C=["#f25f8c","#ffc53d","#ffffff","#ff8a5c","#c58cf0","#f7a8c4"];let g='<g class="garden" aria-hidden="true">';
  GARDEN_POS.slice(0,Math.min(n,GARDEN_POS.length)).forEach((p,i)=>{const c=C[i%C.length];g+=`<path d="M${p[0]} ${p[1]+5}v-5" stroke="#4d7a3a" stroke-width=".9"/><circle cx="${p[0]-1.4}" cy="${p[1]}" r="1.4" fill="${c}"/><circle cx="${p[0]+1.4}" cy="${p[1]}" r="1.4" fill="${c}"/><circle cx="${p[0]}" cy="${p[1]-1.4}" r="1.4" fill="${c}"/><circle cx="${p[0]}" cy="${p[1]+1.2}" r="1.2" fill="${c}"/><circle cx="${p[0]}" cy="${p[1]}" r=".9" fill="#ffd66b"/>`});
  return g+"</g>"}

// 🍾 Flaschenpost für zwei: food/flasche/<JJJJ-MM-TT> {q, p0:{t,at}, p1:{t,at}}. Erst wenn beide geantwortet haben, öffnet sich die Flasche.
const FLASCHE_Q=["Was hat dich heute zum Lachen gebracht?","Was war heute dein schönster Moment?","Wohin möchtest du als Nächstes mit uns?","Wofür bist du heute dankbar?","Was hat dich heute überrascht?","Welcher Moment mit unserem Kind war heute besonders?","Was möchtest du diese Woche unbedingt noch machen?","Was hat dir heute Kraft gegeben?","Woran hast du heute gedacht, als du an mich gedacht hast?","Was würdest du morgen gern anders machen?","Welches Essen wünschst du dir diese Woche?","Was war heute schwer, und was hat geholfen?","Welche Erinnerung an uns kam dir heute in den Sinn?","Was möchtest du am Wochenende mit uns erleben?","Welches Lied passt zu deinem Tag?","Was hast du heute Neues gelernt?","Wo würdest du jetzt gern sitzen, mit einem Tee in der Hand?","Was hat heute gut geklappt?","Worauf freust du dich morgen?","Was soll ich dir mal wieder kochen?","Welcher kleine Moment heute war schön?","Was wünschst du dir für unseren nächsten Urlaub?","Was hat unser Kind heute Lustiges gesagt oder getan?","Was würdest du gern öfter zusammen machen?","Was war heute dein Lieblingsgeräusch oder Lieblingsgeruch?","Wofür möchtest du dich heute bei mir bedanken?","Was steht auf deiner Liste für einen freien Tag?","Was hat dich heute geärgert, und ist es jetzt besser?"];
const flascheDay=k=>((S.food&&S.food.flasche)||{})[k]||{};
const flascheQ=k=>flascheDay(k).q||FLASCHE_Q[Math.floor(Date.parse(k+"T12:00:00Z")/864e5)%FLASCHE_Q.length];
const flascheOpen=x=>!!(x&&x.p0&&x.p0.t&&x.p1&&x.p1.t);
const flascheAll=()=>Object.keys((S.food&&S.food.flasche)||{}).filter(k=>flascheOpen(flascheDay(k))).sort().reverse();
function flascheCard(full){const k=ymd(new Date()),x=flascheDay(k),q=flascheQ(k),me=S.me,oth=me==="p0"?"p1":"p0",op=flascheOpen(x);
  const st=p=>x[p]&&x[p].t?`<li>✅ ${esc(pname(p))} hat geantwortet</li>`:`<li class="dim">⏳ ${esc(pname(p))} noch nicht</li>`;
  let h=`<div class="flq"><div class="eyebrow">Frage von heute</div><h3>${esc(q)}</h3>`;
  if(op)h+=`<div class="flopen" aria-label="Die Flasche ist offen">${["p0","p1"].map(p=>`<div class="fla"><b>${esc(pname(p))}</b><p>${esc(x[p].t)}</p></div>`).join("")}</div>`;
  else{h+=`<ul class="flst">${st("p0")}${st("p1")}</ul>`;
    if(!me)h+=`<div class="freq">Wählt unter Einstellungen › Wir, wer ihr seid, dann könnt ihr antworten.</div>`;
    else if(full)h+=x[me]&&x[me].t?`<div class="fla mine"><b>Deine Antwort</b><p>${esc(x[me].t)}</p><button class="ghost" data-act="flascheedit">✎ Ändern</button></div><div class="freq">Die Flasche öffnet sich, sobald ${esc(pname(oth))} auch geantwortet hat.</div>`
      :`<textarea id="flaschein" rows="3" maxlength="400" placeholder="Deine Antwort, nur ihr zwei seht sie" aria-label="Deine Antwort"></textarea><div class="btnrow"><button class="primary" data-act="flaschesave">✍️ Meine Antwort</button></div><div class="freq">${esc(pname(oth))} sieht deine Antwort erst, wenn beide geantwortet haben.</div>`}
  return h+`</div>`}
// Geöffnete Flaschen sammeln sich bei Partner › Briefe
function flascheArchive(){const L=flascheAll();if(!L.length)return "";
  return `<section data-fk="f_flasche|1" class="card"><div class="section-head"><h2>🍾 Flaschenpost</h2><span class="freq num">${L.length}</span></div><ul class="flarch">${L.slice(0,30).map(k=>{const x=flascheDay(k);return `<li><div class="freq">${esc(dLabel(k))}</div><b>${esc(flascheQ(k))}</b>${["p0","p1"].map(p=>`<div class="fla"><small>${esc(pname(p))}</small> ${esc(x[p].t)}</div>`).join("")}</li>`}).join("")}</ul></section>`}

// 🌊 Aufräum-Flut: S.flut {toys:[{e,x,y,in}], t0, dur, end:""|"ok"|"flut"}; die Welle steigt über die Zeit, nichts wird gespeichert
const FLUT_TOYS=["🧸","🚒","🧱","📚","⚽","🦆","🚗","🧩","🪀","🎨"];
function flutNew(n,min){const pos=[[14,58],[34,64],[56,57],[76,63],[22,73],[46,72],[68,74],[86,70]],T=FLUT_TOYS.slice().sort(()=>Math.random()-.5);
  S.flut={toys:pos.slice(0,n).map((p,i)=>({e:T[i],x:p[0],y:p[1],in:false})),t0:Date.now(),dur:min*60000,end:""};flutTimer()}
const flutLeft=()=>S.flut?S.flut.toys.filter(t=>!t.in).length:0;
const flutFrac=()=>S.flut?Math.min(1,(Date.now()-S.flut.t0)/S.flut.dur):0;
function flutTimer(){clearInterval(S.flutT);S.flutT=setInterval(()=>{const f=S.flut;if(!f||f.end){clearInterval(S.flutT);return}
  const sea=document.querySelector(".flutsea"),tt=document.getElementById("flutt");if(!sea){return}const fr=flutFrac();sea.style.height=(14+fr*56).toFixed(1)+"%";
  if(tt){const s=Math.max(0,Math.ceil((f.dur-(Date.now()-f.t0))/1000));tt.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
  if(fr>=1){f.end="flut";clearInterval(S.flutT);render()}},400)}
function flutTask(){const now=new Date(),di=(now.getDay()+6)%7,tk=ticksOf(wkKey(mondayOf(now))),t=tasks().find(x=>/aufr[äa]um/i.test(x.name||"")&&(x.freq==="day"||x.freq==="week"));if(!t)return "";
  const slot=t.freq==="day"?di:[...Array(slotsOf(t)).keys()].find(i=>!tk[t.id+"__"+i]);if(slot==null||tk[t.id+"__"+slot])return "";
  return `<button class="ghost" data-task="${esc(t.id)}" data-slot="${slot}">🧹 „${esc(t.name)}“ abhaken</button>`}
function flutHtml(){const f=S.flut;
  if(!f)return `<section class="card flutset"><h2>🌊 Aufräum-Flut</h2><div class="freq">Die Flut kommt: Ihr räumt echt auf, euer Kind tippt jedes Teil in den Korb. Ist alles drin, bevor die Welle die Sandburg erreicht, bleibt die Burg stehen.</div>
    <div class="fld"><span>Wie lange?</span><div class="unl">${[2,3,5].map(m=>`<button class="chipbtn neutral" data-flutmin="${m}" aria-pressed="${(S.flutMin||3)===m}">${m} Minuten</button>`).join("")}</div></div>
    <div class="fld"><span>Wie viele Sachen?</span><div class="unl">${[4,6,8].map(m=>`<button class="chipbtn neutral" data-flutn="${m}" aria-pressed="${(S.flutN||6)===m}">${m}</button>`).join("")}</div></div>
    <div class="btnrow"><button class="primary" data-act="flutgo">🌊 Los geht’s</button></div></section>`;
  const left=flutLeft(),fr=f.end==="flut"?1:f.end?flutFrac():flutFrac(),s=Math.max(0,Math.ceil((f.dur-(Date.now()-f.t0))/1000));
  const msg=f.end==="ok"?"Die Burg bleibt stehen!":f.end==="flut"?"Die Welle hat die Burg mitgenommen.":left?`Noch ${left} ${left===1?"Sache":"Sachen"}!`:"";
  return `<section class="flut${f.end?" end "+f.end:""}"><div class="fluth"><b>🌊 Aufräum-Flut</b><span id="flutt">${f.end?"":Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}</span></div>
    <div class="flutsc"><h2 id="flutn">${msg}</h2><span class="flutcastle" aria-hidden="true">🏰</span><span class="flutkorb" aria-hidden="true">🧺</span>
      ${f.toys.map((t,i)=>`<button class="fluttoy${t.in?" in":""}" data-fluttoy="${i}" style="left:${t.in?88:t.x}%;top:${t.in?40:t.y}%" aria-label="In den Korb"${t.in?" disabled":""}>${t.e}</button>`).join("")}
      <div class="flutsea" style="height:${(14+fr*56).toFixed(1)}%"></div></div>
    ${f.end?`<div class="flutend"><p>${f.end==="ok"?"Super aufgeräumt, die Burg steht noch.":"Macht nichts. Morgen baut ihr eine neue Burg."}</p><div class="btnrow"><button class="primary" data-act="flutgo">🌊 Nochmal</button>${flutTask()}<button class="ghost" data-mini="">‹ Minispiele</button></div></div>`
      :`<div class="btnrow"><button class="primary" data-act="flutdone">✓ Alles weg, Flut darf kommen</button><button class="ghost" data-act="flutstop">Abbrechen</button></div>`}</section>`}

function gardenHtml(){const mon=mondayOf(new Date()),G=gardenGrid(mon),last=gardenPlants(addDays(mon,-7)).length,sun=new Date().getDay()===0;
  return `<section class="garden"><div class="gardenh"><b>🌱 Garten der Woche</b><span>KW ${isoWeek(mon).w}</span></div><div class="gardensc"><span class="gardenhouse" aria-hidden="true">🏡</span>
    <div class="gardengrid">${G.slice(0,48).map(e=>`<span>${e}</span>`).join("")}${G.length>48?`<span class="more">+${G.length-48}</span>`:""}${G.length?"":`<span class="seed">·</span><span class="seed">·</span><span class="seed">·</span>`}</div>
    <div class="gardenn">${G.length?`${G.length} ${G.length===1?"Pflanze":"Pflanzen"} diese Woche`:"Noch ist alles Saat"}</div></div>
    <div class="freq">Jeder Haken von euch beiden pflanzt etwas, gezählt wird nur gemeinsam. ${sun?"Heute blüht der ganze Garten, morgen beginnt eine neue Saat.":"Heutiges ist noch ein Keimling, am Sonntag blüht alles. Am Montag beginnt eine neue Saat."}${last?` Letzte Woche: ${last} Pflanzen.`:""}</div>
    <div class="freq">Die Blumen wachsen auch im Bild am Haus.</div></section>`}

function renderMinis(){const g=S.miniGame||"";const back=`<button class="ghost minib" data-mini="">‹ Minispiele</button>`;
  // Aufräum-Flut ist seit 19.11.2026 nicht mehr erreichbar (Florian: „Nett gemeint, aber Weg“); flut* ist Altlast
  if(g==="flasche")return back+`<section class="card flasche"><h2>🍾 Flaschenpost für zwei</h2>${flascheCard(true)}${flascheAll().length?`<button class="linkish" data-nav="privat|pv:briefe">Alle geöffneten Flaschen bei Partner › Briefe ›</button>`:""}</section>`;
  if(g==="garten")return back+gardenHtml();
  const k=ymd(new Date()),x=flascheDay(k),n=gardenPlants().length;
  const tile=(id,ic,t,sub)=>`<button class="minitile" data-mini="${id}"><span class="mic">${ic}</span><span><b>${t}</b><i>${sub}</i></span><em>›</em></button>`;
  return `<div><div class="eyebrow">Miteinander, ohne Punkte</div><h1>Minispiele</h1></div><div class="minis">`
    +tile("flasche","🍾","Flaschenpost für zwei",flascheOpen(x)?"Heute geöffnet":["p0","p1"].map(p=>(x[p]&&x[p].t?"✅ ":"⏳ ")+pname(p)).join(" · "))
    +tile("garten","🌱","Garten der Woche",n?`${n} ${n===1?"Pflanze":"Pflanzen"} diese Woche`:"Jeder Haken pflanzt etwas")
    // Leuchtturm-Wacht (Florian 19.11.2026): eigenes Spiel im Ordner spiel/, in sich geschlossen; hier steht nur der Link
    +`<a class="minitile" href="spiel/"><span class="mic">🗼</span><span><b>Leuchtturm-Wacht</b><i>Großes Spiel für euch zwei: 10 Buchten, je 8 Wellen</i></span><em>›</em></a></div>`}

// Klicks (aus 28-klicks.js)
async function miniClick(b){const d=b.dataset;
  if(d.mini!=null){S.miniGame=d.mini;if(d.mini!=="flut"){clearInterval(S.flutT);S.flut=null}render();window.scrollTo(0,0);return true}
  if(d.flutmin){S.flutMin=+d.flutmin;render();return true}
  if(d.flutn){S.flutN=+d.flutn;render();return true}
  if(d.act==="flutgo"){flutNew(S.flutN||6,S.flutMin||3);render();window.scrollTo(0,0);return true}
  if(d.act==="flutstop"){clearInterval(S.flutT);S.flut=null;render();return true}
  if(d.act==="flutdone"&&S.flut){S.flut.toys.forEach(t=>t.in=true);S.flut.end="ok";clearInterval(S.flutT);render();return true}
  if(d.fluttoy!=null&&S.flut&&!S.flut.end){const t=S.flut.toys[+d.fluttoy];if(!t||t.in)return true;t.in=true;b.classList.add("in");b.disabled=true;b.style.left="88%";b.style.top="40%";
    const left=flutLeft(),n=document.getElementById("flutn");if(n)n.textContent=left?`Noch ${left} ${left===1?"Sache":"Sachen"}!`:"Alles drin!";
    if(!left){S.flut.end="ok";clearInterval(S.flutT);setTimeout(render,700)}return true}
  if(d.act==="flaschesave"){const el=document.getElementById("flaschein"),t=String(el&&el.value||"").trim().slice(0,400);if(!t){toast("Schreib erst eine Antwort.");return true}if(!S.me)return true;
    const k=ymd(new Date());try{await S.store.setPath("food/flasche/"+k+"/q",flascheQ(k));await S.store.setPath("food/flasche/"+k+"/"+S.me,{t,at:Date.now()});const x=flascheDay(k);toast(flascheOpen(x)?"🍾 Die Flasche ist offen!":"In die Flasche gesteckt")}catch(_){toast("Konnte nicht speichern.")}render();return true}
  if(d.act==="flascheedit"){const k=ymd(new Date()),old=(flascheDay(k)[S.me]||{}).t||"";await S.store.setPath("food/flasche/"+k+"/"+S.me,null);render();setTimeout(()=>{const el=document.getElementById("flaschein");if(el){el.value=old;el.focus()}},30);return true}
  return false}
