// First visit only: an entrance screen. The flaming logo burns in on black and a gold
// "Enter" button appears; clicking it opens the site with the beat ("Maestro") starting.
// Browsers only allow sound after a click or tap, so this click is what lets the music
// begin the moment the visitor walks in.
//
// It's plain HTML + CSS plus a tiny inline script, so it works before the rest of the page's
// JavaScript has loaded. The script only shows the screen when JS is running (no JS = no
// screen, so nobody can get stuck behind it), skips it for return visitors and the admin,
// and handles the click: remember the visit, fade the screen out, tell the music to start
// (SoundButton listens for "lb-enter").
const SCRIPT = `(function(){var d=document.documentElement;try{var p=location.pathname;if(p.indexOf('/admin')===0||p.indexOf('/app-preview')===0||localStorage.getItem('lb-intro')){d.classList.add('intro-seen');return}}catch(e){d.classList.add('intro-seen');return}
d.classList.add('intro-gate');
function enter(){if(d.classList.contains('intro-leaving'))return;try{localStorage.setItem('lb-intro','1')}catch(e){}window.__lbEntered=Date.now();d.classList.add('intro-leaving');window.dispatchEvent(new Event('lb-enter'));setTimeout(function(){d.classList.add('intro-seen');d.classList.remove('intro-gate')},650)}
document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('.intro-enter'))enter()},true);
document.addEventListener('keydown',function(e){if(!d.classList.contains('intro-seen')&&(e.key==='Enter'||e.key===' '))enter()},true);})();`;

export default function IntroSplash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="intro-splash" role="dialog" aria-modal="true" aria-label="Welcome to Luchi Beats">
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
