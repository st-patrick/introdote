#!/bin/bash
# Open Your Eyes — Global Install
# Sets up ~/.open-your-eyes/ as the global agent capability store

set -e

OYE_DIR="$HOME/.open-your-eyes"

echo "Installing Open Your Eyes → $OYE_DIR"
echo ""

# Create directory structure
mkdir -p "$OYE_DIR/providers"
mkdir -p "$OYE_DIR/keys"

# Copy playbook
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/PLAYBOOK.md" "$OYE_DIR/PLAYBOOK.md"

# Create secrets.env if it doesn't exist (don't overwrite!)
if [ ! -f "$OYE_DIR/secrets.env" ]; then
    touch "$OYE_DIR/secrets.env"
    chmod 600 "$OYE_DIR/secrets.env"
    echo "  Created secrets.env"
else
    echo "  secrets.env already exists (not overwritten)"
fi

# Create capabilities.yaml if it doesn't exist
if [ ! -f "$OYE_DIR/capabilities.yaml" ]; then
    cat > "$OYE_DIR/capabilities.yaml" << 'EOF'
# Open Your Eyes — Capabilities
# Auto-updated as providers are configured.
# Tells the agent what it can do across all projects.
EOF
    echo "  Created capabilities.yaml"
else
    echo "  capabilities.yaml already exists (not overwritten)"
fi

# Global gitignore — never commit ~/.open-your-eyes/ contents
GITIGNORE_GLOBAL="$HOME/.gitignore_global"
if ! grep -qxF '.open-your-eyes/' "$GITIGNORE_GLOBAL" 2>/dev/null; then
    echo ".open-your-eyes/" >> "$GITIGNORE_GLOBAL"
    git config --global core.excludesFile "$GITIGNORE_GLOBAL"
    echo "  Added .open-your-eyes/ to global gitignore"
fi

# Add to CLAUDE.md if Claude Code is installed
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
if [ -d "$HOME/.claude" ]; then
    if ! grep -q "open-your-eyes" "$CLAUDE_MD" 2>/dev/null; then
        cat >> "$CLAUDE_MD" << 'EOF'

## Open Your Eyes

When I say "finish", "ship it", "deploy", or "open your eyes":
1. Read ~/.open-your-eyes/PLAYBOOK.md and follow its instructions
2. Scan the current project, check global capabilities, fill gaps, and ship
EOF
        echo "  Added skill trigger to ~/.claude/CLAUDE.md"
    else
        echo "  ~/.claude/CLAUDE.md already has open-your-eyes entry"
    fi
else
    echo "  Claude Code not detected — skipping CLAUDE.md integration"
    echo "  To add manually, put this in your AI agent's global config:"
    echo "    When I say 'finish' or 'open your eyes': read ~/.open-your-eyes/PLAYBOOK.md"
fi

echo ""
echo "Done! Open Your Eyes is installed."
echo ""
echo "Usage: In any project, tell your AI agent:"
echo "  \"finish\"  or  \"open your eyes\"  or  \"ship it\""
echo ""
echo "First time? The agent will walk you through setting up your providers."
echo "After that, it works automatically for every project."
