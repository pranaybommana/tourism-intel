/**
 * speechUtils.js
 * Browser-native Web Speech API utilities for SpeechRecognition and SpeechSynthesis.
 * Supports Telugu (te-IN) and English (en-IN) with zero external API dependencies.
 */

export const SUPPORTED_VOICE_LANGUAGES = [
  { id: 'en-IN', code: 'en-IN', label: 'English (India)', shortLabel: 'English', flag: '🇬🇧' },
  { id: 'te-IN', code: 'te-IN', label: 'తెలుగు (India)', shortLabel: 'తెలుగు', flag: '🇮🇳' },
];

export const VOICE_LANGUAGE_STORAGE_KEY = 'tourism_intel_voice_language';
export const VOICE_AUTO_SPEAK_STORAGE_KEY = 'tourism_intel_voice_autospeak';

/** Check if SpeechRecognition is supported in this browser */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Check if SpeechSynthesis is supported in this browser */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

/**
 * Get the stored voice language or default to 'en-IN'
 */
export function getSavedVoiceLanguage() {
  try {
    const saved = localStorage.getItem(VOICE_LANGUAGE_STORAGE_KEY);
    if (saved && (saved === 'te-IN' || saved === 'en-IN')) {
      return saved;
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return 'en-IN';
}

/**
 * Save voice language preference
 */
export function saveVoiceLanguage(lang) {
  try {
    localStorage.setItem(VOICE_LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Get stored auto-speak preference
 */
export function getSavedAutoSpeak() {
  try {
    const saved = localStorage.getItem(VOICE_AUTO_SPEAK_STORAGE_KEY);
    return saved === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Save auto-speak preference
 */
export function saveAutoSpeak(enabled) {
  try {
    localStorage.setItem(VOICE_AUTO_SPEAK_STORAGE_KEY, String(enabled));
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Speech Recognition Session Manager
 */
export class SpeechRecognitionSession {
  constructor({ onResult, onError, onStateChange, lang = 'en-IN' }) {
    this.onResult = onResult || (() => {});
    this.onError = onError || (() => {});
    this.onStateChange = onStateChange || (() => {});
    this.lang = lang;
    this.recognition = null;
    this.state = 'idle'; // 'idle' | 'listening' | 'processing' | 'error' | 'unsupported' | 'permission-denied'
  }

  setState(newState) {
    this.state = newState;
    this.onStateChange(newState);
  }

  start() {
    if (!isSpeechRecognitionSupported()) {
      this.setState('unsupported');
      this.onError({
        code: 'unsupported',
        message: 'Voice input is not supported in this browser. You can type your question instead.',
      });
      return false;
    }

    // Stop any existing session
    this.stop();

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = this.lang;
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.setState('listening');
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const recognizedText = finalTranscript || interimTranscript;
        if (recognizedText) {
          this.onResult({
            text: recognizedText.trim(),
            isFinal: !!finalTranscript,
          });
        }
      };

      this.recognition.onerror = (event) => {
        const errorType = event.error;
        if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          this.setState('permission-denied');
          this.onError({
            code: 'permission-denied',
            message: 'Microphone permission denied. Please allow microphone access in your browser settings to use voice input.',
          });
        } else if (errorType === 'no-speech') {
          this.setState('idle');
          this.onError({
            code: 'no-speech',
            message: 'No speech was detected. Please try clicking the microphone and speaking again.',
          });
        } else if (errorType !== 'aborted') {
          this.setState('error');
          this.onError({
            code: errorType,
            message: `Voice recognition encountered an issue (${errorType}). You can continue typing your question.`,
          });
        } else {
          this.setState('idle');
        }
      };

      this.recognition.onend = () => {
        if (this.state === 'listening') {
          this.setState('idle');
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
      this.setState('error');
      this.onError({
        code: 'start-failed',
        message: 'Could not activate microphone. Please verify browser permissions or type your question.',
      });
      return false;
    }
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
      this.recognition = null;
    }
    this.setState('idle');
  }

  setLanguage(newLang) {
    this.lang = newLang;
    if (this.state === 'listening') {
      this.stop();
    }
  }

  destroy() {
    this.stop();
  }
}

/**
 * Speech Synthesis Controller
 */
class SpeechSynthesisController {
  constructor() {
    this.voices = [];
    this.isSpeaking = false;
    this.activeUtterance = null;
    this.initVoices();
  }

  initVoices() {
    if (!isSpeechSynthesisSupported()) return;

    const load = () => {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        this.voices = [];
      }
    };

    load();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  getVoices() {
    if (this.voices.length === 0 && isSpeechSynthesisSupported()) {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        this.voices = [];
      }
    }
    return this.voices;
  }

  findBestVoice(langCode) {
    const allVoices = this.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    const target = (langCode || 'en-IN').toLowerCase();

    // 1. Exact match (e.g. 'te-IN' or 'en-IN')
    let matched = allVoices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-') === target);
    if (matched) return matched;

    // 2. Language prefix match (e.g. 'te' or 'en')
    const prefix = target.split('-')[0];
    matched = allVoices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
    if (matched) return matched;

    // 3. Indian English / Indian voice fallback
    matched = allVoices.find((v) => v.lang && v.lang.toLowerCase().includes('in'));
    if (matched) return matched;

    // 4. Default voice or first available
    return allVoices.find((v) => v.default) || allVoices[0] || null;
  }

  speak(text, { lang = 'en-IN', onStart, onEnd, onError } = {}) {
    if (!isSpeechSynthesisSupported() || !text) return false;

    // Always cancel ongoing speech first to prevent overlapping or stale audio
    this.cancel();

    try {
      // Strip markdown asterisks and bullet symbols for natural reading
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/[•-]\s+/g, ', ')
        .replace(/\n+/g, '. ')
        .slice(0, 500); // sensible length ceiling

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;

      const voice = this.findBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.activeUtterance = utterance;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.activeUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.activeUtterance = null;
        if (onError) onError(e);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      this.isSpeaking = false;
      this.activeUtterance = null;
      if (onError) onError(err);
      return false;
    }
  }

  cancel() {
    if (!isSpeechSynthesisSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
    this.isSpeaking = false;
    this.activeUtterance = null;
  }
}

export const speechSynthesizer = new SpeechSynthesisController();
