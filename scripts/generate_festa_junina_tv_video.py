from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import textwrap, os, subprocess

ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / 'public' / 'videos'
SLIDES = OUTDIR / '_slides_tmp'
OUTDIR.mkdir(parents=True, exist_ok=True)
SLIDES.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080
MARGIN = 70
CONTENT_W = W - MARGIN * 2
def resolve_font(candidates):
    for candidate in candidates:
        if Path(candidate).exists():
            return str(candidate)
    return None

FONT_REG = resolve_font([
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/segoeui.ttf',
])
FONT_BOLD = resolve_font([
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    'C:/Windows/Fonts/arialbd.ttf',
    'C:/Windows/Fonts/seguisb.ttf',
])
BG = '#fff7e6'
GREEN = '#174b32'
DARK = '#1f2937'
ORANGE = '#d97706'
AMBER = '#f59e0b'
GOLD = '#fbbf24'
RED = '#c2410c'
CARD_BG = '#fffdf8'

menu_dir = ROOT / 'public' / 'cardapio' / 'arraia-tucxa-2026'
logo_path = ROOT / 'public' / 'images' / 'logo-tucxa.jpg'
hero_path = ROOT / 'public' / 'images' / 'arraia-tucxa-2025.jpg'

MENU_SLIDES = [
    {
        'title': 'Bebidas para refrescar o arraiá',
        'subtitle': 'Escolha com calma e peça com um garçom no dia do evento.',
        'items': [
            ('Cerveja Heineken', 'R$ 10,00', 'cerveja-heineken.jpg'),
            ('Cerveja Império / Original', 'R$ 7,00', 'cerveja-imperio-original.jpg'),
            ('Refrigerante', 'R$ 7,00', 'refrigerante.jpg'),
            ('Água', 'R$ 4,00', 'agua.jpg'),
            ('Suco', 'R$ 8,00', 'suco.jpg'),
            ('Vinho quente', 'R$ 8,00', 'vinho-quente.jpg'),
            ('Quentão', 'R$ 8,00', 'quentao.jpg'),
        ]
    },
    {
        'title': 'Comidas de festa junina',
        'subtitle': 'Lanches e pratos para matar a fome e curtir a festa.',
        'items': [
            ('Cachorro-quente pequeno', 'R$ 10,00', 'cachorro-quente-pequeno.jpg'),
            ('Batata frita', 'R$ 10,00', 'batata-frita.jpg'),
            ('Pastel carne / queijo / palmito', 'R$ 12,00', 'pasteis.jpg'),
            ('Lanche pernil', 'R$ 12,00', 'lanche-pernil.jpg'),
            ('Milho verde', 'R$ 8,00', 'milho-verde.jpg'),
            ('Caldo de feijão', 'R$ 8,00', 'caldo-feijao.jpg'),
        ]
    },
    {
        'title': 'Espetinhos, doces e sabores especiais',
        'subtitle': 'Mais opções para completar seu pedido.',
        'items': [
            ('Espetinho de carne', 'R$ 13,00', 'espetinho-carne.jpg'),
            ('Espetinho de frango', 'R$ 12,00', 'espetinho-frango.jpg'),
            ('Kafta', 'R$ 12,00', 'espetinho-kafta.jpg'),
            ('Bolo recheado', 'R$ 12,00', 'bolo-recheado.jpg'),
            ('Maçã do amor', 'R$ 10,00', 'maca-do-amor.jpg'),
            ('Canjica', 'R$ 6,00', 'canjica.jpg'),
            ('Doces diversos', 'R$ 6,00', 'doces-diversos.jpg'),
        ]
    },
]

ROUNDS = [
    (1, 'R$ 5,00', '2 quinas · sem cartela cheia', ['Quina 1: Cesta Festa Junina', 'Quina 2: Jogo de Taças']),
    (2, 'R$ 7,00', '1 quina · com cartela cheia', ['Quina 1: Porta-Xícaras + Avental', 'Cheia: Cafeteira']),
    (3, 'R$ 5,00', '2 quinas · sem cartela cheia', ['Quina 1: Sagrada Família Decorativa', 'Quina 2: Cesta de Chocolate']),
    (4, 'R$ 7,00', '1 quina · com cartela cheia', ['Quina 1: Bolsa de Palha Especial', 'Cheia: Processador Elétrico']),
    (5, 'R$ 7,00', '1 quina · com cartela cheia', ['Quina 1: Caneca + Crochê', 'Cheia: Cesta de Frutas']),
    (6, 'R$ 5,00', '2 quinas · sem cartela cheia', ['Quina 1: Jogo de Cozinha', 'Quina 2: Chaleira Elétrica']),
    (7, 'R$ 7,00', '1 quina · com cartela cheia', ['Quina 1: Sabonete Natura + Colar Rosê', 'Cheia: Tatuagem']),
    (8, 'R$ 5,00', '1 quina · com cartela cheia', ['Quina 1: Petiscos Especiais', 'Cheia: Fardo Heineken']),
    (9, 'R$ 7,00', '1 quina · com cartela cheia', ['Quina 1: Kit Natura Folhas', 'Cheia: Limpeza Dentária']),
    (10, 'R$ 7,00', '2 quinas · sem cartela cheia', ['Quina 1: Tapete de Crochê', 'Quina 2: Liquidificador']),
    (11, 'R$ 7,00', '1 quina · com cartela cheia', ['Quina 1: Porta-Temperos para Cozinha', 'Cheia: Limpeza Dentária']),
    (12, 'R$ 5,00', '2 quinas · sem cartela cheia', ['Quina 1: Jogo Americano de Crochê', 'Quina 2: Prato de Vidro']),
    (13, 'R$ 10,00', '2 quinas · sem cartela cheia', ['Quina 1: Sabonete Orgânico', 'Quina 2: Cesta Festa Junina']),
    (14, 'R$ 5,00', '2 quinas · sem cartela cheia', ['Quina 1: Kit Pudim + Avental + Colher', 'Quina 2: Colar Azul']),
    (15, 'R$ 5,00', '2 quinas · sem cartela cheia', ['Quina 1: Sabonete Lilás + Colar de Pérolas', 'Quina 2: Bolsa Madeira + Vidro Macramê']),
]

# utilities

def font(size, bold=False):
    font_path = FONT_BOLD if bold else FONT_REG
    if font_path:
        return ImageFont.truetype(font_path, size=size)
    return ImageFont.load_default()


def draw_text(draw, xy, text, fnt, fill=DARK, max_width=None, line_spacing=6):
    x, y = xy
    if max_width is None:
        draw.text((x, y), text, font=fnt, fill=fill)
        bbox = draw.textbbox((x, y), text, font=fnt)
        return bbox[3] - bbox[1]
    words = text.split()
    lines = []
    cur = ''
    for word in words:
        test = f'{cur} {word}'.strip()
        w = draw.textbbox((0,0), test, font=fnt)[2]
        if w <= max_width or not cur:
            cur = test
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    h = 0
    for line in lines:
        draw.text((x, y+h), line, font=fnt, fill=fill)
        bbox = draw.textbbox((x, y+h), line, font=fnt)
        h += (bbox[3]-bbox[1]) + line_spacing
    return h - line_spacing if lines else 0


def rounded_card(draw, box, radius=28, fill=CARD_BG, outline='#f3d8a8', width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def open_img(path, size=None):
    img = Image.open(path).convert('RGB')
    if size:
        img.thumbnail(size, Image.LANCZOS)
    return img


def paste_cover(base, img, box, bg='#f1f5f9'):
    x1,y1,x2,y2 = box
    bw, bh = x2-x1, y2-y1
    canvas = Image.new('RGB', (bw,bh), bg)
    im = img.copy()
    im.thumbnail((bw,bh), Image.LANCZOS)
    ox = (bw - im.width)//2
    oy = (bh - im.height)//2
    canvas.paste(im, (ox,oy))
    base.paste(canvas, (x1,y1))


def header(base, title, subtitle=None, badge=None):
    draw = ImageDraw.Draw(base)
    if badge:
        badge_w = draw.textbbox((0,0), badge, font=font(28, True))[2] + 42
        draw.rounded_rectangle((MARGIN, 36, MARGIN+badge_w, 86), radius=22, fill='#fff0c2')
        draw.text((MARGIN+21, 49), badge, font=font(28, True), fill=RED)
    draw.text((MARGIN, 110), title, font=font(64, True), fill=GREEN)
    if subtitle:
        draw_text(draw, (MARGIN, 188), subtitle, font(30), fill='#374151', max_width=1750, line_spacing=4)


def footer(draw, text='Cardápio + programação do bingo · reprodução em loop offline'):
    tw = draw.textbbox((0,0), text, font=font(24))[2]
    draw.text(((W-tw)//2, H-42), text, font=font(24), fill='#6b7280')


def slide_intro(path):
    base = Image.new('RGB', (W,H), BG)
    draw = ImageDraw.Draw(base)
    # hero art on right
    hero = open_img(hero_path)
    hero = hero.resize((760, 540))
    mask = Image.new('L', hero.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,hero.size[0],hero.size[1]), radius=36, fill=255)
    # gradient blob
    draw.ellipse((1050, 60, 1880, 820), fill='#fde68a')
    base.paste(hero, (1080, 150), mask)
    if logo_path.exists():
        logo = open_img(logo_path, (140, 140))
        base.paste(logo, (MARGIN, 52))
    draw.text((MARGIN, 215), 'Arraiá Tucxa 2026', font=font(78, True), fill=GREEN)
    draw_text(draw, (MARGIN, 315), 'Vídeo simples para TVs e divulgação: cardápio público e programação das 15 rodadas do bingo.', font(34), fill=DARK, max_width=880)
    bullets = [
        'Evento: 14/06/2026',
        'Cardápio com comidas, bebidas, doces e cartelas',
        'Programação completa do bingo',
        'Pedido do cardápio com garçom no local',
    ]
    y = 460
    for b in bullets:
        draw.rounded_rectangle((MARGIN, y, 90, y+24), radius=12, fill=AMBER)
        draw_text(draw, (110, y-8), b, font(32), fill='#374151', max_width=820)
        y += 74
    draw.rounded_rectangle((MARGIN, 810, 920, 940), radius=30, fill='#ffffff', outline='#fde68a', width=3)
    draw.text((105, 845), 'Acompanhe a programação e o cardápio\nem loop nas TVs do evento.', font=font(36, True), fill=RED)
    footer(draw)
    base.save(path, quality=92)


def slide_menu(path, title, subtitle, items):
    base = Image.new('RGB', (W,H), BG)
    draw = ImageDraw.Draw(base)
    header(base, title, subtitle, badge='Cardápio')
    cols = 3
    rows = 2 if len(items) <= 6 else 3
    card_w = 560
    card_h = 320 if rows == 2 else 240
    start_x = MARGIN
    start_y = 280
    gap_x = 50
    gap_y = 30
    shown = items[:cols*rows]
    for idx, (name, price, filename) in enumerate(shown):
        row = idx // cols
        col = idx % cols
        x = start_x + col * (card_w + gap_x)
        y = start_y + row * (card_h + gap_y)
        rounded_card(draw, (x,y,x+card_w,y+card_h), radius=28)
        img_box = (x+20, y+20, x+220, y+card_h-20)
        paste_cover(base, open_img(menu_dir/filename), img_box)
        draw_text(draw, (x+245, y+28), name, font(30, True), fill=GREEN, max_width=280)
        draw.text((x+245, y+140 if rows==2 else y+112), price, font=font(34, True), fill=RED)
        draw_text(draw, (x+245, y+195 if rows==2 else y+160), 'Peça com um garçom\nno dia da festa.', font(24), fill='#4b5563', max_width=260)
    footer(draw, 'Cardápio público · imagens ilustrativas')
    base.save(path, quality=92)


def slide_bingo_cards(path):
    base = Image.new('RGB', (W,H), BG)
    draw = ImageDraw.Draw(base)
    header(base, 'Cartelas do bingo', 'As cartelas de R$ 5,00 e R$ 7,00 aparecem no cardápio e ajudam a divulgar os prêmios previstos.', badge='Bingo')
    left = (MARGIN, 280, 900, 900)
    right = (1020, 280, 1850, 900)
    rounded_card(draw, left, radius=30)
    rounded_card(draw, right, radius=30)
    paste_cover(base, open_img(menu_dir/'cartela-bingo-rs5-premios.jpg'), (left[0]+20,left[1]+20,left[2]-20,left[3]-90))
    paste_cover(base, open_img(menu_dir/'cartela-bingo-rs7-premios.jpg'), (right[0]+20,right[1]+20,right[2]-20,right[3]-90))
    draw.text((left[0]+24, left[3]-62), 'Cartela R$ 5,00', font=font(34, True), fill=GREEN)
    draw.text((right[0]+24, right[3]-62), 'Cartela R$ 7,00', font=font(34, True), fill=GREEN)
    footer(draw, 'Cartelas divulgadas no cardápio · programação detalhada a seguir')
    base.save(path, quality=92)


def slide_rounds(path, title, round_slice):
    base = Image.new('RGB', (W,H), BG)
    draw = ImageDraw.Draw(base)
    header(base, title, 'Programação pública do bingo · 14/06/2026 · Bazar do Sementinha / Festa Junina do Tucxa', badge='Bingo')
    start_y = 260
    card_h = 225
    for idx, (num, price, meta, prizes) in enumerate(round_slice):
        x1,y1,x2,y2 = MARGIN, start_y + idx*(card_h+30), W-MARGIN, start_y + idx*(card_h+30)+card_h
        rounded_card(draw, (x1,y1,x2,y2), radius=28)
        draw.rounded_rectangle((x1+24,y1+24,x1+240,y1+80), radius=22, fill='#fef3c7')
        draw.text((x1+46,y1+37), f'Rodada {num}', font=font(34, True), fill=RED)
        draw.text((x1+270,y1+30), price + ' por cartela', font=font(32, True), fill=GREEN)
        draw_text(draw, (x1+270,y1+78), meta, font(26), fill='#4b5563', max_width=600)
        box_x = x1+880
        draw.rounded_rectangle((box_x,y1+24,x2-24,y2-24), radius=22, fill='#fff7ed', outline='#fed7aa', width=2)
        draw.text((box_x+24,y1+34), 'Prêmios previstos', font=font(28, True), fill=RED)
        py = y1+82
        for p in prizes:
            draw.rounded_rectangle((box_x+25, py+11, box_x+43, py+29), radius=9, fill=AMBER)
            draw_text(draw, (box_x+58, py), p, font(24), fill=DARK, max_width=(x2-24)-(box_x+80), line_spacing=3)
            py += 58
    footer(draw, 'Acompanhe a rodada aberta pelo sistema público no dia do evento')
    base.save(path, quality=92)


def slide_closing(path):
    base = Image.new('RGB', (W,H), BG)
    draw = ImageDraw.Draw(base)
    title_x = MARGIN
    subtitle_y = 250
    subtitle_x = MARGIN
    if logo_path.exists():
        logo = open_img(logo_path, (150,150))
        base.paste(logo, (MARGIN, 95))
        title_x = MARGIN + 185
    draw.text((title_x, 110), 'Aproveite a Festa Junina do Tucxa', font=font(66, True), fill=GREEN)
    draw_text(draw, (subtitle_x, subtitle_y), 'Veja o cardápio, confira a programação do bingo e chame um garçom para registrar seu pedido.', font(32), fill=DARK, max_width=980)
    box1 = (MARGIN, 380, 900, 610)
    box2 = (MARGIN, 650, 900, 880)
    box3 = (980, 380, 1830, 880)
    for box in [box1, box2, box3]:
        rounded_card(draw, box, radius=30)
    draw.text((box1[0]+30, box1[1]+28), 'Cardápio público', font=font(34, True), fill=RED)
    draw_text(draw, (box1[0]+30, box1[1]+90), 'tucxa-festa-junina.vercel.app/cardapio/arraia-tucxa-2026', font(24), fill=GREEN, max_width=700)
    draw.text((box2[0]+30, box2[1]+28), 'Programação do bingo', font=font(34, True), fill=RED)
    draw_text(draw, (box2[0]+30, box2[1]+90), 'bingo-sementinha.vercel.app/evento/bingo-festa-junina-do-tucxa-2026-06-14/programacao', font(20), fill=GREEN, max_width=670)
    draw.text((box3[0]+30, box3[1]+28), 'Para as TVs do evento', font=font(40, True), fill=GREEN)
    closing_points = [
        'Use este vídeo em loop nas TVs sem internet.',
        'Também disponível para assistir e baixar na página pública do cardápio.',
        'Arquivo em MP4, pronto para notebook, TV ou pendrive.',
    ]
    py = box3[1]+118
    for point in closing_points:
        draw.rounded_rectangle((box3[0]+30, py+8, box3[0]+48, py+26), radius=9, fill=AMBER)
        draw_text(draw, (box3[0]+62, py), point, font(27), fill=DARK, max_width=690, line_spacing=4)
        py += 120
    footer(draw, 'Vídeo promocional simples · Arraiá Tucxa 2026')
    base.save(path, quality=92)

# generate slides
for f in SLIDES.glob('slide-*.jpg'):
    f.unlink()

slide_intro(SLIDES/'slide-01.jpg')
slide_menu(SLIDES/'slide-02.jpg', **MENU_SLIDES[0])
slide_rounds(SLIDES/'slide-03.jpg', 'Rodadas 1 a 3', ROUNDS[0:3])
slide_menu(SLIDES/'slide-04.jpg', **MENU_SLIDES[1])
slide_rounds(SLIDES/'slide-05.jpg', 'Rodadas 4 a 6', ROUNDS[3:6])
slide_menu(SLIDES/'slide-06.jpg', **MENU_SLIDES[2])
slide_rounds(SLIDES/'slide-07.jpg', 'Rodadas 7 a 9', ROUNDS[6:9])
slide_bingo_cards(SLIDES/'slide-08.jpg')
slide_rounds(SLIDES/'slide-09.jpg', 'Rodadas 10 a 12', ROUNDS[9:12])
slide_rounds(SLIDES/'slide-10.jpg', 'Rodadas 13 a 15', ROUNDS[12:15])
slide_closing(SLIDES/'slide-11.jpg')

# poster
poster_target = OUTDIR/'arraia-tucxa-2026-cardapio-bingo-poster.jpg'
Image.open(SLIDES/'slide-01.jpg').save(poster_target, quality=92)

# concat file with duration seconds
concat = OUTDIR/'slides.txt'
entries = [
    ('slide-01.jpg', 7), ('slide-02.jpg', 7), ('slide-03.jpg', 8), ('slide-04.jpg', 7), ('slide-05.jpg', 8),
    ('slide-06.jpg', 7), ('slide-07.jpg', 8), ('slide-08.jpg', 7), ('slide-09.jpg', 8), ('slide-10.jpg', 8), ('slide-11.jpg', 8),
]
with open(concat, 'w', encoding='utf-8') as fh:
    for filename, dur in entries:
        fh.write(f"file '{(SLIDES/filename).as_posix()}'\n")
        fh.write(f'duration {dur}\n')
    fh.write(f"file '{(SLIDES/entries[-1][0]).as_posix()}'\n")

video_target = OUTDIR/'arraia-tucxa-2026-cardapio-bingo.mp4'
cmd = [
    'ffmpeg','-y','-f','concat','-safe','0','-i',str(concat),
    '-vsync','vfr','-pix_fmt','yuv420p','-vf',f'fps=30,format=yuv420p,scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2',
    '-c:v','libx264','-preset','medium','-crf','22',str(video_target)
]
subprocess.run(cmd, check=True)
print(f'Vídeo gerado em: {video_target}')
