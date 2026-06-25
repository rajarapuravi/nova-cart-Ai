#!/usr/bin/env bash
# Render build script for NovaCart AI backend
set -o errexit

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Running migrations ==="
python manage.py migrate --no-input

echo "=== Collecting static files ==="
python manage.py collectstatic --no-input

echo "=== Seeding demo data ==="
python seed_data.py

echo "=== Build complete ==="
