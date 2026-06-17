/* =============================================
   API.JS — Centralized API Layer
   Base URL: https://www.sankavollerei.web.id
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id';

const api = {
  /**
   * Core fetch wrapper with error handling
   * @param {string} path - API path (e.g. '/comic/terbaru')
   * @returns {Promise<any>}
   */
  async fetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /**
   * Extract comic array from various response shapes
   * @param {any} data
   * @returns {Array}
   */
  extractList(data) {
    return data?.data ?? data?.komik ?? data?.comics ?? (Array.isArray(data) ? data : []);
  },

  // ---- Endpoints ----

  /** Komik terbaru */
  getLatest() {
    return this.fetch('/comic/terbaru');
  },

  /** Komik populer */
  getPopular() {
    return this.fetch('/comic/populer');
  },

  /** Trending comics */
  getTrending() {
    return this.fetch('/comic/trending');
  },

  /**
   * Browse dengan filter
   * @param {Object} opts
   * @param {string} [opts.type]   - manga | manhwa | manhua
   * @param {string} [opts.order]  - update | title | rating
   * @param {number} [opts.page]
   */
  getBrowse({ type = '', order = 'update', page = 1 } = {}) {
    let url = `/comic/browse?page=${page}&order=${order}`;
    if (type) url += `&type=${type}`;
    return this.fetch(url);
  },

  /**
   * Search komik
   * @param {string} query
   */
  search(query) {
    return this.fetch(`/comic/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Detail komik + daftar chapter
   * @param {string} slug
   */
  getDetail(slug) {
    return this.fetch(`/comic/comic/${slug}`);
  },

  /**
   * Gambar-gambar dalam satu chapter
   * @param {string} slug
   */
  getChapter(slug) {
    return this.fetch(`/comic/chapter/${slug}`);
  },

  /** List semua genre */
  getGenres() {
    return this.fetch('/comic/genres');
  },

  /** Homepage data (popular + latest + ranking) */
  getHomepage() {
    return this.fetch('/comic/homepage');
  },
};
