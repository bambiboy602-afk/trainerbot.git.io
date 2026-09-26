# Complete Export & Deployment Guide: Making Everything Work

If you ran into an issue where you couldn't get an export to work, this guide covers the exact missing steps for both types of exports:

1. **[Part 1: Exporting the Bot / Persona](#part-1-exporting-your-bot--persona-to-run-anywhere)** (ChatGPT, Claude, Ollama, Python, Node, or 1-Click Standalone Web)
2. **[Part 2: Exporting & Hosting this Application](#part-2-exporting--hosting-this-github-repository)** (Render, Railway, Docker, Cloud Run, Local Machine)

---

## 🔍 Quick Diagnosis: What Was Missing?

| What you tried | Why it didn't work | How to fix it |
| :--- | :--- | :--- |
| **Downloaded `character-card.json` or `.md` and double-clicked it** | Raw JSON or Markdown files are prompt instructions, not executable software. They need an LLM host to run. | Use the new **1-Click HTML Web Bot** or **Python script** in the Export Modal, or paste the Markdown into ChatGPT / Claude. |
| **Tried running Ollama Modelfile** | Ollama requires the base model to be pulled first (`ollama pull llama3.2`). | Run `ollama pull llama3.2` before `ollama create my-clone -f Modelfile`. |
| **Deployed this repo to GitHub Pages** | GitHub Pages only supports static HTML. This app has a Node.js Express server with WebSockets for Gemini streaming. | Deploy to **Render**, **Railway**, **Cloud Run**, or run locally. |
| **Deployed to Render/Cloud Run and health check timed out** | Previously the port was hardcoded to `3000` instead of reading `process.env.PORT`. | **Fixed!** The server now binds dynamically to `process.env.PORT || 3000`. |
| **App crashed or AI chat didn't respond** | Missing `GEMINI_API_KEY` in environment variables outside Google AI Studio. | Add `GEMINI_API_KEY=your_key` to your `.env` file or cloud dashboard. |

---

## Part 1: Exporting Your Bot / Persona to Run Anywhere

Click **"Export to Bot"** in the top navigation bar of the app. You have 6 working formats:

### Option 1: 1-Click Standalone Web Bot (`.html`) ⭐ *Easiest / No Coding*
- Go to the **"🌐 1-Click HTML Web Bot"** tab in the Export Studio.
- Click **"Download HTML File"** to save `my-persona-bot.html`.
- **How to run:** Double-click the `.html` file. It opens instantly in Chrome, Safari, Edge, or Firefox.
- Click the **⚙️ API Key** button in the top right, paste your free Gemini API key, and chat immediately. Zero terminal, zero server setup!

### Option 2: Standalone Python Script (`run_bot.py`)
- Go to the **"🐍 Python & Node.js Code"** tab.
- Click **"Download run_bot.py"**.
- Open your terminal and run:
  ```bash
  pip install google-genai
  python run_bot.py
  ```
- It will prompt for your free Gemini API key (or read `GEMINI_API_KEY` from your environment) and start an interactive conversation loop in your terminal.

### Option 3: Standalone Node.js Script (`run_bot.mjs`)
- Go to the **"🐍 Python & Node.js Code"** tab, switch to **Node.js (.mjs)**.
- Click **"Download run_bot.mjs"**.
- In your terminal:
  ```bash
  npm install @google/genai dotenv
  node run_bot.mjs
  ```

### Option 4: ChatGPT Custom GPT (OpenAI)
1. Navigate to [chatgpt.com/gpts/editor](https://chatgpt.com/gpts/editor).
2. Click the **"Configure"** tab.
3. In the Export Modal, go to **"Universal Prompt"** and click **"Copy Prompt"**.
4. Paste the text into the **"Instructions"** box in ChatGPT.
5. In **"Conversation Starters"**, enter 2-3 sample dilemmas or prompts.
6. Click **Save** (choose "Only Me" or "Anyone with a link").

### Option 5: Anthropic Claude Projects
1. Navigate to [claude.ai/projects](https://claude.ai/projects).
2. Create a new project named after your persona bot.
3. In the Export Modal, go to **"Structured XML"** and click **"Copy XML"**.
4. Paste into the project's **"Set custom instructions"** field.

### Option 6: Local Ollama (100% Free & Offline)
Run your persona entirely on your own hardware without sending data anywhere:
1. Install Ollama from [ollama.com](https://ollama.com).
2. In the Export Modal, go to **"Ollama Modelfile"** and click **"Download Modelfile"**.
3. In your terminal, run:
   ```bash
   ollama pull llama3.2
   ollama create my-clone -f ./Modelfile
   ollama run my-clone
   ```

---

## Part 2: Exporting & Hosting This GitHub Repository

If you want to host this full application on the internet or run it on your own computer:

### Prerequisites:
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com).

### Deployment Option A: Render.com (Recommended Free Hosting)
1. Push your repository to your GitHub account.
2. Sign up at [render.com](https://render.com) and click **"New +" → "Web Service"**.
3. Connect your GitHub repository.
4. Render will automatically detect the included `render.yaml` configuration!
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. In the **Environment Variables** section, add:
   - `GEMINI_API_KEY`: *(Your Gemini API key)*
   - `NODE_ENV`: `production`
6. Click **Deploy**. Your app will be live on a `*.onrender.com` URL with full WebSocket and Live Audio support!

### Deployment Option B: Docker / Container Hosting
A production multi-stage `Dockerfile` and `docker-compose.yml` are included in the repository.

To run with Docker:
```bash
# 1. Clone your repo
git clone https://github.com/your-username/persona-learner-bot.git
cd persona-learner-bot

# 2. Build and start container
export GEMINI_API_KEY="your-api-key"
docker compose up --build
```
Open `http://localhost:3000` in your browser.

### Deployment Option C: Railway.app
1. Go to [railway.app](https://railway.app) and create a **New Project**.
2. Select **"Deploy from GitHub repo"**.
3. Under **Variables**, add:
   - `GEMINI_API_KEY`: *(Your Gemini API key — never commit this directly into GitHub files)*
4. Railway will automatically build via `npm run build` and run `npm start`.

### Deployment Option D: Run Locally on Your PC/Mac
```bash
# 1. Clone the repository
git clone https://github.com/your-username/persona-learner-bot.git
cd persona-learner-bot

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY

# 4. Start development server
npm run dev
```
Open `http://localhost:3000`.

---

## 5-Point Troubleshooting Checklist

1. **"Cannot GET /api/chat or 500 error"**:
   Verify that `GEMINI_API_KEY` is present in your `.env` file (locally) or your cloud host's Environment Variables panel.
2. **"Failed to bind to port"**:
   Ensure you are not forcing port 3000 in your hosting environment; `server.ts` automatically uses `process.env.PORT`.
3. **"Vercel deployment failed"**:
   Standard Vercel serverless does not support continuous WebSockets (`ws` protocol used for bidirectional live audio). Deploy to Render, Railway, or Google Cloud Run instead.
4. **"Ollama says model not found"**:
   Run `ollama pull llama3.2` before running `ollama create`.
5. **"Node dist/server.cjs not found"**:
   Always run `npm run build` before `npm start`.
