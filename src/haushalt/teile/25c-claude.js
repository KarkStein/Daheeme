// ---------- Briefkasten „💬 An Claude“ (Florian 28.11.2026: „Ja, so bauen“, Entwurf /mnt/project-files/design/wunsch-an-claude.png) ----------
// Dritte Seite unter Sammlung (Tab claude). Wünsche liegen in food/ask/<id> {kind,title,page?,pageTab?,link?,by,at,st,wait,msgs:{<mid>:{by:p0|p1|claude,t,at,nav?,link?}},seen:{p0,p1}}.
// st: neu (wartet aufs Abholen) · abgeholt · rueckfrage · erledigt. wait = Zeitpunkt der letzten Nachricht, die Claude noch nicht hat.
// Der stündliche Lauf claude.yml im privaten Repo holt Wünsche mit wait ab (anfrage/claude/<id>.json) und schreibt Antworten aus antwort/ zurück. Nichts davon kommt ins öffentliche Repo.
const CW_KIND=[["idee","💡","Idee"],["fehler","🐞","Fehler"],["frage","❓","Frage"]];
const CW_ST={neu:["📨","geschickt","st-idee"],abgeholt:["⏳","abgeholt","st-idee"],rueckfrage:["💬","Rückfrage","st-geplant"],erledigt:["✅","erledigt","st-erledigt"]};
const cwKind=k=>CW_KIND.find(x=>x[0]===k)||CW_KIND[0];
const cwAsks=()=>Object.entries((S.food||{}).ask||{}).filter(([,a])=>a&&a.title).map(([id,a])=>Object.assign({id},a));
const cwMsgs=a=>Object.entries((a&&a.msgs)||{}).filter(([,m])=>m&&m.t).map(([mid,m])=>Object.assign({mid},m)).sort((x,y)=>(x.at||0)-(y.at||0));
const cwLastAt=a=>{const L=cwMsgs(a);return L.length?L[L.length-1].at||0:a.at||0};
// Ungelesene Antwort von Claude für mich (nur bei eigenen Wünschen oder wenn „Ich bin“ fehlt)
const cwUnread=a=>{const me=S.me||"";const L=cwMsgs(a).filter(m=>m.by==="claude");return !!L.length&&(!me||a.by===me)&&(L[L.length-1].at||0)>((a.seen&&a.seen[me||"x"])||0)};
const cwWho=b=>b==="claude"?"Claude":b==="p0"||b==="p1"?pname(b):"";
function cwTime(at){if(!at)return "";const d=new Date(at),t=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"),n=new Date();
  if(d.toDateString()===n.toDateString())return "heute "+t;const y=new Date(n);y.setDate(n.getDate()-1);if(d.toDateString()===y.toDateString())return "gestern "+t;
  return ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()]+" "+d.getDate()+"."+(d.getMonth()+1)+". "+t}
function cwAgo(at){const m=Math.round((Date.now()-(at||0))/6e4);return m<2?"gerade eben":m<60?"vor "+m+" Min.":m<24*60?"vor "+Math.round(m/60)+" Std.":cwTime(at)}
// Seite, von der man kam („📍 Gerade hier“): wird bei jedem Zeichnen außerhalb von An Claude gemerkt
function cwHereNow(){if(S.tab==="claude"||S.tab==="suche")return;S.cwOpen="";let l="";
  if(S.tab==="woche")l=(S.weekPage|0)===3?"Kalender":(S.weekPage|0)===1?"Wer macht was":(S.weekPage|0)===4?"Rückblick":"Tag und Woche";
  else if(S.tab==="camp")l="Start";else if(S.tab==="essen")l=S.foodTab==="rezepte"?"Rezepte":"Essen";else if(S.tab==="einkauf")l="Einkaufsliste";else if(S.tab==="settings")l="Einstellungen";
  else{const a=AREAS.find(x=>x[2]===S.tab);l=a?a[1]:""}
  if(S.tab==="geschenke"&&String(S.projFilter||"").startsWith("gl:")){const g=giftList(S.projFilter.slice(3));if(g)l="Geschenke › "+g.name}
  if(l)S.cwFrom=[S.tab,l]}
function cwRow(a){const k=cwKind(a.kind),st=CW_ST[a.st]||CW_ST.neu,un=cwUnread(a);
  return `<li class="mk${a.st==="erledigt"?" mkdone":""}"><button class="mkb" data-cwopen="${esc(a.id)}"><span class="mki">${k[1]}</span><span class="mkt"><b>${esc(a.title)}</b><span class="freq">${esc(cwWho(a.by))} · ${esc(cwAgo(cwLastAt(a)))}${un?` · <b class="cwnew">neue Antwort</b>`:""}</span></span></button><span class="stbadge ${st[2]}">${st[0]} ${st[1]}</span></li>`}
function renderClaude(){if(S.cwOpen&&!((S.food||{}).ask||{})[S.cwOpen])S.cwOpen="";if(S.cwOpen)return cwDetail(S.cwOpen);
  const A=cwAsks().sort((x,y)=>cwUnread(y)-cwUnread(x)||cwLastAt(y)-cwLastAt(x)),O=A.filter(a=>a.st!=="erledigt"),D=A.filter(a=>a.st==="erledigt"),k=S.cwKind||"idee",fr=S.cwFrom;
  let h=`<div><div class="eyebrow">Quer durch alles</div><h1>💬 An Claude</h1></div>`;
  h+=`<section data-fk="f_cwnew|1" class="card"><div class="section-head"><h2>Neuer Wunsch</h2></div><div class="unl">${CW_KIND.map(x=>`<button class="chipbtn neutral" data-cwkind="${x[0]}" aria-pressed="${k===x[0]}">${x[1]} ${x[2]}</button>`).join("")}</div>
    <label class="fld mt2"><span class="sr">Was soll anders werden?</span><textarea id="cwtext" rows="4" maxlength="2000" placeholder="${k==="fehler"?"Was ist passiert? z. B. „Termin springt nach dem Speichern zurück“":k==="frage"?"Was möchtest du wissen?":"Was soll anders werden? z. B. „Bei Geschenke eine Liste Selbstgemacht“"}">${esc(S.cwText||"")}</textarea></label>
    ${S.cwLinkOn?`<label class="fld"><span>Link</span><input id="cwlink" inputmode="url" maxlength="400" autocomplete="off" value="${esc(S.cwLink||"")}" placeholder="https://…"></label>`:""}
    <div class="unl">${S.cwLinkOn?"":`<button class="chipbtn neutral" data-act="cwlinkon">🔗 Link</button>`}${fr?`<button class="chipbtn neutral" data-act="cwhere" aria-pressed="${!S.cwHereOff}">📍 Gerade hier: ${esc(fr[1])}</button>`:""}</div>
    <div class="btnrow mt2"><button class="primary mla" data-act="cwsend">Abschicken</button></div></section>`;
  h+=`<div class="freq mtn1 mb2">„Gerade hier“ merkt sich, von welcher Seite der Wunsch kam. Claude holt neue Wünsche etwa einmal pro Stunde ab (tagsüber), die Antwort steht dann hier.</div>`;
  h+=`<section data-fk="f_cwopen|1" class="card"><div class="section-head"><h2>Offen</h2><span class="freq num">${O.length}</span></div>${O.length?`<ul class="mklist">${O.map(cwRow).join("")}</ul>`:`<div class="freq">Gerade nichts offen.</div>`}</section>`;
  if(D.length)h+=`<section data-fk="f_cwdone|0" class="card"><div class="section-head"><h2>✅ Erledigt</h2><span class="freq num">${D.length}</span></div><ul class="mklist">${D.map(cwRow).join("")}</ul></section>`;
  return h}
function cwDetail(id){const a=Object.assign({id},S.food.ask[id]),k=cwKind(a.kind),L=cwMsgs(a);if(S.me&&cwUnread(a)&&S.cwSeenW!==id+cwLastAt(a)){S.cwSeenW=id+cwLastAt(a);setTimeout(()=>S.store.setPath("food/ask/"+id+"/seen/"+S.me,Date.now()).catch(()=>{}),0)}
  let h=`<div class="btnrow"><button class="ghost" data-act="cwback">‹ An Claude</button></div><h1 class="mt2">${k[1]} ${esc(a.title)}</h1>
    <div class="freq mtn1 mb2">Von ${esc(cwWho(a.by)||"?")}${a.page?` · Seite ${esc(a.page)}`:""} · ${(CW_ST[a.st]||CW_ST.neu).join(" ").replace(/ st-.*/,"")}</div><div class="cwchat">`;
  h+=L.map(m=>{const me=m.by!=="claude";return `<div class="cwmsg${me?" me":""}">${esc(m.t).replace(/\n/g,"<br>")}${m.link?`<br><a href="${esc(safeLink(m.link))}" target="_blank" rel="noopener">🔗 ${esc(String(m.link).replace(/^https?:\/\/(www\.)?/,"").slice(0,40))}</a>`:""}</div><div class="cwmeta${me?" me":""}">${esc(cwWho(m.by))} · ${esc(cwTime(m.at))}${m.nav?` · <button class="linkish" data-nav="${esc(m.nav)}">Ansehen ›</button>`:""}</div>`}).join("");
  h+=`</div>${a.wait?`<div class="freq mb2">📨 Wartet aufs Abholen. Claude schaut etwa einmal pro Stunde nach.</div>`:""}
    <label class="fld"><span class="sr">Antworten</span><textarea id="cwre" rows="3" maxlength="2000" placeholder="Antworten …">${esc((S.cwRe||{})[id]||"")}</textarea></label>
    <div class="btnrow"><button class="primary mla" data-cwreply="${esc(id)}">Senden</button></div>
    <div class="reiseact mt3">${a.st==="erledigt"?`<button class="ghost" data-cwst="${esc(id)}|abgeholt">↩ Wieder öffnen</button>`:`<button class="ghost" data-cwst="${esc(id)}|erledigt">✅ Ist erledigt</button>`}<button class="ghost" data-cwdel="${esc(id)}">🗑 Löschen</button></div>`;
  return h}
async function cwSend(){const t=String(S.cwText||"").trim();if(!t){toast("Bitte erst etwas schreiben.");const e=document.getElementById("cwtext");if(e)e.focus();return}
  const id=newId("w"),now=Date.now(),lk=S.cwLinkOn&&String(S.cwLink||"").trim(),fr=!S.cwHereOff&&S.cwFrom,m={by:S.me||"",t:t.slice(0,2000),at:now};if(lk)m.link=safeLink(lk).slice(0,400);
  const v={kind:S.cwKind||"idee",title:t.split("\n")[0].slice(0,60)+(t.split("\n")[0].length>60?" …":""),by:S.me||"",at:now,st:"neu",wait:now,msgs:{["m"+now.toString(36)]:m},seen:S.me?{[S.me]:now}:{}};
  if(fr){v.page=fr[1];v.pageTab=fr[0]}
  try{await S.store.setPath("food/ask/"+id,v)}catch(_){toast("Konnte nicht speichern.");return}
  S.cwText="";S.cwLink="";S.cwLinkOn=false;S.cwHereOff=false;toast("Abgeschickt. Claude holt es bald ab.");render()}
async function cwReply(id){const t=String((S.cwRe||{})[id]||"").trim();if(!t){toast("Bitte erst etwas schreiben.");return}const now=Date.now();
  try{await S.store.setPath("food/ask/"+id+"/msgs/m"+now.toString(36),{by:S.me||"",t:t.slice(0,2000),at:now});await S.store.setPath("food/ask/"+id+"/wait",now);await S.store.setPath("food/ask/"+id+"/st","neu")}catch(_){toast("Konnte nicht speichern.");return}
  S.cwRe[id]="";render()}
function cwOpen(id){S.cwOpen=id;render();window.scrollTo(0,0)}
function cwClick(b){const d=b.dataset;
  if(d.cwopen){cwOpen(d.cwopen);return true}
  if(d.cwkind){S.cwKind=d.cwkind;render();return true}
  if(d.cwreply){cwReply(d.cwreply);return true}
  if(d.cwst){const [id,st]=d.cwst.split("|");S.store.setPath("food/ask/"+id+"/st",st).then(()=>{toast(st==="erledigt"?"Unter ✅ Erledigt abgelegt.":"Wieder offen.");if(st==="erledigt")S.cwOpen="";render()}).catch(()=>toast("Konnte nicht speichern."));return true}
  if(d.cwdel){if(d.sure!=="1"){d.sure="1";b.textContent="Wirklich löschen?";return true}const id=d.cwdel;S.cwOpen="";delUndo("food/ask/"+id,"Wunsch gelöscht").catch(()=>toast("Konnte nicht speichern."));return true}
  const A=d.act;
  if(A==="cwsend"){cwSend();return true}
  if(A==="cwlinkon"){S.cwLinkOn=true;render();const e=document.getElementById("cwlink");if(e)e.focus();return true}
  if(A==="cwhere"){S.cwHereOff=!S.cwHereOff;render();return true}
  if(A==="cwback"){S.cwOpen="";render();window.scrollTo(0,0);return true}
  return false}
// Eingaben merken, damit ein Neuzeichnen durch den Abgleich nichts verliert
document.addEventListener("input",e=>{const t=e.target;if(!t||!t.id)return;if(t.id==="cwtext")S.cwText=t.value;else if(t.id==="cwlink")S.cwLink=t.value;else if(t.id==="cwre"&&S.cwOpen){S.cwRe=S.cwRe||{};S.cwRe[S.cwOpen]=t.value}});
