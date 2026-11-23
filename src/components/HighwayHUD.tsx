import React from 'react';
import {
  ArrowLeft,
  Award,
  Camera,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Crown,
  Flag,
  Flame,
  Lightbulb,
  LogOut,
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
  HudElementLayout,
  HudSnapshot,
  SaveProfile,
} from '../game/types';
import { MultiTouchHoldButton, useTouchControlsActive } from './MultiTouchButton';
import { TachometerDial } from './TachometerDial';

interface HighwayHUDProps {
  profile: SaveProfile;
  settings: GameSettings;
  hud: HudSnapshot;
  onExitHighway: () => void;
  onOpenSettings: () => void;
  onOpenProgression: () => void;
  onTogglePointerLock: () => void;
  onCycleCamera: () => void;
  onToggleTransmission: () => void;
  onToggleTcs: () => void;
  onToggleAbs: () => void;
  onShiftGear: (delta: 1 | -1) => void;
  onCycleRadio: () => void;
  onFlashHeadlights: () => void;
  onTouchControl: (key: 'throttle' | 'brake' | 'left' | 'right' | 'nitro', active: boolean) => void;
}

function getHudElementStyle(layout: HudElementLayout): React.CSSProperties {
  return {
    left: `${layout.x}%`,
    top: `${layout.y}%`,
    opacity: layout.opacity,
    transform: `translate(-50%, -50%) scale(${layout.scale})`,
    touchAction: 'none',
  };
}

export const HighwayHUD: React.FC<HighwayHUDProps> = ({
  profile,
  settings,
  hud,
  onExitHighway,
  onOpenSettings,
  onOpenProgression,
  onTogglePointerLock,
  onCycleCamera,
  onToggleTransmission,
  onToggleTcs,
  onToggleAbs,
  onShiftGear,
  onCycleRadio,
  onFlashHeadlights,
  onTouchControl,
}) => {
  const isTouchDevice = useTouchControlsActive(settings.touchControlsMode);

  const isMph = settings.speedUnits === 'MPH';
  const displaySpeed = isMph ? Math.round(hud.speedKmh * 0.621371) : hud.speedKmh;
  const speedUnitLabel = isMph ? 'MPH' : 'KM/H';
  const activeTx = profile.cars[profile.activeCarId]?.transmission ?? profile.transmission;
  const cameraLabel =
    hud.cameraPreset === 'HOOD'
      ? 'Cabina'
      : hud.cameraPreset === 'BUMPER'
        ? 'Frontal'
        : 'Ext.';
  const stopTouchPropagation = (e: React.TouchEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

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
  const customHud = settings.customHud;

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
          <div
            onTouchStart={stopTouchPropagation}
            onPointerDown={stopTouchPropagation}
            className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2 border border-white/10 bg-[#090b10]/90 px-3 py-1.5 shadow-lg"
          >
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

          {/* Compact Mobile Quick Toggles Bar (Top-Left, keeps bottom HUD 100% free for Custom HUD) */}
          {isTouchDevice && (
            <div
              onTouchStart={stopTouchPropagation}
              onPointerDown={stopTouchPropagation}
              className="pointer-events-auto flex flex-wrap items-center gap-1.5 border border-white/10 bg-[#090b10]/92 p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={onCycleCamera}
                className="flex items-center gap-1 border border-sky-400/40 bg-sky-500/15 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-200 active:bg-sky-500 active:text-slate-950 cursor-pointer"
                aria-label="Cambiar cámara"
              >
                <Camera className="h-3 w-3" />
                {cameraLabel}
              </button>
              <button
                type="button"
                onClick={onToggleTransmission}
                className="border border-white/15 bg-[#141923] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 active:bg-slate-700 cursor-pointer"
              >
                {activeTx === 'AT' ? 'AT' : 'MT'}
              </button>
              <button
                type="button"
                onClick={onToggleTcs}
                className={`border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
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
                className={`border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
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
                className="flex items-center gap-1 border border-red-400/45 bg-[#241016] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-200 active:bg-red-700 cursor-pointer"
                aria-label="Bajar / Volver al Parking"
              >
                <LogOut className="h-3 w-3" />
                Bajar
              </button>
            </div>
          )}
        </div>

        {/* Top-Right: Distance + Session + Cash + Rank + Free Cam [Tab] + Settings Gear */}
        <div
          onTouchStart={stopTouchPropagation}
          onPointerDown={stopTouchPropagation}
          className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 border border-white/10 bg-[#090b10]/90 px-3.5 py-2 shadow-lg"
        >
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

      {/* ==================== CUSTOMIZABLE HUD ELEMENTS (TACHOMETER & TOUCH CONTROLS) ==================== */}
      <div className="pointer-events-none relative flex-1">
        {/* Customizable Circular Tachometer */}
        {settings.showSpeedometer && (
          <div
            className="pointer-events-none fixed z-20 flex flex-col items-center select-none"
            style={getHudElementStyle(customHud.speedometer)}
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

            <TachometerDial
              speedDisplay={displaySpeed}
              speedUnitLabel={speedUnitLabel}
              rpm={hud.rpm}
              maxRpm={hud.maxRpm}
              gear={hud.gear}
              nitro={hud.nitro}
              activeTx={activeTx}
              tcsEnabled={settings.tcsEnabled}
              cdiRacing={hud.cdiRacing}
              revLimiterActive={hud.revLimiterActive}
              styleConfig={customHud.tachometerStyle}
            />
          </div>
        )}

        {/* Customizable Multitouch Driving Controls (Mobile / Touch Devices or Always Active) */}
        {isTouchDevice && (
          <>
            <MultiTouchHoldButton
              style={getHudElementStyle(customHud.steerLeft)}
              onHoldChange={(active) => onTouchControl('left', active)}
              className="pointer-events-auto fixed z-20 flex h-16 w-16 touch-none select-none items-center justify-center border border-white/20 bg-[#090b10]/92 text-white shadow-xl cursor-pointer"
              activeClassName="!bg-[#e10600] !border-white/50 scale-95"
              ariaLabel="Girar izquierda"
            >
              <ChevronLeft className="h-8 w-8" />
            </MultiTouchHoldButton>

            <MultiTouchHoldButton
              style={getHudElementStyle(customHud.steerRight)}
              onHoldChange={(active) => onTouchControl('right', active)}
              className="pointer-events-auto fixed z-20 flex h-16 w-16 touch-none select-none items-center justify-center border border-white/20 bg-[#090b10]/92 text-white shadow-xl cursor-pointer"
              activeClassName="!bg-[#e10600] !border-white/50 scale-95"
              ariaLabel="Girar derecha"
            >
              <ChevronRight className="h-8 w-8" />
            </MultiTouchHoldButton>

            <button
              type="button"
              style={getHudElementStyle(customHud.headlights)}
              onTouchStart={stopTouchPropagation}
              onPointerDown={stopTouchPropagation}
              onClick={onFlashHeadlights}
              className="pointer-events-auto fixed z-20 flex h-12 w-14 touch-none select-none flex-col items-center justify-center border border-sky-400/40 bg-[#0b1524]/92 text-[10px] font-bold text-sky-200 active:bg-sky-500 active:text-slate-950 cursor-pointer"
              aria-label="Destellar luces / Retar duelo"
            >
              <Lightbulb className="h-3.5 w-3.5 mb-0.5 text-sky-300" />
              <span>LUCES</span>
            </button>

            <MultiTouchHoldButton
              style={getHudElementStyle(customHud.nitro)}
              onHoldChange={(active) => onTouchControl('nitro', active)}
              className="pointer-events-auto fixed z-20 flex h-14 px-4 touch-none select-none flex-col items-center justify-center border border-sky-400/45 bg-[#0d2238]/92 text-xs font-extrabold text-sky-200 shadow-xl cursor-pointer"
              activeClassName="!bg-sky-500 !text-slate-950 scale-95"
              ariaLabel="Nitro"
            >
              <Zap className="h-3.5 w-3.5 mb-0.5" />
              <span>NITRO</span>
            </MultiTouchHoldButton>

            <MultiTouchHoldButton
              style={getHudElementStyle(customHud.brake)}
              onHoldChange={(active) => onTouchControl('brake', active)}
              className="pointer-events-auto fixed z-20 flex h-16 px-4 touch-none select-none flex-col items-center justify-center border border-white/20 bg-[#090b10]/92 text-[11px] font-bold text-slate-200 shadow-xl cursor-pointer whitespace-nowrap"
              activeClassName="!bg-amber-600 !text-white scale-95"
              ariaLabel="Frenar y Reversa"
            >
              <span>FRENAR</span>
              <span className="text-[8px] font-semibold tracking-wider text-slate-400">REVERSA</span>
            </MultiTouchHoldButton>

            <MultiTouchHoldButton
              style={getHudElementStyle(customHud.gas)}
              onHoldChange={(active) => onTouchControl('throttle', active)}
              className="pointer-events-auto fixed z-20 flex h-16 px-6 touch-none select-none flex-col items-center justify-center border border-red-400/50 bg-[#e10600]/92 text-xs font-extrabold tracking-wider text-white shadow-xl cursor-pointer"
              activeClassName="!bg-red-500 scale-95"
              ariaLabel="Acelerar"
            >
              <span>ACELERAR</span>
              <span className="text-[8px] font-bold tracking-widest text-red-100/80">GAS</span>
            </MultiTouchHoldButton>

            {activeTx === 'MT' && (
              <>
                <button
                  type="button"
                  style={getHudElementStyle(customHud.shiftDown)}
                  onTouchStart={stopTouchPropagation}
                  onPointerDown={stopTouchPropagation}
                  onClick={() => onShiftGear(-1)}
                  className="pointer-events-auto fixed z-20 flex h-11 px-3 touch-none select-none items-center justify-center border border-white/15 bg-[#090b10]/92 text-xs font-bold text-slate-200 active:bg-slate-700 cursor-pointer whitespace-nowrap"
                >
                  Gear - [{shiftDownKey}]
                </button>
                <button
                  type="button"
                  style={getHudElementStyle(customHud.shiftUp)}
                  onTouchStart={stopTouchPropagation}
                  onPointerDown={stopTouchPropagation}
                  onClick={() => onShiftGear(1)}
                  className="pointer-events-auto fixed z-20 flex h-11 px-3 touch-none select-none items-center justify-center border border-white/15 bg-[#090b10]/92 text-xs font-bold text-slate-200 active:bg-slate-700 cursor-pointer whitespace-nowrap"
                >
                  Gear + [{shiftUpKey}]
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
