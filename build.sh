#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

if [ -z "${DATABASE_URL:-}" ] && [ -f "db.sqlite3" ]; then
  rm -f db.sqlite3
fi

python manage.py check
python manage.py migrate --noinput
python manage.py seed_site
python manage.py collectstatic --noinput
