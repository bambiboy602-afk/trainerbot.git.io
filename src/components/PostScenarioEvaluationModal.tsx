import React, { useState } from 'react';
import {
  Star,
  X,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  Send,
  HeartHandshake,
  CheckCircle2,
  Shield,
  Zap,
  Info,
  History
} from 'lucide-react';
import { Scenario, ScenarioEvaluation } from '../types';

interface PostScenarioEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  onSaveEvaluation: (evaluation: ScenarioEvaluation) => void;
  messageCountInScenario: number;
  onOpenTranscriptReplay?: (scenarioId?: string) => void;
}

export const PostScenarioEvaluationModal: React.FC<PostScenarioEvaluationModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onSaveEvaluation,
  messageCountInScenario,
  onOpenTranscriptReplay
}) => {
  const [realismRating, setRealismRating] = useState<number>(4);
  const [rolePerformanceRating, setRolePerformanceRating] = useState<number>(4);
  const [challengeRating, setChallengeRating] = useState<number>(4);
  const [empathyTestingRating, setEmpathyTestingRating] = useState<number>(4);

  const [whatWorkedWell, setWhatWorkedWell] = useState('');
  const [whatFeltRoboticOrArtificial, setWhatFeltRoboticOrArtificial] = useState('');
  const [suggestionsForImprovement, setSuggestionsForImprovement] = useState('');

  const [adjustments, setAdjustments] = useState({
    moreHumanVulnerability: false,
    lessFormalOrAcademic: true,
    higherDirectPushback: false,
    moreNuancedSocialCues: false,
    betterEmotionalDeEscalation: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !scenario) return null;

  const toggleAdjustment = (key: keyof typeof adjustments) => {
    setAdjustments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const evaluation: ScenarioEvaluation = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      timestamp: Date.now(),
      realismRating,
      rolePerformanceRating,
      challengeRating,
      empathyTestingRating,
      whatWorkedWell: whatWorkedWell.trim(),
      whatFeltRoboticOrArtificial: whatFeltRoboticOrArtificial.trim(),
      suggestionsForImprovement: suggestionsForImprovement.trim(),
      desiredAdjustments: adjustments
    };

    onSaveEvaluation(evaluation);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  const renderStarRating = (
    label: string,
    subtitle: string,
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-900">{label}</label>
          <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
            {value} / 5
          </span>
        </div>
        <p className="text-[11px] text-stone-500 leading-tight">{subtitle}</p>
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 text-stone-300 hover:text-amber-500 transition-colors cursor-pointer group"
              title={`${star} stars`}
            >
              <Star
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  star <= value
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-stone-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Post-Scenario Realism & Bot Evaluation
              </h2>
              <p className="text-xs text-stone-500">
                Rate how authentically the bot roleplayed to directly calibrate future persona generation
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

        {/* Scenario Details Pill */}
        <div className="px-6 py-2.5 bg-amber-50/50 border-b border-amber-200/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950">{scenario.title}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
              {scenario.category.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[11px] text-amber-900/80">
            {messageCountInScenario} messages exchanged with <span className="font-semibold">{scenario.aiRole.split('—')[0].trim()}</span>
          </span>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {isSubmitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Ratings Saved Successfully!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Your feedback has been incorporated into your persona generation profile to refine future bot prompts.
              </p>
              <div className="pt-3 flex items-center justify-center gap-2.5">
                {onOpenTranscriptReplay && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTranscriptReplay(scenario.id);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Watch Transcript Replay</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Star Rating Grids */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Quantitative Realism & Performance Ratings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderStarRating(
                    'Conversational Realism',
                    'Did the roleplayer feel like a genuine person vs an AI chatbot?',
                    realismRating,
                    setRealismRating
                  )}
                  {renderStarRating(
                    'Role Fidelity & Pressure',
                    'How well did it hold its character, stakes, and emotional posture?',
                    rolePerformanceRating,
                    setRolePerformanceRating
                  )}
                  {renderStarRating(
                    'Nuance & Calibration',
                    'Was the difficulty and conversational pacing well-balanced?',
                    challengeRating,
                    setChallengeRating
                  )}
                  {renderStarRating(
                    'Empathy & Social Depth',
                    'Did it test genuine emotional attunement and listening?',
                    empathyTestingRating,
                    setEmpathyTestingRating
                  )}
                </div>
              </div>

              {/* Persona Generation Behavioral Directives */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    How Should Future Persona Generation Adjust?
                  </h4>
                  <span className="text-[10px] text-stone-400">Select all that apply</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleAdjustment('lessFormalOrAcademic')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      adjustments.lessFormalOrAcademic
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        adjustments.lessFormalOrAcademic ? 'text-amber-600' : 'text-stone-300'
                      }`}
                    />
                    <span>Less formal / less corporate jargon (talk like a real human)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAdjustment('moreHumanVulnerability')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      adjustments.moreHumanVulnerability
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        adjustments.moreHumanVulnerability ? 'text-amber-600' : 'text-stone-300'
                      }`}
                    />
                    <span>Inject more authentic emotional vulnerability</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAdjustment('higherDirectPushback')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      adjustments.higherDirectPushback
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        adjustments.higherDirectPushback ? 'text-amber-600' : 'text-stone-300'
                      }`}
                    />
                    <span>Challenge me more directly (don't concede easily)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAdjustment('moreNuancedSocialCues')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      adjustments.moreNuancedSocialCues
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        adjustments.moreNuancedSocialCues ? 'text-amber-600' : 'text-stone-300'
                      }`}
                    />
                    <span>Provide subtle social cues & conversational pacing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAdjustment('betterEmotionalDeEscalation')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer sm:col-span-2 ${
                      adjustments.betterEmotionalDeEscalation
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        adjustments.betterEmotionalDeEscalation ? 'text-amber-600' : 'text-stone-300'
                      }`}
                    />
                    <span>Reward somatic grounding and active de-escalation gestures</span>
                  </button>
                </div>
              </div>

              {/* Qualitative Observations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Qualitative Notes to Train Future Bots
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    What worked well in this interaction?
                  </label>
                  <textarea
                    rows={2}
                    value={whatWorkedWell}
                    onChange={(e) => setWhatWorkedWell(e.target.value)}
                    placeholder="e.g., Felt very natural when acknowledging my opening boundary; held realistic urgency..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Did anything feel robotic, canned, or artificial?
                  </label>
                  <textarea
                    rows={2}
                    value={whatFeltRoboticOrArtificial}
                    onChange={(e) => setWhatFeltRoboticOrArtificial(e.target.value)}
                    placeholder="e.g., Repeated phrases like 'I understand your frustration' too quickly; gave bullet points instead of talking naturally..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Suggestions to improve the persona generator:
                  </label>
                  <textarea
                    rows={2}
                    value={suggestionsForImprovement}
                    onChange={(e) => setSuggestionsForImprovement(e.target.value)}
                    placeholder="e.g., Make future roleplayers even more raw; emphasize 1-on-1 human presence over corporate explanations..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Informative footer */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-2 text-[11px] text-stone-500 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Ratings and critiques are saved locally and immediately fed into the prompt synthesis engine so your exported bots and generated scenarios continuously evolve in human authenticity.
                </span>
              </div>
            </>
          )}

          {!isSubmitted && (
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Evaluation & Improve Persona</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
