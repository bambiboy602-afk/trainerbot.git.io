import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Build role-specific system instructions
function buildSystemInstruction(
  scenario?: any,
  rolePreset?: string,
  mentorMode?: boolean,
  decisionBranchContext?: any
): string {
  let basePrompt = "";
  if (scenario && scenario.id) {
    basePrompt = `You are roleplaying in an interactive training & cognitive observation scenario.
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
3. Keep replies conversational, punchy, and grounded (1-3 paragraphs max) so the interaction flows like real human speech.`;
  } else {
    // Pre-configured custom roles
    switch (rolePreset) {
      case 'de_escalation_coach':
        basePrompt = `You are an elite communication & de-escalation coach for healthcare professionals, managers, and peer responders.
Your role:
- Provide immediate, constructive breakdowns of the user's phrasing, emotional attunement, and body-language proxies.
- Teach evidenced frameworks: SPIKES for bad news, CUS (Concerned, Uncomfortable, Safety) for advocacy, and non-violent communication.
- Give high-leverage alternatives: "Instead of saying X, try Y to lower defensiveness."
- Keep advice empathetic, grounded, practical, and devoid of corporate clichés.`;
        break;

      case 'social_skills_tutor':
        basePrompt = `You are a supportive, neurodiversity-affirming social skills and communication partner.
Your role:
- Help neurodivergent individuals (Autism, ADHD, social anxiety) practice breakroom small talk, conversation transitions, graceful monologue exits, and boundary-setting.
- Explicitly explain unwritten social subtext, micro-expressions, and conversational cues without shame or patronization.
- Offer safe, low-demand dialogue practice and celebrate self-advocacy and comfort over masking.`;
        break;

      case 'medical_mentor':
        basePrompt = `You are an experienced clinical communication mentor.
Your role:
- Coach clinicians, nurses, and medical students on bedside manner, delivering distressing prognoses, resolving treatment hesitancy, and navigating patient safety hierarchy.
- Emphasize patient autonomy, compassionate presence, plain-language translation of complex clinical concepts, and empathetic boundary management.`;
        break;

      case 'research_analyst':
        basePrompt = `You are an up-to-date fact, research, and policy analyst.
Your role:
- Ground all answers with verified, accurate real-world data and authoritative sources.
- Provide objective, balanced, and evidence-supported insights for negotiations, labor standards, healthcare protocols, and organizational ethics.
- Cite specific web findings and verify claims rigorously.`;
        break;

      case 'relationship_safety_advocate':
        basePrompt = `You are an experienced, trauma-informed Domestic Violence (DV) & Relationship Safety Advocate and Safety Planning Navigator.
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
- Always provide verified crisis contact info: National Domestic Violence Hotline (1-800-799-SAFE / 1-800-799-7233, Text "START" to 88788, www.thehotline.org).`;
        break;

      case 'persona_learner':
      default:
        basePrompt = `You are an astute, supportive, and engaging conversational partner and social coach.
Your goal is to have authentic, dynamic discussions with the user while observing and eliciting their communication style, reasoning patterns, social boundary preferences, and emotional de-escalation tendencies.

CONVERSATION GUIDELINES:
1. Be genuine, insightful, and natural. Do not sound like a generic clinical chatbot or give canned lectures.
2. Ask probing, thoughtful questions that invite the user to express how they feel, how they navigate social friction, what boundaries matter to them, or how they handle pressure.
3. When they present a viewpoint, offer warm reflection, explore "What was the setup before that happened?", or ask how they balance logic with human empathy.
4. Adapt to their pacing: if they are concise or overwhelmed, compress; if they are reflective, explore deeper.
5. Avoid repetitive filler phrases like "That's a great point!". Jump directly into real, grounded substance.`;
        break;
    }
  }

  if (mentorMode) {
    basePrompt += `

=== MANDATORY REAL-TIME MENTOR MODE PROTOCOL ===
Mentor Mode is ACTIVATED by the user. You MUST provide real-time, constructive mentorship feedback evaluating the user's communication techniques on their latest turn.

Instructions:
1. First, provide your regular in-character or conversational response to the user's message.
2. Then, append the exact delimiter: \`---MENTOR_FEEDBACK---\`
3. Immediately following the delimiter, output a valid JSON object with these exact keys:
{
  "techniqueObserved": "<Specific technique or communication pattern identified, e.g. 'Active Listening & Reframing', 'Empathic Validation', 'Premature Advice-Giving', 'Defensive Posturing', 'Non-Defensive Boundary', 'CUS Safety Advocacy', 'SPIKES Warning Shot'>",
  "toneRating": "<One of: 'Excellent' | 'Effective' | 'Constructive' | 'Needs Adjustment'>",
  "coachingInsight": "<Concise 1-3 sentence constructive critique of the phrasing, explaining its psychological and emotional impact on the listener, and what worked or could be improved>",
  "suggestedAlternative": "<A concrete, polished alternative phrasing they could have used instead for higher leverage or lower defensiveness>",
  "frameworkUsed": "<Evidenced communication model or method applied, e.g. 'Non-Violent Communication', 'SPIKES Protocol', 'CUS Hierarchy', 'Crucial Conversations', 'Motivational Interviewing', 'SBI Feedback'>"
}
Do not wrap the JSON object in markdown code blocks (\`\`\`json) after the delimiter; just output raw valid JSON.`;
  }

  if (decisionBranchContext && decisionBranchContext.branchId) {
    basePrompt += `

=== CHOOSE YOUR OWN ADVENTURE (CYOA) / SIMULATION BRANCH PROTOCOL ===
The user is simulating an intentional decision branch in this scenario attempt:
- Decision Crossroads: "${decisionBranchContext.nodeTitle || 'Critical Response Fork'}"
- Chosen Branch: "${decisionBranchContext.label}"
- Strategy / Spoken Phrasing: "${decisionBranchContext.userResponseText || 'Alternative approach'}"
- Expected Consequence & Trajectory: ${decisionBranchContext.consequenceSummary || ''}
- Required AI Dialogue Tone & Disposition: ${decisionBranchContext.aiDialogueTone || 'Authentic to the selected branch'}
DIRECTIVE: You must embody the required AI emotional posture and dialogue trajectory. Demonstrate how this specific user choice leads to a distinct, divergent conversational reaction compared to other decision branches.`;
  }

  return basePrompt;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health check & environment status for deployment verification
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
      port: PORT,
      nodeEnv: process.env.NODE_ENV || "development",
      time: new Date().toISOString()
    });
  });

  // 1. Audio Transcription using gemini-3.5-transcribe
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audio, mimeType } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Audio data is required for transcription." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const ai = getGeminiClient();

      const audioPart = {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audio,
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            audioPart,
            {
              text: "Transcribe this spoken audio verbatim into clean text. Output ONLY the transcription without quotes, explanations, or extraneous commentary.",
            },
          ],
        },
      });

      const transcription = response.text?.trim() || "";
      return res.json({ transcription });
    } catch (error: any) {
      console.error("Error in /api/transcribe:", error);
      return res.status(500).json({
        error: error.message || "Failed to transcribe audio with gemini-3.5-transcribe",
      });
    }
  });

  // 2. Chat endpoint with multi-turn history, role presets, search grounding & model selection
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages,
        scenario,
        modelMode = "general", // 'fast' | 'general' | 'complex'
        useSearchGrounding = false,
        rolePreset = "persona_learner",
        mentorMode = false,
        decisionBranchContext,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const ai = getGeminiClient();

      const systemInstruction = buildSystemInstruction(
        scenario,
        rolePreset,
        mentorMode,
        decisionBranchContext
      );

      // Convert message history to Gemini contents (handling multi-turn chat)
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Model selection & Search Grounding rules
      let targetModel = "gemini-3.5-flash";
      let tools: any[] | undefined = undefined;

      if (useSearchGrounding) {
        // Requirement: Use gemini-3.5-flash (with googleSearch tool)
        targetModel = "gemini-3.5-flash";
        tools = [{ googleSearch: {} }];
      } else {
        // Requirement: Use gemini-3.1-pro-preview for particularly complex tasks,
        // gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast.
        if (modelMode === "fast") {
          targetModel = "gemini-3.1-flash-lite";
        } else if (modelMode === "complex") {
          targetModel = "gemini-3.1-pro-preview";
        } else {
          targetModel = "gemini-3.5-flash";
        }
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config: {
            systemInstruction,
            temperature: 0.75,
            tools,
          },
        });
      } catch (modelErr: any) {
        // If complex model hit billing or quota error, gracefully fallback to gemini-3.5-flash
        if (targetModel === "gemini-3.1-pro-preview") {
          console.warn("Falling back from gemini-3.1-pro-preview to gemini-3.5-flash:", modelErr.message);
          targetModel = "gemini-3.5-flash";
          response = await ai.models.generateContent({
            model: targetModel,
            contents,
            config: {
              systemInstruction,
              temperature: 0.75,
              tools,
            },
          });
        } else {
          throw modelErr;
        }
      }

      const replyText = response.text || "I'm reflecting on what you said...";

      let cleanReply = replyText;
      let mentorFeedback: any = null;

      // Extract real-time mentor feedback if mentorMode was enabled
      if (mentorMode && replyText.includes("---MENTOR_FEEDBACK---")) {
        const parts = replyText.split("---MENTOR_FEEDBACK---");
        cleanReply = parts[0].trim();
        const feedbackRaw = parts[1].trim();
        try {
          const cleanedJson = feedbackRaw.replace(/^```(json)?\s*/i, "").replace(/```$/, "").trim();
          mentorFeedback = JSON.parse(cleanedJson);
        } catch (parseErr) {
          console.warn("Could not parse direct JSON, trying regex extraction:", parseErr);
          const jsonMatch = feedbackRaw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              mentorFeedback = JSON.parse(jsonMatch[0]);
            } catch (_) {}
          }
        }
      }

      // Extract search grounding sources if available
      let groundingSources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri,
            });
          }
        });
      }

      return res.json({
        reply: cleanReply,
        modelUsed: targetModel,
        groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
        mentorFeedback: mentorFeedback || undefined,
      });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate chat response",
      });
    }
  });

  // 2. Persona & Cognitive Profiling Engine
  app.post("/api/analyze-profile", async (req, res) => {
    try {
      const { messages, currentProfile } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "No messages to analyze" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      // Filter only user messages for analysis
      const userMessages = messages.filter((m: any) => m.role === "user");
      if (userMessages.length === 0) {
        return res.status(400).json({ error: "No user messages found to analyze." });
      }

      const conversationTranscript = messages
        .map((m: any) => `[${m.role.toUpperCase()}]: ${m.content}`)
        .join("\n\n");

      const ai = getGeminiClient();

      const analysisPrompt = `You are an expert cognitive linguist, executive profiler, and clinical/social communications coach.
Analyze the following conversation transcript between the USER and the ASSISTANT/ROLEPLAYER.
Your mission is to extract an ultra-detailed, precise cognitive and communication profile of the USER so they can replicate their communication style, reasoning skills, preferences, and decision-making tendencies in their own custom AI bot, as well as receive actionable social feedback for neurodivergent skill growth, mental health practice, and customer relations.

CONVERSATION TRANSCRIPT:
${conversationTranscript}

PREVIOUS PROFILE (if any):
${currentProfile ? JSON.stringify(currentProfile, null, 2) : "None yet."}

INSTRUCTIONS:
1. Objectively evaluate the user's communication style (tone, directness vs diplomacy, verbosity, formality, humor/sarcasm, formatting quirks).
2. Deconstruct their reasoning framework (first-principles vs heuristic, analytical vs intuitive, openness to counter-arguments, how they weigh evidence).
3. Identify their decision-making tendencies (risk tolerance, speed, process vs outcome, empathy vs utilitarian trade-offs).
4. Evaluate their social interaction & emotional regulation capabilities (empathy, active listening, de-escalation posture, boundary-setting clarity).
5. Extract literal signature phrases, recurring patterns, idioms, or rhetorical habits with direct quote citations.
6. Score the 6 core trait spectrums from 0 to 100 with supporting evidence quotes from the user:
   - Directness: 0 (Tactful/Diplomatic) to 100 (Direct/Blunt)
   - Brevity: 0 (Concise/Punchy) to 100 (Elaborate/Detailed)
   - Social Empathy: 0 (Pragmatic/Task-First) to 100 (Empathetic/Attuned)
   - De-escalation: 0 (Reactive/Combative) to 100 (Calming/Grounded)
   - Reasoning Mode: 0 (Intuitive/Relational) to 100 (Analytical/First-Principles)
   - Boundary Strength: 0 (People-Pleasing/Diffuse) to 100 (Clear/Firm Boundaries)
7. Provide concrete DOs and DONTs for a bot attempting to impersonate or think like this user.
8. Provide social growth feedback: specific observable strengths, gentle growth opportunities (e.g. for neurodivergent communication, peer support, or customer service), and estimated de-escalation and empathy scores (0-100).
9. Estimate a completeness score (0-100) based on how much data has been observed.

Return strictly valid JSON conforming to the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: analysisPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              completenessScore: {
                type: Type.INTEGER,
                description: "0 to 100 confidence/completeness of the profile",
              },
              overallSummary: {
                type: Type.STRING,
                description:
                  "Comprehensive 2-4 sentence executive summary of who this person is as a communicator, decision maker, and listener.",
              },
              cognitiveStyleSummary: {
                type: Type.STRING,
                description:
                  "Detailed description of how their mind processes complexity, dilemmas, emotions, and problem-solving.",
              },
              spectrums: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    leftLabel: { type: Type.STRING },
                    rightLabel: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    confidence: { type: Type.STRING },
                    observedEvidence: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    "id",
                    "category",
                    "leftLabel",
                    "rightLabel",
                    "score",
                    "summary",
                    "confidence",
                    "observedEvidence",
                  ],
                },
              },
              detailedTraits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    confidence: { type: Type.STRING },
                    supportingQuotes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["id", "category", "title", "description", "confidence", "supportingQuotes"],
                },
              },
              signaturePhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Unique words, idioms, habits, or phrases used by the user.",
              },
              decisionMakingRules: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  "Implicit or explicit operational heuristics the user applies when choosing a path.",
              },
              communicationDosAndDonts: {
                type: Type.OBJECT,
                properties: {
                  dos: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  donts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["dos", "donts"],
              },
              socialGrowthFeedback: {
                type: Type.OBJECT,
                properties: {
                  strengths: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  growthAreas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  deEscalationScore: { type: Type.INTEGER },
                  empathyScore: { type: Type.INTEGER },
                },
                required: ["strengths", "growthAreas", "deEscalationScore", "empathyScore"],
              },
            },
            required: [
              "completenessScore",
              "overallSummary",
              "cognitiveStyleSummary",
              "spectrums",
              "detailedTraits",
              "signaturePhrases",
              "decisionMakingRules",
              "communicationDosAndDonts",
              "socialGrowthFeedback",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      parsed.lastUpdated = Date.now();
      parsed.messageCountAnalyzed = userMessages.length;

      // Extract communication scores for progress snapshot
      const spectrums = parsed.spectrums || [];
      const getScore = (id: string, fallback: number) => {
        const item = spectrums.find((s: any) => s.id === id);
        return typeof item?.score === "number" ? item.score : fallback;
      };

      const directnessScore = getScore("directness", 50);
      const boundaryScore = getScore("boundary_strength", 50);
      const empathyScore = parsed.socialGrowthFeedback?.empathyScore ?? getScore("social_empathy", 50);
      const deEscalationScore = parsed.socialGrowthFeedback?.deEscalationScore ?? getScore("de_escalation", 50);

      // Clarity is derived from directness & coherence (score weighted around directness & evidence precision)
      const clarityScore = Math.min(100, Math.max(10, Math.round((directnessScore * 0.7) + (parsed.completenessScore * 0.3))));
      // Assertiveness is derived from boundary strength
      const assertivenessScore = boundaryScore;
      // Active listening is derived from empathy & de-escalation
      const activeListeningScore = Math.min(100, Math.max(10, Math.round((empathyScore * 0.6) + (deEscalationScore * 0.4))));

      const previousHistory = Array.isArray(currentProfile?.progressHistory)
        ? currentProfile.progressHistory
        : [
            {
              id: "snap-baseline",
              timestamp: Date.now() - 3600000,
              messageCount: 0,
              empathy: 50,
              assertiveness: 50,
              clarity: 50,
              deEscalation: 50,
              activeListening: 50,
              label: "Baseline",
            },
          ];

      const newSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: Date.now(),
        messageCount: userMessages.length,
        empathy: empathyScore,
        assertiveness: assertivenessScore,
        clarity: clarityScore,
        deEscalation: deEscalationScore,
        activeListening: activeListeningScore,
        label: `Turn ${userMessages.length}`,
      };

      // Keep up to 20 progress data points
      parsed.progressHistory = [...previousHistory, newSnapshot].slice(-20);

      return res.json({ profile: parsed });
    } catch (error: any) {
      console.error("Error in /api/analyze-profile:", error);
      return res.status(500).json({
        error: error.message || "Failed to analyze profile",
      });
    }
  });

  // 3. Export Bot Studio: Synthesizes System Prompts, XML configs, and Modelfiles
  app.post("/api/export-bot", async (req, res) => {
    try {
      const { profile, userSampleMessages, evaluations } = req.body;

      if (!profile) {
        return res.status(400).json({ error: "Profile is required to generate bot export" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const ai = getGeminiClient();

      const prompt = `You are a world-class AI prompt engineer specializing in cloning authentic human personas, reasoning engines, and communication styles into LLM system prompts.

Given the following Cognitive & Persona Profile derived from real user conversations:
${JSON.stringify(profile, null, 2)}

Sample user phrases / turns:
${JSON.stringify(userSampleMessages || [], null, 2)}

${
  Array.isArray(evaluations) && evaluations.length > 0
    ? `USER'S POST-SCENARIO EVALUATIONS & REALISM CRITIQUES:
${JSON.stringify(
  evaluations.map((e: any) => ({
    scenario: e.scenarioTitle,
    realismScore: `${e.realismRating}/5`,
    rolePerformance: `${e.rolePerformanceRating}/5`,
    whatFeltRobotic: e.whatFeltRoboticOrArtificial,
    suggestions: e.suggestionsForImprovement,
    desiredAdjustments: e.desiredAdjustments,
  })),
  null,
  2
)}
CRITICAL PERSONA REFINEMENT DIRECTIVE: Incorporate these user ratings and qualitative feedback into the generated persona! If the user noted robotic tone, excessive formality, or missed emotional cadence, inject explicit behavioral rules into the prompt to eradicate those flaws and match the user's desired adjustments.`
    : ""
}

Produce a master prompt engineering package that allows any modern LLM (ChatGPT, Claude, Gemini, Llama 3) to think, reason, communicate, and decide exactly like this user.

Output strictly valid JSON with the following fields:
1. "systemPromptMarkdown": A comprehensive, beautifully formatted Markdown system prompt including:
   - Identity & Voice Core
   - Communication Tone & Rhythm
   - Reasoning & Problem Solving Methodology
   - Decision Making Rules & Heuristics
   - Formatting & Lexicon Rules
   - Strict Negative Constraints (what this person would NEVER say)
2. "structuredXmlPrompt": An enterprise-grade XML-tagged prompt (<persona>, <communication_style>, <reasoning_framework>, <decision_rules>, <rules_of_engagement>) preferred by advanced models like Claude 3.5 / Gemini.
3. "characterCardJson": A standard Character Card JSON structure with name, description, personality, first_mes, mes_example, scenario, system_prompt.
4. "ollamaModelfile": A ready-to-run Ollama Modelfile text string (FROM llama3.2, PARAMETER temperature 0.7, SYSTEM """...""").
5. "fewShotExamples": An array of 3-4 few-shot examples showcasing how the user's clone would respond to tough dilemmas or typical questions.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              systemPromptMarkdown: { type: Type.STRING },
              structuredXmlPrompt: { type: Type.STRING },
              characterCardJson: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  personality: { type: Type.STRING },
                  first_mes: { type: Type.STRING },
                  mes_example: { type: Type.STRING },
                  scenario: { type: Type.STRING },
                  system_prompt: { type: Type.STRING },
                },
                required: [
                  "name",
                  "description",
                  "personality",
                  "first_mes",
                  "mes_example",
                  "scenario",
                  "system_prompt",
                ],
              },
              ollamaModelfile: { type: Type.STRING },
              fewShotExamples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    userExample: { type: Type.STRING },
                    botReasoningStyle: { type: Type.STRING },
                  },
                  required: ["userExample", "botReasoningStyle"],
                },
              },
            },
            required: [
              "systemPromptMarkdown",
              "structuredXmlPrompt",
              "characterCardJson",
              "ollamaModelfile",
              "fewShotExamples",
            ],
          },
        },
      });

      let parsed: any = {};
      try {
        const rawText = (response.text || "{}")
          .replace(/^```(json)?\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("Direct JSON parse failed, attempting regex extraction:", parseErr);
        const match = response.text?.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      // Generate Turnkey Executable Python Script
      const sysPromptEscapedPy = JSON.stringify(parsed.systemPromptMarkdown || "You are an AI clone of the user.");
      parsed.executablePythonScript = `"""
Persona Bot - Executable Standalone Script
Generated by Persona Learner & Scenario Bot

Prerequisites:
  pip install google-genai
"""
import os
import sys

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("\\n[!] Missing dependency. Please run: pip install google-genai\\n")
    sys.exit(1)

# Retrieve Gemini API key from environment or prompt interactively
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("======================================================")
    print("  Persona Bot: Standalone Terminal Chat")
    print("======================================================")
    api_key = input("Enter your free Gemini API key (or set GEMINI_API_KEY env var): ").strip()
    if not api_key:
        print("API key required. Get one free at https://aistudio.google.com")
        sys.exit(1)

client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = ${sysPromptEscapedPy}

chat = client.chats.create(
    model="gemini-2.5-flash",
    config=types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.75,
    )
)

print("\\n" + "="*56)
print("🤖 Persona Bot Initialized & Ready!")
print("   Type your message and press Enter.")
print("   Type 'exit' or 'quit' to end the session.")
print("="*56 + "\\n")

while True:
    try:
        user_input = input("\\nYou: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ["exit", "quit", "q"]:
            print("\\nExiting. Goodbye!")
            break

        print("\\nThinking...", end="", flush=True)
        response = chat.send_message(user_input)
        print("\\r" + " "*15 + "\\r", end="") # Clear 'Thinking...'
        print(f"Clone: {response.text}\\n")
    except (KeyboardInterrupt, EOFError):
        print("\\nExiting. Goodbye!")
        break
    except Exception as e:
        print(f"\\n[Error: {e}]\\n")
`;

      // Generate Turnkey Executable Node.js Script
      const sysPromptEscapedJs = JSON.stringify(parsed.systemPromptMarkdown || "You are an AI clone of the user.");
      parsed.executableNodeScript = `/**
 * Persona Bot - Executable Node.js Script
 * Generated by Persona Learner & Scenario Bot
 *
 * Prerequisites:
 *   npm install @google/genai dotenv
 *
 * Run:
 *   node run_bot.mjs
 */
import readline from "node:readline";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

let apiKey = process.env.GEMINI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  if (!apiKey) {
    console.log("======================================================");
    console.log("  Persona Bot: Standalone Node.js Terminal Chat");
    console.log("======================================================");
    apiKey = await askQuestion("Enter your Gemini API key: ");
    apiKey = apiKey.trim();
    if (!apiKey) {
      console.error("API key required. Exiting.");
      process.exit(1);
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = ${sysPromptEscapedJs};

  const history = [];

  console.log("\\n" + "=".repeat(56));
  console.log("🤖 Persona Bot Initialized & Ready!");
  console.log("   Type your message and press Enter.");
  console.log("   Type 'exit' or 'quit' to end the session.");
  console.log("=".repeat(56) + "\\n");

  while (true) {
    const input = await askQuestion("\\nYou: ");
    const trimmed = input.trim();
    if (!trimmed) continue;
    if (["exit", "quit", "q"].includes(trimmed.toLowerCase())) {
      console.log("\\nGoodbye!");
      rl.close();
      break;
    }

    history.push({ role: "user", parts: [{ text: trimmed }] });
    process.stdout.write("Thinking...");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: { systemInstruction, temperature: 0.75 }
      });

      const reply = response.text || "(no response)";
      process.stdout.write("\\r" + " ".repeat(15) + "\\r");
      console.log(\`Clone: \${reply}\\n\`);
      history.push({ role: "model", parts: [{ text: reply }] });
    } catch (err) {
      process.stdout.write("\\r" + " ".repeat(15) + "\\r");
      console.error(\`\\n[Error: \${err.message || err}]\\n\`);
    }
  }
}

main().catch(console.error);
`;

      return res.json({ exportFormats: parsed });
    } catch (error: any) {
      console.error("Error in /api/export-bot:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate bot export formats",
      });
    }
  });

  // 4. Test Clone Playground endpoint
  app.post("/api/test-clone", async (req, res) => {
    try {
      const { testPrompt, systemPrompt, history } = req.body;

      if (!testPrompt || !systemPrompt) {
        return res.status(400).json({ error: "testPrompt and systemPrompt are required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const ai = getGeminiClient();

      const messages = [
        ...(Array.isArray(history) ? history : []),
        { role: "user", parts: [{ text: testPrompt }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: messages,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text || "..." });
    } catch (error: any) {
      console.error("Error in /api/test-clone:", error);
      return res.status(500).json({
        error: error.message || "Failed to test clone response",
      });
    }
  });

  // 5. Dynamic Targeted Scenario Generator
  app.post("/api/generate-scenario", async (req, res) => {
    try {
      const { profile, desiredTopic, targetTrait, evaluations } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in the environment.",
        });
      }

      const ai = getGeminiClient();

      const prompt = `Create an immersive, realistic, high-stakes roleplay scenario specifically crafted to uncover the user's communication style, reasoning skills, preferences, and decision-making tendencies.
${targetTrait ? `SPECIFIC TARGET TRAIT TO STRESS TEST: ${targetTrait}` : ""}
${desiredTopic ? `USER REQUESTED TOPIC: ${desiredTopic}` : ""}
${profile ? `CURRENT PROFILE SUMMARY: ${profile.overallSummary}` : ""}
${
  Array.isArray(evaluations) && evaluations.length > 0
    ? `USER'S PAST REALISM & PERFORMANCE RATINGS:
Average Realism: ${(
        evaluations.reduce((acc: number, e: any) => acc + (e.realismRating || 3), 0) /
        evaluations.length
      ).toFixed(1)}/5
Critiques of past scenarios:
${evaluations
  .slice(0, 3)
  .map(
    (e: any) =>
      `- Scenario "${e.scenarioTitle}": ${e.whatFeltRoboticOrArtificial || "N/A"}. Improvement note: ${
        e.suggestionsForImprovement || "Make it more grounded and authentic"
      }`
  )
  .join("\n")}
DIRECTIVE: Calibrate this scenario to avoid past pitfalls (e.g. no robotic exposition, no corporate jargon, use raw authentic dialog and stakes).`
    : ""
}

Ensure the scenario:
- Has genuine ambiguity where there is no clean, easy answer.
- Pits two competing valid priorities against each other (e.g. loyalty vs truth, speed vs perfection, empathy vs fairness, innovation vs stability).
- Gives the AI an assertive, realistic role that will challenge the user directly.
- Has a compelling starter prompt that forces the user to take an immediate stance.
- Has a difficulty field strictly set to one of: "Beginner", "Intermediate", or "Advanced".

Return strictly valid JSON conforming to the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              description: { type: Type.STRING },
              aiRole: { type: Type.STRING },
              userRole: { type: Type.STRING },
              objective: { type: Type.STRING },
              starterPrompt: { type: Type.STRING },
              learningFocus: { type: Type.STRING },
            },
            required: [
              "id",
              "title",
              "category",
              "difficulty",
              "description",
              "aiRole",
              "userRole",
              "objective",
              "starterPrompt",
              "learningFocus",
            ],
          },
        },
      });

      const scenario = JSON.parse(response.text || "{}");
      if (!scenario.id) {
        scenario.id = `custom-${Date.now()}`;
      }
      return res.json({ scenario });
    } catch (error: any) {
      console.error("Error in /api/generate-scenario:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate dynamic scenario",
      });
    }
  });

  // 5.5 Auto-generate Choose Your Own Adventure Decision Nodes for a transcript
  app.post("/api/transcripts/generate-decision-nodes", async (req, res) => {
    try {
      const { transcriptTitle, scenarioDescription, messages } = req.body;

      if (!Array.isArray(messages) || messages.length < 2) {
        return res.status(400).json({ error: "At least 2 messages are required to analyze decision nodes." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      }

      const ai = getGeminiClient();

      const dialogueTranscript = messages
        .map((m: any, idx: number) => `Turn ${idx + 1} [${m.role.toUpperCase()}]: ${m.content}`)
        .join("\n\n");

      const prompt = `You are a master roleplay simulation and narrative branching designer.
Analyze this scenario dialogue transcript and extract or design 1 to 3 "Choose Your Own Adventure" (CYOA) Decision Nodes where specific user responses lead to radically different AI dialogue pathways in future simulation attempts.

SCENARIO: ${transcriptTitle || "Training Scenario"}
${scenarioDescription ? `CONTEXT: ${scenarioDescription}` : ""}

FULL DIALOGUE TRANSCRIPT:
${dialogueTranscript}

TASK:
Identify 1 to 3 critical crossroads in the transcript (preferring pivotal user response turns).
For each decision node:
1. "turnIndex": The 0-based turn index in the dialogue messages where the user responded (or had a choice).
2. "nodeTitle": An evocative, clear name for the dilemma (e.g. "Crossroads: Standing Ground vs. De-escalating With Calm Neutrality").
3. "situationContext": What the AI counterpart said right before this decision.
4. "chosenBranchId": Which branch ID most closely matches what the user actually said in this transcript.
5. "branches": Exactly 3 distinct, divergent decision paths:
   - Branch A: High-skill / De-escalating / Grounded path
   - Branch B: Assertive / Confrontational / High-friction path
   - Branch C: Appeasing / Avoidant / Placating path
   Each branch must contain:
   - "id": a slug like "branch-a-grounded", "branch-b-confront", "branch-c-appease"
   - "label": a concise label, e.g. "Branch A: Firm 'Grey Rock' Neutrality"
   - "userResponseText": A realistic, ready-to-speak sentence or two the user would say on this branch
   - "consequenceSummary": How the AI counterpart's psychological stance changes
   - "aiDialogueTone": The emotional tone of the AI on this branch (e.g. "Disarmed & hesitant", "Furious & escalating", "Smug & domineering")
   - "projectedOutcome": What happens next in the simulation
   - "tags": 2-3 relevant skill/psychology tags (e.g. ["De-escalation", "Boundary", "Low Reactivity"])
   - "branchPathTranscriptSnippet": A 1-2 sentence sample of how the AI would open their response if this branch was chosen

Return strictly valid JSON conforming to the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              decisionNodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    turnIndex: { type: Type.INTEGER },
                    nodeTitle: { type: Type.STRING },
                    situationContext: { type: Type.STRING },
                    chosenBranchId: { type: Type.STRING },
                    branches: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          label: { type: Type.STRING },
                          userResponseText: { type: Type.STRING },
                          consequenceSummary: { type: Type.STRING },
                          aiDialogueTone: { type: Type.STRING },
                          projectedOutcome: { type: Type.STRING },
                          tags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          branchPathTranscriptSnippet: { type: Type.STRING },
                        },
                        required: [
                          "id",
                          "label",
                          "userResponseText",
                          "consequenceSummary",
                          "aiDialogueTone",
                          "projectedOutcome",
                        ],
                      },
                    },
                  },
                  required: ["id", "turnIndex", "nodeTitle", "situationContext", "branches"],
                },
              },
            },
            required: ["decisionNodes"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ decisionNodes: parsed.decisionNodes || [] });
    } catch (error: any) {
      console.error("Error in /api/transcripts/generate-decision-nodes:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate CYOA decision nodes for transcript",
      });
    }
  });

  // 6. Live API Voice WebSocket Server (gemini-3.8-live)
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      const cleanPath = url.pathname.replace(/\/+$/, "") || "/";
      if (cleanPath === "/api/live" || cleanPath === "/live") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        // Return 404 cleanly for unmatched upgrade requests instead of abrupt RST
        socket.write(
          "HTTP/1.1 404 Not Found\r\n" +
          "Content-Type: text/plain\r\n" +
          "Connection: close\r\n\r\n" +
          "WebSocket endpoint not found\r\n"
        );
        socket.destroy();
      }
    } catch (upgradeErr) {
      console.error("[Live API Upgrade Error]:", upgradeErr);
      try {
        socket.destroy();
      } catch (_) {}
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("[Live API] Client connected to voice session");
    let liveSession: any = null;
    let isConnecting = false;
    let isClosed = false;

    const cleanup = () => {
      if (liveSession) {
        try {
          liveSession.close();
        } catch (_) {}
        liveSession = null;
      }
    };

    clientWs.on("close", (code, reason) => {
      isClosed = true;
      console.log(`[Live API] Client disconnected (code: ${code}, reason: ${reason?.toString() || 'none'})`);
      cleanup();
    });

    clientWs.on("error", (err) => {
      isClosed = true;
      console.error("[Live API] Client WebSocket error:", err);
      cleanup();
    });

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: "error", error: "GEMINI_API_KEY is not configured" }));
          clientWs.close(1008, "Missing API Key");
        }
        return;
      }

      const ai = getGeminiClient();

      const initLive = async (configPayload?: any) => {
        if (isConnecting || isClosed) return;
        isConnecting = true;
        cleanup();

        const scenario = configPayload?.scenario;
        const rolePreset = configPayload?.rolePreset || "persona_learner";
        const voiceName = configPayload?.voiceName || "Zephyr";
        const customPrompt = configPayload?.systemInstruction;
        const mentorMode = Boolean(configPayload?.mentorMode);

        let systemInstruction = customPrompt || buildSystemInstruction(scenario, rolePreset);
        if (mentorMode) {
          systemInstruction += `\n\n=== LIVE VOICE MENTOR COACHING ===\nMentor Mode is active. Conclude your turn with a brief 1-sentence real-time spoken communication coaching observation on how the user expressed themselves (e.g., "Mentor tip: Notice how your opening acknowledged feelings before pivoting to facts.").`;
        }

        try {
          liveSession = await ai.live.connect({
            model: "gemini-3.8-live",
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
              systemInstruction,
              outputAudioTranscription: {},
              inputAudioTranscription: {},
            },
            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                try {
                  // Audio chunk from model
                  const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                  if (audio && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: "audio", audio }));
                  }

                  // Interrupted signal (user began speaking over model)
                  if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: "interrupted" }));
                  }

                  // Output transcription if available
                  const parts = message.serverContent?.modelTurn?.parts;
                  if (Array.isArray(parts)) {
                    for (const p of parts) {
                      if (p.text && clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(JSON.stringify({ type: "transcript", text: p.text, role: "model" }));
                      }
                    }
                  }
                } catch (sendErr) {
                  console.error("[Live API] Error forwarding message to client:", sendErr);
                }
              },
              onclose: () => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: "closed" }));
                }
              },
              onerror: (err: any) => {
                console.error("[Live API] Gemini Live error:", err);
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: "error", error: err?.message || "Gemini Live API error" }));
                }
              },
            },
          });

          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "ready", model: "gemini-3.8-live", voiceName }));
          }
        } catch (connErr: any) {
          console.error("[Live API] Connection error:", connErr);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "error", error: connErr?.message || "Failed to initialize Gemini Live session" }));
          }
        } finally {
          isConnecting = false;
        }
      };

      // Handle client messages (e.g. init, audio chunks, text turns)
      clientWs.on("message", async (raw: any) => {
        try {
          const data = JSON.parse(raw.toString());

          if (data.type === "init") {
            await initLive(data);
          } else if (data.type === "audio" && data.audio && liveSession) {
            liveSession.sendRealtimeInput({
              audio: { data: data.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (data.type === "text" && data.text && liveSession) {
            liveSession.sendRealtimeInput({
              text: data.text,
            });
          }
        } catch (msgErr: any) {
          console.error("[Live API] Error handling client message:", msgErr);
        }
      });

      // Acknowledge connection immediately
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "handshake_ok" }));
      }
    } catch (err: any) {
      console.error("[Live API] Setup error:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "error", error: err?.message || "Failed to initialize Live API" }));
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Persona Learner Server running on http://localhost:${PORT}`);
  });
}

startServer();
