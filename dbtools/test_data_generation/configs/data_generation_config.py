from datetime import date

# Define metrics
METRIC_DEFINITIONS = {
    'Public': {
        'dementia_qof_prevalence': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (0, 50)
        },
        'dementia_estimated_diagnosis_rate_65over': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (0, 50)
        },
        'perc_18_64': {
            'metric_date_type': 'Yearly', 
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (55, 75)
        },
        'perc_65over': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (15, 25)
        },
        'perc_75over': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (5, 12)
        },
        'perc_85over': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (1, 4)
        },
        'total_population': {
            'metric_date_type': 'Yearly',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (50000, 10000000)
        },
        'perc_population_disability_disabled_total': {
            'metric_date_type': 'Census',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (8, 18)
        },
        'perc_households_deprivation_deprived_total': {
            'metric_date_type': 'Census',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (8, 18)
        },
        'perc_household_ownership_total': {
            'metric_date_type': 'Census',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (8, 18)
        },
        'perc_households_one_person_total': {
            'metric_date_type': 'Census',
            'location_types': ['LA', 'National', 'Regional'],
            'data_point_range': (8, 18)
        }
    },
    
    'Capacity Tracker': {
        'bedcount_per_100000_adults_total': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (500, 3000)
        },
        'bedcount_per_100000_adults_total_dementia_nursing': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (20, 150)
        },
        'bedcount_per_100000_adults_total_dementia_residential': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (30, 200)
        },
        'bedcount_per_100000_adults_total_general_nursing': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (100, 800)
        },
        'bedcount_per_100000_adults_total_general_residential': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (200, 1200)
        },
        'bedcount_per_100000_adults_total_learning_disability_nursing': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (5, 50)
        },
        'bedcount_per_100000_adults_total_learning_disability_residential': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (10, 80)
        },
        'bedcount_per_100000_adults_total_mental_health_nursing': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (15, 100)
        },
        'bedcount_per_100000_adults_total_mental_health_residential': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (25, 150)
        },
        'bedcount_per_100000_adults_total_transitional': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (10, 75)
        },
        'bedcount_per_100000_adults_total_ypd_young_physically_disabled': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (2, 25)
        },
        'bedcount_total': {
            'metric_date_type': 'Daily',
            'location_types': ['Care provider location'],
            'data_point_range': (1000, 50000)
        },
        'median_bed_count_total': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (50, 500)
        },
        'median_occupancy_total': {
            'metric_date_type': 'Daily',
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (40, 450)
        },
        'occupancy_rate_total': {
            'metric_date_type': 'Daily',
            'location_types': ['Care provider location', 'LA', 'Regional', 'National'],
            'data_point_range': (70, 95)
        }
    }
}

# Define location IDs
LOCATIONS = {
    'Care provider location': [
        'testcpl1', 'testcpl2'
    ],
    'LA': [
        'testla1', 'testla2'
    ],
    'Regional': [
        'testregion1', 'testregion2'
    ],
    'National': [
        'testnation1'
    ]
}

# Define date ranges
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