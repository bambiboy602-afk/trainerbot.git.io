import React, { useState } from 'react';
import {
  Award,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Activity,
  Star,
  Flame,
  Info,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { MilestoneBadge, PersonaProfile, ScenarioEvaluation } from '../types';
import { computeMilestoneBadges } from '../lib/milestones';

interface MilestonesViewProps {
  profile: PersonaProfile;
  userMessageCount: number;
  evaluations?: ScenarioEvaluation[];
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  profile,
  userMessageCount,
  evaluations = []
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);

  const badges = React.useMemo(
    () => computeMilestoneBadges(profile, userMessageCount, evaluations),
    [profile, userMessageCount, evaluations]
  );

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = badges.filter((b) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'unlocked') return b.isUnlocked;
    if (filterCategory === 'locked') return !b.isUnlocked;
    return b.category === filterCategory;
  });

  const getTierStyles = (tier: MilestoneBadge['tier'], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        cardBg: 'bg-stone-50/80 border-stone-200 opacity-80',
        badgeBg: 'bg-stone-200/80 text-stone-500 border-stone-300',
        tagBg: 'bg-stone-200/60 text-stone-600',
        accentColor: '#78716c'
      };
    }

    switch (tier) {
      case 'platinum':
        return {
          cardBg: 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 border-indigo-200 shadow-sm hover:border-indigo-300',
          badgeBg: 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-indigo-200 shadow-md',
          tagBg: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
          accentColor: '#6366f1'
        };
      case 'gold':
        return {
          cardBg: 'bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/40 border-amber-200 shadow-sm hover:border-amber-300',
          badgeBg: 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-amber-200 shadow-md',
          tagBg: 'bg-amber-100 text-amber-900 border border-amber-200',
          accentColor: '#f59e0b'
        };
      case 'silver':
        return {
          cardBg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-slate-200 shadow-sm hover:border-slate-300',
          badgeBg: 'bg-gradient-to-tr from-slate-400 to-slate-600 text-white shadow-slate-200 shadow-md',
          tagBg: 'bg-slate-100 text-slate-800 border border-slate-200',
          accentColor: '#64748b'
        };
      case 'bronze':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-orange-50/50 via-white to-stone-50 border-orange-200/80 shadow-sm hover:border-orange-300',
          badgeBg: 'bg-gradient-to-tr from-amber-700 to-orange-600 text-white shadow-orange-200 shadow-md',
          tagBg: 'bg-orange-100/80 text-orange-900 border border-orange-200',
          accentColor: '#c2410c'
        };
    }
  };

  const getMetricIcon = (metric: MilestoneBadge['thresholdMetric']) => {
    switch (metric) {
      case 'empathy':
        return HeartHandshake;
      case 'clarity':
        return Sparkles;
      case 'assertiveness':
        return ShieldCheck;
      case 'deEscalation':
        return Activity;
      case 'activeListening':
        return Zap;
      case 'evaluations':
        return Star;
      case 'messages':
      default:
        return Flame;
    }
  };

  return (
    <div className="space-y-6">
      {/* Milestone Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  Communication Milestones & Badges
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {unlockedCount} / {totalCount} Earned
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Earn verifiable badges as your empathy, assertiveness, and clarity metrics cross mastery thresholds.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 text-right shrink-0">
            <div className="flex justify-between text-xs text-amber-200 font-semibold mb-1">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden border border-stone-700/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
          { id: 'locked', label: `In Progress (${totalCount - unlockedCount})` },
          { id: 'empathy', label: 'Empathy' },
          { id: 'clarity', label: 'Clarity' },
          { id: 'assertiveness', label: 'Assertiveness' },
          { id: 'deEscalation', label: 'De-escalation' },
          { id: 'evaluations', label: 'Evaluations' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterCategory(f.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === f.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredBadges.map((badge) => {
          const styles = getTierStyles(badge.tier, badge.isUnlocked);
          const MetricIcon = getMetricIcon(badge.thresholdMetric);

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${styles.cardBg}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${styles.badgeBg} transition-transform group-hover:scale-105`}
                    >
                      {badge.isUnlocked ? (
                        <Award className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-stone-900 leading-tight">
                          {badge.name}
                        </h4>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.tagBg}`}
                        >
                          {badge.tier}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-stone-500 mt-0.5">
                        {badge.title}
                      </p>
                    </div>
                  </div>

                  {badge.isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg shrink-0">
                      {badge.progressPercent}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar & Metric Info */}
              <div className="mt-3.5 pt-3 border-t border-stone-200/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 flex items-center gap-1 font-medium capitalize">
                    <MetricIcon className="w-3.5 h-3.5 text-stone-400" />
                    {badge.thresholdMetric}:
                  </span>
                  <span className="font-bold text-stone-800">
                    {badge.currentScore} / {badge.thresholdScore}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Badge Coaching Insight Modal / Card */}
      {selectedBadge && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Coaching Directive for {selectedBadge.name}
              </h5>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="text-amber-800 hover:text-amber-950 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            "{selectedBadge.coachingTip}"
          </p>
          <div className="text-[11px] text-amber-800/80 flex items-center gap-1.5 pt-1">
            <Info className="w-3 h-3 text-amber-700 shrink-0" />
            <span>
              Target Requirement: {selectedBadge.thresholdMetric} score ≥{' '}
              {selectedBadge.thresholdScore} (Current: {selectedBadge.currentScore})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
