import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

interface PlayerRecord {
  id: string;
  name: string;
  roomCode: string;
  carId: string;
  paint: string;
  paintFinish: string;
  rimColor: string;
  rimDesign: string;
  underglow: string;
  spoiler: string;
  mode: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  speedKmh: number;
  gear: number;
  inCarMeet: boolean;
  combo: number;
  bestScore: number;
  likes: number;
  reputation: number;
  isKing: boolean;
  duelId: string | null;
  lastUpdateAt: number;
}

interface DuelRecord {
  id: string;
  roomCode: string;
  challengerId: string;
  challengerName: string;
  opponentId: string;
  opponentName: string;
  challengerScore: number;
  opponentScore: number;
  endsAt: number;
}

interface ClientSession {
  ws: WebSocket;
  playerId: string;
  roomCode: string;
  likedTargets: Set<string>;
}

const rooms = new Map<string, Map<string, PlayerRecord>>();
const clients = new Map<string, ClientSession>();
const activeDuels = new Map<string, DuelRecord>();

function normalizeRoomCode(raw: unknown): string {
  if (typeof raw !== 'string') return 'PUBLIC';
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  if (!clean || clean === 'PUBLIC') return 'PUBLIC';
  return clean;
}

function generatePrivateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getOrCreateRoom(roomCode: string): Map<string, PlayerRecord> {
  let room = rooms.get(roomCode);
  if (!room) {
    room = new Map<string, PlayerRecord>();
    rooms.set(roomCode, room);
  }
  return room;
}

function recomputeKing(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;
  for (const p of room.values()) {
    p.isKing = false;
  }
  // Golden Crown ("Rey del Duelo") appears ONLY on the player currently leading an active 1v1 Online duel
  for (const duel of activeDuels.values()) {
    if (duel.roomCode !== roomCode) continue;
    const p1 = room.get(duel.challengerId);
    const p2 = room.get(duel.opponentId);
    if (duel.challengerScore > duel.opponentScore && p1) {
      p1.isKing = true;
    } else if (duel.opponentScore > duel.challengerScore && p2) {
      p2.isKing = true;
    }
  }
}

function broadcastToRoom(roomCode: string, payload: unknown, excludeId?: string) {
  const msg = JSON.stringify(payload);
  for (const session of clients.values()) {
    if (session.roomCode === roomCode && session.playerId !== excludeId) {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(msg);
      }
    }
  }
}

function sendToPlayer(playerId: string, payload: unknown) {
  const session = clients.get(playerId);
  if (session && session.ws.readyState === WebSocket.OPEN) {
    session.ws.send(JSON.stringify(payload));
  }
}

function leaveCurrentRoom(playerId: string) {
  const session = clients.get(playerId);
  if (!session) return;
  const oldRoom = rooms.get(session.roomCode);
  if (oldRoom) {
    oldRoom.delete(playerId);
    if (oldRoom.size === 0 && session.roomCode !== 'PUBLIC') {
      rooms.delete(session.roomCode);
    } else {
      recomputeKing(session.roomCode);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    let totalPlayers = 0;
    for (const r of rooms.values()) totalPlayers += r.size;
    res.json({
      ok: true,
      rooms: rooms.size,
      players: totalPlayers,
    });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const playerId = `p_${Math.random().toString(36).slice(2, 10)}`;
    const session: ClientSession = {
      ws,
      playerId,
      roomCode: 'PUBLIC',
      likedTargets: new Set<string>(),
    };
    clients.set(playerId, session);

    const defaultRoom = getOrCreateRoom('PUBLIC');
    const initialRecord: PlayerRecord = {
      id: playerId,
      name: `Piloto ${playerId.slice(2, 6).toUpperCase()}`,
      roomCode: 'PUBLIC',
      carId: 'kuruma_2008',
      paint: '#d9dde3',
      paintFinish: 'gloss',
      rimColor: '#a1a8b3',
      rimDesign: 'five_spoke',
      underglow: 'none',
      spoiler: 'stock',
      mode: 'WALKING',
      x: 50.2,
      y: 0.015,
      z: 14.5,
      rotY: -2.36,
      speedKmh: 0,
      gear: 1,
      inCarMeet: false,
      combo: 0,
      bestScore: 0,
      likes: 0,
      reputation: 0,
      isKing: false,
      duelId: null,
      lastUpdateAt: Date.now(),
    };
    defaultRoom.set(playerId, initialRecord);
    recomputeKing('PUBLIC');

    ws.send(
      JSON.stringify({
        type: 'welcome',
        playerId,
        roomCode: 'PUBLIC',
      })
    );

    ws.on('message', (raw) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(String(raw)) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = String(data.type || '');
      const currRoom = rooms.get(session.roomCode);
      const currPlayer = currRoom?.get(playerId);

      if (type === 'join_room') {
        const wantCreatePrivate = Boolean(data.createPrivate);
        const nextRoomCode = wantCreatePrivate
          ? generatePrivateCode()
          : normalizeRoomCode(data.roomCode);
        const safeName =
          typeof data.name === 'string' && data.name.trim().length > 0
            ? data.name.trim().slice(0, 18)
            : currPlayer?.name || `Piloto ${playerId.slice(2, 6).toUpperCase()}`;

        const snapshotCopy: PlayerRecord = currPlayer
          ? { ...currPlayer, name: safeName, roomCode: nextRoomCode, duelId: null }
          : { ...initialRecord, name: safeName, roomCode: nextRoomCode };

        leaveCurrentRoom(playerId);
        session.roomCode = nextRoomCode;
        session.likedTargets.clear();
        const targetRoom = getOrCreateRoom(nextRoomCode);
        targetRoom.set(playerId, snapshotCopy);
        recomputeKing(nextRoomCode);

        ws.send(
          JSON.stringify({
            type: 'room_joined',
            roomCode: nextRoomCode,
            playerId,
          })
        );
        return;
      }

      if (!currPlayer) return;

      if (type === 'state') {
        if (typeof data.name === 'string' && data.name.trim().length > 0) {
          currPlayer.name = data.name.trim().slice(0, 18);
        }
        if (typeof data.carId === 'string') currPlayer.carId = data.carId;
        if (typeof data.paint === 'string') currPlayer.paint = data.paint;
        if (typeof data.paintFinish === 'string') currPlayer.paintFinish = data.paintFinish;
        if (typeof data.rimColor === 'string') currPlayer.rimColor = data.rimColor;
        if (typeof data.rimDesign === 'string') currPlayer.rimDesign = data.rimDesign;
        if (typeof data.underglow === 'string') currPlayer.underglow = data.underglow;
        if (typeof data.spoiler === 'string') currPlayer.spoiler = data.spoiler;
        if (typeof data.mode === 'string') currPlayer.mode = data.mode;
        if (typeof data.x === 'number' && Number.isFinite(data.x)) currPlayer.x = data.x;
        if (typeof data.y === 'number' && Number.isFinite(data.y)) currPlayer.y = data.y;
        if (typeof data.z === 'number' && Number.isFinite(data.z)) currPlayer.z = data.z;
        if (typeof data.rotY === 'number' && Number.isFinite(data.rotY)) currPlayer.rotY = data.rotY;
        if (typeof data.speedKmh === 'number' && Number.isFinite(data.speedKmh)) {
          currPlayer.speedKmh = data.speedKmh;
        }
        if (typeof data.gear === 'number' && Number.isFinite(data.gear)) currPlayer.gear = data.gear;
        currPlayer.inCarMeet = Boolean(data.inCarMeet);
        if (typeof data.combo === 'number' && Number.isFinite(data.combo)) {
          currPlayer.combo = data.combo;
        }
        if (typeof data.scoreDelta === 'number' && Number.isFinite(data.scoreDelta) && data.scoreDelta > 0) {
          currPlayer.bestScore += Math.round(data.scoreDelta);
          recomputeKing(session.roomCode);
        }
        if (typeof data.bestScore === 'number' && Number.isFinite(data.bestScore)) {
          if (data.bestScore > currPlayer.bestScore) {
            currPlayer.bestScore = Math.round(data.bestScore);
            recomputeKing(session.roomCode);
          }
        }

        if (currPlayer.duelId) {
          const duel = activeDuels.get(currPlayer.duelId);
          if (duel) {
            const pts = Math.round(currPlayer.speedKmh * 0.1 + currPlayer.combo * 8);
            if (duel.challengerId === playerId) duel.challengerScore += pts;
            else if (duel.opponentId === playerId) duel.opponentScore += pts;
            recomputeKing(session.roomCode);
          }
        }

        currPlayer.lastUpdateAt = Date.now();
        return;
      }

      if (type === 'backfire') {
        broadcastToRoom(
          session.roomCode,
          {
            type: 'remote_backfire',
            playerId,
          },
          playerId
        );
        return;
      }

      if (type === 'car_meet_like') {
        const targetId = typeof data.targetId === 'string' ? data.targetId : '';
        if (!targetId || targetId === playerId || session.likedTargets.has(targetId)) {
          return;
        }
        const target = currRoom?.get(targetId);
        if (!target) return;

        session.likedTargets.add(targetId);
        target.likes += 1;
        target.reputation += 25;
        target.bestScore += 250;
        recomputeKing(session.roomCode);

        sendToPlayer(targetId, {
          type: 'like_received',
          fromName: currPlayer.name,
          totalLikes: target.likes,
          reputationGain: 25,
        });
        ws.send(
          JSON.stringify({
            type: 'like_sent',
            targetId,
            targetName: target.name,
            totalLikes: target.likes,
          })
        );
        return;
      }

      if (type === 'headlight_flash') {
        broadcastToRoom(
          session.roomCode,
          {
            type: 'remote_flash',
            playerId,
          },
          playerId
        );

        if (currPlayer.duelId || currPlayer.mode !== 'HIGHWAY') return;

        // Find nearest rival in HIGHWAY within 48m in same room
        let bestTarget: PlayerRecord | null = null;
        let bestDist = 48;
        if (currRoom) {
          for (const other of currRoom.values()) {
            if (other.id === playerId || other.mode !== 'HIGHWAY' || other.duelId) continue;
            const d = Math.hypot(other.x - currPlayer.x, other.z - currPlayer.z);
            if (d < bestDist) {
              bestDist = d;
              bestTarget = other;
            }
          }
        }

        if (bestTarget) {
          const duelId = `duel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const duel: DuelRecord = {
            id: duelId,
            roomCode: session.roomCode,
            challengerId: playerId,
            challengerName: currPlayer.name,
            opponentId: bestTarget.id,
            opponentName: bestTarget.name,
            challengerScore: 0,
            opponentScore: 0,
            endsAt: Date.now() + 25000,
          };
          activeDuels.set(duelId, duel);
          currPlayer.duelId = duelId;
          bestTarget.duelId = duelId;

          const startPayload = {
            type: 'duel_started',
            duel: {
              id: duel.id,
              challengerId: duel.challengerId,
              challengerName: duel.challengerName,
              opponentId: duel.opponentId,
              opponentName: duel.opponentName,
              endsAt: duel.endsAt,
            },
          };
          sendToPlayer(playerId, startPayload);
          sendToPlayer(bestTarget.id, startPayload);
        }
      }
    });

    ws.on('close', () => {
      leaveCurrentRoom(playerId);
      clients.delete(playerId);
    });
  });

  // 20Hz authoritative snapshot + duel expiry loop
  setInterval(() => {
    const now = Date.now();

    for (const [duelId, duel] of activeDuels.entries()) {
      const room = rooms.get(duel.roomCode);
      const p1 = room?.get(duel.challengerId);
      const p2 = room?.get(duel.opponentId);
      if (!p1 || !p2 || now >= duel.endsAt) {
        let winnerId: string | null = null;
        let winnerName = 'Empate';
        if (duel.challengerScore > duel.opponentScore) {
          winnerId = duel.challengerId;
          winnerName = duel.challengerName;
        } else if (duel.opponentScore > duel.challengerScore) {
          winnerId = duel.opponentId;
          winnerName = duel.opponentName;
        }
        if (winnerId && room?.get(winnerId)) {
          const w = room.get(winnerId)!;
          w.bestScore += 2500;
          w.reputation += 120;
        }
        if (p1) p1.duelId = null;
        if (p2) p2.duelId = null;

        const finishMsg = {
          type: 'duel_finished',
          duelId,
          winnerId,
          winnerName,
          challengerScore: duel.challengerScore,
          opponentScore: duel.opponentScore,
        };
        sendToPlayer(duel.challengerId, finishMsg);
        sendToPlayer(duel.opponentId, finishMsg);
        activeDuels.delete(duelId);
        recomputeKing(duel.roomCode);
      }
    }

    for (const [roomCode, room] of rooms.entries()) {
      if (room.size === 0) continue;
      const players = Array.from(room.values());
      const duelsInRoom: Array<{
        id: string;
        challengerId: string;
        opponentId: string;
        challengerScore: number;
        opponentScore: number;
        remainingSec: number;
      }> = [];
      for (const d of activeDuels.values()) {
        if (d.roomCode === roomCode) {
          duelsInRoom.push({
            id: d.id,
            challengerId: d.challengerId,
            opponentId: d.opponentId,
            challengerScore: d.challengerScore,
            opponentScore: d.opponentScore,
            remainingSec: Math.max(0, Math.ceil((d.endsAt - now) / 1000)),
          });
        }
      }

      broadcastToRoom(roomCode, {
        type: 'room_snapshot',
        roomCode,
        players,
        duels: duelsInRoom,
      });
    }
  }, 50);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Ghost Driver server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
