# Deploying the portfolio assistant

Deploy `backend/` as a Python web service. Install with `pip install -r requirements.txt` and start with `uvicorn main:app --host 0.0.0.0 --port $PORT`. If deploying from the repository root, configure the service root directory as `backend`.

Set these server environment variables:
- `GROQ_API_KEY`: your provider key; never put this in the frontend.
- `GROQ_MODEL`: an available model for your Groq account (the code supplies a default).
- `ALLOWED_ORIGINS`: comma-separated frontend origins, without trailing slashes.

Set `window.PORTFOLIO_CHAT_ENDPOINT` in the root `chat-config.js` to the deployed HTTPS service URL plus `/chat`. An empty endpoint intentionally uses the local portfolio guide without making network requests.

Verify `/health`, then ask about ATERNET and education through the widget. Check that the status shows an AI connection. Stop the backend to verify that the widget shows local-answer fallback. A health response alone does not verify provider credentials.

The system prompt guides the model toward portfolio topics but cannot guarantee perfect scope enforcement. Rate limiting is per-process and resets on restart. Configure explicit production origins. The frontend times out after 15 seconds and displays a local fallback if the service is cold or unavailable.
