# Daheeme

Haushalts-Quest: Haushaltsplan für zwei mit Wochenrotation, Abhaken und Punkten.

- `index.html` ist die fertige Seite (GitHub Pages).
- `src/haushalt/haushalt.html` ist die Quelle. `node src/build-web.js <Firebase-Datenbank-URL>` baut `src/web/index.html`, die dann nach `index.html` kopiert wird.
- `node src/mock-test.js` testet den Abgleich zwischen zwei Geräten gegen einen lokalen Mock (vorher mit `http://localhost:8765` bauen).
