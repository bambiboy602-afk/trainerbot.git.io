package com.example.data

import com.example.model.Scenario
import com.example.model.HotlineInfo
import com.example.model.DecisionNode
import com.example.model.DecisionBranch

object DefaultData {
    val DEFAULT_SCENARIOS = listOf(
        Scenario(
            id = "social-small-talk-coffee",
            title = "The Breakroom Conversation",
            category = "social_skills",
            targetDomain = "social_disabilities",
            difficulty = "Beginner",
            description = "Practice initiating, holding, and gracefully closing casual small talk without feeling overwhelmed by unspoken social cues or topic shifts.",
            aiRole = "Sam Morales, a friendly coworker making morning coffee by the espresso machine, open to chatting.",
            userRole = "Colleague taking a morning break",
            objective = "Exchange casual greetings, pick up on conversational turn-taking, practice asking reciprocal open-ended questions, and exit naturally when ready.",
            starterPrompt = "Oh, good morning! That coffee smelled so good from down the hall. How's your week shaping up so far? You survived that stormy Monday commute, right?",
            learningFocus = "Turn-taking cadence, subtle cue interpretation, sharing personal context comfortably, and low-pressure social initiation.",
            coachingTips = listOf(
                "Acknowledge what Sam said with a quick reaction (e.g. \"I know, Monday was wild!\").",
                "Share one brief detail about your day or project.",
                "Bounce a lightweight question back to keep the ball in the air (e.g. \"Are you working on that presentation today?\")."
            ),
            decisionTree = listOf(
                DecisionNode(
                    id = "small-talk-crossroads",
                    turnIndex = 1,
                    nodeTitle = "Response to Sam's commuter greeting",
                    situationContext = "Sam asked about your commute and week.",
                    branches = listOf(
                        DecisionBranch(
                            id = "small-talk-br-a",
                            label = "Reciprocal & Warm alternative",
                            userResponseText = "Yes, Monday was quite an adventure! The rain was intense, but I made it. How about you, did you have a smoother commute?",
                            consequenceSummary = "Sam smiles, feeling a mutual connection, and continues the chat with high engagement.",
                            aiDialogueTone = "Warm and cooperative",
                            projectedOutcome = "Seamless casual small talk flow"
                        ),
                        DecisionBranch(
                            id = "small-talk-br-b",
                            label = "Literal & Abrupt alternative",
                            userResponseText = "Yes, I survived. Commutes are statistically prone to storm delays.",
                            consequenceSummary = "Sam is slightly taken aback by the academic tone but tries to accommodate.",
                            aiDialogueTone = "Slightly confused but polite",
                            projectedOutcome = "Conversational friction but remains cooperative"
                        )
                    )
                )
            )
        ),
        Scenario(
            id = "social-boundary-overwhelm",
            title = "Advocating for Sensory & Energy Limits",
            category = "social_skills",
            targetDomain = "social_disabilities",
            difficulty = "Beginner",
            description = "A teammate wants you to join a loud, crowded Friday happy hour after an exhausting week. Practice declining warmly and proposing a lower-sensory alternative without apologizing profusely.",
            aiRole = "Chloe, an energetic extroverted teammate who loves group gatherings and wants everyone included.",
            userRole = "Team member managing sensory overload and social battery",
            objective = "Express clear appreciation for the invite, state your energy boundary without guilt or shame, and optionally offer a 1-on-1 alternative.",
            starterPrompt = "Hey! The whole team is heading to that noisy arcade sports bar right after clocking out at 5. You HAVE to come with us this time, we never see you outside work! Come on, just a couple hours?",
            learningFocus = "Self-advocacy, assertive boundary setting, honoring personal nervous system limits, and maintaining warm relationships.",
            coachingTips = listOf(
                "Validate the warmth of the invite first (\"Thanks for including me!\").",
                "Name your boundary clearly (\"My social battery is at zero and loud spaces drain me today\").",
                "Propose an alternative if desired (\"Let’s grab lunch or coffee on Tuesday instead!\")."
            )
        ),
        Scenario(
            id = "mh-curb-peer-relapse",
            title = "The Relapse Crossroads",
            category = "mental_health",
            targetDomain = "mental_health_pros",
            difficulty = "Advanced",
            description = "A participant in recovery sits agitated outside your peer center at dusk. The pressure built up all week, they are craving heavily, and they are holding onto shame and anger.",
            aiRole = "Jesse (31) — 7 months clean, trembling with clenched fists, holding a backpack, pacing the sidewalk. Feels abandoned after losing their job and family argument.",
            userRole = "Peer Support Specialist / Recovery Coach on the curb",
            objective = "Check baseline survival first. De-escalate somatic flooding, separate the trigger from the self, explore the setup before the explosion, and guide them through See -> Sit -> Move.",
            starterPrompt = "I can't do this anymore, man. My boss canned me for being 5 minutes late, my sister won't answer my calls, and I've got $12 in my pocket. My old crew is three blocks away and they're holding. What's the point of staying clean if life just kicks you in the teeth anyway?",
            learningFocus = "Baseline safety verification, mirroring boundary failures, urge surfing, and non-judgmental presence.",
            coachingTips = listOf(
                "Street mentor rule: Do not give a clinical lecture or five-paragraph advice.",
                "Somatic grounding: \"Put both feet flat on the pavement right here. What was the setup hours ago before you grabbed the backpack?\"",
                "Delay impulse: \"Give it 15 minutes right here on this curb with me before making any calls.\""
            )
        ),
        Scenario(
            id = "customer-relations-angry",
            title = "The Angry Subscriber",
            category = "customer_relations",
            targetDomain = "customer_support",
            difficulty = "Intermediate",
            description = "An angry customer calls because they were double-charged for three months and their support emails were ignored. Practice ownership, de-escalation, and offering structured solutions.",
            aiRole = "Dave Miller, a highly frustrated customer who feels cheated and ignored by your company.",
            userRole = "Senior Customer Success Representative",
            objective = "Validate Dave's anger, take full company ownership, reverse the double charges immediately, and restore goodwill.",
            starterPrompt = "This is ridiculous! I have emailed your support desk THREE TIMES in the last month about being double-billed, and nobody has answered! I want my money back right now, and I want to cancel my account!",
            learningFocus = "Ownership, active listening, structured remediation, de-escalation of financial frustration.",
            coachingTips = listOf(
                "Do not make excuses like \"our team is understaffed\" or \"it was a glitch\".",
                "Apologize directly for the silence: \"That is completely unacceptable, Dave. I am looking at your billing now and I am taking responsibility.\"",
                "State the concrete remedy immediately: \"I will refund the charges today and credit your next two months.\""
            )
        ),
        Scenario(
            id = "relationship-safety-Elena",
            title = "Safety Planning with Elena Ortiz",
            category = "relationship_safety",
            targetDomain = "general",
            difficulty = "Intermediate",
            description = " Elena is a survivor looking to leave a highly controlling partner. Practice trauma-informed guidance to systematically map out a safe exit plan.",
            aiRole = "Elena Ortiz, a quiet but determined mother of two, seeking confidential guidance on leaving her possessive spouse safely.",
            userRole = "Confidential Domestic Violence Advocate",
            objective = "Guide Elena through safe exit planning, document securing (IDs, titles), digital safety (burner phone, tracking), and emergency signals without triggering a confrontation.",
            starterPrompt = "Hi... I'm calling from my car in the grocery parking lot. I only have five minutes. I can't keep living like this—my husband tracks my phone, locks my cards, and yesterday he threatened to take my kids if I ever try to leave. I need a way out but I'm terrified.",
            learningFocus = "Trauma-informed boundary navigation, document preservation order, digital privacy, and zero-confrontation safety exit planning.",
            safetyNotice = true,
            hotlineInfo = HotlineInfo(
                name = "National Domestic Violence Hotline",
                contact = "1-800-799-SAFE (7233) or Text 'START' to 88788",
                url = "https://www.thehotline.org"
            ),
            coachingTips = listOf(
                "Reassure Elena that she is not alone and it's not her fault.",
                "Focus on non-provocation: Tell her never to warn her husband or threaten to leave directly.",
                "Discuss packing a 'go-bag' with essential documents (birth certificates, passports, social security cards) and storing it at a trusted friend's house."
            )
        )
    )
}
