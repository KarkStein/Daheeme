# Daheeme: Haushalts-App (Übergabe für jeden neuen Thread)

Gemeinsame Haushalts-App für zwei Personen (p0 und p1, Namen stehen in der App-Konfiguration). Sprache der App und aller Antworten: Deutsch, kurze klare Sätze. Der Besitzer arbeitet meist am Android-Handy und möchte Klick-für-Klick-Anleitungen.

Live: https://karkstein.github.io/Daheeme/ (GitHub Pages aus `main`, Wurzelverzeichnis). App-Name ist das Emoji-Paar 🏕️🧹, URL und Repo bleiben "Daheeme".

## Aufbau

- Eine einzige Seite, Vanilla JS, kein Framework. Quelle: `src/haushalt/haushalt.html`. Alle Funktionen kommen dort hinein.
- `node src/build-web.js <firebase-url>` baut daraus `src/web/index.html` (fügt Firebase-Abgleich, Einladungs-Link, Kopfzeilen ein). Das Ergebnis wird nach `index.html` in die Wurzel kopiert und von Pages ausgeliefert. Das Skript arbeitet mit Text-Ankern in der Quelle; bricht ein Anker, meldet es `missing: …`.
- Abgleich: Firebase Realtime Database über REST und EventSource, ohne SDK. Basis `https://haushalt-32464-default-rtdb.europe-west1.firebasedatabase.app/haushalt/<geheimer Schlüssel>`. Der Schlüssel steht nur im Link (`#k=…`) und im localStorage `hq-key`, nie im Repo.
- Firebase-Regeln: `{"rules":{"haushalt":{"$key":{".read":true,".write":true}}}}`
- `manifest.json` hat absichtlich kein `start_url`, damit `#k=` erhalten bleibt. Icons: `src/icon.svg` über `src/make-icons.js`.
- `ideen.json` (Wurzel): Rezeptideen der Recherche, Format `{updated, items:[{name, cat, source, link, ing[], note}]}`. `quellen.txt`: Webseiten für die Recherche, eine pro Zeile, nach Kategorie gruppiert. `vorlieben.txt`: Besonderheiten, die die Recherche in jeder Kategorie beachtet.

## Datenmodell (unter dem Schlüssel)

- `config`: `persons`, `rotOffset`, `tasks[{id,name,owner:p0|p1|rot|both|ho,freq:day|week|month|half|year,times,pts,pack?:A|B}]`, `camp:{costs,extras[{id,emoji,name,cost}]}`
- `weeks/<YYYY-Www>/ticks/<key>` = `{by,at}`; Schlüssel `<id>__<slot>`, `<id>__p` (Monat und länger), `<id>__<slot>_p0/_p1` (halbe Häkchen bei owner both)
- `food/shop/<id>` `{name,done,at,by,doneAt,cat?,src?}` (`src` = Name des Rezepts, wenn die Zutat als Block von einem Rezept, einer Idee oder dem Wochenplan kam; so lässt sich der Block auf einmal entfernen), `food/fav/<hash>` `{name,n,cat?}`
- `food/rec/<id>` `{name,ing (Zeilen),note,link,at}`, `food/plan/<YYYY-Www>/d0..d6` `{text,rec?,at,by}`
- `food/lunch/<id>` `{name,dishes,note,maps,at,r:{p0,p1}}`, `food/lunchmap` = Link zu Google Maps
- Ausflüge (liegen unter `food`, damit der Abgleich nichts Neues braucht): `food/trip/<id>` `{name,note,link,at,by,done,doneAt}`, `food/pack/<id>` `{name,done,at}` (Packliste bleibt, "Alles wieder auspacken" setzt nur `done` zurück)

## Testen und Veröffentlichen

```
node src/build-web.js http://localhost:8765 && timeout 90 node src/mock-test.js | tail -1   # muss "SYNC OK" zeigen
node src/build-web.js https://haushalt-32464-default-rtdb.europe-west1.firebasedatabase.app && cp src/web/index.html index.html
git add -A && git commit && git push origin main
```

`src/mock-test.js` ist ein Firebase-Ersatz plus Test mit zwei Geräten (Playwright). Aus der Cloud-Sitzung sind firebasedatabase.app und github.io nicht erreichbar; die echte Datenbank wurde nur vom Besitzer am Handy geprüft. Vorschau der Jahreszeiten: `?saison=winter|spring|summer|autumn`. Startbild Haus am Meer (Entwurf, noch nicht freigeschaltet): `?bild=haus` schaltet um und merkt es sich im localStorage `hq-bild`, `?bild=zelt` schaltet zurück. Funktionen `houseScene`, Liste `HOUSE`. Der Tab Ausflüge ist nur in diesem Entwurf sichtbar.

## Entscheidungen

- Kein Konto für niemanden; wer den Link hat, liest und schreibt.
- Keine Punkte, kein Wettkampf. `pts` ist nur "Aufwand" zum Ausgleichen der Wechsel-Pakete.
- Nur Wechsel-Aufgaben zählen in der Wochenübersicht. "Bringen" und Kochen im Homeoffice werden bewusst nicht gewichtet.
- Wechsel: gerade ISO-Woche = Paket A bei p0; `rotOffset` tauscht. Start der Rotation war KW 47/2026.
- Keine Blau/Rot-Farben für Mann/Frau; Haken statt Kürzel (Kürzel nur bei Homeoffice-Aufgaben).
- Startbild: keine Wörter im Bild, antippbare Dinge; keine Zahl offener Aufgaben ("Offene Aufträge" reicht).
- Einkaufsliste ist ein eigener Bereich, nicht Teil von "Essen".
- Rezepte, Ideen und Einkaufsliste sind verbunden: Zutaten kommen als Block auf die Liste (Rezept, Idee "+ Liste", Wochenplan) und gehen als Block wieder runter (Leiste "Für Rezepte" auf der Einkaufsliste oder Knopf am Rezept). Zutaten, die schon offen auf der Liste standen, werden nicht doppelt angelegt und gehören keinem Block.
- Ausflüge werden ein eigener Bereich (fünfter Tab, Rucksack im Startbild). Erster Entwurf: Ideen-Liste mit "Schon gemacht" und bleibende Packliste. Den Inhalt legt der Besitzer später fest.
- Haus am Meer: Antippbar sind Besen an der Tür (Woche), Schornstein (Essen), Fahrrad (Einkauf), Rucksack (Ausflüge), gelber Briefkasten (Plan). Der Leuchtturm strahlt heller mit dem Wochenfortschritt. Erst nach ausdrücklichem Okay für beide einschalten.
- Rezept-Recherche: ein Rezept pro Kategorie (`cat` in `ideen.json`: gesund, schnell, vegetarisch, saisonal, exotisch; Liste `IDEA_CATS`). Quellen kuratiert der Besitzer selbst in `quellen.txt`.
- Die Zurück-Taste geht in der App schrittweise zurück (History-Einträge je Bereich, siehe `syncNav`).

## Offene Liste

- Haus am Meer freischalten, wenn der Besitzer es sagt; dann App-Name und Symbol (bisher 🏕️🧹, Zelt im Start-Tab) und Farben anpassen (Plan: https://claude.ai/artifact/MzunYyXEYMKWLFxg56qyNr).
- Tägliche Rezept-Recherche einrichten, die `ideen.json` erneuert (ein Rezept pro Kategorie). Quellen stehen in `quellen.txt`, `vorlieben.txt` füllt der Besitzer noch.
- Test mit zwei echten Handys.
- Schriften selbst ausliefern statt von Google Fonts laden.
- Pausiert: Minispiele "Laub fegen" und "Wer macht's?".
