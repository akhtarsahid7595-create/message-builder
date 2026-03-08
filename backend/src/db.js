import pg from "pg";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
const hasDatabaseUrl = Boolean(databaseUrl);

export const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost")
        ? false
        : { rejectUnauthorized: false }
    })
  : null;

let useInMemoryStore = false;
const inMemory = {
  users: [],
  messages: []
};
let nextUserId = 1;
let nextMessageId = 1;

try {
  if (!pool) {
    console.warn("DATABASE_URL is not set, using in-memory store.");
    useInMemoryStore = true;
  } else {
    await pool.query("select 1");
  }
} catch (error) {
  console.warn("Postgres unavailable, falling back to in-memory store.", error?.message);
  useInMemoryStore = true;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };
}

export async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  if (useInMemoryStore) {
    return inMemory.users.find((u) => u.email === normalizedEmail) || null;
  }

  const result = await pool.query(
    `
      select id, email, password_hash, created_at
      from users
      where email = $1
      limit 1
    `,
    [normalizedEmail]
  );

  return result.rows[0] || null;
}

export async function getUserById(userId) {
  if (!userId) {
    return null;
  }

  if (useInMemoryStore) {
    const user = inMemory.users.find((u) => String(u.id) === String(userId));
    return user ? toPublicUser(user) : null;
  }

  const result = await pool.query(
    `
      select id, email, created_at
      from users
      where id = $1
      limit 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

export async function createUserWithPassword({ email, passwordHash }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("email is required");
  }

  if (!passwordHash) {
    throw new Error("password hash is required");
  }

  if (useInMemoryStore) {
    const existing = inMemory.users.find((u) => u.email === normalizedEmail);
    if (existing) {
      const error = new Error("User already exists");
      error.code = "USER_EXISTS";
      throw error;
    }

    const user = {
      id: String(nextUserId++),
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: nowIso()
    };

    inMemory.users.push(user);
    return toPublicUser(user);
  }

  try {
    const result = await pool.query(
      `
        insert into users (email, password_hash)
        values ($1, $2)
        returning id, email, created_at
      `,
      [normalizedEmail, passwordHash]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const conflictError = new Error("User already exists");
      conflictError.code = "USER_EXISTS";
      throw conflictError;
    }
    throw error;
  }
}

export async function saveMessageRecord({
  userId,
  situation,
  emotion,
  description,
  generatedMessage,
  tone
}) {
  if (useInMemoryStore) {
    const message = {
      id: String(nextMessageId++),
      user_id: String(userId),
      situation,
      emotion,
      description,
      generated_message: generatedMessage,
      tone,
      created_at: nowIso()
    };
    inMemory.messages.unshift(message);
    return message;
  }

  const query = `
    insert into messages (user_id, situation, emotion, description, generated_message, tone)
    values ($1, $2, $3, $4, $5, $6)
    returning id, user_id, situation, emotion, description, generated_message, tone, created_at
  `;
  const values = [userId, situation, emotion, description, generatedMessage, tone];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getUserMessages(userId) {
  if (useInMemoryStore) {
    return inMemory.messages
      .filter((m) => String(m.user_id) === String(userId))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  const query = `
    select id, user_id, situation, emotion, description, generated_message, tone, created_at
    from messages
    where user_id = $1
    order by created_at desc
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

export function isUsingInMemoryStore() {
  return useInMemoryStore;
}
