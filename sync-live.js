const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REMOTE_HOST = 'root@164.92.251.18';
const REMOTE_DIR = '/var/www/heybeli-sahne';
const LOCAL_STORE = path.join(__dirname, 'data', 'store.json');
const LOCAL_UPLOADS = path.join(__dirname, 'public', 'uploads');

function syncToLive() {
  console.log('🚀 Yerel değişiklikler canlı sunucuya (heybelisahne.com) aktarılıyor...');

  // 1. public/uploads klasöründeki tüm görselleri canlı sunucuya kopyala
  if (fs.existsSync(LOCAL_UPLOADS)) {
    const files = fs.readdirSync(LOCAL_UPLOADS).filter(f => !f.startsWith('.'));
    if (files.length > 0) {
      console.log(`📂 ${files.length} adet yüklü görsel canlı sunucuya gönderiliyor...`);
      execSync(`ssh ${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}/public/uploads"`, { stdio: 'inherit' });
      execSync(`scp -q "${LOCAL_UPLOADS}"/* ${REMOTE_HOST}:${REMOTE_DIR}/public/uploads/`, { stdio: 'inherit' });
    }
  }

const store = require('./store');

  // 2. Yerel store.json içeriklerini (sliders, events, categories, menuItems, settings, media)
  //    canlı sunucudaki store.json ile birleştir (canlıdaki gerçek müşteri rezervasyonlarını koru, sahte olanları temizle!)
  if (fs.existsSync(LOCAL_STORE)) {
    const localData = JSON.parse(fs.readFileSync(LOCAL_STORE, 'utf8'));
    let remoteData = {};
    try {
      const remoteRaw = execSync(`ssh ${REMOTE_HOST} "cat ${REMOTE_DIR}/data/store.json"`, { encoding: 'utf8' });
      remoteData = JSON.parse(remoteRaw);
    } catch (e) {
      remoteData = {};
    }

    // Canlıdaki ve yereldeki gerçek rezervasyonları birleştir, sahte/test kayıtları filtrele
    const remoteRes = Array.isArray(remoteData.reservations) ? remoteData.reservations : [];
    const localRes = Array.isArray(localData.reservations) ? localData.reservations : [];
    const seenIds = new Set();
    const cleanReservations = [];
    for (const r of [...remoteRes, ...localRes]) {
      if (r && r.id && !seenIds.has(r.id) && !store.isFakeOrInvalidReservation(r)) {
        seenIds.add(r.id);
        cleanReservations.push(r);
      }
    }

    // Canlıdaki gerçek rezervasyonları ve tıklama istatistiklerini koru
    const mergedData = {
      ...remoteData,
      reservations: cleanReservations,
      clicks: (Array.isArray(remoteData.clicks) && remoteData.clicks.length > 0
        ? remoteData.clicks
        : (localData.clicks || [])).filter(c => c && c.id !== 'CLK-101' && c.id !== 'CLK-102' && c.source !== 'production-verification'),
      clickTotals: remoteData.clickTotals || localData.clickTotals || {},
      sliders: localData.sliders || remoteData.sliders || [],
      categories: localData.categories || remoteData.categories || [],
      menuItems: localData.menuItems || remoteData.menuItems || [],
      events: localData.events || remoteData.events || [],
      settings: localData.settings || remoteData.settings || {},
      media: localData.media || remoteData.media || []
    };

    const tmpFile = path.join(__dirname, 'data', '.store.sync.tmp.json');
    fs.writeFileSync(tmpFile, JSON.stringify(mergedData, null, 2), 'utf8');
    fs.writeFileSync(LOCAL_STORE, JSON.stringify(mergedData, null, 2), 'utf8');
    execSync(`scp -q "${tmpFile}" ${REMOTE_HOST}:${REMOTE_DIR}/data/store.json`, { stdio: 'inherit' });
    fs.unlinkSync(tmpFile);
    console.log('✅ Veri tabanı (gerçek rezervasyonlar, slider, etkinlik takvimi, menü, medya) canlı sunucuya aktarıldı.');
  }

  // 3. Canlı sunucuda PM2 heybeli-sahne sürecini yeniden yükle (bellek önbelleğini tazele)
  execSync(`ssh ${REMOTE_HOST} "pm2 reload heybeli-sahne"`, { stdio: 'inherit' });
  console.log('🎉 İşlem tamamlandı! Değişiklikler https://heybelisahne.com adresinde yayında.');
}

if (require.main === module) {
  try {
    syncToLive();
  } catch (err) {
    console.error('❌ Canlıya aktarım hatası:', err.message);
    process.exit(1);
  }
}

module.exports = { syncToLive };

