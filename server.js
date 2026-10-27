const compression = require('compression');
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const store = require('./store');

const app = express();
const PORT = process.env.PORT || 3002;
const START_TIME = new Date();

// Performance: Gzip Compression
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Security & SEO Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware & Static Assets with aggressive caching for assets
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Upload Configuration
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    cb(null, `${safeBase || 'heybeli'}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece görsel dosyaları (JPEG, PNG, WEBP, GIF, SVG) kabul edilir.'));
    }
  }
});

// ==========================================
// SAYFA SUNUMU: CSS/JS için otomatik sürüm (cache-busting)
// Dosya değiştiğinde ?v= değeri değişir; ziyaretçi her zaman güncel dosyayı alır,
// değişmeyen dosyalar ise tarayıcı önbelleğinden anında yüklenir.
// ==========================================
const PUBLIC_DIR = path.join(__dirname, 'public');
const pageCache = new Map();

function assetVersion(file) {
  try {
    return Math.floor(fs.statSync(path.join(PUBLIC_DIR, file)).mtimeMs).toString(36);
  } catch (e) {
    return '1';
  }
}

function sendPage(res, file) {
  const filePath = path.join(PUBLIC_DIR, file);
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (e) {
    return res.status(404).send('Sayfa bulunamadı');
  }

  const cssV = assetVersion('style.css');
  const jsV = assetVersion('app.js');
  const key = `${stat.mtimeMs}:${cssV}:${jsV}`;

  let cached = pageCache.get(file);
  if (!cached || cached.key !== key) {
    const body = fs.readFileSync(filePath, 'utf8')
      .replace(/href="\/style\.css(\?v=[^"]*)?"/g, `href="/style.css?v=${cssV}"`)
      .replace(/src="\/app\.js(\?v=[^"]*)?"/g, `src="/app.js?v=${jsV}"`);
    cached = { key, body };
    pageCache.set(file, cached);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.send(cached.body);
}

// Ana sayfa ve doğrudan .html erişimleri statik sunucudan önce yakalanır
app.get(['/', '/index.html'], (req, res) => sendPage(res, 'index.html'));
app.get(/^\/(hakkimizda|program|menu|rezervasyon|iletisim|cerez-politikasi)\.html$/, (req, res) => {
  sendPage(res, `${req.params[0]}.html`);
});

app.use(express.static(PUBLIC_DIR, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (filePath.match(/\.(css|js|woff2|woff|ttf|png|jpg|jpeg|webp|svg|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));

// SEO & AI Crawlers Static Routes
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/llms.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, 'public', 'llms.txt'));
});

app.get('/llms-full.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, 'public', 'llms-full.txt'));
});

// Clean URLs for Pages (Aligned with HayalMest Structure)
app.get(['/hakkimizda', '/hakkimizda/'], (req, res) => {
  sendPage(res, 'hakkimizda.html');
});

app.get(['/etkinlik-takvimi', '/etkinlik-takvimi/', '/hayalmest-etkinlik-takvimi', '/program', '/sahne-programi'], (req, res) => {
  sendPage(res, 'program.html');
});

app.get(['/menu', '/menü', encodeURI('/menü'), '/menu-listemiz', '/menu-listemiz/'], (req, res) => {
  sendPage(res, 'menu.html');
});

app.get(['/galeri', '/galeri/'], (req, res) => {
  res.redirect(301, '/');
});

app.get(['/rezervasyon', '/rezervasyon/'], (req, res) => {
  sendPage(res, 'rezervasyon.html');
});

app.get(['/cerez-politikasi', '/cerez-politikasi/', '/gizlilik'], (req, res) => {
  sendPage(res, 'cerez-politikasi.html');
});

app.get(['/iletisim', '/iletisim/'], (req, res) => {
  sendPage(res, 'iletisim.html');
});

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const settings = store.getSettings();
  res.json({
    status: 'healthy',
    venue: settings.venueName,
    message: `${settings.venueName} Dijital Servisi Aktif ve Çalışıyor`,
    port: PORT,
    version: '2.0.0',
    uptimeSeconds: Math.floor((Date.now() - START_TIME.getTime()) / 1000),
    environment: process.env.NODE_ENV || 'production',
    serverTime: new Date().toISOString()
  });
});

// ==========================================
// PUBLIC DYNAMIC CONTENT APIs
// ==========================================

// Unified Bootstrap API (Fast 1-roundtrip initial data for client, reduces latency)
app.get('/api/bootstrap', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json({
    settings: store.getSettings(),
    sliders: store.getSliders().filter(s => s.isActive !== false),
    events: store.getEvents(),
    categories: store.getCategories()
  });
});

// Global Site Settings
app.get('/api/settings', (req, res) => {
  res.json(store.getSettings());
});

// Venue info backward compatibility
app.get('/api/venue', (req, res) => {
  const s = store.getSettings();
  res.json({
    name: s.venueName,
    tagline: s.tagline,
    phone: s.phone,
    whatsapp: s.whatsappDirect || '905308664321',
    address: s.address,
    mapUrl: s.mapUrl,
    menuUrl: '/menu',
    email: s.email,
    workingHours: s.workingHours,
    musicStart: s.musicHours
  });
});

// Sliders API
app.get('/api/sliders', (req, res) => {
  const sliders = store.getSliders().filter(s => s.isActive !== false);
  res.json(sliders);
});

// Events API
app.get('/api/events', (req, res) => {
  const category = req.query.category;
  const events = store.getEvents(category);
  res.json(events);
});

// Single Event API
app.get('/api/events/:id', (req, res) => {
  const event = store.getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
  }
  res.json(event);
});

// Categories API
app.get('/api/categories', (req, res) => {
  res.json(store.getCategories());
});

// Menu Items API
app.get('/api/menu-items', (req, res) => {
  res.json(store.getMenuItems(req.query.category));
});

// Full Menu API (Categories + Items)
app.get('/api/menu', (req, res) => {
  const categories = store.getCategories();
  const items = store.getMenuItems();
  
  // Attach items to each category
  const categoriesWithItems = categories.map(cat => ({
    ...cat,
    items: items.filter(i => i.categoryId === cat.id)
  }));

  res.json({
    categories: categoriesWithItems,
    items,
    allCategories: categories
  });
});

// ==========================================
// TRACKING & CONVERSION API
// ==========================================

// Click Tracking: Phone Calls & WhatsApp Inquiries
app.post('/api/track', (req, res) => {
  const { type, source, page } = req.body || {};
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
  const device = isMobile ? 'Mobil' : 'Masaüstü';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  const tracked = store.addClick({
    type: type || 'whatsapp',
    source: source || 'sayfa-ici',
    page: page || '/',
    device,
    ip
  });

  res.status(200).json({ success: true, id: tracked.id });
});

// Reservation Form API: Saves to persistent store
app.post('/api/reservation', (req, res) => {
  const { name, phone, date, guests, tableType, note } = req.body;

  if (!name || !phone || !date) {
    return res.status(400).json({
      success: false,
      error: 'Lütfen ad, telefon ve tarih alanlarını eksiksiz doldurunuz.'
    });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const saved = store.addReservation({
    name: name.trim(),
    phone: phone.trim(),
    date,
    guests,
    tableType,
    note,
    ip
  });

  console.log('====================================');
  console.log(`🍾 YENİ MASA REZERVASYON TALEBİ [${saved.id}]`);
  console.log(`İsim: ${name} | Tel: ${phone}`);
  console.log(`Tarih: ${date} | Kişi Sayısı: ${guests || '2'}`);
  console.log(`Masa Tipi: ${tableType || 'Standart'} | Not: ${note || '-'}`);
  console.log('====================================');

  res.json({
    success: true,
    id: saved.id,
    message: `Talebiniz Heybeli Sahne ekibine iletildi. Rezervasyon onayınız ve masa detaylarınız için ${phone} numaralı telefondan en kısa sürede iletişime geçilecektir.`
  });
});

// ==========================================
// ADMIN PANEL API (v2) - FULL CMS
// ==========================================

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'heybeli2026';
const ADMIN_TOKEN = 'heybeli_token_' + Buffer.from(ADMIN_PASSWORD).toString('hex');

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token === ADMIN_TOKEN || req.query.token === ADMIN_TOKEN) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' });
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, error: 'Hatalı yönetici şifresi.' });
});

// Admin Dashboard Summary Data
app.get('/api/admin/data', requireAdmin, (req, res) => {
  const stats = store.getStats();
  const reservations = store.getReservations({
    status: req.query.status,
    search: req.query.search
  });
  const clicks = store.getClicks(200);
  const sliders = store.getSliders();
  const events = store.getEvents();
  const categories = store.getCategories();
  const menuItems = store.getMenuItems();
  const settings = store.getSettings();
  const media = store.getMedia();

  res.json({
    success: true,
    stats,
    reservations,
    clicks,
    sliders,
    events,
    categories,
    menuItems,
    settings,
    media
  });
});

// Update Reservation Status
app.patch('/api/admin/reservations/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ success: false, error: 'Durum belirtilmelidir.' });
  }

  const updated = store.updateReservationStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Rezervasyon bulunamadı.' });
  }

  res.json({ success: true, reservation: updated });
});

// Delete Reservation
app.delete('/api/admin/reservations/:id', requireAdmin, (req, res) => {
  const deleted = store.deleteReservation(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Rezervasyon bulunamadı.' });
  }
  res.json({ success: true, message: 'Rezervasyon silindi.' });
});

// Export Reservations as CSV
app.get('/api/admin/export', requireAdmin, (req, res) => {
  const csv = store.exportReservationsCSV();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=heybeli-sahne-rezervasyonlar-${Date.now()}.csv`);
  res.send(csv);
});

// ------------------------------------------
// ADMIN: SLIDERS CRUD
// ------------------------------------------
app.get('/api/admin/sliders', requireAdmin, (req, res) => {
  res.json({ success: true, sliders: store.getSliders() });
});

app.post('/api/admin/sliders', requireAdmin, (req, res) => {
  const created = store.addSlider(req.body);
  res.json({ success: true, slider: created });
});

app.put('/api/admin/sliders/:id', requireAdmin, (req, res) => {
  const updated = store.updateSlider(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Slider bulunamadı' });
  res.json({ success: true, slider: updated });
});

app.delete('/api/admin/sliders/:id', requireAdmin, (req, res) => {
  const deleted = store.deleteSlider(req.params.id);
  res.json({ success: deleted });
});

// ------------------------------------------
// ADMIN: CATEGORIES CRUD
// ------------------------------------------
app.get('/api/admin/categories', requireAdmin, (req, res) => {
  res.json({ success: true, categories: store.getCategories() });
});

app.post('/api/admin/categories', requireAdmin, (req, res) => {
  if (!req.body.name) return res.status(400).json({ success: false, error: 'Kategori adı zorunludur' });
  const created = store.addCategory(req.body);
  res.json({ success: true, category: created });
});

app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const updated = store.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Kategori bulunamadı' });
  res.json({ success: true, category: updated });
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const deleted = store.deleteCategory(req.params.id);
  res.json({ success: deleted });
});

// ------------------------------------------
// ADMIN: MENU ITEMS CRUD
// ------------------------------------------
app.get('/api/admin/menu-items', requireAdmin, (req, res) => {
  res.json({ success: true, menuItems: store.getMenuItems(req.query.category) });
});

app.post('/api/admin/menu-items', requireAdmin, (req, res) => {
  if (!req.body.name) return res.status(400).json({ success: false, error: 'Ürün adı zorunludur' });
  const created = store.addMenuItem(req.body);
  res.json({ success: true, menuItem: created });
});

app.put('/api/admin/menu-items/:id', requireAdmin, (req, res) => {
  const updated = store.updateMenuItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
  res.json({ success: true, menuItem: updated });
});

app.delete('/api/admin/menu-items/:id', requireAdmin, (req, res) => {
  const deleted = store.deleteMenuItem(req.params.id);
  res.json({ success: deleted });
});

// ------------------------------------------
// ADMIN: EVENTS CRUD
// ------------------------------------------
app.get('/api/admin/events', requireAdmin, (req, res) => {
  res.json({ success: true, events: store.getEvents(req.query.category) });
});

app.post('/api/admin/events', requireAdmin, (req, res) => {
  if (!req.body.title) return res.status(400).json({ success: false, error: 'Program başlığı zorunludur' });
  const created = store.addEvent(req.body);
  res.json({ success: true, event: created });
});

app.put('/api/admin/events/:id', requireAdmin, (req, res) => {
  const updated = store.updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Etkinlik bulunamadı' });
  res.json({ success: true, event: updated });
});

app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
  const deleted = store.deleteEvent(req.params.id);
  res.json({ success: deleted });
});

// ------------------------------------------
// ADMIN: SETTINGS
// ------------------------------------------
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  res.json({ success: true, settings: store.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const updated = store.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// ------------------------------------------
// ADMIN: FILE / IMAGE UPLOAD & MEDIA LIBRARY
// ------------------------------------------
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Görsel dosyası seçilmedi.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const mediaItem = store.addMedia({
    filename: req.file.filename,
    url: fileUrl,
    size: req.file.size,
    mimetype: req.file.mimetype
  });

  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    media: mediaItem
  });
});

app.get('/api/admin/media', requireAdmin, (req, res) => {
  res.json({ success: true, media: store.getMedia() });
});

app.delete('/api/admin/media/:id', requireAdmin, (req, res) => {
  const deleted = store.deleteMedia(req.params.id);
  res.json({ success: deleted });
});

// Fallback to index.html
app.get('*', (req, res) => {
  sendPage(res, 'index.html');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `Dosya yükleme hatası: ${err.message}` });
  }
  res.status(500).json({ success: false, error: err.message || 'Sunucu hatası meydana geldi.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🎤 Heybeli Sahne | Tam Dinamik CMS & Yönetim Sistemi`);
  console.log(`🚀 Sunucu port ${PORT} üzerinde hazır!`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`👑 Admin Paneli: http://localhost:${PORT}/admin`);
  console.log(`=================================================`);
});
