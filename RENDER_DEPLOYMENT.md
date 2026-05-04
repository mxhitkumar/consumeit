# Deploy ConsumeIT on Render

This project is a Django app. On Render, deploy it as a Python web service, not as a static site.

Official reference: [Render Django deployment docs](https://render.com/docs/deploy-django).

## What Is Already Prepared

- `build.sh` installs dependencies, runs Django checks, collects static files, and applies migrations.
- `requirements.txt` includes production packages: `gunicorn`, `whitenoise`, `dj-database-url`, and `psycopg2-binary`.
- `config/settings.py` reads deployment settings from environment variables.
- Render's automatic `RENDER_EXTERNAL_HOSTNAME` is accepted as an allowed host.
- Static assets from the repo-level `assets/` folder are collected under `/static/assets/...`.

## 1. Push The Project To GitHub

Render deploys from a Git provider. Commit and push your latest code first:

```bash
git add .
git commit -m "Prepare Render deployment"
git push
```

## 2. Create A PostgreSQL Database On Render

1. Open the Render dashboard.
2. Create a new PostgreSQL database.
3. Copy the database's internal connection string.
4. You will use it as the web service `DATABASE_URL`.

Do not use `db.sqlite3` for production on Render. SQLite files are not a good production database on Render because app instances can be rebuilt or replaced.

## 3. Create The Web Service

1. In Render, create a new Web Service.
2. Connect the GitHub repository.
3. Use these settings:

```text
Runtime: Python 3
Root Directory: leave blank
Build Command: ./build.sh
Start Command: gunicorn config.wsgi:application
```

## 4. Add Environment Variables

In the Render web service, add these variables:

```text
DATABASE_URL=<internal Render PostgreSQL URL>
DJANGO_SECRET_KEY=<generate a long random secret>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=<your-service-name>.onrender.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-service-name>.onrender.com
WEB_CONCURRENCY=4
```

`DJANGO_ALLOWED_HOSTS` should include your Render hostname and any custom domains. The app also accepts Render's automatic hostname, but setting this explicitly keeps the configuration easy to read.

When you add a custom domain, update these:

```text
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,<your-service-name>.onrender.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://<your-service-name>.onrender.com
```

## 5. Deploy

Click deploy in Render. During deployment, `build.sh` will run:

```bash
pip install -r requirements.txt
python manage.py check
python manage.py collectstatic --noinput
python manage.py migrate --noinput
```

If the build succeeds, Render will start the app with:

```bash
gunicorn config.wsgi:application
```

## 6. Seed Starter Content

If this is a fresh database and you want the starter pages, services, pricing, FAQ, testimonials, and blog content, open Render Shell for the web service and run:

```bash
python manage.py seed_site
```

Run this only when you want the starter content inserted.

## 7. Create Admin User

Open Render Shell and run:

```bash
python manage.py createsuperuser
```

Then visit:

```text
https://<your-service-name>.onrender.com/admin/
```

## 8. After Deploy Checklist

- Visit the homepage.
- Visit `/admin/`.
- Check that CSS, JavaScript, icons, and images load correctly.
- Visit `/sitemap.xml`.
- Visit `/robots.txt`.
- Add your custom domain in Render if needed.
- Update `DJANGO_ALLOWED_HOSTS` and `DJANGO_CSRF_TRUSTED_ORIGINS` after adding the custom domain.

## Troubleshooting

If you see `DisallowedHost`, update `DJANGO_ALLOWED_HOSTS`.

If forms fail with CSRF errors, update `DJANGO_CSRF_TRUSTED_ORIGINS` and include the full `https://` origin.

If static files do not load, confirm that the build log contains `collectstatic` and that `DJANGO_DEBUG=0`.

If the app says `gunicorn: command not found`, confirm the latest `requirements.txt` was pushed to GitHub.

If database tables are missing, open Render Shell and run:

```bash
python manage.py migrate
```
