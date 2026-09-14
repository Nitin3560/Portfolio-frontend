#!/usr/bin/env bash
#
# Build the site and publish it to S3.
#
#   ./deploy.sh              build, check, upload
#   ./deploy.sh --dry-run    show exactly what would be uploaded, change nothing
#   ./deploy.sh --prune      also delete files on S3 that no longer exist locally
#   ./deploy.sh --skip-build use index.html as it stands (don't run build.py)
#
# Override the target with environment variables if it ever moves:
#   BUCKET=my-bucket REGION=us-west-2 ./deploy.sh

set -euo pipefail
cd "$(dirname "$0")"

BUCKET="${BUCKET:-hy-personal-web}"
REGION="${REGION:-us-east-1}"
BASE_URL="${BASE_URL:-https://${BUCKET}.s3.${REGION}.amazonaws.com}"

DRY=""; PRUNE=""; SKIP_BUILD=""
for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY="--dryrun" ;;
    --prune)      PRUNE="--delete" ;;
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help)    sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "deploy: unknown option $arg" >&2; exit 2 ;;
  esac
done

say(){ printf '\n\033[1m%s\033[0m\n' "$*"; }
die(){ printf '\033[31mdeploy: %s\033[0m\n' "$*" >&2; exit 1; }

command -v aws >/dev/null || die "the AWS CLI is not installed — https://aws.amazon.com/cli/"
aws sts get-caller-identity >/dev/null 2>&1 || die "AWS credentials are not configured — run: aws configure"

# ---------------------------------------------------------------- build
if [ -z "$SKIP_BUILD" ]; then
  say "1/4  building"
  command -v python3 >/dev/null || die "python3 not found"
  python3 build.py
else
  say "1/4  build skipped (--skip-build)"
fi

# ------------------------------------------------------------- preflight
# Every path index.html asks the server for must exist on disk. This is the
# check that would have caught the mp3 filename bug before it went live
# instead of after.
say "2/4  checking every referenced file exists"
python3 - <<'PY'
import io, re, sys, os
html = io.open("index.html", encoding="utf-8").read()
refs = set()
for pat in (r'src="([^"]+)"', r'href="([^"]+)"',
            r'content="((?:og-image|favicon|apple-touch)[^"]*)"',
            r'src:\s*"([^"]+)"'):
    for v in re.findall(pat, html):
        if v.startswith(("http", "data:", "mailto:", "#", "javascript:", "/")):
            continue
        refs.add(v)

# the MUSIC comment block documents an example playlist that does not exist
comment = re.search(r'/\* =+ MUSIC =+.*?\*/', html, re.S)
if comment:
    for v in re.findall(r'src:"([^"]+)"', comment.group(0)):
        refs.discard(v)

missing = sorted(r for r in refs if not os.path.exists(r))
for r in sorted(refs):
    print("      %-42s %s" % (r, "MISSING" if r in missing else "ok"))
if missing:
    print("\n  %d referenced file(s) are not on disk — refusing to deploy a broken site"
          % len(missing), file=sys.stderr)
    sys.exit(1)
PY

# ---------------------------------------------------------------- upload
# Assets go first and index.html goes last, so the new page is never live while
# pointing at files that have not finished uploading.
COMMON=(--region "$REGION" --exclude "src/*" --exclude "build.py" --exclude "deploy.sh"
        --exclude "*.bak" --exclude ".DS_Store" --exclude "*/.DS_Store"
        --exclude "shot-*.png" --exclude ".git/*" --exclude "*.mjs" --exclude "__pycache__/*")

say "3/4  uploading assets${DRY:+  (dry run)}"
aws s3 sync . "s3://${BUCKET}" \
  "${COMMON[@]}" --exclude "index.html" \
  --cache-control "public, max-age=86400" \
  $PRUNE $DRY

say "4/4  uploading index.html${DRY:+  (dry run)}"
# never cached: this is the file that has to change the moment you deploy
aws s3 cp index.html "s3://${BUCKET}/index.html" \
  --region "$REGION" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, must-revalidate" $DRY

if [ -n "$DRY" ]; then
  say "dry run complete — nothing was changed"
  exit 0
fi

# ------------------------------------------------------------ smoke test
say "verifying what is actually live"
fail=0
check(){  # path  expected-content-type-fragment
  local url="${BASE_URL}/$1"
  local out code ctype
  out=$(curl -sS -o /dev/null -D - -w '%{http_code}' "$url" 2>/dev/null) || { echo "      $1  UNREACHABLE"; fail=1; return; }
  code="${out: -3}"                       # -w appended the status to the headers
  ctype=$(printf '%s' "$out" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print $2}')
  if [ "$code" = "200" ] && [[ "$ctype" == *"$2"* ]]; then
    printf '      %-42s %s  %s\n' "$1" "$code" "$ctype"
  else
    printf '      %-42s \033[31m%s  %s\033[0m\n' "$1" "$code" "${ctype:-no content-type}"
    fail=1
  fi
}
check "index.html" "text/html"
check "resume.jpg" "image/jpeg"
check "HY_resume.pdf" "application/pdf"
check "og-image.png" "image/png"
for f in music/*.mp3; do check "$f" "audio"; done

if [ "$fail" -ne 0 ]; then
  die "deployed, but some files are not serving correctly — see the red lines above"
fi

say "live at ${BASE_URL}/index.html"
