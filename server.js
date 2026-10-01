// SHADOW DUEL — static application, lobby discovery and WebRTC signaling.
// Game traffic remains browser-to-browser; the server never owns duel state.
const express = require("express");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");

const LOBBY_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const MAX_MESSAGE_BYTES = 64 * 1024;
const PUBLIC_FILES = new Set([
  "index.html", "style.css", "cards.js", "card-art.js", "network.js",
  "game.js", "lobby.js", "duel-ui.js", "duel-ui.css",
]);

function createDuelServer() {
  const app = express();
  app.disable("x-powered-by");
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
  // Never expose the project root: source, tests, dependencies and Git stay private.
  app.use("/assets", express.static(path.join(__dirname, "assets"), { dotfiles: "deny", index: false }));
  app.get("/:file", (req, res, next) => {
    if (!PUBLIC_FILES.has(req.params.file)) return next();
    res.sendFile(path.join(__dirname, req.params.file));
  });
  app.use((_req, res) => res.status(404).type("text").send("Not found"));
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws", maxPayload: MAX_MESSAGE_BYTES });
  const lobbies = new Map();
  const clients = new Map();

  function send(socket, message) {
    if (socket.readyState !== WebSocket.OPEN) return;
    try { socket.send(JSON.stringify(message)); } catch { /* Closing socket. */ }
  }
  function peers(lobby) {
    return [...lobby.peers.values()].map(({ peerId: id, name }) => ({ id, name }));
  }
  function removePeer(client) {
    const lobby = lobbies.get(client.lobbyCode);
    client.lobbyCode = null;
    if (!lobby || !lobby.peers.delete(client.peerId)) return;
    if (lobby.hostId === client.peerId) {
      // A guest cannot silently become host: seat assignment belongs to the creator.
      for (const other of lobby.peers.values()) {
        other.lobbyCode = null;
        send(other.socket, { type: "room-closed", message: "The host left the lobby." });
      }
      lobbies.delete(lobby.code);
    } else {
      for (const other of lobby.peers.values()) send(other.socket, { type: "peer-left", peerId: client.peerId });
      if (!lobby.peers.size) lobbies.delete(lobby.code);
    }
  }
  function code() {
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = Array.from({ length: 4 }, () => LOBBY_CODE_ALPHABET[crypto.randomInt(LOBBY_CODE_ALPHABET.length)]).join("");
      if (!lobbies.has(result)) return result;
    }
    return null;
  }
  const name = value => typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 24) || "Player" : "Player";

  wss.on("connection", socket => {
    const client = { peerId: crypto.randomBytes(8).toString("hex"), lobbyCode: null, name: "Player", socket };
    clients.set(socket, client);
    socket.on("error", () => {}); // Errors also lead to close and membership cleanup.
    socket.on("message", (raw, binary) => {
      if (binary || raw.length > MAX_MESSAGE_BYTES) return;
      let message;
      try { message = JSON.parse(raw.toString()); } catch { return; }
      if (!message || typeof message !== "object" || Array.isArray(message)) return;
      switch (message.type) {
        case "create": {
          const nextCode = code();
          if (!nextCode) return send(socket, { type: "error", message: "Could not create lobby." });
          removePeer(client);
          client.name = name(message.name);
          client.lobbyCode = nextCode;
          const lobby = { code: nextCode, hostId: client.peerId, peers: new Map([[client.peerId, client]]) };
          lobbies.set(nextCode, lobby);
          send(socket, { type: "created", code: nextCode, peerId: client.peerId, hostId: client.peerId });
          break;
        }
        case "join": {
          const requested = typeof message.code === "string" ? message.code.trim().toUpperCase() : "";
          const lobby = lobbies.get(requested);
          if (!lobby) return send(socket, { type: "error", message: "Lobby not found." });
          if (lobby.peers.has(client.peerId)) return send(socket, { type: "error", message: "You are already in this lobby." });
          if (lobby.peers.size >= 2) return send(socket, { type: "error", message: "Lobby is full." });
          // Validate the destination first, then atomically leave the old room.
          removePeer(client);
          client.name = name(message.name);
          client.lobbyCode = requested;
          lobby.peers.set(client.peerId, client);
          send(socket, { type: "joined", code: requested, peerId: client.peerId, hostId: lobby.hostId, peers: peers(lobby) });
          for (const other of lobby.peers.values()) {
            if (other !== client) send(other.socket, { type: "peer-joined", peer: { id: client.peerId, name: client.name } });
          }
          break;
        }
        case "signal": {
          const lobby = lobbies.get(client.lobbyCode);
          if (!lobby || !lobby.peers.has(client.peerId) || !message.data || typeof message.data !== "object") return;
          if (!["sdp", "ice"].includes(message.data.kind)) return;
          const targets = typeof message.to === "string" ? [lobby.peers.get(message.to)] : [...lobby.peers.values()];
          for (const target of targets) {
            if (target && target !== client) send(target.socket, { type: "signal", from: client.peerId, data: message.data });
          }
          break;
        }
        case "leave":
          removePeer(client);
          send(socket, { type: "left" });
          break;
      }
    });
    socket.on("close", () => { removePeer(client); clients.delete(socket); });
  });

  async function close() {
    for (const socket of wss.clients) socket.terminate();
    await new Promise(resolve => wss.close(resolve));
    if (server.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
  return { app, server, wss, close };
}

if (require.main === module) {
  const instance = createDuelServer();
  const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);
  // Local development is loopback-only. Set HOST=0.0.0.0 explicitly for deployment.
  const host = process.env.HOST || "127.0.0.1";
  instance.server.listen(port, host, () => console.log(`Shadow Duel: http://${host}:${instance.server.address().port}`));
  instance.server.on("error", error => { console.error(error.message); process.exitCode = 1; });
  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    instance.close().catch(error => { console.error(error.message); process.exitCode = 1; });
  });
}
module.exports = { createDuelServer };
