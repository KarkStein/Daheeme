// ---------- Spielen (Ball), seit der Bündelung 17.11.2026 Seite unter Kind (Kind | Kita | Spielen); Spielplätze sind nach Reisen und Ausflüge umgezogen (migPlayTrip) ----------
const playSecs=()=>catsOf("play",PLAY_SECS);
const PLAY_SECS=[["zuhause","🎲","Spielideen zu Hause"],["sport","🤸","Sport und Kurse"],["sonst","📎","Sonstiges"]];
const PLAY_HINT={spielplatz:["Zum Beispiel Wasserspielplatz am Park","Was gibt es dort? Schatten, Sandkasten, Toilette …"],zuhause:["Zum Beispiel Höhle aus Decken bauen","Wie geht es?"],sport:["Zum Beispiel Kinderturnen","Wo, Kosten, Anmeldung"],sonst:["Zum Beispiel Schwimmflügel kaufen","Worum geht es?"]};
const PLAY_AGE=[["1","ab 1"],["2","ab 2"],["3","ab 3"],["4","ab 4"],["6","ab 6"]];
const PLAY_WX=[["drinnen","☔ Drinnen"],["draussen","☀️ Draußen"],["egal","Beides"]];
// Musik (Entwurf 15.11.2026, Ausbau Florian 17.11.2026): nur Links, kein Abspielen.
// food/music/<id> {name,link,svc,art?:playlist|lied|hoer|song,occ (Komma-Liste aus musOcc),fav?,like?,st?,txt?,note?,emo?,at,by}
// Art: Playlist, Kinderlied, Hörspiel/Tonie, Song. Hörspiele haben die Stand-Leiter (📅 Geplant = Geschenk bei Einkauf › Weitere Listen › Geschenke, ✅ = haben wir),
// alles andere ⭐ Favorit. 💛 Gerade beliebt nur bei Sachen fürs Kind (Kinderlied, Hörspiel, Anlass Kinder/Gute Nacht/Rituale), steht dann auch auf der Seite Kind.
const MUS_ART=[["playlist","💿","Playlist"],["lied","🐣","Kinderlied"],["hoer","🎧","Hörspiel/Tonie"],["song","🎤","Song"]];
const musArt=m=>MUS_ART.find(a=>a[0]===((m&&m.art)||"playlist"))||MUS_ART[0];
const MUS_OCC=[["kochen","🍳","Kochen"],["kinder","🧒","Kinder"],["nacht","💤","Gute Nacht"],["ritual","🪥","Rituale"],["auto","🚗","Autofahrt"],["abend","🌙","Abend"],["party","🎉","Party"],["ruhe","😌","Entspannen"],["sport","🏃","Sport"],["sonst","📎","Sonstiges"]];
const MUS_ST=[["idee","💡","Idee"],["favorit","⭐","Favorit"],["geplant","📅","Geplant"],["erledigt","✅","Haben wir"]];
const musSt=m=>MUS_ST.find(s=>s[0]===(m.st||"idee"))||MUS_ST[0];
const musKid=m=>m.art==="lied"||m.art==="hoer"||csv(m.occ).some(k=>k==="kinder"||k==="nacht"||k==="ritual");
const musFav=m=>m.art==="hoer"?m.st==="favorit":!!m.fav;
const MUS_SVC=[[/spotify\./i,"Spotify","🟢"],[/music\.apple\./i,"Apple Music","🍎"],[/music\.youtube\./i,"YouTube Music","▶️"],[/youtube\.|youtu\.be/i,"YouTube","▶️"],[/deezer\./i,"Deezer","🟣"],[/tidal\./i,"Tidal","🌊"],[/music\.amazon\.|amazon\.[a-z.]+\/music/i,"Amazon Music","📦"],[/soundcloud\./i,"SoundCloud","☁️"],[/tonies\./i,"Tonies","🟥"]];
const musics=()=>listOf(S.food&&S.food.music).sort((a,b)=>(b.like?1:0)-(a.like?1:0)||(musFav(b)?1:0)-(musFav(a)?1:0)||(a.at||0)-(b.at||0));
// Eigene Rubriken (Florian 16.11.2026): food/musocc/<id> {ic,name}; zusammen mit den festen MUS_OCC
const musOcc=()=>{const m=(S.food&&S.food.musocc)||{};return MUS_OCC.concat(Object.keys(m).filter(k=>m[k]&&m[k].name).map(k=>[k,m[k].ic||"🎵",m[k].name,true]))};
function musSvc(u){const m=MUS_SVC.find(x=>x[0].test(u||""));return m?[m[1],m[2]]:["Link","🔗"]}
function musOccGuess(t){t=String(t||"").toLowerCase();return MUS_OCC.filter(o=>({kochen:/koch|küche|dinner|essen/,kinder:/kinder|kids|kita|baby|lieder/,nacht:/gute ?nacht|schlaflied|einschlaf|wiegenlied|sandmann|sleep/,ritual:/aufräum|zähne|zahnputz|anzieh|hände ?wasch|ritual/,auto:/auto|fahrt|road ?trip|reise|urlaub|drive/,abend:/abend|night|chill/,party:/party|tanz|dance|hits/,ruhe:/ruhe|relax|entspann|piano|calm/,sport:/sport|workout|lauf|run|fitness|yoga/}[o[0]]||/$^/).test(t)).map(o=>o[0])}
function musArtGuess(t,u){const s=(String(t||"")+" "+String(u||"")).toLowerCase(),l=String(u||"").toLowerCase();if(/tonies?\b|tonies\.|hörspiel|hoerspiel|hörbuch|hoerbuch|audible|folge \d/.test(s))return "hoer";if(/\/playlist|[?&]list=/.test(l))return "playlist";if(/kinderlied(?!er)|schlaflied|wiegenlied|gute-?nacht-?lied|zähneputzlied|aufräumlied/.test(s))return "lied";if(/open\.spotify\.com\/(intl-[a-z]+\/)?track|music\.apple\.com\/.*[?&]i=|\/song\/|youtube\.com\/watch|youtu\.be\//.test(s))return "song";return "playlist"}
function musName(u,art){const sv=musSvc(u)[0],w=art==="song"?"Song":art==="hoer"?"Hörspiel":art==="lied"?"Kinderlied":"Playlist";if(/spotify|deezer|tidal/i.test(sv))return sv+"-"+w;try{const p=new URL(u).pathname.split("/").filter(Boolean),i=p.indexOf("playlist"),seg=i>=0&&p[i+1]&&!/^pl\.|^\d+$|^[A-Za-z0-9_-]{18,}$/.test(p[i+1])?p[i+1]:"";if(seg){const n=decodeURIComponent(seg).replace(/[-_+]+/g," ").trim();return n.charAt(0).toUpperCase()+n.slice(1)}if(/tonies/i.test(sv)){const n=nameFromLink(u);if(n)return n}}catch(_){}return sv+"-"+w}
function musLinks(occ,max){const L=musics().filter(m=>safeLink(m.link)&&(csv(m.occ).includes(occ)||(occ==="kinder"&&(m.art==="lied"||m.art==="hoer")&&m.st!=="geplant"&&m.st!=="idee"))).slice(0,max||3);return L.length?`<div class="musrow">🎵 ${L.map(m=>`<a href="${esc(safeLink(m.link))}" target="_blank" rel="noopener">${m.like?"💛 ":""}${esc(m.name)}</a>`).join(" · ")}<button class="linkbtn" data-go="musik" data-musf="${occ}">›</button></div>`:""}
// Gerade beliebt beim Kind (💛), für die Seite Kind
function musLikedRow(){const L=musics().filter(m=>m.like&&musKid(m));if(!L.length)return "";return `<div class="musrow">💛 ${L.slice(0,4).map(m=>{const u=safeLink(m.link);return u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(musArt(m)[1])} ${esc(m.name)}</a>`:`${esc(musArt(m)[1])} ${esc(m.name)}`}).join(" · ")}<button class="linkbtn" data-go="musik" data-musf="like">›</button></div>`}
function musRow(m){const u=safeLink(m.link),sv=musSvc(m.link),a=musArt(m),oc=csv(m.occ).map(k=>musOcc().find(o=>o[0]===k)).filter(Boolean),kid=musKid(m);
  const sub=[a[2]].concat(oc.map(o=>o[2])).join(" · ")+(u?" · "+sv[1]:"")+gmAlso(m);
  const right=a[0]==="hoer"?(()=>{const s=musSt(m);return `<button class="stbadge st-${s[0]}" data-musst="${esc(m.id)}" aria-label="Stand von ${esc(m.name)}: ${s[2]}, antippen schaltet weiter">${s[1]} ${s[2]}</button>`})()
    :`<button class="catbtn routebtn" data-musfav="${esc(m.id)}" aria-pressed="${!!m.fav}" aria-label="${m.fav?"Kein Favorit mehr":"Als Favorit markieren"}">${m.fav?"⭐":"☆"}</button>`;
  return `<li class="mk"><a class="mkb" ${u?`href="${esc(u)}" target="_blank" rel="noopener"`:""}><span class="mki">${esc(m.emo||a[1])}</span><span class="mkt"><b>${esc(m.name)}</b><span class="freq">${esc(sub)}</span>${m.note?`<span class="freq">${esc(m.note)}</span>`:""}</span></a>${m.txt?`<button class="catbtn routebtn" data-mustxt="${esc(m.id)}" aria-expanded="${S.musTxt===m.id}" aria-label="Liedtext ${S.musTxt===m.id?"zuklappen":"zeigen"}">📝</button>`:""}${kid?`<button class="catbtn routebtn muslk" data-muslike="${esc(m.id)}" aria-pressed="${!!m.like}" aria-label="${m.like?"Nicht mehr gerade beliebt":"Gerade beliebt"}">💛</button>`:""}${right}<button class="catbtn routebtn" data-musedit="${esc(m.id)}" aria-label="${esc(m.name)} bearbeiten">✎</button></li>${S.musTxt===m.id&&m.txt?`<li class="mustxt">${esc(m.txt)}</li>`:""}`}
function musDraftOf(m){m=m||{};return {id:m.id||"",name:m.name||"",link:m.link||"",occ:m.occ||"",note:m.note||"",emo:m.emo||"",art:m.art||"playlist",st:m.st||"idee",like:!!m.like,txt:m.txt||""}}
function renderMusic(){const d=S.musDraft,F=S.musFilter||"",AF=S.musArtF||"";
  let h=`<div><div class="eyebrow">Für zu Hause und unterwegs</div><h1>🎵 Musik</h1></div>`;
  if(d){const a=d.art||"playlist",ph={playlist:["z. B. Kochen am Sonntag","https://open.spotify.com/playlist/…"],lied:["z. B. Alle meine Entchen","https://www.youtube.com/…"],hoer:["z. B. Tonie: Die Raupe Nimmersatt","https://tonies.com/…"],song:["z. B. Unser Lied","https://open.spotify.com/track/…"]}[a];
    return h+`<section class="card"><h2>${d.id?"✎ Bearbeiten":"🎵 Neu bei Musik"}</h2>
    <div class="fld"><span>Art</span><div class="unl">${MUS_ART.map(x=>`<button type="button" class="chipbtn neutral" data-musart="${x[0]}" aria-pressed="${a===x[0]}">${x[1]} ${x[2]}</button>`).join("")}</div></div>
    <label class="fld"><span>Was</span><input id="mu-name" data-muf="name" value="${esc(d.name)}" maxlength="80" placeholder="${ph[0]}" autocomplete="off"></label>
    <label class="fld"><span>Link (Spotify, Apple Music, YouTube, Tonies …)</span><input type="url" data-muf="link" value="${esc(d.link)}" placeholder="${ph[1]}" autocomplete="off"></label>
    ${a==="hoer"?`<div class="fld"><span>Stand</span><div class="unl">${MUS_ST.map(x=>`<button type="button" class="chipbtn neutral" data-musstd="${x[0]}" aria-pressed="${(d.st||"idee")===x[0]}">${x[1]} ${x[2]}</button>`).join("")}</div><div class="freq">Auf 📅 Geplant steht es als Geschenk für ${esc(kidName())} bei Einkauf › Weitere Listen › Geschenke. Abhaken dort = ✅ Haben wir.</div></div>`:""}
    <div class="fld"><span>Wofür?</span><div class="unl">${musOcc().map(o=>`<button type="button" class="chipbtn neutral" data-musocc="${o[0]}" aria-pressed="${csv(d.occ).includes(o[0])}">${esc(o[1])} ${esc(o[2])}</button>${o[3]?`<button type="button" class="rm" data-musoccrm="${o[0]}" aria-label="Rubrik ${esc(o[2])} löschen">✕</button>`:""}`).join("")}</div>
      <div class="addrow" style="margin-top:6px"><input data-musnewic value="" maxlength="8" placeholder="🎻" aria-label="Symbol der neuen Rubrik" style="width:60px;flex:0 0 60px"><input data-musnewnm value="" maxlength="30" placeholder="Neue Rubrik, z. B. Baden" aria-label="Name der neuen Rubrik"><button type="button" class="ghost" data-act="musoccadd">＋</button></div></div>
    ${musKid(d)?`<div class="fld"><span>Beim Kind</span><div class="unl"><button type="button" class="chipbtn neutral" data-muslk="1" aria-pressed="${!!d.like}">💛 Gerade beliebt</button></div><div class="freq">Steht dann oben und auf der Seite ${esc(kidName())}.</div></div>`:""}
    ${a==="lied"?`<label class="fld"><span>Liedtext zum Mitsingen (optional)</span><textarea data-muf="txt" rows="5" maxlength="4000">${esc(d.txt||"")}</textarea></label>`:""}
    <label class="fld"><span>Eigenes Symbol (optional, ein Emoji)</span><input data-muf="emo" value="${esc(d.emo||"")}" maxlength="8" placeholder="${musArt(d)[1]}" autocomplete="off" style="width:90px"></label>
    <label class="fld"><span>Notiz</span><input data-muf="note" value="${esc(d.note)}" maxlength="120" autocomplete="off"></label>
    ${gmMaskRow("mus",d.id)}<div class="btnrow"><button class="primary" data-act="mussave">Speichern</button><button class="ghost" data-act="muscancel">Abbrechen</button></div>${d.id?maskFoot(verkHtml("mus",d.id),"",`data-act="musdel"`):""}</section>`}
  const all=musics(),cA={},cO={};all.forEach(m=>{const k=musArt(m)[0];cA[k]=(cA[k]||0)+1;csv(m.occ).forEach(o=>cO[o]=(cO[o]||0)+1)});
  const L=all.filter(m=>(!AF||musArt(m)[0]===AF)&&(!F||(F==="like"?m.like:F==="fav"?musFav(m):csv(m.occ).includes(F))));
  const chA=(v,t)=>`<button class="chipbtn neutral" data-musartf="${v}" aria-pressed="${AF===v}">${t}</button>`,chO=(v,t)=>`<button class="chipbtn neutral" data-musfilter="${v}" aria-pressed="${F===v}">${t}</button>`;
  h+=`<section class="card"><form id="musform" class="addrow" novalidate><input id="musin" placeholder="Link oder Name einfügen" maxlength="400" autocomplete="off" aria-label="Link oder Name"><button class="primary" type="submit">+</button></form><div class="freq" style="margin-top:4px">Playlist, Song, Kinderlied, Hörspiel oder Tonie: in der App Teilen › Link kopieren, hier einfügen. Die Art erkennt die App, ändern mit ✎.</div></section>`;
  h+=`<section data-fk="f_mus|1" class="card muscard"><div class="section-head" style="align-items:center"><h2>🔖 Gemerkt <span class="freq">(${all.length})</span></h2><button class="primary" data-act="musnew">＋ Merken</button></div>`;
  if(all.length)h+=`<div class="unl scrollrow">${chA("","Alle")}${MUS_ART.filter(a=>cA[a[0]]||AF===a[0]).map(a=>chA(a[0],`${a[1]} ${a[2]} ${cA[a[0]]||0}`)).join("")}</div>
    <div class="unl scrollrow">${chO("","Alle")}${all.some(m=>m.like)||F==="like"?chO("like","💛 Gerade beliebt"):""}${all.some(musFav)||F==="fav"?chO("fav","⭐ Favoriten"):""}${musOcc().filter(o=>cO[o[0]]||F===o[0]).map(o=>chO(o[0],`${esc(o[1])} ${esc(o[2])}`)).join("")}</div>`;
  const GG=(!AF||AF==="hoer")&&!F?gmRows("hoer"):"";
  h+=L.length||GG?`<ul class="mklist">${L.map(musRow).join("")}${GG}</ul>`:`<div class="freq">${all.length?"Für diesen Filter ist nichts gemerkt.":"Noch nichts gemerkt. Link einfügen genügt. Playlists erscheinen dann auch beim Kochen, bei Urlaub und Ausflügen und unter Spiel zu Hause."}</div>`;
  if(all.length)h+=`<div class="freq">Tipp auf den Namen öffnet den Link. ⭐ Favorit, 💛 gerade beliebt beim Kind, bei Hörspielen schaltet das Schild den Stand weiter.</div>`;
  return h+`</section>`}
const plays=()=>listOf(S.food&&S.food.play).filter(x=>!x.moved);
// Spielplätze ziehen um (Florian 17.11.2026, „Sport auflösen“): aus food/play (Art Spielplatz) wird ein Ausflugsziel für hier food/trip/tpl_<id> mit Art „spiel“.
// Feste Id, damit zwei Geräte nichts doppelt anlegen; das Original bleibt mit moved:"trip:<id>" liegen (rückholbar) und ist überall ausgeblendet.
async function migPlayTrip(){if(S.migPlay||!S.food||!S.food.play)return;S.migPlay=1;
  // nur fertige Einträge: ohne sec zählt nur mit at (playsave schreibt Feld für Feld, at zuletzt), sonst würde ein halb gespeicherter neuer Eintrag mitgenommen
  for(const x of listOf(S.food.play).filter(y=>!y.moved&&(y.sec==="spielplatz"||(!y.sec&&y.at&&y.name)))){const tid="tpl_"+x.id,st=playSt(x),note=[x.age?"Ab "+x.age+" Jahren.":"",x.note||""].filter(Boolean).join(" ").slice(0,500),o={name:x.name||"Spielplatz",kind:"spiel",at:x.at||Date.now(),by:x.by||"",done:st==="erledigt"};
    if(x.emo)o.emo=x.emo;if(x.link)o.link=x.link;if(note)o.note=note;if(x.wx==="egal"||x.wx==="drinnen")o.wx="egal";if(st==="favorit")o.fav=true;if(st==="erledigt")o.doneAt=x.at||Date.now();
    try{if(!(S.food.trip&&S.food.trip[tid]))await S.store.setPath("food/trip/"+tid,o);await S.store.setPath("food/play/"+x.id+"/moved","trip:"+tid)}catch(_){S.migPlay=0;return}}}
function nameFromLink(u){try{const p=new URL(u).pathname.split("/").filter(Boolean);let s=p.reverse().find(x=>/[a-zäöüß]{3}/i.test(x)&&!/^\d+$/.test(x))||"";s=decodeURIComponent(s).replace(/\.(html?|php|aspx?)$/i,"").replace(/[-_+]+/g," ").replace(/\b\d{3,}\b/g,"").replace(/\s+/g," ").trim();return s?s.charAt(0).toUpperCase()+s.slice(1):""}catch(_){return ""}}
// Sport und Spiel im Gemerkt-Bauplan (Florian 17.11.2026, wie Reisen und Musik): eine Karte „🔖 Gemerkt“ mit „＋ Merken“ und 🗺️ (Spielplatz-Karte),
// zwei wischbare Filterzeilen Art (S.playSec, "" = Alle, Sprung spiel|ps:<art>) und Wo/Stand (S.playF), Zeilen li.mk, Stand-Leiter am Schild (food/play/<id>/st, fav bleibt = Favorit)
const PLAY_ST=[["idee","💡","Idee"],["favorit","⭐","Favorit"],["geplant","📅","Geplant"],["erledigt","✅","Erledigt"]];
const playSt=x=>x.st||(x.fav?"favorit":"idee");
const playSecOf=x=>{const s=x.sec||"spielplatz";return s==="links"||!playSecs().some(p=>p[0]===s)?"sonst":s};
const playOut=x=>playSecOf(x)==="spielplatz"||x.wx==="draussen"||x.wx==="egal",playIn=x=>x.wx==="drinnen"||x.wx==="egal";
const telPlain=s=>{let t=String(s||"");telNums(t).forEach(m=>{t=t.split(m).join("📞 "+telMask(m))});return t};
function renderPlay(){const d=S.playDraft,PS=playSecs(),F=S.playF||"",cur=PS.find(s=>s[0]===S.playSec);
  let h=`<div><div class="eyebrow">Kind</div><h1>Spielen</h1></div>${bellRow("spiel")}`;
  if(d){const sec=PS.find(s=>s[0]===d.sec)||PS[0],x=d.id&&plays().find(y=>y.id===d.id),one=(f,L)=>`<div class="unl">${L.map(c=>`<button class="chipbtn" data-plset="${f}" data-v="${c[0]}" aria-pressed="${d[f]===c[0]}">${c[1]}</button>`).join("")}</div>`,hint=PLAY_HINT[d.sec]||["",""];
    return h+`<section class="card tripform"><h2>${d.id?"✎ Bearbeiten":"🔖 Merken bei Spielen"}</h2>
    <div class="fld"><span>Art</span><div class="unl">${PS.map(s=>`<button type="button" class="chipbtn" data-plset="sec" data-v="${esc(s[0])}" aria-pressed="${d.sec===s[0]}">${esc(s[1])} ${esc(s[2])}</button>`).join("")}</div></div>
    ${d.sec==="zuhause"&&!d.id?`<label class="fld"><span>Link zur Spielidee (füllt den Namen vor)</span><input type="url" id="pl-link0" data-plf="link" value="${esc(d.link)}" placeholder="https://…" autocomplete="off"></label>`:""}
    <label class="fld"><span>Was</span><input type="text" id="pl-name" data-plf="name" value="${esc(d.name)}" maxlength="80" placeholder="${esc(hint[0])}" autocomplete="off"></label>${emoFld("data-plf",d.emo,sec[1])}
    ${d.sec==="links"?"":d.sec==="spielplatz"?"":`<div class="fld"><span>Wo?</span>${one("wx",PLAY_WX)}</div>`}
    ${d.sec==="links"?"":`<div class="fld"><span>Alter</span>${one("age",PLAY_AGE)}</div>`}
    ${d.sec==="zuhause"?`<label class="fld"><span>Was braucht man?</span><input type="text" id="pl-mat" data-plf="mat" value="${esc(d.mat)}" maxlength="120" placeholder="Decken, Wäscheklammern" autocomplete="off"></label>`:""}
    ${d.sec==="sport"?`<label class="fld"><span>Wann?</span><input type="text" id="pl-when" data-plf="when" value="${esc(d.when)}" maxlength="60" placeholder="Zum Beispiel samstags 10 Uhr" autocomplete="off"></label>`:""}
    ${d.sec==="zuhause"&&!d.id?"":`<label class="fld"><span>${d.sec==="spielplatz"?"Link aus Google Maps (sonst sucht die App nach dem Namen)":"Link"}</span><input type="url" id="pl-link" data-plf="link" value="${esc(d.link)}" placeholder="https://…" autocomplete="off"></label>`}
    <div class="fld"><span>Stand</span><div class="unl">${PLAY_ST.map(s=>`<button type="button" class="chipbtn" data-plset="st" data-v="${s[0]}" aria-pressed="${(d.st||"idee")===s[0]}">${s[1]} ${s[2]}</button>`).join("")}</div></div>
    <label class="fld"><span>Notiz</span><textarea id="pl-note" data-plf="note" rows="3" placeholder="${esc(hint[1])}">${esc(d.note)}</textarea></label>
    ${gmMaskRow("play",d.id)}
    <div class="btnrow"><button class="primary" data-act="playsave">Speichern</button><button class="ghost" data-act="playcancel">Abbrechen</button>${x?bell("spiel",x):""}</div>${d.id?maskFoot(verkHtml("play",d.id,plays().find(x=>x.id===d.id)),`data-move="play|${esc(d.id)}"`,`data-act="playdel"`):""}</section>`}
  const all=plays(),open=all.filter(x=>playSt(x)!=="erledigt"),cS={},STO={favorit:0,geplant:1,idee:2,erledigt:3};open.forEach(x=>{const k=playSecOf(x);cS[k]=(cS[k]||0)+1});
  const R=all.filter(x=>(!cur||playSecOf(x)===cur[0])&&(F==="draussen"?playOut(x):F==="drinnen"?playIn(x):true)&&(F==="erledigt"?playSt(x)==="erledigt":F==="favorit"?playSt(x)==="favorit":playSt(x)!=="erledigt"))
    .sort((a,b)=>STO[playSt(a)]-STO[playSt(b)]||(a.name||"").localeCompare(b.name||"","de"));
  const n=S.playMore?R.length:Math.min(R.length,10);
  const chS=(v,t)=>`<button class="chipbtn neutral" data-playsec="${esc(v)}" aria-pressed="${(cur?cur[0]:"")===v}">${t}</button>`,chF=(v,t)=>`<button class="chipbtn neutral" data-playf="${v}" aria-pressed="${F===v}">${t}</button>`;
  const badge=x=>{const s=PLAY_ST.find(y=>y[0]===playSt(x))||PLAY_ST[0];return `<button class="stbadge st-${s[0]}" data-playst="${esc(x.id)}" aria-label="Stand von ${esc(x.name)}: ${s[2]}, antippen schaltet weiter">${s[1]} ${s[2]}</button>`};
  const row=x=>{const k=playSecOf(x),s=PS.find(p=>p[0]===k)||PS[PS.length-1],lk=safeLink(x.link),sp=k==="spielplatz",done=playSt(x)==="erledigt",nt=telPlain(x.note);
    const sub=[cur?"":s[2],x.age?"ab "+x.age:"",x.wx==="drinnen"?"☔ drinnen":x.wx==="draussen"?"☀️ draußen":x.wx==="egal"?"drinnen und draußen":"",x.when?"🕒 "+x.when:"",x.mat?"🧺 "+x.mat:""].filter(Boolean).join(" · ")+gmAlso(x);
    return `<li class="mk"><button class="mkb" data-playedit="${esc(x.id)}" aria-label="${esc(x.name)} ansehen und ändern"><span class="mki">${esc(x.emo||s[1])}</span><span class="mkt"><b>${esc(x.name)}</b>${sub?`<span class="freq">${esc(sub)}</span>`:""}${nt?`<span class="freq">${esc(nt.length>90?nt.slice(0,88)+" …":nt)}</span>`:""}</span></button>${telA(x.note)}${lk||sp?`<a class="catbtn routebtn" href="${esc(lk||"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.name))}" target="_blank" rel="noopener" aria-label="${sp?"In Google Maps öffnen":"Link öffnen"}">${sp?"🗺️":"🔗"}</a>`:""}${sp&&!done?transitA(x.name):""}${badge(x)}</li>`};
  h+=`<section data-fk="f_play|1" class="card playcard"><div class="section-head" style="align-items:center"><h2>🔖 Gemerkt <span class="freq">(${open.length+gmGuests("spiel").filter(i=>i.st!=="erledigt").length})</span></h2><button class="primary" data-act="playnew">＋ Merken</button></div>
    <div class="unl scrollrow">${chS("","Alle")}${PS.map(s=>chS(s[0],`${esc(s[1])} ${esc(s[2])}${cS[s[0]]?" "+cS[s[0]]:""}`)).join("")}${catBtn("play")}</div>
    <div class="unl scrollrow">${chF("","Alle")}${chF("draussen","☀️ Draußen")}${chF("drinnen","☔ Drinnen")}${chF("favorit","⭐ Favoriten")}${chF("erledigt","✅ Erledigt")}</div>`;
  const GL=cur||F==="draussen"||F==="drinnen"?[]:gmGuests("spiel").filter(i=>F?i.st===F:i.st!=="erledigt");
  h+=R.length||GL.length?`<ul class="mklist">${R.slice(0,n).map(row).join("")}${GL.map(i=>gmRow(i,"spiel")).join("")}</ul>${R.length>n?`<button class="ghost small" data-act="playmore">Alle ${R.length} zeigen</button>`:""}`
    :`<div class="freq">${all.length?"Für diesen Filter ist nichts gemerkt.":"Noch nichts gemerkt. Spielideen für zu Hause, Sport und Kurse legt ihr mit ＋ Merken an. Ihr seht beide dieselbe Liste."}</div>`;
  if(cur&&cur[0]==="zuhause")h+=musLinks("kinder",3);
  h+=`<div class="freq">Ein Tipp auf den Namen ändert den Eintrag, das Schild rechts schaltet den Stand weiter: 💡 Idee, ⭐ Favorit, 📅 Geplant, ✅ Erledigt.</div><div class="btnrow"><button class="ghost" data-nav="ausflug|rk:spielplatz">🛝 Spielplätze stehen unter Reisen und Ausflüge ›</button></div></section>`;
  return h}
