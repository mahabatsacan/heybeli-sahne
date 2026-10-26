const compression = require('compression');
const express = require('express');
const path = require('path');
const { UPCOMING_EVENTS, MENU_DATA, VENUE_INFO } = require('./events-data');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
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
  res.sendFile(path.join(__dirname, 'public', 'hakkimizda.html'));
});

app.get(['/etkinlik-takvimi', '/etkinlik-takvimi/', '/hayalmest-etkinlik-takvimi', '/program', '/sahne-programi'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'program.html'));
});

app.get(['/menu', '/menü', encodeURI('/menü'), '/menu-listemiz', '/menu-listemiz/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.get(['/galeri', '/galeri/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'galeri.html'));
});

app.get(['/rezervasyon', '/rezervasyon/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rezervasyon.html'));
});

app.get(['/iletisim', '/iletisim/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'iletisim.html'));
});

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check endpoint for DigitalOcean
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    venue: VENUE_INFO.name,
    message: `${VENUE_INFO.name} Dijital Servisi Aktif ve Çalışıyor`,
    port: PORT,
    version: '1.1.0',
    uptimeSeconds: Math.floor((Date.now() - START_TIME.getTime()) / 1000),
    environment: process.env.NODE_ENV || 'production',
    serverTime: new Date().toISOString()
  });
});

// Events API Endpoint
app.get('/api/events', (req, res) => {
  const category = req.query.category;
  if (category && category !== 'all') {
    return res.json(UPCOMING_EVENTS.filter(e => e.category === category));
  }
  res.json(UPCOMING_EVENTS);
});

// Single Event API Endpoint
app.get('/api/events/:id', (req, res) => {
  const event = UPCOMING_EVENTS.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
  }
  res.json(event);
});

// Menu API Endpoint
app.get('/api/menu', (req, res) => {
  res.json(MENU_DATA);
});

// Venue Info API Endpoint
app.get('/api/venue', (req, res) => {
  res.json(VENUE_INFO);
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
// ADMIN PANEL API (v1)
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

// Admin Dashboard Data: Stats, Reservations & Clicks
app.get('/api/admin/data', requireAdmin, (req, res) => {
  const stats = store.getStats();
  const reservations = store.getReservations({
    status: req.query.status,
    search: req.query.search
  });
  const clicks = store.getClicks(200);

  res.json({
    success: true,
    stats,
    reservations,
    clicks
  });
});

// Update Reservation Status (yeni -> onaylandi / iptal)
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

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🎤 ${VENUE_INFO.name} | ${VENUE_INFO.tagline}`);
  console.log(`🚀 Sunucu port ${PORT} üzerinde hazır!`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`👑 Admin Paneli: http://localhost:${PORT}/admin`);
  console.log(`=================================================`);
});
