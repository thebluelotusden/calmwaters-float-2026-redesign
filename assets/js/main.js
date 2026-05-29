
const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-site-nav]');
const toggle = document.querySelector('[data-menu-toggle]');
const hero = document.querySelector('.home-hero');
const heroLogo = document.querySelector('.hero-logo');
const heroWords = [...document.querySelectorAll('.hero-quote-line')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroWordIndex = heroWords.findIndex((word) => word.classList.contains('is-active'));
let heroWordTimer;

const updateHeaderTheme = () => {
  if (!header) return;

  const previousVisibility = header.style.visibility;
  header.style.visibility = 'hidden';

  const sampleX = Math.round(window.innerWidth / 2);
  const sampleY = Math.round(Math.min(header.getBoundingClientRect().bottom + 8, window.innerHeight - 1));
  const underneath = document.elementFromPoint(sampleX, sampleY);

  header.style.visibility = previousVisibility;

  if (!underneath) {
    header.classList.remove('header-on-dark');
    return;
  }

  const themedParent = underneath.closest('.image-band, .memberships, .page-hero, .site-footer');
  const isDark = Boolean(themedParent);
  header.classList.toggle('header-on-dark', isDark);
};

const updateHeroLogo = () => {
  if (!hero || !heroLogo || reducedMotion.matches) return;

  const rect = hero.getBoundingClientRect();
  const start = rect.height * 0.02;
  const end = rect.height * 0.42;
  const progress = Math.min(Math.max((-rect.top - start) / Math.max(end - start, 1), 0), 1);

  heroLogo.style.setProperty('--hero-logo-opacity', String(1 - progress));
  heroLogo.style.setProperty('--hero-logo-blur', `${progress * 22}px`);
  heroLogo.style.setProperty('--hero-logo-shift', `${30 * (1 - progress)}px`);
};

const initHeroLogo = () => {
  if (!heroLogo) return;

  if (reducedMotion.matches) {
    heroLogo.classList.add('hero-logo-entered', 'hero-logo-live');
    return;
  }

  updateHeroLogo();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroLogo.classList.add('hero-logo-entered');
      window.setTimeout(() => {
        heroLogo.classList.add('hero-logo-live');
      }, 2300);
    });
  });
};

const cycleHeroWords = () => {
  if (heroWords.length < 2 || reducedMotion.matches) return;

  if (heroWordIndex < 0) {
    heroWordIndex = 0;
    heroWords[0]?.classList.add('is-active');
  }

  window.clearInterval(heroWordTimer);
  heroWordTimer = window.setInterval(() => {
    heroWords[heroWordIndex]?.classList.remove('is-active');
    heroWordIndex = (heroWordIndex + 1) % heroWords.length;
    heroWords[heroWordIndex]?.classList.add('is-active');
  }, 2900);
};

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 18);
  updateHeroLogo();
  updateHeaderTheme();
}, { passive: true });

window.addEventListener('resize', () => {
  updateHeroLogo();
  updateHeaderTheme();
  
  // Clear clicked state on service pills when switching to mobile width
  if (window.innerWidth <= 760) {
    document.querySelectorAll('[data-service-pill]').forEach((p) => {
      p.classList.remove('is-clicked');
    });
  }
}, { passive: true });
window.addEventListener('load', initHeroLogo);
window.addEventListener('load', updateHeaderTheme);

cycleHeroWords();

toggle?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  header?.classList.toggle('menu-open', Boolean(isOpen));
  document.body.classList.toggle('menu-open', Boolean(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    header?.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
  });
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealItems.forEach((item) => observer.observe(item));

// Service pills toggle interaction
const servicePills = document.querySelectorAll('[data-service-pill]');
servicePills.forEach((pill) => {
  pill.addEventListener('click', (e) => {
    // Disable click toggle behavior on mobile
    if (window.innerWidth <= 760) {
      return;
    }
    
    // Ignore clicks inside the details container so text can be selected
    if (e.target.closest('.service-pill-details')) {
      return;
    }
    
    const isAlreadyClicked = pill.classList.contains('is-clicked');
    
    // Close other pills (accordion behavior)
    servicePills.forEach((p) => {
      if (p !== pill) {
        p.classList.remove('is-clicked');
      }
    });
    
    // Toggle the clicked state on the current pill
    if (isAlreadyClicked) {
      pill.classList.remove('is-clicked');
    } else {
      pill.classList.add('is-clicked');
    }
  });
});

// Ensure background video loop works reliably across all browsers (specifically WebKit/Safari)
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play().catch((err) => console.log('Video loop play failed:', err));
  });
}

