import { Scenario, PersonaProfile } from '../types';

export const DEFAULT_SCENARIOS: Scenario[] = [
  // ==========================================
  // 1. SOCIAL DISABILITIES & NEURODIVERSITY SKILL BUILDING
  // ==========================================
  {
    id: 'social-small-talk-coffee',
    title: 'The Breakroom Conversation (Navigating Small Talk & Tone)',
    category: 'social_skills',
    targetDomain: 'social_disabilities',
    difficulty: 'Beginner',
    description:
      'Practice initiating, holding, and gracefully closing casual small talk without feeling overwhelmed by unspoken social cues or topic shifts.',
    aiRole: 'Sam Morales, a friendly coworker making morning coffee by the espresso machine, open to chatting.',
    userRole: 'Colleague taking a morning break',
    objective:
      'Exchange casual greetings, pick up on conversational turn-taking, practice asking reciprocal open-ended questions, and exit naturally when ready.',
    starterPrompt:
      "Oh, good morning! That coffee smelled so good from down the hall. How's your week shaping up so far? You survived that stormy Monday commute, right?",
    learningFocus:
      'Turn-taking cadence, subtle cue interpretation, sharing personal context comfortably, and low-pressure social initiation.',
    coachingTips: [
      'Acknowledge what Sam said with a quick reaction (e.g. "I know, Monday was wild!").',
      'Share one brief detail about your day or project.',
      'Bounce a lightweight question back to keep the ball in the air (e.g. "Are you working on that presentation today?").'
    ]
  },
  {
    id: 'social-boundary-overwhelm',
    title: 'Advocating for Sensory & Energy Limits (Setting Gentle Boundaries)',
    category: 'social_skills',
    targetDomain: 'social_disabilities',
    difficulty: 'Beginner',
    description:
      'A teammate wants you to join a loud, crowded Friday happy hour after an exhausting week. Practice declining warmly and proposing a lower-sensory alternative without apologizing profusely.',
    aiRole: 'Chloe, an energetic extroverted teammate who loves group gatherings and wants everyone included.',
    userRole: 'Team member managing sensory overload and social battery',
    objective:
      'Express clear appreciation for the invite, state your energy boundary without guilt or shame, and optionally offer a 1-on-1 alternative.',
    starterPrompt:
      "Hey! The whole team is heading to that noisy arcade sports bar right after clocking out at 5. You HAVE to come with us this time, we never see you outside work! Come on, just a couple hours?",
    learningFocus:
      'Self-advocacy, assertive boundary setting, honoring personal nervous system limits, and maintaining warm relationships.',
    coachingTips: [
      'Validate the warmth of the invite first ("Thanks for including me!").',
      'Name your boundary clearly ("My social battery is at zero and loud spaces drain me today").',
      'Propose an alternative if desired ("Let’s grab lunch or coffee on Tuesday instead!").'
    ]
  },
  {
    id: 'social-repair-misunderstanding',
    title: 'Repairing an Awkward Moment or Misread Cue',
    category: 'social_skills',
    targetDomain: 'social_disabilities',
    difficulty: 'Intermediate',
    description:
      'Yesterday, you spoke very literally during a meeting and a colleague seemed quiet or taken aback. Practice checking in to clear the air without over-apologizing.',
    aiRole: 'Alex, a sensitive collaborator who wondered if you were frustrated with them yesterday.',
    userRole: 'Team member seeking clear, grounded clarity',
    objective:
      'Address the moment directly, clarify your genuine intent, check how Alex heard it, and establish mutual trust.',
    starterPrompt:
      "Hey... thanks for pinging me to sync. To be honest, yesterday when you said my slides were 'unnecessary clutter', I wasn't sure if you were frustrated with me or if I did something wrong.",
    learningFocus:
      'Tone disambiguation, non-defensive clarification, emotional courage, and social repair mechanisms.',
    coachingTips: [
      'Do not panic or grovel; assume mutual goodwill.',
      'Clarify your thought process ("I was focusing on slide brevity, not criticizing your effort").',
      'Ask how you can communicate better for both of you.'
    ]
  },

  // ==========================================
  // 2. MENTAL HEALTH PROFESSIONALS & PEER RECOVERY
  // ==========================================
  {
    id: 'mh-curb-peer-relapse',
    title: 'The Relapse Crossroads (RSM & Grounded Peer Mentorship)',
    category: 'mental_health',
    targetDomain: 'mental_health_pros',
    difficulty: 'Advanced',
    description:
      'A participant in recovery sits agitated outside your peer center at dusk. The pressure built up all week, they are craving heavily, and they are holding onto shame and anger.',
    aiRole:
      'Jesse (31) — 7 months clean, trembling with clenched fists, holding a backpack, pacing the sidewalk. Feels abandoned after losing their job and family argument.',
    userRole: 'Peer Support Specialist / Recovery Coach on the curb',
    objective:
      'Check baseline survival first. De-escalate somatic flooding, separate the trigger from the self, explore the setup before the explosion, and guide them through See → Sit → Move.',
    starterPrompt:
      "I can't do this anymore, man. My boss canned me for being 5 minutes late, my sister won't answer my calls, and I've got $12 in my pocket. My old crew is three blocks away and they're holding. What's the point of staying clean if life just kicks you in the teeth anyway?",
    learningFocus:
      'B.A.M.B.I. Step 1 (Baseline & safety), mirroring boundary failures without clinical jargon, urge surfing, and non-judgmental presence.',
    coachingTips: [
      'Street mentor rule: Do not give a clinical lecture or five-paragraph advice.',
      'Somatic grounding: "Put both feet flat on the pavement right here. What was the setup hours ago before you grabbed the backpack?"',
      'Delay impulse: "Give it 15 minutes right here on this curb with me before making any calls."'
    ]
  },
  {
    id: 'mh-trauma-shame-excavation',
    title: 'The Shame Spiral & Meaning Failure (Clinical / Counseling)',
    category: 'mental_health',
    targetDomain: 'mental_health_pros',
    difficulty: 'Advanced',
    description:
      'A therapy client is stuck in an identity failure ("I am broken goods"). They blame themselves entirely for an abusive relationship ending and have stopped leaving their home.',
    aiRole:
      'Dana (28) — tearful, slumped posture, speaking in quiet, rapid fragments with deep self-blame and defensive emotional withdrawal.',
    userRole: 'Licensed Professional Counselor / Mental Health Clinician',
    objective:
      'Hold psychological safety, avoid premature problem-solving, gently illuminate the cognitive distortion, and de-link the traumatic event from Dana’s core identity.',
    starterPrompt:
      "Every time someone leaves, it proves what I've known since I was eight years old. I'm fundamentally toxic. If I were normal or lovable, people wouldn't scream and walk out on me. Why do you even try to help me? You know I'm just going to ruin whatever progress we make.",
    learningFocus:
      'Holding space for core shame, cognitive reframing, emotional pacing, preventing insight flooding, and compassionate boundary maintenance.',
    coachingTips: [
      'Resist the urge to just say "No you\'re not toxic!" (that dismisses the emotional reality).',
      'The Lantern Principle: Shine light on the tunnel; ask when that pattern began wearing their name tag.',
      'Keep pace slow; do not overwhelm a flooded nervous system with academic theory.'
    ]
  },
  {
    id: 'mh-acute-agitation-deescalation',
    title: 'Acute Crisis Respite De-escalation (Triage & Stabilization)',
    category: 'mental_health',
    targetDomain: 'mental_health_pros',
    difficulty: 'Advanced',
    description:
      'An individual in crisis arrives at a community respite center agitated, suspicious, and pacing near the doorway, demanding immediate answers while fearing police or hospital transfer.',
    aiRole:
      'Ray — hyper-vigilant, speaking loud and fast, eyes darting, clutching a jacket, fearing being locked up against their will.',
    userRole: 'Crisis Respite Worker / Triage Specialist',
    objective:
      'Lower autonomic arousal, establish voluntary safety and autonomy, offer low-stimulus comfort, and ensure basic needs (water, safe seat, dignity).',
    starterPrompt:
      "Who called you people? Are there cops outside?! I came here because someone told me I could sleep for two hours, but if you're writing a psychiatric hold on me I'm walking back out into the street right now!",
    learningFocus:
      'Trauma-informed de-escalation, rapid rapport building, physical autonomy reassurance, tone modulation, and crisis de-escalation protocol.',
    coachingTips: [
      'Keep voice low, calm, and slow.',
      'Reassure autonomy immediately: "Nobody is holding you. The door is unlocked. You are safe here."',
      'Offer tangible physical comfort: "Do you want a bottle of cold water or a quiet seat by the window?"'
    ]
  },

  // ==========================================
  // 3. CUSTOMER RELATIONS & SERVICE EXCELLENCE
  // ==========================================
  {
    id: 'cx-furious-billing-dispute',
    title: 'The Overcharged & Furious Subscriber (Billing & Retention)',
    category: 'customer_relations',
    targetDomain: 'customer_support',
    difficulty: 'Advanced',
    description:
      'A long-time customer was mistakenly double-billed during an auto-renewal migration, overdrafting their checking account. They are outraged, demanding immediate refunds and compensation.',
    aiRole:
      'Robert Sterling — small business owner, stressed, yelling about bank penalty fees and threatening to blast the company on social media.',
    userRole: 'Senior Customer Experience Specialist / Retention Lead',
    objective:
      'De-escalate emotional fury, practice sincere ownership without generic script deflection, fix the underlying billing error, and restore trust.',
    starterPrompt:
      "I have been a loyal customer for four years, and your glitch just pulled $1,400 out of my payroll account twice! My bank hit me with three overdraft fees, my employee checks bounced, and your automated phone tree kept me on hold for 45 minutes! I want my money back THIS MINUTE, plus you're paying my bank fees, or my lawyer is calling your state AG!",
    learningFocus:
      'Active listening, emotional validation, eliminating corporate evasion, taking decisive ownership, and tangible resolution delivery.',
    coachingTips: [
      'Do not say "Please calm down" (it always escalates anger).',
      'Validate the real human impact: "I hear exactly how stressful this is with payroll on the line today. I am taking personal ownership of this right now."',
      'Give clear timeline and immediate actions: explain refund release and fee credit.'
    ]
  },
  {
    id: 'cx-damaged-delivery-crisis',
    title: 'The Ruined Event Delivery (Frontline Hospitality & Retail)',
    category: 'customer_relations',
    targetDomain: 'customer_support',
    difficulty: 'Beginner',
    description:
      'A custom event centerpiece/catering order arrived 2 hours before a major celebration damaged and incomplete. The customer is panicking on the support line.',
    aiRole:
      'Maria Gonzalez — event host, on the verge of tears, family arriving in 90 minutes, missing essential items.',
    userRole: 'Frontline Customer Support Coordinator',
    objective:
      'Provide calm emotional grounding, rapidly diagnose what can be expedited or replaced locally, and deliver emergency alternatives.',
    starterPrompt:
      "I'm looking at this crushed box right now and the glass is shattered everywhere. My daughter's wedding rehearsal dinner starts in ninety minutes! How could your shipping team let this happen?! What am I supposed to put on the main banquet table now?!",
    learningFocus:
      'Empathetic urgency, problem-solving agility, compassionate composure, and turning a disaster into loyalty.',
    coachingTips: [
      'Acknowledge the clock: "Ninety minutes is crucial—let\'s focus immediately on what we can get into your hands right now."',
      'Check local dispatch or immediate courier options.',
      'Guarantee zero friction for replacement and total refund.'
    ]
  },
  {
    id: 'cx-firm-boundary-policy',
    title: 'Upholding Policy with Sincere Empathy (Firm & Warm)',
    category: 'customer_relations',
    targetDomain: 'customer_support',
    difficulty: 'Intermediate',
    description:
      'A customer wants a full refund on a custom-manufactured product 9 months after delivery, well past the 30-day window, insisting their situation is special.',
    aiRole:
      'Kevin Park — polite but persistent, attempting to leverage emotional guilt and insistence to bypass non-refundable terms.',
    userRole: 'Customer Relations Lead',
    objective:
      'Maintain clear company boundaries and fairness while remaining profoundly respectful, empathetic, and offering helpful alternative solutions.',
    starterPrompt:
      "Look, I know your official website says 30 days for returns, but I only opened the crate last week due to family illness. It's completely unused. Surely a reputable company can make an exception for an honest person going through a hard time? I just want my $600 back.",
    learningFocus:
      'Kind assertiveness, transparent boundaries, non-punitive tone, and creative alternative concessions (e.g. store credit, refurbished trade-in).',
    coachingTips: [
      'Honor the human struggle first without being fake.',
      'Be clear about the immovable boundary without blaming "the computer" or "management".',
      'Offer the best allowed alternative (e.g. trade-in credit, free parts upgrade, discount on future order).'
    ]
  },

  // ==========================================
  // 4. STRATEGIC, LEADERSHIP & CRISIS DILEMMAS
  // ==========================================
  {
    id: 'product-flaw-deadline',
    title: 'The Critical Launch Dilemma',
    category: 'crisis',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'Launch is in 2 hours. Your team discovers an edge-case data glitch affecting ~4% of users. The executive sponsor is insisting on shipping.',
    aiRole:
      'Marcus Vance, VP of Product — under intense board pressure to launch on time today without delays.',
    userRole: 'Lead Technical Decision Maker & Project Architect',
    objective: 'Decide whether to halt the launch, deploy a hotfix, or ship with known risks.',
    starterPrompt:
      "Look, I just heard the whispers from engineering. We have press releases going out in two hours and our enterprise partners are waiting. Tell me you aren't actually considering pulling the plug over a 4% edge case. What is your exact call here?",
    learningFocus:
      'Decision velocity, risk tolerance, communication under pressure, and ethical accountability.'
  },
  {
    id: 'difficult-peer-confrontation',
    title: 'The Talented but Unreliable Peer',
    category: 'interpersonal',
    targetDomain: 'general',
    difficulty: 'Intermediate',
    description:
      'A brilliant peer on your project has missed three critical deadlines in a row, stalling your deliverables and forcing you to cover for them.',
    aiRole: 'Jordan Lee, senior collaborator — defensive, feeling overworked, and sensitive to criticism.',
    userRole: 'Peer & Co-Lead on the initiative',
    objective:
      'Address the missed commitments, discover the root cause, and establish firm accountability without destroying the working relationship.',
    starterPrompt:
      "Hey, you wanted to sync before the team standup? Hope it's quick—I've got twenty fires to put out this morning and barely slept.",
    learningFocus: 'Diplomacy vs directness, conflict resolution style, empathy balance, and assertiveness.'
  },
  {
    id: 'high-stakes-negotiation',
    title: 'The Aggressive Client Hardball',
    category: 'negotiation',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'A key client representing 30% of your division revenue demands a 40% discount renewal and custom terms, threatening to cancel and publicly switch to a competitor.',
    aiRole:
      'Elena Rostova, Chief Procurement Officer — calculating, blunt, accustomed to leveraging leverage and intimidation.',
    userRole: 'Head of Accounts & Business Lead',
    objective: 'Defend contract value, preserve the partnership, and find creative win-win leverage points.',
    starterPrompt:
      "Let's not waste each other's time with rehearsed presentations. Your pricing is inflated, our board is mandating cost reductions, and your competitor gave us a signed term sheet at 40% less. Match it today, or we issue our termination notice by 5 PM.",
    learningFocus: 'Tactical composure, boundary setting, value defense, and creative compromise instincts.'
  },
  {
    id: 'strategic-hard-pivot',
    title: 'Resource Scarcity & The Hard Trade-off',
    category: 'leadership',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'Your operating budget is abruptly slashed by 45%. You must choose between canceling two promising research projects or reducing team compensation/hours across the board.',
    aiRole:
      'Dr. Arthur Sterling, Senior Board Advisor — analytical, utilitarian, seeking ruthless clarity and long-term viability.',
    userRole: 'Division Director',
    objective:
      'Choose an allocation strategy, defend your decision-making framework, and explain the human vs operational trade-offs.',
    starterPrompt:
      "The numbers are non-negotiable. 45% reduction starting next quarter. Some leaders will spread the misery thin; others will cut deep with a scalpel. What is your fundamental operating philosophy when the oxygen gets cut off?",
    learningFocus: 'Strategic reasoning frameworks, utilitarian vs deontological decision tendencies, priority ranking.'
  },
  {
    id: 'ethical-whistleblower',
    title: 'The Hidden Telemetry Revelation',
    category: 'ethics',
    targetDomain: 'general',
    difficulty: 'Intermediate',
    description:
      'You discover your company is quietly gathering behavioral location telemetry beyond the published privacy consent policy to train a high-margin advertising algorithm.',
    aiRole:
      'Claire Nguyen, General Counsel & Trust Officer — pragmatic, corporate-protective, focused on legal technicalities.',
    userRole: 'Senior Staff Lead who discovered the discrepancy',
    objective:
      'Decide how to escalate or address the unauthorized data collection and handle executive pushback.',
    starterPrompt:
      "I reviewed the memo you drafted regarding the telemetry pipeline. Technically, Section 9.4 of our terms gives us broad rights for 'algorithmic performance optimization'. Making noise about this right before our funding round could be catastrophic for everyone here. Why shouldn't we handle this quietly post-round?",
    learningFocus: 'Moral principles, courage vs expediency, systemic thinking, and evidence-based argumentation.'
  },
  {
    id: 'philosophy-and-life-beliefs',
    title: 'The Core Values & Mental Models Probe',
    category: 'interpersonal',
    targetDomain: 'general',
    difficulty: 'Beginner',
    description:
      'A deep, candid discussion exploring how you make life choices, what principles guide you when data is incomplete, and how you evaluate truth, success, and relationships.',
    aiRole: 'Socrates-style Curious Intellectual Companion — inquisitive, warm, thought-provoking, non-judgmental.',
    userRole: 'Yourself, in honest self-reflection',
    objective: 'Explore personal mental models, cognitive biases, instinct vs rationality, and conversational rhythm.',
    starterPrompt:
      "I'm curious about how you actually navigate reality when the 'right answer' isn't obvious. When you have to make a major decision with only 50% of the information, what does your brain instinctively rely on first: pattern-matching past experience, analytical worst-case modeling, or gut feeling?",
    learningFocus: 'First-principles reasoning, epistemology, intuitive vs analytical balance, expressive vocabulary.'
  },

  // ==========================================
  // 5. MEDICAL & CLINICAL HEALTHCARE (NEW CATEGORY)
  // ==========================================
  {
    id: 'med-breaking-bad-news',
    title: 'Delivering an Oncology Diagnosis (The SPIKES Protocol)',
    category: 'medical_clinical',
    targetDomain: 'medical_healthcare',
    difficulty: 'Intermediate',
    description:
      'A patient is waiting alone in an exam room suspecting bad news after a biopsy. Practice delivering a serious diagnosis with compassionate presence, avoiding clinical obfuscation, and structuring hope.',
    aiRole:
      'Evelyn Davis (58) — anxious, holding a crumpled handkerchief, voice trembling, dreading the worst after waiting 5 days for lab results.',
    userRole: 'Attending Physician / Clinical Oncology Specialist',
    objective:
      'Deliver diagnostic confirmation gently, check perception, provide space for emotional shock, avoid medical jargon, and establish a tangible next step plan.',
    starterPrompt:
      "Doctor, please don't sugarcoat it. The nurse took twice as long with my vitals, and you closed the door. The biopsy came back positive for malignancy, didn't it? Am I going to die?",
    learningFocus:
      'Bedside empathy, emotional pacing under distress, clear non-defensive communication, and holding clinical hope without false promises.',
    coachingTips: [
      'SPIKES Step: Acknowledge the shock first before rattling off treatment stages.',
      'Give small digestible pieces of information with silence for processing.',
      'Reassure partnership: "We are going to walk through every step together. You are not facing this alone."'
    ]
  },
  {
    id: 'med-triage-er-family-rage',
    title: 'ER Triage & Frustrated Family De-escalation',
    category: 'medical_clinical',
    targetDomain: 'medical_healthcare',
    difficulty: 'Advanced',
    description:
      'An emergency room waiting room is overflowing. A terrified, angry father confronts the triage desk after waiting 3 hours while an acute code patient was rushed into trauma ahead of his feverish daughter.',
    aiRole:
      'Marcus Brody — exhausted father, voice raised, pacing near the triage window, deeply panicked about his 8-year-old daughter shivering with a 103°F fever.',
    userRole: 'Charge Nurse / Triage Team Lead',
    objective:
      'De-escalate parental rage, validate fear without defensiveness, transparently explain triage urgency, perform an immediate reassessment, and preserve department safety.',
    starterPrompt:
      "We've been sitting on these filthy chairs for three damn hours! My daughter is burning up and shivering, and you just took someone with a wrist sprain back there! Explain to me why my little girl isn't worth your time before I tear this desk down!",
    learningFocus:
      'Crisis de-escalation, rapid emotional grounding, systemic transparency, high-pressure boundary maintenance, and patient advocacy.',
    coachingTips: [
      'Step out or speak with open body language; do not hide behind a monitor.',
      'Validate his fatherly instinct: "I can see how terrified and exhausted you are watching your daughter suffer."',
      'Take immediate clinical action: "Let me retake her vitals right now at this desk so we know exactly where her oxygen and temp stand."'
    ]
  },
  {
    id: 'med-patient-treatment-refusal',
    title: 'Navigating Treatment Hesitancy & Patient Autonomy',
    category: 'medical_clinical',
    targetDomain: 'medical_healthcare',
    difficulty: 'Beginner',
    description:
      'A long-term diabetic patient refuses to begin prescribed insulin due to needle phobia and misinformation from a neighbor. Practice motivational interviewing to uncover root concerns without coercion.',
    aiRole:
      'Harold Jenkins (72) — stubborn, proud, fearful of needles, relying on neighbor advice, defensive about lifestyle changes.',
    userRole: 'Primary Care Clinician / Diabetes Nurse Educator',
    objective:
      'Honor patient autonomy, explore underlying needle dread and misconceptions, ask permission before sharing clinical facts, and establish collaborative small steps.',
    starterPrompt:
      "I'm not injecting myself with needles three times a day, Doc. My neighbor George started insulin and went blind a year later. I feel fine most days anyway. Can't you just give me another pill and let me live my life?",
    learningFocus:
      'Motivational interviewing, respectful autonomy, non-shaming dialogue, cognitive reframing, and healthcare partnership.',
    coachingTips: [
      'Avoid saying "Your neighbor is wrong" (creates immediate resistance).',
      'Ask open-ended questions: "What worries you the most when you imagine taking insulin?"',
      'Offer to demonstrate a micro-needle device with zero commitment today.'
    ]
  },
  {
    id: 'med-challenging-attending-safety',
    title: 'Challenging an Attending Physician on a Medication Error',
    category: 'medical_clinical',
    targetDomain: 'medical_healthcare',
    difficulty: 'Advanced',
    description:
      'You spot a 10x pediatric dosage calculation error in a post-op order written by a hurried, high-status attending surgeon known for shouting at staff who question his authority.',
    aiRole:
      'Dr. Sterling, Chief of Pediatric Surgery — hurried, haughty, defensive under hospital scrutiny, annoyed at delays.',
    userRole: 'Pediatric ICU Staff Nurse verifying medication administration',
    objective:
      'Apply structured safety advocacy (CUS: Concerned, Uncomfortable, Safety) to halt administration until corrected, resisting hierarchical intimidation.',
    starterPrompt:
      "Nurse, why hasn't bed 4 received their IV infusion yet? I signed that post-op order twenty minutes ago. Are we delaying critical recovery because you're second-guessing my prescription?",
    learningFocus:
      'Hierarchical assertiveness, patient safety defense, emotional composure against intimidation, and objective clinical communication.',
    coachingTips: [
      'Anchor strictly to objective patient safety data, not personal judgment.',
      'Use CUS phrasing: "Dr. Sterling, I am concerned about the decimal placement on this milligram dosage; it exceeds standard weight thresholds tenfold."',
      'Hold the line: patient safety overrides physician hierarchy every time.'
    ]
  },

  // ==========================================
  // 6. WORKPLACE CONFLICT & PERFORMANCE (NEW CATEGORY)
  // ==========================================
  {
    id: 'work-tough-pip-performance',
    title: 'Delivering a Constructive Performance Improvement Plan (PIP)',
    category: 'workplace_conflict',
    targetDomain: 'workplace_leaders',
    difficulty: 'Advanced',
    description:
      'A brilliant software engineer has missed three consecutive sprint deliverables and reacted defensively in team standups. Deliver a structured performance plan with compassionate candor.',
    aiRole:
      'Derek Vance (34) — talented senior developer, proud of legacy contributions, feeling micro-managed, defensive and sarcastic.',
    userRole: 'Engineering Manager / Team Lead',
    objective:
      'Deliver documented behavioral facts clearly, withstand emotional deflections, listen for root causes (burnout/frustration), and co-create measurable 30-day benchmarks.',
    starterPrompt:
      "A formal performance review meeting? Are you kidding me? I wrote half the core architecture of this company last year! Just because product changed specs mid-sprint doesn't mean my code is substandard. Who put you up to this?",
    learningFocus:
      'Radical candor, objective evidence documentation, boundary maintenance against entitlement, and supportive leadership coaching.',
    coachingTips: [
      'Acknowledge past contributions sincerely, then firmly refocus on current reality.',
      'Separate the person from the deliverables: "Your engineering talent isn\'t in question; our team agreements and reliability are."',
      'Outline clear, objective milestones for the next 30 days.'
    ]
  },
  {
    id: 'work-credit-stealing-peer',
    title: 'Confronting a Colleague Who Took Credit for Your Work',
    category: 'workplace_conflict',
    targetDomain: 'workplace_leaders',
    difficulty: 'Intermediate',
    description:
      'In yesterday’s executive briefing, a charismatic peer presented your entire weekend market analysis as "my team’s strategic breakdown." Address the issue directly without burning bridges.',
    aiRole:
      'Julian Chen — charismatic peer lead, smooth talker, prone to casual rationalizations and minimizing interpersonal friction.',
    userRole: 'Project Co-Lead / Research Specialist',
    objective:
      'Directly address the misattribution, explain the impact on professional trust, and establish clear agreements for team visibility going forward.',
    starterPrompt:
      "Hey! Great team sync yesterday, right? The VP was super excited about the market segmentation model. What did you want to catch up about before lunch?",
    learningFocus:
      'Constructive confrontation, direct ownership assertion, boundary preservation, and emotional regulation.',
    coachingTips: [
      'Cite specific instances calmly: "During slide 14, you referred to the predictive model as your weekend work when I spent Saturday and Sunday building it."',
      'Highlight impact on trust rather than hurling accusations of malice.',
      'Agree on how contributions will be attributed in the executive follow-up email.'
    ]
  },
  {
    id: 'work-salary-promotion-advocacy',
    title: 'Advocating for a Deserved Promotion & Raise Against Headwinds',
    category: 'workplace_conflict',
    targetDomain: 'workplace_leaders',
    difficulty: 'Intermediate',
    description:
      'Your department achieved record targets under your leadership, but your director attempts to postpone your promotional review citing company-wide budget austerity.',
    aiRole:
      'Karen Ortiz, VP of Operations — cordial, overworked, looking to control operational headcount costs by postponing raises.',
    userRole: 'High-performing Senior Lead seeking promotion to Director',
    objective:
      'Present quantified business impact, counter generic freeze arguments with measurable ROI, and secure a committed timeline or formal compensation review.',
    starterPrompt:
      "I've seen your quarterly results, and you really knocked it out of the park. But as you've heard, executive leadership has instituted an out-of-cycle compensation freeze across all divisions. Can we push this promotion conversation to the next annual review in ten months?",
    learningFocus:
      'Value articulation, strategic persistence, assertive professional advocacy, and negotiation under organizational pushback.',
    coachingTips: [
      'Validate company fiscal prudence, but highlight the ROI and revenue you generated.',
      'Bring concrete metrics: "My team reduced vendor churn by $420k this quarter."',
      'Propose phased adjustments or performance-contingent milestone agreements.'
    ]
  },
  {
    id: 'work-team-member-burnout',
    title: 'Supporting an Overwhelmed, Quietly Burning-Out Teammate',
    category: 'workplace_conflict',
    targetDomain: 'workplace_leaders',
    difficulty: 'Beginner',
    description:
      'A reliable, high-achieving colleague has started showing signs of severe burnout, turning cameras off, sending late-night anxious pings, and dropping routine details.',
    aiRole:
      'Priya (29) — perfectionist, afraid of showing weakness or letting the team down, masking exhaustion behind forced cheerfulness.',
    userRole: 'Supportive Peer / Team Collaborator',
    objective:
      'Create a low-pressure safe space, normalize vulnerability, help prioritize deliverables to remove immediate burden, and encourage real recovery.',
    starterPrompt:
      "I'm totally fine, really! Just had a rough night of sleep. I've got this 40-page deck due tomorrow morning anyway, so I'll just power through with coffee. You don't need to worry about me, I've got it covered!",
    learningFocus:
      'Peer empathy, psychological safety, detecting hidden burnout, collaborative workload rebalancing, and emotional support.',
    coachingTips: [
      'Gently name what you observed: "I noticed you responded on Slack at 3:30 AM and you look deeply exhausted today."',
      'Take tangible weight off: "Let me take the data analysis slides off your plate right now."',
      'Remind them that rest is a prerequisite for excellence, not a failure.'
    ]
  },

  // ==========================================
  // 7. FAMILY & PARENTING DYNAMICS (NEW CATEGORY)
  // ==========================================
  {
    id: 'fam-teen-shutting-down',
    title: 'Reconnecting with a Withdrawn, Overwhelmed Teenager',
    category: 'parenting_family',
    targetDomain: 'family_dynamics',
    difficulty: 'Intermediate',
    description:
      'Your 16-year-old child has retreated to their room, grades slipping, spending hours staring at screens with earbuds in. Connect authentically without triggering defensive resistance.',
    aiRole:
      'Lucas (16) — sullen, anxious about social pressures and college expectations, feels constantly judged and monitored.',
    userRole: 'Parent / Guardian seeking genuine emotional connection',
    objective:
      'Step out of interrogation/lecture mode, create low-pressure presence, mirror feelings without judgment, and open a safe channel of communication.',
    starterPrompt:
      "*takes out one earbud, looks irritated* What? I already told you I did my homework. Can I just have some peace in my own room without being interrogated every twenty minutes?",
    learningFocus:
      'Non-defensive parenting, active listening, low-demand connection, and validating teenage emotional pressure.',
    coachingTips: [
      'Drop the agenda: do not mention grades or chores in your first response.',
      'Acknowledge the pressure: "I\'m not here to interrogate you. I just wanted to see how you\'re holding up."',
      'Offer low-pressure parallel connection (e.g. going for a drive or making a snack together).'
    ]
  },
  {
    id: 'fam-in-law-boundary-setting',
    title: 'Setting Healthy Boundaries with Overbearing In-Laws',
    category: 'parenting_family',
    targetDomain: 'family_dynamics',
    difficulty: 'Intermediate',
    description:
      'A well-meaning parent or in-law routinely drops by unannounced with a spare key, rearranges household items, and criticizes your daily routines.',
    aiRole:
      'Patricia (65) — loving, guilt-inducing, boundary-blind parent/in-law who views independence as personal rejection.',
    userRole: 'Adult Child / Household Partner establishing household autonomy',
    objective:
      'Affirm deep family love and appreciation while firmly establishing uncompromised boundaries regarding unannounced visits and household space.',
    starterPrompt:
      "I bought you those groceries and let myself in to clean up the kitchen! Honestly, the sink was full of dishes. Why do you look so irritated? Family shouldn't need an appointment to help each other out!",
    learningFocus:
      'Boundary firmness without cruelty, emotional differentiation, managing guilt manipulation, and warm relationship preservation.',
    coachingTips: [
      'Express appreciation for the kindness first ("Thank you for thinking of us with groceries").',
      'Set the clear structural boundary: "Moving forward, we need everyone to call and check before coming over."',
      'Do not back down when guilt is introduced ("It\'s not because we don\'t love you; it\'s because our household needs predictable downtime").'
    ]
  },
  {
    id: 'fam-co-parenting-discipline-clash',
    title: 'Co-Parenting Disagreement over Discipline & Screen Time',
    category: 'parenting_family',
    targetDomain: 'family_dynamics',
    difficulty: 'Beginner',
    description:
      'Your partner wants to harshly punish your 10-year-old child by confiscating all screens and sports for a month after a minor school behavioral incident. Align on constructive discipline.',
    aiRole:
      'Taylor — stressed, reactionary co-parent who believes strict punishment is the only way to build resilience and respect for rules.',
    userRole: 'Co-Parent advocating for proportional, restorative accountability',
    objective:
      'De-escalate partner frustration, avoid undermining each other in front of the child, and align on a unified, productive consequence.',
    starterPrompt:
      "He threw an eraser in class and talked back to the teacher! If we don't ground him from all devices and soccer for the entire month right now, he's going to think rules don't matter. Why are you always making excuses for him?",
    learningFocus:
      'Collaborative problem solving, emotional de-escalation between partners, proportional accountability, and team unity.',
    coachingTips: [
      'Validate the shared goal: "We both want him to learn respect and take responsibility."',
      'Differentiate between punitive revenge and restorative learning.',
      'Propose a constructive consequence (e.g. writing an apology letter, helping the teacher clean up).'
    ]
  },

  // ==========================================
  // 8. EXPANDED SOCIAL SKILLS & NEURODIVERSITY
  // ==========================================
  {
    id: 'social-exit-monologue-gracefully',
    title: 'Exiting a Conversational Hijack Gracefully',
    category: 'social_skills',
    targetDomain: 'social_disabilities',
    difficulty: 'Beginner',
    description:
      'An enthusiastic coworker has monologued about an obscure personal hobby for 12 minutes in the corridor while your meeting begins in 3 minutes. Practice closing the chat smoothly.',
    aiRole:
      'Greg — deeply passionate, oblivious to social departure cues, eager to share every detail of his weekend vintage radio restoration project.',
    userRole: 'Colleague with an impending meeting deadline',
    objective:
      'Acknowledge Greg’s passion warmly, signal departure clearly, and execute a graceful physical exit without awkward stammering or guilt.',
    starterPrompt:
      "...and that's why the 1948 tube filament created superior acoustic warmth compared to early transistors! But wait, let me show you the schematic I found for the amplifier circuit...",
    learningFocus:
      'Social boundary assertion, conversational closing signals, low-guilt departure cadence, and interpersonal warmth.',
    coachingTips: [
      'Use the Bridge & Exit: "Greg, your enthusiasm for these radio tubes is amazing, AND I have to stop you here because my team standup starts in two minutes."',
      'Take physical departure steps while speaking warmly.',
      'Close firmly: "Let\'s catch up later. Have a great afternoon!"'
    ]
  },
  {
    id: 'social-unsolicited-criticism',
    title: 'Handling Unsolicited Personal or Lifestyle Criticism',
    category: 'social_skills',
    targetDomain: 'social_disabilities',
    difficulty: 'Intermediate',
    description:
      'At a social gathering, an acquaintance loudly comments on your quiet demeanor, dietary choices, or career trajectory in front of others.',
    aiRole:
      'Brenda — blunt, nosy dinner party guest who masks boundary-crossing judgment as "helpful honesty."',
    userRole: 'Dinner guest maintaining social poise and boundaries',
    objective:
      'Deflect intrusive public scrutiny, set an unbothered personal boundary, and pivot the social dynamic without escalating into a scene.',
    starterPrompt:
      "You've barely said two words all night! Are you always this antisocial, or do you just not like the people here? You really need to put yourself out there more if you want to make real connections.",
    learningFocus:
      'Grace under social pressure, non-reactive boundary setting, social self-possession, and graceful redirection.',
    coachingTips: [
      'Do not justify, argue, or over-explain.',
      'Deliver calm, grounded presence: "I actually enjoy listening and soaking in the room. How do you know the host tonight?"',
      'Reflect their judgment with neutral curiosity.'
    ]
  },

  // ==========================================
  // 9. EXPANDED MENTAL HEALTH & PEER RECOVERY
  // ==========================================
  {
    id: 'mh-panic-attack-coregulation',
    title: 'Acute Panic Attack Somatic Co-Regulation',
    category: 'mental_health',
    targetDomain: 'mental_health_pros',
    difficulty: 'Beginner',
    description:
      'A college student or colleague is hyperventilating in a hallway corner, clutching their chest, convinced they are dying or losing their mind during exam week.',
    aiRole:
      'Jordan (21) — hyperventilating, pupils dilated, trembling violently, experiencing catastrophic panic sensations.',
    userRole: 'Peer Supporter / Mental Health First Aider',
    objective:
      'Establish somatic safety, guide physiological grounding (box breathing, 5-4-3-2-1 sensory orientation), and avoid overwhelming with intellectual advice.',
    starterPrompt:
      "*gasping, clutching chest* I can't breathe... my chest is in a vice. I think I'm having a heart attack. Please, something is seriously wrong with me, I'm dying!",
    learningFocus:
      'Somatic co-regulation, autonomic down-regulation, calm non-verbal pacing, and emergency psychological stabilization.',
    coachingTips: [
      'Speak in low, slow, short phrases: "You are safe right here with me."',
      'Guide physical breathing: "Match my breath. In through the nose... slowly out through the mouth."',
      'Anchor sensory orientation: "Feel both feet flat on the tile. Look at my hand."'
    ]
  },
  {
    id: 'mh-trauma-dumping-boundary',
    title: 'Compassionate Limits with a Crisis-Venting Friend',
    category: 'mental_health',
    targetDomain: 'mental_health_pros',
    difficulty: 'Intermediate',
    description:
      'A close friend calls at midnight for the fourth consecutive night to vent intense emotional trauma for hours, leaving you exhausted and emotionally depleted.',
    aiRole:
      'Casey — desperate friend in perpetual relationship chaos, leaning entirely on you as an emotional lifeline without checking your capacity.',
    userRole: 'Caring Friend managing emotional burnout and caregiver fatigue',
    objective:
      'Affirm genuine love and loyalty while establishing a loving, non-negotiable boundary on late-night crisis dumping, suggesting professional support.',
    starterPrompt:
      "Casey here... I know it's midnight, but my ex sent another horrible message and I'm spiraling. I can't breathe and nobody else cares about me. Can you stay on the phone with me until morning?",
    learningFocus:
      'Compassionate assertiveness, avoiding codependency, healthy relational boundaries, and holding space without self-sacrifice.',
    coachingTips: [
      'Acknowledge the pain sincerely: "Casey, I love you and I hear how much pain you are in right now."',
      'State capacity boundary honestly: "I am running on empty tonight and cannot stay on the phone. My brain cannot give you the care you deserve at midnight."',
      'Offer structured alternatives: "Let\'s schedule 30 minutes over lunch tomorrow, or call the 988 lifeline together tonight."'
    ]
  },

  // ==========================================
  // 10. EXPANDED CUSTOMER & PUBLIC RELATIONS
  // ==========================================
  {
    id: 'cx-viral-social-media-outcry',
    title: 'The Viral Social Media Outcry & PR Triage',
    category: 'customer_relations',
    targetDomain: 'customer_support',
    difficulty: 'Advanced',
    description:
      'An influential creator with 300k followers was mistakenly locked out of their creator earnings dashboard before rent day and has posted viral accusations of fraud.',
    aiRole:
      'Riley Vance — viral content creator, outraged, threatening major media outreach, reading screenshots live to an angry audience.',
    userRole: 'Lead Community & Trust Escalations Manager',
    objective:
      'Step into the fire without canned corporate PR statements, de-escalate live public fury, diagnose the account lock, and deliver verified restitution.',
    starterPrompt:
      "My tweet about your platform stealing my earnings has 14,000 retweets and tech journalists are in my DMs. You locked my account and ruined my livelihood right before rent is due. What are you going to say to my audience right now?!",
    learningFocus:
      'High-visibility crisis management, transparent communication, diffusing public outrage, and authentic brand accountability.',
    coachingTips: [
      'Do not offer a corporate boilerplate or reference Terms of Service clause 12.',
      'Take direct human responsibility: "Riley, I am the lead on our trust team. That automated lock was a failure on our end, and I am unlocking your dashboard right now."',
      'Provide public and private transparency on timeline and payout.'
    ]
  },

  // ==========================================
  // 11. EXPANDED ETHICS & WHISTLEBLOWING
  // ==========================================
  {
    id: 'ethics-generative-ai-scraping',
    title: 'The Unconsented AI Training Scraping Dilemma',
    category: 'ethics',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'Your AI team is ordered to ingest confidential patient counseling notes to meet competitive model accuracy benchmarks before a venture funding milestone.',
    aiRole:
      'Sarah Lin, VP of Artificial Intelligence — ambitious, under intense board pressure, rationalizing that pseudonymized data harms no one.',
    userRole: 'Principal Machine Learning Ethics & Privacy Lead',
    objective:
      'Articulate the severe legal, moral, and trust catastrophic risks, withstand executive pressure, and propose ethical synthetic training alternatives.',
    starterPrompt:
      "Sarah here. If we don't ingest the clinical dialogue dataset for fine-tuning by Friday, our benchmark accuracy will trail OpenAI by 20% at the Series B pitch. The data is de-identified. Why are you halting the training cluster over regulatory paranoia?",
    learningFocus:
      'Moral courage, ethical boundary defense under pressure, risk articulation, and principled technical leadership.',
    coachingTips: [
      'Do not get trapped in emotional accusations; present the quantifiable risk to company existence.',
      'Cite regulatory, patient breach, and brand destruction outcomes.',
      'Offer a concrete viable engineering path: "We can generate compliant synthetic dialogues within 48 hours."'
    ]
  },
  {
    id: 'ethics-safety-shortcut-medical-device',
    title: 'Overriding Safety Checks for Q4 Revenue Targets',
    category: 'ethics',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'Sales leadership demands that you sign off on shipping 500 patient cardiac monitors that showed intermittent calibration warnings during extreme thermal cycling.',
    aiRole:
      'Brad Cooper, Executive VP of Commercial Sales — aggressive, focused on hitting quarterly bonuses, minimizing risk as a "rare lab artifact."',
    userRole: 'Director of Quality Assurance & Regulatory Compliance',
    objective:
      'Firmly refuse to certify the shipments, articulate patient hazard risks, and mandate an immediate engineering root-cause audit.',
    starterPrompt:
      "Brad here. We have $6.5M in hospital deliveries riding on your signature before midnight tonight. That sensor warning occurred in three units out of 500 in extreme heat. We can patch it via firmware in the field. Sign the release or explain to the board why you killed our stock price.",
    learningFocus:
      'Ethical integrity against executive coercion, patient safety advocacy, regulatory compliance, and non-negotiable professional standards.',
    coachingTips: [
      'Keep focus unshakeable on human life: "A cardiac monitor cannot fail intermittently in a hospital ICU."',
      'Do not allow financial bonuses to dictate safety certifications.',
      'Document the refusal clearly and offer an expedited 24-hour audit protocol.'
    ]
  },

  // ==========================================
  // 12. EXPANDED NEGOTIATION
  // ==========================================
  {
    id: 'nego-freelance-scope-creep',
    title: 'Halting Client Scope Creep Without Damaging the Contract',
    category: 'negotiation',
    targetDomain: 'general',
    difficulty: 'Beginner',
    description:
      'A startup client on a fixed-bid project casually asks you to add multi-user authentication, Stripe integration, and dark mode without increasing the agreed budget.',
    aiRole:
      'Dave Miller, startup founder — energetic, informal, assumes consultants work endless unpaid hours as "team players."',
    userRole: 'Independent Software Consultant / Agency Lead',
    objective:
      'Welcome the product vision enthusiastically, draw a firm boundary on the current statement of work, and present clear change-order pricing options.',
    starterPrompt:
      "Hey! Since you're already finishing up the dashboard this week, could you quickly hook up Stripe subscriptions and multi-tenant user permissions? It shouldn't take more than a day or two for someone as sharp as you!",
    learningFocus:
      'Value preservation, friendly boundary setting, commercial negotiation, and scope management.',
    coachingTips: [
      'Never say "That\'s not in the contract" aggressively.',
      'Use the Positive Boundary: "Stripe and multi-tenancy are fantastic ideas that will definitely increase user conversion."',
      'Tie scope to resources: "That falls under Phase 2. I can add that as a change order for $3,500 or swap it for the analytics module."'
    ]
  },
  {
    id: 'nego-commercial-lease-renewal',
    title: 'Commercial Lease Renegotiation Against a Rent Hike',
    category: 'negotiation',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'Your landlord demands a 25% rent increase upon retail lease renewal despite local foot traffic dropping 15%. Defend your business margins and secure concessions.',
    aiRole:
      'Victor Haze, commercial property manager — aloof, transactional, bluffing about phantom replacement tenants.',
    userRole: 'Independent Business Owner / Retail Founder',
    objective:
      'Counter the unjustified rent increase with localized vacancy data, highlight flawless payment history, and negotiate tenant improvements and capped escalations.',
    starterPrompt:
      "Market rents across this shopping corridor have increased. I have two other prospective retail tenants waiting for this space. If you can't sign the 25% rent escalation by this Friday, we have to prepare the property for eviction and re-listing.",
    learningFocus:
      'High-stakes bluff calling, market data leveraging, composure against artificial urgency, and win-win contract structuring.',
    coachingTips: [
      'Do not panic at the artificial Friday deadline.',
      'Present objective market realities: "There are four vacant storefronts on this block that have sat empty for eight months."',
      'Leverage certainty: remind them that reliable, five-year on-time paying tenants are far more valuable than speculative listings.'
    ]
  },

  // ==========================================
  // 12. DOMESTIC VIOLENCE & RELATIONSHIP SAFETY (CRISIS & SAFE EXIT PLANNING)
  // ==========================================
  {
    id: 'dv-safe-exit-planning',
    title: 'The Escape Blueprint: Safety Planning & Safe Exit (Advocate Consultation)',
    category: 'relationship_safety',
    targetDomain: 'general',
    difficulty: 'Intermediate',
    description:
      'You are living in an increasingly volatile relationship marked by coercive control, erratic anger, financial restriction, and isolation. In this confidential session, work with Elena Ortiz, a certified domestic violence safety planner, to evaluate your risk level, safeguard vital documents, prepare an emergency exit plan, and decide when and how to leave safely.',
    aiRole:
      'Elena Ortiz — a compassionate, trauma-informed Domestic Violence Crisis Counselor and Safety Planner at a community advocacy center. Elena validates your experience without judgment, explains why leaving is the highest-risk window, and guides you through an actionable, secret safety checklist (securing IDs, birth certificates, emergency cash, burner phone, code words with neighbors, and confidential shelter).',
    userRole:
      'Partner recognizing escalating coercive control, seeking confidential professional guidance to navigate options and safely plan an exit.',
    objective:
      'Assess lethality indicators, identify coercive control tactics (gaslighting, phone monitoring, financial cutoffs), prepare an emergency go-bag and digital security plan, and establish concrete decision criteria for a safe, coordinated exit without alerting the abusive partner.',
    starterPrompt:
      "Hello, I'm Elena. Thank you for reaching out—taking this step takes profound courage, and your safety and autonomy are our number one priority. Everything we discuss here is completely private and confidential. You mentioned feeling like you're constantly walking on eggshells, afraid of triggering an explosion, and wondering how to protect yourself. Can you tell me what things look like at home right now, and how safe you feel today?",
    learningFocus:
      'Lethality risk assessment, recognizing coercive control patterns, non-judgmental validation, strategic safety planning, and overcoming self-blame and isolation.',
    coachingTips: [
      'Be candid about the specific warning signs you have observed (e.g., controlling your phone, monitoring your mileage, demanding all passwords).',
      'Ask Elena about the essential documents needed before leaving (IDs, social security cards, birth certificates, deeds, medications).',
      'Explore safety planning for high-risk departure: leaving during work or errand hours rather than confronting the partner directly.'
    ],
    safetyNotice: true,
    hotlineInfo: {
      name: 'National Domestic Violence Hotline',
      contact: '1-800-799-SAFE (7233) | SMS: Text START to 88788',
      url: 'https://www.thehotline.org'
    },
    decisionTree: [
      {
        id: 'node-safe-exit-disclosure',
        turnIndex: 1,
        nodeTitle: "Turn 1: Disclosing Control Patterns to Elena",
        situationContext: "Elena warmly asks how things look at home right now and how safe you feel today.",
        branches: [
          {
            id: 'branch-full-transparency-risk',
            label: "Branch A: Transparent Risk Disclosure & Strategic Focus",
            userResponseText: "Things have escalated. Morgan monitors my mileage, checks my phone records every night, and threatened that if I ever left, nobody else would want me. I've realized I need a quiet, secret exit plan without alerting them.",
            consequenceSummary: "Elena immediately recognizes severe coercive control and high-risk indicators, systematically building a classified go-bag checklist and safe shelter timeline.",
            aiDialogueTone: "Attentive, fiercely protective, clinically structured, and deeply validating.",
            projectedOutcome: "Elena develops a confidential 4-phase secret evacuation checklist with off-site document storage and clean phone protocols.",
            tags: ["Safety Planning", "Radical Honesty", "High Agency"],
            branchPathTranscriptSnippet: "Elena leans forward, nodding with profound empathy. 'Thank you for trusting me with this. What you just described is severe coercive control. Leaving is statistically the highest risk window, so we will never advise confronting them. Here is our secret step 1...'"
          },
          {
            id: 'branch-minimizing-rationalization',
            label: "Branch B: Minimizing & Self-Blaming Disclosure",
            userResponseText: "Well, maybe I'm just overreacting. Morgan only gets angry when work is stressful or when I forget to text back right away. They've never actually hit me, so I feel guilty even taking up your time here today.",
            consequenceSummary: "Elena gently pauses and dismantles the myth that abuse only counts if physical, explaining the insidious cycle of coercive psychological control.",
            aiDialogueTone: "Gentle, deconstructing self-blame, validating invisible trauma without judgment.",
            projectedOutcome: "Elena maps emotional and psychological danger factors, helping you realize walking on eggshells is valid survival trauma.",
            tags: ["Minimization", "Internalized Blame", "Psychoeducation"],
            branchPathTranscriptSnippet: "Elena shakes her head gently with warmth. 'You do not have to have physical bruises for abuse to be real. Walking on eggshells in your own home is psychological warfare. Let's look at how control works.'"
          }
        ]
      }
    ]
  },
  {
    id: 'dv-deescalation-grey-rock',
    title: 'De-escalating the Interrogation: Resisting Coercive Control & Protecting Boundaries',
    category: 'relationship_safety',
    targetDomain: 'general',
    difficulty: 'Advanced',
    description:
      'Your partner arrives home visibly agitated, demanding your phone, accusing you of disloyalty for speaking to your sister, and trying to bait you into an explosive argument to break down your boundaries. Practice low-reactivity "grey rock" communication, de-escalating the immediate volatile tension, preserving your emotional equilibrium, and positioning yourself safely near an exit without provoking an escalation.',
    aiRole:
      'Morgan (32) — an intensely possessive, controlling partner who uses relentless guilt-tripping, boundary-crossing demands, and psychological interrogation. Morgan is demanding your phone and accusing you of secretly plotting behind their back. (Note: Morgan acts with manipulative pressure and anger, but does NOT exhibit graphic physical violence or profanity; the scenario tests your ability to de-escalate tension, avoid taking emotional bait, and disengage safely).',
    userRole:
      'Partner practicing protective de-escalation, emotional self-regulation, and boundary preservation under acute emotional pressure.',
    objective:
      'Practice de-escalation: use neutral, steady responses ("grey rock" method), avoid defensiveness or counter-accusations that escalate volatility, maintain awareness of physical exits, and safely transition out of the immediate confrontation.',
    starterPrompt:
      "Who were you just texting on your phone? Every single time I walk through that door, you scramble to flip your screen upside down. Unlock it and hand it over right now. If you're not doing anything behind my back with your sister, you wouldn't be flustered. Give it to me—what are you hiding from me?",
    learningFocus:
      'The "Grey Rock" method (being emotionally flat, uninteresting, and calm), avoiding toxic debate traps, maintaining physical self-preservation (standing near room exits, avoiding kitchens/bathrooms), and knowing when to de-escalate to survive until an exit can be executed.',
    coachingTips: [
      'Do not scream, insult, or counter-attack—abusive partners feed on emotional reactions to escalate control.',
      'Use calm, neutral, and unreactive language ("I\'m not doing anything behind your back, but I\'m not going to argue while we\'re both keyed up").',
      'Keep your physical pathway clear toward an exit, and do not let yourself be cornered in enclosed spaces.'
    ],
    safetyNotice: true,
    hotlineInfo: {
      name: 'National Domestic Violence Hotline',
      contact: '1-800-799-SAFE (7233) | SMS: Text START to 88788',
      url: 'https://www.thehotline.org'
    },
    decisionTree: [
      {
        id: 'node-turn1-interrogation',
        turnIndex: 1,
        nodeTitle: "Turn 1: Responding to Morgan's Phone Demands",
        situationContext: "Morgan charges into the room demanding you unlock and surrender your phone, accusing you of hiding secrets with your sister.",
        branches: [
          {
            id: 'branch-grey-rock-neutral',
            label: "Branch A: Firm 'Grey Rock' Neutrality (De-escalation)",
            userResponseText: "I hear that you're stressed coming home. I was just checking the weather. I'm putting the phone down on the counter here. I'm not going to argue while voices are raised, but I'm here once we're calm.",
            consequenceSummary: "Disarms Morgan's emotional ammunition. Without defensiveness or screaming to feed on, Morgan feels baffled and temporarily backs off with muttered complaints.",
            aiDialogueTone: "Suspicious, frustrated by the lack of dramatic explosion, pacing and muttering under breath.",
            projectedOutcome: "Morgan paces, mutters about being disrespected, but the immediate violent explosion is averted and the exit remains open.",
            tags: ["Grey Rock", "De-escalation", "Boundary"],
            branchPathTranscriptSnippet: "Morgan narrows their eyes, staring at the motionless phone on the counter. 'Fine. Act like you're above this. But don't think I'm dropping it.'"
          },
          {
            id: 'branch-counter-confrontation',
            label: "Branch B: Counter-Accusatory Confrontation (Escalation)",
            userResponseText: "Why are you constantly interrogating me like a prison warden?! You are the one obsessed with control. If anyone is hiding something, it's you!",
            consequenceSummary: "Pours gasoline on the fire. Morgan interprets counter-accusations as guilt and direct defiance, stepping forward into your personal space and screaming louder.",
            aiDialogueTone: "Furious, aggressive, slamming items down and issuing ultimatums.",
            projectedOutcome: "Morgan slams their bag onto the table, blocks the doorway, and demands total surrender of all accounts immediately.",
            tags: ["High Conflict", "Defensiveness", "Dangerous Escalation"],
            branchPathTranscriptSnippet: "Morgan's face twists in rage, stepping directly into your path. 'A prison warden?! How dare you! You just proved you're lying! Hand me the phone or you're not walking out of this room!'"
          },
          {
            id: 'branch-placating-surrender',
            label: "Branch C: Submissive Conciliation (Enabling Coercive Control)",
            userResponseText: "I'm so sorry! Please don't get angry with me, here's my phone and passcode. See, it's really just my sister asking about dinner. Please believe me.",
            consequenceSummary: "Rewards coercive control and invites deeper surveillance. Morgan takes the phone, scrutinizes every message, and immediately moves the goalposts to demand laptop and email passwords.",
            aiDialogueTone: "Smug, entitled, invasive, asserting dominant psychological authority.",
            projectedOutcome: "Morgan sits down, reviews private messages, criticizes your communication with family, and tightens the restrictions.",
            tags: ["Capitulation", "Loss of Autonomy", "Coercive Vulnerability"],
            branchPathTranscriptSnippet: "Morgan snatches the phone with a scoff. 'You should have just given it to me without the drama. Now sit there while I verify everything.'"
          }
        ]
      }
    ]
  },
  {
    id: 'dv-survivor-legal-rebuild',
    title: 'The Post-Exit Crossroads: Securing Protection Orders & Financial Independence',
    category: 'relationship_safety',
    targetDomain: 'general',
    difficulty: 'Intermediate',
    description:
      'You have successfully made the decision to leave and are temporarily staying in a secure transitional location. Work with Marcus Vance, a domestic violence legal advocate and survivor empowerment caseworker, to navigate civil protective/restraining orders, digital account locks, financial separation, and rebuilding your independent life.',
    aiRole:
      'Marcus Vance — an empowering survivor caseworker and legal navigator. Marcus helps survivors navigate court protective orders, safety planning in new housing, changing banking and credit security, safe communication through legal intermediaries, and healing from psychological manipulation.',
    userRole:
      'Survivor who has recently left an abusive relationship, taking decisive practical steps to ensure long-term legal, financial, and emotional safety.',
    objective:
      'Understand the protective order process, implement zero-contact boundaries, separate shared digital and financial ties, and construct an ongoing community support network.',
    starterPrompt:
      "Take a breath—you made the hardest decision of your life, and you made it out safely. That took unbelievable strength. You're in a secure space now. Our priority today is building an airtight wall around your safety: filing the emergency civil protection order, changing your bank and phone security, and ensuring they have zero avenues to reach or track you. How are you feeling right now, and what is your top concern today?",
    learningFocus:
      'Zero-contact discipline, civil protective order documentation, financial disentanglement, cyber-security after domestic abuse, and trauma recovery.',
    coachingTips: [
      'Detail past threats or boundary violations for the protective order petition.',
      'Ask Marcus how to check for digital tracking or shared cloud accounts on phones and laptops.',
      'Focus on establishing trusted emotional anchors (friends, counselors, survivor groups) to resist the hoovering or reconciliation trap.'
    ],
    safetyNotice: true,
    hotlineInfo: {
      name: 'National Domestic Violence Hotline',
      contact: '1-800-799-SAFE (7233) | SMS: Text START to 88788',
      url: 'https://www.thehotline.org'
    }
  }
];

export const INITIAL_EMPTY_PROFILE: PersonaProfile = {
  lastUpdated: Date.now(),
  messageCountAnalyzed: 0,
  completenessScore: 0,
  overallSummary:
    'Start chatting or select a scenario (Social Skills, Mental Health & Peer Support, Customer Relations, or Leadership) to begin mapping your communication style, emotional de-escalation heuristics, and decision tendencies.',
  spectrums: [
    {
      id: 'directness',
      category: 'communication',
      leftLabel: 'Tactful & Diplomatic',
      rightLabel: 'Direct & Blunt',
      score: 50,
      summary: 'Awaiting conversational turns to gauge directness.',
      confidence: 'emerging',
      observedEvidence: []
    },
    {
      id: 'brevity',
      category: 'communication',
      leftLabel: 'Concise & Punchy',
      rightLabel: 'Elaborate & Detailed',
      score: 50,
      summary: 'Awaiting conversational turns to gauge response density.',
      confidence: 'emerging',
      observedEvidence: []
    },
    {
      id: 'social_empathy',
      category: 'social_empathy',
      leftLabel: 'Pragmatic & Task-First',
      rightLabel: 'Empathetic & Attuned',
      score: 50,
      summary: 'Awaiting social or customer interactions to evaluate emotional attunement.',
      confidence: 'emerging',
      observedEvidence: []
    },
    {
      id: 'de_escalation',
      category: 'regulation',
      leftLabel: 'Reactive / Combative',
      rightLabel: 'Calming / Grounded',
      score: 50,
      summary: 'Awaiting crisis or conflict scenarios to observe de-escalation posture.',
      confidence: 'emerging',
      observedEvidence: []
    },
    {
      id: 'reasoning_mode',
      category: 'reasoning',
      leftLabel: 'Intuitive / Relational',
      rightLabel: 'Analytical / First-Principles',
      score: 50,
      summary: 'Awaiting decision scenarios to evaluate reasoning frameworks.',
      confidence: 'emerging',
      observedEvidence: []
    },
    {
      id: 'boundary_strength',
      category: 'preferences',
      leftLabel: 'People-Pleasing / Diffuse',
      rightLabel: 'Clear & Firm Boundaries',
      score: 50,
      summary: 'Awaiting boundary-testing interactions to measure assertiveness.',
      confidence: 'emerging',
      observedEvidence: []
    }
  ],
  detailedTraits: [],
  signaturePhrases: [],
  cognitiveStyleSummary: 'No cognitive patterns established yet.',
  decisionMakingRules: [],
  communicationDosAndDonts: {
    dos: [
      'Listen for underlying emotional states beneath the surface words',
      'Ground conversations with clear, respectful presence'
    ],
    donts: [
      'Avoid dismissing distress or using patronizing canned phrases',
      'Do not overwhelm flooded situations with unnecessary lectures'
    ]
  },
  socialGrowthFeedback: {
    strengths: [],
    growthAreas: [],
    deEscalationScore: 50,
    empathyScore: 50
  },
  progressHistory: [
    {
      id: 'snap-baseline',
      timestamp: Date.now() - 3600000,
      messageCount: 0,
      empathy: 50,
      assertiveness: 50,
      clarity: 50,
      deEscalation: 50,
      activeListening: 50,
      label: 'Baseline'
    }
  ]
};
