// ---------- 🫧 Nach Bedarf (Florian 19.11.2026: „A, fest wählbar je Aufgabe“; Bild /mnt/project-files/design/nach-bedarf-wechsel.png) ----------
// Aufgabe mit freq:"need", every = etwa alle N Tage, owner = "alt" (🔁 Abwechselnd: dran ist, wer es zuletzt nicht gemacht hat) oder p0, p1, both.
// Haken liegen unabhängig von der Woche in food/need/<aufgabe>/<id> {at,by,own?}; „Später“ in food/needp/<aufgabe> {until,by,at}.
// Füllbalken seit dem letzten Haken: ab 80 % „bald“, ab 100 % „voll“ (dann in „Heute für dich“ bei der Person, die dran ist). Keine Wirkung auf rotSplit.
const NEED_EVERY=[[7,"jede Woche"],[14,"alle 2 Wochen"],[21,"alle 3 Wochen"],[28,"alle 4 Wochen"],[42,"alle 6 Wochen"],[91,"alle 3 Monate"],[182,"alle 6 Monate"],[365,"einmal im Jahr"]];
const NEED_DAY=864e5,NEED_BALD=.8;
const needTasks=()=>((S.config&&S.config.tasks)||[]).filter(t=>t.freq==="need");
const needEveryL=d=>{const e=NEED_EVERY.find(x=>x[0]===+d);return e?e[1]:"alle "+Math.round(d/7)+" Wochen"};
// Haken: neue aus food/need, dazu alte aus der Zeit als Monats-/Halbjahres-/Jahres-Aufgabe (weeks/<wk>/ticks/<id>__p), damit nichts verloren geht
function needTicks(id){const o=((S.food&&S.food.need)||{})[id]||{},L=Object.keys(o).filter(k=>o[k]&&o[k].at).map(k=>Object.assign({tid:k},o[k]));
  for(const wk in S.weeks){const v=ticksOf(wk)[id+"__p"];if(v&&v.at&&(v.by==="p0"||v.by==="p1"))L.push(Object.assign({old:wk},v))}
  return L.sort((a,b)=>a.at-b.at)}
function needInfo(t,now){now=now||Date.now();const E=(+t.every||28)*NEED_DAY,T=needTicks(t.id),last=T[T.length-1]||null,base=last?last.at:(t.since||now);
  const P=((S.food&&S.food.needp)||{})[t.id],due=P&&P.until>base+E?P.until:base+E,fill=Math.max(0,(now-(due-E))/E);
  const other=p=>p==="p0"?"p1":p==="p1"?"p0":null,who=t.owner==="alt"?(last?other(last.by):t.first||null):t.owner;
  const t0=+startOfDay(new Date(now)),today=last&&last.at>=t0?last:null;
  return {t,last,T,fill,due,who,today,st:fill>=1?"voll":fill>=NEED_BALD?"bald":"",later:!!(P&&P.until>base+E)}}
// Gehört es heute mir? (Alle, wenn noch niemand dran ist oder „Beide“)
const needMine=I=>!S.me||!I.who||I.who==="both"||I.who===S.me;
function needWhoTxt(I){return I.who==="both"?"Beide":I.who?pname(I.who)+" ist dran":"Wer zuerst kann"}
function needAgo(at){const d=Math.floor((+startOfDay(new Date())-+startOfDay(new Date(at)))/NEED_DAY);return d<=0?"heute":d===1?"gestern":d<14?"vor "+d+" Tagen":d<60?"vor "+Math.round(d/7)+" Wochen":"vor "+Math.round(d/30)+" Monaten"}
// Für „Heute für dich“: volle Aufgaben bei der Person, die dran ist, und was ich heute schon erledigt habe
function needHeute(){const L=[];needTasks().forEach(t=>{const I=needInfo(t);
  if(I.today&&(!S.me||I.today.by===S.me)){L.push({need:1,t,done:true,sub:"nach Bedarf"});return}
  if(I.fill>=1&&!I.today&&needMine(I))L.push({need:1,t,done:false,sub:"nach Bedarf · "+(I.last?"zuletzt "+needAgo(I.last.at):"noch nie abgehakt")})});return L}
// Abhaken: wer es macht, steht in by; gehörte es laut Plan dem anderen, steht dessen Kürzel in own (🤝 im Rückblick)
async function needTick(id){const t=needTasks().find(x=>x.id===id);if(!t)return;if(!S.me){toast("Wähle zuerst in den Einstellungen, wer du bist.");return}
  const I=needInfo(t);if(I.today&&I.today.by===S.me&&I.today.tid){await S.store.setPath("food/need/"+id+"/"+I.today.tid,null);toast("Haken von heute zurückgenommen");render();return}
  const own=(I.who==="p0"||I.who==="p1")&&I.who!==S.me?I.who:null,v={at:Date.now(),by:S.me};if(own)v.own=own;
  await S.store.setPath("food/need/"+id+"/"+newId("n"),v);if(I.later)await S.store.setPath("food/needp/"+id,null);
  toast(own?"Für "+pname(own)+" übernommen. Der Balken ist wieder leer.":t.owner==="alt"?"Erledigt. Nächstes Mal ist "+pname(S.me==="p0"?"p1":"p0")+" dran.":"Erledigt. Der Balken ist wieder leer.");render()}
// Später: eine Woche schieben, ohne Haken
async function needLater(id){const t=needTasks().find(x=>x.id===id);if(!t)return;const I=needInfo(t),until=Math.max(I.due,Date.now())+7*NEED_DAY;
  await S.store.setPath("food/needp/"+id,{until,by:S.me||"",at:Date.now()});toast("Eine Woche später");render()}
function needBar(I){const p=Math.min(1,I.fill);return `<span class="needbar${I.st?" "+I.st:""}" aria-hidden="true"><i style="width:${Math.round(p*100)}%"></i></span>`}
function needRow(I){const t=I.t,sub=[`etwa ${needEveryL(t.every||28)}`,I.last?`zuletzt ${needAgo(I.last.at)}${I.last.by?" ("+pInit(I.last.by)+")":""}`:"noch nie abgehakt",needWhoTxt(I)].join(" · ");
  return `<li class="needrow${I.today?" hdone":""}"><div class="needl"><b>${esc(t.name)}${I.st==="voll"?' <em class="needst voll">voll</em>':I.st==="bald"?' <em class="needst">bald</em>':""}${I.later?' <em class="needst">⏭ später</em>':""}</b>${needBar(I)}<span class="freq">${esc(sub)}</span></div><button class="hchk" data-need="${esc(t.id)}" aria-pressed="${!!I.today}" aria-label="${esc(t.name)} ${I.today?"heute erledigt, Tipp nimmt den Haken zurück":"abhaken"}">${I.today?"✓":""}</button></li>`}
// Abschnitt im Haushalt (zugeklappt), volle zuerst
// Jetzt dran (voll oder heute erledigt): steht in „Diese Woche“
const needDue=I=>I.fill>=1||!!I.today;
function needDueHtml(){const L=needTasks().map(t=>needInfo(t)).filter(needDue).sort((a,b)=>b.fill-a.fill);return L.length?`<div class="donesep needsep">🫧 Nach Bedarf, jetzt dran</div><ul class="needlist needdue">${L.map(needRow).join("")}</ul>`:""}
function needSection(rest){let L=needTasks().map(t=>needInfo(t)).sort((a,b)=>b.fill-a.fill);if(!L.length)return "";const n=L.filter(I=>I.fill>=1&&!I.today).length;
  if(rest){L=L.filter(I=>!needDue(I));const bd=L.filter(I=>I.st==="bald").length;return wkFold("need","🫧 Nach Bedarf, später",L.length+(bd?", "+bd+" bald":""),L.length?`<ul class="needlist">${L.map(needRow).join("")}</ul><div class="freq">Der Balken füllt sich seit dem letzten Haken. Ist er voll, steht die Aufgabe bei „Diese Woche“. Lange drücken: eine Woche später.</div>`:`<div class="freq">Alles ist gerade dran oder erledigt.</div>`,false)}
  return wkFold("need","🫧 Nach Bedarf",n?n+" voll":"nichts voll",`<ul class="needlist">${L.map(needRow).join("")}</ul><div class="freq">Der Balken füllt sich seit dem letzten Haken. Lange drücken: eine Woche später.</div>`,false)}
// Rückblick: Haken dieser Woche (Montag bis Sonntag)
function needWeekTicks(mon){const a=+mon,b=+addDays(mon,7),L=[];needTasks().forEach(t=>needTicks(t.id).forEach(v=>{if(v.at>=a&&v.at<b)L.push({t,v})}));return L}
// Einmalig (Flag config.mig.need1): Florians Liste anlegen oder vorhandene gleichnamige umstellen, nichts doppelt. „Saugen (nach Bedarf)“ bleibt.
const NEED_SEED=[["backofen","Backofen putzen",182,"alt",5,/backofen/],["kuehl","Kühlschrank putzen",91,"alt",5,/k(ü|ue)hlschrank.*putz/],["bett","Bett abziehen",21,"alt",2,/bett.*(abzieh|bezieh)|bettw(ä|ae)sche/],
  ["fenster","Fenster putzen",365,"alt",12,/fenster.*putz/],["heizung","Heizungen putzen und entlüften",365,"alt",4,/heizung/],
  ["kaffee","Kaffeemaschine entkalken",182,"J",1,/kaffee.*entkalk/],["gefrier","Gefrierfach abtauen",182,"alt",5,/gefrier|abtau/],["kidkleid","Kleidung des Kindes aussortieren",182,"alt",5,/aussortier/],["apotheke","Hausapotheke prüfen",182,"alt",2,/apotheke/],
  ["kocher","Wasserkocher entkalken",91,"alt",1,/wasserkocher/],["kiwa","Kinderwagen putzen",91,"alt",2,/kinderwagen/],["wama","Waschmaschine reinigen",91,"alt",1,/waschmaschine/],["matratze","Matratze wenden",91,"F",1,/matratze/],["abfluss","Abflüsse reinigen",91,"F",1,/abfl(ü|ue)ss/],
  ["handtuch","Handtücher wechseln",14,"alt",1,/handt(ü|ue)ch/],["kuehlab","Kühlschrank auf Abgelaufenes durchsehen",14,"alt",2,/abgelaufen/],["spuelma","Spülmaschine reinigen und Sieb säubern",28,"alt",1,/sp(ü|ue)lmaschine/],["muelleimer","Mülleimer auswaschen",28,"alt",1,/m(ü|ue)lleimer/]];
function migNeed(cfg){const c=JSON.parse(JSON.stringify(cfg)),ps=(c.persons||[]).map(x=>String(x||"").toLowerCase()),now=Date.now();
  const pOf=k=>{const i=ps.findIndex(n=>k==="J"?/judith/.test(n):/florian/.test(n));return i>=0?"p"+i:k==="J"?"p1":"p0"};
  // Erstes Mal bei „Abwechselnd“: nach Aufwand ausgeglichen verteilt (first), danach wechselt es mit jedem Haken
  const sum={p0:0,p1:0},firstOf=pts=>{const p=sum.p0<=sum.p1?"p0":"p1";sum[p]+=pts;return p};
  NEED_SEED.forEach(([id,name,every,ow,pts,rx])=>{const owner=ow==="alt"?"alt":pOf(ow),since=now-Math.round(every*NEED_DAY/2);
    const ex=c.tasks.find(t=>t.owner!=="ho"&&t.id!=="saugen"&&!/nach bedarf/i.test(t.name||"")&&(t.id==="n_"+id||rx.test(String(t.name||"").toLowerCase())));
    if(ex){if(ex.freq!=="need"){ex.freq="need";ex.every=every;ex.owner=owner;ex.since=since;if(owner==="alt")ex.first=firstOf(pts);ex.pts=pts;delete ex.times;delete ex.pack;delete ex.subs}return}
    {const o={id:"n_"+id,name,owner,freq:"need",every,pts,since};if(owner==="alt")o.first=firstOf(pts);c.tasks.push(o)}});
  c.mig=Object.assign({},c.mig,{need1:now});S.store.saveConfig(c).catch(()=>{})}
// Einmalig (Flag config.mig.need2, Florian 19.11.2026: „Ja, umwandeln“, „center raus … das gibts nicht“): Monat, Halbjahr, Jahr werden „Nach Bedarf“ (etwa alle 4 Wochen, 6 Monate, einmal im Jahr).
// Im Wechsel wird Abwechselnd (zuerst dran, wer gerade dran wäre), fest bleibt fest. Alte Haken zählen weiter (needTicks). „Center putzen“ aus der Vorlage fällt weg.
function migNeed2(cfg){const c=JSON.parse(JSON.stringify(cfg)),now=Date.now(),mon=mondayOf(new Date()),E={month:28,half:182,year:365};
  c.tasks=c.tasks.filter(t=>!(t.id==="center"&&/^center putzen$/i.test(String(t.name||"").trim())));
  c.tasks.forEach(t=>{const e=E[t.freq];if(!e||t.owner==="ho")return;let first=null;if(t.owner==="rot"){try{first=ownerFor(t,mon)}catch(_){}}
    t.every=e;t.since=now-Math.round(e*NEED_DAY/2);if(t.owner==="rot"){t.owner="alt";if(first==="p0"||first==="p1")t.first=first}t.freq="need";delete t.pack;delete t.times;delete t.subs});
  c.mig=Object.assign({},c.mig,{need2:now});S.store.saveConfig(c).catch(()=>{})}
// Einmalig (Flag config.mig.need3): Der Großputz ist keine Aufgabe „Nach Bedarf“, sondern steht zweimal im Jahr als Termin im Kalender (abgesprochen mit Florian 19.11.2026), mit 🧠 bei der Person, der er gehörte.
function migNeed3(cfg){const c=JSON.parse(JSON.stringify(cfg)),gp=c.tasks.find(t=>/gro(ß|ss)putz/i.test(t.name||"")&&t.owner!=="ho"&&(t.freq==="need"||t.freq==="half"||t.freq==="year"));
  if(gp)c.tasks=c.tasks.filter(t=>t!==gp);c.mig=Object.assign({},c.mig,{need3:Date.now()});
  // erst die Einstellungen speichern (sonst ruft der Datenstand diese Umstellung erneut auf), dann die Termine anlegen
  S.store.saveConfig(c).then(()=>{if(!gp)return;const T=(S.food&&S.food.termin)||{},y=new Date().getFullYear(),nx=md=>{const d=y+"-"+md;return d>ymd(new Date())?d:(y+1)+"-"+md},care=gp.owner==="p0"||gp.owner==="p1"?gp.owner:gp.owner==="both"?"both":null;
    [["gp_a","04-01"],["gp_b","10-01"]].forEach(([id,md])=>{if(!T[id])S.store.setPath("food/termin/"+id,{name:String(gp.name).slice(0,80),date:nx(md),allday:true,rep:"y",care,note:"Tag bitte anpassen. War vorher eine Aufgabe im Haushalt.",at:Date.now(),by:""}).catch(()=>{})})}).catch(()=>{})}
