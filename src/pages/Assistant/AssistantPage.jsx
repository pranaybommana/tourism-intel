import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot, Send, Sparkles, Shield, Compass, Lightbulb,
  Navigation, ExternalLink, AlertCircle, RotateCcw,
  DollarSign, Camera, Trash2, Mic, MicOff, Volume2,
  VolumeX, Square, RefreshCw, Radio,
} from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import GlassCard from "../../components/ui/GlassCard";
import GlassButton from "../../components/ui/GlassButton";
import { processChat } from "../../services/ai/chatbotService";
import { useDestinations } from "../../context/DestinationContext";
import { useAppState } from "../../hooks/useAppState";
import { APP_STATES } from "../../constants/appStates";
import {
  SUPPORTED_VOICE_LANGUAGES,
  getSavedVoiceLanguage,
  saveVoiceLanguage,
  getSavedAutoSpeak,
  saveAutoSpeak,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  SpeechRecognitionSession,
  speechSynthesizer,
} from "../../utils/speechUtils";

const ENGLISH_PROMPTS = [
  "Find a less crowded place",
  "Which places should I visit in Hyderabad?",
  "Show me the safest destinations",
  "What can I visit in Goa?",
  "Emergency safety hotlines",
  "Is this auto fare fair?",
  "Find heritage places to visit",
];

const TELUGU_PROMPTS = [
  "విశాఖపట్నంలో తక్కువ రద్దీ ఉన్న ప్రదేశం ఏది?",
  "బోర్రా గుహలకు ఎలా వెళ్లాలి?",
  "ఈ ఆటో ధర ఎక్కువగా ఉందా?",
  "ఇక్కడ సేఫ్గా ఎలా వెళ్లాలి?",
  "హైదరాబాద్‌లో చూడదగిన ప్రదేశాలు",
  "అత్యవసర హెల్ప్‌లైన్ నంబర్లు ఏమిటి?",
];

function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
      {lines.map((line, i) => {
        // Bullet points
        if (line.startsWith("• ") || line.startsWith("- ")) {
          const rest = line.slice(2);
          const parts = rest.split(/(\*\*[^*]+\*\*)/g);
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>
                {parts.map((p, j) =>
                  p.startsWith("**") && p.endsWith("**") ? (
                    <strong key={j} className="text-white">
                      {p.slice(2, -2)}
                    </strong>
                  ) : (
                    p
                  )
                )}
              </span>
            </div>
          );
        }
        const parts = line.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
        const formatted = parts.map((p, j) => {
          if (p.startsWith("**") && p.endsWith("**")) {
            return (
              <strong key={j} className="text-white font-semibold">
                {p.slice(2, -2)}
              </strong>
            );
          }
          if (p.startsWith("_") && p.endsWith("_")) {
            return (
              <em key={j} className="text-slate-400">
                {p.slice(1, -1)}
              </em>
            );
          }
          return <span key={j}>{p}</span>;
        });
        return <p key={i}>{formatted}</p>;
      })}
    </div>
  );
}

export function AssistantPage() {
  const navigate = useNavigate();
  const { selectedDestination, savedPlaceIds } = useDestinations();
  const { appState } = useAppState();

  // Voice language & auto-speak state
  const [voiceLanguage, setVoiceLanguage] = useState(getSavedVoiceLanguage);
  const [autoSpeak, setAutoSpeak] = useState(getSavedAutoSpeak);

  // Recognition state
  const [recognitionState, setRecognitionState] = useState("idle"); // 'idle' | 'listening' | 'processing' | 'error' | 'unsupported' | 'permission-denied'
  const [speechErrorNotice, setSpeechErrorNotice] = useState(null);
  const speechSessionRef = useRef(null);

  // Active speech synthesis speaking message id
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      title: "TravelGuard AI — Tourism Intelligence",
      text: "Hello! I am **TravelGuard AI**, your rule-based Tourism Intelligence Assistant.\n\nI support both **English** and **తెలుగు (Telugu)** voice input and audio response.\n\nI can help with:\n• Safety ratings & emergency protocols (Dial 112 / 1363)\n• Low crowd & quiet destination recommendations\n• Transport fare estimates (FairPrice AI)\n• Tourist attractions & navigation\n\n_All responses use prototype demo intelligence — not live external data._",
      sourceLabel: "Zero API Cost — Voice Ready",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Clean up on unmount or navigation
  useEffect(() => {
    return () => {
      if (speechSessionRef.current) {
        speechSessionRef.current.destroy();
      }
      speechSynthesizer.cancel();
    };
  }, []);

  // Handle voice language change
  const handleLanguageChange = (newLang) => {
    setVoiceLanguage(newLang);
    saveVoiceLanguage(newLang);
    speechSynthesizer.cancel();
    setSpeakingMsgId(null);
    if (speechSessionRef.current) {
      speechSessionRef.current.setLanguage(newLang);
    }
  };

  // Handle auto-speak toggle
  const handleToggleAutoSpeak = () => {
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    saveAutoSpeak(nextVal);
    if (!nextVal) {
      speechSynthesizer.cancel();
      setSpeakingMsgId(null);
    }
  };

  // Start voice recognition
  const handleStartVoiceInput = () => {
    setSpeechErrorNotice(null);

    if (!isSpeechRecognitionSupported()) {
      setRecognitionState("unsupported");
      setSpeechErrorNotice("Voice input is not supported in this browser. You can type your question instead.");
      return;
    }

    if (recognitionState === "listening") {
      // Toggle off
      speechSessionRef.current?.stop();
      return;
    }

    // Cancel any current speaking
    speechSynthesizer.cancel();
    setSpeakingMsgId(null);

    const session = new SpeechRecognitionSession({
      lang: voiceLanguage,
      onStateChange: (st) => setRecognitionState(st),
      onResult: ({ text, isFinal }) => {
        // Place recognized text into the input box for user editing before send
        setInput(text);
        if (isFinal) {
          setRecognitionState("idle");
        }
      },
      onError: (err) => {
        if (err.code === "permission-denied") {
          setSpeechErrorNotice("Microphone permission denied. Please allow microphone access in your browser to speak.");
        } else if (err.code === "unsupported") {
          setSpeechErrorNotice("Voice input is not supported in this browser. You can type your question instead.");
        } else if (err.code !== "no-speech") {
          setSpeechErrorNotice(err.message);
        }
      },
    });

    speechSessionRef.current = session;
    session.start();
  };

  const handleStopVoiceInput = () => {
    if (speechSessionRef.current) {
      speechSessionRef.current.stop();
    }
    setRecognitionState("idle");
  };

  // Speak specific message
  const handleSpeakMessage = (msg) => {
    if (speakingMsgId === msg.id) {
      speechSynthesizer.cancel();
      setSpeakingMsgId(null);
      return;
    }

    speechSynthesizer.cancel();
    setSpeakingMsgId(msg.id);

    speechSynthesizer.speak(msg.text, {
      lang: voiceLanguage,
      onStart: () => setSpeakingMsgId(msg.id),
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  const handleSend = async (queryText = input) => {
    const textToSend = queryText.trim();
    if (!textToSend || loading) return;

    // Stop listening if user hits send while listening
    handleStopVoiceInput();

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await processChat(textToSend, {
        selectedDestination,
        savedPlaceIds,
        isOffline: appState === APP_STATES.OFFLINE_SAFETY,
        appState,
        language: voiceLanguage,
      });

      const newMsgId = Date.now() + 1;
      const assistantMsg = {
        id: newMsgId,
        sender: "assistant",
        title: response.title,
        text: response.text,
        places: response.places,
        destinations: response.destinations,
        actions: response.actions,
        sourceLabel: response.sourceLabel,
        confidence: response.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If auto-speak is ON, speak the response
      if (autoSpeak) {
        setSpeakingMsgId(newMsgId);
        speechSynthesizer.speak(assistantMsg.text, {
          lang: voiceLanguage,
          onStart: () => setSpeakingMsgId(newMsgId),
          onEnd: () => setSpeakingMsgId(null),
          onError: () => setSpeakingMsgId(null),
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "assistant",
          title: "TravelGuard AI",
          text: "Unable to generate a recommendation right now. Please try again.",
          sourceLabel: "Error — Fallback Response",
          isError: true,
          failedQuery: textToSend,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    speechSynthesizer.cancel();
    setSpeakingMsgId(null);
    if (action.href) window.open(action.href, "_blank", "noopener");
    else if (action.navigatePlace) navigate("/navigate", { state: { targetPlace: action.navigatePlace } });
    else if (action.link) navigate(action.link);
  };

  const handleReset = () => {
    speechSynthesizer.cancel();
    handleStopVoiceInput();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: 1,
        sender: "assistant",
        title: "TravelGuard AI — Tourism Intelligence",
        text: "Hello! I am **TravelGuard AI**, your rule-based Tourism Intelligence Assistant.\n\nI support both **English** and **తెలుగు (Telugu)** voice input and audio response.\n\nI can help with:\n• Safety ratings & emergency protocols (Dial 112 / 1363)\n• Low crowd & quiet destination recommendations\n• Transport fare estimates (FairPrice AI)\n• Tourist attractions & navigation\n\n_All responses use prototype demo intelligence — not live external data._",
        sourceLabel: "Zero API Cost — Voice Ready",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const isTeluguSelected = voiceLanguage === "te-IN";
  const samplePrompts = isTeluguSelected ? TELUGU_PROMPTS : ENGLISH_PROMPTS;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      <SectionHeader
        title="TravelGuard AI — Tourism Intelligence"
        subtitle="Rule-based assistant with Telugu & English voice support — zero API cost, fully offline capable"
        action={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Demo Intelligence
            </span>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Control Bar: Language Selector & Voice Toggle */}
      <GlassCard className="p-3.5 border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 bg-ocean-950/90">
        {/* Language Selection: Telugu vs English */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Language:</span>
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
            {SUPPORTED_VOICE_LANGUAGES.map((lang) => {
              const isSelected = voiceLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                    isSelected
                      ? "bg-cyan-500 text-ocean-950 shadow-cyan-glow"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Voice Toggle: Auto-Speak ON / OFF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 select-none ${
              autoSpeak
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-slate-900/60 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>AI Voice: {autoSpeak ? "ON" : "OFF"}</span>
          </button>
        </div>
      </GlassCard>

      {/* Speech error notice banner if microphone fails or unsupported */}
      {speechErrorNotice && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{speechErrorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechErrorNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-2 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Offline banner */}
      {appState === APP_STATES.OFFLINE_SAFETY && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Offline Demo Intelligence — using locally saved destination data
        </div>
      )}

      {/* Chat Window */}
      <GlassCard className="flex flex-col h-[56vh] min-h-[400px] p-3 border-cyan-500/25">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-1">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-ocean-950 shrink-0 mt-1 mr-2 shadow-cyan-glow">
                  <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 ${
                  msg.sender === "user"
                    ? "bg-cyan-500 text-ocean-950 font-medium ml-4 text-xs"
                    : msg.isError
                    ? "bg-rose-950/40 border border-rose-500/40 text-slate-200 mr-2 backdrop-blur-md"
                    : "bg-slate-900/80 border border-cyan-500/30 text-slate-200 mr-2 backdrop-blur-md"
                }`}
              >
                {msg.sender === "assistant" && (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-300">{msg.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Speaker button to listen to response */}
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(msg)}
                          title={speakingMsgId === msg.id ? "Stop voice output" : "Speak response in selected language"}
                          className={`p-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                            speakingMsgId === msg.id
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                              : "bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-slate-700"
                          }`}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-cyan-400" />
                              <span>Speak</span>
                            </>
                          )}
                        </button>

                        {msg.confidence !== undefined && (
                          <span
                            className={`text-[10px] font-bold ${
                              msg.confidence >= 0.9 ? "text-emerald-400" : "text-cyan-400"
                            }`}
                          >
                            {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <MarkdownText text={msg.text} />

                    {/* Retry button on error */}
                    {msg.isError && msg.failedQuery && (
                      <div className="mt-2.5 pt-2 border-t border-rose-500/30">
                        <button
                          type="button"
                          onClick={() => handleSend(msg.failedQuery)}
                          className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
                        </button>
                      </div>
                    )}

                    {/* Inline place chips */}
                    {msg.places && msg.places.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.places.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => navigate("/navigate", { state: { targetPlace: p } })}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 flex items-center gap-1 transition-all"
                          >
                            <Navigation className="w-3 h-3 text-cyan-400" />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                              i === 0
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                            }`}
                          >
                            {act.navigatePlace ? <Navigation className="w-3 h-3 text-cyan-400" /> : <ExternalLink className="w-3 h-3" />}
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.sourceLabel && (
                      <span className="text-[9px] text-slate-500 block mt-2">{msg.sourceLabel}</span>
                    )}
                  </>
                )}

                {msg.sender === "user" && <p className="text-xs">{msg.text}</p>}

                <span className="text-[9px] opacity-50 block mt-1.5 text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-ocean-950 shrink-0 mt-1 mr-2">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-3.5 text-xs text-cyan-300 flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                {isTeluguSelected ? "సమాచారాన్ని విశ్లేషిస్తోంది..." : "Synthesizing demo intelligence..."}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto border-t border-slate-800/80 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-0.5" />
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-200 border border-slate-700 hover:border-cyan-400 text-[11px] whitespace-nowrap transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Voice Input Active State Banner */}
        {recognitionState === "listening" && (
          <div className="mb-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold">
                {isTeluguSelected ? '🎤 వింటున్నాము... "మీరు మాట్లాడండి..."' : '🎤 Listening... "Speak now..."'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopVoiceInput}
              className="px-2 py-0.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-[11px] font-bold border border-rose-500/50 text-rose-100"
            >
              Stop Listening
            </button>
          </div>
        )}

        {/* Main Input Form with Microphone & Send */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2 flex items-center gap-2 shrink-0"
        >
          {/* Microphone button inside input area */}
          <button
            type="button"
            onClick={handleStartVoiceInput}
            title={recognitionState === "listening" ? "Stop voice input" : "Speak your question (Telugu or English)"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all select-none ${
              recognitionState === "listening"
                ? "bg-rose-500 text-white border-rose-400 shadow-rose-glow animate-pulse"
                : "bg-slate-900/80 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:border-cyan-400"
            }`}
          >
            {recognitionState === "listening" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isTeluguSelected
                ? "తెలుగు లేదా ఇంగ్లీషులో ప్రశ్నను అడగండి (లేదా మాట్లాడండి)..."
                : "Ask about travel destinations, safety, or attractions..."
            }
            className="flex-1 px-4 py-2.5 bg-slate-900/80 border border-cyan-500/30 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />

          <GlassButton
            type="submit"
            variant="primary"
            size="md"
            icon={Send}
            disabled={!input.trim() || loading}
          >
            Send
          </GlassButton>
        </form>
      </GlassCard>

      {/* Quick links to other AI features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: DollarSign, label: "FairPrice AI", desc: "Check if your auto/cab fare is fair", link: "/ai/fairprice" },
          { icon: Camera, label: "Landmark Scanner", desc: "Identify landmarks using AI simulation", link: "/ai/landmark" },
          { icon: Trash2, label: "Waste Detection", desc: "Report waste using AI classification", link: "/ai/waste" },
        ].map((item) => (
          <button
            key={item.link}
            onClick={() => navigate(item.link)}
            className="p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
                <item.icon className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-bold text-white">{item.label}</span>
            </div>
            <p className="text-[11px] text-slate-400">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AssistantPage;
