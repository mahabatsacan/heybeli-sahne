# HEYBELİ SAHNE — ANTIGRAVITY IDE WORKSPACE RULES & SYSTEM DIRECTIVES

Bu dosya, Antigravity IDE Agentic AI asistanının **Heybeli Sahne** projesinde çalışırken uyması ZORUNLU olan temel kuralları, tasarım prensiplerini ve sunucu güvenlik standartlarını tanımlar.

---

## 🚨 KRİTİK GÜVENLİK & SUNUCU STANDARTLARI (KATI KURAL)

1. **Çift Proje İzolasyonu (DigitalOcean Droplet: `164.92.251.18`):**
   - Sunucuda 2 bağımsız proje barınmaktadır:
     - ⚠️ **PORT 3001:** `desingicmimarlik.com` (PM2 Süreci: `ysnmimarlik`) — **KESİNLİKLE DOKUNULMAZ, DURDURULMAZ, PORT DEĞİŞTİRİLMEZ!**
     - 🎤 **PORT 3002:** `heybelisahne.com` (PM2 Süreci: `heybeli-sahne`) — Bu projenin portu.
   - Herhangi bir sunucu komutunda PM2 üzerinde `pm2 stop all`, `pm2 delete all`, `killall node` gibi genel komutlar ASLA çalıştırılmayacaktır. Yalnızca `pm2 reload heybeli-sahne` kullanılır.

2. **Canlıya Dağıtım (Deploy):**
   - Dağıtım tek komutla yapılır: `npm run deploy`
   - Bu komut: `git push origin main` yapar, ardından SSH ile sunucuda `cd /var/www/heybeli-sahne && git pull origin main && npm install --production && pm2 reload heybeli-sahne` çalıştırır.

3. **Nginx Konfigürasyonu:**
   - Dosya: `/etc/nginx/sites-available/heybelisahne.com`
   - Nginx HTTP/2 (`listen 443 ssl http2;`) ve proxy ayarları bu blokta tanımlıdır.

---

## 🎨 TASARIM FELSEFESİ (LUXURY EDITORIAL & HOSPITALITY)

Heybeli Sahne; ucuz gece kulübü, SaaS paneli veya neonlu festival sitesi **DEĞİLDİR**. İstanbul meyhane kültürünü bilen, seçkin, yetişkin ve zevk sahibi bir kitleye hitap eden üst düzey bir restoran + canlı sahne markasıdır.

### 1. Renk Paleti (Sıfır Neon Kuralı):
- **Ana Zemin:** `#0B0C0E` (Zengin gece siyahı / obsidian)
- **Yüzey:** `#111216` (Mat kömür)
- **Hafif Yükseltilmiş Alanlar:** `#16181E`
- **Ana Metin:** `#F2EEE7` (Sıcak fildişi)
- **İkincil Metin:** `#D8D0C3` (Keten / taş tonu)
- **Muted Metin:** `#858792`
- **Aksan / Detay:** `#C49A55` / `#B88A3B` (Antika pirinç / soluk altın — Sadece saç teli çizgiler, küçük rozetler ve hover durumları için ölçülü kullanılır).
- ❌ **YASAK:** Fuşya, parlak pembe, neon mor, turuncu, gradient parlamalar, parlak card shadow'lar KESİNLİKLE KULLANILMAZ.

### 2. Tipografi Mimarisi:
- **Başlıklar (Headings):** `Cormorant Garamond`, `Playfair Display`, serif. Organik italik vurgular (`title-italic`).
- **Gövde Metinleri & Navigasyon:** `Plus Jakarta Sans`, modern, 15-16px, 1.65 satır aralığı.
- **Eyebrow / Üst Başlık:** 10-11px, `letter-spacing: 0.22em`, `text-transform: uppercase`.

### 3. Mizanpaj & Köşe Yuvarlama:
- Restoran dergisi (editorial magazine) ferahlığı. Negatif boşluklar (`whitespace`) içerik kadar önemlidir.
- Border radius: Maksimum `0px - 2px`. Yuvarlak SaaS butonları veya 16-24px köşe yuvarlamaları YASAKTIR.
- Kart karmaşası yerine saç teli inceliğinde ayırıcılar (`border-hairline: rgba(242, 238, 231, 0.08)`).

---

## 📱 MOBİL KULLANICI DENEYİMİ STANDARTLARI

- **Sabit Aksiyon Çubuğu:** `.mobile-bottom-bar` mobilde ekranın altında sabitlenir (`tel:`, `whatsapp:`, `#rezervasyon`).
- **Yatay Kategori Kaydırma:** Filtre sekmeleri mobilde dikey alt alta yığılmaz, yatayda parmakla kaydırılır (`overflow-x: auto`).
- **iOS Auto-Zoom Fix:** Form input'larında (`input`, `select`, `textarea`) font boyutu en az `16px` olmalıdır.
- **Dokunma Hedefleri:** Butonlar ve seçim alanları mobilde minimum `48px` yüksekliğe sahip olmalıdır.

---

## 🔍 SEO, GEO & AEO MİMARİSİ

1. **Schema.org:** Tüm sayfalarda JSON-LD `@graph` yapısında `Restaurant`, `MusicVenue`, `Event` dizisi, `FAQPage`, `Menu` ve `BreadcrumbList` eksiksiz korunmalıdır.
2. **GEO:** `geo.region`, `geo.placename`, `geo.position` (`40.8876;29.1864`), `ICBM` etiketleri ve Kordonboyu, Turgut Özal Blv. NO:53/A Kartal / İstanbul semantik içeriği her sayfada yer almalıdır.
3. **AEO:** `public/llms.txt` ve `public/llms-full.txt` dosyaları güncel tutulmalıdır. `robots.txt` içinde AI crawler izinleri korunmalıdır.
4. **Performans:** Express `compression()` middleware, static cache header'ları (`max-age=604800, immutable`), hero görselinde `fetchpriority="high"`, diğerlerinde `loading="lazy"` ve `decoding="async"`.

---

## 🛠️ YEREL GELİŞTİRME KOMUTLARI

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat (Port 3002)
npm run dev

# Canlı sunucuya dağıt (Git push + SSH deploy + PM2 reload)
npm run deploy
```
