// Builds the one-page press kit PDF (Letter) from an HTML template with Playwright's Chromium.
// No credits list on the one-sheet (Luchi's call, 2026-11-20): bio, facts, quotes and artists only.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [, , webDir, tmpDir, outFile] = process.argv;
const file = (p) => 'file:///' + path.resolve(webDir, p).replace(/\\/g, '/');
const artists = ["A Boogie Wit Da Hoodie", "Coi Leray", "Fabolous", "Dave East", "Raekwon", "Conway The Machine", "Joe Budden", "Fetty Wap", "Mysonne", "Mariah Lynn", "Albeal", "Arlene Mc", "Harrd Luck", "Max Santos", "Nyah Lee", "Oskama Esteban", "Tempo"];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 8.5in; height: 11in; background: #0a0908; color: #fff; font-family: "Segoe UI", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; overflow: hidden; position: relative; }
.frame { position: absolute; inset: 0.22in; border: 1.5px solid rgba(201,168,76,0.7); border-radius: 6px; }
.top { position: relative; height: 3.55in; overflow: hidden; }
.top img.photo { position: absolute; right: 0; top: 0; width: 3.7in; height: 3.55in; object-fit: cover; object-position: 50% 28%;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 35%), linear-gradient(to bottom, #000 80%, transparent 100%); -webkit-mask-composite: source-in; filter: brightness(0.88); }
.glow { position: absolute; left: -1in; top: 0.4in; width: 5.5in; height: 3.6in; background: radial-gradient(ellipse at center, rgba(201,150,60,0.22), transparent 65%); }
.brand { position: absolute; left: 0.55in; top: 0.75in; width: 3.7in; }
.brand img { width: 100%; }
.role { margin-top: 0.18in; text-align: center; font-weight: 800; letter-spacing: 0.28em; font-size: 11pt; color: #E5C76B; }
.place { margin-top: 0.04in; text-align: center; font-weight: 700; letter-spacing: 0.34em; font-size: 8.5pt; color: rgba(255,255,255,0.65); }
.label { font-size: 7.5pt; font-weight: 800; letter-spacing: 0.3em; color: #C9A84C; text-transform: uppercase; margin-bottom: 0.08in; }
.body { padding: 0.15in 0.55in 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4in; }
.bio { font-size: 9.6pt; line-height: 1.55; color: rgba(255,255,255,0.88); }
.facts { margin-top: 0.14in; font-size: 8.4pt; line-height: 1.7; color: rgba(255,255,255,0.8); }
.facts div { display: flex; }
.facts b { color: #E5C76B; font-weight: 800; letter-spacing: 0.12em; font-size: 7pt; flex: none; width: 0.85in; }
.deal { margin-top: 0.12in; }
.deal p { font-size: 8.3pt; line-height: 1.5; font-weight: 600; color: rgba(255,255,255,0.88); }
.quote { margin-bottom: 0.14in; padding: 0.12in 0.14in; border-left: 2px solid #C9A84C; background: rgba(255,255,255,0.03); font-size: 8.6pt; line-height: 1.5; font-style: italic; color: rgba(255,255,255,0.85); }
.quote span { display: block; margin-top: 0.05in; font-style: normal; font-weight: 800; font-size: 7pt; letter-spacing: 0.24em; color: #C9A84C; }
.artists { margin: 0.22in 0.55in 0; padding-top: 0.14in; border-top: 1px solid rgba(201,168,76,0.3); }
.artists p { font-size: 9.2pt; font-weight: 700; line-height: 1.65; }
.artists i { color: #C9A84C; font-style: normal; }
.strip { margin: 0.28in 0.55in 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.12in; }
.strip img { width: 100%; height: 1.75in; object-fit: cover; object-position: 50% 35%; border-radius: 3px; display: block; }
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
      <div><b>GENRES</b>Hip-Hop · Latin Hip-Hop · Reggaeton · Trap · R&amp;B · Afrobeats</div>
      <div><b>LIVE</b>Luchi Beats &amp; Friends on YouTube</div>
    </div>
  </div>
  <div>
    <div class="label">What Artists Say</div>
    <div class="quote">“Luchi is one of the best engineers I have ever worked with… a master of sound, and the producer/engineer you need in your corner.”<span>— CALM KING CAUSEY</span></div>
    <div class="quote">“Luchi is a one-stop shop for everything music related… I have never been disappointed on anything we’ve created.”<span>— MACH CITY</span></div>
    <div class="deal"><div class="label">Open To</div><p>Publishing · Production Deals · Placements · <span style="white-space:nowrap">Studio Partnerships · A&amp;R</span></p></div>
    <div class="deal"><div class="label">Business</div><p>Luchi Beats LLC · BMI-registered · Split sheets on every session</p></div>
  </div>
</div>
<div class="artists"><div class="label">Worked With</div><p>${artists.map(esc).join(' <i>·</i> ')}</p></div>
<div class="strip">${['bw-hand-face', 'red-profile', 'bw-hand-mouth', 'crimson-half'].map((n) => `<img src="${file(`public/luchi/press/luchi-beats-${n}.jpg`)}">`).join('')}</div>
<div class="foot">
  <div><b>luchibeats.com</b> &nbsp;·&nbsp; IG @luchi_beats &nbsp;·&nbsp; YouTube @LuchiBeats</div>
  <div class="cta">BOOKING: LUCHIBEATS.COM/CONTACT</div>
</div>
</body></html>`;

(async () => {
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
