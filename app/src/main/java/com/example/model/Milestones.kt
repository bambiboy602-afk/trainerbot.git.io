package com.example.model

data class MilestoneDefinition(
    val id: String,
    val name: String,
    val category: String, // 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'experience'
    val tier: String, // 'bronze' | 'silver' | 'gold' | 'platinum'
    val title: String,
    val description: String,
    val coachingTip: String,
    val thresholdMetric: String, // 'empathy' | 'clarity' | 'assertiveness' | 'deEscalation' | 'activeListening' | 'evaluations' | 'messages'
    val thresholdScore: Int
)

object Milestones {
    val DEFINITIONS = listOf(
        MilestoneDefinition(
            id = "empathy-explorer",
            name = "Empathy Explorer",
            category = "empathy",
            tier = "bronze",
            title = "Attuned Listener",
            description = "Achieve an Empathy score of 60 or higher by acknowledging underlying emotions.",
            coachingTip = "Validate emotional tone before jumping straight into problem-solving or logistical corrections.",
            thresholdMetric = "empathy",
            thresholdScore = 60
        ),
        MilestoneDefinition(
            id = "empathy-luminary",
            name = "Empathy Luminary",
            category = "empathy",
            tier = "gold",
            title = "Emotional Attunement Champion",
            description = "Achieve an Empathy score of 80 or higher through deep, shame-free supportive validation.",
            coachingTip = "Demonstrate deep cognitive empathy by naming unspoken tensions and normalizing the other person’s lived experience.",
            thresholdMetric = "empathy",
            thresholdScore = 80
        ),
        MilestoneDefinition(
            id = "clarity-apprentice",
            name = "Clarity Apprentice",
            category = "clarity",
            tier = "bronze",
            title = "Coherent Voice",
            description = "Achieve a Clarity score of 60 or higher with structured, intelligible dialogue.",
            coachingTip = "Use concise sentences and state your central premise upfront.",
            thresholdMetric = "clarity",
            thresholdScore = 60
        ),
        MilestoneDefinition(
            id = "clarity-master",
            name = "Clarity Master",
            category = "clarity",
            tier = "gold",
            title = "Laser-Focused Articulator",
            description = "Achieve a Clarity score of 80 or higher with zero conversational ambiguity or fluff.",
            coachingTip = "Distill complex trade-offs into straightforward actionable statements without meandering.",
            thresholdMetric = "clarity",
            thresholdScore = 80
        ),
        MilestoneDefinition(
            id = "assertive-anchor",
            name = "Assertive Anchor",
            category = "assertiveness",
            tier = "silver",
            title = "Firm Boundary Setter",
            description = "Achieve an Assertiveness score of 65 or higher by holding personal and professional boundaries.",
            coachingTip = "State what you will or won’t do without over-explaining, apologizing, or becoming combative.",
            thresholdMetric = "assertiveness",
            thresholdScore = 65
        ),
        MilestoneDefinition(
            id = "boundary-architect",
            name = "Boundary Architect",
            category = "assertiveness",
            tier = "gold",
            title = "Unshakeable Limit Holder",
            description = "Achieve an Assertiveness score of 85 or higher under high social or emotional pressure.",
            coachingTip = "When pressured, repeat your core position with calm neutrality rather than negotiating away essential principles.",
            thresholdMetric = "assertiveness",
            thresholdScore = 85
        ),
        MilestoneDefinition(
            id = "deescalation-guardian",
            name = "De-escalation Guardian",
            category = "deEscalation",
            tier = "silver",
            title = "Tension Grounder",
            description = "Achieve a De-escalation score of 65 or higher during volatile or angry scenarios.",
            coachingTip = "Lower your conversational tempo, adopt a somatic soothing posture, and de-link identity from the friction.",
            thresholdMetric = "deEscalation",
            thresholdScore = 65
        ),
        MilestoneDefinition(
            id = "crisis-calm-navigator",
            name = "Crisis Calm Navigator",
            category = "deEscalation",
            tier = "platinum",
            title = "Acute Crisis Anchor",
            description = "Achieve a De-escalation score of 85 or higher in critical pressure scenarios.",
            coachingTip = "Master the B.A.M.B.I. Step 1 survival check, urge surfing, and non-confrontational grounding.",
            thresholdMetric = "deEscalation",
            thresholdScore = 85
        ),
        MilestoneDefinition(
            id = "active-listening-sage",
            name = "Active Listening Sage",
            category = "activeListening",
            tier = "gold",
            title = "Reflective Resonator",
            description = "Achieve an Active Listening score of 75 or higher by reflecting needs and asking clarifying questions.",
            coachingTip = "Mirror back what you heard in your own words to verify mutual understanding before advocating solutions.",
            thresholdMetric = "activeListening",
            thresholdScore = 75
        ),
        MilestoneDefinition(
            id = "persona-critic",
            name = "Persona Critic",
            category = "evaluations",
            tier = "bronze",
            title = "First Calibration",
            description = "Submit at least 1 post-scenario evaluation to refine bot realism and persona generation.",
            coachingTip = "After completing roleplays, rate the bot’s authenticity and highlight any robotic mannerisms.",
            thresholdMetric = "evaluations",
            thresholdScore = 1
        ),
        MilestoneDefinition(
            id = "master-evaluator",
            name = "Master Evaluator",
            category = "evaluations",
            tier = "gold",
            title = "Authenticity Architect",
            description = "Submit 3 or more post-scenario evaluations to train prompt engineering accuracy.",
            coachingTip = "Provide nuanced qualitative critiques to permanently eliminate robotic filler words in exports.",
            thresholdMetric = "evaluations",
            thresholdScore = 3
        ),
        MilestoneDefinition(
            id = "dialogue-veteran",
            name = "Dialogue Veteran",
            category = "experience",
            tier = "silver",
            title = "Scenario Stalwart",
            description = "Complete 15 or more conversational turns across practice scenarios.",
            coachingTip = "Consistent practice across different roles builds conversational resilience and cognitive flexibility.",
            thresholdMetric = "messages",
            thresholdScore = 15
        )
    )

    fun computeMilestoneBadges(
        profile: PersonaProfile,
        userMessageCount: Int,
        evaluations: List<ScenarioEvaluation> = emptyList()
    ): List<MilestoneBadge> {
        val getSpectrum = { id: String, fallback: Int ->
            profile.spectrums.find { it.id == id }?.score ?: fallback
        }

        val currentEmpathy = profile.socialGrowthFeedback?.empathyScore 
            ?: getSpectrum("social_empathy", 50)
        val currentAssertiveness = getSpectrum("boundary_strength", 50)
        val currentDirectness = getSpectrum("directness", 50)
        val currentClarity = Math.min(
            100,
            Math.max(10, Math.round(currentDirectness * 0.7f + profile.completenessScore * 0.3f))
        )
        val currentDeEscalation = profile.socialGrowthFeedback?.deEscalationScore 
            ?: getSpectrum("de_escalation", 50)
        val currentActiveListening = Math.min(
            100,
            Math.max(10, Math.round(currentEmpathy * 0.6f + currentDeEscalation * 0.4f))
        )

        val metricsMap = mapOf(
            "empathy" to currentEmpathy,
            "assertiveness" to currentAssertiveness,
            "clarity" to currentClarity,
            "deEscalation" to currentDeEscalation,
            "activeListening" to currentActiveListening,
            "evaluations" to evaluations.size,
            "messages" to userMessageCount
        )

        return DEFINITIONS.map { def ->
            val score = metricsMap[def.thresholdMetric] ?: 0
            val isUnlocked = score >= def.thresholdScore
            val progressPercent = Math.min(100, Math.round((score.toFloat() / def.thresholdScore.toFloat()) * 100))

            MilestoneBadge(
                id = def.id,
                name = def.name,
                category = def.category,
                tier = def.tier,
                title = def.title,
                description = def.description,
                coachingTip = def.coachingTip,
                thresholdMetric = def.thresholdMetric,
                thresholdScore = def.thresholdScore,
                currentScore = score,
                isUnlocked = isUnlocked,
                progressPercent = progressPercent,
                unlockedAt = if (isUnlocked) System.currentTimeMillis() else null
            )
        }
    }
}
