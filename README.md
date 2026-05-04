# ConsumeIT Django Conversion

## What this project includes

- `core`: site settings, global context, sitemap, and robots.txt
- `pages`: homepage, services, FAQ, pricing, testimonials
- `blog`: posts, categories, tags, slug detail pages, pagination
- `cms`: editable standard pages and contact page content

## Local setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py makemigrations
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_site
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py runserver
```

## Deploy

```bash
./scripts/deploy.sh
```

Recommended production variables:

```bash
DJANGO_SECRET_KEY='use-a-long-random-secret'
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS='example.com,www.example.com'
DJANGO_CSRF_TRUSTED_ORIGINS='https://example.com,https://www.example.com'
```

For a first deploy with starter content:

```bash
RUN_SEED=1 ./scripts/deploy.sh
```

To create an admin user during deploy:

```bash
DJANGO_SUPERUSER_USERNAME=admin \
DJANGO_SUPERUSER_EMAIL=admin@example.com \
DJANGO_SUPERUSER_PASSWORD='change-this-password' \
./scripts/deploy.sh
```

## Static-to-Django mapping

- Shared static HTML layout is now `templates/base.html` with `templates/includes/header.html` and `templates/includes/footer.html`
- Static content pages are modeled in `cms.Page`
- Repeated marketing sections became structured models in `pages`
- News/blog functionality is implemented in `blog.Post`, `blog.Category`, and `blog.Tag`

## SEO foundations

- Dynamic meta title and description support
- Open Graph metadata
- Slug-based URLs
- `sitemap.xml` and `robots.txt`
- Alt text fields for image-based content
- Responsive asset handling via Django static and media settings
