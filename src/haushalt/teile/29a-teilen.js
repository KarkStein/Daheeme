
// ---------- Teilen: „Wohin?“ und „Verschieben nach“ (Florian 16.11.2026) ----------
// Geteilter Link/Text (manifest share_target, unverändert ?st&sx&su) fragt erst, wohin: Rezept, Spielidee, Ausflug, Geschenk-Idee, Am-Haus-Projekt oder eine der Weitere Listen.
// Vorschlag nur bei bekannten Rezept-Seiten; Instagram und Unbekanntes ohne Vorwahl. Beschreibung optional; enthält sie eine Liste, lässt sie sich in einzelne Einträge aufteilen (jeder behält den Link).
const SHARE_REC_RX=/(chefkoch|kitchenstories|emmikochteinfach|kptncook|eat-this|zuckerundjagdwurst|chiliundciabatta|essen-und-trinken|lecker\.de|springlane|eatsmarter|einfachbacken|gutekueche|kochbar|bbcgoodfood|allrecipes|hellofresh|cookidoo|kuechengoetter|rewe\.de\/rezepte|\/rezept|\/recipe)/i;
const SHARE_FIX=[["rezept","📖","Rezept"],["spiel","🎲","Spielidee"],["ausflug","🚲","Ausflug"],["geschenk","🎁","Geschenk-Idee"]];
function shareTargets(){return SHARE_FIX.map(x=>x.slice())
  .concat(hprojs().filter(x=>x.state!=="erledigt").map(x=>["proj:"+x.id,x.emo||"🛠️","Projekt: "+x.name]))
  .concat(buyLists().map(L=>["liste:"+L.id,L.emo,"Liste: "+L.name]))}
const URL_RX=/https?:\/\/\S+/gi;
function shareSplit(text){const L=String(text||"").split(/\r?\n/).map(s=>s.replace(URL_RX,"").trim()).filter(s=>s&&!/^(#\S+\s*)+$/.test(s));
  const MK=/^(?:\d{1,2}\s*[.):]|[-•*–·▪►✓✔→]|(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[️‍\p{Extended_Pictographic}]*)\s*(.+)$/u;
  const marked=L.map(s=>{const m=MK.exec(s);return m?m[1].trim():null}).filter(s=>s&&s.length>1);
  if(marked.length>=2)return marked.map(s=>s.slice(0,80));
  const short=L.filter(s=>s.length<=60);if(L.length>=3&&short.length===L.length)return L.map(s=>s.slice(0,80));return []}
async function shareSave(to,name,link,note){const at=Date.now(),by=S.me||"",lk=safeLink(link)||null,nt=(note||"").trim().slice(0,1000)||null;name=String(name||"").trim().slice(0,80);
  if(to==="rezept")return S.store.setPath("food/rec/"+newId("r"),{name,ing:"",note:nt||"",link:lk||"",book:S.book||"main",at,by});
  if(to==="spiel")return S.store.setPath("food/play/"+newId("s"),{name,sec:"zuhause",link:lk,note:nt,at,by});
  if(to==="ausflug")return S.store.setPath("food/trip/"+newId("t"),{name,link:lk,note:nt,done:false,at,by});
  if(to==="geschenk")return S.store.setPath("food/idea/"+newId("p"),{name,cat:"geschenk",state:"idee",link:lk,note:nt,at,by});
  const [k,id]=to.split(":");
  if(k==="proj")return S.store.setPath("food/fund/"+newId("f"),{name,link:lk,note:nt,area:"haus",proj:id,kind:kindGuessHaus(name,lk)||"sonst",st:"idee",at,by});
  if(k==="liste")return S.store.setPath("food/buy/"+newId("b"),{name,list:id,link:lk,note:nt,done:false,at,by})}
function shareGo(to){const [k,id]=to.split(":");
  if(to==="rezept")return goNav("essen|ft:rezepte");if(to==="spiel")return goNav("spiel|ps:zuhause");if(to==="ausflug")return goNav("ausflug|tt:ideen");if(to==="geschenk")return goNav("geschenke|");
  if(k==="liste")return goNav("einkauf|bl:"+id);
  if(k==="proj"){const x=hprojs().find(y=>y.id===id);S.tab="amhaus";S.projFilter=x?hprojCat(x):"";S.hprojOpen=id;S.hsamm=false;render();window.scrollTo(0,0)}}
const shareTo=to=>(shareTargets().find(t=>t[0]===to)||[to,"",to]);
// Rezept behält den bisherigen Weg (Rezept aus Link: Text erkennen), ohne Aufteilen
function shareRecipe(txt){S.tab="essen";S.foodTab="rezepte";S.recDraft={id:null,name:"",ing:"",note:"",link:"",book:S.book||"main",paste:true,pasteText:txt};render();window.scrollTo(0,0);
  const el=document.getElementById("rec-paste");if(el){el.value=txt;const b=document.querySelector('[data-act="recparse"]');if(b)b.click()}}
function shareOpen(st,sx,su){S.mboxAt=Date.now();mboxClose();
  const urls=(String(sx||"").match(URL_RX)||[]),link=su||urls[0]||"",rest=String(sx||"").replace(URL_RX,"").trim();
  const first=rest.split(/\r?\n/).map(s=>s.trim()).find(Boolean)||"";
  const H={name:(st||(first.length<=80?first:"")||"").trim().slice(0,80),link,note:rest&&rest!==st?rest:"",to:SHARE_REC_RX.test(link)?"rezept":"",showNote:!!(rest&&rest!==st),split:false,off:{}};
  const el=document.createElement("div");el.id="mbox";
  const items=()=>H.to==="rezept"?[]:shareSplit(H.note);
  const splitHtml=()=>{const I=items();if(I.length<2)return "";const on=I.filter((_,i)=>!H.off[i]).length;
    return `<div class="unl"><button type="button" class="chipbtn neutral" data-shsplit aria-pressed="${H.split}">✂️ In ${I.length} Einträge aufteilen</button></div>${H.split?`<div class="freq">Jeder Eintrag behält den Link. Abwählen, was nicht mit soll (${on} von ${I.length}).</div><div class="unl">${I.map((t,i)=>`<button type="button" class="chipbtn neutral" data-shit="${i}" aria-pressed="${!H.off[i]}">${esc(t)}</button>`).join("")}</div>`:""}`};
  const draw=()=>{el.innerHTML=`<div class="mboxbg"></div><div class="mboxcard quickcard" role="dialog" aria-label="Geteilt: wohin?"><div class="section-head"><h2>📥 Wohin damit?</h2></div><form class="editbox" novalidate>
    <label class="fld"><span>Titel</span><input type="text" data-shf="name" value="${esc(H.name)}" maxlength="80" autocomplete="off" placeholder="Wie soll es heißen?"></label>
    <label class="fld"><span>Link</span><input type="text" inputmode="url" data-shf="link" value="${esc(H.link)}" maxlength="400" autocomplete="off" placeholder="https://"></label>
    <div class="fld"><span>Speichern bei</span><div class="unl">${shareTargets().map(t=>`<button type="button" class="chipbtn neutral" data-shto="${esc(t[0])}" aria-pressed="${H.to===t[0]}">${esc(t[1]+" "+t[2])}</button>`).join("")}</div>${H.to?"":`<div class="freq">Bitte antippen, wohin es soll.</div>`}</div>
    ${H.showNote?`<label class="fld"><span>Beschreibung (optional)</span><textarea data-shf="note" rows="5" maxlength="4000" placeholder="Text aus dem Beitrag hier einfügen">${esc(H.note)}</textarea></label><div id="shsplit">${splitHtml()}</div>`:`<button type="button" class="ghost" data-shnote>＋ Beschreibung einfügen</button>`}
    ${H.to==="rezept"?`<div class="freq">Rezept: Die App erkennt aus Titel, Text und Link Zutaten und Zubereitung, wie bei „Rezept aus Link“.</div>`:""}
    <div class="btnrow"><button class="primary" type="submit"${H.to?"":" disabled"}>Speichern</button><button class="ghost" type="button" data-shx>Abbrechen</button></div></form></div>`};
  draw();document.body.appendChild(el);
  el.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.shf;if(!k)return;H[k]=e.target.value;if(k==="note"){H.off={};const s=document.getElementById("shsplit");if(s)s.innerHTML=splitHtml()}});
  el.addEventListener("submit",async e=>{e.preventDefault();if(!H.to)return;const name=H.name.trim(),l=H.link.trim();
    if(l&&!safeLink(l)){toast("Der Link sieht nicht gültig aus.");return}
    if(H.to==="rezept"){mboxClose();shareRecipe([name,H.note,l].filter(Boolean).join("\n"));return}
    const I=H.split?items().filter((_,i)=>!H.off[i]):[];if(!I.length&&!name){toast("Bitte einen Titel eintragen.");return}
    mboxClose();const T=shareTo(H.to);
    try{if(I.length){for(const t of I)await shareSave(H.to,t,l,name?"Aus: "+name:"")}else await shareSave(H.to,name,l,H.note);
      toast((I.length>1?I.length+" Einträge":"Gespeichert")+" bei "+T[2]);shareGo(H.to)}catch(_){toast("Konnte nicht speichern. Bitte Verbindung prüfen.")}});
  el.addEventListener("click",e=>{const t=e.target.closest("[data-shto]");if(t){H.to=t.dataset.shto;draw();return}
    if(e.target.closest("[data-shsplit]")){H.split=!H.split;const s=document.getElementById("shsplit");if(s)s.innerHTML=splitHtml();return}
    const it=e.target.closest("[data-shit]");if(it){const i=+it.dataset.shit;H.off[i]=!H.off[i];const s=document.getElementById("shsplit");if(s)s.innerHTML=splitHtml();return}
    if(e.target.closest("[data-shnote]")){H.showNote=true;draw();const n=el.querySelector('[data-shf="note"]');if(n)n.focus();return}
    if(e.target.closest("[data-shx]")){mboxClose();return}
    if(e.target.closest(".mboxcard"))return;if(Date.now()-(S.mboxAt||0)<600)return;mboxClose()})}
// Verschieben nach: jeder gespeicherte Eintrag (Rezept, Spielidee, Ausflug, Idee, Fund in Am-Haus-Projekt, Eintrag in Weitere Listen) wandert in einen anderen Bereich; Verknüpftes geht mit dem alten Eintrag weg
async function tripDropAll(tid){await splitDropRef("trip:"+tid);await prioDropRef([tid]);const AD=(S.food&&S.food.adoor)||{};for(const k of Object.keys(AD))if(AD[k]&&AD[k].trip===tid)await S.store.setPath("food/adoor/"+k+"/trip",null);await S.store.setPath("food/trip/"+tid,null)}
function moveSrc(kind,id){const F=S.food||{};
  if(kind==="rec"){const r=recs().find(x=>x.id===id);return r&&{x:r,here:"rezept",note:[r.note,r.ing?"Zutaten:\n"+r.ing:""].filter(Boolean).join("\n\n"),drop:()=>recDrop(r),done:()=>{S.recDraft=null}}}
  if(kind==="play"){const p=plays().find(x=>x.id===id);return p&&{x:p,here:p.sec==="zuhause"?"spiel":"",note:p.note,drop:async()=>{await prioDropRef([id]);await S.store.setPath("food/play/"+id,null)},done:()=>{S.playDraft=null}}}
  if(kind==="trip"){const t=trips().find(x=>x.id===id);return t&&{x:t,here:"ausflug",note:t.note,drop:()=>tripDropAll(id),done:()=>{S.tripDraft=null}}}
  if(kind==="idea"){const p=projs().find(x=>x.id===id);return p&&{x:p,here:p.cat==="geschenk"?"geschenk":"",note:p.note,drop:async()=>{await prioDropRef([id]);await S.store.setPath("food/idea/"+id,null)},done:()=>{S.projDraft=null}}}
  if(kind==="fund"){const f=listOf(F.fund).find(x=>x.id===id);return f&&{x:f,here:f.area==="haus"&&f.proj?"proj:"+f.proj:"",note:f.note,drop:()=>fundDropAll(f),done:()=>{}}}
  if(kind==="buy"){const b=buys().find(x=>x.id===id);return b&&{x:b,here:"liste:"+b.list,note:b.note,drop:()=>S.store.setPath("food/buy/"+id,null),done:()=>{}}}
  return null}
function moveOpen(kind,id){const M=moveSrc(kind,id);if(!M)return;
  // Rezept: zuerst die anderen Kochbücher (Florian 16.11.2026: „von einem Kochbuch in ein anderes“), Umzug ohne Neuanlegen
  const bk=kind==="rec"?books().filter(b=>b.id!==recBook(M.x)).map((b,i)=>["book:"+b.id,"📚 Kochbuch: "+b.name]):[];
  editBox("Verschieben: "+M.x.name,[{k:"to",label:"Nach",type:"chips",opts:bk.concat(shareTargets().filter(t=>t[0]!==M.here).map(t=>[t[0],t[1]+" "+t[2]])),val:""},{k:"n",type:"note",label:(bk.length?"Ein anderes Kochbuch: Das Rezept zieht einfach um. ":"")+"In einen anderen Bereich: Der Eintrag zieht mit Name, Link und Notiz um und verschwindet hier. Verknüpftes (Erinnerungen, Einkaufsliste) wird dabei entfernt."}],
    async V=>{if(!V.to){toast("Bitte antippen, wohin.");return}
      if(V.to.startsWith("book:")){const to=books().find(b=>"book:"+b.id===V.to);if(!to)return;await S.store.setPath("food/rec/"+id+"/book",to.id);M.done();S.book=to.id;S.recOpen=id;toast(M.x.name+" steht jetzt in „"+to.name+"“.");render();return}
      await shareSave(V.to,M.x.name,M.x.link,M.note);await M.drop();M.done();toast("Verschoben nach "+shareTo(V.to)[2]);shareGo(V.to)})}
