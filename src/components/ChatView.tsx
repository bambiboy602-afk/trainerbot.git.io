import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  User,
  Brain,
  Theater,
  Sparkles,
  Zap,
  HeartHandshake,
  Stethoscope,
  Headphones,
  Lightbulb,
  ShieldCheck,
  Compass,
  Star,
  Activity,
  Briefcase,
  Home,
  Scale,
  Mic,
  MicOff,
  Radio,
  Globe,
  ExternalLink,
  Bot,
  Gauge,
  Layers,
  Search,
  CheckCircle2,
  Volume2,
  HelpCircle,
  GraduationCap,
  ArrowUpRight,
  Copy,
  Check,
  ShieldAlert,
  Phone,
  AlertTriangle,
  Split,
  GitFork
} from 'lucide-react';
import {
  ChatMessage,
  Scenario,
  PersonaProfile,
  GeminiChatModelMode,
  ChatbotRolePreset,
  ScenarioSessionTranscript,
  DecisionBranch,
  DecisionBranchContext
} from '../types';
import { blobToBase64 } from '../lib/audioUtils';
import { EmergencyExitView } from './EmergencyExitView';

interface ChatViewProps {
  messages: ChatMessage[];
  activeScenario: Scenario | null;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onExitScenario: () => void;
  onRateScenario?: () => void;
  onOpenScenarios: () => void;
  onOpenTranscripts?: (targetId?: string) => void;
  onTriggerAnalysis: () => void;
  unanalyzedCount: number;
  profile: PersonaProfile;
  // Gemini model & chatbot configuration
  modelMode: GeminiChatModelMode;
  onModelModeChange: (mode: GeminiChatModelMode) => void;
  useSearchGrounding: boolean;
  onToggleSearchGrounding: () => void;
  rolePreset: ChatbotRolePreset;
  onRolePresetChange: (role: ChatbotRolePreset) => void;
  onOpenVoiceSession: () => void;
  // Real-time communication mentor mode
  mentorMode: boolean;
  onToggleMentorMode: () => void;
  // Emergency exit & high-stakes safety
  onEmergencyExit?: () => void;
  isEmergencyMode?: boolean;
  emergencySnapshot?: ScenarioSessionTranscript | null;
  onReturnFromEmergency?: () => void;
  onPurgeEmergencySnapshot?: (id: string) => void;
  // Choose Your Own Adventure (CYOA) decision branching
  activeBranchContext?: DecisionBranchContext | null;
  onClearActiveBranch?: () => void;
  onSelectBranchDecision?: (branch: DecisionBranch, nodeTitle: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  activeScenario,
  onSendMessage,
  isLoading,
  onExitScenario,
  onRateScenario,
  onOpenScenarios,
  onOpenTranscripts,
  onTriggerAnalysis,
  unanalyzedCount,
  profile,
  modelMode,
  onModelModeChange,
  useSearchGrounding,
  onToggleSearchGrounding,
  rolePreset,
  onRolePresetChange,
  onOpenVoiceSession,
  mentorMode,
  onToggleMentorMode,
  onEmergencyExit,
  isEmergencyMode = false,
  emergencySnapshot = null,
  onReturnFromEmergency,
  onPurgeEmergencySnapshot,
  activeBranchContext = null,
  onClearActiveBranch,
  onSelectBranchDecision,
}) => {
  const [inputText, setInputText] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio transcription states (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptionNotice, setTranscriptionNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Determine if a CYOA Decision Node is available for the current turn in the scenario
  const userTurnIndex = messages.filter((m) => m.role === 'user').length;
  const currentDecisionNode = activeScenario?.decisionTree?.find(
    (node) =>
      node.turnIndex === userTurnIndex ||
      node.turnIndex === messages.length ||
      (messages.length <= 2 && node.turnIndex <= 1)
  );

  // Trigger Emergency Exit: Immediately halt audio, clear inputs, wipe screen & preserve snapshot
  const handleTriggerEmergencyExit = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current.stop();
      } catch {}
      setIsRecording(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setInputText('');
    if (onEmergencyExit) {
      onEmergencyExit();
    }
  };

  // Keyboard shortcut listener: Pressing Escape while in an active scenario triggers Emergency Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeScenario && onEmergencyExit) {
        handleTriggerEmergencyExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScenario, onEmergencyExit, isRecording]);

  // If Emergency Mode is active, immediately replace the entire screen with the Emergency Safety Shield & Hotlines
  if (isEmergencyMode) {
    return (
      <EmergencyExitView
        snapshot={emergencySnapshot || null}
        onReturnToCleanChat={onReturnFromEmergency || onExitScenario}
        onOpenTranscripts={onOpenTranscripts}
        onPurgeSnapshot={onPurgeEmergencySnapshot}
      />
    );
  }

  // Helper to quickly apply suggested alternative phrasing into input
  const handleUseAlternativePhrasing = (text: string) => {
    setInputText(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Helper to copy alternative phrasing to clipboard
  const handleCopyPhrasing = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isTranscribing]);

  // Audio Recording with Microphone for gemini-3.5-transcribe
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        await handleTranscribeBlob(audioBlob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
      setTranscriptionNotice(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      alert('Microphone access was denied or not available in this browser.');
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleTranscribeBlob = async (blob: Blob) => {
    try {
      setIsTranscribing(true);
      const base64Audio = await blobToBase64(blob);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: blob.type || 'audio/webm',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to transcribe');
      }

      if (data.transcription) {
        setInputText((prev) => (prev ? `${prev} ${data.transcription}` : data.transcription));
        setTranscriptionNotice('Spoken audio transcribed via gemini-3.5-transcribe');
        setTimeout(() => setTranscriptionNotice(null), 4000);
      } else {
        setTranscriptionNotice('No speech detected in audio.');
        setTimeout(() => setTranscriptionNotice(null), 3000);
      }
    } catch (err: any) {
      console.error('Error transcribing audio:', err);
      alert(`Transcription error: ${err.message || 'Failed to transcribe audio'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const renderCategoryIcon = (category?: string, customClass = 'w-4 h-4') => {
    switch (category) {
      case 'medical_clinical':
        return <Activity className={customClass} />;
      case 'workplace_conflict':
        return <Briefcase className={customClass} />;
      case 'parenting_family':
        return <Home className={customClass} />;
      case 'social_skills':
        return <HeartHandshake className={customClass} />;
      case 'mental_health':
        return <Stethoscope className={customClass} />;
      case 'customer_relations':
        return <Headphones className={customClass} />;
      case 'ethics':
        return <Scale className={customClass} />;
      case 'negotiation':
        return <Zap className={customClass} />;
      case 'relationship_safety':
        return <ShieldAlert className={customClass} />;
      default:
        return <Theater className={customClass} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/40 relative overflow-hidden">
      {/* Active Scenario Banner with Role Guidance & Tips */}
      {activeScenario && (
        <div
          className={`border-b px-4 py-2.5 shrink-0 animate-fade-in ${
            activeScenario.category === 'relationship_safety'
              ? 'bg-rose-50/90 border-rose-200'
              : 'bg-amber-100/60 border-amber-200/80'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                  activeScenario.category === 'relationship_safety'
                    ? 'bg-rose-700 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {renderCategoryIcon(activeScenario.category, 'w-4 h-4')}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-900 text-sm truncate">
                    {activeScenario.title}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      activeScenario.category === 'relationship_safety'
                        ? 'bg-rose-200/80 text-rose-900'
                        : 'bg-amber-200/70 text-amber-900'
                    }`}
                  >
                    {activeScenario.category.replace(/_/g, ' ')}
                  </span>
                  {activeScenario.difficulty && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        activeScenario.difficulty === 'Advanced'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : activeScenario.difficulty === 'Intermediate'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {activeScenario.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                  <span className="font-semibold text-stone-800">Your Role:</span>{' '}
                  {activeScenario.userRole} |{' '}
                  <span className="font-semibold text-stone-800">AI Role:</span>{' '}
                  {activeScenario.aiRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Voice button in scenario banner */}
              <button
                onClick={onOpenVoiceSession}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 transition-colors shadow-xs cursor-pointer"
                title="Speak to this scenario in real-time with Live API (gemini-3.8-live)"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span className="hidden sm:inline">Voice Mode</span>
              </button>

              {onRateScenario && (
                <button
                  onClick={onRateScenario}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
                  title="Rate realism and coach persona bot"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline">Rate Realism</span>
                </button>
              )}

              {activeScenario.coachingTips && activeScenario.coachingTips.length > 0 && (
                <button
                  onClick={() => setShowTips((prev) => !prev)}
                  className="p-1 text-amber-800 hover:text-amber-950 rounded hover:bg-amber-200/50 cursor-pointer"
                  title="Toggle coaching guidance tips"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
              )}

              {/* Prominent Emergency Exit for High-Stakes / Relationship Safety Scenarios */}
              {onEmergencyExit && (
                <button
                  onClick={handleTriggerEmergencyExit}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg cursor-pointer transition-all active:scale-95 shadow-xs ${
                    activeScenario.category === 'relationship_safety' || activeScenario.safetyNotice
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 ring-2 ring-rose-400/40 uppercase tracking-wider animate-pulse'
                      : 'bg-rose-100/90 hover:bg-rose-200 text-rose-800 border border-rose-300'
                  }`}
                  title="Immediately wipes screen, preserves private session snapshot, and shows 24/7 crisis resources (Shortcut: Esc)"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Emergency Exit</span>
                </button>
              )}

              <button
                onClick={onExitScenario}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900/10 text-stone-700 hover:bg-stone-900/20 transition-colors cursor-pointer"
              >
                Exit Scenario
              </button>
            </div>
          </div>

          {/* Domestic Violence Crisis Resource Notification */}
          {(activeScenario.category === 'relationship_safety' || activeScenario.safetyNotice) && (
            <div className="mt-2.5 pt-2 border-t border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs bg-white/70 rounded-lg p-2 text-rose-950 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-rose-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-rose-700" /> Confidential Help:
                </span>
                <span className="text-stone-700">
                  National Domestic Violence Hotline:
                </span>
                <a
                  href="tel:18007997233"
                  className="font-bold text-rose-800 underline hover:text-rose-950"
                  title="Call National Domestic Violence Hotline (free, 24/7, confidential)"
                >
                  1-800-799-SAFE (7233)
                </a>
                <span className="text-stone-400">|</span>
                <span className="text-stone-700">SMS: Text <strong>START</strong> to <strong>88788</strong></span>
                <span className="text-stone-400">|</span>
                <a
                  href="https://www.thehotline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-800 underline hover:text-rose-950 font-medium inline-flex items-center gap-0.5"
                >
                  thehotline.org <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                {onEmergencyExit && (
                  <button
                    onClick={handleTriggerEmergencyExit}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg bg-rose-700 hover:bg-rose-800 text-white shadow-2xs cursor-pointer transition-colors"
                    title="Immediately clear screen, save private reflection snapshot, and access crisis hotlines"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Emergency Screen Wipe &amp; Save Snapshot</span>
                  </button>
                )}
                <button
                  onClick={onExitScenario}
                  className="text-[11px] font-semibold text-rose-800 hover:text-rose-950 bg-rose-100 hover:bg-rose-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  title="Conclude scenario normally"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Expandable Scenario Coaching Tips */}
          {showTips && activeScenario.coachingTips && (
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2 text-[11px] text-amber-950">
              <span className="font-bold flex items-center gap-1 text-amber-800">
                <Compass className="w-3 h-3" /> Focus & Tips:
              </span>
              {activeScenario.coachingTips.map((tip, idx) => (
                <span
                  key={idx}
                  className="bg-white/70 px-2 py-0.5 rounded border border-amber-200/60 text-stone-700"
                >
                  💡 {tip}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Model & Chatbot Toolbar: Multi-Turn Role, Model Selection, Search Grounding & Live Voice */}
      <div className="bg-white border-b border-stone-200/80 px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Chatbot Role Selector */}
          <div className="flex items-center gap-1.5 text-stone-600">
            <Bot className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold text-stone-700">Role:</span>
            <select
              value={activeScenario ? 'scenario_actor' : rolePreset}
              disabled={Boolean(activeScenario)}
              onChange={(e) => onRolePresetChange(e.target.value as ChatbotRolePreset)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {activeScenario ? (
                <option value="scenario_actor">
                  🎭 {activeScenario.aiRole.split('—')[0].trim()} (Scenario)
                </option>
              ) : (
                <>
                  <option value="persona_learner">🔍 Persona Learner & Mirror</option>
                  <option value="relationship_safety_advocate">🛡️ Domestic Violence & Relationship Safety Advocate</option>
                  <option value="de_escalation_coach">🛡️ Communication & De-escalation Coach</option>
                  <option value="social_skills_tutor">🤝 Neurodiversity Social Skills Tutor</option>
                  <option value="medical_mentor">🩺 Clinical Healthcare & Bedside Mentor</option>
                  <option value="research_analyst">📊 Factual Policy & Benchmark Analyst</option>
                </>
              )}
            </select>
          </div>

          <div className="h-4 w-px bg-stone-200 hidden sm:block" />

          {/* Model Selector Mode */}
          <div className="flex items-center gap-1.5 text-stone-600">
            <Gauge className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-stone-700">Model:</span>
            <select
              value={useSearchGrounding ? 'general' : modelMode}
              disabled={useSearchGrounding}
              onChange={(e) => onModelModeChange(e.target.value as GeminiChatModelMode)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-75"
              title={
                useSearchGrounding
                  ? 'Search Grounding requires gemini-3.5-flash'
                  : 'Select Gemini model complexity'
              }
            >
              <option value="general">🎯 General Tasks (gemini-3.5-flash)</option>
              <option value="fast">⚡ Fast Response (gemini-3.1-flash-lite)</option>
              <option value="complex">🧠 Complex Reasoning (gemini-3.1-pro-preview)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mentor Mode Toggle */}
          <button
            id="chat-mentor-mode-toggle"
            onClick={onToggleMentorMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              mentorMode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs ring-1 ring-emerald-400/30'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Forces the AI to provide constructive feedback on communication techniques in real-time on every turn"
          >
            <GraduationCap className={`w-3.5 h-3.5 ${mentorMode ? 'text-emerald-700' : 'text-stone-400'}`} />
            <span>Mentor Mode</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                mentorMode ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {mentorMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Google Search Grounding Toggle */}
          <button
            onClick={onToggleSearchGrounding}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              useSearchGrounding
                ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Ground answers with live Google Search data using gemini-3.5-flash"
          >
            <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-blue-600' : 'text-stone-400'}`} />
            <span>Google Search</span>
            {useSearchGrounding && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          {/* Live Voice Conversation Button */}
          <button
            onClick={onOpenVoiceSession}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Launch real-time voice conversation with gemini-3.8-live"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Live Voice</span>
          </button>

          {/* Persistent Quick Safety & Emergency Exit */}
          {onEmergencyExit && (
            <button
              onClick={handleTriggerEmergencyExit}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeScenario?.category === 'relationship_safety'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-2xs font-bold'
                  : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50'
              }`}
              title="Emergency Safety Exit: Instantly clears screen, saves private reflection snapshot, and shows crisis hotlines"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-current" />
              <span className="hidden sm:inline">Emergency Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Mentor Mode active banner when conversation is started */}
        {mentorMode && messages.length > 0 && (
          <div className="max-w-3xl mx-auto bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-2.5 px-3.5 flex items-center justify-between text-xs text-emerald-950 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-emerald-900">Mentor Mode Active:</span>{' '}
                <span className="text-emerald-800 text-[11px] sm:text-xs">
                  Evaluating communication techniques, emotional attunement, and alternative high-leverage phrasing.
                </span>
              </div>
            </div>
            <button
              onClick={onToggleMentorMode}
              className="text-[10px] sm:text-[11px] text-emerald-700 hover:text-emerald-950 underline font-semibold ml-2 shrink-0 cursor-pointer"
            >
              Turn Off
            </button>
          </div>
        )}

        {/* Choose Your Own Adventure Active Branch Banner */}
        {activeBranchContext && (
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-xl p-3 px-4 shadow-sm border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-stone-950 flex items-center gap-1 shadow-xs">
                  <Split className="w-3 h-3 text-stone-950" /> CYOA Fork Active
                </span>
                <span className="text-xs font-bold text-amber-200 truncate">{activeBranchContext.label}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-snug">
                <span className="font-semibold text-amber-300">Consequence:</span> {activeBranchContext.consequenceSummary}
                {activeBranchContext.aiDialogueTone && (
                  <span className="ml-2 text-stone-400">
                    (AI Tone: <span className="text-amber-200 font-semibold">{activeBranchContext.aiDialogueTone}</span>)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenTranscripts && (
                <button
                  onClick={() => onOpenTranscripts()}
                  className="text-[11px] font-semibold text-amber-300 hover:text-white underline cursor-pointer"
                >
                  All Pathways
                </button>
              )}
              {onClearActiveBranch && (
                <button
                  onClick={onClearActiveBranch}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/20 cursor-pointer transition-colors"
                >
                  Clear Fork
                </button>
              )}
            </div>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto my-auto text-center py-10 px-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">
              Conversational Persona & Roleplay Simulator
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              Chat naturally to let the engine observe your communication style, tone, reasoning, and
              decision-making heuristics. Or launch high-stakes roleplays across healthcare, workplace
              conflict, neurodiversity, and family dynamics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <button
                onClick={onOpenScenarios}
                className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs mb-1 group-hover:text-amber-700">
                  <Theater className="w-4 h-4 text-amber-600" />
                  <span>Interactive Scenario Lab</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Practice SPIKES medical disclosures, PIP confrontations, and boundary setting.
                </p>
              </button>

              <button
                onClick={onOpenVoiceSession}
                className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs mb-1 group-hover:text-amber-700">
                  <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Real-Time Voice (gemini-3.8-live)</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Speak naturally through your microphone with real-time audio and interruption support.
                </p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    {activeScenario ? (
                      renderCategoryIcon(activeScenario.category, 'w-4 h-4 text-amber-300')
                    ) : message.scenarioId ? (
                      <Theater className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Brain className="w-4 h-4 text-amber-300" />
                    )}
                  </div>
                )}

                <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender metadata & Model badge */}
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1 px-1 flex-wrap">
                    <span className="font-semibold text-stone-700">
                      {isUser
                        ? 'You'
                        : activeScenario
                        ? activeScenario.aiRole.split('—')[0].trim()
                        : 'Persona & Social Coach'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.modelUsed && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200/80 text-stone-700 font-mono">
                        {message.modelUsed}
                      </span>
                    )}
                    {message.isVoiceTurn && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-amber-600" />
                        Voice Turn
                      </span>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-stone-900 text-white rounded-tr-xs'
                        : 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="markdown-body space-y-2 prose prose-sm max-w-none prose-stone">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}

                    {/* Google Search Grounding Sources Cards if available */}
                    {message.groundingSources && message.groundingSources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 mb-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>Grounded with Google Search data:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.groundingSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200/70 text-blue-900 text-[11px] font-medium transition-colors"
                            >
                              <span className="truncate max-w-[200px]">{source.title || source.uri}</span>
                              <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real-time Mentor Feedback on Communication Techniques */}
                    {!isUser && message.mentorFeedback && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 text-left">
                        <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-stone-50 border border-emerald-200/90 rounded-xl p-3 shadow-2xs">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                              <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>Real-Time Communication Feedback</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {message.mentorFeedback.frameworkUsed && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                                  {message.mentorFeedback.frameworkUsed}
                                </span>
                              )}
                              {message.mentorFeedback.toneRating && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    message.mentorFeedback.toneRating === 'Excellent'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : message.mentorFeedback.toneRating === 'Effective'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : message.mentorFeedback.toneRating === 'Constructive'
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : 'bg-rose-100 text-rose-900 border-rose-300'
                                  }`}
                                >
                                  Tone: {message.mentorFeedback.toneRating}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Technique Observed */}
                          {message.mentorFeedback.techniqueObserved && (
                            <div className="text-xs text-stone-700 mb-2 flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-semibold text-emerald-950 text-[11px]">Technique Observed:</span>
                              <span className="font-medium text-stone-800 bg-white px-2 py-0.5 rounded border border-emerald-100 text-xs shadow-2xs">
                                {message.mentorFeedback.techniqueObserved}
                              </span>
                            </div>
                          )}

                          {/* Coaching Insight */}
                          <div className="text-xs text-stone-700 leading-relaxed bg-white/90 rounded-lg p-2.5 border border-emerald-100/90 mb-2">
                            <span className="font-semibold text-emerald-900 block mb-0.5 text-[11px]">
                              Constructive Coaching:
                            </span>
                            <p className="text-stone-700">{message.mentorFeedback.coachingInsight}</p>
                          </div>

                          {/* Suggested Alternative Phrasing */}
                          {message.mentorFeedback.suggestedAlternative && (
                            <div className="bg-white rounded-lg p-2.5 border border-emerald-200 text-xs shadow-2xs">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-bold text-emerald-900 flex items-center gap-1 text-[11px]">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                  Recommended Alternative Phrasing
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleCopyPhrasing(message.id, message.mentorFeedback!.suggestedAlternative!)}
                                    className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer transition-colors"
                                    title="Copy phrasing to clipboard"
                                  >
                                    {copiedId === message.id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleUseAlternativePhrasing(message.mentorFeedback!.suggestedAlternative!)}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                    title="Paste into input box to test or adapt this phrasing"
                                  >
                                    <span>Try this phrasing</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-stone-800 font-serif italic text-xs leading-relaxed pl-2.5 border-l-2 border-emerald-500">
                                "{message.mentorFeedback.suggestedAlternative}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading typing indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 mt-1">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-stone-200 p-3.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-stone-500 ml-2">
                {useSearchGrounding ? 'Grounding with Google Search...' : 'Formulating response...'}
              </span>
            </div>
          </div>
        )}

        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-amber-900 font-medium">
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <span>Transcribing audio with gemini-3.5-transcribe...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* CYOA Decision Crossroads Options if current turn matches a decision node */}
          {currentDecisionNode && !isRecording && (
            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 shadow-2xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <Split className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Choose Your Own Adventure Crossroads: {currentDecisionNode.nodeTitle}</span>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold">
                  Select a branch to test divergent AI responses:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentDecisionNode.branches.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => {
                      setInputText(b.userResponseText);
                      if (onSelectBranchDecision) {
                        onSelectBranchDecision(b, currentDecisionNode.nodeTitle);
                      }
                      textareaRef.current?.focus();
                    }}
                    className="p-2.5 text-left bg-white hover:bg-amber-100/50 hover:border-amber-400 border border-amber-200/90 rounded-lg transition-all group cursor-pointer shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 mb-1">
                        <span className="truncate group-hover:text-amber-900">{b.label}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 italic mb-1 leading-snug">
                        "{b.userResponseText}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-stone-500 pt-1.5 border-t border-stone-100 mt-1">
                      <span className="truncate max-w-[120px]">Tone: <span className="font-semibold text-amber-800">{b.aiDialogueTone}</span></span>
                      <span className="font-bold text-amber-700 group-hover:underline flex items-center gap-0.5 shrink-0">
                        Use Branch →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Context / Suggestion Chips when in conversation */}
          {messages.length > 0 && !isRecording && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-medium text-stone-500">
              <span className="shrink-0 text-stone-400">Quick prompts:</span>
              <button
                onClick={() =>
                  onSendMessage(
                    'How was my tone and empathy in that last response? Did I sound defensive or grounded?'
                  )
                }
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap cursor-pointer"
              >
                Evaluate my tone & empathy
              </button>
              <button
                onClick={() =>
                  onSendMessage(
                    'Give me constructive coaching: what would be an even better, more de-escalating way to phrase that?'
                  )
                }
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap cursor-pointer"
              >
                Coaching: alternative phrasing
              </button>
              <button
                onClick={() =>
                  onSendMessage(
                    'Escalate or introduce an emotional curveball into this scenario. Push my boundaries.'
                  )
                }
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap cursor-pointer"
              >
                Add realistic curveball
              </button>
              <button
                onClick={onOpenVoiceSession}
                className="px-2.5 py-1 rounded-full bg-stone-900 text-amber-300 whitespace-nowrap cursor-pointer font-semibold flex items-center gap-1"
              >
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                Live Voice Mode
              </button>
            </div>
          )}

          {/* Audio Recording Bar if currently recording */}
          {isRecording && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                <div className="text-xs font-semibold text-red-900">
                  Recording microphone audio... ({recordingSeconds}s)
                </div>
                <span className="text-[11px] text-red-700 hidden sm:inline">
                  Audio will transcribe via gemini-3.5-transcribe
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStopRecording}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Done & Transcribe
                </button>
              </div>
            </div>
          )}

          {/* Transcription Notice Banner */}
          {transcriptionNotice && !isRecording && (
            <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{transcriptionNotice}</span>
            </div>
          )}

          {/* Textarea Input + Audio Mic button */}
          <div className="flex items-end gap-2 bg-stone-50 border border-stone-300/80 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-stone-800 focus-within:border-stone-800 transition-all shadow-xs">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isRecording}
              rows={1}
              placeholder={
                activeScenario
                  ? `Respond to ${activeScenario.aiRole.split('—')[0].trim()}... (Enter to send or click Mic)`
                  : 'Practice social interactions, peer de-escalation, customer support, or dilemmas... (Enter to send)'
              }
              className="flex-1 max-h-40 bg-transparent text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none resize-none px-2 py-1 leading-relaxed disabled:opacity-50"
            />

            {/* Audio Recording Trigger Button (gemini-3.5-transcribe) */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isLoading || isTranscribing}
              className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-amber-700'
              }`}
              title={
                isRecording
                  ? 'Stop recording and transcribe'
                  : 'Input audio with microphone (transcribe via gemini-3.5-transcribe)'
              }
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isLoading || isRecording || !inputText.trim()}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span>Shift + Enter for new line</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-500">
                <Mic className="w-3 h-3 text-amber-600" />
                Mic uses gemini-3.5-transcribe
              </span>
              {useSearchGrounding && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Google Search Active
                  </span>
                </>
              )}
            </div>
            <span>
              Cognitive & Social DNA: {profile.completenessScore}% Mapped ({profile.detailedTraits.length}{' '}
              traits)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
