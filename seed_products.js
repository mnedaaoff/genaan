const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
    if (!supabaseKey && line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error("Could not read .env.local:", e);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define categories
const categoriesToSeed = [
  { name: 'نباتات داخلية', image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600' },
  { name: 'نباتات خارجية', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600' },
  { name: 'نباتات المطبخ', image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=600' },
  { name: 'بذور للزراعة', image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600' }
];

// Define products
const productsToSeed = [
  // ─── Indoor Plants ─────────────────────────────────────────────────────────
  {
    name: 'أجلونيما مصري',
    name_en: 'Egyptian Aglaonema',
    scientific_name: 'Aglaonema simplex',
    description: 'نبتة أجلونيما مصري مميزة وسهلة الرعاية لتزيين منزلك.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
    is_active: true
  },
  {
    name: 'أجلونيما مستورد',
    name_en: 'Imported Aglaonema',
    scientific_name: 'Aglaonema commutatum',
    description: 'نبتة أجلونيما مستوردة بأوراق زاهية تضفي لمسة جمالية على الغرف.',
    price: Math.round(350 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
    is_active: true
  },
  {
    name: 'شيفليرا (ارتفاع متر)',
    name_en: 'Schefflera (1m height)',
    scientific_name: 'Schefflera arboricola',
    description: 'شيفليرا بارتفاع متر واحد، مناسبة للزوايا والصالونات.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=600',
    is_active: true
  },
  {
    name: 'شيفليرا (حجم صغير)',
    name_en: 'Schefflera (small size)',
    scientific_name: 'Schefflera arboricola',
    description: 'شيفليرا بحجم صغير مثالية للمكاتب والطاولات.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=600',
    is_active: true
  },
  {
    name: 'كلاسيا ريشة',
    name_en: 'Calathea Feather',
    scientific_name: 'Calathea insignis',
    description: 'كلاسيا ريشة بأوراقها المزركشة التي تشبه ريش الطاووس.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600',
    is_active: true
  },
  {
    name: 'كلاسيا قطيفة',
    name_en: 'Calathea Velvet',
    scientific_name: 'Calathea rufibarba',
    description: 'كلاسيا قطيفة تمتاز بملمس أوراقها الناعم والمميز.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600',
    is_active: true
  },
  {
    name: 'ديفنباخيا ماريانا (عود مفرد)',
    name_en: 'Dieffenbachia Mariana (single stem)',
    scientific_name: 'Dieffenbachia Mariana',
    description: 'ديفنباخيا ماريانا عود مفرد ذات أوراق عريضة مرقطة.',
    price: Math.round(450 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1612360565810-77a83ee15ccb?w=600',
    is_active: true
  },
  {
    name: 'ديفنباخيا تروبيك (عود مفرد)',
    name_en: 'Dieffenbachia Tropic (single stem)',
    scientific_name: 'Dieffenbachia Tropic',
    description: 'ديفنباخيا تروبيك عود مفرد تمتاز بنموها القوي ولونها الجذاب.',
    price: Math.round(450 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1612360565810-77a83ee15ccb?w=600',
    is_active: true
  },
  {
    name: 'صبار عقرب',
    name_en: 'Scorpion Cactus',
    scientific_name: 'Cactus',
    description: 'صبار عقرب مميز ومقاوم للجفاف، مثالي للزينة.',
    price: Math.round(120 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    is_active: true
  },
  {
    name: 'زنبق السلام (حجم صغير)',
    name_en: 'Peace Lily (small size)',
    scientific_name: 'Spathiphyllum wallisii',
    description: 'زنبق السلام بحجم صغير، ينتج زهوراً بيضاء جميلة وينقي الهواء.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600',
    is_active: true
  },
  {
    name: 'زنبق السلام (حجم متوسط)',
    name_en: 'Peace Lily (medium size)',
    scientific_name: 'Spathiphyllum wallisii',
    description: 'زنبق السلام بحجم متوسط، يضفي هدوءاً وجمالاً على المكان.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600',
    is_active: true
  },
  {
    name: 'زنبق السلام (حجم كبير)',
    name_en: 'Peace Lily (large size)',
    scientific_name: 'Spathiphyllum wallisii',
    description: 'زنبق السلام بحجم كبير فخم ومناسب للمساحات الكبيرة.',
    price: Math.round(550 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600',
    is_active: true
  },
  {
    name: 'فوجير',
    name_en: 'Boston Fern',
    scientific_name: 'Nephrolepis exaltata',
    description: 'سرخس الفوجير أوراقه منسدلة بشكل جميل، يفضل الرطوبة.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1517404312210-9114ad328e83?w=600',
    is_active: true
  },
  {
    name: 'بركيني',
    name_en: 'Birkin Philodendron',
    scientific_name: 'Philodendron Birkin',
    description: 'بركيني بأوراقها ذات الخطوط البيضاء الكريمية الرائعة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
    is_active: true
  },
  {
    name: 'إمبريال',
    name_en: 'Imperial Philodendron',
    scientific_name: 'Philodendron Imperial',
    description: 'نبتة إمبريال مميزة بأوراقها الكبيرة اللامعة.',
    price: Math.round(400 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600',
    is_active: true
  },
  {
    name: 'سبديفيلم مبقّرش',
    name_en: 'Variegated Spathiphyllum',
    scientific_name: 'Spathiphyllum Variegated',
    description: 'سبديفيلم مبقّرش (زنبق السلام المبرقش) بأوراق مرقطة بالأبيض والجرين.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600',
    is_active: true
  },
  {
    name: 'بيبروميا خضراء',
    name_en: 'Green Peperomia',
    scientific_name: 'Peperomia obtusifolia',
    description: 'بيبروميا خضراء بأوراق لحمية مستديرة لامعة، سهلة العناية جداً.',
    price: Math.round(120 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600',
    is_active: true
  },
  {
    name: 'بنت القنصل',
    name_en: 'Poinsettia',
    scientific_name: 'Euphorbia pulcherrima',
    description: 'بنت القنصل حمراء زاهية (غير متاحة حالياً).',
    price: 0,
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600',
    is_active: false
  },
  {
    name: 'رابس',
    name_en: 'Lady Palm (Rhapis)',
    scientific_name: 'Rhapis excelsa',
    description: 'نخيل الرابس الفخم لزوايا الصالونات والمكاتب المضيئة.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600',
    is_active: true
  },
  {
    name: 'شمدوريا',
    name_en: 'Chamaedorea Palm',
    scientific_name: 'Chamaedorea elegans',
    description: 'نخلة الشمدوريا الأنيقة لتنقية الهواء والزينة الداخلية.',
    price: Math.round(550 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600',
    is_active: true
  },
  {
    name: 'نبات الثعبان المقزم',
    name_en: 'Dwarf Snake Plant',
    scientific_name: 'Sansevieria trifasciata Laurentii',
    description: 'نبات الثعبان المقزم يتحمل الإضاءة الضعيفة وقلة الري.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600',
    is_active: true
  },
  {
    name: 'نبات الثعبان العادي',
    name_en: 'Snake Plant Regular',
    scientific_name: 'Sansevieria trifasciata',
    description: 'نبات الثعبان العادي طويل ومنقي ممتاز للهواء.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600',
    is_active: true
  },
  {
    name: 'أريكا',
    name_en: 'Areca Palm',
    scientific_name: 'Dypsis lutescens',
    description: 'نخيل الأريكا يضيف لمسة استوائية رائعة في البيوت الكبيرة.',
    price: Math.round(550 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600',
    is_active: true
  },
  {
    name: 'ألوكاسيا (حجم صغير)',
    name_en: 'Alocasia (small size)',
    scientific_name: 'Alocasia Amazonica',
    description: 'ألوكاسيا حجم صغير وتسمى نبتة أذن الفيل ذات العروق البارزة.',
    price: Math.round(125 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1617173942858-e432f65a676b?w=600',
    is_active: true
  },
  {
    name: 'ألوكاسيا (حجم أكبر)',
    name_en: 'Alocasia (larger size)',
    scientific_name: 'Alocasia Amazonica',
    description: 'ألوكاسيا بحجم أكبر وأوراق عريضة فخمة.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1617173942858-e432f65a676b?w=600',
    is_active: true
  },
  {
    name: 'سنجونيوم أخضر',
    name_en: 'Green Syngonium',
    scientific_name: 'Syngonium podophyllum',
    description: 'سنجونيوم أخضر متسلق أو متدلي ينمو بسرعة وسهل العناية.',
    price: Math.round(70 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1620127812932-d9a0d4bd8c58?w=600',
    is_active: true
  },
  {
    name: 'سنجونيوم روز',
    name_en: 'Rose Syngonium',
    scientific_name: 'Syngonium podophyllum Pink',
    description: 'سنجونيوم روز بأوراق وردية ناعمة وجذابة.',
    price: Math.round(130 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1620127812932-d9a0d4bd8c58?w=600',
    is_active: true
  },
  {
    name: 'جينيورا',
    name_en: 'Gynura (Purple Passion)',
    scientific_name: 'Gynura aurantiaca',
    description: 'جينيورا ذات الأوراق المخملية البنفسجية (غير متاحة حالياً).',
    price: 0,
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1508558934129-51d87ae700f4?w=600',
    is_active: false
  },
  {
    name: 'بوتس إنجوي هانج',
    name_en: 'Pothos Enjoy Hanging',
    scientific_name: 'Epipremnum aureum N-Joy',
    description: 'بوتس إنجوي هانج متدلي بأوراق صغيرة مبرقشة بالأبيض والأخضر.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?w=600',
    is_active: true
  },
  {
    name: 'بوتس إنجوي استيك',
    name_en: 'Pothos Enjoy on Stick',
    scientific_name: 'Epipremnum aureum N-Joy Stick',
    description: 'بوتس إنجوي مثبت على استيك عمودي (غير متاح حالياً).',
    price: 0,
    categoryName: 'نباتات داخلية',
    image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?w=600',
    is_active: false
  },

  // ─── Kitchen Plants ────────────────────────────────────────────────────────
  {
    name: 'ريحان بلدي',
    name_en: 'Local Basil',
    scientific_name: 'Ocimum basilicum Local',
    description: 'ريحان بلدي ذو رائحة نفاذة، رائع للمأكولات والشاي.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=600',
    is_active: true
  },
  {
    name: 'ريحان ايطالي',
    name_en: 'Italian Basil',
    scientific_name: 'Ocimum basilicum Italian',
    description: 'ريحان إيطالي أوراق عريضة مثالي للباستا والبيستو.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=600',
    is_active: true
  },
  {
    name: 'عطر',
    name_en: 'Attar (Scented Geranium)',
    scientific_name: 'Pelargonium graveolens',
    description: 'عطر ذو رائحة عطرية جميلة تستخدم أوراقه في الشاي والحلويات.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1589733901241-5a55cd29f9e3?w=600',
    is_active: true
  },
  {
    name: 'روزمارى',
    name_en: 'Rosemary',
    scientific_name: 'Salvia rosmarinus',
    description: 'روزماري (إكليل الجبل) نبتة مطبخية وعطرية مميزة للحوم والطبخ.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1527457977820-2ef531283e58?w=600',
    is_active: true
  },
  {
    name: 'لافندر',
    name_en: 'Lavender',
    scientific_name: 'Lavandula',
    description: 'لافندر مهدئ برائحة ساحرة، مفيد للمطبخ والزينة والتعطير.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600',
    is_active: true
  },
  {
    name: 'مسك الليل',
    name_en: 'Night Blooming Jasmine',
    scientific_name: 'Cestrum nocturnum',
    description: 'مسك الليل يفوح برائحته العطرة الساحرة في المساء.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600',
    is_active: true
  },
  {
    name: 'ورق لورى',
    name_en: 'Bay Leaf (Lorry)',
    scientific_name: 'Laurus nobilis',
    description: 'ورق لوري (الغار) يزرع في أصص بالمطبخ، هام جداً في إعداد الطعام.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1598965402049-6b6c287c88a4?w=600',
    is_active: true
  },
  {
    name: 'لويزا',
    name_en: 'Lemon Verbena (Louisa)',
    scientific_name: 'Aloysia citrodora',
    description: 'لويزا (مليسة) ذات نكهة ليمونية مميزة ومفيدة جداً للمشروبات الساخنة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات المطبخ',
    image: 'https://images.unsplash.com/photo-1598965402049-6b6c287c88a4?w=600',
    is_active: true
  },

  // ─── Outdoor & Fruits ──────────────────────────────────────────────────────
  {
    name: 'ياسمين احمر متسلق',
    name_en: 'Climbing Red Jasmine',
    scientific_name: 'Quisqualis indica',
    description: 'ياسمين أحمر متسلق سريع النمو وبأزهار حمراء وردية جميلة.',
    price: Math.round(350 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600',
    is_active: true
  },
  {
    name: 'موريا',
    name_en: 'Murraya Shrub',
    scientific_name: 'Murraya paniculata',
    description: 'موريا شجيرة خارجية برائحة زكية تشبه رائحة البرتقال.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
    is_active: true
  },
  {
    name: 'ياسمين بلدي',
    name_en: 'Local White Jasmine',
    scientific_name: 'Jasminum officinale',
    description: 'ياسمين بلدي متسلق فواح بأزهار بيضاء ناصعة الجمال.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600',
    is_active: true
  },
  {
    name: 'فل',
    name_en: 'Arabian Jasmine (Full)',
    scientific_name: 'Jasminum sambac',
    description: 'شجيرة الفل البلدي بأزهارها البيضاء ذات الرائحة الشرقية الفواحة.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600',
    is_active: true
  },
  {
    name: 'ورد بلدي',
    name_en: 'Local Damask Rose',
    scientific_name: 'Rosa damascena',
    description: 'ورد بلدي ذو رائحة ممتازة وتزهير مستمر في الشرفات والحدائق.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    is_active: true
  },
  {
    name: 'ورد ألماني',
    name_en: 'German Rose',
    scientific_name: 'Rosa Germanica',
    description: 'ورد ألماني من فصائل الورد الفخمة بألوان زاهية وجميلة.',
    price: Math.round(130 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1533604905141-1f9e5750f268?w=600',
    is_active: true
  },
  {
    name: 'سرو ايطالي (طول متر)',
    name_en: 'Italian Cypress (1m height)',
    scientific_name: 'Cupressus sempervirens',
    description: 'سرو إيطالي مخروطي الشكل رائع للحدائق وتحديد الممرات.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1527383214149-ca21a5b02979?w=600',
    is_active: true
  },
  {
    name: 'بزروميا',
    name_en: 'Conocarpus (Pizromia)',
    scientific_name: 'Conocarpus erectus',
    description: 'بزروميا للأسوار والمصدات الخارجية (غير متاح حالياً).',
    price: 0,
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
    is_active: false
  },
  {
    name: 'نخل ملوكي',
    name_en: 'Royal Palm',
    scientific_name: 'Roystonea regia',
    description: 'نخل ملوكي للحدائق الكبيرة والقصور (غير متاح حالياً).',
    price: 0,
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    is_active: false
  },

  // ─── Outdoor Fruits ────────────────────────────────────────────────────────
  {
    name: 'مانجو كبير',
    name_en: 'Mango Tree Large',
    scientific_name: 'Mangifera indica Large',
    description: 'شجرة مانجو بحجم كبير مطعومة وجاهزة للنمو والتزهير.',
    price: Math.round(140 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
    is_active: true
  },
  {
    name: 'مانجو وسط',
    name_en: 'Mango Tree Medium',
    scientific_name: 'Mangifera indica Medium',
    description: 'شجرة مانجو حجم متوسط ومطعومة.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
    is_active: true
  },
  {
    name: 'كريز برازيلي',
    name_en: 'Brazilian Cherry',
    scientific_name: 'Eugenia uniflora',
    description: 'كريز برازيلي شجيرة مثمرة سريعة النمو ذات طعم رائع.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600',
    is_active: true
  },
  {
    name: 'كريز برازيلي عمر الطرح',
    name_en: 'Brazilian Cherry Fruiting Age',
    scientific_name: 'Eugenia uniflora Mature',
    description: 'شجيرة كريز برازيلي في عمر الطرح والإنتاج.',
    price: Math.round(650 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600',
    is_active: true
  },
  {
    name: 'ليمون قزمي',
    name_en: 'Dwarf Lemon',
    scientific_name: 'Citrus limon Dwarf',
    description: 'ليمون قزمي مناسب للزراعة في البلكونات وأسطح المنازل.',
    price: Math.round(80 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون قزمي كبير (نوع أول)',
    name_en: 'Dwarf Lemon Large (Type I)',
    scientific_name: 'Citrus limon Dwarf Large',
    description: 'ليمون قزمي حجم كبير ذو إنتاجية ممتازة.',
    price: Math.round(160 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون قزمي كبير (نوع ثانٍ)',
    name_en: 'Dwarf Lemon Large (Type II)',
    scientific_name: 'Citrus limon Dwarf Large Premium',
    description: 'ليمون قزمي بحجم أكبر فخم ومثمر.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون كافيار',
    name_en: 'Caviar Lime',
    scientific_name: 'Citrus australasica',
    description: 'ليمون كافيار فاخر ذو حبات لؤلؤية لذيذة في الداخل.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون كافيار أخضر',
    name_en: 'Green Caviar Lime',
    scientific_name: 'Citrus australasica Green',
    description: 'ليمون كافيار أخضر نادر وفاخر.',
    price: Math.round(450 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون كافيار أسود',
    name_en: 'Black Caviar Lime',
    scientific_name: 'Citrus australasica Black',
    description: 'ليمون كافيار أسود مطلوب جداً ومثمر.',
    price: Math.round(400 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون بلدي',
    name_en: 'Local Lemon',
    scientific_name: 'Citrus limon Local',
    description: 'ليمون بلدي مثمر وشائع الاستخدام ومميز بمذاقه الحمضي القوي.',
    price: Math.round(30 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون بلدي كبير',
    name_en: 'Local Lemon Large',
    scientific_name: 'Citrus limon Local Large',
    description: 'ليمون بلدي بحجم كبير ومثمر بغزارة.',
    price: Math.round(130 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'ليمون بنزهير كبير',
    name_en: 'Banzoheir Lemon Large',
    scientific_name: 'Citrus limon Banzoheir',
    description: 'ليمون بنزهير بحجم كبير ونمو ممتاز.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600',
    is_active: true
  },
  {
    name: 'برتقال مطعوم صغير',
    name_en: 'Grafted Orange Small',
    scientific_name: 'Citrus sinensis Small',
    description: 'برتقال مطعوم بحجم صغير جاهز للإنبات.',
    price: Math.round(30 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
    is_active: true
  },
  {
    name: 'برتقال كبير (نوع أول)',
    name_en: 'Orange Large (Type I)',
    scientific_name: 'Citrus sinensis Large',
    description: 'برتقال كبير مطعوم مثمر.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
    is_active: true
  },
  {
    name: 'برتقال كبير (نوع ثانٍ)',
    name_en: 'Orange Large (Type II)',
    scientific_name: 'Citrus sinensis Large Premium',
    description: 'شجرة برتقال كبيرة جداً ومثمرة بغزارة.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
    is_active: true
  },
  {
    name: 'يوسفي صغير',
    name_en: 'Tangerine Small',
    scientific_name: 'Citrus reticulata Small',
    description: 'يوسفي صغير مطعوم ومثالي للحدائق الصغيرة.',
    price: Math.round(30 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600',
    is_active: true
  },
  {
    name: 'يوسفي كبير (نوع أول)',
    name_en: 'Tangerine Large (Type I)',
    scientific_name: 'Citrus reticulata Large',
    description: 'يوسفي كبير مطعوم وجاهز للطرح.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600',
    is_active: true
  },
  {
    name: 'يوسفي كبير (نوع ثانٍ)',
    name_en: 'Tangerine Large (Type II)',
    scientific_name: 'Citrus reticulata Large Premium',
    description: 'يوسفي كبير ناضج ومثمر بكثرة.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600',
    is_active: true
  },
  {
    name: 'كيمكوات',
    name_en: 'Kumquat',
    scientific_name: 'Citrus japonica',
    description: 'برتقال كيمكوات الياباني الصغير اللذيذ يؤكل بقشره.',
    price: Math.round(80 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600',
    is_active: true
  },
  {
    name: 'كيمكوات كبير',
    name_en: 'Kumquat Large',
    scientific_name: 'Citrus japonica Large',
    description: 'كيمكوات شجرة كبيرة الحجم ومكثفة الأوراق.',
    price: Math.round(180 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600',
    is_active: true
  },
  {
    name: 'كيمكوات كبير مثمر',
    name_en: 'Kumquat Large Fruiting',
    scientific_name: 'Citrus japonica Large Mature',
    description: 'كيمكوات شجرة كبيرة محملة بالثمار وجاهزة.',
    price: Math.round(450 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600',
    is_active: true
  },
  {
    name: 'جوافه فرنسوي',
    name_en: 'French Guava',
    scientific_name: 'Psidium guajava French',
    description: 'جوافة فرنسية فاخرة ذات نكهة مميزة وحلوة.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافه بلاك سمراء',
    name_en: 'Black Guava',
    scientific_name: 'Psidium guajava Black',
    description: 'جوافة سوداء (سمراء) نادرة ومميزة للحدائق الفاخرة.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافه قلب أحمر',
    name_en: 'Red Heart Guava',
    scientific_name: 'Psidium guajava Red',
    description: 'جوافة ذات قلب أحمر غنية بالفيتامينات وطعمها كالفراولة.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافة قلب أحمر كبير',
    name_en: 'Red Heart Guava Large',
    scientific_name: 'Psidium guajava Red Large',
    description: 'شجرة جوافة حمراء بحجم كبير مطعومة ومثمرة.',
    price: Math.round(180 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافه مطعومه',
    name_en: 'Grafted Guava',
    scientific_name: 'Psidium guajava Grafted',
    description: 'جوافة مطعومة ومضمونة الطرح سريعة الإنتاج.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافه بناتي',
    name_en: 'Seedless Guava (Bannati)',
    scientific_name: 'Psidium guajava Seedless',
    description: 'جوافة بناتي بدون بذور حلوة المذاق ومطلوبة جداً.',
    price: Math.round(30 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافه بناتي كبير',
    name_en: 'Seedless Guava Large',
    scientific_name: 'Psidium guajava Seedless Large',
    description: 'شجرة جوافة بناتي بحجم كبير وجاهزة للطرح.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافة بناتي شتوي كبير',
    name_en: 'Winter Seedless Guava Large',
    scientific_name: 'Psidium guajava Winter Large',
    description: 'جوافة بناتي شتوية تثمر في الشتاء بحجم كبير وممتاز.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافة بطعم المانجو كبير',
    name_en: 'Mango-flavored Guava Large',
    scientific_name: 'Psidium guajava Mango-taste',
    description: 'جوافة هجينة نادرة بطعم المانجو اللذيذ بحجم كبير.',
    price: Math.round(350 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'جوافة فرولا كبير',
    name_en: 'Strawberry Guava Large',
    scientific_name: 'Psidium cattleianum Large',
    description: 'جوافة الفراولة الحمراء الشهية شجرة كبيرة الحجم ومثمرة.',
    price: Math.round(450 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
    is_active: true
  },
  {
    name: 'باباظ ريد سكري',
    name_en: 'Red Sugar Papaya',
    scientific_name: 'Carica papaya Red',
    description: 'باباظ (بابايا) ريد سكري حلو جداً وسريع الإنتاج.',
    price: Math.round(120 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600',
    is_active: true
  },
  {
    name: 'دراجون فروت أحمر',
    name_en: 'Red Dragon Fruit',
    scientific_name: 'Hylocereus costaricensis',
    description: 'دراجون فروت (فاكهة التنين) أحمر ذو طعم رائع وغني بمضادات الأكسدة.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1527325679968-2492a11a7640?w=600',
    is_active: true
  },
  {
    name: 'دراجون كبير',
    name_en: 'Dragon Fruit Large',
    scientific_name: 'Hylocereus costaricensis Large',
    description: 'دراجون فروت شجرة كبيرة ممتدة وجاهزة للطرح.',
    price: Math.round(160 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1527325679968-2492a11a7640?w=600',
    is_active: true
  },
  {
    name: 'قشطه عبدالرازق',
    name_en: 'Abdul Razeq Custard Apple',
    scientific_name: 'Annona squamosa Abdul Razeq',
    description: 'قشطة عبد الرازق البلدي ذات المذاق السكري الرائع.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1582297120689-d2b1f8eb9bcf?w=600',
    is_active: true
  },
  {
    name: 'قشطة عبدالرازق كبير',
    name_en: 'Abdul Razeq Custard Apple Large',
    scientific_name: 'Annona squamosa Abdul Razeq Large',
    description: 'شجرة قشطة عبد الرازق بحجم كبير مطعومة.',
    price: Math.round(140 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1582297120689-d2b1f8eb9bcf?w=600',
    is_active: true
  },
  {
    name: 'قشطة جرافيولا',
    name_en: 'Graviola Custard Apple',
    scientific_name: 'Annona muricata',
    description: 'قشطة جرافيولا (شبه مستوردة) ذات فوائد علاجية ومذاق حامضي حلو.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1582297120689-d2b1f8eb9bcf?w=600',
    is_active: true
  },
  {
    name: 'نبق تفاحي مطعوم',
    name_en: 'Grafted Apple Jujube',
    scientific_name: 'Ziziphus mauritiana Grafted',
    description: 'نبق تفاحي مطعوم يعطي ثماراً كبيرة تشبه التفاح سكرية المذاق.',
    price: Math.round(140 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600',
    is_active: true
  },
  {
    name: 'نبق تفاحي كبير',
    name_en: 'Apple Jujube Large',
    scientific_name: 'Ziziphus mauritiana Large',
    description: 'شجرة نبق تفاحي بحجم كبير ومثمرة بغزارة.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600',
    is_active: true
  },
  {
    name: 'افوكادو مطعوم',
    name_en: 'Grafted Avocado',
    scientific_name: 'Persea americana Grafted',
    description: 'شجرة أفوكادو مطعومة سريعة الطرح ومقاومة للأمراض.',
    price: Math.round(140 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600',
    is_active: true
  },
  {
    name: 'تين برشومي قزمي',
    name_en: 'Dwarf Barshoumi Fig',
    scientific_name: 'Ficus carica Dwarf',
    description: 'تين برشومي قزمي يمكن زراعته في أصيص بالبلكونة ومثمر.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=600',
    is_active: true
  },
  {
    name: 'تين برشومي',
    name_en: 'Barshoumi Fig',
    scientific_name: 'Ficus carica',
    description: 'تين برشومي بلدي حلو المذاق وسريع التزهير.',
    price: Math.round(70 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=600',
    is_active: true
  },
  {
    name: 'برقوق',
    name_en: 'Plum Tree',
    scientific_name: 'Prunus domestica',
    description: 'شجرة برقوق مطعومة وممتازة للحدائق المنزلية.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'برقوق كبير',
    name_en: 'Plum Tree Large',
    scientific_name: 'Prunus domestica Large',
    description: 'شجرة برقوق كبيرة الحجم ومثمرة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'مشمش',
    name_en: 'Apricot Tree',
    scientific_name: 'Prunus armeniaca',
    description: 'شجرة مشمش مطعومة تعطي ثماراً سكرية ممتازة.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600',
    is_active: true
  },
  {
    name: 'مشمش كبير',
    name_en: 'Apricot Tree Large',
    scientific_name: 'Prunus armeniaca Large',
    description: 'شجرة مشمش بحجم كبير ومثمرة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600',
    is_active: true
  },
  {
    name: 'مشمش مستورد كبير',
    name_en: 'Imported Apricot Large',
    scientific_name: 'Prunus armeniaca Imported Large',
    description: 'شجرة مشمش مستوردة بحجم كبير ذات ثمار كبيرة الحجم.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600',
    is_active: true
  },
  {
    name: 'خوخ سكري',
    name_en: 'Sweet Peach',
    scientific_name: 'Prunus persica Sweet',
    description: 'خوخ سكري حلو المذاق وسريع النمو.',
    price: Math.round(50 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'خوخ سكري كبير',
    name_en: 'Sweet Peach Large',
    scientific_name: 'Prunus persica Sweet Large',
    description: 'شجرة خوخ سكري بحجم كبير ومطعومة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'خوخ فلوريدا كبير',
    name_en: 'Florida Peach Large',
    scientific_name: 'Prunus persica Florida Large',
    description: 'شجرة خوخ فلوريدا مستوردة بحجم كبير وإنتاجية عالية جداً.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'خوخ طعمية مطعوم كبير',
    name_en: 'Taameya Peach Large',
    scientific_name: 'Prunus persica Taameya Large',
    description: 'خوخ طعمية (مسطح) مطعوم كبير الحجم ومميز.',
    price: Math.round(280 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'نكتارين مطعوم',
    name_en: 'Grafted Nectarine',
    scientific_name: 'Prunus persica nectarine',
    description: 'نكتارين مطعوم شجرة متوسطة الحجم ذات ثمار خوخ ناعمة الملمس.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'نكتارين مطعوم كبير',
    name_en: 'Grafted Nectarine Large',
    scientific_name: 'Prunus persica nectarine Large',
    description: 'شجرة نكتارين مطعومة بحجم كبير وجاهزة للإثمار.',
    price: Math.round(600 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'باشون فروت سكري',
    name_en: 'Sweet Passion Fruit',
    scientific_name: 'Passiflora edulis Sweet',
    description: 'باشون فروت سكري (كوكتيل) حلو الطعم متسلق ممتاز للعرائش.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600',
    is_active: true
  },
  {
    name: 'باشون فروت أحمر',
    name_en: 'Red Passion Fruit',
    scientific_name: 'Passiflora edulis Red',
    description: 'باشون فروت أحمر ذو طعم غني فواح.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600',
    is_active: true
  },
  {
    name: 'باشون فروت بطيخة',
    name_en: 'Watermelon Passion Fruit',
    scientific_name: 'Passiflora quadrangularis',
    description: 'باشون فروت بطيخي (عملاق) نوع نادر وفاخر للحدائق.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600',
    is_active: true
  },
  {
    name: 'عنب كبير',
    name_en: 'Grape Vine Large',
    scientific_name: 'Vitis vinifera Large',
    description: 'شجرة عنب بحجم كبير وجاهزة للطرح في الحدائق.',
    price: Math.round(220 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600',
    is_active: true
  },
  {
    name: 'عنب بناتي قزمي مطعوم',
    name_en: 'Grafted Dwarf Bannati Grape',
    scientific_name: 'Vitis vinifera Bannati Dwarf',
    description: 'عنب بناتي قزمي مطعوم لسهولة التربية في الأواني الكبيرة.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600',
    is_active: true
  },
  {
    name: 'عنب بناتي طرود',
    name_en: 'Bannati Grape Vine Taroud',
    scientific_name: 'Vitis vinifera Bannati Taroud',
    description: 'عنب بناتي طرود شجرة كبيرة وفيرة المحصول.',
    price: Math.round(350 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600',
    is_active: true
  },
  {
    name: 'عنب H4 مطعوم',
    name_en: 'Grafted H4 Grape',
    scientific_name: 'Vitis vinifera H4',
    description: 'عنب صنف H4 الشهير بمقاومته وإنتاجه الفير.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600',
    is_active: true
  },
  {
    name: 'عنب منجاوي',
    name_en: 'Mangawi Grape Vine',
    scientific_name: 'Vitis vinifera Mangawi',
    description: 'عنب منجاوي فخم ذو ثمار كبيرة ونكهة تشبه المانجو.',
    price: Math.round(500 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600',
    is_active: true
  },
  {
    name: 'بامبوزيا',
    name_en: 'Jambolan (Bambuzia)',
    scientific_name: 'Syzygium cumini',
    description: 'شجرة البامبوزيا الاستوائية ذات الثمار السوداء اللذيذة والغنية بالفوائد.',
    price: Math.round(120 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600',
    is_active: true
  },
  {
    name: 'توت عماني',
    name_en: 'Omani Mulberry',
    scientific_name: 'Morus Omani',
    description: 'توت عماني ذو ثمار طويلة وحلوة جداً وإنتاجية وفيرة.',
    price: Math.round(80 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'توت راسبيري',
    name_en: 'Raspberry Mulberry',
    scientific_name: 'Morus Raspberry',
    description: 'توت راسبيري شجيرة مثمرة ومطلوبة لطعمها اللذيذ.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'توت بلاك بيري بدون شوك',
    name_en: 'Thornless Blackberry',
    scientific_name: 'Rubus fruticosus Thornless',
    description: 'توت العليق الأسود بدون أشواك لسهولة الحصاد.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'توت بلاك بيري بشوك',
    name_en: 'Thorny Blackberry',
    scientific_name: 'Rubus fruticosus Thorny',
    description: 'توت العليق الأسود البري ذو النكهة القوية والمثمر.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'توت بلاك بيري كبير',
    name_en: 'Blackberry Large',
    scientific_name: 'Rubus fruticosus Large',
    description: 'شجيرة توت العليق الأسود الكبيرة المثمرة.',
    price: Math.round(350 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'توت بلو بيري',
    name_en: 'Blueberry Shrub',
    scientific_name: 'Vaccinium corymbosum',
    description: 'بلو بيري (توت أزرق) شجيرة مستوردة تحتاج لتربة حامضية ومثمرة.',
    price: Math.round(650 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600',
    is_active: true
  },
  {
    name: 'لونجان',
    name_en: 'Longan Fruit Tree',
    scientific_name: 'Dimocarpus longan',
    description: 'شجرة لونجان (عين التنين) الاستوائية اللذيذة والشبيهة بالليتشي.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600',
    is_active: true
  },
  {
    name: 'جاك فروت',
    name_en: 'Jackfruit Tree',
    scientific_name: 'Artocarpus heterophyllus',
    description: 'شجرة الجاك فروت الاستوائية تنتج أكبر ثمار فاكهة في العالم.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1582297120689-d2b1f8eb9bcf?w=600',
    is_active: true
  },
  {
    name: 'تمر هندي',
    name_en: 'Tamarind Tree',
    scientific_name: 'Tamarindus indica',
    description: 'شجرة التمر هندي المميزة بظلها وأوراقها وثمارها الحامضية الحلوة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'عين جمل صغير',
    name_en: 'Walnut Tree Small',
    scientific_name: 'Juglans regia Small',
    description: 'شجرة عين الجمل (الجوز) الصغيرة مطعومة.',
    price: Math.round(140 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1584846875084-257a0774a3f3?w=600',
    is_active: true
  },
  {
    name: 'عين جمل كبير',
    name_en: 'Walnut Tree Large',
    scientific_name: 'Juglans regia Large',
    description: 'شجرة عين الجمل الكبيرة جاهزة للنمو والإثمار.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1584846875084-257a0774a3f3?w=600',
    is_active: true
  },
  {
    name: 'لوز حلو',
    name_en: 'Sweet Almond Tree',
    scientific_name: 'Prunus dulcis',
    description: 'شجرة اللوز الحلو مطعومة تعطي محصولاً لذيذاً وجميلة التزهير الربيعي.',
    price: Math.round(100 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6af9?w=600',
    is_active: true
  },
  {
    name: 'لوز حلو كبير',
    name_en: 'Sweet Almond Tree Large',
    scientific_name: 'Prunus dulcis Large',
    description: 'شجرة لوز حلو بحجم كبير مطعومة ومثمرة.',
    price: Math.round(170 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6af9?w=600',
    is_active: true
  },
  {
    name: 'كمثري سكري',
    name_en: 'Sweet Pear Tree',
    scientific_name: 'Pyrus communis Sweet',
    description: 'شجرة كمثرى سكرية لذيذة ومقاومة للحرارة.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'كمثري كبير',
    name_en: 'Pear Tree Large',
    scientific_name: 'Pyrus communis Large',
    description: 'شجرة كمثرى بحجم كبير مطعومة وجاهزة للإثمار.',
    price: Math.round(120 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'تفاح احمر أمريكاني',
    name_en: 'American Red Apple Tree',
    scientific_name: 'Malus domestica Red',
    description: 'شجرة تفاح أحمر أمريكي مطعومة ومهيأة للمناخ المحلي.',
    price: Math.round(80 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
    is_active: true
  },
  {
    name: 'تفاح احمر كبير',
    name_en: 'Red Apple Tree Large',
    scientific_name: 'Malus domestica Red Large',
    description: 'شجرة تفاح أحمر بحجم كبير مطعومة ومثمرة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
    is_active: true
  },
  {
    name: 'تفاح أمريكاني كبير',
    name_en: 'American Apple Tree Large',
    scientific_name: 'Malus domestica American Large',
    description: 'شجرة تفاح أمريكي كبيرة الحجم للحدائق الفاخرة.',
    price: Math.round(350 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
    is_active: true
  },
  {
    name: 'كاكا',
    name_en: 'Persimmon Tree (Kaka)',
    scientific_name: 'Diospyros kaki',
    description: 'شجرة الكاكا الشهيرة بثمارها البرتقالية السكرية اللذيذة.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1595156013166-4d6de9f49f5e?w=600',
    is_active: true
  },
  {
    name: 'اناناس كيني صغير',
    name_en: 'Kenyan Pineapple Small',
    scientific_name: 'Ananas comosus Kenyan Small',
    description: 'أناناس كيني صغير مميز للزراعة والزينة.',
    price: Math.round(120 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600',
    is_active: true
  },
  {
    name: 'اناناس كيني كبير',
    name_en: 'Kenyan Pineapple Large',
    scientific_name: 'Ananas comosus Kenyan Large',
    description: 'شجرة/نبتة أناناس كيني كبيرة مثمرة.',
    price: Math.round(250 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600',
    is_active: true
  },
  {
    name: 'عناب كبير',
    name_en: 'Jujube Tree Large (Annab)',
    scientific_name: 'Ziziphus jujuba Large',
    description: 'شجرة عناب كبيرة الحجم تعطي ثماراً حمراء لذيذة ومفيدة.',
    price: Math.round(300 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600',
    is_active: true
  },
  {
    name: 'بشمله',
    name_en: 'Loquat Tree (Eskadnya)',
    scientific_name: 'Eriobotrya japonica',
    description: 'شجرة البشملة (الأكيدنيا) ذات الأوراق العريضة والثمار الصفراء الحلوة.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
    is_active: true
  },
  {
    name: 'بشملة مطعوم',
    name_en: 'Grafted Loquat Tree',
    scientific_name: 'Eriobotrya japonica Grafted',
    description: 'شجرة بشملة مطعومة وجاهزة للإثمار السريع.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
    is_active: true
  },
  {
    name: 'رمان',
    name_en: 'Pomegranate Tree',
    scientific_name: 'Punica granatum',
    description: 'شجرة رمان بلدي مطعومة سريعة النمو ومقاومة للظروف الجوية.',
    price: Math.round(60 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1589733901241-5a55cd29f9e3?w=600',
    is_active: true
  },
  {
    name: 'رمان كبير',
    name_en: 'Pomegranate Tree Large',
    scientific_name: 'Punica granatum Large',
    description: 'شجرة رمان بحجم كبير مطعومة ومثمرة بغزارة.',
    price: Math.round(150 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1589733901241-5a55cd29f9e3?w=600',
    is_active: true
  },
  {
    name: 'تين شوكي',
    name_en: 'Prickly Pear Cactus',
    scientific_name: 'Opuntia ficus-indica',
    description: 'تين شوكي مثمر وسهل الرعاية وممتاز للمساحات الخارجية المشمشية.',
    price: Math.round(25 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    is_active: true
  },
  {
    name: 'تفاح وردي',
    name_en: 'Rose Apple Tree',
    scientific_name: 'Syzygium jambos',
    description: 'شجرة التفاح الوردي الاستوائية ذات الثمار المقرمشة المعطرة بالورد.',
    price: Math.round(200 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600',
    is_active: true
  },
  {
    name: 'تفاح بيرو (طول متر)',
    name_en: 'Peru Apple Tree (1m height)',
    scientific_name: 'Cereus peruvianus',
    description: 'تفاح بيرو الصباري النادر بارتفاع متر واحد، مثالي لعشاق النوادر.',
    price: Math.round(1500 * 1.3),
    categoryName: 'نباتات خارجية',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    is_active: true
  },

  // ─── Seeds ─────────────────────────────────────────────────────────────────
  {
    name: 'بذور فلفل حار',
    name_en: 'Hot Pepper Seeds (10g)',
    scientific_name: 'Capsicum annuum Seeds',
    description: 'عبوة بذور فلفل حار تزن ١٠ جرام لزراعة الفلفل الحار والإنتاج المنزلي.',
    price: Math.round(45 * 1.3),
    categoryName: 'بذور للزراعة',
    image: 'https://images.unsplash.com/photo-1588252393717-38e217bb6969?w=600',
    is_active: true
  },
  {
    name: 'بذور فلفل رومي',
    name_en: 'Bell Pepper Seeds (10g)',
    scientific_name: 'Capsicum annuum Bell Seeds',
    description: 'عبوة بذور فلفل رومي تزن ١٠ جرام لزراعة الفلفل الحلو والألوان.',
    price: Math.round(45 * 1.3),
    categoryName: 'بذور للزراعة',
    image: 'https://images.unsplash.com/photo-1563565088-913497f68c4f?w=600',
    is_active: true
  },
  {
    name: 'بذور كزبره',
    name_en: 'Coriander Seeds (10g)',
    scientific_name: 'Coriandrum sativum Seeds',
    description: 'عبوة بذور كزبرة تزن ١٠ جرام لزراعة الكزبرة الخضراء في الحديقة والمطبخ.',
    price: Math.round(35 * 1.3),
    categoryName: 'بذور للزراعة',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600',
    is_active: true
  },
  {
    name: 'بذور جرجير',
    name_en: 'Arugula Seeds (10g)',
    scientific_name: 'Eruca vesicaria Seeds',
    description: 'عبوة بذور جرجير تزن ١٠ جرام لإنتاج الجرجير البلدي الطازج في المنزل.',
    price: Math.round(35 * 1.3),
    categoryName: 'بذور للزراعة',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600',
    is_active: true
  },
  {
    name: 'بذور بقدونس',
    name_en: 'Parsley Seeds (10g)',
    scientific_name: 'Petroselinum crispum Seeds',
    description: 'عبوة بذور بقدونس تزن ١٠ جرام للزراعة المنزلية السهلة السريعة.',
    price: Math.round(35 * 1.3),
    categoryName: 'بذور للزراعة',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600',
    is_active: true
  },
  {
    name: 'بذور شبت',
    name_en: 'Dill Seeds (10g)',
    scientific_name: 'Anethum graveolens Seeds',
    description: 'عبوة بذور شبت تزن ١٠ جرام، نبتة عطرية رائعة للطهي وسهلة النمو.',
    price: Math.round(35 * 1.3),
    categoryName: 'بذور للزراعة',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600',
    is_active: true
  }
];

async function seed() {
  console.log("Starting database seeding...");

  try {
    // 1. Ensure categories are present
    const categoryMap = {};
    for (const cat of categoriesToSeed) {
      // Find or insert category
      const { data: existing, error: findErr } = await supabase
        .from('categories')
        .select('id')
        .eq('name', cat.name)
        .maybeSingle();

      if (findErr) throw findErr;

      if (existing) {
        console.log(`Category "${cat.name}" already exists with ID: ${existing.id}`);
        categoryMap[cat.name] = existing.id;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('categories')
          .insert({ name: cat.name, image: cat.image })
          .select('id')
          .single();

        if (insertErr) throw insertErr;
        console.log(`Inserted category "${cat.name}" with ID: ${inserted.id}`);
        categoryMap[cat.name] = inserted.id;
      }
    }

    // 2. Insert products
    console.log(`Seeding ${productsToSeed.length} products...`);
    let count = 0;
    for (const p of productsToSeed) {
      const catId = categoryMap[p.categoryName];
      if (!catId) {
        console.error(`Category ID not found for: ${p.categoryName}`);
        continue;
      }

      // Check if product already exists by name
      const { data: existingProd, error: findProdErr } = await supabase
        .from('products')
        .select('id')
        .eq('name', p.name)
        .maybeSingle();

      if (findProdErr) throw findProdErr;

      let productId;
      const slug = p.name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 10000);
      
      const productPayload = {
        name: p.name,
        slug: slug,
        sku: 'PLT-' + Math.floor(Math.random() * 900000 + 100000),
        scientific_name: p.scientific_name,
        description: p.description,
        price: p.price,
        compare_at_price: p.price > 0 ? Math.round(p.price * 1.25) : null,
        type: p.categoryName === 'بذور للزراعة' ? 'accessory' : 'plant',
        rating_avg: 4.5 + Math.random() * 0.5,
        is_active: p.is_active,
        category_id: catId
      };

      if (existingProd) {
        productId = existingProd.id;
        // Update product price & activity status
        const { error: updateErr } = await supabase
          .from('products')
          .update({
            price: productPayload.price,
            compare_at_price: productPayload.compare_at_price,
            is_active: productPayload.is_active,
            category_id: productPayload.category_id
          })
          .eq('id', productId);
        if (updateErr) throw updateErr;
        console.log(`Updated existing product "${p.name}" (ID: ${productId})`);
      } else {
        const { data: insertedProd, error: insertProdErr } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single();

        if (insertProdErr) throw insertProdErr;
        productId = insertedProd.id;
        console.log(`Inserted product "${p.name}" (ID: ${productId})`);
      }

      // Ensure product image is set
      const { data: existingImg, error: imgFindErr } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .maybeSingle();
      
      if (imgFindErr) throw imgFindErr;

      if (!existingImg && p.image) {
        const { error: imgInsertErr } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            url: p.image,
            is_primary: true,
            sort_order: 0
          });
        if (imgInsertErr) throw imgInsertErr;
      }

      // Ensure inventory record is set
      const { data: existingInv, error: invFindErr } = await supabase
        .from('inventory')
        .select('id')
        .eq('product_id', productId)
        .maybeSingle();

      if (invFindErr) throw invFindErr;

      if (!existingInv) {
        const { error: invInsertErr } = await supabase
          .from('inventory')
          .insert({
            product_id: productId,
            quantity: p.is_active ? 50 : 0,
            reserved: 0
          });
        if (invInsertErr) throw invInsertErr;
      }

      count++;
    }

    console.log(`Successfully processed ${count} products!`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
