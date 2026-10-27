// ==========================================================
// HEYBELİ SAHNE - DİNAMİK CLIENT SCRIPT (v2.0 CMS)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 0. ÇEREZ ONAYI (KVKK) — ilk girişte sorulur, tercih tarayıcıda saklanır
  const CONSENT_KEY = 'hs_cookie_consent_v1';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); } catch (e) { return null; }
  }

  function saveConsent(analytics) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ necessary: true, analytics, date: new Date().toISOString() }));
    } catch (e) {}
  }

  function showCookieBanner() {
    if (document.getElementById('cookie-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Çerez tercihleri');
    banner.innerHTML = `
      <div class="cookie-banner-text">
        <strong class="cookie-banner-title">🍪 Çerez Tercihleriniz</strong>
        <p>Sitemizin düzgün çalışması için zorunlu çerezler, deneyiminizi iyileştirmek için ise isteğe bağlı analiz çerezleri kullanıyoruz. Detaylar için <a href="/cerez-politikasi">Çerez Politikamızı</a> inceleyebilirsiniz.</p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-btn cookie-btn-secondary" id="cookie-reject">Sadece Zorunlu</button>
        <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept">Tümünü Kabul Et</button>
      </div>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));

    const close = (analytics) => {
      saveConsent(analytics);
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 300);
    };
    banner.querySelector('#cookie-accept').addEventListener('click', () => close(true));
    banner.querySelector('#cookie-reject').addEventListener('click', () => close(false));
  }

  if (!getConsent()) {
    // Sayfa içeriği çizildikten sonra göster (ilk boyamayı geciktirmez)
    setTimeout(showCookieBanner, 600);
  }
  document.querySelectorAll('.cookie-settings-btn').forEach(btn => btn.addEventListener('click', showCookieBanner));

  // 1. STICKY HEADER SCROLL EFFECT (60fps requestAnimationFrame throttled)
  const header = document.getElementById('header');
  let isScrolled = false;
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const shouldScroll = window.scrollY > 30;
        if (shouldScroll !== isScrolled) {
          isScrolled = shouldScroll;
          if (header) header.classList.toggle('scrolled', isScrolled);
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // 2. MOBILE NAVIGATION DRAWER
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    document.querySelectorAll('.mobile-nav-link, .mobile-menu-actions a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. TABLE OPTION RADIO SELECTOR CARDS
  function bindTableOptionCards() {
    document.querySelectorAll('.table-option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.table-option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  }
  bindTableOptionCards();

  // 4. FAQ ACCORDION
  document.querySelectorAll('.faq-question-btn, .faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const qBtn = i.querySelector('.faq-question-btn, .faq-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 5. RESERVATION FORM SUBMISSION (Anasayfa #reservation-form + /rezervasyon #pageReservationForm)
  // Talep: 1) yönetim paneline kaydedilir  2) Heybeli Sahne WhatsApp hattına hazır mesaj olarak iletilir
  //        3) ziyaretçi isterse onay bilgisini kendi WhatsApp'ına kaydeder
  let venueWa = '905308664321';
  const VENUE_ADDRESS = 'Kordonboyu, Turgut Özal Blv. No:53/A, Kartal / İstanbul';
  let venuePhoneDisplay = '0530 527 91 77';

  // Türkiye numaralarını WhatsApp formatına (90XXXXXXXXXX) çevirir
  function toWaNumber(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = '9' + d;
    else if (d.length === 10 && d.startsWith('5')) d = '90' + d;
    return d.length >= 11 ? d : '';
  }

  function formatTrDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return iso || '';
    const dt = new Date(+m[1], +m[2] - 1, +m[3]);
    return dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  }

  function waLink(number, text) {
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  function buildVenueMessage(r) {
    const lines = [
      'Merhaba Heybeli Sahne, web sitenizden masa rezervasyonu talebi oluşturdum:',
      '',
      `📌 Talep Kodu: ${r.id}`,
      `👤 Ad Soyad: ${r.name}`,
      `📞 Telefon: ${r.phone}`,
      `📅 Tarih: ${formatTrDate(r.date)}`,
      `👥 Kişi Sayısı: ${r.guests}`,
      `🪑 Masa Tercihi: ${r.tableType}`
    ];
    if (r.event && r.event !== 'Genel Rezervasyon') lines.push(`🎤 Program: ${r.event}`);
    if (r.menu) lines.push(`🍽️ Menü: ${r.menu}`);
    if (r.note) lines.push(`📝 Not: ${r.note}`);
    lines.push('', 'Rezervasyonumun onayını bekliyorum, teşekkürler.');
    return lines.join('\n');
  }

  function buildSelfMessage(r) {
    return [
      '✅ Heybeli Sahne rezervasyon talebim alındı',
      '',
      `📌 Talep Kodu: ${r.id}`,
      `📅 Tarih: ${formatTrDate(r.date)}`,
      `👥 Kişi: ${r.guests}`,
      `🪑 Masa: ${r.tableType}`,
      '',
      '🚪 Kapı açılış 20:00 · 🎤 Sahne 22:00',
      `📍 ${VENUE_ADDRESS}`,
      `☎️ Rezervasyon Hattı: ${venuePhoneDisplay}`
    ].join('\n');
  }

  const WA_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.8 14.28c-.24.68-1.39 1.3-1.92 1.38-.5.08-1.13.11-3.64-.93-2.14-.88-3.52-3.06-3.63-3.21-.11-.15-.86-1.14-.86-2.18s.54-1.55.74-1.76c.19-.21.43-.26.57-.26.15 0 .29 0 .42.01.13.01.32-.05.5.38.19.45.64 1.57.7 1.69.06.12.09.26.02.41-.08.15-.12.24-.24.38-.12.15-.25.32-.36.43-.12.12-.24.26-.1.5.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.53-.06.14-.17.62-.72.78-.97.17-.24.33-.21.55-.12.22.08 1.41.67 1.65.79.24.12.4.17.46.28.06.11.06.63-.18 1.31z"/></svg>';

  function renderReservationSuccess(feedback, r) {
    const venueUrl = waLink(venueWa, buildVenueMessage(r));
    const selfNumber = toWaNumber(r.phone);
    const selfUrl = selfNumber ? waLink(selfNumber, buildSelfMessage(r)) : '';

    feedback.className = 'form-feedback res-success-wrap';
    feedback.style.display = 'block';
    feedback.innerHTML = `
      <div class="res-success" role="status">
        <div class="res-success-head">
          <span class="res-success-icon" aria-hidden="true">✓</span>
          <div>
            <strong class="res-success-title">Rezervasyon talebiniz alındı</strong>
            <span class="res-success-code">Talep Kodu: ${escapeHtml(r.id)}</span>
          </div>
        </div>
        <p class="res-success-text">Talebiniz rezervasyon ekibimize ulaştı. Masanızın hemen ayrılması için talebinizi <strong>WhatsApp</strong> üzerinden de iletin — açılan sohbette yalnızca <strong>Gönder</strong>'e dokunmanız yeterli.</p>
        <ul class="res-success-summary">
          <li><span>Tarih</span><strong>${escapeHtml(formatTrDate(r.date))}</strong></li>
          <li><span>Kişi</span><strong>${escapeHtml(r.guests)}</strong></li>
          <li><span>Masa</span><strong>${escapeHtml(r.tableType)}</strong></li>
        </ul>
        <div class="res-success-actions">
          <a href="${venueUrl}" target="_blank" rel="noopener" class="res-wa-btn res-wa-primary" data-wa-fixed data-track="reservation_whatsapp" data-track-source="Rezervasyon Formu Sonrası" data-track-label="Talebi WhatsApp ile Gönder">
            ${WA_ICON}<span>Talebi WhatsApp ile Gönder</span>
          </a>
          ${selfUrl ? `
          <a href="${selfUrl}" target="_blank" rel="noopener" class="res-wa-btn res-wa-secondary" data-wa-fixed data-track="reservation_self_whatsapp" data-track-source="Rezervasyon Formu Sonrası" data-track-label="Onay Bilgisini WhatsApp'ıma Kaydet">
            ${WA_ICON}<span>Onay Bilgisini WhatsApp'ıma Kaydet</span>
          </a>` : ''}
        </div>
        <p class="res-success-foot">Yetkilimiz en geç 15 dakika içinde <strong>${escapeHtml(r.phone)}</strong> numarasından size dönüş yapacaktır.</p>
      </div>`;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return venueUrl;
  }

  function bindReservationForm(form) {
    if (!form) return;
    const q = (sel) => form.querySelector(sel);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = q('button[type="submit"]');
      const originalHtml = submitBtn ? submitBtn.innerHTML : '';
      const feedback = form.querySelector('.form-feedback') || document.getElementById('resStatusMsg');

      const nameInput = q('#res-name, #r-name, #fullName');
      const phoneInput = q('#res-phone, #r-phone, #phone');
      const dateInput = q('#res-date, #r-date, #resDate');
      const guestsInput = q('#res-guests, #r-guests, #guests');
      const noteInput = q('#res-note, #r-note, #notes');
      const areaSelect = q('#area');
      const eventSelect = q('#eventSelect');
      const menuSelect = q('#menuSelect');
      const checkedTable = q('input[name="table_type"]:checked, input[name="tableType"]:checked');

      const payload = {
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        date: dateInput ? dateInput.value : '',
        guests: guestsInput ? guestsInput.value : '2 Kişi',
        tableType: checkedTable ? checkedTable.value : (areaSelect ? areaSelect.value : 'Standart Meyhane Masası'),
        event: eventSelect ? eventSelect.value : (form.dataset.event || ''),
        menu: menuSelect ? menuSelect.value : '',
        note: noteInput ? noteInput.value.trim() : '',
        page: window.location.pathname || '/'
      };

      const showError = (msg) => {
        if (feedback) {
          feedback.className = 'form-feedback error';
          feedback.style.display = 'block';
          feedback.innerHTML = `✕ <strong>Rezervasyon gönderilemedi:</strong> ${escapeHtml(msg)}<br>Lütfen doğrudan <a href="tel:+905305279177">${venuePhoneDisplay}</a> numarasını arayınız.`;
        } else {
          alert(`Rezervasyon gönderilemedi: ${msg}`);
        }
      };

      if (payload.phone.replace(/\D/g, '').length < 10) {
        showError('Lütfen geçerli bir telefon numarası giriniz (Örn: 0532 123 45 67).');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.textContent = 'Rezervasyon İletiliyor...';
      }

      try {
        const response = await fetch('/api/reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Rezervasyon iletilirken bir hata oluştu.');
        }

        const saved = Object.assign({}, payload, result.reservation || {}, { id: result.id });
        let venueUrl = '';
        if (feedback) {
          venueUrl = renderReservationSuccess(feedback, saved);
        } else {
          venueUrl = waLink(venueWa, buildVenueMessage(saved));
        }

        // WhatsApp sohbetini otomatik aç (tarayıcı engellerse ekrandaki yeşil buton hazır)
        const waWindow = window.open(venueUrl, '_blank', 'noopener');
        if (waWindow !== null || !feedback) {
          trackClick('reservation_whatsapp', 'Rezervasyon Formu (Otomatik Açılış)', 'Form gönderimi sonrası otomatik');
        }

        form.reset();
        delete form.dataset.event;
        // Masa seçim kartlarını varsayılan seçime senkronla
        form.querySelectorAll('.table-option-card').forEach(card => {
          const radio = card.querySelector('input[type="radio"]');
          card.classList.toggle('active', !!(radio && radio.checked));
        });
      } catch (err) {
        showError(err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerHTML = originalHtml;
        }
      }
    });
  }

  bindReservationForm(document.getElementById('reservation-form'));
  bindReservationForm(document.getElementById('pageReservationForm'));

  // 6. CONVERSION & CLICK TRACKING — sitedeki tüm dinamik butonlar
  function trackClick(type, source, label) {
    // İstatistik yalnızca ziyaretçi analiz çerezlerine onay verdiyse gönderilir (KVKK)
    const consent = getConsent();
    if (!consent || !consent.analytics) return;
    try {
      const payload = JSON.stringify({
        type,
        source,
        label: label || '',
        page: window.location.pathname || '/'
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (err) {}
  }

  function detectSource(el) {
    if (el.dataset.trackSource) return el.dataset.trackSource;
    const map = [
      ['#mobile-bottom-bar, .mobile-bottom-bar', 'Mobil Sabit Alt Bar'],
      ['.floating-whatsapp', 'Sabit WhatsApp Butonu'],
      ['#mobile-menu, .mobile-menu', 'Mobil Menü'],
      ['header, #header', 'Üst Menü (Header)'],
      ['footer, .site-footer', 'Alt Bilgi (Footer)'],
      ['#hero, .hero-editorial', 'Hero / Slider'],
      ['.res-success', 'Rezervasyon Formu Sonrası'],
      ['#rezervasyon, .reservation-form-container, .section-reservation-editorial', 'Rezervasyon Bölümü'],
      ['.schedule-item, .event-card, #program, .section-schedule', 'Etkinlik Takvimi'],
      ['#menu, .section-menu-editorial, .menu-category-card', 'Menü Bölümü'],
      ['#yorumlar, .section-reviews', 'Misafir Yorumları'],
      ['#sss, .section-faq', 'Sıkça Sorulan Sorular']
    ];
    for (const [sel, name] of map) {
      if (el.closest(sel)) return name;
    }
    return 'Sayfa İçi Buton';
  }

  function detectLabel(el) {
    if (el.dataset.trackLabel) return el.dataset.trackLabel;
    const aria = el.getAttribute('aria-label');
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const titleEl = el.querySelector && el.querySelector('.category-card-title');
    if (titleEl) return titleEl.textContent.trim();
    if (el.classList.contains('quick-book-btn') && el.dataset.eventName) {
      return `Masa Ayır – ${el.dataset.eventName}`;
    }
    return (aria || text).slice(0, 80);
  }

  function classifyClick(el) {
    if (el.dataset.track) return el.dataset.track;
    if (el.classList.contains('quick-book-btn')) return 'reservation_click';
    if (el.classList.contains('menu-category-card')) return 'menu';
    if (el.matches('.faq-question-btn, .faq-question')) return 'faq';

    const href = el.getAttribute('href');
    if (!href || el.tagName !== 'A') return null;

    if (href.startsWith('tel:')) return 'call';
    if (/wa\.me|whatsapp\.com/i.test(href)) return 'whatsapp';
    if (href.startsWith('mailto:')) return 'email';
    if (/instagram\.com|facebook\.com|youtube\.com|tiktok\.com|twitter\.com|x\.com\//i.test(href)) return 'social';
    if (/google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(href)) return 'map';
    if (/google\.[a-z.]+\/search|g\.page|search\.google/i.test(href)) return 'review';

    let url;
    try { url = new URL(href, window.location.href); } catch (e) { return null; }
    if (url.origin !== window.location.origin) return 'other';

    const path = decodeURIComponent(url.pathname).toLowerCase();
    const hash = url.hash.toLowerCase();
    if (hash === '#rezervasyon' || hash === '#pagereservationform' || path.startsWith('/rezervasyon')) return 'reservation_click';
    if (hash === '#menu' || path.startsWith('/menu') || path.startsWith('/menü')) return 'menu';
    if (hash === '#program' || path.startsWith('/etkinlik-takvimi') || path.startsWith('/program')) return 'program';
    if (el.closest('#cookie-banner')) return null;
    return 'page';
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button, .menu-category-card, [data-track]');
    if (!el) return;
    const type = classifyClick(el);
    if (!type) return;
    trackClick(type, detectSource(el), detectLabel(el));
  }, { passive: true });

  // ==========================================================
  // DİNAMİK SİTE YÖNETİMİ & API ENTEGRASYONLARI (Ultra-Hızlı Bootstrap)
  // ==========================================================

  // A. Genel Ayarları Sayfaya Uygula
  function applySettings(s) {
    if (!s) return;

    // Telefon Numaraları
    if (s.phone) {
      venuePhoneDisplay = s.phone;
      document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        el.href = `tel:+90${s.phone.replace(/[^0-9]/g, '').slice(-10)}`;
        if (el.innerText.includes('0530') || el.innerText.includes('05')) {
          el.innerText = s.phone;
        }
      });
    }

    // WhatsApp Bağlantıları
    if (s.whatsappDirect || s.whatsapp) {
      const cleanWa = (s.whatsappDirect || s.whatsapp || '').replace(/[^0-9]/g, '');
      if (cleanWa) venueWa = cleanWa;
      document.querySelectorAll('a[href*="wa.me"]:not([data-wa-fixed])').forEach(el => {
        const oldHref = el.getAttribute('href') || '';
        const matchText = oldHref.match(/text=([^&]+)/);
        const textParam = matchText ? `?text=${matchText[1]}` : '';
        el.href = `https://wa.me/${cleanWa}${textParam}`;
      });
    }

    // Adres
    if (s.address) {
      document.querySelectorAll('.footer-contact-details p, .mobile-menu-info p').forEach(p => {
        if (p.textContent.includes('Kordonboyu') || p.textContent.includes('Kartal')) {
          p.textContent = s.address;
        }
      });
    }

    // Çalışma Saatleri
    if (s.workingHours) {
      document.querySelectorAll('.footer-hours-badge, .mobile-menu-info p').forEach(el => {
        if (el.textContent.includes('Çarşamba') || el.textContent.includes('Pazartesi') || el.textContent.includes('19:30') || el.textContent.includes('20:00')) {
          el.textContent = s.workingHours;
        }
      });
    }
  }

  // B. Dinamik Hero Slider (Görsel Ön Yükleme & 0-Kasma)
  function initHeroSlider(sliders) {
    const heroSection = document.getElementById('hero');
    if (!heroSection || !sliders || sliders.length === 0) return;

    // Diğer slayt görsellerini sayfa tamamen yüklendikten sonra boşta ön yükle
    // (ilk açılışta görünür içerikle bant genişliği yarışmasın)
    const preloadRest = () => {
      const run = () => sliders.slice(1).forEach(s => {
        if (s.image) { const im = new Image(); im.decoding = 'async'; im.src = s.image; }
      });
      if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 4000 });
      else setTimeout(run, 2000);
    };
    if (document.readyState === 'complete') preloadRest();
    else window.addEventListener('load', preloadRest, { once: true });

    let currentSlide = 0;
    let slideTimer = null;

    function renderSlide(idx) {
      const s = sliders[idx];
      if (!s) return;

      const bgImg = heroSection.querySelector('.hero-background-wrap img');
      if (bgImg && s.image && bgImg.src !== s.image) {
        bgImg.src = s.image;
      }

      const eyebrow = heroSection.querySelector('.hero-eyebrow');
      if (eyebrow && s.subtitle) {
        eyebrow.textContent = s.subtitle;
      }

      const titleEl = heroSection.querySelector('.hero-title');
      if (titleEl && s.title) {
        titleEl.innerHTML = s.title.replace('&', '&<br>');
      }

      const descEls = heroSection.querySelectorAll('.hero-description');
      if (descEls.length > 0 && s.desc) {
        descEls[descEls.length - 1].textContent = s.desc;
      }

      const primaryBtn = heroSection.querySelector('.hero-actions-row .btn-primary-editorial');
      if (primaryBtn && s.btnText) {
        primaryBtn.textContent = s.btnText;
        if (s.btnLink) primaryBtn.href = s.btnLink;
      }

      const dots = heroSection.querySelectorAll('.slider-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
      });
    }

    if (sliders.length > 1) {
      let dotsWrap = heroSection.querySelector('.slider-dots-row');
      if (!dotsWrap) {
        dotsWrap = document.createElement('div');
        dotsWrap.className = 'slider-dots-row';
        const content = heroSection.querySelector('.hero-content');
        if (content) content.appendChild(dotsWrap);
      }

      dotsWrap.innerHTML = sliders.map((_, i) => `
        <button class="slider-dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Slide ${i+1}"></button>
      `).join('');

      dotsWrap.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'), 10);
          currentSlide = idx;
          renderSlide(currentSlide);
          resetTimer();
        });
      });

      function resetTimer() {
        if (slideTimer) clearInterval(slideTimer);
        slideTimer = setInterval(() => {
          // Hero ekranda değilse veya sekme gizliyse DOM'a dokunma
          if (heroHidden || document.hidden) return;
          currentSlide = (currentSlide + 1) % sliders.length;
          renderSlide(currentSlide);
        }, 7000);
      }

      let heroHidden = false;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          heroHidden = !entries[0].isIntersecting;
        }).observe(heroSection);
      }

      resetTimer();
    }

    renderSlide(0);
  }

  // C. Dinamik Sahne Programı & Konserler
  function renderEvents(events) {
    const scheduleContainer = document.querySelector('.editorial-schedule-list');
    if (!scheduleContainer || !events || events.length === 0) return;

    const isProgramPage = window.location.pathname.includes('/program') || window.location.pathname.includes('/etkinlik-takvimi');
    const eventsToRender = isProgramPage ? events : events.slice(0, 6);

    // Sayfadaki HTML zaten güncel veriyi içeriyorsa yeniden çizme (titreme/kasma önlenir)
    const domSig = Array.from(scheduleContainer.querySelectorAll('.schedule-item')).map(card => [
      card.querySelector('.schedule-date-main')?.textContent.trim(),
      card.querySelector('.schedule-artist-name')?.textContent.trim(),
      card.querySelector('.schedule-thumb-col img')?.getAttribute('src'),
      card.querySelector('.schedule-event-desc')?.textContent.trim() || ''
    ].join('|')).join('||');
    const dataSig = eventsToRender.map(ev => [
      ev.date, ev.artist || ev.title, ev.image, ev.description || ''
    ].join('|')).join('||');
    if (domSig === dataSig) { bindScheduleActions(scheduleContainer); return; }

    scheduleContainer.innerHTML = eventsToRender.map(ev => `
      <article class="schedule-item event-card" data-category="${ev.category || 'canli-muzik'}">
        <div class="schedule-date-col">
          <span class="schedule-date-main">${escapeHtml(ev.date)}</span>
          <span class="schedule-date-sub">⏰ ${escapeHtml(ev.time || '22:00')} Sahne</span>
        </div>
        <div class="schedule-thumb-col">
          <img src="${ev.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'}" alt="${escapeHtml(ev.artist || ev.title)}" width="600" height="400" loading="lazy" decoding="async">
        </div>
        <div class="schedule-artist-col">
          <h3 class="schedule-artist-name">${escapeHtml(ev.artist || ev.title)}</h3>
          <span class="schedule-event-title">${escapeHtml(ev.title)}</span>
          ${ev.description ? `<p class="schedule-event-desc">${escapeHtml(ev.description)}</p>` : ''}
        </div>
        <div class="schedule-meta-col">
          <span class="schedule-tag-text">${escapeHtml(ev.badge || 'Canlı Sahne')}</span>
          <span class="schedule-note-text">${escapeHtml(ev.ticketInfo || 'Rezervasyon Açıldı')}</span>
        </div>
        <div class="schedule-action-col">
          <button class="btn-primary-editorial quick-book-btn" data-event-name="${escapeHtml(ev.artist || ev.title)}" data-event-date="${escapeHtml(ev.date)}">
            ${ev.isSoldOut ? 'Tükendi' : 'Masa Ayır'}
          </button>
        </div>
      </article>
    `).join('');

    bindScheduleActions(scheduleContainer);
  }

  // "Masa Ayır" butonları: ana sayfada forma kaydırır, diğer sayfalarda rezervasyon sayfasına gider
  function bindScheduleActions(container) {
    container.querySelectorAll('.quick-book-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventName = btn.getAttribute('data-event-name');
        const eventDate = btn.getAttribute('data-event-date');
        const noteInput = document.getElementById('res-note') || document.getElementById('r-note');
        const reserveSection = document.getElementById('rezervasyon');

        if (reserveSection) {
          if (noteInput && eventName) noteInput.value = `Etkinlik Tercihi: ${eventName} (${eventDate || ''})`;
          reserveSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `/rezervasyon?event=${encodeURIComponent(eventName)}`;
        }
      });
    });
  }

  // D. Dinamik Menü Kategorileri (Anasayfada 3 Temel Kategori: Ana Yemek, Mezeler, İçkiler)
  function renderCategories(categories) {
    const grid = document.querySelector('.menu-categories-grid');
    if (!grid || !categories || categories.length === 0) return;

    // Anasayfada 3 temel kategori sunulur: Ana Yemek, Mezeler, İçkiler
    const selected = [];
    const anaYemek = categories.find(c => (c.name || '').toLowerCase().includes('ana yemek')) || categories[0];
    const mezeler = categories.find(c => (c.name || '').toLowerCase().includes('meze')) || categories[1];
    const ickiler = categories.find(c => (c.name || '').toLowerCase().includes('içki') || (c.name || '').toLowerCase().includes('icki') || (c.name || '').toLowerCase().includes('kokteyl')) || categories[2];

    if (anaYemek) selected.push(anaYemek);
    if (mezeler && !selected.includes(mezeler)) selected.push(mezeler);
    if (ickiler && !selected.includes(ickiler)) selected.push(ickiler);

    const catsToRender = selected.length === 3 ? selected : categories.slice(0, 3);

    const domSig = Array.from(grid.querySelectorAll('.menu-category-card')).map(c =>
      `${c.querySelector('.category-card-title')?.textContent.trim()}|${c.querySelector('img')?.getAttribute('src')}`
    ).join('||');
    const dataSig = catsToRender.map(c => `${c.name}|${c.image}`).join('||');
    if (domSig === dataSig) return;

    grid.innerHTML = catsToRender.map(cat => `
      <div class="menu-category-card" onclick="window.location.href='/menu#${cat.id}'" style="cursor: pointer;">
        <div class="category-card-img-wrap">
          <img src="${cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80'}" alt="${escapeHtml(cat.name)}" loading="lazy" decoding="async">
          <div class="category-card-overlay"></div>
        </div>
        <div class="category-card-content">
          <span class="category-card-tag">${escapeHtml(cat.tag || 'ÖZEL SEÇKİ')}</span>
          <h3 class="category-card-title">${escapeHtml(cat.name)}</h3>
          <p class="category-card-desc">${escapeHtml(cat.desc || '')}</p>
        </div>
      </div>
    `).join('');
  }

  // E. Menü Sayfası Detayları (Sadece menu.html açıldığında çalışır)
  async function loadDynamicMenuDetails() {
    const isMenuPage = window.location.pathname.includes('/menu');
    const dynamicMenuContainer = document.getElementById('dynamic-menu-container');
    if (!isMenuPage || !dynamicMenuContainer) return;

    try {
      const res = await fetch('/api/menu');
      if (!res.ok) return;
      const data = await res.json();
      const categories = data.categories || [];

      dynamicMenuContainer.innerHTML = categories.map(cat => `
        <div class="menu-category-section" id="${cat.id}" style="margin-bottom: 50px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-hairline); padding-bottom: 12px; margin-bottom: 24px;">
            <div>
              <span class="eyebrow">${escapeHtml(cat.tag || 'LEZZET SEÇKİSİ')}</span>
              <h2 style="font-family: var(--font-serif); font-size: 28px; color: var(--text-primary); margin-top: 4px;">${escapeHtml(cat.name)}</h2>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
            ${(cat.items || []).map(item => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-hairline); border-radius: 8px; padding: 18px; display: flex; gap: 14px; align-items: center;">
                ${item.image ? `<img src="${item.image}" style="width: 70px; height: 70px; border-radius: 6px; object-fit: cover;" alt="">` : ''}
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <h4 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${escapeHtml(item.name)}</h4>
                    <span style="font-size: 13px; color: var(--accent-gold); font-weight: 700;">${escapeHtml(item.price || '')}</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${escapeHtml(item.desc || '')}</p>
                  ${item.badge ? `<span style="font-size: 10px; color: var(--accent-gold); border: 1px solid var(--border-hairline); border-radius: 4px; padding: 2px 6px; display: inline-block; margin-top: 6px;">${escapeHtml(item.badge)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('Menü detayları yüklenemedi:', e);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Unified Single Bootstrap Loader (1 istek ile tüm verileri al)
  async function loadBootstrap() {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) applySettings(data.settings);
        if (data.sliders) initHeroSlider(data.sliders);
        if (data.events) renderEvents(data.events);
        if (data.categories) renderCategories(data.categories);
      }
    } catch (e) {
      console.warn('Bootstrap yüklenemedi, bağımsız isteklere geçiliyor:', e);
    }

    // Menü sayfası açıksa menü detaylarını yükle
    loadDynamicMenuDetails();
  }

  loadBootstrap();
});
