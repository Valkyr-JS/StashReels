#!/usr/bin/env bash

# Enable strict mode
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/../dist"

# Clean build directory
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"

"$SCRIPT_DIR/generate-ql.sh"
"$SCRIPT_DIR/compile-ts.sh"
"$SCRIPT_DIR/compile-sass.ts"