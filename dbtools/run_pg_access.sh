#!/bin/bash

# Generic runner for pg-access.py
# Usage: ./run_pg_access.sh [environment]
# Example: ./run_pg_access.sh uat

ENVIRONMENT="${1:-dev}"
ENV_UPPER=$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')

# Set environment variables for pg-access.py
export ENVIRONMENT="$ENVIRONMENT"
export PGHOST="${PGHOST:-dapalpha-pg-${ENVIRONMENT}.postgres.database.azure.com}"
export PGPRIMARYDB="${PGPRIMARYDB:-postgres}"
export PGDATADB="${PGDATADB:-gascd_data}"
export PGUSER="${PGUSER:-GASCD - Postgres Admins - ${ENV_UPPER}}"
export PRINT_TABLES="${PRINT_TABLES:-true}"
export PRINT_SEQUENCES="${PRINT_SEQUENCES:-true}"

# Ensure you are logged in to Azure if running locally:
# az login

echo "Running pg-access.py for ${ENV_UPPER} environment..."
echo "Host: ${PGHOST}"
echo "User: ${PGUSER}"

shift $(( $# > 0 ? 1 : 0 ))
uv run pg-access.py "$@"
