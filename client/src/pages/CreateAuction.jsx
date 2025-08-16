import React, { useState } from "react";
import api from "../lib/api.js";

export default function CreateAuction() {
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    startPrice: 1000,
    bidIncrement: 100,
    goLiveAt: new Date().toISOString().slice(0,16),
    durationSec: 120
  });

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form, startPrice: +form.startPrice, bidIncrement: +form.bidIncrement, durationSec: +form.durationSec };
      const { data } = await api.post("/api/auctions", payload);
      window.location.href = `/auction/${data.id}`;
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Create Auction</h2>
      <form onSubmit={submit}>
        <input placeholder="Item Name" required value={form.itemName}
          onChange={(e)=>setForm({...form, itemName: e.target.value})} style={{ display: "block", margin: "8px 0", width: "100%" }}/>
        <textarea placeholder="Description" required value={form.description}
          onChange={(e)=>setForm({...form, description: e.target.value})} style={{ display: "block", margin: "8px 0", width: "100%" }}/>
        <input type="number" placeholder="Start Price" required value={form.startPrice}
          onChange={(e)=>setForm({...form, startPrice: e.target.value})} style={{ display: "block", margin: "8px 0", width: "100%" }}/>
        <input type="number" placeholder="Bid Increment" required value={form.bidIncrement}
          onChange={(e)=>setForm({...form, bidIncrement: e.target.value})} style={{ display: "block", margin: "8px 0", width: "100%" }}/>
        <label>Go Live (local):
          <input type="datetime-local" value={form.goLiveAt}
            onChange={(e)=>setForm({...form, goLiveAt: e.target.value})} style={{ display: "block", margin: "8px 0" }}/>
        </label>
        <input type="number" placeholder="Duration (sec)" required value={form.durationSec}
          onChange={(e)=>setForm({...form, durationSec: e.target.value})} style={{ display: "block", margin: "8px 0", width: "100%" }}/>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
