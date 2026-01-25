#!/bin/bash

# Start Nginx in background
nginx

# Run DB migrations/seed
python run_migrations.py

# Start Python Backend
# Using standard 8000 port for internal proxy
uvicorn main:app --host 127.0.0.1 --port 8000
