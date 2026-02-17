#!/bin/bash
set -e

# This script is called by semantic-release to deploy the built plugin to the stash-plugins repo
# Arguments:
#   $1 - The new version being released

VERSION=$1
STASH_PLUGINS_REPO="secondfolder/stash-plugins"
STASH_PLUGINS_DIR="../stash-plugins"
SOURCE_DIR="packages/tv-plugin/dist"
TARGET_DIR="plugins/stash-tv"

echo "Deploying version $VERSION to $STASH_PLUGINS_REPO"

# Clone the stash-plugins repo if it doesn't exist
if [ ! -d "$STASH_PLUGINS_DIR" ]; then
  echo "Cloning $STASH_PLUGINS_REPO..."
  git clone "https://${CI_GITHUB_TOKEN}@github.com/${STASH_PLUGINS_REPO}.git" "$STASH_PLUGINS_DIR"
else
  echo "Updating existing clone..."
  cd "$STASH_PLUGINS_DIR"
  git fetch origin
  git reset --hard origin/main
  cd -
fi

# Copy built files to stash-plugins
echo "Copying built files from $SOURCE_DIR to $STASH_PLUGINS_DIR/$TARGET_DIR..."
rm -rf "${STASH_PLUGINS_DIR:?}/${TARGET_DIR:?}"
mkdir -p "$STASH_PLUGINS_DIR/$TARGET_DIR"
cp -r "$SOURCE_DIR"/* "$STASH_PLUGINS_DIR/$TARGET_DIR/"

# Commit and push changes
cd "$STASH_PLUGINS_DIR"

# Configure git
git config user.name "GitHub Actions Bot"
git config user.email "github-actions[bot]@users.noreply.github.com"

# Check if there are any changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Changes detected, committing..."
  git add .
  git commit -m "chore: update stash-tv plugin to v$VERSION"
  
  echo "Pushing to $STASH_PLUGINS_REPO..."
  git push origin main
  
  echo "Successfully deployed version $VERSION to stash-plugins repo"
else
  echo "No changes to deploy"
fi

cd -
