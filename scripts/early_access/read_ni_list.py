#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "polars",
#     "fastexcel",
# ]
# ///
# Reads NI waitlst file into a parquet
 
import polars as pl
import sys, os

def read_ni_list(sourcefile):
    renames = {
        "are you the 'nominated individual' registered with cqc for your organisation?": "is_ni",
        "do you want to join the gascd early access list? this means you will receive an email inviting you to make an account for gascd beginning from late january": "list_consent",
        "full name": "name",
        "email address": "email",
    }

    ni_list = (
        pl.read_excel(sourcefile)
        .drop("Email", "Start time", "Completion time", "Name")
        .rename(lambda col: col.lower())
        .rename(renames)
        .select(["name", "email", "is_ni", "list_consent"])
        .drop_nulls(["email"])
        .with_columns(email=pl.col("email").str.to_lowercase())
    )

    print(ni_list)
    cwd = os.path.dirname(__file__)
    ni_list.write_parquet(os.path.join(cwd, "cleaned_data/ni-list.parquet"))

if __name__ == "__main__":
    infile = sys.argv[1]
    read_ni_list(infile)
