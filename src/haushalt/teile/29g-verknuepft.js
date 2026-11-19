// ---------- „Verknüpft mit“ (Florian 19.11.2026 im Vergleichs-Dossier: „ja“) ----------
// Eine Zeile unten in jedem Fenster: was mit diesem Eintrag zusammenhängt (Rückverweise wie bei Notion). Tipp springt hin.
// verkItems(art,id) sucht in Erinnerungen (ref), Ausgaben (ref art:id), Terminen (ref art:id), Weitere Listen, Splitwise, Türchen und Einkaufsliste.
const VERK_KIND={trip:"🚲 Ausflug",play:"⚽ Spielidee",adoor:"🎄 Türchen",task:"🧹 Aufgabe",urlaub:"⛵ Urlaub",hproj:"🛠️ Projekt",fund:"🔖 Gemerkt",idea:"💡 Idee",mus:"🎵 Musik"};
function verkTarget(ref){const [k,id]=String(ref||"").split(":"),F=S.food||{};if(!id)return null;
  if(k==="trip"){const t=listOf(F.trip).find(x=>x.id===id);return t&&["🚲",t.name,`data-verktrip="${esc(id)}"`]}
  if(k==="play"){const p=listOf(F.play).find(x=>x.id===id);return p&&["⚽",p.name,`data-verkplay="${esc(id)}"`]}
  if(k==="adoor"){const d=(F.adoor||{})[id];return d&&["🎄","Türchen "+d.day+(d.name?": "+d.name:""),`data-verkadv="${esc(id)}"`]}
  if(k==="task"){const t=tasks().find(x=>x.id===id);return t&&["🧹",t.name,`data-nav="woche|"`]}
  if(k==="urlaub"){const u=listOf(F.urlaub).find(x=>x.id===id);return u&&[u.emo||"⛵",u.name,`data-reise="${esc(id)}"`]}
  if(k==="ter"){const t=listOf(F.termin).find(x=>x.id===id);return t&&[terIcon(t),t.name+(t.date?" · "+dLabel(t.date):""),`data-teredit="${esc(id)}"`]}
  return null}
function verkItems(kind,id,self){const F=S.food||{},L=[],key=kind+":"+id;if(!id)return L;
  if(self&&self.ref){const t=verkTarget(self.ref);if(t)L.push(t)}
  prios().filter(p=>p.ref===id||p.ref===key).forEach(p=>L.push(["🔔",p.name,`data-prioedit="${esc(p.id)}"`]));
  listOf(F.termin).filter(t=>t.ref===key).forEach(t=>L.push([terIcon(t),t.name+(t.date?" · "+dLabel(t.date):""),`data-teredit="${esc(t.id)}"`]));
  const g=geldFor(key);if(g.length)L.push(["💶",g.length===1?g[0].name:g.length+" Ausgaben",`data-go="ausgaben" data-geldlist="${esc(key)}"`]);
  buys().filter(b=>b.ref===key).forEach(b=>L.push(["🛍️",b.name,`data-nav="listen|bl:${esc(b.list)}"`]));
  splits().filter(s=>s.ref===key).forEach(s=>L.push(["🔗","Splitwise: "+s.name,`data-go="ausgaben"`]));
  if(kind==="trip")Object.keys(F.adoor||{}).forEach(k=>{const d=F.adoor[k];if(d&&d.trip===id)L.push(["🎄","Türchen "+d.day,`data-verkadv="${esc(k)}"`])});
  if(kind==="rec"&&self){const n=shopItems().filter(s=>!s.done&&s.src===self.name).length;if(n)L.push(["🧺",n+" auf der Einkaufsliste",`data-nav="einkauf|"`])}
  if(kind==="fund"&&self&&self.links){if(self.links.einkauf)L.push(["🧺","Einkaufsliste",`data-nav="einkauf|"`])}
  return L}
function verkHtml(kind,id,self){const L=verkItems(kind,id,self);if(!L.length)return "";
  return `<div class="verk"><div class="verkh">🔗 Verknüpft mit</div><div class="unl">${L.map(x=>`<button type="button" class="chipbtn neutral verkb" ${x[2]}>${x[0]} ${esc(String(x[1]).slice(0,48))} ›</button>`).join("")}</div></div>`}
// Aus einem Fenster (#mbox liegt außerhalb von #app): Fenster zu, dann denselben Knopf in der Seite auslösen
function verkGo(b){mboxClose();const c=b.cloneNode(true);c.style.display="none";c.classList.remove("verkb");const app=document.getElementById("app");app.appendChild(c);setTimeout(()=>{c.click();c.remove()},0)}
function verkFire(attr,v){const c=document.createElement("button");c.dataset[attr]=v;c.style.display="none";document.getElementById("app").appendChild(c);c.click();c.remove()}
function verkClick(b){const d=b.dataset;
  if(d.verktrip){goNav("ausflug|tt:ideen");verkFire("tripedit",d.verktrip);return true}
  if(d.verkplay){goNav("spiel|");verkFire("playedit",d.verkplay);return true}
  if(d.verkadv){const x=(S.food.adoor||{})[d.verkadv];if(!x)return true;S.prev=S.tab;S.tab="geschenke";S.projFilter="advent";S.advCal=x.cal;S.advDoor=x.day;render();window.scrollTo(0,0);return true}
  return false}
// Filter-Zeilen (Florian 19.11.2026 im Dossier: „ja“): jede Auswahl-Zeile beginnt mit „Alle“; solche Zeilen bekommen die Klasse fl (aktiver Filter mit ✕, Tipp darauf = Alle)
function flMark(root){root.querySelectorAll(".unl,.filters").forEach(r=>{if(r.closest(".fld,form,.verk"))return;const f=r.firstElementChild;if(f&&f.tagName==="BUTTON"&&/^Alle$/.test(f.textContent.trim())&&r.querySelectorAll(":scope>button").length>1)r.classList.add("fl")})}
// Nur, wenn der Knopf dieselbe Filter-Art schaltet wie „Alle“ (manche Zeilen mischen Arten, z. B. Für hier und Bei Regen)
function flSame(a,b){const k=o=>{const d=Object.keys(o.dataset)[0];return d?d+"="+String(o.dataset[d]).split("|")[0]:""};return k(a)!==""&&k(a)===k(b)}
