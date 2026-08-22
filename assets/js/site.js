/* =============================================================================
   ConsumeIT — Site behaviour
   Vanilla JS, no dependencies. Every module is optional and self-guarding.
   ============================================================================= */
(function (w, d) {
  'use strict';

  var C = w.CONSUMEIT || {};
  var A = w.ConsumeITAnalytics || { track: function () {} };
  var reduceMotion = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (sel, root) { return (root || d).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); };

  /* -------------------------------------------------------------------------
     Sticky header shadow
     ------------------------------------------------------------------------- */
  (function stickyHeader() {
    var header = $('.site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', w.scrollY > 8);
    };
    onScroll();
    w.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* -------------------------------------------------------------------------
     Mobile drawer — focus-trapped, Esc to close, restores focus
     ------------------------------------------------------------------------- */
  (function drawer() {
    var drawerEl = $('#drawer');
    var openers  = $$('[data-drawer="open"]');
    var closers  = $$('[data-drawer="close"]');
    if (!drawerEl || !openers.length) return;

    var lastFocus = null;

    function setOpen(open) {
      drawerEl.dataset.open = String(open);
      d.body.classList.toggle('is-locked', open);
      openers.forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });

      if (open) {
        lastFocus = d.activeElement;
        /* Force the visibility change to be applied before focusing — a
           visibility:hidden element silently refuses focus. */
        void drawerEl.offsetHeight;
        var first = drawerEl.querySelector('a, button');
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    }

    openers.forEach(function (b) { b.addEventListener('click', function () { setOpen(true); }); });
    closers.forEach(function (b) { b.addEventListener('click', function () { setOpen(false); }); });
    $$('a', drawerEl).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });

    d.addEventListener('keydown', function (e) {
      if (drawerEl.dataset.open !== 'true') return;

      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;

      var focusables = $$('a[href], button:not([disabled])', drawerEl)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;

      var first = focusables[0];
      var last  = focusables[focusables.length - 1];

      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* A drawer left open across a resize into desktop would trap scroll. */
    w.matchMedia('(min-width: 1024px)').addEventListener('change', function (ev) {
      if (ev.matches && drawerEl.dataset.open === 'true') setOpen(false);
    });
  })();

  /* -------------------------------------------------------------------------
     Reveal on scroll + one-shot number counters
     ------------------------------------------------------------------------- */
  (function reveal() {
    var targets = $$('.reveal, [data-count]');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in w)) {
      targets.forEach(function (el) {
        el.classList.add('is-revealed');
        if (el.dataset.count) el.textContent = el.dataset.count;
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-revealed');
        if (el.dataset.count) countUp(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    targets.forEach(function (el) { io.observe(el); });

    function countUp(el) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      var decimals = (String(el.dataset.count).split('.')[1] || '').length;
      var duration = 1400;
      var start = null;

      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = target.toFixed(decimals);
      }
      requestAnimationFrame(frame);
    }
  })();

  /* -------------------------------------------------------------------------
     FAQ accordion — button + aria-expanded + grid-rows transition
     ------------------------------------------------------------------------- */
  (function accordion() {
    /* Height is animated in pixels and then released to `auto`, so a panel
       stays correct when the viewport reflows its content. */
    var DURATION = 300;

    function expand(panel) {
      if (reduceMotion) { panel.style.height = 'auto'; return; }

      panel.style.height = panel.scrollHeight + 'px';

      /* Release to `auto` so the panel stays correct if the text rewraps later.
         transitionend alone is not enough — it never fires when a transition is
         interrupted (a fast double-click, a background tab), so a timer
         guarantees the panel always reaches its resting state. */
      var settle = function () {
        clearTimeout(panel._t);
        panel.removeEventListener('transitionend', settle);
        if (panel.dataset.open === 'true') panel.style.height = 'auto';
      };
      panel.addEventListener('transitionend', settle);
      panel._t = setTimeout(settle, DURATION + 60);
    }

    function collapse(panel) {
      clearTimeout(panel._t);
      panel.style.height = panel.scrollHeight + 'px';
      void panel.offsetHeight;               // force a reflow so 0 animates
      panel.style.height = '0px';
    }

    $$('.faq__q').forEach(function (btn) {
      var panel = d.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.dataset.open = String(!open);

        if (open) collapse(panel);
        else {
          expand(panel);
          A.track('faq_open', { label: btn.textContent.trim().slice(0, 60) });
        }
      });
    });
  })();

  /* -------------------------------------------------------------------------
     Pricing category filter — pure client-side, no layout shift
     ------------------------------------------------------------------------- */
  (function priceFilter() {
    var bar = $('#price-filters');
    if (!bar) return;
    var groups = $$('.price-group');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var key = btn.dataset.filter;

      $$('button', bar).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      groups.forEach(function (g) {
        g.hidden = !(key === 'all' || g.dataset.category === key);
      });
      A.track('pricing_filter', { label: key });
    });
  })();

  /* -------------------------------------------------------------------------
     Contact channels — inject configured links, hide unconfigured ones
     ------------------------------------------------------------------------- */
  (function channels() {
    var links = C.links || {};

    $$('[data-link]').forEach(function (el) {
      var href = links[el.dataset.link];
      if (href) {
        el.setAttribute('href', href);
        if (/^https?:/.test(href)) { el.target = '_blank'; el.rel = 'noopener'; }
      } else if (el.dataset.linkOptional !== undefined) {
        el.remove();
      } else {
        el.setAttribute('href', '/contact.html');
      }
    });

    $$('[data-text]').forEach(function (el) {
      var path = el.dataset.text.split('.');
      var val = path.reduce(function (acc, k) { return acc && acc[k]; }, C);
      if (val) el.textContent = val;
    });

    /* Social links: drop any anchor whose profile isn't configured. */
    $$('[data-social]').forEach(function (el) {
      var url = (C.social || {})[el.dataset.social];
      if (url) el.setAttribute('href', url);
      else el.remove();
    });
  })();

  /* -------------------------------------------------------------------------
     Floating dock — WhatsApp when configured, contact otherwise
     ------------------------------------------------------------------------- */
  (function dock() {
    var el = $('#dock');
    if (!el) return;

    if (!C.hasWhatsApp) {
      el.setAttribute('href', '/contact.html');
      el.setAttribute('data-track', 'contact_click');
      el.setAttribute('data-track-location', 'dock');
      var label = $('span', el);
      if (label) label.textContent = 'Start a project';
    }

    var show = function () { el.classList.toggle('is-in', w.scrollY > 300); };
    show();
    w.addEventListener('scroll', show, { passive: true });
  })();

  /* -------------------------------------------------------------------------
     Contact form — posts to the configured relay, or composes an email.
     Never silently drops a submission.
     ------------------------------------------------------------------------- */
  (function contactForm() {
    var form = $('#project-form');
    if (!form) return;

    var status = $('#form-status');
    var submit = form.querySelector('button[type="submit"]');
    var started = false;

    form.addEventListener('input', function () {
      if (started) return;
      started = true;
      A.formStart('project-form');
    }, { once: false });

    function say(msg, state) {
      if (!status) return;
      status.hidden = false;
      status.textContent = msg;
      status.dataset.state = state;
    }

    function mailtoFallback(data) {
      var lines = [];
      data.forEach(function (v, k) { if (v) lines.push(k + ': ' + v); });
      var subject = 'Project enquiry — ' + (data.get('name') || 'Website');
      return 'mailto:' + C.contact.email +
             '?subject=' + encodeURIComponent(subject) +
             '&body=' + encodeURIComponent(lines.join('\n'));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var payload = {
        service: data.get('service') || '',
        budget: data.get('budget') || ''
      };

      if (!C.formEndpoint) {
        A.formSubmit('project-form', Object.assign({ transport: 'mailto' }, payload));
        say('Opening your email app with the details filled in — just hit send.', 'ok');
        w.location.href = mailtoFallback(data);
        return;
      }

      submit.disabled = true;
      var original = submit.textContent;
      submit.textContent = 'Sending…';

      fetch(C.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          A.formSubmit('project-form', Object.assign({ transport: 'endpoint' }, payload));
          form.reset();
          started = false;
          say('Thanks — your brief is in. We reply within one business day.', 'ok');
        })
        .catch(function () {
          say('That didn’t go through. Email us at ' + C.contact.email + ' and we’ll pick it up right away.', 'err');
        })
        .finally(function () {
          submit.disabled = false;
          submit.textContent = original;
        });
    });
  })();

  /* -------------------------------------------------------------------------
     Copyright year
     ------------------------------------------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})(window, document);
