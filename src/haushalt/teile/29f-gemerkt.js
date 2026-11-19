// ---------- Gemerktes vernetzen (Florian 17.11.2026: „Einmal ablegen? Überall finden“, „So bauen, Kopien zusammenführen“) ----------
// Ein Eintrag bleibt in seinem Speicher (food/fund, trip, idea, play, music). Das Feld show ("geschenke,spiel") sagt, wo er zusätzlich steht;
// who (p0|p1|kid) sagt, für wen. Die anderen Bereiche zeigen denselben Eintrag als Zeile (gmRow), mit demselben Stand und demselben Fenster (gmEdit).
// Neuer Ort = eine Zeile in GM_PLACES plus gmGuests(<ort>) in der Liste dort.
const GM_PLACES=[["geschenke","🎁","Geschenke","geschenke|"],["spiel","⚽","Spielen","spiel|"],["hoer","🎧","Hörspiele und Tonies","musik|ma:hoer"],["kind","🧒","Kind","kind|kf:kid_gm"],["haus","🛠️","Am Haus","amhaus|hs:wohnen"],["reise","🧭","Reisen und Ausflüge","ausflug|tt:ideen"]];
const GM_PATH={fund:"food/fund/",trip:"food/trip/",idea:"food/idea/",play:"food/play/",mus:"food/music/"};
const gmPlace=k=>GM_PLACES.find(p=>p[0]===k);
const gmShow=x=>csv(x&&x.show).filter(k=>gmPlace(k));
function gmRaw(store,id){const L=store==="fund"?listOf(S.food&&S.food.fund):store==="trip"?trips():store==="idea"?projs():store==="play"?plays():musics();return L.find(x=>x.id===id)}
// Einheitliche Sicht auf einen Eintrag: wo er zu Hause ist (home), woher er kommt (from), Stand auf der einen Leiter
function gmItem(store,x){const o={store,id:x.id,name:x.name||"",link:safeLink(x.link)||"",who:x.who||"",show:gmShow(x),at:x.at||0,note:x.note||"",x};
  if(store==="fund"){const ar=x.area||"reise",k=fundKind(x.kind,ar),A=FAREA[ar],p=x[A.key]&&A.projs().find(y=>y.id===x[A.key]);o.home=ar;o.ic=k[1];o.from=p?(p.emo||A.emo)+" "+p.name:ar==="haus"?"🛠️ Am Haus":"🧭 Reisen";o.st=x.st==="gebucht"?"erledigt":x.st||"idee";o.price=x.price||""}
  else if(store==="trip"){const k=tripKinds().find(c=>c[0]===x.kind);o.home="reise";o.ic=emoOf(x,k?k[1]:"🚲");o.from=x.kind==="spiel"?"🛝 Spielplatz":"🚲 Ausflugsziel";o.st=tripSt(x)}
  else if(store==="idea"){const c=projCat(x),pc=projCats().find(p=>p[0]===c)||PROJ_CATS[1];o.home=c==="geschenk"?"geschenke":HCAT[c]?"haus":"samm";o.ic=x.emo||pc[1];o.from=c==="geschenk"?"🎁 Geschenke":pc[1]+" "+pc[2];o.st=x.done?"erledigt":pjSt(x.state);o.gfor=x.for||""}
  else if(store==="play"){const s=playSecs().find(p=>p[0]===playSecOf(x))||playSecs()[0];o.home="spiel";o.ic=x.emo||s[1];o.from="⚽ "+s[2];o.st=playSt(x)}
  else{const a=musArt(x);o.home=a[0]==="hoer"?"hoer":"musik";o.ic=x.emo||a[1];o.from=a[1]+" "+a[2];o.st=a[0]==="hoer"?(x.st||"idee"):x.fav?"favorit":"idee"}
  return o}
function gmAll(){const L=[];listOf(S.food&&S.food.fund).forEach(x=>L.push(gmItem("fund",x)));trips().forEach(x=>L.push(gmItem("trip",x)));projs().forEach(x=>L.push(gmItem("idea",x)));plays().forEach(x=>L.push(gmItem("play",x)));musics().forEach(x=>L.push(gmItem("mus",x)));return L.sort((a,b)=>(b.at||0)-(a.at||0))}
// Gäste eines Ortes: Einträge von woanders, die auch hier stehen sollen
const gmGuests=place=>gmAll().filter(i=>i.home!==place&&i.show.includes(place));
// Alles fürs Kind (Seite Kind): ausdrücklich bei Kind gezeigt oder „Für wen: Kind“
const gmKid=()=>gmAll().filter(i=>i.show.includes("kind")||i.who==="kid");
const gmWho=i=>i.who==="kid"?"für "+kidName():i.who?"für "+pname(i.who):"";
// „auch bei 🎁 ⚽“ für die Zeile im eigenen Bereich
const gmAlso=x=>{const L=gmShow(x);return L.length?" · auch bei "+L.map(k=>gmPlace(k)[1]).join(" "):""};
const gmStL=s=>SAMM_ST.find(y=>y[0]===s)||SAMM_ST[0];
// Die eine Zeile für Gäste (Bauplan li.mk): Name = Fenster, Schild = Stand weiter
function gmRow(i,here){const s=gmStL(i.st),sub=[gmWho(i),i.gfor,i.from].concat(i.show.filter(k=>k!==here).map(k=>gmPlace(k)[1]+" "+gmPlace(k)[2])).filter(Boolean).join(" · ");
  return `<li class="mk gmg"><button class="mkb" data-gmedit="${i.store}|${esc(i.id)}" aria-label="${esc(i.name)} ansehen und ändern"><span class="mki">${esc(i.ic)}</span><span class="mkt"><b>${esc(i.name)}</b><span class="freq">${esc(sub)}</span></span></button>${i.link?`<a class="catbtn routebtn" href="${esc(i.link)}" target="_blank" rel="noopener" aria-label="Link öffnen">🔗</a>`:""}<button class="stbadge st-${s[0]}" data-gmst="${i.store}|${esc(i.id)}" aria-label="Stand von ${esc(i.name)}: ${s[2]}, antippen schaltet weiter">${s[1]} ${s[2]}</button></li>`}
const gmRows=(place,f)=>gmGuests(place).filter(f||(i=>i.st!=="erledigt")).map(i=>gmRow(i,place)).join("");
// Vorschlag, wo ein Eintrag noch hinpasst (✨): nur Vorschlag, gewählt wird selbst
function gmSugg(i){const t=(i.name+" "+i.link).toLowerCase(),out=[],add=k=>{if(!out.includes(k))out.push(k)};
  if(/tonie|hörspiel|hoerspiel|hörbuch/.test(t)){add("hoer");add("geschenke");add("kind")}
  if((i.store==="fund"&&i.x.kind==="spielzeug")||/spielzeug|lego|duplo|playmobil|puzzle|kuscheltier|laufrad|puppe|bauklötze|brio|bilderbuch|spielküche|knete/.test(t)){add("geschenke");add("spiel");add("kind")}
  if(/geschenk|gutschein/.test(t))add("geschenke");
  if(i.who==="kid")add("kind");
  return out.filter(k=>k!==i.home&&!i.show.includes(k))}
async function gmSetShow(store,id,L){await S.store.setPath(GM_PATH[store]+id+"/show",L.filter(k=>gmPlace(k)).join(",")||null)}
// Chips „Zeigen bei“ in den großen Masken (Spielen, Musik, Ausflug, Idee): schreiben sofort, der Entwurf bleibt offen
function gmMaskRow(store,id){const x=id&&gmRaw(store,id);if(!x)return "";const i=gmItem(store,x),sg=gmSugg(i);
  return `<div class="fld gmfld"><span>Zeigen bei</span><div class="unl">${GM_PLACES.filter(p=>p[0]!==i.home).map(p=>`<button type="button" class="chipbtn neutral" data-gmshow="${store}|${esc(id)}|${p[0]}" aria-pressed="${i.show.includes(p[0])}">${sg.includes(p[0])?"✨ ":""}${p[1]} ${p[2]}</button>`).join("")}</div><div class="freq">Der Eintrag bleibt einer und steht dann auch dort, mit demselben Stand. Gilt sofort.</div></div>`}
// Stand auf der einen Leiter setzen, je Speicher mit seinen eigenen Feldern
async function gmSetSt(i,st){const p=GM_PATH[i.store]+i.id+"/",x=i.x;
  if(i.store==="fund"){await S.store.setPath(p+"st",st==="erledigt"?"gebucht":st);if(st==="erledigt"&&x.st!=="gebucht"&&x.area==="haus")geldBought({name:x.name,cat:"wohnen",amt:priceCent(x.price),ref:"fund:"+x.id,grp:""})}
  else if(i.store==="idea"){if(st!=="erledigt")await S.store.setPath(p+"state",st==="idee"?null:st);await S.store.setPath(p+"done",st==="erledigt"?true:null);await S.store.setPath(p+"doneAt",st==="erledigt"?(x.doneAt||Date.now()):null);if(st==="erledigt"&&!x.done&&projCat(x)==="geschenk")geldBought({name:x.name,cat:"geschenk",ref:"idea:"+x.id})}
  else if(i.store==="play"){await S.store.setPath(p+"st",st==="idee"?null:st);await S.store.setPath(p+"fav",st==="favorit"?true:null)}
  else if(i.store==="mus"){if(musArt(x)[0]==="hoer")await S.store.setPath(p+"st",st);else await S.store.setPath(p+"fav",st==="favorit"?true:null)}
  else{if(st==="geplant"&&!x.date){calDayPick(x.name,nextSat(),async k=>{try{await S.store.setPath(p+"date",k);await S.store.setPath(p+"done",null);toast("Steht am "+rDate(k)+" im Kalender")}catch(_){toast("Konnte nicht speichern.")}});return}
    await S.store.setPath(p+"fav",st==="favorit"?true:st==="idee"?null:x.fav||null);if(st==="idee"||st==="favorit")await S.store.setPath(p+"date",null);await S.store.setPath(p+"done",st==="erledigt"?true:null);await S.store.setPath(p+"doneAt",st==="erledigt"?Date.now():null)}}
const gmSteps=i=>i.store==="mus"&&musArt(i.x)[0]!=="hoer"?["idee","favorit"]:["idee","favorit","geplant","erledigt"];
// Der große Weg: die Maske im eigenen Bereich mit allen Angaben
function gmNative(store,id){const x=gmRaw(store,id);if(!x)return;const i=gmItem(store,x);
  if(store==="fund"){fundEdit(id);return}
  goNav(store==="trip"?"ausflug|tt:ideen":store==="play"?"spiel|":store==="mus"?"musik|":i.home==="geschenke"?"geschenke|":i.home==="haus"?"amhaus|pf:"+projCat(x):"projekte|pf:"+projCat(x));
  const b=document.createElement("button");b.hidden=true;b.dataset[store==="trip"?"tripedit":store==="play"?"playedit":store==="mus"?"musedit":"projedit"]=id;app.appendChild(b);b.click();b.remove()}
// Das eine Fenster, von jeder Stelle aus: Name, Link, Stand, Für wen, Zeigen bei, Notiz
function gmEdit(store,id){const x=gmRaw(store,id);if(!x)return;if(store==="fund"){fundEdit(id);return}const i=gmItem(store,x),sg=gmSugg(i),steps=gmSteps(i);
  S.verkNext=[store==="music"?"mus":store,id,x];editBox(i.ic+" "+i.name,[{k:"name",label:"Was",type:"text",val:i.name},{k:"link",label:"Link",type:"url",val:x.link||""},
    {k:"st",label:"Stand",type:"chips",opts:steps.map(s=>{const l=gmStL(s);return [s,l[1]+" "+(store==="mus"&&s==="erledigt"?"Haben wir":l[2])]}),val:i.st},
    {k:"who",label:"Für wen",type:"chips",opts:[["","Offen"]].concat(whoOpts().filter(o=>o[0]!=="both")),val:i.who},
    {k:"show",label:"Zeigen bei",type:"multi",opts:GM_PLACES.filter(p=>p[0]!==i.home).map(p=>[p[0],(sg.includes(p[0])?"✨ ":"")+p[1]+" "+p[2]]),val:i.show,hint:"Zu Hause bei "+i.from+". "+(sg.length?"✨ = passt vermutlich. ":"")+"Der Eintrag bleibt einer und steht auch dort, mit demselben Stand."},
    {k:"note",label:"Notiz",type:"text",val:x.note||"",max:store==="mus"?120:500}],
    async V=>{const p=GM_PATH[store]+id+"/",name=String(V.name||"").trim().slice(0,80)||i.name;
      await S.store.setPath(p+"name",name);await S.store.setPath(p+"link",safeLink(V.link)||null);await S.store.setPath(p+"note",String(V.note||"").trim().slice(0,store==="mus"?120:500)||null);await S.store.setPath(p+"who",V.who||null);await gmSetShow(store,id,V.show||[]);
      if(V.st!==i.st)await gmSetSt(i,V.st);toast("Gespeichert")},
    [["Alle Angaben ›",()=>gmNative(store,id)]])}
// Nach dem Anlegen: passt es noch woanders hin? (Toast, ein Tipp)
function gmOffer(store,id,o){const i=gmItem(store,Object.assign({id},o)),sg=gmSugg(i);if(!sg.length)return false;const P=sg.map(gmPlace);
  toastAct(i.name+" gemerkt. Auch zeigen bei "+P.map(p=>p[1]+" "+p[2]).join(", ")+"?","Ja, auch dort",async()=>{try{await gmSetShow(store,id,i.show.concat(sg));toast("Steht jetzt auch bei "+P.map(p=>p[2]).join(", "))}catch(_){toast("Konnte nicht speichern.")}});return true}
// Klicks; liefert true, wenn erledigt
function gmClick(b){const D=b.dataset;
  if(D.gmedit){const [s,id]=D.gmedit.split("|");gmEdit(s,id);return true}
  if(D.gmst||D.gmdone){const [s,id]=(D.gmst||D.gmdone).split("|"),x=gmRaw(s,id);if(x){const i=gmItem(s,x),o=gmSteps(i),nx=D.gmdone?"erledigt":o[(o.indexOf(i.st)+1)%o.length];gmSetSt(i,nx).catch(()=>toast("Konnte nicht speichern."))}return true}
  if(D.gmshow){const [s,id,k]=D.gmshow.split("|"),x=gmRaw(s,id);if(x){const L=gmShow(x),j=L.indexOf(k);if(j<0)L.push(k);else L.splice(j,1);gmSetShow(s,id,L).catch(()=>toast("Konnte nicht speichern."))}return true}
  return false}
// Kopien zusammenführen (Florians Ja vom 17.11.2026): Bisher legte „Auch zeigen bei 🎁 Geschenke“ am Fund eine zweite Geschenk-Idee an (food/idea, ref "fund:<id>").
// Jetzt bleibt nur der Fund und zeigt sich bei Geschenke. Für wen, Anlass, Notiz und der weitere Stand der Kopie wandern an den Fund, dann fällt die Kopie weg.
// Reihenfolge so, dass ein zweites Gerät nichts doppelt macht: erst der Fund, dann die Kopie, zuletzt der Verweis.
async function migGmCopies(){if(S.migGm||!S.food||!S.food.fund)return;S.migGm=1;const RK=["idee","favorit","geplant","gebucht"];
  for(const f of listOf(S.food.fund).filter(y=>y.links&&y.links.geschenk)){const c=projs().find(y=>y.id===f.links.geschenk),p="food/fund/"+f.id+"/";
    try{if(c){const L=gmShow(f);if(!L.includes("geschenke"))L.push("geschenke");await gmSetShow("fund",f.id,L);
        if(c.who&&!f.who)await S.store.setPath(p+"who",c.who);const nt=[c.for,c.note].filter(Boolean).join(". ").slice(0,500);if(nt&&!f.note)await S.store.setPath(p+"note",nt);
        const cs=c.done?"gebucht":pjSt(c.state);if(RK.indexOf(cs)>RK.indexOf(f.st||"idee"))await S.store.setPath(p+"st",cs);
        for(const w of prios().filter(w=>w.ref===c.id))await S.store.setPath("food/prio/"+w.id+"/ref",null);
        await S.store.setPath("food/idea/"+c.id,null)}
      await S.store.setPath(p+"links/geschenk",null)}catch(_){S.migGm=0;return}}}
