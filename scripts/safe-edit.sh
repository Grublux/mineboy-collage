#!/bin/bash
# Safe file editing wrapper
# Usage: safe-edit.sh <file> <operation> [args...]
# Operations: validate, restore, checkpoint

FILE="$1"
OPERATION="${2:-validate}"

if [ ! -f "$FILE" ]; then
  echo "ERROR: File does not exist: $FILE" >&2
  exit 1
fi

case "$OPERATION" in
  validate)
    MIN_LINES="${3:-1}"
    LINES=$(wc -l < "$FILE" | tr -d ' ')
    if [ "$LINES" -lt "$MIN_LINES" ]; then
      echo "ERROR: File too short ($LINES lines, expected $MIN_LINES): $FILE" >&2
      exit 1
    fi
    if [ ! -s "$FILE" ]; then
      echo "ERROR: File is empty: $FILE" >&2
      exit 1
    fi
    echo "✓ Validated: $FILE ($LINES lines)"
    ;;
  restore)
    echo "Restoring $FILE from git..." >&2
    git restore "$FILE" 2>/dev/null
    if [ -s "$FILE" ]; then
      echo "✓ Restored: $FILE"
    else
      echo "✗ Failed to restore: $FILE" >&2
      exit 1
    fi
    ;;
  checkpoint)
    ./scripts/pre-edit-checkpoint.sh "$FILE"
    ;;
  *)
    echo "Unknown operation: $OPERATION" >&2
    exit 1
    ;;
esac

exit 0

