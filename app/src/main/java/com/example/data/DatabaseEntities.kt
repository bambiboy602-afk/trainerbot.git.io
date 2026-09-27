package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "messages")
data class MessageDbEntity(
    @PrimaryKey val id: String,
    val role: String,
    val content: String,
    val timestamp: Long,
    val scenarioId: String?,
    val scenarioTitle: String?,
    val analyzed: Boolean,
    val modelUsed: String?,
    val isVoiceTurn: Boolean,
    val mentorFeedbackJson: String? = null // Serialized MentorFeedback
)

@Entity(tableName = "profiles")
data class ProfileDbEntity(
    @PrimaryKey val id: Int = 1, // Singleton row
    val profileJson: String // Serialized PersonaProfile
)

@Entity(tableName = "scenarios")
data class ScenarioDbEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val targetDomain: String?,
    val description: String,
    val aiRole: String,
    val userRole: String,
    val objective: String,
    val starterPrompt: String,
    val learningFocus: String,
    val difficulty: String?,
    val coachingTipsJson: String?, // List<String>
    val safetyNotice: Boolean,
    val hotlineInfoJson: String?, // HotlineInfo
    val decisionTreeJson: String?, // List<DecisionNode>
    val isCustom: Boolean = false
)

@Entity(tableName = "evaluations")
data class EvaluationDbEntity(
    @PrimaryKey val id: String,
    val scenarioId: String,
    val scenarioTitle: String,
    val timestamp: Long,
    val realismRating: Int,
    val rolePerformanceRating: Int,
    val challengeRating: Int,
    val empathyTestingRating: Int,
    val whatWorkedWell: String,
    val whatFeltRoboticOrArtificial: String,
    val suggestionsForImprovement: String,
    val desiredAdjustmentsJson: String // DesiredAdjustments
)

@Entity(tableName = "transcripts")
data class TranscriptDbEntity(
    @PrimaryKey val id: String,
    val scenarioId: String,
    val scenarioTitle: String,
    val scenarioCategory: String,
    val scenarioDifficulty: String?,
    val startedAt: Long,
    val completedAt: Long,
    val isEmergencyExit: Boolean,
    val exitNote: String?,
    val transcriptJson: String // Serialized ScenarioSessionTranscript
)
