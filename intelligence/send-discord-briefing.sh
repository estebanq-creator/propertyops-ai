#!/bin/bash
# Send Intelligence Briefing to Discord
# Usage: ./send-discord-briefing.sh [briefing-file.md]

WEBHOOK_URL="https://discordapp.com/api/webhooks/1491501512437006366/ceE8gqYh9Xu9kAHg9fK1n5klYolHcv6UH_nsZj447GkWoFhWG7hWlcPTcHcWuo1cFqhR"
BRIEFING_FILE="${1:-memory/competitive-briefings/latest-weekly-briefing.md}"

# Check if file exists
if [ ! -f "$BRIEFING_FILE" ]; then
  echo "Error: Briefing file not found: $BRIEFING_FILE"
  exit 1
fi

# Extract key sections from briefing
EXEC_SUMMARY=$(grep -A 10 "## Executive Summary" "$BRIEFING_FILE" | tail -n +2 | head -5)
COMPETITOR_MOVES=$(grep -A 20 "## Competitor Updates" "$BRIEFING_FILE" | tail -n +2 | head -10)

# Build Discord message (max 2000 chars for content)
MESSAGE="🔔 **PropertyOpsAI Intelligence Briefing**

$(echo "$EXEC_SUMMARY" | head -3)

**Full Report:** See attached file or workspace

📁 **Report Index:** \`/intelligence/README.md\`
📅 **Next Briefing:** April 14, 2026"

# Send to Discord
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$MESSAGE\",
    \"username\": \"Intel Agent\"
  }"

echo "Briefing sent to Discord: $BRIEFING_FILE"
