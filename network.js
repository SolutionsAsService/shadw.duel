// ============================================================
// SHADOW DUEL — NETWORK LAYER
// ============================================================
//
// Browser peer-to-peer networking for Shadow Duel.
//
// Architecture:
//
//   Player A Browser                Player B Browser
//        │                               │
//        │   WebSocket (signaling only)  │
//        └──────────► Server ◄───────────┘
//        │                               │
//        │   WebRTC DataChannel (game)   │
//        └───────────────────────────────┘
//
// The WebSocket server is used ONLY for:
//   - creating / joining lobbies
//   - exchanging WebRTC offers, answers and ICE candidates
//
// Once the DataChannel opens, every game message travels
// directly browser-to-browser. The server never sees game
// state and cannot influence the duel.
//
// The host peer (lobby creator) is the match coordinator:
// it picks the deterministic match seed and relays/remembers
// rematch requests. All actual game rules still run locally
// on each browser through the same engine.
//
// ============================================================

(function () {

  const RTC_CONFIG = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const net = {
    // "idle" | "connecting" | "waiting" | "connected"
    status: "idle",

    // "host" | "guest" | null
    role: null,

    lobbyCode: null,
    peerId: null,
    peerName: null,
    localName: "Player",

    // Callbacks wired up by game.js.
    onStatusChange: null,
    onLobbyUpdate: null,
    onMatchStart: null,
    onAction: null,
    onSurrender: null,
    onRematchRequest: null,
    onPeerDisconnected: null,
    onError: null,
  };

  let socket = null;
  let peerConnection = null;
  let dataChannel = null;
  let remotePeerId = null;
  let intentionallyClosed = false;

  // Latency monitoring.
  let latencyMs = null;
  let pingTimer = null;
  let lastPingSentAt = 0;


  // ==========================================================
  // HELPERS
  // ==========================================================

  function emitStatus() {
    if (typeof net.onStatusChange === "function") {
      net.onStatusChange({
        status: net.status,
        role: net.role,
        lobbyCode: net.lobbyCode,
        peerName: net.peerName,
        latency: latencyMs,
      });
    }
  }

  function emitError(message) {
    if (typeof net.onError === "function") {
      net.onError(message);
    }
  }

  function wsUrl() {
    const protocol =
      window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${window.location.host}/ws`;
  }


  // ==========================================================
  // WEBSOCKET (LOBBY + SIGNALING)
  // ==========================================================

  function ensureSocket(onOpen) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      onOpen();
      return;
    }

    intentionallyClosed = false;

    socket = new WebSocket(wsUrl());

    socket.onopen = () => {
      onOpen();
    };

    socket.onerror = () => {
      emitError("Could not reach the lobby server.");
      net.status = "idle";
      emitStatus();
    };

    socket.onclose = () => {
      if (intentionallyClosed) return;

      handlePeerGone();
    };

    socket.onmessage = (event) => {
      let message;

      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      handleServerMessage(message);
    };
  }

  function sendToServer(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  function handleServerMessage(message) {
    switch (message.type) {
      case "created":
        net.lobbyCode = message.code;
        net.peerId = message.peerId;
        net.status = "waiting";
        emitStatus();

        if (typeof net.onLobbyUpdate === "function") {
          net.onLobbyUpdate({ code: message.code, peers: [] });
        }
        break;

      case "joined":
        net.lobbyCode = message.code;
        net.peerId = message.peerId;
        net.status = "waiting";
        emitStatus();

        if (typeof net.onLobbyUpdate === "function") {
          net.onLobbyUpdate({ code: message.code, peers: message.peers });
        }

        // The guest initiates the WebRTC offer to the host.
        if (net.role === "guest") {
          const host = (message.peers || []).find(
            (peer) => peer.id !== net.peerId
          );

          if (host) {
            remotePeerId = host.id;
            net.peerName = host.name;
            startPeerConnection(true);
          }
        }
        break;

      case "peer-joined":
        // The host waits for the guest's offer.
        if (net.role === "host") {
          remotePeerId = message.peer.id;
          net.peerName = message.peer.name;
          startPeerConnection(false);
        }

        if (typeof net.onLobbyUpdate === "function") {
          net.onLobbyUpdate({ code: net.lobbyCode, peers: [message.peer] });
        }
        break;

      case "peer-left":
        handlePeerGone();
        break;

      case "signal":
        if (message.from !== remotePeerId) {
          remotePeerId = message.from;
        }
        handleSignal(message.data);
        break;

      case "error":
        emitError(message.message || "Lobby error.");
        net.status = "idle";
        net.lobbyCode = null;
        emitStatus();
        break;
    }
  }

  function handlePeerGone() {
    const wasConnected = net.status === "connected";

    closePeerConnection();

    net.peerName = null;
    remotePeerId = null;

    if (wasConnected && typeof net.onPeerDisconnected === "function") {
      net.onPeerDisconnected();
    }

    if (net.lobbyCode) {
      net.status = "waiting";
    } else {
      net.status = "idle";
    }

    emitStatus();
  }


  // ==========================================================
  // WEBRTC PEER CONNECTION
  // ==========================================================

  function startPeerConnection(isInitiator) {
    closePeerConnection();

    peerConnection = new RTCPeerConnection(RTC_CONFIG);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendToServer({
          type: "signal",
          to: remotePeerId,
          data: { kind: "ice", candidate: event.candidate },
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection
        ? peerConnection.connectionState
        : "closed";

      if (state === "failed" || state === "closed") {
        handlePeerGone();
      }
    };

    if (isInitiator) {
      dataChannel = peerConnection.createDataChannel("shadow-duel", {
        ordered: true,
      });

      wireDataChannel(dataChannel);

      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .then(() => {
          sendToServer({
            type: "signal",
            to: remotePeerId,
            data: { kind: "sdp", description: peerConnection.localDescription },
          });
        })
        .catch(() => emitError("Failed to create connection offer."));
    } else {
      peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        wireDataChannel(dataChannel);
      };
    }
  }

  async function handleSignal(data) {
    if (!data || !peerConnection) return;

    try {
      if (data.kind === "sdp") {
        await peerConnection.setRemoteDescription(data.description);

        if (data.description.type === "offer") {
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          sendToServer({
            type: "signal",
            to: remotePeerId,
            data: { kind: "sdp", description: peerConnection.localDescription },
          });
        }
      } else if (data.kind === "ice") {
        await peerConnection.addIceCandidate(data.candidate);
      }
    } catch {
      emitError("Connection negotiation failed.");
    }
  }

  function wireDataChannel(channel) {
    channel.onopen = () => {
      net.status = "connected";
      emitStatus();
      startPing();
    };

    channel.onclose = () => {
      handlePeerGone();
    };

    channel.onmessage = (event) => {
      let message;

      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      handlePeerMessage(message);
    };
  }

  function closePeerConnection() {
    stopPing();

    if (dataChannel) {
      try { dataChannel.close(); } catch { /* noop */ }
      dataChannel = null;
    }

    if (peerConnection) {
      try { peerConnection.close(); } catch { /* noop */ }
      peerConnection = null;
    }

    latencyMs = null;
  }


  // ==========================================================
  // LATENCY MONITORING
  // ==========================================================

  function startPing() {
    stopPing();

    pingTimer = setInterval(() => {
      lastPingSentAt = Date.now();
      sendToPeer({ type: "ping", at: lastPingSentAt });
    }, 3000);
  }

  function stopPing() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  }


  // ==========================================================
  // PEER MESSAGES (GAME TRAFFIC — P2P ONLY)
  // ==========================================================

  function sendToPeer(message) {
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(JSON.stringify(message));
      return true;
    }

    return false;
  }

  function handlePeerMessage(message) {
    switch (message.type) {
      case "ping":
        sendToPeer({ type: "pong", at: message.at });
        break;

      case "pong":
        if (message.at === lastPingSentAt) {
          latencyMs = Date.now() - lastPingSentAt;
          emitStatus();
        }
        break;

      case "match-start":
        if (typeof net.onMatchStart === "function") {
          net.onMatchStart({
            seed: message.seed,
            hostSeat: message.hostSeat,
            hostName: message.hostName,
            guestName: message.guestName,
          });
        }
        break;

      case "action":
        if (typeof net.onAction === "function") {
          net.onAction(message.action);
        }
        break;

      case "surrender":
        if (typeof net.onSurrender === "function") {
          net.onSurrender();
        }
        break;

      case "rematch":
        if (typeof net.onRematchRequest === "function") {
          net.onRematchRequest();
        }
        break;
    }
  }


  // ==========================================================
  // PUBLIC API
  // ==========================================================

  net.createLobby = function (name) {
    net.role = "host";
    net.localName = name || "Player";
    net.status = "connecting";
    emitStatus();

    ensureSocket(() => {
      sendToServer({ type: "create", name: net.localName });
    });
  };

  net.joinLobby = function (code, name) {
    net.role = "guest";
    net.localName = name || "Player";
    net.status = "connecting";
    emitStatus();

    ensureSocket(() => {
      sendToServer({
        type: "join",
        code: String(code || "").trim().toUpperCase(),
        name: net.localName,
      });
    });
  };

  net.leaveLobby = function () {
    intentionallyClosed = true;

    sendToServer({ type: "leave" });
    closePeerConnection();

    if (socket) {
      try { socket.close(); } catch { /* noop */ }
      socket = null;
    }

    net.status = "idle";
    net.role = null;
    net.lobbyCode = null;
    net.peerId = null;
    net.peerName = null;
    remotePeerId = null;

    emitStatus();
  };

  net.startMatch = function (seed, hostSeat, hostName, guestName) {
    sendToPeer({
      type: "match-start",
      seed,
      hostSeat,
      hostName,
      guestName,
    });
  };

  net.sendAction = function (action) {
    return sendToPeer({ type: "action", action });
  };

  net.sendSurrender = function () {
    // Send the surrender as a game action so the peer's engine
    // applies it deterministically, plus a notification for
    // any UI that listens for it.
    const delivered = sendToPeer({
      type: "action",
      action: { type: "surrender" },
    });

    sendToPeer({ type: "surrender" });

    return delivered;
  };

  net.sendRematch = function () {
    return sendToPeer({ type: "rematch" });
  };

  net.isConnected = function () {
    return net.status === "connected";
  };

  window.ShadowNet = net;

})();
