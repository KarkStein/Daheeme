
// ---------- Auswahl: mehrere Möglichkeiten, eine(r) wählt aus oder beide stimmen ab (Florian 16.11.2026) ----------
// Allgemein gebaut: CHOICE_KINDS[art] sagt, wo die Einträge liegen und was eine Möglichkeit ist. Bisher nur Termine (später z. B. Essen).
// Am Eintrag: alt:[{date,time}] = weitere Möglichkeiten (Möglichkeit 1 ist der Eintrag selbst),
// ask:{who:p0|p1|both,from,at,due?,votes?:{p0:i,p1:i},back?:{by,at}} solange offen, told:{by,at,txt,seen:{p0,p1}} = Hinweis an den anderen.
// Nach der Wahl bleiben die übrigen Möglichkeiten in alt, so lässt sich die Wahl später ändern oder neu fragen.
const altOf=x=>Object.values((x&&x.alt)||{}).filter(o=>o&&/^\d{4}-\d{2}-\d{2}$/.test(o.date||""));
const CHOICE_KINDS={
  termin:{path:"termin",list:()=>termine(),icon:"📅",
    opts:x=>[{date:x.date,time:x.time||""}].concat(altOf(x).map(o=>({date:o.date,time:o.time||""}))),
    label:o=>WD2[ymdD(o.date).getDay()]+" "+rDate(o.date)+(o.time?" "+o.time:""),
    pick:(x,i)=>{const O=CHOICE_KINDS.termin.opts(x),c=O[i];return {date:c.date,time:c.time||null,alt:O.filter((_,j)=>j!==i).map(o=>({date:o.date,time:o.time||null}))}},
    edit:x=>{goNav("woche|wp:3");S.terDraft=terDraftOf(x);render();window.scrollTo(0,0)},
    nav:"woche|wp:3"}};
const choiceOther=p=>p==="p0"?"p1":p==="p1"?"p0":"";
const choiceWhoTxt=a=>a.who==="both"?"Beide stimmen ab":(a.who===S.me?"Du wählst":pname(a.who)+" wählt");
function choiceAll(){const out=[];Object.keys(CHOICE_KINDS).forEach(k=>CHOICE_KINDS[k].list().forEach(x=>{if(x.ask&&altOf(x).length||x.told)out.push({k,x})}));return out}
// Für die Glocke: was ich wählen muss (mit Frist überfällig) und neue Hinweise „hat gewählt“
function choiceBell(){const me=S.me||"",A=[],N=[],W=[];choiceAll().forEach(c=>{const a=c.x.ask;
  if(a&&altOf(c.x).length){const v=a.votes||{};if(!me||a.who===me||(a.who==="both"&&v[me]==null))A.push(c);else W.push(c)}
  else if(c.x.told&&c.x.told.by!==me&&!((c.x.told.seen||{})[me||"x"]))N.push(c)});return {A,N,W}}
async function choiceSet(k,id,patch){const base="food/"+CHOICE_KINDS[k].path+"/"+id+"/";for(const f of Object.keys(patch))await S.store.setPath(base+f,patch[f])}
const choiceGet=(k,id)=>CHOICE_KINDS[k].list().find(y=>y.id===id);
async function choicePick(k,id,i){const K=CHOICE_KINDS[k],x=choiceGet(k,id);if(!x)return;const O=K.opts(x),txt=K.label(O[i]),me=S.me||"";
  await choiceSet(k,id,Object.assign(K.pick(x,i),{ask:null,told:{by:me,at:Date.now(),txt,seen:me?{[me]:true}:{}}}));
  toast(i?"Gewählt: "+txt:"Bleibt: "+txt)}
async function choiceVote(k,id,i){const x=choiceGet(k,id);if(!x||!x.ask)return;const me=S.me||"p0",v=Object.assign({},x.ask.votes||{});v[me]=i;
  const o=choiceOther(me);if(v[o]!=null&&v[o]===i){await choicePick(k,id,i);return}
  await choiceSet(k,id,{"ask/votes":v});toast(v[o]!=null?"Ihr habt verschieden gewählt. Eine Möglichkeit antippen legt sie fest.":"Deine Stimme ist gespeichert. "+pname(o)+" stimmt noch ab.")}
async function choiceBack(k,id){const x=choiceGet(k,id);if(!x||!x.ask)return;const me=S.me||"",to=x.ask.from&&x.ask.from!==me?x.ask.from:choiceOther(me)||x.ask.from;
  await choiceSet(k,id,{ask:Object.assign({},x.ask,{who:to,votes:null,back:{by:me,at:Date.now()}})});toast("Zurück an "+pname(to)+": bitte neue Möglichkeiten.")}
function choiceOpen(k,id){const K=CHOICE_KINDS[k],x=choiceGet(k,id);if(!K||!x||document.getElementById("mbox"))return;const O=K.opts(x),a=x.ask&&O.length>1?x.ask:null,me=S.me||"",v=(a&&a.votes)||{},o=choiceOther(me),today=ymd(new Date());
  const vote=a&&a.who==="both",both=vote&&v.p0!=null&&v.p1!=null,mayPick=a&&(a.who===me||!me||both);
  const hint=!a?`<div class="freq">Steht fest: <b>${esc(K.label(O[0]))}</b>.${O.length>1?" Eine andere Möglichkeit antippen ändert die Wahl.":""}</div>`
    :`<div class="freq">${esc(choiceWhoTxt(a))}${a.due?` · Frist ${esc(dLabel(a.due))}${a.due<today?" (vorbei)":""}`:""}${a.back?`<br>↩ ${esc(pname(a.back.by))}: Passt keiner. Bitte neue Möglichkeiten eintragen.`:""}${vote?`<br>${both?"Ihr habt verschieden gewählt. Eine Möglichkeit antippen legt sie fest.":"Tippt jeweils eure Möglichkeit an. Gleiche Wahl legt den Termin fest."}`:a.who!==me&&me?"<br>Du kannst trotzdem schon festlegen.":""}</div>`;
  const el=document.createElement("div");el.id="mbox";S.mboxAt=Date.now();
  el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Möglichkeiten"><div class="section-head"><h2>${a?"🗳️":"✓"} ${esc(x.name)}</h2></div>${hint}
    <div class="chlist">${O.map((c,i)=>{const vs=["p0","p1"].filter(p=>v[p]===i);return `<button type="button" class="chipbtn neutral${!a&&!i?" chosen":""}" data-chpick="${i}" aria-pressed="${!a&&!i}"><span>${a?i+1+". ":""}${esc(K.label(c))}</span><span class="freq">${vs.map(p=>"✓ "+esc(pname(p))).join(" ")}${!a&&!i?"gewählt":""}</span></button>`}).join("")}</div>
    <div class="btnrow">${a&&a.who===me&&a.from&&a.from!==me||vote&&me?`<button class="ghost" type="button" data-chback>↩ Passt keiner</button>`:""}<button class="ghost" type="button" data-chedit>✎ ${a?"Bearbeiten":"Nochmal fragen oder ändern"}</button><button class="ghost" type="button" data-chx>Schließen</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",async e=>{const p=e.target.closest("[data-chpick]");
    if(p){const i=+p.dataset.chpick;mboxClose();S.terDraft=null;try{if(!a){if(i)await choicePick(k,id,i)}else if(vote&&!both)await choiceVote(k,id,i);else await choicePick(k,id,i)}catch(_){toast("Konnte nicht speichern.")}render();return}
    if(e.target.closest("[data-chback]")){mboxClose();try{await choiceBack(k,id)}catch(_){toast("Konnte nicht speichern.")}render();return}
    if(e.target.closest("[data-chedit]")){mboxClose();K.edit(x);return}
    if(e.target.closest("[data-chx]")){mboxClose();return}
    if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
// Kalender: offene Möglichkeiten gestrichelt und blasser, mit „?“ und „1 von 3“
function choiceEvents(x,a,z,out){const O=CHOICE_KINDS.termin.opts(x),n=O.length,w=choiceWhoTxt(x.ask);
  O.forEach((o,i)=>{if(o.date>=a&&o.date<=z)out.push({d:o.date,t:o.time||"",name:"? "+x.name+" ("+(i+1)+" von "+n+")",icon:terIcon(x),src:"own",tag:x.tag||"",tent:true,id:x.id,who:x.who||"",note:"Noch offen: "+w+(x.ask.due?", Frist "+rDate(x.ask.due):""),place:x.place||""})})}
// Wichtig: Karte „Bitte wählen“ plus Hinweise „hat gewählt“ und was beim anderen liegt
function choiceCard(){const {A,N,W}=choiceBell(),today=ymd(new Date());if(!A.length&&!N.length&&!W.length)return "";
  const K=c=>CHOICE_KINDS[c.k],row=(c,txt,cls)=>`<div class="prow${cls?" "+cls:""}"><span class="pchk" aria-hidden="true">${K(c).icon}</span><button class="pnm" data-chopen="${c.k}|${esc(c.x.id)}">${esc(c.x.name)}<br><i>${txt}</i></button></div>`;
  let h=`<section class="card"><div class="section-head"><h2>🗳️ Bitte wählen</h2><span class="freq num">${A.length+N.length}</span></div>`;
  h+=A.map(c=>{const a=c.x.ask;return row(c,esc((a.who==="both"?"Abstimmen: ":"Bitte Termin wählen: ")+K(c).opts(c.x).length+" Möglichkeiten")+(a.due?` · Frist ${esc(dLabel(a.due))}`:"")+(a.back?" · ↩ passt keiner":""),a.due&&a.due<today?"due":"")}).join("");
  h+=N.map(c=>`<div class="prow"><span class="pchk" aria-hidden="true">✓</span><button class="pnm" data-chopen="${c.k}|${esc(c.x.id)}">${esc(c.x.name)}<br><i>${esc(pname(c.x.told.by))} hat ${esc(c.x.told.txt||"")} gewählt</i></button><button class="ghost small" data-chseen="${c.k}|${esc(c.x.id)}">Gesehen</button></div>`).join("");
  h+=W.map(c=>row(c,"⏳ Wartet auf "+esc(c.x.ask.who==="both"?pname(choiceOther(S.me)):pname(c.x.ask.who)),"later")).join("");
  return h+`</section>`}
