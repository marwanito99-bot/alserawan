#!/usr/bin/env python3
"""
MWM Brands Manager — update-brands.py
======================================
Run this script whenever you edit brands.xlsx:
    python update-brands.py

It will:
  1. Read brands.xlsx (creates it with sample data if it doesn't exist)
  2. Generate brands-data.json (read by the website)

USAGE:
    python update-brands.py             → update from Excel
    python update-brands.py --create    → recreate Excel from scratch (overwrites!)
"""

import json, sys, os
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

EXCEL_PATH = os.path.join(os.path.dirname(__file__), "brands.xlsx")
JSON_PATH  = os.path.join(os.path.dirname(__file__), "mwm-equipments", "brands-data.json")

# ─────────────────────────────────────────────────────────────
#  INITIAL DATA — edit here then run --create, OR edit in Excel
# ─────────────────────────────────────────────────────────────
INITIAL_BRANDS = [
    {
        "brand_id": "makute",
        "name_en": "MAKUTE",
        "name_ar": "ماكوتي",
        "name_cn": "MAKUTE",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Professional Power Tools",
        "tagline_ar": "عدد كهربائية احترافية",
        "description_en": "MAKUTE is a professional power tools brand engineered for demanding trades and construction work. Their comprehensive range spans corded and cordless tools, outdoor equipment, fuel-powered machinery, hand tools, and accessories — delivering industrial-grade performance at competitive cost for MENA professionals.",
        "description_ar": "ماكوتي علامة تجارية متخصصة في العدد الكهربائية الاحترافية، مصممة للأعمال الصعبة والبناء. تشمل تشكيلتها الواسعة العدد السلكية واللاسلكية، معدات الهواء الطلق، المحركات، العدد اليدوية والملحقات — بأداء صناعي وبتكلفة تنافسية.",
        "logo_path": "images/brands/makute/logo.webp",
        "hero_path": "images/brands/makute/hero-banner.webp",
        "color": "#ccfd1b",
        "website": "https://www.makute.com",
        "featured": 1,
        "active": 1,
        "sort_order": 1,
    },
    {
        "brand_id": "sicam",
        "name_en": "SICAM",
        "name_ar": "سيكام",
        "name_cn": "SICAM",
        "country_en": "Italy",
        "country_ar": "إيطاليا",
        "flag": "🇮🇹",
        "tagline_en": "Tyre Workshop Equipment",
        "tagline_ar": "معدات ورشة الإطارات",
        "description_en": "SICAM is an Italian manufacturer of professional tyre workshop equipment with over 40 years of engineering experience. Their range covers tyre changers and wheel balancers built for high-volume tyre workshops, automotive service centres, and fleet maintenance operations.",
        "description_ar": "سيكام شركة إيطالية متخصصة في تصنيع معدات ورش الإطارات الاحترافية، بخبرة هندسية تتجاوز 40 عاماً. تشمل منتجاتها ماكينات تغيير الإطارات وموازنة العجلات.",
        "logo_path": "images/brands/sicam/logo.png",
        "hero_path": "images/brands/sicam/tyre-changer.png",
        "color": "#1d00f4",
        "website": "https://www.sicam.it",
        "featured": 1,
        "active": 1,
        "sort_order": 2,
    },
    {
        "brand_id": "raasm",
        "name_en": "RAASM",
        "name_ar": "راسم",
        "name_cn": "RAASM",
        "country_en": "Italy",
        "country_ar": "إيطاليا",
        "flag": "🇮🇹",
        "tagline_en": "Garage & Lubrication Systems",
        "tagline_ar": "أنظمة الكراج والتشحيم",
        "description_en": "RAASM is an Italian specialist in professional garage equipment and fluid handling systems. Their product range includes oil dispensing systems, grease pumps, pneumatic reels, and fuel management tools — designed for automotive workshops, service stations, and industrial facilities.",
        "description_ar": "راسم شركة إيطالية متخصصة في معدات ورش السيارات وأنظمة توزيع السوائل الصناعية. تشمل منتجاتها أنظمة توزيع الزيت، مضخات الشحم، بكرات الهواء الضغطي ومعدات إدارة الوقود.",
        "logo_path": "",
        "hero_path": "",
        "color": "#1d00f4",
        "website": "https://www.raasm.com",
        "featured": 1,
        "active": 1,
        "sort_order": 3,
    },
    {
        "brand_id": "kzubr",
        "name_en": "KZUBR",
        "name_ar": "كيزوبر",
        "name_cn": "KZUBR",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Power Tools & Grinders",
        "tagline_ar": "عدد كهربائية وطواحين",
        "description_en": "KZUBR is a professional-grade power tools brand offering a wide range of angle grinders, drills, heat guns, and cordless systems. Engineered for trade professionals requiring reliable daily performance.",
        "description_ar": "كيزوبر علامة تجارية متخصصة في العدد الكهربائية الاحترافية تشمل الطواحين والمثاقب وأجهزة الحرارة والمنظومات اللاسلكية — للمحترفين الذين يحتاجون أداء يومي موثوق.",
        "logo_path": "",
        "hero_path": "",
        "color": "#ff6b00",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 4,
    },
    {
        "brand_id": "maekida",
        "name_en": "MAEKIDA",
        "name_ar": "ماكيدا",
        "name_cn": "MAEKIDA",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Electric Drills & Tools",
        "tagline_ar": "مثاقب وعدد كهربائية",
        "description_en": "MAEKIDA offers professional electric drills, impact tools, and cordless combo kits designed for the construction and installation trades. Strong performance-to-value ratio for MENA professionals.",
        "description_ar": "ماكيدا تقدم مثاقب كهربائية احترافية، عدد دق، وطقم لاسلكية مصممة لقطاع البناء والتركيبات. أداء متميز بسعر تنافسي.",
        "logo_path": "",
        "hero_path": "",
        "color": "#00b4d8",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 5,
    },
    {
        "brand_id": "matika",
        "name_en": "MATIKA",
        "name_ar": "ماتيكا",
        "name_cn": "MATIKA",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "SDS Hammers & Welding",
        "tagline_ar": "مطارق SDS ومعدات لحام",
        "description_en": "MATIKA specialises in SDS rotary hammer drills, cordless battery systems, and welding equipment for construction and heavy-duty workshop applications.",
        "description_ar": "ماتيكا متخصصة في مطارق SDS الدوارة، منظومات البطاريات اللاسلكية ومعدات اللحام لتطبيقات البناء والورش الثقيلة.",
        "logo_path": "",
        "hero_path": "",
        "color": "#e63946",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 6,
    },
    {
        "brand_id": "mega",
        "name_en": "MEGA",
        "name_ar": "ميغا",
        "name_cn": "MEGA",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Cordless Tool Systems",
        "tagline_ar": "منظومات عدد لاسلكية",
        "description_en": "MEGA offers robust cordless tool combo kits and workshop machinery including SDS drills, angle grinders, and complete battery platform systems for professional trades.",
        "description_ar": "ميغا تقدم طقم عدد لاسلكية متينة وماكينات ورش تشمل مثاقب SDS والطواحين وأنظمة بطاريات متكاملة للمحترفين.",
        "logo_path": "",
        "hero_path": "",
        "color": "#f4a261",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 7,
    },
    {
        "brand_id": "miga",
        "name_en": "MIGA",
        "name_ar": "ميغا",
        "name_cn": "MIGA",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Power & Electric Tools",
        "tagline_ar": "عدد كهربائية وآلية",
        "description_en": "MIGA delivers quality cordless power tool sets including drills, grinders, and combo kits for construction crews and workshop professionals requiring reliable battery-powered performance.",
        "description_ar": "ميغا تقدم طقم عدد لاسلكية عالية الجودة تشمل مثاقب وطواحين وطقم متكاملة لفرق البناء والمحترفين.",
        "logo_path": "",
        "hero_path": "",
        "color": "#2d6a4f",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 8,
    },
    {
        "brand_id": "parksit",
        "name_en": "PARKSIT",
        "name_ar": "باركسيت",
        "name_cn": "PARKSIT",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Cordless Tools & Systems",
        "tagline_ar": "عدد لاسلكية وأنظمة",
        "description_en": "PARKSIT provides professional cordless tool systems including 3-piece and 4-piece combo kits with high-capacity batteries, suited for construction and maintenance professionals.",
        "description_ar": "باركسيت تقدم أنظمة عدد لاسلكية احترافية تشمل طقم 3 و4 قطع مع بطاريات عالية السعة، مناسبة للمحترفين في البناء والصيانة.",
        "logo_path": "",
        "hero_path": "",
        "color": "#457b9d",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 9,
    },
    {
        "brand_id": "sharp",
        "name_en": "SHARP",
        "name_ar": "شارب",
        "name_cn": "SHARP",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Cutting Discs & Abrasives",
        "tagline_ar": "أقراص قطع وكاشطات",
        "description_en": "SHARP manufactures premium chrome cutting discs and grinding discs in all standard sizes — from 115mm to 400mm — for angle grinders. High-performance abrasives for metal, steel, and heavy-duty cutting applications.",
        "description_ar": "شارب تصنع أقراص قص وجلخ كروم بجميع المقاسات القياسية — من 115مم إلى 400مم — لأجهزة الطاحونة. مواد كاشطة عالية الأداء لقص المعادن والفولاذ.",
        "logo_path": "",
        "hero_path": "",
        "color": "#c1121f",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 10,
    },
    {
        "brand_id": "dunko",
        "name_en": "DUNKO",
        "name_ar": "دانكو",
        "name_cn": "DUNKO",
        "country_en": "China",
        "country_ar": "الصين",
        "flag": "🇨🇳",
        "tagline_en": "Tire Inflators & Air Tools",
        "tagline_ar": "منفاخات إطارات وعدد هوائية",
        "description_en": "DUNKO specialises in heavy-duty 12V tire inflators — single and dual piston models — designed for automotive workshops, service stations, and roadside assistance operations requiring reliable, fast inflation.",
        "description_ar": "دانكو متخصصة في منفاخات الإطارات الثقيلة 12 فولت — بستون واحد وبستونين — مصممة لورش السيارات ومحطات الخدمة.",
        "logo_path": "",
        "hero_path": "",
        "color": "#6a0572",
        "website": "",
        "featured": 0,
        "active": 1,
        "sort_order": 11,
    },
    {
        "brand_id": "mwm",
        "name_en": "MWM",
        "name_ar": "MWM",
        "name_cn": "MWM",
        "country_en": "China · Italy · Germany",
        "country_ar": "الصين · إيطاليا · ألمانيا",
        "flag": "🏭",
        "tagline_en": "Our Own Label — Premium Equipment",
        "tagline_ar": "علامتنا الخاصة — معدات متميزة",
        "description_en": "MWM is our private label brand, representing a curated selection of heavy equipment and industrial machinery sourced and quality-verified directly through our Yiwu operations. Each MWM product meets stringent standards set by 25+ years of sourcing expertise.",
        "description_ar": "MWM هي علامتنا التجارية الخاصة، تمثل مجموعة منتقاة من المعدات الثقيلة والآلات الصناعية التي يتم توريدها والتحقق من جودتها مباشرة عبر عملياتنا في يوو. كل منتج MWM يلتزم بمعايير صارمة بناءً على 25+ عاماً من خبرة التوريد.",
        "logo_path": "images/logo-full.png",
        "hero_path": "images/ag1150.jpg",
        "color": "#ccfd1b",
        "website": "https://www.alserawan.com",
        "featured": 1,
        "active": 1,
        "sort_order": 12,
    },
]

INITIAL_PRODUCTS = [
    # MAKUTE
    {"product_id":"mk-001","brand_id":"makute","name_en":"Power Tools — AC","name_ar":"عدد كهربائية سلكية","image_path":"images/brands/makute/power-tools-ac.jpg","category_en":"Power Tools","category_ar":"عدد كهربائية","is_new":0,"active":1},
    {"product_id":"mk-002","brand_id":"makute","name_en":"Cordless Tool Systems","name_ar":"منظومات لاسلكية","image_path":"images/brands/makute/cordless-tools.jpg","category_en":"Cordless","category_ar":"لاسلكية","is_new":0,"active":1},
    {"product_id":"mk-003","brand_id":"makute","name_en":"Hand Tools","name_ar":"عدد يدوية","image_path":"images/brands/makute/hand-tools.jpg","category_en":"Hand Tools","category_ar":"عدد يدوية","is_new":0,"active":1},
    {"product_id":"mk-004","brand_id":"makute","name_en":"Outdoor Equipment","name_ar":"معدات هواء طلق","image_path":"images/brands/makute/outdoor-tools.jpg","category_en":"Outdoor","category_ar":"هواء طلق","is_new":0,"active":1},
    {"product_id":"mk-005","brand_id":"makute","name_en":"Fuel Equipment","name_ar":"معدات وقود","image_path":"images/brands/makute/fuel-equipment.jpg","category_en":"Fuel","category_ar":"وقود","is_new":0,"active":1},
    {"product_id":"mk-006","brand_id":"makute","name_en":"Accessories & Parts","name_ar":"ملحقات وقطع غيار","image_path":"images/brands/makute/accessories.jpg","category_en":"Accessories","category_ar":"ملحقات","is_new":0,"active":1},
    # SICAM
    {"product_id":"sc-001","brand_id":"sicam","name_en":"Tyre Changers","name_ar":"ماكينات تغيير الإطارات","image_path":"images/brands/sicam/tyre-changer.png","category_en":"Tyre Equipment","category_ar":"معدات إطارات","is_new":0,"active":1},
    {"product_id":"sc-002","brand_id":"sicam","name_en":"Wheel Balancers","name_ar":"أجهزة موازنة العجلات","image_path":"images/brands/sicam/wheel-balancer.png","category_en":"Balancing","category_ar":"موازنة","is_new":0,"active":1},
    # RAASM
    {"product_id":"ra-001","brand_id":"raasm","name_en":"Oil Dispensing Systems","name_ar":"أنظمة توزيع الزيت","image_path":"","category_en":"Oil Systems","category_ar":"أنظمة زيت","is_new":0,"active":1},
    {"product_id":"ra-002","brand_id":"raasm","name_en":"Grease Pumps","name_ar":"مضخات الشحم","image_path":"","category_en":"Lubrication","category_ar":"تشحيم","is_new":0,"active":1},
    {"product_id":"ra-003","brand_id":"raasm","name_en":"Pneumatic Hose Reels","name_ar":"بكرات الخرطوم الهوائي","image_path":"","category_en":"Air Systems","category_ar":"أنظمة هواء","is_new":0,"active":1},
    {"product_id":"ra-004","brand_id":"raasm","name_en":"Fuel Management","name_ar":"إدارة الوقود","image_path":"","category_en":"Fuel","category_ar":"وقود","is_new":0,"active":1},
    # KZUBR
    {"product_id":"kz-001","brand_id":"kzubr","name_en":"Cordless Angle Grinders","name_ar":"طواحين لاسلكية","image_path":"","category_en":"Grinders","category_ar":"طواحين","is_new":0,"active":1},
    {"product_id":"kz-002","brand_id":"kzubr","name_en":"Cordless Impact Wrenches","name_ar":"فرد عزق لاسلكي","image_path":"","category_en":"Impact Tools","category_ar":"عدد دق","is_new":0,"active":1},
    {"product_id":"kz-003","brand_id":"kzubr","name_en":"Heat Guns","name_ar":"مسدسات الحرارة","image_path":"","category_en":"Heat Tools","category_ar":"أدوات حرارة","is_new":0,"active":1},
    # MAEKIDA
    {"product_id":"me-001","brand_id":"maekida","name_en":"Impact Drills","name_ar":"مثاقب عزم","image_path":"","category_en":"Drills","category_ar":"مثاقب","is_new":0,"active":1},
    {"product_id":"me-002","brand_id":"maekida","name_en":"Cordless Combo Kits","name_ar":"طقم لاسلكية","image_path":"","category_en":"Cordless","category_ar":"لاسلكية","is_new":0,"active":1},
    # MATIKA
    {"product_id":"mt-001","brand_id":"matika","name_en":"SDS Rotary Hammers","name_ar":"مطارق SDS","image_path":"","category_en":"SDS Hammers","category_ar":"مطارق SDS","is_new":0,"active":1},
    {"product_id":"mt-002","brand_id":"matika","name_en":"Battery Systems","name_ar":"منظومات بطاريات","image_path":"","category_en":"Batteries","category_ar":"بطاريات","is_new":0,"active":1},
    # MEGA
    {"product_id":"mg-001","brand_id":"mega","name_en":"Cordless Tool Kits","name_ar":"طقم عدد لاسلكية","image_path":"","category_en":"Cordless","category_ar":"لاسلكية","is_new":0,"active":1},
    {"product_id":"mg-002","brand_id":"mega","name_en":"SDS Drills","name_ar":"مثاقب SDS","image_path":"","category_en":"SDS","category_ar":"SDS","is_new":0,"active":1},
    # MIGA
    {"product_id":"mi-001","brand_id":"miga","name_en":"Cordless Tool Sets","name_ar":"طقم عدد لاسلكية","image_path":"","category_en":"Cordless","category_ar":"لاسلكية","is_new":0,"active":1},
    # PARKSIT
    {"product_id":"pk-001","brand_id":"parksit","name_en":"Cordless Combo Kits","name_ar":"طقم لاسلكية متكاملة","image_path":"","category_en":"Cordless","category_ar":"لاسلكية","is_new":0,"active":1},
    # SHARP
    {"product_id":"sh-001","brand_id":"sharp","name_en":"Chrome Cutting Discs","name_ar":"أقراص قص كروم","image_path":"","category_en":"Cutting Discs","category_ar":"أقراص قطع","is_new":0,"active":1},
    {"product_id":"sh-002","brand_id":"sharp","name_en":"Grinding Discs","name_ar":"أقراص جلخ","image_path":"","category_en":"Grinding","category_ar":"جلخ","is_new":0,"active":1},
    # DUNKO
    {"product_id":"dk-001","brand_id":"dunko","name_en":"12V Single-Piston Inflator","name_ar":"منفاخ 12V بستون واحد","image_path":"","category_en":"Inflators","category_ar":"منفاخات","is_new":0,"active":1},
    {"product_id":"dk-002","brand_id":"dunko","name_en":"12V Dual-Piston Inflator","name_ar":"منفاخ 12V بستونين","image_path":"","category_en":"Inflators","category_ar":"منفاخات","is_new":0,"active":1},
    # MWM
    {"product_id":"mw-001","brand_id":"mwm","name_en":"Angle Grinder AG1150","name_ar":"طاحونة AG1150","image_path":"images/ag1150.jpg","category_en":"Grinders","category_ar":"طواحين","is_new":0,"active":1},
    {"product_id":"mw-002","brand_id":"mwm","name_en":"Chain Saw CW20","name_ar":"منشار جنزيري CW20","image_path":"images/cw20.jpg","category_en":"Saws","category_ar":"مناشير","is_new":0,"active":1},
    {"product_id":"mw-003","brand_id":"mwm","name_en":"Band Saw SB250","name_ar":"منشار شريطي SB250","image_path":"images/sb250.jpg","category_en":"Saws","category_ar":"مناشير","is_new":0,"active":1},
    {"product_id":"mw-004","brand_id":"mwm","name_en":"Screw Driver SD612","name_ar":"مفك SD612","image_path":"images/sd612.jpg","category_en":"Drills","category_ar":"مثاقب","is_new":0,"active":1},
    {"product_id":"mw-005","brand_id":"mwm","name_en":"Scroll Saw SW108","name_ar":"منشار SW108","image_path":"images/sw108.jpg","category_en":"Saws","category_ar":"مناشير","is_new":0,"active":1},
    {"product_id":"mw-006","brand_id":"mwm","name_en":"Water Pump WP3000","name_ar":"طرمبة مياه WP3000","image_path":"images/wp3000.jpg","category_en":"Pumps","category_ar":"طرمبات","is_new":0,"active":1},
]

INITIAL_NEW_ARRIVALS = []  # Add new arrival items here (same structure as products)

# ─────────────────────────────────────────────────────────────
#  EXCEL CREATION
# ─────────────────────────────────────────────────────────────
HEADER_FILL   = PatternFill("solid", fgColor="1d00f4")
HEADER_FONT   = Font(bold=True, color="FFFFFF", size=10)
ROW_ALT_FILL  = PatternFill("solid", fgColor="F5F5FF")
THIN          = Border(
    left=Side(style="thin",color="CCCCCC"),
    right=Side(style="thin",color="CCCCCC"),
    top=Side(style="thin",color="CCCCCC"),
    bottom=Side(style="thin",color="CCCCCC"),
)

def style_header(ws, headers, col_widths):
    for i, (h, w) in enumerate(zip(headers, col_widths), 1):
        c = ws.cell(row=1, column=i, value=h)
        c.font = HEADER_FONT
        c.fill = HEADER_FILL
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = THIN
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 28

def style_row(ws, row_idx, num_cols):
    fill = ROW_ALT_FILL if row_idx % 2 == 0 else None
    for col in range(1, num_cols + 1):
        c = ws.cell(row=row_idx, column=col)
        if fill:
            c.fill = fill
        c.border = THIN
        c.alignment = Alignment(vertical="top", wrap_text=True)

def create_excel():
    wb = Workbook()

    # ── Sheet 1: Brands ──
    ws_b = wb.active
    ws_b.title = "Brands"
    ws_b.freeze_panes = "B2"

    brand_headers = [
        "brand_id","name_en","name_ar","name_cn","country_en","country_ar",
        "flag","tagline_en","tagline_ar","description_en","description_ar",
        "logo_path","hero_path","color","website","featured","active","sort_order"
    ]
    brand_widths = [14,12,14,12,12,12,6,22,22,45,45,30,30,10,30,8,7,8]
    style_header(ws_b, brand_headers, brand_widths)

    for ri, brand in enumerate(INITIAL_BRANDS, 2):
        for ci, key in enumerate(brand_headers, 1):
            c = ws_b.cell(row=ri, column=ci, value=brand.get(key, ""))
            c.alignment = Alignment(vertical="top", wrap_text=True)
        style_row(ws_b, ri, len(brand_headers))

    # ── Sheet 2: Products ──
    ws_p = wb.create_sheet("Products")
    ws_p.freeze_panes = "B2"

    prod_headers = [
        "product_id","brand_id","name_en","name_ar","image_path",
        "category_en","category_ar","is_new","active"
    ]
    prod_widths = [12,12,30,30,38,16,16,7,7]
    style_header(ws_p, prod_headers, prod_widths)

    for ri, prod in enumerate(INITIAL_PRODUCTS, 2):
        for ci, key in enumerate(prod_headers, 1):
            ws_p.cell(row=ri, column=ci, value=prod.get(key,""))
        style_row(ws_p, ri, len(prod_headers))

    # ── Sheet 3: New Arrivals ──
    ws_n = wb.create_sheet("New Arrivals")
    ws_n.freeze_panes = "B2"

    na_headers = [
        "product_id","brand_id","name_en","name_ar","image_path",
        "category_en","category_ar","active"
    ]
    na_widths = [12,12,30,30,38,16,16,7]
    style_header(ws_n, na_headers, na_widths)

    # Add usage note
    ws_n["A2"] = "Add new products here. Set active=1 to show them on the site."
    ws_n["A2"].font = Font(italic=True, color="888888")

    # ── Sheet 4: Instructions ──
    ws_i = wb.create_sheet("Instructions")
    instructions = [
        ("HOW TO USE THIS FILE", True),
        ("", False),
        ("1. Edit the Brands sheet to add/edit/remove brands.", False),
        ("   - Set active=0 to hide a brand without deleting it", False),
        ("   - Set featured=1 to give a brand a larger card", False),
        ("   - logo_path and hero_path: paths relative to site root (e.g. images/brands/makute/logo.webp)", False),
        ("   - color: hex color used for the brand accent (e.g. #ccfd1b)", False),
        ("", False),
        ("2. Edit the Products sheet to add/edit/remove products.", False),
        ("   - brand_id must match a brand_id in the Brands sheet", False),
        ("   - image_path: path relative to site root", False),
        ("   - Leave image_path empty for text-only product cards", False),
        ("", False),
        ("3. Edit the New Arrivals sheet to feature specific new products.", False),
        ("   - These appear in the 'New Arrivals' section at the top of the page", False),
        ("", False),
        ("4. AFTER EDITING: Save this file, then run:", False),
        ("       python update-brands.py", False),
        ("   This will update the website data automatically.", False),
        ("", False),
        ("IMAGE PATH FORMAT:", True),
        ("   images/brands/makute/logo.webp     ← for brand images", False),
        ("   images/ag1150.jpg                  ← for product images in root images folder", False),
    ]
    for row, (text, bold) in enumerate(instructions, 1):
        c = ws_i.cell(row=row, column=1, value=text)
        if bold:
            c.font = Font(bold=True, size=12, color="1d00f4")
        else:
            c.font = Font(size=10)
    ws_i.column_dimensions["A"].width = 75

    wb.save(EXCEL_PATH)
    print(f"✅ Created Excel: {EXCEL_PATH}")

# ─────────────────────────────────────────────────────────────
#  READ EXCEL → GENERATE JSON
# ─────────────────────────────────────────────────────────────
def read_excel_and_generate_json():
    if not os.path.exists(EXCEL_PATH):
        print(f"❌ brands.xlsx not found at {EXCEL_PATH}")
        print("   Run: python update-brands.py --create  to create it")
        sys.exit(1)

    wb = load_workbook(EXCEL_PATH, data_only=True)

    # Read brands
    ws_b = wb["Brands"]
    brand_headers = [c.value for c in ws_b[1]]
    brands = []
    for row in ws_b.iter_rows(min_row=2, values_only=True):
        if not row[0]:  # skip empty rows
            continue
        brand = dict(zip(brand_headers, row))
        # normalize types
        brand["featured"] = int(brand.get("featured") or 0)
        brand["active"]   = int(brand.get("active")   or 0)
        brand["sort_order"] = int(brand.get("sort_order") or 99)
        brands.append(brand)

    brands.sort(key=lambda b: b.get("sort_order", 99))

    # Read products
    ws_p = wb["Products"]
    prod_headers = [c.value for c in ws_p[1]]
    products = []
    for row in ws_p.iter_rows(min_row=2, values_only=True):
        if not row[0]:
            continue
        prod = dict(zip(prod_headers, row))
        prod["is_new"] = int(prod.get("is_new") or 0)
        prod["active"] = int(prod.get("active") or 0)
        products.append(prod)

    # Read new arrivals
    ws_n = wb["New Arrivals"]
    na_headers = [c.value for c in ws_n[1]]
    new_arrivals = []
    for row in ws_n.iter_rows(min_row=2, values_only=True):
        if not row[0] or str(row[0]).startswith("Add new"):
            continue
        item = dict(zip(na_headers, row))
        if int(item.get("active") or 0):
            new_arrivals.append(item)

    # Attach products to brands
    for brand in brands:
        bid = brand["brand_id"]
        brand["products"] = [
            p for p in products
            if p.get("brand_id") == bid and p.get("active") == 1
        ]

    output = {
        "brands": [b for b in brands if b.get("active") == 1],
        "new_arrivals": new_arrivals,
        "_generated": "Run update-brands.py to regenerate",
    }

    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    active_count  = len(output["brands"])
    product_count = sum(len(b["products"]) for b in output["brands"])
    print(f"✅ Generated: {JSON_PATH}")
    print(f"   Brands: {active_count}  |  Products: {product_count}  |  New Arrivals: {len(new_arrivals)}")

# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    force_create = "--create" in sys.argv

    if force_create or not os.path.exists(EXCEL_PATH):
        if force_create:
            print("🔄 Recreating Excel from scratch...")
        create_excel()

    read_excel_and_generate_json()
    print("\nDone! Push your changes to GitHub to publish.")
