import { GameMode, PaintFinish, RimDesign, SpoilerOption } from './types';

export interface OnlinePlayerRecord {
  id: string;
  name: string;
  carId: string;
  paint: string;
  paintFinish: PaintFinish;
  rimColor: string;
  rimDesign: RimDesign;
  underglow: string;
  spoiler: SpoilerOption;
  mode: GameMode;
  x: number;
  y: number;
  z: number;
  rotY: number;
  speedKmh: number;
  gear: number;
  inCarMeet: boolean;
  combo: number;
  likes: number;
  score: number;
  isKing: boolean;
}

export interface OnlineDuelSnapshot {
  id: string;
  challengerId: string;
  opponentId: string;
  challengerScore: number;
  opponentScore: number;
  remainingSec: number;
}

export interface OnlineClientCallbacks {
  onWelcome?: (playerId: string, roomCode: string) => void;
  onRoomJoined?: (roomCode: string, playerId: string) => void;
  onSnapshot?: (
    roomCode: string,
    players: OnlinePlayerRecord[],
    duels: OnlineDuelSnapshot[]
  ) => void;
  onRemoteBackfire?: (playerId: string) => void;
  onRemoteFlash?: (playerId: string) => void;
  onLikeReceived?: (fromName: string, totalLikes: number, reputationGain: number) => void;
  onLikeSent?: (targetId: string, targetName: string, totalLikes: number) => void;
  onDuelStarted?: (duel: {
    id: string;
    challengerId: string;
    challengerName: string;
    opponentId: string;
    opponentName: string;
    endsAt: number;
  }) => void;
  onDuelFinished?: (data: {
    duelId: string;
    winnerId: string | null;
    winnerName: string | null;
    challengerScore: number;
    opponentScore: number;
  }) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export class OnlineClient {
  private ws: WebSocket | null = null;
  private callbacks: OnlineClientCallbacks;
  private reconnectTimer: number | null = null;
  private disposed = false;
  private connected = false;
  private playerId = '';
  private roomCode = 'PUBLIC';
  private playerName = 'GHOST_078';

  constructor(callbacks: OnlineClientCallbacks) {
    this.callbacks = callbacks;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public connect(initialName?: string) {
    if (initialName) this.playerName = initialName;
    if (this.disposed) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${proto}//${window.location.host}/ws`;
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        this.connected = true;
        this.callbacks.onConnectionChange?.(true);
        this.sendRaw({
          type: 'join_room',
          roomCode: this.roomCode || 'PUBLIC',
          name: this.playerName,
        });
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data));
          switch (msg.type) {
            case 'welcome':
              this.playerId = String(msg.playerId || '');
              this.roomCode = String(msg.roomCode || 'PUBLIC');
              this.callbacks.onWelcome?.(this.playerId, this.roomCode);
              break;
            case 'room_joined':
              this.roomCode = String(msg.roomCode || 'PUBLIC');
              this.playerId = String(msg.playerId || this.playerId);
              this.callbacks.onRoomJoined?.(this.roomCode, this.playerId);
              break;
            case 'room_snapshot':
              this.roomCode = String(msg.roomCode || this.roomCode);
              this.callbacks.onSnapshot?.(
                this.roomCode,
                Array.isArray(msg.players) ? msg.players : [],
                Array.isArray(msg.duels) ? msg.duels : []
              );
              break;
            case 'remote_backfire':
              if (msg.playerId) this.callbacks.onRemoteBackfire?.(String(msg.playerId));
              break;
            case 'remote_flash':
              if (msg.playerId) this.callbacks.onRemoteFlash?.(String(msg.playerId));
              break;
            case 'like_received':
              this.callbacks.onLikeReceived?.(
                String(msg.fromName || 'Piloto'),
                Number(msg.totalLikes || 0),
                Number(msg.reputationGain || 25)
              );
              break;
            case 'like_sent':
              this.callbacks.onLikeSent?.(
                String(msg.targetId || ''),
                String(msg.targetName || 'Piloto'),
                Number(msg.totalLikes || 0)
              );
              break;
            case 'duel_started':
              if (msg.duel) this.callbacks.onDuelStarted?.(msg.duel);
              break;
            case 'duel_finished':
              this.callbacks.onDuelFinished?.({
                duelId: String(msg.duelId || ''),
                winnerId: msg.winnerId ? String(msg.winnerId) : null,
                winnerName: msg.winnerName ? String(msg.winnerName) : null,
                challengerScore: Number(msg.challengerScore || 0),
                opponentScore: Number(msg.opponentScore || 0),
              });
              break;
          }
        } catch {
          // ignore malformed WS frames
        }
      };

      ws.onclose = () => {
        this.connected = false;
        this.ws = null;
        this.callbacks.onConnectionChange?.(false);
        if (!this.disposed && this.reconnectTimer === null) {
          this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 3500);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // ignore WS failure
    }
  }

  public joinRoom(opts: { roomCode?: string; createPrivate?: boolean; name?: string }) {
    if (opts.name) this.playerName = opts.name;
    if (opts.roomCode && !opts.createPrivate) {
      this.roomCode = opts.roomCode.toUpperCase();
    }
    this.sendRaw({
      type: 'join_room',
      roomCode: opts.roomCode,
      createPrivate: Boolean(opts.createPrivate),
      name: this.playerName,
    });
  }

  public sendState(payload: {
    name: string;
    carId: string;
    paint: string;
    paintFinish: PaintFinish;
    rimColor: string;
    rimDesign: RimDesign;
    underglow: string;
    spoiler: SpoilerOption;
    mode: GameMode;
    x: number;
    y: number;
    z: number;
    rotY: number;
    speedKmh: number;
    gear: number;
    inCarMeet: boolean;
    combo: number;
    scoreDelta?: number;
    bestScore?: number;
  }) {
    this.playerName = payload.name;
    this.sendRaw({ type: 'state', ...payload });
  }

  public sendBackfire() {
    this.sendRaw({ type: 'backfire' });
  }

  public sendCarMeetLike(targetId: string) {
    this.sendRaw({ type: 'car_meet_like', targetId });
  }

  public sendHeadlightFlash() {
    this.sendRaw({ type: 'headlight_flash' });
  }

  private sendRaw(data: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  public dispose() {
    this.disposed = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
    this.connected = false;
  }
}
