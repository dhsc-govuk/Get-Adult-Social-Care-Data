from datetime import date

METRIC_DEFINITIONS = {
    'dementia_qof_prevalence': {
        'dementia_qof_prevalence': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (0, 50)
        }
    }
}

LOCATIONS = {
    'Care provider location': [{
        'code': 'test_cpl1',
        'name': 'Test Care Provider Location 1',
        'care_provider': 'test_care_provider_1',
        'la': 'test_la_1'
    },{
        'code': 'test_cpl2',
        'name': 'Test Care Provider Location 2',
        'care_provider': 'test_care_provider_1',
        'la': 'test_la_1'
    },{
        'code': 'test_cpl_3',
        'name': 'Test Care Provider Location 3',
        'care_provider': 'test_care_provider_1',
        'la': 'test_la_2'
    }],
    'Care provider': [{
        'code': 'test_care_provider_1',
        'name': 'Test Care Provider'
    }],
    'LA': [{
        'code': 'test_la_1',
        'name': 'Test LA 1',
        'region': 'test_la_1'
    },{
        'code': 'test_la_2',
        'name': 'Test LA 2',
        'region': 'test_la_2'
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
        'format': 'YYYY-MM-DD'
    },
    'Monthly': {
        'start': date(2023, 1, 1),
        'end': date(2024, 12, 1),
        'format': 'YYYY-MM-01'
    },
    'Yearly': {
        'start': date(2020, 1, 1),
        'end': date(2025, 1, 1),
        'format': 'YYYY-01-01'
    },
    'Census': {
        'start': date(2021, 1, 1),
        'end': date(2021, 1, 1),
        'format': 'YYYY-01-01'
    }
}
