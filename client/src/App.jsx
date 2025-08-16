import React, { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import Auctions from "./pages/Auctions.jsx";
import CreateAuction from "./pages/CreateAuction.jsx";
import AuctionRoom from "./pages/AuctionRoom.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import api, { setToken, getToken, meFromToken } from "./lib/api.js";
import { io } from "socket.io-client";

export const SocketContext = React.createContext(null);

export default function App() {
  const [user, setUser] = useState(meFromToken());
  const [socket, setSocket] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const t = getToken();
    if (t) setToken(t);
    const s = io("/", { autoConnect: true });
    setSocket(s);
    if (user) s.emit("identify", { userId: user.id });
    return () => s.close();
  }, []);

  useEffect(() => {
    if (socket && user) socket.emit("identify", { userId: user.id });
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      <header style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/">Auctions</Link>
        {user && <Link to="/create">Create</Link>}
        {user && <Link to="/dashboard">Dashboard</Link>}
        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>Hi, {user.name}</span>
              <button onClick={() => { localStorage.removeItem("token"); setUser(null); nav("/"); }}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Auctions />} />
          <Route path="/create" element={<RequireAuth user={user}><CreateAuction /></RequireAuth>} />
          <Route path="/auction/:id" element={<AuctionRoom user={user} />} />
          <Route path="/dashboard" element={<RequireAuth user={user}><Dashboard user={user} /></RequireAuth>} />
          <Route path="/login" element={<Login onAuth={setUser} />} />
        </Routes>
      </main>
    </SocketContext.Provider>
  );
}

function RequireAuth({ user, children }) {
  if (!user) return <p>Please <a href="/login">login</a>.</p>;
  return children;
}
