// ============================================================
// SHADOW DUEL — LOBBY
// ============================================================
//
// Screen flow and matchmaking for Shadow Duel:
//
//   Menu ──► Local duel (pass-and-play on one device)
//     │
//     ├──► Create lobby ──► share 4-letter code / invite link
//     │                        │
//     └──► Join lobby ◄────────┘
//              │
//              ▼
//        WebRTC P2P connects (network.js / ShadowNet)
//              │
//              ▼
//        Host starts the duel with a shared seed
//              │
//              ▼
//        game.js runs identically on both browsers
//
// This file never touches game rules. It only:
//   - collects player names
//   - creates / joins lobbies through ShadowNet
//   - starts matches through ShadowDuelGame
//   - relays actions between the two
//   - keeps the top-bar network panel up to date
//
// ============================================================

(function () {
"use strict";


// ============================================================
// LOBBY STATE
// ============================================================

const lobby = {

  // "menu" | "creating" | "joining" | "waiting" | "playing"
  screen: "menu",

  playerName: "",

  opponentName: null,

  // ShadowNet role for the current match: "host" | "guest".
  role: null,

  // Set when the guest accepts a rematch and is waiting for
  // the host to launch the next duel.
  awaitingRematch: false,

};


const NAME_STORAGE_KEY = "shadowduel.name";

const MAX_NAME_LENGTH = 24;


// Presence marker: game.js checks this before auto-starting a
// local duel. ShadowLobbyUI.updateTurnChrome is assigned once
// updateTurnChrome is defined so game renders can refresh the
// lobby chrome after every state change.
window.ShadowLobbyUI = {
  updateTurnChrome: null,
};


// ============================================================
// DOM HELPERS
// ============================================================

function el(id) {

  return document.getElementById(id);

}


function show(element) {

  if (element) element.classList.remove("hidden");

}


function hide(element) {

  if (element) element.classList.add("hidden");

}


function showScreen(name) {

  lobby.screen = name;

  [
    "lobby-menu",
    "lobby-create",
    "lobby-join",
    "lobby-waiting",
  ].forEach((screenId) => {

    const screen = el(screenId);

    if (!screen) return;

    if (screenId === `lobby-${name}`) {
      show(screen);
    } else {
      hide(screen);
    }

  });

  show(el("lobby-overlay"));

}


function sanitizeName(value) {

  const name = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);

  return name || "Player";
}


function randomName() {

  const number = 100 + Math.floor(Math.random() * 900);

  return `Duelist-${number}`;
}


function loadSavedName() {

  try {

    return window.localStorage.getItem(NAME_STORAGE_KEY) || "";

  } catch {

    return "";

  }

}


function saveName(name) {

  try {

    window.localStorage.setItem(NAME_STORAGE_KEY, name);

  } catch {

    // Storage unavailable — the name just won't persist.

  }

}


// ============================================================
// STATUS / NETWORK PANEL
// ============================================================

function setConnection(state, text) {

  const pill = el("connection-status");
  const label = el("connection-text");

  if (pill) {
    pill.dataset.state = state;
  }

  if (label) {
    label.textContent = text;
  }

}


function setNetworkPanel(state, peer, latency) {

  const stateEl = el("network-state");
  const peerEl = el("network-peer");
  const latencyEl = el("network-latency");

  if (stateEl) stateEl.textContent = state;

  if (peerEl) peerEl.textContent = peer || "—";

  if (latencyEl) {

    latencyEl.textContent =
      typeof latency === "number"
        ? `${latency} ms`
        : "—";

  }

}


function syncStatus(status) {

  switch (status.status) {

    case "connecting":
      setConnection("connecting", "Connecting…");
      setNetworkPanel("CONNECTING", lobby.opponentName, null);
      break;

    case "waiting":
      setConnection("waiting", `Lobby ${status.lobbyCode || ""} — waiting…`);
      setNetworkPanel("WAITING", lobby.opponentName, null);
      break;

    case "connected":
      setConnection("connected", `Connected — ${status.peerName || "Peer"}`);
      setNetworkPanel("ONLINE", status.peerName, status.latency);
      break;

    default:
      setConnection("local", "Local Duel");
      setNetworkPanel("LOCAL", "Local Player", null);

  }

}


function showLobbyError(message) {

  const target =
    lobby.screen === "joining"
      ? el("join-error")
      : el("create-error");

  if (!target) return;

  target.textContent = message;

  show(target);

}


function clearLobbyErrors() {

  ["join-error", "create-error"].forEach((id) => {

    const target = el(id);

    if (!target) return;

    target.textContent = "";

    hide(target);

  });

}


// ============================================================
// SCREEN FLOW
// ============================================================

function enterDuelScreen() {

  hide(el("lobby-overlay"));

}


function updateTurnChrome() {

  const game = window.ShadowDuelGame;

  const endTurnButton = el("end-turn-btn");

  if (endTurnButton) {

    endTurnButton.disabled =
      game.isOnline() && !game.isMyTurn();

    endTurnButton.title =
      game.isOnline() && !game.isMyTurn()
        ? "Waiting for your opponent"
        : "End your turn";

  }


  const surrenderButton = el("surrender-btn");

  if (surrenderButton) {

    surrenderButton.disabled =
      game.state().gameOver;

  }


  const restartButton = el("restart-btn");

  if (
    restartButton &&
    game.isOnline() &&
    !lobby.awaitingRematch
  ) {

    restartButton.disabled = false;

    restartButton.textContent =
      lobby.role === "host"
        ? "REMATCH"
        : "REQUEST REMATCH";

  }

}


// Let game.js refresh this chrome after every render.
window.ShadowLobbyUI.updateTurnChrome = updateTurnChrome;


function startLocalDuel() {

  if (window.ShadowNet) {
    window.ShadowNet.leaveLobby();
  }

  lobby.role = null;

  lobby.opponentName = null;


  window.ShadowDuelGame.startLocal();

  enterDuelScreen();

  setConnection("local", "Local Duel");

  setNetworkPanel("LOCAL", "Local Player", null);

  updateTurnChrome();

}


function startOnlineMatch(matchInfo) {

  const net = window.ShadowNet;

  const isHost = lobby.role === "host";

  const localSeat = isHost ? 0 : 1;

  const hostName = matchInfo.hostName || "Host";
  const guestName = matchInfo.guestName || "Guest";

  lobby.opponentName = isHost ? guestName : hostName;


  window.ShadowDuelGame.startOnline({

    seed: matchInfo.seed >>> 0,

    localSeat,

    name0: hostName,
    name1: guestName,

    onAction(action) {

      return net.sendAction(action);

    },

    onSurrender() {

      net.sendSurrender();

    },

    onOpponentLeft() {

      setConnection("local", "Opponent left");

    },

  });


  lobby.awaitingRematch = false;

  enterDuelScreen();

  setConnection("connected", `Connected — ${lobby.opponentName}`);

  setNetworkPanel("ONLINE", lobby.opponentName, null);

  updateTurnChrome();

}


function hostLaunchMatch() {

  const net = window.ShadowNet;

  const seed =
    (window.crypto && window.crypto.getRandomValues)
      ? window.crypto.getRandomValues(new Uint32Array(1))[0]
      : Math.floor(Math.random() * 0xffffffff);

  const matchInfo = {

    seed,

    hostSeat: 0,

    hostName: net.localName,

    guestName: net.peerName || "Guest",

  };

  // Tell the guest first, then start locally.
  net.startMatch(
    matchInfo.seed,
    matchInfo.hostSeat,
    matchInfo.hostName,
    matchInfo.guestName
  );

  startOnlineMatch(matchInfo);

}


function returnToMenu() {

  if (window.ShadowNet) {
    window.ShadowNet.leaveLobby();
  }

  lobby.role = null;

  lobby.opponentName = null;

  lobby.awaitingRematch = false;

  hide(el("game-over-overlay"));

  clearLobbyErrors();

  showScreen("menu");

  setConnection("local", "Local Duel");

  setNetworkPanel("LOCAL", "Local Player", null);

}


// ============================================================
// WAITING ROOM
// ============================================================

function enterWaitingRoom() {

  const net = window.ShadowNet;

  const codeEl = el("lobby-code-display");

  if (codeEl) {
    codeEl.textContent = net.lobbyCode || "----";
  }

  updateWaitingRoom();

  const startButton = el("start-match-btn");

  if (startButton) {

    startButton.disabled = true;

    startButton.textContent = "WAITING FOR OPPONENT…";

  }

  showScreen("waiting");

}


function updateWaitingRoom() {

  const net = window.ShadowNet;

  const isHost = lobby.role === "host";


  const youEl = el("waiting-you");

  if (youEl) {
    youEl.textContent = `${lobby.playerName} (you)`;
  }


  const opponentEl = el("waiting-opponent");

  if (opponentEl) {

    opponentEl.textContent =
      net.peerName || "Waiting for opponent…";

    opponentEl.classList.toggle(
      "waiting-slot-empty",
      !net.peerName
    );

  }


  const hintEl = el("waiting-hint");

  if (hintEl) {

    hintEl.textContent = isHost
      ? "Share the code with a friend. When they connect you can start the duel."
      : "Connected! The host will start the duel.";

  }


  const startButton = el("start-match-btn");

  if (startButton) {

    if (isHost) {

      show(startButton);

      const ready =
        net.peerName && net.isConnected();

      startButton.disabled = !ready;

      startButton.textContent = ready
        ? "START DUEL"
        : "WAITING FOR OPPONENT…";

    } else {

      hide(startButton);

    }

  }

}


function copyInvite() {

  const net = window.ShadowNet;

  if (!net.lobbyCode) return;

  const link =
    `${window.location.origin}${window.location.pathname}`
    + `?lobby=${net.lobbyCode}`;

  const copied = (text) => {

    const codeEl = el("lobby-code-display");

    if (!codeEl) return;

    const original = net.lobbyCode;

    codeEl.textContent = text;

    setTimeout(() => {

      if (el("lobby-code-display")) {
        el("lobby-code-display").textContent = original;
      }

    }, 1200);

  };

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(link)
      .then(() => copied("LINK COPIED!"))
      .catch(() => copied(net.lobbyCode));

  } else {

    copied(net.lobbyCode);

  }

}


// ============================================================
// SHADOWNET WIRING
// ============================================================

function wireNetwork() {

  const net = window.ShadowNet;

  if (!net) return;


  net.onStatusChange = (status) => {

    syncStatus(status);

    if (lobby.screen === "waiting") {
      updateWaitingRoom();
    }

  };


  net.onLobbyUpdate = () => {

    if (lobby.screen === "waiting") {
      updateWaitingRoom();
    }

  };


  net.onMatchStart = (matchInfo) => {

    // Guests receive this when the host starts the duel.
    startOnlineMatch(matchInfo);

  };


  net.onAction = (action) => {

    window.ShadowDuelGame.receiveAction(action);

    updateTurnChrome();

  };


  net.onSurrender = () => {

    // The peer also sends a surrender action which ends the
    // game deterministically — nothing extra to do here.

  };


  net.onRematchRequest = () => {

    if (lobby.role !== "host") return;

    hostLaunchMatch();

  };


  net.onPeerDisconnected = () => {

    window.ShadowDuelGame.handleOpponentLeft();

  };


  net.onError = (message) => {

    if (lobby.screen === "playing") return;

    showLobbyError(message || "Connection error.");

    lobby.role = null;

  };

}


// ============================================================
// LOBBY ACTIONS
// ============================================================

function createLobby() {

  const net = window.ShadowNet;

  if (!net) {

    showLobbyError("Multiplayer is not available.");

    return;
  }

  clearLobbyErrors();

  const nameInput = el("create-name");

  lobby.playerName = sanitizeName(
    nameInput ? nameInput.value : ""
  );

  saveName(lobby.playerName);

  lobby.role = "host";

  net.createLobby(lobby.playerName);

  enterWaitingRoom();

}


function joinLobby() {

  const net = window.ShadowNet;

  if (!net) {

    showLobbyError("Multiplayer is not available.");

    return;
  }

  clearLobbyErrors();

  const codeInput = el("join-code");

  const code = String(
    codeInput ? codeInput.value : ""
  )
    .trim()
    .toUpperCase();

  if (code.length !== 4) {

    showLobbyError("Enter the 4-character lobby code.");

    return;
  }

  const nameInput = el("join-name");

  lobby.playerName = sanitizeName(
    nameInput ? nameInput.value : ""
  );

  saveName(lobby.playerName);

  lobby.role = "guest";

  net.joinLobby(code, lobby.playerName);

  enterWaitingRoom();

}


// ============================================================
// EVENT WIRING
// ============================================================

function wireEvents() {

  const on = (id, handler) => {

    const element = el(id);

    if (element) {
      element.addEventListener("click", handler);
    }

  };


  // ----------------------------------------------------------
  // Menu
  // ----------------------------------------------------------

  on("menu-local-btn", startLocalDuel);

  on("menu-create-btn", () => {

    clearLobbyErrors();

    showScreen("creating");

    const input = el("create-name");

    if (input) input.focus();

  });

  on("menu-join-btn", () => {

    clearLobbyErrors();

    showScreen("joining");

    const input = el("join-code");

    if (input) input.focus();

  });


  // ----------------------------------------------------------
  // Create
  // ----------------------------------------------------------

  on("create-back-btn", () => showScreen("menu"));

  on("create-lobby-btn", createLobby);


  // ----------------------------------------------------------
  // Join
  // ----------------------------------------------------------

  on("join-back-btn", () => showScreen("menu"));

  on("join-lobby-btn", joinLobby);


  // ----------------------------------------------------------
  // Waiting room
  // ----------------------------------------------------------

  on("copy-invite-btn", copyInvite);

  on("cancel-lobby-btn", returnToMenu);

  on("start-match-btn", () => {

    if (
      lobby.role === "host" &&
      window.ShadowNet.isConnected()
    ) {
      hostLaunchMatch();
    }

  });


  // ----------------------------------------------------------
  // In-duel chrome
  // ----------------------------------------------------------

  on("menu-btn", returnToMenu);

  on("surrender-btn", () => {

    window.ShadowDuelGame.surrender();

    updateTurnChrome();

  });

  on("end-turn-btn", updateTurnChrome);

  on("return-menu-btn", returnToMenu);


  // Rematch: hosts restart directly; guests ask the host.
  on("restart-btn", () => {

    if (!window.ShadowDuelGame.isOnline()) return;

    if (lobby.role === "host") {

      if (window.ShadowNet.isConnected()) {
        hostLaunchMatch();
      } else {
        returnToMenu();
      }

    } else if (window.ShadowNet.isConnected()) {

      window.ShadowNet.sendRematch();

      lobby.awaitingRematch = true;

      const button = el("restart-btn");

      if (button) {

        button.disabled = true;

        button.textContent = "REMATCH SENT…";

      }

    }

  });


  // ----------------------------------------------------------
  // Form ergonomics
  // ----------------------------------------------------------

  ["create-name", "join-name", "join-code"].forEach((id) => {

    const input = el(id);

    if (!input) return;

    input.addEventListener("keydown", (event) => {

      if (event.key !== "Enter") return;

      event.preventDefault();

      if (id === "create-name") {
        createLobby();
      } else {
        joinLobby();
      }

    });

  });


  const joinCode = el("join-code");

  if (joinCode) {

    joinCode.addEventListener("input", () => {

      joinCode.value = joinCode.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4);

    });

  }

}


// ============================================================
// INIT
// ============================================================

function init() {

  // Pre-fill a remembered or generated player name.
  const saved = loadSavedName() || randomName();

  ["create-name", "join-name"].forEach((id) => {

    const input = el(id);

    if (input) input.value = saved;

  });


  // Pre-fill the lobby code from a shared link (?lobby=ABCD)
  // and drop the visitor straight onto the join screen.
  const params = new URLSearchParams(window.location.search);

  const sharedCode = String(params.get("lobby") || "")
    .trim()
    .toUpperCase()
    .slice(0, 4);

  if (sharedCode && el("join-code")) {

    el("join-code").value = sharedCode;

    showScreen("joining");

  } else {

    showScreen("menu");

  }


  wireNetwork();

  wireEvents();

  setConnection("local", "Local Duel");

  setNetworkPanel("LOCAL", "Local Player", null);

}


if (document.readyState === "loading") {

  document.addEventListener("DOMContentLoaded", init);

} else {

  init();

}


})();
