#!/usr/bin/env bash

# Enable strict mode
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/../dist"
STASH_DIR="$SCRIPT_DIR/../stash/ui/v2.5"

# Ensure build directory exists
mkdir -p "$BUILD_DIR"

# Compile TypeScript in stash/ui/v2.5
{
    cd "$STASH_DIR"
    yarn run tsc --outDir "$BUILD_DIR" --noEmit false --declaration true --rootDir "."
};

# Run tsc-alias to replace path aliases
{
    cd "$SCRIPT_DIR/.."
    yarn run tsc-alias --project "$STASH_DIR/tsconfig.json" --outDir "$BUILD_DIR"
    # Some files import CSS files so we need to copy those over too. For example:
    # packages/stash-ui/stash/ui/v2.5/src/components/ScenePlayer/markers.ts
    yarn run copyfiles --up 3 "stash/ui/v2.5/src/**/*.css" "$BUILD_DIR"
};
