  comicCard(comic) {
    const title = comic.title || 'Tanpa Judul';
    const thumb = comic.image || comic.thumbnail || comic.cover || '';
    const type  = comic.type  || '';
    const chap  = comic.chapters?.[0]?.title || comic.latest_chapter || comic.chapter || '';
    const slug  = comic.slug || comic.id || comic._id || '';

    return `
      <div class="comic-card" data-slug="${slug}">
        ${thumb
          ? `<img class="comic-thumb" src="${thumb}" alt="${title}" loading="lazy"
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
