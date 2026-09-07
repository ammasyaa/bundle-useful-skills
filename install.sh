#!/usr/bin/env bash
set -e

# ==============================================================================
# Bundle Useful Skills — Fast Universal Installer (macOS & Linux)
# ==============================================================================

BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}=== Bundle Useful Skills: Fast Installer ===${RESET}\n"

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

# 3. Register with all detected AI agents
echo -e "\n${BLUE}--> Registering with detected AI agent platforms...${RESET}"
"$PYTHON_BIN" "$REPO_DIR/scripts/install.py" --target all

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

echo -e "\n${BOLD}${GREEN}✔ Installation Complete!${RESET}"
echo -e "Try routing a task:"
echo -e "  ${BOLD}bus \"Build a Next.js app with Supabase and Tailwind\"${RESET}\n"
