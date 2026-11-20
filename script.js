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

  /* Contact form: validated in the browser, delivered to email by FormSubmit */
  var form = $('#contact-form'), status = $('#form-status');
  var nameEl = $('#name'), emailEl = $('#email'), msgEl = $('#message');
  var NAME_RE = /^\p{L}[\p{L}\s'.\-]{1,59}$/u;
  var EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

  function setStatus(m, t) { status.textContent = m; status.className = 'text-sm ' + (t || ''); }
  function fieldError(el, msg) {
    var err = el.parentNode.querySelector('.field-err');
    if (!msg) { if (err) err.remove(); el.classList.remove('invalid'); el.removeAttribute('aria-invalid'); return; }
    if (!err) { err = document.createElement('p'); err.className = 'field-err'; el.parentNode.appendChild(err); }
    err.textContent = msg;
    el.classList.add('invalid');
    el.setAttribute('aria-invalid', 'true');
  }
  function checkName() {
    var v = nameEl.value.trim();
    if (!v) return 'Enter your name';
    if (!NAME_RE.test(v)) return 'Use letters only, at least 2 characters';
    return '';
  }
  function checkEmail() {
    var v = emailEl.value.trim();
    if (!v) return 'Enter your email address';
    if (v.length > 254 || v.indexOf('..') !== -1 || /^\.|\.@/.test(v) || !EMAIL_RE.test(v)) return 'Enter a valid email address, like name@example.com';
    return '';
  }
  function checkMsg() {
    var v = msgEl.value.trim();
    if (!v) return 'Write a message';
    if (v.length < 10) return 'Write at least 10 characters';
    return '';
  }

  /* Numbers and symbols cannot be typed into the name field */
  nameEl.addEventListener('input', function () {
    var cleaned = nameEl.value.replace(/[^\p{L}\s'.\-]/gu, '');
    if (cleaned !== nameEl.value) nameEl.value = cleaned;
    fieldError(nameEl, '');
  });
  emailEl.addEventListener('input', function () { fieldError(emailEl, ''); });
  msgEl.addEventListener('input', function () { fieldError(msgEl, ''); });
  nameEl.addEventListener('blur', function () { if (nameEl.value) fieldError(nameEl, checkName()); });
  emailEl.addEventListener('blur', function () { if (emailEl.value) fieldError(emailEl, checkEmail()); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var checks = [[nameEl, checkName()], [emailEl, checkEmail()], [msgEl, checkMsg()]];
    var firstBad = null;
    checks.forEach(function (c) { fieldError(c[0], c[1]); if (c[1] && !firstBad) firstBad = c[0]; });
    if (firstBad) { setStatus('', ''); firstBad.focus(); return; }
    if ($('[name="_honey"]', form).value) return;

    var data = new FormData(form);
    data.set('name', nameEl.value.trim());
    data.set('email', emailEl.value.trim());
    data.set('message', msgEl.value.trim());
    data.append('_subject', 'Portfolio message from ' + nameEl.value.trim());
    data.append('_template', 'table');

    var btn = $('button[type="submit"]', form);
    btn.disabled = true; setStatus('Sending', '');
    fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        var success = res.ok && (res.j.success === true || res.j.success === 'true');
        if (!success) throw new Error(res.j.message || 'failed');
        form.reset();
        setStatus('Message sent, I will reply by email', 'ok');
      })
      .catch(function () { setStatus('Could not send, please email me directly', 'err'); })
      .then(function () { btn.disabled = false; });
  });
})();
