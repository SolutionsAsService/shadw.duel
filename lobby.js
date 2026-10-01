// SHADOW DUEL — screen flow, invitations and match coordination.
// Rules stay in game.js; discovery and peer messages stay in ShadowNet.
(function () {
  "use strict";
  const lobby = { screen: "menu", playerName: "", opponentName: null, role: null, form: "creating" };
  const NAME_STORAGE_KEY = "shadowduel.name";
  const el = id => document.getElementById(id);
  function show(element, visible = true) {
    if (!element) return;
    element.classList.toggle("hidden", !visible);
    if (element.hasAttribute("aria-hidden")) element.setAttribute("aria-hidden", String(!visible));
  }
  const game = () => window.ShadowDuelGame;
  const net = () => window.ShadowNet;
  // Presence marker prevents the engine's standalone local autostart.
  window.ShadowLobbyUI = { updateTurnChrome, returnToMenu };

  function showScreen(name) {
    lobby.screen = name;
    const screens = { menu: "lobby-menu", creating: "lobby-create", joining: "lobby-join", waiting: "lobby-waiting" };
    for (const [key, id] of Object.entries(screens)) show(el(id), key === name);
    show(el("lobby-overlay"));
  }
  function sanitizeName(value) { return String(value || "").replace(/\s+/g, " ").trim().slice(0, 24) || "Player"; }
  function rememberName(name) { try { localStorage.setItem(NAME_STORAGE_KEY, name); } catch { /* Storage is optional. */ } }
  function setConnection(state, text) {
    if (el("connection-status")) el("connection-status").dataset.state = state;
    if (el("connection-text")) el("connection-text").textContent = text;
  }
  function setNetworkPanel(state, peer, latency) {
    if (el("network-state")) el("network-state").textContent = state;
    if (el("network-peer")) el("network-peer").textContent = peer || "—";
    if (el("network-latency")) el("network-latency").textContent = typeof latency === "number" ? `${latency} ms` : "—";
  }
  function syncStatus(status) {
    if (status.status === "connected") {
      setConnection("connected", `Connected — ${status.peerName || "Peer"}`);
      setNetworkPanel("ONLINE", status.peerName, status.latency);
    } else if (status.status === "waiting") {
      setConnection("waiting", `Lobby ${status.lobbyCode || ""} — waiting…`);
      setNetworkPanel("WAITING", status.peerName, null);
    } else if (status.status === "connecting") {
      setConnection("connecting", "Connecting…"); setNetworkPanel("CONNECTING", null, null);
    } else {
      setConnection("local", lobby.screen === "playing" && game().isOnline() ? "Disconnected" : "Local Duel");
      setNetworkPanel("LOCAL", null, null);
    }
  }
  function showLobbyError(message) {
    const target = el(lobby.screen === "joining" ? "join-error" : "create-error");
    if (target) { target.textContent = message; show(target); }
  }
  function clearErrors() { for (const id of ["join-error", "create-error"]) { if (el(id)) el(id).textContent = ""; show(el(id), false); } }
  function enterDuel() { lobby.screen = "playing"; show(el("lobby-overlay"), false); }
  function updateTurnChrome() {
    if (!game()) return;
    const state = game().state();
    const ended = !!state.gameOver;
    const online = game().isOnline();
    const playing = lobby.screen === "playing";
    const end = el("end-turn-btn");
    if (end) {
      end.disabled = !playing || ended || (online && (!net().isConnected() || !game().isMyTurn()));
      end.title = end.disabled ? "Waiting for your turn" : "End your turn";
    }
    if (el("surrender-btn")) el("surrender-btn").disabled = !playing || ended || (online && !net().isConnected());
    if (online && ended) net().finishMatch();
    const restart = el("restart-btn");
    if (restart && online) {
      restart.disabled = net().isConnected() && net().localRematch;
      restart.textContent = !net().isConnected() ? "BACK TO MENU" : net().localRematch ? "WAITING FOR OPPONENT…" : net().peerRematch ? "ACCEPT REMATCH" : "REQUEST REMATCH";
    }
  }
  function startLocal() {
    net()?.leaveLobby(); lobby.role = null; lobby.opponentName = null;
    enterDuel(); game().startLocal(); syncStatus({ status: "idle" }); updateTurnChrome();
  }
  function startOnline(info) {
    if (info.hostSeat !== 0 || !["host", "guest"].includes(lobby.role)) return;
    const host = lobby.role === "host";
    lobby.opponentName = host ? info.guestName : info.hostName;
    enterDuel();
    game().startOnline({
      seed: info.seed, localSeat: host ? 0 : 1, name0: info.hostName, name1: info.guestName,
      onAction: action => net().sendAction(action),
      onSurrender: () => net().sendSurrender(),
      onOpponentLeft: () => setConnection("local", "Opponent left"),
    });
    updateTurnChrome();
  }
  function hostLaunchMatch() {
    if (lobby.role !== "host") return false;
    const seed = window.crypto?.getRandomValues ? window.crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 0x100000000);
    const info = { seed, hostSeat: 0, hostName: net().localName, guestName: net().peerName || "Guest" };
    // Never initialize a local match unless the host start reached the peer channel.
    if (!net().startMatch(seed, 0, info.hostName, info.guestName)) return false;
    startOnline(info); return true;
  }
  function returnToMenu() {
    net()?.leaveLobby(); game()?.stop?.();
    lobby.role = null; lobby.opponentName = null;
    show(el("game-over-overlay"), false); show(el("card-detail-panel"), false);
    clearErrors(); showScreen("menu"); syncStatus({ status: "idle" }); updateTurnChrome();
  }
  function updateWaitingRoom() {
    if (!net()) return;
    if (el("lobby-code-display")) el("lobby-code-display").textContent = net().lobbyCode || "----";
    if (el("waiting-you")) el("waiting-you").textContent = `${lobby.playerName} (you)`;
    const opponent = el("waiting-opponent");
    if (opponent) { opponent.textContent = net().peerName || "Waiting for opponent…"; opponent.classList.toggle("waiting-slot-empty", !net().peerName); }
    const connected = net().isConnected();
    const host = lobby.role === "host";
    if (el("waiting-hint")) el("waiting-hint").textContent = !net().lobbyCode ? "Contacting the lobby server…" : !connected ? "Share your invite. Establishing a direct connection when your opponent joins." : host ? net().peerReady ? "Your opponent is ready. Start the duel when you are ready." : "Waiting for your opponent to confirm they are ready." : net().localReady ? "You are ready. Waiting for the host to start." : "Connected! Confirm you are ready to duel.";
    const button = el("start-match-btn");
    if (button) {
      show(button);
      button.disabled = !connected || (host && !net().peerReady);
      button.textContent = !connected ? "WAITING FOR OPPONENT…" : host ? net().peerReady ? "START DUEL" : "WAITING FOR READY…" : net().localReady ? "CANCEL READY" : "READY TO DUEL";
    }
  }
  async function copyInvite() {
    const code = net().lobbyCode;
    if (!code) return;
    const link = `${location.origin}${location.pathname}?lobby=${encodeURIComponent(code)}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(link);
      if (el("waiting-hint")) el("waiting-hint").textContent = "Invite link copied.";
    } catch {
      if (el("waiting-hint")) el("waiting-hint").textContent = `Copy this invite: ${link}`;
    }
  }
  function maybeRematch() {
    updateTurnChrome();
    if (lobby.screen === "playing" && game().state().gameOver && lobby.role === "host" && net().localRematch && net().peerRematch) hostLaunchMatch();
  }
  function wireNetwork() {
    net().onStatusChange = status => { syncStatus(status); if (lobby.screen === "waiting") updateWaitingRoom(); else updateTurnChrome(); };
    net().onLobbyUpdate = () => {
      if (lobby.screen !== "waiting") return;
      if (!net().lobbyCode && net().status === "idle") {
        lobby.role = null; showScreen(lobby.form); showLobbyError("The host left the lobby. Enter another code or create a lobby.");
      } else updateWaitingRoom();
    };
    net().onReadyChange = () => { if (lobby.screen === "waiting") updateWaitingRoom(); else maybeRematch(); };
    net().onMatchStart = info => { if (lobby.role === "guest") startOnline(info); };
    net().onAction = action => { const accepted = game().receiveAction(action); updateTurnChrome(); return accepted; };
    net().onSurrender = () => {}; // The action message is the single source of game changes.
    net().onRematchRequest = maybeRematch;
    net().onPeerDisconnected = () => { if (lobby.screen === "playing") game().handleOpponentLeft(); updateTurnChrome(); };
    net().onError = message => {
      if (lobby.screen === "playing") { setConnection("local", message); updateTurnChrome(); return; }
      lobby.role = null; showScreen(lobby.form); showLobbyError(message || "Connection error.");
    };
  }
  function createLobby() {
    if (lobby.screen !== "creating") return;
    clearErrors(); lobby.form = "creating"; lobby.playerName = sanitizeName(el("create-name")?.value); rememberName(lobby.playerName);
    lobby.role = "host"; showScreen("waiting"); net().createLobby(lobby.playerName); updateWaitingRoom();
  }
  function joinLobby() {
    if (lobby.screen !== "joining") return;
    clearErrors();
    const code = String(el("join-code")?.value || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(code)) return showLobbyError("Enter the 4-character lobby code.");
    lobby.form = "joining"; lobby.playerName = sanitizeName(el("join-name")?.value); rememberName(lobby.playerName);
    lobby.role = "guest"; showScreen("waiting"); net().joinLobby(code, lobby.playerName); updateWaitingRoom();
  }
  function wireEvents() {
    const on = (id, handler) => el(id)?.addEventListener("click", handler);
    on("menu-local-btn", startLocal);
    on("menu-create-btn", () => { clearErrors(); showScreen("creating"); el("create-name")?.focus(); });
    on("menu-join-btn", () => { clearErrors(); showScreen("joining"); el("join-code")?.focus(); });
    on("create-back-btn", returnToMenu); on("join-back-btn", returnToMenu);
    on("create-lobby-btn", createLobby); on("join-lobby-btn", joinLobby);
    on("copy-invite-btn", copyInvite); on("lobby-code-display", copyInvite); on("cancel-lobby-btn", returnToMenu);
    on("start-match-btn", () => { if (lobby.role === "host") hostLaunchMatch(); else net().setReady(!net().localReady); });
    on("menu-btn", returnToMenu); on("return-menu-btn", returnToMenu);
    on("surrender-btn", () => { if (lobby.screen === "playing") game().surrender(); updateTurnChrome(); });
    on("end-turn-btn", updateTurnChrome);
    on("restart-btn", () => {
      if (!game().isOnline()) return;
      if (!net().isConnected()) return returnToMenu();
      if (!game().state().gameOver) return;
      net().sendRematch(); maybeRematch();
    });
    for (const id of ["create-name", "join-name", "join-code"]) el(id)?.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault(); if (id === "create-name") createLobby(); else joinLobby();
    });
    el("join-code")?.addEventListener("input", () => { el("join-code").value = el("join-code").value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4); });
    window.addEventListener("pagehide", () => net()?.leaveLobby());
  }
  function init() {
    let saved = ""; try { saved = localStorage.getItem(NAME_STORAGE_KEY) || ""; } catch { /* Storage is optional. */ }
    saved ||= `Duelist-${100 + Math.floor(Math.random() * 900)}`;
    for (const id of ["create-name", "join-name"]) if (el(id)) el(id).value = saved;
    wireNetwork(); wireEvents();
    const shared = String(new URLSearchParams(location.search).get("lobby") || "").trim().toUpperCase();
    if (/^[A-Z0-9]{4}$/.test(shared) && el("join-code")) { el("join-code").value = shared; showScreen("joining"); }
    else showScreen("menu");
    syncStatus({ status: "idle" }); updateTurnChrome();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
