import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, language = "en-IN", voiceId } = body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required for TTS synthesis" }, { status: 400 });
    }

    // Clean text for audio synthesis: remove markdown symbols, code blocks, URLs
    const sanitizedText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[•●▪]/g, "")
      .trim()
      .slice(0, 4000); // Safety limit for single speech generation

    // 1. Check for ElevenLabs API Key
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default Rachel / Multilingual

    if (elevenLabsKey && elevenLabsKey.trim().length > 5) {
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?optimize_streaming_latency=2`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsKey.trim(),
            },
            body: JSON.stringify({
              text: sanitizedText,
              model_id: "eleven_multilingual_v2", // Multilingual v2 supports Hindi, Bengali, Tamil, etc.
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
                style: 0.0,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } else {
          const errBody = await response.text();
          console.warn("[voice/tts] ElevenLabs error status:", response.status, errBody);
        }
      } catch (err) {
        console.warn("[voice/tts] ElevenLabs network error:", err.message);
      }
    }

    // 2. Check for OpenAI API Key (TTS-1)
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.trim().length > 5) {
      try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey.trim()}`,
          },
          body: JSON.stringify({
            model: "tts-1",
            input: sanitizedText,
            voice: "alloy",
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } else {
          const errBody = await response.text();
          console.warn("[voice/tts] OpenAI TTS error status:", response.status, errBody);
        }
      } catch (err) {
        console.warn("[voice/tts] OpenAI TTS network error:", err.message);
      }
    }

    // 3. Fallback: Instruct client to invoke browser Web Speech API (window.speechSynthesis)
    return NextResponse.json({
      fallback: "browser_tts",
      sanitizedText,
      language,
      message: "No cloud TTS key configured; fallback to browser native multilingual speech synthesis",
    });
  } catch (error) {
    console.error("[voice/tts] Internal error:", error);
    return NextResponse.json({ error: "Failed to synthesize voice", details: error.message }, { status: 500 });
  }
}
