#!/bin/bash
# Create git checkpoint before editing critical files
# Usage: pre-edit-checkpoint.sh <file1> [file2] ...

FILES=("$@")

if [ ${#FILES[@]} -eq 0 ]; then
  echo "Usage: pre-edit-checkpoint.sh <file1> [file2] ..."
  exit 1
fi

# Check if files exist and are not empty
for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "ERROR: File does not exist: $FILE" >&2
    exit 1
  fi
  
  if [ ! -s "$FILE" ]; then
    echo "ERROR: File is already empty: $FILE" >&2
    echo "Restoring from git..." >&2
    git restore "$FILE" 2>/dev/null
    if [ ! -s "$FILE" ]; then
      echo "ERROR: Could not restore $FILE from git!" >&2
      exit 1
    fi
    echo "✓ Restored $FILE from git" >&2
  fi
done

# Create checkpoint commit
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMMIT_MSG="Checkpoint before edit: $(basename "${FILES[0]}") - $TIMESTAMP"

git add "${FILES[@]}" 2>/dev/null
git commit -m "$COMMIT_MSG" --no-verify 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✓ Checkpoint created for: ${FILES[*]}"
else
  echo "⚠ No changes to commit (files unchanged)"
fi

exit 0


