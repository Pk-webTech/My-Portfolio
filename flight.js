'use strict';
// No rendering library or external assets. Stop frame work offscreen and in hidden tabs.
(function initFlightLab() {
  const stage = document.querySelector('.flight-stage');
  if (!stage) return;
  const drone = document.getElementById('flyingDrone');
  const bank = document.getElementById('droneBank');
  const path = document.getElementById('flightPath');
  const status = document.getElementById('flightStatus');
  const pause = document.getElementById('flightPause');
  const buttons = [...stage.querySelectorAll('[data-flight]')];
  const compact = matchMedia('(max-width: 640px)');
  function resizeScene() { stage.querySelector('.flight-world').setAttribute('viewBox',compact.matches?'80 0 880 370':'0 0 1100 370'); }
  compact.addEventListener('change',resizeScene); resizeScene();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'orbit', paused = window.isPortfolioMotionPaused ? window.isPortfolioMotionPaused() : reduced.matches, visible = false, frame = 0, previous = null, phase = 0;
  let position = {x:705,y:113}, angle = 0;
  const paths = {
    orbit:'M535 165 C535 80 875 80 875 165 C875 250 535 250 535 165',
    eight:'M535 165 C535 45 875 285 875 165 C875 45 535 285 535 165',
    land:'M705 113V279'
  };
  const labels = {orbit:'Orbit',eight:'Figure eight',land:'Landing'};
  function sync() {
    document.body.classList.toggle('motion-paused', paused || document.hidden);
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Resume motion' : 'Pause motion';
    status.textContent = reduced.matches ? labels[mode] + ' · reduced motion' : labels[mode] + (paused ? ' · paused' : ' selected');
    stop();
    if (!paused && !reduced.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; previous = null; }
  function draw() { drone.setAttribute('transform', `translate(${position.x.toFixed(2)} ${position.y.toFixed(2)})`); bank.setAttribute('transform', `rotate(${angle.toFixed(2)})`); }
  function tick(now) {
    const dt = previous === null ? 0 : Math.min((now-previous)/1000,.05); previous = now; phase += dt*.65;
    const target = mode === 'land' ? {x:705,y:279} : mode === 'eight' ? {x:705+170*Math.sin(phase),y:165+60*Math.sin(phase*2)} : {x:705+170*Math.cos(phase),y:165+64*Math.sin(phase)};
    const blend = 1-Math.exp(-dt*3);
    const dx = target.x-position.x;
    position.x += dx*blend; position.y += (target.y-position.y)*blend;
    angle += ((mode === 'land' ? 0 : Math.max(-12,Math.min(12,dx*.35)))-angle)*blend;
    draw();
    if (mode === 'land' && Math.abs(position.y-279)<.3 && Math.abs(position.x-705)<.3) { status.textContent='Landed · ready for takeoff'; stage.dataset.landed='true'; stop(); return; }
    frame=requestAnimationFrame(tick);
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    mode=button.dataset.flight; stage.dataset.landed='false'; stage.dataset.flightMode=mode; path.setAttribute('d',paths[mode]);
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    if (reduced.matches || paused) { position={x:705,y:mode==='land'?279:113}; angle=0; stage.dataset.landed=String(mode==='land'); draw(); }
    sync();
  }));
  window.addEventListener('portfolio:motion', event => { paused=event.detail.paused; sync(); });
  pause.addEventListener('click', () => { if(window.setPortfolioMotionPaused) window.setPortfolioMotionPaused(!paused); else { paused=!paused; sync(); } });
  reduced.addEventListener('change', () => { paused=window.isPortfolioMotionPaused ? window.isPortfolioMotionPaused() : reduced.matches; sync(); });
  document.addEventListener('visibilitychange',sync);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(stage);
  else visible=true;
  stage.querySelector('.flight-controls').hidden=false;
  // OS reduced-motion preferences take priority over the play control.
  function motionPreference() { pause.disabled=reduced.matches; pause.title=reduced.matches?'Motion is disabled by your device preference':''; }
  reduced.addEventListener('change',motionPreference); motionPreference(); sync();
})();
