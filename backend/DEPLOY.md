# Deploying the Pilot Assistant backend

This is a small FastAPI service that receives chat messages from your portfolio's
widget, forwards them to Groq's free LLM API with a locked-down system prompt, and
returns the reply. It never lets the model wander off-topic.

## 1. Get a free Groq API key
1. Go to https://console.groq.com and sign up.
2. Create an API key. Copy it — you'll need it in step 3.

## 2. Push the backend to GitHub
Put the `backend/` folder in its own repo (or a subfolder of your portfolio repo),
containing: `main.py`, `requirements.txt`, `render.yaml` (optional), `.env.example`.

## 3. Deploy on Render
**Option A — using the Blueprint (render.yaml):**
1. Go to https://dashboard.render.com → New → Blueprint.
2. Point it at your repo. Render will read `render.yaml` and set up the service.
3. When prompted, paste your `GROQ_API_KEY`.
4. Update `ALLOWED_ORIGINS` to your actual portfolio URL(s), comma-separated.

**Option B — manual Web Service:**
1. Go to https://dashboard.render.com → New → Web Service → connect your repo.
2. Runtime: Python 3. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Under Environment, add:
   - `GROQ_API_KEY` = your key from step 1
   - `GROQ_MODEL` = `llama-3.3-70b-versatile` (or another current Groq model)
   - `ALLOWED_ORIGINS` = your portfolio's URL, e.g. `https://pk-webtech.github.io`
5. Deploy. Render gives you a URL like `https://pilot-assistant-api.onrender.com`.

## 4. Point the frontend at your backend
In `script.js`, find this line near the top of the `initChatbot` function:

```js
const API_URL = 'https://YOUR-RENDER-SERVICE.onrender.com/chat';
```

Replace it with your actual Render URL + `/chat`.

## 5. Test it
- Visit `https://YOUR-RENDER-SERVICE.onrender.com/health` — should return `{"status":"healthy"}`.
- Open your portfolio, click the pilot assistant FAB, and ask something like
  "what are your skills?" and then something off-topic like "write me a poem about
  the moon" — it should politely decline the second one and redirect back to Piyush.

## Notes
- **Free tier cold starts:** Render's free plan spins the service down after ~15 minutes
  of inactivity, so the first message after idle time can take 10–30 seconds. The widget
  shows a typing indicator during this, and falls back to the offline keyword-bot if the
  request takes longer than 15 seconds or fails outright — so it never looks broken.
- **Rate limiting:** the backend limits each IP to 15 requests/minute in-memory. This
  resets on redeploy/restart; fine for a personal portfolio, not meant for high traffic.
- **CORS:** `ALLOWED_ORIGINS` must exactly match the origin(s) your site is served from
  (protocol + domain, no trailing slash). Add `http://localhost:8000` too if you test
  locally with `python -m http.server`.
- **Cost:** Groq's free tier has generous rate limits for models like
  `llama-3.3-70b-versatile`; check https://console.groq.com/docs/rate-limits for current
  numbers if your portfolio gets heavy traffic.
