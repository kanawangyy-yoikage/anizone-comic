/* =============================================
   API.JS — Centralized API Layer
   Proxy via Vercel rewrites → sankavollerei.web.id
   ============================================= */

const API_BASE = '/api/comic';

const api = {
  async fetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  extractList(data) {
    return data?.komikList ?? data?.komiklist ?? data?.results ?? data?.data ?? (Array.isArray(data) ? data : []);
  },

  extractTotalPages(data, currentPage = 1) {
    if (data?.totalPages) return data.totalPages;
    if (data?.total_pages) return data.total_pages;
    if (typeof data?.hasNextPage === 'boolean') {
      return data.hasNextPage ? currentPage + 1 : currentPage;
    }
    return 1;
  },

  getLatest() {
    return this.fetch('/bacakomik/latest');
  },

  getLibrary({ type = '', genre = '' } = {}) {
    if (genre) return this.fetch(`/bacakomik/genre/${encodeURIComponent(genre)}`);
    if (type)  return this.fetch(`/bacakomik/only/${encodeURIComponent(type)}`);
    return this.fetch('/bacakomik/populer');
  },

  getUnlimited() {
    return this.fetch('/unlimited');
  },

  extractUnlimitedList(data) {
    return data?.comics ?? data?.komikList ?? data?.results ?? (Array.isArray(data) ? data : []);
  },

  getGenres() {
    return this.fetch('/komikindo/genres');
  },

  search(query) {
    return this.fetch(`/bacakomik/search/${encodeURIComponent(query)}`);
  },

  getDetail(slug) {
    return this.fetch(`/bacakomik/detail/${slug}`);
  },

  getChapter(slug) {
    return this.fetch(`/bacakomik/chapter/${slug}`);
  },
};
