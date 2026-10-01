const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const WebSocket = require('ws');
const { createDuelServer } = require('../server');

async function service(t) {
  const instance = createDuelServer();
  instance.server.listen(0, '127.0.0.1');
  await once(instance.server, 'listening');
  t.after(() => instance.close());
  const port = instance.server.address().port;
  return { instance, url: `http://127.0.0.1:${port}`, ws: `ws://127.0.0.1:${port}/ws` };
}
async function client(url) {
  const socket = new WebSocket(url);
  const inbox = [];
  const waiters = [];
  socket.on('message', raw => {
    const message = JSON.parse(raw.toString());
    const index = waiters.findIndex(waiter => waiter.type === message.type);
    if (index < 0) inbox.push(message);
    else { const waiter = waiters.splice(index, 1)[0]; clearTimeout(waiter.timer); waiter.resolve(message); }
  });
  await once(socket, 'open');
  return {
    socket, inbox,
    send: message => socket.send(JSON.stringify(message)),
    next(type) {
      const index = inbox.findIndex(message => message.type === type);
      if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]);
      return new Promise((resolve, reject) => {
        const waiter = { type, resolve };
        waiter.timer = setTimeout(() => { const index = waiters.indexOf(waiter); if (index >= 0) waiters.splice(index, 1); reject(new Error(`Timed out waiting for ${type}`)); }, 1500);
        waiters.push(waiter);
      });
    },
  };
}
async function create(peer, name = 'Host') { peer.send({ type: 'create', name }); return peer.next('created'); }
async function join(peer, code, name = 'Guest') { peer.send({ type: 'join', code, name }); return peer.next('joined'); }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

test('HTTP exposes the application and health but not repository files', async t => {
  const { url } = await service(t);
  for (const route of ['/', '/?lobby=ABCD', '/index.html', '/network.js', '/lobby.js', '/cards.js', '/game.js', '/style.css']) {
    const response = await fetch(url + route); assert.equal(response.status, 200, route);
  }
  assert.deepEqual(await (await fetch(url + '/health')).json(), { status: 'ok' });
  for (const route of ['/server.js', '/package.json', '/package-lock.json', '/README.md', '/tests/network.test.cjs', '/node_modules/ws/package.json', '/.git/config', '/%2e%2e/package.json', '/assets/../server.js', '/missing.js']) {
    const response = await fetch(url + route); assert.equal(response.status, 404, route);
    assert.doesNotMatch(await response.text(), /<!DOCTYPE|express|PRIVATE KEY/i, route);
  }
});

test('real WebSocket rooms enforce capacity, roles, names, and signaling isolation', async t => {
  const { ws } = await service(t);
  const [host, guest, outsider] = await Promise.all([client(ws), client(ws), client(ws)]);
  const room = await create(host, '  Host   Name  ');
  assert.match(room.code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
  assert.equal(room.hostId, room.peerId);
  const membership = await join(guest, ` ${room.code.toLowerCase()} `, 'G'.repeat(40));
  assert.equal(membership.hostId, room.peerId);
  assert.deepEqual(membership.peers.map(peer => peer.name), ['Host Name', 'G'.repeat(24)]);
  assert.equal((await host.next('peer-joined')).peer.id, membership.peerId);
  outsider.send({ type: 'join', code: room.code });
  assert.match((await outsider.next('error')).message, /full/);
  const elsewhere = await create(outsider);
  outsider.send({ type: 'signal', to: room.peerId, data: { kind: 'sdp', description: { type: 'offer', sdp: 'foreign' } } });
  guest.send({ type: 'signal', to: elsewhere.peerId, data: { kind: 'ice', candidate: { candidate: 'foreign' } } });
  guest.send({ type: 'signal', to: room.peerId, data: { kind: 'sdp', description: { type: 'offer', sdp: 'owned' } } });
  assert.equal((await host.next('signal')).data.description.sdp, 'owned');
  await pause(30);
  assert.equal(host.inbox.filter(message => message.type === 'signal').length, 0);
  assert.equal(outsider.inbox.filter(message => message.type === 'signal').length, 0);
  host.send({ type: 'join', code: room.code });
  assert.match((await host.next('error')).message, /already/);
  host.socket.send('null'); host.socket.send('{broken'); host.socket.send('[]');
  host.send({ type: 'signal', to: membership.peerId, data: { kind: 'ice', candidate: { candidate: 'still alive' } } });
  assert.equal((await guest.next('signal')).from, room.peerId);
});

test('room switches remove old membership and host departure dissolves its room', async t => {
  const { ws } = await service(t);
  const [a, b, c] = await Promise.all([client(ws), client(ws), client(ws)]);
  const first = await create(a); const second = await create(c);
  await join(b, first.code); await a.next('peer-joined');
  await join(b, second.code); await c.next('peer-joined');
  await a.next('peer-left');
  a.send({ type: 'signal', data: { kind: 'ice', candidate: { candidate: 'old-room' } } });
  c.send({ type: 'signal', data: { kind: 'ice', candidate: { candidate: 'new-room' } } });
  assert.equal((await b.next('signal')).data.candidate.candidate, 'new-room');
  c.socket.close(); await b.next('room-closed');
  b.send({ type: 'join', code: second.code }); assert.match((await b.next('error')).message, /not found/);
  await join(b, first.code); await a.next('peer-joined');
  b.send({ type: 'leave' }); await b.next('left'); await a.next('peer-left');
  a.send({ type: 'leave' }); await a.next('left');
  b.send({ type: 'join', code: first.code }); assert.match((await b.next('error')).message, /not found/);
});

test('invalid join preserves membership; shutdown closes active peers', async t => {
  const { ws, instance } = await service(t);
  const [host, guest] = await Promise.all([client(ws), client(ws)]);
  const room = await create(host); const member = await join(guest, room.code); await host.next('peer-joined');
  guest.send({ type: 'join', code: 'NOPE' }); await guest.next('error');
  guest.send({ type: 'signal', to: room.peerId, data: { kind: 'ice', candidate: { candidate: 'retained' } } });
  assert.equal((await host.next('signal')).from, member.peerId);
  const closed = Promise.all([once(host.socket, 'close'), once(guest.socket, 'close')]);
  await instance.close(); await closed;
  assert.equal(instance.server.listening, false);
});

function browser(t, role = 'guest') {
  class FakeSocket {
    static OPEN = 1;
    static all = [];
    constructor() { this.readyState = 0; this.sent = []; FakeSocket.all.push(this); }
    send(raw) { this.sent.push(JSON.parse(raw)); }
    close() { this.readyState = 3; }
    open() { this.readyState = 1; this.onopen?.(); }
    receive(message) { this.onmessage?.({ data: JSON.stringify(message) }); }
  }
  class FakeChannel {
    constructor() { this.readyState = 'connecting'; this.sent = []; }
    send(raw) { this.sent.push(JSON.parse(raw)); }
    close() { this.readyState = 'closed'; }
    open() { this.readyState = 'open'; this.onopen?.(); }
    receive(message) { this.onmessage?.({ data: JSON.stringify(message) }); }
  }
  class FakePeer {
    static all = [];
    constructor() { this.connectionState = 'new'; this.remoteDescription = null; this.candidates = []; FakePeer.all.push(this); }
    createDataChannel() { return this.channel = new FakeChannel(); }
    async createOffer() { return { type: 'offer', sdp: 'offer' }; }
    async createAnswer() { return { type: 'answer', sdp: 'answer' }; }
    async setLocalDescription(value) { this.localDescription = value; }
    async setRemoteDescription(value) { this.remoteDescription = value; }
    async addIceCandidate(value) { if (!this.remoteDescription) throw new Error('ICE before SDP'); this.candidates.push(value); }
    close() { this.connectionState = 'closed'; }
  }
  const window = { location: { protocol: 'http:', host: 'localhost' } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../network.js'), 'utf8'), { window, WebSocket: FakeSocket, RTCPeerConnection: FakePeer, setTimeout, clearTimeout, setInterval, clearInterval });
  const net = window.ShadowNet;
  if (role === 'guest') net.joinLobby('ABCD', 'Guest'); else net.createLobby('Host');
  const socket = FakeSocket.all.at(-1); socket.open();
  if (role === 'guest') socket.receive({ type: 'joined', code: 'ABCD', peerId: 'guest-id', hostId: 'host-id', peers: [{ id: 'host-id', name: 'Host' }, { id: 'guest-id', name: 'Guest' }] });
  else { socket.receive({ type: 'created', code: 'ABCD', peerId: 'host-id', hostId: 'host-id' }); socket.receive({ type: 'peer-joined', peer: { id: 'guest-id', name: 'Guest' } }); }
  const pc = FakePeer.all.at(-1);
  const channel = role === 'guest' ? pc.channel : new FakeChannel();
  if (role === 'host') pc.ondatachannel({ channel });
  channel.open();
  t.after(() => net.leaveLobby());
  return { net, socket, pc, channel, FakeSocket };
}
const start = (number = 1) => ({ type: 'match-start', seed: 42, hostSeat: 0, number, matchId: `host-id:${number}` });

test('guest requires readiness and host seat; ignores replayed starts and actions', t => {
  const { net, channel } = browser(t);
  const matches = [], actions = [];
  net.onMatchStart = info => matches.push(info);
  net.onAction = action => { actions.push(action); return true; };
  channel.receive(start()); assert.equal(matches.length, 0);
  assert.equal(net.setReady(true), true);
  channel.receive({ ...start(), hostSeat: 1 }); assert.equal(matches.length, 0);
  channel.receive(start()); assert.equal(matches.length, 1);
  channel.receive(start()); assert.equal(matches.length, 1);
  const action = { type: 'action', matchId: 'host-id:1', seq: 1, action: { type: 'end' } };
  channel.receive(action); channel.receive(action);
  channel.receive({ ...action, matchId: 'old-match', seq: 2 });
  assert.equal(actions.length, 1);
  net.finishMatch();
  channel.receive(start(2)); assert.equal(matches.length, 1);
  assert.equal(net.sendRematch(), true);
  channel.receive({ type: 'rematch', matchId: 'host-id:1' });
  channel.receive(start(2)); assert.equal(matches.length, 2);
  channel.receive({ ...action, seq: 2 }); assert.equal(actions.length, 1);
});

test('host starts only after readiness, actions carry sequence, surrender is not duplicated', t => {
  const { net, channel } = browser(t, 'host');
  assert.equal(net.startMatch(42, 0, 'Host', 'Guest'), false);
  channel.receive({ type: 'ready', ready: true });
  assert.equal(net.startMatch(42, 1, 'Host', 'Guest'), false);
  assert.equal(net.startMatch(42, 0, 'Host', 'Guest'), true);
  assert.equal(net.startMatch(42, 0, 'Host', 'Guest'), false);
  assert.equal(net.sendAction({ type: 'play', cardId: 'card-42' }), true);
  assert.equal(net.sendAction({ type: 'attack', attacker: 0, target: null }), true);
  assert.equal(net.sendAction({ type: 'surrender' }), true);
  net.sendSurrender();
  assert.deepEqual(channel.sent.filter(message => message.type === 'action').map(message => message.seq), [1, 2, 3]);
  net.finishMatch();
  assert.equal(net.startMatch(5, 0, 'Host', 'Guest'), false);
  net.sendRematch(); channel.receive({ type: 'rematch', matchId: 'host-id:1' });
  assert.equal(net.startMatch(5, 0, 'Host', 'Guest'), true);
  assert.equal(channel.sent.filter(message => message.type === 'match-start').at(-1).matchId, 'host-id:2');
});

test('invalid, skipped, or rejected actions stop the connection instead of continuing desynced', async t => {
  for (const variant of ['invalid', 'skipped', 'rejected']) await t.test(variant, t => {
    const { net, channel } = browser(t);
    let disconnected = 0;
    net.onPeerDisconnected = () => disconnected++;
    net.setReady(true); channel.receive(start()); net.onAction = () => variant !== 'rejected';
    channel.receive({ type: 'action', matchId: 'host-id:1', seq: variant === 'skipped' ? 2 : 1, action: variant === 'invalid' ? { type: 'attack', attacker: -1, target: null } : { type: 'end' } });
    assert.equal(net.isConnected(), false); assert.equal(disconnected, 1);
  });
});

test('ICE is queued until SDP and stale socket/channel callbacks cannot destroy a new lobby', async t => {
  const { net, socket, pc, channel, FakeSocket } = browser(t, 'host');
  socket.receive({ type: 'signal', from: 'intruder', data: { kind: 'ice', candidate: { candidate: 'foreign' } } });
  socket.receive({ type: 'signal', from: 'guest-id', data: { kind: 'ice', candidate: { candidate: 'queued' } } });
  socket.receive({ type: 'signal', from: 'guest-id', data: { kind: 'sdp', description: { type: 'offer', sdp: 'offer' } } });
  await pause(0);
  assert.equal(pc.candidates.length, 1); assert.equal(pc.candidates[0].candidate, 'queued');
  const oldClose = socket.onclose, oldPeerClose = channel.onclose;
  net.createLobby('Again'); const next = FakeSocket.all.at(-1); next.open();
  next.receive({ type: 'created', code: 'NEW2', peerId: 'new-host' });
  oldClose(); oldPeerClose();
  assert.equal(net.status, 'waiting'); assert.equal(net.lobbyCode, 'NEW2');
});
