/*
 * Lightweight bootstrap for the Chart.js treemap integration.
 * This file avoids 404 errors during component loading and warns
 * developers if the required treemap plugin has not been bundled yet.
 */

(function registerTreemapPlugin() {
  if (typeof window === 'undefined') {
    return;
  }

  const chart = window.Chart;
  if (!chart) {
    console.warn('Chart.js is not available. Treemap charts will not render.');
    return;
  }

  const registry = chart.registry;
  const hasTreemap = typeof registry?.getController === 'function' && (() => {
    try {
      registry.getController('treemap');
      return true;
    } catch (error) {
      return false;
    }
  })();

  if (hasTreemap) {
    return; // Treemap support already registered.
  }

  console.warn('Chart.js treemap controller is missing. Consider bundling chartjs-chart-treemap.');
})();
