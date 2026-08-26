// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navLinks.style.display = navLinks.classList.contains('open') ? 'flex' : 'none';
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    if (window.innerWidth <= 860) navLinks.style.display = 'none';
  });
});

// 3D drone / wireframe globe animation (hero)
(function initDrone3D() {
  const canvas = document.getElementById('drone3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const container = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.1, 5.4);

  function resize() {
    const size = container.clientWidth;
    renderer.setSize(size, size, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const teal = 0x2dd4bf, amber = 0xf5a623, line = 0x2a3a4a;

  // Group holding the drone
  const drone = new THREE.Group();
  scene.add(drone);

  // Central body
  const bodyGeo = new THREE.OctahedronGeometry(0.55, 0);
  const bodyMat = new THREE.MeshBasicMaterial({ color: teal, wireframe: true, transparent: true, opacity: 0.9 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  drone.add(body);

  const bodyCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.18, 0),
    new THREE.MeshBasicMaterial({ color: amber, wireframe: true })
  );
  drone.add(bodyCore);

  // Four arms + rotor rings
  const armPositions = [
    [1.3, 0.15, 1.3], [-1.3, 0.15, 1.3], [1.3, 0.15, -1.3], [-1.3, 0.15, -1.3]
  ];
  const rotors = [];
  armPositions.forEach(([x, y, z]) => {
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, Math.sqrt(x * x + z * z), 6);
    const armMat = new THREE.MeshBasicMaterial({ color: line });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(x / 2, y / 2, z / 2);
    arm.lookAt(new THREE.Vector3(x, y, z));
    arm.rotateX(Math.PI / 2);
    drone.add(arm);

    const ringGeo = new THREE.TorusGeometry(0.42, 0.012, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: teal, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y, z);
    ring.rotation.x = Math.PI / 2;
    drone.add(ring);
    rotors.push(ring);
  });

  // Orbiting particles (telemetry field)
  const particleCount = 90;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 2.1 + Math.random() * 0.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: teal, size: 0.035, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Outer wireframe sphere (radar boundary)
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 16, 12),
    new THREE.MeshBasicMaterial({ color: line, wireframe: true, transparent: true, opacity: 0.25 })
  );
  scene.add(sphere);

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (reduceMotion) { renderer.render(scene, camera); return; }
    t += 0.008;
    drone.rotation.y += 0.004;
    drone.position.y = Math.sin(t) * 0.12;
    rotors.forEach((r, i) => { r.rotation.z += 0.15 + i * 0.02; });
    particles.rotation.y -= 0.0009;
    sphere.rotation.y += 0.0015;
    camera.position.x += (mouseX * 0.6 - camera.position.x + 0) * 0.03;
    camera.position.y += (1.1 - mouseY * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();
})();

// Certificate cards — 3D tilt on hover, tap-to-flip on touch
(function initCertCards() {
  const cards = document.querySelectorAll('.cert-card');
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  cards.forEach(card => {
    const inner = card.querySelector('.cert-card-inner');

    if (isTouch) {
      // Touch devices: tap toggles the flip
      card.addEventListener('click', () => {
        cards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
        card.classList.toggle('flipped');
      });
      return;
    }

    if (reduceMotion) return;

    // Desktop: subtle 3D tilt that layers on top of the hover flip
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = (py * -10).toFixed(2);
      const tiltY = (px * 10).toFixed(2);
      const flipped = card.matches(':hover') ? 180 : 0;
      inner.style.transform = `rotateY(${flipped + parseFloat(tiltY)}deg) rotateX(${tiltX}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });
})();

// Contact form -> mailto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value;
    const email = document.getElementById('cf-email').value;
    const subject = document.getElementById('cf-subject').value || 'Portfolio contact';
    const message = document.getElementById('cf-message').value;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:piyushkumar.dev01@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

// Scroll reveal
const revealTargets = document.querySelectorAll(
  '.tl-item, .project-card, .skill-module, .edu-card, .ach-item, .contact-card, .about-panel, .about-text, .cert-card'
);
revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealTargets.forEach(el => observer.observe(el));

// Active nav link highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? '#2dd4bf' : '';
  });
});
// =========================================================
// CURSOR DRONE — follows the pointer once you scroll past the hero
// =========================================================
(function initCursorDrone() {
  const drone = document.getElementById('cursorDrone');
  if (!drone) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (reduceMotion || isTouch) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let curX = targetX, curY = targetY;
  let lastX = curX, lastY = curY;
  let visible = false;
  let hasPointer = false;

  function updateVisibility() {
    const shouldShow = hasPointer && window.scrollY > window.innerHeight * 0.6;
    if (shouldShow !== visible) {
      visible = shouldShow;
      drone.classList.toggle('active', visible);
    }
  }
  window.addEventListener('scroll', updateVisibility, { passive: true });

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    hasPointer = true;
    updateVisibility();
  });

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    curX += (targetX - curX) * 0.09;
    curY += (targetY - curY) * 0.09;
    const dx = curX - lastX;
    const dy = curY - lastY;
    const tilt = Math.max(-18, Math.min(18, dx * 0.8));
    const lift = Math.max(-10, Math.min(10, dy * 0.4));
    lastX = curX;
    lastY = curY;
    drone.style.transform = `translate(${curX - 23}px, ${curY - 23 + lift}px) rotate(${tilt.toFixed(2)}deg)`;
  }
  tick();
})();

// =========================================================
// PILOT ASSISTANT — a scoped chatbot that only answers
// questions about Piyush's background, skills, projects,
// experience, education, and contact info.
//
// Primary path: calls a small FastAPI backend (Render) that
// proxies to Groq's free LLM API with a locked-down system
// prompt (see /backend/main.py).
//
// Fallback path: if the API is unreachable (offline, cold
// start timeout, CORS misconfig, etc.), falls back to a local
// keyword-matched knowledge base so the widget never goes silent.
// =========================================================
(function initChatbot() {
  const fab = document.getElementById('chatbotFab');
  const win = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const messages = document.getElementById('chatbotMessages');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const quick = document.getElementById('chatbotQuick');
  if (!fab || !win || !form) return;

  // ---- CONFIGURE THIS: your deployed Render backend URL ----
  const API_URL = 'http://localhost:8000/chat';

  // Running conversation history sent to the API for context (session only)
  let convoHistory = [];

  // --- Offline fallback knowledge base: used only if the API call fails ---
  const KB = [
    {
      id: 'greeting',
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'yo'],
      answer: "Hey! I'm Piyush's pilot assistant — ask me about his skills, projects, experience, education, or how to reach him."
    },
    {
      id: 'who',
      keywords: ['who are you', 'who is piyush', 'about piyush', 'tell me about him', 'introduce', 'bio'],
      answer: "Piyush Kumar is a 4th-year B.Tech CSE (Information Security) student at VIT Vellore. He's Autonomous Head at Team Rotor FPV, builds AI-driven navigation and perception systems for drones, and also ships full-stack web platforms with Django and React."
    },
    {
      id: 'location',
      keywords: ['where', 'location', 'based', 'live', 'city', 'country'],
      answer: "Piyush is based in Vellore, Tamil Nadu, India — and he's open to remote-friendly roles too."
    },
    {
      id: 'education',
      keywords: ['education', 'college', 'university', 'degree', 'cgpa', 'study', 'vit', 'school'],
      answer: "He's pursuing a B.Tech in Computer Science & Engineering (Information Security) at VIT Vellore, 2023–2027, with a CGPA of 8.73/10."
    },
    {
      id: 'skills',
      keywords: ['skill', 'tech stack', 'technologies', 'languages', 'stack', 'tools', 'know'],
      answer: "His toolkit spans Python, Java, JavaScript and SQL; web dev with React, Django & DRF; PostgreSQL; AWS, Docker, Kubernetes and Git; plus AI/ML, computer vision, sensor fusion and ROS on the robotics side, and threat/malware detection on the security side."
    },
    {
      id: 'experience',
      keywords: ['experience', 'work history', 'internship', 'job', 'tata', 'career', 'worked'],
      answer: "He interned as a Project Intern at Tata Technologies (May–Jul 2026), has been Autonomous Head at Team Rotor FPV since May 2024 leading AI navigation module development, and completed a Virtual Internship at Indian Space Lab (Jun–Jul 2024) in remote sensing and satellite tech."
    },
    {
      id: 'projects',
      keywords: ['project', 'built', 'made', 'portfolio piece', 'github repo', 'work on'],
      answer: "Three flagship builds: a full-stack Leave Booking & Approval System (Django/DRF/PostgreSQL) with multi-level approval chains; a Local RAG System with a Java vector store implementing HNSW, KD-Tree and brute-force search; and a Crop Disease Detection app using OpenCV and a Streamlit interface. Check the Projects section for GitHub links."
    },
    {
      id: 'drone-team',
      keywords: ['team rotor', 'drone', 'fpv', 'autonomous head', 'lidar', 'navigation'],
      answer: "As Autonomous Head of Team Rotor FPV, Piyush designs AI-driven navigation modules, fuses LiDAR and depth-camera data, deploys edge AI on Raspberry Pi, and leads a technical team through autonomous mission development."
    },
    {
      id: 'achievements',
      keywords: ['award', 'achievement', 'win', 'competition', 'trophy', 'recognition'],
      answer: "Highlights include winning the International Space Drone Competition (2025 & 2026) and the IIT Roorkee Sky Maneuver Competition (2026), a 7th-place finish at ADDC 2024–25, and finalist status at the MathWorks Minidrone Competition."
    },
    {
      id: 'contact',
      keywords: ['contact', 'email', 'reach', 'hire', 'phone', 'linkedin', 'connect', 'available', 'availability'],
      answer: "You can reach Piyush at piyushkumar.dev01@gmail.com, or via the contact form on this page. He's open to software engineering, AI/ML and autonomous systems roles — links to GitHub and LinkedIn are in the Contact section."
    },
    {
      id: 'teaching',
      keywords: ['workshop', 'mentor', 'teach', 'community', 'student'],
      answer: "Piyush runs drone workshops for students from grade 6 through university, and has trained 200+ students — he believes good engineers should also be good teachers."
    },
    {
      id: 'thanks',
      keywords: ['thanks', 'thank you', 'cool', 'nice', 'great'],
      answer: "Anytime! Anything else you'd like to know about Piyush's work?"
    }
  ];

  const FALLBACK = "I'm scoped to Piyush's portfolio only — I can talk about his background, skills, projects, experience, education or how to contact him. Try one of the quick topics below!";

  function findAnswer(raw) {
    const text = raw.toLowerCase();
    let best = null, bestScore = 0;
    KB.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(k => { if (text.includes(k)) score += k.split(' ').length; });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return best ? best.answer : FALLBACK;
  }

  function addMessage(text, who) {
    const el = document.createElement('div');
    el.className = 'chatbot-msg ' + who;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  // Calls the live backend. Throws on any failure so the caller can fall back.
  async function askLiveAssistant(text) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: convoHistory }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error('API responded with ' + res.status);
      const data = await res.json();
      if (!data.reply) throw new Error('Empty reply from API');
      return data.reply;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function respondTo(text) {
    addMessage(text, 'user');
    const typing = showTyping();

    let reply;
    try {
      reply = await askLiveAssistant(text);
      // Keep a short rolling history so follow-up questions have context
      convoHistory.push({ role: 'user', content: text });
      convoHistory.push({ role: 'assistant', content: reply });
      if (convoHistory.length > 12) convoHistory = convoHistory.slice(-12);
    } catch (err) {
      // Live API unavailable — degrade gracefully to the offline KB
      reply = findAnswer(text);
    }

    typing.remove();
    addMessage(reply, 'bot');
  }

  function openChat() {
    win.classList.add('open');
    win.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    if (!messages.dataset.greeted) {
      messages.dataset.greeted = '1';
      addMessage("Systems online. Ask me anything about Piyush — his skills, projects, experience, or how to get in touch.", 'bot');
    }
    input.focus();
  }
  function closeChat() {
    win.classList.remove('open');
    win.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', () => {
    win.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    respondTo(val);
    input.value = '';
  });

  quick.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-q]');
    if (!btn) return;
    respondTo(btn.dataset.q);
  });

  document.addEventListener('click', (e) => {
    if (win.classList.contains('open') && !win.contains(e.target) && !fab.contains(e.target)) {
      closeChat();
    }
  });
})();