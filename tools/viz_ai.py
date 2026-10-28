#!/usr/bin/env python3
"""img2img podkladu vizualizace přes FLUX Kontext (HF ZeroGPU).
   ~/bobko-video/.venv-hf/bin/python tools/viz_ai.py <vstup.png> <vystup.png> <seed> [prompt-soubor]"""
import shutil, sys, time
from pathlib import Path
from gradio_client import Client, handle_file
TOKEN = (Path.home() / "bobko-video/.hf_token").read_text().strip()
vstup, vystup, seed = sys.argv[1], sys.argv[2], int(sys.argv[3])
prompt = Path(sys.argv[4]).read_text().strip() if len(sys.argv) > 4 else ""
gs = float(sys.argv[5]) if len(sys.argv) > 5 else 2.5
for pokus in range(6):
    try:
        t = time.time()
        c = Client("black-forest-labs/FLUX.1-Kontext-Dev", token=TOKEN, verbose=False)
        r = c.predict(input_image=handle_file(vstup), prompt=prompt, seed=seed, randomize_seed=False,
                      guidance_scale=gs, steps=28, api_name="/infer")
        x = r[0] if isinstance(r, (list, tuple)) else r
        if isinstance(x, dict): x = x.get("path")
        shutil.copy(x, vystup); print("OK", vystup, f"{time.time()-t:.0f}s"); break
    except Exception as e:
        print("CHYBA", str(e)[:300]); time.sleep(60 if "quota" not in str(e).lower() else 600)
