package com.example.data

import com.example.api.Content
import com.example.api.GenerateContentRequest
import com.example.api.GenerationConfig
import com.example.api.Part
import com.example.api.RetrofitClient
import com.example.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.util.UUID

class AppRepository(private val appDao: AppDao) {

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        encodeDefaults = true
    }

    // --- MESSAGES ---
    val allMessagesFlow: Flow<List<ChatMessage>> = appDao.getAllMessagesFlow().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun insertMessage(message: ChatMessage) = withContext(Dispatchers.IO) {
        appDao.insertMessage(message.toDb())
    }

    suspend fun clearMessagesForScenario(scenarioId: String) = withContext(Dispatchers.IO) {
        appDao.clearMessagesForScenario(scenarioId)
    }

    suspend fun clearAllMessages() = withContext(Dispatchers.IO) {
        appDao.clearAllMessages()
    }

    // --- PROFILES ---
    val profileFlow: Flow<PersonaProfile?> = appDao.getProfileFlow().map { entity ->
        entity?.let { json.decodeFromString<PersonaProfile>(it.profileJson) }
    }

    suspend fun getProfileSync(): PersonaProfile? = withContext(Dispatchers.IO) {
        appDao.getProfileSync()?.let { json.decodeFromString<PersonaProfile>(it.profileJson) }
    }

    suspend fun saveProfile(profile: PersonaProfile) = withContext(Dispatchers.IO) {
        appDao.insertProfile(ProfileDbEntity(profileJson = json.encodeToString(PersonaProfile.serializer(), profile)))
    }

    // --- SCENARIOS ---
    val allScenariosFlow: Flow<List<Scenario>> = appDao.getAllScenariosFlow().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun insertScenario(scenario: Scenario, isCustom: Boolean = false) = withContext(Dispatchers.IO) {
        appDao.insertScenario(scenario.toDb(isCustom))
    }

    suspend fun deleteScenarioById(id: String) = withContext(Dispatchers.IO) {
        appDao.deleteScenarioById(id)
    }

    suspend fun prepopulateDefaultScenarios() = withContext(Dispatchers.IO) {
        val current = appDao.getCustomScenariosSync()
        if (current.isEmpty()) {
            val dbEntities = DefaultData.DEFAULT_SCENARIOS.map { it.toDb(isCustom = false) }
            appDao.insertScenarios(dbEntities)
        }
    }

    // --- EVALUATIONS ---
    val allEvaluationsFlow: Flow<List<ScenarioEvaluation>> = appDao.getAllEvaluationsFlow().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun insertEvaluation(evaluation: ScenarioEvaluation) = withContext(Dispatchers.IO) {
        appDao.insertEvaluation(evaluation.toDb())
        // Update any corresponding transcript with this evaluation
        // ...
    }

    // --- TRANSCRIPTS ---
    val allTranscriptsFlow: Flow<List<ScenarioSessionTranscript>> = appDao.getAllTranscriptsFlow().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun insertTranscript(transcript: ScenarioSessionTranscript) = withContext(Dispatchers.IO) {
        appDao.insertTranscript(transcript.toDb())
    }

    suspend fun deleteTranscriptById(id: String) = withContext(Dispatchers.IO) {
        appDao.deleteTranscriptById(id)
    }

    // --- GEMINI CHAT INTEGRATION ---
    suspend fun sendChatMessage(
        apiKey: String,
        messages: List<ChatMessage>,
        scenario: Scenario?,
        modelMode: String, // 'fast' | 'general' | 'complex'
        useSearchGrounding: Boolean,
        rolePreset: String,
        mentorMode: Boolean,
        decisionBranchContext: DecisionBranchContext?
    ): ChatMessage = withContext(Dispatchers.IO) {
        val systemInstructionText = buildSystemInstructionText(scenario, rolePreset, mentorMode, decisionBranchContext)
        val targetModel = when {
            useSearchGrounding -> "gemini-3.5-flash"
            modelMode == "fast" -> "gemini-3.1-flash-lite-preview"
            modelMode == "complex" -> "gemini-3.1-pro-preview"
            else -> "gemini-3.5-flash"
        }

        val geminiContents = messages.map {
            Content(
                role = if (it.role == "assistant") "model" else "user",
                parts = listOf(Part(text = it.content))
            )
        }

        val request = GenerateContentRequest(
            contents = geminiContents,
            generationConfig = GenerationConfig(
                temperature = 0.75f
            ),
            systemInstruction = Content(parts = listOf(Part(text = systemInstructionText))),
            tools = if (useSearchGrounding) listOf(buildJsonObject { put("googleSearch", buildJsonObject {}) }) else null
        )

        var finalModel = targetModel
        val response = try {
            RetrofitClient.service.generateContent(targetModel, apiKey, request)
        } catch (e: Exception) {
            if (targetModel == "gemini-3.1-pro-preview") {
                // Fallback to gemini-3.5-flash
                finalModel = "gemini-3.5-flash"
                val fallbackRequest = request.copy()
                RetrofitClient.service.generateContent(finalModel, apiKey, fallbackRequest)
            } else {
                throw e
            }
        }

        val replyText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: "I am processing your words..."

        var cleanReply = replyText
        var mentorFeedback: MentorFeedback? = null

        if (mentorMode && replyText.contains("---MENTOR_FEEDBACK---")) {
            val parts = replyText.split("---MENTOR_FEEDBACK---")
            cleanReply = parts[0].trim()
            val feedbackRaw = parts[1].trim()
            try {
                val cleanedJson = feedbackRaw.replace("^```(json)?\\s*".toRegex(), "")
                    .replace("```$".toRegex(), "")
                    .trim()
                mentorFeedback = json.decodeFromString<MentorFeedback>(cleanedJson)
            } catch (parseErr: Exception) {
                // Regex fallback
                val match = "\\{[\\s\\S]*\\}".toRegex().find(feedbackRaw)
                if (match != null) {
                    try {
                        mentorFeedback = json.decodeFromString<MentorFeedback>(match.value)
                    } catch (e: Exception) {}
                }
            }
        }

        // Parse search grounding sources if any
        val groundingSources = mutableListOf<GroundingSource>()
        response.candidates?.firstOrNull()?.groundingMetadata?.groundingChunks?.forEach { chunk ->
            chunk.web?.let { web ->
                if (web.uri != null) {
                    groundingSources.add(GroundingSource(title = web.title ?: web.uri, uri = web.uri))
                }
            }
        }

        ChatMessage(
            id = "msg-${UUID.randomUUID()}",
            role = "assistant",
            content = cleanReply,
            timestamp = System.currentTimeMillis(),
            scenarioId = scenario?.id,
            scenarioTitle = scenario?.title,
            modelUsed = finalModel,
            groundingSources = if (groundingSources.isNotEmpty()) groundingSources else null,
            mentorFeedback = mentorFeedback
        )
    }

    // --- COGNITIVE PROFILING ANALYSIS ---
    suspend fun analyzeProfile(
        apiKey: String,
        messages: List<ChatMessage>,
        currentProfile: PersonaProfile?
    ): PersonaProfile = withContext(Dispatchers.IO) {
        val userMessages = messages.filter { it.role == "user" }
        if (userMessages.isEmpty()) return@withContext currentProfile ?: PersonaProfile()

        val conversationTranscript = messages.joinToString("\n\n") {
            "[${it.role.uppercase()}]: ${it.content}"
        }

        val profilePrompt = """
            You are an expert cognitive linguist, executive profiler, and clinical/social communications coach.
            Analyze the following conversation transcript between the USER and the ASSISTANT/ROLEPLAYER.
            Your mission is to extract an ultra-detailed, precise cognitive and communication profile of the USER so they can replicate their communication style, reasoning skills, preferences, and decision-making tendencies in their own custom AI bot, as well as receive actionable social feedback for neurodivergent skill growth, mental health practice, and customer relations.

            CONVERSATION TRANSCRIPT:
            $conversationTranscript

            PREVIOUS PROFILE (if any):
            ${currentProfile?.let { json.encodeToString(PersonaProfile.serializer(), it) } ?: "None yet."}

            INSTRUCTIONS:
            1. Objectively evaluate the user's communication style (tone, directness vs diplomacy, verbosity, formality, humor/sarcasm, formatting quirks).
            2. Deconstruct their reasoning framework (first-principles vs heuristic, analytical vs intuitive, openness to counter-arguments, how they weigh evidence).
            3. Identify their decision-making tendencies (risk tolerance, speed, process vs outcome, empathy vs utilitarian trade-offs).
            4. Evaluate their social interaction & emotional regulation capabilities (empathy, active listening, de-escalation posture, boundary-setting clarity).
            5. Extract literal signature phrases, recurring patterns, idioms, or rhetorical habits with direct quote citations.
            6. Score the 6 core trait spectrums from 0 to 100 with supporting evidence quotes from the user:
               - directness: 0 (Tactful/Diplomatic) to 100 (Direct/Blunt)
               - brevity: 0 (Concise/Punchy) to 100 (Elaborate/Detailed)
               - social_empathy: 0 (Pragmatic/Task-First) to 100 (Empathetic/Attuned)
               - de_escalation: 0 (Reactive/Combative) to 100 (Calming/Grounded)
               - reasoning_mode: 0 (Intuitive/Relational) to 100 (Analytical/First-Principles)
               - boundary_strength: 0 (People-Pleasing/Diffuse) to 100 (Clear/Firm Boundaries)
            7. Provide concrete DOs and DONTs for a bot attempting to impersonate or think like this user.
            8. Provide social growth feedback: specific observable strengths, gentle growth opportunities (e.g. for neurodivergent communication, peer support, or customer service), and estimated de-escalation and empathy scores (0-100).
            9. Estimate a completeness score (0-100) based on how much data has been observed.

            YOU MUST RESPOND WITH A SINGLE VALID JSON OBJECT matching this structure exactly:
            {
              "completenessScore": 45,
              "overallSummary": "The user is an empathetic and structured communicator who prioritizes...",
              "cognitiveStyleSummary": "Analytically oriented but deeply attuned to human emotions...",
              "spectrums": [
                {
                  "id": "directness",
                  "category": "communication",
                  "leftLabel": "Tactful",
                  "rightLabel": "Direct",
                  "score": 60,
                  "summary": "Moderately direct but keeps a highly professional framing...",
                  "confidence": "moderate",
                  "observedEvidence": ["Quote 1", "Quote 2"]
                }
                // include all 6 spectrums: directness, brevity, social_empathy, de_escalation, reasoning_mode, boundary_strength
              ],
              "detailedTraits": [
                {
                  "id": "trait_1",
                  "category": "social_empathy",
                  "title": "Empathetic Active Listener",
                  "description": "User displays high emotional resonance by echoing patient needs...",
                  "confidence": "high",
                  "supportingQuotes": ["Quote here"]
                }
              ],
              "signaturePhrases": ["I hear you", "Let's pause"],
              "decisionMakingRules": ["Always check safety limits first", "Validate before offering alternatives"],
              "communicationDosAndDonts": {
                "dos": ["Express warmth", "Use active listening markers"],
                "donts": ["Do not jump to solutions immediately", "Do not judge"]
              },
              "socialGrowthFeedback": {
                "strengths": ["High empathy", "Consistent grounding"],
                "growthAreas": ["Can hold boundaries more firmly earlier"],
                "deEscalationScore": 85,
                "empathyScore": 90
              }
            }

            Do not prepend markdown backticks or explanation. Just respond with pure valid JSON.
        """.trimIndent()

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = profilePrompt)))),
            generationConfig = GenerationConfig(
                temperature = 0.5f,
                responseMimeType = "application/json"
            )
        )

        try {
            val response = RetrofitClient.service.generateContent("gemini-3.5-flash", apiKey, request)
            val jsonText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: throw Exception("Empty profiling response")
            val cleanedJson = jsonText.replace("^```(json)?\\s*".toRegex(), "")
                .replace("```$".toRegex(), "")
                .trim()
            val parsedProfile = json.decodeFromString<PersonaProfile>(cleanedJson)

            // Inject metrics
            parsedProfile.copy(
                lastUpdated = System.currentTimeMillis(),
                messageCountAnalyzed = userMessages.size
            )
        } catch (e: Exception) {
            e.printStackTrace()
            // Return fallback or current profile if parsing fails
            currentProfile ?: PersonaProfile(
                lastUpdated = System.currentTimeMillis(),
                messageCountAnalyzed = userMessages.size,
                overallSummary = "Profiling analysis encountered an error: ${e.localizedMessage}. Continue chatting to allow retry."
            )
        }
    }

    // --- PROMPT BUILDER HELPER ---
    private fun buildSystemInstructionText(
        scenario: Scenario?,
        rolePreset: String,
        mentorMode: Boolean,
        decisionBranchContext: DecisionBranchContext?
    ): String {
        var basePrompt = ""
        if (scenario != null) {
            basePrompt = """
                You are roleplaying in an interactive training & cognitive observation scenario.
                SCENARIO DETAILS:
                - Title: ${scenario.title}
                - Category: ${scenario.category}
                - Context & Stakes: ${scenario.description}
                - YOUR ROLE: ${scenario.aiRole}
                - USER ROLE: ${scenario.userRole}
                - Objective: ${scenario.objective}
                - Focus / Skills being tested: ${scenario.learningFocus}

                DOMAIN-SPECIFIC ROLEPLAY DIRECTIVES:
                1. SOCIAL DISABILITY & NEURODIVERSITY SKILL BUILDING (category: 'social_skills'):
                   - Provide realistic, natural social cues (e.g. slight tone shifts, conversational openings, polite invitations, monologues).
                   - If the user is practicing small talk, exiting monologues, or setting boundaries, reward clarity, acknowledge their preferences respectfully, and keep the interaction safe, constructive, and free of shame.
                   - Do not talk down or infantilize; respond authentically as a peer or colleague.

                2. MENTAL HEALTH PROFESSIONALS & PEER RECOVERY (category: 'mental_health'):
                   - Grounded in real-world crisis, peer support, and clinical dynamics.
                   - If roleplaying someone in distress, panic, or craving: express authentic somatic agitation, hopelessness, or defensive resistance, but soften appropriately when the user demonstrates genuine active listening, somatic grounding (4-7-8, 5-4-3-2-1), non-judgmental presence, and baseline stabilization (e.g. See → Sit → Move).
                   - Never sound like an AI chatbot. Be raw, human, and responsive to true empathy vs clinical platitudes.

                3. MEDICAL & CLINICAL HEALTHCARE (category: 'medical_clinical'):
                   - Embody patients facing terrifying diagnoses, exhausted family members in ER triage, treatment-hesitant elders, or hurried attending surgeons.
                   - React realistically: if the clinician uses medical jargon or dismisses terror, show fear, guardedness, or anger; if the clinician applies compassionate presence, transparent prioritization, patient autonomy, or structured safety advocacy (CUS), respond with trust and collaboration.

                4. WORKPLACE CONFLICT & PERFORMANCE (category: 'workplace_conflict'):
                   - Embody defensive developers on a PIP, smooth credit-stealing peers, budget-conscious executives denying promotions, or burned-out colleagues.
                   - Test the user's assertiveness, objective evidence-based feedback, non-reactive boundary holding, and empathetic coaching.

                5. FAMILY & PARENTING DYNAMICS (category: 'parenting_family'):
                   - Embody withdrawn adolescents overwhelmed by pressure, guilt-inducing overbearing in-laws, or reactionary co-parents.
                   - Resist patronizing lectures or interrogations. Soften when met with calm presence, low-demand connection, firm and loving boundaries, and collaborative problem solving.

                6. CUSTOMER SERVICE & CLIENT RELATIONS (category: 'customer_relations'):
                   - Embody realistic customer states (frustrated subscriber, panicking event host, viral influencer, policy boundary pusher).
                   - React dynamically: if the user uses robotic corporate scripts or makes excuses, remain skeptical; if the user takes genuine ownership, validates the frustration, and offers concrete next steps, de-escalate and work toward resolution.

                7. ETHICS, INTEGRITY & WHISTLEBLOWING (category: 'ethics'):
                   - Embody executives or colleagues prioritizing speed, revenue, or competitive benchmarks over moral/safety boundaries.
                   - Test whether the user holds firm to fundamental ethical principles, articulates systemic risks, or folds under commercial pressure.

                8. HIGH-STAKES NEGOTIATION (category: 'negotiation'):
                   - Embody hardball procurement officers, scope-creeping startup founders, or commercial landlords testing boundaries.
                   - Test value articulation, bluff-calling, creative compromise, and non-defensive firmness.

                9. DOMESTIC VIOLENCE & RELATIONSHIP SAFETY (category: 'relationship_safety'):
                   - When portraying an advocate or caseworker (like Elena Ortiz or Marcus Vance): be trauma-informed, validating, non-judgmental, and systematically guide the user through risk assessment, vital document preservation, emergency funds, digital privacy, and secret safe-exit steps.
                   - When portraying a possessive or demanding partner (like Morgan): depict psychological control, demanding phone access, emotional interrogation, and guilt-tripping realistically, but DO NOT generate graphic depictions of physical violence or explicit profanity. Respond dynamically: if the user uses calm, neutral 'grey rock' de-escalation, show realistic temporary de-escalation of the immediate argument; if the user gets reactive or counter-attacks, show increased verbal agitation to test their de-escalation instincts.
                   - Always encourage safety planning, prioritizing physical safety over 'winning' an argument, and executing a safe exit.

                GENERAL ROLEPLAY RULES:
                1. Stay 100% in character as ${scenario.aiRole}. Never break character or refer to yourself as an AI in your conversational reply.
                2. React authentically to the user's specific words, tone, emotional attunement, and boundaries.
                3. Keep replies conversational, punchy, and grounded (1-3 paragraphs max) so the interaction flows like real human speech.
            """.trimIndent()
        } else {
            basePrompt = when (rolePreset) {
                "de_escalation_coach" -> """
                    You are an elite communication & de-escalation coach for healthcare professionals, managers, and peer responders.
                    Your role:
                    - Provide immediate, constructive breakdowns of the user's phrasing, emotional attunement, and body-language proxies.
                    - Teach evidenced frameworks: SPIKES for bad news, CUS (Concerned, Uncomfortable, Safety) for advocacy, and non-violent communication.
                    - Give high-leverage alternatives: "Instead of saying X, try Y to lower defensiveness."
                    - Keep advice empathetic, grounded, practical, and devoid of corporate clichés.
                """.trimIndent()
                "social_skills_tutor" -> """
                    You are a supportive, neurodiversity-affirming social skills and communication partner.
                    Your role:
                    - Help neurodivergent individuals (Autism, ADHD, social anxiety) practice breakroom small talk, conversation transitions, graceful monologue exits, and boundary-setting.
                    - Explicitly explain unwritten social subtext, micro-expressions, and conversational cues without shame or patronization.
                    - Offer safe, low-demand dialogue practice and celebrate self-advocacy and comfort over masking.
                """.trimIndent()
                "medical_mentor" -> """
                    You are an experienced clinical communication mentor.
                    Your role:
                    - Coach clinicians, nurses, and medical students on bedside manner, delivering distressing prognoses, resolving treatment hesitancy, and navigating patient safety hierarchy.
                    - Emphasize patient autonomy, compassionate presence, plain-language translation of complex clinical concepts, and empathetic boundary management.
                """.trimIndent()
                "relationship_safety_advocate" -> """
                    You are an experienced, trauma-informed Domestic Violence (DV) & Relationship Safety Advocate and Safety Planning Navigator.
                    Your role:
                    - Provide compassionate, confidential, and practical guidance for individuals experiencing relationship abuse, coercive control, unpredictable explosive anger, isolation, or financial restriction.
                    - Help the user identify danger signs and lethality factors (strangulation, threats, stalking, escalation when preparing to leave, weapons, extreme possessiveness).
                    - Methodically help them build a confidential, personalized Safety Plan:
                      1. Safe Exit Planning: Leaving is statistically the most dangerous time; guide them on planning a swift departure when the partner is away, without direct provocation or giving advance warnings.
                      2. Document & Resource Securing: Packing essential IDs, social security cards, birth certificates, medical records, medications, vehicle titles, cash, and emergency keys in a secure off-site location or trusted friend's home.
                      3. Digital Privacy & Security: Checking for location tracking on devices, using clean/burner phones, turning off Bluetooth/FindMy, and using safe computers outside the home.
                      4. Emergency Signal & Allies: Setting up a discrete code word with a trusted neighbor or family member to call 911 if triggered.
                      5. In-the-Moment De-escalation: Practicing the 'grey rock' technique (flat, neutral, calm responses), avoiding enclosed rooms with hard surfaces/weapons (kitchens, bathrooms), and keeping an exit pathway open.
                    - Reinforce that abuse is NEVER their fault. Avoid victim-blaming questions like "Why didn't you leave sooner?".
                    - Never simulate graphic depictions of physical violence or encourage dangerous direct confrontations.
                    - Always provide verified crisis contact info: National Domestic Violence Hotline (1-800-799-SAFE / 1-800-799-7233, Text "START" to 88788, www.thehotline.org).
                """.trimIndent()
                else -> """
                    You are an astute, supportive, and engaging conversational partner and social coach.
                    Your goal is to have authentic, dynamic discussions with the user while observing and eliciting their communication style, reasoning patterns, social boundary preferences, and emotional de-escalation tendencies.

                    CONVERSATION GUIDELINES:
                    1. Be genuine, insightful, and natural. Do not sound like a generic clinical chatbot or give canned lectures.
                    2. Ask probing, thoughtful questions that invite the user to express how they feel, how they navigate social friction, what boundaries matter to them, or how they handle pressure.
                    3. When they present a viewpoint, offer warm reflection, explore "What was the setup before that happened?", or ask how they balance logic with human empathy.
                    4. Adapt to their pacing: if they are concise or overwhelmed, compress; if they are reflective, explore deeper.
                    5. Avoid repetitive filler phrases like "That's a great point!". Jump directly into real, grounded substance.
                """.trimIndent()
            }
        }

        if (mentorMode) {
            basePrompt += """

                === MANDATORY REAL-TIME MENTOR MODE PROTOCOL ===
                Mentor Mode is ACTIVATED by the user. You MUST provide real-time, constructive mentorship feedback evaluating the user's communication techniques on their latest turn.

                Instructions:
                1. First, provide your regular in-character or conversational response to the user's message.
                2. Then, append the exact delimiter: ---MENTOR_FEEDBACK---
                3. Immediately following the delimiter, output a valid JSON object with these exact keys:
                {
                  "techniqueObserved": "<Specific technique or communication pattern identified, e.g. 'Active Listening & Reframing', 'Empathic Validation', 'Premature Advice-Giving', 'Defensive Posturing', 'Non-Defensive Boundary', 'CUS Safety Advocacy', 'SPIKES Warning Shot'>",
                  "toneRating": "<One of: 'Excellent' | 'Effective' | 'Constructive' | 'Needs Adjustment'>",
                  "coachingInsight": "<Concise 1-3 sentence constructive critique of the phrasing, explaining its psychological and impact on the listener, and what worked or could be improved>",
                  "suggestedAlternative": "<A concrete, polished alternative phrasing they could have used instead for higher leverage or lower defensiveness>",
                  "frameworkUsed": "<Evidenced communication model or method applied, e.g. 'Non-Violent Communication', 'SPIKES Protocol', 'CUS Hierarchy', 'Crucial Conversations', 'Motivational Interviewing', 'SBI Feedback'>"
                }
                Do not wrap the JSON object in markdown code blocks after the delimiter; just output raw valid JSON.
            """.trimIndent()
        }

        if (decisionBranchContext != null) {
            basePrompt += """

                === CHOOSE YOUR OWN ADVENTURE (CYOA) / SIMULATION BRANCH PROTOCOL ===
                The user is simulating an intentional decision branch in this scenario attempt:
                - Decision Crossroads: "${decisionBranchContext.nodeTitle ?: "Critical Response Fork"}"
                - Chosen Branch: "${decisionBranchContext.label}"
                - Strategy / Spoken Phrasing: "${decisionBranchContext.userResponseText ?: "Alternative approach"}"
                - Expected Consequence & Trajectory: ${decisionBranchContext.consequenceSummary ?: ""}
                - Required AI Dialogue Tone & Disposition: ${decisionBranchContext.aiDialogueTone ?: "Authentic to the selected branch"}
                DIRECTIVE: You must embody the required AI emotional posture and dialogue trajectory. Demonstrate how this specific user choice leads to a distinct, divergent conversational reaction compared to other decision branches.
            """.trimIndent()
        }

        return basePrompt
    }

    // --- CONVERTER EXTENSIONS ---
    private fun ChatMessage.toDb() = MessageDbEntity(
        id = id,
        role = role,
        content = content,
        timestamp = timestamp,
        scenarioId = scenarioId,
        scenarioTitle = scenarioTitle,
        analyzed = analyzed,
        modelUsed = modelUsed,
        isVoiceTurn = isVoiceTurn,
        mentorFeedbackJson = mentorFeedback?.let { json.encodeToString(MentorFeedback.serializer(), it) }
    )

    private fun MessageDbEntity.toDomain() = ChatMessage(
        id = id,
        role = role,
        content = content,
        timestamp = timestamp,
        scenarioId = scenarioId,
        scenarioTitle = scenarioTitle,
        analyzed = analyzed,
        modelUsed = modelUsed,
        isVoiceTurn = isVoiceTurn,
        mentorFeedback = mentorFeedbackJson?.let { json.decodeFromString<MentorFeedback>(it) }
    )

    private fun Scenario.toDb(isCustom: Boolean) = ScenarioDbEntity(
        id = id,
        title = title,
        category = category,
        targetDomain = targetDomain,
        description = description,
        aiRole = aiRole,
        userRole = userRole,
        objective = objective,
        starterPrompt = starterPrompt,
        learningFocus = learningFocus,
        difficulty = difficulty,
        coachingTipsJson = coachingTips?.let { json.encodeToString(it) },
        safetyNotice = safetyNotice ?: false,
        hotlineInfoJson = hotlineInfo?.let { json.encodeToString(HotlineInfo.serializer(), it) },
        decisionTreeJson = decisionTree?.let { json.encodeToString(it) },
        isCustom = isCustom
    )

    private fun ScenarioDbEntity.toDomain() = Scenario(
        id = id,
        title = title,
        category = category,
        targetDomain = targetDomain,
        description = description,
        aiRole = aiRole,
        userRole = userRole,
        objective = objective,
        starterPrompt = starterPrompt,
        learningFocus = learningFocus,
        difficulty = difficulty,
        coachingTips = coachingTipsJson?.let { json.decodeFromString(it) },
        safetyNotice = safetyNotice,
        hotlineInfo = hotlineInfoJson?.let { json.decodeFromString<HotlineInfo>(it) },
        decisionTree = decisionTreeJson?.let { json.decodeFromString(it) }
    )

    private fun ScenarioEvaluation.toDb() = EvaluationDbEntity(
        id = id,
        scenarioId = scenarioId,
        scenarioTitle = scenarioTitle,
        timestamp = timestamp,
        realismRating = realismRating,
        rolePerformanceRating = rolePerformanceRating,
        challengeRating = challengeRating,
        empathyTestingRating = empathyTestingRating,
        whatWorkedWell = whatWorkedWell,
        whatFeltRoboticOrArtificial = whatFeltRoboticOrArtificial,
        suggestionsForImprovement = suggestionsForImprovement,
        desiredAdjustmentsJson = json.encodeToString(DesiredAdjustments.serializer(), desiredAdjustments)
    )

    private fun EvaluationDbEntity.toDomain() = ScenarioEvaluation(
        id = id,
        scenarioId = scenarioId,
        scenarioTitle = scenarioTitle,
        timestamp = timestamp,
        realismRating = realismRating,
        rolePerformanceRating = rolePerformanceRating,
        challengeRating = challengeRating,
        empathyTestingRating = empathyTestingRating,
        whatWorkedWell = whatWorkedWell,
        whatFeltRoboticOrArtificial = whatFeltRoboticOrArtificial,
        suggestionsForImprovement = suggestionsForImprovement,
        desiredAdjustments = json.decodeFromString<DesiredAdjustments>(desiredAdjustmentsJson)
    )

    private fun ScenarioSessionTranscript.toDb() = TranscriptDbEntity(
        id = id,
        scenarioId = scenarioId,
        scenarioTitle = scenarioTitle,
        scenarioCategory = scenarioCategory,
        scenarioDifficulty = scenarioDifficulty,
        startedAt = startedAt,
        completedAt = completedAt,
        isEmergencyExit = isEmergencyExit,
        exitNote = exitNote,
        transcriptJson = json.encodeToString(ScenarioSessionTranscript.serializer(), this)
    )

    private fun TranscriptDbEntity.toDomain() = json.decodeFromString<ScenarioSessionTranscript>(transcriptJson)
}
