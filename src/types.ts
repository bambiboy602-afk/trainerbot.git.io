export type Role = 'user' | 'assistant' | 'system';

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface MentorFeedback {
  techniqueObserved: string;
  toneRating: 'Excellent' | 'Effective' | 'Constructive' | 'Needs Adjustment';
  coachingInsight: string;
  suggestedAlternative?: string;
  frameworkUsed?: string;
}

export type GeminiChatModelMode = 'fast' | 'general' | 'complex';

export type ChatbotRolePreset =
  | 'persona_learner'
  | 'de_escalation_coach'
  | 'social_skills_tutor'
  | 'medical_mentor'
  | 'research_analyst'
  | 'relationship_safety_advocate';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  scenarioId?: string;
  scenarioTitle?: string;
  analyzed?: boolean;
  modelUsed?: string;
  groundingSources?: GroundingSource[];
  isVoiceTurn?: boolean;
  mentorFeedback?: MentorFeedback;
}

export type TraitCategory =
  | 'communication'
  | 'reasoning'
  | 'preferences'
  | 'decision_making'
  | 'quirks'
  | 'social_empathy'
  | 'regulation';

export interface TraitSpectrum {
  id: string;
  category: TraitCategory;
  leftLabel: string;
  rightLabel: string;
  score: number; // 0 to 100 (e.g. 0 = purely Left, 100 = purely Right)
  summary: string;
  confidence: 'emerging' | 'moderate' | 'high';
  observedEvidence: string[]; // actual quotes or behaviors
}

export interface ObservedTrait {
  id: string;
  category: TraitCategory;
  title: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  supportingQuotes: string[];
}

export interface PersonaProfile {
  lastUpdated: number;
  messageCountAnalyzed: number;
  completenessScore: number; // 0 - 100
  overallSummary: string;
  spectrums: TraitSpectrum[];
  detailedTraits: ObservedTrait[];
  signaturePhrases: string[];
  cognitiveStyleSummary: string;
  decisionMakingRules: string[];
  communicationDosAndDonts: {
    dos: string[];
    donts: string[];
  };
  socialGrowthFeedback?: {
    strengths: string[];
    growthAreas: string[];
    deEscalationScore?: number; // 0-100
    empathyScore?: number; // 0-100
  };
  progressHistory?: ProgressSnapshot[];
}

export interface ProgressSnapshot {
  id: string;
  timestamp: number;
  messageCount: number;
  empathy: number;        // 0 - 100
  assertiveness: number;  // 0 - 100 (boundary strength & clarity)
  clarity: number;        // 0 - 100 (directness, coherence, precision)
  deEscalation: number;   // 0 - 100 (calmness, regulation under pressure)
  activeListening: number;// 0 - 100 (reflecting emotional needs)
  label?: string;         // e.g. "Session 1", "After Roleplay 2"
}

export type ScenarioCategory =
  | 'all'
  | 'social_skills'      // Social disabilities, neurodiversity, tone perception, small talk, boundaries
  | 'mental_health'      // Peer support, clinical excavation, de-escalation, crisis regulation, therapist/counselor
  | 'medical_clinical'   // Healthcare, patient communication, triage, bedside manner, clinical boundaries
  | 'customer_relations' // Customer service, retail/helpdesk, angry clients, refunds, hospitality
  | 'workplace_conflict' // Performance reviews, credit-stealing, boundary with managers, team friction
  | 'parenting_family'   // Family dynamics, co-parenting, teen communication, elder care, in-laws
  | 'ethics'             // Moral dilemmas, whistleblowing, AI safety, corporate integrity
  | 'crisis'             // Urgent time-pressured calls, product launch bugs, high-stakes decisions
  | 'leadership'         // Resource allocation, organizational strategy, executive decisions
  | 'negotiation'        // Commercial hardball, scope creep, salary advocacy, contracts
  | 'interpersonal'      // Candid philosophy, deep self-reflection, relationship dynamics
  | 'relationship_safety' // Domestic violence navigation, coercive control de-escalation, safety planning & safe exit strategies
  | 'custom';

export type UserSkillDomain =
  | 'all'
  | 'social_disabilities'
  | 'mental_health_pros'
  | 'medical_healthcare'
  | 'customer_support'
  | 'workplace_leaders'
  | 'family_dynamics'
  | 'general';

export interface ScenarioEvaluation {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  timestamp: number;
  // Quantitative ratings (1-5 stars)
  realismRating: number;         // 1-5: How authentic did the bot feel?
  rolePerformanceRating: number; // 1-5: How well did it challenge / push / support according to role?
  challengeRating: number;       // 1-5: Was the pressure / nuance calibrated appropriately?
  empathyTestingRating: number;  // 1-5: Did it trigger genuine emotional or decision tension?
  // Qualitative feedback
  whatWorkedWell: string;
  whatFeltRoboticOrArtificial: string;
  suggestionsForImprovement: string;
  // Specific persona generation adjustment directives
  desiredAdjustments: {
    moreHumanVulnerability?: boolean;
    lessFormalOrAcademic?: boolean;
    higherDirectPushback?: boolean;
    moreNuancedSocialCues?: boolean;
    betterEmotionalDeEscalation?: boolean;
  };
}

export type ScenarioDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface DecisionBranch {
  id: string;
  label: string; // e.g. "Branch A: Firm 'Grey Rock' De-escalation"
  userResponseText: string; // The concrete dialogue spoken by user
  consequenceSummary: string; // Psychological effect on counterpart
  aiDialogueTone: string; // Tone of AI (e.g. "De-escalated & guarded", "Hostile & accusatory")
  projectedOutcome: string; // What happens in the interaction
  tags?: string[]; // e.g. ['De-escalation', 'Boundary', 'Active Listening']
  branchPathTranscriptSnippet?: string; // Divergent response snippet
}

export interface DecisionNode {
  id: string;
  turnIndex: number; // Index in message history where decision occurred
  nodeTitle: string; // e.g. "Crossroads: Response to Intimidation"
  situationContext: string; // What was said right before this decision
  branches: DecisionBranch[];
  chosenBranchId?: string; // Which branch was selected in this specific simulation run
}

export interface DecisionBranchContext {
  branchId: string;
  label: string;
  userResponseText?: string;
  consequenceSummary?: string;
  aiDialogueTone?: string;
  nodeTitle?: string;
  forkTurnIndex?: number;
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  targetDomain?: UserSkillDomain;
  description: string;
  aiRole: string;
  userRole: string;
  objective: string;
  starterPrompt: string;
  learningFocus: string; // What this scenario reveals about the user
  difficulty?: ScenarioDifficulty;
  coachingTips?: string[]; // Helpful prompts for social learners, professionals, or reps
  safetyNotice?: boolean;
  hotlineInfo?: { name: string; contact: string; url?: string };
  decisionTree?: DecisionNode[]; // Built-in Choose Your Own Adventure decision tree
}

export interface ScenarioSessionTranscript {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  scenarioCategory: ScenarioCategory;
  scenarioDifficulty?: ScenarioDifficulty;
  scenarioAiRole: string;
  scenarioUserRole: string;
  objective?: string;
  learningFocus?: string;
  startedAt: number;
  completedAt: number;
  messages: ChatMessage[];
  evaluation?: ScenarioEvaluation;
  isEmergencyExit?: boolean;
  exitNote?: string;
  decisionNodes?: DecisionNode[]; // CYOA decision nodes for this transcript
  currentBranchPath?: string[]; // e.g. ['branch-a', 'branch-b']
  parentTranscriptId?: string; // ID of the session this run was branched from
  branchForkTurnIndex?: number; // Turn index at which the simulation branched
  forkedFromBranchLabel?: string; // Label of the branch used for simulation
}

export interface MilestoneBadge {
  id: string;
  name: string;
  category: 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'experience';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  description: string;
  coachingTip: string;
  thresholdMetric: 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'messages';
  thresholdScore: number;
  currentScore: number;
  isUnlocked: boolean;
  progressPercent: number; // 0 to 100
  unlockedAt?: number;
}

export interface BotExportFormats {
  systemPromptMarkdown: string;
  structuredXmlPrompt: string;
  characterCardJson: {
    name: string;
    description: string;
    personality: string;
    first_mes: string;
    mes_example: string;
    scenario: string;
    system_prompt: string;
  };
  ollamaModelfile: string;
  fewShotExamples: {
    userExample: string;
    botReasoningStyle: string;
  }[];
  executablePythonScript?: string;
  executableNodeScript?: string;
}
