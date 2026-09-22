/* ============================================================
   Liwan Lake Park Guide — app.js (Vanilla ES6+, no frameworks)
   Modules:
     1. Theme      — system-aware dark mode + manual toggle
     2. NavDrawer  — accessible mobile drawer (auto-built from .nav)
     3. Hotspots   — interactive map tooltip cards
     4. Lightbox   — gallery viewer with prev/next + keyboard
     5. LazyMedia  — IntersectionObserver fade-in fallback
   The script progressively enhances ANY page containing the
   existing markup patterns, so /zh and /ru pages get the same
   behavior with zero HTML changes (translate I18N only).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 0. i18n strings ----------------------------------
     HOW TO LOCALIZE: detect page language from <html lang> and
     serve the matching dictionary. To add a language, copy the
     "en" block, translate the values, and add its key below.    */
  var I18N = {
    en: {
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      themeToDark: 'Switch to dark mode',
      themeToLight: 'Switch to light mode',
      mapTitle: 'Park map',
      hotspotClose: 'Close spot details',
      galleryLabel: 'Photo gallery',
      lightboxClose: 'Close viewer',
      lightboxPrev: 'Previous photo',
      lightboxNext: 'Next photo',
      photoCounter: 'Photo {current} of {total}'
    },
    zh: {
      menuOpen: '打开菜单',
      menuClose: '关闭菜单',
      themeToDark: '切换到深色模式',
      themeToLight: '切换到浅色模式',
      mapTitle: '公园地图',
      hotspotClose: '关闭详情',
      galleryLabel: '照片画廊',
      lightboxClose: '关闭查看器',
      lightboxPrev: '上一张',
      lightboxNext: '下一张',
      photoCounter: '第 {current} / {total} 张'
    },
    ru: {
      menuOpen: 'Открыть меню',
      menuClose: 'Закрыть меню',
      themeToDark: 'Включить тёмную тему',
      themeToLight: 'Включить светлую тему',
      mapTitle: 'Карта парка',
      hotspotClose: 'Закрыть описание',
      galleryLabel: 'Фотогалерея',
      lightboxClose: 'Закрыть просмотр',
      lightboxPrev: 'Предыдущее фото',
      lightboxNext: 'Следующее фото',
      photoCounter: 'Фото {current} из {total}'
    }
  };
  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var T = I18N[lang] || I18N.en;

  function t(key, vars) {
    var s = T[key] || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace('{' + k + '}', vars[k]);
      });
    }
    return s;
  }

  /* ---------- 1. Theme (dark / light / system) -----------------
     Stored choice wins; otherwise follow prefers-color-scheme.
     A tiny inline script in <head> applies the theme pre-paint;
     this module keeps the toggle button in sync afterwards.     */
  var THEME_KEY = 'llp-theme';

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#241f19' : '#faf7f2');
  }
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || systemTheme();
  }

  // React to OS-level changes when the user has not chosen manually.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(systemTheme());
  });

  function buildThemeToggle(header) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-live', 'polite');
    function sync() {
      var dark = currentTheme() === 'dark';
      btn.setAttribute('aria-label', dark ? t('themeToLight') : t('themeToDark'));
      btn.setAttribute('aria-pressed', String(dark));
      btn.innerHTML = dark
        ? '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.5" y1="4.5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19.5" y2="19.5"/><line x1="4.5" y1="19.5" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19.5" y2="4.5"/></g></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20.6 14.4A8.8 8.8 0 0 1 9.6 3.4a.7.7 0 0 0-.9-.9 10.2 10.2 0 1 0 12.8 12.8.7.7 0 0 0-.9-.9Z"/></svg>';
    }
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      sync();
    });
    sync();
    header.appendChild(btn);
  }

  /* ---------- 2. Mobile navigation drawer ----------------------
     CRITICAL FIX: the old CSS hid .nav below 640px with no
     replacement. Here we auto-build an accessible drawer:
       - hamburger button with aria-expanded / aria-controls
       - focus moves into drawer on open, back to button on close
       - body scroll locked while open
       - ESC key and backdrop click close it                     */
  function buildDrawer(header) {
    var nav = header.querySelector('.nav');
    if (!nav) return;

    // Hamburger button (injected, so old pages get it for free)
    var burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'nav-burger';
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'mobile-drawer');
    burger.setAttribute('aria-label', t('menuOpen'));
    burger.innerHTML = '<span></span><span></span><span></span>';
    header.appendChild(burger);

    // Drawer panel = cloned nav links (desktop nav stays untouched)
    var drawer = document.createElement('nav');
    drawer.id = 'mobile-drawer';
    drawer.className = 'drawer';
    drawer.setAttribute('aria-label', t('menuOpen'));
    drawer.hidden = true;
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      var link = a.cloneNode(true);
      link.setAttribute('tabindex', '-1');
      drawer.appendChild(link);
    });

    var backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.hidden = true;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      drawer.hidden = false;
      backdrop.hidden = false;
      // force reflow so the CSS transition runs
      void drawer.offsetWidth;
      document.documentElement.classList.add('drawer-open'); // locks scroll (CSS)
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', t('menuClose'));
      burger.classList.add('is-open');
      var first = drawer.querySelector('a');
      drawer.querySelectorAll('a').forEach(function (a) { a.removeAttribute('tabindex'); });
      if (first) first.focus();
      document.addEventListener('keydown', onKeydown);
    }
    function close() {
      document.documentElement.classList.remove('drawer-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', t('menuOpen'));
      burger.classList.remove('is-open');
      document.removeEventListener('keydown', onKeydown);
      // wait for the slide-out transition, then hide
      window.setTimeout(function () {
        drawer.hidden = true;
        backdrop.hidden = true;
      }, 260);
      drawer.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
      if (lastFocused) lastFocused.focus();
    }
    function onKeydown(e) { if (e.key === 'Escape') close(); }

    burger.addEventListener('click', function () {
      burger.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    backdrop.addEventListener('click', close);
    // auto-close if viewport grows back to desktop while open
    window.matchMedia('(min-width: 641px)').addEventListener('change', function (mq) {
      if (mq.matches && burger.getAttribute('aria-expanded') === 'true') close();
    });
  }

  /* ---------- 3. Map hotspots ----------------------------------
     Markup contract (see index.html):
       <div class="park-map">
         <button class="hotspot" style="--x:30%;--y:40%"
                 data-spot-title="..." data-spot-desc="...">…</button>
       </div>                                                    */
  function initHotspots() {
    var map = document.querySelector('.park-map');
    if (!map) return;

    var card = document.createElement('div');
    card.className = 'hotspot-card';
    card.setAttribute('role', 'dialog');
    card.hidden = true;
    map.appendChild(card);

    var activeSpot = null;

    function show(spot) {
      activeSpot = spot;
      card.innerHTML =
        '<button type="button" class="hotspot-close" aria-label="' + t('hotspotClose') + '">×</button>' +
        '<h3>' + spot.getAttribute('data-spot-title') + '</h3>' +
        '<p>' + spot.getAttribute('data-spot-desc') + '</p>';
      // position near the hotspot, flipped into the map bounds
      var x = parseFloat(spot.style.getPropertyValue('--x'));
      var y = parseFloat(spot.style.getPropertyValue('--y'));
      card.style.left = Math.min(Math.max(x, 18), 82) + '%';
      card.style.top = Math.min(Math.max(y, 20), 78) + '%';
      card.hidden = false;
      spot.setAttribute('aria-expanded', 'true');
      card.querySelector('.hotspot-close').addEventListener('click', hide);
    }
    function hide() {
      if (activeSpot) activeSpot.setAttribute('aria-expanded', 'false');
      activeSpot = null;
      card.hidden = true;
    }

    map.querySelectorAll('.hotspot').forEach(function (spot) {
      spot.setAttribute('aria-expanded', 'false');
      spot.addEventListener('click', function (e) {
        e.stopPropagation();
        activeSpot === spot ? hide() : show(spot);
      });
    });
    map.addEventListener('click', hide);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !card.hidden) hide();
    });
  }

  /* ---------- 4. Lightbox gallery ------------------------------
     Any <img> inside .gallery becomes clickable.                */
  function initLightbox() {
    var gallery = document.querySelector('.gallery');
    if (!gallery) return;

    var imgs = Array.prototype.slice.call(gallery.querySelectorAll('img'));
    if (!imgs.length) return;

    // overlay skeleton
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', t('galleryLabel'));
    box.hidden = true;
    box.innerHTML =
      '<button type="button" class="lb-btn lb-close" aria-label="' + t('lightboxClose') + '">×</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="' + t('lightboxPrev') + '">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-next" aria-label="' + t('lightboxNext') + '">›</button>';
    document.body.appendChild(box);

    var big = box.querySelector('img');
    var caption = box.querySelector('figcaption');
    var index = 0;
    var lastFocused = null;

    function render() {
      var img = imgs[index];
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      caption.textContent = (img.getAttribute('data-caption') || img.alt || '') +
        ' — ' + t('photoCounter', { current: index + 1, total: imgs.length });
    }
    function open(i) {
      lastFocused = document.activeElement;
      index = i;
      render();
      box.hidden = false;
      void box.offsetWidth;
      box.classList.add('is-open');
      document.documentElement.classList.add('drawer-open'); // reuse scroll lock
      box.querySelector('.lb-close').focus();
      document.addEventListener('keydown', onKeydown);
    }
    function close() {
      box.classList.remove('is-open');
      document.documentElement.classList.remove('drawer-open');
      document.removeEventListener('keydown', onKeydown);
      window.setTimeout(function () { box.hidden = true; }, 220);
      if (lastFocused) lastFocused.focus();
    }
    function step(d) { index = (index + d + imgs.length) % imgs.length; render(); }
    function onKeydown(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    }

    imgs.forEach(function (img, i) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { open(i); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    box.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
  }

  /* ---------- 5. Lazy media fade-in ----------------------------
     Native loading="lazy" does the fetching; this observer only
     adds the fade-in class, and doubles as a fallback trigger.  */
  function initLazyMedia() {
    var media = document.querySelectorAll('img[loading="lazy"]');
    if (!('IntersectionObserver' in window)) {
      media.forEach(function (m) { m.classList.add('loaded'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          if (el.complete) el.classList.add('loaded');
          else el.addEventListener('load', function () { el.classList.add('loaded'); }, { once: true });
          io.unobserve(el);
        }
      });
    }, { rootMargin: '200px' });
    media.forEach(function (m) { io.observe(m); });
  }

  /* ---------- boot ------------------------------------------- */
  function init() {
    var header = document.querySelector('.site-header .wrap');
    if (header) {
      buildThemeToggle(header);
      buildDrawer(header);
    }
    initHotspots();
    initLightbox();
    initLazyMedia();
    document.documentElement.classList.add('js-ready');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
