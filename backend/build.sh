#!/usr/bin/env bash
# Render build script for NovaCart AI backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py migrate --database=default
python seed_data.py
