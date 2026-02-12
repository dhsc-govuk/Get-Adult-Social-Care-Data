import hashlib
import random
from configs.metric_config import METRIC_DEFINITIONS, LOCATIONS, DATE_RANGES

def generate_sql(table_name, records):
    column_names = sorted(records[0].keys())
    column_names_string = ', '.join(column_names)

    record_strings = []
    for record in records:
        record_string = ', '.join([str(record[column_name]) for column_name in column_names])
        record_strings.append(record_string)

    values = ',\n'.join([f"({rs})" for rs in record_strings])
    return f"INSERT INTO {table_name} ({column_names_string})\n VALUES {values};"

def format_date(date_obj):
    return date_obj.strftime('%Y-%m-%d')

def generate_metric_record(table_name, record_idx, metric_code, location_code, location_type, start_date, end_date, time_series):
    return  {
        "id": f"(select id + {record_idx} from {table_name}_id)",
        "metric_fk": get_id_by_code_sql('metrics', metric_code),
        "location_code": f"'{location_code}'",
        "location_type": f"'{location_type}'",
        "start_date": f"'{format_date(start_date)}'",
        "end_date": f"'{format_date(end_date)}'",
        "time_series": f"ARRAY [{', '.join(str(x) for x in time_series)}]",
        "latest_value": time_series[-1],
        "loaded_datetime": "CURRENT_TIMESTAMP"
    }

def get_id_for_table_sql(table_name):
    return f"with {table_name}_id as (select coalesce(max(id),0) as id from {table_name})"

def get_id_by_code_sql(table, code):
    return f"(select id from {table} where code = '{code}')"

def get_id_field_sql(table, idx):
    return f"(select id + {idx} from {table}_id)"

def format_string(s):
    return f"'{s}'"

def get_datapoint_count(start, end, frequency):
    delta = end - start
    if frequency == 'Daily':
        return delta.days + 1
    elif frequency == 'Monthly':
        return (delta.days // 30) + 1
    elif frequency in ('Yearly', 'Financial yearly'):
        return (delta.days // 365) + 1
    elif frequency == 'Census':
        return 1

def generate_deterministic_seed(metric_group, metric, location_id, salt="GASCD_metrics"):
    combined_string = f"{salt}|{metric_group}|{metric}|{location_id}"
    hash_object = hashlib.sha256(combined_string.encode('utf-8'))

    return int(hash_object.hexdigest()[:8], 16)

def generate_time_series(metric_group, metric, location_code, count, data_range):
    min_val, max_val = data_range
    seed = generate_deterministic_seed(metric_group, metric, location_code)

    rng = random.Random(seed)
    if max_val.is_integer():
        return [rng.randint(int(min_val), int(max_val)) for _ in range(count)]

    return [rng.randint(int(min_val*100), int(max_val*100))/100 for _ in range(count)]


def generate_records_for_metric(metric_group, metric, data, idx):
    frequency = data['metric_date_type']
    location_types = data['location_types']
    start_date = DATE_RANGES[frequency]['start']
    end_date = DATE_RANGES[frequency]['end']
    datapoint_count = get_datapoint_count(start_date, end_date, frequency)

    records = []
    for location_type in location_types:
        for location_data in LOCATIONS[location_type]:
            time_series = generate_time_series(metric_group, metric, location_data['code'], datapoint_count, data['data_point_range'])
            record = generate_metric_record(metric_group, idx, metric, location_data['code'], location_type, start_date, end_date, time_series)
            records.append(record)
            idx += 1

    return records, idx

def get_mg_record(mg):
    return {
        'id': get_max_id_sql('metric_groups'),
        'code': format_string(mg),
        'display_name': format_string(mg),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def get_max_id_sql(tn):
    return f"(select max(id)+1 from {tn})"

def get_m_record(mg, m):
    return {
        'id': get_max_id_sql('metrics'),
        'code': format_string(m),
        'metric_group_fk': get_id_by_code_sql('metric_groups', mg),
        'filter_type': format_string('filter_type'),
        'numerator_description': format_string('numerator_description'),
        'denominator_description': format_string('demoninator_description'),
        'data_source': format_string('ONS'),
        'data_type': format_string('numbers'),
        'frequency': format_string('Daily'),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def get_create_metric_group_if_not_exists_sql(mg):
    mg_record = get_mg_record(mg)
    insert_mg_sql = generate_sql('metric_groups', [mg_record])
    return get_insert_if_not_exists_sql(get_id_by_code_sql('metric_groups', mg), insert_mg_sql)

def get_insert_if_not_exists_sql(condition, insert_sql):
    return f"do $$ begin if not exists {condition} then {insert_sql} end if; end $$;"

def get_create_metric_if_not_exists_sql(mg, m):
    m_record = get_m_record(mg, m)
    insert_m_sql = generate_sql('metrics', [m_record])
    return get_insert_if_not_exists_sql(get_id_by_code_sql('metrics', m), insert_m_sql)

def generate_metric_sql():
    sqls = []
    for metric_group, metric_data in METRIC_DEFINITIONS.items():
        mg_sql = get_create_metric_group_if_not_exists_sql(metric_group)
        sqls.append(mg_sql)
        table_sql = get_id_for_table_sql(metric_group)
        idx = 1

        for metric, data in metric_data.items():
            metric_sql = get_create_metric_if_not_exists_sql(metric_group, metric)
            sqls.append(metric_sql)
            records, idx = generate_records_for_metric(metric_group, metric, data, idx)
            sqls.append(table_sql)
            sql = generate_sql(metric_group, records)
            sqls.append(sql)

    return sqls

def generate_country_record(data, idx):
    return {
        'name': f"'{data['name']}'",
        'code': f"'{data['code']}'",
        'id': get_id_field_sql('countries', idx),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def generate_region_record(data, idx):
    return {
        'id': get_id_field_sql('regions', idx),
        'code': f"'{data['code']}'",
        'name': f"'{data['name']}'",
        'country_fk': get_id_by_code_sql('countries', data['country']),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def generate_la_record(data, idx):
    return {
        'id': get_id_field_sql('local_authorities', idx),
        'code': format_string(data['code']),
        'name': format_string(data['name']),
        'region_fk': get_id_by_code_sql('regions', data['region']),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def generate_care_provider_record(data, idx):
    return {
        'id': get_id_field_sql('care_providers', idx),
        'code': format_string(data['code']),
        'name': format_string(data['name']),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def generate_cpl_record(data, idx):
    return {
        'id': get_id_field_sql('care_provider_locations', idx),
        'code': format_string(data['code']),
        'name': format_string(data['name']),
        'care_provider_fk': get_id_by_code_sql('care_providers', data['care_provider']),
        'address': format_string('address'),
        'nominated_individual': format_string('mr. ice cool'),
        'local_authority_fk': get_id_by_code_sql('local_authorities', data['la']),
        'category': format_string('category'),
        'loaded_datetime': 'CURRENT_TIMESTAMP'
    }

def generate_location_sql(table_name, location_type, generate_record_callable):
    table_sql = get_id_for_table_sql(table_name)

    idx = 1
    records = []
    for data in LOCATIONS[location_type]:
        record = generate_record_callable(data, idx)
        records.append(record)
        idx += 1

    sql = generate_sql(table_name, records)
    return [table_sql, sql]

def generate_reference_sql():
    country_sql = generate_location_sql('countries', 'National', generate_country_record)
    region_sql = generate_location_sql('regions', 'Regional', generate_region_record)
    la_sql = generate_location_sql('local_authorities', 'LA', generate_la_record)
    cp_sql = generate_location_sql('care_providers', 'Care provider', generate_care_provider_record)
    cpl_sql = generate_location_sql('care_provider_locations', 'CareProviderLocation', generate_cpl_record)

    return country_sql + region_sql + la_sql + cp_sql + cpl_sql

def generate_all_sql():
    ref_sql = generate_reference_sql()
    metric_sql = generate_metric_sql()

    return ref_sql + metric_sql


for sql in generate_all_sql():
    print(sql)

