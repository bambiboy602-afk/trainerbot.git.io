import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Sparkles,
  Radio,
  Theater,
  User,
  AlertCircle,
  Settings2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Scenario, ChatMessage } from '../types';
import {
  floatTo16BitPCM,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  pcmToAudioBuffer
} from '../lib/audioUtils';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: Scenario | null;
  onSaveSpokenMessages?: (newMessages: ChatMessage[]) => void;
  mentorMode?: boolean;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  onSaveSpokenMessages,
  mentorMode = false,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'error' | 'disconnected'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceName, setVoiceName] = useState('Zephyr');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [transcriptTurns, setTranscriptTurns] = useState<
    { id: string; role: 'user' | 'model'; text: string; timestamp: number }[]
  >([]);

  // Audio Contexts & WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  isMutedRef.current = isMuted;

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptTurns]);

  // Connect when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    const startSession = async () => {
      try {
        setConnectionStatus('connecting');
        setErrorMessage(null);

        // 1. Request microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // 2. Setup AudioContexts (16kHz in, 24kHz out per Gemini Live specification)
        const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });

        if (inCtx.state === 'suspended') {
          await inCtx.resume();
        }
        if (outCtx.state === 'suspended') {
          await outCtx.resume();
        }

        inputAudioCtxRef.current = inCtx;
        outputAudioCtxRef.current = outCtx;
        nextStartTimeRef.current = outCtx.currentTime;

        // 3. Connect to server WebSocket (/api/live)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) {
            try { ws.close(1000, 'Cancelled'); } catch (_) {}
            return;
          }
          setConnectionStatus('connected');

          // Send initialization payload if socket is fully open
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'init',
                scenario: activeScenario,
                voiceName,
                mentorMode,
              })
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'error') {
              setErrorMessage(data.error || 'Live API encountered an error');
              setConnectionStatus('error');
            } else if (data.type === 'handshake_ok' || data.type === 'ready') {
              setConnectionStatus('connected');
            } else if (data.type === 'interrupted') {
              // Interruption: Stop model speech immediately
              setIsModelSpeaking(false);
              activeSourcesRef.current.forEach((src) => {
                try {
                  src.stop();
                } catch (_) {}
              });
              activeSourcesRef.current = [];
              if (outputAudioCtxRef.current) {
                nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
              }
            } else if (data.type === 'audio' && data.audio) {
              // Received 24kHz raw PCM from gemini-3.8-live
              if (!outputAudioCtxRef.current) return;
              const ctx = outputAudioCtxRef.current;
              setIsModelSpeaking(true);

              const arrayBuf = base64ToArrayBuffer(data.audio);
              const audioBuf = pcmToAudioBuffer(ctx, arrayBuf, 24000);

              const source = ctx.createBufferSource();
              source.buffer = audioBuf;
              source.connect(ctx.destination);

              // Schedule gapless playback
              const now = ctx.currentTime;
              const scheduledStart = Math.max(now, nextStartTimeRef.current);
              source.start(scheduledStart);
              nextStartTimeRef.current = scheduledStart + audioBuf.duration;

              activeSourcesRef.current.push(source);

              source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
                if (activeSourcesRef.current.length === 0) {
                  setIsModelSpeaking(false);
                }
              };
            } else if (data.type === 'transcript' && data.text) {
              setTranscriptTurns((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === data.role) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: last.text + ' ' + data.text },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    role: data.role || 'model',
                    text: data.text,
                    timestamp: Date.now(),
                  },
                ];
              });
            }
          } catch (e) {
            console.error('Error handling WebSocket message:', e);
          }
        };

        ws.onerror = (err) => {
          if (isCancelled) return;
          console.warn('WebSocket error:', err);
          setConnectionStatus('error');
          setErrorMessage('Live voice stream disconnected. Click Reconnect below to retry.');
        };

        ws.onclose = (event) => {
          if (isCancelled) return;
          if (event.code !== 1000) {
            console.warn(`WebSocket closed (code: ${event.code})`);
          }
          setConnectionStatus('disconnected');
        };

        // 4. Capture microphone audio and stream PCM to WebSocket
        const micSource = inCtx.createMediaStreamSource(stream);
        // ScriptProcessor with 4096 buffer size
        const processor = inCtx.createScriptProcessor(4096, 1, 1);
        processorNodeRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

          const channelData = e.inputBuffer.getChannelData(0);

          // Detect user speech volume
          let sum = 0;
          for (let i = 0; i < channelData.length; i++) {
            sum += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sum / channelData.length);
          setIsUserSpeaking(rms > 0.02);

          const pcmBuffer = floatTo16BitPCM(channelData);
          const base64Audio = arrayBufferToBase64(pcmBuffer);

          try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'audio',
                  audio: base64Audio,
                })
              );
            }
          } catch (sendErr) {
            console.warn('Failed to stream audio chunk to WebSocket:', sendErr);
          }
        };

        micSource.connect(processor);
        processor.connect(inCtx.destination);
      } catch (err: any) {
        console.error('Error starting live voice session:', err);
        setConnectionStatus('error');
        setErrorMessage(
          err.name === 'NotAllowedError'
            ? 'Microphone permission denied. Please allow microphone access in your browser.'
            : err.message || 'Failed to initialize live voice.'
        );
      }
    };

    startSession();

    return () => {
      isCancelled = true;
      // Cleanup WebSocket safely to prevent "closed before opened" errors
      if (wsRef.current) {
        const socket = wsRef.current;
        wsRef.current = null;
        socket.onmessage = null;
        socket.onerror = () => {};
        socket.onclose = () => {};
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.close(1000, 'Modal closed');
          } catch (_) {}
        } else if (socket.readyState === WebSocket.CONNECTING) {
          // If still connecting, wait until opened to close gracefully
          socket.onopen = () => {
            try {
              socket.close(1000, 'Closed after connecting');
            } catch (_) {}
          };
        }
      }
      // Stop media tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      // Disconnect processor
      if (processorNodeRef.current) {
        processorNodeRef.current.disconnect();
        processorNodeRef.current = null;
      }
      // Close Audio Contexts
      if (inputAudioCtxRef.current) {
        inputAudioCtxRef.current.close().catch(() => {});
        inputAudioCtxRef.current = null;
      }
      if (outputAudioCtxRef.current) {
        outputAudioCtxRef.current.close().catch(() => {});
        outputAudioCtxRef.current = null;
      }
      activeSourcesRef.current = [];
    };
  }, [isOpen, activeScenario?.id, voiceName, mentorMode, retryCount]);

  // Handle closing modal
  const handleClose = () => {
    // Optionally export generated transcript into main chat view
    if (transcriptTurns.length > 0 && onSaveSpokenMessages) {
      const converted: ChatMessage[] = transcriptTurns.map((t) => ({
        id: `voice-msg-${t.id}`,
        role: t.role === 'model' ? 'assistant' : 'user',
        content: t.text,
        timestamp: t.timestamp,
        scenarioId: activeScenario?.id,
        scenarioTitle: activeScenario?.title,
        isVoiceTurn: true,
        modelUsed: 'gemini-3.8-live',
      }));
      onSaveSpokenMessages(converted);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Live Voice Conversation
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Low-latency, real-time bidirectional voice conversation with Live API
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Active Context Bar */}
        <div className="px-5 py-2.5 bg-stone-950/40 border-b border-stone-800/80 flex items-center justify-between text-xs text-stone-300 flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {activeScenario ? (
              <>
                <Theater className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white truncate">
                  Roleplaying: {activeScenario.title}
                </span>
                <span className="text-stone-500">•</span>
                <span className="text-amber-300/80 truncate">
                  Gemini is: {activeScenario.aiRole.split('—')[0].trim()}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">
                  Open Voice Discussion & Persona Learner
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-stone-400">
            <span className="text-[11px]">Voice:</span>
            <select
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Zephyr">Zephyr (Warm & Natural)</option>
              <option value="Puck">Puck (Crisp & Direct)</option>
              <option value="Charon">Charon (Calm & Deep)</option>
              <option value="Kore">Kore (Gentle & Empathetic)</option>
              <option value="Fenrir">Fenrir (Authoritative)</option>
            </select>
          </div>
        </div>

        {/* Main Stage & Visualizer */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 min-h-[220px]">
          {/* Animated Halo Visualizer */}
          <div className="relative flex items-center justify-center my-4">
            <div
              className={`absolute w-36 h-36 rounded-full transition-all duration-300 ${
                isModelSpeaking
                  ? 'bg-amber-500/30 scale-125 animate-ping'
                  : isUserSpeaking
                  ? 'bg-emerald-500/20 scale-115 animate-pulse'
                  : 'bg-stone-800/40 scale-100'
              }`}
            />
            <div
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-300 shadow-xl border ${
                isModelSpeaking
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-400/50 shadow-amber-500/20'
                  : isUserSpeaking
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-400/50 shadow-emerald-500/20'
                  : 'bg-stone-800 text-stone-300 border-stone-700'
              }`}
            >
              {isModelSpeaking ? (
                <>
                  <Volume2 className="w-8 h-8 animate-bounce text-amber-100" />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-amber-100">
                    Gemini Talking
                  </span>
                </>
              ) : isUserSpeaking ? (
                <>
                  <Mic className="w-8 h-8 animate-pulse text-emerald-100" />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-emerald-100">
                    Listening to You
                  </span>
                </>
              ) : (
                <>
                  <Radio className="w-8 h-8 text-stone-400" />
                  <span className="text-[10px] font-medium text-stone-400 mt-1">
                    {connectionStatus === 'connected' ? 'Ready • Speak' : 'Connecting'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status Text & Interruption guidance */}
          <div className="text-center mt-3">
            {connectionStatus === 'connected' && (
              <p className="text-xs text-stone-300">
                Natural turn-taking enabled. You can interrupt Gemini at any time by speaking.
              </p>
            )}
            {connectionStatus === 'connecting' && (
              <p className="text-xs text-amber-300/80 animate-pulse">
                Establishing bidirectional WebSocket stream with gemini-3.8-live...
              </p>
            )}
            {connectionStatus === 'error' && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-800/60">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || 'Voice connection failed'}</span>
                </div>
                <button
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconnect Voice Session</span>
                </button>
              </div>
            )}
            {connectionStatus === 'disconnected' && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <p className="text-xs text-stone-400">Voice session ended.</p>
                <button
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start New Voice Session</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto px-5 py-3 border-t border-stone-800/80 bg-stone-950/70 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 sticky top-0 bg-stone-950/90 pb-1 backdrop-blur-xs flex items-center justify-between">
            <span>Live Transcript Stream</span>
            <span>{transcriptTurns.length} turns</span>
          </div>

          {transcriptTurns.length === 0 ? (
            <p className="text-xs text-stone-500 italic text-center py-4">
              Spoken conversation turns will appear here as you and Gemini talk...
            </p>
          ) : (
            transcriptTurns.map((turn) => (
              <div
                key={turn.id}
                className={`flex gap-2.5 text-xs ${
                  turn.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {turn.role === 'model' && (
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-xs'
                      : 'bg-stone-800/90 border border-stone-700/80 text-stone-200 rounded-tl-xs'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-stone-400 mb-0.5">
                    {turn.role === 'user' ? 'You' : 'Gemini'}
                  </div>
                  {turn.text}
                </div>
                {turn.role === 'user' && (
                  <div className="w-5 h-5 rounded-md bg-stone-700 text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
                  : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? (
                <>
                  <MicOff className="w-4 h-4 text-red-400" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Mic On</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-900/30 transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Voice Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
