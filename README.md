# Piyush Kumar — Portfolio

Responsive HTML, CSS, and vanilla JavaScript portfolio with an optional FastAPI/Groq assistant. No frontend build step.

## Preview

Run `python -m http.server 5173` from the repository and open http://localhost:5173.
The contact form opens the visitor's email application; it does not send mail itself.

## Assistant setup

Without configuration, the widget immediately answers from `chat-knowledge.js` and clearly labels itself a local portfolio guide. This keyword guide is not a language model and does not interpret conversational follow-ups.

To enable AI:

1. Install `backend/requirements.txt` in a Python environment.
2. Set `GROQ_API_KEY` on the backend only. `backend/env.example` lists configuration variables. Never place a key in frontend code.
3. From `backend`, run `uvicorn main:app --host 127.0.0.1 --port 8000`.
4. Set `window.PORTFOLIO_CHAT_ENDPOINT` in `chat-config.js` to `http://localhost:8000/chat` for local development, or your deployed HTTPS backend's `/chat` URL for production.
5. Set backend `ALLOWED_ORIGINS` to your frontend origin, such as `http://localhost:5173`. Use your actual HTTPS frontend origin when deployed.

The widget keeps a bounded conversation in memory, sends one request at a time, and falls back to local answers on network errors, invalid replies, or a 15-second timeout. Its status indicates when fallback is active. Messages render as text, never HTML. The backend restricts history roles and payload sizes and keeps provider errors private. Scope is guided by a system prompt, not a guaranteed security boundary.

## Content

- `index.html`: biography, experience, projects, skills, education, and contact details.
- `styles.css`: responsive twilight blue design and reduced-motion support.
- `chat-knowledge.js`: local assistant facts.
- `backend/main.py`: AI assistant facts and API handling. Keep these facts aligned with the page when editing.
- `assets/images/myimage.jpeg`: hero portrait.

Placeholder certificates were removed until genuine credentials and verification links are supplied. Existing project links and contact details are retained.

## Checks

Run `node --check script.js` and `node --test tests/chat.test.cjs`.

## Custom drone animation

`flight.js` animates the inline SVG Flight Lab: an illustrated FPV pilot avatar, orbit and figure-eight paths, a landing sequence, and pause/resume controls. The demo sits in a contained panel alongside its introduction, after the skills section. No animation packages or extra network dependencies are needed. Motion follows the device reduced-motion preference; the flight loop stops when the scene is offscreen or the page is hidden. Include `flight.js` when deploying alongside the existing HTML/CSS/JS files.

## Motion system

`motion.js` adds progressive section reveals, one-time project-diagram animations, subtle pointer tilt on desktop, and a reading-progress indicator. The hero Pause animations control and the drone pause control share the same state. Device reduced-motion preferences override animation. Include `motion.js` before `flight.js` when deploying; no packages or build step are required.

## Curated project gallery

`data/projects.json` is the source for the ten selected repositories. Run `node scripts/update-projects.cjs` after editing it to regenerate the static project cards and synchronize local/backend assistant descriptions. Descriptions were checked against repository READMEs (and expense-splitter source) on 19 October 2026. Fileless malware research is explicitly labeled in progress.

`projects.js` adds category filters, next/previous controls, keyboard navigation, native touch/trackpad scrolling, and a desktop-only cursor drone. The normal cursor remains usable. The drone hides over controls and respects the shared pause setting and reduced-motion preference. Without JavaScript, the full project list still scrolls horizontally. Deploy `projects.js` with the other frontend files.
