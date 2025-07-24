# Test Data Generation

A Python tool for generating fake metrics data and supporting lookup tables for frontend development and testing.

## Overview

This module generates realistic test data for GACSD, including:

- **Unrestricted metrics**: Metrics from published data sources
- **Restricted metrics**: Metrics from unpublished data sources (access-controlled)
- **Lookup tables**: Geographic and organisational hierarchies
- **Access control**: User permissions for different data levels
- **Metadata**: Descriptive information for all metrics

## Metrics Data Structure

### Metrics Data
The system generates two categories of metrics:

**Unrestricted Metrics**: To populate metrics.all_unrestricted_metrics. Metrics from published data sources, including ONS and NHS Digital.

**Restricted Metrics**: To populate metrics.all_restricted_metrics. Metrics from unpublished data sources. At the moment this is just Capacity Tracker.

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
- **Census** (e.g ONS metrics)

## Lookup Tables Structure

The sytem generates two lookup tables:

**Local Authority Lookup**: To populate ref.la_lookup. Links a Local Authority code to its name to its parent Region code. 

**Care Provider Location Full Lookup**: To populate ref.provider_location_full_lookup. Links a Care Provider ID to its names and all geographical/organisation IDs and names.

## Access Table Structure

**User Access Table**: To populate access.metric_location_user_access. Details the metric access of a user from a given Care Provider or Care Provider Location.

## Metadata Table Structure

**Metric Metadata**: To populate metrics.metadata. Gives all supporting information for a metric, such as metric description.

## Installation
### Prerequisites
- Python 3.7+
- SQL Server with ODBC Driver 18
  - https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
  - https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Windows

### Database Setup
See `README.md` for instructions on how to set up the database.

## Usage

### Basic Usage
```bash
./dbtools/test_data_generation/main.py
```

This will generate and insert all test data into the configured SQL Server database.

There is also a 'truncate' option to delete existing data first:

```bash
./dbtools/test_data_generation/main.py --truncate
```

## Configuration

The test data generation tool configurable to support different testing scenarios and data requirements. Configuration is split across three main files in the `configs/` directory, each handling different aspects of the generated data.

**Adding New Metrics**: To add a new metric, you need to update both the `METRIC_DEFINITIONS` dictionary in `data_generation_config.py` (to specify how the data should be generated) and the metadata in `metadata_config.py` (to provide descriptive information about the metric).

**Adding New Locations**: To introduce new test locations, you need to update both the the `LOCATIONS` dictionary in `data_generation_config.py` (to generate data for the test locations) and the locations' hierarchy in the `LOCATION_RELATIONSHIPS` dictionary in `lookup_config.py`(to ensure the locations are connected within the geographic and organisational hierarchies).

**Note**: The access controls table is also automatically built off the `LOCATION_RELATIONSHIPS` dictionary.

**Unused Columns**: Some columns in the generated tables are not populated and are left NULL if they are not currently used by the frontend.

The configuration files allow you to customise metrics generation, location hierarchies, date ranges, and metadata without modifying the core generation logic.

### Customising Metric Data
Edit `configs/data_generation_config.py`:

Modify metrics in `METRIC_DEFINITIONS` dictionary by defining the ID, frequency, location types, and data range.
```python
METRIC_DEFINITIONS = {
    'Public': {
        'your_metric_id': {
            'metric_date_type': 'Monthly',  # Daily, Monthly, Yearly, Census
            'location_types': ['LA', 'Regional', 'National'], # Location types to generate metrics for
            'data_point_range': (100, 5000)  # Min, max metric values
        }
    }
}
```

Modify test locations in `LOCATIONS` dictionary.

```python
LOCATIONS = {
    'Care provider location': [
        'testcpl1', 'testcpl2' # Test Care Provider Location IDs
    ],
    'LA': [
        'testla1', 'testla2' # Test Local Authority IDs
    ],
    'Regional': [
        'testregion1', 'testregion2' # Test Region IDs
    ],
    'National': [
        'testnation1' # Test Nation IDs
    ]
}
```

Modify `DATE_RANGES` in `data_generation_config.py`:

```python
DATE_RANGES = {
    'Daily': {
        'start': date(2024, 1, 1),
        'end': date(2024, 2, 1),
        'format': 'YYYY-MM-DD'
    }
}
```

### Customising Lookups
Edit `configs/lookup_config.py`:

Modify `LOCATION_RELATIONSHIPS` dictionary to define the hierarchy of the different test locations.

```python
LOCATION_RELATIONSHIPS = {
    # Care provider locations belong to care providers
    'care_provider_location_to_care_provider': {
        'testcpl1': 'testcp1',
        'testcpl2': 'testcp2'
    },
    
    # Care providers locations belong to LAs
    'care_provider_location_to_la': {
        'testcpl1': 'testla1',
        'testcpl2': 'testla2'
    },
    
    # LAs belong to regions
    'la_to_regional': {
        'testla1': 'testregion1',
        'testla2': 'testregion1'
    },
    
    # Regions belong to nations
    'regional_to_national': {
        'testregion1': 'testnation1',
        'testregion2': 'testnation1'
    }
}
```

### Customising Metric Metadata
Edit `configs/metadata_config.py`:

Modify metric metadata in `METRIC_METADATA` dictionary.

```python
METRIC_METADATA = {
    "occupancy_rate_total": {
        "group_id": "occupancy_rate",
        "group_name": "Percentage of adult social care beds occupied",
        "description": "The percentage of occupied beds recorded by care providers across social care compared to the number of beds available.",
        "numerator_description": "Number of occupied beds",
        "denominator_description": "Number of beds recorded by care providers",
        "data_source": "Capacity Tracker",
        "filter_bedtype": "All bed types",
        "metric_data_type": "Percentage",
        "methodology": None,
        "limitations": "Capacity Tracker data is self-reported by care providers, who update it at different times throughout the month. This means the data does not provide a snapshot of all providers at the same point in time. Instead, it represents the most recent information available from each provider when the data was retrieved.",
        "access_category": None,
        "metric_type": "Metric",
        "is_live": 1,
        "deep_dive": 0
    }
}
```

## Deterministic Generation
- Uses deterministic seeds based on metric_id + location_id + date
- Same inputs always produce same outputs
- Ensures reproducible test data

## File Structure

```
test_data_generation/
├── main.py                          # Main execution script
├── generator.py                     # Core data generation logic
├── db_utils.py                      # Database connection and insertion
└── configs/
    ├── data_generation_config.py    # Metric definitions
    ├── lookup_config.py             # Location relationships
    └── metadata_config.py           # Metric descriptions and metadata
```

## Database Connection

The tool connects to SQL Server using:
- **Server**: localhost
- **Database**: Analytical_Datastore  
- **Authentication**: SQL Server (SA user)
- **Driver**: ODBC Driver 18 for SQL Server

Connection parameters can be modified in `db_utils.py`.