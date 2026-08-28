#!/usr/bin/env bash
#
# Build the signed TWA. Wraps bubblewrap because three separate things about
# this machine's toolchain will otherwise fail in ways that do not name their
# own cause.
#
#   1. ARCH. @resvg/resvg-js resolves its native binary from process.arch at
#      REQUIRE time, so the node that launches bubblewrap decides which
#      binding is loaded. node_modules holds exactly one. On 2026-08-27 the
#      first `node` on PATH was an x64 MacPorts build, the installed binding
#      was darwin-arm64, and the failure read "Cannot find module
#      '@resvg/resvg-js-darwin-x64'" — which invites reinstalling
#      node_modules, and reinstalling does not fix it. So: pick the node whose
#      arch matches the binding that is actually on disk. Detected, not
#      hardcoded, because the right answer changes the moment PATH is fixed.
#
#   2. PASSWORD. The upload keystore password lives in the macOS Keychain and
#      is never on disk in this repo. bubblewrap reads it from these two env
#      vars, or else prompts — and a prompt in a non-interactive shell hangs
#      forever rather than failing.
#
#   3. Nothing sets JAVA_HOME here on purpose. bubblewrap reads its own JDK
#      and Android SDK paths from ~/.bubblewrap/config.json.
#
set -euo pipefail
cd "$(dirname "$0")"

KEYCHAIN_SERVICE="sixonthedial-upload-key"

# --- 1. which arch does the installed resvg binding require? ----------------
binding=$(ls -d node_modules/@resvg/resvg-js-darwin-* 2>/dev/null | head -1 || true)
if [ -z "$binding" ]; then
  echo "error: no @resvg/resvg-js-darwin-* binding installed. Run: npm install" >&2
  exit 1
fi
want_arch="${binding##*darwin-}"

# --- 2. find a node of that arch -------------------------------------------
candidates=(
  "$(command -v node || true)"
  /opt/homebrew/bin/node
  /usr/local/bin/node
  /opt/local/bin/node
)
# Homebrew keg-only versions, newest last so they win.
for n in /usr/local/opt/node@*/bin/node /opt/homebrew/opt/node@*/bin/node; do
  [ -x "$n" ] && candidates+=("$n")
done

NODE=""
for n in "${candidates[@]}"; do
  [ -n "$n" ] && [ -x "$n" ] || continue
  arch=$("$n" -p 'process.arch' 2>/dev/null || true)
  if [ "$arch" = "$want_arch" ]; then NODE="$n"; break; fi
done

if [ -z "$NODE" ]; then
  echo "error: no node of arch '$want_arch' found (the installed resvg binding needs it)." >&2
  echo "tried:" >&2
  for n in "${candidates[@]}"; do
    [ -n "$n" ] && [ -x "$n" ] && echo "  $n -> $("$n" -p 'process.arch+" "+process.version' 2>/dev/null || echo unusable)" >&2
  done
  exit 1
fi

# --- 3. keystore password from the Keychain --------------------------------
if ! PW=$(security find-generic-password -s "$KEYCHAIN_SERVICE" -w 2>/dev/null); then
  echo "error: no password in the Keychain under service '$KEYCHAIN_SERVICE'." >&2
  echo "The upload keystore and its password are created together; see docs." >&2
  exit 1
fi
if [ ! -f ./upload.keystore ]; then
  echo "error: ./upload.keystore is missing. It is gitignored and cannot be" >&2
  echo "regenerated — a replacement key requires an upload-key reset in Play Console." >&2
  exit 1
fi
export BUBBLEWRAP_KEYSTORE_PASSWORD="$PW" BUBBLEWRAP_KEY_PASSWORD="$PW"

echo "node:  $NODE ($("$NODE" -p 'process.arch+" "+process.version'))"
echo "build: bubblewrap"
exec "$NODE" node_modules/@bubblewrap/cli/bin/bubblewrap.js build "$@"
