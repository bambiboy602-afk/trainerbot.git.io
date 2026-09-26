import { MilestoneBadge, PersonaProfile, ScenarioEvaluation } from '../types';

export interface MilestoneDefinition {
  id: string;
  name: string;
  category: 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'experience';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  description: string;
  coachingTip: string;
  thresholdMetric: 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'messages';
  thresholdScore: number;
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'empathy-explorer',
    name: 'Empathy Explorer',
    category: 'empathy',
    tier: 'bronze',
    title: 'Attuned Listener',
    description: 'Achieve an Empathy score of 60 or higher by acknowledging underlying emotions.',
    coachingTip: 'Validate emotional tone before jumping straight into problem-solving or logistical corrections.',
    thresholdMetric: 'empathy',
    thresholdScore: 60
  },
  {
    id: 'empathy-luminary',
    name: 'Empathy Luminary',
    category: 'empathy',
    tier: 'gold',
    title: 'Emotional Attunement Champion',
    description: 'Achieve an Empathy score of 80 or higher through deep, shame-free supportive validation.',
    coachingTip: 'Demonstrate deep cognitive empathy by naming unspoken tensions and normalizing the other person’s lived experience.',
    thresholdMetric: 'empathy',
    thresholdScore: 80
  },
  {
    id: 'clarity-apprentice',
    name: 'Clarity Apprentice',
    category: 'clarity',
    tier: 'bronze',
    title: 'Coherent Voice',
    description: 'Achieve a Clarity score of 60 or higher with structured, intelligible dialogue.',
    coachingTip: 'Use concise sentences and state your central premise upfront.',
    thresholdMetric: 'clarity',
    thresholdScore: 60
  },
  {
    id: 'clarity-master',
    name: 'Clarity Master',
    category: 'clarity',
    tier: 'gold',
    title: 'Laser-Focused Articulator',
    description: 'Achieve a Clarity score of 80 or higher with zero conversational ambiguity or fluff.',
    coachingTip: 'Distill complex trade-offs into straightforward actionable statements without meandering.',
    thresholdMetric: 'clarity',
    thresholdScore: 80
  },
  {
    id: 'assertive-anchor',
    name: 'Assertive Anchor',
    category: 'assertiveness',
    tier: 'silver',
    title: 'Firm Boundary Setter',
    description: 'Achieve an Assertiveness score of 65 or higher by holding personal and professional boundaries.',
    coachingTip: 'State what you will or won’t do without over-explaining, apologizing, or becoming combative.',
    thresholdMetric: 'assertiveness',
    thresholdScore: 65
  },
  {
    id: 'boundary-architect',
    name: 'Boundary Architect',
    category: 'assertiveness',
    tier: 'gold',
    title: 'Unshakeable Limit Holder',
    description: 'Achieve an Assertiveness score of 85 or higher under high social or emotional pressure.',
    coachingTip: 'When pressured, repeat your core position with calm neutrality rather than negotiating away essential principles.',
    thresholdMetric: 'assertiveness',
    thresholdScore: 85
  },
  {
    id: 'deescalation-guardian',
    name: 'De-escalation Guardian',
    category: 'deEscalation',
    tier: 'silver',
    title: 'Tension Grounder',
    description: 'Achieve a De-escalation score of 65 or higher during volatile or angry scenarios.',
    coachingTip: 'Lower your conversational tempo, adopt a somatic soothing posture, and de-link identity from the friction.',
    thresholdMetric: 'deEscalation',
    thresholdScore: 65
  },
  {
    id: 'crisis-calm-navigator',
    name: 'Crisis Calm Navigator',
    category: 'deEscalation',
    tier: 'platinum',
    title: 'Acute Crisis Anchor',
    description: 'Achieve a De-escalation score of 85 or higher in critical pressure scenarios.',
    coachingTip: 'Master the B.A.M.B.I. Step 1 survival check, urge surfing, and non-confrontational grounding.',
    thresholdMetric: 'deEscalation',
    thresholdScore: 85
  },
  {
    id: 'active-listening-sage',
    name: 'Active Listening Sage',
    category: 'activeListening',
    tier: 'gold',
    title: 'Reflective Resonator',
    description: 'Achieve an Active Listening score of 75 or higher by reflecting needs and asking clarifying questions.',
    coachingTip: 'Mirror back what you heard in your own words to verify mutual understanding before advocating solutions.',
    thresholdMetric: 'activeListening',
    thresholdScore: 75
  },
  {
    id: 'persona-critic',
    name: 'Persona Critic',
    category: 'evaluations',
    tier: 'bronze',
    title: 'First Calibration',
    description: 'Submit at least 1 post-scenario evaluation to refine bot realism and persona generation.',
    coachingTip: 'After completing roleplays, rate the bot’s authenticity and highlight any robotic mannerisms.',
    thresholdMetric: 'evaluations',
    thresholdScore: 1
  },
  {
    id: 'master-evaluator',
    name: 'Master Evaluator',
    category: 'evaluations',
    tier: 'gold',
    title: 'Authenticity Architect',
    description: 'Submit 3 or more post-scenario evaluations to train prompt engineering accuracy.',
    coachingTip: 'Provide nuanced qualitative critiques to permanently eliminate robotic filler words in exports.',
    thresholdMetric: 'evaluations',
    thresholdScore: 3
  },
  {
    id: 'dialogue-veteran',
    name: 'Dialogue Veteran',
    category: 'experience',
    tier: 'silver',
    title: 'Scenario Stalwart',
    description: 'Complete 15 or more conversational turns across practice scenarios.',
    coachingTip: 'Consistent practice across different roles builds conversational resilience and cognitive flexibility.',
    thresholdMetric: 'messages',
    thresholdScore: 15
  }
];

export function computeMilestoneBadges(
  profile: PersonaProfile,
  userMessageCount: number,
  evaluations: ScenarioEvaluation[] = []
): MilestoneBadge[] {
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

  const metricsMap = {
    empathy: currentEmpathy,
    assertiveness: currentAssertiveness,
    clarity: currentClarity,
    deEscalation: currentDeEscalation,
    activeListening: currentActiveListening,
    evaluations: evaluations.length,
    messages: userMessageCount
  };

  return MILESTONE_DEFINITIONS.map((def) => {
    const score = metricsMap[def.thresholdMetric] ?? 0;
    const isUnlocked = score >= def.thresholdScore;
    const progressPercent = Math.min(100, Math.round((score / def.thresholdScore) * 100));

    return {
      ...def,
      currentScore: score,
      isUnlocked,
      progressPercent
    };
  });
}
