const API_SESSION_KEY = "autocare_auth_session";
export async function apiFetch(input, options = {}) {
  let token = "";
  try { token = JSON.parse(sessionStorage.getItem(API_SESSION_KEY) || "null")?.token || ""; } catch {}
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...options, headers });
}
