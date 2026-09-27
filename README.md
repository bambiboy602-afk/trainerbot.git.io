# TrainerBot - Persona Learner & Scenario Bot

A state-of-the-art Android application that serves as an adaptive conversational partner and roleplay scenario simulator, powered by Google Gemini. The system observes your communication style, emotional attunement, reasoning heuristics, and conflict-resolution strategies to dynamically synthesize a local cognitive persona profile and unlock achievement milestones.

---

## ✨ Key Features

### 🎭 High-Stakes Scenario Simulator
Practice challenging interpersonal conversations in realistic, safe simulations across various domains:
- **Domestic Violence & Safety:** "Grey Rock" de-escalation, safe exit planning, and non-confrontational boundary setting.
- **Mental Health & Peer Support:** Supporting participants through crisis, craving de-escalation, and somatic grounding.
- **Workplace & Friction:** PIP discussions, constructive peer feedback, and organizational ethics.
- **Neurodiversity & Social Skills:** Breakroom small talk practice, sensory overload advocacy, and mutual boundary setting.

### 🌲 Choose Your Own Adventure (CYOA) Decision Branching
- **Crossroads in Chats:** Interactive decision nodes where different phrasing choices lead to divergent conversational outcomes.
- **Real-Time Divergent Reaction Modeling:** AI counterparts adapt their dialogue tone, emotional posture, and conflict trajectory based on the selected path.

### 🧠 Dynamic Cognitive Profiling
- Real-time spectrum analysis: *Directness*, *Brevity*, *Social Empathy*, *De-escalation*, *Reasoning Mode*, and *Boundary Strength*.
- Automatic behavioral synthesis: identifies communication strengths, signature phrases, and personal growth opportunities in your profile dashboard.
- **Skills Trajectory Progress Chart:** Custom line graph visualization representing progress over multiple session evaluations!

### 🎓 Real-Time Communication Mentor Mode
- Enable **Mentor Mode** to receive constructive coaching alongside the AI's in-character response.
- Highlights emotional attunement, psychological safety, and recommends high-leverage alternative phrasing.

### 🛡️ Safety-First Emergency Exit Protocol
- Designed for high-stakes simulations (e.g., domestic violence or mental health crisis).
- Immediately clears active chats and displays a safe, reassuring workspace featuring sensory grounding exercises, professional support numbers (988, National DV Hotline), and discrete safe weather links.

---

## 🛠️ Android Tech Stack & Architecture

- **Language:** Kotlin (100% Type-Safe)
- **UI Framework:** Jetpack Compose (Material Design 3)
- **Local Database Persistence:** Room Database (SQLite abstraction with KSP compile-time validation)
- **Networking Library:** Retrofit & OkHttp (Configured with 60s timeouts for large model runs)
- **Data Serialization:** Kotlinx Serialization JSON
- **State Management:** MVVM (Model-View-ViewModel) architecture with structured Kotlin Coroutines Flow emission
- **AI Model Integration:** Google Gemini REST API using `gemini-3.5-flash` for general chat, search grounding, and profile compilation, and `gemini-3.1-pro-preview` for complex analytical runs.

---

## 📱 How to Build and Run

### Prerequisites
- JDK 21
- Android SDK 36
- Android Studio Ladybug or newer

### Setup & Credentials
1. Create a `.env` file in the root project directory:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
2. Build and run the app. If the key is left blank in `.env`, you can also configure it securely inside the Settings tab of the application!
