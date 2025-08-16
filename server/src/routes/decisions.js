import { Router } from "express";
import { Auction, Bid, CounterOffer, User } from "../db/index.js";
import { auth } from "../middleware/auth.js";
import { redisGetHighest } from "../services/redis.js";
import { sendMail } from "../services/mailer.js";
import { generateInvoicePDF } from "../services/invoice.js";
import fs from "fs";

const r = Router();

// Seller: Accept
r.post("/:auctionId/accept", auth, async (req, res) => {
  const auction = await Auction.findByPk(req.params.auctionId);
  if (!auction) return res.status(404).json({ error: "Not found" });
  if (auction.sellerId !== req.user.id) return res.status(403).json({ error: "Not your auction" });
  if (auction.status !== "ended") return res.status(400).json({ error: "Auction not ended" });

  const highest = await redisGetHighest(auction.id);
  if (!highest?.bidderId) return res.status(400).json({ error: "No highest bid" });

  const buyer = await User.findByPk(highest.bidderId);
  const seller = await User.findByPk(auction.sellerId);

  const winningBid = await Bid.findOne({
    where: { auctionId: auction.id, amount: highest.amount },
    order: [["createdAt", "DESC"]]
  });
  auction.winnerBidId = winningBid?.id ?? null;
  auction.status = "closed";
  await auction.save();

  const html = (name, role) => `
    <p>Hi ${name},</p>
    <p>The auction <b>${auction.itemName}</b> has been completed successfully.</p>
    <p>${role === "buyer" ? "You are the winner." : "Your item has a confirmed buyer."}</p>
    <p>Final Amount: ₹${highest.amount}</p>`;

  await sendMail({ to: buyer.email, subject: "Auction Confirmation", html: html(buyer.name, "buyer") });
  await sendMail({ to: seller.email, subject: "Auction Confirmation", html: html(seller.name, "seller") });

  const pdfPath = await generateInvoicePDF({ auction, buyer, seller, amount: highest.amount });
  console.log("Invoice generated at:", pdfPath);
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

  res.json({ ok: true });
});

// Seller: Reject
r.post("/:auctionId/reject", auth, async (req, res) => {
  const auction = await Auction.findByPk(req.params.auctionId);
  if (!auction) return res.status(404).json({ error: "Not found" });
  if (auction.sellerId !== req.user.id) return res.status(403).json({ error: "Not your auction" });
  if (auction.status !== "ended") return res.status(400).json({ error: "Auction not ended" });

  auction.status = "closed";
  auction.winnerBidId = null;
  await auction.save();
  res.json({ ok: true });
});

// Seller: Counter
r.post("/:auctionId/counter", auth, async (req, res) => {
  const { amount } = req.body;
  const auction = await Auction.findByPk(req.params.auctionId);
  if (!auction) return res.status(404).json({ error: "Not found" });
  if (auction.sellerId !== req.user.id) return res.status(403).json({ error: "Not your auction" });
  if (auction.status !== "ended") return res.status(400).json({ error: "Auction not ended" });

  const highest = await redisGetHighest(auction.id);
  if (!highest?.bidderId) return res.status(400).json({ error: "No highest bid" });

  const co = await CounterOffer.create({
    auctionId: auction.id, sellerId: auction.sellerId, buyerId: highest.bidderId, amount, status: "pending"
  });
  res.json(co);
});

// Buyer: Accept/Reject counter
r.post("/:auctionId/counter/:counterId/accept", auth, async (req, res) => {
  const co = await CounterOffer.findByPk(req.params.counterId);
  if (!co || co.auctionId != req.params.auctionId) return res.status(404).json({ error: "Not found" });
  if (co.buyerId !== req.user.id) return res.status(403).json({ error: "Not your counter-offer" });
  if (co.status !== "pending") return res.status(400).json({ error: "Not pending" });

  const auction = await Auction.findByPk(co.auctionId);
  const buyer = await User.findByPk(co.buyerId);
  const seller = await User.findByPk(co.sellerId);

  co.status = "accepted";
  await co.save();
  auction.status = "closed";
  await auction.save();

  const html = (name, role) => `
    <p>Hi ${name},</p>
    <p>The auction <b>${auction.itemName}</b> completed via accepted counter-offer.</p>
    <p>${role === "buyer" ? "You accepted the counter-offer." : "Your counter-offer was accepted."}</p>
    <p>Final Amount: ₹${co.amount}</p>`;

  await sendMail({ to: buyer.email, subject: "Auction Confirmation (Counter-Offer)", html: html(buyer.name, "buyer") });
  await sendMail({ to: seller.email, subject: "Auction Confirmation (Counter-Offer)", html: html(seller.name, "seller") });

  res.json({ ok: true });
});

r.post("/:auctionId/counter/:counterId/reject", auth, async (req, res) => {
  const co = await CounterOffer.findByPk(req.params.counterId);
  if (!co || co.auctionId != req.params.auctionId) return res.status(404).json({ error: "Not found" });
  if (co.buyerId !== req.user.id) return res.status(403).json({ error: "Not your counter-offer" });
  if (co.status !== "pending") return res.status(400).json({ error: "Not pending" });

  co.status = "rejected";
  await co.save();

  const auction = await Auction.findByPk(co.auctionId);
  auction.status = "closed";
  await auction.save();

  res.json({ ok: true });
});

export default r;
