import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { registerSockets } from "./sockets.js";
import { startScheduler } from "./services/scheduler.js";

const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.set("io", io);
registerSockets(io);
startScheduler(io);

server.listen(port, () => console.log(`API running on :${port}`));
