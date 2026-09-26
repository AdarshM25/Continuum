const API_BASE = "http://localhost:4000";
const TOKEN_KEY = "continuum_token";

// The token lives in localStorage so a page refresh doesn't log the user
// out. This is a reasonable starting point for a student project — the
// standard hardening note is that localStorage is readable by any script
// on the page (an XSS risk), so a production app would move to an
// httpOnly cookie instead. Flagging it here rather than treating it as a
// solved problem.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/**
 * One shared request function. Attaches the Bearer token automatically
 * when present, and throws with the server's actual error message on
 * failure so callers can show something meaningful instead of a generic
 * "request failed."
 *
 * On a 401 from a request that DID carry a token, the token is treated as
 * dead (expired or invalidated) — it's cleared, and an "auth-error" event
 * is dispatched so App.jsx can send the user back to the login screen
 * instead of leaving a broken dashboard on screen. A 401 from login/signup
 * itself (no token attached) is just a normal wrong-password error and
 * does NOT trigger this — that's the caller's error to show inline.
 */
async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event("continuum:auth-error"));
    }
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function signup({ name, email, password }) {
  const data = await request("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export function getMeasurements() {
  return request("/measurements");
}

export function getInsights() {
  return request("/insights");
}

/**
 * File upload uses FormData, not JSON — so this deliberately does NOT set
 * a Content-Type header. The browser sets one itself (with the correct
 * multipart boundary) only when the header is left unset; setting it
 * manually here would break the upload.
 */
export function uploadReport(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/reports", { method: "POST", body: formData });
}

export function getReportStatus(reportId) {
  return request(`/reports/${reportId}/status`);
}

export function getReports() {
  return request("/reports");
}

export function getProfile() {
  return request("/auth/me");
}