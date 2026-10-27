/**
 * Machine Learning Model Zoo - Interactive Scripts
 * Styled to match Yogesh Awate's portfolio: https://yogesh660.github.io/
 */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const filterButtons = document.querySelectorAll('.filter');
  const modelCards = document.querySelectorAll('.model-card');
  const emptyState = document.getElementById('emptyState');
  const filterCountEl = document.getElementById('filterCount');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // 1. Navigation scroll state and mobile menu
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menu) {
      const closeMenu = () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      };
      menu.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(isOpen));
      });
      document.querySelectorAll('#navlinks a').forEach(a => a.addEventListener('click', closeMenu));
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
      });
    }
  }

  // 2. Cursor Spotlight effect on hover
  if (finePointer) {
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.spot');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, { passive: true });
  }

  // 3. Staggered reveal on scroll
  const revealObserver = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, idx) => {
      entry.target.style.setProperty('--stagger', idx);
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // 4. Animated numerical counters
  const counterObserver = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      const el = entry.target;
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      counterObserver.unobserve(el);
      if (reduced || isNaN(end)) return;

      const start = performance.now();
      const duration = 1200;
      const tick = now => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // 5. Category Filtering and Live Search
  let currentCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    modelCards.forEach(card => {
      const cat = card.dataset.cat || '';
      const searchData = (card.dataset.name || '').toLowerCase();

      const matchCat = (currentCategory === 'all' || cat === currentCategory);
      const matchSearch = (!query || searchData.includes(query));

      if (matchCat && matchSearch) {
        card.classList.remove('hide');
        card.classList.add('in');
        visibleCount++;
      } else {
        card.classList.add('hide');
      }
    });

    // Update filter buttons
    filterButtons.forEach(btn => {
      btn.classList.toggle('on', btn.dataset.cat === currentCategory);
    });

    // Update count indicator
    if (filterCountEl) {
      filterCountEl.textContent = `Showing ${visibleCount} of ${modelCards.length} architectures`;
    }

    // Toggle Empty State
    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }

    // Toggle search clear button
    if (searchClear) {
      searchClear.style.display = query ? 'block' : 'none';
    }
  }

  // Button clicks
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      if (currentCategory !== 'all') {
        history.replaceState(null, '', `#${currentCategory}`);
      } else {
        history.replaceState(null, '', location.pathname);
      }
      applyFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Search clear
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchInput.focus();
      applyFilters();
    });
  }

  // Reset filters from empty state
  window.resetZooFilters = function () {
    currentCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    history.replaceState(null, '', location.pathname);
    applyFilters();
  };

  // Check URL hash on load
  const hash = location.hash.slice(1).toLowerCase();
  if (['regression', 'classification', 'clustering'].includes(hash)) {
    currentCategory = hash;
  }

  applyFilters();
})();
