import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Copy,
  Check,
  Download,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  User,
  Star,
  FileText,
  Trash2,
  Search,
  ShieldAlert,
  GitFork,
  Split,
  Compass,
  Wand2,
  Plus,
  ArrowRight,
  History,
  Tag
} from 'lucide-react';
import {
  ScenarioSessionTranscript,
  ScenarioDifficulty,
  DecisionNode,
  DecisionBranch,
  ChatMessage
} from '../types';

interface TranscriptReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcripts: ScenarioSessionTranscript[];
  initialSelectedId?: string | null;
  onRelaunchScenario?: (scenarioId: string) => void;
  onDeleteTranscript?: (transcriptId: string) => void;
  onLaunchBranchSimulation?: (
    scenarioId: string,
    forkTurnIndex: number,
    branch: DecisionBranch,
    priorMessages: ChatMessage[],
    nodeTitle: string
  ) => void;
  onUpdateTranscriptDecisionNodes?: (transcriptId: string, nodes: DecisionNode[]) => void;
}

export const TranscriptReplayModal: React.FC<TranscriptReplayModalProps> = ({
  isOpen,
  onClose,
  transcripts,
  initialSelectedId,
  onRelaunchScenario,
  onDeleteTranscript,
  onLaunchBranchSimulation,
  onUpdateTranscriptDecisionNodes
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'step_replay' | 'full_transcript' | 'decision_pathways'>('step_replay');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // CYOA Decision Nodes generation & editing state
  const [isGeneratingNodes, setIsGeneratingNodes] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState<boolean>(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Custom node form state
  const [newNodeTitle, setNewNodeTitle] = useState<string>('Critical Boundary Fork');
  const [newNodeTurnIndex, setNewNodeTurnIndex] = useState<number>(1);
  const [newNodeContext, setNewNodeContext] = useState<string>('');
  const [branchA_label, setBranchA_label] = useState<string>("Branch A: Firm 'Grey Rock' Neutrality");
  const [branchA_text, setBranchA_text] = useState<string>("I'm putting the phone down on the counter. We can talk once voices are calm.");
  const [branchA_consequence, setBranchA_consequence] = useState<string>("Disarms immediate baiting; counterpart has no explosive reaction to feed on.");
  const [branchA_tone, setBranchA_tone] = useState<string>("Suspicious, frustrated by lack of drama, grudgingly retreats.");
  const [branchB_label, setBranchB_label] = useState<string>("Branch B: Direct Counter-Confrontation");
  const [branchB_text, setBranchB_text] = useState<string>("Why are you treating me like a criminal?! You're the one obsessed with control!");
  const [branchB_consequence, setBranchB_consequence] = useState<string>("Pours gasoline on the fire; counterpart interprets pushback as guilt and screams louder.");
  const [branchB_tone, setBranchB_tone] = useState<string>("Furious, volatile, threatening ultimatums.");
  const [branchC_label, setBranchC_label] = useState<string>("Branch C: Appeasing Capitulation");
  const [branchC_text, setBranchC_text] = useState<string>("I'm sorry! Here is my phone and password, please believe I wasn't doing anything.");
  const [branchC_consequence, setBranchC_consequence] = useState<string>("Enables coercive control; counterpart moves goalposts to demand email passwords.");
  const [branchC_tone, setBranchC_tone] = useState<string>("Smug, entitled, invasive, tightening psychological control.");

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (transcripts.length > 0) {
      if (initialSelectedId && transcripts.some((t) => t.id === initialSelectedId)) {
        setSelectedId(initialSelectedId);
      } else if (!selectedId || !transcripts.some((t) => t.id === selectedId)) {
        setSelectedId(transcripts[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [transcripts, initialSelectedId]);

  const activeTranscript = transcripts.find((t) => t.id === selectedId) || transcripts[0] || null;
  const messages = activeTranscript?.messages || [];
  const totalSteps = messages.length;
  const decisionNodes = activeTranscript?.decisionNodes || [];

  // Reset step whenever selected transcript changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedId]);

  // Handle auto-play loop
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(800, Math.round(2400 / playbackSpeed));
      playbackTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, totalSteps]);

  // Auto scroll to latest active message in step replay
  useEffect(() => {
    if (viewMode === 'step_replay' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStep, viewMode]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((c) => c + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentStep(totalSteps - 1);
  };

  const formatDifficultyBadge = (difficulty?: ScenarioDifficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Beginner
          </span>
        );
      case 'Intermediate':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Intermediate
          </span>
        );
      case 'Advanced':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Advanced
          </span>
        );
      default:
        return null;
    }
  };

  const copyTranscriptText = () => {
    if (!activeTranscript) return;
    const header = `# Scenario Transcript Replay: ${activeTranscript.scenarioTitle}\n` +
      `Category: ${activeTranscript.scenarioCategory} | Difficulty: ${activeTranscript.scenarioDifficulty || 'Intermediate'}\n` +
      `AI Role: ${activeTranscript.scenarioAiRole}\n` +
      `User Role: ${activeTranscript.scenarioUserRole}\n` +
      `Date: ${new Date(activeTranscript.completedAt).toLocaleString()}\n\n` +
      `---\n\n`;

    const body = activeTranscript.messages
      .map((m, idx) => {
        const sender = m.role === 'user' ? `You (${activeTranscript.scenarioUserRole})` : activeTranscript.scenarioAiRole;
        return `### Turn ${idx + 1}: ${sender}\n${m.content}\n`;
      })
      .join('\n');

    let evalSection = '';
    if (activeTranscript.evaluation) {
      evalSection = `\n---\n### Post-Scenario Realism & Performance Evaluation\n` +
        `- Realism Rating: ${activeTranscript.evaluation.realismRating}/5\n` +
        `- Role Performance: ${activeTranscript.evaluation.rolePerformanceRating}/5\n` +
        `- Challenge Calibration: ${activeTranscript.evaluation.challengeRating}/5\n` +
        `- Empathy & Tension Testing: ${activeTranscript.evaluation.empathyTestingRating}/5\n\n` +
        `**What Worked Well:**\n${activeTranscript.evaluation.whatWorkedWell || 'N/A'}\n\n` +
        `**What Felt Robotic or Artificial:**\n${activeTranscript.evaluation.whatFeltRoboticOrArtificial || 'N/A'}\n\n` +
        `**Suggestions For Improvement:**\n${activeTranscript.evaluation.suggestionsForImprovement || 'N/A'}\n`;
    }

    navigator.clipboard.writeText(header + body + evalSection).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadTranscriptFile = () => {
    if (!activeTranscript) return;
    const header = `# Scenario Transcript Replay: ${activeTranscript.scenarioTitle}\n` +
      `Category: ${activeTranscript.scenarioCategory} | Difficulty: ${activeTranscript.scenarioDifficulty || 'Intermediate'}\n` +
      `AI Role: ${activeTranscript.scenarioAiRole}\n` +
      `User Role: ${activeTranscript.scenarioUserRole}\n` +
      `Date: ${new Date(activeTranscript.completedAt).toLocaleString()}\n\n` +
      `---\n\n`;

    const body = activeTranscript.messages
      .map((m, idx) => {
        const sender = m.role === 'user' ? `You (${activeTranscript.scenarioUserRole})` : activeTranscript.scenarioAiRole;
        return `### Turn ${idx + 1}: ${sender}\n${m.content}\n`;
      })
      .join('\n');

    const content = header + body;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${activeTranscript.scenarioTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Auto-generate CYOA decision nodes using Gemini
  const handleAutoGenerateDecisionNodes = async () => {
    if (!activeTranscript || activeTranscript.messages.length < 2) return;
    setIsGeneratingNodes(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/transcripts/generate-decision-nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptTitle: activeTranscript.scenarioTitle,
          scenarioDescription: activeTranscript.learningFocus || activeTranscript.objective,
          messages: activeTranscript.messages
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to auto-generate CYOA decision nodes');
      }

      if (Array.isArray(data.decisionNodes) && data.decisionNodes.length > 0) {
        if (onUpdateTranscriptDecisionNodes) {
          onUpdateTranscriptDecisionNodes(activeTranscript.id, data.decisionNodes);
        }
      } else {
        setGenerateError('No clear decision crossroads detected in this transcript length.');
      }
    } catch (err: any) {
      console.error('Error generating decision nodes:', err);
      setGenerateError(err.message || 'Failed to generate decision forks.');
    } finally {
      setIsGeneratingNodes(false);
    }
  };

  // Add custom user-defined decision node
  const handleSaveCustomNode = () => {
    if (!activeTranscript) return;
    const customNode: DecisionNode = {
      id: `node-${Date.now()}`,
      turnIndex: newNodeTurnIndex,
      nodeTitle: newNodeTitle.trim() || `Turn ${newNodeTurnIndex} Crossroads`,
      situationContext: newNodeContext.trim() || messages[Math.max(0, newNodeTurnIndex - 1)]?.content || 'Pivotal conversation crossroads',
      branches: [
        {
          id: `branch-a-${Date.now()}`,
          label: branchA_label,
          userResponseText: branchA_text,
          consequenceSummary: branchA_consequence,
          aiDialogueTone: branchA_tone,
          projectedOutcome: 'De-escalates initial conflict',
          tags: ['Custom', 'Branch A']
        },
        {
          id: `branch-b-${Date.now()}`,
          label: branchB_label,
          userResponseText: branchB_text,
          consequenceSummary: branchB_consequence,
          aiDialogueTone: branchB_tone,
          projectedOutcome: 'Tests direct assertiveness / high friction',
          tags: ['Custom', 'Branch B']
        },
        {
          id: `branch-c-${Date.now()}`,
          label: branchC_label,
          userResponseText: branchC_text,
          consequenceSummary: branchC_consequence,
          aiDialogueTone: branchC_tone,
          projectedOutcome: 'Tests appeasement trajectory',
          tags: ['Custom', 'Branch C']
        }
      ]
    };

    const currentNodes = activeTranscript.decisionNodes || [];
    const updated = [...currentNodes, customNode];
    if (onUpdateTranscriptDecisionNodes) {
      onUpdateTranscriptDecisionNodes(activeTranscript.id, updated);
    }
    setIsAddNodeModalOpen(false);
  };

  // Find decision node matching a message index
  const getDecisionNodeForTurn = (turnIdx: number): DecisionNode | undefined => {
    return decisionNodes.find((n) => n.turnIndex === turnIdx || n.turnIndex === turnIdx + 1);
  };

  const visibleMessages =
    viewMode === 'step_replay'
      ? messages.slice(0, currentStep + 1)
      : messages.filter((m) =>
          searchQuery
            ? m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.role.toLowerCase().includes(searchQuery.toLowerCase())
            : true
        );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl h-[94vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 font-bold shadow-xs">
              <Compass className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Scenario Transcript Replay & CYOA Decision Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                  {transcripts.length} Saved {transcripts.length === 1 ? 'Session' : 'Sessions'}
                </span>
                {decisionNodes.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Split className="w-3 h-3 text-emerald-400" />
                    {decisionNodes.length} Decision {decisionNodes.length === 1 ? 'Node' : 'Nodes'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300">
                Step-by-step playback, Choose Your Own Adventure decision branches, and divergent AI dialogue simulation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTranscript && (
              <>
                <button
                  onClick={copyTranscriptText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
                  title="Copy formatted markdown transcript"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={downloadTranscriptFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
                  title="Download transcript markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        {transcripts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800 mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No Scenario Transcripts Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4 leading-relaxed">
              Complete any roleplay scenario in the Scenario Lab and conclude the session to generate an interactive step-by-step transcript replay with branching CYOA decision forks.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Explore Scenarios in Lab
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: Session Selector */}
            <div className="w-full md:w-72 lg:w-80 border-r border-stone-200 bg-stone-50/70 flex flex-col shrink-0">
              <div className="p-3 border-b border-stone-200 bg-white flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" /> Completed Sessions
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  {transcripts.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {transcripts.map((t) => {
                  const isSelected = t.id === selectedId;
                  const dateStr = new Date(t.completedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  });
                  const timeStr = new Date(t.completedAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const hasCYOA = t.decisionNodes && t.decisionNodes.length > 0;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedId(t.id);
                        setHighlightedNodeId(null);
                      }}
                      className={`p-3.5 cursor-pointer transition-all flex flex-col gap-1.5 group ${
                        isSelected
                          ? 'bg-amber-50/90 border-l-4 border-amber-600 text-stone-900 shadow-2xs'
                          : 'hover:bg-stone-100/70 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                          {t.scenarioCategory.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          {t.isEmergencyExit && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-600" /> Safe Snapshot
                            </span>
                          )}
                          {formatDifficultyBadge(t.scenarioDifficulty)}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold line-clamp-2 leading-snug group-hover:text-amber-900">
                        {t.scenarioTitle}
                      </h4>

                      {/* CYOA Branch & Fork Indicators */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {hasCYOA && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Split className="w-2.5 h-2.5 text-emerald-600" />
                            {t.decisionNodes!.length} CYOA Forks
                          </span>
                        )}
                        {t.forkedFromBranchLabel && (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-amber-100/80 text-amber-900 border border-amber-200 truncate max-w-[170px]" title={t.forkedFromBranchLabel}>
                            ↳ Fork: {t.forkedFromBranchLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr} • {timeStr}
                        </span>
                        <span className="font-semibold text-stone-600">
                          {t.messages.length} {t.messages.length === 1 ? 'turn' : 'turns'}
                        </span>
                      </div>

                      {onDeleteTranscript && (
                        <div className="flex justify-end pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this transcript permanently?')) {
                                onDeleteTranscript(t.id);
                              }
                            }}
                            className="text-[10px] text-stone-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Panel */}
            {activeTranscript ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Active Scenario Meta Strip */}
                <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        {activeTranscript.scenarioTitle}
                      </h3>
                      {formatDifficultyBadge(activeTranscript.scenarioDifficulty)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-stone-600" />
                        <span className="font-semibold text-stone-700">AI:</span> {activeTranscript.scenarioAiRole.split('—')[0].trim()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-600" />
                        <span className="font-semibold text-stone-700">You:</span> {activeTranscript.scenarioUserRole}
                      </span>
                      {activeTranscript.evaluation && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Realism: {activeTranscript.evaluation.realismRating}/5
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {onRelaunchScenario && (
                    <button
                      onClick={() => onRelaunchScenario(activeTranscript.scenarioId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors"
                      title="Replay this scenario from scratch with different choices"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Attempt Full Scenario</span>
                    </button>
                  )}
                </div>

                {/* Sub-toolbar: Replay Mode & Controls */}
                <div className="px-4 py-2.5 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('step_replay')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        viewMode === 'step_replay'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Interactive Replay
                    </button>
                    <button
                      onClick={() => setViewMode('full_transcript')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        viewMode === 'full_transcript'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Full Transcript ({totalSteps} turns)
                    </button>
                    <button
                      onClick={() => setViewMode('decision_pathways')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'decision_pathways'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span>CYOA Decision Pathways</span>
                      {decisionNodes.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          viewMode === 'decision_pathways' ? 'bg-amber-800 text-amber-100' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {decisionNodes.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Context controls based on viewMode */}
                  {viewMode === 'step_replay' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleResetReplay}
                        disabled={currentStep === 0}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Jump to beginning"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Previous turn"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors ${
                          isPlaying
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" /> Play
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleNextStep}
                        disabled={currentStep >= totalSteps - 1}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Next turn"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1 text-[11px] text-stone-500 ml-1">
                        <span className="font-semibold">Speed:</span>
                        {[1, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                              playbackSpeed === spd
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      <span className="text-xs font-bold text-stone-700 ml-2">
                        Turn {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
                      </span>
                    </div>
                  )}

                  {viewMode === 'full_transcript' && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search transcript..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-48"
                      />
                    </div>
                  )}

                  {viewMode === 'decision_pathways' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAutoGenerateDecisionNodes}
                        disabled={isGeneratingNodes}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Extract or design CYOA decision nodes for this transcript using Gemini"
                      >
                        <Wand2 className={`w-3.5 h-3.5 text-amber-600 ${isGeneratingNodes ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingNodes ? 'Analyzing Branches...' : 'Auto-Generate Forks with AI'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setNewNodeTurnIndex(Math.min(1, totalSteps > 0 ? 1 : 0));
                          setIsAddNodeModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom Fork</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Scrubber Progress Bar in Replay Mode */}
                {viewMode === 'step_replay' && totalSteps > 1 && (
                  <div className="px-4 py-1.5 bg-stone-50 border-b border-stone-200 flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={totalSteps - 1}
                      value={currentStep}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentStep(parseInt(e.target.value, 10));
                      }}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <button
                      onClick={handleJumpToEnd}
                      className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 shrink-0 cursor-pointer"
                    >
                      Jump to End
                    </button>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 1. VIEW MODE: CHOOSE YOUR OWN ADVENTURE DECISION PATHWAYS */}
                {/* ============================================================== */}
                {viewMode === 'decision_pathways' && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 space-y-6">
                    {/* CYOA Header & Guidance */}
                    <div className="bg-gradient-to-r from-amber-900/90 to-stone-900 text-white rounded-2xl p-5 shadow-sm border border-amber-800/40">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950">
                              Choose Your Own Adventure
                            </span>
                            <span className="text-xs text-amber-200 font-semibold">
                              Divergent Dialogue Simulation Engine
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Interactive Decision Crossroads & Branching Pathways
                          </h3>
                          <p className="text-xs text-stone-300 leading-relaxed">
                            Each decision node represents a critical psychological crossroads. Selecting alternative response strategies alters the AI counterpart’s dialogue tone, emotional reactivity, and trajectory in future simulation attempts.
                          </p>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-xs text-stone-200 space-y-1 shrink-0">
                          <div className="font-bold text-amber-300 flex items-center gap-1.5">
                            <GitFork className="w-3.5 h-3.5" /> Simulation Branching:
                          </div>
                          <div>1. Review the dilemma & historical choice</div>
                          <div>2. Compare alternative response strategies</div>
                          <div>3. Click <span className="font-bold text-white">"Simulate This Branch"</span> to launch</div>
                        </div>
                      </div>

                      {generateError && (
                        <div className="mt-3 text-xs bg-rose-500/20 border border-rose-400/40 text-rose-200 p-2 rounded-lg">
                          {generateError}
                        </div>
                      )}
                    </div>

                    {/* Decision Nodes List */}
                    {decisionNodes.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
                          <Split className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          No Decision Nodes Defined for this Transcript Yet
                        </h4>
                        <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                          Automatically analyze this dialogue session with Gemini to detect pivotal turning points, or define custom Choose Your Own Adventure branches to simulate divergent reactions.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={handleAutoGenerateDecisionNodes}
                            disabled={isGeneratingNodes}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-colors"
                          >
                            <Wand2 className={`w-4 h-4 ${isGeneratingNodes ? 'animate-spin' : ''}`} />
                            <span>{isGeneratingNodes ? 'Generating Branches...' : 'Auto-Generate Crossroads with AI'}</span>
                          </button>
                          <button
                            onClick={() => setIsAddNodeModalOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer border border-stone-200 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-stone-600" />
                            <span>Create Custom Fork</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      decisionNodes.map((node, nodeIdx) => {
                        const isHighlighted = highlightedNodeId === node.id;
                        const turnMsg = messages[node.turnIndex];

                        return (
                          <div
                            key={node.id || nodeIdx}
                            id={`node-${node.id}`}
                            className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                              isHighlighted ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-stone-200'
                            }`}
                          >
                            {/* Node Header */}
                            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-stone-900 text-amber-300">
                                    Crossroads #{nodeIdx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-stone-600">
                                    Turn {node.turnIndex + 1}
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-stone-900">
                                    {node.nodeTitle}
                                  </h4>
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed italic bg-white/80 p-2 rounded-lg border border-stone-200/80">
                                  <span className="font-bold text-stone-700 not-italic">Counterpart Setup: </span>
                                  "{node.situationContext}"
                                </p>
                              </div>

                              {turnMsg && (
                                <div className="text-xs bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 max-w-xs shrink-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                                    Your Choice in this Run:
                                  </span>
                                  <p className="text-stone-800 text-[11px] line-clamp-3 leading-snug">
                                    "{turnMsg.content}"
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Branches Grid */}
                            <div className="p-4 sm:p-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Split className="w-3.5 h-3.5 text-amber-600" /> Choose Your Own Adventure Branches (3 Divergent Paths)
                                </span>
                                <span className="text-[11px] text-stone-400">
                                  Select a branch to test alternative AI reactions
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {node.branches.map((branch, bIdx) => {
                                  // Determine branch card accent
                                  const isSelectedInRun = node.chosenBranchId === branch.id;
                                  const cardBg =
                                    bIdx === 0
                                      ? 'border-emerald-200 bg-emerald-50/30'
                                      : bIdx === 1
                                      ? 'border-rose-200 bg-rose-50/30'
                                      : 'border-blue-200 bg-blue-50/30';

                                  const badgeColor =
                                    bIdx === 0
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : bIdx === 1
                                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                                      : 'bg-blue-100 text-blue-900 border-blue-300';

                                  return (
                                    <div
                                      key={branch.id || bIdx}
                                      className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-md ${cardBg}`}
                                    >
                                      <div className="space-y-3">
                                        {/* Branch Title & Status */}
                                        <div className="flex items-start justify-between gap-2">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                            {branch.label}
                                          </span>
                                          {isSelectedInRun && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                                              Chosen in Run
                                            </span>
                                          )}
                                        </div>

                                        {/* Spoken Phrasing / Strategy */}
                                        <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs space-y-1">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                            Spoken User Phrasing:
                                          </span>
                                          <p className="text-xs text-stone-900 font-medium leading-relaxed italic">
                                            "{branch.userResponseText}"
                                          </p>
                                        </div>

                                        {/* Consequence & AI Dialogue Tone */}
                                        <div className="space-y-1.5 text-xs">
                                          <div>
                                            <span className="font-bold text-stone-700">AI Dialogue Tone: </span>
                                            <span className="font-semibold text-amber-800">
                                              {branch.aiDialogueTone}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-bold text-stone-700">Consequence: </span>
                                            <span className="text-stone-600 leading-snug">
                                              {branch.consequenceSummary}
                                            </span>
                                          </div>
                                          {branch.branchPathTranscriptSnippet && (
                                            <div className="bg-stone-100/80 p-2 rounded border border-stone-200/80 text-[11px] text-stone-700">
                                              <span className="font-bold text-stone-500 block text-[9px] uppercase">
                                                Divergent AI Opening:
                                              </span>
                                              "{branch.branchPathTranscriptSnippet}"
                                            </div>
                                          )}
                                        </div>

                                        {/* Tags */}
                                        {branch.tags && branch.tags.length > 0 && (
                                          <div className="flex items-center gap-1 flex-wrap pt-1">
                                            {branch.tags.map((tag, tIdx) => (
                                              <span
                                                key={tIdx}
                                                className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white text-stone-600 border border-stone-200 flex items-center gap-0.5"
                                              >
                                                <Tag className="w-2.5 h-2.5 text-stone-400" /> {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Branch Action Button */}
                                      <div className="pt-4 border-t border-stone-200/60 mt-3">
                                        <button
                                          onClick={() => {
                                            if (onLaunchBranchSimulation) {
                                              const priorMessages = messages.slice(0, node.turnIndex);
                                              onLaunchBranchSimulation(
                                                activeTranscript.scenarioId,
                                                node.turnIndex,
                                                branch,
                                                priorMessages,
                                                node.nodeTitle
                                              );
                                            }
                                          }}
                                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group"
                                        >
                                          <GitFork className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                                          <span>Simulate This Branch in New Attempt</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ============================================================== */}
                {/* 2. VIEW MODES: INTERACTIVE STEP REPLAY & FULL TRANSCRIPT */}
                {/* ============================================================== */}
                {viewMode !== 'decision_pathways' && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
                    {activeTranscript.isEmergencyExit && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950 flex items-start gap-3 shadow-2xs">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-rose-900">
                              Preserved During Emergency Safety Exit
                            </span>
                            <span className="text-[10px] bg-rose-200/80 text-rose-900 font-bold px-1.5 py-0.2 rounded">
                              Discreet Reflection Mode
                            </span>
                          </div>
                          <p className="text-rose-800 text-xs mt-1 leading-relaxed">
                            This session snapshot was instantly captured and preserved for your personal reflection when you triggered the Emergency Exit.
                            Review your choices, advocate prompts, or de-escalation responses in this safe space at your own pace.
                          </p>
                        </div>
                      </div>
                    )}

                    {visibleMessages.length === 0 ? (
                      <div className="text-center py-12 text-stone-400 text-xs">
                        No matching turns found for "{searchQuery}".
                      </div>
                    ) : (
                      visibleMessages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        const isCurrentStep = viewMode === 'step_replay' && idx === currentStep;
                        const matchingNode = isUser ? getDecisionNodeForTurn(idx) : undefined;

                        return (
                          <div key={msg.id || idx} className="space-y-2">
                            <div
                              className={`flex gap-3 max-w-3xl transition-all ${
                                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                              } ${isCurrentStep ? 'scale-[1.01]' : ''}`}
                            >
                              {/* Avatar */}
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                  isUser
                                    ? 'bg-amber-600 text-white font-bold text-xs'
                                    : 'bg-stone-900 text-amber-300'
                                }`}
                              >
                                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </div>

                              {/* Message Bubble */}
                              <div
                                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}
                              >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                  <span className="text-[11px] font-bold text-stone-700">
                                    {isUser
                                      ? `You (${activeTranscript.scenarioUserRole})`
                                      : `${activeTranscript.scenarioAiRole.split('—')[0].trim()}`}
                                  </span>
                                  <span className="text-[10px] text-stone-400">
                                    Turn {idx + 1}
                                  </span>
                                  {isUser && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                      Decision Point
                                    </span>
                                  )}
                                  {matchingNode && (
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                      <Split className="w-2.5 h-2.5 text-emerald-600" />
                                      CYOA Fork
                                    </span>
                                  )}
                                </div>

                                <div
                                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed border shadow-2xs whitespace-pre-wrap ${
                                    isUser
                                      ? 'bg-amber-500/10 text-stone-900 border-amber-200/90 rounded-tr-xs'
                                      : 'bg-white text-stone-800 border-stone-200 rounded-tl-xs'
                                  } ${isCurrentStep ? 'ring-2 ring-amber-500/40 border-amber-400' : ''}`}
                                >
                                  {msg.content}
                                </div>

                                <span className="text-[10px] text-stone-400 mt-1 px-1">
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Inline CYOA Crossroads preview banner if this turn has a decision node */}
                            {matchingNode && (
                              <div className="max-w-3xl ml-auto bg-amber-50/90 border border-amber-300 rounded-xl p-3 shadow-2xs text-xs space-y-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                                    <Split className="w-4 h-4 text-amber-600" />
                                    <span>Choose Your Own Adventure Crossroads: {matchingNode.nodeTitle}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setViewMode('decision_pathways');
                                      setHighlightedNodeId(matchingNode.id);
                                    }}
                                    className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
                                  >
                                    Compare 3 Divergent Paths <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                  {matchingNode.branches.map((b, bIdx) => (
                                    <div
                                      key={b.id || bIdx}
                                      className="bg-white/90 p-2 rounded-lg border border-amber-200 text-[11px] flex flex-col justify-between"
                                    >
                                      <div>
                                        <span className="font-bold text-stone-800 block text-[10px] truncate">
                                          {b.label}
                                        </span>
                                        <p className="text-stone-600 text-[10px] line-clamp-2 mt-0.5">
                                          Tone: <span className="font-semibold text-amber-800">{b.aiDialogueTone}</span>
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          if (onLaunchBranchSimulation) {
                                            const prior = messages.slice(0, idx);
                                            onLaunchBranchSimulation(
                                              activeTranscript.scenarioId,
                                              idx,
                                              b,
                                              prior,
                                              matchingNode.nodeTitle
                                            );
                                          }
                                        }}
                                        className="mt-2 text-[10px] font-bold px-2 py-1 rounded bg-stone-900 text-white hover:bg-stone-800 text-center cursor-pointer"
                                      >
                                        Simulate Branch
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Analytical Footnote if Evaluated */}
                {activeTranscript.evaluation && viewMode !== 'decision_pathways' && (
                  <div className="p-3.5 bg-amber-50/60 border-t border-amber-200/60 text-xs text-stone-700 shrink-0">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Post-Scenario Realism Review:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {activeTranscript.evaluation.whatWorkedWell && (
                        <div>
                          <span className="font-semibold text-emerald-800">Effective: </span>
                          <span className="text-stone-600">{activeTranscript.evaluation.whatWorkedWell}</span>
                        </div>
                      )}
                      {activeTranscript.evaluation.whatFeltRoboticOrArtificial && (
                        <div>
                          <span className="font-semibold text-rose-800">Felt Artificial: </span>
                          <span className="text-stone-600">{activeTranscript.evaluation.whatFeltRoboticOrArtificial}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. MODAL: ADD CUSTOM CYOA DECISION NODE */}
      {/* ============================================================== */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Split className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Create Custom CYOA Decision Crossroads
                </h3>
              </div>
              <button
                onClick={() => setIsAddNodeModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Define a pivotal moment in this scenario where 3 distinct user strategies lead to radically divergent AI dialogue reactions in future simulation attempts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Decision Title
                </label>
                <input
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-stone-200 rounded-lg"
                  placeholder="e.g. Firm Boundary vs Appeasement"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Turn Index in Dialogue
                </label>
                <select
                  value={newNodeTurnIndex}
                  onChange={(e) => setNewNodeTurnIndex(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2 border border-stone-200 rounded-lg"
                >
                  {messages.map((m, idx) => (
                    <option key={idx} value={idx}>
                      Turn {idx + 1} ({m.role.toUpperCase()}): {m.content.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Context / AI Setup Prompt
              </label>
              <textarea
                value={newNodeContext}
                onChange={(e) => setNewNodeContext(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 border border-stone-200 rounded-lg"
                placeholder="What did the counterpart say or demand right before this choice?"
              />
            </div>

            {/* Branch A */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-emerald-900 uppercase">
                Branch A: High-Skill / Grounded Path
              </span>
              <input
                type="text"
                value={branchA_label}
                onChange={(e) => setBranchA_label(e.target.value)}
                className="w-full text-xs p-1.5 border border-stone-200 rounded bg-white"
                placeholder="Branch A Label"
              />
              <textarea
                value={branchA_text}
                onChange={(e) => setBranchA_text(e.target.value)}
                rows={2}
                className="w-full text-xs p-1.5 border border-stone-200 rounded bg-white"
                placeholder="User dialogue text spoken in simulation..."
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={branchA_tone}
                  onChange={(e) => setBranchA_tone(e.target.value)}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                  placeholder="AI Tone (e.g. Grudgingly disarmed)"
                />
                <input
                  type="text"
                  value={branchA_consequence}
                  onChange={(e) => setBranchA_consequence(e.target.value)}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                  placeholder="Consequence summary"
                />
              </div>
            </div>

            {/* Branch B */}
            <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-rose-900 uppercase">
                Branch B: High-Conflict / Direct Pushback Path
              </span>
              <input
                type="text"
                value={branchB_label}
                onChange={(e) => setBranchB_label(e.target.value)}
                className="w-full text-xs p-1.5 border border-stone-200 rounded bg-white"
                placeholder="Branch B Label"
              />
              <textarea
                value={branchB_text}
                onChange={(e) => setBranchB_text(e.target.value)}
                rows={2}
                className="w-full text-xs p-1.5 border border-stone-200 rounded bg-white"
                placeholder="User dialogue text spoken in simulation..."
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={branchB_tone}
                  onChange={(e) => setBranchB_tone(e.target.value)}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                  placeholder="AI Tone (e.g. Furious, volatile)"
                />
                <input
                  type="text"
                  value={branchB_consequence}
                  onChange={(e) => setBranchB_consequence(e.target.value)}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                  placeholder="Consequence summary"
                />
              </div>
            </div>

            {/* Branch C */}
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-blue-900 uppercase">
                Branch C: Appeasing / Passive Capitulation Path
              </span>
              <input
                type="text"
                value={branchC_label}
                onChange={(e) => setBranchC_label(e.target.value)}
                className="w-full text-xs p-1.5 border border-stone-200 rounded bg-white"
                placeholder="Branch C Label"
              />
              <textarea
                value={branchC_text}
                onChange={(e) => setBranchC_text(e.target.value)}
                rows={2}
                className="w-full text-xs p-1.5 border border-stone-200 rounded bg-white"
                placeholder="User dialogue text spoken in simulation..."
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={branchC_tone}
                  onChange={(e) => setBranchC_tone(e.target.value)}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                  placeholder="AI Tone (e.g. Smug, entitled)"
                />
                <input
                  type="text"
                  value={branchC_consequence}
                  onChange={(e) => setBranchC_consequence(e.target.value)}
                  className="p-1.5 border border-stone-200 rounded bg-white"
                  placeholder="Consequence summary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsAddNodeModalOpen(false)}
                className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomNode}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
              >
                Save Decision Crossroads
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
