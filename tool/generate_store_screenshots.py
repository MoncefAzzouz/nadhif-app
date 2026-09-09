from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "scrrens"
BACKGROUND = SOURCE / "store_background.png"
OUT = SOURCE / "app_store_ready"

BLUE = "#4160ff"
INK = "#14223a"
WHITE = "#ffffff"


def font(size: int, bold: bool = False):
    path = ROOT / "assets" / "fonts" / ("Inter_28pt-Bold.ttf" if bold else "Gilmer-Medium.ttf")
    return ImageFont.truetype(str(path), size)


def cover_background(size):
    source = Image.open(BACKGROUND).convert("RGB")
    return ImageOps.fit(source, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5)).convert("RGBA")


def rounded_screen(path, target_width, radius, border=12):
    src = Image.open(path).convert("RGB")
    h = round(target_width * src.height / src.width)
    src = src.resize((target_width, h), Image.Resampling.LANCZOS)
    mask = Image.new("L", src.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, src.width, src.height), radius=radius, fill=255)
    result = Image.new("RGBA", (src.width + border * 2, src.height + border * 2), WHITE)
    result.paste(src.convert("RGBA"), (border, border), mask)
    outer = Image.new("L", result.size, 0)
    ImageDraw.Draw(outer).rounded_rectangle((0, 0, result.width, result.height), radius=radius + border, fill=255)
    result.putalpha(outer)
    return result


def paste_shadow(canvas, card, xy, blur=35, offset=25):
    x, y = xy
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    smask = Image.new("L", card.size, 0)
    smask.paste(card.getchannel("A"))
    colored = Image.new("RGBA", card.size, (21, 53, 120, 95))
    shadow.paste(colored, (x, y + offset), smask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(card, (x, y))


def centered_text(draw, text, y, width, size, color=INK):
    f = font(size, True)
    box = draw.textbbox((0, 0), text, font=f)
    draw.text(((width - (box[2] - box[0])) / 2, y), text, font=f, fill=color)


PHONE_SLIDES = [
    ("IMG_3528.PNG", "Everything clean. One app."),
    ("IMG_3529.PNG", "Find the right service"),
    ("IMG_3532.PNG", "Know exactly what’s included"),
    ("IMG_3533.PNG", "Book in just a few taps"),
    ("IMG_3534.PNG", "Add details. Confirm. Relax."),
    ("IMG_3536.PNG", "Fresh laundry, handled"),
    ("IMG_3530.PNG", "Every booking in one place"),
    ("IMG_3532.PNG", "Reliable care for your home"),
]


def make_phone():
    target = OUT / "iphone_6_5"
    target.mkdir(parents=True, exist_ok=True)
    for i, (name, headline) in enumerate(PHONE_SLIDES, 1):
        canvas = cover_background((1242, 2688))
        draw = ImageDraw.Draw(canvas)
        centered_text(draw, headline, 175, 1242, 76)
        centered_text(draw, "Professional cleaning, on demand", 286, 1242, 35, BLUE)
        screen = rounded_screen(SOURCE / name, 860, 66, 13)
        max_h = 2180
        if screen.height > max_h:
            ratio = max_h / screen.height
            screen = screen.resize((round(screen.width * ratio), max_h), Image.Resampling.LANCZOS)
        paste_shadow(canvas, screen, ((1242 - screen.width) // 2, 430), 40, 30)
        canvas.convert("RGB").save(target / f"{i:02d}.png", quality=95)


TABLET_SLIDES = [
    (("IMG_3528.PNG", "IMG_3529.PNG"), "Cleaning made beautifully simple"),
    (("IMG_3529.PNG", "IMG_3532.PNG"), "Browse services with confidence"),
    (("IMG_3532.PNG", "IMG_3533.PNG"), "From service details to booking"),
    (("IMG_3533.PNG", "IMG_3534.PNG"), "Schedule your clean your way"),
    (("IMG_3536.PNG", "IMG_3528.PNG"), "More services for every home"),
    (("IMG_3530.PNG", "IMG_3531.PNG"), "Track bookings. Stay in control."),
    (("IMG_3530.PNG", "IMG_3533.PNG"), "Manage every appointment with ease"),
    (("IMG_3532.PNG", "IMG_3536.PNG"), "Specialized care for every need"),
]


def make_tablet():
    target = OUT / "ipad_12_9"
    target.mkdir(parents=True, exist_ok=True)
    for i, (names, headline) in enumerate(TABLET_SLIDES, 1):
        canvas = cover_background((2048, 2732))
        draw = ImageDraw.Draw(canvas)
        centered_text(draw, headline, 155, 2048, 92)
        centered_text(draw, "A cleaner home is only a few taps away", 292, 2048, 42, BLUE)
        cards = [rounded_screen(SOURCE / n, 760, 58, 12) for n in names]
        y = 520
        for x, card in zip((190, 1098), cards):
            if card.height > 1930:
                ratio = 1930 / card.height
                card = card.resize((round(card.width * ratio), 1930), Image.Resampling.LANCZOS)
            paste_shadow(canvas, card, (x + (760 - card.width) // 2, y), 42, 32)
        pill = (650, 2530, 1398, 2635)
        draw.rounded_rectangle(pill, radius=52, fill=BLUE)
        label = "CleanApp • Home services"
        f = font(37, True)
        b = draw.textbbox((0, 0), label, font=f)
        draw.text(((2048 - (b[2] - b[0])) / 2, 2559), label, font=f, fill=WHITE)
        canvas.convert("RGB").save(target / f"{i:02d}.png", quality=95)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    make_phone()
    make_tablet()
    print(OUT)
