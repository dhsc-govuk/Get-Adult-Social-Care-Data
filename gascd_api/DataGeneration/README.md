# Test data generation

The `generate_sql.py` script creates an SQL script to insert fake data into postgres. This file runs and inserts 
data into a containerised DB when `docker compose up` is run.

## Overview

This module generates realistic test data for GACSD, including:

- **Metrics**: Metric time series
- **Reference data**: Geographic and organisational hierarchies
- **Metadata**: Descriptive information for all metrics

## Metrics

### Metric Locations
Metrics can be for a Nation, Region, Local Authority, or Care Provider Location.

The locations have the following hierarchy:

```
National
└── Regional
    └── Local Authority
        └── Care Provider Location

Care Provider
└── Care Provider Location
```

**Note**: Care Provider Locations have two relationships - they belong to both a Local Authority (for geographic hierarchy) and a Care Provider (for organisational hierarchy). Care Providers themselves are not geographically assigned to Local Authorities and Care Providers do not have any metrics at the moment.

### Metric Dates

The metrics have different frequencies
- **Daily** (e.g. Capacity Tracker metrics)
- **Monthly** (e.g Dementia metrics)
- **Yearly** (e.g ONS metrics)
- **Financial yearly**
- **Census** (e.g ONS metrics)
- **5 years**

## Configuration

The test data generation tool configurable to support different testing scenarios and data requirements. Configuration can be changed in [metric_config.py](configs/metric_config.py) and metric options are available in the [data](data) directory.

**Adding New Metrics**: To add a new metric it will need to be included in [metric_data.csv](data/metric_data.csv). This can be added manually or can be queried for from dev if it exists there, see [here](#getting-metric-data-from-dev) for details.

**Adding New Locations**: To introduce new test locations, you need to update the `LOCATIONS` dictionary in [metric_config.py](configs/metric_config.py). You may also need to update the other location dictionaries.

The configuration files allow you to customise metrics generation, location hierarchies, date ranges, and metadata without modifying the core generation logic.

### Customising Metric Data
Edit [metric_data.csv](data/metric_data.csv) :

Modify metrics with columns metric group, metric code, frequency, location types (dash separated), min and max values.
```
bedcount,bedcount_total,Daily,LA-National-Regional,0,223
```

Modify test locations in [metric_config.py](configs/metric_config.py) in the `LOCATIONS` dictionary. Note that entities are linked by code.
```python
LOCATIONS = {
    'CareProviderLocation': [{
        'code': 'test_cpl1',
        'name': 'Test Care Provider Location 1',
        'care_provider': 'test_cp_1',
        'la': 'test_la_1'
    }],
    'Care provider': [{
        'code': 'test_cp_1',
        'name': 'Test Care Provider'
    }],
    'LA': [{
        'code': 'test_la_1',
        'name': 'Test LA 1',
        'region': 'test_region_1'
    }],
    'Regional': [{
        'code': 'test_region_1',
        'name': 'Test Region 1',
        'country': 'test_nation'
    }],
    'National': [{
        'code': 'test_nation',
        'name': 'Test Nation'
    }]
}
```

Modify `DATE_RANGES` in `data_generation_config.py`:
```python
DATE_RANGES = {
    'Daily': {
        'start': date(2024, 1, 1),
        'end': date(2024, 2, 1)
    }
}
```

### Getting metric data from Dev

Metric data including frequency, locations, min and max values are queryable in dev. Running the python script [generate_metric_data.py](generate_metric_data.py) will produce the SQL.

This reads [metric_groups.csv](data/metric_groups.csv) for a list of tables to query. Any new time series tables will need to be added here (or query the dev metric_groups table for a list).

## Deterministic Generation
- Uses deterministic seeds
- Same inputs always produce same outputs
- Ensures reproducible test data