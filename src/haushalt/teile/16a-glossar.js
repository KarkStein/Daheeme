// ---------- Glossar (Florian 16.11.2026): Einstellungen › ❓ Glossar ----------
// Begriffe und Symbole vereinheitlicht (Florian 17.11.2026): acht Grundbegriffe oben, jedes Symbol hat nur eine Bedeutung.
// Gespeist aus den Listen der App, damit es nicht veraltet: Bereiche, Seiten und "Kurz erklärt" aus AREAS/AREA_GROUPS,
// Dinge im Bild aus PIC_SPOTS (12-startbild.js), Schnellmenüs aus QUICK, Seiten der 4 Reiter aus TAB_PAGES, Schalter aus S.gest.
// Fest stehen hier nur Begriffe, Symbole und Gesten. Neuer Begriff = eine Zeile in GLOS_TERMS ([Begriff, Erklärung, Sprung-Attribut]).
// Die Suche (Lupe) findet Begriffe und Dinge im Bild und öffnet das Glossar mit dem Wort im Filter (data-glosq).
const TAB_PAGES={camp:["Haus","Kalender","Wichtig"],woche:WEEK_ORDER.map(i=>WEEK_PAGES[i]),essen:["Heute und Wochenplan","Rezepte"],einkauf:["Einkaufsliste","Ausgaben","Weitere Listen"]};
const GLOS_TERMS=[
  ["Bereich","Ein Thema der App mit eigenem Symbol und Ding im Bild, z. B. Essen, Ausflüge und Reisen, Am Haus, Geschenke.","data-allar"],
  ["Projekt","🧩 Etwas mit Ziel und Ende, z. B. ein Urlaub, das Kinderzimmer oder der Adventskalender. Sammelt, was ihr euch dafür merkt.",'data-nav="projekte|pf:alle"'],
  ["Gemerkt","🔖 Alles, was ihr euch für später merkt: Ausflugsziel, Unterkunft, Möbel, Geschenk, Spielidee, Playlist. Jeder Eintrag hat eine Art, einen Stand und auf Wunsch ein Projekt.",'data-nav="projekte|"'],
  ["Art","Was für ein Ding etwas ist, z. B. Unterkunft, Möbel, Spielplatz. Jede Art hat ein Symbol, Sonstiges ist überall 📎.",""],
  ["Stand","Wie weit etwas ist, überall dieselbe Leiter: 💡 Idee, ⭐ Favorit, 📅 Geplant, ▶️ Läuft, ✅ Erledigt. Ein Tipp aufs Schild schaltet weiter.",""],
  ["Sammlung","🗃️ Am Leuchtturm: alles Gemerkte aus allen Bereichen auf einen Blick, mit Filtern nach Bereich und Stand. Dazu Sonstiges und Alle Projekte.",'data-nav="projekte|"'],
  ["Vorschlag","✨ Was die App oder die Recherche anbietet, z. B. Tagesrezepte oder Was ist los. Ein Tipp übernimmt oder merkt es.",""],
  ["Liste","Zum Abhaken: Einkaufsliste, Weitere Listen, Packliste, Mitbringen.",'data-nav="einkauf|"'],
  ["Geschenke","🎁 Eigener Bereich unter Wir: Geschenke für alle mit Stand und für wen, dazu der Adventskalender. Auf 📅 Geplant erscheinen sie bei Einkauf › Weitere Listen › Geschenke.",'data-nav="geschenke|"'],
  ["Hausdienst","Wer an einem Tag Hausdienst hat, ist für zu Hause da und bringt und holt das Kind nicht, das macht der andere. Geht auch geteilt: vormittags der eine, nachmittags der andere. Im Reiter Haushalt gibt es dafür zwei Felder: Einteilen (wer hat wann den Dienst) und Heute abhaken (bei der Person, die heute dran ist).",'data-nav="woche|wp:0"'],
  ["Wichtig","Der eine Ort für alle Erinnerungen. Die 🔔 oben links zählt, was in den nächsten 24 Stunden fällig oder schon überfällig ist, dazu Termine mit 🔔.",'data-nav="wichtig|"'],
  ["Erinnerung","Etwas, woran die App erinnert, mit Tag und Uhrzeit, auf Wunsch wiederholt. Steht unter Wichtig.",'data-nav="wichtig|"'],
  ["Termin","Steht im Kalender, mit Zeit, Ort und Personen. Zählt an der Glocke nur, wenn an ihm 🔔 angetippt ist.",'data-nav="woche|wp:3"'],
  ["Kalender","Die Drehscheibe für alles mit Datum: eigene Termine, Kita, Erinnerungen, Wochenplan, Urlaube, Ausflüge, Kurse, Familywall, Ferien und Feiertage. Als Liste ab heute oder als Monat.",'data-nav="woche|wp:3"'],
  ["Farbstreifen","Im Kalender steht links an jedem Termin ein Streifen in der Farbe der Person, dazu ihr Kürzel. Termine für alle haben keinen.",'data-nav="woche|wp:3"'],
  ["Termin-Art","Kita, Arzt, Familie, Feier, Sport, Arbeit oder eine eigene. Ihr Symbol steht im Kalender vor dem Termin. Eigene Arten lassen sich mit lange drücken löschen.",'data-nav="woche|wp:3"'],
  ["Wer wählt aus","Ein Termin mit mehreren Möglichkeiten. Eine Person wählt aus oder beide stimmen ab. Bis dahin steht er gestrichelt im Kalender.",'data-nav="woche|wp:3"'],
  ["Familywall","Termine aus Familywall erscheinen im Kalender (👪). Ändern geht nur dort. In der App könnt ihr Person, Art, Ort und 🔔 ergänzen oder sie ausblenden.",'data-nav="woche|wp:3"'],
  ["Ferien und Feiertage","Bayern, im Kalender als Hintergrund. Brückentage stehen bei Urlaube.",'data-nav="woche|wp:3"'],
  ["Gespeicherte Orte","Orte mit Adresse, z. B. Kita, einmal unter Einstellungen › Ort und Wetter angelegt. 🚆 findet dann die Verbindung dorthin. Die Adresse bleibt in eurer Datenbank.",'data-setgo="ort"'],
  ["Tag und Woche","Erste Seite im Reiter Haushalt: oben das Dashboard für heute, darunter „Heute dran“ und die ganze Woche.",'data-nav="woche|wp:0"'],
  ["Dashboard","Der Tag auf einen Blick: Wetter, Zeitstrahl mit Terminen, Kita und Abendessen, drei Zähler und der Doppelring.",'data-nav="woche|wp:0"'],
  ["Doppelring","Oben rechts im Dashboard. Außen die Wechsel-Aufgaben der Woche, innen deine Aufgaben von heute. Die Zahl in der Mitte gilt für heute.",'data-nav="woche|wp:0"'],
  ["Heute dran","Deine täglichen Aufgaben von heute plus die noch offenen der Woche, zum Abhaken.",'data-nav="woche|wp:0"'],
  ["Wechsel-Aufgaben","Aufgaben, die jede Woche zwischen euch wechseln (Paket A und B). Nur sie zählen im Wochenstand.",'data-nav="woche|wp:1"'],
  ["Wochenstand","Wie viel der Wechsel-Aufgaben dieser Woche erledigt ist. Leuchtturm oder Kirchtürme im Bild leuchten heller, je mehr geschafft ist.",'data-nav="woche|wp:0"'],
  ["Wer macht was","Welche Aufgaben bei wem liegen, mit Aufwand. Zweite Seite im Reiter Haushalt.",'data-nav="woche|wp:1"'],
  ["Bringen und Abholen","Wer das Kind in die Kita bringt und wer es holt, Montag bis Freitag. Hängt am Hausdienst und ist keine Aufgabe. Steht oben auf der Seite Kita.",'data-nav="kita|"'],
  ["Mitbringen","Was in die Kita mitmuss. Abgehakt heißt: liegt in der Kita. „Wird knapp“ holt es zurück.",'data-nav="kita|ks:tasche"'],
  ["Wochenplan","Das Abendessen für jeden Tag der Woche, darüber klein das Kita-Mittagessen. Start, Dashboard und Essen › Heute lesen von hier.",'data-nav="essen|ft:plan"'],
  ["Tagesrezepte","Jeden Tag neue Vorschläge aus der Recherche, eins je Kategorie. Oben auf der Seite Rezepte, erst eingeklappt.",'data-nav="essen|ft:rezepte"'],
  ["Kochbuch","Eine Sammlung eurer eigenen Rezepte. Ein Rezept lässt sich in ein anderes Kochbuch schieben.",'data-nav="essen|ft:rezepte"'],
  ["Wunsch-Suche","Sucht nach Lust, mit oder ohne Zutat oder ähnlich wie ein Gericht. Erst in euren Rezepten, dann im Netz.",'data-nav="essen|ft:rezepte"'],
  ["Einkaufsliste","Was im Laden gekauft wird. Zutaten aus Rezepten kommen als Block dazu und gehen als Block wieder weg.",'data-nav="einkauf|"'],
  ["Heute nötig","❗ an einem Eintrag der Einkaufsliste: muss heute noch gekauft werden. Zählt mit den Zutaten fürs heutige Abendessen unter „Heute einkaufen“.",'data-nav="einkauf|"'],
  ["Immer im Haus","Euer Vorrat. Steht er in einem Rezept, kommt er beim Übertragen nicht auf die Einkaufsliste.",'data-nav="einkauf|"'],
  ["Weitere Listen","Alles, was nicht in den Supermarkt gehört: Kleidung, Geschenke, Baumarkt und eigene Listen.",'data-nav="einkauf|bl:"'],
  ["Ausgaben","Was ihr ausgebt und wer wem etwas schuldet. Zweite Seite von Einkauf.",'data-go="ausgaben"'],
  ["Ausgleichen","Rechnet aus, wer wem wie viel schuldet, und trägt den Ausgleich ein.",'data-go="ausgaben"'],
  ["Feste Zahlungen","Was jeden Monat, jedes Quartal oder Jahr gleich anfällt. Wird von selbst als Ausgabe eingetragen.",'data-go="ausgaben"'],
  ["Gruppe","Ausgaben für einen Anlass, z. B. einen Urlaub, mit eigenem Stand und Budget. Standard ist „Haushalt“.",'data-go="ausgaben"'],
  ["Gemeinsames Konto","Als Zahler wählbar. Zählt bei den Ausgaben, aber nicht im Stand zwischen euch.",'data-go="ausgaben"'],
  ["Alle Projekte","Alle laufenden Projekte aus Am Haus, Urlaube und Adventskalender auf einer Seite. Die Projekte selbst bleiben in ihrem Bereich.",'data-nav="projekte|pf:alle"'],
  ["Zeigen bei","Einmal ablegen, überall finden: Jeder gemerkte Eintrag bleibt ein Eintrag. Im Bearbeiten-Fenster wählt ihr, wo er zusätzlich steht (Geschenke, Spielen, Hörspiele und Tonies, Kind, Am Haus, Reisen). Stand und Änderungen gelten überall.",'data-nav="projekte|"'],
  ["Lose gemerkt","Am Haus: Gemerktes, das noch zu keinem Projekt gehört. 🧩 macht ein Projekt daraus.",'data-nav="amhaus|"'],
  ["Adventskalender","24 Türchen fürs Kind, von beiden gefüllt. Kleinigkeiten stehen bei Weitere Listen › Geschenke.",'data-nav="geschenke|pf:advent"'],
  ["Packliste","Was mitmuss. Jeder Urlaub hat seine eigene Packliste, Vorlagen für Ausflüge stehen unter Reisen.",'data-nav="ausflug|tt:packs"'],
  ["Geht immer","Feste Ausflugsziele für jede Zeit, z. B. Tierpark. Darunter, was zur Jahreszeit passt.",'data-nav="ausflug|tt:ideen"'],
  ["Was ist los","Aktuelle Tipps für die Stadt und das Umland, jede Woche neu aus der Recherche.",'data-nav="ausflug|tt:ideen"'],
  ["Recherchen","Feste Suchaufträge, die Claude regelmäßig erledigt, und eure Wünsche dafür. Neues zeigt „🤖 neu“.",'data-nav="recherchen|"'],
  ["Briefe","Unter Partner: kleine Briefe nur für euch zwei.",'data-nav="privat|pv:briefe"'],
  ["Schnellmenü","Lange auf ein Ding im Bild drücken: die häufigsten Handgriffe dieses Bereichs.",""],
  ["Alle Bereiche","Das Kachel-Symbol oben rechts: alle Bereiche und Seiten auf einem Bildschirm, je Gruppe in einer Farbe, oben Angeheftetes oder zuletzt Genutztes.","data-allar"],
  ["Morgen-Briefing","Meldung aufs Handy um 7 Uhr mit Terminen, Kita, Erinnerungen und Abendessen. Einschalten unter Benachrichtigungen.",'data-setgo="push"']];
const GLOS_SYM=[["🔔","Erinnern. Oben links: zählt, was in 24 Stunden fällig oder überfällig ist."],["❗","Heute nötig (Einkaufsliste)."],["✅","Stand Erledigt (gebucht, gekauft, gemacht). Am To-do auf Start: alles geschafft."],["⬜","Noch offen. Ein Tipp hakt ab."],
  ["🏠","Start und Zuhause."],["🔑","Hausdienst."],["🚆","Verbindung mit Bahn und MVV in Google Maps, von hier oder von zu Hause."],["📍","Ort. Steht es allein am Termin, fehlt noch ein Ort."],["📞","Anrufen. Die Nummer bleibt versternt."],
  ["✎","Bearbeiten."],["✕","Entfernen."],["↩","Rückgängig."],["↺","Zurückholen oder wie geplant."],["↪","Verschieben in einen anderen Bereich oder eine andere Liste."],
  ["🍲","Kochen: für einen Tag in den Wochenplan."],["⚡","Geht schnell, gut für volle Tage. Im Wochenplan: Schnellwahl."],["📖","Rezept öffnen."],["🔗","Link öffnen."],["🛒","Auf die Einkaufsliste."],
  ["📌","Fest: jede Woche so (Kind) oder oben angeheftet (Alle Bereiche)."],["💡","Stand Idee: gemerkt, noch unverbindlich."],["⭐","Stand Favorit: engere Wahl oder Liebling."],["📅","Stand Geplant, oder: in den Kalender."],["▶️","Stand Läuft: gerade dabei."],["🔖","Gemerkt, oder etwas merken."],["🗃️","Die Sammlung: alles Gemerkte auf einen Blick."],["📎","Sonstiges."],["💛","Gerade beliebt beim Kind: bei Ausflügen, Kinderliedern und Hörspielen."],["💿","Playlist (Musik)."],["🐣","Kinderlied, gern mit Liedtext zum Mitsingen (📝)."],["🎧","Hörspiel oder Tonie. Auf 📅 Geplant steht es bei Einkauf › Geschenke."],["🎤","Einzelner Song (Musik)."],["💤","Gute Nacht (Musik)."],["🪥","Rituale wie Zähneputzen oder Aufräumen (Musik)."],["📝","Text zum Lesen: Kita-Infos, Rückblick im Urlaub, Liedtext."],["🗳️","Termin mit mehreren Möglichkeiten: bitte wählen."],
  ["🤖","Neu aus der Recherche. Bei „Saugen komplett“: der Saugroboter."],["✨","Vorschlag (auch Spielplatz der Woche)."],["💶","Ausgabe eintragen oder verknüpfte Ausgaben ansehen."],["🧩","Projekt, oder aus Gemerktem ein Projekt machen."],["🗄️","Archiv: Vorjahre, Abgeschlossenes, vergangene Wochen."],["🛠️","Am Haus."],["🎁","Geschenke."],["❓","Glossar."],
  ["👪","Kommt aus Familywall."],["🙈","In der App ausblenden (Familywall)."],["⏳","Noch nicht dran, oder noch so viele Tage."],["🏷️","Kategorien bearbeiten, im Bild: Beschriftungen."],["👕","Packlisten-Eintrag auch auf Weitere Listen › Kleidung."]];
const areaName=t=>{const a=AREAS.find(x=>x[2]===t);return a?a[1]:t};
// Wohin ein Ding im Bild führt, als Bereich (Kalender steht unter Start, Urlaube unter Reisen, Ausgaben unter Einkauf)
const picArea=go=>go==="woche|wp:3"?"camp":({reisen:"ausflug",ausgaben:"einkauf",post:""}[go.split("|")[0]]??go.split("|")[0]);
function glosGest(){const G=S.gest||{},T=Object.keys(TAB_PAGES),pg=n=>T.filter(t=>TAB_PAGES[t][n]).map(t=>areaName(t)+" › "+TAB_PAGES[t][n]).join(", ");
  return [["Tipp auf einen anderen Reiter","Öffnet dessen erste Seite.",""],["Tipp auf den Reiter, in dem du bist","Blättert eine Seite weiter, nach der letzten wieder zur ersten.","tap"],
    ["Doppeltipp auf einen Reiter",pg(1)+".","tap"],["Dreifachtipp auf einen Reiter",pg(2)+".","tap"],["Lange auf den Reiter Start","Familie und Zuhause: "+fanItems("camp").map(t=>t[1]+(t[3].length?" ("+t[3].map(s=>s[0]).join(", ")+")":"")).join(", ")+". Finger auf einen Eintrag oder eine Seite daneben gleiten lassen und loslassen öffnet sie.","ring"],["Lange auf den Reiter Einkauf","Freizeit und Gemerktes: "+fanItems("einkauf").map(t=>t[1]+(t[3].length?" ("+t[3].map(s=>s[0]).join(", ")+")":"")).join(", ")+".","ring"],["Kachel oben rechts","Öffnet Alle Bereiche.",""],
    ["Wischen nach links oder rechts","Blättert die Seiten der Leiste oben (z. B. Haus, Kalender, Wichtig). Wechselt nie den Bereich. Auf Zeilen, die seitlich scrollen, bewegt es nur die Zeile.","swipe"],["Lange auf ein Ding im Bild","Schnellmenü mit den häufigsten Handgriffen (siehe Im Bild).",""],
    ["Tipp auf Sonne oder Mond","Klappt das Wetter auf: Sonnenzeiten, Mond, heute stündlich, 6 Tage.",""],["Tipp auf eine freie Stelle im Bild","Öffnet Tag und Woche.",""],
    ["Tipp auf den Doppelring","Deine Aufgaben von heute. Lange drücken: die Aufgaben der Woche.",""],["Lange auf einen Tag im Kalender","Neuer Termin an diesem Tag.",""],["Lange auf einen Termin oder eine Listen-Zeile","Zeigt „✕ Löschen“, ein Tipp darauf löscht (mit Rückgängig), ein Tipp daneben bricht ab. Geht im Kalender, bei Erinnerungen, Gemerktem, Weiteren Listen, Packlisten, Rezepten und in der Kita. Familywall-Termine lassen sich nur ausblenden.",""],
    ["Lange auf eine eigene Termin-Art","Löscht die Art, mit Rückfrage.",""],["Lange auf eine Ausgabe","Andere Gruppe, nochmal eintragen oder löschen.",""],
    ["Lange auf einen Eintrag in Alle Bereiche","Heftet ihn oben an, bis zu fünf.",""],["Lange auf den Briefkasten","Auswahl, was du dem anderen schickst.",""],
    ["Zurück-Taste","Schließt ein offenes Fenster, sonst einen Schritt zurück.",""],["Tipp neben ein Fenster","Schließt es.",""]].map(g=>g[2]&&!G[g[2]]?[g[0],g[1]+" Bei dir ausgeschaltet (Bedienung).",'data-setgo="bedienung"']:[g[0],g[1],""])}
// Abschnitte: [Schlüssel, Überschrift, Zeilen [Begriff, Erklärung, Sprung-Attribut, Gruppen-Zeile?, Symbol-Zeile?]]
function glosSecs(){const city=motiv()==="stadt",R=[];
  {const L=picSpots(city).map(p=>{const qk=quickKeyOf(p[4],p[8],p[5]),q=qk&&qk!=="post"&&QUICK[qk],to=p[5].split(":")[0];
     let d=p[4]==="post"?"Tipp: Nachricht an den anderen per WhatsApp. Lange drücken: Auswahl.":"Öffnet "+to+(p[4]==="projekte"?". Leuchtet heller, je mehr Wechsel-Aufgaben der Woche erledigt sind":"")+".";
     if(q)d+=" Lange drücken: "+q[1].map(x=>x[1]).join(", ")+".";
     return [p[6],d,p[4]==="post"?"":p[4].includes("|")?`data-nav="${p[4]}"`:`data-go="${p[4]}"${p[8]?` data-pf="${p[8]}"`:""}`]});
   L.push(["☀️ Sonne oder 🌙 Mond","Klappt das Wetter auf.",""],["Freie Stelle im Bild","Öffnet Tag und Woche.",'data-nav="woche|wp:0"']);
   const other=PIC_SPOTS.filter(p=>p[7]&&p[7]!==(city?"stadt":"meer"));
   if(other.length)L.push([city?"Im Haus am Meer":"Im Haus in der Stadt","Dort statt dessen: "+other.map(p=>p[6].replace(/^\S+ /,"")+" ("+p[5].split(":")[0]+")").join(", ")+". Motiv wechseln unter Aussehen.",'data-setgo="aussehen"']);
   R.push(["bild","🖼️ Im Bild"+(city?" (Haus in der Stadt)":" (Haus am Meer)"),L])}
  {const L=[],pics=picSpots(city),one=a=>{const sub=a[5]().map(x=>x[0]),pc=pics.filter(p=>picArea(p[4])===a[2]).map(p=>p[6].replace(/^\S+ /,""));
     L.push([a[0]+" "+a[1],(a[7]||"")+(TAB_PAGES[a[2]]?" Reiter unten.":"")+(sub.length?" Seiten: "+sub.join(", ")+".":"")+(pc.length?" Im Bild: "+pc.join(", ")+".":""),`data-nav="${a[2]}|"`])};
   AREAS.filter(a=>!a[6]).forEach(one);
   AREA_GROUPS.forEach(g=>{const A=AREAS.filter(a=>a[6]===g[0]);if(!A.length)return;L.push([g[1]+" "+g[2],"","",1]);A.forEach(one)});
   R.push(["bereiche","🗂️ Bereiche",L])}
  R.push(["begriffe","📚 Begriffe",GLOS_TERMS.slice().sort((a,b)=>a[0].localeCompare(b[0],"de"))]);
  R.push(["symbole","🔣 Symbole",GLOS_SYM.map(s=>[s[0],s[1],"",0,1])]);
  R.push(["gesten","👆 Gesten",glosGest()]);
  return R}
const glosWords=()=>sNorm(S.glosQ||"").split(/\s+/).filter(Boolean);
const glosHit=(k,W)=>W.every(w=>k.includes(w));
function glosHtml(){const W=glosWords(),O=S.glosOpen||(S.glosOpen={});let n=0;
  const secs=glosSecs().map(([k,t,L])=>{let hits=0;
    const rows=L.map(r=>{if(r[3])return `<div class="glosgrp">${esc(r[0])}</div>`;const key=sNorm(r[0]+" "+r[1]),hide=W.length&&!glosHit(key,W);if(!hide)hits++;
      const inner=`<b>${esc(r[0])}</b><span>${esc(r[1])}</span>${r[2]?"<i>›</i>":""}`,cls="glosrow"+(r[4]?" glossym":"");
      return r[2]?`<button class="${cls}" ${r[2]} data-gk="${esc(key)}"${hide?" hidden":""}>${inner}</button>`:`<div class="${cls}" data-gk="${esc(key)}"${hide?" hidden":""}>${inner}</div>`}).join("");
    n+=hits;const open=W.length?hits>0:!!O[k];
    return `<div class="glossec" data-gs="${k}"${W.length&&!hits?" hidden":""}><button class="setsum glossum" data-glossec="${k}" aria-expanded="${open}"><h3>${t}</h3><i>${open?"▾":"›"}</i></button><div class="glosb${W.length?" filt":""}"${open?"":" hidden"}>${rows}</div></div>`}).join("");
  return `<div class="freq">Was im Bild, in den Bereichen und an Symbolen wohin führt. Ein Tipp auf eine Zeile mit › springt hin.</div>
   <div class="glosq"><input id="glosq" type="search" value="${esc(S.glosQ||"")}" placeholder="Wort suchen, z. B. Hausdienst" autocomplete="off" enterkeyhint="search" aria-label="Im Glossar suchen"></div>
   <div class="freq glosnone"${W.length&&!n?"":" hidden"}>Nichts gefunden. Die Lupe oben sucht auch in euren Einträgen.</div>${secs}`}
// Filtern beim Tippen ohne Neuzeichnen (Fokus bleibt im Feld); dieselbe Regel wie in glosHtml
function glosApply(){const W=glosWords(),O=S.glosOpen||{};let n=0;
  document.querySelectorAll(".glossec").forEach(sec=>{const k=sec.dataset.gs,b=sec.querySelector(".glosb"),bt=sec.querySelector(".glossum");let hits=0;
    sec.querySelectorAll("[data-gk]").forEach(r=>{const ok=!W.length||glosHit(r.dataset.gk,W);r.hidden=!ok;if(ok)hits++});
    n+=hits;const open=W.length?hits>0:!!O[k];sec.hidden=!!(W.length&&!hits);b.hidden=!open;b.classList.toggle("filt",!!W.length);bt.setAttribute("aria-expanded",open);bt.querySelector("i").textContent=open?"▾":"›"});
  const nn=document.querySelector(".glosnone");if(nn)nn.hidden=!(W.length&&!n)}
// Für die Suche (Lupe): Begriffe und Dinge im Bild
function glosSearch(add){GLOS_TERMS.forEach(t=>add("Glossar","📖",t[0],"Glossar",`data-setgo="glossar" data-glosq="${esc(t[0])}"`));
  picSpots(motiv()==="stadt").forEach(p=>add("Glossar",p[6].split(" ")[0],p[6].replace(/^\S+ /,""),"Im Bild › "+p[5].split(":")[0],`data-setgo="glossar" data-glosq="${esc(p[6].replace(/^\S+ /,""))}"`))}
