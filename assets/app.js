/**
 * Liwan Lake Park Guide — Vanilla JS Enhancements
 * Features: Mobile navigation, Dark/Light mode, Lightbox gallery, Map hotspots, Lazy loading
 */

(function() {
  'use strict';

  // ---------- DOM Elements ----------
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const body = document.body;
  
  // ---------- Mobile Navigation ----------
  function initMobileNav() {
    // Create hamburger button if not exists
    let menuBtn = document.querySelector('.menu-toggle');
    if (!menuBtn && nav) {
      menuBtn = document.createElement('button');
      menuBtn.className = 'menu-toggle';
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-controls', 'primary-navigation');
      menuBtn.setAttribute('aria-label', 'Toggle navigation menu');
      menuBtn.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      `;
      
      const wrap = header.querySelector('.wrap');
      wrap.insertBefore(menuBtn, nav);
      
      // Add ID to nav for aria-controls
      nav.id = 'primary-navigation';
      
      // Toggle menu
      menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('nav-open', !isExpanded);
        
        // Lock body scroll when menu is open
        if (!isExpanded) {
          body.style.overflow = 'hidden';
          // Focus first nav item for accessibility
          const firstLink = nav.querySelector('a');
          if (firstLink) firstLink.focus();
        } else {
          body.style.overflow = '';
        }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
          menuBtn.setAttribute('aria-expanded', 'false');
          nav.classList.remove('nav-open');
          body.style.overflow = '';
          menuBtn.focus();
        }
      });
      
      // Close when clicking backdrop (on mobile)
      document.addEventListener('click', (e) => {
        if (nav.classList.contains('nav-open') && 
            !nav.contains(e.target) && 
            !menuBtn.contains(e.target)) {
          menuBtn.setAttribute('aria-expanded', 'false');
          nav.classList.remove('nav-open');
          body.style.overflow = '';
        }
      });
    }
  }

  // ---------- Dark/Light Mode Toggle ----------
  function initThemeToggle() {
    const themeKey = 'liwan-theme-preference';
    const root = document.documentElement;
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem(themeKey);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      root.setAttribute('data-theme', savedTheme);
    } else if (systemDark) {
      root.setAttribute('data-theme', 'dark');
    }
    
    // Create toggle button
    let themeBtn = document.querySelector('.theme-toggle');
    if (!themeBtn && header) {
      themeBtn = document.createElement('button');
      themeBtn.className = 'theme-toggle';
      themeBtn.setAttribute('aria-label', 'Toggle dark/light mode');
      themeBtn.innerHTML = `
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
      
      const wrap = header.querySelector('.wrap');
      wrap.appendChild(themeBtn);
      
      // Toggle theme
      themeBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem(themeKey, newTheme);
      });
      
      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(themeKey)) {
          root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // ---------- Lightbox Gallery ----------
  function initLightbox() {
    const galleryImages = document.querySelectorAll('.gallery-img, .photo-spot img, article img[data-gallery]');
    
    if (galleryImages.length === 0) return;
    
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image viewer');
    lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close image viewer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
        <button class="lightbox-prev" aria-label="Previous image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button class="lightbox-next" aria-label="Next image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    `;
    
    body.appendChild(lightbox);
    
    let currentIndex = 0;
    const images = Array.from(galleryImages);
    
    function openLightbox(index) {
      currentIndex = index;
      const img = images[currentIndex];
      const lightboxImg = lightbox.querySelector('.lightbox-image');
      const caption = lightbox.querySelector('.lightbox-caption');
      
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Gallery image';
      caption.textContent = img.dataset.caption || img.alt || '';
      
      lightbox.classList.add('lightbox-open');
      body.style.overflow = 'hidden';
      
      // Focus trap
      lightbox.querySelector('.lightbox-close').focus();
    }
    
    function closeLightbox() {
      lightbox.classList.remove('lightbox-open');
      body.style.overflow = '';
    }
    
    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      openLightbox(currentIndex);
    }
    
    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      openLightbox(currentIndex);
    }
    
    // Event listeners
    images.forEach((img, index) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(index));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `View ${img.alt || 'image'} in full screen`);
    });
    
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrev);
    lightbox.querySelector('.lightbox-next').addEventListener('click', showNext);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('lightbox-open')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  // ---------- Map Hotspots ----------
  function initMapHotspots() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    const hotspotsData = mapContainer.dataset.hotspots || '[]';
    const hotspots = JSON.parse(hotspotsData);
    
    hotspots.forEach((spot, index) => {
      const hotspot = document.createElement('button');
      hotspot.className = 'map-hotspot';
      hotspot.style.top = spot.y + '%';
      hotspot.style.left = spot.x + '%';
      hotspot.setAttribute('aria-label', spot.name);
      hotspot.setAttribute('aria-describedby', `hotspot-tooltip-${index}`);
      hotspot.innerHTML = `<span class="hotspot-marker"></span>`;
      
      const tooltip = document.createElement('div');
      tooltip.className = 'hotspot-tooltip';
      tooltip.id = `hotspot-tooltip-${index}`;
      tooltip.innerHTML = `
        <h4>${spot.name}</h4>
        <p>${spot.description || ''}</p>
      `;
      
      hotspot.appendChild(tooltip);
      mapContainer.appendChild(hotspot);
      
      // Toggle tooltip on click for accessibility
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = hotspot.classList.contains('tooltip-open');
        
        // Close all other tooltips
        document.querySelectorAll('.map-hotspot.tooltip-open').forEach(h => {
          h.classList.remove('tooltip-open');
        });
        
        if (!isOpen) {
          hotspot.classList.add('tooltip-open');
        }
      });
    });
    
    // Close tooltips when clicking map
    mapContainer.addEventListener('click', () => {
      document.querySelectorAll('.map-hotspot.tooltip-open').forEach(h => {
        h.classList.remove('tooltip-open');
      });
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.map-hotspot.tooltip-open').forEach(h => {
          h.classList.remove('tooltip-open');
        });
      }
    });
  }

  // ---------- Lazy Loading with Fade-in ----------
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('lazy-loaded');
            imageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '50px 0px' });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => img.classList.add('lazy-loaded'));
    }
  }

  // ---------- Skip Link Focus Fix ----------
  function initSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    });
  }

  // ---------- Initialize All Features ----------
  function init() {
    initMobileNav();
    initThemeToggle();
    initLightbox();
    initMapHotspots();
    initLazyLoading();
    initSkipLinks();
    
    console.log('Liwan Lake Park Guide enhancements loaded');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
