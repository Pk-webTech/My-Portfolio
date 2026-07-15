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
  '.tl-item, .project-card, .skill-module, .edu-card, .ach-item, .contact-card, .about-panel, .about-text'
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
