#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
pid=$!

# Set a default value if DB_NAME is not set in docker-compose
DB_NAME=${DB_NAME}

echo "Waiting for SQL Server to start..."
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" &> /dev/null
do
    echo "SQL Server is unavailable - sleeping"
    sleep 2
done

echo "SQL Server is up - Creating database: $DB_NAME"

# Run the setup script with the variable passed in
# Note the -v flag below
/opt/mssql-tools18/bin/sqlcmd \
   -S localhost \
   -U sa \
   -P "$MSSQL_SA_PASSWORD" \
   -C \
   -v DB_NAME="$DB_NAME" \
   -i /usr/src/app/setup.sql

echo "Initialization completed."
wait $pid
