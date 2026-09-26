import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Target, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  HelpCircle,
  CheckCircle2,
  Circle,
  TrendingUp,
  Activity,
  HeartPulse
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Persona, Message } from '../types';

interface PersonaBriefingProps {
  persona: Persona;
  currentEmotion: string;
  sessionDuration: number;
  messageCount: number;
  messages?: Message[];
}

interface ChartDataPoint {
  turnName: string;
  turnIndex: number;
  valence: number;
  emotion: string;
  time: string;
  preview: string;
}

const getValenceFromEmotion = (emotion?: string): number => {
  if (!emotion) return -1.5;
  const lower = emotion.toLowerCase();
  if (lower.includes('crisis') || lower.includes('panic') || lower.includes('hopeless') || lower.includes('despair') || lower.includes('suicid')) return -4.5;
  if (lower.includes('overwhelm') || lower.includes('frozen') || lower.includes('failing') || lower.includes('exhausted') || lower.includes('anxious') || lower.includes('angry') || lower.includes('guilty') || lower.includes('distress')) return -3.0;
  if (lower.includes('hesitant') || lower.includes('guarded') || lower.includes('defensive') || lower.includes('withdrawn') || lower.includes('pensive') || lower.includes('skeptical')) return -1.2;
  if (lower.includes('ambivalent') || lower.includes('neutral') || lower.includes('numb') || lower.includes('flat')) return 0;
  if (lower.includes('cautious') || lower.includes('listening') || lower.includes('curious') || lower.includes('engaged')) return 1.5;
  if (lower.includes('relieved') || lower.includes('heard') || lower.includes('supported') || lower.includes('safer') || lower.includes('connected')) return 3.2;
  if (lower.includes('hopeful') || lower.includes('empowered') || lower.includes('calm') || lower.includes('grounded') || lower.includes('grateful')) return 4.5;
  return -1.5;
};

export const PersonaBriefing: React.FC<PersonaBriefingProps> = ({
  persona,
  currentEmotion,
  sessionDuration,
  messageCount,
  messages = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedObjectives, setCompletedObjectives] = useState<Record<number, boolean>>({});

  const toggleObjective = (index: number) => {
    setCompletedObjectives((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'novice':
        return {
          label: 'Level 1: Novice',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'intermediate':
        return {
          label: 'Level 2: Intermediate',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'advanced':
        return {
          label: 'Level 3: Advanced',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: level,
          color: 'bg-stone-100 text-stone-800 border-stone-200',
        };
    }
  };

  const badge = getLevelBadge(persona.userLevel);

  // Extract client message trajectory for Recharts
  const chartData: ChartDataPoint[] = useMemo(() => {
    const clientMessages = messages.filter((m) => m.role === 'assistant');
    if (clientMessages.length === 0) {
      return [
        {
          turnName: 'Start',
          turnIndex: 1,
          valence: -2.0,
          emotion: currentEmotion || 'Hesitant & Guarded',
          time: '0:00',
          preview: persona.openingMessage.slice(0, 45) + '...',
        },
      ];
    }

    return clientMessages.map((msg, idx) => {
      const valenceValue =
        typeof msg.emotionalValence === 'number'
          ? msg.emotionalValence
          : getValenceFromEmotion(msg.emotionalState);

      return {
        turnName: `T${idx + 1}`,
        turnIndex: idx + 1,
        valence: Number(valenceValue.toFixed(1)),
        emotion: msg.emotionalState || (idx === 0 ? 'Hesitant & Guarded' : 'Processing'),
        time: msg.timestamp || `Turn ${idx + 1}`,
        preview: msg.content.slice(0, 50) + '...',
      };
    });
  }, [messages, currentEmotion, persona.openingMessage]);

  // Calculate valence delta (trajectory)
  const trajectoryDelta = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].valence;
    const last = chartData[chartData.length - 1].valence;
    const diff = Number((last - first).toFixed(1));
    return diff;
  }, [chartData]);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataPoint = payload[0].payload;
      const isPositive = data.valence > 0;
      const isNeutral = data.valence === 0;

      return (
        <div className="bg-stone-900 text-stone-100 p-2.5 rounded-xl shadow-xl border border-stone-700 text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-teal-300">{data.turnName} (Turn {data.turnIndex})</span>
            <span className="text-[10px] text-stone-400">{data.time}</span>
          </div>
          <div className="text-stone-300 mb-1 text-[11px]">
            Emotion: <span className="font-semibold text-white">{data.emotion}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800 text-[11px]">
            <span className="text-stone-400">Valence Score:</span>
            <span
              className={`font-mono font-bold ${
                isPositive
                  ? 'text-emerald-400'
                  : isNeutral
                  ? 'text-stone-300'
                  : 'text-amber-400'
              }`}
            >
              {data.valence > 0 ? `+${data.valence}` : data.valence} / 5
            </span>
          </div>
          <div className="mt-1 text-[10px] text-stone-400 italic line-clamp-1">
            "{data.preview}"
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section 
      aria-label="Scenario Briefing" 
      className="bg-white border-b border-stone-200 transition-all duration-200 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Compact Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-2xs ${persona.avatarBg}`}>
              {persona.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-stone-900">
                  {persona.name}
                </h1>
                <span className="text-xs text-stone-500 font-medium">
                  • {persona.role} {persona.age ? `(${persona.age} y/o)` : ''}
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-1">
                <span className="font-semibold text-stone-700">Scenario:</span> {persona.scenarioTitle}
              </p>
            </div>
          </div>

          {/* Emotional State, Trajectory Badge & Metrics */}
          <div className="flex items-center gap-2.5 ml-auto sm:ml-0 flex-wrap">
            {/* Live Client Emotional State */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>State:</span>
              <span className="font-semibold">{currentEmotion}</span>
            </div>

            {/* Valence Shift Indicator */}
            {trajectoryDelta !== null && (
              <div
                className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  trajectoryDelta > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : trajectoryDelta < 0
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
                title="Client emotional valence shift since opening turn"
              >
                <TrendingUp className={`w-3.5 h-3.5 ${trajectoryDelta < 0 ? 'rotate-180 text-rose-600' : 'text-emerald-600'}`} />
                <span>Valence: {trajectoryDelta > 0 ? `+${trajectoryDelta}` : trajectoryDelta}</span>
              </div>
            )}

            {/* Timer & Turn count */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {formatTime(sessionDuration)}
              </span>
              <span>•</span>
              <span>{messageCount} turns</span>
            </div>

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Briefing & Valence'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Detailed Briefing & Valence Chart Expandable Area */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs text-stone-700">
            {/* Column 1: Background Narrative & Demeanor */}
            <div className="lg:col-span-4 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <AlertCircle className="w-3.5 h-3.5 text-teal-700" />
                <span>Client Presentation & Context</span>
              </div>
              <p className="leading-relaxed text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 line-clamp-4 hover:line-clamp-none transition-all">
                {persona.background}
              </p>
              <div className="text-[11px] text-stone-500 flex items-start gap-1 bg-stone-50/70 p-2 rounded-lg border border-stone-200">
                <span className="font-semibold text-stone-800 shrink-0">Tone:</span>
                <span>{persona.tone}</span>
              </div>
            </div>

            {/* Column 2: Emotional Valence Recharts Line Chart */}
            <div className="lg:col-span-5 space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                  <Activity className="w-3.5 h-3.5 text-teal-700" />
                  <span>Emotional Valence Trajectory</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>+5 Heard</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <span>0 Neutral</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>-5 Distress</span>
                  </span>
                </div>
              </div>

              {/* Recharts Container */}
              <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200 flex-1 flex flex-col justify-between min-h-[160px]">
                <div className="w-full h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 8, right: 12, left: -20, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis
                        dataKey="turnName"
                        tick={{ fontSize: 10, fill: '#78716c' }}
                        tickLine={false}
                        axisLine={{ stroke: '#d6d3d1' }}
                      />
                      <YAxis
                        domain={[-5, 5]}
                        ticks={[-5, -2.5, 0, 2.5, 5]}
                        tick={{ fontSize: 9, fill: '#a8a29e' }}
                        tickLine={false}
                        axisLine={{ stroke: '#d6d3d1' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine
                        y={0}
                        stroke="#a8a29e"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        label={{
                          value: 'Equilibrium (0)',
                          position: 'insideBottomRight',
                          fill: '#a8a29e',
                          fontSize: 9,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="valence"
                        stroke="#0f766e"
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill: '#ffffff',
                          stroke: '#0f766e',
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: '#0f766e',
                          stroke: '#ccfbf1',
                          strokeWidth: 2,
                        }}
                        isAnimationActive={true}
                        animationDuration={400}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Trajectory micro-footer */}
                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/80">
                  <span>
                    {chartData.length} measured {chartData.length === 1 ? 'turn' : 'turns'}
                  </span>
                  <span>
                    {trajectoryDelta !== null && trajectoryDelta > 0 ? (
                      <span className="text-emerald-700 font-semibold">
                        Positive de-escalation trend (+{trajectoryDelta})
                      </span>
                    ) : trajectoryDelta !== null && trajectoryDelta < 0 ? (
                      <span className="text-rose-700 font-semibold">
                        Heightened resistance/distress ({trajectoryDelta})
                      </span>
                    ) : (
                      <span className="text-stone-500">Awaiting further trainee interaction</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Trainee Competency Checklist */}
            <div className="lg:col-span-3 space-y-2 flex flex-col">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <Target className="w-3.5 h-3.5 text-indigo-700" />
                <span>Practice Checklist</span>
              </div>
              <div className="space-y-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex-1 overflow-y-auto max-h-[160px]">
                {persona.traineeChecklist && persona.traineeChecklist.length > 0 ? (
                  persona.traineeChecklist.map((goal, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleObjective(idx)}
                      className="w-full text-left flex items-start gap-2 hover:text-stone-950 transition-colors cursor-pointer text-xs"
                    >
                      {completedObjectives[idx] ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      )}
                      <span className={completedObjectives[idx] ? 'line-through text-stone-400' : 'text-stone-700 font-medium'}>
                        {goal}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-stone-500 italic">Practice active listening, feeling reflection, and non-directive validation.</p>
                )}
              </div>
              <p className="text-[10px] text-stone-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span>Click objectives as you demonstrate them in chat.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
