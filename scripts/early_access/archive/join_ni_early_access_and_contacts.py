import polars as pl

nis = pl.read_parquet("cleaned_data/ni_list.parquet")
contacts = pl.read_parquet("cleaned_data/contacts.parquet")

# print(nis)
# print(contacts)

joined = nis.join(contacts, on="email", how="left")
print(joined)