import axios from "axios";

let token = localStorage.getItem("token") || null;
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("token", t);
}
export function getToken() { return token; }
export function meFromToken() {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    const payload = JSON.parse(atob(t.split(".")[1]));
    return { id: payload.id, email: payload.email, name: payload.name };
  } catch { return null; }
}

const api = axios.create();
api.interceptors.request.use((cfg) => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;
