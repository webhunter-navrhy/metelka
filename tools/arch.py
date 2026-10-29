import sys, os
from PIL import Image, ImageDraw
fs = [f for d in sys.argv[2:] for r,_,ff in os.walk(d) for f in [os.path.join(r,x) for x in sorted(ff)] if f.lower().endswith(('.jpg','.jpeg','.png','.webp')) and 'stranka' not in f]
T=360; cols=6; rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*T,rows*(T*2//3+30)),'white'); d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    try: im=Image.open(f).convert('RGB')
    except Exception: continue
    w,h=im.size; im.thumbnail((T-6,T*2//3-6))
    x=(i%cols)*T; y=(i//cols)*(T*2//3+30)
    S.paste(im,(x+3,y+3)); d.text((x+4,y+T*2//3),f'{i} {os.path.basename(f)[:34]} {w}x{h}',fill='black')
    print(i,f,w,h)
S.save(sys.argv[1],quality=80)
