import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import dayjs from "dayjs";

export default function Auctions() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/api/auctions").then(({ data }) => setItems(data));
  }, []);
  return (
    <div>
      <h2>Auctions</h2>
      <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
        {items.map((a) => (
          <li key={a.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <h3><Link to={`/auction/${a.id}`}>{a.itemName}</Link></h3>
            <div>Starts at: ₹{a.startPrice} | Increment: ₹{a.bidIncrement}</div>
            <div>Status: {a.status}</div>
            <div>Goes live: {dayjs(a.goLiveAt).format("YYYY-MM-DD HH:mm")}</div>
            <div>Duration: {a.durationSec}s</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
