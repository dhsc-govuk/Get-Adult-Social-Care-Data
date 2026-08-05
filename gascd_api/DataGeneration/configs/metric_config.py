from datetime import date

METRIC_DEFINITIONS = {}

with open('data/metric_data.csv') as metric_data:
    for l in metric_data:
        metric_group, metric, frequency, location_types, minimum, maximum = l.strip().split(',')
        group_data = METRIC_DEFINITIONS.setdefault(metric_group, {})
        group_data[metric] = {
            'metric_date_type': frequency,
            'location_types': location_types.split('-'),
            'data_point_range': (float(minimum), float(maximum))
        }
        
LOCATION_ORDER = ['National', 'Regional', 'LA', 'Care provider', 'CareProviderLocation']

LOCATION_DATA = {
    'Regional': {
        'parent_key': 'country',
        'radius': 1
    },
    'LA': {
        'parent_key': 'region',
        'radius': 0.5
    },
    'CareProviderLocation': {
        'parent_key': 'la',
        'radius': 0.1
    }
}

LOCATION_BOUNDS = {'test_nation': (55,1,50,-5)}

LOCATIONS = {
    'CareProviderLocation': [{
        'code': 'test_cpl1',
        'name': 'Test Care Provider Location 1',
        'care_provider': 'test_cp_1',
        'la': 'test_la_1'
    },{
        'code': 'test_cpl2',
        'name': 'Test Care Provider Location 2',
        'care_provider': 'test_cp_1',
        'la': 'test_la_1'
    },{
        'code': 'test_cpl_3',
        'name': 'Test Care Provider Location 3',
        'care_provider': 'test_cp_1',
        'la': 'test_la_2'
    }],
    'Care provider': [{
        'code': 'test_cp_1',
        'name': 'Test Care Provider'
    }],
    'LA': [{
        'code': 'test_la_1',
        'name': 'Test LA 1',
        'region': 'test_region_1'
    },{
        'code': 'test_la_2',
        'name': 'Test LA 2',
        'region': 'test_region_2'
    },{
        'code': 'test_la_3',
        'name': 'Test LA 3',
        'region': 'test_region_1'
    },{
        'code': 'test_la_4',
        'name': 'Test LA 4',
        'region': 'test_region_2'
    },{
        'code': 'test_la_5',
        'name': 'Test LA 5',
        'region': 'test_region_1'
    },{
        'code': 'test_la_6',
        'name': 'Test LA 6',
        'region': 'test_region_2'
    },{
        'code': 'test_la_7',
        'name': 'Test LA 7',
        'region': 'test_region_1'
    },{
        'code': 'test_la_8',
        'name': 'Test LA 8',
        'region': 'test_region_2'
    },{
        'code': 'test_la_9',
        'name': 'Test LA 9',
        'region': 'test_region_1'
    },{
        'code': 'test_la_10',
        'name': 'Test LA 10',
        'region': 'test_region_2'
    },{
        'code': 'test_la_11',
        'name': 'Test LA 11',
        'region': 'test_region_1'
    },{
        'code': 'test_la_12',
        'name': 'Test LA 12',
        'region': 'test_region_2'
    },{
        'code': 'test_la_13',
        'name': 'Test LA 13',
        'region': 'test_region_1'
    },{
        'code': 'test_la_14',
        'name': 'Test LA 14',
        'region': 'test_region_2'
    },{
        'code': 'test_la_15',
        'name': 'Test LA 15',
        'region': 'test_region_1'
    },{
        'code': 'test_la_16',
        'name': 'Test LA 16',
        'region': 'test_region_2'
    }],
    'Regional': [{
        'code': 'test_region_1',
        'name': 'Test Region 1',
        'country': 'test_nation'
    },{
        'code': 'test_region_2',
        'name': 'Test Region 2',
        'country': 'test_nation'
    }],
    'National': [{
        'code': 'test_nation',
        'name': 'Test Nation'
    }]
}

DATE_RANGES = {
    'Daily': {
        'start': date(2024, 1, 1),
        'end': date(2024, 2, 1),
    },
    'Monthly': {
        'start': date(2023, 1, 1),
        'end': date(2024, 12, 1),
    },
    'Yearly': {
        'start': date(2020, 1, 1),
        'end': date(2025, 1, 1),
    },
    'Census': {
        'start': date(2021, 1, 1),
        'end': date(2021, 1, 1),
    },
    'Financial yearly': {
        'start': date(2021,4,1),
        'end': date(2024,4,1),
    },
    '5 years': {
        'start': date(2025,1,1),
        'end': date(2045,1,1),
    }
}
