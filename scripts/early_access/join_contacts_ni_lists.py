#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "duckdb",
# ]
# ///
# Join CQC and waitlist files using duckdb, grouping by email
# - performs a left join so that non-matched emails are also included (by location list will be blank)

import duckdb
import os

def join_data(outfilename):
    cwd = os.path.dirname(__file__)
    SQL = f"""
    with contacts as (
        select
            email,
            string_agg(location_id) as locations
        from
            '{cwd}/cleaned_data/contacts.parquet'
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
            '{cwd}/cleaned_data/ni-list.parquet'
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
    cwd = os.path.dirname(__file__)
    outfilename = os.path.join(cwd, "cleaned_data/joined.csv")
    join_data(outfilename)
    print("Data written to", outfilename)
