# Security headers — consumeit.in

A static site cannot set HTTP response headers from HTML. Of the six headers
below, **exactly one** has a real HTML equivalent. The rest must be configured
at the server or CDN, and this document gives you ready-to-paste configuration
for each platform.

`render.yaml` in this repository already implements all of them for Render.

---

## What is already done in the HTML

| Header | Can HTML do it? | Status |
|---|---|---|
| `Referrer-Policy` | **Yes** — `<meta name="referrer">` | ✅ Set on all 17 pages to `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Partially — `<meta http-equiv>` works but **ignores `frame-ancestors`**, and cannot send report directives | ⚠️ Not used; header version is in `render.yaml` (see fallback below) |
| `Strict-Transport-Security` | **No** — ignored in `<meta>` | ❌ Server only |
| `X-Content-Type-Options` | **No** | ❌ Server only |
| `X-Frame-Options` | **No** | ❌ Server only |
| `Permissions-Policy` | **No** | ❌ Server only |

Anyone telling you clickjacking protection can be added with a `<meta>` tag is
wrong — browsers ignore `X-Frame-Options` and CSP `frame-ancestors` in `<meta>`.

---

## The headers and why each one is set

### `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
Forces HTTPS for a year, closing the window where a first visit over plain HTTP
could be intercepted.

> **Before enabling `includeSubDomains` / `preload`:** every subdomain must
> serve valid HTTPS. `preload` is very hard to reverse — submitting to the
> preload list bakes the rule into browsers. If you have any HTTP-only
> subdomain, drop `preload` and `includeSubDomains` first.

### `X-Content-Type-Options: nosniff`
Stops the browser guessing a file's type. Prevents an uploaded or mislabelled
file being reinterpreted as a script.

### `X-Frame-Options: DENY`
Blocks framing of the site, defeating clickjacking. Modern browsers use CSP
`frame-ancestors 'none'` (also set); this remains for older ones.

> If you ever embed a page of this site in another site or a tool, this must be
> relaxed to `SAMEORIGIN` **and** `frame-ancestors` updated to match.

### `Referrer-Policy: strict-origin-when-cross-origin`
Sends the full URL to your own pages, only the origin to third parties, and
nothing when downgrading HTTPS→HTTP. Keeps query strings out of other people's
logs. Already mirrored in the HTML.

### `Permissions-Policy`
Switches off browser features the site does not use — camera, microphone,
geolocation, payment, USB, sensors, and FLoC/Topics cohort calculation.
Limits what any injected third-party script could ask for.

### `Content-Security-Policy`
The one that does the heavy lifting. See `render.yaml` for the full value.

**Two things to know before you tighten it further:**

1. `style-src` needs `'unsafe-inline'`. The pages use inline `style` attributes
   (e.g. `style="--w:92%"` on the hero meters). `script-src` does **not** need
   it — there are no inline `<script>` blocks — so scripts stay strictly
   allow-listed.
2. The Google / Meta / Clarity origins are pre-authorised because
   `assets/js/config.js` can enable those vendors. **Delete the ones you will
   never use.** If you set `formEndpoint` in `config.js`, add that origin to
   `connect-src` or submissions will be silently blocked.

**Google Tag Manager caveat:** if you set a `gtm` ID in `config.js`, GTM
normally requires `'unsafe-inline'` in `script-src`, which materially weakens
the policy. Prefer using GA4 directly (already configured), or set up a GTM
nonce/hash if you must.

---

## Configuration per platform

### Render — already done
`render.yaml` is committed. If this service was created by hand in the dashboard
rather than as a Blueprint, either reconnect it as a Blueprint or copy the same
name/value pairs into **Settings → Headers**.

### Cloudflare (you are already behind Cloudflare)
Cloudflare can add these even if the origin does not.
**Rules → Transform Rules → Modify Response Header → Create rule**, apply to
`hostname eq "www.consumeit.in"`, then add each header as a static value.
Cloudflare can *also* strip a header the origin sends — useful if a value ever
needs overriding without a redeploy.

### Netlify / Cloudflare Pages — `_headers` in the publish root
```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; upgrade-insecure-requests
```

### Nginx
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; upgrade-insecure-requests" always;
```
`always` matters — without it the headers are dropped on error responses.

### Apache — `.htaccess`
```apache
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  Header always set Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.google-analytics.com; upgrade-insecure-requests"
</IfModule>
```

---

## Fallback: CSP without server access

If you genuinely cannot set headers anywhere, a `<meta>` CSP still blocks
injected scripts and unexpected connections. It will **not** stop framing, so
clickjacking protection is lost. Add to `<head>` (in `shell.py`'s `head()` so
all pages get it):

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://*.google-analytics.com">
```

---

## Roll it out safely

1. Deploy in report-only mode first — `Content-Security-Policy-Report-Only`
   with the same value. Nothing gets blocked; violations appear in the browser
   console.
2. Load every page, submit the contact form, and confirm analytics still
   records a pageview.
3. Fix anything reported, then rename the header to `Content-Security-Policy`.
4. Verify with `curl -sI https://www.consumeit.in/ | grep -i -E 'content-sec|strict-trans|x-frame|x-content|referrer|permissions'`
   or at [securityheaders.com](https://securityheaders.com).

## Other notes

- **No secrets in this repo.** The GA4 measurement ID in `config.js` is a public
  identifier and is safe to commit; it is not a credential.
- **The site is static** — no database, no admin login, no server-side code, so
  SQL injection, auth bypass and server RCE do not apply. The realistic risks
  are supply-chain (a third-party script) and DNS/hosting account takeover.
- **Protect the accounts**, not just the site: enable 2FA on the domain
  registrar, Cloudflare, Render and the Google account holding Analytics and
  Search Console. Account takeover is the likeliest way this site gets
  compromised.
- **External scripts:** the site currently loads Google Fonts and GA4 only.
  Every extra third-party script is code you do not control running on your
  domain — add them deliberately and keep the CSP updated.
