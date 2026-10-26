// Heybeli Sahne - Canlı Performans, Sanatçılar ve Menü Veri Tabanı

const UPCOMING_EVENTS = [
  {
    id: 'sakiler-canli',
    title: 'Sakiler Canlı Performans',
    artist: 'Sakiler',
    date: '25 Eylül Cuma',
    time: '21:30',
    category: 'canli-muzik',
    badge: 'Bu Cuma',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    description: 'Modern arabesk ve pop müziğin sevilen grubu Sakiler, Heybeli Sahne\'de en hit şarkıları ve eşsiz sahne enerjisiyle sizlerle buluşuyor.',
    highlights: ['Özel Fiks Menü Dahil', 'Canlı Fasıl Açılışı (20:00)', 'Gece Boyu DJ Performans'],
    ticketInfo: 'Fiks Menü + Konser Girişi Dahil',
    isSoldOut: false
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
    highlights: ['Sahne Önü VIP Masalar', 'Zengin Meze Seçkisi', 'Özel Kokteyl İkramı'],
    ticketInfo: 'Sınırlı Sayıda Rezervasyon',
    isSoldOut: false
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
    highlights: ['Gala Fiks Menüsü', 'VIP Loca Hizmeti', 'Vale & Karşılama İkramı'],
    ticketInfo: 'Ön Satışta Yoğun Talep',
    isSoldOut: false
  },
  {
    id: 'kadinlar-matinesi',
    title: 'Çarşamba Kadınlar Matinesi & 90\'lar Türkçe Pop',
    artist: 'DJ Ece & Oryantal Şov',
    date: 'Her Çarşamba',
    time: '19:30',
    category: 'matine',
    badge: 'Haftalık Özel',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    description: 'Kadınlar matinesinde 90\'lar Türkçe Pop nostaljisi, modern fasıl ekibi ve dans gösterileri eşliğinde sınırsız eğlence.',
    highlights: ['Kadınlara Özel İndirimli Fiks Menü', 'Sürpriz Dans Şovları', 'Sınırsız Eğlence'],
    ticketInfo: 'Grup Rezervasyonlarında İndirim',
    isSoldOut: false
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
    highlights: ['Özel Şef Menüsü', 'Fasıl & Keman Resitali', 'Gece Boyu İkramlar'],
    ticketInfo: 'Rezervasyon Açıldı',
    isSoldOut: false
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
    highlights: ['Klasik Ege Mezeleri', 'Taş Fırın Sıcakları', 'Samimi Meyhane Muhabbeti'],
    ticketInfo: 'Hafta İçi Fiks Menü Fırsatı',
    isSoldOut: false
  }
];

const MENU_DATA = {
  fixMenus: [
    {
      id: 'fix-klasik',
      name: 'Heybeli Klasik Fiks Menü',
      tag: 'Günün En Çok Tercih Edileni',
      price: '₺1.950',
      perPerson: 'Kişi Başı (Canlı Müzik Dahil)',
      features: [
        '8 Çeşit Günlük Taze Ege Mezesi',
        '2 Çeşit Sıcak Başlangıç (Paçanga & İçli Köfte)',
        'Ana Yemek Seçimi (Kasap Köfte, Tavuk Külbastı veya Levrek Izgara)',
        'Mevsim Meyveleri & İrmik Helvası',
        'Yerli İçecek Paketi veya Meşrubat'
      ]
    },
    {
      id: 'fix-vip',
      name: 'Heybeli Gold VIP Fiks Menü',
      tag: 'Sahne Önü & Özel Kutlamalar',
      price: '₺2.750',
      perPerson: 'Kişi Başı (VIP Masa & Konser Dahil)',
      features: [
        '10 Çeşit Şef İmzalı Gurme Meze (Ahtapot Salatası, Atom, Deniz Börülcesi vb.)',
        '3 Çeşit Sıcak Başlangıç (Kalamar Tava, Tereyağlı Karides & Paçanga)',
        'Ana Yemek: Özel Dinlendirilmiş Dana Lokum veya Çipura Fileto',
        'Gourmet Meyve Tabağı & Dondurmalı Sufle',
        'Premium Yerli İçecekler veya İmza Kokteyller'
      ]
    },
    {
      id: 'fix-matine',
      name: 'Kadınlar Matinesi Özel Menü',
      tag: 'Sadece Çarşamba Günleri',
      price: '₺1.450',
      perPerson: 'Kişi Başı (Şov & Eğlence Dahil)',
      features: [
        '6 Çeşit Soğuk Meze',
        'Çıtır Börek & Falafel',
        'Piliç Izgara veya Izgara Köfte',
        'Meyve & Meşrubat İkramı',
        'Hoş Geldin Kokteyli'
      ]
    }
  ],
  mezes: [
    { name: 'Köz Patlıcanlı Atom', desc: 'Süzme yoğurt, acı tereyağlı çıtır biberler ile', price: '₺195' },
    { name: 'Girit Ezmesi', desc: 'Ezine peyniri, ceviz, taze fesleğen ve fıstık dokunuşu', price: '₺210' },
    { name: 'Ege Deniz Börülcesi', desc: 'Zeytinyağı, sarımsak ve limon emülsiyonu', price: '₺185' },
    { name: 'Vişneli Yaprak Sarma', desc: 'Kuş üzümlü, çam fıstıklı ve taze nane soslu', price: '₺220' },
    { name: 'Köpoğlu Mancası', desc: 'Kızarmış patlıcan ve biberlerin domates soslu yoğurtla buluşması', price: '₺190' },
    { name: 'Muhammara', desc: 'Cevizli ve nar ekşili Antakya usulü ezme', price: '₺200' },
    { name: 'Kavun & Ezine Peyniri', desc: 'Tam yağlı olgunlaştırılmış Çanakkale Ezine peyniri', price: '₺240' },
    { name: 'Fava', desc: 'Karamelize soğan ve sızma zeytinyağı ile dereotlu fava', price: '₺180' }
  ],
  warmStarters: [
    { name: 'Tereyağında Karides Güveç', desc: 'Sarımsak, pul biber ve domates soslu taze karides', price: '₺390' },
    { name: 'Çıtır Kalamar Tava', desc: 'Ev yapımı tarator sos ve limon eşliğinde', price: '₺420' },
    { name: 'Pastırmalı Paçanga Böreği', desc: 'Kayseri pastırması ve kaşar peyniriyle çıtır lezzet', price: '₺260' },
    { name: 'Yaprak Ciğer (Edirne Usulü)', desc: 'İnce kıyım dana ciğer, sumaklı soğan söğüş ile', price: '₺340' }
  ]
};

const VENUE_INFO = {
  name: 'Heybeli Sahne',
  tagline: 'Anadolu Meyhanesi & Canlı Performans Sahnesi',
  phone: '0530 527 91 77',
  whatsapp: '905308664321',
  address: 'Kordonboyu, Turgut Özal Blv. NO:53/A, 34860 Kartal / İstanbul',
  mapUrl: 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14cac71cab646a87:0x9968fa4cab653899?sa=X&ved=1t:8290&ictx=111',
  menuUrl: 'https://heybelisahne.com/men%C3%BC',
  email: 'rezervasyon@heybelisahne.com',
  workingHours: 'Çarşamba - Pazar: 19:30 - 02:00',
  musicStart: '20:30 Fasıl & DJ | 21:45 Canlı Sahne'
};

module.exports = {
  UPCOMING_EVENTS,
  MENU_DATA,
  VENUE_INFO
};
