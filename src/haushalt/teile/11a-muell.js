// Müllkalender (Florian 21.11.2026: „Stadt München reicht“): Abholtage der AWM München für die eigene Adresse.
// Der Lauf muell.yml im privaten Repo holt sie wöchentlich und schreibt food/ext/muell {at,n,items:[{date,type:rest|bio|papier|wert,moved?}]}.
// Im Kalender je Tonne eine eigene Quelle (filterbar unter Bereiche), nur lesend: kein Bearbeiten, kein Löschen.
const MUELL=[["rest","⚫","Restmüll"],["bio","🟤","Biotonne"],["papier","🔵","Papiertonne"],["wert","🟡","Wertstoff"]];
MUELL.slice(0,3).forEach(m=>CAL_LBL.push(["m_"+m[0],m[1],m[2]]));
const muellItems=()=>{const m=S.food&&S.food.ext&&S.food.ext.muell;return m&&m.items?Object.values(m.items).filter(x=>x&&x.date&&x.type):[]};
const muellOf=t=>MUELL.find(m=>m[0]===t)||["","🗑️","Müll"];
CAL_SRC.push((a,z)=>muellItems().filter(x=>x.date>=a&&x.date<=z).map(x=>{const m=muellOf(x.type);return {d:x.date,t:"",ad:true,name:m[2],icon:m[1],src:"m_"+x.type,who:"both",muell:1,note:"Am Vorabend rausstellen."+(x.moved?" Verschoben (Feiertag).":"")}}));
// Für „Heute Abend rausstellen“: Tonnen, die morgen geleert werden
const muellTomorrow=()=>{const k=ymd(addDays(new Date(),1));return muellItems().filter(x=>x.date===k).map(x=>muellOf(x.type))};
