package com.example.model

import kotlinx.serialization.Serializable

@Serializable
data class GroundingSource(
    val title: String? = null,
    val uri: String? = null
)

@Serializable
data class MentorFeedback(
    val techniqueObserved: String,
    val toneRating: String, // 'Excellent' | 'Effective' | 'Constructive' | 'Needs Adjustment'
    val coachingInsight: String,
    val suggestedAlternative: String? = null,
    val frameworkUsed: String? = null
)

@Serializable
data class ChatMessage(
    val id: String,
    val role: String, // 'user' | 'assistant' | 'system'
    val content: String,
    val timestamp: Long,
    val scenarioId: String? = null,
    val scenarioTitle: String? = null,
    val analyzed: Boolean = false,
    val modelUsed: String? = null,
    val groundingSources: List<GroundingSource>? = null,
    val isVoiceTurn: Boolean = false,
    val mentorFeedback: MentorFeedback? = null
)

@Serializable
data class TraitSpectrum(
    val id: String,
    val category: String,
    val leftLabel: String,
    val rightLabel: String,
    val score: Int, // 0 to 100
    val summary: String,
    val confidence: String, // 'emerging' | 'moderate' | 'high'
    val observedEvidence: List<String>
)

@Serializable
data class ObservedTrait(
    val id: String,
    val category: String,
    val title: String,
    val description: String,
    val confidence: String, // 'low' | 'medium' | 'high'
    val supportingQuotes: List<String>
)

@Serializable
data class CommunicationDosAndDonts(
    val dos: List<String> = emptyList(),
    val donts: List<String> = emptyList()
)

@Serializable
data class SocialGrowthFeedback(
    val strengths: List<String> = emptyList(),
    val growthAreas: List<String> = emptyList(),
    val deEscalationScore: Int? = null,
    val empathyScore: Int? = null
)

@Serializable
data class ProgressSnapshot(
    val id: String,
    val timestamp: Long,
    val messageCount: Int,
    val empathy: Int,        // 0 - 100
    val assertiveness: Int,  // 0 - 100
    val clarity: Int,        // 0 - 100
    val deEscalation: Int,   // 0 - 100
    val activeListening: Int, // 0 - 100
    val label: String? = null
)

@Serializable
data class PersonaProfile(
    val lastUpdated: Long = 0,
    val messageCountAnalyzed: Int = 0,
    val completenessScore: Int = 0, // 0 - 100
    val overallSummary: String = "",
    val spectrums: List<TraitSpectrum> = emptyList(),
    val detailedTraits: List<ObservedTrait> = emptyList(),
    val signaturePhrases: List<String> = emptyList(),
    val cognitiveStyleSummary: String = "",
    val decisionMakingRules: List<String> = emptyList(),
    val communicationDosAndDonts: CommunicationDosAndDonts = CommunicationDosAndDonts(),
    val socialGrowthFeedback: SocialGrowthFeedback? = null,
    val progressHistory: List<ProgressSnapshot> = emptyList()
)

@Serializable
data class ScenarioEvaluation(
    val id: String,
    val scenarioId: String,
    val scenarioTitle: String,
    val timestamp: Long,
    val realismRating: Int,         // 1-5
    val rolePerformanceRating: Int, // 1-5
    val challengeRating: Int,       // 1-5
    val empathyTestingRating: Int,  // 1-5
    val whatWorkedWell: String,
    val whatFeltRoboticOrArtificial: String,
    val suggestionsForImprovement: String,
    val desiredAdjustments: DesiredAdjustments = DesiredAdjustments()
)

@Serializable
data class DesiredAdjustments(
    val moreHumanVulnerability: Boolean = false,
    val lessFormalOrAcademic: Boolean = false,
    val higherDirectPushback: Boolean = false,
    val moreNuancedSocialCues: Boolean = false,
    val betterEmotionalDeEscalation: Boolean = false
)

@Serializable
data class DecisionBranch(
    val id: String,
    val label: String,
    val userResponseText: String,
    val consequenceSummary: String,
    val aiDialogueTone: String,
    val projectedOutcome: String,
    val tags: List<String>? = null,
    val branchPathTranscriptSnippet: String? = null
)

@Serializable
data class DecisionNode(
    val id: String,
    val turnIndex: Int,
    val nodeTitle: String,
    val situationContext: String,
    val branches: List<DecisionBranch>,
    val chosenBranchId: String? = null
)

@Serializable
data class DecisionBranchContext(
    val branchId: String,
    val label: String,
    val userResponseText: String? = null,
    val consequenceSummary: String? = null,
    val aiDialogueTone: String? = null,
    val nodeTitle: String? = null,
    val forkTurnIndex: Int? = null
)

@Serializable
data class HotlineInfo(
    val name: String,
    val contact: String,
    val url: String? = null
)

@Serializable
data class Scenario(
    val id: String,
    val title: String,
    val category: String, // e.g. 'social_skills', 'mental_health', etc.
    val targetDomain: String? = null,
    val description: String,
    val aiRole: String,
    val userRole: String,
    val objective: String,
    val starterPrompt: String,
    val learningFocus: String,
    val difficulty: String? = "Beginner", // 'Beginner' | 'Intermediate' | 'Advanced'
    val coachingTips: List<String>? = null,
    val safetyNotice: Boolean? = false,
    val hotlineInfo: HotlineInfo? = null,
    val decisionTree: List<DecisionNode>? = null
)

@Serializable
data class ScenarioSessionTranscript(
    val id: String,
    val scenarioId: String,
    val scenarioTitle: String,
    val scenarioCategory: String,
    val scenarioDifficulty: String? = null,
    val scenarioAiRole: String,
    val scenarioUserRole: String,
    val objective: String? = null,
    val learningFocus: String? = null,
    val startedAt: Long,
    val completedAt: Long,
    val messages: List<ChatMessage> = emptyList(),
    val evaluation: ScenarioEvaluation? = null,
    val isEmergencyExit: Boolean = false,
    val exitNote: String? = null,
    val decisionNodes: List<DecisionNode>? = null,
    val currentBranchPath: List<String>? = null,
    val parentTranscriptId: String? = null,
    val branchForkTurnIndex: Int? = null,
    val forkedFromBranchLabel: String? = null
)

@Serializable
data class MilestoneBadge(
    val id: String,
    val name: String,
    val category: String, // 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'experience'
    val tier: String, // 'bronze' | 'silver' | 'gold' | 'platinum'
    val title: String,
    val description: String,
    val coachingTip: String,
    val thresholdMetric: String, // 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'messages'
    val thresholdScore: Int,
    val currentScore: Int,
    val isUnlocked: Boolean,
    val progressPercent: Int, // 0 to 100
    val unlockedAt: Long? = null
)
