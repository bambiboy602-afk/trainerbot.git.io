import { ChatMessage, PersonaProfile, Scenario, ScenarioEvaluation, ScenarioSessionTranscript } from '../types';
import { INITIAL_EMPTY_PROFILE, DEFAULT_SCENARIOS } from '../data/defaultScenarios';

const STORAGE_KEYS = {
  MESSAGES: 'persona_bot_messages_v1',
  PROFILE: 'persona_bot_profile_v1',
  ACTIVE_SCENARIO: 'persona_bot_active_scenario_v1',
  CUSTOM_SCENARIOS: 'persona_bot_custom_scenarios_v1',
  LAST_ANALYZED_COUNT: 'persona_bot_last_analyzed_count_v1',
  SCENARIO_EVALUATIONS: 'persona_bot_scenario_evaluations_v1',
  TRANSCRIPTS: 'persona_bot_scenario_transcripts_v1'
};

export function loadMessagesFromStorage(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load messages from localStorage', err);
    return [];
  }
}

export function saveMessagesToStorage(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save messages to localStorage', err);
  }
}

export function loadProfileFromStorage(): PersonaProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return INITIAL_EMPTY_PROFILE;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load profile from localStorage', err);
    return INITIAL_EMPTY_PROFILE;
  }
}

export function saveProfileToStorage(profile: PersonaProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function loadActiveScenario(): Scenario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SCENARIO);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveScenario(scenario: Scenario | null): void {
  try {
    if (!scenario) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SCENARIO);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SCENARIO, JSON.stringify(scenario));
    }
  } catch (err) {
    console.error('Failed to save active scenario', err);
  }
}

export function loadCustomScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCENARIOS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomScenarios(scenarios: Scenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENARIOS, JSON.stringify(scenarios));
  } catch (err) {
    console.error('Failed to save custom scenarios', err);
  }
}

export function loadScenarioEvaluations(): ScenarioEvaluation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCENARIO_EVALUATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveScenarioEvaluation(evaluation: ScenarioEvaluation): void {
  try {
    const current = loadScenarioEvaluations();
    const updated = [evaluation, ...current.filter((e) => e.id !== evaluation.id)];
    localStorage.setItem(STORAGE_KEYS.SCENARIO_EVALUATIONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save scenario evaluation', err);
  }
}

export function loadScenarioTranscripts(): ScenarioSessionTranscript[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTS);
    const stored: ScenarioSessionTranscript[] = raw ? JSON.parse(raw) : [];

    // Synthesize any completed scenarios present in active messages history if not already captured
    const allMessages = loadMessagesFromStorage();
    const scenarioMsgGroups: Record<string, ChatMessage[]> = {};

    allMessages.forEach((msg) => {
      if (msg.scenarioId) {
        if (!scenarioMsgGroups[msg.scenarioId]) {
          scenarioMsgGroups[msg.scenarioId] = [];
        }
        scenarioMsgGroups[msg.scenarioId].push(msg);
      }
    });

    const evaluations = loadScenarioEvaluations();
    const customScenarios = loadCustomScenarios();
    const scenariosCatalog = [...DEFAULT_SCENARIOS, ...customScenarios];

    // For any scenario in messages that has user messages and isn't yet saved in stored transcripts
    Object.entries(scenarioMsgGroups).forEach(([scId, msgs]) => {
      const alreadyCaptured = stored.some((s) => s.scenarioId === scId);
      if (!alreadyCaptured && msgs.length >= 2) {
        const scenarioMeta = scenariosCatalog.find((s) => s.id === scId);
        const evalItem = evaluations.find((e) => e.scenarioId === scId);
        const firstMsgTime = msgs[0]?.timestamp || Date.now();
        const lastMsgTime = msgs[msgs.length - 1]?.timestamp || Date.now();

        const synthesized: ScenarioSessionTranscript = {
          id: `transcript-${scId}-${firstMsgTime}`,
          scenarioId: scId,
          scenarioTitle: scenarioMeta?.title || msgs[0]?.scenarioTitle || 'Scenario Session',
          scenarioCategory: scenarioMeta?.category || 'interpersonal',
          scenarioDifficulty: scenarioMeta?.difficulty || 'Intermediate',
          scenarioAiRole: scenarioMeta?.aiRole || 'Roleplay Counterpart',
          scenarioUserRole: scenarioMeta?.userRole || 'Participant',
          objective: scenarioMeta?.objective,
          learningFocus: scenarioMeta?.learningFocus,
          startedAt: firstMsgTime,
          completedAt: lastMsgTime,
          messages: msgs,
          evaluation: evalItem,
          decisionNodes: scenarioMeta?.decisionTree
        };
        stored.push(synthesized);
      }
    });

    // Enrich existing stored transcripts with decisionTree from scenario catalog if missing
    stored.forEach((t) => {
      if ((!t.decisionNodes || t.decisionNodes.length === 0) && t.scenarioId) {
        const scenarioMeta = scenariosCatalog.find((s) => s.id === t.scenarioId);
        if (scenarioMeta?.decisionTree && scenarioMeta.decisionTree.length > 0) {
          t.decisionNodes = JSON.parse(JSON.stringify(scenarioMeta.decisionTree));
        }
      }
    });

    return stored.sort((a, b) => b.completedAt - a.completedAt);
  } catch (err) {
    console.error('Failed to load scenario transcripts', err);
    return [];
  }
}

export function saveScenarioTranscript(transcript: ScenarioSessionTranscript): void {
  try {
    const current = loadScenarioTranscripts();
    const updated = [transcript, ...current.filter((t) => t.id !== transcript.id)];
    localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save scenario transcript', err);
  }
}

export function deleteScenarioTranscript(transcriptId: string): void {
  try {
    const current = loadScenarioTranscripts();
    const updated = current.filter((t) => t.id !== transcriptId);
    localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete scenario transcript', err);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SCENARIO);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_SCENARIOS);
    localStorage.removeItem(STORAGE_KEYS.SCENARIO_EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.TRANSCRIPTS);
  } catch (err) {
    console.error('Failed to clear local data', err);
  }
}
