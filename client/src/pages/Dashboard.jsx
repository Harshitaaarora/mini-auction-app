import React, { useEffect, useState } from "react";
import api from "../lib/api.js";

export default function Dashboard({ user }) {
  const [myAuctions, setMyAuctions] = useState([]);
  const [counter, setCounter] = useState({});

  useEffect(() => {
    api.get("/api/auctions").then(({ data }) => {
      setMyAuctions(data.filter((a) => a.sellerId === user.id));
    });
  }, [user]);

  async function accept(id) {
    await api.post(`/api/decisions/${id}/accept`);
    alert("Accepted. Emails sent & invoice generated (see server logs).");
  }
  async function reject(id) {
    await api.post(`/api/decisions/${id}/reject`);
    alert("Rejected.");
  }
  async function sendCounter(id) {
    const amount = Number(counter[id]);
    if (!amount) return alert("Enter counter amount");
    await api.post(`/api/decisions/${id}/counter`, { amount });
    alert("Counter sent.");
  }

  return (
    <div>
      <h2>My Auctions</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {myAuctions.map((a) => (
          <li key={a.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div><b>{a.itemName}</b> — Status: {a.status}</div>
            {a.status === "ended" && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => accept(a.id)}>Accept</button>{" "}
                <button onClick={() => reject(a.id)}>Reject</button>{" "}
                <input type="number" placeholder="Counter amount"
                  value={counter[a.id] || ""}
                  onChange={(e) => setCounter({ ...counter, [a.id]: e.target.value })}
                />
                <button onClick={() => sendCounter(a.id)}>Send Counter</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
