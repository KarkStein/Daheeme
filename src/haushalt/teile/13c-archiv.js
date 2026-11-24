// ---------- Archiv der Recherchen (Florian 21.11.2026: „nur findbar unter der Rezeptsuche. Mit möglichen Filter um sie ggf mit auszuwählen“) ----------
// Der Lauf archiv.yml (src/archiv.py) sammelt jede Recherche in archiv/rezepte.json und archiv/ausfluege.json. Die App lädt sie erst bei Bedarf.
// Rezepte: nur in der Rezept-Datenbank, Chip „🗄️ Auch Archiv“ (Vorgabe aus). Ausflüge: in Ausflüge › Gemerkt, Chip „🗄️ Auch frühere Tipps“; „Was ist los“ und Sammlung › Recherchen springen hin.
const ARCH_FROM={tag:"Tagesrezept",woche:"Wochenidee",emmi:"Emmi-Tipp"};
function archGet(k){const f=k==="rez"?"archiv/rezepte.json":"archiv/ausfluege.json",key=k==="rez"?"archRez":"archAus";
  if(S[key]||S["_"+key])return S[key]||null;S["_"+key]=1;
  try{fetch(f,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items)){S[key]=j;render()}}).catch(()=>{})}catch(_){}return null}
// Archiv-Rezepte, die noch nicht in euren Rezepten stehen, mit denselben Tags wie eure (recAuto)
function archRecs(){const j=archGet("rez");if(!j)return [];const own=new Set(recs().map(r=>sNorm(r.name||"").trim()));
  if(!S._archT||S._archT.j!==j){S._archT={j,t:j.items.map(x=>recAuto({name:x.name,ing:Array.isArray(x.ing)?x.ing.join("\n"):"",link:x.link,id:"neu",min:x.min}))}}
  return j.items.map((x,i)=>({x,i,t:S._archT.t[i]})).filter(a=>a.x&&a.x.name&&!own.has(sNorm(a.x.name).trim()))}
function archRecDate(x){const d=String(x.last||x.first||"").match(/(\d{4})-(\d\d)-(\d\d)/);return d?`${+d[3]}.${+d[2]}.`:""}
function archRecRow(a){const x=a.x,u=safeLink(x.link||""),fr=(x.from||[]).map(f=>ARCH_FROM[f]).filter(Boolean)[0]||"Recherche";
  return `<li class="archrow"><span class="ev minw0"><b>${esc(x.name)}</b><br><span class="freq">${[x.source,fr+" "+archRecDate(x)].filter(Boolean).map(esc).join(" · ")}</span></span>${u?`<a class="catbtn" href="${esc(u)}" target="_blank" rel="noopener" aria-label="Rezept öffnen">🔗</a>`:""}<button class="catbtn" data-cook="arch|${a.i}" aria-label="${esc(x.name)} kochen: Tag wählen">🍲</button><button class="catbtn" data-archtake="${a.i}" aria-label="${esc(x.name)} in eure Rezepte holen">📖＋</button></li>`}
// Teil der Rezept-Datenbank: Chip und Karte. q = Suchtext (normalisiert), sel = gewählte Tags
function archRdb(q,sel){const A=archRecs(),on=!!S.rdbArch;
  const M=A.filter(a=>sel.every(t=>a.t.includes(t))&&(!q||sNorm(a.x.name+" "+a.t.map(tagLab).join(" ")).includes(q)||sNorm((a.x.ing||[]).join(" ")).includes(q))).sort((a,b)=>a.x.name.localeCompare(b.x.name,"de"));
  const chip=A.length?`<button class="chipbtn neutral archchip" data-act="rdbarch" aria-pressed="${on}">${on?"✕ ":""}🗄️ Auch Archiv${on?"":` <span class="freq">${q||sel.length?M.length:A.length}</span>`}</button>`:"";
  let card="";
  if(on)card=`<section class="card archcard"><div class="section-head"><h2>🗄️ Aus den Recherchen <span class="freq">(${M.length})</span></h2></div>${M.length?`<ul class="evlist rdblist">${M.map(archRecRow).join("")}</ul><div class="freq mt1">📖＋ holt ein Rezept in eure Rezepte, dann steht es oben.</div>`:`<div class="freq">Im Archiv passt nichts zu dieser Suche.</div>`}</section>`;
  else if(M.length&&(q||sel.length))card=`<section class="card archhint"><button class="todayrow" data-act="rdbarch"><span>🗄️</span><span>${M.length} weitere im Archiv der Recherchen</span><i>›</i></button></section>`;
  return {chip,card,n:on?M.length:0}}
function archCook(i){const j=S.archRez;return j&&j.items[+i]||null}
// ---------- Ausflüge: frühere Tipps ----------
const archAusKey=i=>sNorm(i.name||"").trim()+"|"+String(i.date||i.from||i.to||"").slice(0,4);
function archAusItems(){const j=archGet("aus");if(!j)return [];const t=ymd(new Date()),cur=new Set(((S.atipps&&S.atipps.items)||[]).filter(i=>(i.to||i.date||"9999")>=t).map(archAusKey));
  return j.items.filter(i=>i&&i.name&&!i.dauer&&!cur.has(archAusKey(i)))}
const archMD=s=>{const m=String(s||"").match(/\d{4}-(\d\d)-(\d\d)/);return m?(+m[1])*31+(+m[2]):null};
function archSeason(i){const a=archMD(i.date||i.from),b=archMD(i.to)||a;if(a==null)return false;const n=new Date(),now=(n.getMonth()+1)*31+n.getDate(),lo=now-21,hi=now+42;
  const inR=x=>{for(const k of [x,x+372,x-372])if(k>=lo&&k<=hi)return true;return false};return inR(a)||inR(b)||(b>=a?a<=now&&b>=now:a<=now||b>=now)}
function archAusWhen(i){const d=x=>{const m=String(x||"").match(/(\d{4})-(\d\d)-(\d\d)/);return m?`${+m[3]}.${+m[2]}.${m[1]}`:""};const f=i.date||i.from,t=i.to;
  return f?"war "+(t&&t!==f?d(f).replace(/\d{4}$/,"")+"–"+d(t):d(f)):(i.last?"Tipp vom "+d(i.last):"")}
// Ausflüge (Florian 24.11.2026, „C: Getrennt plus Einstieg“): in Ausflüge › Gemerkt der Chip „🗄️ Auch frühere Tipps“ (S.rgArch, Vorgabe aus),
// an = Karte „🗄️ Aus den Recherchen“ unter Gemerkt mit Suche und Filtern. „Was ist los“ und Sammlung › Recherchen springen nur dorthin.
const ARCH_MN=["Jan.","Feb.","März","April","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."];
// je Name nur der neueste Eintrag; schon Gemerktes (gleicher Name) fällt weg
function archRgItems(){const A=archAusItems();if(!A.length)return [];const g=new Set(trips().map(x=>sNorm(x.name||"").trim()).concat(funde("reise").map(f=>sNorm(f.name||"").trim())));
  const yrs={},seen=new Set(),out=[];((S.archAus&&S.archAus.items)||[]).forEach(i=>{if(!i||!i.name)return;const y=String(i.date||i.from||i.to||"").slice(0,4);if(y)(yrs[sNorm(i.name).trim()]=yrs[sNorm(i.name).trim()]||new Set()).add(y)});
  A.map((i,ix)=>({i,ix})).sort((a,b)=>String(b.i.date||b.i.from||b.i.last||"").localeCompare(String(a.i.date||a.i.from||a.i.last||""))).forEach(o=>{const n=sNorm(o.i.name).trim();if(g.has(n)||seen.has(n))return;seen.add(n);o.yearly=(yrs[n]||new Set()).size>1;out.push(o)});
  return out}
function archMon(i){const m=String(i.date||i.from||i.last||"").match(/(\d{4})-(\d\d)/);return m?ARCH_MN[+m[2]-1]+" "+m[1]:""}
function archRgList(){const q=sNorm(S.archRgQ||"").trim(),f=S.archRgF||"",L=archRgItems().filter(({i})=>(!f||(f==="jz"?archSeason(i):f==="umland"?i.where==="umland":atipCat(i)===f))&&(!q||sNorm([i.name,i.place,i.note,(ATIP_CAT.find(c=>c[0]===atipCat(i))||[])[2]].join(" ")).includes(q)));
  if(!L.length)return `<div class="freq">Nichts gefunden.</div>`;
  return `<ul class="evlist">${L.slice(0,60).map(({i,ix,yearly})=>{const c=ATIP_CAT.find(x=>x[0]===atipCat(i)),u=safeLink(i.link||"");
    return `<li class="archrow"><span class="ev minw0"><b>${c?c[1]+" ":""}${esc(i.name)}</b><br><span class="freq">${[archMon(i),c?c[2]:"",i.where==="umland"?"🚆 Umland":"",yearly?"🔁 kommt jedes Jahr":""].filter(Boolean).map(esc).join(" · ")}</span></span>${u?`<a class="catbtn" href="${esc(u)}" target="_blank" rel="noopener" aria-label="Website">🔗</a>`:""}<button class="catbtn" data-archcal="${ix}" aria-label="${esc(i.name)}: Tag planen">📅</button><button class="catbtn" data-archmerk="${ix}" aria-label="${esc(i.name)} als Ausflugsziel merken">🔖</button></li>`}).join("")}</ul>${L.length>60?`<div class="freq">Noch ${L.length-60} weitere, bitte genauer suchen.</div>`:""}`}
// Chip für die Filterzeile in Gemerkt (rgCard)
function archRgChip(){const A=archRgItems();if(!A.length)return "";const on=!!S.rgArch;
  return `<button class="chipbtn neutral archchip" data-act="rgarch" aria-pressed="${on}">${on?"✕ ":""}🗄️ Auch frühere Tipps${on?"":` <span class="freq">${A.length}</span>`}</button>`}
function archRgCard(){if(!S.rgArch)return "";const A=archRgItems();if(!A.length)return "";const f=S.archRgF||"",cats=ATIP_CAT.filter(c=>A.some(o=>atipCat(o.i)===c[0]));
  const chip=(v,txt)=>`<button class="chipbtn neutral" data-archrgf="${v}" aria-pressed="${f===v}">${txt}</button>`;
  return `<section data-fk="f_rgarch|1" class="card archcard rgarch"><div class="section-head"><h2>🗄️ Aus den Recherchen <span class="freq">(${A.length})</span></h2></div><input type="search" class="w100" id="archrgq" value="${esc(S.archRgQ||"")}" placeholder="Suchen: Name, Ort, Rubrik" autocomplete="off" aria-label="Frühere Tipps durchsuchen"><div class="unl scrollrow mt2">${chip("","Alle")}${chip("jz","📅 Um diese Jahreszeit")}${A.some(o=>o.i.where==="umland")?chip("umland","🚆 Umland"):""}${cats.map(c=>chip(c[0],c[1]+" "+c[2])).join("")}</div><div id="archrgl">${archRgList()}</div><div class="freq mt1">📅 plant einen Tag im Kalender, 🔖 merkt den Tipp als Ausflugsziel.</div></section>`}
// „Was ist los“: nur noch ein Sprung nach Gemerkt mit eingeschaltetem Chip
function archAusRow(){const A=archRgItems();if(!A.length)return "";return `<button class="atipgrp archgrp" data-act="archgo"><span>🗄️ ${A.length} ${A.length===1?"früherer Tipp":"frühere Tipps"}</span><i>›</i></button>`}
function archAusGo(){if(S.tab!=="ausflug"||S.tripTab!=="ideen"||S.tripDraft){S.tripDraft=null;goNav("ausflug|tt:ideen")}S.rgArch=true;S.tFold=S.tFold||{};S.tFold.f_rgarch=true;render();
  setTimeout(()=>{const el=document.querySelector(".rgarch");if(el)el.scrollIntoView({block:"start"})},40)}
// Sammlung › Recherchen: Karte „🗄️ Archiv“ mit zwei Sprüngen (lädt die Dateien erst, wenn die Seite offen ist)
function archResCard(){archGet("rez");const nr=archRecs().length,A=archRgItems(),nj=A.filter(o=>archSeason(o.i)).length;if(!nr&&!A.length)return "";
  return `<section data-fk="f_rarch|1" class="card archres"><div class="section-head"><h2>🗄️ Archiv</h2></div><div class="freq">Alles, was die Recherchen je gefunden haben. Nichts wird gelöscht.</div>${nr?`<button class="todayrow" data-act="archrezgo"><span>🍲</span><span>${nr} ${nr===1?"Rezept":"Rezepte"}</span><i>›</i></button>`:""}${A.length?`<button class="todayrow" data-act="archgo"><span>🚲</span><span>${A.length} ${A.length===1?"Ausflug-Tipp":"Ausflug-Tipps"}${nj?`, ${nj} passen um diese Jahreszeit`:""}</span><i>›</i></button>`:""}</section>`}
function archClick(b){
  if(b.dataset.act==="rdbarch"){S.rdbArch=!S.rdbArch;render();return true}
  if(b.dataset.archtake!=null){const x=archCook(b.dataset.archtake);if(!x)return true;recWohin(recVal({name:x.name,ing:x.ing,link:x.link,note:x.note}));return true}
  if(b.dataset.act==="rgarch"){S.rgArch=!S.rgArch;render();if(S.rgArch)setTimeout(()=>{const el=document.querySelector(".rgarch");if(el)el.scrollIntoView({block:"start",behavior:"smooth"})},40);return true}
  if(b.dataset.act==="archgo"){archAusGo();return true}
  if(b.dataset.act==="archrezgo"){goNav("essen|ft:rezepte");S.recDraft=null;S.recDb=true;S.rdbArch=true;S.rdbQ="";S.rdbSel=[];render();window.scrollTo(0,0);return true}
  if(b.dataset.archrgf!=null){S.archRgF=b.dataset.archrgf;render();return true}
  if(b.dataset.archcal!=null){const i=archAusItems()[+b.dataset.archcal];if(!i)return true;const tm=/^(\d{1,2})[:.](\d{2})/.exec(i.time||""),md=String(i.date||i.from||"").slice(4),t=ymd(new Date());let sg=md?new Date().getFullYear()+md:"";if(sg&&sg<t)sg="";
    calDayPick(i.name,sg&&/^\d{4}-\d\d-\d\d$/.test(sg)?sg:nextSat(),async k=>{try{await S.store.setPath("food/termin/"+newId("t"),{name:String(i.name).slice(0,80),date:k,time:tm?tm[1].padStart(2,"0")+":"+tm[2]:null,place:String(i.place||i.name).slice(0,120),link:safeLink(i.link)||null,note:[i.travel,i.price].filter(Boolean).join(" · ").slice(0,200)||null,at:Date.now(),by:S.me||""});toast("Steht am "+rDate(k)+" im Kalender")}catch(_){toast("Konnte nicht speichern.")}});return true}
  if(b.dataset.archmerk!=null){const i=archAusItems()[+b.dataset.archmerk];if(!i)return true;const k={natur:"wandern",kultur:"stadt",kinder:"stadt",tiere:"tiere",spiel:"spiel"}[i.cat]||"sonst";
    S.tripDraft={id:null,name:i.name||"",note:[i.place,i.travel,i.time,i.price,i.note,archAusWhen(i)].filter(Boolean).join(" · "),link:safeLink(i.link)||"",kind:tripKinds().some(x=>x[0]===i.kind)?i.kind:k,dur:"",wx:i.io==="drinnen"?"egal":"",drive:"",kid:"",cost:"",season:"",pack:"",place:i.place||"",date:""};render();window.scrollTo(0,0);return true}
  return false}
