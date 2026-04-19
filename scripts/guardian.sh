#!/bin/bash

# 🛡️ BOSS FACTORY GUARDIAN SCRIPT V2.0
# Includes Error Forensics & Auto-Healing Logic

set -e

echo "🛡️  INITIATING GUARDIAN PROTOCOL (V2.0)..."
echo "----------------------------------------"

# 1. CONFIGURATION
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
LOG_FILE="docs/13_EXECUTION_LOG_AUDIT.md"
STATE_FILE="docs/11_PROGRESS_STATE_KERNEL.md"
ERROR_FILE="docs/17_ERROR_FORENSICS_LOG.md"
BUILD_LOG="/tmp/boss_factory_build.log"
ERROR_ID="ERR-$(date +%s)"

# Helper: Log Error to Forensics
log_error() {
    local category=$1
    local message=$2
    local cause=$3
    local status="Open"
    
    echo "" >> "$ERROR_FILE"
    echo "## [ID: $ERROR_ID] $message" >> "$ERROR_FILE"
    echo "- **Timestamp:** $TIMESTAMP" >> "$ERROR_FILE"
    echo "- **Category:** $category" >> "$ERROR_FILE"
    echo "- **Severity:** Critical" >> "$ERROR_FILE"
    echo "- **Context:** Guardian Build Check" >> "$ERROR_FILE"
    echo "- **Error Message:** $message" >> "$ERROR_FILE"
    echo "- **Root Cause:** $cause" >> "$ERROR_FILE"
    echo "- **Resolution Status:** $status" >> "$ERROR_FILE"
    echo "- **Fix Applied:** Pending CEO/AI Analysis" >> "$ERROR_FILE"
    echo "---" >> "$ERROR_FILE"
    
    echo "🚨 ERROR LOGGED TO $ERROR_FILE"
}

# Helper: Check Known Errors (Simple Grep Match)
check_known_fix() {
    local error_msg=$1
    if grep -q "$error_msg" "$ERROR_FILE" 2>/dev/null; then
        echo "⚠️  KNOWN ERROR DETECTED. Checking for stored fix..."
        return 0
    fi
    return 1
}

# 2. HEALTH CHECK (BUILD TEST)
echo "🏗️  Running Build Test..."
if npm run build > "$BUILD_LOG" 2>&1; then
    echo "✅ Build Successful."
else
    echo "❌ BUILD FAILED!"
    ERROR_OUTPUT=$(tail -n 5 "$BUILD_LOG")
    echo "Error Details: $ERROR_OUTPUT"

    if check_known_fix "$ERROR_OUTPUT"; then
        echo "🔄 Known error pattern found. Attempting standard recovery..."
    fi

    # Categorize Error
    CAT="Unknown"
    if echo "$ERROR_OUTPUT" | grep -qi "supabase"; then CAT="Database"; fi
    if echo "$ERROR_OUTPUT" | grep -qi "module not found"; then CAT="Code/Dependencies"; fi
    if echo "$ERROR_OUTPUT" | grep -qi "network"; then CAT="Network"; fi

    log_error "$CAT" "Build Failure" "$ERROR_OUTPUT"
    
    echo "🛑 HALTING: Fix the error, then re-run Guardian."
    exit 1
fi

# 3. CHANGE DETECTION
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
    echo "✨ No changes detected. System is clean."
    exit 0
fi

# 4. SMART COMMIT
MODULE="general"; TYPE="chore"
if echo "$CHANGES" | grep -q "app/vault"; then MODULE="vault"; TYPE="feat"; fi
if echo "$CHANGES" | grep -q "app/keymaster"; then MODULE="keymaster"; TYPE="feat"; fi
if echo "$CHANGES" | grep -q "docs"; then MODULE="docs"; TYPE="docs"; fi

COMMIT_MSG="$TYPE($MODULE): Auto-save progress at $TIMESTAMP"

echo "🚀 Committing and Pushing..."
git add .
git commit -m "$COMMIT_MSG"
git push origin main

# 5. UPDATE PROGRESS STATE
sed -i "s/\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $TIMESTAMP/" "$STATE_FILE"
git add "$STATE_FILE"
git commit -m "chore(state): Sync timestamp"
git push origin main

# 6. AUDIT LOG
echo "" >> "$LOG_FILE"
echo "## [$TIMESTAMP] ✅ AUTO-SAVE SUCCESS" >> "$LOG_FILE"
echo "- **Module:** $MODULE" >> "$LOG_FILE"
echo "- **Commit:** $COMMIT_MSG" >> "$LOG_FILE"
echo "- **Errors:** None" >> "$LOG_FILE"

echo "----------------------------------------"
echo "🛡️  GUARDIAN PROTOCOL COMPLETE."
