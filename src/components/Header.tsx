import React from 'react';
import { Sparkles, Brain, Theater, DownloadCloud, RotateCcw, Award, History, Radio, ShieldAlert } from 'lucide-react';
import { Scenario, PersonaProfile } from '../types';

interface HeaderProps {
  activeScenario: Scenario | null;
  profile: PersonaProfile;
  onOpenScenarios: () => void;
  onOpenProfile: () => void;
  onOpenExport: () => void;
  onOpenTranscripts?: () => void;
  transcriptCount?: number;
  onOpenVoiceSession?: () => void;
  onResetSession: () => void;
  onExitScenario: () => void;
  onEmergencyExit?: () => void;
  analyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeScenario,
  profile,
  onOpenScenarios,
  onOpenProfile,
  onOpenExport,
  onOpenTranscripts,
  transcriptCount = 0,
  onOpenVoiceSession,
  onResetSession,
  onExitScenario,
  onEmergencyExit,
  analyzing
}) => {
  const completeness = profile.completenessScore || 0;
  const traitsCount = profile.detailedTraits?.length || 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Brain className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight truncate">
                Persona Learner & Scenario Bot
              </h1>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block truncate">
              Conversations & roleplay to extract your authentic cognitive DNA for your bot
            </p>
          </div>
        </div>

        {/* Center / Scenario Status Badge if active */}
        {activeScenario && (
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs max-w-md truncate border ${
              activeScenario.category === 'relationship_safety'
                ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-2xs'
                : 'bg-amber-50 border-amber-200/70 text-amber-900'
            }`}
          >
            <Theater className="w-3.5 h-3.5 text-current shrink-0" />
            <span className="font-semibold shrink-0">Scenario:</span>
            <span className="truncate">{activeScenario.title}</span>
            {onEmergencyExit && (
              <button
                onClick={onEmergencyExit}
                className="ml-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-2xs flex items-center gap-1 shrink-0"
                title="Emergency Exit: Immediately wipe screen, save reflection snapshot, and access hotlines"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Emergency Exit</span>
              </button>
            )}
            <button
              onClick={onExitScenario}
              className="ml-1 text-stone-500 hover:text-stone-900 underline font-medium cursor-pointer text-[11px] shrink-0"
              title="Return to open dialogue"
            >
              Exit
            </button>
          </div>
        )}

        {/* Right: Quick Navigation & Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Voice Button (gemini-3.8-live) */}
          {onOpenVoiceSession && (
            <button
              id="header-live-voice-btn"
              onClick={onOpenVoiceSession}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-950 hover:bg-amber-500/20 transition-all cursor-pointer"
              title="Open real-time bidirectional voice conversation (gemini-3.8-live)"
            >
              <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Live Voice</span>
            </button>
          )}

          {/* Scenarios Button */}
          <button
            id="header-scenarios-btn"
            onClick={onOpenScenarios}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all cursor-pointer ${
              activeScenario
                ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-semibold'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
            }`}
            title="Launch roleplay scenarios to test decision-making"
          >
            <Theater className="w-4 h-4 text-stone-600" />
            <span className="hidden md:inline">Scenario Lab</span>
          </button>

          {/* Transcript Replays Button */}
          {onOpenTranscripts && (
            <button
              id="header-transcripts-btn"
              onClick={onOpenTranscripts}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer"
              title="Review step-by-step transcript replays of completed scenarios"
            >
              <History className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Replays</span>
              {transcriptCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {transcriptCount}
                </span>
              )}
            </button>
          )}

          {/* Persona Insights Profile Button */}
          <button
            id="header-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all relative cursor-pointer"
            title="View observed communication style and reasoning profile"
          >
            <Sparkles
              className={`w-4 h-4 ${analyzing ? 'text-amber-500 animate-spin' : 'text-amber-600'}`}
            />
            <span className="hidden sm:inline font-medium">Cognitive Profile</span>
            <div className="flex items-center gap-1 bg-stone-100 text-stone-700 text-[11px] font-semibold px-1.5 py-0.5 rounded-full border border-stone-200">
              <span>{completeness}%</span>
            </div>
          </button>

          {/* Export to Bot Button */}
          <button
            id="header-export-btn"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-xs cursor-pointer"
            title="Generate system prompt & configs to put into your own bot"
          >
            <DownloadCloud className="w-4 h-4 text-amber-300" />
            <span>Export to Bot</span>
          </button>

          {/* Reset / Clear Session */}
          <button
            id="header-reset-btn"
            onClick={onResetSession}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Reset conversation and start fresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
