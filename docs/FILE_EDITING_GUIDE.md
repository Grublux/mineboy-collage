# File Editing Guide - Preventing Empty File Corruption

## Problem

Files keep becoming empty when using `search_replace` tool, especially:
- `components/grids/WalletHeader.tsx`
- `components/grids/Header.tsx`
- Other React component files

## Root Cause

1. **Next.js Hot Reload Race Condition**
   - Next.js file watcher monitors files continuously
   - When `search_replace` does read-modify-write, Next.js may read during the write
   - This can result in reading an empty/partial file
   - Next.js caches the empty file, breaking the site

2. **macOS File System Caching**
   - macOS caches file writes
   - A read immediately after a write may see stale/empty content
   - File system sync delays can cause issues

3. **Tool Failure**
   - `search_replace` may fail mid-operation
   - On error, it might write an empty string
   - No validation after write completes

## Solutions

### Immediate Fix: Use Shell Commands

**Option 1: Simple `cat` (Good, but not perfect)**
```bash
cat > components/grids/WalletHeader.tsx << 'ENDOFFILE'
[full file content]
ENDOFFILE
```

**Why this works:**
- Writes entire file at once (better than read-modify-write)
- Less interference from file watchers
- More reliable than `search_replace`
- **Limitation**: Still has a small window where Next.js could read during write

**Option 2: Atomic Write (Most Reliable)**
```bash
# Write to temp file first
cat > components/grids/WalletHeader.tsx.tmp << 'ENDOFFILE'
[full file content]
ENDOFFILE

# Validate temp file
[ -s components/grids/WalletHeader.tsx.tmp ] || exit 1

# Atomic rename (mv is atomic on macOS)
mv components/grids/WalletHeader.tsx.tmp components/grids/WalletHeader.tsx
```

**Why this is better:**
- `mv` (rename) is atomic on macOS - either old or new file, never partial
- Next.js only sees complete file transitions
- Temp file validation catches errors before overwriting
- **This is the most reliable method**

### Long-term Solutions

1. **Stop Next.js Before Editing**
   ```bash
   # Kill Next.js processes
   pkill -f "next-server"
   # Edit files
   # Restart Next.js
   npm run dev
   ```

2. **Use Git Safety Net**
   ```bash
   # Before editing
   git add -A
   git commit -m "Checkpoint before editing"
   # Edit files
   # If file becomes empty:
   git restore components/grids/WalletHeader.tsx
   ```

3. **Add File Validation**
   - After any file write, verify file is not empty
   - Check file has expected exports
   - Auto-restore from git if validation fails

4. **Use Atomic Writes**
   - Write to temp file first
   - Validate temp file
   - Rename temp to final (atomic operation)
   - Verify final file

## Files That Need Special Handling

These files are particularly vulnerable:
- `components/grids/WalletHeader.tsx`
- `components/grids/Header.tsx`
- `app/page.tsx`
- Any file imported by Next.js pages

## Best Practices

1. **Always use shell commands for these files**
2. **Verify file after write** (check line count, exports)
3. **Keep git commits frequent** (easy rollback)
4. **Stop Next.js for major refactors**
5. **Use `git restore` as first recovery step**

## Recovery Procedure

If a file becomes empty:

```bash
# 1. Restore from git
git restore components/grids/WalletHeader.tsx

# 2. Verify file is restored
wc -l components/grids/WalletHeader.tsx
grep -c "export function" components/grids/WalletHeader.tsx

# 3. Re-apply changes using shell command
cat > components/grids/WalletHeader.tsx << 'ENDOFFILE'
[full content]
ENDOFFILE
```

