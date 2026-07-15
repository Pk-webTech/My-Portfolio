<div align="center">

# ⌖ Piyush Kumar — Portfolio

**Autonomous Systems & Full-Stack Engineer**

A single-page developer portfolio styled as a _Flight Telemetry / FPV HUD_ —
dark cockpit palette, live 3D wireframe drone, compass readouts, and a mission-log timeline.

[![Made with HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
[![Made with CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
[![Made with JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)](#)
[![No Build Step](https://img.shields.io/badge/build-none%20required-2dd4bf?style=flat)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

</div>

---

## Overview

This repo hosts my personal portfolio site, generated from my resume and built to reflect the
part of engineering I care most about: autonomous systems. Instead of a generic template, the
whole UI is framed as a pilot's HUD — a live Three.js drone spins in the hero, stats read out
like telemetry, and experience is laid out as a mission log.

**Live demo:** _add your deployed URL here once hosted (GitHub Pages / Vercel / Netlify)_

## ✨ Features

- **Live 3D hero animation** — a wireframe quad-copter (Three.js) with spinning rotors, an
  orbiting particle field, and mouse-reactive camera movement. No external model files needed.
- **HUD-styled telemetry strip** — CGPA, competition wins, and shipped projects presented as
  cockpit readouts.
- **Mission-log timeline** — work experience laid out chronologically with active/past markers.
- **Framed photo panel** — About section with a HUD-cornered photo frame (right side).
- **Two-column contact panel** — a working `mailto:`-based contact form alongside direct
  channels and an availability status indicator.
- **FPV background video support** — drop in your own flight footage for the hero background.
- **Fully responsive** — collapses cleanly down to mobile, respects `prefers-reduced-motion`.
- **Zero build step** — plain HTML/CSS/JS. No `npm install`, no bundler, no framework.

## 🖥️ Tech Stack

| Layer         | Choice                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| Structure     | Semantic HTML5                                                                      |
| Styling       | Hand-written CSS3 (custom properties, grid/flexbox, no framework)                   |
| Interactivity | Vanilla JavaScript (ES6)                                                            |
| 3D graphics   | [Three.js](https://threejs.org/) r128, via CDN                                      |
| Fonts         | Space Grotesk (display), Inter (body), JetBrains Mono (data/HUD) — via Google Fonts |

````

## 🚀 Getting Started

No build tooling required — clone and open.

```bash
git clone https://github.com/Pk-webTech/<your-repo-name>.git
cd <your-repo-name>
````

**Option 1 — instant, no server:**
Just double-click `index.html`. (Fonts and the 3D scene load a bit more reliably over a local
server, but this works.)

**Option 2 — local server (recommended):**

```bash
# Python (built in on most systems)
python -m http.server 8000

# or Node.js
npx serve .
```

Then open **http://localhost:8000**.

**Option 3 — VS Code:**
Install the _Live Server_ extension → right-click `index.html` → **Open with Live Server**.

## 🖼️ Adding Your Own Media

The site works out of the box (the hero drone is code-generated, no assets required), but it
looks a lot more "you" once you drop in real media:

| File                  | Location             | Purpose                               | Recommended size          |
| --------------------- | -------------------- | ------------------------------------- | ------------------------- |
| `profile.jpg`         | `assets/images/`     | About section photo                   | 800×1000px (4:5 portrait) |
| `favicon.png`         | `assets/images/`     | Browser tab icon                      | 512×512px                 |
| `og-cover.jpg`        | `assets/images/`     | Social share preview + video poster   | 1200×630px                |
| flight footage `.mp4` | `assets/animations/` | Hero background video (muted, looped) | short, ≤10s, landscape    |

All paths are already wired up in `index.html` / `styles.css` — just add files with the exact
names above and they take effect immediately, no code changes needed. Until `profile.jpg` is
added, a placeholder HUD frame is shown automatically.

## 🎨 Customization

- **Links:** update the GitHub/LinkedIn URLs in the Projects and Contact sections.
- **Contact info:** update the email/phone in `index.html`'s Contact section.
- **Color system:** all colors are CSS custom properties at the top of `styles.css` — change
  `--teal` / `--amber` / `--bg` to re-theme the whole site in one place.
- **Content:** every section (About, Experience, Projects, Skills, Education) is plain HTML in
  `index.html` — no data files or templating, just edit the markup directly.

## 📱 Browser Support

Tested on current Chrome, Firefox, Edge, and Safari. Vendor-prefixed properties
(`-webkit-backdrop-filter`, `-webkit-mask-image`) are included for broader compatibility.
The 3D scene requires WebGL; on unsupported browsers the hero gracefully falls back to the
static HUD readout panel.

## 📄 License

MIT — free to fork, adapt, and reuse as a base for your own portfolio.

---

<div align="center">

Built by **Piyush Kumar** · [GitHub](https://github.com/Pk-webTech) · piyushkumar.dev01@gmail.com

</div>
