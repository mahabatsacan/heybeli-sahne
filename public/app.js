// ==========================================================
// HEYBELİ SAHNE - DİNAMİK CLIENT SCRIPT (v2.0 CMS)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
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
  const resModal = document.getElementById('reservation-modal');
  const modalDetails = document.getElementById('modal-details');
  const modalCloseBtn = document.getElementById('modal-close-btn');

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
          if (resModal) {
            if (modalDetails) {
              modalDetails.innerHTML = `
                <div style="font-size: 13px; line-height: 1.8; color: var(--text-primary);">
                  <p><strong>Rezervasyon Kodu:</strong> <span style="color: var(--accent-gold); font-weight: 700;">${result.id || 'RES-' + Math.floor(Math.random()*9000+1000)}</span></p>
                  <p><strong>İsim:</strong> ${escapeHtml(payload.name)}</p>
                  <p><strong>Tarih & Kişi:</strong> ${escapeHtml(payload.date)} (${escapeHtml(payload.guests)})</p>
                  <p><strong>Masa Tercihi:</strong> ${escapeHtml(payload.tableType)}</p>
                </div>
              `;
            }
            resModal.classList.add('active');
            resModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
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

  if (modalCloseBtn && resModal) {
    modalCloseBtn.addEventListener('click', () => {
      resModal.classList.remove('active');
      resModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  if (resModal) {
    resModal.addEventListener('click', (e) => {
      if (e.target === resModal) {
        resModal.classList.remove('active');
        resModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // 6. CONVERSION & CLICK TRACKING
  function trackClick(type, source) {
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
        if (el.textContent.includes('Çarşamba') || el.textContent.includes('19:30') || el.textContent.includes('20:00')) {
          el.textContent = s.workingHours;
        }
      });
    }
  }

  // B. Dinamik Hero Slider (Görsel Ön Yükleme & 0-Kasma)
  function initHeroSlider(sliders) {
    const heroSection = document.getElementById('hero');
    if (!heroSection || !sliders || sliders.length === 0) return;

    // Arka plan görsellerini belleğe ön yükle (kasma ve gecikmeyi önler)
    sliders.forEach(s => {
      if (s.image) {
        const preImg = new Image();
        preImg.src = s.image;
      }
    });

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
          currentSlide = (currentSlide + 1) % sliders.length;
          renderSlide(currentSlide);
        }, 7000);
      }

      resetTimer();
    }

    renderSlide(0);
  }

  // C. Dinamik Sahne Programı & Konserler
  function renderEvents(events) {
    const scheduleContainer = document.querySelector('.editorial-schedule-list');
    if (!scheduleContainer || !events || events.length === 0) return;

    scheduleContainer.innerHTML = events.map(ev => `
      <article class="schedule-item event-card" data-category="${ev.category || 'canli-muzik'}">
        <div class="schedule-date-col">
          <span class="schedule-date-main">${escapeHtml(ev.date)}</span>
          <span class="schedule-date-sub">⏰ ${escapeHtml(ev.time || '22:00')} Sahne</span>
        </div>
        <div class="schedule-thumb-col">
          <img src="${ev.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'}" alt="${escapeHtml(ev.title)}" width="600" height="400" loading="lazy" decoding="async">
        </div>
        <div class="schedule-artist-col">
          <h3 class="schedule-artist-name">${escapeHtml(ev.artist || ev.title)}</h3>
          <span class="schedule-event-title">${escapeHtml(ev.title)}</span>
        </div>
        <div class="schedule-meta-col">
          <span class="schedule-tag-text">${escapeHtml(ev.badge || 'Gala Gecesi')}</span>
          <span class="schedule-note-text">${escapeHtml(ev.ticketInfo || 'Rezervasyon Açıldı')}</span>
        </div>
        <div class="schedule-action-col">
          <button class="btn-primary-editorial quick-book-btn" data-event-name="${escapeHtml(ev.artist || ev.title)}" data-event-date="${escapeHtml(ev.date)}">
            ${ev.isSoldOut ? 'Tükendi' : 'Masa Ayır'}
          </button>
        </div>
      </article>
    `).join('');

    scheduleContainer.querySelectorAll('.quick-book-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventName = btn.getAttribute('data-event-name');
        const eventDate = btn.getAttribute('data-event-date');
        const noteInput = document.getElementById('res-note') || document.getElementById('r-note');
        const dateInput = document.getElementById('res-date') || document.getElementById('r-date');

        if (noteInput && eventName) {
          noteInput.value = `Etkinlik Tercihi: ${eventName}`;
        }
        if (dateInput && eventDate) {
          dateInput.value = eventDate;
        }

        const reserveSection = document.getElementById('rezervasyon');
        if (reserveSection) {
          reserveSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `/rezervasyon?event=${encodeURIComponent(eventName)}`;
        }
      });
    });

    document.querySelectorAll('.filter-btn, .schedule-filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn, .schedule-filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');
        document.querySelectorAll('.event-card, .schedule-item').forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // D. Dinamik Menü Kategorileri
  function renderCategories(categories) {
    const grid = document.querySelector('.menu-categories-grid');
    if (!grid || !categories || categories.length === 0) return;

    grid.innerHTML = categories.map(cat => `
      <div class="menu-category-card" onclick="window.location.href='/menu#${cat.id}'" style="cursor: pointer;">
        <div class="category-card-img-wrap">
          <img src="${cat.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80'}" alt="${escapeHtml(cat.name)}" loading="lazy">
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
