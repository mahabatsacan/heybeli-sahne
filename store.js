const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Default initial datasets
const DEFAULT_SLIDERS = [
  {
    id: 'slide-1',
    title: 'İstanbul Meyhane Zarafeti & Canlı Sahne',
    subtitle: 'KARTAL SAHİL\'DE HER AKŞAM YENİ BİR HİKAYE',
    desc: 'İstanbul meyhane kültürünün zarafetini, usta sanatçıların canlı performansları ve Ege lezzetleriyle taçlandıran özel bir buluşma adresi.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
    btnText: 'Masa Rezervasyonu',
    btnLink: '#rezervasyon',
    order: 1,
    isActive: true
  },
  {
    id: 'slide-2',
    title: 'Gala Konserleri & Usta Sanatçılar',
    subtitle: 'HER CUMA & CUMARTESİ YILDIZLAR GEÇİDİ',
    desc: 'Sakiler, Rubato, Serkan Kaya ve dev orkestralarla unutulmaz sahil akşamları sizleri bekliyor.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=85',
    btnText: 'Etkinlik Takvimi',
    btnLink: '/program',
    order: 2,
    isActive: true
  },
  {
    id: 'slide-3',
    title: 'Ege’nin Taptaze Mezeleri & Seçkin Sofra',
    subtitle: 'GÜNLÜK HAZIRLANAN MEZELER & TAŞ FIRIN LEZZETLERİ',
    desc: 'Girit ezmesi, tereyağlı sıcak karides güveç, kömür ateşinde ızgaralar ve seçkin meyhane muhabbeti.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=85',
    btnText: 'Menüyü Keşfet',
    btnLink: '/menu',
    order: 3,
    isActive: true
  }
];

const DEFAULT_CATEGORIES = [
  {
    id: 'ana-yemek',
    name: 'ANA YEMEK',
    tag: 'USTALIKLA PİŞİRİLEN',
    desc: 'Kömür ateşinde ızgara levrek, çipura, dana antrikot & kasap köfte',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
    order: 1
  },
  {
    id: 'ara-sicaklar',
    name: 'ARA SICAKLAR',
    tag: 'SICAK LEZZETLER',
    desc: 'Güveçte tereyağlı karides, yaprak ciğer & çıtır paçanga böreği',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
    order: 2
  },
  {
    id: 'mezeler',
    name: 'MEZELER',
    tag: 'EGE & AKDENİZ',
    desc: 'Girit ezmesi, atom, köz patlıcanlı köpoğlu, levrek marin & haydari',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=700&q=80',
    order: 3
  },
  {
    id: 'salatalar',
    name: 'SALATALAR',
    tag: 'BAHÇEDEN SOFRAYA',
    desc: 'Cevizli Gavurdağı salatası, nar ekşili Ege yeşillikleri, tulum peynirli roka',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
    order: 4
  },
  {
    id: 'meyve-tatli',
    name: 'MEYVE VE ATIŞTIRMALIK',
    tag: 'TATLI KAPANIŞ',
    desc: 'Buzlu mevsim meyveleri seçkisi, tahinli sıcak sufle & çerez tabağı',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=700&q=80',
    order: 5
  },
  {
    id: 'ickiler',
    name: 'İÇKİLER',
    tag: 'SOFRA KÜLTÜRÜ',
    desc: 'Geleneksel yaş üzüm rakıları, altın seriler, seçkin şaraplar & kokteyller',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=700&q=80',
    order: 6
  }
];

const DEFAULT_MENU_ITEMS = [
  {
    id: 'item-1',
    categoryId: 'mezeler',
    name: 'Girit Ezmesi',
    desc: 'Ezine peyniri, ceviz, taze fesleğen ve fıstık dokunuşu ile zeytinyağlı meze',
    price: 'Günlük Taze',
    badge: 'Şefin İmzası',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isAvailable: true
  },
  {
    id: 'item-2',
    categoryId: 'mezeler',
    name: 'Köz Patlıcanlı Atom',
    desc: 'Süzme yoğurt, acı tereyağlı çıtır biberler ile közlenmiş patlıcan',
    price: 'Günlük Taze',
    badge: 'Popüler',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    order: 2,
    isAvailable: true
  },
  {
    id: 'item-3',
    categoryId: 'mezeler',
    name: 'Ege Deniz Börülcesi',
    desc: 'Zeytinyağı, sarımsak ve limon emülsiyonu eşliğinde taze börülce',
    price: 'Günlük Taze',
    badge: 'Ege Klasiği',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    order: 3,
    isAvailable: true
  },
  {
    id: 'item-4',
    categoryId: 'mezeler',
    name: 'Levrek Marin',
    desc: 'Hardal tohumu, kişniş, taze narenciye ve sızma zeytinyağında marine edilmiş deniz levreği',
    price: 'Gurme Seçki',
    badge: 'Özel Meze',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    order: 4,
    isAvailable: true
  },
  {
    id: 'item-5',
    categoryId: 'ara-sicaklar',
    name: 'Tereyağında Karides Güveç',
    desc: 'Sarımsak, pul biber ve domates soslu tereyağlı taze deniz karidesi',
    price: 'Sıcak Başlangıç',
    badge: 'Günün Favorisi',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isAvailable: true
  },
  {
    id: 'item-6',
    categoryId: 'ara-sicaklar',
    name: 'Yaprak Ciğer (Edirne Usulü)',
    desc: 'İnce kıyım dana ciğer, sumaklı soğan söğüş ve çıtır biber ile',
    price: 'Sıcak Başlangıç',
    badge: 'Geleneksel',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    order: 2,
    isAvailable: true
  },
  {
    id: 'item-7',
    categoryId: 'ara-sicaklar',
    name: 'Çıtır Paçanga Böreği',
    desc: 'Kayseri pastırması, kaşar peyniri ve domates ile çıtır çıtır yufka',
    price: 'Sıcak Başlangıç',
    badge: '',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    order: 3,
    isAvailable: true
  },
  {
    id: 'item-8',
    categoryId: 'ana-yemek',
    name: 'Izgara Deniz Levreği',
    desc: 'Kömür ateşinde nar gibi kızarmış taze levrek, roka, kırmızı soğan ve limon eşliğinde',
    price: 'Ana Yemek',
    badge: 'Taze Balık',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isAvailable: true
  },
  {
    id: 'item-9',
    categoryId: 'ana-yemek',
    name: 'Özel Kasap Köfte & Antrikot',
    desc: 'Kömürde pişirilmiş dana antrikot ve usta köftesi, köz biber ve domates ile',
    price: 'Ana Yemek',
    badge: 'Izgara Seçimi',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    order: 2,
    isAvailable: true
  },
  {
    id: 'item-10',
    categoryId: 'salatalar',
    name: 'Cevizli Gavurdağı Salatası',
    desc: 'Küp doğranmış domates, salatalık, taze nane, ceviz içi ve Antakya nar ekşisi sosu',
    price: 'Salata',
    badge: 'Meyhane Klasiği',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isAvailable: true
  },
  {
    id: 'item-11',
    categoryId: 'meyve-tatli',
    name: 'Buzlu Mevsim Meyveleri & Sıcak Sufle',
    desc: 'Kavun, karpuz, ananas, çilek ve yanında Belçika çikolatalı sıcak sufle',
    price: 'Tatlı Kapanış',
    badge: 'İkramlık',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isAvailable: true
  },
  {
    id: 'item-12',
    categoryId: 'ickiler',
    name: 'Yaş Üzüm Rakısı & Altın Seri',
    desc: 'Geleneksel damıtım yaş üzüm rakıları, buz ve şalgam ikramı ile',
    price: 'Sofranın Eşliği',
    badge: 'Seçkin Koleksiyon',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    order: 1,
    isAvailable: true
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'sakiler-canli',
    title: 'Sakiler Canlı Sahne & Büyük Gala',
    artist: 'Sakiler',
    date: '25 Eylül Cuma',
    time: '21:30',
    category: 'canli-muzik',
    badge: 'Bu Cuma',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    description: 'Modern arabesk ve pop müziğin sevilen grubu Sakiler, Heybeli Sahne\'de en hit şarkıları ve eşsiz sahne enerjisiyle sizlerle buluşuyor.',
    highlights: 'Özel Fiks Menü Dahil\nKapı Açılış: 20:00\nSahne Çıkış: 22:00',
    ticketInfo: 'Fiks Menü + Konser Girişi Dahil',
    isSoldOut: false,
    order: 1
  },
  {
    id: 'rubato-sahne',
    title: 'Rubato ile Akustik Gece',
    artist: 'Rubato',
    date: '26 Eylül Cumartesi',
    time: '22:00',
    category: 'canli-muzik',
    badge: 'Hafta Sonu Özel',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80',
    description: 'Enstrümanların virtüözleri Rubato; hüzünlü ve coşkulu melodileriyle Heybeli Sahne dinleyicilerine unutulmaz bir müzik ziyafeti yaşatacak.',
    highlights: 'Sahne Önü VIP Masalar\nZengin Meze Seçkisi\nÖzel Kokteyl İkramı',
    ticketInfo: 'Sınırlı Sayıda Rezervasyon',
    isSoldOut: false,
    order: 2
  },
  {
    id: 'serkan-kaya-gecesi',
    title: 'Serkan Kaya & Arabesk Gecesi',
    artist: 'Serkan Kaya',
    date: '02 Ekim Cuma',
    time: '21:30',
    category: 'unlu-sanatcilar',
    badge: 'Büyük Gala',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    description: 'Arabesk müziğin güçlü sesi Serkan Kaya, dev orkestrası ve dillerden düşmeyen şarkılarıyla Heybeli Sahne\'de sahne alıyor.',
    highlights: 'Gala Fiks Menüsü\nVIP Loca Hizmeti\nVale & Karşılama İkramı',
    ticketInfo: 'Ön Satışta Yoğun Talep',
    isSoldOut: false,
    order: 3
  },
  {
    id: 'kadinlar-matinesi',
    title: 'Çarşamba Kadınlar Matinesi & 90\'lar Türkçe Pop',
    artist: 'DJ Ece & Oryantal Şov',
    date: 'Her Çarşamba',
    time: '19:30',
    category: 'matine',
    badge: 'Her Çarşamba',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    description: 'Kadınlar matinesinde 90\'lar Türkçe Pop nostaljisi, modern fasıl ekibi ve dans gösterileri eşliğinde sınırsız eğlence.',
    highlights: 'Kadınlara Özel İndirimli Fiks Menü\nSürpriz Dans Şovları\nSınırsız Eğlence',
    ticketInfo: 'Grup Rezervasyonlarında Özel İndirim',
    isSoldOut: false,
    order: 4
  },
  {
    id: 'dilan-citak',
    title: 'Dilan Çıtak ile Pop & Alaturka',
    artist: 'Dilan Çıtak',
    date: '09 Ekim Cuma',
    time: '21:30',
    category: 'canli-muzik',
    badge: 'Yeni Program',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    description: 'Güçlü yorumu ve dinamik sahne şovuyla Dilan Çıtak, hem nostaljik hem enerjik şarkılarla Heybeli Sahne\'yi coşturuyor.',
    highlights: 'Özel Şef Menüsü\nFasıl & Keman Resitali\nGece Boyu İkramlar',
    ticketInfo: 'Rezervasyon Açıldı',
    isSoldOut: false,
    order: 5
  },
  {
    id: 'fasli-alaturka',
    title: 'Geleneksel Modern Fasıl & Meyhane Akşamı',
    artist: 'Heybeli Fasıl Heyeti',
    date: 'Her Perşembe',
    time: '20:00',
    category: 'meyhane',
    badge: 'Her Perşembe',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    description: 'Eski İstanbul meyhane kültürünü modern bir çizgide yaşatan Heybeli Fasıl Heyeti ile masanızda ud, kanun ve klarnet nağmeleri.',
    highlights: 'Klasik Ege Mezeleri\nTaş Fırın Sıcakları\nSamimi Meyhane Muhabbeti',
    ticketInfo: 'Hafta İçi Fiks Menü Fırsatı',
    isSoldOut: false,
    order: 6
  }
];

const DEFAULT_SETTINGS = {
  venueName: 'Heybeli Sahne',
  tagline: 'Anadolu Meyhanesi & Canlı Performans Sahnesi',
  phone: '0530 527 91 77',
  whatsapp: '0530 866 43 21',
  whatsappDirect: '905308664321',
  address: 'Kordonboyu, Turgut Özal Blv. NO:53/A, 34860 Kartal / İstanbul',
  mapUrl: 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14cac71cab646a87:0x9968fa4cab653899?sa=X&ved=1t:8290&ictx=111',
  email: 'rezervasyon@heybelisahne.com',
  workingHours: 'Pazartesi - Pazar: 20:00 - 02:00',
  musicHours: 'Kapı Açılış: 20:00 | Sahne Çıkış: 22:00',
  announcementText: 'Kartal Sahil\'de Ege Lezzetleri ve Canlı Performanslar | Rezervasyon: 0530 527 91 77',
  instagram: 'https://www.instagram.com/heybeli.sahne/',
  heroEyebrow: 'KARTAL SAHİL\'DE HER AKŞAM YENİ BİR HİKAYE',
  heroTitle: 'İstanbul Meyhane Zarafeti & Canlı Sahne',
  heroDesc: 'İstanbul meyhane kültürünün zarafetini, usta sanatçıların canlı performansları ve Ege lezzetleriyle taçlandıran özel bir buluşma adresi.'
};

// Ensure data directory and store file exist
function initStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let data = {};
  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      data = JSON.parse(raw);
    } catch (e) {
      data = {};
    }
  }

  let modified = false;

  if (!Array.isArray(data.reservations)) {
    data.reservations = [];
    modified = true;
  }
  if (!Array.isArray(data.clicks)) {
    data.clicks = [];
    modified = true;
  }
  if (!Array.isArray(data.sliders) || data.sliders.length === 0) {
    data.sliders = DEFAULT_SLIDERS;
    modified = true;
  }
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    data.categories = DEFAULT_CATEGORIES;
    modified = true;
  }
  if (!Array.isArray(data.menuItems) || data.menuItems.length === 0) {
    data.menuItems = DEFAULT_MENU_ITEMS;
    modified = true;
  }
  if (!Array.isArray(data.events) || data.events.length === 0) {
    data.events = DEFAULT_EVENTS;
    modified = true;
  }
  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = DEFAULT_SETTINGS;
    modified = true;
  } else {
    // Ensure all keys present
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
  }
  if (!Array.isArray(data.media)) {
    data.media = [];
    modified = true;
  }

  if (modified || !fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// In-memory cache for ultra-fast response times
let cachedData = null;

// Read data (cached in-memory, zero disk-latency on repeated reads)
function readData() {
  if (cachedData) return cachedData;
  try {
    initStore();
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    cachedData = JSON.parse(raw);
    return cachedData;
  } catch (err) {
    console.error('Store read error:', err);
    return {
      reservations: [],
      clicks: [],
      sliders: DEFAULT_SLIDERS,
      categories: DEFAULT_CATEGORIES,
      menuItems: DEFAULT_MENU_ITEMS,
      events: DEFAULT_EVENTS,
      settings: DEFAULT_SETTINGS,
      media: []
    };
  }
}

// Write data (updates cache immediately and persists to disk)
function writeData(data) {
  cachedData = data;
  try {
    initStore();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Store write error:', err);
    return false;
  }
}

// ==========================================
// 1. RESERVATIONS
// ==========================================
function addReservation(item) {
  const data = readData();
  const newReservation = {
    id: 'RES-' + Math.floor(1000 + Math.random() * 9000),
    name: item.name,
    phone: item.phone,
    date: item.date,
    guests: item.guests || '2 Kişi',
    tableType: item.tableType || 'Standart Meyhane Masası',
    note: item.note || '',
    status: 'yeni', // 'yeni' | 'onaylandi' | 'iptal'
    createdAt: new Date().toISOString(),
    ip: item.ip || 'Bilinmiyor'
  };

  data.reservations.unshift(newReservation);
  writeData(data);
  return newReservation;
}

function getReservations(filter = {}) {
  const data = readData();
  let list = data.reservations;

  if (filter.status && filter.status !== 'all') {
    list = list.filter(r => r.status === filter.status);
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(r => 
      (r.name && r.name.toLowerCase().includes(q)) || 
      (r.phone && r.phone.includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q))
    );
  }

  return list;
}

function updateReservationStatus(id, newStatus) {
  const data = readData();
  const target = data.reservations.find(r => r.id === id);
  if (!target) return null;

  target.status = newStatus;
  target.updatedAt = new Date().toISOString();
  writeData(data);
  return target;
}

function deleteReservation(id) {
  const data = readData();
  const idx = data.reservations.findIndex(r => r.id === id);
  if (idx === -1) return false;

  data.reservations.splice(idx, 1);
  writeData(data);
  return true;
}

// ==========================================
// 2. CLICKS & STATS
// ==========================================
function addClick(clickItem) {
  const data = readData();
  const newClick = {
    id: 'CLK-' + Math.floor(1000 + Math.random() * 9000),
    type: clickItem.type || 'whatsapp',
    source: clickItem.source || 'bilinmiyor',
    page: clickItem.page || '/',
    device: clickItem.device || 'Bilinmiyor',
    timestamp: new Date().toISOString(),
    ip: clickItem.ip || 'Bilinmiyor'
  };

  data.clicks.unshift(newClick);
  if (data.clicks.length > 1000) {
    data.clicks = data.clicks.slice(0, 1000);
  }
  writeData(data);
  return newClick;
}

function getClicks(limit = 100) {
  const data = readData();
  return data.clicks.slice(0, limit);
}

function getStats() {
  const data = readData();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const totalReservations = data.reservations.length;
  const newReservations = data.reservations.filter(r => r.status === 'yeni').length;
  const confirmedReservations = data.reservations.filter(r => r.status === 'onaylandi').length;
  const canceledReservations = data.reservations.filter(r => r.status === 'iptal').length;

  const totalCalls = data.clicks.filter(c => c.type === 'call').length;
  const totalWhatsapp = data.clicks.filter(c => c.type === 'whatsapp').length;

  const todayReservations = data.reservations.filter(r => r.createdAt && r.createdAt.startsWith(todayStr)).length;
  const todayCalls = data.clicks.filter(c => c.type === 'call' && c.timestamp && c.timestamp.startsWith(todayStr)).length;
  const todayWhatsapp = data.clicks.filter(c => c.type === 'whatsapp' && c.timestamp && c.timestamp.startsWith(todayStr)).length;

  return {
    totalReservations,
    reservationsByStatus: { yeni: newReservations, onaylandi: confirmedReservations, iptal: canceledReservations },
    totalCalls,
    totalWhatsApp: totalWhatsapp,
    todayReservations,
    todayClicks: todayCalls + todayWhatsapp,
    todayTotal: todayReservations + todayCalls + todayWhatsapp,
    totalClicks: totalCalls + totalWhatsapp,
    totalSliders: (data.sliders || []).length,
    totalEvents: (data.events || []).length,
    totalCategories: (data.categories || []).length,
    totalMenuItems: (data.menuItems || []).length
  };
}

// ==========================================
// 3. SLIDERS CRUD
// ==========================================
function getSliders() {
  const data = readData();
  return (data.sliders || []).sort((a, b) => (a.order || 0) - (b.order || 0));
}

function addSlider(item) {
  const data = readData();
  const newSlider = {
    id: 'slide-' + Date.now(),
    title: item.title || 'Yeni Sahne Manşeti',
    subtitle: item.subtitle || '',
    desc: item.desc || '',
    image: item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
    btnText: item.btnText || 'Rezervasyon Yap',
    btnLink: item.btnLink || '#rezervasyon',
    order: parseInt(item.order, 10) || ((data.sliders || []).length + 1),
    isActive: item.isActive !== false
  };

  data.sliders.push(newSlider);
  writeData(data);
  return newSlider;
}

function updateSlider(id, updateData) {
  const data = readData();
  const idx = data.sliders.findIndex(s => s.id === id);
  if (idx === -1) return null;

  data.sliders[idx] = { ...data.sliders[idx], ...updateData, id };
  writeData(data);
  return data.sliders[idx];
}

function deleteSlider(id) {
  const data = readData();
  const idx = data.sliders.findIndex(s => s.id === id);
  if (idx === -1) return false;

  data.sliders.splice(idx, 1);
  writeData(data);
  return true;
}

// ==========================================
// 4. CATEGORIES CRUD
// ==========================================
function getCategories() {
  const data = readData();
  return (data.categories || []).sort((a, b) => (a.order || 0) - (b.order || 0));
}

function addCategory(item) {
  const data = readData();
  const slug = (item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/-+/g, '-');
  const newCat = {
    id: slug || 'cat-' + Date.now(),
    name: item.name || 'Yeni Kategori',
    tag: item.tag || '',
    desc: item.desc || '',
    image: item.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=700&q=80',
    order: parseInt(item.order, 10) || ((data.categories || []).length + 1)
  };

  data.categories.push(newCat);
  writeData(data);
  return newCat;
}

function updateCategory(id, updateData) {
  const data = readData();
  const idx = data.categories.findIndex(c => c.id === id);
  if (idx === -1) return null;

  data.categories[idx] = { ...data.categories[idx], ...updateData, id };
  writeData(data);
  return data.categories[idx];
}

function deleteCategory(id) {
  const data = readData();
  const idx = data.categories.findIndex(c => c.id === id);
  if (idx === -1) return false;

  data.categories.splice(idx, 1);
  // Also delete menu items in this category or leave them
  data.menuItems = data.menuItems.filter(m => m.categoryId !== id);
  writeData(data);
  return true;
}

// ==========================================
// 5. MENU ITEMS CRUD
// ==========================================
function getMenuItems(categoryId = null) {
  const data = readData();
  let list = data.menuItems || [];
  if (categoryId) {
    list = list.filter(m => m.categoryId === categoryId);
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function addMenuItem(item) {
  const data = readData();
  const newItem = {
    id: 'item-' + Date.now(),
    categoryId: item.categoryId || (data.categories[0] ? data.categories[0].id : 'mezeler'),
    name: item.name || 'Yeni Lezzet',
    desc: item.desc || '',
    price: item.price || 'Günlük Taze',
    badge: item.badge || '',
    image: item.image || '',
    order: parseInt(item.order, 10) || ((data.menuItems || []).length + 1),
    isAvailable: item.isAvailable !== false
  };

  data.menuItems.push(newItem);
  writeData(data);
  return newItem;
}

function updateMenuItem(id, updateData) {
  const data = readData();
  const idx = data.menuItems.findIndex(m => m.id === id);
  if (idx === -1) return null;

  data.menuItems[idx] = { ...data.menuItems[idx], ...updateData, id };
  writeData(data);
  return data.menuItems[idx];
}

function deleteMenuItem(id) {
  const data = readData();
  const idx = data.menuItems.findIndex(m => m.id === id);
  if (idx === -1) return false;

  data.menuItems.splice(idx, 1);
  writeData(data);
  return true;
}

// ==========================================
// 6. EVENTS / SAHNE PROGRAMI CRUD
// ==========================================
function getEvents(category = null) {
  const data = readData();
  let list = data.events || [];
  if (category && category !== 'all') {
    list = list.filter(e => e.category === category);
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getEventById(id) {
  const data = readData();
  return (data.events || []).find(e => e.id === id) || null;
}

function addEvent(item) {
  const data = readData();
  const newEvent = {
    id: item.id || ('event-' + Date.now()),
    title: item.title || 'Yeni Canlı Sahne Programı',
    artist: item.artist || '',
    date: item.date || 'Gala Gecesi',
    time: item.time || '21:30',
    category: item.category || 'canli-muzik',
    badge: item.badge || 'Gala',
    image: item.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    description: item.description || '',
    highlights: item.highlights || 'Özel Fiks Menü Dahil\nCanlı Fasıl Açılışı\nDJ Performans',
    ticketInfo: item.ticketInfo || 'Rezervasyon Açıldı',
    isSoldOut: item.isSoldOut === true || item.isSoldOut === 'true',
    order: parseInt(item.order, 10) || ((data.events || []).length + 1)
  };

  data.events.push(newEvent);
  writeData(data);
  return newEvent;
}

function updateEvent(id, updateData) {
  const data = readData();
  const idx = data.events.findIndex(e => e.id === id);
  if (idx === -1) return null;

  data.events[idx] = { ...data.events[idx], ...updateData, id };
  writeData(data);
  return data.events[idx];
}

function deleteEvent(id) {
  const data = readData();
  const idx = data.events.findIndex(e => e.id === id);
  if (idx === -1) return false;

  data.events.splice(idx, 1);
  writeData(data);
  return true;
}

// ==========================================
// 7. SITE SETTINGS
// ==========================================
function getSettings() {
  const data = readData();
  return data.settings || DEFAULT_SETTINGS;
}

function updateSettings(newSettings) {
  const data = readData();
  data.settings = { ...DEFAULT_SETTINGS, ...data.settings, ...newSettings };
  writeData(data);
  return data.settings;
}

// ==========================================
// 8. MEDIA / UPLOADS TRACKER
// ==========================================
function getMedia() {
  const data = readData();
  return data.media || [];
}

function addMedia(fileInfo) {
  const data = readData();
  const item = {
    id: 'media-' + Date.now(),
    filename: fileInfo.filename,
    url: fileInfo.url,
    size: fileInfo.size,
    mimetype: fileInfo.mimetype,
    createdAt: new Date().toISOString()
  };
  data.media.unshift(item);
  writeData(data);
  return item;
}

function deleteMedia(id) {
  const data = readData();
  const idx = data.media.findIndex(m => m.id === id);
  if (idx === -1) return false;

  const item = data.media[idx];
  // Attempt to remove physical file if exists
  if (item && item.url && item.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', item.url);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  data.media.splice(idx, 1);
  writeData(data);
  return true;
}

// ==========================================
// 9. CSV EXPORT
// ==========================================
function exportReservationsCSV() {
  const data = readData();
  const header = ['ID', 'Müşteri Adı', 'Telefon', 'Rezervasyon Tarihi', 'Kişi Sayısı', 'Masa Tipi', 'Durum', 'Kayıt Zamanı', 'Özel Not'];
  
  const rows = data.reservations.map(r => [
    `"${r.id}"`,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${r.phone || ''}"`,
    `"${r.date || ''}"`,
    `"${r.guests || ''}"`,
    `"${(r.tableType || '').replace(/"/g, '""')}"`,
    `"${r.status || ''}"`,
    `"${r.createdAt || ''}"`,
    `"${(r.note || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);

  return '\uFEFF' + [header.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

// Initialize on module load
initStore();

module.exports = {
  // Reservations
  addReservation,
  getReservations,
  updateReservationStatus,
  deleteReservation,
  // Clicks & Stats
  addClick,
  getClicks,
  getStats,
  // Sliders
  getSliders,
  addSlider,
  updateSlider,
  deleteSlider,
  // Categories
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  // Menu items
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  // Events
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  // Settings
  getSettings,
  updateSettings,
  // Media
  getMedia,
  addMedia,
  deleteMedia,
  // Export
  exportReservationsCSV
};
