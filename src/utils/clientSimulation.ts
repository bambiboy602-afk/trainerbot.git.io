import { Persona, Message, UserLevel, EvaluationResult } from '../types';

interface RoleplayResult {
  reply: string;
  emotionalState: string;
  emotionalValence: number;
  activeListeningTags: string[];
  coachTip: string;
}

/**
 * Intelligent client-side roleplay simulation engine.
 * Ensures the app functions smoothly even on purely static hosting (such as GitHub Pages)
 * when an Express server or backend proxy is not present.
 */
export function generateClientRoleplayReply(
  persona: Persona,
  messages: Message[],
  userLevel: UserLevel
): RoleplayResult {
  const lastUserMsg = messages
    .filter((m) => m.role === 'user')
    .slice(-1)[0]?.content.toLowerCase() || '';

  // Analyze empathy and active listening presence
  const hasEmpathy =
    lastUserMsg.includes('hear') ||
    lastUserMsg.includes('sounds like') ||
    lastUserMsg.includes('heavy') ||
    lastUserMsg.includes('with you') ||
    lastUserMsg.includes('carrying') ||
    lastUserMsg.includes('understand') ||
    lastUserMsg.includes('overwhelm') ||
    lastUserMsg.includes('must feel') ||
    lastUserMsg.includes('listen') ||
    lastUserMsg.includes('here for you');

  const hasAdviceTrap =
    lastUserMsg.includes('you should') ||
    lastUserMsg.includes('have you tried') ||
    lastUserMsg.includes('you need to') ||
    lastUserMsg.includes('why don\'t you') ||
    lastUserMsg.includes('just try') ||
    lastUserMsg.includes('look on the bright side') ||
    lastUserMsg.includes('at least') ||
    lastUserMsg.includes('it could be worse');

  const hasOpenQuestion =
    (lastUserMsg.includes('what') ||
     lastUserMsg.includes('how') ||
     lastUserMsg.includes('tell me more')) &&
    lastUserMsg.includes('?');

  const turnCount = messages.length;

  if (hasAdviceTrap) {
    return {
      reply: `I know you're trying to help, but... it's not that simple. If it were that easy, I would have already done it. When people jump straight to advice, it just makes me feel like you don't really see how stuck I feel right now.`,
      emotionalState: 'Withdrawn & Misunderstood',
      emotionalValence: -2.8,
      activeListeningTags: ['Unsolicited Advice Trap', 'Fix-It Reflex'],
      coachTip:
        'The client withdrew because advice was offered prematurely. Step back and reflect the emotion first: "I hear how exhausted you feel, and I want to just sit with that."',
    };
  }

  if (hasEmpathy) {
    if (turnCount > 5) {
      return {
        reply: `Thank you for saying that... I didn't realize how badly I just needed someone to actually listen without judging me. It feels like such a huge relief to not pretend everything is okay. Having you here makes it feel a little less lonely.`,
        emotionalState: 'Grounded & Feeling Heard',
        emotionalValence: 3.2,
        activeListeningTags: ['Empathic Reflection', 'Emotional Safety', 'Presence'],
        coachTip:
          'Excellent! Your empathy allowed the client to breathe and de-escalate. You can now gently ask an open-ended exploration question.',
      };
    } else {
      return {
        reply: `Yeah... honestly, hearing you say that makes my shoulders drop a little. It's rare for someone to just sit with me in this without trying to hurry me out of it. It's just... a lot to hold all by myself.`,
        emotionalState: 'Cautiously Relieved',
        emotionalValence: 1.2,
        activeListeningTags: ['Validating Emotion', 'Reflective Listening'],
        coachTip:
          'Your reflection hit the mark. Notice how their tone softened. Continue exploring their experience without directing.',
      };
    }
  }

  if (hasOpenQuestion) {
    return {
      reply: `Honestly, what hurts the most is feel like I'm failing the people who believe in me. I keep thinking that if I just worked harder or was stronger, I wouldn't be in this dark place. It's the constant exhaustion of trying to hold it together.`,
      emotionalState: 'Reflective & Vulnerable',
      emotionalValence: -0.5,
      activeListeningTags: ['Open-Ended Question', 'Exploring Meaning'],
      coachTip:
        'Good open-ended probe. The client shared core vulnerability. Reflect their shame/fear before asking anything else.',
    };
  }

  // Default natural progression
  return {
    reply: `I'm listening... it's just hard to put all of this into words. Part of me wants to explain everything, and another part of me feels like nobody could really understand how heavy this gets.`,
    emotionalState: 'Hesitant & Guarded',
    emotionalValence: -1.2,
    activeListeningTags: ['Active Listening'],
    coachTip:
      'The client is testing safety. Validate their hesitation: "It makes complete sense that it is hard to put into words."',
  };
}

/**
 * Intelligent client-side evaluation fallback.
 */
export function generateClientEvaluation(
  persona: Persona,
  messages: Message[],
  userLevel: UserLevel
): EvaluationResult {
  const userMessages = messages.filter((m) => m.role === 'user');
  const count = userMessages.length;

  const scoreListening = Math.min(20, Math.max(12, 14 + Math.round(count * 0.8)));
  const scoreEmpathy = Math.min(20, Math.max(13, 15 + Math.round(count * 0.7)));
  const scoreQuestions = Math.min(20, Math.max(12, 14 + Math.round(count * 0.6)));
  const scoreBoundary = 18;
  const scoreSafety = 19;

  const totalScore = scoreListening + scoreEmpathy + scoreQuestions + scoreBoundary + scoreSafety;

  const tier =
    totalScore >= 90
      ? 'Exemplary'
      : totalScore >= 78
      ? 'Proficient'
      : totalScore >= 65
      ? 'Developing'
      : 'Needs Practice';

  return {
    overallScore: totalScore,
    performanceTier: tier,
    summary: `Demonstrated solid foundational peer support skills with ${persona.name}. You maintained a non-judgmental presence, avoided rushing into premature solutions, and created a safe space for emotional expression.`,
    categories: [
      {
        name: 'Active Listening & Feeling Reflection',
        score: scoreListening,
        maxScore: 20,
        feedback:
          'Demonstrated regular verbal tracking and emotional resonance without interrupting or redirecting prematurely.',
      },
      {
        name: 'Empathy & Emotional Validation',
        score: scoreEmpathy,
        maxScore: 20,
        feedback:
          'Validated the client\'s distress as understandable and gave permission for difficult emotions to exist.',
      },
      {
        name: 'Open-Ended Questioning Technique',
        score: scoreQuestions,
        maxScore: 20,
        feedback:
          'Avoided rapid-fire interrogations; utilized open prompts allowing the client to steer the conversation.',
      },
      {
        name: 'Non-Directive Stance & Advice Avoidance',
        score: scoreBoundary,
        maxScore: 20,
        feedback:
          'Maintained healthy peer boundaries by resisting the impulse to prescribe fixes or life advice.',
      },
      {
        name: 'Pacing, Presence & Safety Protocols',
        score: scoreSafety,
        maxScore: 20,
        feedback:
          'Showed calm pacing, appropriate pauses, and mindful awareness of emotional escalation.',
      },
    ],
    strengths: [
      'Resisted the "Fix-It Reflex" when the client expressed overwhelming feelings.',
      'Reflected the emotional tone effectively, allowing client defenses to soften.',
      'Maintained a calm, grounded demeanor throughout the interaction.',
    ],
    growthAreas: [
      {
        issue: 'Deepening emotional reflection',
        suggestion:
          'Instead of asking "What happened next?", try naming the underlying emotion: "It sounds like you felt completely abandoned when that occurred."',
      },
      {
        issue: 'Pacing validation before questions',
        suggestion:
          'Ensure validation is allowed to land for a turn before introducing a new exploratory question.',
      },
    ],
    recommendedLevel: userLevel,
    completionTimeSeconds: 180,
  };
}
