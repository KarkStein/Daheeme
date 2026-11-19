// Rückblick der Hausarbeit (Florian 19.11.2026: „B, Monatsbild, aber "was blieb oft liegen" und zugeklappte Wochen ermöglichen“; Entwurf /mnt/project-files/haushalt/rueckblick-varianten.png)
// Dritte Seite im Reiter Haushalt (weekPage 4). Gezählt werden nur Wochen, in denen etwas eingetragen ist (und die laufende). Liest nur die Haken in weeks/<wk>/ticks: by = wer, at = wann, own = für wen übernommen. Keine Punkte, keine Rangliste.
const RB_MODES=[["woche","Woche"],["monat","Monat"],["jahr","Jahr"]];
function rbWeeks(){const mode=S.rbMode||"monat",off=S.rbOff|0,cur=mondayOf(new Date()),th=m=>addDays(m,3);let from,to,lbl;
  if(mode==="woche"){from=to=addDays(cur,7*off);const {w}=isoWeek(from);lbl="KW "+w}
  else if(mode==="jahr"){const y=new Date().getFullYear()+off;lbl=String(y);from=mondayOf(new Date(y,0,4));to=mondayOf(new Date(y,11,28))}
  else{const b=new Date(),d=new Date(b.getFullYear(),b.getMonth()+off,1),y=d.getFullYear(),m=d.getMonth();lbl=fmt(d,{month:"long"})+(y!==b.getFullYear()?" "+y:"");
    from=mondayOf(new Date(y,m,1));if(th(from).getMonth()!==m)from=addDays(from,7);to=mondayOf(new Date(y,m+1,0));if(th(to).getMonth()!==m)to=addDays(to,-7)}
  if(+to>+cur)to=cur;const L=[];for(let m=to;+m>=+from;m=addDays(m,-7))if(+m===+cur||S.weeks[wkKey(m)]||needWeekTicks(m).length)L.push(m);return {L,lbl,mode,off}}
// Eine Woche auswerten: erledigt/geplant (täglich und wöchentlich; die laufende Woche bis heute), Einträge fürs Logbuch, Übernommenes, Offenes, Hausdienst
function rbWeek(mon){const wk=wkKey(mon),tk=ticksOf(wk),cur=mondayOf(new Date()),isCur=+mon===+cur,today=isCur?(new Date().getDay()+6)%7:6,split=rotSplit();
  const R={wk,mon,isCur,c:0,n:0,log:[],took:[],open:[],per:{p0:0,p1:0},ho:{p0:0,p1:0,half:0},miss:{}};
  const add=(t,v,sub,own)=>{if(!v||(v.by!=="p0"&&v.by!=="p1"))return;const e={t,v,sub,own:own||null};R.log.push(e);if(e.own)R.took.push(e)};
  tasks().forEach(t=>{const o=ownerFor(t,mon,split);
    if(t.owner==="ho"){for(let i=0;i<7;i++){const v=tk[t.id+"__"+i];if(!v||v.by==="x")continue;if(v.half==="vm")R.ho.half++;else if(R.ho[v.by]!=null)R.ho[v.by]++}return}
    if(group(t.freq)!=="week"){const v=tk[t.id+"__p"];if(v){add(t,v,null,v.own);R.per[v.by]=(R.per[v.by]||0)+(t.pts||1)}return}
    const n=slotsOf(t);let c=0,m=0;
    for(let i=0;i<n;i++){if(t.freq==="day"&&i>today)continue;m++;const k=t.id+"__"+i;
      if(t.owner==="both"){const leg=tk[k],a=tk[k+"_p0"]||(leg&&leg.by==="p0"?leg:null),b=tk[k+"_p1"]||(leg&&leg.by==="p1"?leg:null);c+=(a?.5:0)+(b?.5:0);[a,b].forEach(v=>{if(v){add(t,v);R.per[v.by]+=(t.pts||1)/2}});continue}
      if(hasSubs(t)){t.subs.forEach((sn,j)=>{const sv=tk[k+"_s"+j];if(sv)add(t,sv,sn,sv.own)});if(tk[k])c++;continue}
      const v=tk[k];if(v){c++;add(t,v,null,v.own);if(R.per[v.by]!=null)R.per[v.by]+=t.pts||1}}
    if(hasSubs(t))t.subs.forEach((sn,j)=>{for(let i=0;i<n;i++){const sv=tk[t.id+"__"+i+"_s"+j];if(sv&&R.per[sv.by]!=null)R.per[sv.by]+=(t.pts||1)/t.subs.length}});
    R.c+=c;R.n+=m;if(m&&c<m&&!(isCur)){R.open.push(t.name);R.miss[t.id]=1}else if(m&&c<m)R.miss[t.id]=0});
  needWeekTicks(mon).forEach(({t,v})=>{add(t,v,"nach Bedarf",v.own);if(R.per[v.by]!=null)R.per[v.by]+=t.pts||1});
  R.log.sort((a,b)=>(a.v.at||0)-(b.v.at||0));R.took.sort((a,b)=>(b.v.at||0)-(a.v.at||0));return R}
const rbNum=x=>(Math.round(x*10)/10).toString().replace(".",",");
const rbDot=p=>`<span class="kz" style="background:${PCOL[p]||"var(--muted)"}" aria-hidden="true">${esc(pInit(p))}</span>`;
const rbWhat=e=>esc(e.t.name)+(e.sub?": "+esc(e.sub):"");
function rbRing(p){const r=46,c=2*Math.PI*r;return `<svg class="rbring" viewBox="0 0 108 108" aria-hidden="true"><circle cx="54" cy="54" r="${r}" fill="none" stroke="var(--line)" stroke-width="12"/><circle cx="54" cy="54" r="${r}" fill="none" stroke="var(--navy-a)" stroke-width="12" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-p)).toFixed(1)}" transform="rotate(-90 54 54)"/><text x="54" y="60" text-anchor="middle">${Math.round(p*100)} %</text></svg>`}
// Was blieb oft liegen: die letzten 8 abgeschlossenen Wochen, Aufgaben, die in mindestens 2 davon nicht ganz erledigt wurden
function rbLiegen(){const cur=mondayOf(new Date()),W=[];for(let i=1;i<=8;i++){const m=addDays(cur,-7*i),wk=wkKey(m);if(S.weeks[wk])W.push(rbWeek(m))}
  if(!W.length)return "";const L=tasks().filter(t=>group(t.freq)==="week"&&t.owner!=="ho").map(t=>{const miss=W.filter(w=>w.miss[t.id]===1).length;let last=null;
    for(const w of W){const e=w.log.filter(x=>x.t.id===t.id);if(e.length){last=e[e.length-1].v.at;break}}return {t,miss,last}}).filter(x=>x.miss>=2).sort((a,b)=>b.miss-a.miss).slice(0,5);
  const ago=at=>{if(!at)return "in diesen Wochen nie erledigt";const d=Math.floor((Date.now()-at)/(7*864e5));return "zuletzt "+(d<1?"diese Woche":d===1?"vor 1 Woche":"vor "+d+" Wochen")};
  const body=L.length?`<ul class="rblist">${L.map(x=>`<li><b>${esc(x.t.name)}</b><span class="freq">${ago(x.last)} · in ${x.miss} von ${W.length} Wochen offen</span></li>`).join("")}</ul>`:`<p class="freq">Nichts blieb öfter liegen. In den letzten ${W.length} Wochen wurde alles meist geschafft.</p>`;
  return foldCard("rb_liegen","🧺 Was blieb oft liegen",L.length||"",body,true)}
function rbWeekBody(R){if(!R.log.length&&!R.open.length)return `<p class="freq">Nichts eingetragen.</p>`;let h="",day="";
  R.log.forEach(e=>{const d=new Date(e.v.at||+R.mon),k=fmt(d,{weekday:"short",day:"numeric",month:"short"});if(k!==day){day=k;h+=`<div class="rbday">${esc(k)}</div>`}
    h+=`<div class="rbent">${rbDot(e.v.by)}<span>${rbWhat(e)}</span>${e.own?`<span class="rbtook">🤝 für ${esc(pname(e.own))}</span>`:""}</div>`});
  if(R.open.length)h+=`<p class="freq rbopen">Offen geblieben: ${R.open.map(esc).join(", ")}</p>`;return h}
function renderRueck(){const P=rbWeeks(),W=P.L.map(rbWeek),c=W.reduce((s,w)=>s+w.c,0),n=W.reduce((s,w)=>s+w.n,0),took=[].concat(...W.map(w=>w.took)).sort((a,b)=>(b.v.at||0)-(a.v.at||0));
  const per={p0:0,p1:0},ho={p0:0,p1:0,half:0};W.forEach(w=>{per.p0+=w.per.p0;per.p1+=w.per.p1;ho.p0+=w.ho.p0;ho.p1+=w.ho.p1;ho.half+=w.ho.half});
  const openN={};W.forEach(w=>w.open.forEach(x=>openN[x]=(openN[x]||0)+1));const openL=Object.keys(openN).sort((a,b)=>openN[b]-openN[a]).slice(0,3);
  const first=P.L[P.L.length-1],last=P.L[0];
  let h=`<div><div class="eyebrow">Was ihr zusammen geschafft habt</div><h1>Rückblick</h1></div><div class="rbnav" role="group" aria-label="Zeitraum"><button class="chipbtn neutral" data-rboff="-1" aria-label="Früher">‹</button><b class="rblbl">${esc(P.lbl)}</b><button class="chipbtn neutral" data-rboff="1" aria-label="Später" ${P.off>=0?"disabled":""}>›</button><span class="rbmodes">${RB_MODES.map(m=>`<button class="chipbtn neutral" data-rbmode="${m[0]}" aria-pressed="${P.mode===m[0]}">${m[1]}</button>`).join("")}</span></div>`;
  if(!P.L.length)return h+`<section class="card"><p class="freq">Für diesen Zeitraum gibt es noch nichts.</p></section>`;
  const tot=per.p0+per.p1,pc=tot?per.p0/tot:.5;
  h+=`<section data-fk="f_rbsum|1" class="card rbsum"><h2>Zusammen geschafft</h2><div class="freq">${esc(fmt(first,{day:"numeric",month:"short"}))} bis ${esc(fmt(+last===+mondayOf(new Date())?new Date():addDays(last,6),{day:"numeric",month:"short"}))}</div>
    <div class="rbtop">${rbRing(n?c/n:0)}<div><b>${rbNum(c)} von ${rbNum(n)}</b> Aufgaben erledigt${openL.length?`<div class="freq">Liegen geblieben: ${openL.map(esc).join(", ")}</div>`:""}</div></div>
    ${tot?`<div class="rbbar" aria-label="Erledigt je Person, nach Aufwand"><span style="width:${(pc*100).toFixed(1)}%;background:${PCOL.p0}"></span><span style="width:${((1-pc)*100).toFixed(1)}%;background:${PCOL.p1}"></span></div><div class="rbbarl freq"><span>${esc(pname("p0"))} ${rbNum(per.p0)}</span><span>Aufwand erledigt</span><span>${esc(pname("p1"))} ${rbNum(per.p1)}</span></div>`:""}
    ${ho.p0+ho.p1+ho.half?`<div class="freq">🔑 Hausdienst: ${esc(pname("p0"))} ${ho.p0} ${ho.p0===1?"Tag":"Tage"} · ${esc(pname("p1"))} ${ho.p1}${ho.half?` · geteilt ${ho.half}`:""}</div>`:""}</section>`;
  const all=S.rbTookAll,shown=all?took:took.slice(0,5);
  h+=`<section data-fk="f_rbtook|1" class="card rbtookc"><h2>🤝 Füreinander übernommen${took.length?` <span class="freq">(${took.length})</span>`:""}</h2>${took.length?`<ul class="rblist">${shown.map(e=>`<li><div>${rbDot(e.v.by)}<b>${rbWhat(e)}</b></div><span class="freq">${esc(fmt(new Date(e.v.at),{weekday:"short",day:"numeric",month:"short"}))} · für ${esc(pname(e.own))}</span></li>`).join("")}</ul>${took.length>5?`<button class="linkish" data-act="rbtookall">${all?"Weniger zeigen":"Alle "+took.length+" zeigen"}</button>`:""}`:`<p class="freq">Noch nichts übernommen. Hakt jemand eine Aufgabe des anderen ab, steht sie hier als Dank.</p>`}</section>`;
  h+=rbLiegen();
  h+=`<section data-fk="f_rbweeks|1" class="card rbweeks"><h2>🗄️ Vergangene Wochen</h2>${W.map(w=>{const k="rb_"+w.wk,on=tFoldOn(k,false),{w:kw}=isoWeek(w.mon);
    return `<div class="rbwk"><button class="rbwkh" data-tfold="${esc(k)}" data-tdef="0" aria-expanded="${on}"><span><b>KW ${kw}</b> <span class="freq">${esc(fmt(w.mon,{day:"numeric",month:"short"}))} bis ${esc(fmt(addDays(w.mon,6),{day:"numeric",month:"short"}))}${w.isCur?" · läuft":""}</span></span><span class="freq">${rbNum(w.c)} von ${rbNum(w.n)}${w.took.length?" · 🤝 "+w.took.length:""} ${on?"▾":"›"}</span></button>${on?`<div class="rbwkb">${rbWeekBody(w)}</div>`:""}</div>`}).join("")}</section>`;
  return h}
