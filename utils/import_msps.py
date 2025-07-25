#!/usr/bin/env -S uv run --script
import csv
import json
import sys

# Converts MSP spreadsheet CSV to a JSON object
# Usage: ./utils/import_msps.py /path/to/csv

def convert_csv_to_json(csv_file_path, json_file_path):
    """
    Converts a specific CSV format to a JSON object.

    The script reads a CSV file with 'LA Code' and 
    'Market Authority Position Statement Link' columns and converts it
    into a JSON object where each LA Code is a key.

    Args:
        csv_file_path (str): The path to the input CSV file.
        json_file_path (str): The path where the output JSON file will be saved.
    """
    # Create an empty dictionary to store the formatted data
    data_dict = {}

    try:
        # Open and read the CSV file
        with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
            # Use DictReader to read CSV rows as dictionaries
            csv_reader = csv.DictReader(csv_file)
            
            # Iterate over each row in the csv file
            for row in csv_reader:
                # Get the required values from the row
                la_code = row.get('LA Code')
                statement_link = row.get('Market Authority Position Statement Link')

                # Ensure both columns exist and have values before processing
                if la_code and statement_link and statement_link.startswith("http"):
                    # Add the data to our dictionary in the desired format
                    data_dict[la_code] = {'url': statement_link}

        # Write the dictionary to a JSON file
        with open(json_file_path, mode='w', encoding='utf-8') as json_file:
            # Use json.dump() to write the data, with indentation for readability
            json.dump(data_dict, json_file, indent=4)
            
        print(f"Successfully converted '{csv_file_path}' to '{json_file_path}'")

    except FileNotFoundError:
        print(f"Error: The file '{csv_file_path}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# --- Execution ---
if __name__ == "__main__":
    # Define the input and output file paths
    input_csv = sys.argv[1]
    output_json = 'msp_urls.json'
    
    # Run the conversion function
    convert_csv_to_json(input_csv, output_json)
