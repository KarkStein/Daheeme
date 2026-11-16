// ---------- Einkauf › Ausgaben: eigener Geld-Bereich (Florian 16.11.2026: „die große Lösung … in der App“, nur für euch beide) ----------
// Beträge nur in der Datenbank hinter dem Schlüssel. food/money/<id> {name,amt (Cent, ganzzahlig),date,by:p0|p1,split:"half"|"p0"|"p1"|"<Prozent für p0>",cat,ref?,note?,kind?:"settle",at,who}
// split = für wen: half = beide je die Hälfte, p0/p1 = nur für diese Person, Zahl = Anteil von p0 in Prozent. Ausgleich: kind "settle", by zahlt an den anderen.
// Stand (geldBal): > 0 heißt p1 schuldet p0. Splitwise-Links (food/split) bleiben unten für Gruppen mit anderen.
const GELD_CAT=[["essen","🛒","Lebensmittel"],["drog","🧴","Drogerie und Haushalt"],["kind","🧸","Kind"],["kita","🎒","Kita"],["aus","🍽️","Essen gehen"],["frei","🎟️","Freizeit und Ausflüge"],["urlaub","⛵","Urlaub"],["geschenk","🎁","Geschenke"],["wohnen","🏠","Wohnen"],["mobil","🚆","Unterwegs"],["gesund","🩺","Gesundheit"],["kleid","👕","Kleidung"],["sonst","📦","Sonstiges"]];
const geldCats=()=>catsOf("geld",GELD_CAT);
const geldCat=k=>geldCats().find(c=>c[0]===k)||GELD_CAT[GELD_CAT.length-1];
const GELD_RX=[["drog",/\b(dm|rossmann|müller|drogerie)\b/i],["essen",/rewe|edeka|aldi|lidl|penny|netto|kaufland|tegut|denns|alnatura|bäcker|metzger|wochenmarkt|lebensmittel|supermarkt/i],["aus",/restaurant|pizza|döner|café|cafe|essen gehen|lieferando|imbiss|biergarten|wirtshaus/i],["kita",/\bkita|krippe/i],["kind",/windel|spielzeug|kinder|spielsach/i],["urlaub",/hotel|ferienwohnung|airbnb|urlaub|flug|camping/i],["mobil",/tank|benzin|diesel|bahn|mvv|mvg|ticket|parken|taxi|werkstatt/i],["gesund",/apotheke|arzt|medikament|physio/i],["geschenk",/geschenk/i],["kleid",/kleidung|schuhe|jacke|hose|h&m|zara/i],["wohnen",/miete|strom|\bgas\b|internet|ikea|möbel|baumarkt|obi|hornbach|bauhaus/i],["frei",/kino|zoo|tierpark|museum|eintritt|schwimmbad|bad\b|ausflug|theater/i]];
const geldGuess=t=>{const r=GELD_RX.find(x=>x[1].test(t||""));return r?r[0]:"sonst"};
// Beträge: "12,50", "12.5", "1.234,56", "12 €" → Cent; sonst null
function parseEur(s){s=String(s==null?"":s).replace(/[€\s]|eur(o)?/gi,"");if(!s)return null;if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s))s=s.replace(/\./g,"").replace(",",".");else s=s.replace(",",".");if(!/^\d+(\.\d{1,2})?$/.test(s))return null;const c=Math.round(parseFloat(s)*100);return c>0&&c<1e9?c:null}
const eur=c=>((c<0?"−":"")+(Math.abs(c||0)/100).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €");
const eurPlain=c=>(Math.abs(c||0)/100).toFixed(2).replace(".",",");
function geldShare(x){const a=Math.round(x.amt||0),sp=x.split||"half";if(sp==="p0")return {p0:a,p1:0};if(sp==="p1")return {p0:0,p1:a};const pct=sp==="half"?50:Math.max(0,Math.min(100,+sp));const p0=Math.round(a*(isNaN(pct)?50:pct)/100);return {p0,p1:a-p0}}
function geldBal(L){let b=0;(L||[]).forEach(x=>{const a=Math.round(x.amt||0);if(!a||(x.by!=="p0"&&x.by!=="p1"))return;if(x.kind==="settle"){b+=x.by==="p0"?a:-a;return}const s=geldShare(x);b+=x.by==="p0"?s.p1:-s.p0});return b}
const monies=()=>listOf(S.food&&S.food.money).filter(x=>x.amt>0).sort((a,b)=>((b.date||"")+(b.at||0))<((a.date||"")+(a.at||0))?-1:1);
const geldExp=L=>L.filter(x=>x.kind!=="settle");
const geldMe=()=>S.me==="p1"?"p1":"p0",geldOther=p=>p==="p0"?"p1":"p0";
function geldBalTxt(b){if(!b)return "Ihr seid quitt.";const gets=b>0?"p0":"p1",owes=geldOther(gets),me=geldMe(),a=eur(Math.abs(b));return gets===me?`Du bekommst ${a} von ${pname(owes)}.`:owes===me?`${pname(gets)} bekommt ${a} von dir.`:`${pname(gets)} bekommt ${a} von ${pname(owes)}.`}
function geldSplitTxt(x){const sp=x.split||"half";return sp==="half"?"für beide":sp==="p0"||sp==="p1"?"nur für "+pname(sp):pname("p0")+" "+(+sp)+" %, "+pname("p1")+" "+(100-(+sp))+" %"}
const geldMonTxt=m=>{const d=new Date(m+"-15T12:00:00");return d.toLocaleDateString("de-DE",{month:"long",year:"numeric"})};
const geldMonAdd=(m,n)=>{const d=new Date(m+"-15T12:00:00");d.setMonth(d.getMonth()+n);return ymd(d).slice(0,7)};
function geldRow(x){const c=geldCat(x.cat),st=x.kind==="settle";
  const sub=st?`🤝 ${esc(pname(x.by))} an ${esc(pname(geldOther(x.by)))}`:`${esc(pname(x.by))} zahlte · ${esc(geldSplitTxt(x))}${x.ref?" · "+esc(geldRefName(x.ref)):""}`;
  return `<li class="geldrow"><button class="ev" data-geldedit="${esc(x.id)}"><span class="gic" aria-hidden="true">${st?"🤝":c[1]}</span><span class="gnm"><b>${esc(x.name)}</b><span class="freq">${sub}</span></span><span class="gamt">${eur(x.amt)}</span></button></li>`}
function geldRefName(ref){const [k,v]=String(ref||"").split(":"),f=(L,e)=>{const x=L.find(y=>y.id===v);return x?(x.emo||e)+" "+x.name:""};try{return k==="urlaub"?f(urlaube(),"⛵"):k==="trip"?f(trips(),"🚲"):k==="hproj"?f(hprojs(),"🛋️"):""}catch(_){return ""}}
function geldNew(o){S.geldDraft=Object.assign({id:null,amt:"",name:"",by:geldMe(),split:"half",pct:"50",date:ymd(new Date()),cat:"",ref:"",note:""},o||{});render();window.scrollTo(0,0)}
function geldDraftOf(x){const sp=x.split||"half",num=sp!=="half"&&sp!=="p0"&&sp!=="p1";return {id:x.id,amt:eurPlain(x.amt),name:x.name||"",by:x.by||geldMe(),split:num?"pct":sp,pct:num?String(+sp):"50",date:x.date||ymd(new Date()),cat:x.cat||"",ref:x.ref||"",note:x.note||"",kind:x.kind||""}}
function renderGeldForm(){const d=S.geldDraft,pn=k=>esc(pname(k)),today=ymd(new Date()),yest=ymd(addDays(new Date(),-1)),st=d.kind==="settle";
  return `<section class="card geldform"><div class="section-head"><h2>${st?"Ausgleich ändern":d.id?"Ausgabe ändern":"Neue Ausgabe"}</h2></div><form id="geldform" novalidate>
    <div class="geldtop"><label class="fld gbetr"><span>Betrag in €</span><input data-gf="amt" inputmode="decimal" value="${esc(d.amt)}" placeholder="0,00" autocomplete="off" maxlength="12"></label>${st?"":`<label class="fld" style="flex:1"><span>Was</span><input data-gf="name" value="${esc(d.name)}" placeholder="z. B. Rewe" maxlength="80" autocomplete="off"></label>`}</div>
    <div class="fld"><span>${st?"Wer zahlt an den anderen":"Wer hat gezahlt"}</span><div class="unl">${["p0","p1"].map(p=>`<button type="button" class="chipbtn neutral" data-gby="${p}" aria-pressed="${d.by===p}">${pDot(p)}${pn(p)}</button>`).join("")}</div></div>
    ${st?"":`<div class="fld"><span>Für wen</span><div class="unl">${[["half","Für beide (halb/halb)"],["p0","Nur für "+pn("p0")],["p1","Nur für "+pn("p1")],["pct","Anders aufteilen"]].map(o=>`<button type="button" class="chipbtn neutral" data-gsplit="${o[0]}" aria-pressed="${d.split===o[0]}">${o[1]}</button>`).join("")}</div>${d.split==="pct"?`<label class="fld"><span>Anteil ${pn("p0")} in Prozent (Rest ${pn("p1")})</span><input data-gf="pct" type="number" inputmode="numeric" min="0" max="100" value="${esc(d.pct)}"></label>`:""}</div>`}
    <div class="fld"><span>Tag</span><div class="geldday"><div class="unl">${[[today,"Heute"],[yest,"Gestern"]].map(o=>`<button type="button" class="chipbtn neutral" data-gdate="${o[0]}" aria-pressed="${d.date===o[0]}">${o[1]}</button>`).join("")}</div><input type="date" data-gf="date" value="${esc(d.date)}" aria-label="Tag"></div></div>
    ${st?"":`<div class="fld"><span>Art${d.cat?"":" (sonst geraten aus dem Namen)"}</span><div class="unl">${geldCats().map(c=>`<button type="button" class="chipbtn neutral" data-gcat="${esc(c[0])}" aria-pressed="${d.cat===c[0]}">${c[1]} ${esc(c[2])}</button>`).join("")}${catBtn("geld")}</div></div>
    <label class="fld"><span>Gehört zu</span><select data-gf="ref">${splitRefOpts(d.ref)}</select></label>`}
    <label class="fld"><span>Notiz</span><input data-gf="note" value="${esc(d.note)}" maxlength="200" autocomplete="off"></label>
    <div class="btnrow"><button class="primary" type="submit">Speichern</button><button class="ghost" type="button" data-gact="cancel">Abbrechen</button>${d.id?`<button class="ghost danger" type="button" data-gact="del">Löschen</button>`:""}</div></form></section>`}
function geldTabs(t){return `<div class="unl geldtabs" role="group" aria-label="Ausgaben">${[["uebersicht","Übersicht"],["liste","Alle Ausgaben"]].map(o=>`<button class="chipbtn neutral" data-gtab="${o[0]}" aria-pressed="${t===o[0]}">${o[1]}</button>`).join("")}</div>`}
function renderGeld(){let h=`<div><div class="eyebrow">Einkauf</div><h1>Ausgaben</h1></div>`;if(S.geldDraft)return h+renderGeldForm();
  const t=S.geldTab||"uebersicht",L=monies();h+=geldTabs(t);
  if(t==="liste")return h+geldList(L);
  const b=geldBal(L),mon=ymd(new Date()).slice(0,7),M=geldExp(L).filter(x=>(x.date||"").slice(0,7)===mon),sum=M.reduce((s,x)=>s+x.amt,0),me=geldMe(),mine=M.reduce((s,x)=>s+geldShare(x)[me],0);
  h+=`<section class="card geldbal"><div class="section-head"><h2>⚖️ Stand zwischen euch</h2></div><div class="geldbig">${esc(geldBalTxt(b))}</div><div class="btnrow" style="margin-top:0"><button class="primary" data-gact="new">＋ Ausgabe</button>${b?`<button class="ghost" data-gact="settle">🤝 Ausgleichen</button>`:""}</div>
    <form class="addrow" id="geldquick" novalidate><input id="geldq" placeholder="Schnell: 23,50 Rewe" autocomplete="off" enterkeyhint="done" aria-label="Schnell eintragen: Betrag und was"><button class="primary" type="submit" aria-label="Eintragen">＋</button></form><div class="freq">Schnell eintragen heißt: ${esc(pname(me))} hat gezahlt, für beide. Ändern per Tipp auf den Eintrag.</div></section>`;
  const by={};M.forEach(x=>{const k=geldCat(x.cat)[0];by[k]=(by[k]||0)+x.amt});const top=Object.keys(by).sort((a,c)=>by[c]-by[a]),mx=top.length?by[top[0]]:1;
  h+=`<section class="card"><div class="section-head"><h2>📅 ${esc(geldMonTxt(mon))}</h2><span class="freq num">${eur(sum)}</span></div>${M.length?`<div class="freq">Dein Anteil: ${eur(mine)}</div><ul class="geldbars">${top.map(k=>{const c=geldCat(k);return `<li><button data-gcatgo="${esc(k)}"><span>${c[1]} ${esc(c[2])}</span><span class="gbar"><i style="width:${Math.max(4,Math.round(by[k]*100/mx))}%"></i></span><b>${eur(by[k])}</b></button></li>`}).join("")}</ul>`:`<div class="freq">In diesem Monat noch nichts eingetragen.</div>`}</section>`;
  if(L.length)h+=`<section class="card"><div class="section-head"><h2>🧾 Zuletzt</h2><button class="ghost" data-gtab="liste">Alle ›</button></div><ul class="evlist gelds">${L.slice(0,5).map(geldRow).join("")}</ul></section>`;
  h+=splitCard();return h}
function geldList(L){const mon=S.geldMon||ymd(new Date()).slice(0,7),f=S.geldF||{},me=geldMe();
  let M=L.filter(x=>(x.date||"").slice(0,7)===mon);const cats=[...new Set(geldExp(M).map(x=>geldCat(x.cat)[0]))];
  if(f.by)M=M.filter(x=>x.by===f.by);if(f.cat)M=M.filter(x=>x.kind!=="settle"&&geldCat(x.cat)[0]===f.cat);
  const sum=geldExp(M).reduce((s,x)=>s+x.amt,0);
  let h=`<div class="geldmon"><button class="iconbtn" data-gmon="-1" aria-label="Monat zurück">‹</button><b>${esc(geldMonTxt(mon))}</b><button class="iconbtn" data-gmon="1" aria-label="Monat vor">›</button></div>
    <div class="unl scrollrow">${[["","Alle"],[me,"Ich"],[geldOther(me),pname(geldOther(me))]].map(o=>`<button class="chipbtn neutral" data-gfby="${o[0]}" aria-pressed="${(f.by||"")===o[0]}">${o[0]?"Gezahlt: ":""}${esc(o[1])}</button>`).join("")}</div>
    ${cats.length>1||f.cat?`<div class="unl scrollrow">${[["","Alle Arten"]].concat(cats.map(k=>{const c=geldCat(k);return [k,c[1]+" "+c[2]]})).map(o=>`<button class="chipbtn neutral" data-gfcat="${esc(o[0])}" aria-pressed="${(f.cat||"")===o[0]}">${esc(o[1])}${o[0]&&f.cat===o[0]?" ✕":""}</button>`).join("")}</div>`:""}
    <div class="btnrow" style="margin-top:0"><button class="primary" data-gact="new">＋ Ausgabe</button><span class="freq" style="margin-left:auto">Summe: <b>${eur(sum)}</b></span></div>`;
  if(!M.length)return h+`<div class="empty"><h2>Nichts in diesem Monat</h2><div>Mit „＋ Ausgabe“ eintragen.</div></div>`;
  const days={};M.forEach(x=>{(days[x.date||""]=days[x.date||""]||[]).push(x)});
  h+=`<section class="card"><ul class="evlist gelds">${Object.keys(days).sort().reverse().map(k=>`<li class="geldday0">${esc(k?dLabel(k):"Ohne Tag")}</li>`+days[k].map(geldRow).join("")).join("")}</ul></section>`;return h}
function splitCard(){const L=splits();
  return `<section class="card"><div class="section-head"><h2>💶 Splitwise-Gruppen</h2></div><div class="freq">Für Gruppen mit anderen. Hier nur als Link, auf Wunsch mit einem Urlaub, Ausflug oder Projekt verbunden.</div>
  <form class="addrow" id="splitform" novalidate><input type="url" id="splitinput" placeholder="Link zur Splitwise-Gruppe einfügen" autocomplete="off" enterkeyhint="done" aria-label="Link zur Splitwise-Gruppe"><button class="primary" type="submit">＋</button></form>${L.length?`<ul class="splitlist">${L.map(splitTile).join("")}</ul>`:""}</section>`}
function geldSettle(){const b=geldBal(monies());if(!b)return;const owes=b>0?"p1":"p0";geldNew({kind:"settle",name:"Ausgleich",amt:eurPlain(b),by:owes})}
async function geldSave(){const d=S.geldDraft;if(!d)return;const amt=parseEur(d.amt);if(!amt){toast("Bitte einen Betrag eintragen, z. B. 12,50.");return}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date||"")){toast("Bitte einen Tag wählen.");return}
  const st=d.kind==="settle",name=(st?"Ausgleich":(d.name||"").trim().slice(0,80))||geldCat(d.cat||"sonst")[2],cat=st?null:d.cat||geldGuess(name),pct=Math.max(0,Math.min(100,parseInt(d.pct,10)));
  const split=st?null:d.split==="pct"?(isNaN(pct)||pct===50?"half":pct===100?"p0":pct===0?"p1":String(pct)):d.split||"half";
  const id=d.id||newId("g"),old=(S.food&&S.food.money&&S.food.money[id])||{};
  const v={name,amt,date:d.date,by:d.by==="p1"?"p1":"p0",split,cat,ref:st?null:d.ref||null,note:(d.note||"").trim().slice(0,200)||null,kind:st?"settle":null,at:old.at||Date.now(),who:old.who||S.me||""};
  try{await S.store.setPath("food/money/"+id,v);S.geldDraft=null;toast(st?"Ausgleich eingetragen":"Gespeichert: "+eur(amt));render()}catch(_){toast("Konnte nicht speichern.")}}
async function geldQuick(txt){const m=/(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:€|eur(?:o)?\b)?/i.exec(txt||"");const amt=m&&parseEur(m[1]);if(!amt){toast("Bitte mit Betrag, z. B. „23,50 Rewe“.");return false}
  const name=(txt.slice(0,m.index)+" "+txt.slice(m.index+m[0].length)).replace(/\s+/g," ").replace(/^[\s,–-]+|[\s,–-]+$/g,"").slice(0,80),cat=geldGuess(name),id=newId("g");
  const v={name:name||geldCat(cat)[2],amt,date:ymd(new Date()),by:geldMe(),split:"half",cat,at:Date.now(),who:S.me||""};
  try{await S.store.setPath("food/money/"+id,v);toastAct("Eingetragen: "+eur(amt)+" "+v.name,"✎ Anpassen",()=>{const x=monies().find(y=>y.id===id);if(x){S.geldDraft=geldDraftOf(x);S.tab="ausgaben";render()}});return true}catch(_){toast("Konnte nicht speichern.");return false}}
app.addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const D=b.dataset,d=S.geldDraft;
  if(D.gact==="new"){geldNew();return}
  if(D.gact==="settle"){geldSettle();return}
  if(D.gact==="cancel"){S.geldDraft=null;render();return}
  if(D.gact==="del"&&d&&d.id){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}try{await S.store.setPath("food/money/"+d.id,null);S.geldDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht löschen.")}return}
  if(D.geldedit){const x=monies().find(y=>y.id===D.geldedit);if(x){S.geldDraft=geldDraftOf(x);render();window.scrollTo(0,0)}return}
  if(D.gtab){S.geldTab=D.gtab;render();window.scrollTo(0,0);return}
  if(D.gmon){S.geldMon=geldMonAdd(S.geldMon||ymd(new Date()).slice(0,7),+D.gmon);render();return}
  if(D.gfby!=null){S.geldF=Object.assign({},S.geldF,{by:D.gfby});render();return}
  if(D.gfcat!=null){const f=S.geldF||{};S.geldF=Object.assign({},f,{cat:f.cat===D.gfcat?"":D.gfcat});render();return}
  if(D.gcatgo){S.geldTab="liste";S.geldMon=ymd(new Date()).slice(0,7);S.geldF={cat:D.gcatgo};render();window.scrollTo(0,0);return}
  if(!d)return;
  if(D.gby){d.by=D.gby;render();return}
  if(D.gsplit){d.split=D.gsplit;render();return}
  if(D.gdate){d.date=D.gdate;render();return}
  if(D.gcat!=null){d.cat=d.cat===D.gcat?"":D.gcat;render();return}});
app.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.gf;if(k&&S.geldDraft)S.geldDraft[k]=e.target.value});
app.addEventListener("submit",async e=>{if(e.target.id==="geldform"){e.preventDefault();e.stopImmediatePropagation();await geldSave();return}
  if(e.target.id==="geldquick"){e.preventDefault();e.stopImmediatePropagation();const i=document.getElementById("geldq");if(await geldQuick(i&&i.value)){const j=document.getElementById("geldq");if(j)j.value=""}}});
// Für die Prüfskripte: reine Rechen-Bausteine (keine Daten)
window.Geld={parseEur,geldShare,geldBal,eur,dropRef:r=>splitDropRef(r)};
