// Builds the one-page press kit PDF (Letter) from an HTML template with Playwright's Chromium.
// No credits list on the one-sheet (Luchi's call, 2026-11-20): bio, facts, quotes and artists only.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [, , webDir, tmpDir, outFile] = process.argv;
// Video tiles: tapping one opens that video playing on the Press page (video can't play inside a PDF
// in most viewers). Thumbnails are made from the videos' posters before the page is built.
const VIDEOS = [
  { title: 'THE RECAP', note: 'Music: Maestro (Prod. Luchi Beats) · Tap to watch', href: 'https://www.luchibeats.com/press#recap', thumb: 'thumb-recap.jpg' },
  { title: 'BEHIND THE SCENES', note: 'Tap to watch', href: 'https://www.luchibeats.com/press#behind-the-scenes', thumb: 'thumb-bts.jpg' },
];
async function makeThumbs() {
  const sharp = require('sharp');
  const W = 1200, H = 675;
  await sharp(path.resolve(webDir, 'public/video/live-recap-poster.webp')).resize(W, H, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(path.resolve(tmpDir, 'thumb-recap.jpg'));
  // Vertical clip: centred, with its own picture blurred and darkened behind it (same look as the site)
  const bts = path.resolve(webDir, 'public/video/live-bts-poster.webp');
  const bg = await sharp(bts).resize(W, H, { fit: 'cover' }).blur(28).modulate({ brightness: 0.5 }).toBuffer();
  const fg = await sharp(bts).resize({ height: H }).toBuffer();
  const fgW = (await sharp(fg).metadata()).width;
  await sharp(bg).composite([{ input: fg, left: Math.round((W - fgW) / 2), top: 0 }]).jpeg({ quality: 88 }).toFile(path.resolve(tmpDir, 'thumb-bts.jpg'));
}
const file = (p) => 'file:///' + path.resolve(webDir, p).replace(/\\/g, '/');
const artists = ["A Boogie Wit Da Hoodie", "Coi Leray", "Fabolous", "Dave East", "Raekwon", "Conway The Machine", "Joe Budden", "Fetty Wap", "Mysonne", "Mariah Lynn", "Albeal", "Arlene Mc", "Harrd Luck", "Max Santos", "Nyah Lee", "Oskama Esteban", "Tempo"];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 8.5in; height: 11in; background: #0a0908; color: #fff; font-family: "Segoe UI", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; overflow: hidden; position: relative; }
.frame { position: absolute; inset: 0.22in; border: 1.5px solid rgba(201,168,76,0.7); border-radius: 6px; }
.top { position: relative; height: 4.1in; overflow: hidden; }
.top img.photo { position: absolute; right: 0; top: 0; width: 4.1in; height: 4.1in; object-fit: cover; object-position: 50% 30%;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 35%), linear-gradient(to bottom, #000 80%, transparent 100%); -webkit-mask-composite: source-in; filter: brightness(0.88); }
.glow { position: absolute; left: -1in; top: 0.4in; width: 5.5in; height: 3.6in; background: radial-gradient(ellipse at center, rgba(201,150,60,0.22), transparent 65%); }
.brand { position: absolute; left: 0.55in; top: 1.0in; width: 3.7in; }
.brand img { width: 100%; }
.role { margin-top: 0.18in; text-align: center; font-weight: 800; letter-spacing: 0.28em; font-size: 11pt; color: #E5C76B; }
.place { margin-top: 0.04in; text-align: center; font-weight: 700; letter-spacing: 0.34em; font-size: 8.5pt; color: rgba(255,255,255,0.65); }
.label { font-size: 7.5pt; font-weight: 800; letter-spacing: 0.3em; color: #C9A84C; text-transform: uppercase; margin-bottom: 0.08in; }
.body { padding: 0.15in 0.55in 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4in; }
.bio { font-size: 9.6pt; line-height: 1.55; color: rgba(255,255,255,0.88); }
.facts { margin-top: 0.14in; font-size: 8.4pt; line-height: 1.7; color: rgba(255,255,255,0.8); }
.facts b { color: #E5C76B; font-weight: 800; letter-spacing: 0.12em; font-size: 7pt; display: inline-block; width: 0.85in; }
.quote { margin-bottom: 0.2in; padding: 0.12in 0.14in; border-left: 2px solid #C9A84C; background: rgba(255,255,255,0.03); font-size: 8.6pt; line-height: 1.5; font-style: italic; color: rgba(255,255,255,0.85); }
.quote span { display: block; margin-top: 0.05in; font-style: normal; font-weight: 800; font-size: 7pt; letter-spacing: 0.24em; color: #C9A84C; }
.artists { margin: 0.22in 0.55in 0; padding-top: 0.14in; border-top: 1px solid rgba(201,168,76,0.3); }
.artists p { font-size: 9.2pt; font-weight: 700; line-height: 1.65; }
.artists i { color: #C9A84C; font-style: normal; }
.watch { margin: 0.24in 0.55in 0; }
.watch-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2in; }
.tile { display: block; color: inherit; text-decoration: none; }
.tile-img { position: relative; height: 1.72in; border-radius: 4px; overflow: hidden; box-shadow: 0 0 0 1px rgba(201,168,76,0.35); }
.tile-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tile-img::after { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,0.05), rgba(0,0,0,0.45)); }
.play { position: absolute; left: 50%; top: 50%; width: 0.62in; height: 0.62in; margin: -0.31in 0 0 -0.31in; z-index: 1; border-radius: 50%;
  background: linear-gradient(135deg,#A8892E,#C9A84C,#E5C76B); box-shadow: 0 4px 18px rgba(0,0,0,0.6); }
.play::before { content: ""; position: absolute; left: 0.25in; top: 0.19in; border-style: solid; border-width: 0.12in 0 0.12in 0.19in; border-color: transparent transparent transparent #000; }
.tile-cap { margin-top: 0.07in; display: flex; justify-content: space-between; align-items: baseline; font-size: 7.5pt; color: rgba(255,255,255,0.6); }
.tile-cap b { font-size: 7pt; font-weight: 800; letter-spacing: 0.22em; color: #C9A84C; }
.foot { position: absolute; left: 0.55in; right: 0.55in; bottom: 0.45in; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8.4pt; color: rgba(255,255,255,0.75); }
.foot b { color: #E5C76B; }
.cta { padding: 0.07in 0.16in; border-radius: 4px; background: linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B); color: #000; font-weight: 800; letter-spacing: 0.08em; }
</style></head><body>
<div class="frame"></div>
<div class="top">
  <div class="glow"></div>
  <img class="photo" src="${file('public/luchi/press/luchi-beats-red-low-angle.jpg')}">
  <div class="brand"><img src="${'file:///' + path.resolve(tmpDir, 'logo-trim.png').split(path.sep).join('/')}"><div class="role">PRODUCER · ENGINEER</div><div class="place">PATERSON, NJ</div></div>
</div>
<div class="body">
  <div>
    <div class="label">Bio</div>
    <p class="bio">Luchi Beats is a producer and engineer out of Paterson, New Jersey. Over the years he has produced, recorded and mixed records for some of the most respected names in the culture, from street anthems to soulful, layered productions. Artists know him as a one-stop shop: the beat, the vocal session and the mix, all with the same focus.</p>
    <div class="facts">
      <div><b>DOES</b>Production · Recording · Mixing &amp; Mastering</div>
      <div><b>GENRES</b>Hip-Hop · Trap · R&amp;B · Afrobeats</div>
      <div><b>LIVE</b>Luchi Beats &amp; Friends on YouTube</div>
    </div>
  </div>
  <div>
    <div class="label">What Artists Say</div>
    <div class="quote">“Luchi is one of the best engineers I have ever worked with… a master of sound, and the producer/engineer you need in your corner.”<span>— CALM KING CAUSEY</span></div>
    <div class="quote">“Luchi is a one-stop shop for everything music related… I have never been disappointed on anything we’ve created.”<span>— MACH CITY</span></div>
  </div>
</div>
<div class="artists"><div class="label">Worked With</div><p>${artists.map(esc).join(' <i>·</i> ')}</p></div>
<div class="watch"><div class="label">Watch · Live Recap Videos</div><div class="watch-row">${VIDEOS.map((v) =>
  `<a class="tile" href="${v.href}"><div class="tile-img"><img src="${'file:///' + path.resolve(tmpDir, v.thumb).split(path.sep).join('/')}"><span class="play"></span></div><div class="tile-cap"><b>${v.title}</b><span>${v.note}</span></div></a>`).join('')}</div></div>
<div class="foot">
  <div><b>luchibeats.com</b> &nbsp;·&nbsp; IG @luchi_beats &nbsp;·&nbsp; YouTube @LuchiBeats</div>
  <div class="cta">BOOKING: LUCHIBEATS.COM/CONTACT</div>
</div>
</body></html>`;

(async () => {
  await makeThumbs();
  const htmlPath = path.resolve(tmpDir, 'onesheet.html');
  fs.writeFileSync(htmlPath, html);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForTimeout(500);
  await p.pdf({ path: outFile, format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
  await p.setViewportSize({ width: 816, height: 1056 });
  await p.screenshot({ path: path.resolve(tmpDir, 'onesheet.png') });
  await b.close();
  console.log('pdf written', fs.statSync(outFile).size);
})();
