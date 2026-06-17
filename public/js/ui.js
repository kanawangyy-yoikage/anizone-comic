/* =============================================
   UI.JS — DOM Helpers & Rendering Functions
   ============================================= */

const ui = {
  el(id) { return document.getElementById(id); },

  loading(containerId) {
    this.el(containerId).innerHTML =
      `<div class="loading"><div class="spinner"></div>Memuat...</div>`;
  },

  error(containerId, msg = 'Gagal memuat data') {
    this.el(containerId).innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
  },

  typeBadge(type = '') {
    if (!type) return '';
    const t = type.toLowerCase();
    const cls = t === 'manga' ? 'badge-manga' : t === 'manhwa' ? 'badge-manhwa' : 'badge-manhua';
    return `<span class="badge ${cls}">${type}</span>`;
  },

  comicCard(comic) {
    const title = comic.title || 'Tanpa Judul';
    const thumb = comic.image || comic.thumbnail || comic.cover || '';
    const type  = comic.type  || '';
    // /latest punya chapters[], /library tidak — handle keduanya
    const chap  = comic.chapters?.[0]?.title || comic.latest_chapter || comic.chapter || '';
    const slug  = comic.slug || comic.id || '';

    const safeSlug  = slug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeTitle = title.replace(/"/g, '&quot;');

    return `
      <div class="comic-card" onclick="detailController.open('${safeSlug}')">
        ${thumb
          ? `<img class="comic-thumb" src="${thumb}" alt="${safeTitle}" loading="lazy"
                  onerror="this.outerHTML='<div class=comic-thumb-placeholder>📚</div>'">`
          : `<div class="comic-thumb-placeholder">📚</div>`}
        <div class="comic-info">
          <div class="comic-title">${title}</div>
          <div class="comic-meta">
            ${this.typeBadge(type)}
            ${chap ? `<span class="chapter-badge">${chap}</span>` : ''}
          </div>
        </div>
      </div>`;
  },

  renderGrid(containerId, comics) {
    const el = this.el(containerId);
    if (!comics || comics.length === 0) {
      el.innerHTML = '<div class="loading" style="color:var(--muted)">Tidak ada data ditemukan.</div>';
      return;
    }
    el.innerHTML = comics.map(c => this.comicCard(c)).join('');
  },

  renderPagination(containerId, current, total, onPage) {
    const el = this.el(containerId);
    if (total <= 1) { el.innerHTML = ''; return; }
    const clamped = Math.min(total, 50);
    const start   = Math.max(1, current - 2);
    const end     = Math.min(clamped, current + 2);
    let html = '';
    if (start > 1) {
      html += btn(1); if (start > 2) html += '<span style="color:var(--muted);padding:0 .25rem">…</span>';
    }
    for (let i = start; i <= end; i++) html += btn(i);
    if (end < clamped) {
      if (end < clamped - 1) html += '<span style="color:var(--muted);padding:0 .25rem">…</span>';
      html += btn(clamped);
    }
    el.innerHTML = html;
    function btn(page) {
      return `<button class="page-btn${page === current ? ' active' : ''}"
        onclick="(${onPage.toString()})(${page})">${page}</button>`;
    }
  },

  renderDetail(comic, chapters, onChapter) {
    const title   = comic.title   || 'Tanpa Judul';
    const thumb   = comic.image   || comic.thumbnail || '';
    const type    = comic.type    || '';
    const status  = comic.status  || '';
    const author  = comic.author  || '';
    const synopsis = comic.synopsis || '';
    // genres dari detail: [{ name, slug }]
    const genres  = Array.isArray(comic.genres) ? comic.genres : [];

    const genreHTML = genres
      .map(g => `<span class="badge badge-genre">${typeof g === 'object' ? g.name : g}</span>`)
      .join('');

    const metaRows = [
      author ? `<div class="detail-meta-row"><span>Author</span><span>${author}</span></div>` : '',
      status ? `<div class="detail-meta-row"><span>Status</span><span>${status}</span></div>` : '',
      comic.rating ? `<div class="detail-meta-row"><span>Rating</span><span>⭐ ${comic.rating}</span></div>` : '',
    ].join('');

    const chaptersHTML = chapters.length > 0
      ? chapters.map((ch, i) => {
          const cSlug = ch.slug || '';
          const name  = ch.title || ch.name || `Chapter ${i + 1}`;
          const date  = ch.date  || ch.released || '';
          const safe  = cSlug.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return `
            <div class="chapter-item" onclick="(${onChapter.toString()})('${safe}', ${i})">
              <span class="chapter-name">${name}</span>
              <span class="chapter-date">${date}</span>
            </div>`;
        }).join('')
      : '<div class="empty-chapters">Belum ada chapter tersedia</div>';

    return `
      <div class="detail-header">
        <div class="detail-cover">
          ${thumb ? `<img src="${thumb}" alt="${title.replace(/"/g,'&quot;')}" loading="lazy">` : '<div class="no-cover">📚</div>'}
        </div>
        <div class="detail-info">
          <div class="detail-title">${title}</div>
          <div class="detail-badges">
            ${this.typeBadge(type)}
            ${status ? `<span class="badge badge-status">${status}</span>` : ''}
          </div>
          ${metaRows}
          ${genreHTML ? `<div class="detail-genres">${genreHTML}</div>` : ''}
          ${synopsis ? `<div class="detail-synopsis">${synopsis}</div>` : ''}
        </div>
      </div>
      <div class="chapter-list-header">📋 ${chapters.length} Chapter</div>
      <div class="chapter-list">${chaptersHTML}</div>
    `;
  },

  renderReader(containerId, images) {
    const el = this.el(containerId);
    if (!images || images.length === 0) {
      el.innerHTML = '<div class="error-msg">Tidak ada gambar untuk chapter ini.</div>';
      return;
    }
    // images dari chapter API: [{ id, url }]
    el.innerHTML = images.map((img, idx) => {
      const src = typeof img === 'string' ? img : img.url || img.src || img.image || '';
      if (!src) return '';
      return `<img src="${src}" alt="Halaman ${idx + 1}"
        loading="${idx < 3 ? 'eager' : 'lazy'}"
        onerror="this.style.display='none'">`;
    }).filter(Boolean).join('');
  },
};
