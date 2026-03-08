import { useEffect, useMemo, useState } from "react";
import {
  generateMessage,
  getCurrentUser,
  getMessages,
  loginUser,
  saveMessage,
  signupUser
} from "./api";

const situations = [
  {
    label: "Feeling ignored",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtmrgqswOPWMwOn1UuutsHtu70cf3Sxqmp2-S0vki3dhOpECQh9g_L99wNvrh4hasO0z0SYF0ywWnaIbun5GNDK26v52r9iASGcS0Eq6__oaZjSYXr-BH09DMe7HI8uK3mKuI3KRGzy-puUpXB9X0v23USn_bdgg2cGUyCBtO0YuuzsOho_bZO2_MSBypcQLkycoagojLMMhzVuDqi4oFhbQodGrpKrpr42w7leSWeY-CMkLeXiKm_gwrdnYLffOCn2Hb6HsC_vzTA"
  },
  {
    label: "Jealousy",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDI_49vrnm1XUYeYTS4n9gF9emPWdIEwG3oWVGL2oNQ-o4KGHgYz4ZrU3XwE7LmiQK6MUv9Ogbn5y6UUiGMdHIkhzjaTEXirWO9LgEzDYmrRzMH-t9lzRhZLEhcJlRpAyfbp4gf6WEtmDZhda5C4eJeZTMv2dzMTAhKCUUjBzBqpibvK904PyBJ1Gd5OgVhbCFRvICb6_0Gq--t0TdxA6mwB4d4LLlLU4ybJqjRSkqGGvUZ9ZZA-j4L-cyCzMRZHwo3GUFs5hBX60Q-"
  },
  {
    label: "Need reassurance",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBKGWT3-3u55EMkOyHGVYavRBS_BZg-6XlECBM-lvgQS6-J2bOH6sIX9dBFqCXy1D9PzoE-Lcjjej2Zmm9G72PW2FnEALcUBcwDtOEhmJIOu85SO6nbxe460jTRq5IbySTDaAyAvG2SzcS8WwEC2X4ACFfUiEZo1TLoNQQLx4RY1gLM_193IJEiGaUbYYaB6qkLpCTYRMbBWJ6pv5BzhVxaDZfxaSMZTg1Xa3-_l6B9xG3rOEzegNlZxRapsQEs_q9wGrG8j7hgxQt8"
  },
  {
    label: "Difficult conversation",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOQY3Lty1rMA2ZUeu5y8UhOqEdnv8SWPXoyF5v2ysSf4b7AC5UHMsd7a3OG3HRgQKA8SyO0QHgW7cgaghQUfAoOupJJwXSIC1bu_BYIRPXNMyvHs60CtTk_BUxCbWGqRDQLcXf3Nv13ip0d2MQSRLe2B0PlV5fRZFBM4leUsp15tZmBmPAqMj7EHnj-3NaN8ggpxpPqqzjCOsJ7XjL-ZrfGbzJYhyJDVZyIVyTXDZ5Ld9U0YbZ9tNF0g69pTws2A9suyXJ7vNsWGqU"
  },
  {
    label: "Apology",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvJ13fNFYTy97QXrC3v6zw_RSo9WBoWsR9wiWjctw_wYZgvMUYikLvaQ8f3K0u0eSgI43g5Wf-6qADUPmO2nckabAvAkTTK3-sOUNdXEbjxuKOc4XKyWFsctH1ZXav8nzP6KwIwkViecXvtac1goffakX3BH0zUnlNOUb8-0Jlw1C1n0lNAZdfK7mgv_AcwRvuGjbkKWtbMpUThMK66_hXYVgF31bRfsxQlZlNnLW7n3lzgok6mUewmhKMqhgsrH-yq_qnx89uoi4q"
  },
  {
    label: "Feeling overwhelmed",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Need space",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Need clarity",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Feeling disconnected",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
  },
  {
    label: "Want to celebrate",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
  }
];

const emotions = ["anxious", "hurt", "lonely", "confused", "frustrated", "grateful", "sad"];
const tones = ["calm", "caring", "supportive", "apologetic"];
const totalSteps = 7;

const affirmationBoosters = {
  "Feeling ignored": [
    "I can ask for connection with clarity and calm.",
    "My emotional needs are valid and important.",
    "I release overthinking and choose grounded communication.",
    "I deserve consistency, care, and mutual effort."
  ],
  Jealousy: [
    "I anchor myself in trust, not fear.",
    "I am complete and secure in my own worth.",
    "I respond with maturity and emotional balance.",
    "I choose facts, honesty, and self-respect."
  ],
  "Need reassurance": [
    "I can request reassurance without apologizing for my feelings.",
    "I deserve steady love and clear communication.",
    "I breathe deeply and return to emotional safety.",
    "I am learning to trust with wisdom and patience."
  ],
  "Need clarity": [
    "I communicate directly, kindly, and confidently.",
    "Clarity brings peace to my mind and heart.",
    "I choose truth over assumptions.",
    "I trust myself to ask better questions."
  ],
  "Difficult conversation": [
    "I can stay respectful even in hard moments.",
    "I lead with honesty and emotional maturity.",
    "My calm tone creates space for understanding.",
    "I protect connection while speaking my truth."
  ],
  Apology: [
    "I can repair with humility and sincerity.",
    "I am allowed to grow beyond my mistakes.",
    "I choose accountability and compassion.",
    "Healing becomes possible when I stay honest."
  ],
  "Feeling overwhelmed": [
    "I can slow down and handle one thing at a time.",
    "My breath can reset my nervous system.",
    "I am safe in this moment.",
    "I can ask for help and still be strong."
  ],
  "Need space": [
    "My boundaries protect my peace.",
    "Taking space can strengthen relationships.",
    "I can pause without guilt.",
    "I return to conversations with clarity and care."
  ],
  "Feeling disconnected": [
    "I can rebuild closeness through small, honest steps.",
    "I choose presence over distance.",
    "My openness invites deeper connection.",
    "I can create warmth with intentional words."
  ],
  "Want to celebrate": [
    "Joy is safe for me.",
    "I allow myself to feel proud and grateful.",
    "I honor progress and shared love.",
    "I expand the good moments in my life."
  ]
};

function buildGuidedAffirmations(label, list) {
  const extras = affirmationBoosters[label] || [];
  const guidedCore = [
    "I am grounded, present, and emotionally safe.",
    "I choose calm communication and clear intentions.",
    "I deserve respect, consistency, and understanding.",
    "I release urgency and respond with wisdom.",
    "My voice is steady, kind, and confident.",
    "I can create connection without abandoning myself."
  ];

  const merged = [...list, ...extras, ...guidedCore];
  const cleaned = Array.from(new Set(merged.map((line) => String(line || "").trim()).filter(Boolean)));
  return cleaned.slice(0, 18);
}

export default function App() {
  const [email, setEmail] = useState(localStorage.getItem("mb_email") || "");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("mb_token")));

  const [view, setView] = useState("home");
  const [step, setStep] = useState(1);

  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("calm");

  const [generatedMessage, setGeneratedMessage] = useState("");
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [affirmations, setAffirmations] = useState([]);
  const [affirmationPlaying, setAffirmationPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const progress = useMemo(() => `${(step / totalSteps) * 100}%`, [step]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
      hydrateUser();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function hydrateUser() {
    try {
      const response = await getCurrentUser();
      if (response?.user?.email) {
        setEmail(response.user.email);
        localStorage.setItem("mb_email", response.user.email);
      }
    } catch (_err) {
      logout();
    }
  }

  async function fetchHistory() {
    try {
      const response = await getMessages();
      setHistory(response.messages || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function getAffirmationsForSituation(situationLabel) {
    const map = {
      "Feeling ignored": [
        "I am worthy of attention and understanding.",
        "My feelings matter, and I deserve to be heard.",
        "It is okay to ask for what I need.",
        "I can express myself clearly and calmly.",
        "I choose patience and compassion for myself.",
        "My peace is more important than being right.",
        "I am allowed to set gentle boundaries.",
        "I trust myself to communicate with care.",
        "I am enough, even when others are busy.",
        "I am deserving of connection and kindness."
      ],
      Jealousy: [
        "I am secure in who I am.",
        "I choose trust and calm over fear.",
        "My value is not determined by others.",
        "I can communicate my needs with grace.",
        "I am capable of loving without comparison.",
        "I am growing and learning every day.",
        "I release the need to control others.",
        "My feelings are valid and manageable.",
        "I can focus on what I can control.",
        "I choose gratitude over worry."
      ],
      "Need reassurance": [
        "I am supported and cared for.",
        "I deserve clarity and kindness.",
        "My heart is safe and heard.",
        "I can ask for what I need.",
        "I have the power to create calm.",
        "My voice matters.",
        "I can trust the people who love me.",
        "I release doubt at my own pace.",
        "I am loved for who I am.",
        "I choose compassion for myself."
      ],
      "Need clarity": [
        "I can ask for clarity without fear.",
        "Clear communication helps me feel grounded.",
        "I can pause and respond with intention.",
        "I trust myself to ask thoughtful questions.",
        "I choose understanding over assumptions.",
        "My peace grows when I seek clarity.",
        "I can communicate gently and directly.",
        "I deserve honest and respectful answers.",
        "I am calm while I wait for clarity.",
        "I create trust through open conversation."
      ],
      "Difficult conversation": [
        "I can be calm and honest.",
        "My intention is connection, not conflict.",
        "I speak from my heart with respect.",
        "I am open to understanding and being understood.",
        "I can offer feedback kindly.",
        "I am strong enough to have hard conversations.",
        "My words can build trust.",
        "I can listen without judgment.",
        "I choose clarity over criticism.",
        "I am committed to healthy communication."
      ],
      Apology: [
        "I am willing to admit when I am wrong.",
        "I can take responsibility and move forward.",
        "I value healing more than being right.",
        "I choose empathy over ego.",
        "I am open to rebuilding trust.",
        "I can apologize with sincerity.",
        "I acknowledge my impact with compassion.",
        "I am capable of growth.",
        "I forgive myself as I learn.",
        "My relationships are worth the effort."
      ],
      "Feeling overwhelmed": [
        "I am allowed to take a break.",
        "I breathe and let go of tension.",
        "I can pace myself gently.",
        "My wellbeing is a priority.",
        "I am capable of handling what comes.",
        "I am stronger than my stress.",
        "I choose calm over chaos.",
        "I am supported even when I feel alone.",
        "I trust myself to make good choices.",
        "I give myself permission to rest."
      ],
      "Need space": [
        "It is okay to create healthy boundaries.",
        "I can step back and recharge.",
        "I deserve time to regain my balance.",
        "I am kind to myself when I need space.",
        "I honor my own pace.",
        "I can communicate my needs respectfully.",
        "I can take a pause to listen to myself.",
        "I am worthy of care and quiet.",
        "I choose what is best for my wellbeing.",
        "I trust my instincts when I need room."
      ],
      "Feeling disconnected": [
        "I am open to rebuilding connection.",
        "I can show up with honesty.",
        "I am worthy of closeness.",
        "I can reach out with courage.",
        "I choose curiosity over assumptions.",
        "I can create small moments of connection.",
        "I am patient with others and myself.",
        "I can ask for what I need clearly.",
        "I am capable of being present.",
        "I trust the process of reconnecting."
      ],
      "Want to celebrate": [
        "I appreciate the good in my life.",
        "I am grateful for the people around me.",
        "I can celebrate my wins, big and small.",
        "I deserve joy and recognition.",
        "I honor my progress.",
        "I am proud of my courage.",
        "I welcome more positivity in my day.",
        "I am worthy of celebration.",
        "I can share my joy with others.",
        "I embrace happy moments fully."
      ]
    };

    return buildGuidedAffirmations(situationLabel, map[situationLabel] || map["Feeling ignored"]);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email: email.trim().toLowerCase(), password };
      const response = authMode === "signup" ? await signupUser(payload) : await loginUser(payload);

      localStorage.setItem("mb_token", response.token);
      localStorage.setItem("mb_email", response.user.email);
      setEmail(response.user.email);
      setPassword("");
      setIsLoggedIn(true);
      setSuccess(authMode === "signup" ? "Account created successfully." : "Signed in successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate({ autoAdvance = false } = {}) {
    if (loading) return false;

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await generateMessage({ situation, emotion, description, tone });
      const options = response.generated_messages || [response.generated_message];
      const first = options[0] || "";

      setGeneratedOptions(options);
      setGeneratedMessage(first);
      setAffirmations(getAffirmationsForSituation(situation || "Feeling ignored"));

      if (!first) {
        setError("Could not generate a message. Please try again.");
        return false;
      }

      if (autoAdvance) {
        setStep(6);
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function nextStep() {
    setError("");
    if (step === 1 && !situation) return setError("Please choose a situation.");
    if (step === 2 && !emotion) return setError("Please choose an emotion.");
    if (step === 3 && !description.trim()) return setError("Please describe what happened.");

    if (step === 5) {
      if (generatedMessage) {
        setStep(6);
        return;
      }

      const generated = await handleGenerate({ autoAdvance: true });
      if (!generated) {
        setError((prev) => prev || "Please generate your message first.");
      }
      return;
    }

    setStep((s) => Math.min(totalSteps, s + 1));
  }

  function previousStep() {
    setError("");
    if (step === 1) {
      setView("home");
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await saveMessage({
        situation,
        emotion,
        description,
        tone,
        generated_message: generatedMessage
      });
      setSuccess("Message saved.");
      await fetchHistory();
    } catch (err) {
      if (/authorization|token|expired/i.test(err.message)) {
        logout();
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopySuccess("Copied to clipboard.");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (_err) {
      setError("Copy failed. Please select and copy manually.");
    }
  }

  function pickGuidedVoice() {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (!voices.length) return null;

    return (
      voices.find((v) => /neural|aria|jenny|davis|david|mark|daniel|ravi|male|calm/i.test(`${v.name} ${v.voiceURI}`)) ||
      voices.find((v) => /en-(in|gb|us)/i.test(v.lang)) ||
      voices[0]
    );
  }

  function playAffirmations() {
    if (!affirmations.length) return;

    if (!window.speechSynthesis) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    setError("");
    setAffirmationPlaying(true);

    const synth = window.speechSynthesis;
    synth.cancel();

    const guidedLines = [
      "Settle your shoulders and take a slow deep breath.",
      ...affirmations,
      "You are safe, grounded, and ready to communicate with clarity."
    ];

    const voice = pickGuidedVoice();
    let current = 0;

    const speakNext = () => {
      if (current >= guidedLines.length) {
        setAffirmationPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(guidedLines[current]);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.76;
      utterance.pitch = 0.64;
      utterance.volume = 1;

      utterance.onend = () => {
        current += 1;
        setTimeout(speakNext, 520);
      };

      utterance.onerror = () => {
        setAffirmationPlaying(false);
        setError("Voice playback was interrupted. Please try again.");
      };

      synth.speak(utterance);
    };

    speakNext();
  }

  function stopAffirmations() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAffirmationPlaying(false);
  }

  function logout() {
    localStorage.removeItem("mb_email");
    localStorage.removeItem("mb_token");
    setIsLoggedIn(false);
    setHistory([]);
    setPassword("");
    setView("home");
  }

  function startBuilder() {
    setStep(1);
    setView("builder");
    setError("");
    setSuccess("");
  }

  function startAffirmations() {
    setView("affirmations");
    setError("");
    setSuccess("");
    setAffirmations(getAffirmationsForSituation(situation || "Feeling ignored"));
  }

  function renderBuilderStep() {
    if (step === 1) {
      return (
        <section className="stack">
          <h2>Select your situation</h2>
          <p className="muted small">Choose the context that matches best.</p>
          <div className="image-grid">
            {situations.map((item) => (
              <button
                key={item.label}
                className={situation === item.label ? "image-chip selected" : "image-chip"}
                onClick={() => setSituation(item.label)}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.68), rgba(0,0,0,0.12)), url('${item.image}')`
                }}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (step === 2) {
      return (
        <section className="stack">
          <h2>How are you feeling?</h2>
          <p className="muted small">Choose the emotion that fits this moment.</p>
          <div className="chips grid3 emotion-grid">
            {emotions.map((item) => (
              <button
                key={item}
                className={emotion === item ? "chip selected" : "chip"}
                onClick={() => setEmotion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (step === 3) {
      return (
        <section className="stack">
          <h2>What happened?</h2>
          <textarea
            rows={6}
            placeholder="When you did not reply to my message yesterday..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>
      );
    }

    if (step === 4) {
      return (
        <section className="stack">
          <h2>Healthy Message Structure</h2>
          <div className="block-card"><b>Situation:</b> When [description]</div>
          <div className="block-card"><b>Feeling:</b> I felt [emotion]</div>
          <div className="block-card"><b>Request:</b> I would appreciate if we could talk.</div>
        </section>
      );
    }

    if (step === 5) {
      return (
        <section className="stack">
          <h2>Select a tone</h2>
          <div className="chips grid2">
            {tones.map((item) => (
              <button
                key={item}
                className={tone === item ? "chip selected" : "chip"}
                onClick={() => setTone(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => handleGenerate({ autoAdvance: true })} disabled={loading}>
            {loading ? "Generating..." : "Generate Message"}
          </button>
        </section>
      );
    }

    if (step === 6) {
      return (
        <section className="stack">
          <h2>Draft Preview</h2>

          {generatedOptions.length > 1 && (
            <div className="options">
              <p className="muted">Choose the message you prefer:</p>
              <div className="option-grid">
                {generatedOptions.map((option, idx) => (
                  <button
                    key={idx}
                    className={option === generatedMessage ? "option selected" : "option"}
                    onClick={() => setGeneratedMessage(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="output">
            <p>{generatedMessage || "No message generated yet."}</p>
          </div>

          <div className="button-row">
            <button onClick={handleCopy} disabled={!generatedMessage}>Copy Message</button>
            <button onClick={handleSave} disabled={loading || !generatedMessage}>
              {loading ? "Saving..." : "Save Message"}
            </button>
          </div>
          {copySuccess && <p className="success">{copySuccess}</p>}
        </section>
      );
    }

    return (
      <section className="stack">
        <h2>Final Tip</h2>
        <div className="output">
          <p>Calm communication helps your partner understand your feelings.</p>
        </div>
        <button onClick={() => setView("history")}>Finish and View History</button>
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="app-shell">
        <div className="card">
          <h1>Trust Message Studio</h1>
          <p>Sign in or create an account to save and sync your messages securely.</p>
          <form onSubmit={handleAuth} className="stack">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Sign In"}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => setAuthMode((m) => (m === "signup" ? "login" : "signup"))}
            >
              {authMode === "signup" ? "Already have an account? Sign In" : "New here? Create Account"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell mobile-shell">
      <div className="card wide phone">
        <div className="top-row">
          <h1>Trust Message Studio</h1>
          <div className="top-actions">
            <button className="ghost" onClick={() => setView("history")}>History</button>
            <button className="ghost" onClick={() => setView("affirmations")}>Affirmations</button>
            <button className="ghost" onClick={logout}>Logout</button>
          </div>
        </div>

        {view === "home" && (
          <section className="hero">
            <div className="hero-art" />
            <h2>Communicate with calm confidence</h2>
            <p className="muted">A guided premium flow to write clear, trustworthy relationship messages.</p>
            <button onClick={startBuilder}>Start Building Message</button>
            <button className="ghost full" onClick={() => setView("history")}>Message History</button>
            <button className="ghost full" onClick={startAffirmations}>Guided Affirmations</button>
          </section>
        )}

        {view === "history" && (
          <section className="stack">
            <h2>Message History</h2>
            {history.length === 0 && <p className="muted">No messages saved yet.</p>}
            {history.map((item) => (
              <article key={item.id} className="history-item">
                <div className="history-meta">
                  <span>{item.situation}</span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <p><b>Emotion:</b> {item.emotion}</p>
                <p><b>Tone:</b> {item.tone}</p>
                <p>{item.generated_message}</p>
              </article>
            ))}
            <button className="ghost" onClick={() => setView("home")}>Back Home</button>
          </section>
        )}

        {view === "affirmations" && (
          <section className="stack">
            <h2>Guided Affirmations</h2>
            <p className="muted">Expanded, deep, and calm affirmations for your selected situation.</p>

            <div className="chips grid3">
              {situations.map((item) => (
                <button
                  key={item.label}
                  className={situation === item.label ? "chip selected" : "chip"}
                  onClick={() => {
                    setSituation(item.label);
                    setAffirmations(getAffirmationsForSituation(item.label));
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="affirmations">
              {affirmations.map((affirmation, idx) => (
                <div key={idx} className="affirmation">{affirmation}</div>
              ))}
            </div>

            <div className="button-row">
              <button onClick={playAffirmations} disabled={affirmationPlaying || !affirmations.length}>
                {affirmationPlaying ? "Playing..." : "Play Guided Audio"}
              </button>
              <button onClick={stopAffirmations} disabled={!affirmationPlaying}>Stop</button>
            </div>

            <button className="ghost" onClick={() => setView("home")}>Back Home</button>
          </section>
        )}

        {view === "builder" && (
          <>
            <div className="progress-wrap">
              <div className="progress-labels">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <div className="progress-bar"><div style={{ width: progress }} /></div>
            </div>

            <div key={step} className="step-stage">
              {renderBuilderStep()}
            </div>

            <div className="nav-row">
              <button onClick={previousStep} disabled={loading}>Back</button>
              {step < totalSteps && <button onClick={nextStep} disabled={loading}>Continue</button>}
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
}
