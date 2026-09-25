import { NextRequest, NextResponse } from "next/server";

// Server-side cache: key = `${sourceLang}_${targetLang}_${text.trim()}`
const serverTranslationCache = new Map<string, string>();

const REGIONAL_LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  pa: "Punjabi",
  en: "English",
};

/**
 * Fast translation using Groq (LLaMA 3.3 70B / 3.1 8B)
 */
async function translateWithGroq(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const targetLangName = REGIONAL_LANGUAGE_NAMES[targetLang] || targetLang;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional enterprise translator for Indian business and local commerce applications. Translate the given text accurately and naturally into the target language. Keep numerical figures, currency symbols (₹), brand names, and business acronyms intact. Return ONLY the translated string with no quotes, notes, or preamble.",
        },
        {
          role: "user",
          content: `Target Language: ${targetLangName}\nText: ${text}`,
        },
      ],
      temperature: 0.1,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    const candidate = data.choices?.[0]?.message?.content?.trim();
    if (candidate) return candidate;
  } else {
    const err = await res.text();
    console.warn("[Translate API] Groq API warning:", res.status, err);
  }

  return text;
}

/**
 * Translation using Gemini (3.5-flash-lite / latest)
 */
async function translateWithGemini(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const targetLangName = REGIONAL_LANGUAGE_NAMES[targetLang] || targetLang;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate this business UI text into ${targetLangName}. Output ONLY the translated text without quotes or explanations:\n\n${text}`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (res.ok) {
    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (candidate) return candidate;
  }

  return text;
}

async function translateSingle(
  text: string,
  targetLang: string,
  sourceLang: string = "auto"
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || targetLang === "en" || targetLang === sourceLang) {
    return text;
  }

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed}`;
  if (serverTranslationCache.has(cacheKey)) {
    return serverTranslationCache.get(cacheKey)!;
  }

  let translatedText = text;
  const groqKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Prioritize Groq (Fastest & high rate limit)
  if (groqKey && translatedText === text) {
    try {
      const res = await translateWithGroq(text, targetLang, groqKey);
      if (res && res !== text) translatedText = res;
    } catch (err) {
      console.warn("[Translate API] Groq attempt failed, falling back:", err);
    }
  }

  // 2. Google Cloud Translation API (if configured)
  if (googleKey && translatedText === text) {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${googleKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: sourceLang === "auto" ? undefined : sourceLang,
          format: "text",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.data?.translations?.[0]?.translatedText;
        if (candidate) translatedText = candidate;
      }
    } catch (err) {
      console.warn("[Translate API] Official Google Translate API failed, trying fallback:", err);
    }
  }

  // 3. Gemini 3.5-flash-lite fallback
  if (geminiKey && translatedText === text) {
    try {
      const res = await translateWithGemini(text, targetLang, geminiKey);
      if (res && res !== text) translatedText = res;
    } catch (err) {
      console.warn("[Translate API] Gemini attempt failed, falling back:", err);
    }
  }

  // 4. Free Google Translate GTX endpoint fallback (free, reliable, preserves regional terminology)
  if (translatedText === text && targetLang !== "en") {
    try {
      const encoded = encodeURIComponent(text);
      const freeUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encoded}`;
      const res = await fetch(freeUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw?.[0])) {
          const joined = raw[0].map((chunk: any) => chunk?.[0] || "").join("");
          if (joined) translatedText = joined;
        }
      }
    } catch (err) {
      console.warn(`[Translate API] Free translation fallback failed for "${text.slice(0, 30)}...":`, err);
    }
  }

  // Cache result (capped at 3000 items)
  if (serverTranslationCache.size > 3000) {
    serverTranslationCache.clear();
  }
  serverTranslationCache.set(cacheKey, translatedText);

  return translatedText;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, texts, targetLang = "en", sourceLang = "auto" } = body;

    // 1. Batch translation mode
    if (Array.isArray(texts)) {
      if (texts.length === 0) {
        return NextResponse.json({ translations: [] });
      }

      if (targetLang === "en") {
        return NextResponse.json({ translations: texts });
      }

      const results = await Promise.all(
        texts.map((t) => (typeof t === "string" ? translateSingle(t, targetLang, sourceLang) : t))
      );

      return NextResponse.json({
        translations: results,
        targetLang,
      });
    }

    // 2. Single text translation mode
    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'text' or 'texts' field" }, { status: 400 });
    }

    const translatedText = await translateSingle(text, targetLang, sourceLang);

    return NextResponse.json({
      originalText: text,
      translatedText,
      targetLang,
      fromCache: serverTranslationCache.has(`${sourceLang}_${targetLang}_${text.trim()}`),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Translation failed", details: error?.message },
      { status: 500 }
    );
  }
}

