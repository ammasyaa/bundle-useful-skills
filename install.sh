#!/usr/bin/env bash
set -e

# ==============================================================================
# Bundle Useful Skills — Fast Universal Installer (macOS & Linux)
# ==============================================================================

TARGET="all"
BUNDLE="all"
ROUTER_ONLY=false
DOCTOR=false

for arg in "$@"; do
  case $arg in
    --router-only) ROUTER_ONLY=true ;;
    --doctor) DOCTOR=true ;;
    --target=*) TARGET="${arg#*=}" ;;
    --bundle=*) BUNDLE="${arg#*=}" ;;
  esac
done

BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
CYAN="\033[36m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}=== Bundle Useful Skills: Fast Universal Installer ===${RESET}\n"

# 1. Check Python version (>= 3.10)
PYTHON_BIN=""
for cmd in python3 python; do
  if command -v "$cmd" >/dev/null 2>&1; then
    ver=$("$cmd" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || true)
    major=$(echo "$ver" | cut -d. -f1)
    minor=$(echo "$ver" | cut -d. -f2)
    if [ "$major" -ge 3 ] && [ "$minor" -ge 10 ]; then
      PYTHON_BIN="$cmd"
      break
    fi
  fi
done

if [ -z "$PYTHON_BIN" ]; then
  echo -e "${RED}[ERROR] Python 3.10+ is required, but not found in PATH.${RESET}"
  echo "Please install Python 3.10 or later and try again."
  exit 1
fi

echo -e "${GREEN}[OK]${RESET} Found Python: $($PYTHON_BIN --version) ($PYTHON_BIN)"

# 2. Determine installation location
INSTALL_DIR="${HOME}/.bundle-useful-skills"
REPO_URL="https://github.com/ammasyaa/bundle-useful-skills.git"

if [ -f "router/SKILL.md" ] && [ -f "scripts/install.py" ]; then
  REPO_DIR="$(pwd)"
  echo -e "${GREEN}[OK]${RESET} Running from local repository: ${REPO_DIR}"
else
  if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "${BLUE}--> Updating existing installation at ${INSTALL_DIR}...${RESET}"
    git -C "$INSTALL_DIR" pull --quiet
  else
    echo -e "${BLUE}--> Cloning repository to ${INSTALL_DIR}...${RESET}"
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" --quiet
  fi
  REPO_DIR="$INSTALL_DIR"
fi

# If user just requested doctor check
if [ "$DOCTOR" = true ]; then
  echo -e "\n${CYAN}--> Running agent environment diagnostics...${RESET}"
  "$PYTHON_BIN" "$REPO_DIR/scripts/install.py" --doctor
  exit 0
fi

# 3. Register router and skills with all detected AI agents
echo -e "\n${BLUE}--> Registering router and skills with detected AI agent platforms...${RESET}"
if [ "$ROUTER_ONLY" = true ]; then
  "$PYTHON_BIN" "$REPO_DIR/scripts/install.py" --target "$TARGET" --router-only
else
  "$PYTHON_BIN" "$REPO_DIR/scripts/install.py" --target "$TARGET" --bundle "$BUNDLE"
fi

# 4. Install global CLI command 'bus'
BIN_DIR="${HOME}/.local/bin"
mkdir -p "$BIN_DIR"

cat <<EOF > "$BIN_DIR/bus"
#!/usr/bin/env bash
exec "$PYTHON_BIN" "$REPO_DIR/scripts/route.py" "\$@"
EOF
chmod +x "$BIN_DIR/bus"

echo -e "${GREEN}[OK]${RESET} Created global CLI command: ${BOLD}${BIN_DIR}/bus${RESET}"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo -e "${YELLOW}[NOTE]${RESET} Add ~/.local/bin to your PATH to run 'bus' from anywhere:"
  echo -e "  export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

# 5. Live Agent Detection & Health Check (Proof of Detection)
echo -e "\n${CYAN}--> Verifying agent detection & installed skills...${RESET}"
"$PYTHON_BIN" "$REPO_DIR/scripts/install.py" --doctor

echo -e "\n${BOLD}${GREEN}✔ Installation Complete!${RESET}"
echo -e "\n${BOLD}${CYAN}=== How to Test & Verify in Your AI Agents ===${RESET}"
echo -e "${YELLOW}1. Google Antigravity:${RESET}"
echo -e "   - Open or restart Antigravity."
echo -e "   - Check 'Available skills' in the prompt/sidebar (137 skills active)."
echo -e "   - Type '@bundle-useful-skills' or mention any skill like '@systematic-debugging'."
echo -e "${YELLOW}2. Anthropic Claude Code:${RESET}"
echo -e "   - Run 'claude' in terminal."
echo -e "   - Ask: 'What skills do you have access to?' or inspect ~/.claude/skills"
echo -e "${YELLOW}3. OpenAI Codex:${RESET}"
echo -e "   - Skills in ~/.codex/skills are automatically indexed and injected."
echo -e "${YELLOW}4. Cursor / Windsurf:${RESET}"
echo -e "   - Global skills in ~/.cursor/skills or ~/.codeium/windsurf/skills are active."
echo -e "\n${CYAN}Verify detection anytime with:${RESET}"
echo -e "  ${BOLD}bus doctor${RESET}"
echo -e "${CYAN}Route tasks with:${RESET}"
echo -e "  ${BOLD}bus \"Build a Next.js app with Supabase and Tailwind\"${RESET}\n"
