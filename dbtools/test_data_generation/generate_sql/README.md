# Test data generation

The `generate_sql.py` script creates an SQL script to insert test data into postgres. The results of running this 
script can be found in the [test-seed-supplementary.sql](../../../gascd_api/api.Tests/TestData/test-seed-supplementary.sql) 
file. This file is used when the gascd api is run using `docker compose`.

### Running `generate_sql.py`

Running `python3 generate_sql.py | pbcopy` will create SQL and output to your clipboard.

Fake locations are created as defined in the [metric_config.py](configs/metric_config.py) file. 

The script creates fake metric data based off the contents of [metric_data.csv](data/metric_data.csv). This is a 
headerless file containing:
metric_group code, metric code, frequency, location types, minimium & maximum data point values.

The `metric_data.csv` file was created using a SQL query. It queries the metric_group, metric, and every time series 
table for data on each metric. The SQL query was generated using [generate_metric_data.py](generate_metric_data.py). 
This script uses [metric_groups.csv](data/metric_groups.csv).