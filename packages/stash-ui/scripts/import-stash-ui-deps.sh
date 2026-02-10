#!/usr/bin/env bash

# Enable strict mode
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir/.."

jq_filter='
def sort_keys:
  with_entries(.) | to_entries | sort_by(.key) | from_entries;

.[0] + {
  dependencies: (.[0].dependencies + .[1].dependencies) | sort_keys,
  devDependencies: (
    .[0].devDependencies + {
        sass: .[1].devDependencies.sass | sub("^\\^"; "")
    }
  ) | sort_keys
}
'

jq -s "$jq_filter" package.json stash/ui/v2.5/package.json > package.json.tmp && mv package.json.tmp package.json