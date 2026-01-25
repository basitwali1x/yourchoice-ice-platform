#!/bin/bash

# Start Nginx in background
nginx

# Start Python Backend
# Using standard 8000 port for internal proxy
uvicorn main:app --host 127.0.0.1 --port 8000
