import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  MessageSquare,
  ExternalLink,
  EyeOff,
  Trash2,
  History,
  Copy,
  Check,
  RotateCcw,
  Lock,
  Sun,
  AlertTriangle,
  ArrowRight,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { ScenarioSessionTranscript } from '../types';

interface EmergencyExitViewProps {
  snapshot: ScenarioSessionTranscript | null;
  onReturnToCleanChat: () => void;
  onOpenTranscripts?: (targetId?: string) => void;
  onPurgeSnapshot?: (snapshotId: string) => void;
}

export const EmergencyExitView: React.FC<EmergencyExitViewProps> = ({
  snapshot,
  onReturnToCleanChat,
  onOpenTranscripts,
  onPurgeSnapshot,
}) => {
  const [isDisguised, setIsDisguised] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'hotlines' | 'checklist' | 'privacy'>('hotlines');
  const [purged, setPurged] = useState(false);

  // Quick escape handler to instantly redirect away from the website
  const handleQuickExternalEscape = () => {
    try {
      window.location.replace('https://www.weather.com');
    } catch {
      window.location.href = 'https://www.google.com';
    }
  };

  const handleCopySnapshotText = () => {
    if (!snapshot) return;
    const lines = [
      `[Safe Reflection Notes - ${snapshot.scenarioTitle}]`,
      `Date: ${new Date(snapshot.completedAt).toLocaleString()}`,
      `Category: ${snapshot.scenarioCategory}`,
      `Total Turns: ${snapshot.messages.length}`,
      snapshot.objective ? `Focus: ${snapshot.objective}` : '',
      `\nDialogue Log:`,
      ...snapshot.messages.map(
        (m, idx) => `[Turn ${idx + 1}] ${m.role === 'user' ? 'YOU' : 'ROLEPLAY COUNTERPART'}: ${m.content}`
      )
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePurge = () => {
    if (snapshot && onPurgeSnapshot) {
      onPurgeSnapshot(snapshot.id);
      setPurged(true);
    }
  };

  // If disguise mode is enabled (e.g. someone walked into the room)
  if (isDisguised) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 p-6 sm:p-10 select-none animate-in fade-in duration-100">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-bold text-slate-800">Daily Regional Weather & Notes</h1>
            </div>
            <button
              onClick={() => setIsDisguised(false)}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              title="Return to emergency safety view"
            >
              Resume View
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Local Temperature</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">71°F / 22°C</p>
              <p className="text-xs text-slate-500 mt-1">Partly Cloudy • Humidity 48%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Precipitation Chance</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">10%</p>
              <p className="text-xs text-slate-500 mt-1">Wind: 7 mph WNW</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Air Quality Index</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">32 (Good)</p>
              <p className="text-xs text-slate-500 mt-1">Updated 10 mins ago</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-700 mb-2">Personal Scratchpad</h2>
            <div className="space-y-2 text-xs text-slate-600">
              <p>• Weekly grocery list: olive oil, oat milk, apples, brown rice.</p>
              <p>• Call dentist regarding routine checkup next Tuesday at 3:00 PM.</p>
              <p>• Library book return deadline is Friday afternoon.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-slate-400">Status: Idle</span>
            <button
              onClick={handleQuickExternalEscape}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Exit to External
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto w-full space-y-6 my-auto">
        {/* Top Emergency Status Bar */}
        <div className="bg-rose-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                  Screen Cleared • Safety Mode Active
                </span>
                <span className="text-xs text-rose-100 font-medium">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Emergency Exit Activated
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl leading-relaxed">
                The active roleplay screen has been immediately wiped clean to protect your privacy and safety.
                All conversational text and audio playback have been halted.
              </p>
            </div>
          </div>

          {/* Quick Disguise & External Escape Buttons */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsDisguised(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-rose-900 hover:bg-rose-50 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Instantly disguise screen with a harmless weather and notes view"
            >
              <EyeOff className="w-4 h-4 text-rose-700" />
              <span>Mask Screen (Weather)</span>
            </button>
            <button
              onClick={handleQuickExternalEscape}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold border border-rose-500/50 shadow-xs transition-colors cursor-pointer"
              title="Immediately leaves this site and opens weather.com"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Quick Escape to Web</span>
            </button>
          </div>
        </div>

        {/* Snapshot Preservation Card */}
        {snapshot && !purged && (
          <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-950">
                    Snapshot Saved
                  </span>
                  <span className="text-xs text-stone-500">
                    {new Date(snapshot.completedAt).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 truncate mt-0.5">
                  Preserved for Safe Reflection: {snapshot.scenarioTitle}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {snapshot.messages.length} conversational turns preserved locally. You can review this session
                  in private when you are in a safe environment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleCopySnapshotText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                title="Copy text of saved snapshot"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copied ? 'Copied' : 'Copy Notes'}</span>
              </button>
              {onOpenTranscripts && (
                <button
                  onClick={() => onOpenTranscripts(snapshot.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Review in Replays</span>
                </button>
              )}
              {onPurgeSnapshot && (
                <button
                  onClick={handlePurge}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                  title="Permanently delete this saved snapshot from device storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Trace</span>
                </button>
              )}
            </div>
          </div>
        )}

        {purged && (
          <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-center justify-between">
            <span>Snapshot permanently purged from local browser memory.</span>
          </div>
        )}

        {/* Resources & Safety Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1.5">
            <button
              onClick={() => setActiveTab('hotlines')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'hotlines'
                  ? 'bg-white text-rose-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              <span>24/7 Crisis Hotlines</span>
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-white text-rose-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Safe Exit Checklist</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-rose-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Digital & Browser Privacy</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* Tab 1: 24/7 Crisis Hotlines */}
            {activeTab === 'hotlines' && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>If you are in immediate physical danger, call 911</strong> immediately if safe to do so.
                    All resources below are <strong>100% free, confidential, and available 24 hours a day, 7 days a week</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* National DV Hotline */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-rose-300 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-stone-900">National Domestic Violence Hotline</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          24/7 Available
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mb-3">
                        Confidential support from certified advocates, crisis intervention, safety planning, and local shelter referrals.
                      </p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href="tel:18007997233"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>1-800-799-SAFE (7233)</span>
                        </a>
                        <span className="text-xs text-stone-600 font-medium">Text <strong>START</strong> to <strong>88788</strong></span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                        <span>TTY: 1-800-787-3224</span>
                        <a
                          href="https://www.thehotline.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-700 underline font-semibold inline-flex items-center gap-1"
                        >
                          thehotline.org <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Crisis Text Line */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-rose-300 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-stone-900">Crisis Text Line</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Text 24/7
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mb-3">
                        Free, nationwide crisis text service connecting you with a trained crisis counselor for acute emotional distress or safety guidance.
                      </p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-stone-800">
                          Text <span className="text-rose-700 font-black">HOME</span> to <span className="text-stone-900 font-black">741741</span>
                        </span>
                        <a
                          href="https://www.crisistextline.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-600 hover:text-stone-900 text-xs underline inline-flex items-center gap-0.5"
                        >
                          crisistextline.org <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Love is Respect */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-rose-300 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-stone-900">Love is Respect (Youth & Young Adults)</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Specialized
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mb-3">
                        Empowering teens and young adults to end dating abuse through peer advocacy, healthy relationship guidance, and confidential support.
                      </p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <a
                          href="tel:18663319474"
                          className="font-bold text-xs text-rose-700 underline"
                        >
                          1-866-331-9474
                        </a>
                        <span className="text-xs text-stone-600">Text <strong>LOVEIS</strong> to <strong>22522</strong></span>
                        <a
                          href="https://www.loveisrespect.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-500 hover:text-stone-800 text-xs inline-flex items-center gap-0.5"
                        >
                          loveisrespect.org <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 988 Lifeline & StrongHearts */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-rose-300 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-stone-900">988 Suicide & Crisis Lifeline</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          Call / Text 988
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mb-3">
                        Free, 24/7 compassionate support for anyone experiencing extreme emotional distress, trauma, or mental health crises.
                      </p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href="tel:988"
                          className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800"
                        >
                          Call or Text 988
                        </a>
                        <span className="text-[11px] text-stone-500">
                          StrongHearts Native: 1-844-762-8483
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Safe Exit Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-4 text-xs text-stone-700">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950">
                  <p className="font-bold mb-0.5">Statistical Safety Principle:</p>
                  <p>
                    Leaving a relationship is documented as the period of highest risk. Safety advocates strongly recommend
                    preparing in advance and departing when the abusive partner is not present, rather than declaring an exit during a confrontation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      1. Vital Documents Go-Bag (Stored Off-Site)
                    </h4>
                    <p className="text-stone-600">
                      Keep originals or clear photos of these with a trusted ally, family member, or secure digital locker:
                    </p>
                    <ul className="space-y-1 list-disc pl-4 text-stone-600">
                      <li>Government IDs, Driver's License, Passports, Green Cards</li>
                      <li>Social Security cards (for you and any dependents)</li>
                      <li>Birth certificates and marriage/divorce certificates</li>
                      <li>Vehicle title, lease agreements, or property deeds</li>
                      <li>Essential prescription medications (minimum 1-2 weeks)</li>
                      <li>Financial records: Bank statements, tax returns, debit cards</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      2. Safe Communication & Code Words
                    </h4>
                    <ul className="space-y-1 list-disc pl-4 text-stone-600">
                      <li>Establish a neutral code word with a trusted neighbor (e.g. "Can I borrow that recipe?") that means: <em>Call 911 immediately</em>.</li>
                      <li>Secure a prepaid "burner" phone with cash and store it hidden or at work.</li>
                      <li>Memorize important phone numbers in case your phone is confiscated.</li>
                      <li>Avoid enclosed rooms without multiple exits (e.g., bathrooms or kitchens with knives/hard surfaces).</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Digital & Browser Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 text-xs text-stone-700">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-rose-600" />
                    How to Clear Your Browser History Right Now
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    If someone has access to your computer, tablet, or phone, they may inspect your search history or cached tabs.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-stone-200">
                      <span className="font-bold text-stone-800 block mb-1">On Windows / Chrome / Edge:</span>
                      <p className="text-stone-600">
                        Press <kbd className="px-1.5 py-0.5 bg-stone-100 border rounded text-[11px] font-mono">Ctrl</kbd> +{' '}
                        <kbd className="px-1.5 py-0.5 bg-stone-100 border rounded text-[11px] font-mono">Shift</kbd> +{' '}
                        <kbd className="px-1.5 py-0.5 bg-stone-100 border rounded text-[11px] font-mono">Delete</kbd>.
                        Select "Last hour" or "All time" and click Clear Data.
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-stone-200">
                      <span className="font-bold text-stone-800 block mb-1">On Mac / Safari:</span>
                      <p className="text-stone-600">
                        Press <kbd className="px-1.5 py-0.5 bg-stone-100 border rounded text-[11px] font-mono">Cmd</kbd> +{' '}
                        <kbd className="px-1.5 py-0.5 bg-stone-100 border rounded text-[11px] font-mono">Y</kbd> or click
                        History &gt; Clear History &gt; Clear All.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 text-sm">Key Digital Safety Recommendations:</h4>
                  <ul className="space-y-1 list-disc pl-4 text-stone-600">
                    <li>Use a computer outside the home (public library, community center, trusted friend's device) for research.</li>
                    <li>Check your phone settings for shared family location accounts (Find My, Google Family Link, Life360).</li>
                    <li>Change passwords to personal email accounts and enable two-factor authentication to a device only you access.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions: Return to clean chat or close */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onReturnToCleanChat}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-stone-300" />
            <span>Return to Clean Chat (Blank Slate)</span>
          </button>

          <span className="text-[11px] text-stone-400 text-center sm:text-right">
            Your safety comes first. Take all the time you need.
          </span>
        </div>
      </div>
    </div>
  );
};
