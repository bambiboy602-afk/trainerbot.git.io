package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.BuildConfig
import com.example.data.AppDatabase
import com.example.data.AppRepository
import com.example.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

class TrainerViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: AppRepository

    // Central state properties
    val allMessagesFlow: Flow<List<ChatMessage>>
    val profileFlow: Flow<PersonaProfile?>
    val allScenariosFlow: Flow<List<Scenario>>
    val allEvaluationsFlow: Flow<List<ScenarioEvaluation>>
    val allTranscriptsFlow: Flow<List<ScenarioSessionTranscript>>

    // UI state states
    var activeScenario = MutableStateFlow<Scenario?>(null)
        private set
    var modelMode = MutableStateFlow("general") // 'fast' | 'general' | 'complex'
        private set
    var useSearchGrounding = MutableStateFlow(false)
        private set
    var rolePreset = MutableStateFlow("persona_learner")
        private set
    var mentorMode = MutableStateFlow(true)
        private set
    var isEmergencyMode = MutableStateFlow(false)
        private set
    var activeBranchContext = MutableStateFlow<DecisionBranchContext?>(null)
        private set

    // Loader states
    var isLoadingChat = MutableStateFlow(false)
        private set
    var isAnalyzingProfile = MutableStateFlow(false)
        private set
    var apiError = MutableStateFlow<String?>(null)
        private set

    // User-entered API Key (Optional setting)
    var apiKey = MutableStateFlow("")
        private set

    init {
        val database = AppDatabase.getDatabase(application)
        repository = AppRepository(database.appDao())

        allMessagesFlow = repository.allMessagesFlow
        profileFlow = repository.profileFlow
        allScenariosFlow = repository.allScenariosFlow
        allEvaluationsFlow = repository.allEvaluationsFlow
        allTranscriptsFlow = repository.allTranscriptsFlow

        viewModelScope.launch {
            repository.prepopulateDefaultScenarios()
            
            // Check BuildConfig for API Key
            val configKey = BuildConfig.GEMINI_API_KEY
            if (!configKey.isNullOrEmpty()) {
                apiKey.value = configKey
            }
        }
    }

    fun updateApiKey(key: String) {
        apiKey.value = key
    }

    fun selectScenario(scenario: Scenario?) {
        activeScenario.value = scenario
        activeBranchContext.value = null
        isEmergencyMode.value = false
        apiError.value = null

        viewModelScope.launch {
            repository.clearAllMessages()
            if (scenario != null) {
                rolePreset.value = "persona_learner" // Clear role preset when in specialized scenario
                // Insert starter prompt
                repository.insertMessage(
                    ChatMessage(
                        id = "starter-${UUID.randomUUID()}",
                        role = "assistant",
                        content = scenario.starterPrompt,
                        timestamp = System.currentTimeMillis(),
                        scenarioId = scenario.id,
                        scenarioTitle = scenario.title
                    )
                )
            }
        }
    }

    fun setModelMode(mode: String) {
        modelMode.value = mode
    }

    fun setUseSearchGrounding(use: Boolean) {
        useSearchGrounding.value = use
    }

    fun setRolePreset(preset: String) {
        rolePreset.value = preset
        activeScenario.value = null // Role preset is mutually exclusive with active scenario
        isEmergencyMode.value = false
        apiError.value = null

        viewModelScope.launch {
            repository.clearAllMessages()
            val openingMsg = when (preset) {
                "de_escalation_coach" -> "Hello! I am your De-escalation & Communication Coach. Let's practice active listening, boundary setting, and de-escalation frameworks like SPIKES or CUS."
                "social_skills_tutor" -> "Hi there! I'm here as a supportive partner to help practice casual greetings, breakroom small talk, or setting boundaries. What would you like to explore today?"
                "medical_mentor" -> "Welcome. I am your clinical communication mentor. We can practice breaking difficult news, managing patient safety alignment, or discussing clinical boundary choices."
                "relationship_safety_advocate" -> "Hello. I am a trauma-informed Safety Planning Advocate. If you are experiencing control, unpredictability, or distress in a relationship, I am here to help you design a secure, confidential safety plan."
                else -> "Hi! I am your conversational learning partner. As we chat, I'll observe your communication styles, decisions, and preferences to build an exportable cognitive bot profile."
            }
            repository.insertMessage(
                ChatMessage(
                    id = "preset-starter-${UUID.randomUUID()}",
                    role = "assistant",
                    content = openingMsg,
                    timestamp = System.currentTimeMillis()
                )
            )
        }
    }

    fun setMentorMode(enabled: Boolean) {
        mentorMode.value = enabled
    }

    fun handleCYOADecision(branch: DecisionBranch, nodeTitle: String, turnIndex: Int) {
        activeBranchContext.value = DecisionBranchContext(
            branchId = branch.id,
            label = branch.label,
            userResponseText = branch.userResponseText,
            consequenceSummary = branch.consequenceSummary,
            aiDialogueTone = branch.aiDialogueTone,
            nodeTitle = nodeTitle,
            forkTurnIndex = turnIndex
        )

        // Automatically trigger sending the branch response text as a user message!
        sendMessage(branch.userResponseText)
    }

    fun sendMessage(text: String) {
        if (text.trim().isEmpty() || isLoadingChat.value) return

        val activeScenarioVal = activeScenario.value
        val activeBranchVal = activeBranchContext.value

        val userMsg = ChatMessage(
            id = "msg-${UUID.randomUUID()}",
            role = "user",
            content = text,
            timestamp = System.currentTimeMillis(),
            scenarioId = activeScenarioVal?.id,
            scenarioTitle = activeScenarioVal?.title
        )

        viewModelScope.launch {
            repository.insertMessage(userMsg)
            isLoadingChat.value = true
            apiError.value = null

            // Retrieve all messages currently in session
            val currentMessages = repository.allMessagesFlow.first()

            val keyToUse = apiKey.value
            if (keyToUse.trim().isEmpty()) {
                isLoadingChat.value = false
                apiError.value = "Gemini API Key is missing. Please enter your key in the Settings Panel."
                return@launch
            }

            try {
                val assistantMsg = repository.sendChatMessage(
                    apiKey = keyToUse,
                    messages = currentMessages,
                    scenario = activeScenarioVal,
                    modelMode = modelMode.value,
                    useSearchGrounding = useSearchGrounding.value,
                    rolePreset = rolePreset.value,
                    mentorMode = mentorMode.value,
                    decisionBranchContext = activeBranchVal
                )
                repository.insertMessage(assistantMsg)

                // Clear CYOA branch context after using it
                activeBranchContext.value = null

                // Check and trigger auto-profiling analysis in background if needed
                triggerAutoProfiling(currentMessages + assistantMsg)

            } catch (e: Exception) {
                apiError.value = "API Error: ${e.localizedMessage ?: "Failed to generate reply"}"
            } finally {
                isLoadingChat.value = false
            }
        }
    }

    private suspend fun triggerAutoProfiling(allMsgs: List<ChatMessage>) {
        val userMsgs = allMsgs.filter { it.role == "user" }
        val currentProfile = repository.getProfileSync() ?: PersonaProfile()
        val analyzedCount = currentProfile.messageCountAnalyzed

        // Auto-analyze every 3 user responses
        if (userMsgs.size - analyzedCount >= 3 && !isAnalyzingProfile.value) {
            triggerProfileAnalysisSync(allMsgs, currentProfile)
        }
    }

    fun triggerManualProfiling() {
        viewModelScope.launch {
            val allMsgs = repository.allMessagesFlow.first()
            val currentProfile = repository.getProfileSync() ?: PersonaProfile()
            triggerProfileAnalysisSync(allMsgs, currentProfile)
        }
    }

    private suspend fun triggerProfileAnalysisSync(allMsgs: List<ChatMessage>, currentProfile: PersonaProfile) {
        val keyToUse = apiKey.value
        if (keyToUse.trim().isEmpty() || isAnalyzingProfile.value) return

        isAnalyzingProfile.value = true
        try {
            val updatedProfile = repository.analyzeProfile(keyToUse, allMsgs, currentProfile)
            
            // Generate progress history snapshot
            val spectrums = updatedProfile.spectrums
            val getScore = { id: String -> spectrums.find { it.id == id }?.score ?: 50 }
            val directnessScore = getScore("directness")
            val boundaryScore = getScore("boundary_strength")
            val empathyScore = updatedProfile.socialGrowthFeedback?.empathyScore ?: getScore("social_empathy")
            val deEscalationScore = updatedProfile.socialGrowthFeedback?.deEscalationScore ?: getScore("de_escalation")
            
            val clarityScore = Math.min(100, Math.max(10, Math.round((directnessScore * 0.7f) + (updatedProfile.completenessScore * 0.3f))))
            val assertivenessScore = boundaryScore
            val activeListeningScore = Math.min(100, Math.max(10, Math.round((empathyScore * 0.6f) + (deEscalationScore * 0.4f))))

            val newSnapshot = ProgressSnapshot(
                id = "snapshot-${UUID.randomUUID()}",
                timestamp = System.currentTimeMillis(),
                messageCount = allMsgs.filter { it.role == "user" }.size,
                empathy = empathyScore,
                assertiveness = assertivenessScore,
                clarity = clarityScore,
                deEscalation = deEscalationScore,
                activeListening = activeListeningScore,
                label = "Snapshot ${updatedProfile.progressHistory.size + 1}"
            )

            val finalProfile = updatedProfile.copy(
                progressHistory = updatedProfile.progressHistory + newSnapshot
            )

            repository.saveProfile(finalProfile)
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            isAnalyzingProfile.value = false
        }
    }

    // --- EMERGENCY SAFETY SYSTEM ---
    fun triggerEmergencyExit() {
        val activeScenarioVal = activeScenario.value ?: return
        isEmergencyMode.value = true

        viewModelScope.launch {
            val sessionMessages = repository.allMessagesFlow.first()
            val transcript = ScenarioSessionTranscript(
                id = "transcript-${UUID.randomUUID()}",
                scenarioId = activeScenarioVal.id,
                scenarioTitle = activeScenarioVal.title,
                scenarioCategory = activeScenarioVal.category,
                scenarioDifficulty = activeScenarioVal.difficulty,
                scenarioAiRole = activeScenarioVal.aiRole,
                scenarioUserRole = activeScenarioVal.userRole,
                startedAt = sessionMessages.firstOrNull()?.timestamp ?: System.currentTimeMillis(),
                completedAt = System.currentTimeMillis(),
                messages = sessionMessages,
                isEmergencyExit = true,
                exitNote = "Emergency exit triggered due to distress or safety boundary."
            )
            repository.insertTranscript(transcript)
            repository.clearAllMessages()
            activeScenario.value = null
        }
    }

    fun submitEvaluation(
        realism: Int,
        rolePerf: Int,
        challenge: Int,
        empathyTesting: Int,
        workedWell: String,
        roboticFeel: String,
        improvement: String,
        adjustments: DesiredAdjustments
    ) {
        val activeScenarioVal = activeScenario.value ?: return
        val evalId = "eval-${UUID.randomUUID()}"
        val evaluation = ScenarioEvaluation(
            id = evalId,
            scenarioId = activeScenarioVal.id,
            scenarioTitle = activeScenarioVal.title,
            timestamp = System.currentTimeMillis(),
            realismRating = realism,
            rolePerformanceRating = rolePerf,
            challengeRating = challenge,
            empathyTestingRating = empathyTesting,
            whatWorkedWell = workedWell,
            whatFeltRoboticOrArtificial = roboticFeel,
            suggestionsForImprovement = improvement,
            desiredAdjustments = adjustments
        )

        viewModelScope.launch {
            repository.insertEvaluation(evaluation)

            // Compile session transcript
            val sessionMessages = repository.allMessagesFlow.first()
            val transcript = ScenarioSessionTranscript(
                id = "transcript-${UUID.randomUUID()}",
                scenarioId = activeScenarioVal.id,
                scenarioTitle = activeScenarioVal.title,
                scenarioCategory = activeScenarioVal.category,
                scenarioDifficulty = activeScenarioVal.difficulty,
                scenarioAiRole = activeScenarioVal.aiRole,
                scenarioUserRole = activeScenarioVal.userRole,
                startedAt = sessionMessages.firstOrNull()?.timestamp ?: System.currentTimeMillis(),
                completedAt = System.currentTimeMillis(),
                messages = sessionMessages,
                evaluation = evaluation
            )
            repository.insertTranscript(transcript)

            // Clear session and go back to home screen
            repository.clearAllMessages()
            activeScenario.value = null
        }
    }

    fun deleteTranscript(id: String) {
        viewModelScope.launch {
            repository.deleteTranscriptById(id)
        }
    }

    fun createCustomScenario(
        title: String,
        category: String,
        description: String,
        aiRole: String,
        userRole: String,
        objective: String,
        starterPrompt: String,
        learningFocus: String,
        difficulty: String
    ) {
        val scenario = Scenario(
            id = "custom-${UUID.randomUUID()}",
            title = title,
            category = category,
            description = description,
            aiRole = aiRole,
            userRole = userRole,
            objective = objective,
            starterPrompt = starterPrompt,
            learningFocus = learningFocus,
            difficulty = difficulty
        )
        viewModelScope.launch {
            repository.insertScenario(scenario, isCustom = true)
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            repository.clearAllMessages()
            repository.clearAllMessages()
            val database = AppDatabase.getDatabase(getApplication())
            database.appDao().clearProfile()
            // Keep default scenarios, but remove custom ones
            val scenarios = database.appDao().getCustomScenariosSync()
            scenarios.forEach {
                database.appDao().deleteScenarioById(it.id)
            }
            activeScenario.value = null
            activeBranchContext.value = null
            isEmergencyMode.value = false
        }
    }
}
