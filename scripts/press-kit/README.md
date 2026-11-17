# Press kit one-sheet (public/luchi-beats-press-kit.pdf)

Rebuild it when the credits change (run from the `web` folder, Bash):

```bash
W="$(pwd)"; T=scripts/press-kit/tmp; mkdir -p $T
node -e "require('sharp')('public/logo.png').trim().resize(900).png().toFile('$T/logo-trim.png')"
NODE_PATH="$W/node_modules" node scripts/press-kit/1-pull-credits.cjs $T/credits.json   # reads the live homepage
NODE_PATH="$W/node_modules" node scripts/press-kit/2-make-pdf.cjs "$W" $T/credits.json "$W/public/luchi-beats-press-kit.pdf"
```

The bio, quotes and artist list are written inside `2-make-pdf.cjs`.
