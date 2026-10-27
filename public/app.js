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

  // 5. RESERVATION FORM SUBMISSION
  const reservationForm = document.getElementById('reservation-form');

  if (reservationForm) {
    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = reservationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Rezervasyon Talebini Gönder';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerText = 'Rezervasyon İletiliyor...';
      }

      const nameInput = document.getElementById('res-name') || document.getElementById('r-name');
      const phoneInput = document.getElementById('res-phone') || document.getElementById('r-phone');
      const dateInput = document.getElementById('res-date') || document.getElementById('r-date');
      const guestsInput = document.getElementById('res-guests') || document.getElementById('r-guests');
      const noteInput = document.getElementById('res-note') || document.getElementById('r-note');
      const checkedTable = document.querySelector('input[name="table_type"]:checked, input[name="tableType"]:checked');

      const payload = {
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        date: dateInput ? dateInput.value : '',
        guests: guestsInput ? guestsInput.value : '2 Kişi',
        tableType: checkedTable ? checkedTable.value : 'Standart Meyhane Masası',
        note: noteInput ? noteInput.value.trim() : ''
      };

      try {
        const response = await fetch('/api/reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const feedback = document.getElementById('resStatusMsg') || reservationForm.querySelector('.form-feedback');
          if (feedback) {
            feedback.className = 'form-feedback success';
            feedback.style.display = 'block';
            feedback.innerHTML = `
              <strong>✓ Rezervasyon Talebiniz Başarıyla Alındı! (Kod: ${result.id || 'RES-' + Math.floor(Math.random()*9000+1000)})</strong><br>
              Talebiniz ekibimize iletilmiştir. Yetkilimiz masa onayınızı iletmek üzere 15 dakika içinde <strong>${escapeHtml(payload.phone)}</strong> numarasından sizinle iletişime geçecektir.<br>
              <a href="https://wa.me/905308664321?text=Merhaba,%20${result.id}%20numaralı%20rezervasyonum%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener" style="display: inline-block; margin-top: 10px; color: #128C7E; font-weight: 700; text-decoration: underline;">
                WhatsApp Üzerinden Hızlı Teyit Al (0530 866 43 21) ↗
              </a>
            `;
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            alert(`✓ Rezervasyon Talebiniz Alındı!\nKod: ${result.id}\nEkibimiz ${payload.phone} üzerinden sizinle iletişime geçecektir.`);
          }
          reservationForm.reset();
        } else {
          throw new Error(result.error || 'Rezervasyon iletilirken bir hata oluştu.');
        }
      } catch (err) {
        alert(`✕ Rezervasyon Gönderilemedi: ${err.message}\nLütfen doğrudan 0530 527 91 77 veya WhatsApp ile iletişime geçiniz.`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerText = originalText;
        }
      }
    });
  }

  // 6. CONVERSION & CLICK TRACKING
  function trackClick(type, source) {
    // İstatistik yalnızca ziyaretçi analiz çerezlerine onay verdiyse gönderilir
    const consent = getConsent();
    if (!consent || !consent.analytics) return;
    try {
      const payload = JSON.stringify({
        type,
        source,
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

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';

    let type = null;
    if (href.startsWith('tel:')) {
      type = 'call';
    } else if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      type = 'whatsapp';
    }

    if (type) {
      let source = 'Sayfa İçi Buton';
      if (link.closest('#mobile-bottom-bar, .mobile-bottom-bar')) {
        source = 'Mobil Sabit Alt Bar';
      } else if (link.closest('header, #header, .header-actions')) {
        source = 'Üst Menü (Header)';
      } else if (link.closest('footer, .site-footer')) {
        source = 'Alt Bilgi (Footer)';
      } else if (link.closest('#hero, .hero-editorial')) {
        source = 'Hero Alanı';
      } else if (link.closest('.schedule-item, .event-card')) {
        source = 'Etkinlik Kartı';
      } else if (link.closest('.floating-whatsapp')) {
        source = 'Sabit WhatsApp Butonu';
      }
      trackClick(type, source);
    }
  });

  // ==========================================================
  // DİNAMİK SİTE YÖNETİMİ & API ENTEGRASYONLARI (Ultra-Hızlı Bootstrap)
  // ==========================================================

  // A. Genel Ayarları Sayfaya Uygula
  function applySettings(s) {
    if (!s) return;

    // Telefon Numaraları
    if (s.phone) {
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
      document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
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
