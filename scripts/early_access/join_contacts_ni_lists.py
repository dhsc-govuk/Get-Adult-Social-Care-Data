#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "duckdb",
# ]
# ///
# Join CQC and waitlist files using duckdb, grouping by email
# - performs a left join so that non-matched emails are also included (by location list will be blank)

import argparse

import duckdb
import os

def join_data(contacts_parquet, ni_parquet, outfilename):
    SQL = f"""
    with contacts as (
        select
            email,
            string_agg(location_id) as locations
        from
            '{contacts_parquet}'
        where
            location_type = 'Provider'
            and role = 'Nominated Individual'
        group by email
    ),

    nis as (
        select distinct
            email as ni_email,
            name,
            is_ni,
            list_consent
        from
            '{ni_parquet}'
    )

    select
        nis.name as name,
        nis.ni_email as email,
        contacts.locations as location_id,
        'Care provider' as location_type,
        'CQC-NI-LIST' as source
    from nis
    -- Left join means that we include the non-matched items as well
    left join contacts on nis.ni_email = contacts.email
    """

    CSV_SQL = f"""COPY ({SQL}) TO '{outfilename}' (HEADER, DELIMITER ',')"""
    duckdb.sql(CSV_SQL)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("output_csv", help="Path to save the output CSV")    
    args = parser.parse_args()

    cwd = os.path.dirname(__file__)
    contacts_parquet = os.path.join(cwd, 'cleaned_data/contacts.parquet')
    ni_parquet = os.path.join(cwd, 'cleaned_data/ni-list.parquet')
    join_data(contacts_parquet, ni_parquet, args.output_csv)
    # Clean up
    os.unlink(contacts_parquet)
    os.unlink(ni_parquet)
    print("Data written to", args.output_csv)
