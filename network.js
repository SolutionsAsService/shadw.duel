// SHADOW DUEL — direct WebRTC game traffic; WebSocket is discovery/signaling only.
// The creator coordinates match seeds. Both browsers validate the same actions.
(function () {
  "use strict";
  const RTC_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] };
  const net = {
    status: "idle", role: null, lobbyCode: null, peerId: null, peerName: null, localName: "Player",
    localReady: false, peerReady: false, localRematch: false, peerRematch: false,
    onStatusChange: null, onLobbyUpdate: null, onReadyChange: null, onMatchStart: null,
    onAction: null, onSurrender: null, onRematchRequest: null, onPeerDisconnected: null, onError: null,
  };
  let socket = null, pc = null, channel = null, remoteId = null;
  let iceQueue = [], signalQueue = Promise.resolve(), pingTimer = null, connectionTimer = null, disconnectTimer = null;
  let latency = null, pingAt = 0, matchId = null, matchActive = false, matchNumber = 0, receivedMatchNumber = 0;
  let sentSequence = 0, receivedSequence = 0;
  function status() {
    net.onStatusChange?.({ status: net.status, role: net.role, lobbyCode: net.lobbyCode, peerName: net.peerName, latency });
  }
  function readyChanged() { net.onReadyChange?.(); status(); }
  function error(message) { net.onError?.(message); }
  function serverSend(message) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    try { socket.send(JSON.stringify(message)); return true; } catch { return false; }
  }
  function peerSend(message) {
    if (!channel || channel.readyState !== "open") return false;
    try { channel.send(JSON.stringify(message)); return true; } catch { return false; }
  }
  function resetMatch() {
    matchId = null; matchActive = false; matchNumber = 0; receivedMatchNumber = 0;
    sentSequence = 0; receivedSequence = 0;
    net.localReady = net.peerReady = net.localRematch = net.peerRematch = false;
  }
  function closePeer() {
    clearInterval(pingTimer); clearTimeout(connectionTimer); clearTimeout(disconnectTimer);
    pingTimer = connectionTimer = disconnectTimer = null;
    const oldChannel = channel, oldPc = pc;
    channel = null; pc = null; iceQueue = []; signalQueue = Promise.resolve(); latency = null;
    if (oldChannel) { oldChannel.onclose = oldChannel.onopen = oldChannel.onmessage = oldChannel.onerror = null; try { oldChannel.close(); } catch { /* Already closed. */ } }
    if (oldPc) { oldPc.onconnectionstatechange = oldPc.onicecandidate = oldPc.ondatachannel = null; try { oldPc.close(); } catch { /* Already closed. */ } }
  }
  function peerGone(roomClosed = false) {
    const hadMatch = matchId !== null;
    closePeer(); resetMatch(); remoteId = null; net.peerName = null;
    if (roomClosed) { net.lobbyCode = null; net.role = null; }
    net.status = net.lobbyCode ? "waiting" : "idle";
    if (hadMatch) net.onPeerDisconnected?.();
    status(); net.onLobbyUpdate?.({ code: net.lobbyCode, peers: [] });
  }
  function connectionFailed(message) {
    const hadMatch = matchId !== null;
    net.leaveLobby();
    if (hadMatch) net.onPeerDisconnected?.();
    error(message);
  }
  function openLobby(role, name, request) {
    net.leaveLobby();
    net.role = role; net.localName = String(name || "Player").trim().slice(0, 24) || "Player"; net.status = "connecting";
    status();
    const ws = new WebSocket(`${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`);
    socket = ws;
    connectionTimer = setTimeout(() => { if (socket === ws && !net.lobbyCode) connectionFailed("The lobby server did not respond. Please try again."); }, 15000);
    ws.onopen = () => { if (socket === ws) serverSend({ ...request, name: net.localName }); };
    ws.onerror = () => { if (socket === ws) connectionFailed("Could not reach the lobby server."); };
    ws.onclose = () => { if (socket === ws) connectionFailed("The lobby server disconnected. Please reconnect."); };
    ws.onmessage = event => {
      if (socket !== ws || typeof event.data !== "string" || event.data.length > 65536) return;
      let message; try { message = JSON.parse(event.data); } catch { return; }
      if (!message || typeof message !== "object") return;
      handleServer(message);
    };
  }
  function handleServer(message) {
    switch (message.type) {
      case "created":
      case "joined": {
        clearTimeout(connectionTimer);
        net.lobbyCode = message.code; net.peerId = message.peerId; net.status = "waiting";
        if (message.type === "joined") {
          const host = (message.peers || []).find(peer => peer.id === message.hostId && peer.id !== net.peerId);
          if (!host) return connectionFailed("The host is no longer available.");
          remoteId = host.id; net.peerName = host.name; startPeer(true);
        }
        status(); net.onLobbyUpdate?.({ code: message.code, peers: message.peers || [] });
        break;
      }
      case "peer-joined":
        if (net.role !== "host" || remoteId || !message.peer?.id) return;
        remoteId = message.peer.id; net.peerName = message.peer.name; startPeer(false);
        status(); net.onLobbyUpdate?.({ code: net.lobbyCode, peers: [message.peer] });
        break;
      case "peer-left":
        if (message.peerId === remoteId) peerGone();
        break;
      case "room-closed": peerGone(true); break;
      case "signal": {
        if (message.from !== remoteId || !pc) return;
        const current = pc;
        signalQueue = signalQueue.then(() => handleSignal(current, message.data)).catch(() => {
          if (pc === current) connectionFailed("Connection negotiation failed. Please create or join a new lobby.");
        });
        break;
      }
      case "error": connectionFailed(message.message || "Lobby error."); break;
    }
  }
  function startPeer(initiator) {
    closePeer(); resetMatch();
    if (typeof RTCPeerConnection === "undefined") return connectionFailed("This browser does not support WebRTC.");
    const current = new RTCPeerConnection(RTC_CONFIG); pc = current;
    connectionTimer = setTimeout(() => { if (pc === current && net.status !== "connected") connectionFailed("Could not connect directly. Try another network or browser."); }, 25000);
    current.onicecandidate = event => {
      if (pc === current && event.candidate) serverSend({ type: "signal", to: remoteId, data: { kind: "ice", candidate: event.candidate } });
    };
    current.onconnectionstatechange = () => {
      if (pc !== current) return;
      if (["failed", "closed"].includes(current.connectionState)) connectionFailed("Peer connection lost.");
      else if (current.connectionState === "disconnected") {
        clearTimeout(disconnectTimer);
        disconnectTimer = setTimeout(() => { if (pc === current && current.connectionState === "disconnected") connectionFailed("Peer connection lost."); }, 8000);
      } else clearTimeout(disconnectTimer);
    };
    if (initiator) {
      wireChannel(current.createDataChannel("shadow-duel", { ordered: true }), current);
      (async () => {
        const offer = await current.createOffer();
        if (pc !== current) return;
        await current.setLocalDescription(offer);
        if (pc === current) serverSend({ type: "signal", to: remoteId, data: { kind: "sdp", description: current.localDescription } });
      })().catch(() => { if (pc === current) connectionFailed("Failed to create connection offer."); });
    } else current.ondatachannel = event => { if (pc === current && !channel) wireChannel(event.channel, current); };
  }
  async function handleSignal(current, data) {
    if (pc !== current || !data) return;
    if (data.kind === "sdp") {
      const expected = net.role === "host" ? "offer" : "answer";
      if (data.description?.type !== expected || current.remoteDescription) return;
      await current.setRemoteDescription(data.description);
      if (pc !== current) return;
      for (const candidate of iceQueue) await current.addIceCandidate(candidate);
      iceQueue = [];
      if (expected === "offer") {
        await current.setLocalDescription(await current.createAnswer());
        if (pc === current) serverSend({ type: "signal", to: remoteId, data: { kind: "sdp", description: current.localDescription } });
      }
    } else if (data.kind === "ice" && data.candidate) {
      if (current.remoteDescription) await current.addIceCandidate(data.candidate);
      else if (iceQueue.length < 100) iceQueue.push(data.candidate);
    }
  }
  function wireChannel(next, current) {
    channel = next;
    next.onopen = () => {
      if (pc !== current || channel !== next) return;
      clearTimeout(connectionTimer); net.status = "connected"; status();
      pingTimer = setInterval(() => { pingAt = Date.now(); peerSend({ type: "ping", at: pingAt }); }, 3000);
    };
    next.onclose = () => { if (channel === next) connectionFailed("Peer connection lost."); };
    next.onerror = () => { if (channel === next) connectionFailed("Peer connection failed."); };
    next.onmessage = event => {
      if (channel !== next || typeof event.data !== "string" || event.data.length > 16384) return;
      let message; try { message = JSON.parse(event.data); } catch { return; }
      if (message && typeof message === "object" && !Array.isArray(message)) handlePeer(message);
    };
  }
  function validAction(action) {
    if (!action || typeof action !== "object" || Array.isArray(action)) return false;
    switch (action.type) {
      case "play": return typeof action.cardId === "string" && action.cardId.length > 0 && action.cardId.length <= 160;
      case "attack": return Number.isInteger(action.attacker) && action.attacker >= 0 && action.attacker < 5 && (action.target === null || (Number.isInteger(action.target) && action.target >= 0 && action.target < 5));
      case "end": case "surrender": return true;
      default: return false;
    }
  }
  function beginMatch(message) {
    matchId = message.matchId; matchActive = true; sentSequence = receivedSequence = 0;
    net.localReady = net.peerReady = net.localRematch = net.peerRematch = false;
  }
  function handlePeer(message) {
    switch (message.type) {
      case "ping": if (Number.isSafeInteger(message.at)) peerSend({ type: "pong", at: message.at }); break;
      case "pong": if (message.at === pingAt) { latency = Date.now() - pingAt; status(); } break;
      case "ready":
        if (!matchId && typeof message.ready === "boolean") { net.peerReady = message.ready; readyChanged(); }
        break;
      case "match-start": {
        if (net.role !== "guest" || matchActive || message.hostSeat !== 0 || !Number.isInteger(message.seed) || message.seed < 0 || message.seed > 0xffffffff) return;
        if (!Number.isSafeInteger(message.number) || message.number !== receivedMatchNumber + 1 || message.matchId !== `${remoteId}:${message.number}`) return;
        if (matchId ? !(net.localRematch && net.peerRematch) : !net.localReady) return;
        receivedMatchNumber = message.number; beginMatch(message);
        net.onMatchStart?.({ seed: message.seed, hostSeat: 0, hostName: net.peerName, guestName: net.localName });
        break;
      }
      case "action":
        if (!matchActive || message.matchId !== matchId || !Number.isSafeInteger(message.seq) || message.seq <= receivedSequence) return;
        if (message.seq !== receivedSequence + 1 || !validAction(message.action)) return connectionFailed("Invalid peer action. The duel was stopped.");
        receivedSequence = message.seq;
        if (net.onAction?.(message.action) === false) connectionFailed("The peers disagreed on an action. Please reconnect.");
        break;
      case "surrender":
        if (message.matchId === matchId) net.onSurrender?.();
        break;
      case "rematch":
        if (!matchId || matchActive || message.matchId !== matchId || net.peerRematch) return;
        net.peerRematch = true; net.onRematchRequest?.(); readyChanged();
        break;
    }
  }
  net.createLobby = name => openLobby("host", name, { type: "create" });
  net.joinLobby = (code, name) => openLobby("guest", name, { type: "join", code: String(code || "").trim().toUpperCase() });
  net.leaveLobby = () => {
    serverSend({ type: "leave" }); closePeer(); resetMatch();
    const old = socket; socket = null;
    if (old) { old.onopen = old.onclose = old.onerror = old.onmessage = null; try { old.close(); } catch { /* Already closed. */ } }
    net.status = "idle"; net.role = null; net.lobbyCode = net.peerId = net.peerName = remoteId = null; status();
  };
  net.setReady = ready => {
    if (matchId || !net.isConnected() || !peerSend({ type: "ready", ready: !!ready })) return false;
    net.localReady = !!ready; readyChanged(); return true;
  };
  net.startMatch = (seed, hostSeat, hostName, guestName) => {
    if (net.role !== "host" || !net.isConnected() || matchActive || hostSeat !== 0 || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return false;
    if (matchId ? !(net.localRematch && net.peerRematch) : !net.peerReady) return false;
    const number = matchNumber + 1;
    const message = { type: "match-start", seed, hostSeat: 0, hostName, guestName, number, matchId: `${net.peerId}:${number}` };
    if (!peerSend(message)) return false;
    matchNumber = number; beginMatch(message); return true;
  };
  net.sendAction = action => {
    if (!matchActive || !validAction(action)) return false;
    if (!peerSend({ type: "action", matchId, seq: sentSequence + 1, action })) return false;
    sentSequence++; return true;
  };
  // Surrender itself is already sent once by the engine as a normal action.
  net.sendSurrender = () => peerSend({ type: "surrender", matchId });
  net.finishMatch = () => { matchActive = false; };
  net.sendRematch = () => {
    if (!matchId || matchActive || net.localRematch || !peerSend({ type: "rematch", matchId })) return false;
    net.localRematch = true; readyChanged(); return true;
  };
  net.isConnected = () => net.status === "connected" && channel?.readyState === "open";
  window.ShadowNet = net;
})();
