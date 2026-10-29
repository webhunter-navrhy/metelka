#!/usr/bin/env python3
"""Cloudflare Workers AI FLUX.2 dev s referenčním obrázkem (podklad z 3D modelu).
   python3 tools/cf_ref.py <ref.jpg> <out.jpg> <prompt-soubor> [w h seed]"""
import base64, json, re, subprocess, sys, time
from pathlib import Path
ACC = "91c5bf467d30ea7e0c866ee7bcfd1e6f"
def token():
    t = (Path.home() / "Library/Preferences/.wrangler/config/default.toml").read_text()
    return re.search(r'oauth_token = "([^"]+)"', t).group(1)
ref, out, pf = sys.argv[1], sys.argv[2], sys.argv[3]
w, h = (sys.argv[4], sys.argv[5]) if len(sys.argv) > 5 else ("1920", "1080")
seed = sys.argv[6] if len(sys.argv) > 6 else "7"
prompt = Path(pf).read_text().strip()
for attempt in range(3):
    r = subprocess.run(["curl", "-s", "-m", "300", "-X", "POST",
        f"https://api.cloudflare.com/client/v4/accounts/{ACC}/ai/run/@cf/black-forest-labs/flux-2-dev",
        "-H", f"Authorization: Bearer {token()}", "-F", f"prompt={prompt}", "-F", f"width={w}", "-F", f"height={h}",
        "-F", f"seed={seed}", "-F", f"input_image_0=@{ref}"], capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        if d.get("success") and d["result"].get("image"):
            Path(out).write_bytes(base64.b64decode(d["result"]["image"])); print("OK", out); break
        print("ERR", d.get("errors"))
    except Exception as e:
        print("ERR", e, r.stdout[:300])
    time.sleep(8)
