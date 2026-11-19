// ---------- Ein Eintrag, viele Orte: Ausflüge, Kurse und Türchen als Termine (Florian 19.11.2026 im Dossier: „gut, machen“; Aufgaben vorerst nicht: „Erstmal ohne Aufgaben“) ----------
// Der Eintrag bleibt in seinem Bereich (food/trip, food/play, food/adoor). Hat er einen Tag, gibt es dazu einen verknüpften Termin mit fester Id und ref:
//   Ausflug mit Tag → food/termin/a_<id> (ref trip:<id>), Kurs mit „Wann“ → je Wochentag food/termin/c_<id>_<wt> (wöchentlich, ref play:<id>),
//   Türchen „Unternehmung“ → food/termin/d_<kal>_<tag> (ref adoor:<kal>_<tag>).
// linkTerSync gleicht bei jedem Datenstand ab (Tag und Name kommen aus dem Bereich). Im Termin-Fenster geänderter Tag, Uhrzeit und Name gehen zurück in den Bereich (linkBack).
// Uhrzeit, Ort, Für wen, 🔔 und Notiz gehören dem Termin. Löschen fragt wie bisher (nur den Tag wegnehmen oder ganz löschen).
const WD_SHORT=["So","Mo","Di","Mi","Do","Fr","Sa"];
const linkRef=x=>{const m=/^(trip|play|adoor|hstep):(.+)$/.exec(String(x&&x.ref||""));return m?[m[1],m[2]]:null};
function linkWant(){const W={};
  trips().forEach(x=>{if(x.date&&!x.done&&/^\d{4}-\d\d-\d\d$/.test(x.date))W["a_"+x.id]={ref:"trip:"+x.id,name:x.name,date:x.date,place:x.place||"",tag:"ausflug"}});
  plays().forEach(x=>{if(x.sec!=="sport"||!x.when)return;const t=whenTime(x.when);whenDays(x.when).forEach(wd=>{W["c_"+x.id+"_"+wd]={ref:"play:"+x.id,name:x.name,wd,time:t,who:"kid",tag:"sport",rep:"w"}})});
  advCals().forEach(c=>Object.values(advDoors(c.id)).forEach(x=>{if(x.kind!=="aktiv"||!x.name)return;W["d_"+x.id]={ref:"adoor:"+x.id,name:x.name+" (Türchen "+x.day+")",date:(c.year||advYear())+"-12-"+String(x.day).padStart(2,"0"),who:c.for==="kid"?"kid":""}}));
  hstepsAll().forEach(x=>{if(x.date&&!x.done&&/^\d{4}-\d\d-\d\d$/.test(x.date)&&hprojs().some(p=>p.id===x.proj))W["s_"+x.id]={ref:"hstep:"+x.id,name:x.name,date:x.date,who:x.who||""}});
  return W}
const nextWd=wd=>{let d=startOfDay(new Date());while(d.getDay()!==wd)d=addDays(d,1);return ymd(d)};
let linkBusy=false;
async function linkTerSync(){if(linkBusy||!S.food||!S.store)return;linkBusy=true;try{const W=linkWant(),T=S.food.termin||{},P=(k,v)=>S.store.setPath("food/termin/"+k,v);
  for(const id of Object.keys(W)){const w=W[id],o=T[id];
    if(!o||!o.name){const v={name:w.name,ref:w.ref,date:w.date||nextWd(w.wd),at:Date.now(),by:""};if(w.time)v.time=w.time;if(w.who)v.who=w.who;if(w.tag)v.tag=w.tag;if(w.rep)v.rep=w.rep;if(w.place)v.place=w.place;await P(id,v);continue}
    if(o.name!==w.name)await P(id+"/name",w.name);
    if(w.date&&o.date!==w.date)await P(id+"/date",w.date);
    if(w.wd!=null&&(!o.date||ymdD(o.date).getDay()!==w.wd))await P(id+"/date",nextWd(w.wd));
    if(w.wd!=null&&w.time&&o.time!==w.time)await P(id+"/time",w.time);
    if(/^s_/.test(id)&&(o.who||"")!==(w.who||""))await P(id+"/who",w.who||null);
    if(o.ref!==w.ref)await P(id+"/ref",w.ref)}
  for(const id of Object.keys(T)){const o=T[id];if(o&&/^[acds]_/.test(id)&&linkRef(o)&&!W[id])await P(id,null)}}
  catch(_){}finally{linkBusy=false}}
// Gespeichert im Termin-Fenster: Tag, Uhrzeit, Name zurück in den Bereich
async function linkBack(v,old){const L=linkRef(old);if(!L)return;const [k,id]=L;
  if(k==="trip"){const x=(S.food.trip||{})[id];if(!x)return;if(v.date!==x.date)await S.store.setPath("food/trip/"+id+"/date",v.date);if(v.name&&v.name!==x.name)await S.store.setPath("food/trip/"+id+"/name",v.name);if((v.place||null)!==(x.place||null)&&v.place)await S.store.setPath("food/trip/"+id+"/place",v.place);return}
  if(k==="hstep"){const x=(S.food.hstep||{})[id];if(!x)return;if(v.date!==x.date)await S.store.setPath("food/hstep/"+id+"/date",v.date);if(v.name&&v.name!==x.name)await S.store.setPath("food/hstep/"+id+"/name",v.name);return}
  if(k==="play"){const x=(S.food.play||{})[id];if(!x)return;if(v.name&&v.name!==x.name)await S.store.setPath("food/play/"+id+"/name",v.name);
    const ow=old.date?ymdD(old.date).getDay():null,nw=ymdD(v.date).getDay(),days=whenDays(x.when).map(d=>d===ow?nw:d),t=v.time||"";
    const nd=[...new Set(days)].sort((a,b)=>((a+6)%7)-((b+6)%7));if(nw!==ow||t!==(whenTime(x.when)||"")){const w=nd.map(d=>WD_SHORT[d]).join(", ")+(t?" "+t+" Uhr":"");await S.store.setPath("food/play/"+id+"/when",w)}
    // der alte Wochentag-Termin wird vom Abgleich ersetzt
    return}}
// Löschen eines verknüpften Termins = wie bisher im Bereich fragen
function linkDel(tid){const x=(S.food.termin||{})[tid],L=linkRef(x);if(!L)return false;
  if(L[0]==="trip"){calLpDel("ctrip",L[1]);return true}
  if(L[0]==="play"){calLpDel("cplay",L[1]);return true}
  if(L[0]==="adoor"){calLpDel("advent",L[1]);return true}
  if(L[0]==="hstep"){calLpDel("chstep",L[1]);return true}
  return false}
// Im Kalender ausblenden: Türchen, die für diese Person noch Überraschung sind
function linkHide(x){const L=linkRef(x);if(!L||L[0]!=="adoor")return false;const d=(S.food.adoor||{})[L[1]];const c=d&&advCals().find(y=>y.id===d.cal);return !!(c&&advHidden(c,d.day))}
