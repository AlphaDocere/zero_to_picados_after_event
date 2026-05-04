#!/bin/bash

echo "================================"
echo "AUDIT: v1.2 Connection Validation"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    return 0
  else
    echo -e "${RED}✗${NC} $1 (MISSING)"
    return 1
  fi
}

check_import_in_file() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Import found: $2"
    return 0
  else
    echo -e "  ${YELLOW}⚠${NC} Import not found: $2"
    return 1
  fi
}

echo "=== CORE LIBRARY FILES ==="
check_file "lib/firebase.ts"
check_file "lib/agents.config.ts"
check_file "lib/agent-memory.ts"
check_file "lib/types/agent.ts"
check_file "lib/types/agent-memory.ts"
echo ""

echo "=== API ENDPOINTS ==="
check_file "app/api/agent-response/route.ts"
check_file "app/api/agent-memory/save/route.ts"
check_file "app/api/agent-memory/pending/route.ts"
check_file "app/api/save-session/route.ts"
echo ""

echo "=== COMPONENTS ==="
check_file "components/check-in/agent-selector.tsx"
check_file "components/check-in/response-card.tsx"
check_file "components/check-in/agent-follow-up.tsx"
check_file "components/check-in/check-in-form.tsx"
echo ""

echo "=== HOOKS ==="
check_file "hooks/use-agent-response.ts"
check_file "hooks/use-check-in-workflow.ts"
echo ""

echo "=== CONNECTIONS CHECK ==="
echo ""
echo "Checking agent-memory imports in response-card:"
check_import_in_file "components/check-in/response-card.tsx" "saveToMemory"

echo ""
echo "Checking agent.config usage in agent-selector:"
check_import_in_file "components/check-in/agent-selector.tsx" "getAllAgents"

echo ""
echo "Checking Firebase exports:"
check_import_in_file "lib/firebase.ts" "export"

echo ""
echo "=== DATA FLOW CHECK ==="
echo "Check-in Form → Agent Selection → Response Generation → Memory Storage"
if grep -q "getAgentResponse" "components/check-in/response-card.tsx"; then
  echo -e "${GREEN}✓${NC} Response card calls getAgentResponse"
fi

if grep -q "saveToMemory" "hooks/use-agent-response.ts"; then
  echo -e "${GREEN}✓${NC} Hook supports saveToMemory parameter"
fi

if grep -q "agent-memory/save" "app/api/agent-response/route.ts" || grep -q "agent-memory/save" "hooks/use-agent-response.ts"; then
  echo -e "${GREEN}✓${NC} Memory save endpoint configured"
fi

echo ""
echo "=== BUILD CHECK ==="
cd /vercel/share/v0-project
if pnpm build > /tmp/build.log 2>&1; then
  echo -e "${GREEN}✓${NC} Build successful"
else
  echo -e "${RED}✗${NC} Build failed - Check /tmp/build.log"
fi

echo ""
echo "=== SUMMARY ==="
echo "Audit completed. Review any warnings or errors above."
