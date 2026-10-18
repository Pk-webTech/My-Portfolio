'use strict';
// Progressive enhancement: all content remains visible if this file cannot run.
(function initPortfolioMotion() {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const toggle=document.getElementById('motionToggle');
  const progress=document.querySelector('.reading-progress');
  let userPaused=false, progressFrame=0;
  let revealObserver, artObserver;
  const targets=[...document.querySelectorAll('.hero-content,.hero-visual,.section-head,.project-card,.about-text,.about-panel,.tl-item,.skill-module,.flight-heading,.flight-stage,.edu-card,.achievements,.community,.contact-panel')];
  const cards=[...document.querySelectorAll('.project-card')];
  function paused() { return userPaused || reduced.matches; }
  function revealAll() { targets.forEach(el=>el.classList.add('is-revealed')); }
  function sync() {
    const off=paused();
    document.body.classList.toggle('motion-paused',off || document.hidden);
    toggle.disabled=reduced.matches;
    toggle.setAttribute('aria-pressed',String(off));
    toggle.textContent=reduced.matches?'Reduced motion enabled':off?'▷ Resume animations':'Ⅱ Pause animations';
    if(off) { revealAll(); cards.forEach(card=>card.classList.remove('is-tilting')); }
    window.dispatchEvent(new CustomEvent('portfolio:motion',{detail:{paused:off}}));
  }
  window.setPortfolioMotionPaused=value=>{userPaused=Boolean(value);sync();};
  window.isPortfolioMotionPaused=paused;
  toggle.addEventListener('click',()=>window.setPortfolioMotionPaused(!userPaused));
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  // Only stage unseen content; do not shift something the reader is already viewing.
  if('IntersectionObserver' in window && !reduced.matches) {
    targets.forEach(el=>{
      const rect=el.getBoundingClientRect();
      el.dataset.reveal='';
      if(rect.top<innerHeight && rect.bottom>0) el.classList.add('is-revealed');
    });
    document.body.classList.add('motion-ready');
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting) { entry.target.classList.add('is-revealed'); revealObserver.unobserve(entry.target); }
    }),{threshold:.06});
    targets.forEach(el=>revealObserver.observe(el));
    artObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting) { entry.target.classList.add('art-play'); artObserver.unobserve(entry.target); }
    }),{threshold:.25});
    cards.forEach(card=>artObserver.observe(card));
  }
  cards.forEach(card=>{
    let frame=0, point;
    function reset() { cancelAnimationFrame(frame);frame=0;card.classList.remove('is-tilting'); }
    card.addEventListener('pointermove',event=>{
      if(paused() || !finePointer.matches || event.pointerType==='touch') return;
      point={x:event.clientX,y:event.clientY};
      if(frame) return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        if(paused()) return;
        const box=card.getBoundingClientRect();
        const x=Math.max(0,Math.min(1,(point.x-box.left)/box.width));
        const y=Math.max(0,Math.min(1,(point.y-box.top)/box.height));
        card.style.setProperty('--tilt-x',((.5-y)*2.4).toFixed(2)+'deg');
        card.style.setProperty('--tilt-y',((x-.5)*2.4).toFixed(2)+'deg');
        card.style.setProperty('--pointer-x',x*100+'%');card.style.setProperty('--pointer-y',y*100+'%');
        card.classList.add('is-tilting');
      });
    });
    card.addEventListener('pointerleave',reset);
    finePointer.addEventListener('change',reset);
  });
  function paintProgress() {
    progressFrame=0;
    const distance=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${distance>0?Math.max(0,Math.min(1,scrollY/distance)):0})`;
  }
  function scheduleProgress() { if(!progressFrame)progressFrame=requestAnimationFrame(paintProgress); }
  addEventListener('scroll',scheduleProgress,{passive:true});addEventListener('resize',scheduleProgress);
  sync();scheduleProgress();
})();
