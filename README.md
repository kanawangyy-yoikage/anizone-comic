# AniZone 📚

Baca manga, manhwa, dan manhua — powered by [sankavollerei.web.id](https://www.sankavollerei.web.id/comic/).

## Stack

- Pure HTML / CSS / JS (no framework, no build step)
- REST API: `sankavollerei.web.id/comic/`
- Deploy: Vercel (static)

## Struktur Proyek

```
anizone/
├── index.html              # Entry point, semua view ada di sini
├── vercel.json             # Vercel config (rewrites, headers)
├── .gitignore
├── README.md
└── public/
    ├── css/
    │   ├── base.css        # CSS variables, reset, typography
    │   ├── components.css  # Komponen reusable (card, nav, badge, dll)
    │   └── views.css       # Style per-halaman (detail, reader)
    └── js/
        ├── api.js          # Semua pemanggilan API di satu tempat
        ├── ui.js           # Helper DOM & render functions
        ├── router.js       # Manajemen view & navigasi
        ├── controllers.js  # Logic per-fitur (home, browse, search, dll)
        └── app.js          # Bootstrap & event global
```

## Cara Tambah Fitur Baru

1. **Endpoint baru** → tambah method di `api.js`
2. **Komponen UI baru** → tambah di `ui.js` atau `components.css`
3. **Halaman/view baru** → tambah `<div id="view-namaview">` di `index.html`, daftarkan di `router.js` (`VIEWS` array), buat controller di `controllers.js`

## Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

Atau connect repo GitHub ke Vercel dashboard — auto-deploy setiap push.

## Keyboard Shortcuts

| Shortcut | Aksi |
|----------|------|
| `/`      | Fokus ke search bar |
| `Enter`  | Submit pencarian |
