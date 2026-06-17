/* =============================================
   ROUTER.JS — View Management & Navigation
   ============================================= */

const router = (() => {
  const VIEWS = ['home', 'browse', 'trending', 'search', 'detail', 'reader'];

  // Track history for back navigation
  const history = [];
  let current = null;

  /**
   * Navigate to a view
   * @param {string} viewName
   * @param {boolean} [pushHistory=true]
   */
  function go(viewName, pushHistory = true) {
    if (!VIEWS.includes(viewName)) {
      console.warn(`[Router] Unknown view: ${viewName}`);
      return;
    }

    // Hide all views
    VIEWS.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.style.display = 'none';
    });

    // Show target view
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.style.display = 'block';

    // Track history
    if (pushHistory && current && current !== viewName) {
      history.push(current);
    }

    current = viewName;
    updateNavActive(viewName);
    window.scrollTo(0, 0);
  }

  /**
   * Go back to previous view
   */
  function back() {
    const prev = history.pop();
    if (prev) go(prev, false);
    else go('home', false);
  }

  /**
   * Get current view name
   * @returns {string}
   */
  function getCurrent() {
    return current;
  }

  /**
   * Update active state on nav buttons
   * @param {string} viewName
   */
  function updateNavActive(viewName) {
    const navMap = { home: 'nav-home', browse: 'nav-browse', trending: 'nav-trending' };
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeId = navMap[viewName];
    if (activeId) document.getElementById(activeId)?.classList.add('active');
  }

  return { go, back, getCurrent };
})();
