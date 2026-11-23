export type GameMode = 'START_MENU' | 'WALKING' | 'PARKING_DRIVE' | 'HIGHWAY';
export type ControlPerspective = 'IN_CAR';
export type WeatherMode = 'DAY' | 'SUNSET' | 'NIGHT';
export type TransmissionMode = 'AT' | 'MT';
export type CameraPreset = 'CHASE' | 'HOOD' | 'BUMPER';
export type StudioAnglePreset = 'front34' | 'side' | 'rear34' | 'top';
export type StudioFocusZone = 'GARAGE' | 'TUNING' | 'DEALERSHIP';
export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';
export type ViewDistance = 'SHORT' | 'MEDIUM' | 'FAR';
export type SpeedUnits = 'KMH' | 'MPH';
export type RadioStation = 'OFF' | 'PHONK' | 'SYNTHWAVE';

export type SpoilerOption = 'stock' | 'none' | 'ducktail' | 'street_wing' | 'gt_wing';
export type PaintFinish = 'gloss' | 'matte' | 'metallic' | 'chrome' | 'chameleon';
export type RimDesign = 'five_spoke' | 'multi_spoke' | 'deep_dish' | 'turbofan';
export type TireProfile = 'street' | 'semi_slick' | 'racing_wide';
export type FrontBumperOption = 'stock' | 'carbon_lip' | 'gt_splitter';
export type DiffuserOption = 'stock' | 'finned' | 'race_carbon';
export type WindowTintOption = 'clear' | 'smoke' | 'limo';

export type KeyAction =
  | 'accelerate'
  | 'brake'
  | 'steerLeft'
  | 'steerRight'
  | 'nitro'
  | 'shiftUp'
  | 'shiftDown'
  | 'toggleTransmission'
  | 'enterExitCar'
  | 'cycleCamera'
  | 'togglePointerLock'
  | 'flashHeadlights'
  | 'toggleRadio';

export type Keybindings = Record<KeyAction, string[]>;

export const DEFAULT_KEYBINDINGS: Keybindings = {
  accelerate: ['ArrowUp', 'KeyW'],
  brake: ['ArrowDown', 'KeyS'],
  steerLeft: ['ArrowLeft', 'KeyA'],
  steerRight: ['ArrowRight', 'KeyD'],
  nitro: ['ShiftLeft', 'ShiftRight'],
  shiftUp: ['KeyE'],
  shiftDown: ['KeyQ'],
  toggleTransmission: ['KeyG'],
  enterExitCar: ['KeyF'],
  cycleCamera: ['KeyV'],
  togglePointerLock: ['Tab'],
  flashHeadlights: ['KeyL'],
  toggleRadio: ['KeyR'],
};

export const KEY_ACTION_META: Array<{
  action: KeyAction;
  label: string;
  desc: string;
}> = [
  { action: 'accelerate', label: 'Acelerar / Avanzar', desc: 'Acelerador del vehículo o caminar adelante' },
  { action: 'brake', label: 'Frenar / Reversa', desc: 'Frena hasta 0 km/h y engrana Reversa (R)' },
  { action: 'steerLeft', label: 'Girar Izquierda', desc: 'Dirección izquierda o desplazamiento lateral' },
  { action: 'steerRight', label: 'Girar Derecha', desc: 'Dirección derecha o desplazamiento lateral' },
  { action: 'nitro', label: 'Nitro (NOS)', desc: 'Inyección de óxido nitroso en Highway' },
  { action: 'shiftUp', label: 'Subir Marcha', desc: 'Cambio ascendente en Manual (MT)' },
  { action: 'shiftDown', label: 'Bajar Marcha', desc: 'Cambio descendente en Manual (MT)' },
  { action: 'toggleTransmission', label: 'Cambiar Caja AT/MT', desc: 'Alterna Automático / Manual Secuencial' },
  { action: 'enterExitCar', label: 'Subir / Bajar del Coche', desc: 'Entra/sale del coche o vuelve al Parking' },
  { action: 'cycleCamera', label: 'Cambiar Cámara', desc: 'Alterna Persecución / Cabina / Parachoques' },
  { action: 'togglePointerLock', label: 'Ocultar Puntero 360°', desc: 'Bloquea/libera el puntero para vista 360°' },
  { action: 'flashHeadlights', label: 'Ráfaga / Retar Duelo', desc: 'Destella largas o reta a un rival en Highway' },
  { action: 'toggleRadio', label: 'Radio Phonk / Synth', desc: 'Cambia entre Radio OFF, Phonk y Synthwave' },
];

export function cloneDefaultKeybindings(): Keybindings {
  return {
    accelerate: [...DEFAULT_KEYBINDINGS.accelerate],
    brake: [...DEFAULT_KEYBINDINGS.brake],
    steerLeft: [...DEFAULT_KEYBINDINGS.steerLeft],
    steerRight: [...DEFAULT_KEYBINDINGS.steerRight],
    nitro: [...DEFAULT_KEYBINDINGS.nitro],
    shiftUp: [...DEFAULT_KEYBINDINGS.shiftUp],
    shiftDown: [...DEFAULT_KEYBINDINGS.shiftDown],
    toggleTransmission: [...DEFAULT_KEYBINDINGS.toggleTransmission],
    enterExitCar: [...DEFAULT_KEYBINDINGS.enterExitCar],
    cycleCamera: [...DEFAULT_KEYBINDINGS.cycleCamera],
    togglePointerLock: [...DEFAULT_KEYBINDINGS.togglePointerLock],
    flashHeadlights: [...DEFAULT_KEYBINDINGS.flashHeadlights],
    toggleRadio: [...DEFAULT_KEYBINDINGS.toggleRadio],
  };
}

export function formatKeyCodeLabel(code: string): string {
  if (!code) return '---';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
  if (code === 'AltLeft' || code === 'AltRight') return 'Alt';
  if (code === 'ArrowUp') return '↑';
  if (code === 'ArrowDown') return '↓';
  if (code === 'ArrowLeft') return '←';
  if (code === 'ArrowRight') return '→';
  if (code === 'Space') return 'Espacio';
  if (code === 'Tab') return 'Tab';
  if (code === 'Enter') return 'Enter';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`;
  return code;
}

export function formatKeybindingDisplay(codes: string[]): string {
  if (!codes || codes.length === 0) return 'Sin asignar';
  const uniqueLabels: string[] = [];
  for (const c of codes) {
    const lbl = formatKeyCodeLabel(c);
    if (!uniqueLabels.includes(lbl)) uniqueLabels.push(lbl);
  }
  return uniqueLabels.join(' / ');
}

export function formatPrimaryKeyLabel(codes: string[]): string {
  if (!codes || codes.length === 0) return '?';
  return formatKeyCodeLabel(codes[0]);
}

export interface HudElementLayout {
  x: number; // viewport % (0..100)
  y: number; // viewport % (0..100)
  scale: number; // 0.6 .. 1.6
  opacity: number; // 0.2 .. 1.0
}

export interface TachometerStyleConfig {
  accentColor: string;
  numberColor: string;
  needleColor: string;
  showNumbers: boolean;
  showGear: boolean;
  faceOpacity: number; // 0.2 .. 1.0
}

export type HighwayHudElementKey =
  | 'steerLeft'
  | 'steerRight'
  | 'gas'
  | 'brake'
  | 'nitro'
  | 'shiftUp'
  | 'shiftDown'
  | 'headlights'
  | 'speedometer';

export type WalkingHudElementKey = 'joystick' | 'interact' | 'enterCar';

export type HudElementKey = HighwayHudElementKey | WalkingHudElementKey;

export interface CustomHudLayout {
  // Conducción (HIGHWAY)
  steerLeft: HudElementLayout;
  steerRight: HudElementLayout;
  gas: HudElementLayout;
  brake: HudElementLayout;
  nitro: HudElementLayout;
  shiftUp: HudElementLayout;
  shiftDown: HudElementLayout;
  headlights: HudElementLayout;
  speedometer: HudElementLayout;
  // A pie (WALKING)
  joystick: HudElementLayout;
  interact: HudElementLayout;
  enterCar: HudElementLayout;
  // Personalización visual avanzada del tacómetro
  tachometerStyle: TachometerStyleConfig;
}

export const HUD_RACING_COLORS: Array<{ id: string; label: string; hex: string }> = [
  { id: 'red', label: 'Rojo Racing', hex: '#e10600' },
  { id: 'cyan', label: 'Cian Neón', hex: '#22d3ee' },
  { id: 'lime', label: 'Verde Lima', hex: '#84cc16' },
  { id: 'amber', label: 'Ámbar', hex: '#f59e0b' },
  { id: 'purple', label: 'Morado', hex: '#a855f7' },
  { id: 'white', label: 'Blanco', hex: '#f8fafc' },
];

export const DEFAULT_TACHOMETER_STYLE: TachometerStyleConfig = {
  accentColor: '#e10600',
  numberColor: '#cbd5e1',
  needleColor: '#e10600',
  showNumbers: true,
  showGear: true,
  faceOpacity: 0.96,
};

export const DEFAULT_CUSTOM_HUD: CustomHudLayout = {
  // Conducción (HIGHWAY)
  steerLeft: { x: 8, y: 84, scale: 1.0, opacity: 0.92 },
  steerRight: { x: 19, y: 84, scale: 1.0, opacity: 0.92 },
  headlights: { x: 8, y: 65, scale: 1.0, opacity: 0.92 },
  brake: { x: 78, y: 84, scale: 1.0, opacity: 0.92 },
  gas: { x: 91, y: 84, scale: 1.0, opacity: 0.95 },
  nitro: { x: 91, y: 65, scale: 1.0, opacity: 0.95 },
  shiftDown: { x: 71, y: 65, scale: 1.0, opacity: 0.92 },
  shiftUp: { x: 81, y: 65, scale: 1.0, opacity: 0.92 },
  speedometer: { x: 50, y: 76, scale: 0.95, opacity: 1.0 },
  // A pie (WALKING)
  joystick: { x: 11, y: 80, scale: 1.0, opacity: 1.0 },
  interact: { x: 74, y: 82, scale: 1.0, opacity: 0.95 },
  enterCar: { x: 89, y: 82, scale: 1.0, opacity: 0.95 },
  // Estilo del tacómetro
  tachometerStyle: { ...DEFAULT_TACHOMETER_STYLE },
};

export function cloneDefaultCustomHud(): CustomHudLayout {
  return {
    steerLeft: { ...DEFAULT_CUSTOM_HUD.steerLeft },
    steerRight: { ...DEFAULT_CUSTOM_HUD.steerRight },
    gas: { ...DEFAULT_CUSTOM_HUD.gas },
    brake: { ...DEFAULT_CUSTOM_HUD.brake },
    nitro: { ...DEFAULT_CUSTOM_HUD.nitro },
    shiftUp: { ...DEFAULT_CUSTOM_HUD.shiftUp },
    shiftDown: { ...DEFAULT_CUSTOM_HUD.shiftDown },
    headlights: { ...DEFAULT_CUSTOM_HUD.headlights },
    speedometer: { ...DEFAULT_CUSTOM_HUD.speedometer },
    joystick: { ...DEFAULT_CUSTOM_HUD.joystick },
    interact: { ...DEFAULT_CUSTOM_HUD.interact },
    enterCar: { ...DEFAULT_CUSTOM_HUD.enterCar },
    tachometerStyle: { ...DEFAULT_CUSTOM_HUD.tachometerStyle },
  };
}

function sanitizeHudElementLayout(
  raw: unknown,
  fallback: HudElementLayout
): HudElementLayout {
  if (!raw || typeof raw !== 'object') return { ...fallback };
  const obj = raw as Partial<HudElementLayout>;
  const clamp = (v: unknown, min: number, max: number, def: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
  return {
    x: clamp(obj.x, 3, 97, fallback.x),
    y: clamp(obj.y, 5, 95, fallback.y),
    scale: clamp(obj.scale, 0.6, 1.6, fallback.scale),
    opacity: clamp(obj.opacity, 0.2, 1.0, fallback.opacity),
  };
}

export function sanitizeCustomHud(raw: unknown): CustomHudLayout {
  const base = cloneDefaultCustomHud();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<CustomHudLayout>;
  const rawStyle = obj.tachometerStyle as Partial<TachometerStyleConfig> | undefined;
  const isHex = (c: unknown): c is string =>
    typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c.trim());

  return {
    steerLeft: sanitizeHudElementLayout(obj.steerLeft, base.steerLeft),
    steerRight: sanitizeHudElementLayout(obj.steerRight, base.steerRight),
    gas: sanitizeHudElementLayout(obj.gas, base.gas),
    brake: sanitizeHudElementLayout(obj.brake, base.brake),
    nitro: sanitizeHudElementLayout(obj.nitro, base.nitro),
    shiftUp: sanitizeHudElementLayout(obj.shiftUp, base.shiftUp),
    shiftDown: sanitizeHudElementLayout(obj.shiftDown, base.shiftDown),
    headlights: sanitizeHudElementLayout(obj.headlights, base.headlights),
    speedometer: sanitizeHudElementLayout(obj.speedometer, base.speedometer),
    joystick: sanitizeHudElementLayout(obj.joystick, base.joystick),
    interact: sanitizeHudElementLayout(obj.interact, base.interact),
    enterCar: sanitizeHudElementLayout(obj.enterCar, base.enterCar),
    tachometerStyle: {
      accentColor: isHex(rawStyle?.accentColor)
        ? rawStyle!.accentColor
        : base.tachometerStyle.accentColor,
      numberColor: isHex(rawStyle?.numberColor)
        ? rawStyle!.numberColor
        : base.tachometerStyle.numberColor,
      needleColor: isHex(rawStyle?.needleColor)
        ? rawStyle!.needleColor
        : base.tachometerStyle.needleColor,
      showNumbers:
        typeof rawStyle?.showNumbers === 'boolean'
          ? rawStyle.showNumbers
          : base.tachometerStyle.showNumbers,
      showGear:
        typeof rawStyle?.showGear === 'boolean'
          ? rawStyle.showGear
          : base.tachometerStyle.showGear,
      faceOpacity:
        typeof rawStyle?.faceOpacity === 'number' && Number.isFinite(rawStyle.faceOpacity)
          ? Math.min(1.0, Math.max(0.2, rawStyle.faceOpacity))
          : base.tachometerStyle.faceOpacity,
    },
  };
}

export interface GameSettings {
  // Gráficos
  graphicsQuality: GraphicsQuality;
  exposure: number; // 0.65 .. 1.35
  fov: number; // 60 .. 100
  weather: WeatherMode;
  viewDistance: ViewDistance;
  // Audio
  masterVolume: number; // 0 .. 1
  engineVolume: number; // 0 .. 1
  sfxVolume: number; // 0 .. 1
  muted: boolean;
  // Controles y Conducción
  transmission: TransmissionMode;
  steeringSensitivity: number; // 0.5 .. 1.8
  cameraSensitivity: number; // 0.5 .. 1.8
  tcsEnabled: boolean;
  absEnabled: boolean;
  keybindings: Keybindings;
  // Juego / Datos
  speedUnits: SpeedUnits;
  showMinimap: boolean;
  showSpeedometer: boolean;
  // Personalización del HUD táctil y tacómetro
  customHud: CustomHudLayout;
}

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'MEDIUM',
  exposure: 0.85,
  fov: 72,
  weather: 'DAY',
  viewDistance: 'MEDIUM',
  masterVolume: 0.85,
  engineVolume: 0.8,
  sfxVolume: 0.85,
  muted: false,
  transmission: 'AT',
  steeringSensitivity: 1.0,
  cameraSensitivity: 1.0,
  tcsEnabled: true,
  absEnabled: true,
  keybindings: cloneDefaultKeybindings(),
  speedUnits: 'KMH',
  showMinimap: true,
  showSpeedometer: true,
  customHud: cloneDefaultCustomHud(),
};

export type VehicleBodyStyle =
  | 'kuruma_sedan'
  | 'porsche_gt3'
  | 'skyline_r34'
  | 'm4_csl'
  | 'supra_mk5'
  | 'muscle_srt'
  | 'amg_black'
  | 'huracan_evo'
  | 'lafuria_v12'
  | 'npc_sedan'
  | 'npc_suv'
  | 'npc_sport';

export interface CarSpec {
  id: string;
  name: string;
  brand: string;
  referenceModel: string;
  drivetrain: 'FWD' | 'RWD' | 'AWD';
  baseHp: number;
  baseTorqueNm: number;
  baseTopSpeedKmh: number;
  stockRedlineRpm: number;
  weightKg: number;
  baseZeroToHundred: number;
  price: number;
  defaultPaint: string;
  defaultRim: string;
  defaultUnderglow: string;
  bodyStyle: VehicleBodyStyle;
}

export interface CarUpgrades {
  ecu: number;        // 0..3 Motor & Bloque
  turbo: number;      // 0..4 Inducción / Turbo (Stage 4 Titanio desbloqueable Nv.10)
  gearbox: number;    // 0..3 Transmisión
  brakes: number;     // 0..3 Frenos
  tires: number;      // 0..3 Neumáticos y Agarre
  suspension: number; // 0..3 Suspensión
  weight: number;     // 0..3 Reducción de Peso
  exhaust: number;    // 0..3 Escape
  nitroUp: number;    // 0..3 Inyección NOS
}

export type UpgradePartKey = keyof CarUpgrades;

export const CDI_RACING_COST = 4500;
export const CDI_MIN_RPM = 6000;
export const CDI_MAX_RPM = 10500;
export const CDI_STEP_RPM = 250;

export interface CarState {
  upgrades: CarUpgrades;
  paint: string;
  paintFinish: PaintFinish;
  rimColor: string;
  rimDesign: RimDesign;
  tireProfile: TireProfile;
  underglow: string; // hex, 'pulse_neon', or 'none'
  spoiler: SpoilerOption;
  frontBumper: FrontBumperOption;
  diffuser: DiffuserOption;
  sportSteering: boolean;
  starlightRoof: boolean;
  plateText: string;
  windowTint: WindowTintOption;
  transmission: TransmissionMode;
  cdiRacing: boolean;
  revLimitRpm: number;
}

export type DailyChallengeType =
  | 'NEAR_MISSES'
  | 'HIGHWAY_KM'
  | 'WRONG_WAY_KM'
  | 'RADAR_HITS'
  | 'CAR_MEET_LIKES';

export interface DailyChallengeItem {
  id: string;
  title: string;
  description: string;
  type: DailyChallengeType;
  progress: number;
  target: number;
  rewardCash: number;
  rewardXp: number;
  claimed: boolean;
}

export interface SaveProfile {
  cash: number;
  activeCarId: string;
  ownedCars: string[];
  transmission: TransmissionMode;
  weather: WeatherMode;
  cars: Record<string, CarState>;
  playerName: string;
  xp: number;
  reputation: number;
  dailyStreak: number;
  lastDailyClaimDate: string;
  dailyChallengesDate: string;
  dailyChallenges: DailyChallengeItem[];
  radarRecords: Record<string, number>;
  bestNoHesiCombo: number;
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  type: 'NEAR_MISS_STREAK' | 'HIGH_SPEED_HOLD' | 'ONCOMING_DIST' | 'NITRO_PEAK';
  target: number;
  reward: number;
  unit: string;
}

export interface ActiveMissionState {
  mission: MissionDef;
  progress: number;
  completedBanner: string | null;
}

export type WalkingInteractionZone = 'CAR' | 'TUNING' | 'DEALERSHIP' | 'CONTRACT' | null;

export interface RadarBlip {
  dx: number;
  dz: number;
  kind: 'traffic' | 'oncoming';
}

export interface RemotePlayerSummary {
  id: string;
  name: string;
  carId: string;
  mode: GameMode;
  x: number;
  z: number;
  speedKmh: number;
  inCarMeet: boolean;
  likes: number;
  score: number;
  isKing: boolean;
}

export interface DuelHudState {
  duelId: string;
  opponentName: string;
  myScore: number;
  opponentScore: number;
  remainingSec: number;
  resultBanner: string | null;
}

export interface HudSnapshot {
  mode: GameMode;
  perspective: ControlPerspective;
  speedKmh: number;
  rpm: number;
  maxRpm: number;
  gear: number;
  nitro: number;
  combo: number;
  comboTimerRatio: number;
  sessionEarnings: number;
  distanceKm: number;
  nearMissBanner: string | null;
  crashBanner: string | null;
  mission: ActiveMissionState;
  cameraPreset: CameraPreset;
  nearbyZone: WalkingInteractionZone;
  nearbyDealershipCarId: string | null;
  inTuningBay: boolean;
  playerX: number;
  playerZ: number;
  radarBlips: RadarBlip[];
  pointerLocked: boolean;
  cdiRacing: boolean;
  revLimiterActive: boolean;
  // Progression, No Hesi, Radars, Contrato Express, Car Meet & Online
  pendingCash: number;
  comboMultiplier: number;
  pendingBankTimerRatio: number;
  bulletTimeActive: boolean;
  extremeRoceBanner: string | null;
  radarFlashOpacity: number;
  radarResultBanner: string | null;
  contractActive: boolean;
  contractCheckpointIdx: number;
  contractCheckpointTotal: number;
  contractTimerSec: number;
  contractBanner: string | null;
  inCarMeetZone: boolean;
  nearbyRemotePlayer: RemotePlayerSummary | null;
  onlineConnected: boolean;
  onlineRoomCode: string;
  onlinePlayersCount: number;
  onlinePlayers: RemotePlayerSummary[];
  isKing: boolean;
  duelState: DuelHudState | null;
  radioStation: RadioStation;
}

export const UNDERGLOW_PALETTE: Array<{
  id: string;
  label: string;
  hex: string;
  unlockRank?: number;
}> = [
  { id: 'none', label: 'Apagado', hex: 'none' },
  { id: '#0ea5e9', label: 'Azul Eléctrico', hex: '#0ea5e9' },
  { id: '#e10600', label: 'Rojo Racing', hex: '#e10600' },
  { id: '#a855f7', label: 'Púrpura Midnight', hex: '#a855f7' },
  { id: '#10b981', label: 'Verde Esmeralda', hex: '#10b981' },
  { id: '#f59e0b', label: 'Ámbar Dorado', hex: '#f59e0b' },
  { id: '#f8fafc', label: 'Blanco Xenón', hex: '#f8fafc' },
  { id: 'pulse_neon', label: 'Neón Pulso (Nv.15)', hex: '#38bdf8', unlockRank: 15 },
];

export const PAINT_PALETTE = [
  { label: 'Obsidian Metallic', hex: '#11141a' },
  { label: 'Rosso Corsa', hex: '#b91c1c' },
  { label: 'Alpine White', hex: '#dce2ea' },
  { label: 'Bayside Blue', hex: '#1d4ed8' },
  { label: 'Nardo Slate', hex: '#64748b' },
  { label: 'Midnight Violet', hex: '#4c1d95' },
  { label: 'Solar Amber', hex: '#d97706' },
];

export const RIM_PALETTE = [
  { label: 'Aluminio Pulido', hex: '#e2e8f0' },
  { label: 'Oro Forjado', hex: '#d4af37' },
  { label: 'Negro Satinado', hex: '#18181b' },
  { label: 'Bronce Racing', hex: '#92400e' },
  { label: 'Gunmetal', hex: '#475569' },
];

export const PAINT_FINISH_OPTIONS: Array<{
  id: PaintFinish;
  label: string;
  unlockRank?: number;
}> = [
  { id: 'gloss', label: 'Brillante' },
  { id: 'matte', label: 'Mate' },
  { id: 'metallic', label: 'Metálico' },
  { id: 'chrome', label: 'Cromado' },
  { id: 'chameleon', label: 'Camaleón (Nv.5)', unlockRank: 5 },
];

export const RIM_DESIGN_OPTIONS: Array<{ id: RimDesign; label: string }> = [
  { id: 'five_spoke', label: '5 Radios' },
  { id: 'multi_spoke', label: 'Multi-Radio' },
  { id: 'deep_dish', label: 'Garganta' },
  { id: 'turbofan', label: 'Turbofan' },
];

export const TIRE_PROFILE_OPTIONS: Array<{ id: TireProfile; label: string }> = [
  { id: 'street', label: 'Calle' },
  { id: 'semi_slick', label: 'Semi-Slick' },
  { id: 'racing_wide', label: 'Racing Ancho' },
];

export const FRONT_BUMPER_OPTIONS: Array<{ id: FrontBumperOption; label: string }> = [
  { id: 'stock', label: 'Stock' },
  { id: 'carbon_lip', label: 'Lip Carbono' },
  { id: 'gt_splitter', label: 'Splitter GT' },
];

export const DIFFUSER_OPTIONS: Array<{ id: DiffuserOption; label: string }> = [
  { id: 'stock', label: 'Stock' },
  { id: 'finned', label: 'Aletas Pro' },
  { id: 'race_carbon', label: 'Carbono Race' },
];

export const WINDOW_TINT_OPTIONS: Array<{ id: WindowTintOption; label: string }> = [
  { id: 'clear', label: 'Claro' },
  { id: 'smoke', label: 'Ahumado' },
  { id: 'limo', label: 'Limusina' },
];

export const CAR_CATALOG: Record<string, CarSpec> = {
  kuruma_2008: {
    id: 'kuruma_2008',
    name: 'Karin Kuruma 2008',
    brand: 'Karin Motors',
    referenceModel: 'Toyota Corolla 2008',
    drivetrain: 'FWD',
    baseHp: 132,
    baseTorqueNm: 172,
    baseTopSpeedKmh: 195,
    stockRedlineRpm: 7000,
    weightKg: 1280,
    baseZeroToHundred: 9.8,
    price: 0,
    defaultPaint: '#64748b',
    defaultRim: '#e2e8f0',
    defaultUnderglow: 'none',
    bodyStyle: 'kuruma_sedan',
  },
  elegy_r34: {
    id: 'elegy_r34',
    name: 'Annis Elegy R34',
    brand: 'Annis Performance',
    referenceModel: 'Nissan Skyline GT-R R34',
    drivetrain: 'AWD',
    baseHp: 280,
    baseTorqueNm: 392,
    baseTopSpeedKmh: 265,
    stockRedlineRpm: 8000,
    weightKg: 1560,
    baseZeroToHundred: 4.9,
    price: 35000,
    defaultPaint: '#1d4ed8',
    defaultRim: '#e2e8f0',
    defaultUnderglow: '#0ea5e9',
    bodyStyle: 'skyline_r34',
  },
  supra_mk5: {
    id: 'supra_mk5',
    name: 'Karin Supra MK5',
    brand: 'Karin Racing',
    referenceModel: 'Toyota GR Supra A90',
    drivetrain: 'RWD',
    baseHp: 382,
    baseTorqueNm: 500,
    baseTopSpeedKmh: 275,
    stockRedlineRpm: 7250,
    weightKg: 1520,
    baseZeroToHundred: 4.1,
    price: 65000,
    defaultPaint: '#b91c1c',
    defaultRim: '#e2e8f0',
    defaultUnderglow: '#e10600',
    bodyStyle: 'supra_mk5',
  },
  m4_csl: {
    id: 'm4_csl',
    name: 'Ubermacht M4 CSL',
    brand: 'Ubermacht Motorsport',
    referenceModel: 'BMW M4 CSL',
    drivetrain: 'RWD',
    baseHp: 550,
    baseTorqueNm: 650,
    baseTopSpeedKmh: 307,
    stockRedlineRpm: 7500,
    weightKg: 1625,
    baseZeroToHundred: 3.7,
    price: 95000,
    defaultPaint: '#64748b',
    defaultRim: '#18181b',
    defaultUnderglow: '#e10600',
    bodyStyle: 'm4_csl',
  },
  comet_gt3: {
    id: 'comet_gt3',
    name: 'Pfister Comet GT3',
    brand: 'Pfister Motorsport',
    referenceModel: 'Porsche 911 GT3 RS 992',
    drivetrain: 'RWD',
    baseHp: 525,
    baseTorqueNm: 470,
    baseTopSpeedKmh: 296,
    stockRedlineRpm: 9000,
    weightKg: 1450,
    baseZeroToHundred: 3.2,
    price: 135000,
    defaultPaint: '#dce2ea',
    defaultRim: '#d4af37',
    defaultUnderglow: 'none',
    bodyStyle: 'porsche_gt3',
  },
  hellfire_srt: {
    id: 'hellfire_srt',
    name: 'Bravado Hellfire SRT',
    brand: 'Bravado V8 Division',
    referenceModel: 'Dodge Challenger SRT Hellcat',
    drivetrain: 'RWD',
    baseHp: 717,
    baseTorqueNm: 881,
    baseTopSpeedKmh: 320,
    stockRedlineRpm: 6750,
    weightKg: 2010,
    baseZeroToHundred: 3.6,
    price: 160000,
    defaultPaint: '#4c1d95',
    defaultRim: '#18181b',
    defaultUnderglow: '#a855f7',
    bodyStyle: 'muscle_srt',
  },
  amg_black: {
    id: 'amg_black',
    name: 'Benefactor AMG-GT Black',
    brand: 'Benefactor Racing',
    referenceModel: 'Mercedes-AMG GT Black Series',
    drivetrain: 'RWD',
    baseHp: 730,
    baseTorqueNm: 800,
    baseTopSpeedKmh: 325,
    stockRedlineRpm: 7250,
    weightKg: 1540,
    baseZeroToHundred: 3.2,
    price: 220000,
    defaultPaint: '#d97706',
    defaultRim: '#18181b',
    defaultUnderglow: '#f59e0b',
    bodyStyle: 'amg_black',
  },
  huracan_evo: {
    id: 'huracan_evo',
    name: 'Pegassi Huracán EVO',
    brand: 'Pegassi Automobili',
    referenceModel: 'Lamborghini Huracán EVO',
    drivetrain: 'AWD',
    baseHp: 640,
    baseTorqueNm: 600,
    baseTopSpeedKmh: 325,
    stockRedlineRpm: 8500,
    weightKg: 1422,
    baseZeroToHundred: 2.9,
    price: 290000,
    defaultPaint: '#11141a',
    defaultRim: '#d4af37',
    defaultUnderglow: '#10b981',
    bodyStyle: 'huracan_evo',
  },
  lafuria_v12: {
    id: 'lafuria_v12',
    name: 'Grotti LaFuria V12',
    brand: 'Grotti Scuderia',
    referenceModel: 'Ferrari LaFerrari',
    drivetrain: 'RWD',
    baseHp: 963,
    baseTorqueNm: 900,
    baseTopSpeedKmh: 350,
    stockRedlineRpm: 9250,
    weightKg: 1345,
    baseZeroToHundred: 2.6,
    price: 480000,
    defaultPaint: '#b91c1c',
    defaultRim: '#d4af37',
    defaultUnderglow: '#f8fafc',
    bodyStyle: 'lafuria_v12',
  },
};

export const MISSIONS_ROTATION: MissionDef[] = [
  {
    id: 'm_near_miss_5',
    title: '5 Roces Cercanos Seguidos',
    description: 'Realiza 5 roces cercanos consecutivos sin chocar',
    type: 'NEAR_MISS_STREAK',
    target: 5,
    reward: 1500,
    unit: 'roces',
  },
  {
    id: 'm_speed_240',
    title: 'Velocidad Extrema 240+',
    description: 'Mantén más de 240 km/h durante 10 segundos',
    type: 'HIGH_SPEED_HOLD',
    target: 10,
    reward: 2000,
    unit: 's',
  },
  {
    id: 'm_oncoming_2km',
    title: 'Rey del Sentido Contrario',
    description: 'Conduce 2.0 km en sentido contrario sin chocar',
    type: 'ONCOMING_DIST',
    target: 2000,
    reward: 3500,
    unit: 'm',
  },
  {
    id: 'm_nitro_295',
    title: 'Impulso N2O Máximo',
    description: 'Alcanza 295 km/h usando Nitro en el Highway',
    type: 'NITRO_PEAK',
    target: 295,
    reward: 2500,
    unit: 'km/h',
  },
];

export const SPOILER_OPTIONS: Array<{ id: SpoilerOption; label: string }> = [
  { id: 'stock', label: 'De Serie' },
  { id: 'none', label: 'Sin Alerón' },
  { id: 'ducktail', label: 'Ducktail' },
  { id: 'street_wing', label: 'Street Wing' },
  { id: 'gt_wing', label: 'GT Carbon' },
];

export function createDefaultCarState(spec: CarSpec): CarState {
  return {
    upgrades: {
      ecu: 0,
      turbo: 0,
      gearbox: 0,
      brakes: 0,
      tires: 0,
      suspension: 0,
      weight: 0,
      exhaust: 0,
      nitroUp: 0,
    },
    paint: spec.defaultPaint,
    paintFinish: 'gloss',
    rimColor: spec.defaultRim,
    rimDesign: 'five_spoke',
    tireProfile: 'street',
    underglow: spec.defaultUnderglow,
    spoiler: 'stock',
    frontBumper: 'stock',
    diffuser: 'stock',
    sportSteering: false,
    starlightRoof: false,
    plateText: 'GSTDVR',
    windowTint: 'smoke',
    transmission: 'AT',
    cdiRacing: false,
    revLimitRpm: spec.stockRedlineRpm,
  };
}

export const DAILY_REWARDS_SCHEDULE: Array<{ day: number; cash: number; xp: number; label: string }> = [
  { day: 1, cash: 1500, xp: 80, label: 'Día 1' },
  { day: 2, cash: 2500, xp: 110, label: 'Día 2' },
  { day: 3, cash: 4000, xp: 140, label: 'Día 3' },
  { day: 4, cash: 6000, xp: 180, label: 'Día 4' },
  { day: 5, cash: 8500, xp: 220, label: 'Día 5' },
  { day: 6, cash: 11000, xp: 280, label: 'Día 6' },
  { day: 7, cash: 18000, xp: 450, label: 'Día 7 VIP' },
];

export function getTodayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getRankFromXp(xp: number): number {
  const safe = Math.max(0, Math.floor(xp));
  return Math.max(1, Math.floor(1 + Math.sqrt(safe / 180)));
}

export function getXpThresholdForRank(rank: number): number {
  if (rank <= 1) return 0;
  return (rank - 1) * (rank - 1) * 180;
}

export function getXpProgressInRank(xp: number): {
  rank: number;
  currentXp: number;
  nextLevelXp: number;
  ratio: number;
} {
  const rank = getRankFromXp(xp);
  const start = getXpThresholdForRank(rank);
  const end = getXpThresholdForRank(rank + 1);
  const span = Math.max(180, end - start);
  const currentXp = Math.max(0, Math.floor(xp) - start);
  return {
    rank,
    currentXp,
    nextLevelXp: span,
    ratio: Math.min(1, Math.max(0, currentXp / span)),
  };
}

export function createDailyChallengesForDate(dateKey: string): DailyChallengeItem[] {
  const pool: Array<Omit<DailyChallengeItem, 'id' | 'progress' | 'claimed'>> = [
    {
      title: 'Cirujano del Tráfico',
      description: 'Completa 12 roces cercanos sin chocar',
      type: 'NEAR_MISSES',
      target: 12,
      rewardCash: 4500,
      rewardXp: 180,
    },
    {
      title: 'Corredor de Wangan',
      description: 'Recorre 8 km en el Highway',
      type: 'HIGHWAY_KM',
      target: 8,
      rewardCash: 5200,
      rewardXp: 210,
    },
    {
      title: 'Cazador de Radares',
      description: 'Supera 3 radares de velocidad en el Highway',
      type: 'RADAR_HITS',
      target: 3,
      rewardCash: 4800,
      rewardXp: 190,
    },
    {
      title: 'Kamikaze Nocturno',
      description: 'Conduce 3 km en sentido contrario',
      type: 'WRONG_WAY_KM',
      target: 3,
      rewardCash: 6500,
      rewardXp: 260,
    },
    {
      title: 'Espíritu Car Meet',
      description: 'Vota un coche rival en la Zona Car Meet',
      type: 'CAR_MEET_LIKES',
      target: 1,
      rewardCash: 3200,
      rewardXp: 150,
    },
  ];
  // Pick 3 deterministic challenges seeded by dateKey
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) seed = (seed * 31 + dateKey.charCodeAt(i)) | 0;
  const picked: DailyChallengeItem[] = [];
  const used = new Set<number>();
  for (let k = 0; k < 3; k++) {
    let idx = Math.abs(seed + k * 7) % pool.length;
    while (used.has(idx)) idx = (idx + 1) % pool.length;
    used.add(idx);
    const tpl = pool[idx];
    picked.push({
      id: `${dateKey}_${tpl.type}`,
      ...tpl,
      progress: 0,
      claimed: false,
    });
  }
  return picked;
}

export const INITIAL_PROFILE: SaveProfile = {
  cash: 12500,
  activeCarId: 'kuruma_2008',
  ownedCars: ['kuruma_2008'],
  transmission: 'AT',
  weather: 'DAY',
  cars: Object.fromEntries(
    Object.values(CAR_CATALOG).map((spec) => [spec.id, createDefaultCarState(spec)])
  ),
  playerName: 'GHOST_078',
  xp: 0,
  reputation: 0,
  dailyStreak: 0,
  lastDailyClaimDate: '',
  dailyChallengesDate: getTodayDateKey(),
  dailyChallenges: createDailyChallengesForDate(getTodayDateKey()),
  radarRecords: {},
  bestNoHesiCombo: 1,
};

const ECU_HP_MULT = [1.0, 1.15, 1.35, 1.6];
const TURBO_HP_BONUS = [0, 0.14, 0.28, 0.44, 0.65];
const EXHAUST_HP_BONUS = [0, 0.04, 0.08, 0.13];
const TURBO_TOP_SPEED_KMH = [0, 12, 24, 35, 52];
const WEIGHT_REDUCTION_KG = [0, 60, 120, 180];

export function getUpgradeStageLabel(lvl: number): string {
  if (lvl <= 0) return 'Stock';
  if (lvl === 1) return 'Stage 1';
  if (lvl === 2) return 'Stage 2';
  if (lvl === 3) return 'Stage 3 Racing';
  return 'Stage 4 Titanio';
}

export function getUpgradeCost(spec: CarSpec, part: UpgradePartKey, currentLevel: number): number {
  const baseByPart: Record<UpgradePartKey, number> = {
    ecu: 1200,
    turbo: 1800,
    gearbox: 1400,
    brakes: 950,
    tires: 1050,
    suspension: 1150,
    weight: 1100,
    exhaust: 900,
    nitroUp: 1500,
  };
  const tierFactor = 0.75 + spec.baseHp / 420;
  const stageMult = [1.0, 1.9, 3.1, 4.6][currentLevel] ?? 4.6;
  return Math.round((baseByPart[part] * tierFactor * stageMult) / 50) * 50;
}

export function getCarEffectiveHp(spec: CarSpec, state: CarState): number {
  const ecu = Math.min(3, Math.max(0, state.upgrades.ecu ?? 0));
  const turbo = Math.min(4, Math.max(0, state.upgrades.turbo ?? 0));
  const exhaust = Math.min(3, Math.max(0, state.upgrades.exhaust ?? 0));
  const cdiFactor = state.cdiRacing
    ? 1 + Math.max(0, state.revLimitRpm - spec.stockRedlineRpm) / 28000
    : 1;
  const mult = (ECU_HP_MULT[ecu] + TURBO_HP_BONUS[turbo] + EXHAUST_HP_BONUS[exhaust]) * cdiFactor;
  return Math.round(spec.baseHp * mult);
}

export function getCarEffectiveTorque(spec: CarSpec, state: CarState): number {
  const ecu = Math.min(3, Math.max(0, state.upgrades.ecu ?? 0));
  const turbo = Math.min(4, Math.max(0, state.upgrades.turbo ?? 0));
  const exhaust = Math.min(3, Math.max(0, state.upgrades.exhaust ?? 0));
  const mult =
    1 +
    (ECU_HP_MULT[ecu] - 1) * 0.9 +
    TURBO_HP_BONUS[turbo] * 1.05 +
    EXHAUST_HP_BONUS[exhaust] * 0.85;
  return Math.round(spec.baseTorqueNm * mult);
}

export function getCarEffectiveWeight(spec: CarSpec, state: CarState): number {
  const w = Math.min(3, Math.max(0, state.upgrades.weight ?? 0));
  return Math.max(850, spec.weightKg - WEIGHT_REDUCTION_KG[w]);
}

export function getCarEffectiveMaxRpm(spec: CarSpec, state: CarState): number {
  if (!state.cdiRacing) {
    return spec.stockRedlineRpm;
  }
  const raw = typeof state.revLimitRpm === 'number' ? state.revLimitRpm : spec.stockRedlineRpm;
  const clamped = Math.min(CDI_MAX_RPM, Math.max(CDI_MIN_RPM, raw));
  return Math.round(clamped / CDI_STEP_RPM) * CDI_STEP_RPM;
}

export function getCarEffectiveTopSpeed(spec: CarSpec, state: CarState): number {
  const ecu = Math.min(3, Math.max(0, state.upgrades.ecu ?? 0));
  const turbo = Math.min(4, Math.max(0, state.upgrades.turbo ?? 0));
  const gearbox = Math.min(3, Math.max(0, state.upgrades.gearbox ?? 0));
  const exhaust = Math.min(3, Math.max(0, state.upgrades.exhaust ?? 0));

  const turboBonus = TURBO_TOP_SPEED_KMH[turbo];
  const lowEndScale = spec.baseTopSpeedKmh < 240 ? 11.5 : spec.baseTopSpeedKmh < 310 ? 9.5 : 7.5;
  const gearboxBonus = Math.round(gearbox * lowEndScale);
  const ecuOverdrive = ecu * 2 + exhaust * 2;
  const cdiRpmBonus = state.cdiRacing
    ? Math.round((getCarEffectiveMaxRpm(spec, state) - spec.stockRedlineRpm) / 220)
    : 0;
  return Math.max(
    140,
    Math.round(spec.baseTopSpeedKmh + turboBonus + gearboxBonus + ecuOverdrive + cdiRpmBonus)
  );
}

export function getCarBrakeScore(spec: CarSpec, state: CarState): number {
  const brakes = Math.min(3, Math.max(0, state.upgrades.brakes ?? 0));
  const tires = Math.min(3, Math.max(0, state.upgrades.tires ?? 0));
  const weightBonus = (state.upgrades.weight ?? 0) * 2.5;
  const baseBrake = Math.min(82, 52 + (spec.baseTopSpeedKmh - 195) * 0.16);
  return Math.min(100, Math.round(baseBrake + brakes * 8 + tires * 3 + weightBonus));
}

/**
 * Returns exact top speed ceilings (km/h) for gears 1..6:
 * 1ª: ~60 km/h | 2ª: ~105 km/h | 3ª: ~155 km/h
 * 4ª: ~212 km/h | 5ª: ~268 km/h | 6ª: car's true top speed (195..410+ km/h)
 */
export function getGearTopSpeedsKmh(spec: CarSpec, state: CarState, nitroActive = false): number[] {
  const nitroLvl = Math.min(3, Math.max(0, state.upgrades.nitroUp ?? 0));
  const nitroDelta = nitroActive ? 32 + nitroLvl * 8 : 0;
  const maxTop = getCarEffectiveTopSpeed(spec, state) + nitroDelta;
  const maxRpm = getCarEffectiveMaxRpm(spec, state);
  const rpmFactor = Math.min(1.06, Math.max(0.92, maxRpm / Math.max(6800, spec.stockRedlineRpm)));
  const tuneRatio = Math.min(1.04, Math.max(0.96, 0.96 + (maxTop - 195) / 2400));
  const scale = rpmFactor * 0.45 + tuneRatio * 0.55;

  const g1 = Math.min(maxTop * 0.42, Math.round(Math.min(64, Math.max(58, 60 * scale))));
  const g2 = Math.min(maxTop * 0.65, Math.round(Math.min(110, Math.max(101, 105 * scale))));
  const g3 = Math.min(maxTop * 0.84, Math.round(Math.min(162, Math.max(149, 155 * scale))));
  const g4 = Math.min(maxTop * 0.93, Math.round(Math.min(222, Math.max(202, 212 * scale))));
  const g5 = Math.min(maxTop * 0.98, Math.round(Math.min(282, Math.max(255, 268 * scale))));
  const g6 = Math.round(maxTop);

  const arr = [0, g1, g2, g3, g4, g5, g6];
  for (let i = 2; i <= 6; i++) {
    if (arr[i] <= arr[i - 1]) {
      arr[i] = Math.min(g6, arr[i - 1] + 8);
    }
  }
  arr[6] = g6;
  return arr;
}

export function getCarEffectiveZeroToHundred(spec: CarSpec, state: CarState): number {
  const hp = getCarEffectiveHp(spec, state);
  const weight = getCarEffectiveWeight(spec, state);
  const gearbox = Math.min(3, Math.max(0, state.upgrades.gearbox ?? 0));
  const tires = Math.min(3, Math.max(0, state.upgrades.tires ?? 0));
  const pwrRatio = (spec.baseHp / spec.weightKg) / (hp / weight);
  const gearFactor = 1 - gearbox * 0.035 - tires * 0.025;
  const val = spec.baseZeroToHundred * Math.pow(pwrRatio, 0.56) * gearFactor;
  return Math.max(1.8, Math.round(val * 10) / 10);
}
