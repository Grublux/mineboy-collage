#!/bin/bash
# Validate file after write operations
# Usage: validate-file.sh <file> [min-lines]

FILE="$1"
MIN_LINES="${2:-1}"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File does not exist: $FILE" >&2
  exit 1
fi

LINES=$(wc -l < "$FILE" | tr -d ' ')
if [ "$LINES" -lt "$MIN_LINES" ]; then
  echo "ERROR: File is too short ($LINES lines, expected at least $MIN_LINES): $FILE" >&2
  echo "Attempting to restore from git..." >&2
  git restore "$FILE" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ Restored from git: $FILE" >&2
  else
    echo "✗ Could not restore from git: $FILE" >&2
  fi
  exit 1
fi

if [ ! -s "$FILE" ]; then
  echo "ERROR: File is empty: $FILE" >&2
  echo "Attempting to restore from git..." >&2
  git restore "$FILE" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ Restored from git: $FILE" >&2
  else
    echo "✗ Could not restore from git: $FILE" >&2
  fi
  exit 1
fi

echo "✓ File validated: $FILE ($LINES lines)"
exit 0

