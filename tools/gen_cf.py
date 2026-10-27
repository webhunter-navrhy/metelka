# AI vizualizace přes Cloudflare Workers AI (FLUX.2 dev), účet WebHunter, OAuth token z wrangleru.
# Jen interiér a detaily podle specifikace (VDEKOR, řez domem); exteriér domu negenerovat (klamalo by to).
import base64, json, re, subprocess, sys, time
from pathlib import Path
ACC = "91c5bf467d30ea7e0c866ee7bcfd1e6f"
OUT = Path(__file__).resolve().parent.parent / "_research" / "ai"
def token():
    t = (Path.home() / "Library/Preferences/.wrangler/config/default.toml").read_text()
    return re.search(r'oauth_token = "([^"]+)"', t).group(1)
INT = ("Photorealistic architectural interior photograph of a newly finished small modern apartment, light oak herringbone parquet, "
       "warm greige cashmere matte cabinetry, matte black accents, warm white walls, soft natural daylight, quiet luxury, "
       "editorial interior photography, high-end real estate brochure, no people, no text, no logos")
JOBS = {
 "loznice": (INT + ", bedroom: ecru upholstered low bed with thick padded headboard, crisp white bedding, wallpaper behind the bed with soft oatmeal and white marble swirl pattern, "
             "round black glass side tables, slim black floor lamps, ecru linen curtains, morning light", 1536, 1024),
 "koupelna": ("Photorealistic architectural interior photograph of a small modern bathroom, large cream matte 60x60 porcelain tiles on floor and walls, walk-in shower with black steel framed glass and grid, "
              "matte black rain shower and mixer, wall-hung white toilet with matte black flush plate, white rectangular countertop basin on greige vanity, tall matte black faucet, black towel rail, "
              "warm soft light, quiet luxury, editorial photography, no people, no text, no logos", 1024, 1280),
 "hala": (INT + ", entrance hall: solid oak bench with black metal frame and beige cushion, large round mirror with thin black frame on the wall, two small abstract artworks in black frames, "
          "black wooden wall hooks, built-in greige wardrobe, subtle beige geometric line wallpaper with warm LED glow", 1024, 1280),
 "okno": ("Photorealistic architectural detail photograph, close-up of a modern triple-glazed window with a golden oak wood-effect frame set in a smooth warm white plaster facade, "
          "long soft late afternoon sun shadows, minimal, calm, beige and gold tones, high-end real estate brochure, shallow depth of field, no people, no text", 1024, 1280),
 "kuchyne": (INT + ", kitchen detail: handleless greige cashmere cabinets, light stone countertop, matte black tall faucet, built-in black induction hob, a ceramic bowl and a linen towel, "
             "herringbone floor visible, soft side light", 1536, 1024),
 "svetlo": ("Photorealistic architectural photograph, sunlight and window shadows falling across a warm white wall and light oak herringbone floor in an empty new apartment, "
            "golden hour, beige and gold tones, minimal, serene, editorial, no furniture, no people, no text", 1536, 1024),
 "hero-obyvak": (INT + ", wide view of an open living room with kitchen at golden hour, the left third of the image is a calm warm white wall with long soft sun and window shadows, "
                 "on the right a stone-coloured boucle sofa, round black glass coffee tables, cream round rug, greige handleless kitchen in the background, large window with sheer white curtains, "
                 "warm golden light, very calm composition, lots of negative space", 1792, 1024),
 "hero-vecer": (INT + ", open living and dining room in the evening, warm indirect LED light along the ceiling, round black glass dining table with beige chenille chairs, "
                "three tall black-framed mirrors, boucle sofa, table lamp glowing, dusk blue light outside the large window, cosy and elegant", 1792, 1024),
 "hero-loznice-okno": (INT + ", bedroom corner by a large window with golden oak wood-effect frame, ecru linen curtain moving softly, edge of an upholstered ecru bed with white bedding, "
                       "round black glass side table with a small ceramic vase, morning sun, calm, minimal", 1280, 1536),
}

JOBS.update({
 "hero2": ("Photorealistic architectural interior photograph, wide-angle view of a calm open-plan living room with kitchen in a new two-storey residential house, late afternoon golden hour sun streaming through a large window with sheer ivory linen curtains, "
           "long warm light stripes across a warm white wall and light oak herringbone parquet, plain smooth stone-beige boucle sofa, two round matte black coffee tables, cream round wool rug, "
           "handleless greige cashmere kitchen cabinets along the back wall, matte black slim pendant lamp, a few ceramic vases, quiet luxury, high-end real estate brochure, editorial, soft shadows, "
           "low ceiling of a normal apartment, view outside shows only soft sky and a tree, no people, no text, no logos", 1920, 1080),
 "hero3": ("Photorealistic architectural interior photograph, eye-level wide view of an elegant small apartment living room at golden hour, warm sunlight and window shadows on a warm white wall, "
           "light oak herringbone floor, plain ivory boucle curved sofa, round black dining table with four beige chenille chairs, greige handleless kitchen with matte black faucet on the left, "
           "large window with thin black frame and sheer curtains, minimal decor, gold and beige palette, serene, editorial real estate photography, no people, no text", 1920, 1080),
 "balkon": ("Photorealistic architectural photograph, a small private balcony of a modern apartment at golden hour, light wooden decking, slim black metal railing, two rattan lounge chairs with ivory cushions, "
            "small black side table with two glasses of white wine, warm low sun, soft sky, view of a calm suburban street with low houses in the distance, quiet luxury, no people, no text", 1536, 1024),
})

want = sys.argv[1:] or list(JOBS)
for name in want:
    prompt, w, h = JOBS[name]
    out = OUT / f"cf-{name}.jpg"
    if out.exists(): continue
    for attempt in range(3):
        r = subprocess.run(["curl", "-s", "-m", "240", "-X", "POST", f"https://api.cloudflare.com/client/v4/accounts/{ACC}/ai/run/@cf/black-forest-labs/flux-2-dev",
                            "-H", f"Authorization: Bearer {token()}", "-F", f"prompt={prompt}", "-F", f"width={w}", "-F", f"height={h}"], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
            if d.get("success") and d["result"].get("image"):
                out.write_bytes(base64.b64decode(d["result"]["image"])); print("ok", name, flush=True); break
            print("err", name, d.get("errors"), flush=True)
        except Exception as e:
            print("err", name, e, r.stdout[:200], flush=True)
        time.sleep(10)
