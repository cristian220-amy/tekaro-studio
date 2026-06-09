/* ============================================================
   Tekaro Studio — script.js
   Funcționalități interactive suplimentare
   ============================================================ */

/* ===== LOADING SCREEN ===== */
(function () {
  var loader = document.getElementById('pageLoader');
  if (!loader) return;
  function hide() {
    loader.classList.add('loader--hidden');
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 650);
  }
  if (document.readyState === 'complete') {
    setTimeout(hide, 350);
  } else {
    window.addEventListener('load', function () { setTimeout(hide, 350); });
    setTimeout(hide, 3000);
  }
}());

/* ===== SCROLL PROGRESS BAR ===== */
(function () {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}());

/* ===== BACK TO TOP ===== */
(function () {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('btt--visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

/* ===== BUTON TELEFON FLOTANT ===== */
(function () {
  var float = document.querySelector('.wa-float');
  if (!float || float.querySelector('.wa-btn--phone')) return;
  var phone = document.createElement('a');
  phone.className = 'wa-btn wa-btn--phone';
  phone.href = 'tel:+40736844319';
  phone.setAttribute('aria-label', 'Sună acum');
  phone.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.4 21 3 13.6 3 4.5a1 1 0 011-1H7.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z"/></svg>';
  float.insertBefore(phone, float.firstChild);
}());

/* ===== COOKIE CONSENT (GDPR) ===== */
(function () {
  var banner = document.getElementById('cookieBanner');
  if (!banner) return;

  var accept = document.getElementById('cookieAccept');
  var decline = document.getElementById('cookieDecline');

  function show() { banner.classList.add('cookie--visible'); }
  function hide() { banner.classList.remove('cookie--visible'); }

  if (accept) accept.addEventListener('click', function () {
    localStorage.setItem('ts-cookies', '1');
    hide();
  });
  if (decline) decline.addEventListener('click', function () {
    localStorage.setItem('ts-cookies', '0');
    hide();
  });

  // Afișare automată la prima vizită
  if (!localStorage.getItem('ts-cookies')) {
    setTimeout(show, 800);
  }

  // Link "Setări cookie-uri" în footer — permite reschimbarea acordului oricând (GDPR)
  var reopen = document.getElementById('cookieSettings');
  if (!reopen) {
    var host = document.querySelector('.footer__bottom .container') ||
               document.querySelector('.footer__bottom') ||
               document.querySelector('.footer');
    if (host) {
      reopen = document.createElement('button');
      reopen.id = 'cookieSettings';
      reopen.type = 'button';
      reopen.className = 'cookie-reopen';
      reopen.textContent = 'Setări cookie-uri';
      host.appendChild(reopen);
    }
  }
  if (reopen) reopen.addEventListener('click', function (e) {
    e.preventDefault();
    show();
  });
}());

/* ===== FORM VALIDATION ===== */
(function () {
  var form = document.querySelector('.contact__form');
  if (!form) return;

  function setError(input, msg) {
    var g = input.closest('.form__group');
    g.classList.add('has-error');
    var e = g.querySelector('.form__err');
    if (!e) {
      e = document.createElement('span');
      e.className = 'form__err';
      g.appendChild(e);
    }
    e.textContent = msg;
  }

  function clearErr(input) {
    var g = input.closest('.form__group');
    g.classList.remove('has-error');
    var e = g.querySelector('.form__err');
    if (e) e.textContent = '';
  }

  function validate() {
    var ok    = true;
    var name  = form.querySelector('#f-name');
    var phone = form.querySelector('#f-phone');
    var loc   = form.querySelector('#f-loc');

    [name, phone, loc].forEach(clearErr);

    if (!name.value.trim() || name.value.trim().length < 2) {
      setError(name, 'Introduceți un nume valid (minim 2 caractere).'); ok = false;
    }
    var ph = phone.value.replace(/\s/g, '');
    if (!ph || !/^[\d\+\-]{9,15}$/.test(ph)) {
      setError(phone, 'Număr de telefon invalid (ex: 0736 844 319).'); ok = false;
    }
    if (!loc.value) {
      setError(loc, 'Selectați o locație preferată.'); ok = false;
    }
    return ok;
  }

  /* Capture phase — rulează înainte de handleForm inline */
  form.addEventListener('submit', function (e) {
    if (!validate()) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input',  function () { clearErr(el); });
    el.addEventListener('change', function () { clearErr(el); });
  });

  /* Auto-formatare telefon: 07XX XXX XXX */
  var phoneInput = form.querySelector('#f-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      var out = [];
      if (digits.length > 0) out.push(digits.slice(0, 4));
      if (digits.length > 4) out.push(digits.slice(4, 7));
      if (digits.length > 7) out.push(digits.slice(7, 10));
      phoneInput.value = out.join(' ');
    });
  }
}());

/* ===== GALLERY LIGHTBOX ===== */
(function () {
  var modal = document.getElementById('galleryModal');
  if (!modal) return;

  var modalImg  = modal.querySelector('.glb-img');
  var modalCap  = modal.querySelector('.glb-caption');
  var closeBtn  = modal.querySelector('.glb-close');
  var prevBtn   = modal.querySelector('.glb-prev');
  var nextBtn   = modal.querySelector('.glb-next');
  var items     = [];
  var current   = 0;

  document.querySelectorAll('.gal-item').forEach(function (item, i) {
    items.push({
      src:     item.dataset.src     || '',
      caption: item.dataset.caption || ''
    });
    item.addEventListener('click', function () { open(i); });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', item.dataset.caption || ('Fotografie ' + (i + 1)));
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  function open(i) {
    if (!items.length) return;
    current = i;
    show(current);
    modal.classList.add('glb--open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('glb--open');
    document.body.style.overflow = '';
  }

  function show(i) {
    current = (i + items.length) % items.length;
    /* Dacă e src real, afișăm img; altfel placeholder */
    if (items[current].src) {
      modalImg.src = items[current].src;
      modalImg.style.display = 'block';
    } else {
      modalImg.style.display = 'none';
    }
    modalCap.textContent = items[current].caption;
    /* Counter */
    var counter = modal.querySelector('.glb-counter');
    if (counter) counter.textContent = (current + 1) + ' / ' + items.length;
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn)  prevBtn.addEventListener('click',  function () { show(current - 1); });
  if (nextBtn)  nextBtn.addEventListener('click',  function () { show(current + 1); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('glb--open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  /* Touch swipe în modal */
  var touchStartX = 0;
  modal.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? show(current + 1) : show(current - 1); }
  }, { passive: true });
}());

/* ===== PROCES — animație la pasul activ ===== */
(function () {
  var steps = document.querySelectorAll('.proc-step');
  if (!steps.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('proc-step--visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  steps.forEach(function (s) { io.observe(s); });
}());


/* ===== FAQ — navigare cu tastatura ===== */
(function () {
  var faqList = document.querySelector('.faq__list');
  if (!faqList) return;
  faqList.addEventListener('keydown', function (e) {
    var btns = Array.from(faqList.querySelectorAll('.faq-item__q'));
    var idx  = btns.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = btns[idx + 1];
      if (next) next.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = btns[idx - 1];
      if (prev) prev.focus();
    }
    if (e.key === 'Home') { e.preventDefault(); btns[0].focus(); }
    if (e.key === 'End')  { e.preventDefault(); btns[btns.length - 1].focus(); }
  });
}());

/* ===== TESTIMONIALE — dots indicator (mobile) ===== */
(function () {
  var grid = document.querySelector('.testi__grid');
  if (!grid) return;

  function buildDots() {
    if (window.innerWidth > 860) return;
    var cards = grid.querySelectorAll('.testi-card');
    if (cards.length < 2) return;
    var existing = document.querySelector('.testi-dots');
    if (existing) existing.remove();
    var wrap = document.createElement('div');
    wrap.className = 'testi-dots';
    wrap.setAttribute('aria-hidden', 'true');
    cards.forEach(function (_, i) {
      var dot = document.createElement('span');
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', function () {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
      wrap.appendChild(dot);
    });
    grid.parentNode.appendChild(wrap);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = Array.from(cards).indexOf(e.target);
        wrap.querySelectorAll('.testi-dot').forEach(function (d, j) {
          d.classList.toggle('active', j === i);
        });
      });
    }, { threshold: 0.6, root: grid });
    cards.forEach(function (c) { io.observe(c); });
  }

  buildDots();
  window.addEventListener('resize', buildDots);
}());

/* ===== NAV active section highlight ===== */
(function () {
  var links = document.querySelectorAll('.nav__links a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var sections = [];
  links.forEach(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) sections.push({ el: el, a: a });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('nav__link--active'); });
        var match = sections.find(function (s) { return s.el === e.target; });
        if (match) match.a.classList.add('nav__link--active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function (s) { io.observe(s.el); });
}());

/* ===== REVEAL ANIMATIONS (IntersectionObserver) ===== */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
}());

/* ===== SKILL BARS ANIMATION ===== */
(function () {
  var bars = document.querySelectorAll('.skill-bar__fill');
  if (!bars.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('animated');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(function (b) { io.observe(b); });
}());

/* ===== LAZY LOAD imagini cu data-src ===== */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src;
        e.target.removeAttribute('data-src');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(function (img) { io.observe(img); });
}());

/* ===== HERO PARALLAX ===== */
(function () {
  var hero = document.querySelector('.hero');
  var bg   = document.querySelector('.hero__bg');
  var glow = document.querySelector('.hero__glow');
  if (!hero || !bg) return;
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) {
          bg.style.transform   = 'translateY(' + (y * 0.28) + 'px)';
          if (glow) glow.style.transform = 'translateY(' + (y * 0.14) + 'px)';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}());
