#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "polars",
#     "fastexcel",
# ]
# ///
# Reads CQC contacts file into a parquet
 
import polars as pl
import sys
import os

def read_contacts_file(sourcefile):
    renames = {
        "Organisation ID": "location_id",
        "Organisation Name": "location_name",
        "Organisation Sub Type": "location_type",
        "Name": "name",
        "Email Address": "email"
    }

    contacts = (
        pl.read_excel(sourcefile, sheet_name="2 - Contacts")
        .select(["Name", "Email Address", "Organisation ID", "Organisation Name", "Organisation Sub Type", "Role"])
        .rename(renames)
        .with_columns(pl.lit("CQC-NI-LIST").alias("source"))
        .with_columns(email=pl.col("email").str.to_lowercase())
    )

    print(contacts)

    cwd = os.path.dirname(__file__)
    contacts.write_parquet(os.path.join(cwd, "cleaned_data/contacts.parquet"))

if __name__ == "__main__":
    infile = sys.argv[1]
    read_contacts_file(infile)

