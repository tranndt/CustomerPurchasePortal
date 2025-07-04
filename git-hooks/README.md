# Git Hooks for Security

This directory contains Git hooks to help prevent accidentally committing sensitive files.

## Installation

Run the following command to install the hooks:

```bash
cp git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Available Hooks

### pre-commit

This hook checks for:

* API key files (apikey.json, *.key, *.pem)
* Environment files (.env, .env.*)

If any of these files are staged for commit, the hook will block the commit and show an error message.
