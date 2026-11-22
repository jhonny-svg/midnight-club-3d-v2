import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  Eye,
  Flag,
  Globe,
  Lock,
  Radio,
  RotateCcw,
  Search,
  Settings,
  Sliders,
  ThumbsUp,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import {
  CAR_CATALOG,
  CarState,
  CDI_MAX_RPM,
  CDI_MIN_RPM,
  CDI_RACING_COST,
  CDI_STEP_RPM,
  createDefaultCarState,
  DIFFUSER_OPTIONS,
  formatPrimaryKeyLabel,
  FRONT_BUMPER_OPTIONS,
  getCarBrakeScore,
  getCarEffectiveHp,
  getCarEffectiveMaxRpm,
  getCarEffectiveTopSpeed,
  getCarEffectiveTorque,
  getCarEffectiveWeight,
  getCarEffectiveZeroToHundred,
  getRankFromXp,
  getTodayDateKey,
  getUpgradeCost,
  getUpgradeStageLabel,
  HudSnapshot,
  Keybindings,
  PAINT_FINISH_OPTIONS,
  PAINT_PALETTE,
  RIM_DESIGN_OPTIONS,
  RIM_PALETTE,
  SaveProfile,
  SpeedUnits,
  SPOILER_OPTIONS,
  StudioAnglePreset,
  TIRE_PROFILE_OPTIONS,
  TransmissionMode,
  UNDERGLOW_PALETTE,
  UpgradePartKey,
  WINDOW_TINT_OPTIONS,
} from '../game/types';

type AppearancePatch = Partial<
  Pick<
    CarState,
    | 'paint'
    | 'paintFinish'
    | 'rimColor'
    | 'rimDesign'
    | 'tireProfile'
    | 'underglow'
    | 'spoiler'
    | 'frontBumper'
    | 'diffuser'
    | 'sportSteering'
    | 'starlightRoof'
    | 'plateText'
    | 'windowTint'
  >
>;

interface ShowroomHUDProps {
  profile: SaveProfile;
  hud: HudSnapshot;
  muted: boolean;
  speedUnits: SpeedUnits;
  keybindings: Keybindings;
  tuningOpen: boolean;
  dealershipOpen: boolean;
  toastMessage: string | null;
  onToggleMute: () => void;
  onOpenTuning: (open: boolean) => void;
  onOpenDealership: (open: boolean) => void;
  onEnterCar: () => void;
  onExitCar: () => void;
  onTogglePointerLock: () => void;
  onOpenSettings: () => void;
  onBuyOrSelectCar: (carId: string) => void;
  onSpawnCarInFront: (carId: string) => void;
  onUpgradeCar: (part: UpgradePartKey) => void;
  onBuyCdiRacing: () => void;
  onSetRevLimitRpm: (rpm: number) => void;
  onUpdateAppearance: (patch: AppearancePatch) => void;
  onSaveTallerConfig: () => void;
  onResetCarConfig: () => void;
  onSetCarTransmission: (carId: string, tx: TransmissionMode) => void;
  onStudioAngle: (preset: StudioAnglePreset) => void;
  onPreviewDealershipCar: (carId: string | null) => void;
  onRevDealershipCar: (carId: string) => void;
  onTouchWalk: (key: 'throttle' | 'brake' | 'left' | 'right', active: boolean) => void;
  onOpenProgression: () => void;
  onOpenOnlineSettings: () => void;
  onStartContract: () => void;
  onLikeNearbyPlayer: () => void;
  onCycleRadio: () => void;
}

const UPGRADE_PART_META_TOP: Array<{
  key: UpgradePartKey;
  label: string;
  desc: string;
}> = [
  {
    key: 'ecu',
    label: 'Motor & Bloque',
    desc: '+15% / +35% / +60% HP · Repro ECU y forjado',
  },
  {
    key: 'turbo',
    label: 'Inducción / Turbo',
    desc: 'Twin-Turbo · Empuje en altas · Válvula BOV',
  },
  {
    key: 'gearbox',
    label: 'Transmisión',
    desc: 'Relaciones deportivas · +Punta en 5ª y 6ª marcha',
  },
];

const UPGRADE_PART_META_CHASSIS: Array<{
  key: UpgradePartKey;
  label: string;
  desc: string;
}> = [
  {
    key: 'brakes',
    label: 'Frenos',
    desc: 'Discos ventilados y pinzas Brembo 6-pistones',
  },
  {
    key: 'tires',
    label: 'Neumáticos y Agarre',
    desc: 'Compuesto semislick · Tracción en arrancada y giro',
  },
  {
    key: 'suspension',
    label: 'Suspensión',
    desc: 'Coilovers deportivos · Rebaje y control de balanceo',
  },
  {
    key: 'weight',
    label: 'Reducción de Peso',
    desc: '-60 / -120 / -180 kg · Paneles en fibra de carbono',
  },
  {
    key: 'exhaust',
    label: 'Escape',
    desc: 'Línea titanio · Mejor flujo HP y detonaciones',
  },
  {
    key: 'nitroUp',
    label: 'Inyección de Óxido Nitroso (NOS)',
    desc: 'Botella de alta presión · Mayor duración y empuje',
  },
];

function formatSpeed(kmh: number, units: SpeedUnits): number {
  return units === 'MPH' ? Math.round(kmh * 0.621371) : Math.round(kmh);
}

/** Minimalist 2D Car Vector Icon */
const Car2DIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 14.5v-2.2c0-.5.2-1 .6-1.3l2.2-1.2 2.4-3.2c.4-.5 1-.8 1.7-.8h5.3c.7 0 1.4.3 1.8.9l2 2.9 2 .7c.6.2 1 .8 1 1.4v2.8c0 .5-.4 1-1 1h-1.4" />
    <path d="M5.5 15.5h1.2M9.8 15.5h5.4" />
    <circle cx="7.4" cy="15.8" r="1.9" />
    <circle cx="17.2" cy="15.8" r="1.9" />
    <path d="M8.5 9.8h7.5" />
  </svg>
);

export const ShowroomHUD: React.FC<ShowroomHUDProps> = ({
  profile,
  hud,
  muted,
  speedUnits,
  keybindings,
  tuningOpen,
  dealershipOpen,
  toastMessage,
  onToggleMute,
  onOpenTuning,
  onOpenDealership,
  onEnterCar,
  onExitCar,
  onTogglePointerLock,
  onOpenSettings,
  onBuyOrSelectCar,
  onSpawnCarInFront,
  onUpgradeCar,
  onBuyCdiRacing,
  onSetRevLimitRpm,
  onUpdateAppearance,
  onSaveTallerConfig,
  onResetCarConfig,
  onSetCarTransmission,
  onStudioAngle,
  onPreviewDealershipCar,
  onRevDealershipCar,
  onTouchWalk,
  onOpenProgression,
  onOpenOnlineSettings,
  onStartContract,
  onLikeNearbyPlayer,
  onCycleRadio,
}) => {
  const [tuningTab, setTuningTab] = useState<'perf' | 'cosmetic' | 'paint'>('perf');
  const [garageOpen, setGarageOpen] = useState(false);
  const [previewCarId, setPreviewCarId] = useState<string | null>(null);
  const [dealerSelectedId, setDealerSelectedId] = useState<string>(profile.activeCarId);
  const [dealerSearch, setDealerSearch] = useState('');
  const [dealerFilter, setDealerFilter] = useState<'ALL' | 'RWD' | 'AWD' | 'OWNED'>('ALL');
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

  // Close garage drawer if workshop or dealership opens
  useEffect(() => {
    if (tuningOpen || dealershipOpen) {
      setGarageOpen(false);
    }
    if (dealershipOpen) {
      setDealerSelectedId(hud.nearbyDealershipCarId ?? profile.activeCarId);
    }
  }, [tuningOpen, dealershipOpen, hud.nearbyDealershipCarId, profile.activeCarId]);

  // Reset 3D dealership preview when dealership closes
  useEffect(() => {
    if (!dealershipOpen && previewCarId) {
      setPreviewCarId(null);
      onPreviewDealershipCar(null);
    }
  }, [dealershipOpen, previewCarId, onPreviewDealershipCar]);

  const activeSpec = CAR_CATALOG[profile.activeCarId] ?? CAR_CATALOG.kuruma_2008;
  const activeState = profile.cars[activeSpec.id] ?? createDefaultCarState(activeSpec);
  const hp = getCarEffectiveHp(activeSpec, activeState);
  const torqueNm = getCarEffectiveTorque(activeSpec, activeState);
  const weightKg = getCarEffectiveWeight(activeSpec, activeState);
  const topSpeedKmh = getCarEffectiveTopSpeed(activeSpec, activeState);
  const zeroToHundred = getCarEffectiveZeroToHundred(activeSpec, activeState);
  const effectiveMaxRpm = getCarEffectiveMaxRpm(activeSpec, activeState);
  const brakeScore = getCarBrakeScore(activeSpec, activeState);

  const hpGain = hp - activeSpec.baseHp;
  const torqueGain = torqueNm - activeSpec.baseTorqueNm;
  const weightSaved = activeSpec.weightKg - weightKg;
  const topSpeedDisplay = formatSpeed(topSpeedKmh, speedUnits);
  const speedGainDisplay =
    topSpeedDisplay - formatSpeed(activeSpec.baseTopSpeedKmh, speedUnits);
  const accelGain = Math.round((activeSpec.baseZeroToHundred - zeroToHundred) * 10) / 10;
  const speedUnitLabel = speedUnits === 'MPH' ? 'mph' : 'km/h';
  const currentDriveSpeed = formatSpeed(hud.speedKmh, speedUnits);

  const enterExitKeyLabel = formatPrimaryKeyLabel(keybindings.enterExitCar);
  const pointerLockKeyLabel = formatPrimaryKeyLabel(keybindings.togglePointerLock);
  const radioKeyLabel = formatPrimaryKeyLabel(keybindings.toggleRadio);
  const pilotRank = getRankFromXp(profile.xp);
  const canClaimDaily = profile.lastDailyClaimDate !== getTodayDateKey();

  const nearbyDealershipSpec = hud.nearbyDealershipCarId
    ? CAR_CATALOG[hud.nearbyDealershipCarId]
    : null;

  const previewSpec = previewCarId ? CAR_CATALOG[previewCarId] : null;
  const previewState = previewSpec
    ? profile.cars[previewSpec.id] ?? createDefaultCarState(previewSpec)
    : null;

  const dynoSvg = useMemo(() => {
    const w = 210;
    const h = 44;
    const padL = 4;
    const padR = 4;
    const padT = 5;
    const padB = 9;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const torqueFactors = [0.62, 0.84, 0.96, 1.0, 0.95, 0.86, 0.72];
    const powerFactors = [0.18, 0.36, 0.56, 0.76, 0.92, 1.0, 0.93];
    const maxScale = Math.max(hp, torqueNm, 400);

    const toPoints = (factors: number[], peakVal: number) =>
      factors.map((f, i) => {
        const x = padL + (i / (factors.length - 1)) * plotW;
        const val = peakVal * f;
        const y = padT + plotH - (val / maxScale) * plotH;
        return { x, y };
      });

    const buildSmoothPath = (pts: { x: number; y: number }[]) => {
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cx = ((p0.x + p1.x) / 2).toFixed(1);
        d += ` C ${cx} ${p0.y.toFixed(1)}, ${cx} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      }
      return d;
    };

    const hpPts = toPoints(powerFactors, hp);
    const tqPts = toPoints(torqueFactors, torqueNm);
    const hpLine = buildSmoothPath(hpPts);
    const tqLine = buildSmoothPath(tqPts);
    const hpArea = `${hpLine} L ${hpPts[hpPts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${hpPts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

    return { w, h, padT, plotH, hpLine, hpArea, tqLine };
  }, [hp, torqueNm]);

  const handleProximityAction = () => {
    if (hud.nearbyZone === 'CAR') {
      onEnterCar();
    } else if (hud.nearbyZone === 'TUNING') {
      onOpenTuning(true);
    } else if (hud.nearbyZone === 'DEALERSHIP') {
      onOpenDealership(true);
    } else if (hud.nearbyZone === 'CONTRACT') {
      onStartContract();
    }
  };

  const handleStartPreview = (carId: string) => {
    setPreviewCarId(carId);
    onPreviewDealershipCar(carId);
  };

  const handleStopPreview = () => {
    setPreviewCarId(null);
    onPreviewDealershipCar(null);
  };

  const showSpecCard = tuningOpen || (dealershipOpen && !previewCarId);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6">
      {/* ==================== TOP-RIGHT ONLY: CASH + MIS CARROS (2D CAR SVG) + FREE CAM + GEAR ==================== */}
      <div className="flex items-start justify-end gap-2">
        {toastMessage && (
          <div className="mr-auto border border-white/15 bg-[#090b10]/94 px-3.5 py-1.5 text-[11px] font-medium tracking-wider text-white uppercase shadow-xl">
            {toastMessage}
          </div>
        )}

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 border border-white/[0.1] bg-[#090b10]/90 px-3 py-1.5 shadow-xl">
          <div className="font-telemetry text-sm md:text-base font-semibold text-white pr-1">
            ${profile.cash.toLocaleString()}
          </div>

          <div className="h-4 w-px bg-white/[0.1]" />

          {/* Pilot Rank & Daily Progression */}
          <button
            type="button"
            onClick={onOpenProgression}
            title="Rango de Piloto, Recompensas Diarias y Desafíos"
            aria-label="Abrir Progreso y Recompensas"
            className="relative flex h-7 items-center gap-1.5 border border-amber-400/30 bg-amber-500/10 px-2 text-amber-300 hover:border-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            <Award className="h-3.5 w-3.5" />
            <span className="font-telemetry text-[10px] font-bold uppercase tracking-wider">
              Nv.{pilotRank}
            </span>
            {canClaimDaily && (
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-label="Recompensa disponible" />
            )}
          </button>

          {/* Online Cross-Play Room Status */}
          <button
            type="button"
            onClick={onOpenOnlineSettings}
            title={`Sala Online: ${hud.onlineRoomCode} (${hud.onlinePlayersCount} pilotos)`}
            aria-label="Configurar Sala Online Cross-Play"
            className="flex h-7 items-center gap-1.5 border border-white/[0.08] bg-white/[0.03] px-2 text-slate-200 hover:border-sky-400/50 hover:text-white transition-colors cursor-pointer"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                hud.onlineConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-telemetry text-[10px] font-semibold uppercase">
              {hud.onlinePlayersCount}
            </span>
          </button>

          {/* Radio Station Quick Toggle */}
          <button
            type="button"
            onClick={onCycleRadio}
            title={`Radio Phonk / Synthwave [${radioKeyLabel}]`}
            aria-label="Cambiar emisora de radio"
            className={`flex h-7 items-center gap-1 border px-2 text-[10px] font-telemetry font-bold uppercase transition-colors cursor-pointer ${
              hud.radioStation !== 'OFF'
                ? 'border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200'
                : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="h-3 w-3" />
            <span className="hidden md:inline">{hud.radioStation}</span>
          </button>

          {/* Mis Carros 2D Vector Icon Button */}
          <button
            type="button"
            onClick={() => {
              const next = !garageOpen;
              setGarageOpen(next);
              if (next) {
                if (tuningOpen) onOpenTuning(false);
                if (dealershipOpen) onOpenDealership(false);
              }
            }}
            title="Mis Carros (Garaje Personal)"
            aria-label="Abrir Mis Carros"
            className={`flex h-7 items-center gap-1.5 px-2 border transition-colors cursor-pointer ${
              garageOpen
                ? 'border-[#e10600] bg-[#e10600]/20 text-white'
                : 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/25'
            }`}
          >
            <Car2DIcon className="h-4 w-4" />
            <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.14em]">
              Mis Carros
            </span>
          </button>

          {/* Discreet 360° Free Look / Pointer Lock button */}
          <button
            type="button"
            onClick={onTogglePointerLock}
            title={
              hud.pointerLocked
                ? `Soltar cámara libre 360° [${pointerLockKeyLabel}]`
                : `Cámara libre 360° [${pointerLockKeyLabel}]`
            }
            aria-label="Alternar cámara libre 360 grados"
            className={`flex h-7 w-7 items-center justify-center border transition-colors cursor-pointer ${
              hud.pointerLocked
                ? 'border-[#e10600] bg-[#e10600]/20 text-white'
                : 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/25'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>

          {/* Minimalist Settings Gear Icon */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Ajustes"
            aria-label="Abrir Ajustes"
            className="flex h-7 w-7 items-center justify-center border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ==================== MIDDLE: MIS CARROS PANEL OR TALLER DE TUNEO DRAWER ==================== */}
      <div className="relative flex-1 flex items-center justify-end my-2 min-h-0">
        {/* MIS CARROS PERSONAL GARAGE PANEL */}
        {garageOpen && !tuningOpen && !dealershipOpen && (
          <aside className="pointer-events-auto flex max-h-full w-full max-w-[375px] flex-col border border-white/[0.12] bg-[#090b10]/94 p-3.5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#e10600] font-semibold">
                  <Car2DIcon className="h-3.5 w-3.5" />
                  Garaje Personal ({profile.ownedCars.length})
                </div>
                <h2 className="mt-0.5 font-display text-lg font-medium tracking-wide text-white">
                  Mis Carros
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setGarageOpen(false)}
                className="flex h-7 w-7 items-center justify-center border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white cursor-pointer"
                aria-label="Cerrar Mis Carros"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {profile.ownedCars.map((id) => {
                const spec = CAR_CATALOG[id];
                if (!spec) return null;
                const state = profile.cars[id] ?? createDefaultCarState(spec);
                const carHp = getCarEffectiveHp(spec, state);
                const carTq = getCarEffectiveTorque(spec, state);
                const carWt = getCarEffectiveWeight(spec, state);
                const carTop = formatSpeed(getCarEffectiveTopSpeed(spec, state), speedUnits);
                const equipped = profile.activeCarId === id;
                const carTx: TransmissionMode = state.transmission ?? 'AT';

                return (
                  <div
                    key={id}
                    className={`border p-3 transition-colors ${
                      equipped
                        ? 'border-[#e10600]/80 bg-[#e10600]/[0.08]'
                        : 'border-white/[0.08] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.16em] text-slate-400 truncate">
                          {spec.brand} · {spec.drivetrain}
                        </div>
                        <h3 className="font-display text-base font-medium text-white truncate">
                          {spec.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onSetCarTransmission(id, carTx === 'AT' ? 'MT' : 'AT')
                        }
                        title="Cambiar transmisión de este vehículo"
                        className="shrink-0 border border-white/15 bg-black/50 px-2 py-0.5 font-telemetry text-[10px] font-bold text-amber-300 hover:border-amber-400 cursor-pointer"
                      >
                        Caja: {carTx}
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-4 gap-1 border-y border-white/[0.06] py-1.5 text-center font-telemetry">
                      <div>
                        <div className="text-[8px] uppercase text-slate-500">HP</div>
                        <div className="text-[11px] font-semibold text-white">{carHp}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-500">Par</div>
                        <div className="text-[11px] font-semibold text-white">{carTq} Nm</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-500">Peso</div>
                        <div className="text-[11px] font-semibold text-white">{carWt} kg</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-500">Punta</div>
                        <div className="text-[11px] font-semibold text-white">
                          {carTop} {speedUnitLabel}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span
                          className="inline-block h-3 w-3 border border-white/25"
                          style={{ backgroundColor: state.paint }}
                        />
                        <span>
                          ECU S{state.upgrades.ecu} · Turbo S{state.upgrades.turbo}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGarageOpen(false);
                          onSpawnCarInFront(id);
                        }}
                        className="bg-[#e10600] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#ff1812] whitespace-nowrap cursor-pointer"
                      >
                        Generar / Spawnear Aquí
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* TALLER DE PERSONALIZACIÓN DRAWER (3 TABS: RENDIMIENTO, COSMÉTICO, PINTURA Y TINTE) */}
        {tuningOpen && (
          <aside className="pointer-events-auto flex max-h-full w-full max-w-[396px] flex-col border border-white/[0.12] bg-[#090b10]/96 p-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#3b82f6] font-semibold">
                  <Sliders className="h-3 w-3" />
                  Taller de Personalización
                </div>
                <h2 className="mt-0.5 font-display text-lg font-medium tracking-wide text-white truncate">
                  {activeSpec.name}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onSetCarTransmission(
                      activeSpec.id,
                      activeState.transmission === 'AT' ? 'MT' : 'AT'
                    )
                  }
                  className="border border-white/[0.12] bg-white/[0.03] px-2 py-1 font-telemetry text-[10px] font-bold text-amber-300 hover:border-amber-400 cursor-pointer"
                  title="Transmisión de este vehículo"
                >
                  {activeState.transmission ?? 'AT'}
                </button>
                <button
                  type="button"
                  onClick={onToggleMute}
                  aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
                  className="flex h-7 w-7 items-center justify-center border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white cursor-pointer"
                >
                  {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTuning(false)}
                  className="flex h-7 w-7 items-center justify-center border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Cerrar Taller"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Detail Inspection Camera Presets inside Taller Bay */}
            <div className="mb-2.5 flex items-center gap-1 shrink-0">
              <Camera className="h-3 w-3 text-slate-400 shrink-0 mr-0.5" />
              {(
                [
                  { id: 'front34', label: '3/4 Front' },
                  { id: 'side', label: 'Lateral' },
                  { id: 'rear34', label: 'Alerón / Tras.' },
                  { id: 'top', label: 'Superior' },
                ] as Array<{ id: StudioAnglePreset; label: string }>
              ).map((ang) => (
                <button
                  key={ang.id}
                  type="button"
                  onClick={() => onStudioAngle(ang.id)}
                  className="flex-1 border border-white/[0.08] bg-white/[0.02] py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-300 hover:border-white/25 hover:text-white whitespace-nowrap cursor-pointer"
                >
                  {ang.label}
                </button>
              ))}
            </div>

            {/* Quick Owned Cars Switcher inside Taller */}
            {profile.ownedCars.length > 1 && (
              <div className="mb-2.5 shrink-0">
                <div className="text-[9px] uppercase tracking-[0.16em] text-slate-400 mb-1">
                  Vehículo en Bahía
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {profile.ownedCars.map((id) => {
                    const spec = CAR_CATALOG[id];
                    if (!spec) return null;
                    const equipped = profile.activeCarId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onBuyOrSelectCar(id)}
                        className={`border px-2.5 py-1 text-[10px] font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                          equipped
                            ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                        }`}
                      >
                        {spec.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3-Tab Segmented Switch: Rendimiento / Cosmético / Pintura y Tinte */}
            <div className="grid grid-cols-3 border border-white/[0.08] bg-black/50 mb-3 shrink-0">
              {(
                [
                  { id: 'perf', label: 'Rendimiento' },
                  { id: 'cosmetic', label: 'Cosmético' },
                  { id: 'paint', label: 'Pintura y Tinte' },
                ] as const
              ).map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTuningTab(t.id)}
                  className={`py-2 px-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] transition-colors whitespace-nowrap cursor-pointer ${
                    idx > 0 ? 'border-l border-white/[0.08]' : ''
                  } ${
                    tuningTab === t.id
                      ? 'bg-[#2563eb] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Scrollable Body for Active Tab */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 min-h-0">
              {tuningTab === 'perf' && (
                <>
                  {/* 4 Live Performance Stat Bars */}
                  <div className="border border-white/[0.08] bg-black/45 p-2.5 space-y-2">
                    {[
                      {
                        label: 'Velocidad',
                        val: `${topSpeedDisplay} ${speedUnitLabel}`,
                        pct: Math.min(100, Math.max(15, (topSpeedKmh / 410) * 100)),
                        color: 'bg-sky-400',
                      },
                      {
                        label: 'Poder HP',
                        val: `${hp} HP`,
                        pct: Math.min(100, Math.max(10, (hp / 1600) * 100)),
                        color: 'bg-[#e10600]',
                      },
                      {
                        label: 'Peso',
                        val: `${weightKg.toLocaleString()} kg`,
                        pct: Math.min(100, Math.max(18, ((2200 - weightKg) / 1350) * 100)),
                        color: 'bg-amber-400',
                      },
                      {
                        label: 'Frenos',
                        val: `${brakeScore}/100`,
                        pct: brakeScore,
                        color: 'bg-emerald-400',
                      },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="uppercase tracking-wider text-slate-400">
                            {bar.label}
                          </span>
                          <span className="font-telemetry font-bold text-white">{bar.val}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.07]">
                          <div
                            className={`h-full transition-all duration-200 ${bar.color}`}
                            style={{ width: `${bar.pct.toFixed(0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Performance Upgrades List + Transmission + CDI Racing */}
                  <div className="divide-y divide-white/[0.08] border border-white/[0.08] bg-black/40">
                    {UPGRADE_PART_META_TOP.map((item) => {
                      const lvl = activeState.upgrades[item.key] ?? 0;
                      const isTurbo = item.key === 'turbo';
                      const maxAllowed = isTurbo ? (pilotRank >= 10 ? 4 : 3) : 3;
                      const lockedRank10 = isTurbo && lvl === 3 && pilotRank < 10;
                      const isMax = lvl >= maxAllowed;
                      const cost = isMax || lockedRank10 ? 0 : getUpgradeCost(activeSpec, item.key, lvl);
                      const nextLabel = isMax ? 'MÁX' : getUpgradeStageLabel(lvl + 1);
                      const stages = isTurbo ? [1, 2, 3, 4] : [1, 2, 3];

                      return (
                        <div key={item.key} className="px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-white truncate">
                                  {item.label}
                                </span>
                                <span
                                  className={`border px-1.5 py-0.5 font-telemetry text-[9px] font-semibold uppercase ${
                                    lvl > 0
                                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                      : 'border-white/15 bg-white/[0.03] text-slate-400'
                                  }`}
                                >
                                  {getUpgradeStageLabel(lvl)}
                                </span>
                              </div>
                              <div className="mt-0.5 text-[10px] text-slate-400">
                                {isTurbo && pilotRank >= 10
                                  ? `${item.desc} · Stage 4 Titanio desbloqueado`
                                  : item.desc}
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={isMax || lockedRank10}
                              onClick={() => onUpgradeCar(item.key)}
                              className={`shrink-0 px-2.5 py-1.5 text-[10px] font-semibold font-telemetry uppercase whitespace-nowrap ${
                                lockedRank10
                                  ? 'border border-amber-400/30 bg-amber-500/10 text-amber-300 cursor-not-allowed'
                                  : isMax
                                    ? 'border border-white/10 text-slate-500 cursor-default'
                                    : 'bg-[#e10600] text-white hover:bg-[#ff1812] cursor-pointer'
                              }`}
                            >
                              {lockedRank10
                                ? 'Bloq. Nv.10'
                                : isMax
                                  ? 'MÁX'
                                  : `${nextLabel} · $${cost.toLocaleString()}`}
                            </button>
                          </div>

                          {item.key === 'gearbox' && (
                            <div className="mt-2 flex items-center justify-between border border-white/[0.06] bg-black/35 px-2.5 py-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-slate-300">
                                Modo de Caja
                              </span>
                              <div className="flex gap-1">
                                {(['AT', 'MT'] as TransmissionMode[]).map((tx) => (
                                  <button
                                    key={tx}
                                    type="button"
                                    onClick={() => onSetCarTransmission(activeSpec.id, tx)}
                                    className={`px-2 py-0.5 font-telemetry text-[10px] font-bold border cursor-pointer ${
                                      (activeState.transmission ?? 'AT') === tx
                                        ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                                        : 'border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {tx === 'AT' ? 'Automático' : 'Manual'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div
                            className={`mt-2 grid gap-1 ${
                              isTurbo ? 'grid-cols-4' : 'grid-cols-3'
                            }`}
                          >
                            {stages.map((stage) => (
                              <div
                                key={stage}
                                className={`h-1 ${
                                  lvl >= stage
                                    ? stage === 4
                                      ? 'bg-amber-400'
                                      : 'bg-[#2563eb]'
                                    : stage === 4 && pilotRank < 10
                                      ? 'bg-amber-500/20'
                                      : 'bg-white/[0.08]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Control de Lanzamiento & CDI Racing Programable ($4,500) */}
                    <div className="px-3 py-2.5 bg-[#e10600]/[0.05]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-white truncate">
                              Control de Lanzamiento & CDI Racing
                            </span>
                            <span
                              className={`border px-1.5 py-0.5 font-telemetry text-[9px] font-semibold uppercase ${
                                activeState.cdiRacing
                                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                                  : 'border-white/15 bg-white/[0.03] text-slate-400'
                              }`}
                            >
                              {activeState.cdiRacing ? 'CDI PRO' : 'STOCK'}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-400">
                            {activeState.cdiRacing
                              ? 'Corte programable · Explosiones físicas y chispas en escape'
                              : `Corte limpio de fábrica (${activeSpec.stockRedlineRpm.toLocaleString()} RPM) · Sin llamas`}
                          </div>
                        </div>

                        {!activeState.cdiRacing ? (
                          <button
                            type="button"
                            onClick={onBuyCdiRacing}
                            className="shrink-0 bg-[#e10600] px-2.5 py-1.5 text-[10px] font-semibold font-telemetry uppercase text-white hover:bg-[#ff1812] whitespace-nowrap cursor-pointer"
                          >
                            Instalar · ${CDI_RACING_COST.toLocaleString()}
                          </button>
                        ) : (
                          <span className="shrink-0 border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-telemetry text-[9px] font-bold uppercase text-emerald-300">
                            Instalado
                          </span>
                        )}
                      </div>

                      {activeState.cdiRacing && (
                        <div className="mt-2.5 border-t border-white/[0.08] pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <label
                              htmlFor="cdi-rpm-slider"
                              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300"
                            >
                              Corte de RPM Configurable
                            </label>
                            <span className="font-telemetry text-xs font-bold text-amber-300">
                              {activeState.revLimitRpm.toLocaleString()} RPM
                            </span>
                          </div>
                          <input
                            id="cdi-rpm-slider"
                            type="range"
                            min={CDI_MIN_RPM}
                            max={CDI_MAX_RPM}
                            step={CDI_STEP_RPM}
                            value={activeState.revLimitRpm}
                            onChange={(e) => onSetRevLimitRpm(parseInt(e.target.value, 10))}
                            className="w-full accent-[#e10600] cursor-pointer"
                          />
                          <div className="flex justify-between font-telemetry text-[9px] text-slate-500">
                            <span>6,000 RPM</span>
                            <span>8,250 RPM</span>
                            <span>10,500 RPM</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {UPGRADE_PART_META_CHASSIS.map((item) => {
                      const lvl = activeState.upgrades[item.key] ?? 0;
                      const isMax = lvl >= 3;
                      const cost = isMax ? 0 : getUpgradeCost(activeSpec, item.key, lvl);
                      const nextLabel = isMax ? 'MÁX' : getUpgradeStageLabel(lvl + 1);

                      return (
                        <div key={item.key} className="px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-white truncate">
                                  {item.label}
                                </span>
                                <span
                                  className={`border px-1.5 py-0.5 font-telemetry text-[9px] font-semibold uppercase ${
                                    lvl > 0
                                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                      : 'border-white/15 bg-white/[0.03] text-slate-400'
                                  }`}
                                >
                                  {getUpgradeStageLabel(lvl)}
                                </span>
                              </div>
                              <div className="mt-0.5 text-[10px] text-slate-400">{item.desc}</div>
                            </div>
                            <button
                              type="button"
                              disabled={isMax}
                              onClick={() => onUpgradeCar(item.key)}
                              className={`shrink-0 px-2.5 py-1.5 text-[10px] font-semibold font-telemetry uppercase whitespace-nowrap cursor-pointer ${
                                isMax
                                  ? 'border border-white/10 text-slate-500 cursor-default'
                                  : 'bg-[#e10600] text-white hover:bg-[#ff1812]'
                              }`}
                            >
                              {isMax ? 'MÁX' : `${nextLabel} · $${cost.toLocaleString()}`}
                            </button>
                          </div>

                          <div className="mt-2 grid grid-cols-3 gap-1">
                            {[1, 2, 3].map((stage) => (
                              <div
                                key={stage}
                                className={`h-1 ${lvl >= stage ? 'bg-[#2563eb]' : 'bg-white/[0.08]'}`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {tuningTab === 'cosmetic' && (
                <div className="space-y-3.5">
                  {/* Neumáticos y Llantas */}
                  <div className="border border-white/[0.08] bg-black/40 p-3 space-y-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6]">
                      Neumáticos y Llantas
                    </div>
                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1">
                        Diseño de Llanta
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {RIM_DESIGN_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdateAppearance({ rimDesign: opt.id })}
                            className={`border py-1.5 px-2 text-[10px] font-medium uppercase tracking-wider cursor-pointer ${
                              (activeState.rimDesign ?? 'five_spoke') === opt.id
                                ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1">
                        Color de Rines
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {RIM_PALETTE.map((r) => (
                          <button
                            key={r.hex}
                            type="button"
                            title={r.label}
                            onClick={() => onUpdateAppearance({ rimColor: r.hex })}
                            className={`h-7 border transition-transform cursor-pointer ${
                              activeState.rimColor === r.hex
                                ? 'border-[#2563eb] scale-110'
                                : 'border-white/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: r.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1">
                        Perfil de Neumático
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {TIRE_PROFILE_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdateAppearance({ tireProfile: opt.id })}
                            className={`border py-1.5 px-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer ${
                              (activeState.tireProfile ?? 'street') === opt.id
                                ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modificaciones Corporales */}
                  <div className="border border-white/[0.08] bg-black/40 p-3 space-y-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6]">
                      Modificaciones Corporales
                    </div>

                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1">
                        Alerón Trasero
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {SPOILER_OPTIONS.map((sp) => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => onUpdateAppearance({ spoiler: sp.id })}
                            className={`border py-1.5 px-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer ${
                              (activeState.spoiler ?? 'stock') === sp.id
                                ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                            }`}
                          >
                            {sp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1">
                        Parachoques / Splitter Frontal
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {FRONT_BUMPER_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdateAppearance({ frontBumper: opt.id })}
                            className={`border py-1.5 px-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer ${
                              (activeState.frontBumper ?? 'stock') === opt.id
                                ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1">
                        Difusor Trasero
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {DIFFUSER_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdateAppearance({ diffuser: opt.id })}
                            className={`border py-1.5 px-1 text-[10px] font-medium uppercase tracking-wider cursor-pointer ${
                              (activeState.diffuser ?? 'stock') === opt.id
                                ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Accesorios de Interior */}
                  <div className="border border-white/[0.08] bg-black/40 p-3 space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6]">
                      Accesorios de Interior
                    </div>

                    <div className="flex items-center justify-between gap-2 border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                      <div>
                        <div className="text-xs font-medium text-white">Volante Deportivo Carbono</div>
                        <div className="text-[10px] text-slate-400">Aro en carbono con marcador rojo</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAppearance({ sportSteering: !activeState.sportSteering })
                        }
                        className={`px-3 py-1 text-[10px] font-semibold uppercase border cursor-pointer ${
                          activeState.sportSteering
                            ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                            : 'border-white/15 text-slate-400'
                        }`}
                      >
                        {activeState.sportSteering ? 'Activo' : 'Stock'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                      <div>
                        <div className="text-xs font-medium text-white">Techo Estrellado LED</div>
                        <div className="text-[10px] text-slate-400">Fibra óptica interior en cielo raso</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAppearance({ starlightRoof: !activeState.starlightRoof })
                        }
                        className={`px-3 py-1 text-[10px] font-semibold uppercase border cursor-pointer ${
                          activeState.starlightRoof
                            ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                            : 'border-white/15 text-slate-400'
                        }`}
                      >
                        {activeState.starlightRoof ? 'Activo' : 'Off'}
                      </button>
                    </div>
                  </div>

                  {/* Matrícula Personalizada + Underglow */}
                  <div className="border border-white/[0.08] bg-black/40 p-3 space-y-2.5">
                    <div>
                      <label
                        htmlFor="custom-plate-input"
                        className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6] mb-1.5"
                      >
                        Matrícula Personalizada (3D)
                      </label>
                      <input
                        id="custom-plate-input"
                        type="text"
                        maxLength={8}
                        value={activeState.plateText ?? 'GSTDVR'}
                        onChange={(e) =>
                          onUpdateAppearance({
                            plateText: e.target.value.toUpperCase().replace(/[^A-Z0-9- ]/g, '').slice(0, 8),
                          })
                        }
                        placeholder="GSTDVR"
                        className="w-full border border-white/15 bg-black/60 px-3 py-1.5 font-telemetry text-sm font-bold tracking-[0.22em] text-white uppercase focus:border-[#2563eb] focus:outline-none"
                      />
                    </div>

                    <div className="border-t border-white/[0.06] pt-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          Neón Inferior (Underglow)
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {UNDERGLOW_PALETTE.find((u) => u.id === activeState.underglow)?.label ??
                            'Activo'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {UNDERGLOW_PALETTE.map((u) => {
                          const locked = Boolean(u.unlockRank && pilotRank < u.unlockRank);
                          const selected = activeState.underglow === u.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              title={u.label}
                              onClick={() => onUpdateAppearance({ underglow: u.id })}
                              className={`relative flex h-7 items-center justify-center border transition-transform cursor-pointer ${
                                selected
                                  ? 'border-white scale-105'
                                  : 'border-white/20 hover:scale-105'
                              } ${locked ? 'opacity-55' : ''}`}
                              style={{
                                backgroundColor: u.hex === 'none' ? '#12151c' : u.hex,
                              }}
                            >
                              {u.hex === 'none' && (
                                <span className="text-[9px] text-slate-400">OFF</span>
                              )}
                              {locked && (
                                <span className="flex items-center gap-0.5 bg-black/75 px-1 py-0.5 text-[8px] font-bold text-amber-300">
                                  <Lock className="h-2.5 w-2.5" />
                                  {u.unlockRank}
                                </span>
                              )}
                              {!locked && u.id === 'pulse_neon' && (
                                <span className="bg-black/65 px-1 text-[8px] font-bold text-cyan-200 uppercase">
                                  Pulso
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tuningTab === 'paint' && (
                <div className="space-y-3.5">
                  <div className="border border-white/[0.08] bg-black/40 p-3 space-y-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6]">
                      Selector Libre RGB / Hexadecimal
                    </div>

                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="free-paint-picker"
                        className="relative flex h-11 w-16 shrink-0 items-center justify-center border border-white/25 cursor-pointer"
                        style={{ backgroundColor: activeState.paint }}
                      >
                        <input
                          id="free-paint-picker"
                          type="color"
                          value={activeState.paint}
                          onChange={(e) => onUpdateAppearance({ paint: e.target.value })}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-white">Color Personalizado</div>
                        <div className="font-telemetry text-xs uppercase text-slate-400">
                          {activeState.paint}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 mb-1.5">
                        Paleta Rápida de Estudio
                      </span>
                      <div className="grid grid-cols-7 gap-1.5">
                        {PAINT_PALETTE.map((p) => (
                          <button
                            key={p.hex}
                            type="button"
                            title={p.label}
                            onClick={() => onUpdateAppearance({ paint: p.hex })}
                            className={`h-7 border transition-transform cursor-pointer ${
                              activeState.paint.toLowerCase() === p.hex.toLowerCase()
                                ? 'border-[#2563eb] scale-110'
                                : 'border-white/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: p.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Acabado de Pintura */}
                  <div className="border border-white/[0.08] bg-black/40 p-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6] mb-2">
                      Acabado de Carrocería
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PAINT_FINISH_OPTIONS.map((fin) => {
                        const locked = Boolean(fin.unlockRank && pilotRank < fin.unlockRank);
                        const selected = (activeState.paintFinish ?? 'gloss') === fin.id;
                        return (
                          <button
                            key={fin.id}
                            type="button"
                            onClick={() => onUpdateAppearance({ paintFinish: fin.id })}
                            className={`flex items-center justify-center gap-1 border py-2 px-2 text-[10.5px] font-semibold uppercase tracking-wider cursor-pointer ${
                              selected
                                ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                                : locked
                                  ? 'border-amber-400/25 bg-amber-500/[0.06] text-amber-200/75'
                                  : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                            } ${fin.id === 'chameleon' ? 'col-span-2' : ''}`}
                          >
                            {locked && <Lock className="h-3 w-3 shrink-0" />}
                            <span>{fin.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tinte de Ventanas */}
                  <div className="border border-white/[0.08] bg-black/40 p-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3b82f6] mb-2">
                      Tinte de Ventanas
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {WINDOW_TINT_OPTIONS.map((wt) => (
                        <button
                          key={wt.id}
                          type="button"
                          onClick={() => onUpdateAppearance({ windowTint: wt.id })}
                          className={`border py-2 px-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer ${
                            (activeState.windowTint ?? 'smoke') === wt.id
                              ? 'border-[#2563eb] bg-[#2563eb]/20 text-white'
                              : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                          }`}
                        >
                          {wt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Green GUARDAR CONFIGURACIONES + RESTABLECER A PREDETERMINADO */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] space-y-1.5 shrink-0">
              <button
                type="button"
                onClick={onSaveTallerConfig}
                className="flex w-full items-center justify-center gap-2 bg-emerald-600 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Guardar Configuraciones
              </button>
              <button
                type="button"
                onClick={onResetCarConfig}
                className="flex w-full items-center justify-center gap-2 border border-white/[0.12] bg-white/[0.03] py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 hover:border-red-400/50 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Restablecer a Predeterminado
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ==================== BOTTOM: CONTEXTUAL PROMPT OR COMPACT SPEC CARD ==================== */}
      <div className="relative flex items-end justify-between gap-4">
        {/* Compact Technical Spec Card: ONLY visible inside Taller de Tuneo or Concesionario */}
        {showSpecCard ? (
          <section
            className="pointer-events-auto w-full max-w-[260px] border border-white/[0.08] bg-[#090b10]/94 p-2.5 shadow-2xl"
            aria-label="Ficha técnica compacta del vehículo"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 gap-2">
              <div className="min-w-0">
                <div className="text-[8px] uppercase tracking-[0.18em] text-[#e10600] font-semibold truncate">
                  {activeSpec.brand} · {activeSpec.referenceModel}
                </div>
                <h2 className="font-display text-sm font-medium tracking-wide text-white truncate">
                  {activeSpec.name}
                </h2>
              </div>
              <span className="border border-white/15 px-1.5 py-0.5 font-telemetry text-[9px] font-semibold text-white shrink-0">
                {activeSpec.drivetrain}
              </span>
            </div>

            <div className="grid grid-cols-5 divide-x divide-white/[0.08] border-b border-white/[0.08] py-1.5 text-center">
              <div className="px-0.5">
                <div className="text-[8px] uppercase text-slate-400">HP</div>
                <div className="font-telemetry text-[11px] font-semibold text-white">{hp}</div>
                {hpGain > 0 && (
                  <div className="font-telemetry text-[8px] text-emerald-400">+{hpGain}</div>
                )}
              </div>
              <div className="px-0.5">
                <div className="text-[8px] uppercase text-slate-400">Nm</div>
                <div className="font-telemetry text-[11px] font-semibold text-white">{torqueNm}</div>
                {torqueGain > 0 && (
                  <div className="font-telemetry text-[8px] text-emerald-400">+{torqueGain}</div>
                )}
              </div>
              <div className="px-0.5">
                <div className="text-[8px] uppercase text-slate-400">Peso</div>
                <div className="font-telemetry text-[11px] font-semibold text-white">{weightKg}</div>
                {weightSaved > 0 && (
                  <div className="font-telemetry text-[8px] text-emerald-400">-{weightSaved}</div>
                )}
              </div>
              <div className="px-0.5">
                <div className="text-[8px] uppercase text-slate-400">Punta</div>
                <div className="font-telemetry text-[11px] font-semibold text-white">
                  {topSpeedDisplay}
                </div>
                {speedGainDisplay > 0 && (
                  <div className="font-telemetry text-[8px] text-emerald-400">+{speedGainDisplay}</div>
                )}
              </div>
              <div className="px-0.5">
                <div className="text-[8px] uppercase text-slate-400">0-100</div>
                <div className="font-telemetry text-[11px] font-semibold text-white">
                  {zeroToHundred.toFixed(1)}s
                </div>
                {accelGain > 0 && (
                  <div className="font-telemetry text-[8px] text-emerald-400">-{accelGain.toFixed(1)}</div>
                )}
              </div>
            </div>

            <div className="pt-1.5">
              <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.14em] text-slate-400 mb-0.5">
                <span>Dinamómetro</span>
                <span className="font-telemetry text-slate-300">
                  Corte {effectiveMaxRpm.toLocaleString()} RPM
                </span>
              </div>
              <svg
                viewBox={`0 0 ${dynoSvg.w} ${dynoSvg.h}`}
                className="w-full h-[42px] overflow-visible"
                role="img"
                aria-label={`Curva de potencia ${hp} HP y par ${torqueNm} Nm`}
              >
                <defs>
                  <linearGradient id="acDynoFillCompact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e10600" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#e10600" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[0.33, 0.66, 1].map((r) => {
                  const y = dynoSvg.padT + dynoSvg.plotH * r;
                  return (
                    <line
                      key={r}
                      x1={4}
                      x2={dynoSvg.w - 4}
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  );
                })}
                <path d={dynoSvg.hpArea} fill="url(#acDynoFillCompact)" />
                <path
                  d={dynoSvg.tqLine}
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                <path d={dynoSvg.hpLine} fill="none" stroke="#e10600" strokeWidth="1.6" />
              </svg>
            </div>
          </section>
        ) : !tuningOpen && !dealershipOpen && (hud.inCarMeetZone || hud.nearbyRemotePlayer) ? (
          <div className="pointer-events-auto flex flex-col gap-1.5 border border-fuchsia-400/35 bg-[#090b10]/94 p-3 shadow-xl max-w-[270px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
                Zona Car Meet Nocturno
              </span>
              {hud.inCarMeetZone && (
                <span className="border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[8.5px] font-bold uppercase text-emerald-300">
                  En Zona
                </span>
              )}
            </div>
            {hud.nearbyRemotePlayer ? (
              <>
                <div className="text-xs font-semibold text-white truncate">
                  {hud.nearbyRemotePlayer.name} ·{' '}
                  <span className="text-slate-400">
                    {CAR_CATALOG[hud.nearbyRemotePlayer.carId]?.name ?? hud.nearbyRemotePlayer.carId}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-telemetry text-[10px] text-amber-300">
                    ♥ {hud.nearbyRemotePlayer.likes} votos
                  </span>
                  <button
                    type="button"
                    onClick={onLikeNearbyPlayer}
                    className="flex items-center gap-1.5 bg-fuchsia-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-fuchsia-500 cursor-pointer"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Me gusta el coche
                  </button>
                </div>
              </>
            ) : (
              <div className="text-[10.5px] text-slate-400">
                Estaciona junto a otro piloto para escuchar su escape y votar su build (+Rep).
              </div>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Contextual Minimal Floating Prompt: Near Car/Building/Contrato Express while walking */}
        {!tuningOpen && !dealershipOpen && hud.mode === 'WALKING' && hud.nearbyZone && (
          <button
            type="button"
            onClick={handleProximityAction}
            className="pointer-events-auto mx-auto flex items-center gap-2 border border-white/15 bg-[#090b10]/92 px-4 py-2 text-xs font-medium text-white shadow-xl hover:border-[#e10600] transition-colors cursor-pointer"
          >
            {hud.nearbyZone === 'CAR' ? (
              <Car className="h-3.5 w-3.5 text-[#e10600]" />
            ) : hud.nearbyZone === 'CONTRACT' ? (
              <Flag className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Wrench className="h-3.5 w-3.5 text-[#e10600]" />
            )}
            <span>
              {hud.nearbyZone === 'CAR' ? (
                <>
                  Pulsa <span className="font-telemetry font-bold text-[#e10600]">[{enterExitKeyLabel}]</span> para subir
                </>
              ) : hud.nearbyZone === 'TUNING' ? (
                <>
                  Pulsa <span className="font-telemetry font-bold text-[#e10600]">[E]</span> para entrar al Taller
                </>
              ) : hud.nearbyZone === 'CONTRACT' ? (
                <>
                  Pulsa <span className="font-telemetry font-bold text-amber-400">[E]</span> para CONTRATO EXPRESS ·{' '}
                  <span className="font-telemetry text-emerald-400">+$18,000</span>
                </>
              ) : nearbyDealershipSpec ? (
                <>
                  <span className="text-slate-300 mr-1">{nearbyDealershipSpec.name} ·</span>
                  Pulsa <span className="font-telemetry font-bold text-[#e10600]">[E]</span> para inspeccionar
                </>
              ) : (
                <>
                  Pulsa <span className="font-telemetry font-bold text-[#e10600]">[E]</span> para abrir el Concesionario
                </>
              )}
            </span>
          </button>
        )}

        {!tuningOpen && !dealershipOpen && hud.mode === 'PARKING_DRIVE' && (
          <div className="pointer-events-auto mx-auto flex items-center gap-3 border border-white/15 bg-[#090b10]/90 px-4 py-2 text-xs text-slate-200 shadow-xl">
            <span className="font-telemetry font-bold text-white">
              {currentDriveSpeed} {speedUnitLabel}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <button
              type="button"
              onClick={onExitCar}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Pulsa <span className="font-telemetry font-bold text-[#e10600]">[{enterExitKeyLabel}]</span> para bajar
            </button>
            <span className="h-3 w-px bg-white/15 hidden sm:inline-block" />
            <button
              type="button"
              onClick={() => onOpenTuning(true)}
              className="hidden sm:inline hover:text-white transition-colors cursor-pointer"
            >
              <span className="font-telemetry font-bold text-[#e10600]">[T]</span> Taller
            </button>
            <span className="hidden md:inline text-slate-400">
              · Conduce al Highway o entra a una bahía iluminada
            </span>
          </div>
        )}

        {/* Touch Controls (shown ONLY on coarse-pointer / touch screens) */}
        {isTouchDevice && !tuningOpen && !dealershipOpen ? (
          <div className="pointer-events-auto grid grid-cols-3 gap-1 border border-white/[0.08] bg-[#090b10]/85 p-1.5">
            <div />
            <button
              type="button"
              onPointerDown={() => onTouchWalk('throttle', true)}
              onPointerUp={() => onTouchWalk('throttle', false)}
              onPointerLeave={() => onTouchWalk('throttle', false)}
              onPointerCancel={() => onTouchWalk('throttle', false)}
              className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white active:bg-[#e10600]"
              aria-label="Adelante"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => onTouchWalk('left', true)}
              onPointerUp={() => onTouchWalk('left', false)}
              onPointerLeave={() => onTouchWalk('left', false)}
              onPointerCancel={() => onTouchWalk('left', false)}
              className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white active:bg-[#e10600]"
              aria-label="Izquierda"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onPointerDown={() => onTouchWalk('brake', true)}
              onPointerUp={() => onTouchWalk('brake', false)}
              onPointerLeave={() => onTouchWalk('brake', false)}
              onPointerCancel={() => onTouchWalk('brake', false)}
              className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white active:bg-[#e10600]"
              aria-label="Atrás"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onPointerDown={() => onTouchWalk('right', true)}
              onPointerUp={() => onTouchWalk('right', false)}
              onPointerLeave={() => onTouchWalk('right', false)}
              onPointerCancel={() => onTouchWalk('right', false)}
              className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white active:bg-[#e10600]"
              aria-label="Derecha"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* ==================== 3D DEALERSHIP SHOWCASE PREVIEW OVERLAY BAR ==================== */}
      {dealershipOpen && previewSpec && previewState && (
        <div className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-2xl border border-white/[0.14] bg-[#090b10]/94 p-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#e10600] font-semibold">
                Vista Previa 3D · Arrastra para rotar 360°
              </div>
              <h3 className="font-display text-2xl font-medium text-white">
                {previewSpec.name}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({previewSpec.referenceModel})
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRevDealershipCar(previewSpec.id)}
                className="flex items-center gap-1.5 border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-200 hover:border-white/35 hover:text-white cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5 text-[#e10600]" />
                Escuchar Motor
              </button>
              <button
                type="button"
                onClick={handleStopPreview}
                className="flex items-center gap-1.5 border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Catálogo
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 font-telemetry text-xs text-slate-200">
              <span>{getCarEffectiveHp(previewSpec, previewState)} HP</span>
              <span>{getCarEffectiveTorque(previewSpec, previewState)} Nm</span>
              <span>{getCarEffectiveWeight(previewSpec, previewState)} kg</span>
              <span>
                {formatSpeed(getCarEffectiveTopSpeed(previewSpec, previewState), speedUnits)}{' '}
                {speedUnitLabel}
              </span>
              <span>0-100: {getCarEffectiveZeroToHundred(previewSpec, previewState).toFixed(1)}s</span>
              <span className="border border-white/15 px-1.5 py-0.5 text-[10px]">
                {previewSpec.drivetrain}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-telemetry text-sm font-bold text-white">
                {profile.ownedCars.includes(previewSpec.id)
                  ? 'En propiedad'
                  : previewSpec.price === 0
                    ? 'GRATIS'
                    : `$${previewSpec.price.toLocaleString()}`}
              </span>
              <button
                type="button"
                onClick={() => onBuyOrSelectCar(previewSpec.id)}
                className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] cursor-pointer ${
                  profile.activeCarId === previewSpec.id
                    ? 'border border-white/20 text-white'
                    : 'bg-[#e10600] text-white hover:bg-[#ff1812]'
                }`}
              >
                {profile.activeCarId === previewSpec.id
                  ? 'Equipado'
                  : profile.ownedCars.includes(previewSpec.id)
                    ? 'Seleccionar'
                    : 'Comprar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2-COLUMN DEALERSHIP CATALOG MODAL ==================== */}
      {dealershipOpen && !previewCarId && (() => {
        const allCatalog = Object.values(CAR_CATALOG);
        const q = dealerSearch.trim().toLowerCase();
        const filteredCars = allCatalog.filter((c) => {
          const matchesSearch =
            !q ||
            c.name.toLowerCase().includes(q) ||
            c.brand.toLowerCase().includes(q) ||
            c.referenceModel.toLowerCase().includes(q);
          if (!matchesSearch) return false;
          if (dealerFilter === 'RWD') return c.drivetrain === 'RWD';
          if (dealerFilter === 'AWD') return c.drivetrain === 'AWD';
          if (dealerFilter === 'OWNED') return profile.ownedCars.includes(c.id);
          return true;
        });

        const selectedSpec =
          CAR_CATALOG[dealerSelectedId] ?? filteredCars[0] ?? CAR_CATALOG.kuruma_2008;
        const selectedState =
          profile.cars[selectedSpec.id] ?? createDefaultCarState(selectedSpec);
        const selOwned = profile.ownedCars.includes(selectedSpec.id);
        const selEquipped = profile.activeCarId === selectedSpec.id;
        const selHp = getCarEffectiveHp(selectedSpec, selectedState);
        const sel0100 = getCarEffectiveZeroToHundred(selectedSpec, selectedState);
        const selTopKmh = getCarEffectiveTopSpeed(selectedSpec, selectedState);
        const selTopDisplay = formatSpeed(selTopKmh, speedUnits);
        const selWeight = getCarEffectiveWeight(selectedSpec, selectedState);

        // Progress bar percentages normalized across catalog range
        const powerPct = Math.min(100, Math.max(12, Math.round((selHp / 1100) * 100)));
        const accelPct = Math.min(
          100,
          Math.max(15, Math.round(((9.5 - Math.min(8.8, sel0100)) / 7.2) * 100))
        );
        const speedPct = Math.min(100, Math.max(18, Math.round((selTopKmh / 410) * 100)));
        const weightPct = Math.min(
          100,
          Math.max(16, Math.round(((2100 - Math.min(2000, selWeight)) / 1050) * 100))
        );

        return (
          <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/82 p-3 sm:p-5">
            <div className="flex w-full max-w-6xl flex-col border border-white/[0.12] bg-[#080b10] shadow-2xl max-h-[90vh]">
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                    Sala VIP · Catálogo Oficial
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                    Concesionario
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                      Créditos
                    </div>
                    <div className="font-telemetry text-base font-bold tabular-nums text-white">
                      ${profile.cash.toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDealership(false)}
                    className="flex h-8 w-8 items-center justify-center border border-white/[0.12] bg-white/[0.04] text-slate-300 hover:border-white/35 hover:text-white cursor-pointer"
                    aria-label="Cerrar Concesionario"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 2-Column Body */}
              <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* LEFT COLUMN: Selected Car Details, 4 Stat Bars, Green VER + COMPRAR */}
                <aside className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#06080d] p-5 overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <span>{selectedSpec.brand}</span>
                      <span className="font-telemetry text-slate-300">
                        {selectedSpec.drivetrain}
                      </span>
                    </div>
                    <h3 className="font-display mt-1 text-2xl font-bold uppercase tracking-wide text-white">
                      {selectedSpec.name}
                    </h3>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {selectedSpec.referenceModel}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-y border-white/[0.07] py-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Precio
                      </span>
                      <span className="font-telemetry text-xl font-bold tabular-nums text-emerald-400">
                        {selOwned
                          ? 'EN PROPIEDAD'
                          : selectedSpec.price === 0
                            ? 'GRATIS'
                            : `$${selectedSpec.price.toLocaleString()}`}
                      </span>
                    </div>

                    {/* 4 Stat Bars: Poder, Aceleración, Velocidad Máxima, Peso */}
                    <div className="mt-4 space-y-3.5">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold uppercase tracking-wider text-slate-300">
                            Poder
                          </span>
                          <span className="font-telemetry font-bold tabular-nums text-white">
                            {selHp} HP
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.07]">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${powerPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold uppercase tracking-wider text-slate-300">
                            Aceleración (0-100)
                          </span>
                          <span className="font-telemetry font-bold tabular-nums text-white">
                            {sel0100.toFixed(1)} s
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.07]">
                          <div
                            className="h-full bg-cyan-400 transition-all duration-300"
                            style={{ width: `${accelPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold uppercase tracking-wider text-slate-300">
                            Velocidad Máxima
                          </span>
                          <span className="font-telemetry font-bold tabular-nums text-white">
                            {selTopDisplay} {speedUnitLabel}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.07]">
                          <div
                            className="h-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${speedPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold uppercase tracking-wider text-slate-300">
                            Peso
                          </span>
                          <span className="font-telemetry font-bold tabular-nums text-white">
                            {selWeight.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.07]">
                          <div
                            className="h-full bg-slate-300 transition-all duration-300"
                            style={{ width: `${weightPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Left Column Action Buttons: Green VER + Sound + COMPRAR/SELECCIONAR */}
                  <div className="mt-5 space-y-2 pt-3 border-t border-white/[0.08]">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartPreview(selectedSpec.id)}
                        className="flex items-center justify-center gap-1.5 bg-emerald-600 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        VER
                      </button>

                      <button
                        type="button"
                        onClick={() => onRevDealershipCar(selectedSpec.id)}
                        className="flex items-center justify-center gap-1.5 border border-white/15 bg-white/[0.04] py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 hover:border-white/35 hover:text-white cursor-pointer"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                        MOTOR
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onBuyOrSelectCar(selectedSpec.id)}
                      className={`w-full py-3 text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                        selEquipped
                          ? 'border border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                          : 'bg-[#e10600] text-white hover:bg-[#ff1812]'
                      }`}
                    >
                      {selEquipped
                        ? 'VEHÍCULO EQUIPADO'
                        : selOwned
                          ? 'SELECCIONAR VEHÍCULO'
                          : selectedSpec.price === 0
                            ? 'RECLAMAR GRATIS'
                            : `COMPRAR · $${selectedSpec.price.toLocaleString()}`}
                    </button>
                  </div>
                </aside>

                {/* RIGHT COLUMN: Search Bar, Interactive Filter Buttons, and Vehicle Card Grid */}
                <section className="lg:col-span-8 flex flex-col overflow-hidden p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-white/[0.08]">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={dealerSearch}
                        onChange={(e) => setDealerSearch(e.target.value)}
                        placeholder="Buscar modelo o marca..."
                        className="w-full border border-white/[0.12] bg-[#0b0f17] py-2 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'ALL', label: 'Todos (9)' },
                          { id: 'RWD', label: 'RWD' },
                          { id: 'AWD', label: 'AWD' },
                          { id: 'OWNED', label: 'En Propiedad' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setDealerFilter(f.id)}
                          className={`border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                            dealerFilter === f.id
                              ? 'border-emerald-400 bg-emerald-500/20 text-white'
                              : 'border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 flex-1 overflow-y-auto pr-1">
                    {filteredCars.length === 0 ? (
                      <div className="flex h-40 items-center justify-center border border-white/[0.08] bg-white/[0.02] text-xs uppercase tracking-widest text-slate-400">
                        Sin vehículos que coincidan con el filtro
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                        {filteredCars.map((spec) => {
                          const owned = profile.ownedCars.includes(spec.id);
                          const equipped = profile.activeCarId === spec.id;
                          const isSelected = selectedSpec.id === spec.id;
                          const state =
                            profile.cars[spec.id] ?? createDefaultCarState(spec);
                          const carHp = getCarEffectiveHp(spec, state);
                          const carTop = formatSpeed(
                            getCarEffectiveTopSpeed(spec, state),
                            speedUnits
                          );

                          return (
                            <button
                              key={spec.id}
                              type="button"
                              onClick={() => setDealerSelectedId(spec.id)}
                              className={`flex flex-col justify-between border p-3 text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-500/[0.12]'
                                  : equipped
                                    ? 'border-[#e10600]/75 bg-[#e10600]/[0.06]'
                                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400 truncate">
                                    {spec.brand}
                                  </span>
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 border border-white/30"
                                    style={{
                                      backgroundColor: state.paint ?? spec.defaultPaint,
                                    }}
                                  />
                                </div>
                                <div className="font-display mt-0.5 text-base font-bold uppercase tracking-wide text-white truncate">
                                  {spec.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {spec.referenceModel}
                                </div>
                              </div>

                              <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.07] pt-2 font-telemetry text-[11px] tabular-nums">
                                <span className="text-slate-300">
                                  {carHp} HP · {carTop} {speedUnitLabel}
                                </span>
                                <span
                                  className={`font-bold ${
                                    equipped
                                      ? 'text-cyan-300'
                                      : owned
                                        ? 'text-emerald-400'
                                        : 'text-white'
                                  }`}
                                >
                                  {equipped
                                    ? 'EQUIPADO'
                                    : owned
                                      ? 'TUYO'
                                      : spec.price === 0
                                        ? 'GRATIS'
                                        : `$${spec.price.toLocaleString()}`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
