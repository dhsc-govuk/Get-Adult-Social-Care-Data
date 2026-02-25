import polars as pl

renames = {
    "are you the 'nominated individual' registered with cqc for your organisation?": "is_ni",
    "do you want to join the gascd early access list? this means you will receive an email inviting you to make an account for gascd beginning from late january": "list_consent",
    "full name": "name",
    "email address": "email",
}

ni_list = (
    pl.read_excel("external_data/ni-early-access.xlsx")
    .drop("Email", "Start time", "Completion time", "Name")
    .rename(lambda col: col.lower())
    .rename(renames)
    .select(["name", "email", "is_ni", "list_consent"])
    .with_columns(email=pl.col("email").str.to_lowercase())
)

print(ni_list)
ni_list.write_parquet("cleaned_data/ni-list.parquet")
