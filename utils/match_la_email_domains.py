#!/usr/bin/env -S uv run --script
# /// script
# dependencies = [
#   "pandas",
#   "openpyxl",
# ]
# ///

# Attempts to match user email domains against LA gov-uk-slug data from MySociety

# Usage: ./utils/match_la_email_domains.py /path/to/uk_la_past_current.xlsx /path/to/users.csv
# where `uk_la_past_current.xlsx` is the latest data from:
# https://pages.mysociety.org/uk_local_authority_names_and_codes/downloads/uk_la_past_current_xlsx/latest

import pandas as pd
import os
import re
import sys
import difflib
import json

FUZZY_THRESHOLD = 0.8  # 1.0 is perfect match, 0.0 is no match
USER_EMAIL_COL = "Email address"
USER_FULLNAME_COL = "Full Name"
OUTPUT_FILE = "matched_users_output.csv"
JSON_MAP_FILE = "utils/domain_map.json"

MANUAL_OVERRIDES = {
    "richmondandwandsworth": "richmond-upon-thames",
    "rbwm": "windsor-and-maidenhead",
    "durham": "county-durham",
    "kingston": "kingston-upon-thames",
    "nottscc": "nottingham",
    "leics": "leicester",
    "newcastle": "newcastle-upon-tyne",
    "westberks": "west-berkshire",
    "dorsetcouncil": "dorset",
    "bcpcouncil": "bournemouth",
    "blackburn": "blackburn-with-darwen",
    "southglos": "south-gloucestershire",
    "eastriding": "east-riding-of-yorkshire",
    "lbbd": "barking-and-dagenham",
}

DIRECT_OVERRIDES = {
    'westnorthants': 'E06000062',
    'northnorthants': 'E06000061',
    'cumberland': 'E06000063',
    'dorsetcouncil': 'E06000059',
    'bcpcouncil': 'E06000058',
    'n-somerset': 'E06000024',
    'northyorks': 'E06000065',
    'cumbria': 'E06000063',
    'sheffield': 'E08000039',
    'barnsley': 'E08000038',
}

def extract_domain_slug(email):
    """
    Extracts the core part of the domain.
    Example: 'user@hackney.gov.uk' -> 'hackney'
    """
    if pd.isna(email) or "@" not in str(email):
        return None
    
    domain = str(email).split("@")[-1].lower()
    # Strip common UK suffixes to match the 'local-authority-code' column
    slug = re.sub(r"(\.gov\.uk)$", "", domain)
    return slug

def main(LA_DATA_FILE, USER_DATA_FILE):
    # 1. Check if files exist
    if not os.path.exists(LA_DATA_FILE):
        print(f"Error: {LA_DATA_FILE} not found. Please download it manually to this folder.")
        return
    
    if not os.path.exists(USER_DATA_FILE):
        print(f"Error: {USER_DATA_FILE} not found. Please ensure your user list is in 'users.csv'.")
        return

    # 2. Load the data
    print(f"Loading LA data from  {LA_DATA_FILE}...")
    la_df = pd.read_excel(LA_DATA_FILE, sheet_name="uk_local_authorities_current")
    la_df = la_df.dropna(subset=['gov-uk-slug'])

    # Create a list of valid slugs for fuzzy matching
    valid_slugs = la_df['gov-uk-slug'].astype(str).tolist()

    # 2. Load User data
    print(f"Loading user data from {USER_DATA_FILE}...")
    users_df = pd.read_csv(USER_DATA_FILE)
    users_df['domain_slug'] = users_df[USER_EMAIL_COL].apply(extract_domain_slug)

    # 3. Fuzzy Match Logic
    def get_best_match(slug):
        if not slug: return None
        # manual overrides
        if slug in MANUAL_OVERRIDES:
            return MANUAL_OVERRIDES[slug]
        # Check for exact match 
        if slug in valid_slugs:
            return slug
        # Otherwise, find the closest string
        matches = difflib.get_close_matches(slug, valid_slugs, n=1, cutoff=FUZZY_THRESHOLD)
        return matches[0] if matches else None

    # 3. Process domains for matching
    # We create a temporary key to match against the mySociety 'local-authority-code'
    users_df['match_key'] = users_df['domain_slug'].apply(get_best_match)

    # 4. Perform the Left Join
    # This keeps every user from your CSV, filling in LA info where a match is found.
    results = pd.merge(
        users_df, 
        la_df[['gss-code', 'official-name', 'gov-uk-slug']], 
        left_on='match_key', 
        right_on='gov-uk-slug', 
        how='left'
    )

    print("Step 2: Applying direct domain-to-code overrides...")
    for domain, manual_code in DIRECT_OVERRIDES.items():
        mask = results['domain_slug'] == domain
        if mask.any():
            results.loc[mask, 'gss-code'] = manual_code

    # 5. Create JSON mapping (Domain Slug -> LA Code)
    # We drop duplicates so each domain appears only once in the JSON
    mapping_dict = results.drop_duplicates('domain_slug').set_index('domain_slug')['gss-code'].to_dict()
    
    with open(JSON_MAP_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping_dict, f, indent=4)

    # 5. Clean up and Export
    # Remove the helper columns used for the join
    COLUMNS_TO_KEEP = [USER_EMAIL_COL, USER_FULLNAME_COL, 'official-name', 'gss-code']
    final_output = results[COLUMNS_TO_KEEP]
    final_output = final_output.sort_values(by='official-name', ascending=True)
    final_output.to_csv(OUTPUT_FILE, index=False)

    # 6. Summary Report
    total = len(users_df)
    matched = final_output['gss-code'].notna().sum()
    
    print("-" * 30)
    print(f"Match Rate: {matched}/{total} ({(matched/total)*100:.1f}%)")
    print(f"Results saved to: {OUTPUT_FILE}")

    if matched < total:
        print("\nCommon unmatched domains (check if these need manual mapping):")
        unmatched = final_output[final_output['gss-code'].isna()]
        domains = unmatched[USER_EMAIL_COL].str.split('@').str[-1]
        print(domains.value_counts().head(5))

if __name__ == "__main__":
    la_data_file, user_data_file = sys.argv[1:]
    main(la_data_file, user_data_file)
