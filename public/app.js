// ==========================================================
// GALLERY LIGHTBOX MODAL HANDLERS (Defined globally at top)
// ==========================================================
const galleryImages = [
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85", title: "Ana Sahne & Oturma Düzeni" },
  { src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85", title: "Canlı Konser Anı" },
  { src: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85", title: "Usta Meze Çeşitleri & Sofra" },
  { src: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=85", title: "Özel VIP Loca Masaları" },
  { src: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=85", title: "Şefin Sıcak Mezeleri & Güveç Karides" },
  { src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85", title: "Dost Sohbetleri & Müzik Ahengi" }
];

let currentLightboxIndex = 0;

window.openLightbox = function(index) {
  currentLightboxIndex = index;
  const modal = document.getElementById('gallery-lightbox-modal');
  const img = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  if (modal && img && galleryImages[index]) {
    img.src = galleryImages[index].src;
    if (caption) caption.textContent = galleryImages[index].title;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('gallery-lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

window.nextLightboxImage = function() {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
  window.openLightbox(currentLightboxIndex);
};

window.prevLightboxImage = function() {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  window.openLightbox(currentLightboxIndex);
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeLightbox();
  if (e.key === 'ArrowRight') window.nextLightboxImage();
  if (e.key === 'ArrowLeft') window.prevLightboxImage();
});

document.addEventListener('DOMContentLoaded', () => {
  // Bind gallery cells dynamically
  document.querySelectorAll('.gallery-cell').forEach((cell, idx) => {
    cell.addEventListener('click', () => {
      window.openLightbox(idx);
    });
  });

  // 1. STICKY HEADER SCROLL EFFECT
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header && header.classList.add('scrolled');
    } else {
      header && header.classList.remove('scrolled');
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

  // 3. EVENTS CATEGORY FILTERS (Tümü, Hafta Sonu, Galalar, Matine, Fasıl)
  const eventFilters = document.querySelectorAll('.filter-btn, .schedule-filter-tab');
  const eventCards = document.querySelectorAll('.event-card, .schedule-item');

  if (eventFilters.length > 0 && eventCards.length > 0) {
    eventFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        eventFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');

        eventCards.forEach(card => {
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

  // 4. MENU VIEW SWITCHER (Fiks Menüler vs Alakart)
  const menuSwitcherBtns = document.querySelectorAll('.menu-switcher-btn, .menu-tab-btn');
  const menuTabContents = document.querySelectorAll('.menu-tab-content');
  const fixSection = document.getElementById('fix-menu-section');
  const alacarteSection = document.getElementById('alacarte-section');

  if (menuSwitcherBtns.length > 0) {
    menuSwitcherBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        menuSwitcherBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tabKey = btn.getAttribute('data-tab') || btn.getAttribute('data-target');

        if (tabKey === 'prixfixe' || tabKey === 'fix') {
          menuTabContents.forEach(c => c.classList.remove('active'));
          const pTarget = document.getElementById('tab-prixfixe');
          if (pTarget) pTarget.classList.add('active');
          if (fixSection) fixSection.style.display = '';
          if (alacarteSection) alacarteSection.style.display = 'none';
        } else if (tabKey === 'alacarte') {
          menuTabContents.forEach(c => c.classList.remove('active'));
          const aTarget = document.getElementById('tab-alacarte');
          if (aTarget) aTarget.classList.add('active');
          if (fixSection) fixSection.style.display = 'none';
          if (alacarteSection) alacarteSection.style.display = '';
        }
      });
    });
  }

  // 5. QUICK BOOK BUTTONS (Pre-fills event in reservation form)
  document.querySelectorAll('.quick-book-btn, .btn-book-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventName = btn.getAttribute('data-event-name') || btn.getAttribute('data-event');
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
      }
    });
  });

  // 6. TABLE OPTION RADIO SELECTOR CARDS
  document.querySelectorAll('.table-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.table-option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // 7. SIKÇA SORULAN SORULAR (FAQ ACCORDION)
  document.querySelectorAll('.faq-question-btn, .faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');

      // Close other items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const qBtn = i.querySelector('.faq-question-btn, .faq-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 8. RESERVATION FORM SUBMISSION (AJAX to /api/reservation)
  const reservationForm = document.getElementById('reservation-form');
  const resModal = document.getElementById('reservation-modal');
  const modalDetails = document.getElementById('modal-details');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (reservationForm) {
    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = reservationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Gönder';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerText = 'Rezervasyon Gönderiliyor...';
      }

      // Collect data safely
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
        guests: guestsInput ? guestsInput.value : '4 Kişi',
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
                  <p><strong>İsim:</strong> ${payload.name}</p>
                  <p><strong>Tarih & Kişi:</strong> ${payload.date} (${payload.guests})</p>
                  <p><strong>Masa Türü:</strong> ${payload.tableType}</p>
                </div>
              `;
            }
            resModal.classList.add('active');
            resModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
          } else {
            alert(`✓ Rezervasyon Talebiniz Alındı!\nKod: ${result.id}\nEkibimiz en kısa sürede sizinle iletişime geçecektir.`);
          }
          reservationForm.reset();
        } else {
          throw new Error(result.error || 'Rezervasyon iletilirken bir hata oluştu.');
        }
      } catch (err) {
        alert(`✕ Rezervasyon Gönderilemedi: ${err.message}\nLütfen doğrudan telefon veya WhatsApp ile iletişime geçiniz.`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerText = originalText;
        }
      }
    });
  }

  // Close reservation modal
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

  // 9. CONVERSION & CLICK TRACKING (tel: and wa.me)
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
    } catch (err) {
      // Non-blocking silently
    }
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
      } else if (link.closest('#menu, .section-menu-editorial')) {
        source = 'Menü Bölümü';
      }
      trackClick(type, source);
    }
  });
});
