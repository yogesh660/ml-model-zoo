/**
 * Machine Learning Model Zoo - Interactive Scripts
 * Styled to match Yogesh Awate's portfolio: https://yogesh660.github.io/
 * Powers the unified "Learn" Section (47 Models + 13 Concepts)
 */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const filterCountEl = document.getElementById('filterCount');
  const emptyState = document.getElementById('emptyState');
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

  // 5. Unified Learn Tab Switcher (Models vs Concepts)
  let activeLearnTab = 'models'; // 'models' or 'concepts'
  let currentModelCategory = 'all';
  let currentConceptCategory = 'all';
  let searchQuery = '';

  const learnTabModels = document.getElementById('learnTabModels');
  const learnTabConcepts = document.getElementById('learnTabConcepts');
  const modelsContainer = document.getElementById('modelsContainer');
  const conceptsContainer = document.getElementById('conceptsContainer');
  const modelFilters = document.getElementById('modelFilters');
  const conceptFilters = document.getElementById('conceptFilters');

  const modelCards = document.querySelectorAll('#modelsContainer .model-card');
  const conceptCards = document.querySelectorAll('#conceptsContainer .concept-card');
  const modelFilterBtns = document.querySelectorAll('#modelFilters .filter');
  const conceptFilterBtns = document.querySelectorAll('#conceptFilters .filter');

  window.switchLearnTab = function (tab) {
    activeLearnTab = tab;

    if (tab === 'models') {
      learnTabModels.classList.add('active');
      learnTabConcepts.classList.remove('active');
      modelsContainer.style.display = 'grid';
      conceptsContainer.style.display = 'none';
      modelFilters.style.display = 'flex';
      conceptFilters.style.display = 'none';
      history.replaceState(null, '', '#learn-models');
    } else {
      learnTabConcepts.classList.add('active');
      learnTabModels.classList.remove('active');
      modelsContainer.style.display = 'none';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'none';
      conceptFilters.style.display = 'flex';
      history.replaceState(null, '', '#learn-concepts');
    }

    applyLearnFilters();
  };

  function applyLearnFilters() {
    const query = searchQuery.trim().toLowerCase();
    let visibleCount = 0;

    if (activeLearnTab === 'models') {
      modelCards.forEach(card => {
        const cat = card.dataset.cat || '';
        const searchData = (card.dataset.name || '').toLowerCase();

        const matchCat = (currentModelCategory === 'all' || cat === currentModelCategory);
        const matchSearch = (!query || searchData.includes(query));

        if (matchCat && matchSearch) {
          card.classList.remove('hide');
          card.classList.add('in');
          visibleCount++;
        } else {
          card.classList.add('hide');
        }
      });

      modelFilterBtns.forEach(btn => {
        btn.classList.toggle('on', btn.dataset.cat === currentModelCategory);
      });

      if (filterCountEl) {
        filterCountEl.textContent = `Showing ${visibleCount} of ${modelCards.length} architectures`;
      }
    } else {
      conceptCards.forEach(card => {
        const cat = card.dataset.conceptCat || '';
        const searchData = (card.dataset.name || '').toLowerCase();

        const matchCat = (currentConceptCategory === 'all' || cat === currentConceptCategory);
        const matchSearch = (!query || searchData.includes(query));

        if (matchCat && matchSearch) {
          card.classList.remove('hide');
          card.classList.add('in');
          visibleCount++;
        } else {
          card.classList.add('hide');
        }
      });

      conceptFilterBtns.forEach(btn => {
        btn.classList.toggle('on', btn.dataset.conceptCat === currentConceptCategory);
      });

      if (filterCountEl) {
        filterCountEl.textContent = `Showing ${visibleCount} of ${conceptCards.length} core concepts`;
      }
    }

    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
    if (searchClear) {
      searchClear.style.display = query ? 'block' : 'none';
    }
  }

  // Model filter clicks
  modelFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentModelCategory = btn.dataset.cat;
      applyLearnFilters();
    });
  });

  // Concept filter clicks
  conceptFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentConceptCategory = btn.dataset.conceptCat;
      applyLearnFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      applyLearnFilters();
    });
  }

  // Search clear
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchInput.focus();
      applyLearnFilters();
    });
  }

  window.resetZooFilters = function () {
    currentModelCategory = 'all';
    currentConceptCategory = 'all';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    applyLearnFilters();
  };

  // URL Hash routing
  const hash = location.hash.toLowerCase();
  if (hash === '#learn-concepts' || hash === '#concepts') {
    switchLearnTab('concepts');
  } else if (['#regression', '#classification', '#clustering'].includes(hash)) {
    switchLearnTab('models');
    currentModelCategory = hash.slice(1);
    applyLearnFilters();
  } else {
    applyLearnFilters();
  }
})();
