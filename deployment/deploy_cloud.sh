#!/bin/bash
# Manual Deployment Script
# Prerequisite: Fly CLI installed (https://fly.io/docs/hands-on/install-flyctl/)

echo "Deploying Your Choice Ice Platform to Fly.io..."

# check if fly is installed
if ! command -v flyOutput &> /dev/null
then
    echo "Error: 'fly' command not found."
    echo "Please install flyctl: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Deploy using the configuration in fly.toml
fly deploy

echo "Deployment command sent."
