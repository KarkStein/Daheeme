#!/usr/bin/env python3
"""Holt die Schulferien Bayern von openholidaysapi.org und schreibt ferien.json (Wurzel)."""
import json, urllib.request, datetime, sys
t = datetime.date.today()
data = []
for y in range(t.year - 1, t.year + 3):  # die Schnittstelle erlaubt nur kurze Zeiträume, daher je Jahr
    url = ("https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=DE-BY"
           f"&languageIsoCode=DE&validFrom={y}-01-01&validTo={y}-12-31")
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "daheeme-ferien"})
    try:
        data += json.load(urllib.request.urlopen(req, timeout=60))
    except Exception as e:
        print("Jahr", y, "nicht geholt:", e)
out, seen = [], set()
for x in data:
    if (x["startDate"], x["endDate"]) in seen: continue
    seen.add((x["startDate"], x["endDate"]))
    names = x.get("name") or []
    n = next((v["text"] for v in names if v.get("language") == "DE"), names[0]["text"] if names else "Ferien")
    out.append({"name": n.strip(), "from": x["startDate"], "to": x["endDate"]})
out.sort(key=lambda f: f["from"])
if not out:
    sys.exit("keine Ferien erhalten")
old = {}
try:
    old = json.load(open("ferien.json"))
except Exception:
    pass
if old.get("ferien") == out:
    print("unverändert", len(out)); sys.exit(0)
json.dump({"updated": t.isoformat(), "land": "Bayern", "quelle": "openholidaysapi.org", "ferien": out},
          open("ferien.json", "w"), ensure_ascii=False, indent=1)
print("geschrieben", len(out))
