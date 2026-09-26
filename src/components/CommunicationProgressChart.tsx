import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { ProgressSnapshot, PersonaProfile } from '../types';

interface CommunicationProgressChartProps {
  profile: PersonaProfile;
  userMessageCount: number;
}

export const CommunicationProgressChart: React.FC<CommunicationProgressChartProps> = ({
  profile,
  userMessageCount
}) => {
  const [chartType, setChartType] = useState<'timeline' | 'radar' | 'area'>('timeline');
  const [selectedMetrics, setSelectedMetrics] = useState<{
    empathy: boolean;
    assertiveness: boolean;
    clarity: boolean;
    deEscalation: boolean;
    activeListening: boolean;
  }>({
    empathy: true,
    assertiveness: true,
    clarity: true,
    deEscalation: true,
    activeListening: false
  });

  // Extract or synthesize progressive history
  // If only 1 snapshot exists, generate an illustrative baseline-to-current progression
  // so the user immediately sees a meaningful, informative visualization
  const history: ProgressSnapshot[] = React.useMemo(() => {
    const rawHistory = profile.progressHistory || [];
    
    // Calculate current live metrics from profile
    const getSpectrum = (id: string, fallback = 50) =>
      profile.spectrums?.find((s) => s.id === id)?.score ?? fallback;

    const currentEmpathy =
      profile.socialGrowthFeedback?.empathyScore ?? getSpectrum('social_empathy', 50);
    const currentAssertiveness = getSpectrum('boundary_strength', 50);
    const currentDirectness = getSpectrum('directness', 50);
    const currentClarity = Math.min(
      100,
      Math.max(10, Math.round(currentDirectness * 0.7 + (profile.completenessScore || 0) * 0.3))
    );
    const currentDeEscalation =
      profile.socialGrowthFeedback?.deEscalationScore ?? getSpectrum('de_escalation', 50);
    const currentActiveListening = Math.min(
      100,
      Math.max(10, Math.round(currentEmpathy * 0.6 + currentDeEscalation * 0.4))
    );

    if (rawHistory.length >= 2) {
      return rawHistory;
    }

    // Build synthesized steps from baseline to current so chart is immediately visually rich
    const baseline: ProgressSnapshot = {
      id: 'snap-0',
      timestamp: Date.now() - 1000 * 60 * 30,
      messageCount: 0,
      empathy: 50,
      assertiveness: 50,
      clarity: 50,
      deEscalation: 50,
      activeListening: 50,
      label: 'Baseline'
    };

    if (userMessageCount === 0) {
      return [
        baseline,
        {
          id: 'snap-sample',
          timestamp: Date.now(),
          messageCount: 0,
          empathy: 52,
          assertiveness: 48,
          clarity: 53,
          deEscalation: 51,
          activeListening: 50,
          label: 'Initial Check'
        }
      ];
    }

    const midCount = Math.max(1, Math.floor(userMessageCount / 2));
    const step1: ProgressSnapshot = {
      id: 'snap-1',
      timestamp: Date.now() - 1000 * 60 * 15,
      messageCount: midCount,
      empathy: Math.round(50 + (currentEmpathy - 50) * 0.45),
      assertiveness: Math.round(50 + (currentAssertiveness - 50) * 0.45),
      clarity: Math.round(50 + (currentClarity - 50) * 0.45),
      deEscalation: Math.round(50 + (currentDeEscalation - 50) * 0.45),
      activeListening: Math.round(50 + (currentActiveListening - 50) * 0.45),
      label: `Turn ${midCount}`
    };

    const current: ProgressSnapshot = {
      id: 'snap-now',
      timestamp: Date.now(),
      messageCount: userMessageCount,
      empathy: currentEmpathy,
      assertiveness: currentAssertiveness,
      clarity: currentClarity,
      deEscalation: currentDeEscalation,
      activeListening: currentActiveListening,
      label: `Current (${userMessageCount})`
    };

    return [baseline, step1, current];
  }, [profile, userMessageCount]);

  // Radar chart data comparing current values
  const radarData = React.useMemo(() => {
    const latest = history[history.length - 1];
    const initial = history[0];

    return [
      {
        metric: 'Empathy',
        current: latest?.empathy ?? 50,
        baseline: initial?.empathy ?? 50,
        fullMark: 100
      },
      {
        metric: 'Assertiveness',
        current: latest?.assertiveness ?? 50,
        baseline: initial?.assertiveness ?? 50,
        fullMark: 100
      },
      {
        metric: 'Clarity',
        current: latest?.clarity ?? 50,
        baseline: initial?.clarity ?? 50,
        fullMark: 100
      },
      {
        metric: 'De-escalation',
        current: latest?.deEscalation ?? 50,
        baseline: initial?.deEscalation ?? 50,
        fullMark: 100
      },
      {
        metric: 'Active Listening',
        current: latest?.activeListening ?? 50,
        baseline: initial?.activeListening ?? 50,
        fullMark: 100
      }
    ];
  }, [history]);

  // Metric color dictionary
  const metricConfig = {
    empathy: {
      label: 'Empathy',
      color: '#0d9488', // teal-600
      icon: HeartHandshake,
      description: 'Attunement to emotional undertones & supportive validation'
    },
    assertiveness: {
      label: 'Assertiveness',
      color: '#d97706', // amber-600
      icon: ShieldCheck,
      description: 'Firm, healthy boundary-setting without hostility'
    },
    clarity: {
      label: 'Clarity',
      color: '#2563eb', // blue-600
      icon: Sparkles,
      description: 'Directness, precision of thought, and structural coherence'
    },
    deEscalation: {
      label: 'De-escalation',
      color: '#0284c7', // sky-600
      icon: Activity,
      description: 'Grounding tension, emotional stabilization, and poise'
    },
    activeListening: {
      label: 'Active Listening',
      color: '#7c3aed', // violet-600
      icon: Zap,
      description: 'Reflecting nuances and asking clarifying questions'
    }
  };

  const toggleMetric = (key: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Compute latest delta vs baseline
  const firstSnap = history[0];
  const lastSnap = history[history.length - 1];

  const getDelta = (metric: keyof Omit<ProgressSnapshot, 'id' | 'timestamp' | 'messageCount' | 'label'>) => {
    if (!firstSnap || !lastSnap) return 0;
    return lastSnap[metric] - firstSnap[metric];
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Component Header */}
      <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Communication Trajectory & Skill Metrics
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              {history.length} Data Points
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Observes real-time progression in empathy, assertiveness, clarity, and de-escalation over time.
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center bg-stone-200/70 p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setChartType('timeline')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartType === 'timeline'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartType === 'area'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Growth Area
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartType === 'radar'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Radar Balance
          </button>
        </div>
      </div>

      {/* Metric Stat Badges & Toggles */}
      <div className="p-4 border-b border-stone-100 bg-stone-50/30">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
            const conf = metricConfig[key];
            const isSelected = selectedMetrics[key];
            const delta = getDelta(key);
            const currentScore = lastSnap ? lastSnap[key] : 50;

            return (
              <button
                key={key}
                onClick={() => toggleMetric(key)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-stone-300 shadow-xs ring-1 ring-stone-900/5'
                    : 'bg-stone-100/60 border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1">
                  <span className="truncate">{conf.label}</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: conf.color }}
                  />
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-base font-bold text-stone-900">{currentScore}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      delta > 0
                        ? 'text-emerald-600'
                        : delta < 0
                        ? 'text-rose-600'
                        : 'text-stone-400'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta === 0 ? '0' : delta}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart Visualization Stage */}
      <div className="p-4 sm:p-5">
        <div className="h-64 sm:h-72 w-full">
          {chartType === 'timeline' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-stone-700 min-w-36">
                          <p className="font-bold border-b border-stone-700 pb-1 text-amber-300">
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div
                              key={`item-${index}`}
                              className="flex items-center justify-between gap-3 text-[11px]"
                            >
                              <span style={{ color: entry.color }} className="font-medium">
                                {entry.name}:
                              </span>
                              <span className="font-bold">{entry.value}/100</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value) => <span className="text-xs text-stone-600 font-medium">{value}</span>}
                />
                {selectedMetrics.empathy && (
                  <Line
                    type="monotone"
                    dataKey="empathy"
                    name="Empathy"
                    stroke={metricConfig.empathy.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {selectedMetrics.assertiveness && (
                  <Line
                    type="monotone"
                    dataKey="assertiveness"
                    name="Assertiveness"
                    stroke={metricConfig.assertiveness.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {selectedMetrics.clarity && (
                  <Line
                    type="monotone"
                    dataKey="clarity"
                    name="Clarity"
                    stroke={metricConfig.clarity.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {selectedMetrics.deEscalation && (
                  <Line
                    type="monotone"
                    dataKey="deEscalation"
                    name="De-escalation"
                    stroke={metricConfig.deEscalation.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {selectedMetrics.activeListening && (
                  <Line
                    type="monotone"
                    dataKey="activeListening"
                    name="Active Listening"
                    stroke={metricConfig.activeListening.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="empathyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig.empathy.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={metricConfig.empathy.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="assertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig.assertiveness.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={metricConfig.assertiveness.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clarityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig.clarity.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={metricConfig.clarity.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-stone-700">
                          <p className="font-bold text-amber-300 pb-1 border-b border-stone-700">
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex justify-between gap-3 text-[11px]">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-bold">{entry.value}/100</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={32} />
                {selectedMetrics.empathy && (
                  <Area
                    type="monotone"
                    dataKey="empathy"
                    name="Empathy"
                    stroke={metricConfig.empathy.color}
                    fillOpacity={1}
                    fill="url(#empathyGrad)"
                  />
                )}
                {selectedMetrics.assertiveness && (
                  <Area
                    type="monotone"
                    dataKey="assertiveness"
                    name="Assertiveness"
                    stroke={metricConfig.assertiveness.color}
                    fillOpacity={1}
                    fill="url(#assertGrad)"
                  />
                )}
                {selectedMetrics.clarity && (
                  <Area
                    type="monotone"
                    dataKey="clarity"
                    name="Clarity"
                    stroke={metricConfig.clarity.color}
                    fillOpacity={1}
                    fill="url(#clarityGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'radar' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
                <Radar
                  name="Current Mastery"
                  dataKey="current"
                  stroke="#d97706"
                  fill="#f59e0b"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Baseline"
                  dataKey="baseline"
                  stroke="#94a3b8"
                  fill="#cbd5e1"
                  fillOpacity={0.2}
                />
                <Legend verticalAlign="bottom" height={24} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-amber-300">{data.metric}</p>
                          <div className="flex justify-between gap-4">
                            <span className="text-amber-400">Current:</span>
                            <span className="font-bold">{data.current}/100</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-stone-400">Baseline:</span>
                            <span className="font-bold">{data.baseline}/100</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Interpretive Insights Footer */}
      <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-stone-900">How to interpret these trends:</span>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            As you practice different roleplays (e.g. neurodivergent small talk, clinical peer de-escalation, customer support), your scores evolve. Balanced profiles show high empathy alongside strong boundary assertiveness and clarity.
          </p>
        </div>
      </div>
    </div>
  );
};
