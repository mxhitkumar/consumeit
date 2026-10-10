/* =============================================================================
   Consumeit — Analytics (consent first)
   Loads whichever vendors are configured in config.js, but ONLY after the
   visitor has said yes on the cookie notice. Until then (or if they say no)
   no third-party analytics script is requested and no cookie is set.

   Public API:  ConsumeITAnalytics.track('contact_click', {...})
   (track() is a silent no-op while analytics is off.)

   The choice is remembered in localStorage under "consumeit_consent".
   The notice is only built when at least one analytics ID is configured.
   ============================================================================= */
(function (w, d) {
  'use strict';

  var cfg = (w.CONSUMEIT && w.CONSUMEIT.analytics) || {};
  var KEY = 'consumeit_consent';
  var loaded = { ga4: false, gtm: false, meta: false, clarity: false };
  var enabled = false;
  var hasVendor = !!(cfg.ga4 || cfg.gtm || cfg.metaPixel || cfg.clarity);

  function read() { try { return w.localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { w.localStorage.setItem(KEY, v); } catch (e) { /* storage blocked: choice lasts this page only */ } }

  function inject(src) {
    var s = d.createElement('script');
    s.async = true;
    s.src = src;
    d.head.appendChild(s);
  }

  /* --- vendors (called once, after consent) ------------------------------- */
  function enable() {
    if (enabled) return;
    enabled = true;

    if (cfg.ga4) {
      w['ga-disable-' + cfg.ga4] = false;
      w.dataLayer = w.dataLayer || [];
      w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
      if (!d.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        inject('https://www.googletagmanager.com/gtag/js?id=' + cfg.ga4);
      }
      w.gtag('js', new Date());
      w.gtag('config', cfg.ga4, { allow_google_signals: false, allow_ad_personalization_signals: false });
      loaded.ga4 = true;
    }
    if (cfg.gtm) {
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      inject('https://www.googletagmanager.com/gtm.js?id=' + cfg.gtm);
      loaded.gtm = true;
    }
    if (cfg.metaPixel) {
      /* eslint-disable */
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      w.fbq('init', cfg.metaPixel);
      w.fbq('track', 'PageView');
      loaded.meta = true;
    }
    if (cfg.clarity) {
      (function (c, l, a, r, i) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        var t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        var y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(w, d, 'clarity', 'script', cfg.clarity);
      loaded.clarity = true;
    }
  }

  function disable() {
    enabled = false;
    if (cfg.ga4) w['ga-disable-' + cfg.ga4] = true; /* stops GA4 sending for the rest of this page */
  }

  /* --- the notice ---------------------------------------------------------- */
  var box = null;

  function choose(value) {
    write(value);
    if (value === 'granted') enable(); else disable();
    if (box) box.hidden = true;
    var opener = d.querySelector('[data-consent="open"]');
    if (opener) opener.focus();
  }

  function build() {
    if (box) return box;
    box = d.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Cookie choice');
    box.hidden = true;

    var h = d.createElement('h2');
    h.id = 'consent-title';
    h.textContent = 'Can we use analytics cookies?';

    var p = d.createElement('p');
    p.appendChild(d.createTextNode('We would like to use Google Analytics to see which pages are useful. It only sets cookies if you say yes. '));
    var a = d.createElement('a');
    a.href = '/privacy.html#cookies';
    a.textContent = 'Read how we use cookies';
    p.appendChild(a);
    p.appendChild(d.createTextNode('.'));

    var row = d.createElement('div');
    row.className = 'consent__row';
    function btn(label, cls, value) {
      var b = d.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + cls;
      b.textContent = label;
      b.addEventListener('click', function () { choose(value); });
      return b;
    }
    row.appendChild(btn('Yes, that is fine', 'btn--primary', 'granted'));
    row.appendChild(btn('No thanks', 'btn--ghost', 'denied'));

    box.setAttribute('aria-labelledby', 'consent-title');
    box.appendChild(h); box.appendChild(p); box.appendChild(row);
    d.body.appendChild(box);
    return box;
  }

  function show() {
    build().hidden = false;
    var first = box.querySelector('button');
    if (first) first.focus();
  }

  function init() {
    if (!hasVendor) return;                       /* nothing to ask about */
    var saved = read();
    if (saved === 'granted') enable();
    else if (saved === null) show();
    d.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest('[data-consent="open"]');
      if (o) { e.preventDefault(); show(); }
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();

  /* --- Public API ---------------------------------------------------------- */
  var Analytics = {
    track: function (name, params) {
      var p = params || {};
      if (cfg.debug) console.info('[analytics]', name, p, enabled ? '' : '(off: no consent)');
      if (!enabled) return;
      if (loaded.ga4 && w.gtag) w.gtag('event', name, p);
      if (loaded.gtm && w.dataLayer) w.dataLayer.push(Object.assign({ event: name }, p));
      if (loaded.meta && w.fbq) w.fbq('trackCustom', name, p);
      if (loaded.clarity && w.clarity) w.clarity('event', name);
    },
    formStart: function (formId) { this.track('form_start', { form_id: formId }); },
    formSubmit: function (formId, extra) {
      this.track('form_submit', Object.assign({ form_id: formId }, extra || {}));
    }
  };
  w.ConsumeITAnalytics = Analytics;

  /* --- Declarative tracking: <a data-track="..." data-track-label="..."> ---- */
  d.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el) return;
    var params = {};
    if (el.dataset.trackLabel) params.label = el.dataset.trackLabel;
    if (el.dataset.trackLocation) params.location = el.dataset.trackLocation;
    Analytics.track(el.dataset.track, params);
  }, true);

  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-track')) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('mailto:') === 0) Analytics.track('email_click');
  }, true);
})(window, document);
