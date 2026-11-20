(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Theme */
  var themeBtn = $('#theme-toggle');
  function themeLabel() { themeBtn.setAttribute('aria-label', root.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode'); }
  themeLabel();
  themeBtn.addEventListener('click', function () {
    root.classList.toggle('dark');
    try { localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch (e) {}
    themeLabel();
  });

  /* Mobile menu */
  var menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Current section in nav + number tween */
  if ('IntersectionObserver' in window) {
    var links = $$('.nav-link');
    var nav = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) nav.observe(s); });

    var cnt = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cnt.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, t0 = null;
        if (reduce) { el.textContent = to; return; }
        (function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 800, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cnt.observe(el); });
  } else {
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* Triage board */
  var bugs = [
    { t: 'Login fails after token refresh', s: 'critical', w: 4 },
    { t: 'Report export times out at 10k rows', s: 'major', w: 3 },
    { t: 'Role change not applied until re-login', s: 'major', w: 2 },
    { t: 'Wrong date format on invoices', s: 'minor', w: 1 }
  ];
  var list = $('#bugs'), verdict = $('#verdict'), ringFill = $('#ring-fill'), ringText = $('#ring-text');
  var C = 263.9, total = bugs.reduce(function (a, b) { return a + b.w; }, 0);

  function render() {
    list.innerHTML = '';
    bugs.forEach(function (b) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bug' + (b.fixed ? ' fixed' : '');
      btn.setAttribute('aria-pressed', String(!!b.fixed));
      btn.innerHTML = '<span class="dot ' + b.s + '"></span><span class="bug-title"></span><span class="meta bug-sev">' + (b.fixed ? 'fixed' : b.s) + '</span>';
      btn.querySelector('.bug-title').textContent = b.t;
      btn.addEventListener('click', function () { b.fixed = !b.fixed; render(); });
      li.appendChild(btn);
      list.appendChild(li);
    });
    var open = bugs.filter(function (b) { return !b.fixed; });
    var pct = Math.round(100 * (total - open.reduce(function (a, b) { return a + b.w; }, 0)) / total);
    var crit = open.some(function (b) { return b.s === 'critical'; });
    var state = crit ? 'blocked' : open.length ? 'risk' : 'ready';
    var msg = crit ? 'Blocked, a critical defect is open'
      : open.length ? 'At risk, ' + open.length + ' known issue' + (open.length > 1 ? 's' : '') + ' need sign-off'
      : 'Ready to release';
    ringFill.style.strokeDashoffset = C * (1 - pct / 100);
    ringFill.style.stroke = 'rgb(var(--' + (crit ? 'neg' : open.length ? 'warn' : 'pos') + '))';
    ringText.textContent = pct + '%';
    verdict.className = 'verdict ' + state;
    verdict.innerHTML = '<span class="dot"></span><span></span>';
    verdict.lastChild.textContent = msg;
  }
  $('#reset').addEventListener('click', function () { bugs.forEach(function (b) { b.fixed = false; }); render(); });
  render();

  /* Skill filters */
  var chips = $$('.chip'), pills = $$('#skill-list li');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
      var f = c.dataset.filter;
      pills.forEach(function (p) { p.classList.toggle('dim', f !== 'all' && p.dataset.cat !== f); });
    });
  });

  $('#year').textContent = new Date().getFullYear();

  /* Contact form (Formspree / Web3Forms ready) */
  var form = $('#contact-form'), status = $('#form-status');
  function setStatus(m, t) { status.textContent = m; status.className = 'text-sm ' + (t || ''); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var good = f.value.trim() !== '' && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle('invalid', !good);
      if (!good) ok = false;
    });
    if (!ok) { setStatus('Add your name, a valid email and a message', 'err'); return; }
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) { setStatus('Form endpoint not set yet. Add your Formspree or Web3Forms URL in index.html', 'err'); return; }
    var btn = $('button[type="submit"]', form);
    btn.disabled = true; setStatus('Sending', '');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); form.reset(); setStatus('Message sent', 'ok'); })
      .catch(function () { setStatus('Could not send, please email me directly', 'err'); })
      .then(function () { btn.disabled = false; });
  });
  $$('.field', form).forEach(function (f) { f.addEventListener('input', function () { f.classList.remove('invalid'); }); });
})();
