#!/bin/zsh
# po vygenerování fotorealu: obrázky do _v6/img, snímky 1440/390, koláže s piny
cd ~/wh-navrhy-ops/weby/metelka
prvni(){ for f in "$@"; do [ -s "$f" ] && { echo $f; return; }; done; }
A=$(prvni _viz6/cf_a1.jpg _viz6/kon_a1.png); C=$(prvni _viz6/cf_e3_1.jpg _viz6/kon_e3.png); M=$(prvni _viz6/cf_m4_1.jpg)
[ -z "$A" ] && { echo "žádný fotoreal"; exit 1; }
python3 tools/obr6.py hero-d $A 1920
[ -n "$C" ] && python3 tools/obr6.py hero-c $C 1920
if [ -n "$M" ]; then python3 tools/obr6.py hero-m $M 900; else python3 tools/obr6.py hero-m $A 900 1400 0.3; fi
for v in a b c; do python3 tools/shot.py http://localhost:8792/_v6/hero-$v.html _v6/$v-1440.png 1440 900; python3 tools/shot.py http://localhost:8792/_v6/hero-$v.html _v6/$v-390.png 390 844; done
python3 tools/kolaz6.py a b c
echo "A=$A C=$C M=$M"
