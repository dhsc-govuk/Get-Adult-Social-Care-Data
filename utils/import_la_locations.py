#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "httpx",
# ]
# ///

# Grabs bbox data from ONS map geojson files
# Usage: ./utils/import_la_locations.py /path/to/codes.txt
# (where codes.txt is a list of valid Local Authority District codes)

import json
import os
import httpx
import time
import random

BASE_URL = "https://cdn.ons.gov.uk/maptiles/cm-geos/v2"

def extract_meta(data):
    return data.get('meta', {})

def extract_bbox_coordinates(data):
    """
    Finds the feature with id 'bbox' and returns its coordinates.

    Args:
        geojson_data (dict): The parsed GeoJSON data.

    Returns:
        list or None: The list of coordinates if the 'bbox' feature is found, otherwise None.
    """
    geojson_data = data['geo_json']
    try:
        if not isinstance(geojson_data, dict) or 'features' not in geojson_data:
            print("Warning: GeoJSON data is not a valid FeatureCollection.")
            return None

        for feature in geojson_data.get('features', []):
            if feature.get('id') == 'bbox':
                # Found the bounding box feature, return its coordinates
                return feature.get('geometry', {}).get('coordinates')
        
        # If the loop completes without finding the bbox
        print("Warning: 'bbox' feature not found in the file.")
        return None
    except Exception as e:
        print(f"An error occurred during extraction: {e}")
        return None


def process_codes_and_generate_json(input_filepath, output_filepath):
    """
    Main function to read codes, fetch data, and write the output JSON.

    Args:
        input_filepath (str): Path to the text file containing unique codes.
        output_filepath (str): Path where the final JSON output will be saved.
    """
    if not os.path.exists(input_filepath):
        print(f"Error: Input file not found at '{input_filepath}'")
        return

    # This dictionary will store the final mapping of code -> coordinates
    results = {}

    print(f"Reading codes from '{input_filepath}'...")
    with open(input_filepath, 'r') as f:
        # Read codes and strip whitespace/newlines
        codes = [line.strip() for line in f if line.strip()]

    total = len(codes)
    print(f"Found {total} codes")
    for progress, code in enumerate(codes, start=1):
        url = f"{BASE_URL}/{code}.geojson"
        print(f"Loading data for {code} ({progress}/{total})")
        
        response = httpx.get(url)
        
        if response.status_code == 200:
            data = response.json()
            bbox_coordinates = extract_bbox_coordinates(data)
            meta = extract_meta(data)
            results[code] = {
                'meta': meta,
                'bbox': bbox_coordinates,
            }
        else:
            print(f"Failed to retrieve or process data for code '{code}'. Skipping.")
        time.sleep(random.uniform(0.5, 1))
        
    # Write the final dictionary to the output JSON file
    print(f"Writing results to '{output_filepath}'...")
    try:
        with open(output_filepath, 'w') as f:
            json.dump(results, f, indent=4)
        print("Processing complete!")
        print(f"Output available at: {os.path.abspath(output_filepath)}")
    except IOError as e:
        print(f"Error writing to output file: {e}")


if __name__ == "__main__":
    import sys
    # Define the input and output file names
    INPUT_CODES_FILE = sys.argv[1]
    OUTPUT_JSON_FILE = "bbox_coordinates.json"

    # Run the main processing function
    process_codes_and_generate_json(INPUT_CODES_FILE, OUTPUT_JSON_FILE)

