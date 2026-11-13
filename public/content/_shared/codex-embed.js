// Shared runtime for interactive codex entries.
//  - applies the host app's theme (?theme=dark, then live via postMessage)
//  - reports document height so the host iframe can size itself
(function () {
  var params = new URLSearchParams(location.search);
  var root = document.documentElement;
  root.dataset.theme = params.get('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'codex:theme') {
      root.dataset.theme = e.data.theme;
      window.dispatchEvent(new CustomEvent('codex:theme', { detail: e.data.theme }));
    }
  });

  var last = 0;
  function report() {
    var h = Math.ceil(document.documentElement.scrollHeight);
    if (h !== last && window.parent !== window) {
      last = h;
      window.parent.postMessage({ type: 'codex:height', height: h }, '*');
    }
  }
  new ResizeObserver(report).observe(document.documentElement);
  window.addEventListener('load', report);

  /** Read a CSS custom property — handy for canvas drawing that should follow the theme. */
  window.codexColor = function (name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  };
})();
