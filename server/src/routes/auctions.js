import { Router } from "express";
import { Auction, User } from "../db/index.js";
import { auth } from "../middleware/auth.js";
import { redisGetHighest } from "../services/redis.js";

const r = Router();

// Create auction (seller)
r.post("/", auth, async (req, res) => {
  try {
    const { itemName, description, startPrice, bidIncrement, goLiveAt, durationSec } = req.body;
    const auction = await Auction.create({
      itemName, description, startPrice, bidIncrement, goLiveAt, durationSec,
      sellerId: req.user.id, status: "scheduled"
    });
    res.json(auction);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// List auctions
r.get("/", async (req, res) => {
  const list = await Auction.findAll({ order: [["createdAt", "DESC"]] });
  res.json(list);
});

// Get one
r.get("/:id", async (req, res) => {
  const auction = await Auction.findByPk(req.params.id, { include: [{ model: User, as: "seller" }] });
  if (!auction) return res.status(404).json({ error: "Not found" });
  res.json(auction);
});

// Highest (from Redis or fallback)
r.get("/:id/highest", async (req, res) => {
  const highest = await redisGetHighest(req.params.id);
  res.json(highest || null);
});

export default r;
