#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
# However, for orchestration we might want to continue even if one mirror fails.
# We will handle it manually.

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRROR_SCRIPT="$SCRIPT_DIR/mirror.sh"

# Check if the mirror script exists and is executable
if [ ! -x "$MIRROR_SCRIPT" ]; then
    echo "Error: Mirror script not found or not executable at $MIRROR_SCRIPT"
    exit 1
fi

# Check if exactly one argument (the config file) is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <config_file>"
    echo "The config file should contain lines with: <source_repo_url> <destination_repo_url>"
    exit 1
fi

CONFIG_FILE=$1

# Check if the config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found at $CONFIG_FILE"
    exit 1
fi

echo "Starting orchestration of git mirrors from $CONFIG_FILE..."

# Loop through each line in the config file
# Ignoring empty lines and comments starting with #
while read -r SOURCE DEST || [ -n "$SOURCE" ]; do
    # Skip empty lines or comments
    [[ -z "$SOURCE" || "$SOURCE" =~ ^# ]] && continue
    
    # If DEST is empty, the line is malformed
    if [ -z "$DEST" ]; then
        echo "Warning: Malformed line in config file (missing destination): $SOURCE"
        continue
    fi

    echo "------------------------------------------------"
    echo "Mirroring $SOURCE to $DEST"
    echo "------------------------------------------------"

    # Call the mirror script
    if "$MIRROR_SCRIPT" "$SOURCE" "$DEST"; then
        echo "Successfully mirrored $SOURCE"
    else
        echo "Error: Failed to mirror $SOURCE"
    fi

done < "$CONFIG_FILE"

echo "------------------------------------------------"
echo "Orchestration complete."
