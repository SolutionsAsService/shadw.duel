// ============================================================
// SHADOW DUEL — SERVER
// ============================================================
//
// The server is intentionally NOT the authority for the duel.
//
// It has exactly two jobs:
//
//   1. Serve the static browser game.
//   2. Run a lightweight lobby / signaling service so two
//      browsers can discover each other and open a direct
//      WebRTC peer-to-peer connection.
//
// Once the peers are connected, all game traffic flows
// browser-to-browser over a WebRTC DataChannel. Game state
// never lives on this server.
//
// ============================================================

const express = require("express");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");

const app = express();

const PORT = process.env.PORT || 3000;

// Serve the Shadow Duel application from the project root.
app.use(express.static(__dirname));

// Fallback for browser navigation (e.g. shared lobby links
// such as /?lobby=ABCD are handled client-side).
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const server = http.createServer(app);


// ============================================================
// LOBBY / SIGNALING SERVICE
// ============================================================
//
// Protocol (JSON messages over WebSocket):
//
// Client -> Server:
//   { type: "create", name }              -> create a lobby
//   { type: "join", code, name }          -> join a lobby
//   { type: "signal", to, data }          -> relay WebRTC signal to peer
//   { type: "leave" }                     -> leave the current lobby
//
// Server -> Client:
//   { type: "created", code, peerId }
//   { type: "joined", code, peerId, peers: [{ id, name }] }
//   { type: "peer-joined", peer: { id, name } }
//   { type: "peer-left", peerId }
//   { type: "signal", from, data }
//   { type: "error", message }
//
// A lobby holds at most two peers (1v1 duel). The first peer
// to create the lobby becomes the "host" for match purposes.
//
// ============================================================

const LOBBY_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LOBBY_CODE_LENGTH = 4;
const MAX_MESSAGE_BYTES = 64 * 1024;

/** Map<lobbyCode, { code, peers: Map<peerId, { id, name, socket }> }> */
const lobbies = new Map();

function generateLobbyCode() {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    const bytes = crypto.randomBytes(LOBBY_CODE_LENGTH);

    for (let i = 0; i < LOBBY_CODE_LENGTH; i++) {
      code += LOBBY_CODE_ALPHABET[bytes[i] % LOBBY_CODE_ALPHABET.length];
    }

    if (!lobbies.has(code)) return code;
  }

  return null;
}

function send(socket, message) {
  if (socket.readyState !== socket.OPEN) return;

  try {
    socket.send(JSON.stringify(message));
  } catch {
    // Ignore send failures for dead sockets.
  }
}

function broadcast(lobby, message, exceptPeerId = null) {
  for (const peer of lobby.peers.values()) {
    if (peer.id === exceptPeerId) continue;
    send(peer.socket, message);
  }
}

function lobbyPeerList(lobby) {
  return [...lobby.peers.values()].map((peer) => ({
    id: peer.id,
    name: peer.name,
  }));
}

function removePeerFromLobby(client) {
  if (!client.lobbyCode) return;

  const lobby = lobbies.get(client.lobbyCode);

  if (lobby) {
    lobby.peers.delete(client.peerId);

    broadcast(lobby, { type: "peer-left", peerId: client.peerId });

    if (lobby.peers.size === 0) {
      lobbies.delete(client.lobbyCode);
    }
  }

  client.lobbyCode = null;
}

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  const client = {
    peerId: crypto.randomBytes(8).toString("hex"),
    name: "Player",
    lobbyCode: null,
  };

  socket.on("message", (raw) => {
    if (raw.length > MAX_MESSAGE_BYTES) return;

    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (!message || typeof message.type !== "string") return;

    switch (message.type) {
      case "create": {
        removePeerFromLobby(client);

        const code = generateLobbyCode();

        if (!code) {
          send(socket, { type: "error", message: "Could not create lobby." });
          return;
        }

        client.name = String(message.name || "Player").slice(0, 24) || "Player";

        const lobby = { code, peers: new Map() };
        lobby.peers.set(client.peerId, {
          id: client.peerId,
          name: client.name,
          socket,
        });

        lobbies.set(code, lobby);
        client.lobbyCode = code;

        send(socket, { type: "created", code, peerId: client.peerId });
        break;
      }

      case "join": {
        const code = String(message.code || "")
          .trim()
          .toUpperCase();

        const lobby = lobbies.get(code);

        if (!lobby) {
          send(socket, { type: "error", message: "Lobby not found." });
          return;
        }

        if (lobby.peers.size >= 2 && !lobby.peers.has(client.peerId)) {
          send(socket, { type: "error", message: "Lobby is full." });
          return;
        }

        client.name = String(message.name || "Player").slice(0, 24) || "Player";

        lobby.peers.set(client.peerId, {
          id: client.peerId,
          name: client.name,
          socket,
        });

        client.lobbyCode = code;

        send(socket, {
          type: "joined",
          code,
          peerId: client.peerId,
          peers: lobbyPeerList(lobby),
        });

        broadcast(
          lobby,
          { type: "peer-joined", peer: { id: client.peerId, name: client.name } },
          client.peerId
        );
        break;
      }

      case "signal": {
        if (!client.lobbyCode) return;

        const lobby = lobbies.get(client.lobbyCode);
        if (!lobby) return;

        const to = typeof message.to === "string" ? message.to : null;

        if (to) {
          const target = lobby.peers.get(to);
          if (target) {
            send(target.socket, {
              type: "signal",
              from: client.peerId,
              data: message.data,
            });
          }
          return;
        }

        broadcast(
          lobby,
          { type: "signal", from: client.peerId, data: message.data },
          client.peerId
        );
        break;
      }

      case "leave": {
        removePeerFromLobby(client);
        break;
      }
    }
  });

  socket.on("close", () => {
    removePeerFromLobby(client);
  });
});


// ============================================================
// START
// ============================================================

server.listen(PORT, () => {
  console.log(`Shadow Duel is running on port ${PORT}`);
  console.log(`Lobby / signaling service available at ws://localhost:${PORT}/ws`);
});
