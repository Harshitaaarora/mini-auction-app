import { Router } from "express";
import { Auction, Bid } from "../db/index.js";
import { auth } from "../middleware/auth.js";
import { redisGetHighest, highestBidKey, redisSet } from "../services/redis.js";
import { acquireLock, releaseLock } from "../services/lock.js";
import { broadcastNewBid, notifyOutbid } from "../sockets.js";

const r = Router();

r.post("/:auctionId", auth, async (req, res) => {
  const { auctionId } = req.params;
  const { amount } = req.body;

  const lockToken = await acquireLock(auctionId, 3000);
  if (!lockToken) return res.status(429).json({ error: "Busy, retry" });

  try {
    const auction = await Auction.findByPk(auctionId);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    const now = new Date();
    const start = new Date(auction.goLiveAt);
    const end = new Date(start.getTime() + auction.durationSec * 1000);

    if (!(now >= start && now <= end) || auction.status !== "live") {
      return res.status(400).json({ error: "Auction not active" });
    }

    // current highest or startPrice
    const current = (await redisGetHighest(auctionId)) || { amount: auction.startPrice, bidderId: null };
    const minValid = current.amount + auction.bidIncrement;
    if (amount < minValid) {
      return res.status(400).json({ error: `Bid must be ≥ ${minValid}` });
    }

    // Persist
    const bid = await Bid.create({ auctionId, bidderId: req.user.id, amount });

    // Update highest
    await redisSet(highestBidKey(auctionId), { amount, bidderId: req.user.id });

    // Notify previous highest bidder
    if (current.bidderId && current.bidderId !== req.user.id) {
      notifyOutbid(req.app.get("io"), current.bidderId, { auctionId, newAmount: amount });
    }

    // Broadcast to room
    broadcastNewBid(req.app.get("io"), auctionId, { amount, bidderId: req.user.id, bidId: bid.id });

    res.json(bid);
  } catch (e) {
    res.status(400).json({ error: e.message });
  } finally {
    await releaseLock(auctionId, lockToken);
  }
});

export default r;
