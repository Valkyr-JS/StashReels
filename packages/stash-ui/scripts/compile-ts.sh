#!/usr/bin/env bash

# Enable strict mode
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$SCRIPT_DIR/.."
BUILD_DIR="$PACKAGE_DIR/dist"
STASH_DIR="$PACKAGE_DIR/stash/ui/v2.5"

# Ensure build directory exists
mkdir -p "$BUILD_DIR"

# Compile TypeScript in stash/ui/v2.5
{
    cd "$STASH_DIR"
    cp "$PACKAGE_DIR/patches/scene-player-utils.ts" src/components/ScenePlayer/util.ts
    yarn run tsc --outDir "$BUILD_DIR" --noEmit false --declaration true --rootDir "."
    git restore src/components/ScenePlayer/util.ts
};

# Run tsc-alias to replace path aliases and copy in CSS + custom declaration files
{
    cd "$SCRIPT_DIR/.."
    yarn run tsc-alias --project "$STASH_DIR/tsconfig.json" --outDir "$BUILD_DIR"
    # Some files import CSS files so we need to copy those over too. For example:
    # packages/stash-ui/stash/ui/v2.5/src/components/ScenePlayer/markers.ts
    yarn run copyfiles --soft --up 3 "stash/ui/v2.5/src/**/*.css" "stash/ui/v2.5/src/**/*.d.ts" "$BUILD_DIR"
};
