#!/bin/bash

# 🛡️ BOSS FACTORY ENV CHECKER
# Validates .env.local existence, keys, and Git safety

ENV_FILE=".env.local"
EXAMPLE_FILE=".env.example"
MISSING_KEYS=()
ALL_GOOD=true

echo "🛡️  INITIATING ENVIRONMENT SECURITY CHECK..."
echo "----------------------------------------"

# 1. Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ CRITICAL: $ENV_FILE does not exist!"
    echo "👉 ACTION: Copy $EXAMPLE_FILE to $ENV_FILE and fill in your keys:"
    echo "   cp $EXAMPLE_FILE $ENV_FILE"
    echo "   Then edit $ENV_FILE with your actual keys."
    ALL_GOOD=false
else
    echo "✅ File Found: $ENV_FILE exists."

    # 2. Check for required keys
    REQUIRED_KEYS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "GROQ_API_KEY" "NEXT_PUBLIC_ENCRYPTION_KEY")
    
    for key in "${REQUIRED_KEYS[@]}"; do
        if grep -q "^${key}=" "$ENV_FILE"; then
            # Check if value is empty or placeholder
            value=$(grep "^${key}=" "$ENV_FILE" | cut -d '=' -f 2-)
            if [[ -z "$value" || "$value" == *"your-"* || "$value" == *"change-me"* ]]; then
                echo "⚠️  WARNING: $key exists but looks like a placeholder or is empty."
                MISSING_KEYS+=("$key")
                ALL_GOOD=false
            else
                echo "✅ Key Valid: $key is set."
            fi
        else
            echo "❌ MISSING: $key not found."
            MISSING_KEYS+=("$key")
            ALL_GOOD=false
        fi
    done
fi

echo "----------------------------------------"

# 3. Git Safety Check
if git check-ignore -q "$ENV_FILE"; then
    echo "🔒 Git Safety: ✅ $ENV_FILE is correctly ignored by .gitignore."
    echo "   (Your secrets are safe and will NOT be pushed to GitHub)"
else
    echo "🚨 CRITICAL SECURITY RISK: $ENV_FILE is NOT ignored by Git!"
    echo "   Your secrets could be leaked to GitHub."
    echo "👉 ACTION: Add '$ENV_FILE' to your .gitignore file immediately:"
    echo "   echo '.env.local' >> .gitignore"
    ALL_GOOD=false
fi

echo "----------------------------------------"

# 4. Final Report
if [ "$ALL_GOOD" = true ]; then
    echo "🎉 SUCCESS: Environment is secure and ready!"
    echo "   You can now run: npm run dev"
    exit 0
else
    echo "⚠️  SETUP INCOMPLETE:"
    if [ ${#MISSING_KEYS[@]} -ne 0 ]; then
        echo "   - Missing/Invalid Keys: ${MISSING_KEYS[*]}"
        echo "   👉 Fix: Edit $ENV_FILE and add valid values."
    fi
    if [ ! -f "$ENV_FILE" ]; then
        echo "   - File Missing: Create $ENV_FILE from $EXAMPLE_FILE"
    fi
    if ! git check-ignore -q "$ENV_FILE"; then
        echo "   - Git Risk: Add $ENV_FILE to .gitignore"
    fi
    echo ""
    echo "❌ Aborting launch until fixed."
    exit 1
fi
