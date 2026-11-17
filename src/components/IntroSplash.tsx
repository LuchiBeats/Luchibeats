// First visit only: the flaming logo burns in on black for about a second, then the
// site opens. It is plain HTML + CSS (no waiting on scripts), so the page is never
// blocked; a tiny script marks the browser so it doesn't play again.
const SEEN_SCRIPT = `try{var p=location.pathname;if(p.indexOf('/admin')===0||localStorage.getItem('lb-intro')){document.documentElement.classList.add('intro-seen')}else{localStorage.setItem('lb-intro','1')}}catch(e){document.documentElement.classList.add('intro-seen')}`;

export default function IntroSplash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SEEN_SCRIPT }} />
      <div className="intro-splash" aria-hidden="true">
        <div className="intro-glow" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-900.webp" alt="" className="intro-logo" />
        <span className="intro-line" />
      </div>
    </>
  );
}
