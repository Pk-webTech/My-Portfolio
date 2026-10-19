'use strict';
(function initProjectGallery() {
 const track=document.getElementById('projectTrack'); if(!track)return;
 const cards=[...track.querySelectorAll('.gallery-card')];
 const filters=[...document.querySelectorAll('[data-filter]')];
 const prev=document.getElementById('projectsPrev'),next=document.getElementById('projectsNext');
 const status=document.getElementById('galleryStatus');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=cards,frame=0;
 const smooth=()=>reduced.matches || window.isPortfolioMotionPaused?.()?'auto':'smooth';
 function update() {
  frame=0;
  const box=track.getBoundingClientRect();
  const shown=visible.map((card,i)=>({i,box:card.getBoundingClientRect()})).filter(p=>p.box.right>box.left+8 && p.box.left<box.right-8);
  prev.disabled=track.scrollLeft<=2;
  next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
  status.textContent=shown.length?`Projects ${shown[0].i+1}–${shown.at(-1).i+1} of ${visible.length}`:`${visible.length} projects`;
 }
 function schedule() { if(!frame)frame=requestAnimationFrame(update); }
 function move(direction) {
  const step=visible[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);
  track.scrollBy({left:step*direction,behavior:smooth()});
 }
 filters.forEach(button=>button.addEventListener('click',()=>{
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  cards.forEach(card=>{card.hidden=button.dataset.filter!=='all' && card.dataset.category!==button.dataset.filter;});
  visible=cards.filter(card=>!card.hidden);
  track.scrollTo({left:0,behavior:'instant'});update();
 }));
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 track.addEventListener('keydown',event=>{
  if(event.target!==track)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight') { event.preventDefault();move(event.key==='ArrowLeft'?-1:1); }
  if(event.key==='Home'||event.key==='End') { event.preventDefault();track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:smooth()}); }
 });
 track.addEventListener('scroll',schedule,{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(track); else addEventListener('resize',schedule);
 document.querySelector('.project-toolbar').hidden=false;document.querySelector('.gallery-bottom').hidden=false;update();
})();
(function initCursorDrone() {
 const follower=document.getElementById('cursorDrone'); if(!follower)return;
 const pointer=matchMedia('(hover: hover) and (pointer: fine)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,x=0,y=0,tx=0,ty=0,visible=false,last=0;
 function stop() { cancelAnimationFrame(frame);frame=0;last=0;visible=false;follower.classList.remove('is-visible'); }
 function allowed() { return pointer.matches && !reduced.matches && !document.hidden && !window.isPortfolioMotionPaused?.(); }
 function tick(now) {
  if(!allowed()){stop();return;}
  const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
  const dx=tx-x,dy=ty-y,blend=1-Math.exp(-dt*12);
  x+=dx*blend;y+=dy*blend;
  const angle=Math.max(-15,Math.min(15,dx*.3));
  follower.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg)`;
  if(Math.abs(dx)+Math.abs(dy)<.2) { frame=0;last=0;return; }
  frame=requestAnimationFrame(tick);
 }
 document.addEventListener('pointermove',event=>{
  if(!allowed()||event.pointerType!=='mouse'||event.buttons||event.target.closest('a,button,input,textarea,select,[role="dialog"]')){stop();return;}
  tx=Math.max(0,Math.min(innerWidth-52,event.clientX+22));ty=Math.max(0,Math.min(innerHeight-34,event.clientY+18));
  if(!visible) { x=tx;y=ty;visible=true;follower.classList.add('is-visible'); }
  if(!frame)frame=requestAnimationFrame(tick);
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',stop);
 document.addEventListener('pointerdown',stop,{passive:true});document.addEventListener('keydown',stop);
 addEventListener('blur',stop);addEventListener('scroll',stop,{passive:true});addEventListener('resize',stop);
 document.addEventListener('visibilitychange',stop);addEventListener('portfolio:motion',stop);
 pointer.addEventListener('change',stop);reduced.addEventListener('change',stop);
})();
