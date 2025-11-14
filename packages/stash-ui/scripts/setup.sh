#!/usr/bin/env bash

# Enable strict mode
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

{
  cd "$SCRIPT_DIR/.."
  git submodule update --init --recursive
};

{
  cd "$SCRIPT_DIR/../stash"
  git reset --hard v0.28.1
  echo 'ui/v2.5/graphql/stash-tv.graphql' >> "$(git rev-parse --git-dir)/info/exclude"
  rm -f ui/v2.5/graphql/stash-tv.graphql
  git apply ../patches/stash-tv.patch
};

{
  cd "$SCRIPT_DIR/../stash/ui/v2.5"
  yarn install
};