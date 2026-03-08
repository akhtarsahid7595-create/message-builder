const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function sanitize(text) {
  return String(text || "").trim().replace(/\s+/g, " ");
}

export async function generateMessageWithGroq({ situation, emotion, description, tone, count = 1 }) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const systemPrompt =
    "You are a relationship communication assistant. Write one respectful message using Situation -> Feeling -> Request. " +
    "Never use blaming language, insults, threats, or accusations. Keep tone emotionally healthy, clear, and calm. " +
    "Return plain text only.";

  const userPrompt = [
    `Situation label: ${sanitize(situation)}`,
    `Emotion: ${sanitize(emotion)}`,
    `Description: ${sanitize(description)}`,
    `Tone: ${sanitize(tone)}`,
    "",
    "Requirements:",
    "1) Start with context using 'When ...'",
    "2) Include feeling using 'I felt ...'",
    "3) End with a respectful request",
    "4) Keep it under 70 words",
    "5) Provide exactly " + count + " different message options separated by '---'"
  ].join("\n");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 180,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Groq request failed");
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Groq returned empty response");
  }

  // If multiple messages were requested, split by the delimiter.
  if (count > 1) {
    return text
      .split("---")
      .map((t) => t.trim())
      .filter((t) => t);
  }

  return text;
}

