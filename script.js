// Daiyan Kabir — Portfolio Theme Toggle & Header
(function () {
  var toggle = document.querySelector('[data-theme-toggle]');
  var root = document.documentElement;
  var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = dark ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function updateIcon() {
    if (theme === 'dark') {
      toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      toggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      toggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  updateIcon();

  toggle.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateIcon();
  });
})();

// Header shadow on scroll
(function () {
  var header = document.getElementById('header');
  if (!header) return;
  var scrolled = false;
  window.addEventListener('scroll', function () {
    var should = window.scrollY > 4;
    if (should !== scrolled) {
      scrolled = should;
      header.classList.toggle('scrolled', should);
    }
  }, { passive: true });
})();
