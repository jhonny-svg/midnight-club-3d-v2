import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Crown,
  Flag,
  Flame,
  Radio,
  Settings,
  Swords,
  Target,
  Zap,
} from 'lucide-react';
import {
  formatPrimaryKeyLabel,
  GameSettings,
  getRankFromXp,
  HudSnapshot,
  SaveProfile,
} from '../game/types';

interface HighwayHUDProps {
  profile: SaveProfile;
  settings: GameSettings;
  hud: HudSnapshot;
  onExitHighway: () => void;
  onOpenSettings: () => void;
  onOpenProgression: () => void;
  onTogglePointerLock: () => void;
  onToggleTransmission: () => void;
  onToggleTcs: () => void;
  onToggleAbs: () => void;
  onShiftGear: (delta: 1 | -1) => void;
  onCycleRadio: () => void;
  onFlashHeadlights: () => void;
  onTouchControl: (key: 'throttle' | 'brake' | 'left' | 'right' | 'nitro', active: boolean) => void;
}

const DIAL_START_DEG = 135;
const DIAL_SWEEP_DEG = 270;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
  clockwise = true
): string {
  const diff = Math.abs(endAngleDeg - startAngleDeg);
  if (diff < 0.25) return '';
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, endAngleDeg);
  const largeArc = diff > 180 ? 1 : 0;
  const sweepFlag = clockwise ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function formatGear(gear: number): string {
  if (gear < 0) return 'R';
  if (gear === 0) return 'N';
  return String(gear);
}

export const HighwayHUD: React.FC<HighwayHUDProps> = ({
  profile,
  settings,
  hud,
  onExitHighway,
  onOpenSettings,
  onOpenProgression,
  onTogglePointerLock,
  onToggleTransmission,
  onToggleTcs,
  onToggleAbs,
  onShiftGear,
  onCycleRadio,
  onFlashHeadlights,
  onTouchControl,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const coarseMq = window.matchMedia('(pointer: coarse)');
    const fineHoverMq = window.matchMedia('(any-pointer: fine) and (hover: hover)');
    const checkTouchOnly = () =>
      setIsTouchDevice(
        coarseMq.matches && navigator.maxTouchPoints > 0 && !fineHoverMq.matches
      );
    checkTouchOnly();
    coarseMq.addEventListener('change', checkTouchOnly);
    fineHoverMq.addEventListener('change', checkTouchOnly);
    return () => {
      coarseMq.removeEventListener('change', checkTouchOnly);
      fineHoverMq.removeEventListener('change', checkTouchOnly);
    };
  }, []);

  const isMph = settings.speedUnits === 'MPH';
  const displaySpeed = isMph ? Math.round(hud.speedKmh * 0.621371) : hud.speedKmh;
  const speedUnitLabel = isMph ? 'MPH' : 'KM/H';
  const activeTx = profile.cars[profile.activeCarId]?.transmission ?? profile.transmission;

  const formatMissionProgress = () => {
    const m = hud.mission.mission;
    if (m.type === 'HIGH_SPEED_HOLD') {
      return `${hud.mission.progress.toFixed(1)}/${m.target}s`;
    }
    if (m.type === 'ONCOMING_DIST') {
      return `${Math.round(hud.mission.progress)}/${m.target}m`;
    }
    return `${Math.floor(hud.mission.progress)}/${m.target}`;
  };

  const enterExitKey = formatPrimaryKeyLabel(settings.keybindings.enterExitCar);
  const txKey = formatPrimaryKeyLabel(settings.keybindings.toggleTransmission);
  const shiftUpKey = formatPrimaryKeyLabel(settings.keybindings.shiftUp);
  const shiftDownKey = formatPrimaryKeyLabel(settings.keybindings.shiftDown);
  const pointerKey = formatPrimaryKeyLabel(settings.keybindings.togglePointerLock);
  const radioKey = formatPrimaryKeyLabel(settings.keybindings.toggleRadio);
  const flashKey = formatPrimaryKeyLabel(settings.keybindings.flashHeadlights);
  const pilotRank = getRankFromXp(profile.xp);

  // Tachometer calculations (scales cleanly from 8,000 RPM up to 11,000 RPM with CDI Racing)
  const dialMaxRpm = Math.max(8000, Math.ceil(hud.maxRpm / 1000) * 1000);
  const dialRedlineRpm = Math.max(5500, hud.maxRpm - 900);
  const majorTickCount = Math.round(dialMaxRpm / 1000);
  const totalHalfTicks = majorTickCount * 2 + 1;

  const clampedRpm = Math.min(dialMaxRpm, Math.max(0, hud.rpm));
  const rpmRatio = clampedRpm / dialMaxRpm;
  const needleDeg = DIAL_START_DEG + rpmRatio * DIAL_SWEEP_DEG;
  const redlineStartDeg = DIAL_START_DEG + (dialRedlineRpm / dialMaxRpm) * DIAL_SWEEP_DEG;
  const dialEndDeg = DIAL_START_DEG + DIAL_SWEEP_DEG;

  const isRedline = clampedRpm >= dialRedlineRpm;
  const turboSpooling = clampedRpm >= 4200;

  // Main RPM arc & redline arc (r = 90)
  const rpmBgPath = describeArc(120, 120, 90, DIAL_START_DEG, dialEndDeg);
  const redlineTrackPath = describeArc(120, 120, 90, redlineStartDeg, dialEndDeg);
  const rpmActivePath = describeArc(
    120,
    120,
    90,
    DIAL_START_DEG,
    Math.max(DIAL_START_DEG + 0.5, needleDeg)
  );

  // Lateral Nitro curved gauge on outer-left bezel (144° up to 216°)
  const nitroStartDeg = 144;
  const nitroMaxDeg = 216;
  const nitroRatio = Math.min(1, Math.max(0, hud.nitro / 100));
  const nitroFillDeg = nitroStartDeg + (nitroMaxDeg - nitroStartDeg) * nitroRatio;
  const nitroTrackPath = describeArc(120, 120, 108, nitroStartDeg, nitroMaxDeg);
  const nitroFillPath = describeArc(
    120,
    120,
    108,
    nitroStartDeg,
    Math.max(nitroStartDeg + 0.5, nitroFillDeg)
  );

  // Needle tip & tail coordinates
  const needleTip = polarToCartesian(120, 120, 92, needleDeg);
  const needleInner = polarToCartesian(120, 120, 44, needleDeg);
  const gearLabel = formatGear(hud.gear);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 md:p-5">
      {/* White Speed-Radar Flash Fullscreen Overlay */}
      {hud.radarFlashOpacity > 0.01 && (
        <div
          className="pointer-events-none fixed inset-0 z-30 bg-white"
          style={{ opacity: Math.min(0.9, hud.radarFlashOpacity) }}
        />
      )}

      {/* Bullet Time Extreme Near-Miss Border Vignette */}
      {hud.bulletTimeActive && (
        <div className="pointer-events-none fixed inset-0 z-20 border-4 border-sky-400/65 shadow-[inset_0_0_70px_rgba(56,189,248,0.28)]" />
      )}

      {/* Top Bar: Clean & Minimalist */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2">
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2 border border-white/10 bg-[#090b10]/90 px-3 py-1.5 shadow-lg">
            <button
              type="button"
              onClick={onExitHighway}
              className="flex items-center gap-1.5 border border-white/10 bg-[#141923] px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              title={`Volver al Parking [${enterExitKey}]`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Parking [{enterExitKey}]
            </button>

            <button
              type="button"
              onClick={onToggleTransmission}
              className="border border-white/10 bg-[#141923] px-2.5 py-1.5 font-telemetry text-xs font-bold text-amber-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              title={`Cambiar caja AT/MT [${txKey}]`}
            >
              Caja: {activeTx} [{txKey}]
            </button>

            <button
              type="button"
              onClick={onCycleRadio}
              className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-telemetry text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                hud.radioStation !== 'OFF'
                  ? 'border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200'
                  : 'border-white/10 bg-[#141923] text-slate-300 hover:text-white'
              }`}
              title={`Radio Phonk / Synthwave [${radioKey}]`}
            >
              <Radio className="h-3.5 w-3.5" />
              {hud.radioStation} [{radioKey}]
            </button>

            <button
              type="button"
              onClick={onFlashHeadlights}
              className="flex items-center gap-1.5 border border-white/10 bg-[#141923] px-2.5 py-1.5 font-telemetry text-xs font-bold text-sky-300 hover:border-sky-400/50 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              title={`Destellar largas / Retar duelo 1v1 [${flashKey}]`}
            >
              <Swords className="h-3.5 w-3.5" />
              Duelo [{flashKey}]
            </button>
          </div>

          {/* Discrete 1-line Active Mission Strip */}
          <div className="flex items-center gap-2 border border-white/10 bg-[#090b10]/88 px-3 py-1.5 text-[11px] shadow-lg">
            <Target className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">
              {hud.mission.mission.title}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-telemetry text-amber-300 font-semibold">
              {formatMissionProgress()}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-telemetry text-emerald-400 font-semibold">
              +${hud.mission.mission.reward.toLocaleString()}
            </span>
          </div>

          {/* Active CONTRATO EXPRESS Checkpoint & Timer Strip */}
          {hud.contractActive && (
            <div className="flex items-center gap-2 border border-amber-400/55 bg-[#1b1407]/94 px-3 py-1.5 text-[11px] shadow-lg">
              <Flag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-amber-200">
                Contrato Express
              </span>
              <span className="text-slate-500">·</span>
              <span className="font-telemetry font-bold text-white">
                CP {hud.contractCheckpointIdx}/{hud.contractCheckpointTotal}
              </span>
              <span className="text-slate-500">·</span>
              <span
                className={`font-telemetry font-bold ${
                  hud.contractTimerSec <= 15 ? 'text-red-400' : 'text-amber-300'
                }`}
              >
                {Math.max(0, Math.ceil(hud.contractTimerSec))}s
              </span>
              <span className="text-slate-500">·</span>
              <span className="font-telemetry font-bold text-emerald-400">+$18,000</span>
            </div>
          )}
        </div>

        {/* Top-Right: Distance + Session + Cash + Rank + Free Cam [Tab] + Settings Gear */}
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 border border-white/10 bg-[#090b10]/90 px-3.5 py-2 shadow-lg">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Distancia</div>
            <div className="font-telemetry text-sm font-bold text-slate-100">
              {hud.distanceKm.toFixed(2)} km
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Sesión</div>
            <div className="font-telemetry text-sm font-bold text-sky-400">
              +${hud.sessionEarnings.toLocaleString()}
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Fondos</div>
            <div className="font-telemetry text-base font-extrabold text-emerald-400">
              ${profile.cash.toLocaleString()}
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <button
            type="button"
            onClick={onOpenProgression}
            title="Rango de Piloto y Desafíos"
            className="flex h-7 items-center gap-1 border border-amber-400/35 bg-amber-500/10 px-2 text-amber-300 hover:border-amber-300 hover:text-white cursor-pointer"
          >
            <Award className="h-3.5 w-3.5" />
            <span className="font-telemetry text-[10px] font-bold">Nv.{pilotRank}</span>
          </button>
          <button
            type="button"
            onClick={onTogglePointerLock}
            title={
              hud.pointerLocked
                ? `Soltar cámara libre 360° [${pointerKey}]`
                : `Cámara libre 360° [${pointerKey}]`
            }
            aria-label="Alternar cámara libre 360 grados"
            className={`flex h-7 w-7 items-center justify-center border transition-colors cursor-pointer ${
              hud.pointerLocked
                ? 'border-[#e10600] bg-[#e10600]/20 text-white'
                : 'border-white/10 bg-[#141923] text-slate-300 hover:text-white'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Abrir Ajustes"
            title="Ajustes"
            className="flex h-7 w-7 items-center justify-center border border-white/10 bg-[#141923] text-slate-300 hover:text-white cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Transient Event Banners & Active 1v1 Duel Scoreboard (Crown only inside active online duel) */}
      <div className="mx-auto flex flex-col items-center gap-1.5 pointer-events-none">
        {hud.duelState && (
          <div className="flex items-center gap-3 border border-sky-400/55 bg-[#091526]/95 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            <Swords className="h-3.5 w-3.5 text-sky-400" />
            {hud.duelState.resultBanner ? (
              <span className="text-amber-300">{hud.duelState.resultBanner}</span>
            ) : (
              <>
                <span className="uppercase tracking-wider text-sky-300">Duelo</span>
                <span className="flex items-center gap-1 font-telemetry text-emerald-300">
                  {hud.duelState.myScore > hud.duelState.opponentScore && (
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  TÚ {hud.duelState.myScore}
                </span>
                <span className="text-slate-500">vs</span>
                <span className="flex items-center gap-1 font-telemetry text-red-300">
                  {hud.duelState.opponentScore > hud.duelState.myScore && (
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  {hud.duelState.opponentName} {hud.duelState.opponentScore}
                </span>
                <span className="font-telemetry text-amber-300">
                  · {Math.max(0, Math.ceil(hud.duelState.remainingSec))}s
                </span>
              </>
            )}
          </div>
        )}
        {hud.extremeRoceBanner && (
          <div className="border border-sky-300/75 bg-[#071c2c]/95 px-5 py-1.5 font-telemetry text-sm font-black tracking-wider text-sky-200 shadow-2xl">
            {hud.extremeRoceBanner}
          </div>
        )}
        {hud.radarResultBanner && (
          <div className="border border-cyan-300/70 bg-[#081a24]/95 px-4 py-1 font-telemetry text-xs font-extrabold text-cyan-200 shadow-lg">
            {hud.radarResultBanner}
          </div>
        )}
        {hud.contractBanner && (
          <div className="border border-amber-400/65 bg-[#1b1507]/95 px-4 py-1.5 text-xs font-extrabold text-amber-200 shadow-lg">
            {hud.contractBanner}
          </div>
        )}
        {hud.mission.completedBanner && (
          <div className="border border-emerald-400/50 bg-[#0d1f18]/95 px-4 py-1.5 text-xs font-extrabold text-emerald-300 shadow-lg">
            {hud.mission.completedBanner}
          </div>
        )}
        {hud.nearMissBanner && (
          <div className="border border-amber-400/40 bg-[#14171f]/95 px-3.5 py-1 font-telemetry text-xs font-bold text-amber-300">
            {hud.nearMissBanner}
          </div>
        )}
        {hud.crashBanner && (
          <div className="border border-red-500/50 bg-[#230e12]/95 px-4 py-1 text-xs font-extrabold text-red-300">
            {hud.crashBanner}
          </div>
        )}
      </div>

      {/* Bottom HUD: Circular Assetto Corsa Tachometer (bottom-right on desktop, center on mobile touch) */}
      <div className="flex items-end justify-between gap-3">
        {/* Left: Touch Quick Bar (Automático/Manual, TCS, ABS, Salida) + Steering Pads (Mobile ONLY) */}
        {isTouchDevice ? (
          <div className="pointer-events-auto flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-1.5 border border-white/10 bg-[#090b10]/92 p-1 shadow-lg">
              <button
                type="button"
                onClick={onToggleTransmission}
                className="border border-white/15 bg-[#141923] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 active:bg-slate-700 cursor-pointer"
              >
                {activeTx === 'AT' ? 'Automático' : 'Manual'}
              </button>
              <button
                type="button"
                onClick={onToggleTcs}
                className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                  settings.tcsEnabled
                    ? 'border-sky-400/50 bg-sky-500/20 text-sky-200'
                    : 'border-white/15 bg-[#141923] text-slate-400'
                }`}
              >
                TCS
              </button>
              <button
                type="button"
                onClick={onToggleAbs}
                className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                  settings.absEnabled
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                    : 'border-white/15 bg-[#141923] text-slate-400'
                }`}
              >
                ABS
              </button>
              <button
                type="button"
                onClick={onExitHighway}
                className="border border-red-400/35 bg-[#201015] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200 active:bg-red-700 cursor-pointer"
              >
                Salida
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => onTouchControl('left', true)}
                onPointerUp={() => onTouchControl('left', false)}
                onPointerLeave={() => onTouchControl('left', false)}
                onPointerCancel={() => onTouchControl('left', false)}
                className="flex h-14 w-14 items-center justify-center border border-white/15 bg-[#090b10]/92 text-white active:bg-[#e10600] cursor-pointer"
                aria-label="Girar izquierda"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onPointerDown={() => onTouchControl('right', true)}
                onPointerUp={() => onTouchControl('right', false)}
                onPointerLeave={() => onTouchControl('right', false)}
                onPointerCancel={() => onTouchControl('right', false)}
                className="flex h-14 w-14 items-center justify-center border border-white/15 bg-[#090b10]/92 text-white active:bg-[#e10600] cursor-pointer"
                aria-label="Girar derecha"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Circular Assetto Corsa / Motorsport Analog-Digital Tachometer */}
        {settings.showSpeedometer && (
          <div
            className={`flex flex-col items-center ${
              isTouchDevice ? '' : 'ml-auto'
            }`}
          >
            {/* Extreme "No Hesi" Combo x1..x25 + Pending Cash at Risk */}
            {(hud.combo > 0 || hud.pendingCash > 0) && (
              <div className="mb-1.5 w-52 border border-amber-400/35 bg-[#090b10]/94 px-3 py-1.5 shadow-lg">
                <div className="flex items-center justify-between text-[10px] font-telemetry font-bold mb-0.5">
                  <span className="flex items-center gap-1 text-amber-300 uppercase">
                    <Flame className="h-3 w-3 text-[#e10600]" />
                    No Hesi x{hud.comboMultiplier}
                  </span>
                  <span className="text-emerald-300">
                    ${hud.pendingCash.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                  <span>{hud.combo} roces en cadena</span>
                  <span className="text-amber-200/80">¡No choques!</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${Math.max(2, hud.pendingBankTimerRatio * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="relative h-[228px] w-[228px] md:h-[246px] md:w-[246px] select-none">
              <svg
                viewBox="0 0 240 240"
                className="h-full w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)]"
                role="img"
                aria-label={`Tacómetro ${displaySpeed} ${speedUnitLabel}, marcha ${gearLabel}, ${Math.round(clampedRpm)} RPM`}
              >
                <defs>
                  <radialGradient id="acDialBg" cx="50%" cy="48%" r="54%">
                    <stop offset="0%" stopColor="#141923" stopOpacity="0.96" />
                    <stop offset="78%" stopColor="#090b10" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#05070b" stopOpacity="0.98" />
                  </radialGradient>
                  <linearGradient id="acRpmSweep" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="65%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#e10600" />
                  </linearGradient>
                </defs>

                {/* Outer Dial Housing */}
                <circle
                  cx="120"
                  cy="120"
                  r="102"
                  fill="url(#acDialBg)"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="97"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />

                {/* Lateral NITRO Arc Gauge (Left Outer Bezel) */}
                {nitroTrackPath && (
                  <path
                    d={nitroTrackPath}
                    fill="none"
                    stroke="rgba(56,189,248,0.16)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                )}
                {nitroFillPath && hud.nitro > 0 && (
                  <path
                    d={nitroFillPath}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                )}

                {/* RPM Track & Redline Background Arc */}
                <path
                  d={rpmBgPath}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="7"
                  strokeLinecap="butt"
                />
                <path
                  d={redlineTrackPath}
                  fill="none"
                  stroke="rgba(225,6,0,0.34)"
                  strokeWidth="7"
                  strokeLinecap="butt"
                />

                {/* Active Illuminated RPM Arc */}
                {rpmActivePath && (
                  <path
                    d={rpmActivePath}
                    fill="none"
                    stroke={isRedline ? '#ff1e1e' : 'url(#acRpmSweep)'}
                    strokeWidth="7"
                    strokeLinecap="butt"
                  />
                )}

                {/* Major & Minor RPM Ticks (0 .. dialMaxRpm) */}
                {Array.from({ length: totalHalfTicks }).map((_, idx) => {
                  const rpmVal = idx * 500;
                  const isMajor = idx % 2 === 0;
                  const isRed = rpmVal >= dialRedlineRpm;
                  const deg = DIAL_START_DEG + (rpmVal / dialMaxRpm) * DIAL_SWEEP_DEG;
                  const pOuter = polarToCartesian(120, 120, 95, deg);
                  const pInner = polarToCartesian(120, 120, isMajor ? 83 : 88, deg);
                  const pLabel = polarToCartesian(120, 120, 70, deg);

                  return (
                    <g key={rpmVal}>
                      <line
                        x1={pOuter.x}
                        y1={pOuter.y}
                        x2={pInner.x}
                        y2={pInner.y}
                        stroke={
                          isRed
                            ? '#ef4444'
                            : isMajor
                              ? 'rgba(241,245,249,0.88)'
                              : 'rgba(148,163,184,0.45)'
                        }
                        strokeWidth={isMajor ? 2 : 1}
                      />
                      {isMajor && (
                        <text
                          x={pLabel.x}
                          y={pLabel.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isRed ? '#f87171' : '#cbd5e1'}
                          fontSize="11"
                          fontWeight="700"
                          className="font-telemetry"
                        >
                          {idx / 2}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Real-Time Animated Red Needle */}
                <line
                  x1={needleInner.x}
                  y1={needleInner.y}
                  x2={needleTip.x}
                  y2={needleTip.y}
                  stroke="#e10600"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle
                  cx={needleTip.x}
                  cy={needleTip.y}
                  r="1.8"
                  fill="#ff4d4d"
                />

                {/* Clean Inner Telemetry Disc */}
                <circle
                  cx="120"
                  cy="120"
                  r="52"
                  fill="#080a0f"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />

                {/* x1000 RPM sub-label */}
                <text
                  x="120"
                  y="83"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="7.5"
                  fontWeight="600"
                  letterSpacing="1.2"
                >
                  RPM x1000
                </text>

                {/* Large Central Digital Speed */}
                <text
                  x="120"
                  y="112"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="36"
                  fontWeight="800"
                  className="font-telemetry"
                >
                  {displaySpeed}
                </text>
                <text
                  x="120"
                  y="134"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="700"
                  letterSpacing="1.5"
                >
                  {speedUnitLabel}
                </text>

                {/* Central Gear & AT/MT Indicator */}
                <rect
                  x="96"
                  y="145"
                  width="48"
                  height="22"
                  rx="2"
                  fill="rgba(255,255,255,0.04)"
                  stroke={isRedline ? '#e10600' : 'rgba(255,255,255,0.14)'}
                  strokeWidth="1"
                />
                <text
                  x="111"
                  y="156.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isRedline ? '#ff3b30' : '#e10600'}
                  fontSize="14"
                  fontWeight="800"
                  className="font-telemetry"
                >
                  {gearLabel}
                </text>
                <line
                  x1="122"
                  y1="149"
                  x2="122"
                  y2="163"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="1"
                />
                <text
                  x="133"
                  y="156.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#cbd5e1"
                  fontSize="8.5"
                  fontWeight="700"
                  className="font-telemetry"
                >
                  {activeTx}
                </text>

                {/* Bottom Bezel Tell-Tales: Headlights + Turbo + TCS + CDI */}
                <g transform="translate(80, 184)">
                  {/* Headlights Tell-Tale (ON) */}
                  <path
                    d="M4 4 C1 4 0 8 4 8 L7 8 L7 4 Z"
                    fill="#34d399"
                  />
                  <line x1="8.5" y1="4.2" x2="12" y2="3.2" stroke="#34d399" strokeWidth="1.2" />
                  <line x1="8.5" y1="6" x2="12" y2="6" stroke="#34d399" strokeWidth="1.2" />
                  <line x1="8.5" y1="7.8" x2="12" y2="8.8" stroke="#34d399" strokeWidth="1.2" />

                  {/* Turbo Boost Tell-Tale */}
                  <text
                    x="30"
                    y="7.5"
                    textAnchor="middle"
                    fill={turboSpooling ? '#f59e0b' : '#475569'}
                    fontSize="7.5"
                    fontWeight="800"
                    letterSpacing="0.8"
                    className="font-telemetry"
                  >
                    TURBO
                  </text>

                  {/* TCS Tell-Tale */}
                  <text
                    x="55"
                    y="7.5"
                    textAnchor="middle"
                    fill={settings.tcsEnabled ? '#38bdf8' : '#475569'}
                    fontSize="7.5"
                    fontWeight="700"
                    letterSpacing="0.6"
                    className="font-telemetry"
                  >
                    TCS
                  </text>

                  {/* CDI Racing Tell-Tale */}
                  <text
                    x="76"
                    y="7.5"
                    textAnchor="middle"
                    fill={
                      hud.cdiRacing
                        ? hud.revLimiterActive
                          ? '#ff2a2a'
                          : '#f59e0b'
                        : '#334155'
                    }
                    fontSize="7.5"
                    fontWeight="800"
                    letterSpacing="0.6"
                    className="font-telemetry"
                  >
                    CDI
                  </text>
                </g>

                {/* NITRO % Readout beside Left Arc */}
                <text
                  x="17"
                  y="153"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="8.5"
                  fontWeight="800"
                  className="font-telemetry"
                >
                  N2O
                </text>
                <text
                  x="17"
                  y="163"
                  textAnchor="middle"
                  fill="#bae6fd"
                  fontSize="8"
                  fontWeight="700"
                  className="font-telemetry"
                >
                  {hud.nitro}%
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* Right: Pedals & Manual Shift Controls (Mobile / Touch Devices ONLY) */}
        {isTouchDevice && (
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            {activeTx === 'MT' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onShiftGear(-1)}
                  className="border border-white/15 bg-[#090b10]/92 px-3 py-1.5 text-xs font-bold text-slate-200 active:bg-slate-700 cursor-pointer"
                >
                  Gear - [{shiftDownKey}]
                </button>
                <button
                  type="button"
                  onClick={() => onShiftGear(1)}
                  className="border border-white/15 bg-[#090b10]/92 px-3 py-1.5 text-xs font-bold text-slate-200 active:bg-slate-700 cursor-pointer"
                >
                  Gear + [{shiftUpKey}]
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => onTouchControl('nitro', true)}
                onPointerUp={() => onTouchControl('nitro', false)}
                onPointerLeave={() => onTouchControl('nitro', false)}
                onPointerCancel={() => onTouchControl('nitro', false)}
                className="flex h-14 px-3.5 flex-col items-center justify-center border border-sky-400/40 bg-[#0d2238]/92 text-xs font-extrabold text-sky-200 active:bg-sky-500 active:text-slate-950 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 mb-0.5" />
                <span>NITRO</span>
              </button>

              <button
                type="button"
                onPointerDown={() => onTouchControl('brake', true)}
                onPointerUp={() => onTouchControl('brake', false)}
                onPointerLeave={() => onTouchControl('brake', false)}
                onPointerCancel={() => onTouchControl('brake', false)}
                className="flex h-14 px-3.5 flex-col items-center justify-center border border-white/15 bg-[#090b10]/92 text-xs font-bold text-slate-200 active:bg-amber-600 cursor-pointer"
              >
                <span>FRENO</span>
              </button>

              <button
                type="button"
                onPointerDown={() => onTouchControl('throttle', true)}
                onPointerUp={() => onTouchControl('throttle', false)}
                onPointerLeave={() => onTouchControl('throttle', false)}
                onPointerCancel={() => onTouchControl('throttle', false)}
                className="flex h-14 px-5 flex-col items-center justify-center border border-red-400/40 bg-[#e10600]/92 text-xs font-extrabold text-white active:bg-red-500 cursor-pointer"
              >
                <span>GAS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
