// ---------- Kita (Rucksack) ----------
const KITA_SECS=[["termine","📅","Termine"],["essen","🍽️","Essen"],["tasche","📦","Mitbringen"],["infos","📝","Infos"]];
// Mitbringen (Florian 15.11.2026): offen = muss mit, done = liegt in der Kita; verbunden mit Einkaufsliste (Block KITA_SRC), Erinnerung "morgen früh", Wochenaufgabe Bringen, Rückseite
const KITA_SRC="Kita: Mitbringen";
const kitaBring=()=>kitas().filter(x=>x.sec==="tasche"&&!x.done).sort((a,b)=>(a.at||0)-(b.at||0));
const kitaMitTermine=()=>{const t=ymd(new Date()),z=ymd(addDays(new Date(),7));return kitas().filter(x=>x.sec==="termine"&&x.kind==="mit"&&x.date&&x.date>=t&&x.date<=z).sort((a,b)=>a.date<b.date?-1:1)};
const kitaShopOf=n=>shopItems().filter(i=>!i.done&&i.name.trim().toLowerCase()===String(n||"").trim().toLowerCase());
const onShop=n=>shopItems().some(i=>!i.done&&i.name.trim().toLowerCase()===String(n).trim().toLowerCase());
function parseKitaPlan(txt){const m=/(\d{1,2})\.(\d{1,2})\./.exec(txt||"");if(!m)return null;const now=new Date();let y=now.getFullYear();const mo=+m[2]-1;if(mo-now.getMonth()>6)y--;if(now.getMonth()-mo>6)y++;
  const mon=mondayOf(new Date(y,mo,+m[1],12)),days={},clean=s=>s.replace(/\s*\([^)]*\)/g,"").replace(/\s+/g," ").replace(/[\s,;]+$/,"").trim();
  const DN=["montag","dienstag","mittwoch","donnerstag","freitag"],KEY={"frühstück":"fr","fruehstueck":"fr","mittag":"text","mittagessen":"text","nachspeise":"na","nachtisch":"na","dessert":"na","brotzeit":"bz","vesper":"bz","snack":"bz","nachmittag":"bz"};let cur=-1,pend=null;
  const NA_RX=/[,;]?\s*(?:Nachspeise|Nachtisch|Dessert)\s*:?\s*/i;
  const put=(k,v)=>{const d=days["d"+cur];if(k==="text"){const p=v.split(NA_RX);v=p[0];if(p[1]&&clean(p[1]))d.na=clean(p[1])}const c=clean(v);if(!c)return;d[k]=d[k]&&pend===k?d[k]+", "+c:c};
  for(const raw of txt.split(/\n/)){let line=raw.trim();if(!line)continue;
    const dm=/^([A-Za-zÄÖÜäöüß]+)\b[\s,.:]*(?:\d{1,2}\.\d{1,2}\.?(?:\d{2,4})?)?[\s,:–-]*(.*)$/.exec(line),di=dm?DN.indexOf(dm[1].toLowerCase()):-1;
    if(di>=0){cur=di;days["d"+di]=days["d"+di]||{};pend=null;line=dm[2].trim();if(!line)continue}
    if(cur<0)continue;
    const lm=/^([A-Za-zÄÖÜäöüß]+)\s*:?\s*(.*)$/.exec(line),k=lm&&KEY[lm[1].toLowerCase()];
    if(k){if(lm[2].trim()){pend=null;put(k,lm[2]);pend=k}else pend=k;continue}
    if(pend)put(pend,line)}
  return Object.keys(days).length?{mon,days}:null}
const kitaMeals=mon=>((S.food&&S.food.kitaplan)||{})[wkKey(mon)]||{};
const KITA_BAG=["Wechselkleidung","Windeln","Feuchttücher","Matschhose","Gummistiefel","Hausschuhe","Sonnenhut","Sonnencreme","Brotdose","Trinkflasche","Kuscheltier"];
const kitas=()=>listOf(S.food&&S.food.kita);
