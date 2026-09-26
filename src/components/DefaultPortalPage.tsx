import React from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  MessageSquare, 
  Activity, 
  Award, 
  Mic, 
  ArrowRight, 
  PhoneCall, 
  ShieldAlert, 
  BookOpen, 
  Sliders, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Users,
  Compass,
  Zap,
  Globe
} from 'lucide-react';
import { Persona, UserLevel } from '../types';

interface DefaultPortalPageProps {
  onStartSimulation: (persona?: Persona, level?: UserLevel) => void;
  onOpenPersonaModal: () => void;
  onOpenTips: () => void;
  personas: Persona[];
}

export const DefaultPortalPage: React.FC<DefaultPortalPageProps> = ({
  onStartSimulation,
  onOpenPersonaModal,
  onOpenTips,
  personas,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 text-stone-800">
      {/* 24/7 Urgent Crisis Hotline Banner */}
      <section 
        aria-label="Immediate Crisis Hotlines" 
        className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-950 font-medium"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>In immediate crisis or need to talk right now?</strong> Free, confidential help is available 24/7.
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <a 
              href="tel:988" 
              className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-amber-950 underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call / Text 988 Lifeline</span>
            </a>
            <span className="text-amber-400">•</span>
            <span className="text-amber-900">
              Crisis Text Line: Text <strong className="underline">HOME</strong> to <strong>741741</strong>
            </span>
            <span className="text-amber-400">•</span>
            <a 
              href="https://988lifeline.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-0.5 text-amber-800 hover:underline"
            >
              <span>988lifeline.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-stone-100/60 border-b border-stone-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-2xs">
            <HeartHandshake className="w-4 h-4 text-teal-700" />
            <span>Get Out 24/7 • Peer Support Training Initiative</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Master the Conversations <br className="hidden sm:inline" />
            <span className="text-teal-700">That Help People Get Through</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            An open clinical roleplaying simulator for Peer Support Specialists, Crisis Counselors, and Mental Health Advocates. Practice non-directive empathy, avoid the advice trap, and monitor real-time client emotional de-escalation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onStartSimulation()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Interactive Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenPersonaModal}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-sm shadow-2xs transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-stone-500" />
              <span>Browse 3+ Practice Personas</span>
            </button>

            <button
              type="button"
              onClick={onOpenTips}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Field Guidelines</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-stone-200/80 text-left">
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Difficulty Tiers</div>
              <div className="text-lg font-bold text-stone-900 mt-0.5">Novice → Advanced</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Emotional Tracking</div>
              <div className="text-lg font-bold text-teal-700 mt-0.5">Live Recharts Line</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Voice Practice</div>
              <div className="text-lg font-bold text-stone-900 mt-0.5">Full STT & TTS</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-xs text-stone-500 font-medium">Supervisor Feedback</div>
              <div className="text-lg font-bold text-indigo-700 mt-0.5">5-Point Rubric</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clinical Personas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              Select Your Scenario
            </div>
            <h2 className="text-2xl font-bold text-stone-900">
              Realistic Peer Support Training Scenarios
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-xl">
              Each persona features authentic emotional defense mechanisms, realistic pacing, and tailored competency checklists.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPersonaModal}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>AI Persona Creator & JSON Import</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.slice(0, 3).map((persona) => {
            const isNovice = persona.userLevel === 'novice';
            const isIntermediate = persona.userLevel === 'intermediate';
            const levelColor = isNovice
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isIntermediate
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-rose-50 text-rose-800 border-rose-200';

            return (
              <div
                key={persona.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${persona.avatarBg}`}>
                        {persona.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 group-hover:text-teal-700 transition-colors">
                          {persona.name}
                        </h3>
                        <span className="text-xs text-stone-500">
                          {persona.role} {persona.age ? `• ${persona.age} y/o` : ''}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${levelColor}`}>
                      {persona.userLevel.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-700 mb-1">
                      {persona.scenarioTitle}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {persona.summary}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                    <div className="font-semibold text-stone-800 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-teal-700" />
                      <span>Initial Tone:</span>
                      <span className="font-normal">{persona.tone}</span>
                    </div>
                    <div className="text-stone-500 line-clamp-1 italic">
                      Opening: "{persona.openingMessage}"
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => onStartSimulation(persona, persona.userLevel)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-900 group-hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Practice with {persona.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="bg-white border-y border-stone-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-stone-900">
              Built for Intentional, Reflective Learning
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              Every tool and metric in Get Out 24/7 is engineered around accredited peer specialist standards and empathetic crisis intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Emotional Valence Curve</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Recharts line chart mapping client psychological shift on a -5 to +5 scale in real-time as your validation helps them regulate.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Hands-Free Verbal Call Mode</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Browser Speech-to-Text and Text-to-Speech enables realistic verbal calls with adjustable rate, pitch, and voice synthesis.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Live Supervisor Whispers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Instant active listening tags flag when you offer unsolicited advice or successfully validate feelings before questioning.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">5-Category Clinical Scorecard</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Post-session supervisor review grades active listening, open questions, safety protocol, and boundary keeping with exportable reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Field Principles & Crisis Guidelines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Peer Support Golden Rules</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">
              The Mirror, Not The Mechanic
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              When people are in emotional crisis, what heals is not being told how to fix their lives—it is experiencing another human being who can bear witness to their pain without rushing away.
            </p>

            <ul className="space-y-2.5 text-xs text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Avoid the Advice Trap:</strong> Resist saying "Have you tried..." or "You should...". Suggestions make people defend why their problem is unsolvable.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Reflect Before Inquiring:</strong> Never ask a question until you have first acknowledged and validated the emotion they just shared.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Open, Curious Stance:</strong> Use "How" and "What" questions rather than "Why" questions, which often sound accusatory.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onStartSimulation()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Enter Training Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Practice Card */}
          <div className="bg-stone-900 text-stone-100 p-6 rounded-3xl shadow-xl space-y-4 border border-stone-800">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm">Feeling Reflection Anatomy</span>
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                Core Skill
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-300">
                <span className="text-amber-400 font-bold block mb-1">❌ Ineffective Response (Fix-It Reflex):</span>
                "Don't worry, everyone fails an exam once in a while. Have you tried making flashcards or going to tutoring?"
              </div>

              <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800/80 text-teal-100">
                <span className="text-emerald-400 font-bold block mb-1">✅ Effective Peer Response (Validation + Presence):</span>
                "It sounds like you're feeling completely overwhelmed and terrified of letting people down, especially after putting so much into this. That kind of pressure is so exhausting to hold alone."
              </div>
            </div>

            <p className="text-[11px] text-stone-400 italic">
              Notice how the second response reflects the emotional weight rather than lecturing. The client relaxes their defenses because they feel understood.
            </p>
          </div>
        </div>
      </section>

      {/* Footer & Domain Info */}
      <footer className="bg-white border-t border-stone-200 py-10 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
              G
            </div>
            <span className="font-bold text-stone-900">Get Out 24/7</span>
            <span>•</span>
            <span className="font-mono text-stone-600">getout247.com</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button 
              type="button" 
              onClick={() => onStartSimulation()}
              className="text-stone-700 hover:text-stone-950 font-medium cursor-pointer"
            >
              Simulator
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={onOpenPersonaModal}
              className="text-stone-700 hover:text-stone-950 font-medium cursor-pointer"
            >
              Personas
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={onOpenTips}
              className="text-stone-700 hover:text-stone-950 font-medium cursor-pointer"
            >
              Field Guide
            </button>
            <span>•</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950 font-medium"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] text-stone-400 text-center sm:text-right">
            Educational clinical simulation. In crisis, call 988 or text HOME to 741741.
          </div>
        </div>
      </footer>
    </div>
  );
};
