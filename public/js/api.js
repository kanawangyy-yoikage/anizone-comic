/* =============================================
   API.JS — Updated for sankavollerei.web.id/comic
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id/comic';

const api = {
  async fetch(path) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  // Extractor utama
  extractList(data) {
    // Beberapa kemungkinan struktur respons
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

  // Komik Terbaru (Homepage)
  getLatest(page = 1) {
    return this.fetch(`/terbaru?page=${page}`);
  },

  // Library / Pustaka
  getLibrary({ type = '', page = 1 } = {}) {
    const params = new URLSearchParams({ page });
    if (type) params.set('type', type); // Manga, Manhwa, Manhua
    return this.fetch(`/pustaka?${params}`);
  },

  // Search
  search(query, page = 1) {
    if (!query) return Promise.resolve({ data: [] });
    const params = new URLSearchParams({ q: query, page });
    return this.fetch(`/search?${params}`);
  },

  // Detail Komik
  getDetail(slug) {
    return this.fetch(`/comic/${slug}`);
  },

  // Chapter
  getChapter(slug) {
    return this.fetch(`/chapter/${slug}`);
  },

  // Optional: Bisa ditambah nanti
  // getGenres() { return this.fetch('/genres'); },
  // getTrending() { return this.fetch('/trending'); },

  // Helper untuk cek respons
  logResponse(data) {
    console.log('📡 API Response Structure:', data);
    return data;
  }
};

// Untuk debugging (bisa di-comment setelah stabil)
window.api = api;

export default api;
