/* =============================================================================
   ConsumeIT — Site configuration
   Single source of truth for every outbound contact channel and tracking id.
   Edit THIS file only; nothing else hardcodes a phone number, email or ID.
   ============================================================================= */
window.CONSUMEIT = {
  brand: 'ConsumeIT',
  origin: 'https://www.consumeit.in',

  contact: {
    email: 'consumeit.services@gmail.com',

    /* Set to an E.164 number without "+" (e.g. '919812345678') to switch on the
       floating WhatsApp dock and every "Chat on WhatsApp" action sitewide.
       Left empty, those controls gracefully fall back to the contact page. */
    whatsapp: '',
    whatsappMessage: "Hi ConsumeIT, I'd like to discuss a project.",

    /* Set to an E.164 number (e.g. '+919812345678') to expose call actions. */
    phone: '',

    location: 'Rohtak, Haryana, India',
    region: 'IN',

    /* Optional: a Calendly / Google Calendar booking URL. */
    booking: ''
  },

  /* Public profiles. Empty strings are skipped when the footer renders. */
  social: {
    linkedin: '',
    instagram: '',
    x: '',
    youtube: '',
    facebook: ''
  },

  /* Endpoint for the contact form. Any no-backend form relay works
     (Formspree, Web3Forms, Getform, Basin...). Empty => the form composes a
     pre-filled email instead, so the page never silently drops a lead. */
  formEndpoint: '',

  analytics: {
    ga4: 'G-V0TV22JN33',   // live property
    gtm: '',               // e.g. 'GTM-XXXXXXX'
    metaPixel: '',         // e.g. '1234567890'
    clarity: '',           // e.g. 'abcdefghij'
    debug: false           // true => log every event to the console
  }
};

/* --- Derived helpers ------------------------------------------------------ */
(function (C) {
  var c = C.contact;

  C.links = {
    email: 'mailto:' + c.email,

    phone: c.phone ? 'tel:' + c.phone.replace(/[^\d+]/g, '') : '',

    whatsapp: c.whatsapp
      ? 'https://wa.me/' + c.whatsapp.replace(/\D/g, '') +
        '?text=' + encodeURIComponent(c.whatsappMessage)
      : '',

    /* Anything that wants "talk to us" without caring which channel exists. */
    primary: c.whatsapp
      ? 'https://wa.me/' + c.whatsapp.replace(/\D/g, '') +
        '?text=' + encodeURIComponent(c.whatsappMessage)
      : '/contact.html'
  };

  C.hasWhatsApp = Boolean(c.whatsapp);
})(window.CONSUMEIT);
