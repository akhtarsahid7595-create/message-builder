import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  pool,
  createUserWithPassword,
  getUserByEmail,
  getUserById,
  getUserMessages,
  isUsingInMemoryStore,
  saveMessageRecord
} from "./db.js";
import { hashPassword, signAuthToken, verifyAuthToken, verifyPassword } from "./auth.js";
import { generateMessageVariants, validatePayload } from "./messageGenerator.js";

const app = express();
const port = process.env.PORT || 4000;

function buildAllowedOrigins() {
  const fromEnv = String(process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return new Set([
    ...fromEnv,
    "http://localhost:5173",
    "https://messagebuilder-six.vercel.app"
  ]);
}

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice("Bearer ".length).trim();
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const payload = verifyAuthToken(token);
    const user = await getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/health", async (_req, res) => {
  if (isUsingInMemoryStore()) {
    return res.json({ ok: true, db: "in-memory" });
  }

  try {
    await pool.query("select 1");
    return res.json({ ok: true, db: "postgres" });
  } catch (_error) {
    return res.status(500).json({ ok: false, error: "Database unavailable" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const passwordHash = hashPassword(password);
    const user = await createUserWithPassword({ email, passwordHash });
    const token = signAuthToken({ sub: user.id, email: user.email });

    return res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "USER_EXISTS") {
      return res.status(409).json({ error: "User already exists" });
    }
    return res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signAuthToken({ sub: user.id, email: user.email });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (_error) {
    return res.status(500).json({ error: "Login failed" });
  }
});

app.get("/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

app.post("/generate-message", async (req, res) => {
  try {
    validatePayload(req.body);
    const generatedMessages = await generateMessageVariants(req.body, 5);
    return res.json({
      generated_message: generatedMessages[0],
      generated_messages: generatedMessages
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/save-message", requireAuth, async (req, res) => {
  try {
    const { situation, emotion, description, generated_message, tone } = req.body;
    if (!situation || !emotion || !description || !generated_message || !tone) {
      return res.status(400).json({
        error: "situation, emotion, description, generated_message, and tone are required"
      });
    }

    const message = await saveMessageRecord({
      userId: req.user.id,
      situation,
      emotion,
      description,
      generatedMessage: generated_message,
      tone
    });

    return res.status(201).json({ message });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to save message" });
  }
});

app.get("/messages", requireAuth, async (req, res) => {
  try {
    const messages = await getUserMessages(req.user.id);
    return res.json({ messages });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Message Builder API listening on http://localhost:${port}`);
  });
}

export default app;



