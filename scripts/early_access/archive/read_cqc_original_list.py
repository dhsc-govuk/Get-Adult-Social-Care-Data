import polars as pl

renames = {
    "Providers_Organisation_Id": "org_id",
    "Providers_Organisation_Name": "org_name",
    "Person_Role_Person_Role_Type": "role_type",
    "Person_Person_Name": "name",
    "Person_Work_Email_Address": "email"
}

contacts = (
    pl.read_csv("external_data/cqc-orig-list.csv", encoding='utf8-lossy', truncate_ragged_lines=True)
    .rename(renames)
    .with_columns(pl.lit("CQC-NI-LIST-DEC-2025").alias("source"))
    .with_columns(email=pl.col("email").str.to_lowercase())
    .drop("Providers_Organisation_Status")
)

print(contacts)
contacts.write_parquet("cleaned_data/contacts-cqc-dec25.parquet")