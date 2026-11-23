import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomHudEditor, HudEditorMode } from './components/CustomHudEditor';
import { HighwayHUD } from './components/HighwayHUD';
import { ProgressionModal } from './components/ProgressionModal';
import { SettingsModal, SettingsTab } from './components/SettingsModal';
import { ShowroomHUD } from './components/ShowroomHUD';
import { StartMenuOverlay } from './components/StartMenuOverlay';
import { MidnightEngine, ProgressionEvent } from './game/MidnightEngine';
import {
  CAR_CATALOG,
  CarState,
  CDI_MAX_RPM,
  CDI_MIN_RPM,
  CDI_RACING_COST,
  CDI_STEP_RPM,
  cloneDefaultCustomHud,
  cloneDefaultKeybindings,
  createDailyChallengesForDate,
  createDefaultCarState,
  DAILY_REWARDS_SCHEDULE,
  DailyChallengeItem,
  DEFAULT_SETTINGS,
  DiffuserOption,
  FrontBumperOption,
  GameSettings,
  getRankFromXp,
  getTodayDateKey,
  getUpgradeCost,
  getUpgradeStageLabel,
  HudSnapshot,
  INITIAL_PROFILE,
  KeyAction,
  Keybindings,
  MISSIONS_ROTATION,
  PaintFinish,
  RimDesign,
  sanitizeCustomHud,
  SaveProfile,
  SpoilerOption,
  TireProfile,
  TransmissionMode,
  UpgradePartKey,
  WalkingInteractionZone,
  WeatherMode,
  WindowTintOption,
} from './game/types';

const STORAGE_KEY = 'midnight_club_no_hesi_v5';
const SETTINGS_STORAGE_KEY = 'midnight_club_no_hesi_settings_v1';

function clampStage(v: unknown, max = 3): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 0;
  return Math.min(max, Math.max(0, n));
}

function sanitizeSpoiler(v: unknown): SpoilerOption {
  if (v === 'none' || v === 'ducktail' || v === 'street_wing' || v === 'gt_wing' || v === 'stock') {
    return v;
  }
  return 'stock';
}

function sanitizePaintFinish(v: unknown): PaintFinish {
  if (v === 'gloss' || v === 'matte' || v === 'metallic' || v === 'chrome' || v === 'chameleon') {
    return v;
  }
  return 'gloss';
}

function sanitizeRimDesign(v: unknown): RimDesign {
  if (v === 'five_spoke' || v === 'multi_spoke' || v === 'deep_dish' || v === 'turbofan') return v;
  return 'five_spoke';
}

function sanitizeTireProfile(v: unknown): TireProfile {
  if (v === 'street' || v === 'semi_slick' || v === 'racing_wide') return v;
  return 'street';
}

function sanitizeFrontBumper(v: unknown): FrontBumperOption {
  if (v === 'stock' || v === 'carbon_lip' || v === 'gt_splitter') return v;
  return 'stock';
}

function sanitizeDiffuser(v: unknown): DiffuserOption {
  if (v === 'stock' || v === 'finned' || v === 'race_carbon') return v;
  return 'stock';
}

function sanitizeWindowTint(v: unknown): WindowTintOption {
  if (v === 'clear' || v === 'smoke' || v === 'limo') return v;
  return 'smoke';
}

function sanitizePlateText(v: unknown): string {
  if (typeof v !== 'string') return 'GSTDVR';
  const clean = v.toUpperCase().replace(/[^A-Z0-9- ]/g, '').slice(0, 8);
  return clean || 'GSTDVR';
}

function loadSavedProfile(): SaveProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROFILE;
    const parsed = JSON.parse(raw) as Partial<SaveProfile>;
    if (!parsed || !parsed.cars || !parsed.activeCarId) return INITIAL_PROFILE;

    const validOwned = Array.isArray(parsed.ownedCars)
      ? parsed.ownedCars.filter((id) => Boolean(CAR_CATALOG[id]))
      : [];
    if (!validOwned.includes('kuruma_2008')) {
      validOwned.unshift('kuruma_2008');
    }

    const activeCarId = CAR_CATALOG[parsed.activeCarId] ? parsed.activeCarId : 'kuruma_2008';
    const legacyTx: TransmissionMode = parsed.transmission === 'MT' ? 'MT' : 'AT';

    const sanitizedCars: Record<string, CarState> = {};
    for (const spec of Object.values(CAR_CATALOG)) {
      const saved = parsed.cars[spec.id];
      const def = createDefaultCarState(spec);
      const rawRpm =
        typeof saved?.revLimitRpm === 'number' && Number.isFinite(saved.revLimitRpm)
          ? Math.round(saved.revLimitRpm / CDI_STEP_RPM) * CDI_STEP_RPM
          : def.revLimitRpm;
      sanitizedCars[spec.id] = saved
        ? {
            paint: typeof saved.paint === 'string' ? saved.paint : def.paint,
            paintFinish: sanitizePaintFinish(saved.paintFinish),
            rimColor: typeof saved.rimColor === 'string' ? saved.rimColor : def.rimColor,
            rimDesign: sanitizeRimDesign(saved.rimDesign),
            tireProfile: sanitizeTireProfile(saved.tireProfile),
            underglow: typeof saved.underglow === 'string' ? saved.underglow : def.underglow,
            spoiler: sanitizeSpoiler(saved.spoiler),
            frontBumper: sanitizeFrontBumper(saved.frontBumper),
            diffuser: sanitizeDiffuser(saved.diffuser),
            sportSteering: Boolean(saved.sportSteering),
            starlightRoof: Boolean(saved.starlightRoof),
            plateText: sanitizePlateText(saved.plateText),
            windowTint: sanitizeWindowTint(saved.windowTint),
            transmission:
              saved.transmission === 'MT' || saved.transmission === 'AT'
                ? saved.transmission
                : legacyTx,
            cdiRacing: Boolean(saved.cdiRacing),
            revLimitRpm: Math.min(CDI_MAX_RPM, Math.max(CDI_MIN_RPM, rawRpm)),
            upgrades: {
              ecu: clampStage(saved.upgrades?.ecu),
              turbo: clampStage(saved.upgrades?.turbo, 4),
              gearbox: clampStage(saved.upgrades?.gearbox),
              brakes: clampStage(saved.upgrades?.brakes),
              tires: clampStage(saved.upgrades?.tires),
              suspension: clampStage(saved.upgrades?.suspension),
              weight: clampStage(saved.upgrades?.weight),
              exhaust: clampStage(saved.upgrades?.exhaust),
              nitroUp: clampStage(saved.upgrades?.nitroUp),
            },
          }
        : def;
    }

    const rawWeather = parsed.weather as string | undefined;
    const weather: WeatherMode =
      rawWeather === 'DAY' || rawWeather === 'SUNSET' || rawWeather === 'NIGHT'
        ? rawWeather
        : rawWeather === 'CLEAR'
          ? 'DAY'
          : rawWeather === 'STORM'
            ? 'NIGHT'
            : INITIAL_PROFILE.weather;

    const activeCarTx = sanitizedCars[activeCarId]?.transmission ?? legacyTx;
    const today = getTodayDateKey();
    const validChallenges =
      parsed.dailyChallengesDate === today &&
      Array.isArray(parsed.dailyChallenges) &&
      parsed.dailyChallenges.length === 3
        ? (parsed.dailyChallenges as DailyChallengeItem[])
        : createDailyChallengesForDate(today);

    const rawPlayerName =
      typeof parsed.playerName === 'string' && parsed.playerName.trim().length > 0
        ? parsed.playerName.trim().slice(0, 16)
        : INITIAL_PROFILE.playerName;

    const sanitizedRadarRecords: Record<string, number> = {};
    if (parsed.radarRecords && typeof parsed.radarRecords === 'object') {
      Object.entries(parsed.radarRecords).forEach(([k, v]) => {
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
          sanitizedRadarRecords[k] = Math.round(v);
        }
      });
    }

    return {
      ...INITIAL_PROFILE,
      ...parsed,
      weather,
      transmission: activeCarTx,
      cash:
        typeof parsed.cash === 'number' && Number.isFinite(parsed.cash)
          ? parsed.cash
          : INITIAL_PROFILE.cash,
      activeCarId,
      ownedCars: validOwned,
      cars: sanitizedCars,
      playerName: rawPlayerName,
      xp: typeof parsed.xp === 'number' && Number.isFinite(parsed.xp) ? Math.max(0, Math.floor(parsed.xp)) : 0,
      reputation:
        typeof parsed.reputation === 'number' && Number.isFinite(parsed.reputation)
          ? Math.max(0, Math.floor(parsed.reputation))
          : 0,
      dailyStreak:
        typeof parsed.dailyStreak === 'number' && Number.isFinite(parsed.dailyStreak)
          ? Math.max(0, Math.floor(parsed.dailyStreak))
          : 0,
      lastDailyClaimDate:
        typeof parsed.lastDailyClaimDate === 'string' ? parsed.lastDailyClaimDate : '',
      dailyChallengesDate: today,
      dailyChallenges: validChallenges,
      radarRecords: sanitizedRadarRecords,
      bestNoHesiCombo:
        typeof parsed.bestNoHesiCombo === 'number' && Number.isFinite(parsed.bestNoHesiCombo)
          ? Math.max(1, Math.floor(parsed.bestNoHesiCombo))
          : 1,
    };
  } catch {
    return INITIAL_PROFILE;
  }
}

function sanitizeKeybindings(raw: unknown): Keybindings {
  const base = cloneDefaultKeybindings();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Record<string, unknown>;
  (Object.keys(base) as KeyAction[]).forEach((action) => {
    const val = obj[action];
    if (Array.isArray(val)) {
      const clean = val.filter((c): c is string => typeof c === 'string' && c.length > 0);
      if (clean.length > 0) {
        base[action] = clean;
      }
    }
  });
  return base;
}

function loadSavedSettings(
  fallbackWeather: WeatherMode,
  fallbackTx: SaveProfile['transmission']
): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        keybindings: cloneDefaultKeybindings(),
        customHud: cloneDefaultCustomHud(),
        weather: fallbackWeather,
        transmission: fallbackTx,
      };
    }
    const parsed = JSON.parse(raw) as Partial<GameSettings> & {
      graphicsQuality?: string;
      weather?: string;
      viewDistance?: string;
      settingsSchemaVersion?: number;
    };
    const migratedQuality: GameSettings['graphicsQuality'] =
      parsed.graphicsQuality === 'LOW' ||
      parsed.graphicsQuality === 'MEDIUM' ||
      parsed.graphicsQuality === 'HIGH'
        ? parsed.graphicsQuality
        : parsed.graphicsQuality === 'ULTRA'
          ? 'HIGH'
          : DEFAULT_SETTINGS.graphicsQuality;
    const migratedWeather: WeatherMode =
      parsed.weather === 'DAY' || parsed.weather === 'SUNSET' || parsed.weather === 'NIGHT'
        ? parsed.weather
        : parsed.weather === 'CLEAR'
          ? 'DAY'
          : parsed.weather === 'STORM'
            ? 'NIGHT'
            : fallbackWeather;
    const migratedViewDist: GameSettings['viewDistance'] =
      parsed.viewDistance === 'SHORT' ||
      parsed.viewDistance === 'MEDIUM' ||
      parsed.viewDistance === 'FAR'
        ? parsed.viewDistance
        : DEFAULT_SETTINGS.viewDistance;

    const isLegacyExposure = (parsed.settingsSchemaVersion ?? 1) < 2;
    const resolvedExposure =
      !isLegacyExposure &&
      typeof parsed.exposure === 'number' &&
      Number.isFinite(parsed.exposure)
        ? Math.min(1.35, Math.max(0.65, parsed.exposure))
        : DEFAULT_SETTINGS.exposure;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      keybindings: sanitizeKeybindings(parsed.keybindings),
      customHud: sanitizeCustomHud(parsed.customHud),
      graphicsQuality: migratedQuality,
      weather: migratedWeather,
      viewDistance: migratedViewDist,
      exposure: resolvedExposure,
      transmission:
        parsed.transmission === 'AT' || parsed.transmission === 'MT'
          ? parsed.transmission
          : fallbackTx,
      absEnabled:
        typeof parsed.absEnabled === 'boolean'
          ? parsed.absEnabled
          : DEFAULT_SETTINGS.absEnabled,
      speedUnits:
        parsed.speedUnits === 'KMH' || parsed.speedUnits === 'MPH'
          ? parsed.speedUnits
          : DEFAULT_SETTINGS.speedUnits,
    };
  } catch {
    return {
      ...DEFAULT_SETTINGS,
      keybindings: cloneDefaultKeybindings(),
      customHud: cloneDefaultCustomHud(),
      weather: fallbackWeather,
      transmission: fallbackTx,
    };
  }
}

const INITIAL_HUD: HudSnapshot = {
  mode: 'START_MENU',
  perspective: 'IN_CAR',
  speedKmh: 0,
  rpm: 900,
  maxRpm: 7500,
  gear: 1,
  nitro: 100,
  cdiRacing: false,
  revLimiterActive: false,
  combo: 0,
  comboTimerRatio: 0,
  sessionEarnings: 0,
  distanceKm: 0,
  nearMissBanner: null,
  crashBanner: null,
  mission: {
    mission: MISSIONS_ROTATION[0],
    progress: 0,
    completedBanner: null,
  },
  cameraPreset: 'CHASE',
  nearbyZone: null,
  nearbyDealershipCarId: null,
  inTuningBay: false,
  playerX: 10.8,
  playerZ: 2.8,
  pointerLocked: false,
  radarBlips: [],
  pendingCash: 0,
  comboMultiplier: 1,
  pendingBankTimerRatio: 0,
  bulletTimeActive: false,
  extremeRoceBanner: null,
  radarFlashOpacity: 0,
  radarResultBanner: null,
  contractActive: false,
  contractCheckpointIdx: 0,
  contractCheckpointTotal: 10,
  contractTimerSec: 0,
  contractBanner: null,
  inCarMeetZone: false,
  nearbyRemotePlayer: null,
  onlineConnected: false,
  onlineRoomCode: 'PUBLIC',
  onlinePlayersCount: 1,
  onlinePlayers: [],
  isKing: false,
  duelState: null,
  radioStation: 'OFF',
};

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<MidnightEngine | null>(null);

  const [profile, setProfile] = useState<SaveProfile>(() => loadSavedProfile());
  const [settings, setSettings] = useState<GameSettings>(() =>
    loadSavedSettings(profile.weather, profile.transmission)
  );
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('GRAFICOS');
  const [hudEditorOpen, setHudEditorOpen] = useState(false);
  const [hudEditorInitialMode, setHudEditorInitialMode] = useState<HudEditorMode>('HIGHWAY');
  const [progressionOpen, setProgressionOpen] = useState(false);
  const [tuningOpen, setTuningOpen] = useState(false);
  const [dealershipOpen, setDealershipOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2600);
  }, []);

  const updateAndPersistProfile = useCallback((next: SaveProfile) => {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
    engineRef.current?.setProfile(next);
  }, []);

  const updateAndPersistSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next: GameSettings = { ...prev, ...patch };
      try {
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({ ...next, settingsSchemaVersion: 2 })
        );
      } catch {
        // ignore storage quota errors
      }
      engineRef.current?.applySettings(next);

      if (patch.weather !== undefined || patch.transmission !== undefined) {
        setProfile((currProfile) => {
          const activeId = currProfile.activeCarId;
          const activeCar = currProfile.cars[activeId];
          const syncedCars =
            patch.transmission !== undefined && activeCar
              ? {
                  ...currProfile.cars,
                  [activeId]: {
                    ...activeCar,
                    transmission: next.transmission,
                  },
                }
              : currProfile.cars;
          const synced: SaveProfile = {
            ...currProfile,
            weather: next.weather,
            transmission: next.transmission,
            cars: syncedCars,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
          } catch {
            // ignore
          }
          engineRef.current?.setProfile(synced);
          return synced;
        });
      }
      return next;
    });
  }, []);

  const handleOpenTuning = useCallback((open: boolean) => {
    setTuningOpen(open);
    if (open) {
      setDealershipOpen(false);
      engineRef.current?.exitPointerLock();
    }
    engineRef.current?.setStudioFocusZone(open ? 'TUNING' : 'GARAGE');
  }, []);

  const handleOpenDealership = useCallback((open: boolean) => {
    setDealershipOpen(open);
    if (open) {
      setTuningOpen(false);
      engineRef.current?.exitPointerLock();
    }
    engineRef.current?.setStudioFocusZone(open ? 'DEALERSHIP' : 'GARAGE');
  }, []);

  const handleOpenSettings = useCallback((tab: SettingsTab = 'GRAFICOS') => {
    engineRef.current?.exitPointerLock();
    setSettingsInitialTab(tab);
    setSettingsOpen(true);
  }, []);

  const walkingInteractRef = useRef<(zone: WalkingInteractionZone) => void>(() => {});
  walkingInteractRef.current = (zone: WalkingInteractionZone) => {
    if (zone === 'CAR') {
      setTuningOpen(false);
      setDealershipOpen(false);
      engineRef.current?.enterCarInParking();
    } else if (zone === 'TUNING') {
      handleOpenTuning(true);
    } else if (zone === 'DEALERSHIP') {
      handleOpenDealership(true);
    } else if (zone === 'CONTRACT') {
      setTuningOpen(false);
      setDealershipOpen(false);
      engineRef.current?.startContratoExpress();
    }
  };

  const enterTuningBayRef = useRef<() => void>(() => {});
  enterTuningBayRef.current = () => {
    setDealershipOpen(false);
    setTuningOpen(true);
    engineRef.current?.exitPointerLock();
    engineRef.current?.setStudioFocusZone('TUNING');
  };

  const handleProgressionEvent = useCallback(
    (ev: ProgressionEvent) => {
      if (ev.message) {
        showToast(ev.message);
      }
      setProfile((curr) => {
        const today = getTodayDateKey();
        const prevChallenges =
          curr.dailyChallengesDate === today
            ? curr.dailyChallenges
            : createDailyChallengesForDate(today);

        const nextXp = Math.max(0, curr.xp + (ev.xpDelta ?? 0));
        const prevRank = getRankFromXp(curr.xp);
        const nextRank = getRankFromXp(nextXp);
        if (nextRank > prevRank) {
          const unlockHint =
            nextRank >= 15 && prevRank < 15
              ? ' · ¡Desbloqueado: Neón Pulso!'
              : nextRank >= 10 && prevRank < 10
                ? ' · ¡Desbloqueado: Turbo Titanio Stage 4!'
                : nextRank >= 5 && prevRank < 5
                  ? ' · ¡Desbloqueado: Pintura Camaleón!'
                  : '';
          window.setTimeout(() => {
            showToast(`¡Subiste a Rango ${nextRank}!${unlockHint}`);
          }, 0);
        }

        const nextRadarRecords = { ...curr.radarRecords };
        if (ev.type === 'RADAR_HIT' && ev.radarId && ev.speedKmh) {
          const prevRec = nextRadarRecords[ev.radarId] ?? 0;
          if (ev.speedKmh > prevRec) {
            nextRadarRecords[ev.radarId] = ev.speedKmh;
          }
        }

        const nextBestCombo =
          typeof ev.combo === 'number' && ev.combo > curr.bestNoHesiCombo
            ? ev.combo
            : curr.bestNoHesiCombo;

        const nextChallenges = prevChallenges.map((ch) => {
          if (ch.claimed) return ch;
          let inc = 0;
          if (
            ch.type === 'NEAR_MISSES' &&
            (ev.type === 'NEAR_MISS' || ev.type === 'EXTREME_ROCE')
          ) {
            inc = 1;
          } else if (ch.type === 'HIGHWAY_KM' && ev.type === 'HIGHWAY_KM') {
            inc = ev.kmDelta ?? 0;
          } else if (ch.type === 'WRONG_WAY_KM' && ev.type === 'WRONG_WAY_KM') {
            inc = ev.kmDelta ?? 0;
          } else if (ch.type === 'RADAR_HITS' && ev.type === 'RADAR_HIT') {
            inc = 1;
          } else if (ch.type === 'CAR_MEET_LIKES' && ev.type === 'LIKE_SENT') {
            inc = 1;
          }
          if (inc <= 0) return ch;
          return {
            ...ch,
            progress: Math.min(ch.target, ch.progress + inc),
          };
        });

        const next: SaveProfile = {
          ...curr,
          xp: nextXp,
          reputation: Math.max(0, curr.reputation + (ev.repDelta ?? 0)),
          radarRecords: nextRadarRecords,
          bestNoHesiCombo: nextBestCombo,
          dailyChallengesDate: today,
          dailyChallenges: nextChallenges,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [showToast]
  );

  const progressionHandlerRef = useRef<(ev: ProgressionEvent) => void>(() => {});
  progressionHandlerRef.current = handleProgressionEvent;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const engine = new MidnightEngine({
      container,
      profile,
      settings,
      onHudUpdate: (snap) => setHud(snap),
      onProfileChange: (nextProfile) => {
        setProfile((curr) => {
          const merged: SaveProfile = {
            ...curr,
            cash: nextProfile.cash,
            transmission: nextProfile.transmission,
            weather: nextProfile.weather,
            activeCarId: nextProfile.activeCarId,
            ownedCars: nextProfile.ownedCars,
            cars: nextProfile.cars,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
        setSettings((curr) => {
          if (curr.transmission === nextProfile.transmission && curr.weather === nextProfile.weather) {
            return curr;
          }
          const synced = {
            ...curr,
            transmission: nextProfile.transmission,
            weather: nextProfile.weather,
          };
          try {
            localStorage.setItem(
              SETTINGS_STORAGE_KEY,
              JSON.stringify({ ...synced, settingsSchemaVersion: 2 })
            );
          } catch {
            // ignore
          }
          return synced;
        });
      },
      onContextLost: (lost) => setContextLost(lost),
      onWalkingInteract: (zone) => walkingInteractRef.current(zone),
      onEnterTuningBay: () => enterTuningBayRef.current(),
      onProgressionEvent: (ev) => progressionHandlerRef.current(ev),
    });

    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount WebGL canvas once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setKeyCapturePaused(settingsOpen || progressionOpen || hudEditorOpen);
  }, [settingsOpen, progressionOpen, hudEditorOpen]);

  const handleToggleMute = () => {
    updateAndPersistSettings({ muted: !settings.muted });
  };

  const handleBuyOrSelectCar = (carId: string) => {
    const spec = CAR_CATALOG[carId];
    if (!spec) return;
    const targetCarTx = profile.cars[carId]?.transmission ?? 'AT';

    if (profile.ownedCars.includes(carId)) {
      updateAndPersistProfile({
        ...profile,
        activeCarId: carId,
        transmission: targetCarTx,
      });
      setSettings((curr) => ({ ...curr, transmission: targetCarTx }));
      showToast(`${spec.name} equipado.`);
      return;
    }
    if (profile.cash >= spec.price) {
      updateAndPersistProfile({
        ...profile,
        cash: profile.cash - spec.price,
        ownedCars: [...profile.ownedCars, carId],
        activeCarId: carId,
        transmission: targetCarTx,
      });
      setSettings((curr) => ({ ...curr, transmission: targetCarTx }));
      showToast(`Comprado: ${spec.name}`);
    } else {
      showToast(
        `Fondos insuficientes (faltan $${(spec.price - profile.cash).toLocaleString()}).`
      );
    }
  };

  const handleSpawnCarInFront = (carId: string) => {
    const spec = CAR_CATALOG[carId];
    if (!spec || !profile.ownedCars.includes(carId)) return;
    const carTx = profile.cars[carId]?.transmission ?? 'AT';

    if (profile.activeCarId !== carId || profile.transmission !== carTx) {
      updateAndPersistProfile({
        ...profile,
        activeCarId: carId,
        transmission: carTx,
      });
      setSettings((curr) => ({ ...curr, transmission: carTx }));
    }
    engineRef.current?.spawnCarInFrontOfPlayer();
    showToast(`Generado frente a ti: ${spec.name}`);
  };

  const handleSetCarTransmission = (carId: string, tx: TransmissionMode) => {
    const spec = CAR_CATALOG[carId];
    if (!spec) return;
    const carState = profile.cars[carId] ?? createDefaultCarState(spec);
    const isCurrent = profile.activeCarId === carId;

    const next: SaveProfile = {
      ...profile,
      transmission: isCurrent ? tx : profile.transmission,
      cars: {
        ...profile.cars,
        [carId]: {
          ...carState,
          transmission: tx,
        },
      },
    };
    updateAndPersistProfile(next);
    if (isCurrent) {
      updateAndPersistSettings({ transmission: tx });
    }
    showToast(`${spec.name}: Caja ${tx}`);
  };

  const handleUpgradeCar = (part: UpgradePartKey) => {
    const carId = profile.activeCarId;
    const spec = CAR_CATALOG[carId] ?? CAR_CATALOG.kuruma_2008;
    const carState = profile.cars[carId] ?? createDefaultCarState(spec);
    const lvl = carState.upgrades[part] ?? 0;
    const pilotRank = getRankFromXp(profile.xp);
    if (part === 'turbo' && lvl === 3 && pilotRank < 10) {
      showToast('Turbo de Titanio (Stage 4) requiere Rango de Piloto Nv.10.');
      return;
    }
    const maxAllowed = part === 'turbo' && pilotRank >= 10 ? 4 : 3;
    if (lvl >= maxAllowed) return;
    const cost = getUpgradeCost(spec, part, lvl);
    if (profile.cash < cost) {
      showToast(`Necesitas $${cost.toLocaleString()} para instalar ${getUpgradeStageLabel(lvl + 1)}.`);
      return;
    }
    const next: SaveProfile = {
      ...profile,
      cash: profile.cash - cost,
      cars: {
        ...profile.cars,
        [carId]: {
          ...carState,
          upgrades: {
            ...carState.upgrades,
            [part]: lvl + 1,
          },
        },
      },
    };
    updateAndPersistProfile(next);
    engineRef.current?.rebuildShowroomCar();
    showToast(`Instalado: ${getUpgradeStageLabel(lvl + 1)} en ${spec.name}.`);
  };

  const handleBuyCdiRacing = () => {
    const carId = profile.activeCarId;
    const spec = CAR_CATALOG[carId] ?? CAR_CATALOG.kuruma_2008;
    const carState = profile.cars[carId] ?? createDefaultCarState(spec);
    if (carState.cdiRacing) return;

    if (profile.cash < CDI_RACING_COST) {
      showToast(`Necesitas $${CDI_RACING_COST.toLocaleString()} para instalar el CDI Racing.`);
      return;
    }

    const defaultBoostRpm = Math.min(
      CDI_MAX_RPM,
      Math.max(8250, Math.round((spec.stockRedlineRpm + 750) / CDI_STEP_RPM) * CDI_STEP_RPM)
    );

    const next: SaveProfile = {
      ...profile,
      cash: profile.cash - CDI_RACING_COST,
      cars: {
        ...profile.cars,
        [carId]: {
          ...carState,
          cdiRacing: true,
          revLimitRpm: defaultBoostRpm,
        },
      },
    };
    updateAndPersistProfile(next);
    showToast(`CDI Racing Programable instalado en ${spec.name}.`);
  };

  const handleSetRevLimitRpm = (rpm: number) => {
    const carId = profile.activeCarId;
    const spec = CAR_CATALOG[carId] ?? CAR_CATALOG.kuruma_2008;
    const carState = profile.cars[carId] ?? createDefaultCarState(spec);
    if (!carState.cdiRacing) return;

    const snapped = Math.min(
      CDI_MAX_RPM,
      Math.max(CDI_MIN_RPM, Math.round(rpm / CDI_STEP_RPM) * CDI_STEP_RPM)
    );
    updateAndPersistProfile({
      ...profile,
      cars: {
        ...profile.cars,
        [carId]: {
          ...carState,
          revLimitRpm: snapped,
        },
      },
    });
  };

  const handleUpdateAppearance = (
    patch: Partial<
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
    >
  ) => {
    const pilotRank = getRankFromXp(profile.xp);
    if (patch.paintFinish === 'chameleon' && pilotRank < 5) {
      showToast('Pintura Camaleón se desbloquea en Rango Nv.5.');
      return;
    }
    if (patch.underglow === 'pulse_neon' && pilotRank < 15) {
      showToast('Neón Pulso se desbloquea en Rango Nv.15.');
      return;
    }
    const carId = profile.activeCarId;
    const spec = CAR_CATALOG[carId] ?? CAR_CATALOG.kuruma_2008;
    const carState = profile.cars[carId] ?? createDefaultCarState(spec);
    updateAndPersistProfile({
      ...profile,
      cars: {
        ...profile.cars,
        [carId]: {
          ...carState,
          ...patch,
        },
      },
    });
  };

  const handleSaveTallerConfig = () => {
    updateAndPersistProfile({ ...profile });
    showToast('Configuraciones guardadas correctamente.');
  };

  const handleResetCarConfig = () => {
    const carId = profile.activeCarId;
    const spec = CAR_CATALOG[carId] ?? CAR_CATALOG.kuruma_2008;
    const resetCar = createDefaultCarState(spec);
    updateAndPersistProfile({
      ...profile,
      transmission: resetCar.transmission,
      cars: {
        ...profile.cars,
        [carId]: resetCar,
      },
    });
    updateAndPersistSettings({ transmission: resetCar.transmission });
    engineRef.current?.rebuildShowroomCar();
    showToast(`${spec.name} restablecido a predeterminado.`);
  };

  const handleClaimDailyReward = () => {
    const today = getTodayDateKey();
    if (profile.lastDailyClaimDate === today) return;
    const nextStreak = profile.dailyStreak + 1;
    const reward = DAILY_REWARDS_SCHEDULE[(nextStreak - 1) % DAILY_REWARDS_SCHEDULE.length];
    const nextXp = profile.xp + reward.xp;
    const next: SaveProfile = {
      ...profile,
      cash: profile.cash + reward.cash,
      xp: nextXp,
      dailyStreak: nextStreak,
      lastDailyClaimDate: today,
    };
    updateAndPersistProfile(next);
    engineRef.current?.audio.playCashBank();
    showToast(`Recompensa Día ${reward.day}: +$${reward.cash.toLocaleString()} · +${reward.xp} XP`);
  };

  const handleClaimChallenge = (challengeId: string) => {
    const targetCh = profile.dailyChallenges.find((c) => c.id === challengeId);
    if (!targetCh || targetCh.claimed || targetCh.progress < targetCh.target) return;
    const nextChallenges = profile.dailyChallenges.map((c) =>
      c.id === challengeId ? { ...c, claimed: true } : c
    );
    const next: SaveProfile = {
      ...profile,
      cash: profile.cash + targetCh.rewardCash,
      xp: profile.xp + targetCh.rewardXp,
      dailyChallenges: nextChallenges,
    };
    updateAndPersistProfile(next);
    engineRef.current?.audio.playMissionComplete();
    showToast(`Desafío cobrado: +$${targetCh.rewardCash.toLocaleString()} · +${targetCh.rewardXp} XP`);
  };

  const handleChangePlayerName = (rawName: string) => {
    const clean = rawName.trim().slice(0, 16) || 'GHOST_078';
    const next: SaveProfile = {
      ...profile,
      playerName: clean,
    };
    updateAndPersistProfile(next);
    engineRef.current?.joinOnlineRoom({ name: clean });
    showToast(`Nombre de piloto: ${clean}`);
  };

  const handleResetProgress = () => {
    const today = getTodayDateKey();
    const fresh: SaveProfile = {
      ...INITIAL_PROFILE,
      weather: settings.weather,
      transmission: settings.transmission,
      dailyChallengesDate: today,
      dailyChallenges: createDailyChallengesForDate(today),
    };
    setTuningOpen(false);
    setDealershipOpen(false);
    setProgressionOpen(false);
    updateAndPersistProfile(fresh);
    engineRef.current?.rebuildShowroomCar();
    showToast('Progreso reiniciado al estado inicial.');
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#050811]">
      {/* Isolated WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {/* Graceful WebGL Context Loss Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#07090d]/95 p-6 text-center">
          <h2 className="font-display text-2xl font-bold text-white">
            Contexto WebGL pausado
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            El navegador suspendió temporalmente los gráficos 3D. Recarga la página si no se restaura automáticamente.
          </p>
        </div>
      )}

      {/* Active Mode UI */}
      {!hudEditorOpen && hud.mode === 'START_MENU' && (
        <StartMenuOverlay
          profile={profile}
          onStart={() => {
            engineRef.current?.setMode('WALKING');
          }}
          onOpenConfig={() => handleOpenSettings('GRAFICOS')}
          onOpenControls={() => handleOpenSettings('CONTROLES')}
          onSelectCar={handleBuyOrSelectCar}
        />
      )}

      {!hudEditorOpen && (hud.mode === 'WALKING' || hud.mode === 'PARKING_DRIVE') && (
        <ShowroomHUD
          profile={profile}
          hud={hud}
          muted={settings.muted}
          speedUnits={settings.speedUnits}
          keybindings={settings.keybindings}
          customHud={settings.customHud}
          tuningOpen={tuningOpen}
          dealershipOpen={dealershipOpen}
          toastMessage={toastMessage}
          onToggleMute={handleToggleMute}
          onOpenTuning={handleOpenTuning}
          onOpenDealership={handleOpenDealership}
          onEnterCar={() => {
            setTuningOpen(false);
            setDealershipOpen(false);
            engineRef.current?.enterCarInParking();
          }}
          onExitCar={() => engineRef.current?.exitCarInParking()}
          onTogglePointerLock={() => engineRef.current?.togglePointerLock()}
          onOpenSettings={() => handleOpenSettings('GRAFICOS')}
          onBuyOrSelectCar={handleBuyOrSelectCar}
          onSpawnCarInFront={handleSpawnCarInFront}
          onUpgradeCar={handleUpgradeCar}
          onBuyCdiRacing={handleBuyCdiRacing}
          onSetRevLimitRpm={handleSetRevLimitRpm}
          onUpdateAppearance={handleUpdateAppearance}
          onSaveTallerConfig={handleSaveTallerConfig}
          onResetCarConfig={handleResetCarConfig}
          onSetCarTransmission={handleSetCarTransmission}
          onStudioAngle={(preset) => engineRef.current?.setStudioAngle(preset)}
          onPreviewDealershipCar={(carId) => engineRef.current?.previewDealershipCar(carId)}
          onRevDealershipCar={(carId) => engineRef.current?.revDealershipCar(carId)}
          onTouchWalk={(k, active) => engineRef.current?.setTouchControl(k, active)}
          onOpenProgression={() => {
            engineRef.current?.exitPointerLock();
            setProgressionOpen(true);
          }}
          onOpenOnlineSettings={() => handleOpenSettings('ONLINE')}
          onStartContract={() => engineRef.current?.startContratoExpress()}
          onLikeNearbyPlayer={() => engineRef.current?.likeNearbyRemotePlayer()}
          onCycleRadio={() => engineRef.current?.cycleRadioStation()}
        />
      )}

      {!hudEditorOpen && hud.mode === 'HIGHWAY' && (
        <HighwayHUD
          profile={profile}
          settings={settings}
          hud={hud}
          onExitHighway={() => engineRef.current?.exitToShowroom()}
          onOpenSettings={() => handleOpenSettings('GRAFICOS')}
          onOpenProgression={() => {
            engineRef.current?.exitPointerLock();
            setProgressionOpen(true);
          }}
          onTogglePointerLock={() => engineRef.current?.togglePointerLock()}
          onToggleTransmission={() => engineRef.current?.toggleTransmission()}
          onToggleTcs={() => updateAndPersistSettings({ tcsEnabled: !settings.tcsEnabled })}
          onToggleAbs={() => updateAndPersistSettings({ absEnabled: !settings.absEnabled })}
          onShiftGear={(d) => engineRef.current?.shiftGear(d)}
          onCycleRadio={() => engineRef.current?.cycleRadioStation()}
          onFlashHeadlights={() => engineRef.current?.triggerHeadlightFlash()}
          onTouchControl={(k, active) => engineRef.current?.setTouchControl(k, active)}
        />
      )}

      {/* Progression, Daily Rewards & Challenges Modal */}
      <ProgressionModal
        open={progressionOpen}
        profile={profile}
        onClose={() => setProgressionOpen(false)}
        onClaimDailyReward={handleClaimDailyReward}
        onClaimChallenge={handleClaimChallenge}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        initialTab={settingsInitialTab}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={updateAndPersistSettings}
        onResetProgress={handleResetProgress}
        onOpenHudEditor={(editorMode) => {
          engineRef.current?.exitPointerLock();
          setSettingsOpen(false);
          setHudEditorInitialMode(editorMode);
          setHudEditorOpen(true);
        }}
        onReturnToMenu={
          hud.mode !== 'START_MENU'
            ? () => {
                setTuningOpen(false);
                setDealershipOpen(false);
                setProgressionOpen(false);
                engineRef.current?.setMode('START_MENU');
              }
            : undefined
        }
        playerName={profile.playerName}
        onChangePlayerName={handleChangePlayerName}
        onlineConnected={hud.onlineConnected}
        onlineRoomCode={hud.onlineRoomCode}
        onlinePlayers={hud.onlinePlayers}
        onJoinOnlineRoom={(opts) => engineRef.current?.joinOnlineRoom(opts)}
        radioStation={hud.radioStation}
        onSetRadioStation={(station) => engineRef.current?.setRadioStation(station)}
      />

      {/* Interactive On-Screen Custom HUD Visual Editor */}
      <CustomHudEditor
        open={hudEditorOpen}
        initialMode={hudEditorInitialMode}
        customHud={settings.customHud}
        speedUnits={settings.speedUnits}
        activeTx={profile.cars[profile.activeCarId]?.transmission ?? profile.transmission}
        onSave={(nextCustomHud) => {
          updateAndPersistSettings({ customHud: nextCustomHud });
          setHudEditorOpen(false);
          showToast('Custom HUD guardado correctamente.');
        }}
        onCancel={() => setHudEditorOpen(false)}
      />
    </main>
  );
}
