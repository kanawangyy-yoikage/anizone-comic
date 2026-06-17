/* =============================================
   API.JS — Centralized API Layer
   Base URL: https://www.sankavollerei.web.id
   ============================================= */

const API_BASE = 'https://www.sankavollerei.web.id';

const api = {
  async fetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // /latest & /library & /search → komiklist[]
  extractList(data) {
    return data?.komiklist ?? data?.results ?? data?.data ?? data?.comics ?? (Array.isArray(data) ? data : []);
  },

  // pagination selalu nested: { pagination: { totalPages } }
  extractTotalPages(data) {
    return data?.pagination?.totalPages ?? data?.pagination?.total_pages ?? data?.totalPages ?? 1;
  },

  // GET /comic/komikindo/latest/:page
  getLatest(page = 1) {
    return this.fetch(`/comic/komikindo/latest/${page}`);
  },

  // GET /comic/komikindo/library?page=&type=&genre=
  getLibrary({ type = '', genre = '', page = 1 } = {}) {
    const params = new URLSearchParams({ page });
    if (type)  params.set('type', type);
    if (genre) params.set('genre', genre);
    return this.fetch(`/comic/komikindo/library?${params}`);
  },

  // GET /comic/komikindo/genres
  getGenres() {
    return this.fetch('/comic/komikindo/genres');
  },

  // GET /comic/komikindo/search/:query/:page
  search(query, page = 1) {
    return this.fetch(`/comic/komikindo/search/${encodeURIComponent(query)}/${page}`);
  },

  // GET /comic/komikindo/detail/:slug → { data: { id, title, image, rating, detail:{status,author,type}, genres[], description, firstChapter, chapters[] } }
  getDetail(slug) {
    return this.fetch(`/comic/komikindo/detail/${slug}`);
  },

  // GET /comic/komikindo/chapter/:slug → { data: { navigation:{prev,next}, images:[{id,url}] } }
  getChapter(slug) {
    return this.fetch(`/comic/komikindo/chapter/${slug}`);
  },
};
