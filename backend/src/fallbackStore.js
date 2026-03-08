const memoryUsers = new Map();
const memoryMessages = new Map();

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function memoryGetOrCreateUser(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!memoryUsers.has(normalized)) {
    memoryUsers.set(normalized, {
      id: uid(),
      email: normalized,
      created_at: new Date().toISOString()
    });
  }
  return memoryUsers.get(normalized);
}

export function memorySaveMessage({ email, situation, emotion, description, generated_message, tone }) {
  const user = memoryGetOrCreateUser(email);
  const key = user.email;
  const record = {
    id: uid(),
    user_id: user.id,
    situation,
    emotion,
    description,
    generated_message,
    tone,
    created_at: new Date().toISOString()
  };
  const list = memoryMessages.get(key) || [];
  list.unshift(record);
  memoryMessages.set(key, list);
  return record;
}

export function memoryGetMessages(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return memoryMessages.get(normalized) || [];
}

