#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${VENV_DIR:-$ROOT_DIR/.venv}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
PIP_BIN="$VENV_DIR/bin/pip"
MANAGE_PY="$VENV_DIR/bin/python $ROOT_DIR/manage.py"

cd "$ROOT_DIR"

info() {
  printf '\n==> %s\n' "$1"
}

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

command -v "$PYTHON_BIN" >/dev/null 2>&1 || fail "python3 is required but was not found."

if [ ! -d "$VENV_DIR" ]; then
  info "Creating virtual environment"
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

info "Installing Python dependencies"
"$PIP_BIN" install --upgrade pip
"$PIP_BIN" install -r requirements.txt

info "Checking Django project"
$MANAGE_PY check

info "Applying database migrations"
$MANAGE_PY migrate --noinput

if [ "${RUN_SEED:-0}" = "1" ]; then
  info "Seeding starter site content"
  $MANAGE_PY seed_site
fi

info "Collecting static files"
$MANAGE_PY collectstatic --noinput

if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  info "Creating Django superuser if needed"
  $MANAGE_PY createsuperuser --noinput || true
fi

info "Deployment setup complete"
printf 'Run with RUN_SEED=1 to seed starter content on first deploy.\n'
printf 'Set DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, and DJANGO_SUPERUSER_PASSWORD to create an admin user.\n'
