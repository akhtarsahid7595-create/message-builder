const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getAuthToken() {
  return localStorage.getItem("mb_token") || "";
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || "Request failed";

    if (response.status === 401) {
      localStorage.removeItem("mb_token");
      localStorage.removeItem("mb_email");
    }

    throw new Error(message);
  }

  return data;
}

export function signupUser(payload) {
  return request("/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser() {
  return request("/me");
}

export function generateMessage(payload) {
  return request("/generate-message", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function saveMessage(payload) {
  return request("/save-message", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMessages() {
  return request("/messages");
}
