/* =============================================================================
   ConsumeIT — Analytics
   Loads whichever vendors are configured in config.js and exposes one
   vendor-agnostic API:  ConsumeITAnalytics.track('whatsapp_click', {...})

   Nothing loads unless an ID is present, so an unconfigured site ships zero
   third-party requests. No fake/placeholder IDs are ever sent.
   ============================================================================= */
(function (w, d) {
  'use strict';

  var cfg = (w.CONSUMEIT && w.CONSUMEIT.analytics) || {};
  var loaded = { ga4: false, gtm: false, meta: false, clarity: false };

  function inject(src, attrs) {
    var s = d.createElement('script');
    s.async = true;
    s.src = src;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    d.head.appendChild(s);
    return s;
  }

  /* --- GA4 ---------------------------------------------------------------- */
  if (cfg.ga4) {
    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
    if (!d.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      inject('https://www.googletagmanager.com/gtag/js?id=' + cfg.ga4);
    }
    w.gtag('js', new Date());
    w.gtag('config', cfg.ga4, { anonymize_ip: true });
    loaded.ga4 = true;
  }

  /* --- Google Tag Manager -------------------------------------------------- */
  if (cfg.gtm) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    inject('https://www.googletagmanager.com/gtm.js?id=' + cfg.gtm);
    loaded.gtm = true;
  }

  /* --- Meta Pixel ---------------------------------------------------------- */
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

  /* --- Microsoft Clarity --------------------------------------------------- */
  if (cfg.clarity) {
    (function (c, l, a, r, i) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      var t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      var y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(w, d, 'clarity', 'script', cfg.clarity);
    loaded.clarity = true;
  }

  /* --- Public API ---------------------------------------------------------- */
  var Analytics = {
    /**
     * Fan one semantic event out to every configured vendor.
     * @param {string} name  e.g. 'whatsapp_click'
     * @param {object} [params]  e.g. { location: 'hero', service: 'seo' }
     */
    track: function (name, params) {
      var p = params || {};
      if (cfg.debug) console.info('[analytics]', name, p);

      if (loaded.ga4 && w.gtag) w.gtag('event', name, p);
      if (loaded.gtm && w.dataLayer) w.dataLayer.push(Object.assign({ event: name }, p));
      if (loaded.meta && w.fbq) w.fbq('trackCustom', name, p);
      if (loaded.clarity && w.clarity) w.clarity('event', name);
    },

    /** Convenience for form funnels. */
    formStart: function (formId) { this.track('form_start', { form_id: formId }); },
    formSubmit: function (formId, extra) {
      this.track('form_submit', Object.assign({ form_id: formId }, extra || {}));
    }
  };

  w.ConsumeITAnalytics = Analytics;

  /* --- Declarative tracking ------------------------------------------------
     Any element can opt in without bespoke JS:
       <a data-track="pricing_cta_click" data-track-label="seo-monthly">
     Runs in capture phase so it fires before navigation.
     ------------------------------------------------------------------------ */
  d.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el) return;

    var params = {};
    if (el.dataset.trackLabel) params.label = el.dataset.trackLabel;
    if (el.dataset.trackLocation) params.location = el.dataset.trackLocation;

    Analytics.track(el.dataset.track, params);
  }, true);

  /* Auto-instrument the three channels that matter most, wherever they appear. */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-track')) return;

    var href = a.getAttribute('href') || '';
    if (href.indexOf('mailto:') === 0)      Analytics.track('email_click');
    else if (href.indexOf('tel:') === 0)    Analytics.track('phone_click');
    else if (href.indexOf('wa.me') > -1)    Analytics.track('whatsapp_click');
  }, true);
})(window, document);
