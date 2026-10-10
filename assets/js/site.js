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
     Scroll reveal — [data-reveal] (and drawn .strike/.sq) get .is-in at ~12%.
     The `js` class is what lets CSS hide them at all, so without JS (or with
     reduced motion / no IntersectionObserver) everything is simply visible.
     ------------------------------------------------------------------------- */
  d.documentElement.classList.add('js');
  (function reveal() {
    var els = $$('[data-reveal]').concat($$('.strike, .sq').filter(function (el) { return !el.closest('[data-reveal]'); }));
    if (!els.length) return;
    var showAll = function () { els.forEach(function (el) { el.classList.add('is-in'); }); };
    if (reduceMotion || !('IntersectionObserver' in w)) { showAll(); return; }
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    } catch (err) { showAll(); }
  })();

  /* -------------------------------------------------------------------------
     Sticky header — toggles .is-stuck once the page has scrolled
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
     FAQ accordion — button + aria-expanded; CSS animates the grid rows.
     ------------------------------------------------------------------------- */
  $$('.faq__q').forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.dataset.open = String(!open);
      if (!open) A.track('faq_open', { label: btn.textContent.trim().slice(0, 60) });
    });
  });

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
     Floating "Let's Talk" dock — a plain link to /contact.html, shown once the
     page has scrolled 400px. Not shown on the contact page itself.
     ------------------------------------------------------------------------- */
  (function dock() {
    var el = $('#dock');
    if (!el) return;
    if (/\/contact(\.html)?\/?$/.test(w.location.pathname)) { el.hidden = true; return; }

    var show = function () { el.classList.toggle('is-in', w.scrollY > 400); };
    show();
    w.addEventListener('scroll', show, { passive: true });
  })();

  /* -------------------------------------------------------------------------
     Contact form — posts to the configured relay, or composes an email.
     With no relay configured the page says plainly that it opens the visitor's
     email app, and it never claims a message was sent when it was not.
     Also: the optional "Copy address" button next to the email link.
     ------------------------------------------------------------------------- */
  (function contactForm() {
    var email = (C.contact && C.contact.email) || 'consumeit.services@gmail.com';

    /* Analytics must never be able to break the form. */
    function track(fn, a, b) {
      try { if (A && typeof A[fn] === 'function') A[fn](a, b); } catch (err) { /* ignore */ }
    }

    /* Copy-address button: hidden in the HTML, shown only where it can work. */
    (function copyEmail() {
      var btn = $('[data-copy-email]');
      if (!btn) return;
      if (!(w.navigator && w.navigator.clipboard && w.navigator.clipboard.writeText)) return;
      var live = $('[data-copy-status]');
      var label = btn.textContent;
      var timer = null;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        w.navigator.clipboard.writeText(email).then(function () {
          btn.textContent = 'Copied';
          if (live) live.textContent = 'Email address copied.';
        }, function () {
          if (live) live.textContent = 'Could not copy. The address is ' + email + '.';
        }).then(function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            btn.textContent = label;
            if (live) live.textContent = '';
          }, 2500);
        });
      });
    })();

    var form = $('#project-form');
    if (!form) return;

    var status = $('#form-status');
    var mode = $('#form-mode');
    var submit = form.querySelector('button[type="submit"]');
    var started = false;

    /* The HTML describes the email-app route (the honest default). If a relay
       has been configured, the visitor is told the message goes to our inbox. */
    if (C.formEndpoint) {
      if (submit) submit.textContent = 'Send my message';
      if (mode) mode.textContent = 'Your message goes straight to our inbox and we reply to you by email.';
    }

    form.addEventListener('input', function () {
      if (started) return;
      started = true;
      track('formStart', 'project-form');
    });

    function say(msg, state) {
      if (!status) return;
      status.hidden = false;
      status.textContent = msg;
      status.dataset.state = state;
    }

    /* Plain-language labels for the email body, in reading order. */
    var FIELDS = [
      ['name', 'Name'], ['email', 'Email'], ['company', 'Business or brand'],
      ['website', 'Website or social link'], ['country', 'Country'], ['service', 'What I need']
    ];

    function value(data, key) { return String(data.get(key) || '').trim(); }

    function mailtoFallback(data) {
      var lines = [];
      FIELDS.forEach(function (f) {
        var v = value(data, f[0]);
        if (v) lines.push(f[1] + ': ' + v);
      });
      var message = value(data, 'message');
      var body = (message ? message + '\n\n' : '') + lines.join('\n');
      var subject = 'Enquiry from ' + (value(data, 'name') || 'the Consumeit website');
      return 'mailto:' + email +
             '?subject=' + encodeURIComponent(subject) +
             '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var data = new FormData(form);
      var payload = { service: value(data, 'service') };

      if (!C.formEndpoint) {
        track('formSubmit', 'project-form', Object.assign({ transport: 'mailto' }, payload));
        say('Your email app should open now with your message ready. Press send there to finish. ' +
            'Nothing has been sent yet. If nothing opens, write to ' + email + '.', 'info');
        w.location.href = mailtoFallback(data);
        return;
      }

      var original = submit ? submit.textContent : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
      var done = function () {
        if (submit) { submit.disabled = false; submit.textContent = original; }
      };

      fetch(C.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          track('formSubmit', 'project-form', Object.assign({ transport: 'endpoint' }, payload));
          form.reset();
          started = false;
          say('Thanks. Your message has been sent. We will reply to you by email.', 'ok');
          done();
        })
        .catch(function () {
          say('That did not go through, so your message has not been sent. Please email us at ' + email + '.', 'err');
          done();
        });
    });
  })();

  /* -------------------------------------------------------------------------
     Motion — scroll-linked [data-p] / [data-scrub], page progress hairline,
     [data-pointer] parallax, and the pause toggle. One rAF-throttled passive
     scroll handler; only elements near the viewport are touched. Reduced
     motion or html[data-motion="paused"]: nothing animates, --p stays 1.
     ------------------------------------------------------------------------- */
  (function motion() {
    var root = d.documentElement;
    var hdr = $('.site-header');
    var els = $$('[data-p], [data-scrub]');
    var live = [], rests = [], tick = 0;
    var on = function () { return !reduceMotion && root.dataset.motion !== 'paused'; };
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

    function upd(el, force) {
      var r = el.getBoundingClientRect(), vh = w.innerHeight;
      var p = on() ? clamp((vh * 0.85 - r.top) / (vh * 0.45 + r.height)) : 1;
      if (el._p === p && !force) return;
      el._p = p;
      if (el.hasAttribute('data-p')) el.style.setProperty('--p', p.toFixed(3));
      if (el._w) el._w.forEach(function (s, i) {
        s.style.opacity = (0.28 + 0.72 * clamp((p * (el._w.length + 4) - i) / 4)).toFixed(2);
      });
    }

    function frame() {
      tick = 0;
      if (hdr) {
        var h = root.scrollHeight - w.innerHeight;
        hdr.style.setProperty('--page-p', on() && h > 0 ? clamp(w.scrollY / h).toFixed(3) : '0');
      }
      live.forEach(function (el) { upd(el); });
    }
    function queue() { if (!tick) tick = w.requestAnimationFrame(frame); }

    if (!reduceMotion) {
      els.forEach(function (el) {
        if (!el.hasAttribute('data-scrub')) return;
        el._w = [];
        var tw = d.createTreeWalker(el, 4), nodes = [], n;
        while ((n = tw.nextNode())) nodes.push(n);
        nodes.forEach(function (t) {
          var f = d.createDocumentFragment();
          t.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { f.appendChild(d.createTextNode(part)); return; }
            var sp = d.createElement('span');
            sp.className = 'w';
            sp.textContent = part;
            el._w.push(sp);
            f.appendChild(sp);
          });
          t.parentNode.replaceChild(f, t);
        });
      });
      els.forEach(function (el) { upd(el); });

      if ('IntersectionObserver' in w) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            var i = live.indexOf(e.target);
            if (e.isIntersecting) { if (i < 0) live.push(e.target); }
            else { if (i >= 0) live.splice(i, 1); upd(e.target); }
          });
          queue();
        }, { rootMargin: '25% 0px' });
        els.forEach(function (el) { io.observe(el); });
      } else { live = els; }

      w.addEventListener('scroll', queue, { passive: true });
      w.addEventListener('resize', queue, { passive: true });
      queue();
    }

    if (!reduceMotion && w.matchMedia('(pointer: fine)').matches) {
      $$('[data-pointer]').forEach(function (el) {
        var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
        function go() {
          cx += (tx - cx) * 0.12;
          cy += (ty - cy) * 0.12;
          var done = Math.abs(tx - cx) + Math.abs(ty - cy) < 0.002;
          if (done) { cx = tx; cy = ty; }
          el.style.setProperty('--mx', cx.toFixed(3));
          el.style.setProperty('--my', cy.toFixed(3));
          raf = done ? 0 : w.requestAnimationFrame(go);
        }
        function aim(x, y) { tx = x; ty = y; if (!raf) raf = w.requestAnimationFrame(go); }
        el.addEventListener('pointermove', function (e) {
          if (!on()) return;
          var r = el.getBoundingClientRect();
          aim(clamp((e.clientX - r.left) / r.width) * 2 - 1, clamp((e.clientY - r.top) / r.height) * 2 - 1);
        });
        el.addEventListener('pointerleave', function () { aim(0, 0); });
        rests.push(function () { aim(0, 0); });
      });
    }

    var tg = $('#motion-toggle');
    if (tg) tg.addEventListener('click', function () {
      var pause = tg.getAttribute('aria-pressed') !== 'true';
      tg.setAttribute('aria-pressed', String(pause));
      if (pause) root.dataset.motion = 'paused'; else root.removeAttribute('data-motion');
      rests.forEach(function (fn) { fn(); });
      els.forEach(function (el) { upd(el, true); });
      queue();
    });
  })();

  /* -------------------------------------------------------------------------
     Copyright year
     ------------------------------------------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})(window, document);
