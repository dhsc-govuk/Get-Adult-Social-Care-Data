#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "httpx",
# ]
# ///
# Utility for checking the presence of a list of packages in our package-lock.json
# Usage: ./utils/node-package-audit.py <path_to_package_lock.json> <path_to_packages_list.txt>", file=sys.stderr)

import json
import sys
import os
import httpx
from datetime import datetime

def get_npm_package_release_date(package_name, version):
    """
    Queries the npm registry to get the release date for a specific package version.

    Args:
        package_name (str): The name of the package.
        version (str): The version of the package.

    Returns:
        str: The release date in ISO format, or a message if the date can't be found.
    """
    response = httpx.get(f"https://registry.npmjs.org/{package_name}")
    response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
    data = response.json()
    
    # The 'time' field contains a map of versions to their release dates
    if 'time' in data and version in data['time']:
        date_string = data['time'][version]
        dt_object = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return dt_object.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return "Release date not found"


def audit_packages(lockfile_path, packages_to_check_path):
    """
    Audits a package-lock.json file to check for the presence of specific packages
    and reports their versions and NPM release dates if found.

    Args:
        lockfile_path (str): The file path to the package-lock.json file.
        packages_to_check_path (str): The file path to a text file containing
                                      package names, one per line.
    """
    # Validate file paths
    if not os.path.exists(lockfile_path):
        print(f"Error: The file '{lockfile_path}' was not found.", file=sys.stderr)
        return
    if not os.path.exists(packages_to_check_path):
        print(f"Error: The file '{packages_to_check_path}' was not found.", file=sys.stderr)
        return

    # Read the list of packages to check from the text file
    try:
        with open(packages_to_check_path, 'r') as f:
            packages_to_check = {line.strip() for line in f if line.strip()}
    except IOError as e:
        print(f"Error reading package list file: {e}", file=sys.stderr)
        return

    # Load the package-lock.json file
    try:
        with open(lockfile_path, 'r') as f:
            lock_data = json.load(f)
    except (IOError, json.JSONDecodeError) as e:
        print(f"Error reading or parsing package-lock.json: {e}", file=sys.stderr)
        return

    found_packages = {}

    # Assumes modern 'packages' key (npm v7+)
    if 'packages' in lock_data:
        # The package names are the keys in the 'packages' object, excluding the root
        for pkg_path, details in lock_data['packages'].items():
            # Skip the root project entry and packages without a version
            if pkg_path.startswith('node_modules/') and 'version' in details:
                pkg_name = pkg_path.split('/')[-1]
                pkg_key = f"{pkg_name}@{details['version']}"
                if pkg_name in packages_to_check and pkg_key not in found_packages:
                    found_packages[pkg_key] = ((pkg_name, details['version']))
    else:
        print("Warning: Could not find 'packages' or 'dependencies' key in package-lock.json.", file=sys.stderr)
        return

    print("--\nAudit Results:\n--")
    if found_packages:
        print(f"The following packages from {packages_to_check_path} were found in package-lock.json:")
        for key, (pkg, version) in sorted(found_packages.items()):
            release_date = get_npm_package_release_date(pkg, version)
            print(f"- {pkg :<25}@{version} - Released: {release_date}")
    else:
        print(f"None of the packages from {packages_to_check_path} were found in package-lock.json.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <path_to_package_lock.json> <path_to_packages_list.txt>", file=sys.stderr)
        sys.exit(1)

    lockfile_path = sys.argv[1]
    packages_to_check_path = sys.argv[2]
    audit_packages(lockfile_path, packages_to_check_path)
