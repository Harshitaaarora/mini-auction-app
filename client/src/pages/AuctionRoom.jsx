import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api.js";
import dayjs from "dayjs";
import { SocketContext } from "../App.jsx";

export default function AuctionRoom({ user }) {
  const { id } = useParams();
  const socket = useContext(SocketContext);
  const [auction, setAuction] = useState(null);
  const [highest, setHighest] = useState(null);
  const [amount, setAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    api.get(`/api/auctions/${id}`).then(({ data }) => setAuction(data));
    api.get(`/api/auctions/${id}/highest`).then(({ data }) => setHighest(data));
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-auction", { auctionId: id });
    socket.on("bid:new", (payload) => {
      setHighest({ amount: payload.amount, bidderId: payload.bidderId });
    });
    socket.on("auction:ended", ({ highest }) => {
      alert("Auction ended. Highest: " + (highest?.amount ?? "No bids"));
    });
    socket.on("notify:outbid", ({ auctionId, newAmount }) => {
      if (String(auctionId) === String(id)) {
        console.log("You were outbid. New highest:", newAmount);
      }
    });
    return () => {
      socket.off("bid:new");
      socket.off("auction:ended");
      socket.off("notify:outbid");
    };
  }, [socket, id]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!auction) return;
      const start = dayjs(auction.goLiveAt);
      const end = start.add(auction.durationSec, "second");
      const now = dayjs();
      if (now.isBefore(start)) {
        setTimeLeft(`Starts in ${start.diff(now, "second")}s`);
      } else if (now.isAfter(end)) {
        setTimeLeft("Ended");
      } else {
        setTimeLeft(`Time left ${end.diff(now, "second")}s`);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [auction]);

  const minNext = useMemo(() => {
    if (!auction) return 0;
    const base = highest?.amount ?? auction.startPrice;
    return base + auction.bidIncrement;
  }, [auction, highest]);

  async function placeBid() {
    try {
      const payload = { amount: Number(amount || minNext) };
      const { data } = await api.post(`/api/bids/${id}`, payload);
      setAmount("");
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  if (!auction) return <p>Loading...</p>;

  const liveState = timeLeft?.startsWith("Time left");

  return (
    <div>
      <h2>{auction.itemName}</h2>
      <p>{auction.description}</p>
      <p>Highest: ₹{highest?.amount ?? auction.startPrice}</p>
      <p>Increment: ₹{auction.bidIncrement}</p>
      <p>{timeLeft}</p>
      {user ? (
        <div>
          <input type="number" placeholder={`Min ${minNext}`} value={amount}
            onChange={(e) => setAmount(e.target.value)} disabled={!liveState} />
          <button onClick={placeBid} disabled={!liveState}>Place Bid</button>
        </div>
      ) : (
        <p>Please login to bid.</p>
      )}
    </div>
  );
}
