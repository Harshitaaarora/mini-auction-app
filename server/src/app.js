import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import auctionsRouter from "./routes/auctions.js";
import bidsRouter from "./routes/bids.js";
import authRouter from "./routes/auth.js";
import decisionsRouter from "./routes/decisions.js";
import { sequelize } from "./db/index.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/auctions", auctionsRouter);
app.use("/api/bids", bidsRouter);
app.use("/api/decisions", decisionsRouter);

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Fallback to index.html for SPA routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

// Ensure DB is reachable on boot
await sequelize.authenticate();

export default app;
