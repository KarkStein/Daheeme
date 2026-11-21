#!/usr/bin/env python3
"""Sammelt die Ergebnisse der Recherchen (Rezepte, Ausflugstipps) in archiv/.
Jeder Lauf hängt Neues an, nichts wird gelöscht. Mit --verlauf werden zusätzlich
alle früheren Stände aus der git-Geschichte nachgeholt."""
import json, os, re, subprocess, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REZ = os.path.join(ROOT, "archiv", "rezepte.json")
AUS = os.path.join(ROOT, "archiv", "ausfluege.json")

def norm(s):
    s = unicodedata.normalize("NFKD", (s or "").lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

def rkey(x):
    l = (x.get("link") or "").split("#")[0].rstrip("/").lower()
    l = re.sub(r"^https?://(www\.)?", "", l)
    return l or "n:" + norm(x.get("name"))

def load(p):
    try:
        with open(p, encoding="utf-8") as f: return json.load(f)
    except Exception: return {"items": []}

def day(d): return (d or "")[:10]

def add_rez(arch, data, src, when):
    idx = {rkey(x): x for x in arch["items"]}
    n = 0
    lists = [(data.get("items") or [], src)]
    if src == "tag": lists.append((data.get("emmi") or [], "emmi"))
    for items, s in lists:
        for x in items:
            if not isinstance(x, dict) or not x.get("name"): continue
            k = rkey(x); old = idx.get(k)
            if old:
                if when > old.get("last", ""): old["last"] = when
                if when < old.get("first", "9"): old["first"] = when
                if s not in old["from"]: old["from"].append(s)
                continue
            y = {k2: v for k2, v in x.items() if k2 in ("name","cat","source","link","ing","min","veg","tags","wx","note","steps")}
            y.update({"from": [s], "first": when, "last": when})
            arch["items"].append(y); idx[k] = y; n += 1
    return n

def akey(x):
    y = (x.get("date") or x.get("from") or x.get("to") or "")[:4]
    return norm(x.get("name")) + "|" + y

def add_aus(arch, data, when):
    idx = {akey(x): x for x in arch["items"]}
    n = 0
    for x in data.get("items") or []:
        if not isinstance(x, dict) or not x.get("name") or x.get("dauer"): continue
        k = akey(x); old = idx.get(k)
        if old:
            if when > old.get("last", ""):
                keep = {"first": old.get("first", when)}
                old.clear(); old.update(x); old.update(keep); old["last"] = when
            elif when < old.get("first", "9"): old["first"] = when
            continue
        y = dict(x); y.update({"first": when, "last": when})
        arch["items"].append(y); idx[k] = y; n += 1
    return n

def git_versions(path):
    out = subprocess.run(["git", "log", "--reverse", "--format=%H %cs", "--", path], cwd=ROOT,
                         capture_output=True, text=True).stdout.split("\n")
    for line in out:
        if not line.strip(): continue
        h, d = line.split()
        try:
            txt = subprocess.run(["git", "show", f"{h}:{path}"], cwd=ROOT, capture_output=True, text=True).stdout
            yield json.loads(txt), d
        except Exception: pass

def main():
    rez, aus = load(REZ), load(AUS)
    n = 0
    if "--verlauf" in sys.argv:
        for f, s in (("ideen.json", "tag"), ("wochenideen.json", "woche")):
            for data, d in git_versions(f): n += add_rez(rez, data, s, day(data.get("updated")) or d)
        for data, d in git_versions("ausflugtipps.json"): n += add_aus(aus, data, day(data.get("updated")) or d)
    for f, s in (("ideen.json", "tag"), ("wochenideen.json", "woche")):
        data = load(os.path.join(ROOT, f)); n += add_rez(rez, data, s, day(data.get("updated")))
    data = load(os.path.join(ROOT, "ausflugtipps.json")); n += add_aus(aus, data, day(data.get("updated")))
    for a, p in ((rez, REZ), (aus, AUS)):
        a["items"].sort(key=lambda x: (x.get("first", ""), x.get("name", "")))
        a["updated"] = max([x.get("last", "") for x in a["items"]] or [""])
        a["n"] = len(a["items"])
        with open(p, "w", encoding="utf-8") as f:
            json.dump({"updated": a["updated"], "n": a["n"], "items": a["items"]}, f, ensure_ascii=False, indent=0)
            f.write("\n")
    print(f"neu: {n}, Rezepte: {rez['n']}, Ausflüge: {aus['n']}")

main()
