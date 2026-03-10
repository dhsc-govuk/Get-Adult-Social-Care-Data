#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
# ]
# ///
# Reads an input csv with (name, email)
# and matches LA domains against our internal mapping

import csv
import json
import os
import sys
import argparse

LOOKUP_JSON = 'la_domain_mapping.json'

def get_domain(email):
    try:
        return email.strip().split('@')[-1].lower()
    except IndexError:
        return None

def main():
    parser = argparse.ArgumentParser(description="Match email domains to local authority codes.")
    parser.add_argument("input_csv", help="Path to the input CSV file")
    parser.add_argument("output_csv", help="Path to save the output CSV")
    
    args = parser.parse_args()
    cwd = os.path.dirname(__file__)

    try:
        with open(os.path.join(cwd, LOOKUP_JSON), 'r') as f:
            lookup = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        sys.exit(1)

    unmatched_domains = set()
    results = []

    # Process CSV
    try:
        with open(args.input_csv, mode='r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)            
            for row in reader:
                # Map original row values to our lowercased keys
                clean_row = {k.strip().lower(): v for k, v in row.items()}
                name = clean_row.get('name')
                email = clean_row.get('email').lower()
                
                domain = get_domain(email)
                la_code = lookup.get(domain)

                if not la_code and domain:
                    unmatched_domains.add(domain)
                
                results.append({
                    'name': name,
                    'email': email,
                    'location_id': la_code if la_code else "",
                    'location_type': 'LA',
                    'source': 'LA-waitlist',
                })

    except Exception as e:
        print(f"Error reading CSV: {e}")
        sys.exit(1)

    with open(args.output_csv, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'email', 'location_type', 'location_id', 'source'])
        writer.writeheader()
        writer.writerows(results)

    if unmatched_domains:
        print("\n--- Unmatched Domains ---")
        for d in sorted(unmatched_domains):
            print(d)
    else:
        print("\nAll domains matched successfully!")

    print(f"\nProcessing complete. Output saved to: {args.output_csv}")

if __name__ == "__main__":
    main()
