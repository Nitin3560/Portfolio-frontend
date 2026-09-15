# nsr-os — source layout

The site **ships as one file**: `index.html`. That is deliberate — a single
object on S3 means the deploy is atomic (never half-updated), there is no
MIME-type footgun (S3 serving a `.js` as `text/plain` fails silently), and
the HTML can never go out of sync with a cached script.

The *source* is split so it can be read, reviewed and diffed. `build.py`
concatenates the parts listed in `MANIFEST.json`, in order, and the result is
byte-for-byte the page. Nothing is minified or transformed beyond three steps:
the `<title>` is lifted into a real `<head>`, the résumé photo is written out to
`resume.jpg` and linked, and the meta / Open Graph / JSON-LD block is injected.

## Build

    python3 build.py              # writes index.html + resume.jpg
    python3 build.py --check      # build to memory, diff against index.html
    python3 build.py --no-tracks  # build with an empty playlist (for testing —
                                  # the player then synthesises its own music)

`--check` exits non-zero on any difference, so it works as a CI gate.

## Deploy

    ./deploy.sh              build, check, upload
    ./deploy.sh --dry-run    show what would be uploaded, change nothing
    ./deploy.sh --prune      also delete files on S3 that no longer exist locally

The script refuses to upload if any file `index.html` references is missing from
disk, uploads assets before `index.html` (so the new page is never live while
pointing at files still uploading), sets `no-cache` on the HTML and a one-day
cache on everything else, and finishes by fetching the live URLs to confirm each
one returns 200 with the right content type.

`src/`, `build.py` and `deploy.sh` are never uploaded.

## Layout

    head.html            <title>, font links, opening <style>
    css/                 stylesheet, in cascade order — the order in
                         MANIFEST.json IS the cascade, so moving a file
                         changes which rules win
    noscript.html        closing </style>, skip link, no-JS fallback styles
    body/                markup. 12-resume-image.b64 is the inlined résumé
                         photo — generated data, never edit it by hand
    js/                  application, in execution order inside one IIFE:
                           00-failsafe   blank-page guard, its own <script>
                           05-open       opening <script> + preamble
                           10-icon-art   16px pixel icons
                           20-shell      icons, start menu, taskbar, windows
                           30-mobile     collapsible stack + section nav
                           40-layout     desktop/flow layout modes
                           50-dialogs    start menu, compose, clock
                           60-wallpaper  the city-pop canvas
                           70-player     Web Audio + file playback
                           80-terminal   nsrsh
                           90-pacman     game engine + window wiring
                           95-recruiter  notification + Recruiter View
                           99-boot       boot sequence, start()
    tracks.json          the music player's playlist

## Two things that will bite you

**Order is the cascade.** These files are concatenated, not modules. Two rules
with equal specificity are resolved by file order in `MANIFEST.json`. A
narrow-screen `#tray` override once lost to a base `#tray` rule for exactly
this reason. Media queries add no specificity — an override must come *after*
what it overrides.

**One IIFE.** All of `js/` runs in a single closure, so every top-level `var`
and `function` is visible to every other file. That is what lets the game reach
`wins`, `isFlow()` and the audio context without any wiring. It also means a
name collision between two files is a real bug — `boot` and `clock` once
collided with player-local names and had to be renamed.
