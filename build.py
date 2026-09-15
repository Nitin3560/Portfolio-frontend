#!/usr/bin/env python3
"""Build index.html from the parts listed in src/MANIFEST.json.

The site ships as ONE self-contained index.html — that is what makes the S3
deploy atomic and immune to MIME-type surprises. The source is split only so it
can be read, reviewed and diffed; concatenating the manifest in order
reproduces the page exactly, and this script then does three things to it:

  1. lifts <title> into a real <head>
  2. writes the inlined resume photo out to resume.jpg and links to it
  3. injects the meta / Open Graph / JSON-LD block

Usage:
    python3 build.py            build index.html
    python3 build.py --check    build to memory and diff against index.html
"""
import base64, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.environ.get("SITE_URL", "https://nitinsinghrathore.us").rstrip("/")
TITLE = "Nitin Singh Rathore — Software Engineer"
DESC = ("Software engineer in Arlington, Texas. M.S. Computer Science at UT Arlington, Dec 2026. "
        "Backend systems, AWS, and applied AI — presented as a retro desktop.")

PERSON = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Nitin Singh Rathore",
    "url": SITE + "/index.html",
    "jobTitle": "Software Engineer",
    "email": "mailto:nxr3560@mavs.uta.edu",
    "address": {"@type": "PostalAddress", "addressLocality": "Arlington",
                "addressRegion": "TX", "addressCountry": "US"},
    "alumniOf": [
        {"@type": "CollegeOrUniversity", "name": "University of Texas at Arlington"},
        {"@type": "CollegeOrUniversity", "name": "Acropolis Institute of Technology & Research"},
    ],
    "sameAs": ["https://github.com/Nitin3560",
               "https://www.linkedin.com/in/nitin-singh-rathore/"],
    "knowsAbout": ["Backend Engineering", "Amazon Web Services", "Kubernetes",
                   "Docker", "Python", "Distributed Systems",
                   "Retrieval-Augmented Generation", "Machine Learning"],
    "seeks": {"@type": "Demand",
              "name": "Software engineering internships and full-time roles"},
}

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="author" content="Nitin Singh Rathore">
<meta name="theme-color" content="#221A46">

<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">

<link rel="canonical" href="{site}/index.html">

<!-- Absolute URLs are mandatory here: LinkedIn, Slack, iMessage and Discord all
     refuse to resolve a relative og:image, and a shared link then renders with
     no preview card at all. Change SITE below if the domain ever moves. -->
<meta property="og:type" content="website">
<meta property="og:url" content="{site}/index.html">
<meta property="og:site_name" content="Nitin Singh Rathore Portfolio">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/og-image-nsr.png">
<meta property="og:image:secure_url" content="{site}/og-image-nsr.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A retro NSR-OS portfolio preview over a purple city-pop skyline.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/og-image-nsr.png">

<script type="application/ld+json">
{person}
</script>
</head>
<body>
"""


def read_parts(manifest=None):
    """Concatenate every file named in the manifest, in order."""
    manifest = manifest or os.path.join(HERE, "src", "MANIFEST.json")
    parts = json.load(io.open(manifest, encoding="utf-8"))
    missing = [p for p in parts if not os.path.exists(os.path.join(HERE, p))]
    if missing:
        raise SystemExit("build: missing source parts:\n  " + "\n  ".join(missing))
    out = []
    for rel in parts:
        out.append(io.open(os.path.join(HERE, rel), encoding="utf-8").read())
    return "".join(out), parts


TRACK_SLOT = "  var USER_TRACKS = [];"


def inject_tracks(body):
    """Put src/tracks.json into the player's playlist slot.

    The playlist used to live only in the deployed file, which meant every
    rebuild silently wiped it and it had to be pasted back by hand. It is real
    source now: edit src/tracks.json, rebuild, done. An empty list is a valid
    choice — the player falls back to synthesising its own music.
    """
    path = os.path.join(HERE, "src", "tracks.json")
    if not os.path.exists(path):
        return body, "tracks: src/tracks.json absent, player will synthesise"
    tracks = json.load(io.open(path, encoding="utf-8"))
    if body.count(TRACK_SLOT) != 1:
        raise SystemExit("build: expected exactly one %r in the source" % TRACK_SLOT)
    rows = ",\n".join(
        '    {title:%s, meta:%s, src:%s}' % (
            json.dumps(t["title"], ensure_ascii=False),
            json.dumps(t.get("meta", ""), ensure_ascii=False),
            json.dumps(t["src"]))
        for t in tracks)
    block = "  var USER_TRACKS = [];" if not tracks else \
            "  var USER_TRACKS = [\n" + rows + "\n  ];"
    return body.replace(TRACK_SLOT, block, 1), "tracks: %d from src/tracks.json" % len(tracks)


def build(dst="index.html", img_out="resume.jpg", write=True, tracks=True):
    body, parts = read_parts()
    notes = ["%d source parts -> %.1f KB of page" % (len(parts), len(body) / 1024)]

    if tracks:
        body, note = inject_tracks(body)
        notes.append(note)
    else:
        notes.append("tracks: skipped (--no-tracks)")

    body, moved = re.subn(r"^<title>.*?</title>\n", "", body, count=1, flags=re.S)
    notes.append("title moved to <head>: %s" % bool(moved))

    m = re.search(r'src="data:image/jpeg;base64,([A-Za-z0-9+/=]+)"', body)
    if m:
        raw = base64.b64decode(m.group(1))
        if write:
            io.open(os.path.join(HERE, img_out), "wb").write(raw)
        body = body[:m.start()] + (
            'src="%s" loading="lazy" decoding="async" width="1000" height="1294"' % img_out
        ) + body[m.end():]
        notes.append("resume image extracted: %.0f KB -> %s" % (len(raw) / 1024, img_out))
    else:
        notes.append("resume image: no data URI found (already external?)")

    head = HEAD.format(title=TITLE, desc=DESC, site=SITE,
                       person=json.dumps(PERSON, indent=2, ensure_ascii=False))
    out = head + body + "\n</body>\n</html>\n"
    if write:
        io.open(os.path.join(HERE, dst), "w", encoding="utf-8").write(out)
    notes.append("%s: %.1f KB" % (dst, len(out.encode()) / 1024))
    return out, notes


if __name__ == "__main__":
    use_tracks = "--no-tracks" not in sys.argv
    if "--check" in sys.argv:
        built, notes = build(write=False, tracks=use_tracks)
        for n in notes:
            print(" ", n)
        cur = io.open(os.path.join(HERE, "index.html"), encoding="utf-8").read()
        if built == cur:
            print("  CHECK: identical to the current index.html")
        else:
            print("  CHECK: DIFFERS from the current index.html")
            sys.exit(1)
    else:
        _, notes = build(tracks=use_tracks)
        for n in notes:
            print(" ", n)
