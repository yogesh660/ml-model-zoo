/**
 * Learn Platform - Interactive Scripts
 * Styled to match Yogesh Awate's portfolio: https://yogesh660.github.io/
 * Powers the unified Learn Platform (47 Models + 17 Concepts = 64 Learning Units)
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

  // 5. Unified Learn Tab Switcher & Domain Filtering
  let activeLearnTab = 'all'; // 'all', 'models', 'concepts', 'stats', 'ds', 'diagnostics', 'optimization'
  let currentModelCategory = 'all';
  let currentConceptCategory = 'all';
  let searchQuery = '';

  const modelsContainer = document.getElementById('modelsContainer');
  const conceptsContainer = document.getElementById('conceptsContainer');
  const modelFilters = document.getElementById('modelFilters');
  const conceptFilters = document.getElementById('conceptFilters');

  const modelCards = document.querySelectorAll('#modelsContainer .model-card');
  const conceptCards = document.querySelectorAll('#conceptsContainer .concept-card');
  const modelFilterBtns = document.querySelectorAll('#modelFilters .filter');
  const conceptFilterBtns = document.querySelectorAll('#conceptFilters .filter');
  const curriculumPills = document.querySelectorAll('.curriculum-pill');

  window.switchLearnTab = function (tab) {
    activeLearnTab = tab;

    curriculumPills.forEach(pill => {
      const id = pill.id;
      const matches = (
        (tab === 'all' && id === 'pillAll') ||
        (tab === 'models' && id === 'pillModels') ||
        (tab === 'stats' && id === 'pillStats') ||
        (tab === 'ds' && id === 'pillDS') ||
        (tab === 'diagnostics' && id === 'pillDiag') ||
        (tab === 'optimization' && id === 'pillOpt') ||
        (tab === 'concepts' && id === 'pillStats')
      );
      pill.classList.toggle('active', matches);
    });

    if (tab === 'all') {
      modelsContainer.style.display = 'grid';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'flex';
      conceptFilters.style.display = 'none';
      currentConceptCategory = 'all';
      history.replaceState(null, '', '#learn');
    } else if (tab === 'models') {
      modelsContainer.style.display = 'grid';
      conceptsContainer.style.display = 'none';
      modelFilters.style.display = 'flex';
      conceptFilters.style.display = 'none';
      history.replaceState(null, '', '#learn-models');
    } else if (tab === 'stats') {
      modelsContainer.style.display = 'none';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'none';
      conceptFilters.style.display = 'flex';
      currentConceptCategory = 'theory';
      history.replaceState(null, '', '#learn-statistics');
    } else if (tab === 'ds') {
      modelsContainer.style.display = 'none';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'none';
      conceptFilters.style.display = 'flex';
      currentConceptCategory = 'preprocessing';
      history.replaceState(null, '', '#learn-datascience');
    } else if (tab === 'diagnostics') {
      modelsContainer.style.display = 'none';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'none';
      conceptFilters.style.display = 'flex';
      currentConceptCategory = 'diagnostics';
      history.replaceState(null, '', '#learn-diagnostics');
    } else if (tab === 'optimization') {
      modelsContainer.style.display = 'none';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'none';
      conceptFilters.style.display = 'flex';
      currentConceptCategory = 'optimization';
      history.replaceState(null, '', '#learn-optimization');
    } else {
      // General concepts
      modelsContainer.style.display = 'none';
      conceptsContainer.style.display = 'grid';
      modelFilters.style.display = 'none';
      conceptFilters.style.display = 'flex';
      currentConceptCategory = 'all';
      history.replaceState(null, '', '#learn-concepts');
    }

    applyLearnFilters();
  };

  function applyLearnFilters() {
    const query = searchQuery.trim().toLowerCase();
    let visibleModels = 0;
    let visibleConcepts = 0;

    const showModels = (activeLearnTab === 'all' || activeLearnTab === 'models');
    const showConcepts = (activeLearnTab !== 'models');

    // Filter Models
    if (showModels) {
      modelCards.forEach(card => {
        const cat = card.dataset.cat || '';
        const searchData = (card.dataset.name || '').toLowerCase();

        const matchCat = (currentModelCategory === 'all' || cat === currentModelCategory);
        const matchSearch = (!query || searchData.includes(query));

        if (matchCat && matchSearch) {
          card.classList.remove('hide');
          card.classList.add('in');
          visibleModels++;
        } else {
          card.classList.add('hide');
        }
      });
    } else {
      modelCards.forEach(c => c.classList.add('hide'));
    }

    // Filter Concepts
    if (showConcepts) {
      conceptCards.forEach(card => {
        const cat = card.dataset.conceptCat || '';
        const searchData = (card.dataset.name || '').toLowerCase();

        const matchCat = (currentConceptCategory === 'all' || cat === currentConceptCategory);
        const matchSearch = (!query || searchData.includes(query));

        if (matchCat && matchSearch) {
          card.classList.remove('hide');
          card.classList.add('in');
          visibleConcepts++;
        } else {
          card.classList.add('hide');
        }
      });
    } else {
      conceptCards.forEach(c => c.classList.add('hide'));
    }

    // Update filter buttons active states
    modelFilterBtns.forEach(btn => {
      btn.classList.toggle('on', btn.dataset.cat === currentModelCategory);
    });
    conceptFilterBtns.forEach(btn => {
      btn.classList.toggle('on', btn.dataset.conceptCat === currentConceptCategory);
    });

    const totalVisible = visibleModels + visibleConcepts;

    if (filterCountEl) {
      if (activeLearnTab === 'all') {
        filterCountEl.textContent = query
          ? `Showing ${totalVisible} units (${visibleModels} models, ${visibleConcepts} concepts) matching "${query}"`
          : `Showing all ${totalVisible} learning units (47 models + 17 foundational concepts)`;
      } else if (activeLearnTab === 'models') {
        filterCountEl.textContent = `Showing ${visibleModels} of 47 ML architectures`;
      } else {
        filterCountEl.textContent = `Showing ${visibleConcepts} of 17 core concepts`;
      }
    }

    if (emptyState) {
      emptyState.classList.toggle('show', totalVisible === 0);
    }
    if (searchClear) {
      searchClear.style.display = query ? 'block' : 'none';
    }
  }

  // Model sub-filter clicks
  modelFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentModelCategory = btn.dataset.cat;
      applyLearnFilters();
    });
  });

  // Concept sub-filter clicks
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
    switchLearnTab('all');
  };

  // URL Hash routing on page load
  const hash = location.hash.toLowerCase();
  if (hash === '#learn-concepts' || hash === '#concepts') {
    switchLearnTab('concepts');
  } else if (hash === '#learn-statistics' || hash === '#statistics') {
    switchLearnTab('stats');
  } else if (hash === '#learn-datascience' || hash === '#datascience') {
    switchLearnTab('ds');
  } else if (hash === '#learn-models' || hash === '#models') {
    switchLearnTab('models');
  } else if (['#regression', '#classification', '#clustering'].includes(hash)) {
    switchLearnTab('models');
    currentModelCategory = hash.slice(1);
    applyLearnFilters();
  } else {
    switchLearnTab('all');
  }
})();
