import { Router } from "express";
import { User } from "../db/index.js";
import bcrypt from "bcryptjs";
import { sign } from "../middleware/auth.js";

const r = Router();

r.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
    const user = await User.create({ name, email, passwordHash: password });
    const token = sign(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = sign(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

export default r;
