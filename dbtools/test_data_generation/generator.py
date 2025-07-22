import random
import pandas as pd
import hashlib
from datetime import datetime
from configs.metadata_config import METRIC_METADATA
from configs.data_generation_config import METRIC_DEFINITIONS, LOCATIONS, DATE_RANGES
from configs.lookup_config import LOCATION_RELATIONSHIPS 

def generate_dates_for_frequency(frequency):
    """Generate dates"""
    date_config = DATE_RANGES[frequency]
    start_date = date_config['start']
    end_date = date_config['end']
    
    if frequency == 'Monthly':
        return pd.date_range(start=start_date, end=end_date, freq='MS').date
    elif frequency in ['Yearly', 'Census']:
        return pd.date_range(start=start_date, end=end_date, freq='YS').date
    elif frequency == 'Daily':
        return pd.date_range(start=start_date, end=end_date, freq='D').date
    
    return [start_date]  # fallback

def format_metric_date(date_obj):
    """TEMP: Format date to string"""
    return date_obj.strftime('%d/%m/%Y')
    
def generate_deterministic_seed(metric_id, location_id, date_str, salt="GASCD_metrics"):
    """Generate a deterministic seed based on the combination of inputs"""
    
    combined_string = f"{salt}|{metric_id}|{location_id}|{date_str}"
    
    hash_object = hashlib.sha256(combined_string.encode('utf-8'))
    
    # Convert first 8 hex characters to integer
    seed = int(hash_object.hexdigest()[:8], 16)
    return seed

def generate_data_point(metric_id, access_category, location_id, date_str):
    """Generate deterministic random data point within metric's defined range"""
    data_range = METRIC_DEFINITIONS[access_category][metric_id]['data_point_range']
    min_val, max_val = data_range
    
    # Generate deterministic seed
    seed = generate_deterministic_seed(metric_id, location_id, date_str)
    
    rng = random.Random(seed)
    
    return rng.randint(int(min_val), int(max_val))

def generate_metrics_by_access_category(access_category):
    """Generate metrics for a specific access category"""
    data = []
    load_datetime = datetime.now()
    
    # Get metrics for this access category
    metrics = METRIC_DEFINITIONS[access_category]
    
    for metric_id, metric_def in metrics.items():
        frequency = metric_def['metric_date_type']
        location_types = metric_def['location_types']
        
        # Generate valid dates for this frequency
        valid_dates = generate_dates_for_frequency(frequency)
        
        for location_type in location_types:
            locations = LOCATIONS[location_type]
            
            for date_obj in valid_dates:
                for location_id in locations:
                    
                    metric_date_str = format_metric_date(date_obj)
                    data_point = generate_data_point(metric_id, access_category, location_id, metric_date_str)
                    
                    record = {
                        'access_category': access_category,
                        'metric_id': metric_id,
                        'metric_date_type': frequency,
                        'metric_date': metric_date_str,
                        'metric_date_format': date_obj,
                        'location_type': location_type,
                        'location_id': location_id,
                        'numerator_date_type': None,
                        'numerator_date': None,
                        'numerator': None,
                        'denominator_date_type': None,
                        'denominator_date': None,
                        'denominator': None,
                        'multiplier': None,
                        'data_point': str(data_point),
                        'load_date_time': load_datetime
                    }
                    
                    data.append(record)
    
    df = pd.DataFrame(data)
    return df

def generate_public_metrics():
    """Generate unrestricted (Public) metrics"""
    return generate_metrics_by_access_category('Public')

def generate_restricted_metrics():
    """Generate restricted (Capacity Tracker) metrics"""
    return generate_metrics_by_access_category('Capacity Tracker')

def generate_public_metrics():
    """Generate unrestricted (Public) metrics"""
    return generate_metrics_by_access_category('Public')

def generate_restricted_metrics():
    """Generate restricted (Capacity Tracker) metrics"""
    return generate_metrics_by_access_category('Capacity Tracker')
    
def generate_la_lookup_table():
    """Generate LA lookup table"""

    load_datetime = datetime.now()

    # Convert LA list to DataFrame
    df_la = pd.DataFrame(LOCATIONS['LA'], columns=['la_code'])

    # Convert la_to_regional relationship to DataFrame
    df_relationships = pd.DataFrame(list(LOCATION_RELATIONSHIPS['la_to_regional'].items()), 
                                    columns=['la_code', 'region_code'])

    # Join them
    df_la_lookup = df_la.merge(df_relationships, on='la_code', how='left')

    # Add other columns
    df_la_lookup['la_name'] = df_la_lookup['la_code'].str.replace('testla', 'Test LA ')
    df_la_lookup['load_date_time'] = load_datetime

    # Reorder columns
    df_la_lookup = df_la_lookup[['la_code', 'la_name', 'region_code', 'load_date_time']]

    return df_la_lookup
    
def generate_provider_location_full_lookup():
    """Generate provider location full lookup table"""

    load_datetime = datetime.now()

    # Convert Care provider location list to DataFrame
    df_provider = pd.DataFrame(LOCATIONS['Care provider location'], columns=['provider_location_id'])

    # Generate provider_location_name from provider_location_id
    df_provider['provider_location_name'] = df_provider['provider_location_id'].str.replace('testcpl', 'Test Care Provider Location ')

    # Get care provider location to care provider relationships
    df_cpl_to_cp = pd.DataFrame(list(LOCATION_RELATIONSHIPS['care_provider_location_to_care_provider'].items()), 
                                columns=['provider_location_id', 'provider_id'])

    # Join with care provider relationships
    df_provider_lookup = df_provider.merge(df_cpl_to_cp, on='provider_location_id', how='left')

    # Generate provider_name from provider_id
    df_provider_lookup['provider_name'] = df_provider_lookup['provider_id'].str.replace('testcp', 'Test Care Provider ')

    # Get care provider location to LA relationships
    df_cpl_to_la = pd.DataFrame(list(LOCATION_RELATIONSHIPS['care_provider_location_to_la'].items()), 
                                columns=['provider_location_id', 'la_code'])

    # Join with LA relationships
    df_provider_lookup = df_provider_lookup.merge(df_cpl_to_la, on='provider_location_id', how='left')

    # Generate la_name from la_code
    df_provider_lookup['la_name'] = df_provider_lookup['la_code'].str.replace('testla', 'Test LA ')

    # Get LA to regional relationships
    df_la_to_region = pd.DataFrame(list(LOCATION_RELATIONSHIPS['la_to_regional'].items()), 
                                    columns=['la_code', 'region_code'])

    # Join with regional relationships
    df_provider_lookup = df_provider_lookup.merge(df_la_to_region, on='la_code', how='left')

    # Generate region_name from region_code
    df_provider_lookup['region_name'] = df_provider_lookup['region_code'].str.replace('testregion', 'Test Region ')

    # Get regional to national relationships
    df_region_to_national = pd.DataFrame(list(LOCATION_RELATIONSHIPS['regional_to_national'].items()), 
                                        columns=['region_code', 'country_code'])

    # Join with national relationships
    df_provider_lookup = df_provider_lookup.merge(df_region_to_national, on='region_code', how='left')

    # Generate country_name from country_code
    df_provider_lookup['country_name'] = df_provider_lookup['country_code'].str.replace('testnation', 'Test Nation ')

    # Add load_date_time
    df_provider_lookup['load_date_time'] = load_datetime

    # Reorder columns to match table schema
    df_provider_lookup = df_provider_lookup[[
        'provider_location_id', 'provider_location_name', 'provider_id', 'provider_name',
        'la_code', 'la_name', 'region_code', 'region_name', 
        'country_code', 'country_name', 'load_date_time'
    ]]

    return df_provider_lookup
    
def generate_metric_location_user_access():
    """Generate metric location user access table"""
    
    load_datetime = datetime.now()
    
    # Base rules
    base_rules = {
        'metric_type': ['Capacity Tracker'] * 6,
        'metric_location_type': ['LA', 'National', 'Regional'] * 2,
        'user_access_location_type': ['Care provider location'] * 3 + ['Care provider'] * 3,
        'user_access_restricted_flag': [0] * 6,
        'metric_location_id': [None] * 6,
        'metric_location_name': [None] * 6,
        'user_access_location_id': [None] * 6,
        'load_date_time': [load_datetime] * 6
    }
    
    df_base = pd.DataFrame(base_rules)
    
    # Specific rules
    
    # Create Care provider location records
    df_cpl = pd.DataFrame(LOCATIONS['Care provider location'], columns=['metric_location_id'])
    df_cpl['metric_location_name'] = df_cpl['metric_location_id'].str.replace('testcpl', 'Test Care Provider Location ')
    
    # Add relationships
    df_relationships = pd.DataFrame(list(LOCATION_RELATIONSHIPS['care_provider_location_to_care_provider'].items()), 
                                    columns=['metric_location_id', 'provider_id'])
    df_cpl = df_cpl.merge(df_relationships, on='metric_location_id')
    
    # Self access
    df_self = df_cpl.copy()
    df_self['user_access_location_type'] = 'Care provider location'
    df_self['user_access_location_id'] = df_self['metric_location_id']
    
    # Parent provider access
    df_parent = df_cpl.copy()
    df_parent['user_access_location_type'] = 'Care provider'
    df_parent['user_access_location_id'] = df_parent['provider_id']
    
    # Sister location access
    df_sister = df_cpl.merge(df_cpl, on='provider_id', suffixes=('', '_sister'))
    df_sister = df_sister[df_sister['metric_location_id'] != df_sister['metric_location_id_sister']]
    df_sister['user_access_location_type'] = 'Care provider location'
    df_sister['user_access_location_id'] = df_sister['metric_location_id_sister']
    df_sister = df_sister[['metric_location_id', 'metric_location_name', 'user_access_location_type', 'user_access_location_id']]
    
    # Combine specific rules
    df_specific = pd.concat([df_self, df_parent, df_sister], ignore_index=True)
    df_specific['metric_type'] = 'Capacity Tracker'
    df_specific['metric_location_type'] = 'Care provider location'
    df_specific['user_access_restricted_flag'] = 1
    df_specific['load_date_time'] = load_datetime
    df_specific = df_specific.drop('provider_id', axis=1, errors='ignore')
    
    # Combine all rules
    df_access = pd.concat([df_base, df_specific], ignore_index=True)
    
    # Reorder columns
    df_access = df_access[[
        'metric_type', 'metric_location_type', 'user_access_location_type', 'user_access_restricted_flag',
        'metric_location_id', 'metric_location_name', 'user_access_location_id', 'load_date_time'
    ]]
    
    return df_access
    
def generate_metric_metadata():
    """Generate metric metadata table"""

    # Convert dict to DataFrame
    df_metadata = pd.DataFrame.from_dict(METRIC_METADATA, orient='index')

    # Reset index to get metric_id as column
    df_metadata.reset_index(inplace=True)
    df_metadata.rename(columns={'index': 'metric_id'}, inplace=True)

    # Add load_date_time
    df_metadata['load_date_time'] = datetime.now()

    return df_metadata