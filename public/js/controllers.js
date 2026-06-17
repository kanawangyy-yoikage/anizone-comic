/* =============================================
   CONTROLLERS.JS — Feature Controllers
   ============================================= */

/* ---- HOME ---- */
const homeController = {
  async load() {
    router.go('home');
    this.loadLatest(1);
  },

  async loadLatest(page = 1) {
    ui.loading('grid-latest');
    try {
      const data   = await api.getLatest(page);
      const comics = api.extractList(data);
      ui.renderGrid('grid-latest', comics);
      const total = api.extractTotalPages(data);
      ui.renderPagination('home-pages', page, total, p => homeController.loadLatest(p));
    } catch (e) {
      ui.error('grid-latest', `Gagal memuat: ${e.message}`);
    }
  },
};

/* ---- LIBRARY ---- */
const browseController = {
  type: '',
  page: 1,

  async load() {
    router.go('browse');
    this.fetchData();
  },

  setType(type, btnEl) {
    document.querySelectorAll('#type-filter .filter-chip').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    this.type = type;
    this.page = 1;
    this.fetchData();
  },

  async fetchData() {
    ui.loading('grid-browse');
    try {
      // Kirim type persis seperti yang API harapkan (Manga/Manhwa/Manhua atau lowercase)
      const data   = await api.getLibrary({ type: this.type, page: this.page });
      const comics = api.extractList(data);
      ui.renderGrid('grid-browse', comics);
      const total = api.extractTotalPages(data);
      const page  = this.page;
      ui.renderPagination('browse-pages', page, total, p => {
        browseController.page = p;
        browseController.fetchData();
      });
    } catch (e) {
      ui.error('grid-browse', `Gagal memuat library: ${e.message}`);
    }
  },
};

/* ---- SEARCH ---- */
const searchController = {
  async run(page = 1) {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    router.go('search');
    document.getElementById('search-heading').textContent = `Hasil: "${query}"`;
    ui.loading('grid-search');
    try {
      const data   = await api.search(query, page);
      const comics = api.extractList(data);
      ui.renderGrid('grid-search', comics);
      const total = api.extractTotalPages(data);
      ui.renderPagination('search-pages', page, total, p => {
        document.getElementById('search-input').value = query;
        searchController.run(p);
      });
    } catch (e) {
      ui.error('grid-search', `Pencarian gagal: ${e.message}`);
    }
  },
};

/* ---- DETAIL ---- */
const detailController = {
  currentSlug: null,
  chapters: [],

  async open(slug) {
    if (!slug) return;
    this.currentSlug = slug;
    this.chapters    = [];
    router.go('detail');
    ui.el('detail-content').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat detail...</div>';
    try {
      const res = await api.getDetail(slug);
      // Struktur dari screenshot: { data: { title, image, rating, detail:{status,author,type}, genres[], description, chapters[] } }
      const comic  = res?.data ?? res;
      const detail = comic?.detail ?? {};  // { status, author, illustrator, type, theme }
      const chaps  = comic?.chapters ?? [];
      this.chapters = chaps;

      // Gabungkan field detail ke comic supaya renderDetail bisa baca
      const merged = {
        title:       comic.title,
        image:       comic.image,
        type:        detail.type  || comic.type  || '',
        status:      detail.status || comic.status || '',
        author:      detail.author || '',
        synopsis:    comic.description || comic.synopsis || '',
        genres:      comic.genres ?? [],
        rating:      comic.rating ?? '',
      };

      ui.el('detail-content').innerHTML = ui.renderDetail(
        merged, chaps, (chapSlug, idx) => readerController.open(chapSlug, idx)
      );
    } catch (e) {
      ui.el('detail-content').innerHTML = `<div class="error-msg">Gagal memuat detail: ${e.message}</div>`;
    }
  },
};

/* ---- READER ---- */
const readerController = {
  currentIndex: 0,
  _navigation: null,

  async open(chapSlug, index) {
    if (!chapSlug) return;
    this.currentIndex = index;
    this._navigation  = null;
    router.go('reader');
    ui.el('reader-images').innerHTML =
      '<div class="loading"><div class="spinner"></div>Memuat chapter...</div>';
    this.updateNav();

    const chap = detailController.chapters[index];
    ui.el('reader-title').textContent = chap?.title || chap?.name || `Chapter ${index + 1}`;

    try {
      const res  = await api.getChapter(chapSlug);
      // Struktur dari screenshot: { data: { navigation:{prev,next}, images:[{id,url}] } }
      const data = res?.data ?? res;
      this._navigation = data?.navigation ?? null;
      const images = data?.images ?? data?.pages ?? (Array.isArray(data) ? data : []);
      this.updateNav();
      ui.renderReader('reader-images', images);
    } catch (e) {
      ui.el('reader-images').innerHTML = `<div class="error-msg">Gagal memuat chapter: ${e.message}</div>`;
    }
  },

  navigate(dir) {
    // navigation.prev / navigation.next adalah slug chapter langsung
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
    // Fallback index (list newest-first: prev=index+1, next=index-1)
    const newIdx = dir === -1 ? this.currentIndex + 1 : this.currentIndex - 1;
    const chapters = detailController.chapters;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    window.scrollTo(0, 0);
    this.open(chapters[newIdx].slug, newIdx);
  },

  updateNav() {
    const total = detailController.chapters.length;
    // btn-prev-chap = chapter lebih lama (index+1), btn-next-chap = chapter lebih baru (index-1)
    ui.el('btn-prev-chap').disabled = !this._navigation
      ? this.currentIndex >= total - 1
      : !this._navigation.prev;
    ui.el('btn-next-chap').disabled = !this._navigation
      ? this.currentIndex <= 0
      : !this._navigation.next;
  },

  backToDetail() {
    if (detailController.currentSlug) router.go('detail', false);
    else router.back();
  },
};
