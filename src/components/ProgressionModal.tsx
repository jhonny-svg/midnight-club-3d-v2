import React from 'react';
import {
  Award,
  Calendar,
  Camera,
  Check,
  Crown,
  Gift,
  Lock,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import {
  DAILY_REWARDS_SCHEDULE,
  getRankFromXp,
  getTodayDateKey,
  getXpProgressInRank,
  SaveProfile,
} from '../game/types';

interface ProgressionModalProps {
  open: boolean;
  profile: SaveProfile;
  onClose: () => void;
  onClaimDailyReward: () => void;
  onClaimChallenge: (challengeId: string) => void;
}

const RADAR_LIST = [
  { id: 'radar_1', label: 'Radar 01 · Recta Norte', limit: 180 },
  { id: 'radar_2', label: 'Radar 02 · Curva Bahía', limit: 200 },
  { id: 'radar_3', label: 'Radar 03 · Túnel Oeste', limit: 220 },
  { id: 'radar_4', label: 'Radar 04 · Recta Wangan', limit: 240 },
];

const PROTOTYPE_UNLOCKS = [
  {
    rank: 5,
    title: 'Pintura Camaleón Tornasolada',
    desc: 'Acabado iridiscente multicapa que cambia de color según la luz en el Taller.',
  },
  {
    rank: 10,
    title: 'Turbo de Titanio (Stage 4)',
    desc: 'Desbloquea el cuarto nivel de sobrealimentación (+65% HP y +52 km/h punta).',
  },
  {
    rank: 15,
    title: 'Neón Inferior Pulso',
    desc: 'Kit de iluminación RGB pulsante sincronizado para Car Meets nocturnos.',
  },
];

export const ProgressionModal: React.FC<ProgressionModalProps> = ({
  open,
  profile,
  onClose,
  onClaimDailyReward,
  onClaimChallenge,
}) => {
  if (!open) return null;

  const xpStats = getXpProgressInRank(profile.xp);
  const rank = getRankFromXp(profile.xp);
  const today = getTodayDateKey();
  const canClaimDaily = profile.lastDailyClaimDate !== today;
  const nextStreakDay = canClaimDaily
    ? (profile.dailyStreak % 7) + 1
    : Math.max(1, ((profile.dailyStreak - 1) % 7) + 1);

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progression-modal-title"
    >
      <div className="flex w-full max-w-4xl flex-col border border-white/[0.12] bg-[#090b10] shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-6 w-[3px] bg-amber-400" />
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-300 font-semibold">
                <Award className="h-3 w-3" />
                Licencia de Piloto · {profile.playerName}
              </div>
              <h2
                id="progression-modal-title"
                className="font-display text-xl font-semibold uppercase tracking-wider text-white"
              >
                Progreso, Rango & Desafíos
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-white/[0.1] bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white cursor-pointer"
            aria-label="Cerrar progreso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Pilot Rank + XP + Reputation + Best Combo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 border border-amber-400/30 bg-[#0d111a] p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-semibold">
                    Rango de Piloto
                  </div>
                  <div className="font-display text-2xl font-bold text-white">
                    Nivel {rank}
                  </div>
                </div>
                <div className="text-right font-telemetry">
                  <div className="text-xs font-bold text-white">
                    {xpStats.currentXp.toLocaleString()} / {xpStats.nextLevelXp.toLocaleString()} XP
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Total: {profile.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
              <div className="mt-2.5 h-2 w-full bg-white/[0.08]">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${Math.round(xpStats.ratio * 100)}%` }}
                />
              </div>
            </div>

            <div className="border border-white/[0.08] bg-[#06080c] p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-sky-300 font-semibold">
                <Crown className="h-3.5 w-3.5" />
                Reputación Car Meet
              </div>
              <div className="font-telemetry text-2xl font-bold text-white mt-1">
                {profile.reputation.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">REP</span>
              </div>
            </div>

            <div className="border border-white/[0.08] bg-[#06080c] p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#e10600] font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Mejor Combo No Hesi
              </div>
              <div className="font-telemetry text-2xl font-bold text-white mt-1">
                x{profile.bestNoHesiCombo}
              </div>
            </div>
          </div>

          {/* Daily Login Streak (Days 1-7) */}
          <section className="border border-white/[0.08] bg-[#06080c] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Recompensas Diarias (Racha: {profile.dailyStreak} días)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Conecta cada día para multiplicar tus créditos y experiencia inicial
                </div>
              </div>
              <button
                type="button"
                disabled={!canClaimDaily}
                onClick={onClaimDailyReward}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  canClaimDaily
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer'
                    : 'border border-white/10 bg-white/[0.03] text-slate-500 cursor-default'
                }`}
              >
                <Gift className="h-3.5 w-3.5" />
                {canClaimDaily ? `Reclamar Día ${nextStreakDay}` : 'Recompensa de hoy reclamada'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {DAILY_REWARDS_SCHEDULE.map((item) => {
                const claimedAlready = canClaimDaily
                  ? item.day < nextStreakDay
                  : item.day <= nextStreakDay;
                const isTodayTarget = item.day === nextStreakDay && canClaimDaily;
                return (
                  <div
                    key={item.day}
                    className={`border p-2.5 text-center ${
                      isTodayTarget
                        ? 'border-emerald-400 bg-emerald-500/15'
                        : claimedAlready
                          ? 'border-white/10 bg-white/[0.03] opacity-60'
                          : 'border-white/[0.08] bg-black/40'
                    }`}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-300">
                      {item.label}
                    </div>
                    <div className="font-telemetry text-xs font-bold text-white mt-1">
                      +${item.cash.toLocaleString()}
                    </div>
                    <div className="font-telemetry text-[10px] text-amber-300">
                      +{item.xp} XP
                    </div>
                    <div className="mt-1.5 text-[9px] font-semibold uppercase">
                      {claimedAlready ? (
                        <span className="text-emerald-400">Listo</span>
                      ) : isTodayTarget ? (
                        <span className="text-emerald-300">Disponible</span>
                      ) : (
                        <span className="text-slate-500">Pendiente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3 Daily Challenges */}
          <section className="border border-white/[0.08] bg-[#06080c] p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400 mb-3">
              <Target className="h-3.5 w-3.5" />
              Desafíos Diarios ({today})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {profile.dailyChallenges.map((ch) => {
                const done = ch.progress >= ch.target;
                const pct = Math.min(100, Math.round((ch.progress / Math.max(1, ch.target)) * 100));
                const displayProg =
                  ch.type === 'HIGHWAY_KM' || ch.type === 'WRONG_WAY_KM'
                    ? `${ch.progress.toFixed(1)}/${ch.target} km`
                    : `${Math.min(ch.target, Math.floor(ch.progress))}/${ch.target}`;
                return (
                  <div
                    key={ch.id}
                    className={`flex flex-col justify-between border p-3 ${
                      ch.claimed
                        ? 'border-emerald-500/30 bg-emerald-950/15'
                        : done
                          ? 'border-amber-400/60 bg-amber-500/10'
                          : 'border-white/[0.08] bg-black/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                          {ch.title}
                        </h3>
                        <span className="font-telemetry text-[10px] font-bold text-slate-300">
                          {displayProg}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{ch.description}</p>
                      <div className="mt-2 h-1.5 w-full bg-white/[0.08]">
                        <div
                          className={`h-full ${done ? 'bg-emerald-400' : 'bg-sky-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2">
                      <span className="font-telemetry text-[10px] font-semibold text-emerald-300">
                        +${ch.rewardCash.toLocaleString()} · +{ch.rewardXp} XP
                      </span>
                      {ch.claimed ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400">
                          <Check className="h-3 w-3" />
                          Cobrado
                        </span>
                      ) : done ? (
                        <button
                          type="button"
                          onClick={() => onClaimChallenge(ch.id)}
                          className="bg-amber-400 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-950 hover:bg-amber-300 cursor-pointer"
                        >
                          Reclamar
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase text-slate-500">En curso</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom Grid: Prototype Unlocks + Speed Radar Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="border border-white/[0.08] bg-[#06080c] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-300 mb-2.5">
                Piezas Prototipo por Rango
              </div>
              <div className="space-y-2">
                {PROTOTYPE_UNLOCKS.map((u) => {
                  const unlocked = rank >= u.rank;
                  return (
                    <div
                      key={u.rank}
                      className={`flex items-start justify-between gap-3 border p-2.5 ${
                        unlocked
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-white/[0.07] bg-black/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">{u.title}</div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5">{u.desc}</div>
                      </div>
                      <span
                        className={`shrink-0 flex items-center gap-1 border px-2 py-0.5 font-telemetry text-[10px] font-bold uppercase ${
                          unlocked
                            ? 'border-emerald-400/50 text-emerald-300'
                            : 'border-white/15 text-slate-400'
                        }`}
                      >
                        {unlocked ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        Nv.{u.rank}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="border border-white/[0.08] bg-[#06080c] p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-2.5">
                <Camera className="h-3.5 w-3.5" />
                Récords de Radares del Highway
              </div>
              <div className="space-y-2">
                {RADAR_LIST.map((r) => {
                  const rec = profile.radarRecords[r.id] ?? 0;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border border-white/[0.07] bg-black/40 px-3 py-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{r.label}</div>
                        <div className="text-[10px] text-slate-400">Mínimo activación: {r.limit} km/h</div>
                      </div>
                      <div className="font-telemetry text-sm font-bold text-cyan-300">
                        {rec > 0 ? `${rec} km/h` : '-- km/h'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
