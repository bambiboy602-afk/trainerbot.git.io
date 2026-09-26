import React, { useState, useEffect, useCallback } from 'react';
import {
  loadMessagesFromStorage,
  saveMessagesToStorage,
  loadProfileFromStorage,
  saveProfileToStorage,
  loadActiveScenario,
  saveActiveScenario,
  loadCustomScenarios,
  saveCustomScenarios,
  loadScenarioEvaluations,
  saveScenarioEvaluation,
  loadScenarioTranscripts,
  saveScenarioTranscript,
  deleteScenarioTranscript,
  clearAllLocalData
} from './lib/storage';
import {
  ChatMessage,
  Scenario,
  PersonaProfile,
  ScenarioEvaluation,
  ScenarioSessionTranscript,
  GeminiChatModelMode,
  ChatbotRolePreset,
  DecisionBranch,
  DecisionBranchContext,
  DecisionNode
} from './types';
import { INITIAL_EMPTY_PROFILE, DEFAULT_SCENARIOS } from './data/defaultScenarios';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ScenarioPickerModal } from './components/ScenarioPickerModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { BotExportModal } from './components/BotExportModal';
import { PostScenarioEvaluationModal } from './components/PostScenarioEvaluationModal';
import { TranscriptReplayModal } from './components/TranscriptReplayModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessagesFromStorage());
  const [profile, setProfile] = useState<PersonaProfile>(() => loadProfileFromStorage());
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(() =>
    loadActiveScenario()
  );
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>(() =>
    loadCustomScenarios()
  );
  const [evaluations, setEvaluations] = useState<ScenarioEvaluation[]>(() =>
    loadScenarioEvaluations()
  );
  const [transcripts, setTranscripts] = useState<ScenarioSessionTranscript[]>(() =>
    loadScenarioTranscripts()
  );

  // Gemini model mode, chatbot role, and search grounding
  const [modelMode, setModelMode] = useState<GeminiChatModelMode>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [rolePreset, setRolePreset] = useState<ChatbotRolePreset>('persona_learner');
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  // Real-time communication mentor mode (persisted to localStorage)
  const [mentorMode, setMentorMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('persona_mentor_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleToggleMentorMode = () => {
    setMentorMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('persona_mentor_mode', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);

  // Modals visibility
  const [isScenarioPickerOpen, setIsScenarioPickerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluatingScenario, setEvaluatingScenario] = useState<Scenario | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null);

  // Emergency safety mode and session reflection snapshot
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencySnapshot, setEmergencySnapshot] = useState<ScenarioSessionTranscript | null>(null);

  // Choose Your Own Adventure (CYOA) active decision branch context
  const [activeBranchContext, setActiveBranchContext] = useState<DecisionBranchContext | null>(null);

  // Unanalyzed messages count
  const userMessagesCount = messages.filter((m) => m.role === 'user').length;
  const unanalyzedCount = Math.max(
    0,
    userMessagesCount - (profile.messageCountAnalyzed || 0)
  );

  // Persist messages whenever they change
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // Persist profile
  useEffect(() => {
    saveProfileToStorage(profile);
  }, [profile]);

  // Persist active scenario
  useEffect(() => {
    saveActiveScenario(activeScenario);
  }, [activeScenario]);

  // Persist custom scenarios
  useEffect(() => {
    saveCustomScenarios(customScenarios);
  }, [customScenarios]);

  // Cognitive Profiling Trigger
  const triggerDeepAnalysis = useCallback(
    async (currentMsgs?: ChatMessage[]) => {
      const msgsToAnalyze = currentMsgs || messages;
      const userMsgs = msgsToAnalyze.filter((m) => m.role === 'user');
      if (userMsgs.length === 0 || isAnalyzingProfile) return;

      setIsAnalyzingProfile(true);
      try {
        const res = await fetch('/api/analyze-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: msgsToAnalyze,
            currentProfile: profile
          })
        });

        const data = await res.json();
        if (res.ok && data.profile) {
          setProfile(data.profile);
        } else {
          console.warn('Profile analysis response was not ok:', data);
        }
      } catch (err) {
        console.error('Failed to analyze profile:', err);
      } finally {
        setIsAnalyzingProfile(false);
      }
    },
    [messages, profile, isAnalyzingProfile]
  );

  // Auto-analyze every 3-4 new user responses in the background
  useEffect(() => {
    if (unanalyzedCount >= 3 && !isAnalyzingProfile && !isLoadingChat) {
      triggerDeepAnalysis();
    }
  }, [unanalyzedCount, isAnalyzingProfile, isLoadingChat, triggerDeepAnalysis]);

  // Sending messages in chat
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoadingChat) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      scenarioId: activeScenario?.id,
      scenarioTitle: activeScenario?.title
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          scenario: activeScenario,
          modelMode,
          useSearchGrounding,
          rolePreset,
          mentorMode,
          decisionBranchContext: activeBranchContext || undefined,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get chat response');
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        scenarioId: activeScenario?.id,
        scenarioTitle: activeScenario?.title,
        modelUsed: data.modelUsed,
        groundingSources: data.groundingSources,
        mentorFeedback: data.mentorFeedback,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `**Notice:** Encountered an issue connecting with the AI engine (${err.message || 'Network error'}). Please verify the API key or try again.`,
        timestamp: Date.now()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Sync spoken messages from LiveVoiceModal into the chat history
  const handleSaveSpokenMessages = (spokenMsgs: ChatMessage[]) => {
    if (!spokenMsgs || spokenMsgs.length === 0) return;
    const combined = [...messages, ...spokenMsgs];
    setMessages(combined);
    // Trigger deep cognitive analysis on spoken turns
    triggerDeepAnalysis(combined);
  };

  // Select Scenario
  const handleSelectScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setIsEmergencyMode(false);
    setEmergencySnapshot(null);
    setActiveBranchContext(null);

    // If starting fresh or switching, insert starter immersion message from AI role
    const scenarioIntroMessage: ChatMessage = {
      id: `msg-scenario-${Date.now()}`,
      role: 'assistant',
      content: `### 🎭 Scenario Activated: ${scenario.title}\n\n**${scenario.aiRole.split('—')[0].trim()}**: "${scenario.starterPrompt}"\n\n*Context: ${scenario.description}*`,
      timestamp: Date.now(),
      scenarioId: scenario.id,
      scenarioTitle: scenario.title
    };

    setMessages((prev) => [...prev, scenarioIntroMessage]);
  };

  const handleExitScenario = (triggerRating = true) => {
    if (!activeScenario) return;
    const finishedScenario = activeScenario;

    // Capture the messages for this scenario to create an interactive transcript replay
    const scenarioMsgs = messages.filter((m) => m.scenarioId === finishedScenario.id);
    if (scenarioMsgs.length > 0) {
      const newTranscript: ScenarioSessionTranscript = {
        id: `transcript-${finishedScenario.id}-${Date.now()}`,
        scenarioId: finishedScenario.id,
        scenarioTitle: finishedScenario.title,
        scenarioCategory: finishedScenario.category,
        scenarioDifficulty: finishedScenario.difficulty || 'Intermediate',
        scenarioAiRole: finishedScenario.aiRole,
        scenarioUserRole: finishedScenario.userRole,
        objective: finishedScenario.objective,
        learningFocus: finishedScenario.learningFocus,
        startedAt: scenarioMsgs[0]?.timestamp || Date.now(),
        completedAt: Date.now(),
        messages: scenarioMsgs,
        decisionNodes: finishedScenario.decisionTree,
        currentBranchPath: activeBranchContext ? [activeBranchContext.branchId] : undefined,
        forkedFromBranchLabel: activeBranchContext ? activeBranchContext.label : undefined,
        branchForkTurnIndex: activeBranchContext ? activeBranchContext.forkTurnIndex : undefined,
      };
      saveScenarioTranscript(newTranscript);
      setTranscripts((prev) => [newTranscript, ...prev.filter((t) => t.id !== newTranscript.id)]);
    }

    const exitNotice: ChatMessage = {
      id: `msg-exit-${Date.now()}`,
      role: 'assistant',
      content: `*Roleplay scenario "${finishedScenario.title}" concluded. Returning to open dialogue. How do you feel about the choices and trade-offs you made in that situation?*`,
      timestamp: Date.now()
    };
    setActiveScenario(null);
    setActiveBranchContext(null);
    setMessages((prev) => [...prev, exitNotice]);

    // Open post-scenario evaluation modal if prompted
    if (triggerRating) {
      setEvaluatingScenario(finishedScenario);
      setIsEvaluationModalOpen(true);
    }
  };

  // Immediate Emergency Exit: Clear active screen immediately, preserve snapshot for safe reflection, and show 24/7 hotlines
  const handleEmergencyExit = () => {
    let snapshotToSave: ScenarioSessionTranscript | null = null;
    const currentScenario = activeScenario;

    if (currentScenario) {
      const scenarioMsgs = messages.filter((m) => m.scenarioId === currentScenario.id);
      const msgsToSave = scenarioMsgs.length > 0 ? scenarioMsgs : messages;
      if (msgsToSave.length > 0) {
        snapshotToSave = {
          id: `emergency-snapshot-${currentScenario.id}-${Date.now()}`,
          scenarioId: currentScenario.id,
          scenarioTitle: currentScenario.title,
          scenarioCategory: currentScenario.category,
          scenarioDifficulty: currentScenario.difficulty || 'Intermediate',
          scenarioAiRole: currentScenario.aiRole,
          scenarioUserRole: currentScenario.userRole,
          objective: currentScenario.objective,
          learningFocus: currentScenario.learningFocus,
          startedAt: msgsToSave[0]?.timestamp || Date.now(),
          completedAt: Date.now(),
          messages: msgsToSave,
          isEmergencyExit: true,
          exitNote: 'Preserved during Emergency Safety Exit for later reflection'
        };
      }
    } else if (messages.length > 0) {
      snapshotToSave = {
        id: `emergency-snapshot-chat-${Date.now()}`,
        scenarioId: 'chat-emergency',
        scenarioTitle: 'Emergency Exit Session Snapshot',
        scenarioCategory: 'relationship_safety',
        scenarioDifficulty: 'Intermediate',
        scenarioAiRole: 'AI Assistant',
        scenarioUserRole: 'User',
        objective: 'Emergency Safety Exit & Screen Wipe',
        learningFocus: 'De-escalation & Crisis Safety',
        startedAt: messages[0]?.timestamp || Date.now(),
        completedAt: Date.now(),
        messages: [...messages],
        isEmergencyExit: true,
        exitNote: 'Preserved during Emergency Safety Exit for later reflection'
      };
    }

    if (snapshotToSave) {
      saveScenarioTranscript(snapshotToSave);
      setTranscripts((prev) => [snapshotToSave!, ...prev.filter((t) => t.id !== snapshotToSave!.id)]);
      setEmergencySnapshot(snapshotToSave);
    }

    // Immediately halt voice/speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Immediately clear active scenario and messages from screen
    setActiveScenario(null);
    setMessages([]);
    saveMessagesToStorage([]);
    saveActiveScenario(null);
    setIsEmergencyMode(true);
  };

  const handleReturnFromEmergency = () => {
    setIsEmergencyMode(false);
    setEmergencySnapshot(null);
  };

  const handlePurgeEmergencySnapshot = (id: string) => {
    deleteScenarioTranscript(id);
    setTranscripts((prev) => prev.filter((t) => t.id !== id));
    setEmergencySnapshot(null);
  };

  const handleOpenEvaluationForActive = () => {
    if (activeScenario) {
      setEvaluatingScenario(activeScenario);
      setIsEvaluationModalOpen(true);
    }
  };

  const handleSaveEvaluation = (evalItem: ScenarioEvaluation) => {
    saveScenarioEvaluation(evalItem);
    setEvaluations((prev) => [evalItem, ...prev.filter((e) => e.id !== evalItem.id)]);

    // Link evaluation to matching transcript
    setTranscripts((prev) =>
      prev.map((t) => {
        if (t.scenarioId === evalItem.scenarioId) {
          const updated = { ...t, evaluation: evalItem };
          saveScenarioTranscript(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const handleOpenTranscriptReplay = (targetTranscriptOrScenarioId?: string) => {
    if (targetTranscriptOrScenarioId) {
      const match = transcripts.find(
        (t) =>
          t.id === targetTranscriptOrScenarioId || t.scenarioId === targetTranscriptOrScenarioId
      );
      if (match) {
        setSelectedTranscriptId(match.id);
      }
    }
    setIsTranscriptModalOpen(true);
  };

  const handleRelaunchScenario = (scenarioId: string) => {
    const all = [...DEFAULT_SCENARIOS, ...customScenarios];
    const target = all.find((s) => s.id === scenarioId);
    if (target) {
      setIsTranscriptModalOpen(false);
      handleSelectScenario(target);
    }
  };

  const handleDeleteTranscript = (transcriptId: string) => {
    deleteScenarioTranscript(transcriptId);
    setTranscripts((prev) => prev.filter((t) => t.id !== transcriptId));
  };

  // Launch a Choose Your Own Adventure branch simulation from a transcript crossroads
  const handleLaunchBranchSimulation = (
    scenarioId: string,
    forkTurnIndex: number,
    branch: DecisionBranch,
    priorMessages: ChatMessage[],
    nodeTitle: string
  ) => {
    const allScenarios = [...DEFAULT_SCENARIOS, ...customScenarios];
    const scenarioToLaunch = allScenarios.find((s) => s.id === scenarioId) || activeScenario;
    if (!scenarioToLaunch) return;

    // Reset emergency mode if active and close modal
    setIsEmergencyMode(false);
    setIsTranscriptModalOpen(false);

    // Set scenario and active branch context
    setActiveScenario(scenarioToLaunch);
    const branchCtx: DecisionBranchContext = {
      branchId: branch.id,
      label: branch.label,
      userResponseText: branch.userResponseText,
      consequenceSummary: branch.consequenceSummary,
      aiDialogueTone: branch.aiDialogueTone,
      nodeTitle,
      forkTurnIndex,
    };
    setActiveBranchContext(branchCtx);

    // Build dialogue up to fork point
    let history: ChatMessage[] = [];
    if (priorMessages && priorMessages.length > 0) {
      history = [...priorMessages];
    } else if (scenarioToLaunch.starterPrompt) {
      history = [
        {
          id: `starter-${Date.now()}`,
          role: 'assistant',
          content: scenarioToLaunch.starterPrompt,
          timestamp: Date.now(),
          scenarioId: scenarioToLaunch.id,
          scenarioTitle: scenarioToLaunch.title,
        },
      ];
    }

    // Append the user's branch decision turn
    const userBranchMsg: ChatMessage = {
      id: `msg-branch-${Date.now()}`,
      role: 'user',
      content: branch.userResponseText,
      timestamp: Date.now(),
      scenarioId: scenarioToLaunch.id,
      scenarioTitle: scenarioToLaunch.title,
    };

    const updatedHistory = [...history, userBranchMsg];
    setMessages(updatedHistory);
    setIsLoadingChat(true);

    // Automatically call chat with the branch protocol to generate the AI's divergent response!
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: updatedHistory,
        scenario: scenarioToLaunch,
        modelMode,
        useSearchGrounding,
        rolePreset,
        mentorMode,
        decisionBranchContext: branchCtx,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          scenarioId: scenarioToLaunch.id,
          scenarioTitle: scenarioToLaunch.title,
          modelUsed: data.modelUsed,
          groundingSources: data.groundingSources,
          mentorFeedback: data.mentorFeedback,
        };
        const branchedStream = [...updatedHistory, assistantMessage];
        setMessages(branchedStream);

        // Save session transcript reflecting this CYOA branch
        const branchedTranscript: ScenarioSessionTranscript = {
          id: `transcript-${scenarioToLaunch.id}-fork-${Date.now()}`,
          scenarioId: scenarioToLaunch.id,
          scenarioTitle: `${scenarioToLaunch.title} (${branch.label.split(':')[0]})`,
          scenarioCategory: scenarioToLaunch.category,
          scenarioDifficulty: scenarioToLaunch.difficulty || 'Intermediate',
          scenarioAiRole: scenarioToLaunch.aiRole,
          scenarioUserRole: scenarioToLaunch.userRole,
          objective: scenarioToLaunch.objective,
          learningFocus: scenarioToLaunch.learningFocus,
          startedAt: Date.now(),
          completedAt: Date.now(),
          messages: branchedStream,
          decisionNodes: scenarioToLaunch.decisionTree,
          currentBranchPath: [branch.id],
          forkedFromBranchLabel: branch.label,
          branchForkTurnIndex: forkTurnIndex,
        };
        saveScenarioTranscript(branchedTranscript);
        setTranscripts(loadScenarioTranscripts());
      })
      .catch((err) => {
        console.error('Error simulating branch choice:', err);
      })
      .finally(() => {
        setIsLoadingChat(false);
      });
  };

  // Update transcript decision nodes
  const handleUpdateTranscriptDecisionNodes = (transcriptId: string, nodes: DecisionNode[]) => {
    const target = transcripts.find((t) => t.id === transcriptId);
    if (!target) return;
    const updated: ScenarioSessionTranscript = {
      ...target,
      decisionNodes: nodes,
    };
    saveScenarioTranscript(updated);
    setTranscripts(loadScenarioTranscripts());
  };

  // Select a branch option directly inside ChatView
  const handleSelectBranchDecision = (branch: DecisionBranch, nodeTitle: string) => {
    setActiveBranchContext({
      branchId: branch.id,
      label: branch.label,
      userResponseText: branch.userResponseText,
      consequenceSummary: branch.consequenceSummary,
      aiDialogueTone: branch.aiDialogueTone,
      nodeTitle,
    });
  };

  const handleResetSession = () => {
    if (
      window.confirm(
        'Are you sure you want to reset your conversation and persona profile? This will clear local history.'
      )
    ) {
      clearAllLocalData();
      setMessages([]);
      setProfile(INITIAL_EMPTY_PROFILE);
      setActiveScenario(null);
      setEvaluations([]);
      setTranscripts([]);
    }
  };

  const handleSaveCustomScenario = (scenario: Scenario) => {
    setCustomScenarios((prev) => [scenario, ...prev]);
  };

  // Count scenario messages
  const scenarioMessagesCount = activeScenario
    ? messages.filter((m) => m.scenarioId === activeScenario.id).length
    : (evaluatingScenario ? messages.filter((m) => m.scenarioId === evaluatingScenario.id).length : 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-100 font-sans text-stone-900 antialiased">
      {/* Header */}
      <Header
        activeScenario={activeScenario}
        profile={profile}
        onOpenScenarios={() => setIsScenarioPickerOpen(true)}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenTranscripts={() => handleOpenTranscriptReplay()}
        transcriptCount={transcripts.length}
        onOpenVoiceSession={() => setIsLiveVoiceOpen(true)}
        onResetSession={handleResetSession}
        onExitScenario={() => handleExitScenario(true)}
        onEmergencyExit={handleEmergencyExit}
        analyzing={isAnalyzingProfile}
      />

      {/* Main Conversation Stage */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <ChatView
          messages={messages}
          activeScenario={activeScenario}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingChat}
          onExitScenario={() => handleExitScenario(false)}
          onEmergencyExit={handleEmergencyExit}
          isEmergencyMode={isEmergencyMode}
          emergencySnapshot={emergencySnapshot}
          onReturnFromEmergency={handleReturnFromEmergency}
          onPurgeEmergencySnapshot={handlePurgeEmergencySnapshot}
          onRateScenario={handleOpenEvaluationForActive}
          onOpenScenarios={() => setIsScenarioPickerOpen(true)}
          onOpenTranscripts={(targetId?: string) => handleOpenTranscriptReplay(targetId)}
          onTriggerAnalysis={() => triggerDeepAnalysis()}
          unanalyzedCount={unanalyzedCount}
          profile={profile}
          modelMode={modelMode}
          onModelModeChange={setModelMode}
          useSearchGrounding={useSearchGrounding}
          onToggleSearchGrounding={() => setUseSearchGrounding((prev) => !prev)}
          rolePreset={rolePreset}
          onRolePresetChange={setRolePreset}
          onOpenVoiceSession={() => setIsLiveVoiceOpen(true)}
          mentorMode={mentorMode}
          onToggleMentorMode={handleToggleMentorMode}
          activeBranchContext={activeBranchContext}
          onClearActiveBranch={() => setActiveBranchContext(null)}
          onSelectBranchDecision={handleSelectBranchDecision}
        />
      </main>

      {/* Scenario Picker Modal */}
      <ScenarioPickerModal
        isOpen={isScenarioPickerOpen}
        onClose={() => setIsScenarioPickerOpen(false)}
        onSelectScenario={handleSelectScenario}
        activeScenarioId={activeScenario?.id}
        profile={profile}
        customScenarios={customScenarios}
        onSaveCustomScenario={handleSaveCustomScenario}
        evaluations={evaluations}
        transcripts={transcripts}
        onOpenTranscriptReplay={handleOpenTranscriptReplay}
      />

      {/* Cognitive Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        profile={profile}
        onTriggerAnalysis={() => triggerDeepAnalysis()}
        analyzing={isAnalyzingProfile}
        userMessageCount={userMessagesCount}
        onUpdateProfile={(updated) => setProfile(updated)}
        evaluations={evaluations}
        onOpenTranscriptReplay={handleOpenTranscriptReplay}
      />

      {/* Bot Export & Clone Test Studio Modal */}
      <BotExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        messages={messages}
        evaluations={evaluations}
      />

      {/* Post-Scenario Realism & Performance Evaluation Modal */}
      <PostScenarioEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        scenario={evaluatingScenario}
        onSaveEvaluation={handleSaveEvaluation}
        messageCountInScenario={scenarioMessagesCount}
        onOpenTranscriptReplay={handleOpenTranscriptReplay}
      />

      {/* Interactive Scenario Transcript Replay Modal */}
      <TranscriptReplayModal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        transcripts={transcripts}
        initialSelectedId={selectedTranscriptId}
        onRelaunchScenario={handleRelaunchScenario}
        onDeleteTranscript={handleDeleteTranscript}
        onLaunchBranchSimulation={handleLaunchBranchSimulation}
        onUpdateTranscriptDecisionNodes={handleUpdateTranscriptDecisionNodes}
      />

      {/* Live API Voice Conversation Modal (gemini-3.8-live) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        activeScenario={activeScenario}
        onSaveSpokenMessages={handleSaveSpokenMessages}
        mentorMode={mentorMode}
      />
    </div>
  );
}
