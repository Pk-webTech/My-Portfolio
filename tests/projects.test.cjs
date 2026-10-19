const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
test('gallery has exactly the ten requested repositories, once each',()=>{
 const expected=['ATERNET','self-healing-rag','Collab_ai','autonomous-rover-navigation','ML-Based-Phishing-URL-Detection-','Detection-of-Fileless-Malware-through-Differential-Memory-Forensics','SpyAware-Study','ticketflow','expense-splitter','Leave-Management-System'];
 const data=JSON.parse(fs.readFileSync('data/projects.json','utf8'));assert.deepEqual(data.map(p=>p.repo),expected);
 const html=fs.readFileSync('index.html','utf8').split('id="projectTrack"')[1].split('</section>')[0];
 const repos=[...html.matchAll(/href="https:\/\/github.com\/Pk-webTech\/([^\"]+)"/g)].map(m=>m[1]);assert.deepEqual(repos,expected);
 assert.match(data.find(p=>p.repo.startsWith('Detection-')).description,/planned/);
});
function cursor({coarse=false,reduced=false,paused=false}={}) {
 const events={},windowEvents={},frames=new Map(),classes=new Set();let id=0;
 const follower={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},style:{}};
 const context={document:{hidden:false,getElementById:id=>id==='cursorDrone'?follower:null,addEventListener:(k,f)=>events[k]=f,documentElement:{addEventListener:(k,f)=>events[k]=f}},matchMedia:q=>({matches:q.includes('reduced')?reduced:!coarse,addEventListener(){}}),window:{isPortfolioMotionPaused:()=>paused},requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:i=>frames.delete(i),addEventListener:(k,f)=>windowEvents[k]=f,innerWidth:800,innerHeight:600};
 vm.runInNewContext(fs.readFileSync('projects.js','utf8'),context);
 const move=(interactive=false)=>events.pointermove({pointerType:'mouse',buttons:0,clientX:790,clientY:590,target:{closest:()=>interactive}});
 const tick=()=>{const todo=[...frames.values()];frames.clear();todo.forEach(f=>f(16));};
 return {classes,move,tick,events,windowEvents,frames,follower};
}
test('cursor is decorative, stays in viewport, and stops scheduling once settled',()=>{
 const c=cursor();c.move();c.tick();assert.ok(c.classes.has('is-visible'));assert.equal(c.frames.size,0);assert.match(c.follower.style.transform,/748.00px,566.00px/);
 c.move(true);assert.equal(c.classes.has('is-visible'),false);
});
test('cursor respects touch, reduced motion, global pause, and keyboard use',()=>{
 for(const settings of [{coarse:true},{reduced:true},{paused:true}]) {const c=cursor(settings);c.move();assert.equal(c.frames.size,0);assert.equal(c.classes.size,0);}
 const c=cursor();c.move();c.events.keydown();assert.equal(c.frames.size,0);assert.equal(c.classes.size,0);
});
