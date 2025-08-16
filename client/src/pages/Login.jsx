import React, { useState } from "react";
import api, { setToken } from "../lib/api.js";

export default function Login({ onAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const toggle = () => setIsRegister((v) => !v);

  async function submit(e) {
    e.preventDefault();
    try {
      const url = isRegister ? "/api/auth/register" : "/api/auth/login";
      const { data } = await api.post(url, form);
      setToken(data.token);
      onAuth(data.user);
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={submit}>
        {isRegister && (
          <input placeholder="Name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ display: "block", margin: "8px 0", width: "100%" }}
          />
        )}
        <input placeholder="Email" type="email" required
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
        <input placeholder="Password" type="password" required
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ display: "block", margin: "8px 0", width: "100%" }}
        />
        <button type="submit">{isRegister ? "Create account" : "Login"}</button>
      </form>
      <p style={{ marginTop: 8 }}>
        {isRegister ? "Have an account?" : "New here?"}{" "}
        <button onClick={toggle} style={{ border: "none", background: "none", color: "blue", cursor: "pointer" }}>
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
