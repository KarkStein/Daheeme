# Daheeme: Haushalts-App (Übergabe für jeden neuen Thread)

Gemeinsame Haushalts-App für zwei Personen (p0 und p1, Namen stehen in der App-Konfiguration). Sprache der App und aller Antworten: Deutsch, kurze klare Sätze. Der Besitzer arbeitet meist am Android-Handy und möchte Klick-für-Klick-Anleitungen.

Live: https://karkstein.github.io/Daheeme/ (GitHub Pages aus `main`, Wurzelverzeichnis). App-Name ist das Emoji-Paar 🏕️🧹, URL und Repo bleiben "Daheeme".

## Aufbau

- Eine einzige Seite, Vanilla JS, kein Framework. Quelle: `src/haushalt/haushalt.html`. Alle Funktionen kommen dort hinein.
- `node src/build-web.js <firebase-url>` baut daraus `src/web/index.html` (fügt Firebase-Abgleich, Einladungs-Link, Kopfzeilen ein). Das Ergebnis wird nach `index.html` in die Wurzel kopiert und von Pages ausgeliefert. Das Skript arbeitet mit Text-Ankern in der Quelle; bricht ein Anker, meldet es `missing: …`.
- Abgleich: Firebase Realtime Database über REST und EventSource, ohne SDK. Basis `https://haushalt-32464-default-rtdb.europe-west1.firebasedatabase.app/haushalt/<geheimer Schlüssel>`. Der Schlüssel steht nur im Link (`#k=…`) und im localStorage `hq-key`, nie im Repo.
- Firebase-Regeln: `{"rules":{"haushalt":{"$key":{".read":true,".write":true}}}}`
- `manifest.json` hat absichtlich kein `start_url`, damit `#k=` erhalten bleibt. Icons: `src/icon.svg` über `src/make-icons.js`.
- `ideen.json` (Wurzel): Rezeptideen der Recherche, Format `{updated, items:[{name, cat, source, link, ing[], note}]}`; `ing` sind Zutaten mit Mengen für 4 Personen ("500 g Kürbis"), die App trägt sie unverändert weiter (Rezept, Essensplan, Einkaufsliste). `quellen.txt`: Webseiten für die Recherche, eine pro Zeile, nach Kategorie gruppiert. `vorlieben.txt`: Besonderheiten, die die Recherche in jeder Kategorie beachtet.

## Datenmodell (unter dem Schlüssel)

- `config`: `persons`, `rotOffset`, `tasks[{id,name,owner:p0|p1|rot|both|ho,freq:day|week|month|half|year,times,pts,pack?:A|B}]`, `camp:{costs,extras[{id,emoji,name,cost}]}`
- `weeks/<YYYY-Www>/ticks/<key>` = `{by,at}`; Schlüssel `<id>__<slot>`, `<id>__p` (Monat und länger), `<id>__<slot>_p0/_p1` (halbe Häkchen bei owner both)
- `food/shop/<id>` `{name,done,at,by,doneAt,cat?,src?}` (`src` = Name des Rezepts, wenn die Zutat als Block von einem Rezept, einer Idee oder dem Wochenplan kam; so lässt sich der Block auf einmal entfernen), `food/fav/<hash>` `{name,n,cat?}`, `food/pantry` = Vorrat "Immer im Haus" als Zeilen-Text (fehlt er, gilt `PANTRY_DEF`); `shopAddMany` lässt Zutaten weg, die ein Vorrat-Wort als ganzes Wort enthalten (`isPantry`), im Rezept bleiben sie stehen
- `food/rec/<id>` `{name,ing (Zeilen),note,link,at}`, `food/plan/<YYYY-Www>/d0..d6` `{text,rec?,at,by}`
- `food/lunch/<id>` `{name,dishes,note,maps,at,r:{p0,p1}}`, `food/lunchmap` = Link zu Google Maps
- Ausflüge (liegen unter `food`, damit der Abgleich nichts Neues braucht): `food/trip/<id>` `{name,note,link,kind,wx,dur,drive,kid,cost,season,pack,at,by,done,doneAt}` (`kid` und `season` sind Komma-Listen, `pack` ist die Id einer Packliste), `food/packlist/<id>` `{name,at}` (die Liste "Tagesausflug" mit Id `main` ist fest), `food/pack/<id>` `{name,done,at,list?}` (Packliste bleibt, "Alles wieder auspacken" setzt nur `done` zurück)
- Ideen (Leuchtturm) und Am Haus (Lampe) teilen sich `food/idea/<id>` `{name,cat,state,for?,link,note,at,by,done,doneAt}`; `cat` aus `PROJ_CATS`: geschenk, sonst (Leuchtturm), wohnen, ordnung, haus (Reparieren), garten (Am Haus); alte `spiel` zählt als sonst; `PROJ_GROUPS` ordnet zu, `state` idee|geplant|dran, `for` nur bei Geschenken
- Kita (Rucksack): `food/kita/<id>` `{name,sec,date?,kind?,note?,done?,at}`; `sec` termine|tasche|infos; `food/kitaplan/<YYYY-Www>/d0..d4` `{text,at}` `{text (Mittag),fr?,na?,bz?,at}` = Kita-Essen; der Besitzer kopiert den Speiseplan als Text aus der Kita-App und fügt ihn ein, `parseKitaPlan` erkennt Woche, Tage, Frühstück, Mittag, Nachspeise, Brotzeit und streicht Kürzel in Klammern. Mittag erscheint auch im Essensplan; die Eingabe gibt es im Rucksack und als Knopf "🎒 Kita" im Bereich Essen (`renderKitaMeals`); `date` als YYYY-MM-DD, `kind` fest|zu|eltern|mit. Termine der nächsten 7 Tage stehen auf der Startseite unter "Heute".
- Wichtig (Prio-Feld, nur im Entwurf): `food/prio/<id>` `{name,from,ref?,due?,time?,at,by}`; `from` kita|projekte|amhaus|ausflug|spiel|einkauf|rezepte|mittag|frei, `ref` = Id des Eintrags im Bereich. Die Glocke 🔔 an Einträgen (`bell()`) legt an oder nimmt weg; auf der Startseite unter "Heute" ersetzt "Wichtig" (`renderPrio`) die Zeile Einkaufsliste. Unter dem Tagesgericht steht ein Minialarm (`todayMissing`), wenn Zutaten des heutigen Gerichts noch offen auf der Einkaufsliste stehen. ⏰ setzt Datum und Uhrzeit: vorher blass, ab dem Tag fett. Abhaken löscht. Kita-Termine bringen ihr Datum mit. Oben rechts sitzt im Entwurf die Glocke statt des Zahnrads (Zahl = fällige Einträge); sie und die Überschrift "Wichtig" auf der Startseite öffnen `renderWichtig` (Tab `wichtig`) mit allen Erinnerungen, sortierbar nach Datum, Bereich oder "Zuletzt dazu". Die Startseite zeigt höchstens 5. Maske (`renderPrioMask`, `S.prioDraft`): Knopf "🔔 Erinnerung" oben in jedem Bereich (`bellRow`), Felder Was, Vorlagen (`PRIO_TPL` plus eigene in `food/priotpl/<bereich>/<id>` `{name}`), Bereich (`PRIO_AREAS`), Gehört zu (`ref`), Tag, Uhrzeit, Wiederholen (`rep` w|m: Abhaken schiebt das Datum weiter), Notiz. `parseWhen` erkennt heute, morgen, übermorgen, Wochentag, dd.mm., "in 3 Tagen", "nächste Woche", "um 9", "9:30"; `detectArea` (Liste `AREA_KW`) wählt den Bereich. "Mehrere einlesen": eine Erinnerung pro Zeile. Erinnerung bisher nur in der App; Handy-Benachrichtigung ist ein späterer Schritt.
- Wochenvorschlag (Essen, Karte "✨ Woche vorschlagen" im Essensplan und unter Rezepte, für beide): `suggestWeek` füllt freie Tage aus `weekPool()` = `wochenideen.json` + `ideen.json` + eigene Rezepte. Regeln: nichts mit derselben Hauptzutat wie das Kita-Mittagessen (`hauptOf`, Liste `HAUPT_KW`), keine Suppe nach Kita-Suppe; volle Tage (`dayStress`: eigene ⚡-Markierung in `food/planx/<YYYY-Www>/dN/stress`, 2+ fällige Erinnerungen, Kita-Termin; später Kalender) bekommen höchstens 30 Minuten; Wetter von Open-Meteo für `food/wxplace` `{name,lat,lon}`: kalt oder nass bevorzugt `wx:"kalt"`, ab 22° `wx:"warm"`. Übernehmen einzeln (✓) oder alle; ↻ würfelt einen Tag neu; ✕ nimmt einen Tag aus dem Vorschlag; 📖＋ speichert ein Gericht als eigenes Rezept. Entfernen überall: ✕ am Plantag (nimmt auch den Zutaten-Block von der Einkaufsliste, wenn kein anderer Tag ihn braucht), "Entfernen" am Rezept (Block, Plan-Verweise und Erinnerungen gehen mit). Übernommene Tage speichern `link` und `ing` (Zeilen), "Zutaten der Woche auf die Einkaufsliste" nimmt sie mit. `wochenideen.json` (Wurzel) schreibt die geplante Aufgabe "Wöchentliche Wochenrezepte Daheeme" samstags 5:17 Uhr Berlin: `{updated,week,items:[{name,source,link,ing[],min,wx:kalt|warm|egal,haupt,art,veg,note}]}`.
- Sport und Spiel (Ball): `food/play/<id>` `{name,sec,age?,wx?,mat?,when?,link,note,fav?,at,by}`; `sec` spielplatz|zuhause|sport|sonst (alte `links` zählen als sonst); `food/playmap` = Link zur Spielplatz-Karte (Meine Karten wird eingebettet)

## Testen und Veröffentlichen

```
node src/build-web.js http://localhost:8765 && timeout 90 node src/mock-test.js | tail -1   # muss "SYNC OK" zeigen
node src/build-web.js https://haushalt-32464-default-rtdb.europe-west1.firebasedatabase.app && cp src/web/index.html index.html
git add -A && git commit && git push origin main
```

`src/mock-test.js` ist ein Firebase-Ersatz plus Test mit zwei Geräten (Playwright). Aus der Cloud-Sitzung sind firebasedatabase.app und github.io nicht erreichbar; die echte Datenbank wurde nur vom Besitzer am Handy geprüft. Vorschau der Jahreszeiten: `?saison=winter|spring|summer|autumn`. Startbild Haus am Meer (Entwurf, noch nicht freigeschaltet): `?bild=haus` schaltet um und merkt es sich im localStorage `hq-bild`, `?bild=zelt` schaltet zurück. Funktionen `houseScene`, Liste `HOUSE`. Im Entwurf hat die untere Leiste Start, Woche, Essen, Ausflüge; die Einkaufsliste steckt dann als Knopf "🛒 Einkauf" im Bereich Essen (Fahrrad im Bild führt weiter direkt hin).

## Entscheidungen

- Kein Konto für niemanden; wer den Link hat, liest und schreibt.
- Keine Punkte, kein Wettkampf. `pts` ist nur "Aufwand" zum Ausgleichen der Wechsel-Pakete.
- Nur Wechsel-Aufgaben zählen in der Wochenübersicht. "Bringen" und Kochen im Homeoffice werden bewusst nicht gewichtet.
- Wechsel: gerade ISO-Woche = Paket A bei p0; `rotOffset` tauscht. Start der Rotation war KW 47/2026.
- Keine Blau/Rot-Farben für Mann/Frau; Haken statt Kürzel (Kürzel nur bei Homeoffice-Aufgaben).
- Startbild: keine Wörter im Bild, antippbare Dinge; keine Zahl offener Aufgaben ("Offene Aufträge" reicht).
- Einkaufsliste ist ein eigener Bereich, nicht Teil von "Essen".
- Rezepte, Ideen und Einkaufsliste sind verbunden: Zutaten kommen als Block auf die Liste (Rezept, Idee "+ Liste", Wochenplan) und gehen als Block wieder runter (Leiste "Für Rezepte" auf der Einkaufsliste oder Knopf am Rezept). Zutaten, die schon offen auf der Liste standen, werden nicht doppelt angelegt und gehören keinem Block.
- Unten immer genau 4 Reiter. Mit Ausflügen: Start, Woche, Essen (mit Einkauf darin), Ausflüge. Essen und Einkauf behalten im Startbild ihr eigenes Symbol.
- Ausflüge: Eingabemaske mit Art, Wetter, Dauer, Fahrzeit, Kleinkind, Kosten, Jahreszeit, Packliste, Link, Notiz; Filter nach Art und "Bei Regen". Mehrere Packlisten, jede bleibt bestehen. Noch Entwurf.
- Leuchtturm = "Ideen": nur Geschenke und Sonstiges. Lampe über der Tür = "Am Haus": Einrichtung, Aufräumen, Reparieren, Garten (kein Werkzeugkoffer mehr). Beide starten mit Kacheln (Zahl offener Ideen); im Bereich landet jede neue Zeile direkt dort. Spielsachen gehören zum Ball. Kein Reiter, unten bleiben 4. Das Schild an jeder Idee schaltet mit einem Tipp Idee, Geplant, Sind dran weiter. Offen als Vorschlag: Bereich automatisch erkennen, Leuchtturm blinkt bei neuer Idee. Sport und Spiel hat einen eigenen Bereich hinter dem bunten Ball auf der Wiese: Spielplätze (mit Karte; 🗺️ sucht sonst nach dem Namen), Spielideen zu Hause (Link füllt den Namen aus der Adresse vor, mehr geht im Browser nicht), Sport und Kurse, Sonstiges; Sterne für Lieblinge.
- Haus am Meer: Antippbar sind Besen an der Tür (Woche), Schornstein (Essen), Fahrrad (Einkauf), Leuchtturm (Ideen), Lampe über der Tür (Am Haus), Ball rechts am Steinweg beim Strand (Sport und Spiel), Rucksack rechts an der Hauswand (Kita), alter Bulli im 70er-Stil ohne Logo am linken Rand, mit Surfbrett auf dem Dach (Ausflüge, auch Reiter-Symbol); Fahrrad unter dem linken Fenster an die Wand gelehnt. Kein Briefkasten mehr: der Plan liegt hinter dem Zahnrad oben rechts. Der Leuchtturm strahlt heller mit dem Wochenfortschritt. Erst nach ausdrücklichem Okay für beide einschalten.
- Unter Rezepte stehen oben die Tagesrezepte (alle Kategorien, auch schon übernommene mit "✕ Entfernen"), dann eure Rezepte (✕ am Kopf entfernt), unten der Wochenvorschlag. Eigene Rezepte sind zugeklappt kompakt (`recMeta`: Quelle, Zutatenzahl, 📅 Plantage, 🛒 auf der Liste, "ohne Mengen"; Knöpfe 🛒 🔔 ✕), Inhalt per Tipp ausklappbar.
- Mengen: Rezepte und Plantage aus der ersten Wochenrecherche (vor den Mengen) haben Zutaten ohne Menge. `withQty` ersetzt sie beim Anzeigen und Übertragen durch die Zeilen desselben Gerichts aus `wochenideen.json`/`ideen.json`, wenn es dort noch steht; sonst sagt der Hinweis "ohne Menge (älteres Rezept)".
- Neu laden (am Handy herunterziehen) bleibt im selben Bereich und Unterreiter (`restoreNav`, `history.state`, Rückfall sessionStorage `hq-nav`).
- Rezept-Recherche: ein Rezept pro Kategorie (`cat` in `ideen.json`: gesund, schnell, vegetarisch, saisonal, exotisch; Liste `IDEA_CATS`). Quellen kuratiert der Besitzer selbst in `quellen.txt`. Eine geplante Aufgabe in claude.ai ("Tägliche Rezept-Recherche Daheeme", täglich 5:43 Uhr Berlin) erneuert `ideen.json` direkt auf main. emmikochteinfach.de zeigt Robotern auf der Startseite nur eine Warteseite; Suche `?s=`, `/rezepte/`, `/feed/` und `post-sitemap.xml` gehen (steht in `quellen.txt`).
- Das Symbol oben links (🏕️🧹) führt aus jedem Bereich zur Startseite.
- Woche hat im Entwurf drei Seiten (`weekPager`, `S.weekPage`): Diese Woche, Wer macht was (`renderPlan`), Übersicht (`renderAll`). Wechsel über die Leiste oben, Wischen nach links oder rechts oder Doppeltipp auf den Reiter Woche. Wer Woche neu öffnet (Reiter, Besen, Startseite), landet immer auf "Diese Woche". Im Entwurf ist das Zahnrad weg (Inhalt liegt in Woche); im Zeltbild bleibt es.
- Die Zurück-Taste geht in der App schrittweise zurück (History-Einträge je Bereich, siehe `syncNav`).

## Offene Liste

- Haus am Meer freischalten, wenn der Besitzer es sagt; dann App-Name und Symbol (bisher 🏕️🧹, Zelt im Start-Tab) und Farben anpassen (Plan: https://claude.ai/artifact/MzunYyXEYMKWLFxg56qyNr).
- Test mit zwei echten Handys.
- Schriften selbst ausliefern statt von Google Fonts laden.
- Pausiert: Minispiele "Laub fegen" und "Wer macht's?".
