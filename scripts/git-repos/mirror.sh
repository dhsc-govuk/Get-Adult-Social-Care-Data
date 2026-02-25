#!/bin/bash

# uses https://rtyley.github.io/bfg-repo-cleaner/ to remove large blobs from the repo
export CLEANER_JAR_PATH="/Users/james.fielder/Downloads/bfg-1.15.0.jar"

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if exactly two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <source_repo_url> <destination_repo_url>"
    exit 1
fi

SOURCE_REPO=$1
DEST_REPO=$2

# Create a temporary directory for the mirror clone
TMP_DIR=$(mktemp -d -t mirror_repo.XXXXXX)

# Ensure the temporary directory is removed on exit
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Cloning source repository: $SOURCE_REPO"
git clone --mirror "$SOURCE_REPO" "$TMP_DIR"

echo "Temp location - $TMP_DIR"
cd "$TMP_DIR"

echo "Deleting refs pulls"
git for-each-ref --format 'delete %(refname)' refs/pull | git update-ref --stdin

echo "Removing large blobs"
java -jar $CLEANER_JAR_PATH --strip-blobs-bigger-than 5M .

echo "Reflog expire"
git reflog expire --expire=now --all

echo "Run git gc"
git gc --prune=now --aggressive

echo "Pushing to destination repository: $DEST_REPO"
git push --mirror "$DEST_REPO"

echo "Mirroring complete."
