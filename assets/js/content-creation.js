/* =============================================================================
   ConsumeIT — ₹999 Content Creation campaign
   Static only. No backend, no payment processing, no booking system.

   This file holds the campaign's single configuration block plus the small
   amount of behaviour the landing page needs. It degrades safely: with nothing
   configured, every CTA still reaches a working contact route.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   CONFIGURATION — the only place campaign URLs are defined.
   Fill these in and the whole page rewires itself. Leave them empty and the
   CTAs fall back to WhatsApp, then to the contact page.
   -------------------------------------------------------------------------- */
window.CONTENT_CREATION_CAMPAIGN = {

  /* TODO: ADD PAYMENT URL
     A hosted payment link (Razorpay Payment Page, Instamojo, Stripe Payment
     Link, PhonePe, a Google Form that ends in a UPI QR — anything that lives
     off this site). Example: 'https://rzp.io/l/xxxxxxxx'
     Until this is set, "Book My ₹999 Session" routes to the fallback below. */
  paymentUrl: '',

  /* TODO: ADD BOOKING URL
     Where the buyer picks a slot AFTER paying (Calendly, Google Calendar
     appointment schedule, Cal.com). Used on a thank-you/redirect step later —
     not linked publicly on this page while empty. */
  bookingUrl: '',

  /* TODO: ADD WHATSAPP NUMBER
     E.164 digits, no '+' — e.g. '919812345678'. If left empty this falls back
     to contact.whatsapp in assets/js/config.js, and if that is empty too the
     WhatsApp CTAs are removed rather than shown broken. */
  whatsappNumber: '',
  whatsappMessage: "Hi ConsumeIT, I'd like to book the ₹999 1-on-1 Content Creation Session.",

  /* Displayed price. Change in one place if the offer price ever changes. */
  price: 999,
  currency: 'INR',
  currencySymbol: '₹',

  /* Master switch. Set false to disable every campaign CTA and the homepage
     popup sitewide without deleting the page (useful when the offer is paused). */
  enabled: true,

  /* Homepage popup. Timings are in milliseconds. */
  popup: {
    enabled: true,
    delayDesktop: 4000,
    delayMobile: 5000,
    /* Once dismissed, stay away for this long (hours). 0 = only suppress for
       the rest of the browser session. */
    dismissHours: 24
  }
};

/* -----------------------------------------------------------------------------
   Behaviour
   -------------------------------------------------------------------------- */
(function (w, d) {
  'use strict';

  var C  = w.CONTENT_CREATION_CAMPAIGN;
  var $$ = function (sel) { return Array.prototype.slice.call(d.querySelectorAll(sel)); };

  /* Resolved at call time, never captured at load time — script order and
     later configuration changes must not be able to strand these. */
  function track(name, params) {
    var A = w.ConsumeITAnalytics;
    if (A && typeof A.track === 'function') A.track(name, params);
  }

  function whatsappUrl() {
    var S = w.CONSUMEIT || {};
    var n = (C.whatsappNumber || (S.contact && S.contact.whatsapp) || '').replace(/\D/g, '');
    return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(C.whatsappMessage) : '';
  }

  /* --- Where does "Book" actually go? ----------------------------------
     Priority: hosted payment link -> WhatsApp -> contact page.
     Never a fabricated endpoint, never a dead link.                       */
  function bookingTarget() {
    var wa = whatsappUrl();
    if (C.paymentUrl) return { href: C.paymentUrl, kind: 'payment', external: true };
    if (wa)           return { href: wa,           kind: 'whatsapp', external: true };
    return { href: '/contact.html', kind: 'contact', external: false };
  }

  d.addEventListener('DOMContentLoaded', function () {
    var onCampaignPage = !!d.getElementById('book');

    /* --- Campaign disabled: strip the CTAs, leave the content readable -- */
    if (!C.enabled) {
      $$('[data-campaign="book"]').forEach(function (el) { el.setAttribute('hidden', ''); });
      return;
    }

    /* --- Wire every booking CTA ---------------------------------------- */
    var target = bookingTarget();
    $$('[data-campaign="book"]').forEach(function (el) {
      el.setAttribute('href', target.href);
      if (target.external) { el.target = '_blank'; el.rel = 'noopener'; }
      el.dataset.campaignKind = target.kind;
    });

    /* --- WhatsApp CTAs: real link, or removed entirely ------------------ */
    var waUrl = whatsappUrl();
    $$('[data-campaign="whatsapp"]').forEach(function (el) {
      if (!waUrl) {
        var host = el.closest('[data-campaign-wrap]') || el;
        host.remove();
        return;
      }
      el.setAttribute('href', waUrl);
      el.target = '_blank';
      el.rel = 'noopener';
    });

    /* --- Analytics ------------------------------------------------------ */
    if (onCampaignPage) {
      track('content_campaign_page_view', { price: C.price, currency: C.currency });
    }

    d.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-campaign]');
      if (!el) return;

      var role = el.dataset.campaign;
      var where = el.dataset.campaignLocation || 'unknown';

      if (role === 'book') {
        track('content_campaign_cta_click', { location: where, route: el.dataset.campaignKind });
        /* Only a real hosted payment link counts as a payment intent. */
        if (el.dataset.campaignKind === 'payment') {
          track('content_campaign_payment_click', { location: where, price: C.price });
        }
      } else if (role === 'whatsapp') {
        track('content_campaign_whatsapp_click', { location: where });
      } else if (role === 'scroll') {
        track('content_campaign_cta_click', { location: where, route: 'scroll' });
      }
    }, true);

    /* --- Price rendered from config so it can never drift from the offer */
    $$('[data-campaign-price]').forEach(function (el) {
      el.textContent = C.price.toLocaleString('en-IN');
    });

    stickyCta();
    popup();
  });

  /* -------------------------------------------------------------------------
     Sticky mobile CTA — appears after the hero, never over an open modal
     ------------------------------------------------------------------------- */
  function stickyCta() {
    var el = d.getElementById('campaign-sticky');
    if (!el) return;

    d.body.classList.add('has-sticky-cta');
    var show = function () { el.classList.toggle('is-in', w.scrollY > 600); };
    show();
    w.addEventListener('scroll', show, { passive: true });
  }

  /* -------------------------------------------------------------------------
     Homepage popup
     Shown once per browser session. Dismissing it suppresses the popup for
     `dismissHours` across sessions. No fake timers, no fake scarcity, and a
     real close button plus a plainly-worded "maybe later".
     ------------------------------------------------------------------------- */
  var SESSION_KEY = 'consumeit_content_campaign_seen';
  var DISMISS_KEY = 'consumeit_content_campaign_dismissed';

  /* Private browsing and blocked-storage modes throw on access. Failing to
     read storage must never mean failing to render the page. */
  function store(kind) {
    try {
      var s = w[kind];
      s.setItem('__t', '1'); s.removeItem('__t');
      return s;
    } catch (e) { return null; }
  }

  function popup() {
    var el = d.getElementById('campaign-popup');
    if (!el) return;

    var cfg = C.popup || {};
    if (!C.enabled || cfg.enabled === false) { el.remove(); return; }

    var ss = store('sessionStorage');
    var ls = store('localStorage');

    /* Already seen this session? */
    if (ss && ss.getItem(SESSION_KEY) === 'true') return;

    /* Dismissed recently? */
    if (ls && cfg.dismissHours > 0) {
      var at = parseInt(ls.getItem(DISMISS_KEY) || '0', 10);
      if (at && (Date.now() - at) < cfg.dismissHours * 3600000) return;
    }

    var isMobile = w.matchMedia('(max-width: 700px)').matches;
    var delay = isMobile ? (cfg.delayMobile || 5000) : (cfg.delayDesktop || 4000);
    var lastFocus = null;
    var timer = w.setTimeout(open, delay);

    function open() {
      /* Don't interrupt someone already filling in a form. */
      var a = d.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) {
        timer = w.setTimeout(open, 8000);
        return;
      }

      lastFocus = d.activeElement;
      el.dataset.open = 'true';
      el.removeAttribute('aria-hidden');
      d.body.classList.add('is-locked');

      if (ss) { try { ss.setItem(SESSION_KEY, 'true'); } catch (e) {} }

      void el.offsetHeight;                       // flush before focusing
      /* Focus the dialog itself, not the close button — a screen reader should
         announce the offer before it announces how to dismiss it. */
      var card = el.querySelector('.cpop__card');
      if (card) card.focus();

      track('content_campaign_popup_view', { device: isMobile ? 'mobile' : 'desktop' });
    }

    function close(reason) {
      w.clearTimeout(timer);
      el.dataset.open = 'false';
      el.setAttribute('aria-hidden', 'true');
      d.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();

      if (ls && cfg.dismissHours > 0) {
        try { ls.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
      }
      track('content_campaign_popup_close', { reason: reason || 'close' });
    }

    el.addEventListener('click', function (e) {
      if (e.target === el) { close('backdrop'); return; }          // click outside the card
      var hit = e.target.closest('[data-popup]');
      if (!hit) return;

      var role = hit.dataset.popup;
      if (role === 'cta') {
        track('content_campaign_popup_cta', {});
        w.clearTimeout(timer);
        d.body.classList.remove('is-locked');
        return;                                                     // let the link navigate
      }
      close(role === 'later' ? 'maybe_later' : 'close_button');
    });

    d.addEventListener('keydown', function (e) {
      if (el.dataset.open !== 'true') return;

      if (e.key === 'Escape') { close('escape'); return; }
      if (e.key !== 'Tab') return;

      var f = Array.prototype.slice
        .call(el.querySelectorAll('a[href], button:not([disabled])'))
        .filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;

      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
})(window, document);
