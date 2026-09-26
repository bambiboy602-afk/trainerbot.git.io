import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  Sliders,
  ExternalLink,
  HelpCircle,
  Play,
  Globe,
  Code2,
  BookOpen,
  Layers,
  Cpu,
  ArrowRight,
  Laptop,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { PersonaProfile, BotExportFormats, ChatMessage, ScenarioEvaluation } from '../types';

interface BotExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonaProfile;
  messages: ChatMessage[];
  evaluations?: ScenarioEvaluation[];
}

export const BotExportModal: React.FC<BotExportModalProps> = ({
  isOpen,
  onClose,
  profile,
  messages,
  evaluations = []
}) => {
  const [activeTab, setActiveTab] = useState<
    'guides' | 'standalone_web' | 'code_scripts' | 'markdown' | 'ollama' | 'json' | 'xml' | 'few_shots' | 'test_clone'
  >('guides');

  const [codeLanguage, setCodeLanguage] = useState<'python' | 'nodejs'>('python');
  const [jsonViewType, setJsonViewType] = useState<'profile' | 'character_card'>('profile');

  const [exportFormats, setExportFormats] = useState<BotExportFormats | null>(null);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clone testing sandbox states
  const [testPrompt, setTestPrompt] = useState(
    'A client is pushing for a 50% discount and threatening to cancel. What is our strategy?'
  );
  const [cloneHistory, setCloneHistory] = useState<{ role: string; content: string }[]>([]);
  const [isTestingClone, setIsTestingClone] = useState(false);
  const [cloneReply, setCloneReply] = useState<string | null>(null);

  // Fetch or generate export formats whenever modal opens if not already loaded or outdated
  useEffect(() => {
    if (isOpen && !exportFormats && !isGeneratingExport) {
      handleGenerateExport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateExport = async () => {
    setIsGeneratingExport(true);
    setError(null);
    try {
      const sampleUserTurns = messages
        .filter((m) => m.role === 'user')
        .slice(-10)
        .map((m) => m.content);

      const res = await fetch('/api/export-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          userSampleMessages: sampleUserTurns,
          evaluations
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize bot configuration');
      }

      setExportFormats(data.exportFormats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating export formats');
    } finally {
      setIsGeneratingExport(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Converts and formats the full cognitive profile into a clean, machine-readable JSON object
  const getFormattedProfileData = () => {
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        formatVersion: '1.0.0',
        generator: 'Persona Learner & Scenario Bot',
        completenessScore: profile.completenessScore || 0,
        messagesAnalyzed: profile.messageCountAnalyzed || 0,
        totalEvaluations: evaluations.length,
      },
      personaSummary: profile.overallSummary || 'Profile in training.',
      cognitiveStyleSummary: profile.cognitiveStyleSummary || '',
      decisionMakingRules: profile.decisionMakingRules || [],
      signaturePhrases: profile.signaturePhrases || [],
      communicationDosAndDonts: profile.communicationDosAndDonts || { dos: [], donts: [] },
      spectrums: (profile.spectrums || []).map((s) => ({
        id: s.id,
        category: s.category,
        leftLabel: s.leftLabel,
        rightLabel: s.rightLabel,
        score: s.score,
        summary: s.summary,
        confidence: s.confidence,
        observedEvidence: s.observedEvidence || []
      })),
      detailedTraits: (profile.detailedTraits || []).map((t) => ({
        id: t.id,
        category: t.category,
        title: t.title,
        description: t.description,
        confidence: t.confidence,
        supportingQuotes: t.supportingQuotes || []
      })),
      socialGrowthFeedback: profile.socialGrowthFeedback || null,
      progressHistory: profile.progressHistory || [],
      lastUpdated: profile.lastUpdated ? new Date(profile.lastUpdated).toISOString() : new Date().toISOString()
    };
  };

  // Download function that converts profile data into a properly formatted .json file
  const handleDownloadProfileJson = () => {
    const formattedData = getFormattedProfileData();
    const jsonString = JSON.stringify(formattedData, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeTitle = (profile.detailedTraits?.[0]?.title || 'persona')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `${safeTitle}-cognitive-profile-${dateStr}.json`;
    downloadFile(jsonString, filename, 'application/json');
  };

  // Helper to generate the standalone zero-dependency HTML file
  const generateStandaloneHtml = (): string => {
    const sysPrompt = exportFormats?.systemPromptMarkdown || profile.overallSummary || 'You are an AI clone of the user.';
    const safeSystemPrompt = JSON.stringify(sysPrompt);
    const personaName = (profile.detailedTraits?.[0]?.title ? `${profile.detailedTraits[0].title} Persona` : 'Persona Bot').replace(/"/g, '&quot;');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personaName} - Standalone Chat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0a09; color: #f5f5f4; height: 100vh; display: flex; flex-direction: column; }
    header { background: #1c1917; padding: 14px 20px; border-bottom: 1px solid #292524; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 38px; height: 38px; border-radius: 10px; background: #d97706; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; }
    .title h1 { font-size: 15px; font-weight: 700; color: #fafaf9; }
    .title p { font-size: 12px; color: #a8a29e; }
    .btn { background: #292524; border: 1px solid #44403c; color: #e7e5e4; font-size: 12px; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .btn:hover { background: #44403c; color: #fff; }
    #chat-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; max-width: 800px; width: 100%; margin: 0 auto; }
    .msg { display: flex; flex-direction: column; max-width: 85%; line-height: 1.5; font-size: 14px; }
    .msg.user { align-self: flex-end; background: #2563eb; color: #ffffff; padding: 10px 14px; border-radius: 14px 14px 2px 14px; }
    .msg.bot { align-self: flex-start; background: #1c1917; border: 1px solid #292524; color: #f5f5f4; padding: 12px 16px; border-radius: 14px 14px 14px 2px; }
    .msg-label { font-size: 10px; font-weight: 700; opacity: 0.6; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    #input-bar { background: #1c1917; border-top: 1px solid #292524; padding: 14px 20px; }
    .input-wrapper { max-width: 800px; margin: 0 auto; display: flex; gap: 10px; }
    input[type="text"] { flex: 1; background: #0c0a09; border: 1px solid #44403c; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #fafaf9; outline: none; }
    input[type="text"]:focus { border-color: #d97706; }
    button.send-btn { background: #d97706; color: #ffffff; font-weight: 700; border: none; padding: 0 20px; border-radius: 10px; cursor: pointer; font-size: 14px; transition: 0.2s; }
    button.send-btn:hover { background: #b45309; }
    button.send-btn:disabled { background: #57534e; cursor: not-allowed; }
    #key-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 99; padding: 16px; }
    .modal-box { background: #1c1917; border: 1px solid #44403c; border-radius: 14px; padding: 24px; max-width: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .modal-box h2 { font-size: 17px; margin-bottom: 8px; color: #fafaf9; }
    .modal-box p { font-size: 13px; color: #a8a29e; margin-bottom: 16px; line-height: 1.4; }
    .modal-box input { width: 100%; background: #0c0a09; border: 1px solid #44403c; border-radius: 8px; padding: 10px 14px; color: #fafaf9; font-size: 13px; margin-bottom: 16px; outline: none; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="avatar">⚡</div>
      <div class="title">
        <h1>Persona Bot Clone</h1>
        <p>Zero-Setup Standalone Web App</p>
      </div>
    </div>
    <button class="btn" onclick="openKeyModal()">⚙️ API Key</button>
  </header>

  <div id="chat-container">
    <div class="msg bot">
      <div class="msg-label">Persona Clone</div>
      Hello! I am configured with this persona's communication heuristics and reasoning framework. Enter your free Gemini API key using the ⚙️ button in the top right to start chatting!
    </div>
  </div>

  <div id="input-bar">
    <div class="input-wrapper">
      <input type="text" id="user-input" placeholder="Type a scenario, question, or message..." onkeydown="if(event.key==='Enter') sendMessage()">
      <button class="send-btn" id="send-btn" onclick="sendMessage()">Send</button>
    </div>
  </div>

  <div id="key-modal">
    <div class="modal-box">
      <h2>Gemini API Key Required</h2>
      <p>Enter your free Google Gemini API key to chat with this bot offline in any web browser. Get a key free at <a href="https://aistudio.google.com" target="_blank" style="color:#f59e0b;">aistudio.google.com</a>. (Stored locally in your browser only).</p>
      <input type="password" id="api-key-input" placeholder="AIzaSy...">
      <div class="modal-actions">
        <button class="btn" onclick="closeKeyModal()">Cancel</button>
        <button class="btn" style="background:#d97706; color:#fff;" onclick="saveKey()">Save Key</button>
      </div>
    </div>
  </div>

  <script>
    const SYSTEM_INSTRUCTION = ${safeSystemPrompt};
    let history = [];

    function getKey() {
      return localStorage.getItem('gemini_api_key') || '';
    }

    function openKeyModal() {
      document.getElementById('api-key-input').value = getKey();
      document.getElementById('key-modal').style.display = 'flex';
    }

    function closeKeyModal() {
      document.getElementById('key-modal').style.display = 'none';
    }

    function saveKey() {
      const val = document.getElementById('api-key-input').value.trim();
      if (val) {
        localStorage.setItem('gemini_api_key', val);
      }
      closeKeyModal();
    }

    async function sendMessage() {
      const input = document.getElementById('user-input');
      const text = input.value.trim();
      if (!text) return;

      const apiKey = getKey();
      if (!apiKey) {
        openKeyModal();
        return;
      }

      const container = document.getElementById('chat-container');
      const userMsg = document.createElement('div');
      userMsg.className = 'msg user';
      userMsg.innerHTML = '<div class="msg-label">You</div>' + escapeHtml(text);
      container.appendChild(userMsg);
      input.value = '';
      container.scrollTop = container.scrollHeight;

      history.push({ role: 'user', parts: [{ text }] });

      const botMsg = document.createElement('div');
      botMsg.className = 'msg bot';
      botMsg.innerHTML = '<div class="msg-label">Persona Clone</div>Thinking...';
      container.appendChild(botMsg);
      container.scrollTop = container.scrollHeight;

      const sendBtn = document.getElementById('send-btn');
      sendBtn.disabled = true;

      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(apiKey);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: history,
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            generationConfig: { temperature: 0.75 }
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Gemini API call failed');
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '(no reply)';
        botMsg.innerHTML = '<div class="msg-label">Persona Clone</div>' + escapeHtml(reply).replace(/\\n/g, '<br>');
        history.push({ role: 'model', parts: [{ text: reply }] });
      } catch (err) {
        botMsg.innerHTML = '<div class="msg-label" style="color:#ef4444">Error</div>' + escapeHtml(err.message) + '<br><small>Check your API key in settings (⚙️ button).</small>';
      } finally {
        sendBtn.disabled = false;
        container.scrollTop = container.scrollHeight;
      }
    }

    function escapeHtml(str) {
      const p = document.createElement('p');
      p.appendChild(document.createTextNode(str));
      return p.innerHTML;
    }

    if (!getKey()) {
      setTimeout(openKeyModal, 500);
    }
  </script>
</body>
</html>`;
  };

  const handleRunCloneTest = async () => {
    if (!testPrompt.trim() || isTestingClone) return;

    setIsTestingClone(true);
    setCloneReply(null);
    try {
      const activeSystemPrompt =
        exportFormats?.systemPromptMarkdown ||
        `You are an AI clone of the user. Persona: ${profile.overallSummary}`;

      const res = await fetch('/api/test-clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPrompt: testPrompt.trim(),
          systemPrompt: activeSystemPrompt,
          history: cloneHistory
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get clone reply');

      setCloneReply(data.reply);
      setCloneHistory((prev) => [
        ...prev,
        { role: 'user', content: testPrompt.trim() },
        { role: 'assistant', content: data.reply }
      ]);
    } catch (err: any) {
      console.error(err);
      setCloneReply(`[Error running clone test: ${err.message}]`);
    } finally {
      setIsTestingClone(false);
    }
  };

  const fallbackPythonScript = `"""
Persona Bot - Executable Python Script
Run:
  pip install google-genai
  python run_bot.py
"""
import os
import sys

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("\\n[!] Missing library. Install with: pip install google-genai\\n")
    sys.exit(1)

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    api_key = input("Enter your Gemini API key: ").strip()

client = genai.Client(api_key=api_key)
SYSTEM_PROMPT = """${exportFormats?.systemPromptMarkdown || 'You are an AI clone of the user.'}"""

chat = client.chats.create(
    model="gemini-2.5-flash",
    config=types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.75,
    )
)

print("\\n🤖 Bot initialized! Type 'exit' to quit.\\n")
while True:
    try:
        user_input = input("You: ").strip()
        if not user_input: continue
        if user_input.lower() in ["exit", "quit", "q"]: break
        res = chat.send_message(user_input)
        print(f"Clone: {res.text}\\n")
    except (KeyboardInterrupt, EOFError):
        break
`;

  const fallbackNodeScript = `/**
 * Persona Bot - Executable Node.js Script
 * Run:
 *   npm install @google/genai dotenv
 *   node run_bot.mjs
 */
import readline from "node:readline";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

let apiKey = process.env.GEMINI_API_KEY;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  if (!apiKey) {
    apiKey = (await ask("Enter your Gemini API key: ")).trim();
  }
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = ${JSON.stringify(exportFormats?.systemPromptMarkdown || 'You are an AI clone of the user.')};
  const history = [];

  console.log("\\n🤖 Bot initialized! Type 'exit' to quit.\\n");
  while (true) {
    const input = await ask("You: ");
    const trimmed = input.trim();
    if (!trimmed) continue;
    if (["exit", "quit", "q"].includes(trimmed.toLowerCase())) {
      rl.close();
      break;
    }
    history.push({ role: "user", parts: [{ text: trimmed }] });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: { systemInstruction, temperature: 0.75 }
    });
    const reply = response.text || "";
    console.log(\`Clone: \${reply}\\n\`);
    history.push({ role: "model", parts: [{ text: reply }] });
  }
}
main().catch(console.error);
`;

  const activePythonCode = exportFormats?.executablePythonScript || fallbackPythonScript;
  const activeNodeCode = exportFormats?.executableNodeScript || fallbackNodeScript;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-amber-300 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">Bot Deployment & Export Studio</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Ready to Run
                </span>
                {evaluations.length > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    ⭐ Calibrated by {evaluations.length} Review{evaluations.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Export your persona as a 1-click Web Bot, Python CLI, ChatGPT GPT, Claude Project, or local Ollama model
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadProfileJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
              title="Download your complete cognitive profile data as a formatted .json file"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Save Profile (.json)</span>
              <span className="sm:hidden">.JSON</span>
            </button>
            <button
              onClick={handleGenerateExport}
              disabled={isGeneratingExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 cursor-pointer"
              title="Regenerate prompts with latest profile updates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingExport ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-stone-200 bg-white flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-thin">
          {[
            { id: 'guides', label: '🚀 How to Make It Work', badge: 'Cheat Sheet' },
            { id: 'standalone_web', label: '🌐 1-Click HTML Web Bot', badge: 'No Install' },
            { id: 'code_scripts', label: '🐍 Python & Node.js Code', badge: 'Executable' },
            { id: 'markdown', label: 'Universal Prompt', badge: 'ChatGPT / Claude' },
            { id: 'ollama', label: 'Ollama Modelfile', badge: 'Local & Free' },
            { id: 'json', label: 'Profile & Card (.json)', badge: 'Data' },
            { id: 'xml', label: 'Structured XML', badge: 'Claude 3.5' },
            { id: 'few_shots', label: 'Few-Shot Tuning', badge: 'Examples' },
            { id: 'test_clone', label: '⚡ Test Clone Now', badge: 'Interactive' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-stone-900 text-stone-950 font-bold bg-stone-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                    isActive ? 'bg-stone-900 text-amber-300' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50/50">
          {isGeneratingExport ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
              <h4 className="text-sm font-bold text-stone-800">
                Synthesizing Your Bot Code & Deployment Packages...
              </h4>
              <p className="text-xs text-stone-500 max-w-md">
                Compiling communication habits, reasoning heuristics, and sample responses into turnkey standalone web apps, Python scripts, and LLM system prompts.
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <p className="font-bold">Error generating export:</p>
              <p>{error}</p>
              <button
                onClick={handleGenerateExport}
                className="mt-2 px-3 py-1.5 bg-rose-700 text-white rounded-lg font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : exportFormats ? (
            <>
              {/* TAB 1: HOW TO MAKE IT WORK / DEPLOYMENT GUIDE */}
              {activeTab === 'guides' && (
                <div className="space-y-6">
                  {/* Top Banner */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        "What am I missing? How do I make my exported bot work?"
                      </h3>
                      <p className="text-xs text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
                        Raw text files and JSON cannot run by themselves without a host program. Choose any of the ready-made methods below to have your bot running in under 60 seconds:
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        downloadFile(generateStandaloneHtml(), 'my-persona-bot.html', 'text/html')
                      }
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-98"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>Download 1-Click Web App (.html)</span>
                    </button>
                  </div>

                  {/* 4 Execution Options Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method 1: 1-Click HTML Web App */}
                    <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                          <Globe className="w-4 h-4 text-sky-600" />
                          <span>1. Standalone Web Bot (.html)</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Easiest (No coding)
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        A single HTML file with a built-in chat UI. Double-click it on your Mac or PC to open in Chrome or Safari, enter your free Gemini API key, and talk to your persona immediately.
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() =>
                            downloadFile(generateStandaloneHtml(), 'my-persona-bot.html', 'text/html')
                          }
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .html file</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('standalone_web')}
                          className="px-3 py-1.5 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium rounded-lg cursor-pointer"
                        >
                          View Details & Source
                        </button>
                      </div>
                    </div>

                    {/* Method 2: ChatGPT Custom GPT */}
                    <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                          <Bot className="w-4 h-4 text-emerald-600" />
                          <span>2. ChatGPT Custom GPT</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          60 Seconds
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Create a private or shareable custom bot on ChatGPT that embodies your persona:
                      </p>
                      <ol className="text-xs text-stone-600 space-y-1 list-decimal list-inside">
                        <li>Go to <span className="font-semibold text-stone-800">chatgpt.com/gpts/editor</span></li>
                        <li>Click the <b>"Configure"</b> tab</li>
                        <li>Paste the Universal Prompt into <b>"Instructions"</b></li>
                        <li>Save and publish to "Only Me" or "Anyone with a link"</li>
                      </ol>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(exportFormats.systemPromptMarkdown, 'guide_gpt')}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedKey === 'guide_gpt' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedKey === 'guide_gpt' ? 'Copied Prompt!' : 'Copy Instructions'}</span>
                        </button>
                        <a
                          href="https://chatgpt.com/gpts/editor"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium rounded-lg flex items-center gap-1"
                        >
                          <span>Open ChatGPT</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Method 3: Ollama Local (Free & Offline) */}
                    <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                          <Terminal className="w-4 h-4 text-purple-600" />
                          <span>3. Local Ollama (100% Free & Offline)</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          No API Key
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Run your persona 100% locally on your computer with zero subscriptions:
                      </p>
                      <div className="p-2.5 bg-stone-900 rounded-lg text-[11px] font-mono text-purple-200 space-y-1">
                        <div>$ ollama pull llama3.2</div>
                        <div>$ ollama create my-clone -f Modelfile</div>
                        <div>$ ollama run my-clone</div>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => downloadFile(exportFormats.ollamaModelfile, 'Modelfile', 'text/plain')}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Modelfile</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('ollama')}
                          className="px-3 py-1.5 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium rounded-lg cursor-pointer"
                        >
                          View Modelfile
                        </button>
                      </div>
                    </div>

                    {/* Method 4: Python & Node.js Scripts */}
                    <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                          <Code2 className="w-4 h-4 text-amber-600" />
                          <span>4. Runnable Python / Node.js Code</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Developers
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Download a turnkey Python script with interactive terminal loop:
                      </p>
                      <div className="p-2.5 bg-stone-900 rounded-lg text-[11px] font-mono text-amber-200 space-y-1">
                        <div>$ pip install google-genai</div>
                        <div>$ python run_bot.py</div>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => downloadFile(activePythonCode, 'run_bot.py', 'text/x-python')}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download run_bot.py</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('code_scripts')}
                          className="px-3 py-1.5 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium rounded-lg cursor-pointer"
                        >
                          View Code
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cognitive Profile Raw Data Download Bar */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <div className="font-bold text-emerald-950 text-sm">Need your complete profile data as a .json file?</div>
                        <p className="text-emerald-800 text-xs">
                          Export your observed spectrums, communication heuristics, and progress history formatted into clean JSON.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadProfileJson}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="Download your full cognitive profile data as a formatted .json file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Profile (.json)</span>
                    </button>
                  </div>

                  {/* Claude Projects & Gemini Gems Quick Note */}
                  <div className="p-4 bg-stone-100/80 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700">
                    <div>
                      <span className="font-bold text-stone-900">Using Claude Projects or Google Gemini Gems? </span>
                      Copy the Structured XML format or Markdown prompt and paste directly into the "System Instructions" field.
                    </div>
                    <button
                      onClick={() => copyToClipboard(exportFormats.structuredXmlPrompt, 'guide_xml')}
                      className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-900 font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'guide_xml' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'guide_xml' ? 'Copied XML!' : 'Copy XML for Claude'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: STANDALONE HTML WEB APP */}
              {activeTab === 'standalone_web' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-600" />
                        Zero-Setup Standalone HTML Web App
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Download this single <code className="bg-stone-100 px-1 rounded">.html</code> file. Double click it to open in Chrome, Safari, or Edge. Enter your free Gemini API key to chat anywhere.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          copyToClipboard(generateStandaloneHtml(), 'html_code')
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {copiedKey === 'html_code' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === 'html_code' ? 'Copied HTML!' : 'Copy HTML'}</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadFile(generateStandaloneHtml(), 'my-persona-bot.html', 'text/html')
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Download HTML File</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white border border-stone-200 rounded-lg">
                      <div className="font-bold text-stone-900 mb-1">1. Download</div>
                      <p className="text-stone-500">Save <code className="bg-stone-100 px-1 rounded">my-persona-bot.html</code> to your desktop or documents folder.</p>
                    </div>
                    <div className="p-3 bg-white border border-stone-200 rounded-lg">
                      <div className="font-bold text-stone-900 mb-1">2. Double-Click to Open</div>
                      <p className="text-stone-500">Opens instantly in your default browser. No web server, Node.js, or terminal required.</p>
                    </div>
                    <div className="p-3 bg-white border border-stone-200 rounded-lg">
                      <div className="font-bold text-stone-900 mb-1">3. Enter Free Key</div>
                      <p className="text-stone-500">Paste your free Gemini key from Google AI Studio. It is saved in your local browser only.</p>
                    </div>
                  </div>

                  <pre className="p-4 bg-stone-900 text-sky-200 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[380px] whitespace-pre-wrap border border-stone-800">
                    {generateStandaloneHtml().slice(0, 1500)}...
                    {"\n\n/* [Remaining HTML and embedded script included in download] */"}
                  </pre>
                </div>
              )}

              {/* TAB 3: EXECUTABLE CODE (PYTHON & NODE.JS) */}
              {activeTab === 'code_scripts' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-amber-600" />
                        <h3 className="text-sm font-bold text-stone-900">
                          Standalone Executable Code
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Self-contained terminal chat scripts using the official Google GenAI SDK.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                        <button
                          onClick={() => setCodeLanguage('python')}
                          className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                            codeLanguage === 'python'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          Python (.py)
                        </button>
                        <button
                          onClick={() => setCodeLanguage('nodejs')}
                          className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                            codeLanguage === 'nodejs'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          Node.js (.mjs)
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          codeLanguage === 'python'
                            ? copyToClipboard(activePythonCode, 'code_py')
                            : copyToClipboard(activeNodeCode, 'code_js')
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {copiedKey?.startsWith('code_') ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey?.startsWith('code_') ? 'Copied!' : 'Copy Code'}</span>
                      </button>

                      <button
                        onClick={() =>
                          codeLanguage === 'python'
                            ? downloadFile(activePythonCode, 'run_bot.py', 'text/x-python')
                            : downloadFile(activeNodeCode, 'run_bot.mjs', 'application/javascript')
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Download {codeLanguage === 'python' ? 'run_bot.py' : 'run_bot.mjs'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal Run Guide Box */}
                  <div className="p-3 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono flex items-center justify-between border border-stone-800">
                    <div>
                      <span className="text-stone-400"># Terminal Setup & Run:</span>
                      <div className="text-amber-300 font-bold mt-1">
                        {codeLanguage === 'python'
                          ? 'pip install google-genai && python run_bot.py'
                          : 'npm install @google/genai dotenv && node run_bot.mjs'}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          codeLanguage === 'python'
                            ? 'pip install google-genai && python run_bot.py'
                            : 'npm install @google/genai dotenv && node run_bot.mjs',
                          'run_cmd'
                        )
                      }
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] rounded font-sans cursor-pointer"
                    >
                      {copiedKey === 'run_cmd' ? 'Copied!' : 'Copy Command'}
                    </button>
                  </div>

                  <pre className="p-4 bg-stone-900 text-emerald-300 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[420px] whitespace-pre-wrap border border-stone-800">
                    {codeLanguage === 'python' ? activePythonCode : activeNodeCode}
                  </pre>
                </div>
              )}

              {/* TAB 4: MARKDOWN SYSTEM PROMPT */}
              {activeTab === 'markdown' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        Universal Markdown System Prompt
                      </h3>
                      <p className="text-xs text-stone-500">
                        Copy and paste directly into ChatGPT Custom GPT instructions, Claude Project system prompt, or Gemini Gems.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(exportFormats.systemPromptMarkdown, 'markdown')
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        {copiedKey === 'markdown' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === 'markdown' ? 'Copied!' : 'Copy Prompt'}</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadFile(
                            exportFormats.systemPromptMarkdown,
                            'my-bot-system-prompt.md',
                            'text/markdown'
                          )
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 border border-stone-300 bg-white cursor-pointer"
                        title="Download Markdown"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[480px] whitespace-pre-wrap selection:bg-amber-500/40 border border-stone-800">
                    {exportFormats.systemPromptMarkdown}
                  </pre>
                </div>
              )}

              {/* TAB 5: OLLAMA MODELFILE */}
              {activeTab === 'ollama' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        Ollama Local Model File
                      </h3>
                      <p className="text-xs text-stone-500">
                        Run your persona locally on your own machine without sending data to third parties.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(exportFormats.ollamaModelfile, 'ollama')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        {copiedKey === 'ollama' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === 'ollama' ? 'Copied!' : 'Copy Modelfile'}</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadFile(exportFormats.ollamaModelfile, 'Modelfile', 'text/plain')
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 border border-stone-300 bg-white cursor-pointer"
                        title="Download Modelfile"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3 Step Instruction Bar */}
                  <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="font-bold text-stone-900">3-Step Setup in your Terminal:</div>
                    <div className="p-2.5 bg-stone-900 text-purple-200 rounded-lg font-mono space-y-1">
                      <div>1. Download <span className="text-white">Modelfile</span> into an empty directory.</div>
                      <div>2. Run: <span className="text-amber-300">ollama pull llama3.2</span></div>
                      <div>3. Run: <span className="text-amber-300">ollama create my-clone -f ./Modelfile</span></div>
                      <div>4. Start chatting: <span className="text-emerald-400">ollama run my-clone</span></div>
                    </div>
                  </div>

                  <pre className="p-4 bg-stone-900 text-sky-200 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[420px] whitespace-pre-wrap border border-stone-800">
                    {exportFormats.ollamaModelfile}
                  </pre>
                </div>
              )}

              {/* TAB 6: JSON SPECIFICATIONS (PROFILE & CHARACTER CARD) */}
              {activeTab === 'json' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-stone-900">
                          {jsonViewType === 'profile'
                            ? 'Cognitive Profile JSON Data'
                            : 'Character Card JSON Specification'}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {jsonViewType === 'profile'
                          ? 'Machine-readable export of all observed spectrums, heuristics, behavioral traits, and progress history.'
                          : 'Universal JSON payload for programmatic bots, SillyTavern, OpenAI API assistants, or custom backend services.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                        <button
                          onClick={() => setJsonViewType('profile')}
                          className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                            jsonViewType === 'profile'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          Profile Data (.json)
                        </button>
                        <button
                          onClick={() => setJsonViewType('character_card')}
                          className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                            jsonViewType === 'character_card'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          Character Card (.json)
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            jsonViewType === 'profile'
                              ? JSON.stringify(getFormattedProfileData(), null, 2)
                              : JSON.stringify(exportFormats.characterCardJson, null, 2),
                            jsonViewType === 'profile' ? 'profile_json' : 'card_json'
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {copiedKey === 'profile_json' || copiedKey === 'card_json' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === 'profile_json' || copiedKey === 'card_json' ? 'Copied!' : 'Copy JSON'}</span>
                      </button>

                      {jsonViewType === 'profile' ? (
                        <button
                          onClick={handleDownloadProfileJson}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                          title="Save complete profile as a formatted .json file"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>Download Profile (.json)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            downloadFile(
                              JSON.stringify(exportFormats.characterCardJson, null, 2),
                              'character-card.json',
                              'application/json'
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                          title="Save character card as a .json file"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>Download Card (.json)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <pre className="p-4 bg-stone-900 text-emerald-300 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[480px] whitespace-pre-wrap border border-stone-800">
                    {jsonViewType === 'profile'
                      ? JSON.stringify(getFormattedProfileData(), null, 2)
                      : JSON.stringify(exportFormats.characterCardJson, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 7: STRUCTURED XML */}
              {activeTab === 'xml' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        Enterprise XML Structured Prompt
                      </h3>
                      <p className="text-xs text-stone-500">
                        Tagged schema ideal for Anthropic Claude 3.5 Sonnet and Gemini models to prevent persona drift.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(exportFormats.structuredXmlPrompt, 'xml')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        {copiedKey === 'xml' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === 'xml' ? 'Copied!' : 'Copy XML'}</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadFile(
                            exportFormats.structuredXmlPrompt,
                            'my-bot-prompt.xml',
                            'application/xml'
                          )
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 border border-stone-300 bg-white cursor-pointer"
                        title="Download XML"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-stone-900 text-amber-200/90 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto max-h-[480px] whitespace-pre-wrap border border-stone-800">
                    {exportFormats.structuredXmlPrompt}
                  </pre>
                </div>
              )}

              {/* TAB 8: FEW SHOT EXAMPLES */}
              {activeTab === 'few_shots' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Few-Shot Calibration Pairs
                    </h3>
                    <p className="text-xs text-stone-500">
                      Concrete conversational exchanges showing your clone how to think and respond in your exact voice.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {exportFormats.fewShotExamples?.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 shadow-xs"
                      >
                        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                          Example Scenario #{idx + 1}
                        </div>
                        <div className="p-2.5 bg-stone-100 rounded-lg text-xs text-stone-800">
                          <span className="font-semibold text-stone-900">User / Prompt: </span>
                          {ex.userExample}
                        </div>
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-950 font-mono leading-relaxed">
                          <span className="font-semibold text-amber-900">Your Clone Response: </span>
                          {ex.botReasoningStyle}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: TEST CLONE NOW */}
              {activeTab === 'test_clone' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Live Clone Testing Sandbox
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Test your synthesized bot right now! Ask it a hard dilemma, negotiation challenge, or casual question to verify it speaks, thinks, and decides like you.
                    </p>
                  </div>

                  {/* Sandbox Conversation History */}
                  <div className="space-y-3 min-h-[160px] max-h-[300px] overflow-y-auto p-4 bg-white border border-stone-200 rounded-xl">
                    {cloneHistory.length === 0 && !cloneReply && (
                      <p className="text-xs text-stone-400 italic text-center py-6">
                        No test run yet. Type a question or dilemma below and hit "Test Clone"!
                      </p>
                    )}

                    {cloneHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2.5 text-xs ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-stone-900 text-white font-medium'
                              : 'bg-stone-100 border border-stone-200 text-stone-900'
                          }`}
                        >
                          <div className="text-[10px] uppercase font-bold opacity-60 mb-1">
                            {msg.role === 'user' ? 'Test Scenario' : 'Your Bot Clone'}
                          </div>
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {isTestingClone && (
                      <div className="flex gap-2 items-center text-xs text-stone-500 py-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Clone is formulating response using your cognitive heuristics...</span>
                      </div>
                    )}
                  </div>

                  {/* Test Input Form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunCloneTest()}
                      placeholder="Ask your clone a tough question or scenario..."
                      className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <button
                      onClick={handleRunCloneTest}
                      disabled={isTestingClone || !testPrompt.trim()}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isTestingClone ? 'Running...' : 'Test Clone'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
