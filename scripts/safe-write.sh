#!/bin/bash
# Atomic file write with validation
# Usage: ./safe-write.sh <file> <content-heredoc-marker>

FILE="$1"
MARKER="${2:-ENDOFFILE}"
TEMP_FILE="${FILE}.tmp.$$"

# Write to temp file first
cat > "$TEMP_FILE" << "$MARKER"
$(cat)
$MARKER

# Validate temp file is not empty
if [ ! -s "$TEMP_FILE" ]; then
  echo "Error: Temp file is empty, aborting!" >&2
  rm -f "$TEMP_FILE"
  exit 1
fi

# Atomic move (rename is atomic on macOS)
mv "$TEMP_FILE" "$FILE"

# Verify final file
if [ ! -s "$FILE" ]; then
  echo "Error: Final file is empty, restoring from git!" >&2
  git restore "$FILE" 2>/dev/null || echo "Warning: Could not restore from git" >&2
  exit 1
fi

echo "✓ File updated successfully: $FILE"

