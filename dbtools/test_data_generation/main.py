from generator import generate_public_metrics, generate_restricted_metrics, generate_la_lookup_table, generate_provider_location_full_lookup, generate_metric_location_user_access, generate_metric_metadata
from db_utils import insert_to_sql_server

def main():
    """Generate tables"""

    # Generate unrestricted metrics
    print("Generating unrestricted metrics...")
    df_unrestricted = generate_public_metrics()
    insert_to_sql_server(df_unrestricted, 'all_unrestricted_metrics', 'metrics')

    # Generate restricted metrics
    print("Generating restricted metrics...")
    df_restricted = generate_restricted_metrics()
    insert_to_sql_server(df_restricted, 'all_restricted_metrics', 'metrics')

    # Generate LA lookup table
    print("Generating LA lookup table...")
    df_la_lookup = generate_la_lookup_table()
    insert_to_sql_server(df_la_lookup, 'la_lookup', 'ref')

    # Generate full lookup table
    print("Generating full lookup table...")
    df_full_lookup = generate_provider_location_full_lookup()
    insert_to_sql_server(df_full_lookup, 'provider_location_full_lookup', 'ref')

    # Generate metric location user access table
    print("Generating metric location user access table...")
    df_access = generate_metric_location_user_access()
    insert_to_sql_server(df_access, 'metric_location_user_access', 'access')

    # Generate metric metadata
    print("Generating metric metadata...")
    df_metadata = generate_metric_metadata()
    insert_to_sql_server(df_metadata, 'metadata', 'metrics')

if __name__ == "__main__":
    main()