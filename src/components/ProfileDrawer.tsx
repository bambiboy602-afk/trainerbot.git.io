import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Brain,
  Compass,
  CheckCircle2,
  AlertCircle,
  Quote,
  ShieldCheck,
  Zap,
  TrendingUp,
  Plus,
  RefreshCw,
  HeartHandshake,
  Stethoscope,
  Activity,
  Award,
  LineChart as LineChartIcon,
  Star,
  MessageSquare,
  Trophy,
  History
} from 'lucide-react';
import { PersonaProfile, ScenarioEvaluation } from '../types';
import { CommunicationProgressChart } from './CommunicationProgressChart';
import { MilestonesView } from './MilestonesView';
import { computeMilestoneBadges } from '../lib/milestones';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonaProfile;
  onTriggerAnalysis: () => void;
  analyzing: boolean;
  userMessageCount: number;
  onUpdateProfile: (updated: PersonaProfile) => void;
  evaluations?: ScenarioEvaluation[];
  onOpenTranscriptReplay?: (scenarioId?: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onTriggerAnalysis,
  analyzing,
  userMessageCount,
  onUpdateProfile,
  evaluations = [],
  onOpenTranscriptReplay
}) => {
  const [activeTab, setActiveTab] = useState<
    'progress' | 'milestones' | 'spectrums' | 'social_growth' | 'evaluations' | 'heuristics' | 'dos_donts' | 'phrases'
  >('progress');
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newPhraseInput, setNewPhraseInput] = useState('');

  const milestoneBadges = React.useMemo(
    () => computeMilestoneBadges(profile, userMessageCount, evaluations),
    [profile, userMessageCount, evaluations]
  );
  const unlockedBadgesCount = milestoneBadges.filter((b) => b.isUnlocked).length;

  if (!isOpen) return null;

  const completeness = profile.completenessScore || 0;

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    const updated = {
      ...profile,
      decisionMakingRules: [...(profile.decisionMakingRules || []), newRuleInput.trim()]
    };
    onUpdateProfile(updated);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    const updated = {
      ...profile,
      decisionMakingRules: profile.decisionMakingRules.filter((_, i) => i !== index)
    };
    onUpdateProfile(updated);
  };

  const handleAddPhrase = () => {
    if (!newPhraseInput.trim()) return;
    const updated = {
      ...profile,
      signaturePhrases: [...(profile.signaturePhrases || []), newPhraseInput.trim()]
    };
    onUpdateProfile(updated);
    setNewPhraseInput('');
  };

  const handleRemovePhrase = (index: number) => {
    const updated = {
      ...profile,
      signaturePhrases: profile.signaturePhrases.filter((_, i) => i !== index)
    };
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">Cognitive & Social DNA Profile</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {completeness}% Synthesized
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Extracted from your real conversational choices, logic, social empathy, and tone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completeness & Refresh Action Bar */}
        <div className="px-6 py-3.5 bg-amber-50/40 border-b border-amber-200/50 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs mb-1 font-medium">
              <span className="text-stone-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Profile Depth ({userMessageCount} user replies analyzed)
              </span>
              <span className="font-bold text-stone-900">{completeness}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, completeness)}%` }}
              />
            </div>
          </div>

          <button
            onClick={onTriggerAnalysis}
            disabled={analyzing || userMessageCount === 0}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
            title="Re-run deep cognitive extraction across all dialogue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing...' : 'Re-analyze Mind'}</span>
          </button>
        </div>

        {/* Executive Summary Card */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Executive Synthesis & Grounded Tone
          </h3>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
            {profile.overallSummary}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-stone-200 flex gap-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'progress', label: 'Progress Metrics', icon: LineChartIcon },
            {
              id: 'milestones',
              label: `Milestones (${unlockedBadgesCount}/${milestoneBadges.length})`,
              icon: Trophy
            },
            { id: 'spectrums', label: 'Trait Spectrums', icon: Compass },
            { id: 'social_growth', label: 'Social & De-escalation', icon: HeartHandshake },
            {
              id: 'evaluations',
              label: `Bot Ratings (${evaluations.length})`,
              icon: Star
            },
            { id: 'heuristics', label: 'Decision Rules', icon: Zap },
            { id: 'dos_donts', label: 'Bot Dos & Donts', icon: ShieldCheck },
            { id: 'phrases', label: 'Voice & Idioms', icon: Quote }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-amber-600 text-amber-900 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <CommunicationProgressChart
                profile={profile}
                userMessageCount={userMessageCount}
              />

              {/* Milestones Teaser Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-stone-50 to-white border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 font-bold shadow-xs shrink-0">
                    <Trophy className="w-5 h-5 fill-stone-950" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      Earned {unlockedBadgesCount} of {milestoneBadges.length} Communication Badges
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Includes 'Empathy Explorer', 'Clarity Master', 'Assertive Anchor', and more based on threshold scores.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  View All Badges →
                </button>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <MilestonesView
              profile={profile}
              userMessageCount={userMessageCount}
              evaluations={evaluations}
            />
          )}

          {activeTab === 'spectrums' && (
            <div className="space-y-6">
              <div className="text-xs text-stone-500">
                These spectrums plot your natural conversational impulses, empathy attunement, and boundaries. Every score is backed by real quotes observed during your chats.
              </div>

              {profile.spectrums?.map((spectrum) => {
                return (
                  <div
                    key={spectrum.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 space-y-2.5"
                  >
                    {/* Header Labels */}
                    <div className="flex justify-between items-center text-xs font-bold text-stone-900">
                      <span className="text-stone-700">{spectrum.leftLabel}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600">
                        {spectrum.confidence} signal ({spectrum.score}/100)
                      </span>
                      <span className="text-stone-700">{spectrum.rightLabel}</span>
                    </div>

                    {/* Visual Slider Meter */}
                    <div className="relative w-full h-3 bg-stone-200 rounded-full overflow-hidden flex items-center">
                      <div
                        className="absolute h-full bg-amber-600/80 rounded-full transition-all duration-500"
                        style={{ width: `${spectrum.score}%` }}
                      />
                      {/* Indicator marker */}
                      <div
                        className="absolute w-4 h-4 bg-stone-900 border-2 border-white rounded-full shadow-sm -ml-2 transition-all duration-500"
                        style={{ left: `${spectrum.score}%` }}
                      />
                    </div>

                    {/* Summary text */}
                    <p className="text-xs text-stone-600 pt-1 leading-relaxed">
                      {spectrum.summary}
                    </p>

                    {/* Observed Quotes as Proof */}
                    {spectrum.observedEvidence && spectrum.observedEvidence.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/70 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                          <Quote className="w-2.5 h-2.5" /> Observed Behavioral Quotes:
                        </span>
                        {spectrum.observedEvidence.map((quote, qidx) => (
                          <div
                            key={qidx}
                            className="text-xs italic text-stone-700 bg-white p-2 rounded-lg border border-stone-200/60"
                          >
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'social_growth' && (
            <div className="space-y-6">
              <div className="text-xs text-stone-500">
                Actionable feedback designed for neurodivergent social communication, mental health peer support, and customer de-escalation mastery.
              </div>

              {/* Empathy & De-escalation Gauge Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-teal-600" />
                      Empathy & Attunement
                    </span>
                    <span className="text-xs font-bold text-teal-900">
                      {profile.socialGrowthFeedback?.empathyScore ?? 50}/100
                    </span>
                  </div>
                  <div className="w-full bg-teal-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${profile.socialGrowthFeedback?.empathyScore ?? 50}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-teal-800/80 mt-2">
                    Measures recognition of emotional needs under the words rather than only literal language.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-sky-600" />
                      De-escalation Posture
                    </span>
                    <span className="text-xs font-bold text-sky-900">
                      {profile.socialGrowthFeedback?.deEscalationScore ?? 50}/100
                    </span>
                  </div>
                  <div className="w-full bg-sky-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all"
                      style={{ width: `${profile.socialGrowthFeedback?.deEscalationScore ?? 50}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-sky-800/80 mt-2">
                    Measures ability to ground high emotional arousal, prevent flooding, and establish calm safety.
                  </p>
                </div>
              </div>

              {/* Interactive Progress Chart in Social & De-escalation */}
              <div className="pt-2">
                <CommunicationProgressChart
                  profile={profile}
                  userMessageCount={userMessageCount}
                />
              </div>

              {/* Observed Strengths */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Observable Social & Conversational Strengths
                </h4>
                {profile.socialGrowthFeedback?.strengths &&
                profile.socialGrowthFeedback.strengths.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-stone-800">
                    {profile.socialGrowthFeedback.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    Engage in roleplay to highlight your active communication strengths.
                  </p>
                )}
              </div>

              {/* Gentle Growth Areas */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Gentle Social Growth & Interaction Focus
                </h4>
                {profile.socialGrowthFeedback?.growthAreas &&
                profile.socialGrowthFeedback.growthAreas.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {profile.socialGrowthFeedback.growthAreas.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold shrink-0">→</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-amber-800/70 italic">
                    Practice scenarios with social boundary challenges or angry customers to explore growth areas.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    User Realism & Bot Performance Ratings
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Post-scenario evaluations you provided to calibrate and improve future persona generation.
                  </p>
                </div>
              </div>

              {evaluations.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <Star className="w-8 h-8 text-stone-300 mx-auto" />
                  <h5 className="text-xs font-bold text-stone-700">No Post-Scenario Ratings Yet</h5>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    When you end a scenario, rate the bot's realism and roleplay performance. Your feedback directly eliminates robotic habits in exported personas.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-center">
                      <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                        Avg Realism
                      </span>
                      <p className="text-lg font-extrabold text-amber-950 mt-0.5">
                        {(
                          evaluations.reduce((sum, e) => sum + e.realismRating, 0) /
                          evaluations.length
                        ).toFixed(1)}{' '}
                        <span className="text-xs font-normal text-amber-700">/ 5</span>
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-xl text-center">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                        Role Fidelity
                      </span>
                      <p className="text-lg font-extrabold text-emerald-950 mt-0.5">
                        {(
                          evaluations.reduce((sum, e) => sum + e.rolePerformanceRating, 0) /
                          evaluations.length
                        ).toFixed(1)}{' '}
                        <span className="text-xs font-normal text-emerald-700">/ 5</span>
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200/70 rounded-xl text-center">
                      <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">
                        Challenge Level
                      </span>
                      <p className="text-lg font-extrabold text-blue-950 mt-0.5">
                        {(
                          evaluations.reduce((sum, e) => sum + e.challengeRating, 0) /
                          evaluations.length
                        ).toFixed(1)}{' '}
                        <span className="text-xs font-normal text-blue-700">/ 5</span>
                      </p>
                    </div>

                    <div className="p-3 bg-violet-50 border border-violet-200/70 rounded-xl text-center">
                      <span className="text-[10px] font-bold uppercase text-violet-800 tracking-wider">
                        Empathy Testing
                      </span>
                      <p className="text-lg font-extrabold text-violet-950 mt-0.5">
                        {(
                          evaluations.reduce((sum, e) => sum + e.empathyTestingRating, 0) /
                          evaluations.length
                        ).toFixed(1)}{' '}
                        <span className="text-xs font-normal text-violet-700">/ 5</span>
                      </p>
                    </div>
                  </div>

                  {/* List of Evaluations */}
                  <div className="space-y-3 pt-1">
                    {evaluations.map((evalItem) => (
                      <div
                        key={evalItem.id}
                        className="p-4 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                          <div>
                            <h5 className="text-xs font-bold text-stone-900">
                              {evalItem.scenarioTitle}
                            </h5>
                            <span className="text-[10px] text-stone-400">
                              {new Date(evalItem.timestamp).toLocaleDateString()} at{' '}
                              {new Date(evalItem.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-bold text-amber-900">
                              {evalItem.realismRating}.0
                            </span>
                          </div>
                        </div>

                        {/* Rating breakdown pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-600 bg-stone-50/70 p-2 rounded-lg">
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase font-semibold">
                              Realism
                            </span>
                            <span className="font-bold text-stone-900">{evalItem.realismRating}/5</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase font-semibold">
                              Role Fidelity
                            </span>
                            <span className="font-bold text-stone-900">
                              {evalItem.rolePerformanceRating}/5
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase font-semibold">
                              Pacing
                            </span>
                            <span className="font-bold text-stone-900">{evalItem.challengeRating}/5</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase font-semibold">
                              Empathy
                            </span>
                            <span className="font-bold text-stone-900">
                              {evalItem.empathyTestingRating}/5
                            </span>
                          </div>
                        </div>

                        {/* Qualitative notes */}
                        {evalItem.whatWorkedWell && (
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-emerald-800 text-[11px]">
                              ✓ What worked well:
                            </span>
                            <p className="text-stone-600 italic pl-2 border-l-2 border-emerald-300">
                              "{evalItem.whatWorkedWell}"
                            </p>
                          </div>
                        )}

                        {evalItem.whatFeltRoboticOrArtificial && (
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-amber-800 text-[11px]">
                              ⚠ Felt robotic / artificial:
                            </span>
                            <p className="text-stone-600 italic pl-2 border-l-2 border-amber-300">
                              "{evalItem.whatFeltRoboticOrArtificial}"
                            </p>
                          </div>
                        )}

                        {evalItem.suggestionsForImprovement && (
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-blue-800 text-[11px]">
                              💡 Directive for persona generator:
                            </span>
                            <p className="text-stone-600 italic pl-2 border-l-2 border-blue-300">
                              "{evalItem.suggestionsForImprovement}"
                            </p>
                          </div>
                        )}

                        {onOpenTranscriptReplay && (
                          <div className="pt-2 border-t border-stone-100 flex justify-end">
                            <button
                              onClick={() => {
                                onClose();
                                onOpenTranscriptReplay(evalItem.scenarioId);
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5 text-amber-600" />
                              <span>View Transcript Replay</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'heuristics' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-500">
                Cognitive heuristics and decision rules derived from how you resolve dilemmas, set boundaries, and evaluate options.
              </div>

              {/* Add custom rule input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                  placeholder="Add custom decision rule (e.g. Always check physical baseline before deep emotional talk)..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <button
                  onClick={handleAddRule}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {profile.decisionMakingRules?.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start justify-between gap-3 text-xs text-stone-800 leading-relaxed group"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveRule(idx)}
                      className="text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove rule"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(!profile.decisionMakingRules || profile.decisionMakingRules.length === 0) && (
                  <p className="text-xs text-stone-400 italic text-center py-6">
                    No decision heuristics extracted yet. Launch a scenario to test hard trade-offs!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dos_donts' && (
            <div className="space-y-6">
              <div className="text-xs text-stone-500">
                Instructions that will be fed directly into your custom bot prompt so it speaks, listens, and acts authentically like you.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DOs */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    How Your Bot MUST Act
                  </h4>
                  <ul className="space-y-2 text-xs text-emerald-950">
                    {profile.communicationDosAndDonts?.dos?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONTs */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    What Your Bot MUST NEVER Do
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-950">
                    {profile.communicationDosAndDonts?.donts?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phrases' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-500">
                Signature phrases, recurring sentence constructions, and idiosyncratic speech patterns recognized in your replies.
              </div>

              {/* Add custom phrase */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPhraseInput}
                  onChange={(e) => setNewPhraseInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPhrase()}
                  placeholder="Add phrase or verbal quirk you often use..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <button
                  onClick={handleAddPhrase}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {profile.signaturePhrases?.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-medium"
                  >
                    <span>"{phrase}"</span>
                    <button
                      onClick={() => handleRemovePhrase(idx)}
                      className="hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!profile.signaturePhrases || profile.signaturePhrases.length === 0) && (
                  <p className="text-xs text-stone-400 italic py-4">
                    No distinctive phrases captured yet. Chat naturally to reveal your idioms!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
