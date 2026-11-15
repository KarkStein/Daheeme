#!/usr/bin/env python3
"""Holt die Schulferien Bayern von openholidaysapi.org und schreibt ferien.json (Wurzel)."""
import json, urllib.request, datetime, sys
t = datetime.date.today()
a, z = f"{t.year-1}-09-01", f"{t.year+2}-12-31"
url = ("https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=DE-BY"
       f"&languageIsoCode=DE&validFrom={a}&validTo={z}")
req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "daheeme-ferien"})
data = json.load(urllib.request.urlopen(req, timeout=60))
out = []
for x in data:
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
