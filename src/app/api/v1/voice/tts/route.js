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

    // 1. If language is not English, ensure spoken text is translated into the target regional language
    const normLang = (language || "en").toLowerCase().slice(0, 2);
    let textToSynthesize = sanitizedText;

    if (normLang !== "en") {
      const latinChars = (sanitizedText.match(/[a-zA-Z]/g) || []).length;
      // If the text contains substantial English/Latin words, translate it to native script
      if (latinChars > 8) {
        try {
          const trUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${normLang}&dt=t&q=${encodeURIComponent(sanitizedText.slice(0, 1500))}`;
          const trRes = await fetch(trUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          });
          if (trRes.ok) {
            const trData = await trRes.json();
            const translated = trData?.[0]?.map((item) => item[0]).join("")?.trim();
            if (translated && translated.length > 2) {
              textToSynthesize = translated;
            }
          }
        } catch (trErr) {
          console.warn("[voice/tts] Translation before TTS failed:", trErr.message);
        }
      }
    }

    // 2. Check for ElevenLabs API Key
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    let targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Sarah (premade voice compatible with free tier)
    if (targetVoiceId === "21m00Tcm4TlvDq8ikWAM") {
      targetVoiceId = "EXAVITQu4vr4xnSDxMaL";
    }

    if (elevenLabsKey && elevenLabsKey.trim().length > 5) {
      try {
        let response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?optimize_streaming_latency=2`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsKey.trim(),
            },
            body: JSON.stringify({
              text: textToSynthesize,
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

        // If library voice requires paid tier (402), retry with confirmed premade voice (EXAVITQu4vr4xnSDxMaL)
        if (!response.ok && (response.status === 402 || response.status === 400) && targetVoiceId !== "EXAVITQu4vr4xnSDxMaL") {
          console.warn("[voice/tts] ElevenLabs library voice restricted, falling back to premade voice EXAVITQu4vr4xnSDxMaL");
          response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?optimize_streaming_latency=2`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": elevenLabsKey.trim(),
              },
              body: JSON.stringify({
                text: textToSynthesize,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.8,
                  style: 0.0,
                  use_speaker_boost: true,
                },
              }),
            }
          );
        }

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

    // 3. Check for OpenAI API Key (TTS-1)
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
            input: textToSynthesize,
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

    // 4. Free High-Fidelity Regional Speech Audio Stream (Google Multilingual TTS)
    // Supports Bengali (bn), Hindi (hi), Tamil (ta), Telugu (te), Marathi (mr), Punjabi (pa), English (en)
    try {
      const segments = textToSynthesize.match(/[^.!?।\n]+[.!?।\n]?/g) || [textToSynthesize];
      const audioBuffers = [];

      for (const seg of segments.slice(0, 10)) {
        const q = seg.trim();
        if (!q) continue;

        // Split into chunks under 180 chars to adhere to Google TTS limits
        const subSegments = q.length > 180 ? (q.match(/.{1,180}(\s|$)/g) || [q]) : [q];
        for (const sub of subSegments) {
          const cleanSub = sub.trim();
          if (!cleanSub) continue;

          const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanSub)}&tl=${normLang}&client=tw-ob`;
          const gttsRes = await fetch(gttsUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          if (gttsRes.ok) {
            const buf = await gttsRes.arrayBuffer();
            audioBuffers.push(Buffer.from(buf));
          }
        }
      }

      if (audioBuffers.length > 0) {
        const combined = Buffer.concat(audioBuffers);
        return new NextResponse(combined, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch (gttsErr) {
      console.warn("[voice/tts] Google native regional TTS failed, falling back to browser SpeechSynthesis:", gttsErr.message);
    }

    // 5. Fallback: Instruct client to invoke browser Web Speech API (window.speechSynthesis)
    return NextResponse.json({
      fallback: "browser_tts",
      sanitizedText: textToSynthesize,
      language: normLang,
      message: "Fallback to browser native multilingual speech synthesis",
    });
  } catch (error) {
    console.error("[voice/tts] Internal error:", error);
    return NextResponse.json({ error: "Failed to synthesize voice", details: error.message }, { status: 500 });
  }
}
