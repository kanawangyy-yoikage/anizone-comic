/* =============================================
   APP.JS — Entry Point & Bootstrap
   ============================================= */

// ---- Keyboard shortcut: "/" focuses search ----
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== document.getElementById('search-input')) {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  homeController.load();
});
