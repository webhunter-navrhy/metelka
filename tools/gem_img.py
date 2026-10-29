#!/usr/bin/env python3
"""Gemini image (Nano Banana) s referenčními obrázky.
   python3 tools/gem_img.py <out.jpg> <prompt-soubor> [ref1 ref2 ...] [--model M] [--ar 16:9]"""
import base64, json, sys, urllib.request, re
from pathlib import Path
args = sys.argv[1:]
model = "gemini-3-pro-image"; ar = "16:9"
if "--model" in args: i = args.index("--model"); model = args[i+1]; del args[i:i+2]
if "--ar" in args: i = args.index("--ar"); ar = args[i+1]; del args[i:i+2]
out, pf, refs = args[0], args[1], args[2:]
key = next(l.split("=",1)[1].strip().strip('"\'') for l in (Path.home()/"webhunter-recenze/.env").read_text().splitlines() if l.startswith("GEMINI_API_KEY"))
parts = [{"text": Path(pf).read_text().strip()}]
for r in refs:
    mt = "image/png" if r.endswith(".png") else "image/jpeg"
    parts.append({"inline_data": {"mime_type": mt, "data": base64.b64encode(Path(r).read_bytes()).decode()}})
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ar}}}
if "pro" in model: body["generationConfig"]["imageConfig"]["imageSize"] = "2K"
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
try:
    d = json.loads(urllib.request.urlopen(req, timeout=300).read())
except urllib.error.HTTPError as e:
    print("ERR", e.code, e.read().decode()[:500]); sys.exit(1)
for c in d.get("candidates", []):
    for p in c.get("content", {}).get("parts", []):
        if "inlineData" in p:
            Path(out).write_bytes(base64.b64decode(p["inlineData"]["data"])); print("OK", out, d.get("usageMetadata", {}).get("totalTokenCount")); sys.exit(0)
print("NOIMG", json.dumps(d)[:600]); sys.exit(1)
