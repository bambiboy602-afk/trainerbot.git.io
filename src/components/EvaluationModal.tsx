import React from 'react';
import { 
  X, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  RotateCcw, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { EvaluationResult, Persona, Message } from '../types';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationResult | null;
  persona: Persona;
  messages: Message[];
  onRestartSession: () => void;
  onSelectNextLevel?: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  persona,
  messages,
  onRestartSession,
  onSelectNextLevel,
}) => {
  if (!isOpen || !evaluation) return null;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Exemplary':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Proficient':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Developing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const handleDownloadReport = () => {
    const reportText = `
PEER SUPPORT TRAINING EVALUATION REPORT
========================================
Date: ${new Date().toLocaleString()}
Trainee Level: ${persona.userLevel.toUpperCase()}
Client Scenario: ${persona.name} (${persona.role}) - ${persona.scenarioTitle}
Overall Score: ${evaluation.overallScore}/100
Performance Tier: ${evaluation.performanceTier}

SUPERVISOR SUMMARY:
-------------------
${evaluation.summary}

COMPETENCY SCORES:
------------------
${evaluation.categories.map((c) => `- ${c.name}: ${c.score}/${c.maxScore}\n  Notes: ${c.feedback}`).join('\n\n')}

NOTABLE STRENGTHS:
------------------
${evaluation.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OPPORTUNITIES FOR GROWTH:
-------------------------
${evaluation.growthAreas.map((g, i) => `${i + 1}. Issue: ${g.issue}\n   Quote: "${g.quote || 'N/A'}"\n   Alternative Phrasing: "${g.suggestion}"`).join('\n\n')}

FULL TRANSCRIPT:
----------------
${messages.map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'Trainee (Peer Supporter)' : persona.name}: ${m.content}`).join('\n\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `peer-support-eval-${persona.id}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Supervisor Clinical Review & Scorecard
              </h2>
              <p className="text-xs text-stone-500">
                Peer Support Competency Assessment for {persona.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Evaluation Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-stone-800">
          {/* Executive Overview Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-stone-50 p-5 rounded-2xl border border-stone-200">
            {/* Score circle / card */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-stone-200 shadow-2xs text-center">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Overall Competency
              </span>
              <div className="text-4xl font-extrabold text-stone-900">
                {evaluation.overallScore}
                <span className="text-lg font-normal text-stone-400">/100</span>
              </div>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${getTierBadge(evaluation.performanceTier)}`}>
                {evaluation.performanceTier}
              </span>
            </div>

            {/* Supervisor Executive Note */}
            <div className="md:col-span-8 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>Executive Debrief</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {evaluation.summary}
              </p>
              <div className="pt-1 flex items-center gap-3 text-[11px] text-stone-500 font-medium">
                <span>Session: {messages.length} messages</span>
                <span>•</span>
                <span>Roleplay: {persona.scenarioTitle}</span>
              </div>
            </div>
          </div>

          {/* 5 Core Competency Rubric Scores */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Core Competency Breakdown
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {evaluation.categories.map((cat, idx) => {
                const percentage = (cat.score / cat.maxScore) * 100;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-stone-900 mb-1.5">
                      <span>{cat.name}</span>
                      <span className="font-mono text-stone-700">
                        {cat.score} / {cat.maxScore}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 80
                            ? 'bg-emerald-600'
                            : percentage >= 60
                            ? 'bg-teal-600'
                            : percentage >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-stone-600 leading-relaxed">{cat.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Growth Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-2">
                {evaluation.strengths.map((str, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 text-emerald-900 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Opportunities */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>Key Growth Opportunities & Rephrasing</span>
              </div>
              <div className="space-y-2.5">
                {evaluation.growthAreas.map((area, aIdx) => (
                  <div key={aIdx} className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1">
                    <div className="font-semibold text-stone-900">{area.issue}</div>
                    {area.quote && (
                      <div className="text-[11px] text-stone-500 italic">
                        Context: "{area.quote}"
                      </div>
                    )}
                    <div className="text-teal-900 font-medium bg-teal-50 p-1.5 rounded border border-teal-200 flex items-start gap-1">
                      <span className="font-bold text-teal-950 shrink-0">Try saying:</span>
                      <span>"{area.suggestion}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Full Evaluation (.txt)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onRestartSession();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Retry Scenario</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors shadow-xs"
            >
              Close Scorecard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
