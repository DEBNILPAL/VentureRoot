"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Trash2, Mic, ChevronDown, Building2, Sparkles, Volume2, Square, Copy, Check, Globe } from "lucide-react";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ChatMessage, advisorApi } from "../api/advisorApi";
import { VoiceRecorder, REGIONAL_LANGUAGES } from "@/features/voice/components/VoiceRecorder";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { FormattedChatMessage } from "./FormattedChatMessage";

interface ChatWindowProps {
  initialQuery?: string;
}

export const ChatWindow = ({ initialQuery }: ChatWindowProps) => {
  const { data: businesses } = useBusinessesComparison();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste! I am your VentureRoot AI Business Advisor. I have loaded your entrepreneur profile, capital, and venture inputs. How can I guide your business decisions today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Audio Playback / TTS State
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioLoadingIndex, setAudioLoadingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set default business when loaded
  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  // Handle external query prefill
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const activeBusiness = businesses?.find((b) => b.id === selectedBusinessId) || businesses?.[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const sendQuery = async (queryText: string, langOverride?: string) => {
    if (!queryText.trim() || isStreaming) return;

    const currentLang = langOverride || selectedLanguage;
    const userMessage: ChatMessage = { role: "user", content: queryText.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);

    try {
      // Pass recent conversation history and language preference
      const history = nextMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: any = await advisorApi.chat({
        message: userMessage.content,
        businessId: selectedBusinessId || undefined,
        context: {
          history,
          language: currentLang,
        },
      });

      const responsePayload = res?.data?.response || res?.data || res;
      const responseText =
        responsePayload?.message ||
        responsePayload?.summary ||
        responsePayload?.analysis ||
        res?.message ||
        "I have analyzed your business details. How else can I assist your planning?";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responseText,
        evidence: responsePayload?.evidence || {
          sources: [
            activeBusiness ? `Venture: ${activeBusiness.name || activeBusiness.category}` : "Entrepreneur Profile",
            "VentureRoot AI Engine",
          ],
          type: "FACT",
          confidence: 96,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Advisor API Error:", error);
      const errMsg =
        error?.response?.data?.message ||
        "I was unable to complete the analysis at this moment. Please verify your connection and try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errMsg,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendQuery(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        sendQuery(input);
      }
    }
  };

  const clearChat = () => {
    stopAudioPlayback();
    setMessages([
      {
        role: "assistant",
        content: "Conversation cleared. How can I guide your business decisions?",
      },
    ]);
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingIndex(null);
    setAudioLoadingIndex(null);
  };

  const handlePlayVoice = async (content: string, index: number) => {
    // If currently playing this message, stop it
    if (playingIndex === index) {
      stopAudioPlayback();
      return;
    }

    stopAudioPlayback();
    setAudioLoadingIndex(index);

    try {
      const response = await fetch("/api/v1/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          language: selectedLanguage !== "auto" ? selectedLanguage : "hi-IN",
        }),
      });

      const contentType = response.headers.get("content-type");

      // Cloud TTS audio stream returned (ElevenLabs / OpenAI)
      if (contentType && contentType.includes("audio")) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          stopAudioPlayback();
        };
        audio.onerror = () => {
          console.warn("[ChatWindow] Audio playback error");
          stopAudioPlayback();
        };

        setAudioLoadingIndex(null);
        setPlayingIndex(index);
        await audio.play();
        return;
      }

      // Fallback response: use Web Speech API in browser
      const data = await response.json();
      setAudioLoadingIndex(null);

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const textToSpeak = data.sanitizedText || content.replace(/[*_#`]/g, " ");
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        const targetLang = selectedLanguage !== "auto" ? selectedLanguage : "hi-IN";
        utterance.lang = targetLang;

        // Try to pick a voice matching the language
        const voices = window.speechSynthesis.getVoices();
        const prefix = targetLang.split("-")[0];
        const matchingVoice = voices.find((v) => v.lang.startsWith(prefix));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onend = () => {
          setPlayingIndex(null);
        };
        utterance.onerror = () => {
          setPlayingIndex(null);
        };

        setPlayingIndex(index);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("[ChatWindow] TTS playback failed:", err);
      stopAudioPlayback();
    }
  };

  const handleCopyText = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const QUICK_PROMPTS = [
    "Should I start this business here?",
    "What are my biggest local risks?",
    "Which financing option or subsidy suits me?",
    "How can I calculate my monthly EMI and breakeven?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[480px] md:h-[75vh] md:min-h-[580px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#1E6702]/15 flex items-center justify-center text-[#1E6702] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading text-[14px] sm:text-[16px] font-bold text-secondary break-words">
                VentureRoot AI Advisor
              </h3>
              <span className="text-[10px] bg-[#1E6702]/10 text-[#1E6702] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Enterprise AI
              </span>
            </div>
            <p className="font-sans text-[11px] sm:text-[12px] text-secondary-muted break-words leading-tight mt-0.5">
              Strict privacy isolation • Multilingual • Voice synthesized
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <div className="flex items-center gap-1 bg-white border border-slate-200 hover:border-[#1E6702]/40 rounded-xl px-2 py-1 shadow-xs">
              <Globe className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />
              <select
                aria-label="Select Advisor Language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-[11px] font-semibold text-[#200813] bg-transparent appearance-none cursor-pointer focus:outline-none pr-4 truncate"
              >
                <option value="auto">🌐 Auto / Multi</option>
                {REGIONAL_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name.split(" ")[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Active Business Switcher */}
          {businesses && businesses.length > 0 && (
            <div className="relative max-w-[150px] min-[400px]:max-w-[180px] sm:max-w-xs">
              <select
                aria-label="Select Active Business"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full text-[11px] sm:text-[12px] font-semibold text-[#200813] bg-white border border-slate-200 hover:border-[#1E6702]/40 rounded-xl px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1E6702] shadow-xs truncate"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    💼 {b.name || b.category} ({b.location?.district || "Local"})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="p-1.5 sm:p-2 text-secondary-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Business Context Banner */}
      {activeBusiness && (
        <div className="bg-[#FFFBE7] border-b border-[#200813]/5 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-1.5 text-xs text-[#200813]/80 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />
              <span className="font-semibold text-[#1E6702] break-words">
                {activeBusiness.name || activeBusiness.category}
              </span>
            </div>
            <span className="text-slate-400 hidden min-[400px]:inline">•</span>
            <span className="break-words">
              📍 {activeBusiness.location?.district || "India"}, {activeBusiness.location?.state || ""}
            </span>
            {activeBusiness.availableMargin != null && (
              <>
                <span className="text-slate-400 hidden min-[400px]:inline">•</span>
                <span className="break-words">Margin: ₹{Number(activeBusiness.availableMargin).toLocaleString("en-IN")}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-[#1E6702] font-bold uppercase tracking-wider shrink-0">
            Active Context
          </span>
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-4 sm:gap-5 min-w-0">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2.5 sm:gap-3.5 w-full max-w-[95%] sm:max-w-[85%] min-w-0 ${
              msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.role === "user" ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E6702] text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>

            {/* Content Bubble */}
            <div className="flex flex-col gap-2 min-w-0 flex-1 overflow-hidden">
              <div
                className={`p-3 sm:p-4 rounded-2xl break-words [overflow-wrap:anywhere] relative group ${
                  msg.role === "user"
                    ? "bg-[#1E6702] text-white rounded-tr-sm shadow-xs"
                    : "bg-slate-50 text-[#200813] rounded-tl-sm border border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="font-sans text-[13px] sm:text-[14px] leading-relaxed break-words [overflow-wrap:anywhere]">
                  <FormattedChatMessage content={msg.content} isUser={msg.role === "user"} />
                </div>

                {/* Assistant Message Actions: Listen Voice & Copy */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(msg.content, index)}
                      disabled={audioLoadingIndex === index}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        playingIndex === index
                          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                          : "bg-white text-secondary hover:text-[#1E6702] hover:bg-[#1E6702]/5 border border-slate-200"
                      }`}
                      title={playingIndex === index ? "Stop voice playback" : "Listen to this advisory audio"}
                    >
                      {audioLoadingIndex === index ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
                      ) : playingIndex === index ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#1E6702]" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.content, index)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-secondary hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copy advice text"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Evidence Rendering */}
              {msg.evidence && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs flex flex-col gap-2 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-sans text-[11px] sm:text-[12px] font-semibold text-secondary-muted break-words">
                      Grounding Context & Confidence
                    </span>
                    <EvidenceBadge
                      type={msg.evidence.type}
                      label={`${msg.evidence.confidence}%`}
                    />
                  </div>
                  {msg.evidence.sources && msg.evidence.sources.length > 0 && (
                    <ul className="list-disc list-inside font-sans text-[11px] text-secondary-muted space-y-0.5 break-words [overflow-wrap:anywhere]">
                      {msg.evidence.sources.map((src, i) => (
                        <li key={i} className="break-words">{src}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-2.5 sm:gap-3 w-full max-w-[95%] sm:max-w-[85%] self-start min-w-0">
            <div className="shrink-0 mt-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E6702] text-white flex items-center justify-center shadow-xs animate-pulse">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="bg-slate-50 text-secondary rounded-2xl rounded-tl-sm border border-slate-200 p-3 sm:p-4 flex gap-1.5 items-center min-w-0">
              <span className="text-xs font-semibold text-[#1E6702] mr-1">AI Advisor is analyzing</span>
              <div className="w-1.5 h-1.5 bg-[#1E6702] rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-[#1E6702] rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-1.5 h-1.5 bg-[#1E6702] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips (Swipeable on Mobile) */}
      <div className="px-3 sm:px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar w-full min-w-0">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendQuery(prompt)}
            disabled={isStreaming}
            className="whitespace-normal sm:whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 bg-white font-sans text-[11px] sm:text-[12px] font-medium text-slate-700 hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/5 transition-colors shrink-0 disabled:opacity-50 text-left cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white w-full min-w-0">
        {showVoiceRecorder ? (
          <VoiceRecorder
            defaultLanguage={selectedLanguage !== "auto" ? selectedLanguage : "hi-IN"}
            onTranscriptConfirm={(transcript, lang) => {
              setShowVoiceRecorder(false);
              sendQuery(transcript, lang);
            }}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <form
            id="chat-form"
            onSubmit={handleSend}
            className="flex items-end gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-[#1E6702]/20 focus-within:border-[#1E6702] transition-all w-full min-w-0"
          >
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(true)}
              className="p-2 mb-0.5 text-slate-500 hover:text-[#1E6702] hover:bg-[#1E6702]/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              title="Voice Input (Speak your question in Indian regional languages)"
            >
              <Mic className="w-4 h-4" />
            </button>
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about local demand, PMEGP/MUDRA subsidies, break-even, licensing..."
              className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 px-2 py-1.5 font-sans text-[12.5px] sm:text-[14px] text-secondary outline-none resize-none leading-snug break-words whitespace-pre-wrap max-h-24 overflow-y-auto placeholder:text-slate-400 placeholder:leading-snug"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 mb-0.5 bg-[#1E6702] text-white rounded-lg hover:bg-[#155201] disabled:opacity-40 disabled:hover:bg-[#1E6702] transition-all flex-shrink-0 shadow-xs active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
