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

**Unrestricted Metrics**: To populate metrics.all_unrestricted_metrics

Metrics from published data sources, including ONS and NHS Digital.

**Restricted Metrics**: To populate metrics.all_restricted_metrics

Metrics from unpublished data sources. At the moment this is just Capacity Tracker.

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
- **Daily** (e.g.Capacity Tracker metrics)
- **Monthly** (e.g Dementia metrics)
- **Yearly** (e.g ONS metrics)
- **Census** (e.g ONS metrics)

## Lookup Tables Structure

ff

## Access Table Structure

ff

## Metadata Table Structure

ff

## Installation
### Prerequisites
- Python 3.7+
- SQL Server with ODBC Driver 18
  - https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
  - https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Windows
- Required Python packages:
  ```bash
  pip install pandas pyodbc python-dotenv
  ```

### Database Setup
See README.md for instructions on how to set up the database.

## Usage

### Basic Usage
```bash
python main.py
```

This will generate and insert all test data into the configured SQL Server database.

## Configuration

intro

### Customising Metrics
Edit `configs/data_generation_config.py`:

```python
METRIC_DEFINITIONS = {
    'Public': {
        'your_metric_id': {
            'metric_date_type': 'Monthly',  # Daily, Monthly, Yearly, Census
            'location_types': ['LA', 'Regional', 'National'],
            'data_point_range': (100, 5000)  # Min, max values
        }
    }
}
```

Add locations to `LOCATIONS` dictionary and define relationships in `LOCATION_RELATIONSHIPS`.

Modify `DATE_RANGES` in `data_generation_config.py`:

```python
DATE_RANGES = {
    'Daily': {
        'start': date(2024, 1, 1),
        'end': date(2024, 2, 1)
    }
}
```

### Customising Lookups

### Customising Metadata

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