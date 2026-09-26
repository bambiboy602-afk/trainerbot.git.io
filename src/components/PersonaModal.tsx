import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  Sparkles, 
  Check, 
  Plus, 
  User, 
  Sliders, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Persona, UserLevel } from '../types';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  currentPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  onAddCustomPersona: (persona: Persona) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  personas,
  currentPersona,
  onSelectPersona,
  onAddCustomPersona,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'create' | 'upload'>('presets');
  const [filterLevel, setFilterLevel] = useState<UserLevel | 'all'>('all');

  // Custom persona form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [role, setRole] = useState('');
  const [userLevel, setUserLevel] = useState<UserLevel>('novice');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [background, setBackground] = useState('');
  const [tone, setTone] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('');
  const [openingMessage, setOpeningMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPersonas = personas.filter((p) => {
    if (filterLevel === 'all') return true;
    return p.userLevel === filterLevel;
  });

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setJsonError(null);

    try {
      const res = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, level: userLevel }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate persona from AI.');
      }

      const generated: Persona = await res.json();
      setName(generated.name || '');
      setAge(generated.age || 25);
      setRole(generated.role || '');
      setScenarioTitle(generated.scenarioTitle || '');
      setBackground(generated.background || '');
      setTone(generated.tone || '');
      setAiDifficulty(generated.aiDifficulty || '');
      setOpeningMessage(generated.openingMessage || '');
      setUserLevel(generated.userLevel || 'intermediate');
    } catch (err: any) {
      setJsonError(err.message || 'Error generating persona');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !background.trim()) {
      setJsonError('Name and Background are required.');
      return;
    }

    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      age: Number(age) || 28,
      role: role.trim() || 'Community Member',
      userLevel,
      scenarioTitle: scenarioTitle.trim() || `${name}'s Situation`,
      summary: background.slice(0, 80) + '...',
      background: background.trim(),
      tone: tone.trim() || 'Conversational and seeking support',
      aiDifficulty: aiDifficulty.trim() || 'Respond authentically based on peer support quality.',
      goals: ['Demonstrate active listening and validation', 'Refrain from unsolicited advice'],
      traineeChecklist: ['Reflect core emotion', 'Avoid premature fixing'],
      openingMessage: openingMessage.trim() || `Hi... thank you for being here to talk.`,
      avatarBg: 'bg-teal-100 text-teal-800',
      isCustom: true,
    };

    onAddCustomPersona(newPersona);
    onSelectPersona(newPersona);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.name || !parsed.background) {
          throw new Error('Invalid JSON: Must include "name" and "background" fields.');
        }

        const uploadedPersona: Persona = {
          id: parsed.id || `uploaded-${Date.now()}`,
          name: parsed.name,
          age: parsed.age || 30,
          role: parsed.role || 'Peer Client',
          userLevel: parsed.userLevel || 'novice',
          scenarioTitle: parsed.scenarioTitle || parsed.name,
          summary: parsed.summary || parsed.background.slice(0, 80),
          background: parsed.background,
          tone: parsed.tone || 'Conversational',
          aiDifficulty: parsed.aiDifficulty || 'Standard peer support scenario',
          goals: parsed.goals || ['Practice empathy', 'Active listening'],
          traineeChecklist: parsed.traineeChecklist || ['Reflect emotion'],
          openingMessage: parsed.openingMessage || `Hi... thanks for talking with me.`,
          avatarBg: parsed.avatarBg || 'bg-indigo-100 text-indigo-800',
          isCustom: true,
        };

        onAddCustomPersona(uploadedPersona);
        onSelectPersona(uploadedPersona);
        onClose();
      } catch (err: any) {
        setJsonError(err.message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCurrent = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPersona, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPersona.id}-persona.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Choose or Upload Persona</h2>
            <p className="text-xs text-stone-500">
              Select an existing training scenario or build a custom personality
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-stone-200 flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Scenario Library ({personas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Create / AI Generate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Upload / Export JSON
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500">Filter Level:</span>
                {(['all', 'novice', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                      filterLevel === lvl
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Persona Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPersonas.map((p) => {
                  const isSelected = p.id === currentPersona.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPersona(p);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 ring-2 ring-teal-100 bg-teal-50/30'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.avatarBg}`}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-stone-900">{p.name}</h3>
                            <p className="text-[11px] text-stone-500">{p.role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {p.userLevel}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-stone-800 mb-1">{p.scenarioTitle}</p>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{p.summary}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE / AI GENERATE */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* AI Quick Generator Box */}
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>Generate Persona with AI</span>
                </div>
                <p className="text-xs text-teal-800">
                  Describe any background, demographic, or emotional challenge, and Gemini will build a complete realistic peer support scenario.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A firefighter struggling with insomnia and survivor guilt..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Drafting...' : 'Generate'}</span>
                  </button>
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              {/* Manual Form */}
              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dana Miller"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      placeholder="e.g. 28"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Trainee Difficulty</label>
                    <select
                      value={userLevel}
                      onChange={(e) => setUserLevel(e.target.value as UserLevel)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs bg-white"
                    >
                      <option value="novice">Level 1: Novice (Cooperative)</option>
                      <option value="intermediate">Level 2: Intermediate (Resistance/Grief)</option>
                      <option value="advanced">Level 3: Advanced (High Distress/Boundary)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Role / Vocation</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. First-Year Paramedic"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Scenario Title</label>
                    <input
                      type="text"
                      value={scenarioTitle}
                      onChange={(e) => setScenarioTitle(e.target.value)}
                      placeholder="e.g. Shift Exhaustion & Disillusionment"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Psychological Background & Crisis Context
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="Describe what triggered their distress, their internal conflict, and how they feel..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Speech Tone & Demeanor</label>
                    <input
                      type="text"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      placeholder="e.g. Flat voice, hesitant, avoids eye contact..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">AI Reaction Guidelines</label>
                    <input
                      type="text"
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      placeholder="e.g. Withdraw if given advice; open up if validated..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Opening Client Message</label>
                  <input
                    type="text"
                    value={openingMessage}
                    onChange={(e) => setOpeningMessage(e.target.value)}
                    placeholder="e.g. Hi... I don't really know if I belong here, but..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white shadow-xs"
                  >
                    Save & Start Roleplay
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: UPLOAD / EXPORT JSON */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Upload Card */}
              <div className="p-6 border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-3 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-stone-900">Upload Persona JSON File</p>
                  <p className="text-[11px] text-stone-500">
                    Import training scenarios created by other teams or supervisors
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer shadow-2xs">
                  <span>Browse JSON File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Export Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Export Current Persona ({currentPersona.name})
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Download this scenario as a JSON file to share with trainees
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCurrent}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
