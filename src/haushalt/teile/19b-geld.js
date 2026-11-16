// ---------- Einkauf › Ausgaben: eigener Geld-Bereich (Florian 16.11.2026: „die große Lösung … in der App“, nur für euch beide) ----------
// Beträge nur in der Datenbank hinter dem Schlüssel. food/money/<id> {name,amt (Cent, ganzzahlig),date,by:p0|p1,split:"half"|"p0"|"p1"|"<Prozent für p0>",cat,ref?,note?,kind?:"settle",at,who}
// split = für wen: half = beide je die Hälfte, p0/p1 = nur für diese Person, Zahl = Anteil von p0 in Prozent. Ausgleich: kind "settle", by zahlt an den anderen.
// Stand (geldBal): > 0 heißt p1 schuldet p0. Splitwise-Links (food/split) bleiben unten für Gruppen mit anderen.
const GELD_CAT=[["essen","🛒","Lebensmittel"],["drog","🧴","Drogerie und Haushalt"],["kind","🧸","Kind"],["kita","🎒","Kita"],["aus","🍽️","Essen gehen"],["frei","🎟️","Freizeit und Ausflüge"],["urlaub","⛵","Urlaub"],["geschenk","🎁","Geschenke"],["wohnen","🏠","Wohnen"],["mobil","🚆","Unterwegs"],["gesund","🩺","Gesundheit"],["kleid","👕","Kleidung"],["sonst","📦","Sonstiges"]];
const geldCats=()=>catsOf("geld",GELD_CAT);
const geldCat=k=>geldCats().find(c=>c[0]===k)||GELD_CAT[GELD_CAT.length-1];
const GELD_RX=[["drog",/\b(dm|rossmann|müller|drogerie)\b/i],["essen",/rewe|edeka|aldi|lidl|penny|netto|kaufland|tegut|denns|alnatura|bäcker|metzger|wochenmarkt|lebensmittel|supermarkt/i],["aus",/restaurant|crêpe|crepe|bistro|eisdiele|pizza|döner|café|cafe|essen gehen|lieferando|imbiss|biergarten|wirtshaus/i],["kita",/\bkita|krippe/i],["kind",/windel|spielzeug|kinder|spielsach/i],["urlaub",/hotel|ferienwohnung|airbnb|urlaub|flug|camping/i],["mobil",/tank|benzin|diesel|bahn|mvv|mvg|ticket|parken|taxi|werkstatt/i],["gesund",/apotheke|arzt|medikament|physio/i],["geschenk",/geschenk/i],["kleid",/kleidung|schuhe|jacke|hose|h&m|zara/i],["wohnen",/miete|strom|\bgas\b|internet|ikea|möbel|baumarkt|obi|hornbach|bauhaus/i],["frei",/kino|zoo|tierpark|museum|eintritt|schwimmbad|bad\b|ausflug|theater/i]];
const geldGuess=t=>{const r=GELD_RX.find(x=>x[1].test(t||""));return r?r[0]:"sonst"};
// Beträge: "12,50", "12.5", "1.234,56", "12 €" → Cent; sonst null
function parseEur(s){s=String(s==null?"":s).replace(/[€\s]|eur(o)?/gi,"");if(!s)return null;if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s))s=s.replace(/\./g,"").replace(",",".");else s=s.replace(",",".");if(!/^\d+(\.\d{1,2})?$/.test(s))return null;const c=Math.round(parseFloat(s)*100);return c>0&&c<1e9?c:null}
const eur=c=>((c<0?"−":"")+(Math.abs(c||0)/100).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €");
const eurPlain=c=>(Math.abs(c||0)/100).toFixed(2).replace(".",",");
function geldShare(x){const a=Math.round(x.amt||0),sp=x.split||"half";if(sp==="p0")return {p0:a,p1:0};if(sp==="p1")return {p0:0,p1:a};const pct=sp==="half"?50:Math.max(0,Math.min(100,+sp));const p0=Math.round(a*(isNaN(pct)?50:pct)/100);return {p0,p1:a-p0}}
function geldBal(L){let b=0;(L||[]).forEach(x=>{const a=Math.round(x.amt||0);if(!a||(x.by!=="p0"&&x.by!=="p1"))return;if(x.kind==="settle"){b+=x.by==="p0"?a:-a;return}const s=geldShare(x);b+=x.by==="p0"?s.p1:-s.p0});return b}
const monies=()=>listOf(S.food&&S.food.money).filter(x=>x.amt>0).sort((a,b)=>((b.date||"")+(b.at||0))<((a.date||"")+(a.at||0))?-1:1);
const geldExp=L=>L.filter(x=>x.kind!=="settle");
const geldWho=p=>p==="joint"?"Gemeinsames Konto":pname(p);
const geldMe=()=>S.me==="p1"?"p1":"p0",geldOther=p=>p==="p0"?"p1":"p0";
function geldBalTxt(b){if(!b)return "Ihr seid quitt.";const gets=b>0?"p0":"p1",owes=geldOther(gets),me=geldMe(),a=eur(Math.abs(b));return gets===me?`Du bekommst ${a} von ${pname(owes)}.`:owes===me?`${pname(gets)} bekommt ${a} von dir.`:`${pname(gets)} bekommt ${a} von ${pname(owes)}.`}
function geldSplitTxt(x){const sp=x.split||"half";return sp==="half"?"für beide":sp==="p0"||sp==="p1"?"nur für "+pname(sp):pname("p0")+" "+(+sp)+" %, "+pname("p1")+" "+(100-(+sp))+" %"}
const geldMonTxt=m=>{const d=new Date(m+"-15T12:00:00");return d.toLocaleDateString("de-DE",{month:"long",year:"numeric"})};
const geldMonAdd=(m,n)=>{const d=new Date(m+"-15T12:00:00");d.setMonth(d.getMonth()+n);return ymd(d).slice(0,7)};
function geldRow(x){const c=geldCat(x.cat),st=x.kind==="settle";
  const sub=st?`🤝 ${esc(pname(x.by))} an ${esc(pname(geldOther(x.by)))}`:`${x.fix?"🔁 ":""}${x.by==="joint"?"🏦 Konto":esc(pname(x.by))+" zahlte"} · ${esc(geldSplitTxt(x))}${x.ref?" · "+esc(geldRefName(x.ref)):""}`;
  return `<li class="geldrow"><button class="ev" data-geldedit="${esc(x.id)}"><span class="gic" aria-hidden="true">${st?"🤝":c[1]}</span><span class="gnm"><b>${esc(x.name)}</b><span class="freq">${sub}</span></span><span class="gamt">${eur(x.amt)}</span></button></li>`}
function geldRefName(ref){const [k,v]=String(ref||"").split(":"),f=(L,e)=>{const x=L.find(y=>y.id===v);return x?(x.emo||e)+" "+x.name:""};try{return k==="urlaub"?f(urlaube(),"⛵"):k==="trip"?f(trips(),"🚲"):k==="hproj"?f(hprojs(),"🛋️"):""}catch(_){return ""}}
function geldNew(o){S.geldDraft=Object.assign({id:null,amt:"",name:"",by:geldMe(),split:"half",pct:"50",date:ymd(new Date()),cat:"",ref:"",note:"",grp:geldGrp()},o||{});render();window.scrollTo(0,0)}
function geldDraftOf(x){const sp=x.split||"half",num=sp!=="half"&&sp!=="p0"&&sp!=="p1";return {id:x.id,amt:eurPlain(x.amt),name:x.name||"",by:x.by||geldMe(),split:num?"pct":sp,pct:num?String(+sp):"50",date:x.date||ymd(new Date()),cat:x.cat||"",ref:x.ref||"",note:x.note||"",kind:x.kind||"",grp:x.grp||""}}
function renderGeldForm(){const d=S.geldDraft,pn=k=>esc(pname(k)),today=ymd(new Date()),yest=ymd(addDays(new Date(),-1)),st=d.kind==="settle",fx=d.mode==="fix";
  return `<section class="card geldform"><div class="section-head"><h2>${st?"Ausgleich ändern":fx?(d.id?"Feste Zahlung ändern":"Neue feste Zahlung"):d.id?"Ausgabe ändern":"Neue Ausgabe"}</h2></div><form id="geldform" novalidate>
    <div class="geldtop"><label class="fld gbetr"><span>Betrag in €</span><input data-gf="amt" inputmode="decimal" value="${esc(d.amt)}" placeholder="0,00" autocomplete="off" maxlength="12"></label>${st?"":`<label class="fld" style="flex:1"><span>Was</span><input data-gf="name" value="${esc(d.name)}" placeholder="${fx?"z. B. Kita-Beitrag":"z. B. Rewe"}" maxlength="80" autocomplete="off"></label>`}</div>
    <div class="fld"><span>${st?"Wer zahlt an den anderen":fx?"Wer zahlt":"Wer hat gezahlt"}</span><div class="unl">${["p0","p1"].map(p=>`<button type="button" class="chipbtn neutral" data-gby="${p}" aria-pressed="${d.by===p}">${pDot(p)}${pn(p)}</button>`).join("")}${st?"":`<button type="button" class="chipbtn neutral" data-gby="joint" aria-pressed="${d.by==="joint"}">🏦 Gemeinsames Konto</button>`}</div>${d.by==="joint"?`<div class="freq">Vom gemeinsamen Konto: zählt bei den Ausgaben, ändert aber nichts am Stand zwischen euch.</div>`:""}</div>
    ${st?"":`<div class="fld"><span>Für wen</span><div class="unl">${[["half","Für beide (halb/halb)"],["p0","Nur für "+pn("p0")],["p1","Nur für "+pn("p1")],["pct","Anders aufteilen"]].map(o=>`<button type="button" class="chipbtn neutral" data-gsplit="${o[0]}" aria-pressed="${d.split===o[0]}">${o[1]}</button>`).join("")}</div>${d.split==="pct"?`<label class="fld"><span>Anteil ${pn("p0")} in Prozent (Rest ${pn("p1")})</span><input data-gf="pct" type="number" inputmode="numeric" min="0" max="100" value="${esc(d.pct)}"></label>`:""}</div>`}
    ${fx?`<div class="fld"><span>Wie oft</span><div class="unl">${FIX_RH.map(o=>`<button type="button" class="chipbtn neutral" data-grh="${o[0]}" aria-pressed="${d.rh===o[0]}">${o[1]}</button>`).join("")}</div></div>
    <div class="fixwhen"><label class="fld fday"><span>Am Tag</span><input data-gf="day" type="number" inputmode="numeric" min="1" max="31" value="${esc(d.day)}"></label><label class="fld"><span>Ab Monat</span><input data-gf="start" type="month" value="${esc(d.start)}"></label><label class="fld"><span>Bis (optional)</span><input data-gf="end" type="month" value="${esc(d.end||"")}"></label></div>
    <div class="freq">Wird an diesem Tag von selbst als Ausgabe eingetragen, ab dem ersten Monat. Einzelne Monate lassen sich dort ändern oder löschen.</div>`:`<div class="fld"><span>Tag</span><div class="geldday"><div class="unl">${[[today,"Heute"],[yest,"Gestern"]].map(o=>`<button type="button" class="chipbtn neutral" data-gdate="${o[0]}" aria-pressed="${d.date===o[0]}">${o[1]}</button>`).join("")}</div><input type="date" data-gf="date" value="${esc(d.date)}" aria-label="Tag"></div></div>`}
    ${st?"":`<div class="fld"><span>Art${d.cat?"":" (sonst geraten aus dem Namen)"}</span><div class="unl">${geldCats().map(c=>`<button type="button" class="chipbtn neutral" data-gcat="${esc(c[0])}" aria-pressed="${d.cat===c[0]}">${c[1]} ${esc(c[2])}</button>`).join("")}${catBtn("geld")}</div></div>
    ${fx?"":(G=>G.length?`<div class="fld"><span>Gruppe</span><div class="unl">${[{id:""}].concat(G).map(g=>`<button type="button" class="chipbtn neutral" data-ggrp="${esc(g.id)}" aria-pressed="${(d.grp||"")===g.id}">${esc(grpName(g.id))}</button>`).join("")}</div></div>`:"")(mgroups().filter(g=>!g.closed||g.id===d.grp))}`}
    <label class="fld"><span>Notiz</span><input data-gf="note" value="${esc(d.note)}" maxlength="200" autocomplete="off"></label>
    <div class="btnrow"><button class="primary" type="submit">Speichern</button><button class="ghost" type="button" data-gact="cancel">Abbrechen</button>${d.id?`<button class="ghost danger" type="button" data-gact="del">Löschen</button>`:""}</div></form></section>`}
function geldTabs(t,g){return `<div class="unl geldtabs" role="group" aria-label="Ausgaben">${[["uebersicht","Übersicht"],["liste","Alle Ausgaben"]].concat(g?[]:[["fest","🔁 Feste Zahlungen"]]).map(o=>`<button class="chipbtn neutral" data-gtab="${o[0]}" aria-pressed="${t===o[0]}">${o[1]}</button>`).join("")}</div>`}
function renderGeld(){let h=`<div><div class="eyebrow">Einkauf</div><h1>Ausgaben</h1></div>`;if(S.geldDraft)return h+renderGeldForm();
  const g=geldGrp(),t=g&&S.geldTab==="fest"?"uebersicht":S.geldTab||"uebersicht",L=monies().filter(x=>grpOf(x)===g);h+=grpBar(g)+geldTabs(t,g);
  if(t==="liste")return h+geldList(L,g);
  if(t==="fest")return h+fixPage();
  if(g)return h+grpPage(g,L);
  const b=geldBal(L),mon=ymd(new Date()).slice(0,7),M=geldExp(L).filter(x=>(x.date||"").slice(0,7)===mon),sum=M.reduce((s,x)=>s+x.amt,0),me=geldMe(),mine=M.reduce((s,x)=>s+geldShare(x)[me],0);
  h+=`<section class="card geldbal"><div class="section-head"><h2>⚖️ Stand zwischen euch</h2></div><div class="geldbig">${esc(geldBalTxt(b))}</div>${(T=>T!==b?`<div class="freq">Über alle Gruppen: ${esc(geldBalTxt(T))}</div>`:"")(geldBal(monies().filter(x=>!(mgroups().find(y=>y.id===x.grp)||{}).closed)))}<div class="btnrow" style="margin-top:0"><button class="primary" data-gact="new">＋ Ausgabe</button>${b?`<button class="ghost" data-gact="settle">🤝 Ausgleichen</button>`:""}</div>
    <form class="addrow" id="geldquick" novalidate><input id="geldq" placeholder="Schnell: 23,50 Rewe" autocomplete="off" enterkeyhint="done" aria-label="Schnell eintragen: Betrag und was"><button class="primary" type="submit" aria-label="Eintragen">＋</button></form><div class="freq">Schnell eintragen heißt: ${esc(pname(me))} hat gezahlt, für beide. Ändern per Tipp auf den Eintrag.</div></section>`;
  const by={};M.forEach(x=>{const k=geldCat(x.cat)[0];by[k]=(by[k]||0)+x.amt});const top=Object.keys(by).sort((a,c)=>by[c]-by[a]),mx=top.length?by[top[0]]:1;
  h+=`<section class="card"><div class="section-head"><h2>📅 ${esc(geldMonTxt(mon))}</h2><span class="freq num">${eur(sum)}</span></div>${M.length?`<div class="freq">Dein Anteil: ${eur(mine)}</div><ul class="geldbars">${top.map(k=>{const c=geldCat(k);return `<li><button data-gcatgo="${esc(k)}"><span>${c[1]} ${esc(c[2])}</span><span class="gbar"><i style="width:${Math.max(4,Math.round(by[k]*100/mx))}%"></i></span><b>${eur(by[k])}</b></button></li>`}).join("")}</ul>`:`<div class="freq">In diesem Monat noch nichts eingetragen.</div>`}</section>`;
  {const F=fixes().filter(fixActive);if(F.length){const nx=fixNext();h+=`<section class="card"><div class="section-head"><h2>🔁 Feste Zahlungen</h2><button class="ghost" data-gtab="fest">Alle ›</button></div><div class="freq">Im Monat etwa ${eur(fixMonthly(F))}${nx?` · Nächste: ${esc(nx.f.name)} am ${esc(dLabel(nx.date))}`:""}</div></section>`}}
  if(L.length)h+=`<section class="card"><div class="section-head"><h2>🧾 Zuletzt</h2><button class="ghost" data-gtab="liste">Alle ›</button></div><ul class="evlist gelds">${L.slice(0,5).map(geldRow).join("")}</ul></section>`;
  h+=splitCard();return h}
function geldList(L,g){const mon=S.geldMon||ymd(new Date()).slice(0,7),f=S.geldF||{},me=geldMe();
  let M=g?L:L.filter(x=>(x.date||"").slice(0,7)===mon);const cats=[...new Set(geldExp(M).map(x=>geldCat(x.cat)[0]))];
  if(f.by)M=M.filter(x=>x.by===f.by);if(f.cat)M=M.filter(x=>x.kind!=="settle"&&geldCat(x.cat)[0]===f.cat);
  const sum=geldExp(M).reduce((s,x)=>s+x.amt,0);
  let h=g?"":`<div class="geldmon"><button class="iconbtn" data-gmon="-1" aria-label="Monat zurück">‹</button><b>${esc(geldMonTxt(mon))}</b><button class="iconbtn" data-gmon="1" aria-label="Monat vor">›</button></div>`;h+=`
    <div class="unl scrollrow">${[["","Alle"],[me,"Ich"],[geldOther(me),pname(geldOther(me))]].map(o=>`<button class="chipbtn neutral" data-gfby="${o[0]}" aria-pressed="${(f.by||"")===o[0]}">${o[0]?"Gezahlt: ":""}${esc(o[1])}</button>`).join("")}</div>
    ${cats.length>1||f.cat?`<div class="unl scrollrow">${[["","Alle Arten"]].concat(cats.map(k=>{const c=geldCat(k);return [k,c[1]+" "+c[2]]})).map(o=>`<button class="chipbtn neutral" data-gfcat="${esc(o[0])}" aria-pressed="${(f.cat||"")===o[0]}">${esc(o[1])}${o[0]&&f.cat===o[0]?" ✕":""}</button>`).join("")}</div>`:""}
    <div class="btnrow" style="margin-top:0"><button class="primary" data-gact="new">＋ Ausgabe</button><span class="freq" style="margin-left:auto">Summe: <b>${eur(sum)}</b></span></div>`;
  if(!M.length)return h+`<div class="empty"><h2>${g?"Noch nichts in dieser Gruppe":"Nichts in diesem Monat"}</h2><div>Mit „＋ Ausgabe“ eintragen.</div></div>`;
  const days={};M.forEach(x=>{(days[x.date||""]=days[x.date||""]||[]).push(x)});
  h+=`<section class="card"><ul class="evlist gelds">${Object.keys(days).sort().reverse().map(k=>`<li class="geldday0">${esc(k?dLabel(k):"Ohne Tag")}</li>`+days[k].map(geldRow).join("")).join("")}</ul></section>`;return h}
function splitCard(){const L=splits();
  return `<section class="card"><div class="section-head"><h2>💶 Splitwise-Gruppen</h2></div><div class="freq">Für Gruppen mit anderen. Hier nur als Link, auf Wunsch mit einem Urlaub, Ausflug oder Projekt verbunden.</div>
  <form class="addrow" id="splitform" novalidate><input type="url" id="splitinput" placeholder="Link zur Splitwise-Gruppe einfügen" autocomplete="off" enterkeyhint="done" aria-label="Link zur Splitwise-Gruppe"><button class="primary" type="submit">＋</button></form>${L.length?`<ul class="splitlist">${L.map(splitTile).join("")}</ul>`:""}</section>`}
function geldSettle(){const g=geldGrp(),b=geldBal(monies().filter(x=>grpOf(x)===g));if(!b)return;const owes=b>0?"p1":"p0";geldNew({kind:"settle",name:"Ausgleich",amt:eurPlain(b),by:owes})}
async function geldSave(){const d=S.geldDraft;if(!d)return;const amt=parseEur(d.amt);if(!amt){toast("Bitte einen Betrag eintragen, z. B. 12,50.");return}
  if(d.mode==="fix")return fixSave(d,amt);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date||"")){toast("Bitte einen Tag wählen.");return}
  const st=d.kind==="settle",name=(st?"Ausgleich":(d.name||"").trim().slice(0,80))||geldCat(d.cat||"sonst")[2],cat=st?null:d.cat||geldGuess(name),pct=Math.max(0,Math.min(100,parseInt(d.pct,10)));
  const split=st?null:d.split==="pct"?(isNaN(pct)||pct===50?"half":pct===100?"p0":pct===0?"p1":String(pct)):d.split||"half";
  const id=d.id||newId("g"),old=(S.food&&S.food.money&&S.food.money[id])||{};
  const v={name,amt,date:d.date,by:d.by==="p1"||d.by==="joint"&&!st?d.by:"p0",split,cat,ref:st?null:d.ref||null,note:(d.note||"").trim().slice(0,200)||null,kind:st?"settle":null,grp:d.grp||null,fix:old.fix||null,at:old.at||Date.now(),who:old.who||S.me||""};
  try{await S.store.setPath("food/money/"+id,v);S.geldDraft=null;toast(st?"Ausgleich eingetragen":"Gespeichert: "+eur(amt));render()}catch(_){toast("Konnte nicht speichern.")}}
async function geldQuick(txt){const m=/(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:€|eur(?:o)?\b)?/i.exec(txt||"");const amt=m&&parseEur(m[1]);if(!amt){toast("Bitte mit Betrag, z. B. „23,50 Rewe“.");return false}
  const name=(txt.slice(0,m.index)+" "+txt.slice(m.index+m[0].length)).replace(/\s+/g," ").replace(/^[\s,–-]+|[\s,–-]+$/g,"").slice(0,80),cat=geldGuess(name),id=newId("g");
  const v={name:name||geldCat(cat)[2],amt,date:ymd(new Date()),by:geldMe(),split:"half",cat,grp:geldGrp()||null,at:Date.now(),who:S.me||""};
  try{await S.store.setPath("food/money/"+id,v);toastAct("Eingetragen: "+eur(amt)+" "+v.name,"✎ Anpassen",()=>{const x=monies().find(y=>y.id===id);if(x){S.geldDraft=geldDraftOf(x);S.tab="ausgaben";render()}});return true}catch(_){toast("Konnte nicht speichern.");return false}}
app.addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const D=b.dataset,d=S.geldDraft;
  if(D.gact==="new"){geldNew();return}
  if(D.geldgrp!=null){S.geldGrp=D.geldgrp;S.geldF={};if(!D.go){render();window.scrollTo(0,0)}return}
  if(D.gact==="grpnew"){grpEdit(null,D.ref?{name:D.name||"",emo:D.emo||"",ref:D.ref,budget:D.budget||""}:null);return}
  if(D.gact==="grpedit"){grpEdit(geldGrp());return}
  if(D.gact==="grpclosed"){S.geldShowClosed=!S.geldShowClosed;render();return}
  if(D.gact==="grpclose"||D.gact==="grpopen"){const g=geldGrp();if(g){await S.store.setPath("food/mgroup/"+g+"/closed",D.gact==="grpclose"||null);if(D.gact==="grpclose"){S.geldGrp="";toast("Abgeschlossen. Unter „📦 Abgeschlossen“ zu finden.")}render()}return}
  if(D.gact==="settle"){geldSettle();return}
  if(D.gact==="cancel"){S.geldDraft=null;render();return}
  if(D.gact==="del"&&d&&d.id){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}
    try{if(d.mode==="fix"){await S.store.setPath("food/fixpay/"+d.id,null);S.geldDraft=null;toast("Gelöscht. Bisher Eingetragenes bleibt.");render();return}
      const x=(S.food.money||{})[d.id];if(x&&x.fix&&x.date)await S.store.setPath("food/fixpay/"+x.fix+"/skip/"+x.date.slice(0,7),true);await S.store.setPath("food/money/"+d.id,null);S.geldDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht löschen.")}return}
  if(D.gact==="fixnew"){geldNew({mode:"fix",rh:"m",day:"1",start:ymd(new Date()).slice(0,7),end:""});return}
  if(D.fixedit){const f=fixes().find(y=>y.id===D.fixedit);if(f){S.geldDraft=Object.assign(geldDraftOf(f),{mode:"fix",rh:f.rh||"m",day:String(f.day||1),start:f.start||"",end:f.end||""});render();window.scrollTo(0,0)}return}
  if(D.geldedit){const x=monies().find(y=>y.id===D.geldedit);if(x){S.geldDraft=geldDraftOf(x);render();window.scrollTo(0,0)}return}
  if(D.gtab){S.geldTab=D.gtab;render();window.scrollTo(0,0);return}
  if(D.gmon){S.geldMon=geldMonAdd(S.geldMon||ymd(new Date()).slice(0,7),+D.gmon);render();return}
  if(D.gfby!=null){S.geldF=Object.assign({},S.geldF,{by:D.gfby});render();return}
  if(D.gfcat!=null){const f=S.geldF||{};S.geldF=Object.assign({},f,{cat:f.cat===D.gfcat?"":D.gfcat});render();return}
  if(D.gcatgo){S.geldTab="liste";S.geldMon=ymd(new Date()).slice(0,7);S.geldF={cat:D.gcatgo};render();window.scrollTo(0,0);return}
  if(!d)return;
  if(D.gby){d.by=D.gby;render();return}
  if(D.grh){d.rh=D.grh;render();return}
  if(D.ggrp!=null){d.grp=D.ggrp;render();return}
  if(D.gsplit){d.split=D.gsplit;render();return}
  if(D.gdate){d.date=D.gdate;render();return}
  if(D.gcat!=null){d.cat=d.cat===D.gcat?"":D.gcat;render();return}});
app.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.gf;if(k&&S.geldDraft)S.geldDraft[k]=e.target.value});
app.addEventListener("submit",async e=>{if(e.target.id==="geldform"){e.preventDefault();e.stopImmediatePropagation();await geldSave();return}
  if(e.target.id==="geldquick"){e.preventDefault();e.stopImmediatePropagation();const i=document.getElementById("geldq");if(await geldQuick(i&&i.value)){const j=document.getElementById("geldq");if(j)j.value=""}}});
// ---------- Gruppen wie bei Splitwise (Florian 16.11.2026): Haushalt (Id "", Standard für Einkauf und Alltag) plus eigene Gruppen, z. B. je Urlaub ----------
// food/mgroup/<id> {name,emo,ref? (urlaub:|trip:|hproj:<id>),budget? (Cent),closed?,at,who}; Ausgaben tragen grp (leer = Haushalt). Stand, Liste und Budget je Gruppe; abschließen, wenn ausgeglichen.
const mgroups=()=>listOf(S.food&&S.food.mgroup).sort((a,b)=>(a.at||0)-(b.at||0));
const geldGrp=()=>{const g=S.geldGrp||"";return g&&!mgroups().some(x=>x.id===g)?"":g};
const grpOf=x=>x.grp&&mgroups().some(y=>y.id===x.grp)?x.grp:"";
const grpName=g=>{if(!g)return "🏠 Haushalt";const x=mgroups().find(y=>y.id===g);return x?(x.emo||"👥")+" "+x.name:"Gruppe"};
const grpByRef=ref=>mgroups().find(x=>x.ref===ref);
function grpBar(g){const G=mgroups(),open=G.filter(x=>!x.closed||x.id===g),cl=G.filter(x=>x.closed&&x.id!==g);
  return `<div class="unl scrollrow geldgrps" role="group" aria-label="Gruppe">${[{id:""}].concat(open).map(x=>`<button class="chipbtn neutral" data-geldgrp="${esc(x.id)}" aria-pressed="${g===x.id}">${esc(grpName(x.id))}</button>`).join("")}${S.geldShowClosed?cl.map(x=>`<button class="chipbtn neutral" data-geldgrp="${esc(x.id)}" aria-pressed="false">📦 ${esc(grpName(x.id))}</button>`).join(""):""}<button class="chipbtn neutral" data-gact="grpnew">＋ Gruppe</button>${cl.length?`<button class="chipbtn neutral" data-gact="grpclosed" aria-pressed="${!!S.geldShowClosed}">📦 Abgeschlossen (${cl.length})</button>`:""}</div>`}
function grpPage(g,L){const x=mgroups().find(y=>y.id===g)||{},E=geldExp(L),sum=E.reduce((s,y)=>s+y.amt,0),b=geldBal(L),sh={p0:0,p1:0};E.forEach(y=>{const s=geldShare(y);sh.p0+=s.p0;sh.p1+=s.p1});
  const bud=x.budget||0,pc=bud?Math.round(sum*100/bud):0;
  let h=`<section class="card geldbal"><div class="section-head"><h2>${esc(grpName(g))}</h2><button class="ghost" data-gact="grpedit">✎</button></div>${x.ref?`<div class="unl">${splitRefLink(x.ref)}</div>`:""}${x.closed?`<div class="freq">📦 Abgeschlossen</div>`:""}
    <div class="geldbig">${esc(geldBalTxt(b))}</div>
    ${bud?`<div class="geldbud"><div class="gbar"><i style="width:${Math.min(100,pc)}%;${sum>bud?"background:var(--ochre)":""}"></i></div><div class="freq">${eur(sum)} von ${eur(bud)} Budget${sum>bud?` · ${eur(sum-bud)} drüber`:` · noch ${eur(bud-sum)}`}</div></div>`:`<div class="freq">Zusammen ${eur(sum)}. Ein Budget lässt sich mit ✎ setzen.</div>`}
    <div class="btnrow" style="margin-top:0">${x.closed?`<button class="ghost" data-gact="grpopen">↩ Wieder öffnen</button>`:`<button class="primary" data-gact="new">＋ Ausgabe</button>${b?`<button class="ghost" data-gact="settle">🤝 Ausgleichen</button>`:L.length?`<button class="ghost" data-gact="grpclose">✅ Abschließen</button>`:""}`}</div>
    ${x.closed?"":`<form class="addrow" id="geldquick" novalidate><input id="geldq" placeholder="Schnell: 23,50 Crêpes" autocomplete="off" enterkeyhint="done" aria-label="Schnell eintragen: Betrag und was"><button class="primary" type="submit" aria-label="Eintragen">＋</button></form>`}</section>`;
  if(E.length){const by={};E.forEach(y=>{const k=geldCat(y.cat)[0];by[k]=(by[k]||0)+y.amt});const top=Object.keys(by).sort((a,c)=>by[c]-by[a]),mx=by[top[0]];
    h+=`<section class="card"><div class="section-head"><h2>📊 Wofür</h2><span class="freq num">${eur(sum)}</span></div><div class="freq">Anteil ${esc(pname("p0"))}: ${eur(sh.p0)} · ${esc(pname("p1"))}: ${eur(sh.p1)}</div><ul class="geldbars">${top.map(k=>{const c=geldCat(k);return `<li><button data-gcatgo="${esc(k)}"><span>${c[1]} ${esc(c[2])}</span><span class="gbar"><i style="width:${Math.max(4,Math.round(by[k]*100/mx))}%"></i></span><b>${eur(by[k])}</b></button></li>`}).join("")}</ul></section>`}
  if(L.length)h+=`<section class="card"><div class="section-head"><h2>🧾 Zuletzt</h2><button class="ghost" data-gtab="liste">Alle ›</button></div><ul class="evlist gelds">${L.slice(0,5).map(geldRow).join("")}</ul></section>`;
  return h}
function grpEdit(g,pre){const x=g?mgroups().find(y=>y.id===g):null;pre=pre||{};
  const refOpts=[["","Nichts"]].concat(urlaube().filter(u=>reiseSt(u)!=="erledigt"||(x&&x.ref==="urlaub:"+u.id)).map(u=>["urlaub:"+u.id,(u.emo||"⛵")+" "+u.name]),trips().filter(t=>!t.done||(x&&x.ref==="trip:"+t.id)).map(t=>["trip:"+t.id,"🚲 "+t.name]),hprojs().filter(p=>p.state!=="erledigt"||(x&&x.ref==="hproj:"+p.id)).map(p=>["hproj:"+p.id,(p.emo||"🛋️")+" "+p.name]));
  editBox(x?"Gruppe ändern":"Neue Gruppe",[{k:"name",label:"Name",type:"text",val:x?x.name:pre.name||""},{k:"emo",label:"Symbol (ein Emoji)",type:"text",val:x?x.emo||"":pre.emo||"👥"},{k:"budget",label:"Budget in € (optional)",type:"text",val:x&&x.budget?eurPlain(x.budget):pre.budget||""},{k:"ref",label:"Gehört zu",type:"chips",opts:refOpts,val:x?x.ref||"":pre.ref||""}],
    async V=>{const name=String(V.name||"").trim().slice(0,60);if(!name){toast("Bitte einen Namen eintragen.");return}const bt=String(V.budget||"").trim(),bud=bt?parseEur(bt):null;if(bt&&!bud){toast("Das Budget sieht nicht wie ein Betrag aus.");return}
      const id=g||newId("m"),v=Object.assign({},x||{},{name,emo:emoClean(V.emo)||"👥",budget:bud||null,ref:V.ref||null,at:(x&&x.at)||Date.now(),who:(x&&x.who)||S.me||""});delete v.id;
      await S.store.setPath("food/mgroup/"+id,v);S.geldGrp=id;S.geldTab="uebersicht";S.tab="ausgaben";toast(x?"Gespeichert":"Gruppe angelegt");render()},
    x?[["Gruppe löschen (Ausgaben wandern in den Haushalt)",async()=>{for(const y of monies().filter(m=>m.grp===g))await S.store.setPath("food/money/"+y.id+"/grp",null);await S.store.setPath("food/mgroup/"+g,null);S.geldGrp="";toast("Gruppe gelöscht");render()},true]]:null)}
// ---------- Feste Zahlungen (Kita-Beitrag, Miete, Abos …): food/fixpay/<id> {name,amt,by:p0|p1|joint,split,cat,ref?,note?,rh:m|q|h|y,day,start:"YYYY-MM",end?,skip:{"YYYY-MM":true},at,who}
// Bucht sich selbst: am Tag wird food/money/f_<id>_<YYYY-MM> angelegt (feste Id, also nie doppelt, auch nicht von zwei Handys). Gelöschte Monate stehen in skip.
const FIX_RH=[["m","Monatlich",1],["q","Vierteljährlich",3],["h","Halbjährlich",6],["y","Jährlich",12]];
const fixes=()=>listOf(S.food&&S.food.fixpay).filter(f=>f.amt>0).sort((a,b)=>(a.day||1)-(b.day||1)||String(a.name).localeCompare(b.name));
const fixStep=f=>(FIX_RH.find(r=>r[0]===f.rh)||FIX_RH[0])[2];
const fixDate=(f,mon)=>{const [y,m]=mon.split("-").map(Number),last=new Date(y,m,0).getDate();return mon+"-"+String(Math.min(Math.max(1,f.day|0||1),last)).padStart(2,"0")};
// Fällige Monate bis heute (inklusive heute), höchstens 36
function fixDue(f,today){today=today||ymd(new Date());const out=[];if(!/^\d{4}-\d{2}$/.test(f.start||""))return out;let m=f.start,n=0;while(n<200&&out.length<36){if(f.end&&m>f.end)break;const d=fixDate(f,m);if(d>today)break;out.push(m);m=geldMonAdd(m,fixStep(f));n++}return out}
const fixActive=f=>!f.end||f.end>=ymd(new Date()).slice(0,7);
const fixMonthly=F=>Math.round(F.reduce((s,f)=>s+f.amt/fixStep(f),0));
function fixNextOf(f){const today=ymd(new Date());if(!/^\d{4}-\d{2}$/.test(f.start||""))return null;let m=f.start,n=0;while(n<300){if(f.end&&m>f.end)return null;const d=fixDate(f,m);if(d>today)return d;m=geldMonAdd(m,fixStep(f));n++}return null}
function fixNext(){let best=null;fixes().forEach(f=>{const d=fixNextOf(f);if(d&&(!best||d<best.date))best={f,date:d}});return best}
async function geldFixBook(){if(S.geldBooking||!S.food||!S.food.fixpay||!S.store)return;S.geldBooking=1;try{const M=S.food.money||{};
  for(const f of fixes())for(const mon of fixDue(f)){const id="f_"+f.id+"_"+mon.replace("-","");if(M[id]||(f.skip&&f.skip[mon]))continue;
    await S.store.setPath("food/money/"+id,{name:f.name,amt:f.amt,date:fixDate(f,mon),by:f.by||"p0",split:f.split||"half",cat:f.cat||geldGuess(f.name),ref:f.ref||null,note:f.note||null,fix:f.id,at:Date.now(),who:"auto"})}}catch(_){}S.geldBooking=0}
async function fixSave(d,amt){const name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte sagen, wofür.");return}if(!/^\d{4}-\d{2}$/.test(d.start||"")){toast("Bitte den ersten Monat wählen.");return}
  const day=Math.max(1,Math.min(31,parseInt(d.day,10)||1)),pct=Math.max(0,Math.min(100,parseInt(d.pct,10))),split=d.split==="pct"?(isNaN(pct)||pct===50?"half":pct===100?"p0":pct===0?"p1":String(pct)):d.split||"half";
  const id=d.id||newId("x"),old=(S.food.fixpay||{})[id]||{},end=/^\d{4}-\d{2}$/.test(d.end||"")&&d.end>=d.start?d.end:null;
  const v={name,amt,by:["p0","p1","joint"].includes(d.by)?d.by:"p0",split,cat:d.cat||geldGuess(name),ref:d.ref||null,note:(d.note||"").trim().slice(0,200)||null,rh:d.rh||"m",day,start:d.start,end,skip:old.skip||null,at:old.at||Date.now(),who:old.who||S.me||""};
  try{await S.store.setPath("food/fixpay/"+id,v);S.geldDraft=null;S.geldTab="fest";toast("Feste Zahlung gespeichert");render()}catch(_){toast("Konnte nicht speichern.")}}
function fixPage(){const F=fixes(),A=F.filter(fixActive),old=F.filter(f=>!fixActive(f)),mon=ymd(new Date()).slice(0,7),me=geldMe(),M=S.food.money||{};
  const mine=Math.round(A.reduce((s,f)=>s+geldShare(f)[me]/fixStep(f),0));
  let h=`<section class="card"><div class="section-head"><h2>🔁 Feste Zahlungen</h2>${A.length?`<span class="freq num">${eur(fixMonthly(A))} im Monat</span>`:""}</div>${A.length?`<div class="freq">Umgerechnet auf den Monat. Dein Anteil: ${eur(mine)}</div>`:`<div class="freq">Kita-Beitrag, Miete, Strom, Versicherungen, Abos: einmal anlegen, dann tragen sie sich jeden Monat selbst ein.</div>`}<div class="btnrow" style="margin-top:0"><button class="primary" data-gact="fixnew">＋ Feste Zahlung</button></div></section>`;
  const row=f=>{const c=geldCat(f.cat),rh=(FIX_RH.find(r=>r[0]===f.rh)||FIX_RH[0])[1],booked=M["f_"+f.id+"_"+mon.replace("-","")],nx=fixNextOf(f);
    const st=!fixActive(f)?"beendet":booked?"✅ "+esc(geldMonTxt(mon).split(" ")[0])+" eingetragen":nx?"⏳ "+esc(dLabel(nx)):"";
    return `<li class="geldrow"><button class="ev" data-fixedit="${esc(f.id)}"><span class="gic" aria-hidden="true">${c[1]}</span><span class="gnm"><b>${esc(f.name)}</b><span class="freq">${esc(rh)} am ${f.day|0||1}. · ${f.by==="joint"?"🏦 Konto":esc(pname(f.by))+" zahlt"} · ${esc(geldSplitTxt(f))}${st?"<br>"+st:""}</span></span><span class="gamt">${eur(f.amt)}</span></button></li>`};
  if(A.length)h+=`<section class="card"><ul class="evlist gelds">${A.map(row).join("")}</ul></section>`;
  if(old.length)h+=`<details class="card"><summary>Beendet (${old.length})</summary><ul class="evlist gelds">${old.map(row).join("")}</ul></details>`;
  return h}
// Für die Prüfskripte: reine Rechen-Bausteine (keine Daten)
window.Geld={parseEur,geldShare,geldBal,eur,fixDue,fixMonthly,dropRef:r=>splitDropRef(r)};
// Im Urlaub (und überall mit ref): Karte mit Stand der Gruppe oder Knopf zum Anlegen; Budget des Urlaubs wird übernommen
function grpLinkHtml(ref,name,emo,budget){const g=grpByRef(ref);if(!g)return `<button class="chipbtn" data-gact="grpnew" data-ref="${esc(ref)}" data-name="${esc(name||"")}" data-emo="${esc(emo||"")}" data-budget="${budget?esc(String(budget)):""}">＋ Ausgaben-Gruppe anlegen</button>`;
  const L=monies().filter(x=>x.grp===g.id),sum=geldExp(L).reduce((s,x)=>s+x.amt,0),b=geldBal(L);
  return `<button class="chipbtn neutral" data-go="ausgaben" data-geldgrp="${esc(g.id)}">💶 ${esc(grpName(g.id))}: ${eur(sum)}${g.budget?" von "+eur(g.budget):""}${g.closed?" · 📦":b?" · offen":""} ›</button>`}
