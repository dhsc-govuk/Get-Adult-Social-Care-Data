import polars as pl

renames = {
    "Organisation ID": "location_id",
    "Organisation Name": "location_name",
    "Organisation Sub Type": "location_type",
    "Name": "name",
    "Email Address": "email"
}

contacts = (
    pl.read_excel("external_data/20260101.xlsx", sheet_name="2 - Contacts")
    .select(["Name", "Email Address", "Organisation ID", "Organisation Name", "Organisation Sub Type", "Role"])
    .rename(renames)
    .with_columns(pl.lit("CQC-NI-LIST").alias("source"))
    .with_columns(email=pl.col("email").str.to_lowercase())
)

print(contacts)
contacts.write_parquet("cleaned_data/contacts.parquet")