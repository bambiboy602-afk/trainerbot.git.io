import { VoiceSettings } from '../types';

// Declare SpeechRecognition interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognitionInstance: any = null;

  // Text-to-Speech
  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isTtsSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  public speak(
    text: string,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.isTtsSupported()) return;

    this.stopSpeaking();

    // Clean markdown symbols or asterisks before reading
    const cleanText = text
      .replace(/\*+/g, '')
      .replace(/\[Turn \d+\]/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`{1,3}/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.rate || 1.0;
    utterance.pitch = settings.pitch || 1.0;

    const voices = this.getVoices();
    if (settings.selectedVoiceURI) {
      const matchedVoice = voices.find((v) => v.voiceURI === settings.selectedVoiceURI);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    } else {
      // Default to a good English voice if possible
      const preferred = voices.find(
        (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex')))
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or cancelled:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (!this.isTtsSupported()) return;
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    if (!this.isTtsSupported()) return false;
    return window.speechSynthesis.speaking;
  }

  // Speech-to-Text (STT)
  public isSttSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (Boolean(window.SpeechRecognition) || Boolean(window.webkitSpeechRecognition))
    );
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isSttSupported()) {
      onError('Speech Recognition is not supported by this browser. Please type your message.');
      return false;
    }

    this.stopListening();

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptPiece = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const combined = finalTranscript || interimTranscript;
        onResult(combined, Boolean(finalTranscript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onError('Microphone permission was denied. Please allow microphone access in browser settings.');
        } else if (event.error !== 'no-speech') {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        this.recognitionInstance = null;
        onEnd();
      };

      this.recognitionInstance = recognition;
      recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      onError(err?.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      this.recognitionInstance = null;
    }
  }
}

export const speechController = new SpeechController();
