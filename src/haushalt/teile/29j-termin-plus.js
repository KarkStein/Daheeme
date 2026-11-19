// ---------- Anlegen aus dem Termin und Geschenk zur Feier (Florian 19.11.2026: „Ideen alle Gut“) ----------
// Im geöffneten Termin steht über „Verknüpft mit“ die Zeile „＋ Dazu anlegen“: 🎒 Packliste, 🧺 Einkauf, 🔔 Erinnerung; bei der Art Feier zusätzlich „🎁 Geschenk dazu“.
// Alles hängt per ref "ter:<id>" (Packliste: Id t_<id>, Einkauf: Block „Für <Name>“) am Termin und erscheint danach unter „Verknüpft mit“.
function terPlusRow(t){if(!t||!t.id)return "";const id=esc(t.id),has=!!((S.food.packlist||{})["t_"+t.id]);
  return `<div class="verk terplus"><div class="verkh">＋ Dazu anlegen</div><div class="unl">${t.tag==="feier"?`<button type="button" class="chipbtn neutral" data-terplus="gift|${id}">🎁 Geschenk dazu</button>`:""}${terIsZu(t)?`<button type="button" class="chipbtn neutral" data-stayter="${id}">🏠 Wer bleibt daheim?</button>`:""}<button type="button" class="chipbtn neutral" data-terplus="pack|${id}">🎒 Packliste${has?" öffnen":""}</button><button type="button" class="chipbtn neutral" data-terplus="shop|${id}">🧺 Einkauf</button><button type="button" class="chipbtn neutral" data-terplus="prio|${id}">🔔 Erinnerung</button></div></div>`}
const terDayBefore=(d,n)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d||""))return "";const x=ymd(addDays(new Date(d+"T12:00:00"),-n)),h=ymd(new Date());return x<h?h:x};
function terPlusVerk(t){const F=S.food||{},L=[],key="ter:"+t.id;
  const pl=(F.packlist||{})["t_"+t.id];if(pl&&pl.name)L.push(["🎒","Packliste",`data-terplus="pack|${esc(t.id)}"`]);
  projs().filter(p=>p.ref===key).forEach(p=>L.push(["🎁",p.name,`data-nav="geschenke|"`]));
  const n=shopItems().filter(s=>!s.done&&s.src===t.name).length;if(n)L.push(["🧺",n+" auf der Einkaufsliste",`data-nav="einkauf|"`]);return L}
async function terPlus(kind,id){const t=(S.food.termin||{})[id];if(!t)return;const key="ter:"+id;
  if(kind==="pack"){const lid="t_"+id;try{if(!((S.food.packlist||{})[lid]||{}).name)await S.store.setPath("food/packlist/"+lid,{name:"📅 "+String(t.name).slice(0,60),at:Date.now()});S.terDraft=null;S.packList=lid;goNav("ausflug|tt:pack")}catch(_){toast("Konnte nicht speichern.")}return}
  if(kind==="prio"){S.terDraft=null;prioNew("frei",{name:String(t.name).slice(0,80),ref:key,due:terDayBefore(t.date,1),areaSet:true,who:t.care&&t.care!=="both"?t.care:""});return}
  if(kind==="shop"){editBox("🧺 Einkauf für "+t.name,[{k:"items",label:"Was (mehrere mit Komma)",type:"text",val:"",ph:"Zum Beispiel Kuchen, Kerzen"}],async V=>{const L=String(V.items||"").split(/[,;\n]/).map(x=>x.trim()).filter(Boolean);if(!L.length){toast("Bitte eintragen, was gebraucht wird.");return}
      await shopAddMany(L,String(t.name).slice(0,80),{force:true});toast("🧺 "+L.length+(L.length===1?" Eintrag":" Einträge")+" auf der Einkaufsliste, für "+t.name);render()});return}
  if(kind==="gift"){const due=terDayBefore(t.date,7);
    editBox("🎁 Geschenk zu "+t.name,[{k:"name",label:"Was",type:"text",val:"",ph:"Idee, falls schon eine da ist"},{k:"who",label:"Für wen",type:"chips",opts:[["","Jemand anderes"]].concat(whoOpts().filter(o=>o[0]!=="both").map(o=>[o[0],o[1]])),val:""},{k:"for",label:"Für jemand anderen (Name)",type:"text",val:""},{k:"rem",label:"🔔 Erinnern",type:"chips",opts:[["1",due?"Eine Woche vorher ("+dLabel(due)+")":"Ja"],["","Nein"]],val:"1"}],async V=>{
      const iid=newId("p"),name=(String(V.name||"").trim()||"Geschenk: "+t.name).slice(0,80);
      await S.store.setPath("food/idea/"+iid,Object.assign({name,cat:"geschenk",state:"geplant",ref:key,at:Date.now(),by:S.me||""},V.who?{who:V.who}:{},String(V.for||"").trim()?{for:String(V.for).trim().slice(0,60)}:{}));
      if(V.rem)await S.store.setPath("food/prio/"+newId("w"),Object.assign({name:("🎁 Geschenk besorgen: "+t.name).slice(0,80),from:"geschenke",ref:key,at:Date.now(),by:S.me||""},due?{due}:{}));
      toast("🎁 Steht bei Geschenke"+(V.rem&&due?", Erinnerung am "+dLabel(due):""));render()});return}}

// ---------- Wer bleibt daheim? (Florian 19.11.2026: „Ideen alle Gut“) ----------
// Kita zu oder Kind krank: ein Fenster fragt je Tag, wer daheim bleibt, und trägt genau das als Hausdienst ein (dieselben Haken wie in Tag und Woche, samt Abgleich mit Bringen und Abholen).
// Auslöser: Kita-Termin der Art „Kita zu“ (Zeile „＋ Dazu anlegen“ und Toast nach dem Speichern) und der Knopf unter der Tafel Bringen und Abholen.
function stayDays(from,to){const L=[];if(!/^\d{4}-\d{2}-\d{2}$/.test(from||""))return L;let d=new Date(from+"T12:00:00");const z=/^\d{4}-\d{2}-\d{2}$/.test(to||"")&&to>from?to:from;
  for(let i=0;i<14&&ymd(d)<=z;i++){if((d.getDay()+6)%7<5)L.push(ymd(d));d=addDays(d,1)}return L}
function stayOpen(days,title){const hoT=tasks().find(t=>t.owner==="ho");if(!hoT){toast("Dafür braucht es die Aufgabe Hausdienst.");return}if(!days.length){toast("An diesem Tag ist ohnehin keine Kita.");return}
  S.mboxAt=Date.now();mboxClose();const el=document.createElement("div");el.id="mbox";const me=S.me==="p1"?"p1":"p0",ot=me==="p0"?"p1":"p0",c=p=>esc(pInit(p));
  const at=ds=>{const d=new Date(ds+"T12:00:00"),wk=wkKey(mondayOf(d)),key=hoT.id+"__"+((d.getDay()+6)%7);return {wk,key,cur:ticksOf(wk)[key]}};
  const draw=()=>{el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Wer bleibt daheim?"><div class="section-head"><h2>🏠 Wer bleibt daheim?</h2></div><div class="freq">${esc(title||"")}${title?". ":""}Die Wahl steht dann als Hausdienst an dem Tag.</div>
    ${days.map(ds=>{const {cur}=at(ds),on=(p,h)=>!!cur&&cur.by===p&&!cur.part&&(cur.half||"")===h;return `<div class="fld stayday"><span>${esc(dLabel(ds))}</span><div class="unl">${[[me,""],[ot,""],[me,"vm"],[ot,"vm"]].map(([p,h])=>`<button type="button" class="chipbtn neutral" data-stay="${ds}|${p}|${h}" aria-pressed="${on(p,h)}">${h?c(p)+" vorm., "+c(p==="p0"?"p1":"p0")+" nachm.":pDot(p)+esc(pname(p))}</button>`).join("")}${cur?`<button type="button" class="chipbtn neutral" data-stay="${ds}|clear|">✕</button>`:""}</div></div>`}).join("")}
    <div class="btnrow"><button class="primary" type="button" data-stayx="1">Fertig</button></div></div>`};
  draw();document.body.appendChild(el);
  el.addEventListener("click",async e=>{if(e.target.closest("[data-stayx]")){mboxClose();render();return}const b=e.target.closest("[data-stay]");if(!b){if(e.target===el.firstElementChild&&Date.now()-(S.mboxAt||0)>600){mboxClose();render()}return}
    const [ds,p,h]=b.dataset.stay.split("|"),{wk,key}=at(ds);try{await S.store.tick(wk,key,p==="clear"?null:Object.assign({by:p,at:Date.now()},h?{half:h}:{}));await hoKidSync(wk,key);draw()}catch(_){toast("Konnte nicht speichern. Bitte nochmal tippen.")}})}
const terIsZu=t=>!!t&&t.tag==="kita"&&t.kk==="zu";
function stayClick(b){const d=b.dataset;if(d.stayter){const t=(S.food.termin||{})[d.stayter];if(t)stayOpen(stayDays(t.date,t.to),t.name);return true}
  if(d.stayweek!=null){const mon=addDays(mondayOf(new Date()),7*(+d.stayweek||0)),h=ymd(new Date());stayOpen([0,1,2,3,4].map(i=>ymd(addDays(mon,i))).filter(x=>x>=h),"Kind krank oder Kita zu");return true}return false}
