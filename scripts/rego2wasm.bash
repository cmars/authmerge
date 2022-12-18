#!/usr/bin/env bash

# Usage: rego2wasm.bash [policy.rego]
#
# Compiles an OPA rego policy.rego file to policy.wasm in the same containing
# directory.

function die {
    >&2 echo "${1:-failed}"
    exit 1
}

set -euo pipefail

workdir=$(mktemp -d)
trap "rm -rf $workdir" EXIT

regofile=$1
[ -e "$regofile" ] || die "$1: not found"
[[ "$regofile" =~ \.rego$ ]] || die "$1: not a .rego file"
wasmfile=$(sed 's/\.rego$/.wasm/' <<< "$regofile")

opa build -t wasm -e authmerge/allow $regofile -o $workdir/bundle.tar.gz

(cd $workdir; tar -xzf bundle.tar.gz /policy.wasm)
mv $workdir/policy.wasm $wasmfile