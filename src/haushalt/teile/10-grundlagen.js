(function(){
"use strict";
// ---------- Vorlage (nur per Knopf im leeren Zustand) ----------
const TEMPLATE={persons:["Florian","Judith"],rotOffset:0,tasks:[
 {id:"essen",name:"Essen machen, Tisch wischen, Küche in Schuss halten",owner:"ho",freq:"day",pts:3},
 {id:"schlafzimmer",name:"Schlafzimmer aufräumen",owner:"both",freq:"day",pts:1},
 {id:"einkaufen",name:"Einkaufen",owner:"rot",pack:"A",freq:"week",times:3,pts:4},
 {id:"bad",name:"Bad putzen",owner:"rot",pack:"A",freq:"week",times:1,pts:5},
 {id:"muell",name:"Müll rausbringen",owner:"rot",pack:"A",freq:"week",times:3,pts:1},
 {id:"plastik",name:"Plastikmüll rausbringen",owner:"rot",pack:"A",freq:"week",times:1,pts:1},
 {id:"waesche",name:"Wäsche waschen, auf- und abhängen",owner:"rot",pack:"B",freq:"week",times:3,pts:3},
 {id:"saugen",name:"Saugen (nach Bedarf)",owner:"rot",pack:"B",freq:"week",times:2,pts:3},
 {id:"kueche-putzen",name:"Küche putzen",owner:"rot",pack:"B",freq:"week",times:1,pts:5},
 {id:"treppe",name:"Saugen komplett",subs:["Treppe","🤖","Oben"],owner:"rot",pack:"B",freq:"week",times:1,pts:1},
 {id:"mittag",name:"Gemeinsames Mittagessen",owner:"both",freq:"week",times:1,pts:2},
 {id:"eigenes",name:"Eigenes Zeug aufräumen (alles außer Schlafzimmer)",owner:"both",freq:"week",times:3,pts:1},
 {id:"kidwaesche",name:"Kinderkleidung einräumen",owner:"p1",freq:"week",times:3,pts:1},
 {id:"pflanzen-drinnen",name:"Pflanzen drinnen",owner:"p1",freq:"week",times:1,pts:2},
 {id:"pflanzen-draussen",name:"Pflanzen draußen",owner:"p0",freq:"week",times:2,pts:1},
 {id:"balkon",name:"Balkon",owner:"p0",freq:"week",times:1,pts:2},
 {id:"sz-saugen",name:"Staubsaugen Schlafzimmer",owner:"p0",freq:"week",times:1,pts:2},
 {id:"zimmer-drueben",name:"Zimmer drüben putzen",owner:"rot",freq:"month",pts:6},
 {id:"flaechen-1",name:"Flächen: Kommode und Fensterbank",owner:"p1",freq:"month",pts:2},
 {id:"flaechen-0",name:"Flächen: roter Schrank",owner:"p0",freq:"month",pts:2},
 {id:"buecherregal",name:"Bücherregal Wohnzimmer",owner:"p1",freq:"half",pts:6},
 {id:"grossputz",name:"Großputz (langes Wochenende)",owner:"p0",freq:"half",pts:48},
 {id:"center",name:"Center putzen",owner:"rot",freq:"year",pts:18}
]};
const FREQ_LABEL={day:"täglich",week:"pro Woche",month:"monatlich",half:"halbjährlich",year:"jährlich"};
const OWNER_LABEL={rot:"Im Wechsel",both:"Beide",ho:"Hausdienst"};
const LEVELS=["Chaos-Höhle","Studi-Bude","Ordentliche WG","Gemütliches Nest","Blitzblank-Wohnung","Wohlfühl-Zuhause","Hausmeister-Palast","Glanz-Villa","Putz-Schloss","Legendäres Heim"];
const DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];
const GOAL=0.8;

// ---------- Datum ----------
const DAY=864e5;
function startOfDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function mondayOf(d){const x=startOfDay(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function isoWeek(d){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=t.getUTCFullYear();const w=Math.ceil(((t-Date.UTC(y,0,1))/DAY+1)/7);return {y,w}}
function wkKey(mon){const {y,w}=isoWeek(mon);return y+"-W"+String(w).padStart(2,"0")}
function mondayFromKey(k){const [y,w]=k.split("-W").map(Number);return addDays(mondayOf(new Date(y,0,4)),(w-1)*7)}
const REF=new Date(2024,0,1);
function weekIndex(mon){return Math.round((mon-REF)/(7*DAY))}
function periodOf(freq,mon){const th=addDays(mon,3);const y=th.getFullYear(),m=th.getMonth();
  if(freq==="month")return {id:y+"-"+m,idx:y*12+m};
  if(freq==="half")return {id:y+"-H"+(m<6?1:2),idx:y*2+(m<6?0:1)};
  if(freq==="year")return {id:""+y,idx:y};
  return {id:wkKey(mon),idx:weekIndex(mon)}}
const fmt=(d,o)=>d.toLocaleDateString("de-DE",o);

// ---------- Zustand ----------
const S={kitaSec:"termine",kitaDraft:null,kitaText:"",playMapOpen:false,playMapEdit:false,playMapText:"",playDraft:null,playSec:"",playF:"",projFilter:"",projText:"",tripTab:"ideen",tripDraft:null,tripFilter:"",packList:"main",packListNew:false,packText:"",ideas:null,shopCatEdit:null,lunchDraft:null,lunchOpen:null,lunchMapOpen:false,lunchMapEdit:false,lunchMapText:"",recDraft:null,recOpen:null,planEdit:null,planText:"",planRec:null,foodWeek:null,food:{},foodTab:"plan",shopText:"",store:null,mode:"loading",config:null,weeks:{},view:mondayOf(new Date()),tab:"camp",filter:"alle",hideDone:false,groupBy:"freq",me:null,draft:null,timedOut:false};
try{const m=localStorage.getItem("hq-me");if(m==="p0"||m==="p1")S.me=m;const f=localStorage.getItem("hq-filter");if(f==="meine")S.filter="meine";S.hideDone=localStorage.getItem("hq-hidedone")==="1";if(localStorage.getItem("hq-groupby")==="art")S.groupBy="art";const ft=localStorage.getItem("hq-foodtab");if(ft&&ft!=="shop"&&ft!=="mittag")S.foodTab=ft;}catch(e){}

// ---------- Speicher-Adapter ----------
function dbStore(db){
  const chains={};
  return {
    listen(onCfg,onWeeks,onErr){
      db.doc("config/main").onSnapshot(s=>onCfg(s.exists?s.data():null,s.metadata.fromCache),onErr);
      db.collection("weeks").limit(1000).onSnapshot(q=>{const w={};q.docs.forEach(d=>{w[d.id]=d.data()});onWeeks(w,q.metadata.fromCache)},onErr);
    },
    tick(wk,key,val){const run=async()=>{const ref=db.doc("weeks/"+wk);
        if(!S.weeks[wk]) await ref.set({wk,ticks:{[key]:val}}); else await ref.update({ticks:{[key]:val}});};
      chains[wk]=(chains[wk]||Promise.resolve()).then(run,run);return chains[wk]},
    saveConfig(cfg){return db.doc("config/main").set(cfg)}
  }
}
function localStore(){
  const K="hq-local-v1";let data={config:null,weeks:{}};
  try{const raw=localStorage.getItem(K);if(raw)data=JSON.parse(raw)}catch(e){}
  let cbs=null;const save=()=>{try{localStorage.setItem(K,JSON.stringify(data))}catch(e){}};
  const emit=()=>{if(cbs){cbs[0](data.config,false);cbs[1](JSON.parse(JSON.stringify(data.weeks)),false);if(cbs[3])cbs[3](JSON.parse(JSON.stringify(data.food||{})))}};
  return {
    listen(a,b,c,d){cbs=[a,b,c,d];emit()},
    async tick(wk,key,val){data.weeks[wk]=data.weeks[wk]||{wk,ticks:{}};data.weeks[wk].ticks[key]=val;save();emit()},
    async saveConfig(cfg){data.config=cfg;save();emit()},
    async setPath(p,val){const parts=p.split("/");let o=data;for(let i=0;i<parts.length-1;i++){if(typeof o[parts[i]]!=="object"||o[parts[i]]===null)o[parts[i]]={};o=o[parts[i]]}
      if(val===null)delete o[parts[parts.length-1]];else o[parts[parts.length-1]]=val;save();emit()}
  }
}

// ---------- Logik ----------
function tasks(){return (S.config&&S.config.tasks)||[]}
function pname(p){const ps=(S.config&&S.config.persons)||TEMPLATE.persons;return p==="p0"?ps[0]:ps[1]}
function slotsOf(t){return t.freq==="day"?7:t.freq==="week"?Math.max(1,t.times|0||1):1}
function load(t){return (t.pts||0)*slotsOf(t)}
function group(f){return f==="day"||f==="week"?"week":f}
// Rotationsaufgaben je Rhythmus in zwei gleich schwere Pakete A/B teilen
function rotSplit(){const res={};
  ["week","month","half","year"].forEach(g=>{const all=tasks().filter(t=>t.owner==="rot"&&group(t.freq)===g);
    let a=0,b=0;all.forEach(t=>{if(t.pack==="A"){res[t.id]="A";a+=load(t)}else if(t.pack==="B"){res[t.id]="B";b+=load(t)}});
    all.filter(t=>t.pack!=="A"&&t.pack!=="B").sort((x,y)=>load(y)-load(x)).forEach(t=>{if(a<=b){res[t.id]="A";a+=load(t)}else{res[t.id]="B";b+=load(t)}})});
  return res}
// Gerade ISO-KW / gerader Monat / gerades Jahr: Paket A -> Person 1 (Florian), Paket B -> Person 2
function rotParity(freq,mon){const th=addDays(mon,3);
  if(group(freq)==="week")return isoWeek(mon).w%2;
  if(freq==="month")return (th.getMonth()+1)%2;
  if(freq==="half")return th.getMonth()<6?1:0;
  return th.getFullYear()%2}
function ownerFor(t,mon,split){
  if(t.owner!=="rot")return t.owner;
  const flip=(rotParity(t.freq,mon)+((S.config&&S.config.rotOffset)|0))%2;
  const pack=(split||rotSplit())[t.id]||"A";
  return (pack==="A")===(flip===0)?"p0":"p1"}
function ticksOf(wk){return (S.weeks[wk]&&S.weeks[wk].ticks)||{}}
function periodTick(t,mon){const pid=periodOf(t.freq,mon).id;const key=t.id+"__p";
  for(const wk in S.weeks){const v=ticksOf(wk)[key];if(v&&periodOf(t.freq,mondayFromKey(wk)).id===pid)return {wk,v}}
  return null}
// Längere Rhythmen sind erst ab der Mitte ihres Zeitraums dran (Florian 15.11.2026): Monat ab dem 15., Halbjahr ab 1.4./1.10., Jahr ab 1.7.
function periodMid(freq,mon){const th=addDays(mon,3),y=th.getFullYear(),m=th.getMonth();
  if(freq==="month")return new Date(y,m,15);if(freq==="half")return new Date(y,m<6?3:9,1);return new Date(y,6,1)}
function periodDue(t,mon,ref){if(group(t.freq)==="week")return true;mon=mon||mondayOf(new Date());
  if(!ref){const cur=mondayOf(new Date());ref=+mon===+cur?startOfDay(new Date()):addDays(mon,6)}return ref>=periodMid(t.freq,mon)}
function weekScore(wk){const mon=mondayFromKey(wk);const tk=ticksOf(wk);const byId={};tasks().forEach(t=>byId[t.id]=t);
  const pts={p0:0,p1:0};
  for(const k in tk){const v=tk[k];if(!v)continue;const t=byId[k.split("__")[0]];if(!t)continue;if(v.by==="p0"||v.by==="p1")pts[v.by]+=t.pts||0}
  let due=0,done=0;const split=rotSplit();const assigned={p0:0,p1:0};
  tasks().forEach(t=>{if(group(t.freq)!=="week")return;const n=slotsOf(t);due+=n*(t.pts||0);
    for(let i=0;i<n;i++)if(tk[t.id+"__"+i])done+=t.pts||0;
    const o=ownerFor(t,mon,split);if(o==="p0"||o==="p1")assigned[o]+=load(t)});
  return {pts,due,done,pct:due?done/due:0,assigned}}
function allTime(){const tot={p0:0,p1:0};Object.keys(S.weeks).forEach(wk=>{const s=weekScore(wk);tot.p0+=s.pts.p0;tot.p1+=s.pts.p1});return tot}
function levelFor(xp){let n=0;const need=k=>Math.round(120*k*(k+1)/2);while(need(n+1)<=xp&&n<LEVELS.length-1)n++;return {n,cur:xp-need(n),span:need(n+1)-need(n)}}
function streak(){const cur=mondayOf(new Date());let s=0;let m=addDays(cur,-7);
  for(let i=0;i<200;i++){const sc=weekScore(wkKey(m));if(sc.pct>=GOAL){s++;m=addDays(m,-7)}else break}
  if(weekScore(wkKey(cur)).pct>=GOAL)s++;return s}

// ---------- Aktionen ----------
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2600)}
// Toast mit Knopf, z. B. "Auch von der Einkaufsliste nehmen"
function toastAct(msg,lab,fn){const el=document.getElementById("toast");el.innerHTML=`<span>${esc(msg)}</span> <button type="button" class="toastbtn">${esc(lab)}</button>`;el.hidden=false;el.querySelector(".toastbtn").onclick=async()=>{el.hidden=true;await fn()};clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,8000)}
// Herkunft geleert oder gelöscht: anbieten, die daraus entstandenen Einträge mitzunehmen (Florian 15.11.2026)
function offerShopRemove(msg,items){items=items.filter(i=>i&&!i.done);if(!items.length){toast(msg);return}
  toastAct(msg+" "+items.length+(items.length===1?" Sache steht":" Sachen stehen")+" noch auf der Einkaufsliste.","🧺 Auch entfernen",async()=>{try{for(const i of items)await S.store.setPath("food/shop/"+i.id,null);toast("Von der Einkaufsliste genommen")}catch(_){toast("Konnte nicht speichern.")}})}
function floatAt(btn,txt){const card=btn.closest(".task");if(!card)return;const f=document.createElement("span");f.className="float";f.textContent=txt;
  const r=btn.getBoundingClientRect(),c=card.getBoundingClientRect();f.style.left=(r.left-c.left+4)+"px";f.style.top=(r.top-c.top-6)+"px";card.appendChild(f);setTimeout(()=>f.remove(),950)}
// Florian 15.11.2026: "Saugen" heißt "Saugen (nach Bedarf)", das Paket mit der Treppe wird "Saugen komplett" mit Teilbereichen. Einmalig.
// Florian 16.11.2026: Kita ist kein Dienst und keine Aufgabe. Bringen steht nur noch auf der Kind-Seite; die Wochen-Aufgaben „Bringen“ fallen einmalig weg (Flag mig.bring1).
function migBring(cfg){const c=JSON.parse(JSON.stringify(cfg));c.tasks=c.tasks.filter(t=>!(/^bringen$/i.test((t.name||"").trim())&&t.freq==="week"));c.mig=Object.assign({},c.mig,{bring1:Date.now()});S.store.saveConfig(c).catch(()=>{})}
function migSaugen(cfg){const c=JSON.parse(JSON.stringify(cfg));let ch=false;c.tasks.forEach(t=>{if(t.id==="saugen"&&/^Saugen \(Wohnbereich\)$/.test(t.name||"")){t.name="Saugen (nach Bedarf)";ch=true}if(t.id==="treppe"&&!hasSubs(t)){t.name="Saugen komplett";t.subs=["Treppe","🤖","Oben"];ch=true}});c.mig=Object.assign({},c.mig,{saug1:Date.now()});S.store.saveConfig(c).catch(()=>{})}
// Verlinkung aus Aufgaben in andere Bereiche (Florian 15.11.2026): Einkaufen → Einkaufsliste. Weitere Zeilen möglich.
// Putzaufgaben: kleines 🧴 öffnet Vorschläge für die Einkaufsliste (Drogerie), passend zur Aufgabe vorausgewählt
const CLEAN_RX=/putz|wisch|saug|bad|klo|toilette|wc|küche|fenster|staub|flächen|spül|boden|müll|wäsche|bett/i;
const CLEAN_ITEMS=[["Allzweckreiniger",/flächen|wisch|küche|putz/i],["Badreiniger",/bad|dusche/i],["WC-Reiniger",/klo|toilette|wc|bad/i],["Glasreiniger",/fenster|spiegel/i],["Spülmittel",/küche|spül/i],["Spülmaschinentabs",/spül|küche/i],["Schwämme",/küche|spül|bad|putz/i],["Mikrofasertücher",/staub|flächen|wisch|fenster|putz/i],["Bodenreiniger",/boden|wisch/i],["Staubsaugerbeutel",/saug/i],["Müllbeutel",/müll/i],["Waschmittel",/wäsche|bett/i],["Weichspüler",/wäsche/i],["Küchenrolle",/küche|putz/i]];
function cleanPick(t){const n=(t&&t.name)||"",L=CLEAN_ITEMS.map(x=>x[0]);S.shopPick={blocks:[{src:"",lines:L}],mode:"nur",sel:{}};CLEAN_ITEMS.forEach((x,i)=>{if(x[1].test(n))S.shopPick.sel["0|"+i]=1});render()}
const TASK_LINKS=[[/^bringen|kita/i,()=>{const n=kitaBring().length+kitaMitTermine().length;return `<button class="chipbtn tasklink" data-nav="kita|ks:tasche">📦 Mitbringen${n?": "+n:""} ›</button><button class="chipbtn tasklink" data-go="kind">🚸 Wer bringt und holt ›</button>`},()=>`<button class="tlink" data-nav="kita|ks:tasche" aria-label="Zu Mitbringen">📦›</button>`],[/einkauf|supermarkt|drogerie|wocheneinkauf/i,()=>{const n=shopItems().filter(i=>!i.done).length;return `<button class="chipbtn tasklink" data-go="einkauf">🧺 Einkaufsliste${n?": "+n+" offen":""} ›</button>`},()=>`<button class="tlink" data-go="einkauf" aria-label="Zur Einkaufsliste">🧺›</button>`]];
function taskLink(t,small){const n=(t&&t.name)||"",m=TASK_LINKS.find(x=>x[0].test(n));const cl=!m&&CLEAN_RX.test(n)?`<button class="tlink" data-cleanshop="${esc(t.id)}" aria-label="Putzmittel auf die Einkaufsliste">🧴</button>`:"";return m?m[small?2:1]():cl}
const hasSubs=t=>Array.isArray(t.subs)&&t.subs.length>0;
async function toggle(btn){
  if(!S.me){toast("Wähle oben zuerst, wer du bist.");return}
  {const cm=mondayOf(new Date());const isHO=(tasks().find(x=>x.id===btn.dataset.task)||{}).owner==="ho";if(+S.view>+cm&&!isHO){toast("Vorschau: abhaken geht erst in der Woche selbst. Hausdienst kannst du schon eintragen.");return}if(+S.view<+cm&&S.wkEdit!==wkKey(S.view)){toast("Archiv: erst „✏️ Nachtragen“ antippen.");return}}
  const t=tasks().find(x=>x.id===btn.dataset.task);if(!t)return;
  let wk=wkKey(S.view),key,cur;
  if(btn.dataset.sub!=null&&hasSubs(t)){const base=t.id+"__"+btn.dataset.slot,sk=base+"_s"+btn.dataset.sub,tk=ticksOf(wk),nv=tk[sk]?null:{by:S.me,at:Date.now()};
    try{await S.store.tick(wk,sk,nv);const all=t.subs.every((_,j)=>j===+btn.dataset.sub?!!nv:!!tk[base+"_s"+j]);if(all&&!tk[base])await S.store.tick(wk,base,{by:S.me,at:Date.now()});if(!all&&tk[base])await S.store.tick(wk,base,null)}catch(e){toast("Konnte nicht speichern. Bitte nochmal tippen.")}return}
  if(btn.dataset.slot==="p"){const pt=periodTick(t,S.view);key=t.id+"__p";if(pt){wk=pt.wk;cur=pt.v}}
  else if(btn.dataset.split){const base=t.id+"__"+btn.dataset.slot,tk=ticksOf(wk),leg=tk[base];
    if(leg&&leg.by===S.me&&!tk[base+"_"+S.me]){key=base;cur=leg}else{key=base+"_"+S.me;cur=tk[key]}}
  else{key=t.id+"__"+btn.dataset.slot;cur=ticksOf(wk)[key]}
  const val=cur?null:{by:S.me,at:Date.now()};
  try{await S.store.tick(wk,key,val);if(t.owner==="ho")await hoKidSync(wk,key)}catch(e){toast(e&&e.code==="invalid_argument"?"Speichern nicht erlaubt: Du brauchst Bearbeitungsrechte.":"Konnte nicht speichern. Bitte nochmal tippen.")}
}

