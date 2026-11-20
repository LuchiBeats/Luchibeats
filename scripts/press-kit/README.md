# Press kit one-sheet (public/luchi-beats-press-kit.pdf)

One page: logo, headshot, bio, facts, artist quotes, the Worked With list and two
video tiles. Video can't play inside a PDF in most viewers, so each tile links to that
video playing on the Press page (luchibeats.com/press#recap, #behind-the-scenes).
The tile thumbnails are made from public/video/*-poster.webp when the script runs.
No credits list, on purpose (Luchi asked for none, 2026-11-20).

Rebuild it after changing the text or photo (run from the `web` folder, Bash):

```bash
W="$(pwd)"; T=scripts/press-kit/tmp; mkdir -p $T
node -e "require('sharp')('public/logo.png').trim().resize(900).png().toFile('$T/logo-trim.png')"
NODE_PATH="$W/node_modules" node scripts/press-kit/2-make-pdf.cjs "$W" $T "$W/public/luchi-beats-press-kit.pdf"
```

The bio, quotes, artist list and photo are written inside `2-make-pdf.cjs`.
`$T/onesheet.png` is a preview image of the page.
