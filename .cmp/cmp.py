import subprocess, sys
from PIL import Image

DEV = "F55AC0E6-6C34-425B-97EC-1C2E0F302858"

def shot(name):
    """Device screenshot, scaled to the comp's 390pt frame."""
    p = f"/Users/ahmedmealy/Test/sevenpm-app/.cmp/{name}_dev.png"
    subprocess.run(["xcrun","simctl","io",DEV,"screenshot","--type=png",p],
                   check=True, capture_output=True)
    im = Image.open(p)
    w, h = im.size                       # 1206 x 2622 = 402 x 874 at 3x
    return im.resize((390, round(h * 390 / w)), Image.LANCZOS)

def side(name, comp_png, offset=0):
    a = Image.open(comp_png).convert("RGB")
    b = shot(name).convert("RGB")
    if offset:
        b = b.crop((0, offset, b.width, b.height))
    h = max(a.height, b.height)
    out = Image.new("RGB", (a.width + b.width + 8, h), (255, 0, 255))
    out.paste(a, (0, 0)); out.paste(b, (a.width + 8, 0))
    out.save(f"/Users/ahmedmealy/Test/sevenpm-app/.cmp/{name}.png")
    print(f"{name}: comp {a.size}  app {b.size}")

if __name__ == "__main__":
    side(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
