import React from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  HelpCircle,
  Sparkles,
  Compass
} from 'lucide-react';

interface TrainingTipsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingTipsDrawer: React.FC<TrainingTipsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-2xs flex justify-end">
      <aside 
        aria-label="Peer Support Guidebook"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-700" />
            <h2 className="text-sm font-bold text-stone-900">
              Peer Support Field Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed">
          {/* Section 1: The Core Rule */}
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>The Gold Rule of Peer Support</span>
            </div>
            <p className="text-teal-900">
              You are a <strong>companion and mirror</strong>, not a mechanic or therapist. Your goal is to make the client feel deeply heard and validated—not to "solve" their life in 15 minutes.
            </p>
          </div>

          {/* Section 2: Validation vs. Toxic Positivity */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Empathy vs. Silver Linings
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
                <div className="font-semibold text-emerald-950 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Say this (Validation):</span>
                </div>
                <ul className="space-y-1 text-emerald-900 pl-4 list-disc">
                  <li>"That sounds completely overwhelming."</li>
                  <li>"It makes so much sense that you'd feel exhausted."</li>
                  <li>"I'm right here with you."</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 space-y-1">
                <div className="font-semibold text-rose-950 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Avoid this (Toxic Positivity & Advice):</span>
                </div>
                <ul className="space-y-1 text-rose-900 pl-4 list-disc">
                  <li>"At least you still have a job/degree..."</li>
                  <li>"Everything happens for a reason."</li>
                  <li>"Have you tried going for a walk or yoga?"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Open-Ended Questioning */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Curiosity Over Interrogation
            </h3>
            <p className="text-stone-600">
              Avoid rapid-fire closed questions (e.g. "Did you sleep?", "Are you eating?"). Instead, invite them to describe their inner experience.
            </p>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5 font-mono text-[11px]">
              <div>• "What feels like the heaviest part right now?"</div>
              <div>• "When you notice that panic rising, what is happening?"</div>
              <div>• "What kind of support feels safest today?"</div>
            </div>
          </div>

          {/* Section 4: Safety & Crisis Hand-offs */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Crisis & Safety Boundaries</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              If a client mentions feeling like giving up or ending their life:
            </p>
            <ol className="space-y-1 text-amber-950 pl-4 list-decimal">
              <li><strong>Do not panic or ignore it.</strong> Calmly acknowledge what they said.</li>
              <li><strong>Ask directly:</strong> "Are you thinking about suicide or hurting yourself right now?"</li>
              <li><strong>Warm referral:</strong> "Your life matters deeply. I want to make sure you have 24/7 support right now. Can we look at the 988 Suicide & Crisis Lifeline together?"</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
          >
            Got it, back to simulation
          </button>
        </div>
      </aside>
    </div>
  );
};
