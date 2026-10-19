const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const projects=JSON.parse(fs.readFileSync(path.join(root,'data/projects.json'),'utf8'));
const groups={ai:'AI & Machine Learning',autonomy:'Autonomous Systems',security:'Cybersecurity',fullstack:'Full-Stack Development'};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const cards=projects.map((p,i)=>`<article class="project-card gallery-card" data-category="${p.category}" aria-labelledby="project-${i}">
 <div class="project-art gallery-art ${p.category}-art" aria-hidden="true"><span>${escape(p.status)}</span><div class="gallery-diagram">${p.flow.map((step,j)=>`${j?'<span class="flow-arrow">→</span>':''}<b>${escape(step)}</b>`).join('')}</div><div>${escape(groups[p.category])}</div></div>
 <div class="project-card-head"><span>${escape(groups[p.category])}</span><span>${String(i+1).padStart(2,'0')}</span></div>
 <h3 id="project-${i}">${escape(p.title)}</h3><p class="project-subtitle">${escape(p.subtitle)}</p><p>${escape(p.description)}</p>
 <div class="tags">${p.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div>
 <a class="project-link" href="https://github.com/Pk-webTech/${p.repo}" target="_blank" rel="noopener" aria-label="Explore ${escape(p.title)} repository on GitHub (opens in a new tab)">Explore repository ↗</a>
</article>`).join('\n');
const section=`<!-- PROJECTS -->
<section id="projects" class="projects" aria-labelledby="projectsTitle">
 <div class="section-head"><span class="eyebrow">01 / SELECTED WORK</span><h2 id="projectsTitle">A few things I’ve built.</h2><p>From intelligent predictions to software people can use.</p></div>
 <div class="project-toolbar" hidden><div class="project-filters" role="group" aria-label="Filter projects by category"><button type="button" data-filter="all" aria-pressed="true" aria-controls="projectTrack">All projects <span>10</span></button>${Object.entries(groups).map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="false" aria-controls="projectTrack">${label} <span>${projects.filter(p=>p.category===id).length}</span></button>`).join('')}</div></div>
 <p id="galleryHelp" class="gallery-help">Scroll sideways or swipe to explore. Use the arrow keys when the gallery is focused.</p>
 <div class="project-track" id="projectTrack" tabindex="0" role="region" aria-label="Project gallery" aria-describedby="galleryHelp">${cards}</div>
 <div class="gallery-bottom" hidden><span id="galleryStatus" role="status" aria-live="polite" aria-atomic="true">Projects 1–3 of 10</span><div class="gallery-navigation"><button id="projectsPrev" type="button" aria-label="Previous projects" aria-controls="projectTrack">←</button><button id="projectsNext" type="button" aria-label="Next projects" aria-controls="projectTrack">→</button></div></div>
</section>`;
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');html=html.replace(/<!-- PROJECTS -->[\s\S]*?<section id="about"/,section+'\n\n<section id="about"');fs.writeFileSync(file,html);
// Keep both assistant modes aligned with the same curated project inventory.
const vm=require('node:vm');const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'chat-knowledge.js'),'utf8'),context);
const kb=context.window.PORTFOLIO_KB.filter(e=>e.id!=='aternet'&&!e.id.startsWith('repo-'));
kb.find(e=>e.id==='projects').answer='The portfolio features 10 projects: '+projects.map(p=>p.title).join(', ')+'. Browse AI & Machine Learning, Autonomous Systems, Cybersecurity, and Full-Stack Development in the Projects gallery.';
projects.forEach(p=>kb.unshift({id:'repo-'+p.repo,keywords:[p.repo.toLowerCase().replace(/[-_]/g,' '),p.title.toLowerCase(),...(p.repo==='ATERNET'?['solar','forecast','energy','weather']:[])],answer:p.title+': '+p.description+' Repository: https://github.com/Pk-webTech/'+p.repo}));
fs.writeFileSync(path.join(root,'chat-knowledge.js'),'window.PORTFOLIO_KB = '+JSON.stringify(kb,null,2)+';\n');
const backend=path.join(root,'backend/main.py');let prompt=fs.readFileSync(backend,'utf8');prompt=prompt.replace(/- Projects:[\s\S]*?- Skills:/,'- Projects:\n'+projects.map(p=>'  * '+p.title+' ('+groups[p.category]+'): '+p.description+'\n    GitHub: https://github.com/Pk-webTech/'+p.repo).join('\n')+'\n- Skills:');fs.writeFileSync(backend,prompt);
console.log('Generated '+projects.length+' project cards and synchronized assistant facts.');
