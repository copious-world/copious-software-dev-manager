#!/usr/bin/env bash
set -euo pipefail

# publish-npm.sh
# Usage:
#   ./publish-npm.sh [bump|version] [--no-git] [--tag <tag>] [--dry-run] [--force]
# Examples:
#   ./publish-npm.sh patch
#   ./publish-npm.sh minor --tag beta
#   ./publish-npm.sh 1.2.3 --no-git
#   ./publish-npm.sh --dry-run
#
# Behavior:
#  - Reads current version from package.json.
#  - Optionally bumps (patch/minor/major/prepatch/prerelease) or sets an explicit version.
#  - Uses `npm version` to update package.json (respecting --no-git if requested).
#  - Attempts npm publish (with optional --tag).
#  - On publish failure, attempts to roll back the package.json change (and git commit/tag if created).
#
# WARNING: If you don't want any git commits/tags created, pass --no-git.
#
# Requirements: node, npm, git (if you don't use --no-git), bash.

PROGNAME="$(basename "$0")"
BUMP="patch"   # default bump
NO_GIT=false
DRY_RUN=false
FORCE=false
PUBLISH_TAG=""
TIMESTAMP="$(date +%s)"
BACKUP_PKG="package.json.bak.$TIMESTAMP"

usage() {
  cat <<EOF
Usage: $PROGNAME [bump|version] [--no-git] [--tag <tag>] [--dry-run] [--force]

Positional argument (optional):
  bump|version    One of npm version increment types (patch, minor, major, prepatch, prerelease)
                  or an explicit semver (1.2.3). Default: patch

Options:
  --no-git        Do not create git commit/tag via 'npm version --no-git'
  --tag <tag>     Pass --tag <tag> to npm publish (e.g. 'beta')
  --dry-run       Show what would be done, but don't run commands
  --force         Bypass git clean check (use with care)

Examples:
  $PROGNAME patch
  $PROGNAME minor --tag beta
  $PROGNAME 1.2.3 --no-git
  $PROGNAME --dry-run
EOF
}

# Simple arg parsing
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-git) NO_GIT=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --force) FORCE=true; shift ;;
    --tag)
      shift
      if [[ $# -eq 0 ]]; then echo "Error: --tag requires a value"; exit 2; fi
      PUBLISH_TAG="$1"
      shift
      ;;
    -h|--help) usage; exit 0 ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#ARGS[@]} -gt 0 ]]; then
  BUMP="${ARGS[0]}"
fi

run() {
  echo "+ $*"
  if [[ "$DRY_RUN" = true ]]; then
    return 0
  fi
  "$@"
}

# Preconditions
command -v node >/dev/null 2>&1 || { echo "node is required but not found in PATH"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not found in PATH"; exit 1; }
if [[ "$NO_GIT" = false ]]; then
  command -v git >/dev/null 2>&1 || { echo "git is required for default behavior; use --no-git to skip git operations"; exit 1; }
fi

if [[ ! -f package.json ]]; then
  echo "No package.json found in current directory ($(pwd)). Run from your package root."
  exit 1
fi

# Read current version
current_version="$(node -e "console.log(require('./package.json').version || '')")" || true
if [[ -z "$current_version" ]]; then
  echo "Could not read version from package.json"
  exit 1
fi
echo "Current version: $current_version"

# Validate whether bump looks like an explicit semver (simple check) or a keyword
if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-.+)?$ ]]; then
  explicit_version=true
else
  explicit_version=false
fi

# If explicit version equals current, skip bump
if [[ "$explicit_version" = true && "$BUMP" = "$current_version" ]]; then
  echo "Requested version is identical to current version ($current_version). Skipping npm version."
  will_run_version=false
else
  will_run_version=true
fi

# If using git, ensure working tree clean unless forced
if [[ "$NO_GIT" = false && "$FORCE" = false ]]; then
  if ! git diff-index --quiet HEAD --; then
    echo "Working tree has uncommitted changes. Commit or stash them before running, or use --force to bypass."
    exit 1
  fi
fi

# Backup package.json in case we need to roll back (when using --no-git)
cp package.json "$BACKUP_PKG"
echo "Backed up package.json -> $BACKUP_PKG"

# Run npm version (if needed)
NPM_VERSION_CMD=(npm version)
if [[ "$NO_GIT" = true ]]; then
  NPM_VERSION_CMD+=(--no-git)
fi
NPM_VERSION_CMD+=("$BUMP")

if [[ "$will_run_version" = true ]]; then
  echo "Updating version using: ${NPM_VERSION_CMD[*]}"
  run "${NPM_VERSION_CMD[@]}"
else
  echo "Skipping npm version; using current package.json version."
fi

# Read new version
new_version="$(node -e "console.log(require('./package.json').version || '')")" || true
if [[ -z "$new_version" ]]; then
  echo "Failed to read new version from package.json after bump. Attempting rollback."
  if [[ "$DRY_RUN" = false ]]; then
    cp "$BACKUP_PKG" package.json
  fi
  exit 1
fi
echo "New version: $new_version"

# Publish
PUBLISH_CMD=(npm publish)
if [[ -n "$PUBLISH_TAG" ]]; then
  PUBLISH_CMD+=(--tag "$PUBLISH_TAG")
fi

echo "Publishing with: ${PUBLISH_CMD[*]}"
if run "${PUBLISH_CMD[@]}"; then
  echo "npm publish succeeded for version $new_version"
  echo "Done."
  exit 0
else
  echo "npm publish failed. Attempting rollback..."

  # If we used npm version with git (default), try to undo the commit and tag.
  if [[ "$NO_GIT" = false && "$will_run_version" = true ]]; then
    if [[ "$DRY_RUN" = false ]]; then
      # Find tag name created by npm version (usually v<version>)
      tag_name="v${new_version}"
      echo "Attempting to remove git commit and tag: $tag_name"
      # Reset the last commit (npm version creates one)
      if git rev-parse --verify "HEAD" >/dev/null 2>&1; then
        git reset --hard HEAD~1 || echo "git reset failed; you may need to fix manually"
      fi
      # Delete tag locally if exists
      if git rev-parse --verify "refs/tags/$tag_name" >/dev/null 2>&1; then
        git tag -d "$tag_name" || echo "Failed to delete tag $tag_name locally"
      fi
    fi
  else
    # No-git mode: restore package.json backup
    if [[ "$DRY_RUN" = false ]]; then
      cp "$BACKUP_PKG" package.json || echo "Failed to restore package.json from backup $BACKUP_PKG"
      echo "Restored package.json from backup"
    fi
  fi

  echo "Rollback attempted. Please verify repository state and tags."
  exit 1
fi
