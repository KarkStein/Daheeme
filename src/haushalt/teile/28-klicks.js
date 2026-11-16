app.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.mealfor)S.mealFor=ymd(new Date());
  if(b.dataset.allar!=null){arOpen(false);return}
  if(b.dataset.route){routePick(b.dataset.route);return}
  if(b.dataset.cook){cookStart(b.dataset.cook);return}
  if(b.dataset.act==="mealforx"){S.mealFor=null;render();return}
  if((b.classList.contains("spot")&&b.dataset.go!=="post"||b.classList.contains("hoslot"))&&Date.now()-(S.mboxAt||0)<700)return;
  if(b.dataset.stress){const k=b.dataset.stress,wk=wkKey(planWeek()),on=!!(planX(planWeek())[k]&&planX(planWeek())[k].stress);try{await S.store.setPath("food/planx/"+wk+"/"+k+"/stress",on?null:true)}catch(_){toast("Konnte nicht speichern.")}if(S.sugg){S.sugg=suggestWeek(planWeek(),S.sugg);render()}return}
  if(b.dataset.planrec||b.dataset.sugrec){const k=b.dataset.planrec||b.dataset.sugrec,wk=wkKey(planWeek()),m=b.dataset.planrec?planDays(planWeek())[k]:(S.sugg&&S.sugg[k]);if(!m)return;const name=String(m.text||m.name||"").slice(0,80);const ex=recs().find(r=>(r.name||"").toLowerCase()===name.toLowerCase());const id=ex?ex.id:newId("r");
    try{if(!ex)await S.store.setPath("food/rec/"+id,{name,ing:Array.isArray(m.ing)?m.ing.join("\n"):(m.ing||""),note:m.note||"",link:m.link||"",at:Date.now()});if(b.dataset.planrec)await S.store.setPath("food/plan/"+wk+"/"+k+"/rec",id);else{m.rec=id;m.src="rezept"}toast(ex?"Steht schon bei euren Rezepten":"Zu euren Rezepten hinzugefügt");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.sugrm){if(S.sugg){delete S.sugg[b.dataset.sugrm];if(!Object.keys(S.sugg).length)S.sugg=null}render();return}
  if(b.dataset.planrm){const k=b.dataset.planrm,mon=b.dataset.pday?mondayOf(new Date(b.dataset.pday+"T12:00:00")):planWeek(),wk=wkKey(mon),days=planDays(mon),m=days[k];if(!m)return;const r=m.rec&&recs().find(x=>x.id===m.rec),nm=r?r.name:m.text;
    try{await S.store.setPath("food/plan/"+wk+"/"+k,null);const still=Object.keys(days).some(o=>o!==k&&days[o]&&(days[o].text===nm||(r&&days[o].rec===r.id)));if(nm&&!still&&shopBlocks()[nm]){await shopRemoveBlock(nm);toast("Entfernt, Zutaten auch von der Einkaufsliste")}else toast("Aus dem Plan entfernt")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.recrm){const r=recs().find(x=>x.id===b.dataset.recrm);if(!r)return;try{await recDrop(r);toast("Rezept entfernt")}catch(_){toast("Konnte nicht speichern.")}render();return}
  if(b.dataset.act==="pantrytoggle"){S.pantryOpen=!S.pantryOpen;render();return}
  if(b.dataset.pantryrm){const l=pantry().filter(x=>x!==b.dataset.pantryrm);try{await S.store.setPath("food/pantry",l.join("\n")||" ")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="suggest"){S.suggSkip={};S.sugg=suggestWeek(planWeek());if(!Object.keys(S.sugg).length)toast("Keine freien Tage oder keine passenden Rezepte");render();return}
  if(b.dataset.act==="sugclose"){S.sugg=null;S.suggSkip={};render();return}
  if(b.dataset.sugre){const k=b.dataset.sugre,x=S.sugg&&S.sugg[k];if(!x)return;S.suggSkip=S.suggSkip||{};(S.suggSkip[k]=S.suggSkip[k]||[]).push(x.name);S.sugg=suggestWeek(planWeek(),S.sugg);if(!S.sugg[k])toast("Kein weiteres passendes Rezept");render();return}
  if(b.dataset.sugok||b.dataset.act==="sugall"){sugAsk(b.dataset.sugok?[b.dataset.sugok]:Object.keys(S.sugg||{}));return}
  if(b.dataset.act==="wxedit"){S.wxEdit=!S.wxEdit;render();setTimeout(()=>{const el=document.getElementById("wxinput");if(el)el.focus()},50);return}
  if(b.dataset.prionew!=null){prioNew(b.dataset.prionew||"frei");return}
  if(b.dataset.buyedit){buyEdit(b.dataset.buyedit);return}
  if(b.dataset.splitedit){splitEdit(b.dataset.splitedit);return}
  if(b.dataset.act==="favedit"){S.favEdit=!S.favEdit;render();return}
  if(b.dataset.favrm){try{await S.store.setPath("food/fav/"+favKey(b.dataset.favrm)+"/n",0);toast("Aus „Oft gekauft“ entfernt")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.pmtplrm){const [f,id]=b.dataset.pmtplrm.split("|");try{await S.store.setPath("food/priotpl/"+f+"/"+id,null);toast("Vorlage gelöscht")}catch(_){toast("Konnte nicht speichern.")}return}
  if(S.prioDraft&&b.dataset.pmtpl){const r=parseWhen(S.prioDraft.name);S.prioDraft.name=b.dataset.pmtpl+(r.due||r.time?" "+S.prioDraft.name:"");render();return}
  if(S.prioDraft&&b.dataset.pmarea){S.prioDraft.from=b.dataset.pmarea;S.prioDraft.areaSet=true;S.prioDraft.ref="";render();return}
  if(S.prioDraft&&b.dataset.pmday!=null){S.prioDraft.due=b.dataset.pmday;if(!S.prioDraft.due)S.prioDraft.time="";render();return}
  if(S.prioDraft&&b.dataset.pmwho!=null){S.prioDraft.who=b.dataset.pmwho;render();return}
  if(S.prioDraft&&b.dataset.pmrep!=null){S.prioDraft.rep=b.dataset.pmrep;render();return}
  if(b.dataset.act==="pmtplsave"&&S.prioDraft){const r=parseWhen(S.prioDraft.name),n=(r.rest||"").slice(0,40);if(!n){toast("Erst oben bei „Was?“ etwas eintragen");return}try{await S.store.setPath("food/priotpl/"+(S.prioDraft.from||"frei")+"/"+newId("v"),{name:n});toast("Vorlage gemerkt")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="pmbulk"){const el=document.getElementById("pm-bulk"),lines=(el&&el.value||"").split(/\n|;/).map(x=>x.replace(/^[\s•\-*]+/,"").replace(/^\d{1,2}[.)]\s+/,"").trim()).filter(x=>x.length>1).slice(0,30);let n=0;for(const l of lines){const v=prioFromLine(l);if(!v)continue;try{await S.store.setPath("food/prio/"+newId("w"),v);n++}catch(_){toast("Konnte nicht speichern.");break}}if(n){S.prioDraft=null;S.tab="wichtig";toast(n===1?"1 Erinnerung eingelesen":n+" Erinnerungen eingelesen");render()}else toast("Nichts zum Einlesen gefunden");return}
  if(b.dataset.act==="pmcancel"){S.prioDraft=null;if(S.prioBack&&S.prioBack!=="wichtig")S.tab=S.prioBack;render();return}
  if(b.dataset.act==="pmdel"&&S.prioDraft&&S.prioDraft.id){try{await S.store.setPath("food/prio/"+S.prioDraft.id,null);S.prioDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="pmsave"&&S.prioDraft){const d=S.prioDraft,r=parseWhen(d.name);let name=(d.due||d.time?d.name:r.rest||d.name).trim().slice(0,80);if(!name){toast("Bitte eintragen, woran erinnert werden soll");return}
    const due=d.due||r.due||"",time=due?(d.time||r.time||""):"",auto=!d.areaSet&&(d.from||"frei")==="frei"?detectArea(d.name):"";if(auto)d.from=auto;const src=d.ref?prioSrc(d.from,d.ref):null;
    const v=Object.assign({name,from:d.from||"frei",at:d.at||Date.now(),by:d.by||S.me||""},d.ref&&src?{ref:d.ref}:{},due?{due}:{},time?{time}:{},d.rep&&due?{rep:d.rep}:{},d.note&&d.note.trim()?{note:d.note.trim().slice(0,300)}:{},d.who&&d.who!=="both"?{who:d.who}:{});
    try{await S.store.setPath("food/prio/"+(d.id||newId("w")),v);S.prioDraft=null;if(TAB_FROM[S.prioBack])S.tab=S.prioBack;toast(due?"Erinnerung für "+dLabel(due)+(time?" um "+time:""):"Steht jetzt unter Wichtig");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.priosort){S.prioSort=b.dataset.priosort;render();return}
  if(b.dataset.reise){S.reiseOpen=b.dataset.reise;S.tab="ausflug";S.tripTab="urlaub";render();window.scrollTo(0,0);return}
  if(b.dataset.act==="reiseback"){S.reiseOpen=null;render();window.scrollTo(0,0);return}
  if(b.dataset.reisef!=null){S.reiseFilter=b.dataset.reisef;render();return}
  if(b.dataset.act==="reisenew"){const id=newId("u");try{await S.store.setPath("food/urlaub/"+id,{name:b.dataset.st==="traum"?"Neuer Traum":"Neuer Urlaub",state:b.dataset.st||"aktuell",emo:"⛵",at:Date.now(),by:S.me||""});await S.store.setPath("food/packlist/u_"+id,{name:"⛵ Neuer Urlaub",at:Date.now()});S.reiseOpen=id;render();window.scrollTo(0,0);const el=document.querySelector('[data-rsf=name]');if(el){el.focus();el.select()}}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.packtpl){const pl=b.dataset.pl||("u_"+S.reiseOpen),ur=pl.startsWith("u_")&&urlaube().find(u=>"u_"+u.id===pl),have=new Set(packs().filter(i=>(i.list||"main")===pl).map(i=>i.name.toLowerCase()));let n=0;try{if(ur&&!(S.food&&S.food.packlist&&S.food.packlist[pl]))await S.store.setPath("food/packlist/"+pl,{name:"⛵ "+ur.name,at:Date.now()});for(const nm of PACK_TPL[b.dataset.packtpl]||[]){if(have.has(nm.toLowerCase()))continue;const v={name:nm,done:false,at:Date.now()+n};if(pl!=="main")v.list=pl;await S.store.setPath("food/pack/"+newId("k"),v);n++}toast(n?n+" Sachen dazu":"Steht schon alles drauf")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.packshop){const i=packs().find(y=>y.id===b.dataset.packshop);if(i){const L=packLists().find(l=>l.id===(i.list||"main"));try{const r=await shopAddMany([i.name],(L&&L.name)||"Packliste",{force:true,quiet:true});toast(r&&r.n?i.name+" steht auf der Einkaufsliste":"Steht schon auf der Liste")}catch(_){toast("Konnte nicht speichern.")}}return}
  if(b.dataset.rftake!=null){const ar=b.dataset.ar||"reise",A=FAREA[ar],J=S[A.rf],i=(J&&J.items||[])[+b.dataset.rftake];if(i){const ff=fundFilt(ar),r=rfProj(i,ar)||(ff.p&&ff.p!=="-"?{id:ff.p}:null),o={name:String(i.name).slice(0,80),kind:A.kinds.some(c=>c[0]===i.kind)?i.kind:"sonst",st:"idee",src:"recherche",at:Date.now(),by:S.me||""};if(ar!=="reise")o.area=ar;if(safeLink(i.link))o.link=safeLink(i.link);if(i.place)o.place=String(i.place).slice(0,80);if(i.price)o.price=String(i.price).slice(0,20);if(i.note)o.note=String(i.note).slice(0,200);if(r)o[A.key]=r.id;try{await S.store.setPath("food/fund/"+newId("f"),o);toast("In die Sammlung übernommen")}catch(_){toast("Konnte nicht speichern.")}}return}
  if(b.dataset.fundnk!=null){const ar=b.dataset.ar||"reise";S.fundNewKind=S.fundNewKind||{};S.fundNewKind[ar]=S.fundNewKind[ar]===b.dataset.fundnk?"":b.dataset.fundnk;render();return}
  if(b.dataset.ff){fundFilt(b.dataset.ar||"reise")[b.dataset.ff]=b.dataset.v||"";render();return}
  if(b.dataset.fundopen){const ar=b.dataset.ar||"reise";S.ff=S.ff||{};S.ff[ar]={k:"",p:b.dataset.fundopen,s:""};if(ar==="reise"){S.reiseOpen=null;S.tripTab="recherche"}else{S.hprojOpen=null;S.hsamm=true}render();window.scrollTo(0,0);return}
  if(b.dataset.fundst){const f=listOf(S.food&&S.food.fund).find(y=>y.id===b.dataset.fundst);if(f){const o=["idee","favorit","gebucht"],nx=o[(o.indexOf(f.st||"idee")+1)%3];await S.store.setPath("food/fund/"+f.id+"/st",nx).catch(()=>toast("Konnte nicht speichern."));if(nx==="gebucht"&&f.area==="haus")geldBought({name:f.name,cat:"wohnen",amt:priceCent(f.price),ref:"fund:"+f.id,grp:""})}return}
  if(b.dataset.fundrm){fundRmAsk(b.dataset.fundrm);return}
  if(b.dataset.fundedit){fundEdit(b.dataset.fundedit);return}
  if(S.reiseOpen){const base="food/urlaub/"+S.reiseOpen+"/",x=urlaube().find(y=>y.id===S.reiseOpen);
    if(b.dataset.reisest){const v=b.dataset.reisest;try{await S.store.setPath(base+"state",v);if(v==="erledigt"){S.reiseOpen=null;toast("Archiviert unter Vergangene");render();window.scrollTo(0,0)}else toast(v==="aktuell"?"Steht wieder unter Aktuell":"Gespeichert")}catch(_){toast("Konnte nicht speichern.")}return}
    if(b.dataset.reiseemo){await S.store.setPath(base+"emo",b.dataset.reiseemo).catch(()=>{});return}
    if(b.dataset.reiseheart){const p=b.dataset.reiseheart;await S.store.setPath(base+"hearts/"+p,x&&x.hearts&&x.hearts[p]?null:true).catch(()=>{});return}
    if(b.dataset.pinkind){S.pinKind=b.dataset.pinkind;render();return}
    if(b.dataset.pinrm){await S.store.setPath(base+"pins/"+b.dataset.pinrm,null).catch(()=>{});return}
    if(b.dataset.bookrm){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Löschen?";return}await S.store.setPath(base+"book/"+b.dataset.bookrm,null).catch(()=>{});return}
    if(b.dataset.packtpl){const pl="u_"+S.reiseOpen,have=new Set(packs().filter(i=>i.list===pl).map(i=>i.name.toLowerCase()));let n=0;try{if(!(S.food&&S.food.packlist&&S.food.packlist[pl]))await S.store.setPath("food/packlist/"+pl,{name:"⛵ "+(x?x.name:"Urlaub"),at:Date.now()});for(const nm of PACK_TPL[b.dataset.packtpl]||[]){if(have.has(nm.toLowerCase()))continue;await S.store.setPath("food/pack/"+newId("k"),{name:nm,done:false,at:Date.now()+n,list:pl});n++}toast(n?n+" Sachen dazu":"Steht schon alles drauf")}catch(_){toast("Konnte nicht speichern.")}return}
    if(b.dataset.packshop){const i=packs().find(y=>y.id===b.dataset.packshop);if(i){try{const r=await shopAddMany([i.name],"⛵ "+(x?x.name:"Urlaub"),{force:true,quiet:true});toast(r&&r.n?i.name+" steht auf der Einkaufsliste":"Steht schon auf der Liste")}catch(_){toast("Konnte nicht speichern.")}}return}
    if(b.dataset.reiseprio!=null){const n=REISE_PRIO[+b.dataset.reiseprio];let due="";if(x&&x.from){const d=addDays(new Date(x.from+"T12:00:00"),n==="Pässe prüfen"?-42:n==="Auto checken lassen"?-14:n==="Kita abmelden"?-21:n==="Packen"?-2:-7);if(d>new Date())due=ymd(d)}prioNew("reisen",{name:n,ref:S.reiseOpen,due});return}
    if(b.dataset.act==="reisedel"){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}try{const uid=S.reiseOpen;await splitDropRef("urlaub:"+uid);await prioDropRef([uid]);for(const i of packs().filter(i=>i.list==="u_"+uid))await S.store.setPath("food/pack/"+i.id,null);await S.store.setPath("food/packlist/u_"+uid,null);await S.store.setPath("food/urlaub/"+uid,null);S.reiseOpen=null;toast("Urlaub gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}}
  if(b.dataset.rgo){const r=RSRC.find(x=>x.key===b.dataset.rgo);if(r){await rMarkSeen([r.key]);goNav(r.nav)}return}
  if(b.dataset.rseen){await rMarkSeen(b.dataset.rseen.split(","));return}
  if(b.dataset.act==="copyclose"){S.copyBox="";render();return}
  if(b.dataset.act==="rwnew"){S.rDraft={area:"rezepte",what:"",rhythm:"woechentlich",note:""};render();return}
  if(b.dataset.act==="rwcancel"){S.rDraft=null;render();return}
  if(b.dataset.rchange!=null){const a=((S.auftr&&S.auftr.items)||[]).find(x=>x.id===b.dataset.rchange)||{};S.rDraft={area:a.area||"sonst",what:"Änderung an „"+(a.name||"")+"“: ",rhythm:"woechentlich",note:"",task:a.id||""};render();window.scrollTo(0,document.body.scrollHeight);return}
  if(b.dataset.rwedit){const w=rwuensche().find(x=>x.id===b.dataset.rwedit);if(w){S.rDraft={...w};render()}return}
  if(b.dataset.rwdel){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich?";return}try{await S.store.setPath("food/rwunsch/"+b.dataset.rwdel,null)}catch(_){}render();return}
  if(b.dataset.rwcopy){const w=rwuensche().find(x=>x.id===b.dataset.rwcopy);if(w)copyText(rWishText(w));return}
  if(b.dataset.act==="rwsave"){const d=S.rDraft;if(!d||!String(d.what||"").trim()){toast("Bitte eintragen, was gesucht werden soll.");return}const id=d.id||newId("w"),v={area:d.area||"sonst",what:String(d.what).trim().slice(0,600),name:String(d.what).trim().slice(0,80),rhythm:d.rhythm||null,note:(d.note||"").trim()||null,task:d.task||null,state:"offen",at:d.at||Date.now(),by:d.by||S.me||""};
    try{await S.store.setPath("food/rwunsch/"+id,v);S.rDraft=null;render();copyText(rWishText({...v,id}))}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.wmwsec){const O=S.wmwOpen||(S.wmwOpen={});O[b.dataset.wmwsec]=!O[b.dataset.wmwsec];render();return}
  if(b.dataset.wmwwho){S.wmwWho=b.dataset.wmwwho;render();return}
  if(b.dataset.wmwview){S.wmwView=b.dataset.wmwview;render();return}
  if(b.dataset.act==="wmwall"){const O=S.wmwOpen||(S.wmwOpen={}),ids=[...document.querySelectorAll("[data-wmwsec]")].map(x=>x.dataset.wmwsec),all=ids.every(k=>O[k]);ids.forEach(k=>O[k]=!all);render();return}
  if(b.dataset.wtick){wmwTick(b.dataset.wtick,b.dataset.who);return}
  if(b.dataset.homesum){const k=b.dataset.homesum,o=homeOpen();o[k]=!o[k];try{localStorage.setItem("hq-homeopen",JSON.stringify(o))}catch(_){}render();return}
  if(b.dataset.splitrm){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="?";return}try{await S.store.setPath("food/split/"+b.dataset.splitrm,null)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.buysum){const k=b.dataset.buysum;(S.buyOpen||(S.buyOpen={}))[k]=!S.buyOpen[k];render();return}
  if(b.dataset.buyfor){const [l,w]=b.dataset.buyfor.split("|"),F=S.buyFor||(S.buyFor={});F[l]=F[l]===w?"":w;render();return}
  if(b.dataset.buydone){const x=buys().find(y=>y.id===b.dataset.buydone);if(x){try{await S.store.setPath("food/buy/"+x.id+"/done",!x.done);await S.store.setPath("food/buy/"+x.id+"/doneAt",x.done?null:Date.now());if(!x.done)geldBought({name:x.name,cat:{kleidung:"kleid",geschenke:"geschenk",baumarkt:"wohnen"}[x.list]||"",ref:"buy:"+x.id})}catch(_){toast("Konnte nicht speichern.")}}return}
  if(b.dataset.buyrm){try{await S.store.setPath("food/buy/"+b.dataset.buyrm,null)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.buylistdel){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}const id=b.dataset.buylistdel;try{for(const x of buys().filter(y=>y.list===id))await S.store.setPath("food/buy/"+x.id,null);await S.store.setPath("food/buylist/"+id,null);toast("Liste gelöscht")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="buylistnew"){S.buyListNew=true;render();const el=document.getElementById("buylistinput");if(el)el.focus();return}
  if(b.dataset.advbought){const [c,d]=b.dataset.advbought.split("|"),cal=advCals().find(x=>x.id===c);if(cal){advSet(cal,+d,{st:"besorgt"});const x=advDoors(c)[+d]||{};geldBought({name:"Türchen "+d+(x.name?": "+x.name:""),cat:"geschenk",amt:priceCent(x.price),ref:"adoor:"+c+"_"+d,grp:""})}return}
  if(b.dataset.fundbought){try{await S.store.setPath("food/fund/"+b.dataset.fundbought+"/st","gebucht");const f=listOf(S.food&&S.food.fund).find(y=>y.id===b.dataset.fundbought)||{};geldBought({name:f.name||"",cat:f.area==="haus"?"wohnen":"",amt:priceCent(f.price),ref:"fund:"+b.dataset.fundbought,grp:""})}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.buypack){S.prev=S.tab;S.tab="ausflug";S.tripTab="pack";S.packList=b.dataset.buypack;render();window.scrollTo(0,0);return}
  if(b.dataset.packwear){const i=packs().find(y=>y.id===b.dataset.packwear);if(!i)return;if(buys().some(y=>y.ref==="pack:"+i.id&&!y.done)){try{await buyDropRef("pack:"+i.id);toast(i.name+" ist nicht mehr bei Kleidung")}catch(_){toast("Konnte nicht speichern.")}return}if(await buyAdd("kleidung",i.name,{ref:"pack:"+i.id}))toast(i.name+" steht bei Einkauf › Kleidung");return}
  if(b.dataset.tagsum){const k=b.dataset.tagsum;(S.tagOpen||(S.tagOpen={}))[k]=!S.tagOpen[k];render();return}
  if(b.dataset.setsum){const k=b.dataset.setsum;(S.setOpen||(S.setOpen={}))[k]=!S.setOpen[k];render();return}
  if(b.dataset.act==="themecycle"){const o=["","light","dark"];S.theme=o[(o.indexOf(S.theme||"")+1)%3];try{localStorage.setItem("hq-theme",S.theme)}catch(_){}if(S.theme)document.documentElement.dataset.theme=S.theme;else delete document.documentElement.dataset.theme;render();return}
  if(b.dataset.setgo){S.prev=S.tab;S.tab="settings";(S.setOpen||(S.setOpen={}))[b.dataset.setgo]=true;render();const el=document.getElementById("set-"+b.dataset.setgo);if(el)el.scrollIntoView({block:"start"});else window.scrollTo(0,0);return}
  if(b.dataset.gest){const k=b.dataset.gest;if(k==="labels"){S.labels=!S.labels;try{localStorage.setItem("hq-labels",S.labels?"1":"")}catch(_){}}
    else if(k==="veg"){try{await S.store.setPath("food/pref/veg",vegW()>0?false:null)}catch(_){toast("Konnte nicht speichern.")}}
    else{S.gest[k]=!S.gest[k];try{localStorage.setItem("hq-gest",JSON.stringify(S.gest))}catch(_){}}render();return}
  if(b.dataset.motivSet!=null){try{localStorage.setItem("hq-motiv",b.dataset.motivSet)}catch(_){}render();return}
  if(b.dataset.stilSet!=null){try{localStorage.setItem("hq-bildstil",b.dataset.stilSet)}catch(_){}render();return}
  if(b.dataset.themeSet!=null){S.theme=b.dataset.themeSet;try{localStorage.setItem("hq-theme",S.theme)}catch(_){}if(S.theme)document.documentElement.dataset.theme=S.theme;else delete document.documentElement.dataset.theme;render();return}
  if(b.dataset.act==="invitecopy"){const l=inviteLink();try{await navigator.clipboard.writeText(l);toast("Link kopiert")}catch(_){S.copyBox=l;toast("Kopieren ging nicht. Bitte nochmal versuchen.")}return}
  if(b.dataset.act==="backup"){const d={app:"Daheeme",at:new Date().toISOString(),config:S.config||null,weeks:S.weeks||{},food:S.food||{}};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,1)],{type:"application/json"}));a.download="daheeme-sicherung-"+ymd(new Date())+".json";document.body.appendChild(a);a.click();a.remove();toast("Sicherung gespeichert");return}
  if(b.dataset.act==="restorecancel"){S.restore=null;render();return}
  if(b.dataset.act==="restoredo"){const r=S.restore;if(!r)return;try{if(r.d.config)await S.store.saveConfig(r.d.config);await S.store.setPath("weeks",r.d.weeks||null);await S.store.setPath("food",r.d.food||null);S.restore=null;toast("Wiederhergestellt");render()}catch(_){toast("Wiederherstellen ging nicht. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="labels"){S.labels=!S.labels;try{localStorage.setItem("hq-labels",S.labels?"1":"")}catch(_){}render();return}
  if(b.dataset.wxfun){const F=WX_FUN.find(x=>x[0]===b.dataset.wxfun);if(F){S.atipWX=F[4]||"";S.atipC=F[5]||"";S.atipIO="";S.atipZ="woche";S.wxPop=false;S.tFold=S.tFold||{};S.tFold.fix_immer=true;S.tFold["fix_"+season()]=true;goNav("ausflug|tt:ideen");toast(F[1]+" "+F[2]+": passende Ausflüge")}return}
  if(b.dataset.act==="wxpop"){S.wxPop=!S.wxPop;S.flip=false;render();return}
  if(b.dataset.wpage!=null){setWeekPage(+b.dataset.wpage);return}
  if(b.dataset.calm!=null){const n=+b.dataset.calm,c=S.calMonth||new Date(new Date().getFullYear(),new Date().getMonth(),1,12);S.calMonth=n===0?null:new Date(c.getFullYear(),c.getMonth()+n,1,12);if(n===0)S.calDay=null;render();return}
  if(b.dataset.calday){S.calDay=b.dataset.calday;if(b.dataset.calview){S.calView="monat";const d=ymdD(b.dataset.calday);S.calMonth=new Date(d.getFullYear(),d.getMonth(),1,12)}render();return}
  if(b.dataset.musfilter!=null&&!b.dataset.go){S.musFilter=b.dataset.musfilter;render();return}
  if(b.dataset.musfav){const m=musics().find(x=>x.id===b.dataset.musfav);if(m)try{await S.store.setPath("food/music/"+m.id+"/fav",m.fav?null:true)}catch(_){}return}
  if(b.dataset.musedit){const m=musics().find(x=>x.id===b.dataset.musedit);if(m){S.musDraft={id:m.id,name:m.name||"",link:m.link||"",occ:m.occ||"",note:m.note||"",emo:m.emo||""};render();window.scrollTo(0,0)}return}
  if(b.dataset.musocc&&S.musDraft){const o=csv(S.musDraft.occ),k=b.dataset.musocc;S.musDraft.occ=(o.includes(k)?o.filter(x=>x!==k):o.concat(k)).join(",");render();return}
  if(b.dataset.act==="musoccadd"&&S.musDraft){const f=b.closest(".fld"),ic=(f.querySelector("[data-musnewic]").value||"").trim().slice(0,8)||"🎵",nm=(f.querySelector("[data-musnewnm]").value||"").trim().slice(0,30);if(!nm){toast("Bitte einen Namen für die Rubrik eintragen.");return}
    if(musOcc().some(o=>o[2].toLowerCase()===nm.toLowerCase())){toast("Die Rubrik gibt es schon.");return}const id=newId("o");try{await S.store.setPath("food/musocc/"+id,{ic,name:nm,at:Date.now()});S.musDraft.occ=csv(S.musDraft.occ).concat(id).join(",");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.musoccrm){const k=b.dataset.musoccrm,o=musOcc().find(x=>x[0]===k);if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich?";return}
    try{await S.store.setPath("food/musocc/"+k,null);for(const m of musics())if(csv(m.occ).includes(k))await S.store.setPath("food/music/"+m.id+"/occ",csv(m.occ).filter(x=>x!==k).join(",")||null);if(S.musDraft)S.musDraft.occ=csv(S.musDraft.occ).filter(x=>x!==k).join(",");if(S.musFilter===k)S.musFilter="";toast("Rubrik "+(o?o[2]:"")+" gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="muscancel"){S.musDraft=null;render();return}
  if(b.dataset.act==="musdel"&&S.musDraft&&S.musDraft.id){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}try{await S.store.setPath("food/music/"+S.musDraft.id,null);S.musDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="mussave"&&S.musDraft){const d=S.musDraft,u=safeLink(d.link),name=((d.name||"").trim()||(u?musName(u):"")).slice(0,80);if(!name){toast("Bitte Name oder Link eintragen");return}const id=d.id||newId("m");
    try{await S.store.setPath("food/music/"+id,{name,link:u||null,svc:u?musSvc(u)[0]:null,occ:d.occ||null,emo:String(d.emo||"").trim().slice(0,8)||null,note:(d.note||"").trim().slice(0,120)||null,fav:(musics().find(x=>x.id===id)||{}).fav||null,at:(musics().find(x=>x.id===id)||{}).at||Date.now(),by:S.me||""});S.musDraft=null;toast("Gespeichert");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.calview){S.calView=b.dataset.calview;try{localStorage.setItem("hq-calview2",S.calView)}catch(_){}render();return}
  if(b.dataset.caloffall!=null){S.calOff=b.dataset.caloffall==="1"?[]:CAL_LBL.map(l=>l[0]);try{localStorage.setItem("hq-caloff",JSON.stringify(S.calOff))}catch(_){}render();return}
  if(b.dataset.fwmap){try{await S.store.setPath("food/ext/fwmap/"+b.dataset.fwmap,b.dataset.v||null)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.fwkwrm){try{await S.store.setPath("food/ext/fwkw/"+b.dataset.fwkwrm,null)}catch(_){}return}
  if(b.dataset.fwpick){const id=b.dataset.fwpick,fw=S.food&&S.food.ext&&S.food.ext.fw,x=fw&&fw.items&&fw.items[id];if(!x)return;const cur=((S.food.ext.fwwho||{})[id])||"",X=((S.food.ext.fwx||{})[id])||{},pl=X.place&&placeFind(X.place)?placeFind(X.place).name:"";
    // Familywall-Termin (Florian 16.11.2026): Titel und Zeit nur in Familywall; Für wen, Art, Ort und Erinnern ergänzt die App (food/ext/fwx/<id>)
    editBox("„"+x.name+"“",[{k:"note",type:"note",label:rDate(x.date)+(x.time?" "+x.time:"")+(x.place?" · "+x.place:"")+". Aus Familywall: Titel und Zeit ändern geht nur dort."},{k:"who",label:"Für wen (mehrere gehen)",type:"multi",excl:["","both"],opts:[["","Automatisch"]].concat(whoOpts()),val:!cur?[""]:cur==="both"?["both"]:whoL(cur)},
      {k:"tag",label:"Art",type:"chips",opts:[["","Keine"]].concat(terTags().map(t=>[t[0],t[1]+" "+t[2]])),val:X.tag||""},
      {k:"pl",label:"Ort"+(x.place?" (sonst wie in Familywall)":""),type:"chips",opts:[["",x.place?"Wie in Familywall":"Keiner"]].concat(places().map(p=>[p.name,"📍 "+p.name])),val:pl},
      {k:"plx",label:"Oder Adresse nur für diesen Termin",type:"text",val:X.place&&!pl?X.place:""},
      {k:"remind",label:"🔔 Erinnern",type:"chips",opts:[["","Nein"],["tag","Am Tag"],["1d","1 Tag vorher"],["1h","1 Stunde vorher"]],val:X.remind===true?"tag":X.remind||""},
      {k:"kw",label:"Optional: Für-wen-Regel für alle Termine mit diesem Wort im Titel",type:"text",val:""}],
      async V=>{const W=V.who||[],who=W.includes("both")?"both":WHO_ORD.filter(x=>W.includes(x)).join(",");await S.store.setPath("food/ext/fwwho/"+id,who||null);const kw=String(V.kw||"").trim().slice(0,40);if(kw&&who)await S.store.setPath("food/ext/fwkw/"+newId("k"),{kw,who});
        const place=String(V.plx||"").trim().slice(0,160)||V.pl||null,rm=V.remind==="tag"?true:V.remind||null;await S.store.setPath("food/ext/fwx/"+id,V.tag||place||rm?{tag:V.tag||null,place,remind:rm}:null);toast("Gespeichert");render()},
      [["🙈 In der App ausblenden (auch Wiederholungen)",async()=>{await S.store.setPath("food/ext/fwhide/"+fwHideKey(x.name),{name:String(x.name).slice(0,80),at:Date.now()});toast("Ausgeblendet. Zurückholen unter Kalender › Bereiche.")},false]]);return}
  if(b.dataset.fwunhide){try{await S.store.setPath("food/ext/fwhide/"+b.dataset.fwunhide,null);toast("Wird wieder gezeigt")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.calw!=null){const n=+b.dataset.calw;S.calDay=n===0?null:ymd(addDays(ymdD(S.calDay||ymd(new Date())),n));render();return}
  if(b.dataset.act==="calfilt"){S.calFiltOpen=!S.calFiltOpen;render();return}
  if(b.dataset.caloff){const o=S.calOff||[],k=b.dataset.caloff;S.calOff=o.includes(k)?o.filter(x=>x!==k):o.concat(k);try{localStorage.setItem("hq-caloff",JSON.stringify(S.calOff))}catch(_){}render();return}
  if(b.dataset.calwho!=null){S.calWho=b.dataset.calwho;render();return}
  if(b.dataset.act==="ternewgo"){S.prev=S.tab;S.tab="woche";S.weekPage=3;S.calDay=null;b.dataset.act="ternew"}
  if(b.dataset.calnew){S.calDay=b.dataset.calnew;S.terDraft={id:null,name:"",date:b.dataset.calnew,time:"",who:"both",rep:"",note:""};render();window.scrollTo(0,0);const el=document.getElementById("ter-name");if(el)el.focus();return}
  if(b.dataset.act==="ternew"){S.terDraft={id:null,name:"",date:S.calDay||ymd(new Date()),time:"",who:"both",rep:"",note:""};render();window.scrollTo(0,0);const el=document.getElementById("ter-name");if(el)el.focus();return}
  if(b.dataset.teredit){const x=termine().find(y=>y.id===b.dataset.teredit);if(x){S.terDraft=terDraftOf(x);render();window.scrollTo(0,0)}return}
  if(b.dataset.act==="teraltadd"&&S.terDraft){const d=S.terDraft;d.alt=d.alt||[];if(!d.alt.length&&!d.ask)d.ask=choiceOther(S.me)||"p1";d.alt.push({date:"",time:d.time||""});render();const l=document.querySelectorAll("[data-teralt][data-k=date]");if(l.length)l[l.length-1].focus();return}
  if(b.dataset.act==="terallday"&&S.terDraft){const d=S.terDraft;d.allday=!d.allday;render();return}
  if(b.dataset.teraltrm!=null&&S.terDraft){S.terDraft.alt.splice(+b.dataset.teraltrm,1);render();return}
  if(b.dataset.tertag!=null&&S.terDraft){const d=S.terDraft;d.tag=b.dataset.tertag;const t=terTag(d);if(t&&!String(d.place||"").trim()&&placeFind(t[2]))d.place=placeFind(t[2]).name;render();return}
  if(b.dataset.placeset!=null){const D=S.tripDraft||S.terDraft;if(D){D.place=b.getAttribute("aria-pressed")==="true"?"":b.dataset.placeset;render()}return}
  if(b.dataset.placenew!=null){placeEdit(null,b.dataset.placenew);return}
  if(b.dataset.placeask){placeAsk(b.dataset.placeask);return}
  if(b.dataset.placeedit){placeEdit(b.dataset.placeedit);return}
  if(b.dataset.terask!=null&&S.terDraft){S.terDraft.ask=b.dataset.terask;render();return}
  if(b.dataset.act==="pushtoggle"){try{await pushToggle()}catch(_){toast("Hat nicht geklappt.")}return}
  if(b.dataset.act==="pushtest"){pushTest();return}
  if(b.dataset.chopen){const [k,id]=b.dataset.chopen.split("|");choiceOpen(k,id);return}
  if(b.dataset.chseen){const [k,id]=b.dataset.chseen.split("|");try{await choiceSet(k,id,{["told/seen/"+(S.me||"x")]:true})}catch(_){toast("Konnte nicht speichern.")}render();return}
  if(b.dataset.terwho){S.terDraft.who=whoToggle(S.terDraft.who,b.dataset.terwho);render();return}
  if(b.dataset.terrem!=null&&S.terDraft){S.terDraft.remind=b.dataset.terrem==="tag"?true:b.dataset.terrem||null;render();return}
  if(b.dataset.terrep!=null&&S.terDraft){S.terDraft.rep=b.dataset.terrep;render();return}
  if(b.dataset.act==="tercancel"){S.terDraft=null;render();return}
  if(b.dataset.terbell){const x=termine().find(y=>y.id===b.dataset.terbell);if(x){try{await S.store.setPath("food/termin/"+x.id+"/remind",x.remind?null:true);toast(x.remind?"Keine Erinnerung mehr":"Die Glocke erinnert daran")}catch(_){toast("Konnte nicht speichern.")}}return}
  if(b.dataset.terrm){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Löschen?";return}try{await S.store.setPath("food/termin/"+b.dataset.terrm,null);await prioDropRef([b.dataset.terrm]);if(S.terDraft&&S.terDraft.id===b.dataset.terrm)S.terDraft=null;toast("Termin gelöscht")}catch(_){toast("Konnte nicht speichern.")}render();return}
  if(b.dataset.prio){const [from,id]=b.dataset.prio.split("|"),ex=prioOf(from,id);try{if(ex){await S.store.setPath("food/prio/"+ex.id,null);toast("Nicht mehr auf der Startseite")}else{const x=prioSrc(from,id);if(!x)return;const nid=newId("w"),v=Object.assign({name:String(x.name).slice(0,80),from,ref:id,at:Date.now(),by:S.me||""},from==="kita"&&x.date?{due:x.date}:{});await S.store.setPath("food/prio/"+nid,v);toastAct("🔔 Steht jetzt bei Wichtig.","⏰ Tag und Zeit",()=>prioNew(PRIO_FROM[from]?(from==="rezepte"||from==="mittag"?"essen":from):"frei",{id:nid,name:v.name,ref:id,due:v.due||"",time:"",rep:"",note:"",at:v.at,by:v.by}))}}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.priodone){const x=prios().find(y=>y.id===b.dataset.priodone);if(x&&x.rep&&x.due){const base=new Date(x.due+"T12:00:00");let nx=repNext(base,x.rep);const t0=startOfDay(new Date());while(nx<t0)nx=repNext(nx,x.rep);try{await S.store.setPath("food/prio/"+x.id+"/due",ymd(nx));toast("Erledigt. Nächstes Mal: "+dLabel(ymd(nx)))}catch(_){toast("Konnte nicht speichern.")}return}try{await S.store.setPath("food/prio/"+b.dataset.priodone,null);if(S.prioEdit===b.dataset.priodone)S.prioEdit=null;toast("Erledigt")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.prioedit){const x=prios().find(y=>y.id===b.dataset.prioedit);if(!x)return;prioNew(x.from&&PRIO_FROM[x.from]?(x.from==="rezepte"||x.from==="mittag"?"essen":x.from):"frei",{id:x.id,name:x.name,ref:x.ref||"",due:x.due||"",time:x.time||"",rep:x.rep||"",note:x.note||"",who:x.who||"",at:x.at,by:x.by});return}
  if(b.dataset.act==="priosave"||b.dataset.act==="prioclear"){const id=S.prioEdit;if(!id)return;const clr=b.dataset.act==="prioclear",dv=clr?"":(document.getElementById("pr-date")||{}).value||"",tv=clr?"":(document.getElementById("pr-time")||{}).value||"";S.prioEdit=null;try{await S.store.setPath("food/prio/"+id+"/due",dv||null);await S.store.setPath("food/prio/"+id+"/time",dv&&tv?tv:null);toast(dv?"Erinnerung gesetzt":"Erinnerung entfernt")}catch(_){toast("Konnte nicht speichern.")}render();return}
  if(b.dataset.go==="post"){mboxTap();return}
  if(b.dataset.go==="suche"){S.prev=S.tab;S.tab="suche";render();window.scrollTo(0,0);const el=document.getElementById("sq");if(el)el.focus();return}
  if(b.dataset.go){const fw=focusWeek();S.prev=S.tab;S.tab=b.dataset.go;if(S.tab==="reisen"||S.tab==="ausflug"){S.reiseOpen=null;S.tripTab=S.tab==="reisen"?"urlaub":"ideen"}if(S.tab==="woche")S.weekPage=0;if(S.tab==="essen")S.foodTab="heute";if(S.tab==="kita")S.kitaSec="termine";if(S.tab==="musik")S.musFilter=b.dataset.musf||"";S.tripDraft=S.projDraft=S.playDraft=S.kitaDraft=null;S.hprojOpen=null;S.hsamm=false;if(S.tab==="projekte"||S.tab==="amhaus")S.projFilter=b.dataset.pf||"";if(b.dataset.ft&&b.dataset.ft!=="shop"){S.foodTab=b.dataset.ft;try{localStorage.setItem("hq-foodtab",S.foodTab)}catch(_){}}S.draft=null;focusApply(fw);render();window.scrollTo(0,0);return}
  if(b.dataset.kitasec){S.kitaDraft=null;S.kitaSec=b.dataset.kitasec;render();return}
  if(b.dataset.kset){const d=S.kitaDraft;if(d){const f=b.dataset.kset;d[f]=d[f]===b.dataset.v?"":b.dataset.v;render()}return}
  if(b.dataset.act==="kitaimp"){S.kitaImp=S.kitaImp?null:{text:"",list:null};render();return}
  if(b.dataset.act==="kimpcancel"){S.kitaImp=null;render();return}
  if(b.dataset.act==="kimpback"&&S.kitaImp){S.kitaImp.list=null;render();return}
  if(b.dataset.act==="kimpparse"&&S.kitaImp){const ta=document.getElementById("kimp-text"),fi=document.getElementById("kimp-file");const t=ta?ta.value:"";S.kitaImp.text=t;let L=parseKitaTermine(t);
    try{if(fi&&fi.files&&fi.files[0])L=L.concat(parseKitaTermine(await fi.files[0].text()))}catch(_){}
    const have=new Set(kitas().map(x=>(x.name||"").trim().toLowerCase()+"|"+x.date));S.kitaImp.list=L.map(x=>{const dup=have.has(x.name.trim().toLowerCase()+"|"+x.date);return Object.assign(x,{dup,on:!dup})});render();return}
  if(b.dataset.kimptog&&S.kitaImp&&S.kitaImp.list){const x=S.kitaImp.list[+b.dataset.kimptog];if(x)x.on=!x.on;render();return}
  if(b.dataset.act==="kimpsave"&&S.kitaImp&&S.kitaImp.list){const L=S.kitaImp.list.filter(x=>x.on);try{for(const x of L){const v={name:x.name,sec:"termine",date:x.date,at:Date.now(),by:S.me||""};if(x.kind)v.kind=x.kind;if(x.note)v.note=x.note;await S.store.setPath("food/kita/"+newId("c"),v)}S.kitaImp=null;toast(L.length+" Termine übernommen");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="kitanew"){S.kitaDraft={id:null,sec:S.kitaSec,name:"",date:"",kind:"",note:""};render();window.scrollTo(0,0);const el=document.getElementById("ki-name");if(el)el.focus();return}
  if(b.dataset.kitaedit){const x=kitas().find(y=>y.id===b.dataset.kitaedit);if(x){S.kitaDraft={id:x.id,sec:x.sec||"termine",name:x.name||"",date:x.date||"",kind:x.kind||"",note:x.note||""};render();window.scrollTo(0,0)}return}
  if(b.dataset.act==="kitacancel"){S.kitaDraft=null;render();return}
  if(b.dataset.act==="kitasave"){const d=S.kitaDraft,name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte einen Titel eintragen");return}
    const id=d.id||newId("c"),base="food/kita/"+id+"/";
    try{await S.store.setPath(base+"name",name);await S.store.setPath(base+"sec",d.sec);await S.store.setPath(base+"date",/^\d{4}-\d{2}-\d{2}$/.test(d.date||"")?d.date:null);await S.store.setPath(base+"kind",d.kind||null);await S.store.setPath(base+"note",(d.note||"").trim().slice(0,2000)||null);if(!d.id)await S.store.setPath(base+"at",Date.now());S.kitaDraft=null;toast("Gespeichert");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="kitadel"){try{const nm=S.kitaDraft.name;await S.store.setPath("food/kita/"+S.kitaDraft.id,null);S.kitaDraft=null;render();offerShopRemove("Gelöscht.",kitaShopOf(nm))}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.kitaadd){kitaAdd(b.dataset.kitaadd);return}
  if(b.dataset.suggedit){S.suggEdit=S.suggEdit===b.dataset.suggedit?null:b.dataset.suggedit;render();return}
  if(b.dataset.sugghide){const [l,...n]=b.dataset.sugghide.split("|");suggHide(l,n.join("|"));return}
  if(b.dataset.suggreset){const l=b.dataset.suggreset,raw=suggRaw(l);try{for(const [k,v] of Object.entries(raw))if(v&&v.hide)await S.store.setPath("food/sugg/"+l+"/"+k,null)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.kitatick){const x=kitas().find(y=>y.id===b.dataset.kitatick);if(x){try{await S.store.setPath("food/kita/"+x.id+"/done",!x.done)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}}return}
  if(b.dataset.kitashop){const x=kitas().find(y=>y.id===b.dataset.kitashop);if(x){const r=await shopAddMany([x.name],KITA_SRC,{force:true,quiet:true});if(r&&!r.err){toast("Steht auf der Einkaufsliste");render()}}return}
  if(b.dataset.act==="kitashopall"){const L=kitaBring().map(x=>x.name);if(L.length)openPick([{src:KITA_SRC,lines:L}]);return}
  if(b.dataset.act==="kitaremind"){const L=kitaBring().map(x=>x.name),due=ymd(addDays(new Date(),1)),ex=prios().find(x=>x.ref==="kitabag"),v={name:"Kita mitnehmen: "+L.join(", ").slice(0,70),from:"kita",ref:"kitabag",due,time:"07:30",at:Date.now(),by:S.me||""};try{await S.store.setPath("food/prio/"+(ex?ex.id:newId("p")),v);toast("Erinnerung morgen 7:30, steht unter Wichtig");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.cleanshop){cleanPick(tasks().find(t=>t.id===b.dataset.cleanshop));return}
  if(b.dataset.kitarm){try{const it=((S.food&&S.food.kita)||{})[b.dataset.kitarm];await S.store.setPath("food/kita/"+b.dataset.kitarm,null);if(it)offerShopRemove("Entfernt.",kitaShopOf(it.name))}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="kitamealedit"){S.kitaEdit=!S.kitaEdit;render();return}
  if(b.dataset.act==="kitamealsave"){const wk=wkKey(planWeek());const gv=id=>{const el=document.getElementById(id);return (el?el.value:"").trim().slice(0,120)};const F=[["text","ke-d"],["fr","ke-fr"],["na","ke-na"],["bz","ke-bz"]];const vals=[0,1,2,3,4].map(i=>F.map(([k,id])=>[k,gv(id+i)]));try{for(let i=0;i<5;i++){for(const [k,v] of vals[i])await S.store.setPath("food/kitaplan/"+wk+"/d"+i+"/"+k,v||null);await S.store.setPath("food/kitaplan/"+wk+"/d"+i+"/at",Date.now())}S.kitaEdit=false;render();toast("Kita-Essen gespeichert")}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="kitaplanimport"){const el=document.getElementById("kitaplantext"),p=parseKitaPlan(el?el.value:"");if(!p){toast("Kein Speiseplan erkannt. Steht ein Datum wie 16.11. und Montag bis Freitag drin?");return}
    const wk=wkKey(p.mon);try{for(const k of Object.keys(p.days))await S.store.setPath("food/kitaplan/"+wk+"/"+k,Object.assign({at:Date.now()},p.days[k]));S.foodWeek=+p.mon===+mondayOf(new Date())?null:p.mon;toast("Speiseplan für KW "+isoWeek(p.mon).w+" übernommen");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="kitareset"){for(const i of kitas().filter(x=>x.sec==="tasche"&&x.done)){try{await S.store.setPath("food/kita/"+i.id+"/done",false)}catch(_){}}return}
  if(b.dataset.act==="plmaptoggle"){S.playMapOpen=!S.playMapOpen;render();return}
  if(b.dataset.act==="plmapedit"){S.playMapEdit=true;S.playMapText=(S.food&&S.food.playmap)||"";render();const el=document.getElementById("pl-mapurl");if(el)el.focus();return}
  if(b.dataset.act==="plmapcancel"){S.playMapEdit=false;render();return}
  if(b.dataset.act==="plmapsave"){const el=document.getElementById("pl-mapurl"),u=(el?el.value:S.playMapText).trim();if(u&&!mapOk(u)){toast("Das ist kein Link aus Google Maps.");return}
    try{await S.store.setPath("food/playmap",u||null);S.playMapEdit=false;S.playMapOpen=!!mapsEmbed(u);render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.playsec){S.playDraft=null;S.playSec=b.dataset.playsec;render();return}
  if(b.dataset.plset){const d=S.playDraft;if(d){const f=b.dataset.plset;d[f]=d[f]===b.dataset.v?"":b.dataset.v;render()}return}
  if(b.dataset.playfav){const x=plays().find(y=>y.id===b.dataset.playfav);if(x){try{await S.store.setPath("food/play/"+x.id+"/fav",x.fav?null:true)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}}return}
  if(b.dataset.act==="playnew"){S.playDraft={id:null,sec:S.playSec,name:"",note:"",link:"",age:"",wx:"",mat:"",when:""};render();window.scrollTo(0,0);const el=document.getElementById("pl-name");if(el)el.focus();return}
  if(b.dataset.playedit){const x=plays().find(y=>y.id===b.dataset.playedit);if(x){S.playDraft={id:x.id,sec:(x.sec==="links"?"sonst":x.sec)||"spielplatz",emo:x.emo||"",name:x.name||"",note:x.note||"",link:x.link||"",age:x.age||"",wx:x.wx||"",mat:x.mat||"",when:x.when||""};render();window.scrollTo(0,0)}return}
  if(b.dataset.act==="playcancel"){S.playDraft=null;render();return}
  if(b.dataset.act==="playsave"){const d=S.playDraft,name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte einen Namen eintragen");return}
    const id=d.id||newId("s"),base="food/play/"+id+"/";
    try{await S.store.setPath(base+"name",name);await S.store.setPath(base+"emo",emoClean(d.emo));await S.store.setPath(base+"sec",d.sec);for(const k of ["age","wx"])await S.store.setPath(base+k,d[k]||null);for(const k of ["mat","when"])await S.store.setPath(base+k,(d[k]||"").trim().slice(0,120)||null);await S.store.setPath(base+"link",safeLink(d.link)||null);await S.store.setPath(base+"note",(d.note||"").trim().slice(0,600)||null);if(!d.id){await S.store.setPath(base+"at",Date.now());await S.store.setPath(base+"by",S.me||"")}S.playDraft=null;toast("Gespeichert");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="playdel"){try{await S.store.setPath("food/play/"+S.playDraft.id,null);S.playDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.pset){const d=S.projDraft;if(d){const f=b.dataset.pset;d[f]=d[f]===b.dataset.v?"":b.dataset.v;render()}return}
  if(b.dataset.hproj){S.tab="amhaus";S.projFilter=hprojCat(hprojs().find(x=>x.id===b.dataset.hproj));S.hprojOpen=b.dataset.hproj;S.hsamm=false;render();window.scrollTo(0,0);return}
  if(b.dataset.act==="hsamm"){S.hsamm=true;S.hprojOpen=null;render();window.scrollTo(0,0);return}
  if(b.dataset.act==="hsammback"||b.dataset.act==="hprojback"){S.hsamm=false;S.hprojOpen=null;render();window.scrollTo(0,0);return}
  if(b.dataset.act==="hprojnew"){const id=newId("h");try{const cat=HCAT[S.projFilter]?S.projFilter:"wohnen";await S.store.setPath("food/hproj/"+id,{name:"Neues Projekt",emo:HCAT[cat][1],cat,state:"aktuell",at:Date.now(),by:S.me||""});S.hprojOpen=id;render();window.scrollTo(0,0);const el=document.querySelector('[data-hpf=name]');if(el){el.focus();el.select()}}catch(_){toast("Konnte nicht speichern.")}return}
  if(S.hprojOpen&&(b.dataset.hpemo||b.dataset.hpst||b.dataset.act==="hprojdel")){const base="food/hproj/"+S.hprojOpen+"/";
    if(b.dataset.hpemo){await S.store.setPath(base+"emo",b.dataset.hpemo).catch(()=>{});return}
    if(b.dataset.hpst){try{await S.store.setPath(base+"state",b.dataset.hpst);toast("Stand: "+hpSt({state:b.dataset.hpst})[2])}catch(_){toast("Konnte nicht speichern.")}return}
    if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}try{for(const f of funde("haus").filter(f=>f.proj===S.hprojOpen))await S.store.setPath("food/fund/"+f.id+"/proj",null);const hid=S.hprojOpen;await splitDropRef("hproj:"+hid);await prioDropRef([hid]);await S.store.setPath("food/hproj/"+hid,null);S.hprojOpen=null;toast("Projekt gelöscht, Funde bleiben in der Sammlung");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.advgo){S.prev=S.tab;S.tab="projekte";S.projFilter="advent";S.advCal=b.dataset.advgo;S.advDoor=null;render();window.scrollTo(0,0);return}
  if(b.dataset.advcal){S.advCal=b.dataset.advcal;S.advDoor=null;render();return}
  if(b.dataset.advnew){const [w,k]=b.dataset.advnew.split("|");advNew(w,k);return}
  if(b.dataset.advdoor){const d=+b.dataset.advdoor,c=advCur();if(c&&c.for===S.me&&c.for!=="kid"){toast(advHidden(c,d)?"Türchen "+d+" öffnet sich am "+d+". Dezember.":"Türchen "+d+": "+((advDoors(c.id)[d]||{}).name||"leer"));return}S.advDoor=S.advDoor===d?null:d;render();if(S.advDoor){const i=document.querySelector("[data-advname]");if(i&&!i.value)i.focus()}return}
  if(b.dataset.advkind||b.dataset.advst){const c=advCur();if(c&&S.advDoor){advSet(c,S.advDoor,b.dataset.advkind?{kind:b.dataset.advkind}:{st:b.dataset.advst});if(b.dataset.advst==="besorgt"){const x=advDoors(c.id)[S.advDoor]||{};geldBought({name:"Türchen "+S.advDoor+(x.name?": "+x.name:""),cat:"geschenk",amt:priceCent(x.price),ref:"adoor:"+c.id+"_"+S.advDoor,grp:""})}if(b.dataset.advkind==="klein"&&shopItems().some(i=>!i.done&&i.src===advSrc(S.advDoor))){shopRemoveBlock(advSrc(S.advDoor));toast("Steht jetzt bei Spielsachen statt auf der Einkaufsliste")}}return}
  if(b.dataset.advclear){const c=advCur(),d=+b.dataset.advclear;if(c){await advSet(c,d,{name:""});S.advDoor=null;render();offerShopRemove("Türchen "+d+" geleert.",shopItems().filter(i=>i.src===advSrc(d)))}return}
  if(b.dataset.advsugg){const c=advCur();if(!c)return;const D=advDoors(c.id);let d=S.advDoor&&!D[S.advDoor]?S.advDoor:0;if(!d){d=1;while(D[d]&&d<=24)d++}if(d>24){toast("Alle 24 Türchen sind voll.");return}await advSet(c,d,{name:b.dataset.advsugg,kind:advKind(b.dataset.advsugg)});suggRemember("advent",b.dataset.advsugg);S.advDoor=null;render();return}
  if(b.dataset.advshop){const c=advCur(),x=c&&advDoors(c.id)[+b.dataset.advshop];if(x)openPick([{src:advSrc(x.day),lines:advNeed(x)}]);return}
  if(b.dataset.advshopsee){S.shopFilter=advSrc(+b.dataset.advshopsee);S.prev=S.tab;S.tab="einkauf";render();window.scrollTo(0,0);return}
  if(b.dataset.act==="advshopall"){const c=advCur();if(!c)return;const B=Object.values(advDoors(c.id)).filter(x=>x.st==="idee"&&advNeed(x).length&&(x.kind||advKind(x.name))!=="klein").sort((a,b)=>a.day-b.day).map(x=>({src:advSrc(x.day),lines:advNeed(x)}));if(!B.length){toast("Bei keinem offenen Türchen steht etwas zum Einkaufen.");return}openPick(B);return}
  if(b.dataset.advtrip){const c=advCur(),d=+b.dataset.advtrip,x=c&&advDoors(c.id)[d];if(!x)return;const id=newId("t");try{await S.store.setPath("food/trip/"+id,{name:x.name,date:(c.year||advYear())+"-12-"+String(d).padStart(2,"0"),note:"🎄 Adventskalender, Türchen "+d,adv:c.id,done:false,at:Date.now(),by:S.me||""});await advSet(c,d,{trip:id});toast("Ausflug angelegt, steht im Kalender");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.advrec){S.prev=S.tab;S.tab="suche";S.sq=b.dataset.advrec;render();window.scrollTo(0,0);return}
  if(b.dataset.advprio){const c=advCur(),d=+b.dataset.advprio,x=c&&advDoors(c.id)[d];if(!x)return;const due=ymd(addDays(new Date(c.year||advYear(),11,d),-1));prioNew("projekte",{name:"Türchen "+d+": "+x.name,ref:"advent:"+c.id,due:due>ymd(new Date())?due:""});return}
  if(b.dataset.act==="advfill"){const c=advCur();if(c)advFill(c);return}
  if(b.dataset.act==="advpaste"){S.advPaste=S.advPaste!=null?null:"";render();if(S.advPaste!=null){const t=document.getElementById("advtext");if(t)t.focus()}return}
  if(b.dataset.act==="advpastecancel"){S.advPaste=null;render();return}
  if(b.dataset.act==="advpasteok"){const c=advCur(),t=document.getElementById("advtext");if(c&&t)advPick(c,t.value);return}
  if(b.dataset.act==="advdel"){const c=advCur();if(!c)return;if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Wirklich löschen?";return}try{for(const x of Object.values(advDoors(c.id)))await S.store.setPath("food/adoor/"+x.id,null);await S.store.setPath("food/advent/"+c.id,null);await prioDropRef(["advent:"+c.id,c.id]);const days=Object.values(advDoors(c.id)).map(x=>advSrc(x.day));S.advCal=null;S.advDoor=null;render();offerShopRemove("Kalender gelöscht.",shopItems().filter(i=>days.includes(i.src)))}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.pfilter!=null){S.projFilter=b.dataset.pfilter;S.hprojOpen=null;S.hsamm=false;S.projText="";render();window.scrollTo(0,0);return}
  if(b.dataset.projstate){const x=projs().find(y=>y.id===b.dataset.projstate);if(x){const i=PROJ_STATE.findIndex(s=>s[0]===x.state),nx=PROJ_STATE[((i<0?0:i)+1)%PROJ_STATE.length][0];try{await S.store.setPath("food/idea/"+x.id+"/state",nx==="idee"?null:nx)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}}return}
  if(b.dataset.proj2hp){const x=projs().find(y=>y.id===b.dataset.proj2hp);if(!x)return;const c=projCat(x),id=newId("h");try{await S.store.setPath("food/hproj/"+id,{name:x.name,emo:HCAT[c][1],cat:c,state:"aktuell",note:x.note||"",at:Date.now(),by:S.me||""});await S.store.setPath("food/idea/"+x.id,null);S.tab="amhaus";S.projFilter=c;S.hprojOpen=id;S.hsamm=false;toast("Projekt angelegt");render();window.scrollTo(0,0)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.projdone){const x=projs().find(y=>y.id===b.dataset.projdone);if(x){try{await S.store.setPath("food/idea/"+x.id+"/done",!x.done);await S.store.setPath("food/idea/"+x.id+"/doneAt",x.done?null:Date.now());if(!x.done&&projCat(x)==="geschenk")geldBought({name:x.name,cat:"geschenk",ref:"idea:"+x.id})}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}}return}
  if(b.dataset.projedit){const x=projs().find(y=>y.id===b.dataset.projedit);if(x){S.projDraft={id:x.id,emo:x.emo||"",name:x.name||"",cat:x.cat||"",state:x.state||"",who:x.who||"",for:x.for||"",link:x.link||"",note:x.note||""};render();window.scrollTo(0,0)}return}
  if(b.dataset.act==="projcancel"){S.projDraft=null;render();return}
  if(b.dataset.act==="projsave"){const d=S.projDraft,name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte kurz eintragen, worum es geht");return}
    const base="food/idea/"+d.id+"/";
    try{await S.store.setPath(base+"name",name);await S.store.setPath(base+"emo",d.cat==="geschenk"?emoClean(d.emo):null);for(const k of ["cat","state"])await S.store.setPath(base+k,d[k]||null);await S.store.setPath(base+"for",d.cat==="geschenk"?((d.for||"").trim().slice(0,60)||null):null);await S.store.setPath(base+"who",d.cat==="geschenk"?(d.who||null):null);await S.store.setPath(base+"link",safeLink(d.link)||null);await S.store.setPath(base+"note",(d.note||"").trim().slice(0,1000)||null);S.projDraft=null;toast("Gespeichert");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="projdel"){try{await S.store.setPath("food/idea/"+S.projDraft.id,null);S.projDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.priv){S.privSec=b.dataset.priv;S.lunchDraft=null;render();return}
  if(b.dataset.kidwk!=null){S.kidWk=Math.max(-1,Math.min(2,+b.dataset.kidwk));render();return}
  if(b.dataset.kidset){const [wk,i,f]=b.dataset.kidset.split("|");kidPick(wk,+i,f);return}
  if(b.dataset.kidbrought!=null){const i=+b.dataset.kidbrought,cm=mondayOf(new Date()),wk=wkKey(cm),dn=bringDone(wk,i);
    try{if(dn){await S.store.tick(wk,dn.key,null);return}const who=bhDay(cm,i).br.p,tk=ticksOf(wk),L=bringTasks().sort((a,b)=>(a.owner===who?0:1)-(b.owner===who?0:1));let key=null;
      for(const t of L){for(let j=0;j<slotsOf(t);j++)if(!tk[t.id+"__"+j]){key=t.id+"__"+j;break}if(key)break}
      if(!key){toast("Die Aufgabe Bringen ist diese Woche schon voll abgehakt.");return}await S.store.tick(wk,key,{by:who,at:Date.now(),day:i});toast(pname(who)+" hat gebracht")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.kidrule!=null){const mon=addDays(mondayOf(new Date()),7*(+b.dataset.kidrule)),wk=wkKey(mon),ov=(((S.food&&S.food.kid&&S.food.kid.bh)||{})[wk])||{},rl=kidRule(),r={br:[],ab:[]};
    for(let i=0;i<5;i++)for(const f of ["br","ab"])r[f].push((ov["d"+i]||{})[f]||rl[f][i]);
    try{await S.store.setPath("food/kid/rule",r);await S.store.setPath("food/kid/bh/"+wk,null);toast("Feste Woche gespeichert. Hausdienst geht weiter vor.")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.kidreset!=null){const wk=wkKey(addDays(mondayOf(new Date()),7*(+b.dataset.kidreset)));try{await S.store.setPath("food/kid/bh/"+wk,null)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.contactdel){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="Löschen?";return}S.store.setPath("food/contact/"+b.dataset.contactdel,null).then(()=>{toast("Nummer gelöscht");render()}).catch(()=>toast("Konnte nicht speichern."));return}
  if(b.dataset.contactrm){S.store.setPath("food/contacts/"+b.dataset.contactrm,null).catch(()=>toast("Konnte nicht speichern."));return}
  if(b.dataset.briefrm){S.store.setPath("food/brief/"+b.dataset.briefrm,null).catch(()=>toast("Konnte nicht speichern."));return}
  if(b.dataset.urlaubrm){const id=b.dataset.urlaubrm;try{for(const i of packs().filter(i=>i.list==="u_"+id))await S.store.setPath("food/pack/"+i.id,null);await S.store.setPath("food/packlist/u_"+id,null);await S.store.setPath("food/urlaub/"+id,null);await splitDropRef("urlaub:"+id);await prioDropRef([id])}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.wknav!=null){const n=+b.dataset.wknav;S.view=n===0?mondayOf(new Date()):addDays(S.view,7*n);S.wkEdit=null;render();return}
  if(b.dataset.nav!=null){if(b.dataset.calopen){S.calView=b.dataset.calopen;S.calDay=null;S.calMonth=null}goNav(b.dataset.nav);return}
  if(b.dataset.area){const a=ALL_AREAS[+b.dataset.area];if(!a)return;const o=a[2];S.prev=S.tab;S.tab=o.go;S.weekPage=o.wp||0;if(o.ft)S.foodTab=o.ft;if(o.tt)S.tripTab=o.tt;if(o.go==="projekte"||o.go==="amhaus")S.projFilter="";render();window.scrollTo(0,0);return}
  if(b.dataset.bild){try{localStorage.setItem("hq-bild",b.dataset.bild)}catch(_){}location.href=location.pathname+"?bild="+b.dataset.bild+location.hash;return}
  if(b.dataset.trip){S.tripDraft=null;S.reiseOpen=null;S.tripTab=b.dataset.trip;render();window.scrollTo(0,0);return}
  if(b.dataset.tset){const d=S.tripDraft;if(d){const f=b.dataset.tset;d[f]=d[f]===b.dataset.v?"":b.dataset.v;render()}return}
  if(b.dataset.ttog){const d=S.tripDraft;if(d){const f=b.dataset.ttog,a=csv(d[f]),v=b.dataset.v;d[f]=(a.includes(v)?a.filter(x=>x!==v):a.concat(v)).join(",");render()}return}
  if(b.dataset.tfilter!=null){S.tripFilter=b.dataset.tfilter;render();return}
  if(b.dataset.gopack){S.packList=b.dataset.gopack;S.tab="ausflug";S.tripTab="pack";S.reiseOpen=null;render();window.scrollTo(0,0);return}
  if(b.dataset.packlist){S.packList=b.dataset.packlist;S.packListNew=false;render();return}
  if(b.dataset.act==="packlistnew"){S.packListNew=!S.packListNew;render();const el=document.getElementById("packlistinput");if(el)el.focus();return}
  if(b.dataset.act==="packlistren"){const L=curPack();if(L.id==="main")return;const cur=(S.food.packlist||{})[L.id]||{};editBox("Packliste",[{k:"name",label:"Name",type:"text",val:L.name},{k:"emo",label:"Symbol (optional)",type:"text",val:cur.emo||""}],async V=>{const n=String(V.name||"").trim().slice(0,40);if(!n){toast("Bitte einen Namen eintragen.");return}await S.store.setPath("food/packlist/"+L.id,Object.assign({},cur,{name:n,emo:emoClean(V.emo)}));toast("Gespeichert")});return}
  if(b.dataset.act==="packlistdel"){const L=curPack();if(L.id==="main")return;try{for(const i of packs().filter(x=>x.list===L.id)){await buyDropRef("pack:"+i.id);await S.store.setPath("food/pack/"+i.id,null)}await S.store.setPath("food/packlist/"+L.id,null);S.packList="main";toast("Liste gelöscht")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.atipz){S.atipZ=b.dataset.atipz;render();return}
  if(b.dataset.atipc!=null){S.atipC=b.dataset.atipc;render();return}
  if(b.dataset.atipwx!=null){S.atipWX=b.dataset.atipwx;render();return}
  if(b.dataset.atipfree){S.atipFree=!S.atipFree;render();return}
  if(b.dataset.atipfeat){const k=b.dataset.atipfeat;S.atipF=Object.assign({},S.atipF);S.atipF[k]=!S.atipF[k];render();return}
  if(b.dataset.atiplk){S.atipLk=!S.atipLk;render();return}
  if(b.dataset.act==="gotasks"){goTasks(b.classList.contains("bring2")?"day":"");return}
  if(b.dataset.catman){catManage(b.dataset.catman);return}
  if(b.dataset.advren){const c=advCals().find(x=>x.id===b.dataset.advren);if(!c)return;editBox("Adventskalender",[{k:"name",label:"Name",type:"text",val:c.name},{k:"emo",label:"Symbol (optional)",type:"text",val:c.emo||""}],async V=>{const n=String(V.name||"").trim().slice(0,40);if(!n){toast("Bitte einen Namen eintragen.");return}await S.store.setPath("food/advent/"+c.id+"/name",n);await S.store.setPath("food/advent/"+c.id+"/emo",emoClean(V.emo));toast("Gespeichert")});return}
  if(b.dataset.tfold){const k=b.dataset.tfold;S.tFold=S.tFold||{};S.tFold[k]=!tFoldOn(k,b.dataset.tdef==="1");try{localStorage.setItem("hq-tfold",JSON.stringify(S.tFold))}catch(_){}render();return}
  if(b.dataset.atipopen!=null){const O=S.atipOpen||(S.atipOpen={}),k=b.dataset.atipopen;O[k]=!O[k];render();return}
  if(b.dataset.atipwo!=null){S.atipWO=atipTog(atipWO(),b.dataset.atipwo,ATIP_WO);render();return}
  if(b.dataset.atipio!=null){S.atipIO=atipTog(atipIOv(),b.dataset.atipio,ATIP_IO);render();return}
  if(b.dataset.tripcal){const x=trips().find(y=>y.id===b.dataset.tripcal);if(!x)return;calDayPick(x.name,x.date||nextSat(),async k=>{try{await S.store.setPath("food/trip/"+x.id+"/date",k);toast("Steht am "+rDate(k)+" im Kalender")}catch(_){toast("Konnte nicht speichern.")}});return}
  if(b.dataset.atipcal){const i=S.atipps&&S.atipps.items[+b.dataset.atipcal];if(!i)return;const tm=/^(\d{1,2})[:.](\d{2})/.exec(i.time||"");
    calDayPick(i.name,i.date||i.from||nextSat(),async k=>{try{await S.store.setPath("food/termin/"+newId("t"),{name:String(i.name).slice(0,80),date:k,time:tm?tm[1].padStart(2,"0")+":"+tm[2]:null,place:String(i.place||i.name).slice(0,120),link:safeLink(i.link)||null,note:[i.travel,i.price].filter(Boolean).join(" · ").slice(0,200)||null,at:Date.now(),by:S.me||""});toast("Steht am "+rDate(k)+" im Kalender")}catch(_){toast("Konnte nicht speichern.")}});return}
  if(b.dataset.act==="tripall"){S.tripAll=!S.tripAll;render();return}
  if(b.dataset.atiptake){const i=S.atipps&&S.atipps.items[+b.dataset.atiptake];if(!i)return;const k={natur:"wandern",kultur:"stadt",kinder:"stadt",tiere:"tiere",spiel:"spiel"}[i.cat]||"sonst";
    S.tripDraft={id:null,name:i.name||"",note:[i.place,i.travel,i.time,i.price,i.note].filter(Boolean).join(" · "),link:safeLink(i.link)||"",kind:tripKinds().some(x=>x[0]===i.kind)?i.kind:k,dur:"",wx:i.io==="drinnen"?"egal":"",drive:"",kid:"",cost:"",season:"",pack:"",place:i.place||"",date:i.date||i.from||""};render();window.scrollTo(0,0);return}
  if(b.dataset.act==="tripnew"){S.tripDraft={id:null,name:"",note:"",link:"",kind:"",wx:"",dur:"",drive:"",kid:"",cost:"",season:"",pack:""};render();window.scrollTo(0,0);const el=document.getElementById("tr-name");if(el)el.focus();return}
  if(b.dataset.packadd){packAdd(b.dataset.packadd);return}
  if(b.dataset.pack){const i=packs().find(x=>x.id===b.dataset.pack);if(i){try{await S.store.setPath("food/pack/"+i.id+"/done",!i.done)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}}return}
  if(b.dataset.packrm){try{await buyDropRef("pack:"+b.dataset.packrm);await S.store.setPath("food/pack/"+b.dataset.packrm,null)}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="packreset"){for(const i of packs().filter(x=>x.done&&(x.list||"main")===curPack().id)){try{await S.store.setPath("food/pack/"+i.id+"/done",false)}catch(_){}}return}
  if(b.dataset.tripdone){const x=trips().find(y=>y.id===b.dataset.tripdone);if(x){try{await S.store.setPath("food/trip/"+x.id+"/done",!x.done);await S.store.setPath("food/trip/"+x.id+"/doneAt",x.done?null:Date.now())}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}}return}
  if(b.dataset.tripedit){const x=trips().find(y=>y.id===b.dataset.tripedit);if(x){S.tripDraft={id:x.id,emo:x.emo||"",name:x.name||"",note:x.note||"",link:x.link||"",kind:x.kind||"",wx:x.wx||"",dur:x.dur||"",drive:x.drive?String(x.drive):"",kid:x.kid||"",cost:x.cost||"",season:x.season||"",pack:x.pack||"",place:x.place||"",date:x.date||""};render();window.scrollTo(0,0)}return}
  if(b.dataset.act==="tripcancel"){S.tripDraft=null;render();return}
  if(b.dataset.act==="tripsave"){const d=S.tripDraft,name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte ein Ziel eintragen");return}
    const id=d.id||newId("t"),base="food/trip/"+id+"/";
    try{await S.store.setPath(base+"emo",emoClean(d.emo));await S.store.setPath(base+"name",name);await S.store.setPath(base+"note",(d.note||"").trim().slice(0,500)||null);await S.store.setPath(base+"link",safeLink(d.link)||null);await S.store.setPath(base+"place",String(d.place||"").trim().slice(0,160)||null);for(const k of ["kind","wx","dur","kid","cost","season","pack"])await S.store.setPath(base+k,d[k]||null);await S.store.setPath(base+"date",/^\d{4}-\d{2}-\d{2}$/.test(d.date||"")?d.date:null);await S.store.setPath(base+"drive",Math.max(0,Math.min(999,parseInt(d.drive,10)||0))||null);await S.store.setPath(base+"by",S.me||"");if(!d.id){await S.store.setPath(base+"at",Date.now());await S.store.setPath(base+"done",false)}S.tripDraft=null;toast("Gespeichert");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="tripdel"){try{const tid=S.tripDraft.id;await splitDropRef("trip:"+tid);await prioDropRef([tid]);const AD=(S.food&&S.food.adoor)||{};for(const k of Object.keys(AD))if(AD[k]&&AD[k].trip===tid)await S.store.setPath("food/adoor/"+k+"/trip",null);await S.store.setPath("food/trip/"+S.tripDraft.id,null);S.tripDraft=null;toast("Gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.food==="kita"){const fw=focusWeek();S.tab="kita";S.kitaSec="essen";S.kitaDraft=null;focusApply(fw);render();window.scrollTo(0,0);return}
  if(b.dataset.food){const fw=focusWeek();S.tab="essen";S.lunchDraft=null;S.lunchMapEdit=false;S.shopCatEdit=null;S.recDraft=null;S.planEdit=null;S.foodTab=b.dataset.food;try{localStorage.setItem("hq-foodtab",S.foodTab)}catch(_){}focusApply(fw);render();return}
  if(b.dataset.shop){const ids=b.dataset.shop.split(","),all=shopItems();S.shopCatEdit=null;for(const id of ids){const i=all.find(x=>x.id===id);if(!i)continue;const v={name:i.name,done:!i.done,at:i.at||Date.now(),by:i.by||""};if(i.cat)v.cat=i.cat;if(i.src)v.src=i.src;if(v.done)v.doneAt=Date.now();try{await S.store.setPath("food/shop/"+i.id,v)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.");return}}return}
  // Lücken geschlossen (Florian 16.11.2026: alles Angelegte bearbeitbar): Einkaufsliste, Packliste, eigene Weitere Listen
  if(b.dataset.shopedit){const ids=b.dataset.shopedit.split(","),x=shopItems().find(y=>y.id===ids[0]);if(!x)return;const ug=ids.some(id=>(shopItems().find(y=>y.id===id)||{}).urg);const xs=qtySplit(x.name);editBox("Eintrag ändern",[{k:"name",label:"Was",type:"text",val:xs.rest},{k:"qty",label:"Menge (freiwillig, z. B. 2 l, 500 g, 3)",type:"text",val:xs.q},{k:"urg",label:"Wann nötig",type:"chips",opts:[["heute","❗ Heute nötig"],["","Normal"]],val:ug?"heute":""}],async V=>{const nm=String(V.name||"").trim(),mq=String(V.qty||"").trim();if(!nm){toast("Bitte einen Namen eintragen.");return}const n=(mq?mq+" "+qtySplit(nm).rest:qtyNorm(nm)).slice(0,80);{const qs=qtySplit(n),fk=favKey(qs.rest),old=(S.food.fav||{})[fk];if(old)await S.store.setPath("food/fav/"+fk+"/q",qs.q||null)}for(const id of ids){await S.store.setPath("food/shop/"+id+"/name",n);await S.store.setPath("food/shop/"+id+"/urg",V.urg==="heute"||null)}toast("Gespeichert")});return}
  if(b.dataset.packedit){const x=packs().find(y=>y.id===b.dataset.packedit);if(!x)return;editBox("Eintrag ändern",[{k:"name",label:"Was",type:"text",val:x.name}],async V=>{const n=String(V.name||"").trim().slice(0,60);if(!n){toast("Bitte einen Namen eintragen.");return}await S.store.setPath("food/pack/"+x.id+"/name",n);toast("Gespeichert")});return}
  if(b.dataset.buylistedit){const id=b.dataset.buylistedit,L=(S.food.buylist||{})[id];if(!L)return;editBox("Liste ändern",[{k:"name",label:"Name",type:"text",val:L.name},{k:"emo",label:"Symbol (ein Emoji)",type:"text",val:L.emo||"📝"}],async V=>{const n=String(V.name||"").trim().slice(0,40);if(!n){toast("Bitte einen Namen eintragen.");return}await S.store.setPath("food/buylist/"+id,Object.assign({},L,{name:n,emo:String(V.emo||"").trim().slice(0,8)||"📝"}));toast("Gespeichert")});return}
  if(b.dataset.shoprm){for(const id of b.dataset.shoprm.split(",")){try{await S.store.setPath("food/shop/"+id,null)}catch(_){toast("Konnte nicht speichern.");return}}return}
  if(b.dataset.shopfilter!=null){S.shopFilter=S.shopFilter===b.dataset.shopfilter?"":b.dataset.shopfilter;render();return}
  if(b.dataset.shopfav){shopAdd(b.dataset.shopfav);return}
  if(b.dataset.shopcat){S.shopCatEdit=S.shopCatEdit===b.dataset.shopcat?null:b.dataset.shopcat;render();return}
  if(b.dataset.setcat){const ids=String(S.shopCatEdit||"").split(","),i=shopItems().find(x=>x.id===ids[0]);S.shopCatEdit=null;if(!i){render();return}
    try{for(const id of ids)await S.store.setPath("food/shop/"+id+"/cat",b.dataset.setcat);const fk=favKey(i.name),cur=(S.food.fav||{})[fk]||{};await S.store.setPath("food/fav/"+fk,{name:cur.name||i.name,n:cur.n||0,cat:b.dataset.setcat})}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}render();return}
  if(b.dataset.lunch){S.lunchOpen=S.lunchOpen===b.dataset.lunch?null:b.dataset.lunch;render();return}
  if(b.dataset.star){const p=b.dataset.star.split("|"),l=lunches().find(x=>x.id===p[0]);if(!l)return;const cur=+((l.r||{})[p[1]])||0,n=+p[2];
    try{await S.store.setPath("food/lunch/"+p[0]+"/r/"+p[1],cur===n?null:n)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.luedit){const l=lunches().find(x=>x.id===b.dataset.luedit);if(l){S.lunchDraft={id:l.id,name:l.name||"",dishes:l.dishes||"",note:l.note||"",maps:l.maps||""};render();window.scrollTo(0,0)}return}
  if(b.dataset.act==="lunew"){S.lunchDraft={id:null,name:"",dishes:"",note:"",maps:""};render();const el=document.getElementById("lu-name");if(el)el.focus();return}
  if(b.dataset.act==="lucancel"){S.lunchDraft=null;render();return}
  if(b.dataset.act==="lusave"){const d=S.lunchDraft;if(!d)return;const name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte einen Namen eintragen.");return}
    const id=d.id||("l"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)),base="food/lunch/"+id+"/";
    const v={name,dishes:(d.dishes||"").split("\n").map(x=>x.trim().slice(0,80)).filter(Boolean).slice(0,30).join("\n"),note:(d.note||"").trim().slice(0,1000),maps:(d.maps||"").trim().slice(0,500)};
    try{for(const k of Object.keys(v))await S.store.setPath(base+k,v[k]);if(!d.id)await S.store.setPath(base+"at",Date.now());S.lunchDraft=null;S.lunchOpen=id;toast("Ort gespeichert");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="ludel"){const d=S.lunchDraft;if(!d||!d.id)return;if(!d.sure){d.sure=true;b.textContent="Wirklich löschen?";return}
    try{await S.store.setPath("food/lunch/"+d.id,null);S.lunchDraft=null;toast("Ort gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="lumaptoggle"){S.lunchMapOpen=!S.lunchMapOpen;render();return}
  if(b.dataset.act==="lumapedit"){S.lunchMapEdit=true;S.lunchMapText=(S.food&&S.food.lunchmap)||"";render();const el=document.getElementById("lu-mapurl");if(el)el.focus();return}
  if(b.dataset.act==="lumapcancel"){S.lunchMapEdit=false;render();return}
  if(b.dataset.act==="lumapsave"){const u=S.lunchMapText.trim();if(u&&!mapOk(u)){toast("Das ist kein Link aus Google Maps.");return}
    try{await S.store.setPath("food/lunchmap",u||null);S.lunchMapEdit=false;S.lunchMapOpen=!!mapsEmbed(u);render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.idea){const x=((S.ideas&&S.ideas.items)||[])[+b.dataset.idea];if(!x)return;const id="r"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const v={name:String(x.name).slice(0,80),ing:(Array.isArray(x.ing)?x.ing:[]).map(y=>String(y).trim().slice(0,80)).filter(Boolean).slice(0,60).join("\n"),note:String(x.note||"").slice(0,4000),link:String(x.link||"").slice(0,500),at:Date.now()};
    try{await S.store.setPath("food/rec/"+id,v);toast("Als Rezept übernommen");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.openrec){openRec(b.dataset.openrec);return}
  if(b.dataset.srclink===KITA_SRC){S.prev=S.tab;S.tab="kita";S.kitaSec="tasche";render();window.scrollTo(0,0);return}
  if(b.dataset.srclink&&/^adventskalender/i.test(b.dataset.srclink)){const m=b.dataset.srclink.match(/(\d+)\s*$/);S.prev=S.tab;S.tab="projekte";S.projFilter="advent";S.advCal=null;S.advDoor=m?+m[1]:null;render();window.scrollTo(0,0);return}
  if(b.dataset.srclink){const n=b.dataset.srclink.trim().toLowerCase(),r=recs().find(x=>x.name.trim().toLowerCase()===n);if(r){openRec(r.id);return}else{
      const days=[0,1,2,3].map(w=>planDays(addDays(mondayOf(new Date()),7*w-7)));const inPlan=days.some(d=>Object.values(d).some(m=>m&&String(m.text||"").trim().toLowerCase()===n));
      S.tab="essen";S.foodTab=inPlan?"plan":"rezepte";if(inPlan){const now=new Date();for(const d of [0,1,2,3,4,5,6]){const dd=addDays(now,d),m=planDays(mondayOf(dd))["d"+((dd.getDay()+6)%7)];if(m&&String(m.text||"").trim().toLowerCase()===n){S.foodTab="heute";S.dishOpen=dishKey(dd);break}}}
      render();window.scrollTo(0,0);return}}
  if(b.dataset.shopsugg){const u=!!b.dataset.urg||!!S.shopUrg;S.shopText="";S.shopUrg=false;const el=document.getElementById("shopinput");if(el)el.value="";shopAdd(b.dataset.shopsugg,u).then(()=>{const e2=document.getElementById("shopinput");if(e2)e2.focus()});if(u)toast("❗ "+b.dataset.shopsugg+" für heute");return}
  if(b.dataset.act==="shopurg"){S.shopUrg=!S.shopUrg;render();const el=document.getElementById("shopinput");if(el)el.focus();return}
  if(b.dataset.shopview){S.tab="einkauf";S.shopFilter=b.dataset.shopview;render();window.scrollTo(0,0);return}
  if(b.dataset.dishopen){S.dishOpen=S.dishOpen===b.dataset.dishopen?null:b.dataset.dishopen;render();return}
  if(b.dataset.dishsave){const [wk,dk]=b.dataset.dishsave.split("|"),m=(((S.food&&S.food.plan)||{})[wk]||{})[dk];if(!m||!m.text)return;const ex=recs().find(r=>r.name.toLowerCase()===m.text.trim().toLowerCase());const id=ex?ex.id:"r"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const mi=mealInfo(m);try{if(!ex)await S.store.setPath("food/rec/"+id,{name:m.text.trim().slice(0,80),ing:mi.ing.join("\n"),note:"",link:mi.link||"",at:Date.now()});await S.store.setPath("food/plan/"+wk+"/"+dk+"/rec",id)}catch(_){toast("Konnte nicht speichern.");return}S.dishOpen=null;toast("Als Rezept gespeichert");render();return}
  if(b.dataset.rec){S.recOpen=S.recOpen===b.dataset.rec?null:b.dataset.rec;render();return}
  if(b.dataset.pickmode){const P=S.shopPick;if(!P)return;if(P.to){const c=advCals().find(x=>x.id===P.to.cal);if(b.dataset.pickmode==="alle"){S.shopPick=null;if(c)await advImport(c,P.blocks[0].lines);render();return}P.mode=b.dataset.pickmode;P.sel={};if(P.mode==="ohne")P.blocks[0].lines.forEach((l,li)=>P.sel["0|"+li]=1);render();return}
    if(b.dataset.pickmode==="alle"){S.shopPick=null;let t={n:0,skip:0,noq:0};for(const x of P.blocks){const r=await shopAddMany(x.lines,x.src,{quiet:true});if(!r||r.err)return;t.n+=r.n;t.skip+=r.skip;t.noq+=r.noq}shopToast(t.n,t.skip,t.noq);render();return}
    P.mode=b.dataset.pickmode;const pl=pantry();P.sel={};P.blocks.forEach((x,bi)=>x.lines.forEach((l,li)=>{if(P.mode==="ohne"&&!isPantry(l,pl))P.sel[bi+"|"+li]=1}));render();return}
  if(b.dataset.pickline){const P=S.shopPick;if(!P)return;const k=b.dataset.pickline;if(P.sel[k])delete P.sel[k];else P.sel[k]=1;render();return}
  if(b.dataset.act==="pickclose"){S.shopPick=null;render();return}
  if(b.dataset.act==="pickok"){const P=S.shopPick;if(!P)return;S.shopPick=null;if(P.to){const c=advCals().find(x=>x.id===P.to.cal);if(c)await advImport(c,P.blocks[0].lines.filter((l,li)=>P.sel["0|"+li]));render();return}let t={n:0,skip:0,noq:0};for(let bi=0;bi<P.blocks.length;bi++){const x=P.blocks[bi],ls=x.lines.filter((l,li)=>P.sel[bi+"|"+li]);if(!ls.length)continue;const r=await shopAddMany(ls,x.src,{force:true,quiet:true});if(!r||r.err)return;t.n+=r.n;t.noq+=r.noq}shopToast(t.n,0,t.noq);render();return}
  if(b.dataset.recshop){const r=recs().find(x=>x.id===b.dataset.recshop);if(r)openPick([{src:r.name,lines:recIng(r)}]);return}
  if(b.dataset.shopblockrm){shopRemoveBlock(b.dataset.shopblockrm);return}
  if(b.dataset.ideashop){const x=((S.ideas&&S.ideas.items)||[])[+b.dataset.ideashop];if(x&&Array.isArray(x.ing))openPick([{src:x.name,lines:x.ing.map(String)}]);return}
  if(b.dataset.book){S.book=b.dataset.book;S.bookNew=false;S.bookEdit=null;S.recOpen=null;render();return}
  if(b.dataset.act==="booknew"){S.bookNew=!S.bookNew;S.bookEdit=null;render();const el=document.getElementById("bookinput");if(el)el.focus();return}
  if(b.dataset.act==="bookedit"){S.bookEdit=S.bookEdit?null:(S.book||"main");S.bookNew=false;render();const el=document.getElementById("bookinput");if(el)el.focus();return}
  if(b.dataset.act==="bookdel"){const id=S.book;if(!id||id==="main")return;const rs=recs().filter(r=>r.book===id);try{for(const r of rs)await S.store.setPath("food/rec/"+r.id+"/book",null);await S.store.setPath("food/book/"+id,null)}catch(_){toast("Konnte nicht speichern.");return}S.book="main";toast(rs.length?"Kochbuch gelöscht. "+rs.length+" Rezepte liegen jetzt in „Unsere Rezepte“":"Kochbuch gelöscht");render();return}
  if(b.dataset.recbook){if(S.recDraft){S.recDraft.book=b.dataset.recbook;render()}return}
  if(b.dataset.act==="wishopen"){S.wishOpen=!S.wishOpen;render();if(S.wishOpen){const el=document.querySelector('[data-wish="lust"]');if(el)el.focus()}return}
  if(b.dataset.act==="wishx"){S.wishOpen=false;S.wishCopy="";render();return}
  if(b.dataset.act==="wishown"){const w=S.wish||(S.wish={own:true});w.own=!w.own;render();return}
  if(b.dataset.act==="wishweb"){const w=S.wish||{};window.open("https://www.google.com/search?q="+encodeURIComponent(wishQuery(w,w.own)),"_blank","noopener");return}
  if(b.dataset.act==="wishprompt"){const t=wishPrompt(S.wish||{});try{await navigator.clipboard.writeText(t);S.wishCopy="";toast("Kopiert. In Gemini oder ChatGPT einfügen.");return}catch(_){}S.wishCopy=t;render();toast("Bitte den Text unten markieren und kopieren.");return}
  if(b.dataset.act==="wishsave"){const w=S.wish||{},sm=wishSummary(w);if(!sm)return;const id=newId("w"),v={area:"rezepte",what:("Rezepte suchen: "+sm).slice(0,600),name:("Rezepte: "+sm).slice(0,80),rhythm:"einmal",note:null,task:null,state:"offen",at:Date.now(),by:S.me||""};
    try{await S.store.setPath("food/rwunsch/"+id,v);toast("Als Recherche-Wunsch gespeichert (Recherchen).")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="recpaste"){S.recDraft={id:null,name:"",ing:"",note:"",link:"",book:S.book||"main",paste:true,pasteText:""};render();window.scrollTo(0,0);const el=document.getElementById("rec-paste");if(el)el.focus();return}
  if(b.dataset.act==="recclip"){const el=document.getElementById("rec-paste");let t="";try{t=await navigator.clipboard.readText()}catch(_){}
    if(!t){toast("Einfügen ging nicht. Bitte lange ins Feld drücken und „Einfügen“ wählen.");if(el)el.focus();return}if(el)el.value=t;if(S.recDraft)S.recDraft.pasteText=t;const p=document.querySelector('[data-act="recparse"]');if(p)p.click();return}
  if(b.dataset.act==="recparse"){const d=S.recDraft;if(!d)return;const el=document.getElementById("rec-paste");const t=el?el.value:(d.pasteText||"");const r=parseRecipe(t);if(r.link&&!r.ing.length&&String(t).trim().split(/\s+/).length<=3){d.link=r.link;d.name=d.name||nameFromLink(r.link);d.paste=false;d.pasteText="";render();toast("Link übernommen. Zutaten könnt ihr später einfügen.");return}if(!r.name&&!r.ing.length){toast("Nichts erkannt. Steht ein Rezept im Feld?");return}
    if(r.name&&!(d.id&&d.name))d.name=r.name.slice(0,80);if(r.ing.length)d.ing=r.ing.join("\n");if(r.note.length)d.note=r.note.join("\n");if(r.link)d.link=r.link;d.paste=false;d.pasteText=t;render();toast(r.ing.length+" Zutaten erkannt. Bitte kurz prüfen und speichern.");return}
  if(b.dataset.recbookmv){const id=b.dataset.recbookmv,r=recs().find(x=>x.id===id);if(!r)return;const bs=books(),em=x=>x.emoji||BOOK_EMO[(bs.indexOf(x)-1+BOOK_EMO.length)%BOOK_EMO.length];
    editBox("📚 "+r.name+" verschieben",[{k:"book",label:"In welches Kochbuch?",type:"chips",opts:bs.filter(x=>x.id!==recBook(r)).map(x=>[x.id,em(x)+" "+x.name]),val:""}],
      async V=>{const to=bs.find(x=>x.id===V.book);if(!to){toast("Bitte ein Kochbuch antippen.");return}await S.store.setPath("food/rec/"+id+"/book",to.id);S.recOpen=null;toastAct(r.name+" steht jetzt in „"+to.name+"“.","📚 Hingehen",()=>{S.book=to.id;S.recOpen=id;render()})});return}
  if(b.dataset.recedit){const r=recs().find(x=>x.id===b.dataset.recedit);if(r){S.recDraft={id:r.id,name:r.name||"",ing:r.ing||"",note:r.note||"",link:r.link||"",at:r.at||Date.now(),book:recBook(r),tagsOff:r.tagsOff?Object.values(r.tagsOff):[],tagsOwn:r.tagsOwn?Object.values(r.tagsOwn):[],min:r.min||0};render();window.scrollTo(0,0)}return}
  if(b.dataset.rtag&&S.recDraft){const d=S.recDraft,t=b.dataset.rtag,T=draftTags(d);d.tagsOff=T.off.slice();d.tagsOwn=T.own.slice();if(T.auto.includes(t)){d.tagsOff=d.tagsOff.includes(t)?d.tagsOff.filter(x=>x!==t):d.tagsOff.concat(t)}else{d.tagsOwn=d.tagsOwn.includes(t)?d.tagsOwn.filter(x=>x!==t):d.tagsOwn.concat(t)}render();return}
  if(b.dataset.act==="rtagown"&&S.recDraft){const el=document.getElementById("rtagown"),v=(el&&el.value||"").trim().slice(0,30);if(!v)return;const d=S.recDraft;d.tagsOwn=(draftTags(d).own).concat("Eigene|"+v);render();return}
  if(b.dataset.act==="rdbopen"){S.recDb=true;S.recDraft=null;render();window.scrollTo(0,0);return}
  if(b.dataset.act==="rdbclose"){S.recDb=false;render();window.scrollTo(0,0);return}
  if(b.dataset.act==="rdbreset"){S.rdbSel=[];S.rdbQ="";render();return}
  if(b.dataset.rdbt){const t=b.dataset.rdbt,a=S.rdbSel||[];S.rdbSel=a.includes(t)?a.filter(x=>x!==t):a.concat(t);S.rdbOpen=!!b.closest(".rdbfilt");render();return}
  if(b.dataset.rtagrm){try{await S.store.setPath("food/rectag/"+b.dataset.rtagrm,null);toast("Tag gelöscht")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="rtagnew"){const g=document.getElementById("rtaggrp"),el=document.getElementById("rtagnew"),v=(el&&el.value||"").trim().slice(0,30);if(!v||!g)return;S.rdbOpen=true;try{await S.store.setPath("food/rectag/"+newId("t"),{g:g.value,name:v,at:Date.now()});toast("Tag „"+v+"“ bei "+g.value+" dazu")}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.act==="recnew"){S.recDraft={id:null,name:"",ing:"",note:"",link:"",book:S.book||"main"};render();const el=document.getElementById("rec-name");if(el)el.focus();return}
  if(b.dataset.act==="reccancel"){S.recDraft=null;render();return}
  if(b.dataset.act==="recsave"){const d=S.recDraft;if(!d)return;if(!(d.name||"").trim()&&safeLink(d.link))d.name=nameFromLink(safeLink(d.link));const name=(d.name||"").trim().slice(0,80);if(!name){toast("Bitte einen Namen eintragen.");return}
    const id=d.id||("r"+Date.now().toString(36)+Math.random().toString(36).slice(2,5));
    const v={name,ing:recIng(d).map(x=>x.slice(0,80)).slice(0,60).join("\n"),note:(d.note||"").trim().slice(0,4000),link:(d.link||"").trim().slice(0,500),at:d.at||Date.now()};{const T=draftTags(d);v.tags=T.final;if(T.off.length)v.tagsOff=T.off;if(T.own.length)v.tagsOwn=T.own;if(d.min)v.min=d.min}if(d.book&&d.book!=="main")v.book=d.book;S.book=d.book||"main";
    try{await S.store.setPath("food/rec/"+id,v);S.recDraft=null;S.recOpen=id;toast("Rezept gespeichert");render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.move){const [k,id]=b.dataset.move.split("|");moveOpen(k,id);return}
  if(b.dataset.act==="recdel"){const d=S.recDraft;if(!d||!d.id)return;if(!d.sure){d.sure=true;b.textContent="Wirklich löschen?";return}
    try{const r=recs().find(x=>x.id===d.id);if(r)await recDrop(r);else await S.store.setPath("food/rec/"+d.id,null);S.recDraft=null;toast("Rezept gelöscht");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.fnav){const n=+b.dataset.fnav;S.foodWeek=n===0?null:addDays(planWeek(),7*n);S.planEdit=null;render();return}
  if(b.dataset.meal){const m=planDays(planWeek())[b.dataset.meal]||{};S.planEdit=b.dataset.meal;S.planText=m.text||"";S.planRec=m.rec||null;S.planPick=m.text&&(m.link||m.ing)?{name:m.text,link:m.link||"",ing:m.ing?String(m.ing).split("\n").filter(Boolean):[]}:null;render();const el=document.getElementById("mealinput");if(el&&!S.planText)el.focus();return}
  if(b.dataset.mealrec){const id=b.dataset.mealrec,r=recs().find(x=>x.id===id);const old=recs().find(x=>x.id===S.planRec);
    if(S.planRec===id){S.planRec=null}else{S.planRec=id;if(r&&(!S.planText.trim()||(old&&S.planText===old.name)))S.planText=r.name}render();return}
  if(b.dataset.act==="emmishop"){const x=S.emmiCur;if(x&&Array.isArray(x.ing))openPick([{src:x.name,lines:x.ing.map(String)}]);return}
  if(b.dataset.act==="emmitake"){const x=S.emmiCur;if(!x)return;const id="r"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    try{await S.store.setPath("food/rec/"+id,{name:String(x.name).slice(0,80),ing:(Array.isArray(x.ing)?x.ing:[]).map(y=>String(y).trim().slice(0,80)).filter(Boolean).slice(0,60).join("\n"),note:String(x.note||"").slice(0,4000),link:String(x.link||"").slice(0,500),at:Date.now()});toast("Als Rezept übernommen");render()}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.mealtip!=null||b.dataset.mealmem!=null){const x=b.dataset.mealtip!=null?(S.tipList||[])[+b.dataset.mealtip]:(S.memList||[])[+b.dataset.mealmem];if(!x)return;
    S.planText=String(x.name).slice(0,80);S.planRec=x.rec||null;S.planPick=x.rec?null:{name:S.planText,link:x.link||"",ing:Array.isArray(x.ing)?x.ing:[]};render();return}
  if(b.dataset.act==="mealcancel"){S.planEdit=null;render();return}
  if(b.dataset.act==="mealsave"||b.dataset.act==="mealclear"){const k=S.planEdit;if(!k)return;const text=S.planText.trim().slice(0,80);
    const v=(b.dataset.act==="mealclear"||(!text&&!S.planRec))?null:Object.assign({text,at:Date.now(),by:S.me||""},S.planRec?{rec:S.planRec}:{},!S.planRec&&S.planPick&&S.planPick.name===text?Object.assign({src:"vorschlag"},S.planPick.link?{link:S.planPick.link}:{},S.planPick.ing&&S.planPick.ing.length?{ing:S.planPick.ing.join("\n")}:{}):{});
    try{await S.store.setPath("food/plan/"+wkKey(planWeek())+"/"+k,v);S.planEdit=null;render()}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}return}
  if(b.dataset.act==="mealshop"){const days=planDays(planWeek()),all=[];const rl=recs();const extra=[];Object.keys(days).forEach(k=>{const r=days[k]&&days[k].rec&&rl.find(x=>x.id===days[k].rec);if(r)all.push(r);else if(days[k]&&days[k].ing)extra.push(days[k])});const bls=[...all.map(r=>({src:r.name,lines:recIng(r)})),...extra.map(d=>({src:d.text,lines:String(d.ing).split("\n").filter(Boolean)}))].filter(x=>x.lines.length);if(!bls.length){toast("Keine Rezepte mit Zutaten in dieser Woche");return}openPick(bls);return}
  if(b.dataset.act==="shopclear"){for(const i of shopItems().filter(x=>x.done)){try{await S.store.setPath("food/shop/"+i.id,null)}catch(_){}}return}
  if(b.dataset.me){S.me=b.dataset.me;try{localStorage.setItem("hq-me",S.me)}catch(_){}render();return}
  if(b.dataset.act==="groupby"||b.dataset.jump){const j=b.dataset.jump;S.groupBy=j?"art":(S.groupBy==="art"?"freq":"art");try{localStorage.setItem("hq-groupby",S.groupBy)}catch(_){}render();
    if(j){const el=document.getElementById("sec-"+j);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})}return}
  if(b.dataset.act==="hidedone"){S.hideDone=!S.hideDone;try{localStorage.setItem("hq-hidedone",S.hideDone?"1":"0")}catch(_){}render();return}
  if(b.dataset.filter){S.filter=b.dataset.filter;try{localStorage.setItem("hq-filter",S.filter)}catch(_){}render();return}
  if(b.dataset.nav){const n=+b.dataset.nav;S.view=n===0?mondayOf(new Date()):addDays(S.view,7*n);render();return}
  if(b.dataset.hodone!=null){const hm=hoMine();if(!hm)return;const wk=wkKey(mondayOf(new Date())),k=hm.t.id+"__"+hm.di,ok=Object.assign({},hm.v.ok||{});if(ok[hm.me])delete ok[hm.me];else ok[hm.me]=Date.now();
    try{await S.store.tick(wk,k,Object.assign({},hm.v,{ok:Object.keys(ok).length?ok:null}))}catch(_){toast("Konnte nicht speichern.")}return}
  if(b.dataset.task){toggle(b);return}
  if(b.dataset.del){S.draft.tasks.splice(+b.dataset.del,1);render();return}
  const act=b.dataset.act;
  if(act==="template"){try{await S.store.saveConfig(JSON.parse(JSON.stringify(TEMPLATE)));toast("Plan angelegt")}catch(_){toast("Konnte den Plan nicht speichern.")}}
  if(act==="add"){S.draft.tasks.push({id:"t"+Date.now().toString(36),name:"Neue Aufgabe",owner:"rot",freq:"week",times:1,pts:2});render()}
  if(act==="wkedit"){const k=wkKey(S.view);S.wkEdit=S.wkEdit===k?null:k;render();return}
  if(act==="toweek"){S.tab="woche";S.weekPage=0;S.view=mondayOf(new Date());render();window.scrollTo(0,0);return}
  if(act==="reset"){S.draft=null;render()}
  if(act==="swap"){const c=JSON.parse(JSON.stringify(S.config));c.rotOffset=((c.rotOffset|0)+1)%2;try{await S.store.saveConfig(c);S.draft=null;toast("Pakete getauscht")}catch(_){toast("Konnte nicht speichern.")}}
  if(act==="save"){const d=S.draft;const n0=document.getElementById("pn0"),n1=document.getElementById("pn1");if(n0&&n1)d.persons=[n0.value.trim()||"Person 1",n1.value.trim()||"Person 2"];
    d.tasks.forEach(t=>{t.name=(t.name||"").trim()||"Aufgabe";t.pts=Math.max(0,Math.min(50,t.pts|0));if(t.freq==="week")t.times=Math.max(1,Math.min(14,t.times|0||1));else delete t.times;if(t.owner!=="rot"||(t.pack!=="A"&&t.pack!=="B"))delete t.pack;if(!hasSubs(t)||t.owner==="ho"||t.owner==="both")delete t.subs});
    try{await S.store.saveConfig(JSON.parse(JSON.stringify(d)));S.draft=null;toast("Plan gespeichert")}catch(_){toast("Speichern nicht möglich. Du brauchst Bearbeitungsrechte.")}}
});
