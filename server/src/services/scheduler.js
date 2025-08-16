import cron from "node-cron";
import { Auction, Bid, User } from "../db/index.js";
import { redisGetHighest } from "./redis.js";
import { broadcastAuctionEnd } from "../sockets.js";

export function startScheduler(io) {
  // Every 10s: start scheduled, end expired
  cron.schedule("*/10 * * * * *", async () => {
    const now = new Date();
    const scheduled = await Auction.findAll({ where: { status: "scheduled" } });
    for (const a of scheduled) {
      if (now >= new Date(a.goLiveAt)) {
        a.status = "live";
        await a.save();
      }
    }
    const live = await Auction.findAll({ where: { status: "live" } });
    for (const a of live) {
      const end = new Date(new Date(a.goLiveAt).getTime() + a.durationSec * 1000);
      if (now >= end) {
        a.status = "ended";
        await a.save();
        const highest = await redisGetHighest(a.id); // { amount, bidderId }
        broadcastAuctionEnd(io, a.id, { highest });
      }
    }
  });
}
