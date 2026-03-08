import { generateMessageWithGroq } from "./groq.js";

const SUPPORTED_TONES = ["calm", "caring", "supportive", "apologetic"];

const TONE_PREFIX = {
  calm: "I wanted to share this honestly.",
  caring: "I care about our relationship and wanted to share how I felt.",
  supportive: "I value us and want us to understand each other better.",
  apologetic: "I want to express this gently and respectfully."
};

const AGGRESSIVE_PATTERNS = [
  /\bidiot\b/i,
  /\bstupid\b/i,
  /\bshut up\b/i,
  /\bhate you\b/i,
  /\byou always\b/i,
  /\byou never\b/i,
  /\byour fault\b/i,
  /\bworthless\b/i,
  /\bdumb\b/i,
  /\btoxic\b/i
];

function normalizeSentence(text) {
  return text.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
}

function startsWithWhen(description) {
  return /^when\b/i.test(description);
}

function inferRequest(situation) {
  const s = situation.toLowerCase();

  if (s.includes("ignored") || s.includes("reply") || s.includes("text")) {
    return "I would appreciate a short reply when you are busy so I know we are okay.";
  }
  if (s.includes("jealous")) {
    return "I would appreciate if we could talk openly and reassure each other.";
  }
  if (s.includes("reassurance")) {
    return "Could we check in with each other a little more consistently?";
  }
  if (s.includes("apology") || s.includes("sorry")) {
    return "I would appreciate a chance to repair this together.";
  }
  return "I would appreciate if we could talk about it when you have time.";
}

function isSafeInput({ situation, emotion, description }) {
  const combined = `${situation} ${emotion} ${description}`;
  return !AGGRESSIVE_PATTERNS.some((pattern) => pattern.test(combined));
}

export function validatePayload(payload) {
  const { situation, emotion, description, tone } = payload;
  if (!situation || !emotion || !description || !tone) {
    throw new Error("situation, emotion, description, and tone are required");
  }
  if (!SUPPORTED_TONES.includes(tone)) {
    throw new Error(`tone must be one of: ${SUPPORTED_TONES.join(", ")}`);
  }
  if (!isSafeInput(payload)) {
    throw new Error("Please avoid aggressive or blaming language.");
  }
}

function buildLocalMessage({ situation, emotion, description, tone, requestOverride }) {
  const safeSituation = normalizeSentence(situation);
  const safeEmotion = normalizeSentence(emotion).toLowerCase();
  const safeDescription = normalizeSentence(description);

  const situationPart = startsWithWhen(safeDescription)
    ? `${safeDescription},`
    : `When ${safeDescription},`;

  const feelingPart = `I felt ${safeEmotion}.`;
  const requestPart = requestOverride || inferRequest(safeSituation);
  const tonePart = TONE_PREFIX[tone];

  return `${tonePart} ${situationPart} ${feelingPart} ${requestPart}`;
}

export async function generateMessage({ situation, emotion, description, tone }) {
  // Use Groq LLM if an API key is configured; otherwise fall back to the local generator.
  if (process.env.GROQ_API_KEY) {
    const texts = await generateMessageWithGroq({ situation, emotion, description, tone });
    return Array.isArray(texts) ? texts[0] : texts;
  }

  return buildLocalMessage({ situation, emotion, description, tone });
}

export async function generateMessageVariants({ situation, emotion, description, tone, count = 5 }) {
  if (process.env.GROQ_API_KEY) {
    const texts = await generateMessageWithGroq({ situation, emotion, description, tone, count });
    return Array.isArray(texts) ? texts.slice(0, count) : [texts];
  }

  const requestVariants = [
    inferRequest(situation),
    "I would really appreciate if you could share your thoughts when you have a moment.",
    "Could we talk about it when you have time?",
    "It would help me a lot if we could discuss this calmly.",
    "Would you be open to having a quick chat about this?"
  ];

  const variants = [];
  for (let i = 0; i < count; i++) {
    variants.push(
      buildLocalMessage({
        situation,
        emotion,
        description,
        tone,
        requestOverride: requestVariants[i % requestVariants.length]
      })
    );
  }
  return variants;
}

