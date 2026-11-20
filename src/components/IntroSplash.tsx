// Entrance screen, shown at the start of every visit: the flaming logo burns in on black over
// Luchi's portraits fading in and out, and a gold "Enter" button appears. Clicking it opens
// the site with the beat ("Maestro") starting with the sound on. Browsers only allow sound
// after a click or tap, so this click is what lets every visit begin with the music.
//
// It's plain HTML + CSS plus a tiny inline script, so it works before the rest of the page's
// JavaScript has loaded. The script only shows the screen when JS is running (no JS = no
// screen, so nobody can get stuck behind it), shows it once per visit (sessionStorage: a new
// tab or a later visit sees it again), skips the admin, and handles the click: remember it for
// this visit, fade the screen out, tell the music to start (SoundButton listens for "lb-enter").
const SCRIPT = `(function(){var d=document.documentElement;try{var p=location.pathname;if(p.indexOf('/admin')===0||p.indexOf('/app-preview')===0||sessionStorage.getItem('lb-entered')){d.classList.add('intro-seen');return}}catch(e){d.classList.add('intro-seen');return}
d.classList.add('intro-gate');
function enter(){if(d.classList.contains('intro-leaving'))return;try{sessionStorage.setItem('lb-entered','1')}catch(e){}window.__lbEntered=Date.now();d.classList.add('intro-leaving');window.dispatchEvent(new Event('lb-enter'));setTimeout(function(){d.classList.add('intro-seen');d.classList.remove('intro-gate')},650)}
document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('.intro-enter'))enter()},true);
document.addEventListener('keydown',function(e){if(!d.classList.contains('intro-seen')&&(e.key==='Enter'||e.key===' '))enter()},true);})();`;

// The portrait shoot, in the About page's black-and-white style. Two spots on desktop (5 photos
// each, offset so they change at different moments); one faint centred spot on phones (all 10).
// Served through the site's image optimizer at a size that stays sharp on 4K screens.
const img = (n: string, w = 828) => `/_next/image?url=${encodeURIComponent(`/luchi/shoot/${n}.webp`)}&w=${w}&q=75`;
const LEFT = ["red-low-angle", "bw-hand-face", "red-profile", "bw-half", "red-half"];
const RIGHT = ["bw-hand-mouth", "red-stare", "bw-binoculars", "crimson-half", "red-eyes"];
const ALL = LEFT.flatMap((l, i) => [l, RIGHT[i]]);
const WIDE = ["bw-binoculars", "red-eyes", "red-stare"];
const STEP = 4; // seconds each photo holds

function Spot({ names, className, offset = 0 }: { names: string[]; className: string; offset?: number }) {
  return (
    <div className={`intro-spot ${className}`}>
      {names.map((n, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={n} src={img(n, WIDE.includes(n) ? 1920 : 828)} alt="" loading="lazy" decoding="async"
          style={{ animationDuration: `${names.length * STEP}s`, animationDelay: `${i * STEP + offset - 0.6}s` }} />
      ))}
    </div>
  );
}

export default function IntroSplash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="intro-splash" role="dialog" aria-modal="true" aria-label="Welcome to Luchi Beats">
        <div className="intro-photos" aria-hidden="true">
          <Spot names={LEFT} className="is-left" />
          <Spot names={RIGHT} className="is-right" offset={STEP / 2} />
          <Spot names={ALL} className="is-center" />
        </div>
        <div className="intro-glow" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-900.webp" alt="Luchi Beats" className="intro-logo" />
        <span className="intro-line" aria-hidden="true" />
        <button type="button" className="intro-enter" autoFocus>Enter</button>
        <p className="intro-note">Sound on · <span>Maestro</span> <span className="whitespace-nowrap">(Prod. Luchi Beats)</span></p>
      </div>
    </>
  );
}
