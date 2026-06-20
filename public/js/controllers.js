/* =============================================
   CONTROLLERS.JS — Feature Controllers
   Enhanced with: live search, history,
   fullscreen reader, read tracking, theme toggle
   ============================================= */

/* ============================================
   THEME MANAGER
   ============================================ */
const themeManager = {
  init() {
    const saved = storage.getTheme();
    this.apply(saved);
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
    const iconSun  = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    if (iconSun)  iconSun.style.display  = theme === 'dark'  ? 'none' : 'block';
    if (iconMoon) iconMoon.style.display = theme === 'light' ? 'none' : 'block';
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    ui.toast(next === 'dark' ? '🌙 Mode Gelap' : '☀️ Mode Terang');
  },
};

/* ============================================
   MOBILE MENU
   ============================================ */
const mobileMenu = {
  toggle() {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    const isOpen = drawer.style.display !== 'none';
    drawer.style.display = isOpen ? 'none' : 'flex';
  },
  close() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.style.display = 'none';
  },
};

// Close mobile drawer when clicking outside
document.addEventListener('click', (e) => {
  const drawer = document.getElementById('mobile-drawer');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  if (drawer && drawer.style.display !== 'none') {
    if (!drawer.contains(e.target) && !menuBtn?.contains(e.target)) {
      drawer.style.display = 'none';
    }
  }
});

/* ============================================
   HOME CONTROLLER
   ============================================ */
const homeController = {
  async load() {
    router.go('home');
    this.loadLatest();
  },

  async loadLatest() {
    ui.skeleton('grid-latest', 12);
    try {
      const data   = await api.getLatest();
      const comics = api.extractList(data);
      ui.renderGrid('grid-latest', comics, { markNew: true });
      ui.el('home-pages').innerHTML = '';
    } catch (e) {
      ui.error('grid-latest', `Gagal memuat: ${e.message}`);
    }
  },
};

/* ============================================
   BROWSE / LIBRARY CONTROLLER
   ============================================ */
const browseController = {
  type:        '',
  genre:       '',
  page:        1,
  _genreLabel: '',
  _genresLoaded: false,
  _genrePanelOpen: false,

  async load() {
    router.go('browse');
    this.fetchData();
    if (!this._genresLoaded) this.loadGenres();
  },

  async loadGenres() {
    try {
      const data = await api.getGenres();
      const genres = data?.genres ?? data?.data ?? (Array.isArray(data) ? data : []);
      this._genresLoaded = true;
      this._renderGenreChips(genres);
    } catch (e) {
      const el = ui.el('genre-chips');
      if (el) el.innerHTML = '<div class="genre-loading" style="color:var(--danger)">Gagal memuat genre</div>';
    }
  },

  _renderGenreChips(genres) {
    const el = ui.el('genre-chips');
    if (!el || !genres.length) return;
    el.innerHTML = genres.map(g => {
      const name = g.name || g.title || g;
      const slug = g.value || g.slug || g;
      const safe = String(slug).replace(/'/g, "\\'");
      const safeName = String(name).replace(/'/g, "\\'");
      return `<button class="genre-chip" data-slug="${slug}" onclick="browseController.filterGenre('${safe}','${safeName}',this)">${name}</button>`;
    }).join('');
    // Mark active if already filtered
    if (this.genre) this._markActiveChip(this.genre);
  },

  _markActiveChip(slug) {
    document.querySelectorAll('#genre-chips .genre-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.slug === slug);
    });
  },

  toggleGenrePanel() {
    this._genrePanelOpen = !this._genrePanelOpen;
    const wrapper  = ui.el('genre-chips-wrapper');
    const chevron  = ui.el('genre-chevron');
    if (wrapper) wrapper.style.display = this._genrePanelOpen ? 'block' : 'none';
    if (chevron) chevron.style.transform = this._genrePanelOpen ? 'rotate(180deg)' : '';
    const btn = ui.el('genre-toggle-btn');
    if (btn) btn.classList.toggle('active', this._genrePanelOpen);
  },

  setType(type, btnEl) {
    document.querySelectorAll('#type-filter .filter-chip').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    this.type  = type;
    this.genre = '';
    this._genreLabel = '';
    this.page  = 1;
    this._updateActiveGenreBar();
    this._markActiveChip('');
    this.fetchData();
  },

  filterGenre(slug, label, chipEl) {
    // Toggle off if same genre clicked
    if (this.genre === slug) {
      this.clearGenre();
      return;
    }
    this.genre       = slug;
    this._genreLabel = label;
    this.type        = '';
    this.page        = 1;

    // Reset type chips
    document.querySelectorAll('#type-filter .filter-chip').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });

    this._markActiveChip(slug);
    this._updateActiveGenreBar();
    router.go('browse');
    this.fetchData();
    if (label) ui.toast(`🏷️ Genre: ${label}`);
  },

  clearGenre() {
    this.genre       = '';
    this._genreLabel = '';
    this.page        = 1;
    this._markActiveChip('');
    this._updateActiveGenreBar();
    this.fetchData();
  },

  _updateActiveGenreBar() {
    const bar   = ui.el('active-genre-bar');
    const label = ui.el('active-genre-label');
    if (!bar) return;
    if (this.genre && this._genreLabel) {
      bar.style.display = 'flex';
      if (label) label.textContent = `🏷️ Genre: ${this._genreLabel}`;
    } else {
      bar.style.display = 'none';
    }
  },

  async fetchData() {
    ui.skeleton('grid-browse', 12);
    try {
      const data   = await api.getLibrary({ type: this.type, genre: this.genre });
      const comics = api.extractList(data);
      ui.renderGrid('grid-browse', comics);
      ui.el('browse-pages').innerHTML = '';
    } catch (e) {
      ui.error('grid-browse', `Gagal memuat library: ${e.message}`);
    }
  },
};

/* ============================================
   SEARCH CONTROLLER — with live search
   ============================================ */
const searchController = {
  _liveTimer: null,
  _heroTimer: null,

  // ---- Navbar search ----
  run() {
    const query = document.getElementById('search-input')?.value.trim();
    if (!query) return;
    this.closeDropdown();
    this._doSearch(query, 'grid-search', 'search-pages', 'search-heading', 'search');
  },

  async _doSearch(query, gridId, pagesId, headingId, view) {
    router.go(view);
    if (headingId) {
      const h = document.getElementById(headingId);
      if (h) h.textContent = `Hasil: "${query}"`;
    }
    ui.skeleton(gridId, 8);
    try {
      const data   = await api.search(query);
      const comics = api.extractList(data);
      ui.renderGrid(gridId, comics);
      const total = api.extractTotalPages(data, 1);
      ui.renderPagination(pagesId, 1, total, p => {
        if (gridId === 'grid-search') document.getElementById('search-input').value = query;
        this._doSearch(query, gridId, pagesId, headingId, view);
      });
    } catch (e) {
      ui.error(gridId, `Pencarian gagal: ${e.message}`);
    }
  },

  clear() {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');
    if (input) input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    this.closeDropdown();
  },

  // ---- Live search (navbar) ----
  liveSearch() {
    const input    = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    const clearBtn = document.getElementById('search-clear');
    const query    = input?.value.trim();

    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    if (!query || query.length < 2) {
      this.closeDropdown();
      return;
    }

    if (dropdown) dropdown.style.display = 'block';
    if (dropdown) dropdown.innerHTML = '<div class="dropdown-loading"><div class="spinner" style="width:22px;height:22px;margin:0 auto"></div></div>';

    clearTimeout(this._liveTimer);
    this._liveTimer = setTimeout(async () => {
      try {
        const data   = await api.search(query);
        const comics = api.extractList(data);
        if (document.getElementById('search-input')?.value.trim() !== query) return; // stale
        ui.renderDropdown('search-dropdown', comics, (slug) => {
          this.closeDropdown();
          detailController.open(slug);
        });
      } catch {
        if (dropdown) dropdown.innerHTML = '<div class="dropdown-empty">Gagal mencari</div>';
      }
    }, 380);
  },

  closeDropdown() {
    const d = document.getElementById('search-dropdown');
    if (d) d.style.display = 'none';
  },

  // ---- Hero search ----
  runHero() {
    const query = document.getElementById('hero-input')?.value.trim();
    if (!query) return;
    document.getElementById('hero-dropdown').style.display = 'none';
    // Sinkron ke navbar input juga
    const navInput = document.getElementById('search-input');
    if (navInput) navInput.value = query;
    this._doSearch(query, 'grid-search', 'search-pages', 'search-heading', 'search');
  },

  liveSearchHero() {
    const input    = document.getElementById('hero-input');
    const dropdown = document.getElementById('hero-dropdown');
    const query    = input?.value.trim();

    if (!query || query.length < 2) {
      if (dropdown) dropdown.style.display = 'none';
      return;
    }

    if (dropdown) { dropdown.style.display = 'block'; dropdown.innerHTML = '<div class="dropdown-loading">Mencari...</div>'; }

    clearTimeout(this._heroTimer);
    this._heroTimer = setTimeout(async () => {
      try {
        const data   = await api.search(query);
        const comics = api.extractList(data);
        if (document.getElementById('hero-input')?.value.trim() !== query) return;
        ui.renderDropdown('hero-dropdown', comics, (slug) => {
          if (dropdown) dropdown.style.display = 'none';
          detailController.open(slug);
        });
      } catch {
        if (dropdown) dropdown.innerHTML = '<div class="dropdown-empty">Gagal mencari</div>';
      }
    }, 380);
  },
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!document.getElementById('search-wrapper')?.contains(e.target)) {
    searchController.closeDropdown();
  }
  if (!document.querySelector('.hero-search-bar')?.contains(e.target) &&
      !document.getElementById('hero-dropdown')?.contains(e.target)) {
    const hd = document.getElementById('hero-dropdown');
    if (hd) hd.style.display = 'none';
  }
});

/* ============================================
   DETAIL CONTROLLER
   ============================================ */
const detailController = {
  currentSlug: null,
  currentComic: null,
  chapters: [],

  async open(slug) {
    if (!slug) return;
    this.currentSlug  = slug;
    this.currentComic = null;
    this.chapters     = [];
    router.go('detail');
    ui.el('detail-content').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat detail...</div>';

    try {
      const res   = await api.getDetail(slug);
      const comic = res?.detail ?? res;

      const chaps = comic?.chapters ?? comic?.chapterList ?? [];
      this.chapters = chaps;

      const merged = {
        slug:     slug,
        title:    comic.title    || 'Tanpa Judul',
        image:    comic.cover    || comic.image || '',
        type:     comic.type     || '',
        status:   comic.status   || '',
        author:   comic.author   || '',
        artist:   comic.artist   || '',
        synopsis: comic.synopsis || comic.description || '',
        genres:   comic.genres   ?? [],
        rating:   comic.rating   ?? '',
      };
      this.currentComic = merged;

      ui.el('detail-content').innerHTML = ui.renderDetail(
        merged, chaps,
        (chapSlug, idx) => readerController.open(chapSlug, idx)
      );
    } catch (e) {
      ui.el('detail-content').innerHTML = `<div class="error-msg">Gagal memuat detail: ${e.message}</div>`;
    }
  },
};

/* ============================================
   READER CONTROLLER
   ============================================ */
const readerController = {
  currentIndex: 0,
  _navigation:  null,
  _chapSlug:    null,

  async open(chapSlug, index) {
    if (!chapSlug) return;
    this._chapSlug    = chapSlug;
    this.currentIndex = index ?? 0;
    this._navigation  = null;
    router.go('reader');

    ui.el('reader-images').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat chapter...</div>';

    const chap = detailController.chapters[this.currentIndex];
    const chapName = chap?.title || chap?.name || `Chapter ${this.currentIndex + 1}`;
    ui.el('reader-title').textContent = chapName;

    // Populate chapter selector
    this._buildChapterSelect();
    this.updateNav();

    try {
      const res = await api.getChapter(chapSlug);
      this._navigation = res?.navigation ?? null;
      const images = res?.images ?? res?.pages ?? (Array.isArray(res) ? res : []);

      this.updateNav();
      ui.renderReader('reader-images', images);

      // Update chapter select value
      const sel = document.getElementById('chapter-select');
      if (sel) sel.value = this.currentIndex;

      // Track reading history
      const comic = detailController.currentComic;
      if (comic && detailController.currentSlug) {
        storage.addHistory({
          slug:     detailController.currentSlug,
          title:    comic.title,
          cover:    comic.image || comic.cover || '',
          type:     comic.type  || '',
          chapSlug: chapSlug,
          chapName: chapName,
        });
        storage.markChapterRead(detailController.currentSlug, chapSlug);
      }

      ui.toast(`📖 ${chapName}`, 'info');
    } catch (e) {
      ui.el('reader-images').innerHTML =
        `<div class="error-msg">Gagal memuat chapter: ${e.message}</div>`;
    }
  },

  _buildChapterSelect() {
    const sel    = document.getElementById('chapter-select');
    const chaps  = detailController.chapters;
    if (!sel || !chaps.length) return;
    sel.innerHTML = chaps.map((ch, i) => {
      const name = ch.title || ch.name || `Chapter ${i + 1}`;
      return `<option value="${i}">${name}</option>`;
    }).join('');
    sel.value = this.currentIndex;
  },

  jumpToChapter(indexStr) {
    const idx  = parseInt(indexStr, 10);
    const chap = detailController.chapters[idx];
    if (!chap) return;
    window.scrollTo(0, 0);
    this.open(chap.slug, idx);
  },

  navigate(dir) {
    // dir: -1 = prev (older), 1 = next (newer)
    if (this._navigation) {
      const target = dir === -1 ? this._navigation.prev : this._navigation.next;
      if (target) {
        const chapters = detailController.chapters;
        const newIdx   = chapters.findIndex(ch => ch.slug === target);
        window.scrollTo(0, 0);
        this.open(target, newIdx !== -1 ? newIdx : this.currentIndex);
        return;
      }
    }
    // Fallback (newest = index 0, oldest = last index)
    const newIdx   = dir === 1 ? this.currentIndex - 1 : this.currentIndex + 1;
    const chapters = detailController.chapters;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    window.scrollTo(0, 0);
    this.open(chapters[newIdx].slug, newIdx);
  },

  updateNav() {
    const total = detailController.chapters.length;

    const setDisabled = (id, val) => {
      const el = ui.el(id);
      if (el) el.disabled = val;
    };

    if (this._navigation) {
      const noPrev = !this._navigation.prev;
      const noNext = !this._navigation.next;
      setDisabled('btn-prev-chap',   noPrev);
      setDisabled('btn-next-chap',   noNext);
      setDisabled('btn-prev-bottom', noPrev);
      setDisabled('btn-next-bottom', noNext);
    } else {
      const atOldest = this.currentIndex >= total - 1;
      const atNewest = this.currentIndex <= 0;
      setDisabled('btn-prev-chap',   atOldest);
      setDisabled('btn-next-chap',   atNewest);
      setDisabled('btn-prev-bottom', atOldest);
      setDisabled('btn-next-bottom', atNewest);
    }
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  },

  backToDetail() {
    if (detailController.currentSlug) router.go('detail', false);
    else router.back();
  },
};

/* ============================================
   HISTORY CONTROLLER
   ============================================ */
const historyController = {
  load() {
    router.go('history');
    const list = storage.getHistory();

    // Show/hide clear button
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) clearBtn.style.display = list.length ? 'flex' : 'none';

    ui.renderHistory('history-content', list);
  },

  clearAll() {
    if (!confirm('Hapus semua riwayat bacaan?')) return;
    storage.clearHistory();
    ui.toast('🗑️ Riwayat dihapus', 'info');
    this.load();
  },
};
