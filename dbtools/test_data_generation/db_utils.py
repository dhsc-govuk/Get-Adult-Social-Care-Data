import pyodbc
import pandas as pd
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file from the gascd_app directory
env_path = Path(__file__).parent.parent.parent / "gascd_app" / ".env"
load_dotenv(dotenv_path=env_path)


def insert_to_sql_server(df, table_name, schema='ref', truncate=False, docker=False):
    """Insert DataFrame directly to SQL Server"""
    
    # Get password from environment variable
    password = os.getenv('DB_PASSWORD')
    if not password:
        raise ValueError("DB_PASSWORD environment variable not set")
    
    server = 'mssql-server' if docker else '127.0.0.1'

    print(f'Connecting to database host: {server}')

    conn_str = (
        'DRIVER={ODBC Driver 18 for SQL Server};'
        f'SERVER={server};'
        'DATABASE=Analytical_Datastore;'
        'UID=SA;'
        f'PWD={password};'
        'TrustServerCertificate=yes;'
    )
    
    conn = None
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        if truncate:
            # Clear existing data with TRUNCATE
            cursor.execute(f"TRUNCATE TABLE {schema}.{table_name}")
            print(f"Successfully truncated {schema}.{table_name}")

        # Prepare bulk insert statement
        columns = ', '.join(df.columns)
        placeholders = ', '.join(['?' for _ in df.columns])
        insert_sql = f"INSERT INTO {schema}.{table_name} ({columns}) VALUES ({placeholders})"
        
        # Convert DataFrame to list of tuples for bulk insert
        data_tuples = [tuple(row) for row in df.values]
        
        # Bulk insert all rows at once
        cursor.executemany(insert_sql, data_tuples)
        
        conn.commit()
        print(f"Successfully inserted {len(df)} rows into {schema}.{table_name}")
        
    except Exception as e:
        print(f"Error inserting data: {e}")
        if conn:
            conn.rollback()
        import sys; sys.exit(1)
    finally:
        if conn:
            conn.close()