/* =============================================
   API.JS — Updated for https://www.sankavollerei.web.id/comic
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id/comic';

const api = {
  async fetch(path) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error('❌ API Error:', err);
      throw err;
    }
  },

  // ==================== HELPERS ====================
  extractList(data) {
    return data?.data?.comics ||
           data?.data ||
           data?.results ||
           data?.komiklist ||
           (Array.isArray(data) ? data : []);
  },

  extractTotalPages(data) {
    return data?.data?.pagination?.totalPages ||
           data?.pagination?.totalPages ||
           data?.totalPages ||
           data?.data?.total_pages ||
           1;
  },

  // ==================== ENDPOINTS ====================

  /** Komik Terbaru */
  getLatest(page = 1) {
    return this.fetch(`/terbaru?page=${page}`);
  },

  /** Library / Pustaka */
  getLibrary({ type = '', page = 1 } = {}) {
    const params = new URLSearchParams({ page: page });
    if (type) params.append('type', type);
    return this.fetch(`/pustaka?${params}`);
  },

  /** Search */
  search(query, page = 1) {
    if (!query) return Promise.resolve({ data: [] });
    const params = new URLSearchParams({ q: query, page: page });
    return this.fetch(`/search?${params}`);
  },

  /** Detail Komik */
  getDetail(slug) {
    return this.fetch(`/comic/${encodeURIComponent(slug)}`);
  },

  /** Baca Chapter */
  getChapter(slug) {
    return this.fetch(`/chapter/${encodeURIComponent(slug)}`);
  },

  // Optional endpoints (bisa ditambah nanti)
  // getGenres() { return this.fetch('/genres'); },
  // getTrending() { return this.fetch('/trending'); },
};

console.log('✅ AniZone API loaded successfully');
window.api = api;   // Pastikan global
