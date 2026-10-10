# Consumeit website

Source for [www.consumeit.in](https://www.consumeit.in), the marketing site for
Consumeit, a content, marketing and web studio based in Rohtak, India.

The site is plain static HTML, CSS and vanilla JavaScript. It has no framework,
no `npm` and no build step on the host. Render serves the files in this
repository as they are.

## Quick start

```sh
python3 preview.py          # http://localhost:8000
python3 preview.py 3000     # any other port
```

`preview.py` is a small local server that:

- sends `no-store` headers, so the browser always shows your latest CSS and JS
  edits instead of a cached copy;
- resolves extensionless URLs (`/about` → `about.html`), the same way Render does.

Opening the HTML files straight from disk (`file://`) won't work properly,
because every page uses root-relative paths such as `/assets/css/site.css`.

## Project layout

```
.
├── index.html                 Home page
├── service.html               Services overview
├── services/*.html            One page per service
├── content-creation.html      Content Creation Program (live on Google Meet)
├── about.html, contact.html, faq.html, pricing.html
├── locations/{india,global}.html
├── privacy.html, terms.html, 404.html
├── *-starter-plan.html        Plan pages, marked noindex and left out of the sitemap
│
├── _partials/                 Shared head, header and footer (see "Shared header and footer")
├── tools/stamp.py             Copies the partials into every page
│
├── assets/
│   ├── css/site.css           Global styles, loaded on every page
│   ├── css/<section>.css      Per-section styles (see table below)
│   ├── js/config.js           Contact details, form endpoint and analytics IDs
│   ├── js/analytics.js        Analytics vendors, loaded only after cookie consent
│   ├── js/site.js             Drawer, sticky header, reveal and motion effects, contact form
│   ├── js/search.js           Client-side site search (index is hand-written in the file)
│   ├── fonts/                 Self-hosted Inter and Instrument Serif (woff2)
│   └── img/                   Logo, favicons, Open Graph image
│
├── sitemap.xml, robots.txt
├── render.yaml                Render Blueprint, including security headers
├── SECURITY.md                Explains each security header and how to set it
└── preview.py                 Local preview server
```

### Which stylesheet a page loads

Every page loads `site.css`. Some also load a section stylesheet:

| Stylesheet | Pages |
|---|---|
| `home.css` | `index.html` |
| `services.css` | `service.html`, `services/*.html` |
| `company.css` | `about.html`, `contact.html` |
| `info.css` | `faq.html`, `pricing.html`, `locations/*.html` |
| `content-creation.css` | `content-creation.html` |

## Shared header and footer

The `<head>` boilerplate, site header, mobile drawer, search dialog and footer
are the same on every page. Each one lives once in `_partials/` and is copied
into the pages between marker comments:

```html
<!-- @stamp head-common -->
  …generated, do not edit here…
<!-- @/stamp head-common -->

<!-- @stamp header current=/about.html -->
  …
<!-- @/stamp header -->

<!-- @stamp footer -->
  …
<!-- @/stamp footer -->
```

To change any of these:

1. Edit the file in `_partials/`.
2. Run `python3 tools/stamp.py` to rewrite every page.
3. Review the diff and commit the partial and the updated pages together.

Anything outside the markers belongs to that page and the script never touches
it. Edits made *inside* the markers on a page are overwritten the next time the
script runs.

`current=` on the header marker controls which nav link gets
`aria-current="page"`. In the partial, those spots are written as
`{{cur:/href}}`.

To check that every page matches the partials without writing anything:

```sh
python3 tools/stamp.py --check   # exits 1 if any page is out of date
```

> **Note:** `stamp.py` needs **Python 3.10 or newer**. The Python 3.9 that
> ships with macOS fails with
> `TypeError: unsupported operand type(s) for |`. Use `python3.13`
> (or any newer `python3`). `preview.py` runs on any Python 3.

## Configuration

Most settings that change between environments or over time live in
[`assets/js/config.js`](assets/js/config.js):

| Key | What it does |
|---|---|
| `contact.email` | Address used by the contact-form fallback and `mailto:` links built in JS |
| `contact.whatsapp` | E.164 number without `+`. Setting it turns on the WhatsApp dock and "Chat on WhatsApp" actions. If empty, those actions link to the contact page. |
| `contact.phone`, `contact.booking` | Optional call and booking links |
| `social.*` | Public profile URLs |
| `formEndpoint` | URL of a form relay (Formspree, Web3Forms and so on). If empty, the contact form opens a pre-filled email instead. |
| `analytics.ga4` / `gtm` / `metaPixel` / `clarity` | Vendor IDs. Only GA4 is set right now. |
| `analytics.debug` | `true` logs every tracked event to the console |

The email address and Instagram link are also written directly into
`_partials/header.html` and `_partials/footer.html`. If you change them, update
the partials too and re-run the stamp script.

If you add a `formEndpoint` or turn on another analytics vendor, also update
the Content Security Policy in `render.yaml`. Otherwise the browser will block
the requests without showing an error. See [SECURITY.md](SECURITY.md).

## Analytics and tracking

`analytics.js` asks for cookie consent before it loads anything. No analytics
script is requested and no cookie is set until the visitor clicks **Yes**. The
choice is stored in `localStorage` under `consumeit_consent`. The footer's
**Cookie settings** button opens the prompt again.

You can track clicks without writing JavaScript:

```html
<a href="/contact.html" data-track="contact_click" data-track-location="header">…</a>
```

`data-track` is the event name. `data-track-label` and `data-track-location`
are sent as event parameters. Clicks on `mailto:` links are tracked as
`email_click` automatically. From JavaScript, call
`ConsumeITAnalytics.track(name, params)`.

## Adding a page

1. Copy the existing page closest to what you need, so the stamp markers and
   `<head>` meta tags come with it.
2. Update the `<title>`, description, canonical URL, Open Graph and Twitter tags,
   and the `current=` value on the header marker.
3. Run `python3 tools/stamp.py`.
4. Add the URL to `sitemap.xml` (or add `<meta name="robots" content="noindex">`
   if it shouldn't be indexed).
5. Add an entry to the `DATA` array in `assets/js/search.js` so the page shows
   up in site search.
6. If the page belongs in the navigation, add the link to
   `_partials/header.html` and/or `_partials/footer.html`, then stamp again.

## Deployment

The site deploys to **Render** as a static site from this repository and is
served at `https://www.consumeit.in`, behind Cloudflare. Pushing to the deploy
branch publishes the files exactly as committed, so make sure every page has
been stamped before you push.

`render.yaml` defines the security headers (HSTS, CSP, `X-Frame-Options`, etc.)
and cache rules, but Render only applies it if the service is managed as a
Blueprint. According to [SECURITY.md](SECURITY.md), the live site was not
sending these headers when last checked. That file explains how to fix this and
how to verify it with `curl -sI https://www.consumeit.in/`.

Cache rules: files under `/assets/*` are cached for 7 days, and HTML is always
revalidated. After changing a CSS or JS file, returning visitors may see the
old version for up to a week. Rename the file (for example, `site.v2.css`) if
the change needs to reach everyone right away.

## Before you push

- [ ] `python3.13 tools/stamp.py --check` reports `0 page(s) out of date`
- [ ] Checked the changed pages in `preview.py`, at both phone and desktop width
- [ ] New or renamed pages are in `sitemap.xml` and the `search.js` index
- [ ] Any new third-party origin is allowed in the CSP in `render.yaml`
