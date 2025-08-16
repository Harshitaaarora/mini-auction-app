import { redisGetHighest } from "./services/redis.js";

export function registerSockets(io) {
  io.on("connection", (socket) => {
    // user personal room for notifications
    socket.on("identify", ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    // join auction room
    socket.on("join-auction", ({ auctionId }) => {
      socket.join(`auction:${auctionId}`);
    });
  });
}

export function notifyOutbid(io, userId, payload) {
  if (!userId) return;
  io.to(`user:${userId}`).emit("notify:outbid", payload);
}

export function broadcastNewBid(io, auctionId, payload) {
  io.to(`auction:${auctionId}`).emit("bid:new", payload);
}

export function broadcastAuctionEnd(io, auctionId, payload) {
  io.to(`auction:${auctionId}`).emit("auction:ended", payload);
}
