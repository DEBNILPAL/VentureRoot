"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, RefreshCw, Check, AlertCircle, Globe, Volume2 } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type VoiceState = "IDLE" | "RECORDING" | "STOPPED" | "PROCESSING" | "ERROR" | "PERMISSION_DENIED";

export const REGIONAL_LANGUAGES = [
  { code: "en-IN", name: "English (India)", native: "English" },
  { code: "hi-IN", name: "Hindi", native: "हिन्दी" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা" },
  { code: "mr-IN", name: "Marathi", native: "मराठी" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur-IN", name: "Urdu", native: "اردو" },
];

interface VoiceRecorderProps {
  onTranscriptConfirm: (transcript: string, language?: string) => void;
  onCancel: () => void;
  defaultLanguage?: string;
}

export const VoiceRecorder = ({ onTranscriptConfirm, onCancel, defaultLanguage = "hi-IN" }: VoiceRecorderProps) => {
  const { t } = useTranslation();

  const [currentState, setCurrentState] = useState<VoiceState>("IDLE");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = () => {
    setErrorMsg("");
    setTranscript("");
    setInterimText("");
    setTimer(0);

    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMsg("Web Speech API is not supported on this browser. Please type your query or use Chrome/Edge.");
      setCurrentState("ERROR");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setCurrentState("RECORDING");
        timerRef.current = setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = "";
        let interimTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTrans += result[0].transcript + " ";
          } else {
            interimTrans += result[0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev} ${finalTrans}`.trim() : finalTrans.trim()));
        }
        setInterimText(interimTrans);
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceRecorder] speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setCurrentState("PERMISSION_DENIED");
          setErrorMsg("Microphone permission was denied. Please allow microphone access in browser settings.");
        } else if (event.error === "no-speech") {
          // Keep recording or handle gracefully
        } else {
          setErrorMsg(`Voice input notice: ${event.error}. You can still edit or type your message.`);
        }
      };

      recognition.onend = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        // If stopped intentionally, don't restart
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("[VoiceRecorder] Start error:", err);
      setCurrentState("ERROR");
      setErrorMsg(err.message || "Failed to initialize microphone.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    // Append any leftover interim text into final transcript
    if (interimText) {
      setTranscript((prev) => (prev ? `${prev} ${interimText}`.trim() : interimText.trim()));
      setInterimText("");
    }
    setCurrentState("STOPPED");
  };

  const confirmTranscript = () => {
    setCurrentState("PROCESSING");
    const fullText = (transcript + (interimText ? " " + interimText : "")).trim();
    setTimeout(() => {
      onTranscriptConfirm(fullText, selectedLanguage);
    }, 300);
  };

  const retryRecording = () => {
    setTranscript("");
    setInterimText("");
    setCurrentState("IDLE");
  };

  return (
    <div className="w-full bg-white border border-[#1E6702]/30 rounded-2xl p-3 sm:p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 min-w-0 overflow-hidden">
      {/* Top Bar: Language Picker & Status */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
          <Globe className="w-3.5 h-3.5 text-[#1E6702]" />
          <span>Spoken Language:</span>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={currentState === "RECORDING"}
          className="text-xs font-semibold text-secondary bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E6702] cursor-pointer"
        >
          {REGIONAL_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.name})
            </option>
          ))}
        </select>
      </div>

      {currentState === "IDLE" && (
        <div className="flex flex-col items-center justify-center py-5 gap-3">
          <button
            type="button"
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-[#1E6702]/10 text-[#1E6702] flex items-center justify-center hover:bg-[#1E6702]/20 hover:scale-105 active:scale-95 transition-all focus:ring-4 focus:ring-[#1E6702]/20 outline-none shadow-sm cursor-pointer"
            title="Click to start speaking"
          >
            <Mic className="w-8 h-8" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-secondary">Tap microphone to speak</p>
            <p className="text-xs text-secondary-muted mt-0.5">
              Speak in {REGIONAL_LANGUAGES.find((l) => l.code === selectedLanguage)?.native || "your language"}
            </p>
          </div>
        </div>
      )}

      {currentState === "RECORDING" && (
        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <div className="relative">
            <div className="absolute -inset-3 bg-red-100 rounded-full animate-ping opacity-75" />
            <button
              type="button"
              onClick={stopRecording}
              className="relative w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 hover:scale-105 transition-all focus:ring-4 focus:ring-red-200 outline-none shadow-md cursor-pointer"
              title="Click to stop recording"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping" /> Listening ({formatTime(timer)})
            </span>
            <div className="max-w-md text-center px-2">
              <p className="text-sm font-medium text-secondary italic break-words line-clamp-3">
                {interimText || transcript || "Listening... speak now into your microphone"}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentState === "STOPPED" && (
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-secondary flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#1E6702]" /> Review / Edit Spoken Input
            </h4>
            <span className="text-[11px] font-mono text-secondary-muted bg-slate-100 px-2 py-0.5 rounded-md">
              Recorded: {formatTime(timer)}
            </span>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-24 p-3 text-xs sm:text-sm text-secondary bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/20 resize-none break-words leading-relaxed"
            placeholder="Your spoken words will appear here. You can also edit or type directly..."
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={retryRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-record
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={confirmTranscript}
              disabled={!transcript.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1E6702] rounded-xl hover:bg-[#155201] disabled:opacity-40 transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Ask Advisor
            </button>
          </div>
        </div>
      )}

      {currentState === "PROCESSING" && (
        <div className="flex flex-col items-center justify-center py-6 gap-2.5">
          <div className="w-6 h-6 border-2 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-secondary-muted">Processing your voice query...</span>
        </div>
      )}

      {currentState === "ERROR" && (
        <div className="flex flex-col items-center justify-center py-5 gap-2.5 text-center">
          <AlertCircle className="w-7 h-7 text-red-600" />
          <p className="text-xs font-semibold text-red-600 max-w-sm">{errorMsg || "Voice recognition encountered an error."}</p>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={retryRecording}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {currentState === "PERMISSION_DENIED" && (
        <div className="flex flex-col items-center justify-center py-5 gap-2.5 text-center">
          <AlertCircle className="w-7 h-7 text-orange-600" />
          <p className="text-xs font-semibold text-orange-700 max-w-sm">
            Microphone access is blocked. Please enable microphone permissions in your browser bar.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-bold bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
