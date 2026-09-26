# Persona Learner & Scenario Bot

An adaptive conversational partner and roleplay scenario simulator powered by Google Gemini. The system observes your communication style, emotional attunement, reasoning heuristics, and conflict-resolution strategies to synthesize a real-time cognitive persona profile and generate exportable bot configurations.

---

## ✨ Key Features

### 🎭 High-Stakes Scenario Simulator
Practice challenging interpersonal conversations in realistic, safe simulations:
- **Domestic Violence & Safety:** Grey Rock de-escalation, safe exit planning, and non-confrontational boundary setting.
- **Healthcare & Clinical:** SPIKES protocol disclosure of critical medical findings to distressed family members.
- **Workplace & Leadership:** Performance Improvement Plan (PIP) alignment, constructive criticism, and compensation negotiations.
- **Neurodiversity & Accessibility:** Workplace accommodation advocacy with resistant leadership.
- **Family Dynamics:** Financial and behavioral boundaries with manipulative relatives.

### 🌲 Choose Your Own Adventure (CYOA) Decision Branching
- **Crossroads in Transcripts & Chat:** Experience interactive decision nodes where different phrasing choices lead to divergent narrative outcomes.
- **One-Click Branch Simulation:** Fork any dialogue turn to simulate an alternative branch attempt with contextual AI system prompting.
- **AI Crossroads Extraction:** Automatically extract and synthesize decision pathways from existing session transcripts using Gemini.
- **Divergent Reaction Modeling:** AI counterparts adapt their dialogue tone, emotional posture, and conflict trajectory based on the chosen path (e.g., Assertive vs. De-escalating vs. Conciliatory).

### 🧠 Dynamic Cognitive Profiling
- Real-time dimensional radar analysis: *Tone Spectrum*, *Empathy & Warmth*, *Directness*, *Formality*, *Analytical Depth*, and *Conflict De-escalation*.
- Automatic behavioral synthesis: identifies your go-to conflict heuristics, signature phrases, and communication blind spots.

### 🎓 Real-Time Communication Mentor Mode
- Enable **Mentor Mode** to receive constructive coaching alongside the AI's in-character response.
- Highlights emotional attunement, psychological safety, and recommends high-leverage alternative phrasing.

### 🛡️ Instant Emergency Exit Protocol
- Designed for high-stakes simulations (e.g., domestic violence, crisis communication).
- Immediately halts audio recording, wipes the active screen, provides 24/7 crisis hotline resources (988 Lifeline, National DV Hotline, Crisis Text Line), and securely preserves a snapshot for reflective review.

### 🎙️ Multimodal Voice & Audio Transcription
- **Live Voice Session:** Real-time conversational audio with microphone streaming powered by `gemini-3.8-live` and WebSockets.
- **Voice-to-Text Input:** Audio dictation transcribed using `gemini-3.5-transcribe`.

### 🤖 Bot Export Studio & Turnkey Deployments
- Export your personalized AI clone as:
  - **1-Click Standalone Web Bot (`.html`):** Single-file zero-install web app with embedded chat UI. Double click to run in any browser with your free Gemini key.
  - **Executable Python CLI (`run_bot.py`):** Standalone terminal chat script (`pip install google-genai`).
  - **Executable Node.js Script (`run_bot.mjs`):** Turnkey Node script using `@google/genai`.
  - **ChatGPT Custom GPT Instructions:** Ready-to-copy persona prompts and conversation starters.
  - **Anthropic Claude Projects:** Structured XML system prompts preventing persona drift.
  - **Local Ollama Modelfile:** 100% offline, free local execution with Llama 3.2.
  - **Character Card (JSON):** Standard JSON card for SillyTavern, TavernAI, or custom bot APIs.

📖 **For step-by-step export walkthroughs & cloud hosting instructions, see [DEPLOYMENT_AND_EXPORT_GUIDE.md](DEPLOYMENT_AND_EXPORT_GUIDE.md).**

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, React Markdown
- **Backend:** Node.js, Express, Vite middleware in development, `ws` (WebSockets)
- **AI SDK:** Official `@google/genai` TypeScript SDK
- **Models Used:**
  - `gemini-3.5-flash`: General conversation, Google Search Grounding, and scenario roleplay
  - `gemini-3.1-pro-preview`: Deep cognitive profiling and complex analysis
  - `gemini-3.1-flash-lite`: Fast-turn responses
  - `gemini-3.8-live`: Real-time bidirectional voice conversations
  - `gemini-3.5-transcribe`: Voice dictation audio transcription

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/persona-learner-scenario-bot.git
   cd persona-learner-scenario-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at [http://localhost:3000](http://localhost:3000).

### Production Build

1. **Build client and server bundles:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

---

## 📁 Project Structure

```
├── server.ts                 # Express backend & Gemini API proxy routes (chat, live audio, transcripts)
├── index.html                # HTML entrypoint with synchronized metadata
├── metadata.json             # AI Studio configuration & capabilities
├── package.json              # Scripts, dependencies, and engine targets
├── vite.config.ts            # Vite bundler & Tailwind configuration
├── src/
│   ├── main.tsx              # React DOM entrypoint
│   ├── App.tsx               # Primary app controller, state management, & modal routing
│   ├── types.ts              # TypeScript interfaces (Personas, Scenarios, CYOA nodes, transcripts)
│   ├── components/
│   │   ├── ChatView.tsx              # Main dialogue area with branch banner & crossroads tray
│   │   ├── Header.tsx                # Top navigation & session controls
│   │   ├── ProfileDrawer.tsx         # Cognitive profile radar charts & heuristics
│   │   ├── ScenarioPickerModal.tsx   # Catalog of roleplay scenarios & custom scenario creator
│   │   ├── TranscriptReplayModal.tsx # Step-by-step transcript replay & CYOA branching visualizer
│   │   ├── EmergencyExitView.tsx     # Instant safety shield & crisis resource directory
│   │   ├── LiveVoiceModal.tsx        # Real-time WebSocket audio interface
│   │   ├── BotExportModal.tsx        # Clone export & test simulator
│   │   └── PostScenarioEvaluationModal.tsx # Scenario realism & performance rubric
│   ├── data/
│   │   └── defaultScenarios.ts       # Pre-seeded scenarios & decision tree data
│   └── lib/
│       ├── audioUtils.ts             # PCM audio conversion & microphone utilities
│       └── storage.ts                # LocalStorage persistence & transcript synthesis
```

---

## 🔒 Safety & Privacy

- Scenario simulations are designed strictly for educational and self-reflection purposes.
- All conversation sessions, profiles, and evaluations are stored locally in the browser (`localStorage`).
- The **Emergency Exit** button is always accessible to immediately clear sensitive interactions and surface emergency support numbers.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
