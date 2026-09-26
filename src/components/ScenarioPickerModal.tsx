import React, { useState } from 'react';
import {
  X,
  Theater,
  Sparkles,
  Zap,
  Target,
  Flame,
  ArrowRight,
  Filter,
  CheckCircle2,
  HeartHandshake,
  Stethoscope,
  Headphones,
  Users,
  Compass,
  Lightbulb,
  ShieldAlert,
  Gauge,
  History,
  Search,
  Tag,
  RotateCcw,
  Activity,
  Briefcase,
  Home,
  Scale,
  MessageCircle
} from 'lucide-react';
import {
  Scenario,
  PersonaProfile,
  ScenarioCategory,
  ScenarioEvaluation,
  ScenarioDifficulty,
  ScenarioSessionTranscript
} from '../types';
import { DEFAULT_SCENARIOS } from '../data/defaultScenarios';

const POPULAR_KEYWORDS = [
  'domestic violence',
  'safety planning',
  'medical',
  'conflict',
  'parenting',
  'management',
  'performance',
  'de-escalation',
  'boundaries',
  'negotiation',
  'ethics',
  'sensory',
  'leadership',
  'diagnosis'
];

interface ScenarioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: Scenario) => void;
  activeScenarioId?: string;
  profile: PersonaProfile;
  customScenarios: Scenario[];
  onSaveCustomScenario: (scenario: Scenario) => void;
  evaluations?: ScenarioEvaluation[];
  transcripts?: ScenarioSessionTranscript[];
  onOpenTranscriptReplay?: (scenarioId?: string) => void;
}

export const ScenarioPickerModal: React.FC<ScenarioPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  activeScenarioId,
  profile,
  customScenarios,
  onSaveCustomScenario,
  evaluations = [],
  transcripts = [],
  onOpenTranscriptReplay
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | ScenarioDifficulty>('all');
  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  if (!isOpen) return null;

  const allScenarios = [...DEFAULT_SCENARIOS, ...customScenarios];

  const normalizeDifficulty = (diff?: string): ScenarioDifficulty => {
    if (!diff) return 'Intermediate';
    if (diff === 'Beginner' || diff === 'supportive' || diff === 'casual') return 'Beginner';
    if (diff === 'Advanced' || diff === 'intense') return 'Advanced';
    return 'Intermediate';
  };

  const filteredScenarios = allScenarios.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const diff = normalizeDifficulty(s.difficulty);
    const matchesDifficulty = selectedDifficulty === 'all' || diff === selectedDifficulty;
    if (!matchesCategory || !matchesDifficulty) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const queryTokens = query.split(/\s+/).filter(Boolean);

    const categoryAliases: Record<string, string[]> = {
      social_skills: ['social', 'neurodivergent', 'sensory', 'small talk', 'cues', 'autism', 'adhd', 'overwhelm', 'monologue', 'criticism', 'boundaries'],
      mental_health: ['mental health', 'peer', 'support', 'crisis', 'suicide', 'shame', 'relapse', 'therapy', 'counseling', 'panic', 'co-regulation', 'trauma', 'de-escalation'],
      medical_clinical: ['medical', 'clinical', 'doctor', 'nurse', 'physician', 'hospital', 'patient', 'oncology', 'diagnosis', 'triage', 'spikes', 'er', 'healthcare', 'dosage', 'error'],
      customer_relations: ['customer', 'support', 'angry', 'client', 'subscriber', 'escalation', 'complaint', 'refund', 'service', 'overcharge', 'viral', 'social media', 'pr'],
      workplace_conflict: ['workplace', 'conflict', 'performance', 'pip', 'manager', 'peer', 'credit', 'promotion', 'raise', 'burnout', 'feedback', 'review'],
      parenting_family: ['parenting', 'family', 'teen', 'teenager', 'in-laws', 'co-parenting', 'discipline', 'kids', 'screen time', 'home', 'boundaries'],
      ethics: ['ethics', 'ethical', 'whistleblower', 'ai safety', 'scraping', 'privacy', 'medical device', 'compliance', 'morals', 'integrity'],
      leadership: ['leadership', 'executive', 'management', 'manager', 'lead', 'budget', 'pivot', 'team', 'resource', 'strategy'],
      negotiation: ['negotiation', 'commercial', 'contract', 'scope creep', 'freelance', 'lease', 'landlord', 'hardball', 'pricing', 'discount'],
      crisis: ['crisis', 'launch', 'deadline', 'emergency', 'bug', 'high stakes', 'triage'],
      interpersonal: ['interpersonal', 'philosophy', 'beliefs', 'reflection', 'dialogue', 'curiosity'],
      relationship_safety: [
        'domestic violence',
        'abusive relationship',
        'abusive',
        'dv',
        'safety planning',
        'safe exit',
        'coercive control',
        'leaving',
        'toxic relationship',
        'gaslighting',
        'survivor',
        'hotline',
        'advocate',
        'grey rock',
        'isolation',
        'boundaries',
        'intimate partner',
        'escape'
      ]
    };

    const searchableFields = [
      s.title,
      s.description,
      s.aiRole,
      s.userRole,
      s.objective,
      s.learningFocus,
      s.category,
      s.category.replace(/_/g, ' '),
      s.difficulty || '',
      s.targetDomain || '',
      ...(s.coachingTips || []),
      ...(categoryAliases[s.category] || [])
    ].map((txt) => (txt || '').toLowerCase());

    return queryTokens.every((token) =>
      searchableFields.some((field) => field.includes(token))
    );
  });

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all';

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  const beginnerCount = allScenarios.filter(
    (s) => normalizeDifficulty(s.difficulty) === 'Beginner'
  ).length;
  const intermediateCount = allScenarios.filter(
    (s) => normalizeDifficulty(s.difficulty) === 'Intermediate'
  ).length;
  const advancedCount = allScenarios.filter(
    (s) => normalizeDifficulty(s.difficulty) === 'Advanced'
  ).length;

  const handleGenerateCustom = async (targetTrait?: string) => {
    setIsGeneratingCustom(true);
    setGeneratorError(null);
    try {
      const res = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          desiredTopic: customTopic.trim() || undefined,
          targetTrait: targetTrait || undefined,
          evaluations
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate scenario');
      }

      if (data.scenario) {
        onSaveCustomScenario(data.scenario);
        onSelectScenario(data.scenario);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setGeneratorError(err.message || 'Error creating scenario');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    const diff = normalizeDifficulty(difficulty);
    switch (diff) {
      case 'Beginner':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
            title="Beginner: Low-stakes, supportive communication and foundational practice"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Beginner</span>
          </span>
        );
      case 'Intermediate':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs"
            title="Intermediate: Nuanced conflict, policy balancing, and assertive boundary setting"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Intermediate</span>
          </span>
        );
      case 'Advanced':
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs"
            title="Advanced: High-pressure crisis, intense emotion, or acute strategic dilemmas"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
            <span>Advanced</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: ScenarioCategory) => {
    switch (cat) {
      case 'medical_clinical':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Medical & Clinical
          </span>
        );
      case 'workplace_conflict':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            Workplace Conflict
          </span>
        );
      case 'parenting_family':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Family & Parenting
          </span>
        );
      case 'social_skills':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Social Skills
          </span>
        );
      case 'mental_health':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
            Mental Health
          </span>
        );
      case 'customer_relations':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
            Customer Relations
          </span>
        );
      case 'ethics':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300">
            Ethics & Integrity
          </span>
        );
      case 'negotiation':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            Negotiation
          </span>
        );
      case 'leadership':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
            Leadership
          </span>
        );
      case 'crisis':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-300">
            Crisis
          </span>
        );
      case 'interpersonal':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Interpersonal
          </span>
        );
      case 'relationship_safety':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
            Relationship Safety & DV
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
            {cat.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const categoriesConfig: {
    id: ScenarioCategory;
    label: string;
    icon: React.ReactNode;
    color: string;
    badgeCount: number;
  }[] = [
    {
      id: 'all',
      label: 'All Scenarios',
      icon: <Theater className="w-3.5 h-3.5" />,
      color: 'stone',
      badgeCount: allScenarios.length
    },
    {
      id: 'medical_clinical',
      label: 'Medical & Clinical Healthcare',
      icon: <Activity className="w-3.5 h-3.5 text-rose-600" />,
      color: 'rose',
      badgeCount: allScenarios.filter((s) => s.category === 'medical_clinical').length
    },
    {
      id: 'workplace_conflict',
      label: 'Workplace Conflict & Performance',
      icon: <Briefcase className="w-3.5 h-3.5 text-indigo-600" />,
      color: 'indigo',
      badgeCount: allScenarios.filter((s) => s.category === 'workplace_conflict').length
    },
    {
      id: 'parenting_family',
      label: 'Family & Parenting Dynamics',
      icon: <Home className="w-3.5 h-3.5 text-amber-600" />,
      color: 'amber',
      badgeCount: allScenarios.filter((s) => s.category === 'parenting_family').length
    },
    {
      id: 'social_skills',
      label: 'Social Skills & Neurodiversity',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />,
      color: 'emerald',
      badgeCount: allScenarios.filter((s) => s.category === 'social_skills').length
    },
    {
      id: 'mental_health',
      label: 'Mental Health & Peer Support',
      icon: <Stethoscope className="w-3.5 h-3.5 text-teal-600" />,
      color: 'teal',
      badgeCount: allScenarios.filter((s) => s.category === 'mental_health').length
    },
    {
      id: 'customer_relations',
      label: 'Customer Relations & Support',
      icon: <Headphones className="w-3.5 h-3.5 text-sky-600" />,
      color: 'sky',
      badgeCount: allScenarios.filter((s) => s.category === 'customer_relations').length
    },
    {
      id: 'leadership',
      label: 'Leadership & Strategy',
      icon: <Users className="w-3.5 h-3.5 text-amber-600" />,
      color: 'amber',
      badgeCount: allScenarios.filter((s) => s.category === 'leadership').length
    },
    {
      id: 'negotiation',
      label: 'Negotiation & Contracts',
      icon: <Zap className="w-3.5 h-3.5 text-purple-600" />,
      color: 'purple',
      badgeCount: allScenarios.filter((s) => s.category === 'negotiation').length
    },
    {
      id: 'ethics',
      label: 'Ethics & Integrity',
      icon: <Scale className="w-3.5 h-3.5 text-emerald-700" />,
      color: 'emerald',
      badgeCount: allScenarios.filter((s) => s.category === 'ethics').length
    },
    {
      id: 'crisis',
      label: 'Crisis & High Stakes',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
      color: 'rose',
      badgeCount: allScenarios.filter((s) => s.category === 'crisis').length
    },
    {
      id: 'interpersonal',
      label: 'Interpersonal & Philosophy',
      icon: <MessageCircle className="w-3.5 h-3.5 text-blue-600" />,
      color: 'blue',
      badgeCount: allScenarios.filter((s) => s.category === 'interpersonal').length
    },
    {
      id: 'relationship_safety',
      label: 'Relationship Safety & Domestic Violence (DV)',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
      color: 'rose',
      badgeCount: allScenarios.filter((s) => s.category === 'relationship_safety').length
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <Theater className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Scenario Lab: Communication, Clinical, Conflict & Leadership Simulations
              </h2>
              <p className="text-xs text-stone-500">
                Safe practice for medical & clinical triage, workplace conflict, family dynamics, neurodiversity, peer support, ethics, and negotiation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {transcripts && transcripts.length > 0 && onOpenTranscriptReplay && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTranscriptReplay();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer border border-stone-200"
                title="View step-by-step transcript replays of past completed scenarios"
              >
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Transcript Replays ({transcripts.length})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Scenario Generator Bar */}
        <div className="px-6 py-3.5 bg-amber-50/50 border-b border-amber-200/60">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Or generate a custom scenario: e.g. Practicing grocery store small talk, calming an angry airline passenger..."
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-stone-300 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
              <button
                onClick={() => handleGenerateCustom()}
                disabled={isGeneratingCustom}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingCustom ? 'Generating...' : 'Generate AI Scenario'}</span>
              </button>
            </div>

            <button
              onClick={() =>
                handleGenerateCustom(
                  'Test unmeasured empathy, social de-escalation, and boundary communication'
                )
              }
              disabled={isGeneratingCustom}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-amber-900 hover:bg-amber-100/60 transition-all cursor-pointer whitespace-nowrap"
              title="AI will examine your current profile and craft a scenario to fill in unknown traits"
            >
              <Target className="w-3.5 h-3.5 text-amber-700" />
              <span>Target My Learning Gaps</span>
            </button>
          </div>
          {generatorError && (
            <p className="text-xs text-rose-600 mt-2 font-medium">{generatorError}</p>
          )}
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="px-6 py-3 border-b border-stone-200 bg-stone-50/70 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scenarios by keywords (e.g. 'management', 'conflict', 'medical', 'feedback', 'sensory')..."
                className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                  title="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results count & Clear filters */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-xs font-semibold text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                Showing <span className="text-amber-700 font-bold">{filteredScenarios.length}</span> of {allScenarios.length}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetAllFilters}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  title="Reset search and filters"
                >
                  <RotateCcw className="w-3 h-3 text-stone-500" />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* Suggested Keyword Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-0.5 scrollbar-none">
            <span className="text-stone-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
              <Tag className="w-3 h-3 text-stone-400" /> Popular keywords:
            </span>
            {POPULAR_KEYWORDS.map((keyword) => {
              const isSelected = searchQuery.toLowerCase().includes(keyword.toLowerCase());
              return (
                <button
                  key={keyword}
                  onClick={() => {
                    if (isSelected) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(keyword);
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border text-[11px] ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-700 font-semibold shadow-2xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  #{keyword}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Domain & Difficulty Filters Bar */}
        <div className="px-6 py-2.5 border-b border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
          {/* Domain Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium pb-1 lg:pb-0">
            <span className="text-stone-400 flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Domain:
            </span>
            {categoriesConfig.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white font-semibold shadow-xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {cat.badgeCount}
                </span>
              </button>
            ))}
          </div>

          {/* Difficulty Level Filter */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium pt-1.5 lg:pt-0 border-t lg:border-t-0 border-stone-100">
            <span className="text-stone-400 flex items-center gap-1 mr-1 shrink-0 font-semibold">
              <Gauge className="w-3.5 h-3.5 text-stone-500" /> Level:
            </span>
            {[
              { id: 'all', label: 'All Levels', count: allScenarios.length },
              { id: 'Beginner', label: 'Beginner', count: beginnerCount },
              { id: 'Intermediate', label: 'Intermediate', count: intermediateCount },
              { id: 'Advanced', label: 'Advanced', count: advancedCount }
            ].map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              let selectedStyle = 'bg-stone-900 text-white shadow-xs';
              if (diff.id === 'Beginner') selectedStyle = 'bg-emerald-700 text-white shadow-xs';
              if (diff.id === 'Intermediate') selectedStyle = 'bg-sky-700 text-white shadow-xs';
              if (diff.id === 'Advanced') selectedStyle = 'bg-rose-700 text-white shadow-xs';

              return (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? selectedStyle
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{diff.label}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'text-stone-500'
                    }`}
                  >
                    {diff.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
          {/* Domestic Violence Crisis Resources Banner */}
          {(selectedCategory === 'relationship_safety' ||
            searchQuery.toLowerCase().includes('domestic') ||
            searchQuery.toLowerCase().includes('abusive') ||
            searchQuery.toLowerCase().includes('violence') ||
            searchQuery.toLowerCase().includes('safety plan')) && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">Domestic Violence Confidential Crisis Resources</h4>
                  <p className="text-rose-800 text-xs mt-0.5">
                    If you or someone you know is in danger or needs immediate help, call <strong>911</strong> or contact the{' '}
                    <strong>National Domestic Violence Hotline</strong>: Call <strong>1-800-799-SAFE (7233)</strong> or text{' '}
                    <strong>START</strong> to <strong>88788</strong> (24/7, free, confidential).
                  </p>
                </div>
              </div>
              <a
                href="https://www.thehotline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                Visit TheHotline.org
              </a>
            </div>
          )}

          {filteredScenarios.length === 0 ? (
            <div className="text-center py-12 px-4 max-w-md mx-auto">
              <Compass className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-800">
                {searchQuery
                  ? `No scenarios found matching "${searchQuery}"`
                  : 'No scenarios matching current filters'}
              </h4>
              <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
                {searchQuery
                  ? `Try a broader keyword, reset your category/difficulty filters, or let AI generate a scenario matching "${searchQuery}".`
                  : 'Try selecting a different domain or difficulty level, or generate a custom AI scenario.'}
              </p>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <button
                  onClick={handleResetAllFilters}
                  className="px-3.5 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg shadow-xs cursor-pointer hover:bg-stone-800"
                >
                  Reset Search & Filters
                </button>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setCustomTopic(searchQuery);
                      handleGenerateCustom(searchQuery);
                    }}
                    disabled={isGeneratingCustom}
                    className="px-3.5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Scenario for "{searchQuery}"</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScenarios.map((scenario) => {
                const isActive = scenario.id === activeScenarioId;
                const matchingTranscript = transcripts.find((t) => t.scenarioId === scenario.id);
                return (
                  <div
                    key={scenario.id}
                    className={`relative rounded-xl border p-4.5 flex flex-col justify-between transition-all group ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getCategoryBadge(scenario.category)}
                        {getDifficultyBadge(scenario.difficulty)}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
                        {scenario.title}
                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 inline" />
                        )}
                      </h3>

                      <p className="text-xs text-stone-600 line-clamp-3 mb-3 leading-relaxed">
                        {scenario.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 rounded-lg p-2.5 border border-stone-200/70 mb-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-stone-900 shrink-0">AI Persona:</span>
                          <span className="text-stone-600 line-clamp-1">{scenario.aiRole}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-stone-900 shrink-0">Your Role:</span>
                          <span className="text-stone-600 line-clamp-1">{scenario.userRole}</span>
                        </div>
                      </div>

                      {/* Coaching Tips if available */}
                      {scenario.coachingTips && scenario.coachingTips.length > 0 && (
                        <div className="mb-3 p-2 bg-amber-50/60 rounded-lg border border-amber-200/50 text-[11px] text-amber-950">
                          <div className="flex items-center gap-1 font-semibold text-amber-900 mb-1">
                            <Lightbulb className="w-3 h-3 text-amber-600" />
                            <span>Practice Guidance:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-amber-900/80">
                            {scenario.coachingTips.slice(0, 2).map((tip, idx) => (
                              <li key={idx} className="line-clamp-1">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-start gap-1.5 text-[11px] text-stone-600 font-medium mb-4">
                        <Target className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>Focus: {scenario.learningFocus}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {matchingTranscript && onOpenTranscriptReplay && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenTranscriptReplay(matchingTranscript.id);
                          }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 transition-all cursor-pointer"
                          title="Review step-by-step transcript replay of your previous run"
                        >
                          <History className="w-3.5 h-3.5 text-amber-600" />
                          <span>Replay Past Transcript ({matchingTranscript.messages.length} turns)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectScenario(scenario);
                          onClose();
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                      >
                        <span>{isActive ? 'Current Scenario (Resume Session)' : 'Launch This Scenario'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
